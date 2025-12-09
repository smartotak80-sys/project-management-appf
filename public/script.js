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
      document.getElementById('closeConfirmModal').onclick=()=>clean(false);
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
  
  // MOBILE SIDEBAR LOGIC
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
  // Auto-close sidebar on mobile when a link is clicked
  document.querySelectorAll('.dash-nav button').forEach(btn => {
      btn.addEventListener('click', () => {
          if(window.innerWidth <= 900) {
              sidebar.classList.remove('open');
              overlay.classList.remove('active');
          }
      });
  });

  window.switchDashTab = (tab) => {
      // Security check: only admin can access 'users', 'admin-members', 'logs'
      if(['users', 'admin-members', 'logs'].includes(tab)) {
          if(!currentUser || currentUser.role !== 'admin') {
              showToast('Доступ заборонено. Тільки для ADMIN.', 'error');
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
  };

  window.openDashboard = () => {
      if(!currentUser) return;
      dashModal.classList.add('show');
      document.getElementById('dashUsername').textContent = currentUser.username;
      document.getElementById('dashRole').textContent = currentUser.role;
      document.getElementById('pLogin').textContent = currentUser.username;
      document.getElementById('pRole').textContent = currentUser.role.toUpperCase();

      // Show/Hide Nav based on Role
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

  // --- ROLE MANAGEMENT (Admin) ---
  // ВИПРАВЛЕНА ФУНКЦІЯ: Додано примусовий стиль видимості
  async function loadUsersAdmin() {
      const list = document.getElementById('adminUsersList');
      if (!list) return;

      list.innerHTML = '<div style="color:#666; padding:10px;">Завантаження...</div>';
      
      try {
          const users = await apiFetch('/api/users');
          
          if(!users || !Array.isArray(users) || users.length === 0) {
              list.innerHTML = `
                <div style="text-align:center; padding:30px; border:1px dashed #333; border-radius:10px; color:#666;">
                    <i class="fa-solid fa-users-slash" style="font-size:24px; margin-bottom:10px;"></i><br>
                    Список користувачів порожній.<br>
                    <small>Зареєстровані користувачі з'являться тут.</small>
                </div>`;
              return;
          }
          
          list.innerHTML = users.map(u => {
              const isSystemAdmin = u._id === 'system_admin_id' || u.username === 'ADMIN 🦈';
              
              // FIX: Додано style="opacity: 1; transform: none;" щоб виправити чорний екран
              return `
                <div class="u-row animate" style="opacity: 1; transform: none;">
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-size:16px; font-weight:bold; color:#fff;">
                            ${u.username} ${isSystemAdmin ? '<i class="fa-solid fa-server" style="color:#666; font-size:10px; margin-left:5px;" title="System User"></i>' : ''}
                        </span>
                        <span style="font-size:12px; color:#666;">${u.email}</span>
                        <span style="font-size:10px; color:#444; margin-top:2px;">Role: ${u.role}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        ${isSystemAdmin ? 
                            '<span style="font-size:11px; color:#666; background:#111; padding:5px 10px; border-radius:5px; border:1px solid #333;">SYSTEM</span>' 
                            : 
                            `<select onchange="window.changeUserRole('${u.username}', this.value)" 
                                    style="margin:0; padding:8px 12px; height:auto; width:auto; font-size:12px; border:1px solid #333; background:#050505; color:#fff; border-radius:8px; cursor:pointer;">
                                <option value="member" ${u.role==='member'?'selected':''}>Member</option>
                                <option value="support" ${u.role==='support'?'selected':''}>Support</option>
                                <option value="moderator" ${u.role==='moderator'?'selected':''}>Moderator</option>
                                <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                            </select>
                            <button class="btn btn-outline" style="padding:8px 12px; border-color:rgba(231,76,60,0.3); color:#e74c3c;" onclick="window.banUser('${u.username}')" title="Видалити">
                                <i class="fa-solid fa-trash"></i>
                            </button>`
                        }
                    </div>
                </div>`;
          }).join('');
      } catch (err) {
          console.error(err);
          list.innerHTML = `<div style="color:#e74c3c; padding:15px;">Помилка завантаження списку.</div>`;
      }
  }
  
  window.changeUserRole = async (u, role) => {
      if(!currentUser || currentUser.role !== 'admin') return showToast('Тільки адмін може це робити', 'error');
      
      await apiFetch(`/api/users/${u}/role`, { method:'PUT', body: JSON.stringify({role}) });
      showToast(`Роль для ${u} змінено на ${role}`);
      addLog(`Admin changed role of ${u} to ${role}`);
      loadUsersAdmin(); 
  };
  
  window.banUser = async (u) => customConfirm(`Видалити користувача ${u}? Це незворотно.`, async(r)=>{ 
      if(r) { await apiFetch(`/api/users/${u}`, {method:'DELETE'}); showToast('Користувача видалено'); loadUsersAdmin(); }
  });

  // --- APPLICATIONS (User) ---
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
      if(res && res.success) { showToast('Заявку надіслано!'); document.getElementById('dashAppForm').reset(); checkMyApplication(); updateAuthUI(); }
  });
  async function checkMyApplication() {
      const apps = await apiFetch('/api/applications/my');
      const myApp = apps ? apps.find(a => a.submittedBy === currentUser.username) : null;
      const form = document.getElementById('dashAppForm');
      const statusBox = document.getElementById('applyStatusContainer');
      
      if(myApp) {
          form.style.display = 'none';
          statusBox.style.display = 'block';
          
          let statusText = 'Очікуйте рішення адміністрації.';
          let color = 'var(--accent)';
          if(myApp.status === 'approved') { statusText = 'Вашу заявку схвалено! Вітаємо.'; color = '#2ecc71'; }
          if(myApp.status === 'rejected') { statusText = 'Вашу заявку відхилено.'; color = '#e74c3c'; }
          
          let commentHtml = '';
          if(myApp.adminComment) {
              commentHtml = `
              <div style="margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1); font-size:13px; text-align:left;">
                  <strong style="color:#ddd">Коментар від Staff:</strong><br>
                  <span style="color:#ccc">${myApp.adminComment}</span>
              </div>`;
          }

          statusBox.innerHTML = `
            <h3 style="margin-top:0">Статус: <span style="color:${color}">${myApp.status.toUpperCase()}</span></h3>
            <p style="margin-bottom:0; color:#aaa;">${statusText}</p>
            ${commentHtml}
          `;
          statusBox.style.borderColor = color;
          statusBox.style.background = myApp.status==='approved' ? 'rgba(46, 204, 113, 0.1)' : (myApp.status==='rejected'?'rgba(231, 76, 60, 0.1)':'rgba(255,42,42,0.1)');

      } else {
          form.style.display = 'block';
          statusBox.style.display = 'none';
      }
  }

  // --- APPLICATIONS (Moderator/Admin) ---
  async function loadApplicationsStaff() {
      const list = document.getElementById('applicationsList');
      const apps = await apiFetch('/api/applications');
      if(!apps || !apps.length) { list.innerHTML = '<p style="color:#666;">Немає заявок.</p>'; return; }
      
      list.innerHTML = apps.map(a => `
        <div class="app-card">
           <div class="app-header">
               <div>
                   <h3 style="margin:0; font-size:18px;">${a.rlNameAge}</h3>
                   <div style="font-size:12px; color:#666; margin-top:2px;">
                       <i class="fa-solid fa-user"></i> ${a.submittedBy}
                   </div>
               </div>
               <div class="status-badge ${a.status}">${a.status.toUpperCase()}</div>
           </div>
           
           <div class="app-grid">
               <div class="app-item">
                   <label>Онлайн</label>
                   <div>${a.onlineTime}</div>
               </div>
               <div class="app-item">
                   <label>Відео-доказ</label>
                   <div>
                        <a href="${a.shootingVideo}" target="_blank" class="app-video-link">
                            <i class="fa-brands fa-youtube"></i> Дивитись
                        </a>
                   </div>
               </div>
               <div class="app-item" style="grid-column: 1 / -1; border-top: 1px solid #222; padding-top: 10px; margin-top: 5px;">
                   <label>Історія гри / Досвід</label>
                   <div style="font-size:13px; color:#ccc; line-height:1.4;">${a.history}</div>
               </div>
           </div>
            
           ${a.status==='pending' ? `
           <div style="margin-top:15px; border-top:1px solid #222; padding-top:15px;">
                <input type="text" id="reason-${a.id}" placeholder="Коментар / Причина (необов'язково)..." 
                       style="width:100%; padding:10px; font-size:13px; margin-bottom:10px; background:#0a0b0e;">
                
                <div class="app-actions" style="margin-top:0; border-top:none; padding-top:0;">
                    <button class="btn btn-primary full-width" onclick="window.updateAppStatus('${a.id}','approved')">Схвалити</button>
                    <button class="btn btn-outline full-width" style="color:#e74c3c; border-color:#e74c3c;" onclick="window.updateAppStatus('${a.id}','rejected')">Відхилити</button>
                </div>
           </div>` : `
           ${a.adminComment ? `<div style="margin-top:10px; font-size:12px; color:#666; border-top:1px solid #222; padding-top:10px;">Коментар: ${a.adminComment}</div>` : ''}
           `}
        </div>`).join('');
  }
  window.updateAppStatus = async (id, status) => {
      const input = document.getElementById(`reason-${id}`);
      const comment = input ? input.value : '';

      await apiFetch(`/api/applications/${id}`, {method:'PUT', body:JSON.stringify({status, adminComment: comment})});
      showToast('Статус оновлено'); loadApplicationsStaff();
      addLog(`${currentUser.username} changed app status to ${status} (Note: ${comment})`);
  };

  // --- TICKETS (Support System) ---
  document.getElementById('createTicketForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const body = {
          author: currentUser.username,
          title: document.getElementById('ticketTitle').value,
          messages: [{ sender: currentUser.username, text: document.getElementById('ticketMessage').value, isStaff: false }]
      };
      const res = await apiFetch('/api/tickets', {method:'POST', body:JSON.stringify(body)});
      if(res && res.success) { showToast('Тікет створено'); document.getElementById('createTicketForm').reset(); loadMyTickets(); }
  });

  async function loadMyTickets() {
      const list = document.getElementById('myTicketsList');
      const all = await apiFetch('/api/tickets');
      const my = all ? all.filter(t => t.author === currentUser.username) : [];
      renderTicketList(list, my);
  }
  async function loadAllTickets() {
      const list = document.getElementById('allTicketsList');
      const all = await apiFetch('/api/tickets');
      renderTicketList(list, all || []);
  }
  function renderTicketList(container, tickets) {
      if(!tickets.length) { container.innerHTML = '<div style="color:#666; font-size:12px;">Пусто</div>'; return; }
      container.innerHTML = tickets.map(t => `
        <div onclick="window.openTicket('${t.id}')" style="background:#222; padding:15px; border-radius:10px; cursor:pointer; border-left:4px solid ${t.status==='open'?'#2ecc71':'#666'}; margin-bottom:10px;">
            <div style="font-weight:bold; font-size:14px; margin-bottom:5px;">${t.title}</div>
            <div style="font-size:11px; color:#888;">Від: ${t.author} | Статус: ${t.status}</div>
        </div>`).join('');
  }

  // TICKET CHAT
  let currentTicketId = null;
  window.openTicket = async (id) => {
      currentTicketId = id;
      const all = await apiFetch('/api/tickets');
      const t = all.find(x => x.id === id);
      if(!t) return;
      
      document.getElementById('ticketModal').classList.add('show');
      document.getElementById('tmTitle').textContent = `Ticket: ${t.title}`;
      
      const chat = document.getElementById('tmMessages');
      chat.innerHTML = t.messages.map(m => `
        <div style="align-self:${m.sender===currentUser.username ? 'flex-end' : 'flex-start'}; background:${m.isStaff?'#3e2723':'#1a1a2e'}; padding:8px 12px; border-radius:8px; max-width:80%; font-size:13px; border:1px solid ${m.isStaff?'#e74c3c':'#333'};">
            <div style="font-size:10px; color:#aaa; margin-bottom:2px;">${m.sender}</div>
            ${m.text}
        </div>`).join('');
      chat.scrollTop = chat.scrollHeight;

      const btnClose = document.getElementById('tmCloseTicketBtn');
      if(t.status === 'closed') { btnClose.style.display = 'none'; } else { btnClose.style.display = 'block'; }
  };

  document.getElementById('tmSendBtn')?.addEventListener('click', async () => {
      if(!currentTicketId) return;
      const txt = document.getElementById('tmInput').value;
      if(!txt) return;
      const isStaff = ['admin', 'moderator', 'support'].includes(currentUser.role);
      const msg = { sender: currentUser.username, text: txt, isStaff };
      
      await apiFetch(`/api/tickets/${currentTicketId}`, { method:'PUT', body: JSON.stringify({ message: msg }) });
      document.getElementById('tmInput').value = '';
      window.openTicket(currentTicketId); // refresh
  });
  document.getElementById('tmCloseTicketBtn')?.addEventListener('click', async () => {
      if(!currentTicketId) return;
      await apiFetch(`/api/tickets/${currentTicketId}`, { method:'PUT', body: JSON.stringify({ status: 'closed' }) });
      document.getElementById('ticketModal').classList.remove('show');
      if(document.getElementById('tab-support-staff').classList.contains('active')) loadAllTickets();
      else loadMyTickets();
  });


  // --- AUTH & MISC ---
  
  async function updateAuthUI() {
      const applyText = document.getElementById('applyText');
      const applyBtn = document.getElementById('applyBtnMain');

      if(currentUser) {
          // LOGGED IN
          document.body.classList.add('is-logged-in');
          if(currentUser.role==='admin') document.body.classList.add('is-admin');
          document.getElementById('authBtnText').textContent = 'Кабінет';
          document.getElementById('openAuthBtn').onclick = window.openDashboard;

          if(applyText) applyText.style.display = 'none';

          if(applyBtn) {
               applyBtn.innerHTML = '<i class="fa-regular fa-id-card"></i> Відкрити панель';
               applyBtn.onclick = window.openDashboard;
               
               try {
                   const apps = await apiFetch('/api/applications/my');
                   const myApp = apps ? apps.find(a => a.submittedBy === currentUser.username) : null;
                   
                   if(myApp) {
                        let statusColor = '#e6b800'; 
                        if(myApp.status === 'approved') statusColor = '#2ecc71';
                        if(myApp.status === 'rejected') statusColor = '#e74c3c';
                        
                        applyBtn.innerHTML = `<i class="fa-solid fa-file-contract"></i> Заявка: ${myApp.status.toUpperCase()}`;
                        applyBtn.style.background = 'rgba(0,0,0,0.5)';
                        applyBtn.style.borderColor = statusColor;
                        applyBtn.style.color = statusColor;
                   }
               } catch(e) { console.error(e); }
          }

      } else {
          // GUEST
          document.body.classList.remove('is-logged-in','is-admin');
          document.getElementById('authBtnText').textContent = 'Вхід';
          document.getElementById('openAuthBtn').onclick = ()=>document.getElementById('authModal').classList.add('show');
          
          if(applyText) applyText.style.display = 'block';

          if(applyBtn) {
              applyBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Увійти в кабінет';
              applyBtn.onclick = () => document.getElementById('openAuthBtn').click();
              applyBtn.style.background = '';
              applyBtn.style.borderColor = '';
              applyBtn.style.color = '';
          }
      }
  }

  // GLOBAL EVENTS
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
      if(res && res.success) { saveCurrentUser(res.user); showToast(`Welcome, ${res.user.username}`); setTimeout(()=>location.reload(), 500); } 
  });
  document.getElementById('registerForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const pass = document.getElementById('regPass').value;
      if(pass !== document.getElementById('regPassConfirm').value) return showToast('Паролі не співпадають', 'error');
      const res = await apiFetch('/api/auth/register', { method:'POST', body: JSON.stringify({ username: document.getElementById('regUser').value, email: document.getElementById('regEmail').value, password: pass }) });
      if(res && res.success) { showToast('Успіх! Увійдіть.'); document.getElementById('tabLogin').click(); }
  });

  // Admin Members
  async function loadAdminMembers() {
      const list = document.getElementById('adminMembersList');
      const m = await apiFetch('/api/members');
      list.innerHTML = m.map(x => `
        <div class="u-row">
            <div>${x.name} <small>(${x.role})</small></div>
            <button class="btn btn-outline" style="color:#d33; border-color:#d33; padding:5px 10px;" onclick="window.deleteMember('${x.id}')">DEL</button>
        </div>`).join('');
  }
  document.getElementById('openAdminAddMember')?.addEventListener('click', ()=>document.getElementById('adminAddMemberContainer').style.display='block');
  document.getElementById('adminAddMemberForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const body = { name: document.getElementById('admName').value, role: document.getElementById('admRole').value, owner: document.getElementById('admOwner').value, links: {discord:document.getElementById('admDiscord').value, youtube:document.getElementById('admYoutube').value} };
      await apiFetch('/api/members', {method:'POST', body:JSON.stringify(body)});
      showToast('Member added'); loadAdminMembers();
  });
  window.deleteMember = async (id) => customConfirm('Delete?', async (r)=>{ if(r) { await apiFetch(`/api/members/${id}`, {method:'DELETE'}); showToast('Deleted'); loadAdminMembers(); loadInitialData(); } });

  // Load My Member
  function loadMyMemberTab() {
      const container = document.getElementById('myMemberContainer');
      const myMember = members.find(m => m.owner === currentUser.username);
      if(myMember) {
          document.getElementById('myMemberStatusPanel').style.display='block';
          container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h3 style="margin:0 0 5px 0;">${myMember.name}</h3>
                    <div style="font-size:12px; color:#888;">RANK: <span style="color:#fff">${myMember.role}</span></div>
                </div>
                <div class="dash-avatar"><i class="fa-solid fa-user-shield"></i></div>
            </div>`;
          document.getElementById('saveStatusBtn').onclick=async()=>{
              let role = myMember.role.split(' | ')[0] + ' | ' + document.getElementById('memberStatusSelect').value;
              await apiFetch(`/api/members/${myMember.id}`, {method:'PUT', body:JSON.stringify({role})});
              showToast('Status updated'); loadInitialData(); loadMyMemberTab();
          };
      } else {
          container.innerHTML = `<p style="color:#aaa;">Ще немає персонажа. Подайте заявку.</p>`;
          document.getElementById('myMemberStatusPanel').style.display='none';
      }
  }

  // Render Public
  function renderPublicMembers() {
      const g = document.getElementById('membersGrid');
      g.innerHTML = members.map(m=>`
        <div class="member">
            <h3>${m.name}</h3><div class="role-badge">${m.role}</div>
            ${m.links.discord?`<div style="margin-top:10px; font-size:12px; color:#666;">Discord: ${m.links.discord}</div>`:''}
        </div>`).join('');
      activateScrollAnimations();
  }
  function renderNews(l) { document.getElementById('newsList').innerHTML = l.map(n=>`<div class="card" style="margin-bottom:15px; padding:20px;"><b>${n.date}</b><h3>${n.title}</h3><p>${n.summary}</p></div>`).join(''); }
  function renderGallery(l) { document.getElementById('galleryGrid').innerHTML = l.map(g=>`<div><img src="${g.url}" onclick="document.getElementById('lightbox').classList.add('show');document.getElementById('lightboxImage').src='${g.url}'"></div>`).join(''); }
  window.renderLogs = () => { document.getElementById('systemLogsList').innerHTML = systemLogs.map(l=>`<div>${l}</div>`).join(''); };
  window.clearLogs = () => { systemLogs=[]; localStorage.removeItem('barakuda_logs'); renderLogs(); };

  loadInitialData();
});
