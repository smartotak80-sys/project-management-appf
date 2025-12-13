document.addEventListener('DOMContentLoaded', () => {
  // Preloader
  setTimeout(() => {
      const p = document.getElementById('preloader');
      if(p) { p.style.opacity = '0'; setTimeout(() => p.style.display='none', 500); activateScrollAnimations(); }
  }, 1500);

  const CURRENT_USER_KEY = 'barakuda_current_user';
  let members = [];
  let currentUser = tryLoadUser();

  function tryLoadUser(){ try{ return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)); } catch(e){ return null; } }
  function saveCurrentUser(val){ localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(val)); }
  function removeCurrentUser(){ localStorage.removeItem(CURRENT_USER_KEY); }

  // TOAST
  window.showToast = (msg, type = 'success') => {
      const c = document.getElementById('toastContainer');
      if(!c) return;
      const t = document.createElement('div'); t.className = `toast ${type}`;
      t.innerHTML = `<span>${msg}</span>`; c.appendChild(t);
      setTimeout(() => { t.style.opacity='0'; setTimeout(()=>t.remove(),300); }, 3000);
  };

  // API FETCH
  async function apiFetch(url, opts={}) {
      try {
          const h={'Content-Type':'application/json', ...(opts.headers||{})};
          const r = await fetch(url, {...opts, headers:h});
          const d = await r.json();
          if(!r.ok) { showToast(d.message || 'Error', 'error'); return null; }
          return d;
      } catch(e) { console.error(e); return null; }
  }

  // --- INITIAL LOAD ---
  async function loadInitialData() {
      const m = await apiFetch('/api/members'); if(m) { members=m; renderPublicMembers(); }
      const n = await apiFetch('/api/news'); if(n) renderNews(n);
      const g = await apiFetch('/api/gallery'); if(g) renderGallery(g);
      const v = await apiFetch('/api/videos'); if(v) renderVideos(v);
      const r = await apiFetch('/api/redux'); if(r) renderRedux(r);
      updateAuthUI();
  }

  function activateScrollAnimations() {
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('animate-visible');
                  entry.target.classList.remove('animate-hidden');
                  observer.unobserve(entry.target);
              }
          });
      }, { threshold: 0.1 });
      document.querySelectorAll('.animate-hidden').forEach(el => observer.observe(el));
  }

  // --- DASHBOARD NAVIGATION ---
  const dashModal = document.getElementById('dashboardModal');
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('dashOverlay');
  
  if(document.getElementById('dashMobileToggle')) {
      document.getElementById('dashMobileToggle').onclick = () => { sidebar.classList.add('open'); overlay.classList.add('active'); };
  }
  if(overlay) overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); };

  // GLOBAL FUNCTIONS FOR ONCLICK
  window.switchDashTab = (tab) => {
      if(['users', 'admin-members', 'accounts-data', 'redux-admin'].includes(tab)) {
          if(!currentUser || currentUser.role !== 'admin') { showToast("Доступ заборонено", 'error'); return; }
      }
      document.querySelectorAll('.dash-view').forEach(e => e.classList.remove('active'));
      document.querySelectorAll('.dash-nav button').forEach(e => e.classList.remove('active'));
      
      // Find button and make active
      const buttons = document.querySelectorAll('.dash-nav button');
      buttons.forEach(b => { if(b.getAttribute('onclick')?.includes(tab)) b.classList.add('active'); });

      document.getElementById(`tab-${tab}`)?.classList.add('active');
      
      if(tab === 'apply') checkMyApplication();
      if(tab === 'applications') loadApplicationsStaff();
      if(tab === 'support-user') loadMyTickets();
      if(tab === 'support-staff') loadAllTickets();
      if(tab === 'users') loadUsersAdmin();
      if(tab === 'admin-members') loadAdminMembers();
      if(tab === 'redux-admin') loadReduxAdmin();
      if(tab === 'my-member') loadMyMemberTab();
      if(tab === 'accounts-data') loadAccountsData();
      
      // Close sidebar on mobile
      sidebar.classList.remove('open'); overlay.classList.remove('active');
  };

  window.openDashboard = () => {
      if(!currentUser) return;
      dashModal.classList.add('show');
      document.getElementById('dashUsername').textContent = currentUser.username;
      document.getElementById('dashRole').textContent = currentUser.role;
      document.getElementById('pLogin').textContent = currentUser.username;
      document.getElementById('pRole').textContent = currentUser.role.toUpperCase();
      
      document.querySelector('.staff-only-nav').style.display = ['admin', 'moderator'].includes(currentUser.role) ? 'block' : 'none';
      document.querySelector('.admin-only-nav').style.display = currentUser.role === 'admin' ? 'block' : 'none';
      
      window.switchDashTab('profile');
  }

  // --- ADMIN MEMBER LOGIC (FIXED) ---
  document.getElementById('openAdminAddMember')?.addEventListener('click', ()=> {
      document.getElementById('adminAddMemberContainer').style.display='block';
  });

  document.getElementById('adminAddMemberForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Get values carefully
      const nameEl = document.getElementById('admName');
      const roleEl = document.getElementById('admRole');
      const ownerEl = document.getElementById('admOwner');
      const serverEl = document.getElementById('admServer');
      const discordEl = document.getElementById('admDiscord');
      const youtubeEl = document.getElementById('admYoutube');

      if(!nameEl || !roleEl) return;

      const body = { 
          name: nameEl.value, 
          role: roleEl.value, 
          owner: ownerEl ? ownerEl.value : '', 
          server: serverEl ? serverEl.value : '', 
          links: {
              discord: discordEl ? discordEl.value : '', 
              youtube: youtubeEl ? youtubeEl.value : ''
          } 
      }; 
      await apiFetch('/api/members', {method:'POST', body:JSON.stringify(body)}); 
      showToast("Учасника додано"); 
      loadAdminMembers();
      
      // Clear form
      nameEl.value = ''; roleEl.value = '';
      if(ownerEl) ownerEl.value = '';
  });

  async function loadAdminMembers() { 
      const list = document.getElementById('adminMembersList'); 
      const m = await apiFetch('/api/members'); 
      list.innerHTML = m.map(x => `
        <div class="u-row animate-hidden">
            <div>
                <b>${x.name}</b> <small>(${x.role})</small> 
                <span style="font-size:10px; color:#ff2a2a; border:1px solid #ff2a2a; padding:2px 4px; border-radius:3px;">${x.server || 'No Server'}</span>
            </div>
            <button class="btn btn-outline" onclick="window.deleteMember('${x.id}')">DEL</button>
        </div>`).join(''); 
  }

  window.deleteMember = async (id) => { 
      if(confirm("Видалити учасника?")) { 
          await apiFetch(`/api/members/${id}`, {method:'DELETE'}); 
          showToast('Видалено'); 
          loadAdminMembers(); 
          loadInitialData(); // Update public list
      } 
  };

  // --- REDUX LOGIC ---
  async function loadReduxAdmin() {
       const list = document.getElementById('adminReduxList');
       const r = await apiFetch('/api/redux');
       list.innerHTML = r.map(x => `
           <div class="u-row animate-hidden">
               <div style="display:flex; flex-direction:column;">
                   <b>${x.title}</b>
                   <a href="${x.url}" target="_blank" style="font-size:11px; color:var(--accent-blue);">${x.url.substring(0,30)}...</a>
               </div>
               <button class="btn btn-outline" onclick="window.deleteRedux('${x.id}')">DEL</button>
           </div>
       `).join('');
  }
  
  document.getElementById('addReduxBtn')?.addEventListener('click', async () => {
      const title = document.getElementById('reduxTitle').value;
      const url = document.getElementById('reduxUrl').value;
      if(!title || !url) return showToast("Заповніть всі поля", "error");
      await apiFetch('/api/redux', {method:'POST', body:JSON.stringify({title, url})});
      showToast("Redux додано");
      document.getElementById('reduxTitle').value = '';
      document.getElementById('reduxUrl').value = '';
      loadReduxAdmin();
      loadInitialData();
  });
  
  window.deleteRedux = async (id) => {
      if(confirm("Видалити цей Redux?")) {
          await apiFetch(`/api/redux/${id}`, {method:'DELETE'});
          showToast("Видалено");
          loadReduxAdmin();
          loadInitialData();
      }
  };

  function renderRedux(list) {
      const grid = document.getElementById('reduxGrid');
      if(!grid) return;
      if(list.length === 0) {
          grid.innerHTML = '<div style="color:#666; width:100%; text-align:center;">Redux ще не додано.</div>';
          return;
      }
      grid.innerHTML = list.map(item => `
          <div class="card glass animate-hidden redux-card">
              <div class="card-icon" style="color:#00e5ff"><i class="fa-solid fa-microchip"></i></div>
              <h3>${item.title}</h3>
              <p style="font-size:12px; color:#888;">ОПТИМІЗОВАНО</p>
              <a href="${item.url}" target="_blank" class="btn btn-primary full-width" style="border-color:#00e5ff; color:#00e5ff;">
                 <i class="fa-solid fa-download"></i> СКАЧАТИ
              </a>
          </div>
      `).join('');
      activateScrollAnimations();
  }

  // --- MEMBER & USER LOGIC ---
  function loadMyMemberTab() { 
      const container = document.getElementById('myMemberContainer'); 
      const createBlock = document.getElementById('createMemberBlock');
      const myMember = members.find(m => m.owner === currentUser.username); 
      
      if(myMember) { 
          createBlock.style.display='none'; container.style.display = 'block';
          container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <div>
                    <h3 style="margin:0 0 5px 0; color:#fff;">${myMember.name}</h3>
                    <div style="font-size:14px; color:#888;">РАНГ: <span style="color:#fff">${myMember.role}</span></div>
                    <div style="font-size:12px; color:#888;">SERVER: <span style="color:var(--accent)">${myMember.server || 'Pending...'}</span></div>
                </div>
                <div class="dash-avatar" style="width:60px; height:60px; font-size:24px;"><i class="fa-solid fa-user-shield"></i></div>
            </div>
            <hr style="border-color:rgba(255,255,255,0.05); margin-bottom:20px;">
            <label style="font-size:12px; color:#666; font-weight:700;">ЗМІНИТИ СТАТУС</label>
            <div style="display:flex; gap:10px; margin-top:5px;">
                <select id="memberStatusSelect">
                    <option value="Active">В мережі</option>
                    <option value="AFK">AFK</option>
                    <option value="Busy">Зайнятий</option>
                </select>
                <button id="saveStatusBtn" class="btn btn-primary">ЗБЕРЕГТИ</button>
            </div>
          `; 
          
          document.getElementById('saveStatusBtn').onclick=async()=>{ 
              let baseRole = myMember.role.split('|')[0].trim();
              let newStatus = document.getElementById('memberStatusSelect').value;
              let role = `${baseRole} | ${newStatus}`; 
              await apiFetch(`/api/members/${myMember.id}`, {method:'PUT', body:JSON.stringify({role})}); 
              showToast('Статус оновлено'); loadInitialData(); loadMyMemberTab(); 
          }; 
      } else { 
          createBlock.style.display='block'; container.style.display='none'; 
      } 
  }

  window.loadAccountsData = async () => { 
      const tbody = document.getElementById('accountsDataTableBody'); 
      const users = await apiFetch('/api/users'); 
      tbody.innerHTML = users.map(u => `<tr><td>${u.username}</td><td>${u.email}</td><td>***</td><td>${u.role}</td><td>${new Date(u.regDate).toLocaleDateString()}</td></tr>`).join(''); 
  };
  
  window.changeUserRole = async (u, role) => { await apiFetch(`/api/users/${u}/role`, { method:'PUT', body: JSON.stringify({role}) }); showToast('Role Updated'); };
  window.banUser = async (u) => { if(confirm(`Ban ${u}?`)) { await apiFetch(`/api/users/${u}`, {method:'DELETE'}); showToast('User Banned'); loadUsersAdmin(); } };
  async function loadUsersAdmin() { 
      const list = document.getElementById('adminUsersList'); 
      const users = await apiFetch('/api/users'); 
      list.innerHTML = users.map(u => `<div class="u-row animate-hidden"><div><b>${u.username}</b> <small>(${u.role})</small></div>${u.username === 'admin' ? '' : `<select onchange="window.changeUserRole('${u.username}', this.value)" style="width:auto; padding:5px;"><option value="member" ${u.role==='member'?'selected':''}>Member</option><option value="admin" ${u.role==='admin'?'selected':''}>Admin</option></select> <button class="btn btn-outline" onclick="window.banUser('${u.username}')">X</button>`}</div>`).join(''); 
  }

  // --- AUTH & OTHER ---
  async function updateAuthUI() { 
      const btn = document.getElementById('openAuthBtn');
      const authText = document.getElementById('authBtnText');
      
      if(currentUser) { 
          if(authText) authText.textContent = "АКАУНТ"; 
          btn.onclick = window.openDashboard; 
          
          // Apply button changes
          const applyBtn = document.getElementById('applyBtnMain');
          if(applyBtn) { 
             applyBtn.innerHTML = '<i class="fa-solid fa-file-signature"></i> ДОСТУП ДО ТЕРМІНАЛУ';
             applyBtn.onclick = () => { window.openDashboard(); window.switchDashTab('apply'); };
          }
      } else { 
          if(authText) authText.textContent = "ВХІД"; 
          btn.onclick = ()=>document.getElementById('authModal').classList.add('show'); 
      } 
  }

  document.getElementById('closeAuth')?.addEventListener('click', ()=>document.getElementById('authModal').classList.remove('show')); 
  document.getElementById('closeDashBtn')?.addEventListener('click', ()=>dashModal.classList.remove('show')); 
  document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ removeCurrentUser(); location.reload(); }); 
  
  document.getElementById('tabLogin')?.addEventListener('click', (e)=>{ e.target.classList.add('active'); document.getElementById('tabRegister').classList.remove('active'); document.getElementById('loginForm').style.display='block'; document.getElementById('registerForm').style.display='none'; }); 
  document.getElementById('tabRegister')?.addEventListener('click', (e)=>{ e.target.classList.add('active'); document.getElementById('tabLogin').classList.remove('active'); document.getElementById('loginForm').style.display='none'; document.getElementById('registerForm').style.display='block'; }); 
  
  document.getElementById('loginForm')?.addEventListener('submit', async (e)=>{ e.preventDefault(); const res = await apiFetch('/api/auth/login', { method:'POST', body: JSON.stringify({ username: document.getElementById('loginUser').value, password: document.getElementById('loginPass').value }) }); if(res && res.success) { saveCurrentUser(res.user); showToast(`Welcome, ${res.user.username}`); setTimeout(()=>location.reload(), 500); } }); 
  document.getElementById('registerForm')?.addEventListener('submit', async (e)=>{ e.preventDefault(); const pass = document.getElementById('regPass').value; if(pass !== document.getElementById('regPassConfirm').value) return showToast("Passwords mismatch", 'error'); const res = await apiFetch('/api/auth/register', { method:'POST', body: JSON.stringify({ username: document.getElementById('regUser').value, email: document.getElementById('regEmail').value, password: pass }) }); if(res && res.success) { showToast("Created! Login now."); document.getElementById('tabLogin').click(); } });

  // RENDER HELPERS
  function renderPublicMembers() { const g = document.getElementById('membersGrid'); g.innerHTML = members.map(m=>`<div class="member glass animate-hidden"><div style="display:flex; justify-content:space-between; align-items:flex-start;"><h3>${m.name}</h3>${m.server ? `<span style="font-size:10px; background:var(--accent-dim); color:var(--accent); padding:2px 6px; border-radius:4px; border:1px solid rgba(255,42,42,0.3);">${m.server}</span>` : ''}</div><div class="role-badge">${m.role}</div>${m.links.discord?`<div style="margin-top:10px; font-size:12px; color:#aaa;">${m.links.discord}</div>`:''}</div>`).join(''); activateScrollAnimations(); }
  function renderNews(l) { const c = document.getElementById('newsList'); c.innerHTML = l.map(n=>`<div class="card glass animate-hidden"><b>${n.date}</b><h3>${n.title}</h3><p>${n.summary}</p></div>`).join(''); activateScrollAnimations(); }
  function renderGallery(l) { const g = document.getElementById('galleryGrid'); g.innerHTML = l.map(g=>`<div class="glass animate-hidden" style="padding:5px;"><img src="${g.url}" onclick="document.getElementById('lightbox').classList.add('show');document.getElementById('lightboxImage').src='${g.url}'"></div>`).join(''); activateScrollAnimations(); }
  function renderVideos(l) { const g = document.getElementById('videosGrid'); g.innerHTML = l.map(v => `<div class="card glass animate-hidden"><div class="card-icon"><i class="fa-solid fa-play"></i></div><h3>${v.title}</h3><a href="${v.url}" target="_blank" class="btn btn-primary full-width">ДИВИТИСЬ</a>${currentUser && currentUser.role === 'admin' ? `<button class="btn btn-outline full-width" style="margin-top:5px;" onclick="window.deleteVideo('${v.id}')">ВИДАЛИТИ</button>` : ''}</div>`).join(''); activateScrollAnimations(); }

  // Assign global deleteVideo
  window.deleteVideo = async (id) => { if(confirm("Delete?")) { await apiFetch(`/api/videos/${id}`, {method:'DELETE'}); showToast("Deleted"); location.reload(); } };
  document.getElementById('addVideoBtn')?.addEventListener('click', async () => { const title = document.getElementById('videoTitle').value; const url = document.getElementById('videoUrl').value; await apiFetch('/api/videos', {method:'POST', body:JSON.stringify({title, url})}); showToast("Video Added"); location.reload(); });
  
  // SUPPORT TICKETS (Must be global/attached)
  const ticketForm = document.getElementById('createTicketForm'); 
  if(ticketForm) { 
      ticketForm.addEventListener('submit', async (e)=>{ 
          e.preventDefault(); 
          const body = { author: currentUser.username, title: document.getElementById('ticketTitle').value, messages: [{ sender: currentUser.username, text: document.getElementById('ticketMessage').value, isStaff: false }] }; 
          await apiFetch('/api/tickets', {method:'POST', body:JSON.stringify(body)}); 
          showToast("Ticket Created"); ticketForm.reset(); loadMyTickets(); 
      }); 
  }
  async function loadMyTickets() { const list = document.getElementById('myTicketsList'); const all = await apiFetch('/api/tickets'); const my = all ? all.filter(t => t.author === currentUser.username) : []; list.innerHTML = my.map(t => `<div class="ticket-card-ultra ${t.status}" onclick="window.openTicket('${t.id}')"><b>${t.title}</b> <span class="status-tag ${t.status}">${t.status}</span></div>`).join(''); }
  async function loadAllTickets() { const list = document.getElementById('allTicketsList'); const all = await apiFetch('/api/tickets'); list.innerHTML = all ? all.map(t => `<div class="ticket-card-ultra ${t.status}" onclick="window.openTicket('${t.id}')"><b>${t.author}: ${t.title}</b> <span class="status-tag ${t.status}">${t.status}</span></div>`).join('') : ''; }
  
  window.openTicket = async (id) => { 
      let currentTicketId = id; const all = await apiFetch('/api/tickets'); const t = all.find(x => x.id === id); 
      if(!t) return; 
      document.getElementById('ticketModal').classList.add('show'); 
      document.getElementById('tmTitle').textContent = t.title; 
      document.getElementById('tmMessages').innerHTML = t.messages.map(m => `<div class="msg ${m.sender===currentUser.username?'me':'other'}"><b>${m.sender}</b>: ${m.text}</div>`).join(''); 
      
      const sendBtn = document.getElementById('tmSendBtn');
      // Clone button to remove old listeners
      const newBtn = sendBtn.cloneNode(true);
      sendBtn.parentNode.replaceChild(newBtn, sendBtn);
      
      newBtn.addEventListener('click', async () => { 
          const txt = document.getElementById('tmInput').value; if(!txt) return; 
          await apiFetch(`/api/tickets/${id}`, { method:'PUT', body: JSON.stringify({ message: { sender: currentUser.username, text: txt, isStaff: ['admin','moderator'].includes(currentUser.role) } }) }); 
          document.getElementById('tmInput').value = ''; 
          window.openTicket(id); // Reload
      });

      document.getElementById('tmCloseTicketBtn').onclick = async () => { await apiFetch(`/api/tickets/${id}`, { method:'PUT', body: JSON.stringify({ status: 'closed' }) }); document.getElementById('ticketModal').classList.remove('show'); loadMyTickets(); loadAllTickets(); }; 
  };
  
  // APPLICATIONS STAFF
  async function loadApplicationsStaff() { 
      const list = document.getElementById('applicationsList'); 
      const apps = await apiFetch('/api/applications'); 
      list.innerHTML = apps.map((a, i) => `<div class="app-card-ultra animate-hidden"><span class="app-id-badge">#${i+1}</span><div class="ultra-row"><span class="ultra-label">CANDIDATE</span> <b>${a.rlName}</b></div><div class="ultra-row"><span class="ultra-label">HISTORY</span> <div class="ultra-history">${a.history}</div></div>${a.status === 'pending' ? `<div class="ultra-input-group"><input id="reason-${a.id}" class="ultra-input" placeholder="Comms..."><button onclick="window.updateAppStatus('${a.id}','approved')">YES</button><button onclick="window.updateAppStatus('${a.id}','rejected')">NO</button></div>` : `<div>STATUS: ${a.status} <button onclick="window.deleteApp('${a.id}')">DEL</button></div>`}</div>`).join(''); 
  }
  window.updateAppStatus = async (id, status) => { const input = document.getElementById(`reason-${id}`); await apiFetch(`/api/applications/${id}`, {method:'PUT', body:JSON.stringify({status, adminComment: input?input.value:''})}); showToast('Updated'); loadApplicationsStaff(); };
  window.deleteApp = async (id) => { await apiFetch(`/api/applications/${id}`, { method: 'DELETE' }); showToast('Deleted'); loadApplicationsStaff(); };
  
  // START
  loadInitialData();
});
