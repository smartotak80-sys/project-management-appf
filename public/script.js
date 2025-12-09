document.addEventListener('DOMContentLoaded', () => {
  const CURRENT_USER_KEY = 'barakuda_current_user';
  let members = [];
  let systemLogs = JSON.parse(localStorage.getItem('barakuda_logs')) || [];

  setTimeout(() => {
      const p = document.getElementById('preloader');
      if(p) { p.style.opacity = '0'; setTimeout(()=>p.style.display='none', 500); }
  }, 2000);

  // UTILS
  function loadCurrentUser(){ try{ return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)); } catch(e){ return null; } }
  function saveCurrentUser(val){ localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(val)) }
  function removeCurrentUser(){ localStorage.removeItem(CURRENT_USER_KEY) }
  window.showToast = (msg, type = 'success') => {
      const c = document.getElementById('toastContainer');
      const t = document.createElement('div'); t.className = `toast ${type}`;
      t.innerHTML = `<span>${msg}</span>`; c.appendChild(t);
      setTimeout(() => { t.style.opacity='0'; setTimeout(()=>t.remove(),300); }, 3000);
  };
  function addLog(action) {
      systemLogs.unshift(`[${new Date().toLocaleTimeString()}] ${action}`);
      if(systemLogs.length>50) systemLogs.pop();
      localStorage.setItem('barakuda_logs', JSON.stringify(systemLogs));
      if(document.getElementById('tab-logs')?.classList.contains('active')) renderLogs();
  }
  function customConfirm(msg, cb) {
      const m=document.getElementById('customConfirmModal');
      document.getElementById('confirmMessage').textContent=msg;
      const ok=document.getElementById('confirmOkBtn');
      m.classList.add('show');
      const clean=(r)=>{ m.classList.remove('show'); ok.onclick=null; if(cb)cb(r); };
      ok.onclick=()=>clean(true); document.getElementById('confirmCancelBtn').onclick=()=>clean(false);
      // document.getElementById('closeConfirmModal').onclick=()=>clean(false); // Can be removed if not needed
  }

  let currentUser = loadCurrentUser(); 
  async function apiFetch(url, opts={}) {
      try {
          const h={'Content-Type':'application/json', ...(opts.headers||{})};
          const r = await fetch(url, {...opts, headers:h});
          const d = await r.json();
          if(!r.ok) { showToast(d.message||"Error", 'error'); return null; }
          return d;
      } catch(e) { console.error(e); return null; }
  }

  async function loadInitialData() {
      const m = await apiFetch('/api/members'); if(m) { members=m; renderPublicMembers(); }
      const n = await apiFetch('/api/news'); if(n) renderNews(n);
      const g = await apiFetch('/api/gallery'); if(g) renderGallery(g);
      updateAuthUI();
      const yearEl = document.getElementById('year');
      if(yearEl) yearEl.textContent = new Date().getFullYear();
      activateScrollAnimations();
  }
  function activateScrollAnimations() {
      const obs = new IntersectionObserver((e,o)=>{ e.forEach(en=>{ if(en.isIntersecting){en.target.classList.add('animate');o.unobserve(en.target);} }); },{threshold:0.1});
      document.querySelectorAll('.hero,.section,.card,.member').forEach(el=>obs.observe(el));
  }

  // --- DASHBOARD UI LOGIC ---
  const dashModal = document.getElementById('dashboardModal');
  const mobileToggle = document.getElementById('dashMobileToggle');
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('dashOverlay');

  if(mobileToggle) {
      mobileToggle.addEventListener('click', () => {
          sidebar.classList.add('open');
          overlay.classList.add('active');
      });
  }
  if(overlay) {
      overlay.addEventListener('click', () => {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
      });
  }
  document.querySelectorAll('.dash-nav button').forEach(btn => {
      btn.addEventListener('click', () => {
          if(window.innerWidth <= 900) {
              sidebar.classList.remove('open');
              overlay.classList.remove('active');
          }
      });
  });

  window.switchDashTab = (tab) => {
      // Security Check
      if(['users', 'admin-members', 'logs', 'accounts-data'].includes(tab)) {
          if(!currentUser || currentUser.role !== 'admin') {
              showToast('ACCESS DENIED: ADMIN LEVEL REQUIRED', 'error');
              return;
          }
      }

      document.querySelectorAll('.dash-view').forEach(e => e.classList.remove('active'));
      document.querySelectorAll('.dash-nav button').forEach(e => e.classList.remove('active'));
      
      const btn = Array.from(document.querySelectorAll('.dash-nav button')).find(b => b.getAttribute('onclick')?.includes(tab));
      if(btn) btn.classList.add('active');
      
      document.getElementById(`tab-${tab}`)?.classList.add('active');
      
      if(tab === 'apply') checkMyApplication();
      if(tab === 'applications') loadApplicationsStaff();
      if(tab === 'support-user') loadMyTickets();
      if(tab === 'support-staff') loadAllTickets();
      if(tab === 'users') loadUsersAdmin();
      if(tab === 'admin-members') loadAdminMembers();
      if(tab === 'logs') renderLogs();
      if(tab === 'my-member') loadMyMemberTab();
      if(tab === 'accounts-data') loadAccountsData(); // NEW TAB
  };

  window.openDashboard = () => {
      if(!currentUser) return;
      dashModal.classList.add('show');
      document.getElementById('dashUsername').textContent = currentUser.username;
      document.getElementById('dashRole').textContent = currentUser.role;
      document.getElementById('pLogin').textContent = currentUser.username;
      document.getElementById('pRole').textContent = currentUser.role.toUpperCase();

      const role = currentUser.role;
      const isStaff = ['admin', 'moderator', 'support'].includes(role);
      const isAdmin = role === 'admin';
      const isModOrAdmin = ['admin', 'moderator'].includes(role);

      const staffNav = document.querySelector('.staff-only-nav');
      const adminNav = document.querySelector('.admin-only-nav');
      
      if(staffNav) staffNav.style.display = isStaff ? 'block' : 'none';
      if(adminNav) adminNav.style.display = isAdmin ? 'block' : 'none';
      
      const btnApps = document.getElementById('navAppsBtn');
      if(btnApps) btnApps.style.display = isModOrAdmin ? 'flex' : 'none';

      switchDashTab('profile');
  }

  // --- NEW FEATURE: ACCOUNTS DATA ---
  window.loadAccountsData = async () => {
      const tbody = document.getElementById('accountsDataTableBody');
      if(!tbody) return;
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">Завантаження бази даних...</td></tr>';
      
      const users = await apiFetch('/api/users');
      if(!users || !users.length) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">База порожня</td></tr>';
          return;
      }
      
      tbody.innerHTML = users.map(u => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding:10px; color:#fff; font-weight:bold;">${u.username}</td>
            <td style="padding:10px; color:#aaa;">${u.email}</td>
            <td style="padding:10px; font-family:monospace; color:var(--accent);">${u.password || '***'}</td>
            <td style="padding:10px;"><span class="badge ${u.role}">${u.role}</span></td>
            <td style="padding:10px; color:#666; font-size:12px;">${new Date(u.regDate).toLocaleDateString()}</td>
        </tr>
      `).join('');
  };

  // --- ROLE MANAGEMENT (Admin) ---
  async function loadUsersAdmin() {
      const list = document.getElementById('adminUsersList');
      if (!list) return;

      list.innerHTML = '<div style="color:#666; padding:10px;">Завантаження...</div>';
      
      try {
          const users = await apiFetch('/api/users');
          if(!users || !Array.isArray(users) || users.length === 0) {
              list.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">Список порожній.</div>`;
              return;
          }
          list.innerHTML = users.map(u => {
              const isSystemAdmin = u._id === 'system_admin_id' || u.username === 'ADMIN 🦈';
              return `
                <div class="u-row animate" style="opacity:1; transform:none;">
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-size:16px; font-weight:bold; color:#fff;">
                            ${u.username} ${isSystemAdmin ? '<i class="fa-solid fa-server" style="color:#555;"></i>' : ''}
                        </span>
                        <span style="font-size:10px; color:#555;">Role: ${u.role}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${isSystemAdmin ? 
                            '<span style="font-size:11px; color:#666;">SYSTEM</span>' 
                            : 
                            `<select onchange="window.changeUserRole('${u.username}', this.value)" style="margin:0; width:auto; padding:5px;">
                                <option value="member" ${u.role==='member'?'selected':''}>Member</option>
                                <option value="support" ${u.role==='support'?'selected':''}>Support</option>
                                <option value="moderator" ${u.role==='moderator'?'selected':''}>Moderator</option>
                                <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                            </select>
                            <button class="btn btn-outline btn-icon" style="color:#ff4757; border-color:rgba(255,71,87,0.3);" onclick="window.banUser('${u.username}')"><i class="fa-solid fa-trash"></i></button>`
                        }
                    </div>
                </div>`;
          }).join('');
      } catch (err) { console.error(err); }
  }
  
  window.changeUserRole = async (u, role) => {
      if(!currentUser || currentUser.role !== 'admin') return;
      await apiFetch(`/api/users/${u}/role`, { method:'PUT', body: JSON.stringify({role}) });
      showToast(`Роль для ${u} змінено на ${role}`);
      addLog(`Admin changed role of ${u} to ${role}`);
      loadUsersAdmin(); 
  };
  
  window.banUser = async (u) => customConfirm(`DELETE USER ${u}?`, async(r)=>{ 
      if(r) { await apiFetch(`/api/users/${u}`, {method:'DELETE'}); showToast('User Deleted'); loadUsersAdmin(); }
  });

  // --- APPLICATIONS ---
  document.getElementById('dashAppForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const body = {
          rlNameAge: document.getElementById('appRlNameAge').value,
          onlineTime: document.getElementById('appOnline').value,
          history: document.getElementById('appHistory').value,
          shootingVideo: document.getElementById('appVideo').value,
          submittedBy: currentUser.username
      };
      const res = await apiFetch('/api/applications', {method:'POST', body:JSON.stringify(body)});
      if(res && res.success) { showToast('APPLICATION SENT'); document.getElementById('dashAppForm').reset(); checkMyApplication(); updateAuthUI(); }
  });
  async function checkMyApplication() {
      const apps = await apiFetch('/api/applications/my');
      const myApp = apps ? apps.find(a => a.submittedBy === currentUser.username) : null;
      const form = document.getElementById('dashAppForm');
      const statusBox = document.getElementById('applyStatusContainer');
      
      if(myApp) {
          form.style.display = 'none';
          statusBox.style.display = 'block';
          
          let statusText = 'PENDING REVIEW...';
          let color = 'var(--accent)';
          if(myApp.status === 'approved') { statusText = 'APPROVED. WELCOME.'; color = '#2ecc71'; }
          if(myApp.status === 'rejected') { statusText = 'REJECTED.'; color = '#ff4757'; }
          
          statusBox.innerHTML = `
            <h3 style="margin-top:0">STATUS: <span style="color:${color}">${myApp.status.toUpperCase()}</span></h3>
            <p>${statusText}</p>
            ${myApp.adminComment ? `<div style="margin-top:10px; font-size:12px; color:#aaa;">STAFF NOTE: ${myApp.adminComment}</div>` : ''}
          `;
          statusBox.style.borderColor = color;
      } else {
          form.style.display = 'block';
          statusBox.style.display = 'none';
      }
  }

  async function loadApplicationsStaff() {
      const list = document.getElementById('applicationsList');
      const apps = await apiFetch('/api/applications');
      if(!apps || !apps.length) { list.innerHTML = '<p style="color:#666;">NO APPLICATIONS</p>'; return; }
      
      list.innerHTML = apps.map(a => `
        <div class="app-card animate" style="opacity:1; transform:none;">
           <div class="app-header">
               <div>
                   <h3 style="margin:0;">${a.rlNameAge}</h3>
                   <div style="font-size:12px; color:#666;"><i class="fa-solid fa-user"></i> ${a.submittedBy}</div>
               </div>
               <div class="status-badge ${a.status}">${a.status}</div>
           </div>
           <div class="app-grid">
               <div class="app-item"><label>ONLINE</label><div>${a.onlineTime}</div></div>
               <div class="app-item"><label>VIDEO</label><div><a href="${a.shootingVideo}" target="_blank" class="app-video-link">WATCH</a></div></div>
               <div class="app-item full"><label>HISTORY</label><div>${a.history}</div></div>
           </div>
           ${a.status==='pending' ? `
           <div class="app-controls">
                <input type="text" id="reason-${a.id}" placeholder="Note...">
                <div class="app-btns">
                    <button class="btn btn-primary" onclick="window.updateAppStatus('${a.id}','approved')">APPROVE</button>
                    <button class="btn btn-outline" style="color:#ff4757; border-color:#ff4757;" onclick="window.updateAppStatus('${a.id}','rejected')">REJECT</button>
                </div>
           </div>` : ''}
        </div>`).join('');
  }
  window.updateAppStatus = async (id, status) => {
      const input = document.getElementById(`reason-${id}`);
      await apiFetch(`/api/applications/${id}`, {method:'PUT', body:JSON.stringify({status, adminComment: input ? input.value : ''})});
      showToast('UPDATED'); loadApplicationsStaff();
  };

  // --- TICKETS ---
  document.getElementById('createTicketForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const body = { author: currentUser.username, title: document.getElementById('ticketTitle').value, messages: [{ sender: currentUser.username, text: document.getElementById('ticketMessage').value, isStaff: false }] };
      const res = await apiFetch('/api/tickets', {method:'POST', body:JSON.stringify(body)});
      if(res && res.success) { showToast('TICKET CREATED'); document.getElementById('createTicketForm').reset(); loadMyTickets(); }
  });

  async function loadMyTickets() {
      const list = document.getElementById('myTicketsList');
      const all = await apiFetch('/api/tickets');
      const my = all ? all.filter(t => t.author === currentUser.username) : [];
      list.innerHTML = my.length ? my.map(t => `<div onclick="window.openTicket('${t.id}')" class="ticket-item ${t.status}"><b>${t.title}</b><span>${t.status}</span></div>`).join('') : '<div class="empty">No tickets</div>';
  }
  async function loadAllTickets() {
      const list = document.getElementById('allTicketsList');
      const all = await apiFetch('/api/tickets');
      list.innerHTML = all && all.length ? all.map(t => `<div onclick="window.openTicket('${t.id}')" class="ticket-item ${t.status}"><b>${t.title}</b><small>${t.author}</small><span>${t.status}</span></div>`).join('') : '<div class="empty">No tickets</div>';
  }

  let currentTicketId = null;
  window.openTicket = async (id) => {
      currentTicketId = id;
      const all = await apiFetch('/api/tickets');
      const t = all.find(x => x.id === id);
      if(!t) return;
      document.getElementById('ticketModal').classList.add('show');
      document.getElementById('tmTitle').textContent = `TICKET: ${t.title}`;
      const chat = document.getElementById('tmMessages');
      chat.innerHTML = t.messages.map(m => `<div class="msg ${m.sender===currentUser.username?'me':'other'} ${m.isStaff?'staff':''}"><div class="sender">${m.sender}</div>${m.text}</div>`).join('');
      chat.scrollTop = chat.scrollHeight;
      document.getElementById('tmCloseTicketBtn').style.display = t.status === 'closed' ? 'none' : 'block';
  };
  document.getElementById('tmSendBtn')?.addEventListener('click', async () => {
      if(!currentTicketId) return;
      const txt = document.getElementById('tmInput').value; if(!txt) return;
      const isStaff = ['admin', 'moderator', 'support'].includes(currentUser.role);
      await apiFetch(`/api/tickets/${currentTicketId}`, { method:'PUT', body: JSON.stringify({ message: { sender: currentUser.username, text: txt, isStaff } }) });
      document.getElementById('tmInput').value = ''; window.openTicket(currentTicketId);
  });
  document.getElementById('tmCloseTicketBtn')?.addEventListener('click', async () => {
      await apiFetch(`/api/tickets/${currentTicketId}`, { method:'PUT', body: JSON.stringify({ status: 'closed' }) });
      document.getElementById('ticketModal').classList.remove('show');
      loadMyTickets(); loadAllTickets();
  });

  // --- AUTH ---
  async function updateAuthUI() {
      const applyText = document.getElementById('applyText');
      const applyBtn = document.getElementById('applyBtnMain');
      if(currentUser) {
          document.body.classList.add('is-logged-in');
          if(currentUser.role==='admin') document.body.classList.add('is-admin');
          document.getElementById('authBtnText').textContent = 'SYSTEM';
          document.getElementById('openAuthBtn').onclick = window.openDashboard;
          if(applyText) applyText.style.display = 'none';
          if(applyBtn) { applyBtn.innerHTML = '<i class="fa-solid fa-terminal"></i> OPEN PANEL'; applyBtn.onclick = window.openDashboard; }
      } else {
          document.body.classList.remove('is-logged-in','is-admin');
          document.getElementById('authBtnText').textContent = 'LOGIN';
          document.getElementById('openAuthBtn').onclick = ()=>document.getElementById('authModal').classList.add('show');
          if(applyText) applyText.style.display = 'block';
          if(applyBtn) { applyBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> ACCESS TERMINAL'; applyBtn.onclick = ()=>document.getElementById('openAuthBtn').click(); }
      }
  }

  document.getElementById('navToggle')?.addEventListener('click', ()=>document.getElementById('mainNav').classList.toggle('open'));
  document.getElementById('closeAuth')?.addEventListener('click', ()=>document.getElementById('authModal').classList.remove('show'));
  document.getElementById('closeDashBtn')?.addEventListener('click', ()=>dashModal.classList.remove('show'));
  document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ removeCurrentUser(); location.reload(); });
  document.getElementById('lightboxCloseBtn')?.addEventListener('click', ()=>document.getElementById('lightbox').classList.remove('show'));
  document.getElementById('tabLogin')?.addEventListener('click', (e)=>{ e.target.classList.add('active'); document.getElementById('tabRegister').classList.remove('active'); document.getElementById('loginForm').style.display='block'; document.getElementById('registerForm').style.display='none'; });
  document.getElementById('tabRegister')?.addEventListener('click', (e)=>{ e.target.classList.add('active'); document.getElementById('tabLogin').classList.remove('active'); document.getElementById('loginForm').style.display='none'; document.getElementById('registerForm').style.display='block'; });

  document.getElementById('loginForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const res = await apiFetch('/api/auth/login', { method:'POST', body: JSON.stringify({ username: document.getElementById('loginUser').value, password: document.getElementById('loginPass').value }) });
      if(res && res.success) { saveCurrentUser(res.user); showToast(`WELCOME ${res.user.username}`); setTimeout(()=>location.reload(), 500); } 
  });
  document.getElementById('registerForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const pass = document.getElementById('regPass').value;
      if(pass !== document.getElementById('regPassConfirm').value) return showToast('PASSWORDS DO NOT MATCH', 'error');
      const res = await apiFetch('/api/auth/register', { method:'POST', body: JSON.stringify({ username: document.getElementById('regUser').value, email: document.getElementById('regEmail').value, password: pass }) });
      if(res && res.success) { showToast('CREATED. PLEASE LOGIN.'); document.getElementById('tabLogin').click(); }
  });

  async function loadAdminMembers() {
      const list = document.getElementById('adminMembersList');
      const m = await apiFetch('/api/members');
      list.innerHTML = m.map(x => `<div class="u-row animate" style="opacity:1; transform:none;"><div>${x.name} <small>(${x.role})</small></div><button class="btn btn-outline" style="color:#ff4757; border-color:#ff4757;" onclick="window.deleteMember('${x.id}')">DEL</button></div>`).join('');
  }
  document.getElementById('openAdminAddMember')?.addEventListener('click', ()=>document.getElementById('adminAddMemberContainer').style.display='block');
  document.getElementById('adminAddMemberForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const body = { name: document.getElementById('admName').value, role: document.getElementById('admRole').value, owner: document.getElementById('admOwner').value, links: {discord:document.getElementById('admDiscord').value, youtube:document.getElementById('admYoutube').value} };
      await apiFetch('/api/members', {method:'POST', body:JSON.stringify(body)});
      showToast('Member added'); loadAdminMembers();
  });
  window.deleteMember = async (id) => customConfirm('Delete Member?', async (r)=>{ if(r) { await apiFetch(`/api/members/${id}`, {method:'DELETE'}); showToast('Deleted'); loadAdminMembers(); loadInitialData(); } });

  function loadMyMemberTab() {
      const container = document.getElementById('myMemberContainer');
      const myMember = members.find(m => m.owner === currentUser.username);
      if(myMember) {
          document.getElementById('myMemberStatusPanel').style.display='block';
          container.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><div><h3 style="margin:0 0 5px 0;">${myMember.name}</h3><div style="font-size:12px; color:#888;">RANK: <span style="color:#fff">${myMember.role}</span></div></div><div class="dash-avatar"><i class="fa-solid fa-user-shield"></i></div></div>`;
          document.getElementById('saveStatusBtn').onclick=async()=>{
              let role = myMember.role.split(' | ')[0] + ' | ' + document.getElementById('memberStatusSelect').value;
              await apiFetch(`/api/members/${myMember.id}`, {method:'PUT', body:JSON.stringify({role})});
              showToast('Status updated'); loadInitialData(); loadMyMemberTab();
          };
      } else { container.innerHTML = `<p style="color:#aaa;">NO MEMBER ASSIGNED.</p>`; document.getElementById('myMemberStatusPanel').style.display='none'; }
  }

  function renderPublicMembers() {
      const g = document.getElementById('membersGrid');
      g.innerHTML = members.map(m=>`<div class="member glass"><h3>${m.name}</h3><div class="role-badge">${m.role}</div>${m.links.discord?`<div style="margin-top:10px; font-size:12px; color:#aaa;">${m.links.discord}</div>`:''}</div>`).join('');
      activateScrollAnimations();
  }
  function renderNews(l) { document.getElementById('newsList').innerHTML = l.map(n=>`<div class="card glass"><b>${n.date}</b><h3>${n.title}</h3><p>${n.summary}</p></div>`).join(''); }
  function renderGallery(l) { document.getElementById('galleryGrid').innerHTML = l.map(g=>`<div class="glass" style="padding:5px;"><img src="${g.url}" onclick="document.getElementById('lightbox').classList.add('show');document.getElementById('lightboxImage').src='${g.url}'"></div>`).join(''); }
  window.renderLogs = () => { document.getElementById('systemLogsList').innerHTML = systemLogs.map(l=>`<div>${l}</div>`).join(''); };
  window.clearLogs = () => { systemLogs=[]; localStorage.removeItem('barakuda_logs'); renderLogs(); };

  loadInitialData();
});
