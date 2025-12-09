document.addEventListener('DOMContentLoaded', () => {
  const CURRENT_USER_KEY = 'barakuda_current_user';
  let members = [];
  let systemLogs = JSON.parse(localStorage.getItem('barakuda_logs')) || [];

  // Preloader
  setTimeout(() => {
      const p = document.getElementById('preloader');
      if(p) { p.style.opacity = '0'; setTimeout(() => p.style.display='none', 500); }
  }, 1500);

  // Utils
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
  }

  let currentUser = loadCurrentUser(); 
  async function apiFetch(url, opts={}) {
      try {
          const h={'Content-Type':'application/json', ...(opts.headers||{})};
          const r = await fetch(url, {...opts, headers:h});
          const d = await r.json();
          if(!r.ok) { showToast(d.message||"Помилка", 'error'); return null; }
          return d;
      } catch(e) { console.error(e); return null; }
  }

  async function loadInitialData() {
      const m = await apiFetch('/api/members'); if(m) { members=m; renderPublicMembers(); }
      const g = await apiFetch('/api/gallery'); if(g) renderGallery(g);
      updateAuthUI();
      const yearEl = document.getElementById('year');
      if(yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // Dashboard UI
  const dashModal = document.getElementById('dashboardModal');
  const mobileToggle = document.getElementById('dashMobileToggle');
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('dashOverlay');

  if(mobileToggle) mobileToggle.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); });
  if(overlay) overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });

  window.switchDashTab = (tab) => {
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
      if(tab === 'accounts-data') loadAccountsData();
      if(window.innerWidth <= 900) { sidebar.classList.remove('open'); overlay.classList.remove('active'); }
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
      
      const staffNav = document.querySelector('.staff-only-nav');
      const adminNav = document.querySelector('.admin-only-nav');
      if(staffNav) staffNav.style.display = isStaff ? 'block' : 'none';
      if(adminNav) adminNav.style.display = isAdmin ? 'block' : 'none';

      switchDashTab('profile');
  }

  // --- ACCOUNTS DATA ---
  window.loadAccountsData = async () => {
      const tbody = document.getElementById('accountsDataTableBody');
      if(!tbody) return;
      tbody.innerHTML = '<tr><td colspan="5">Завантаження...</td></tr>';
      const users = await apiFetch('/api/users');
      if(!users || !users.length) { tbody.innerHTML = '<tr><td colspan="5">Пусто</td></tr>'; return; }
      tbody.innerHTML = users.map(u => `<tr><td>${u.username}</td><td>${u.email}</td><td>***</td><td>${u.role}</td><td>${new Date(u.regDate).toLocaleDateString()}</td></tr>`).join('');
  };

  // --- ADMIN USERS ---
  async function loadUsersAdmin() {
      const list = document.getElementById('adminUsersList');
      if (!list) return;
      const users = await apiFetch('/api/users');
      list.innerHTML = users && users.length ? users.map(u => `
        <div style="display:flex; justify-content:space-between; padding:10px; background:rgba(255,255,255,0.05); margin-bottom:5px; border-radius:6px;">
            <div>${u.username} <small>(${u.role})</small></div>
            <div>
             ${u.role !== 'admin' ? `<button onclick="window.changeUserRole('${u.username}','admin')" style="color:red">Make Admin</button> <button onclick="window.banUser('${u.username}')">Ban</button>` : '<span>System</span>'}
            </div>
        </div>`).join('') : 'Пусто';
  }
  window.changeUserRole = async (u, role) => {
      await apiFetch(`/api/users/${u}/role`, { method:'PUT', body: JSON.stringify({role}) });
      showToast(`Role updated`); loadUsersAdmin(); 
  };
  window.banUser = async (u) => customConfirm(`Видалити ${u}?`, async(r)=>{ 
      if(r) { await apiFetch(`/api/users/${u}`, {method:'DELETE'}); showToast('Видалено'); loadUsersAdmin(); }
  });

  // --- AUTH & MISC ---
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
      if(res && res.success) { showToast('Відправлено'); document.getElementById('dashAppForm').reset(); checkMyApplication(); }
  });
  async function checkMyApplication() {
      const apps = await apiFetch('/api/applications/my');
      const myApp = apps ? apps.find(a => a.submittedBy === currentUser.username) : null;
      const form = document.getElementById('dashAppForm');
      const statusBox = document.getElementById('applyStatusContainer');
      if(myApp) {
          form.style.display = 'none'; statusBox.style.display = 'block';
          statusBox.innerHTML = `<h3>СТАТУС: ${myApp.status.toUpperCase()}</h3>`;
          statusBox.style.borderColor = myApp.status === 'approved' ? '#2ecc71' : (myApp.status === 'rejected' ? '#e74c3c' : 'var(--accent)');
      } else { form.style.display = 'block'; statusBox.style.display = 'none'; }
  }

  async function loadApplicationsStaff() {
      const list = document.getElementById('applicationsList');
      const apps = await apiFetch('/api/applications');
      list.innerHTML = apps && apps.length ? apps.map(a => `<div style="padding:15px; background:rgba(255,255,255,0.05); border-radius:8px;"><b>${a.rlNameAge}</b> (${a.status}) <br> <a href="${a.shootingVideo}" target="_blank">Відео</a> <br> <button onclick="window.updateAppStatus('${a.id}','approved')">ОК</button> <button onclick="window.updateAppStatus('${a.id}','rejected')">НІ</button></div>`).join('') : 'Немає заявок';
  }
  window.updateAppStatus = async (id, status) => { await apiFetch(`/api/applications/${id}`, {method:'PUT', body:JSON.stringify({status})}); loadApplicationsStaff(); };

  // Tickets
  document.getElementById('createTicketForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const body = { author: currentUser.username, title: document.getElementById('ticketTitle').value, messages: [{ sender: currentUser.username, text: document.getElementById('ticketMessage').value, isStaff: false }] };
      const res = await apiFetch('/api/tickets', {method:'POST', body:JSON.stringify(body)});
      if(res) { showToast('Створено'); document.getElementById('createTicketForm').reset(); loadMyTickets(); }
  });
  async function loadMyTickets() {
      const list = document.getElementById('myTicketsList');
      const all = await apiFetch('/api/tickets');
      const my = all ? all.filter(t => t.author === currentUser.username) : [];
      list.innerHTML = my.map(t => `<div onclick="window.openTicket('${t.id}')" style="padding:10px; border-bottom:1px solid #333; cursor:pointer;">${t.title} (${t.status})</div>`).join('');
  }
  async function loadAllTickets() {
      const list = document.getElementById('allTicketsList');
      const all = await apiFetch('/api/tickets');
      list.innerHTML = all.map(t => `<div onclick="window.openTicket('${t.id}')" style="padding:10px; background:rgba(255,255,255,0.05); cursor:pointer;">${t.title} - ${t.author}</div>`).join('');
  }
  let currentTicketId = null;
  window.openTicket = async (id) => {
      currentTicketId = id;
      const all = await apiFetch('/api/tickets');
      const t = all.find(x => x.id === id);
      if(!t) return;
      document.getElementById('ticketModal').classList.add('show');
      document.getElementById('tmTitle').textContent = t.title;
      document.getElementById('tmMessages').innerHTML = t.messages.map(m => `<div style="margin-bottom:5px; color:${m.sender===currentUser.username?'#fff':'#aaa'}; text-align:${m.sender===currentUser.username?'right':'left'}"><b>${m.sender}:</b> ${m.text}</div>`).join('');
  };
  document.getElementById('tmSendBtn')?.addEventListener('click', async () => {
      if(!currentTicketId) return;
      const txt = document.getElementById('tmInput').value; if(!txt) return;
      await apiFetch(`/api/tickets/${currentTicketId}`, { method:'PUT', body: JSON.stringify({ message: { sender: currentUser.username, text: txt, isStaff: ['admin','support'].includes(currentUser.role) } }) });
      document.getElementById('tmInput').value = ''; window.openTicket(currentTicketId);
  });
  document.getElementById('tmCloseTicketBtn')?.addEventListener('click', async () => {
      await apiFetch(`/api/tickets/${currentTicketId}`, { method:'PUT', body: JSON.stringify({ status: 'closed' }) });
      document.getElementById('ticketModal').classList.remove('show');
      loadMyTickets(); loadAllTickets();
  });

  // UI State
  async function updateAuthUI() {
      const applyText = document.getElementById('applyText');
      const applyBtn = document.getElementById('applyBtnMain');
      if(currentUser) {
          document.body.classList.add('is-logged-in'); if(currentUser.role==='admin') document.body.classList.add('is-admin');
          document.getElementById('authBtnText').textContent = 'АКАУНТ'; // Changed to "АКАУНТ"
          document.getElementById('openAuthBtn').onclick = window.openDashboard;
          if(applyText) applyText.style.display = 'none';
          if(applyBtn) { applyBtn.innerHTML = '<i class="fa-solid fa-terminal"></i> ВІДКРИТИ ПАНЕЛЬ'; applyBtn.onclick = window.openDashboard; }
      } else {
          document.body.classList.remove('is-logged-in','is-admin');
          document.getElementById('authBtnText').textContent = 'ВХІД';
          document.getElementById('openAuthBtn').onclick = ()=>document.getElementById('authModal').classList.add('show');
          if(applyText) applyText.style.display = 'block';
          if(applyBtn) { applyBtn.innerHTML = '<i class="fa-solid fa-file-pen"></i> ПОДАТИ ЗАЯВКУ'; applyBtn.onclick = ()=>document.getElementById('openAuthBtn').click(); }
      }
  }

  // Auth Forms
  document.getElementById('closeAuth')?.addEventListener('click', ()=>document.getElementById('authModal').classList.remove('show'));
  document.getElementById('closeDashBtn')?.addEventListener('click', ()=>dashModal.classList.remove('show'));
  document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ removeCurrentUser(); location.reload(); });
  document.getElementById('lightboxCloseBtn')?.addEventListener('click', ()=>document.getElementById('lightbox').classList.remove('show'));
  
  document.getElementById('tabLogin')?.addEventListener('click', (e)=>{ e.target.classList.add('active'); document.getElementById('tabRegister').classList.remove('active'); document.getElementById('loginForm').style.display='block'; document.getElementById('registerForm').style.display='none'; });
  document.getElementById('tabRegister')?.addEventListener('click', (e)=>{ e.target.classList.add('active'); document.getElementById('tabLogin').classList.remove('active'); document.getElementById('loginForm').style.display='none'; document.getElementById('registerForm').style.display='block'; });

  document.getElementById('loginForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const res = await apiFetch('/api/auth/login', { method:'POST', body: JSON.stringify({ username: document.getElementById('loginUser').value, password: document.getElementById('loginPass').value }) });
      if(res && res.success) { saveCurrentUser(res.user); showToast(`Вітаємо, ${res.user.username}`); setTimeout(()=>location.reload(), 500); } 
  });
  document.getElementById('registerForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const pass = document.getElementById('regPass').value;
      if(pass !== document.getElementById('regPassConfirm').value) return showToast('Паролі не співпадають', 'error');
      const res = await apiFetch('/api/auth/register', { method:'POST', body: JSON.stringify({ username: document.getElementById('regUser').value, email: document.getElementById('regEmail').value, password: pass }) });
      if(res && res.success) { showToast('Створено!'); document.getElementById('tabLogin').click(); }
  });

  // Admin Members
  async function loadAdminMembers() {
      const list = document.getElementById('adminMembersList');
      const m = await apiFetch('/api/members');
      list.innerHTML = m && m.length ? m.map(x => `<div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #333;"><div>${x.name}</div><button onclick="window.deleteMember('${x.id}')" style="color:red;">X</button></div>`).join('') : 'Пусто';
  }
  document.getElementById('openAdminAddMember')?.addEventListener('click', ()=>document.getElementById('adminAddMemberContainer').style.display='block');
  document.getElementById('adminAddMemberForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const body = { name: document.getElementById('admName').value, role: document.getElementById('admRole').value, owner: document.getElementById('admOwner').value, links: {} };
      await apiFetch('/api/members', {method:'POST', body:JSON.stringify(body)});
      showToast('Додано'); loadAdminMembers();
  });
  window.deleteMember = async (id) => customConfirm('Видалити?', async (r)=>{ if(r) { await apiFetch(`/api/members/${id}`, {method:'DELETE'}); showToast('Видалено'); loadAdminMembers(); loadInitialData(); } });

  function renderPublicMembers() {
      const g = document.getElementById('membersGrid');
      if(!members || !members.length) { g.innerHTML = '<div style="color:#666;">Пусто</div>'; return; }
      g.innerHTML = members.map(m=>`<div class="member glass"><h3>${m.name}</h3><div class="role-badge">${m.role}</div></div>`).join('');
  }
  function renderGallery(l) { document.getElementById('galleryGrid').innerHTML = l.map(g=>`<div class="glass" style="padding:5px;"><img src="${g.url}" onclick="document.getElementById('lightbox').classList.add('show');document.getElementById('lightboxImage').src='${g.url}'"></div>`).join(''); }
  window.renderLogs = () => { document.getElementById('systemLogsList').innerHTML = systemLogs.map(l=>`<div>${l}</div>`).join(''); };
  window.clearLogs = () => { systemLogs=[]; localStorage.removeItem('barakuda_logs'); renderLogs(); };

  loadInitialData();
});
