document.addEventListener('DOMContentLoaded', () => {
  const CURRENT_USER_KEY = 'barakuda_current_user';
  let members = [];
  let systemLogs = JSON.parse(localStorage.getItem('barakuda_logs')) || [];

  // --- ТЕСТОВІ ДАНІ (Показуються, якщо база порожня) ---
  const FALLBACK_MEMBERS = [
      { 
          id: 'test1', name: 'Taras Shevchenko', role: 'Лідер', 
          links: { discord: 'kobzar#0001', youtube: '#' } 
      },
      { 
          id: 'test2', name: 'Ivan Franko', role: 'Заступник', 
          links: { discord: 'kamenyar#0002', youtube: '#' } 
      },
      { 
          id: 'test3', name: 'Lesya Ukrainka', role: 'Модератор', 
          links: { discord: 'mavka#0003', youtube: '#' } 
      },
      { 
          id: 'test4', name: 'Bogdan Hmelnitsky', role: 'Капт склад', 
          links: { discord: 'hetman#0004', youtube: '#' } 
      }
  ];

  // Прибираємо прелоадер через 2 сек
  setTimeout(() => {
      const p = document.getElementById('preloader');
      if(p) { p.style.opacity = '0'; setTimeout(()=>p.style.display='none', 500); }
  }, 1500);

  // --- UTILS ---
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

  // --- API FETCH WRAPPER ---
  async function apiFetch(url, opts={}) {
      try {
          const h={'Content-Type':'application/json', ...(opts.headers||{})};
          const r = await fetch(url, {...opts, headers:h});
          // Якщо сервер повернув помилку (наприклад 404 або 500)
          if(!r.ok) { 
              // Для GET запитів не показуємо помилку тостом, щоб не лякати користувача, просто повертаємо null
              if(opts.method && opts.method !== 'GET') {
                 const d = await r.json();
                 showToast(d.message||"Error", 'error'); 
              }
              return null; 
          }
          return await r.json();
      } catch(e) { 
          console.error("Fetch error:", e);
          return null; 
      }
  }

  // --- ЗАВАНТАЖЕННЯ ДАНИХ (Updated) ---
  async function loadInitialData() {
      // 1. Пробуємо завантажити учасників з сервера
      let m = await apiFetch('/api/members');
      
      // 2. Якщо сервер не відповів або список порожній — беремо тестові дані
      if(!m || m.length === 0) {
          console.log('Даних з сервера немає. Використовуємо резервний список.');
          members = FALLBACK_MEMBERS;
      } else {
          members = m;
      }
      
      // 3. Малюємо учасників
      renderPublicMembers();

      // Завантажуємо інші дані
      const n = await apiFetch('/api/news'); if(n) renderNews(n);
      const g = await apiFetch('/api/gallery'); if(g) renderGallery(g);
      
      updateAuthUI();
      if(document.getElementById('year')) document.getElementById('year').textContent = new Date().getFullYear();
      
      // Запускаємо анімації
      setTimeout(activateScrollAnimations, 100);
  }

  function activateScrollAnimations() {
      const obs = new IntersectionObserver((entries, observer)=>{ 
          entries.forEach(entry => { 
              if(entry.isIntersecting){
                  entry.target.classList.add('animate');
                  observer.unobserve(entry.target);
              } 
          }); 
      },{threshold:0.1});

      document.querySelectorAll('.hero, .section, .card, .member').forEach(el=>obs.observe(el));
  }

  // --- RENDER FUNCTIONS ---
  function renderPublicMembers() {
      const g = document.getElementById('membersGrid');
      if(!g) return;

      g.innerHTML = members.map(m => {
          // Захист, якщо links не існує
          const discordLink = (m.links && m.links.discord) 
              ? `<div style="margin-top:10px; font-size:12px; color:#666;"><i class="fa-brands fa-discord"></i> ${m.links.discord}</div>` 
              : '';
          
          return `
            <div class="member">
                <div style="display:flex; justify-content:space-between; align-items:start;">
                    <h3>${m.name}</h3>
                    <div class="role-badge">${m.role}</div>
                </div>
                ${discordLink}
            </div>`;
      }).join('');
      
      // Оновлюємо анімації для нових елементів
      activateScrollAnimations();
  }

  function renderNews(l) { 
      const el = document.getElementById('newsList');
      if(el) el.innerHTML = l.map(n=>`<div class="card" style="margin-bottom:15px; padding:20px;"><b>${n.date}</b><h3>${n.title}</h3><p>${n.summary}</p></div>`).join(''); 
  }
  
  function renderGallery(l) { 
      const el = document.getElementById('galleryGrid');
      if(el) el.innerHTML = l.map(g=>`<div><img src="${g.url}" onclick="document.getElementById('lightbox').classList.add('show');document.getElementById('lightboxImage').src='${g.url}'"></div>`).join(''); 
  }
  
  window.renderLogs = () => { 
      const el = document.getElementById('systemLogsList');
      if(el) el.innerHTML = systemLogs.map(l=>`<div>${l}</div>`).join(''); 
  };
  
  window.clearLogs = () => { systemLogs=[]; localStorage.removeItem('barakuda_logs'); renderLogs(); };


  // --- DASHBOARD UI LOGIC ---
  const dashModal = document.getElementById('dashboardModal');
  
  // Mobile Sidebar
  const mobileToggle = document.getElementById('dashMobileToggle');
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('dashOverlay');

  if(mobileToggle && sidebar && overlay) {
      mobileToggle.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); });
      overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });
  }
  
  document.querySelectorAll('.dash-nav button').forEach(btn => {
      btn.addEventListener('click', () => {
          if(window.innerWidth <= 900 && sidebar) {
              sidebar.classList.remove('open');
              if(overlay) overlay.classList.remove('active');
          }
      });
  });

  window.switchDashTab = (tab) => {
      // Security check for Admin tabs
      if(['users', 'admin-members', 'logs'].includes(tab)) {
          if(!currentUser || currentUser.role !== 'admin') {
              showToast('Доступ заборонено. Тільки для ADMIN.', 'error');
              return;
          }
      }

      document.querySelectorAll('.dash-view').forEach(e => e.classList.remove('active'));
      document.querySelectorAll('.dash-nav button').forEach(e => e.classList.remove('active'));
      
      // Find button by onclick attribute (simple matching)
      const btns = Array.from(document.querySelectorAll('.dash-nav button'));
      const activeBtn = btns.find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${tab}'`));
      if(activeBtn) activeBtn.classList.add('active');
      
      const targetTab = document.getElementById(`tab-${tab}`);
      if(targetTab) targetTab.classList.add('active');
      
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
      if(dashModal) dashModal.classList.add('show');
      
      const uName = document.getElementById('dashUsername');
      const uRole = document.getElementById('dashRole');
      const pLogin = document.getElementById('pLogin');
      const pRole = document.getElementById('pRole');

      if(uName) uName.textContent = currentUser.username;
      if(uRole) uRole.textContent = currentUser.role;
      if(pLogin) pLogin.textContent = currentUser.username;
      if(pRole) pRole.textContent = currentUser.role.toUpperCase();

      // Show/Hide Nav based on Role
      const role = currentUser.role;
      const isStaff = ['admin', 'moderator', 'support'].includes(role);
      const isAdmin = role === 'admin';
      const isModOrAdmin = ['admin', 'moderator'].includes(role);

      const staffNav = document.querySelector('.staff-only-nav');
      const adminNav = document.querySelector('.admin-only-nav');
      const btnApps = document.getElementById('navAppsBtn');

      if(staffNav) staffNav.style.display = isStaff ? 'block' : 'none';
      if(adminNav) adminNav.style.display = isAdmin ? 'block' : 'none';
      if(btnApps) btnApps.style.display = isModOrAdmin ? 'flex' : 'none';

      switchDashTab('profile');
  }

  // --- ROLE MANAGEMENT (Admin) ---
  async function loadUsersAdmin() {
      const list = document.getElementById('adminUsersList');
      if(!list) return;
      list.innerHTML = '<div style="color:#666; padding:10px;">Завантаження...</div>';
      
      const users = await apiFetch('/api/users');
      
      if(!users || users.length === 0) {
          list.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">Користувачів немає</div>';
          return;
      }
      
      list.innerHTML = users.map(u => `
        <div class="u-row">
            <div style="display:flex; flex-direction:column;">
                <span style="font-size:16px; font-weight:bold; color:#fff;">${u.username}</span>
                <span style="font-size:12px; color:#666;">${u.role}</span>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
                <select onchange="window.changeUserRole('${u.username}', this.value)" 
                        style="margin:0; padding:5px; height:auto; width:auto; font-size:12px; background:#000; color:#fff; border:1px solid #333;">
                    <option value="member" ${u.role==='member'?'selected':''}>Member</option>
                    <option value="moderator" ${u.role==='moderator'?'selected':''}>Moderator</option>
                    <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                </select>
                <button class="btn btn-outline" style="padding:5px 10px; color:#e74c3c;" onclick="window.banUser('${u.username}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>`).join('');
  }
  
  window.changeUserRole = async (u, role) => {
      if(!currentUser || currentUser.role !== 'admin') return showToast('Тільки адмін', 'error');
      await apiFetch(`/api/users/${u}/role`, { method:'PUT', body: JSON.stringify({role}) });
      showToast('Роль змінено');
      addLog(`Role changed: ${u} -> ${role}`);
  };
  
  window.banUser = async (u) => customConfirm(`Видалити ${u}?`, async(r)=>{ 
      if(r) { await apiFetch(`/api/users/${u}`, {method:'DELETE'}); showToast('Deleted'); loadUsersAdmin(); }
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
      if(res && res.success) { showToast('Заявку надіслано'); checkMyApplication(); updateAuthUI(); }
  });

  async function checkMyApplication() {
      const apps = await apiFetch('/api/applications/my');
      const myApp = apps ? apps.find(a => a.submittedBy === currentUser.username) : null;
      const form = document.getElementById('dashAppForm');
      const statusBox = document.getElementById('applyStatusContainer');
      const statusText = document.getElementById('myAppStatus');
      
      if(myApp) {
          if(form) form.style.display = 'none';
          if(statusBox) statusBox.style.display = 'block';
          if(statusText) {
             statusText.textContent = myApp.status.toUpperCase();
             statusText.style.color = myApp.status==='approved' ? '#2ecc71' : (myApp.status==='rejected'?'#e74c3c':'var(--accent)');
          }
      } else {
          if(form) form.style.display = 'block';
          if(statusBox) statusBox.style.display = 'none';
      }
  }

  async function loadApplicationsStaff() {
      const list = document.getElementById('applicationsList');
      if(!list) return;
      const apps = await apiFetch('/api/applications');
      if(!apps || !apps.length) { list.innerHTML = '<div>Пусто</div>'; return; }
      
      list.innerHTML = apps.map(a => `
        <div class="app-card">
           <div class="app-header">
               <b>${a.rlNameAge}</b> <span class="status-badge ${a.status}">${a.status}</span>
           </div>
           <div style="font-size:12px; color:#aaa; margin-bottom:10px;">User: ${a.submittedBy}</div>
           <div style="font-size:13px; margin-bottom:10px;">${a.history}</div>
           <a href="${a.shootingVideo}" target="_blank" style="color:var(--accent);">Video Link</a>
           ${a.status==='pending' ? `
           <div style="margin-top:10px; display:flex; gap:10px;">
               <button class="btn btn-primary" onclick="window.updateAppStatus('${a.id}','approved')">Прийняти</button>
               <button class="btn btn-outline" onclick="window.updateAppStatus('${a.id}','rejected')">Відхилити</button>
           </div>` : ''}
        </div>`).join('');
  }
  
  window.updateAppStatus = async (id, status) => {
      await apiFetch(`/api/applications/${id}`, {method:'PUT', body:JSON.stringify({status})});
      showToast('Оновлено'); loadApplicationsStaff();
  };

  // --- AUTH UI ---
  async function updateAuthUI() {
      const applyText = document.getElementById('applyText');
      const applyBtn = document.getElementById('applyBtnMain');
      const authBtnText = document.getElementById('authBtnText');
      const openAuthBtn = document.getElementById('openAuthBtn');

      if(currentUser) {
          document.body.classList.add('is-logged-in');
          if(currentUser.role==='admin') document.body.classList.add('is-admin');
          if(authBtnText) authBtnText.textContent = 'Кабінет';
          if(openAuthBtn) openAuthBtn.onclick = window.openDashboard;

          if(applyText) applyText.style.display = 'none';
          if(applyBtn) {
               applyBtn.innerHTML = '<i class="fa-regular fa-id-card"></i> Відкрити панель';
               applyBtn.onclick = window.openDashboard;
          }
      } else {
          document.body.classList.remove('is-logged-in','is-admin');
          if(authBtnText) authBtnText.textContent = 'Вхід';
          if(openAuthBtn) openAuthBtn.onclick = ()=>document.getElementById('authModal').classList.add('show');
          
          if(applyText) applyText.style.display = 'block';
          if(applyBtn) {
              applyBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Увійти в кабінет';
              applyBtn.onclick = () => document.getElementById('openAuthBtn').click();
          }
      }
  }

  // GLOBAL LISTENERS
  document.getElementById('navToggle')?.addEventListener('click', ()=>document.getElementById('mainNav').classList.toggle('open'));
  document.getElementById('closeAuth')?.addEventListener('click', ()=>document.getElementById('authModal').classList.remove('show'));
  document.getElementById('closeDashBtn')?.addEventListener('click', ()=>dashModal?.classList.remove('show'));
  document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ removeCurrentUser(); location.reload(); });
  document.getElementById('lightboxCloseBtn')?.addEventListener('click', ()=>document.getElementById('lightbox').classList.remove('show'));
  
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  if(tabLogin && tabRegister) {
      tabLogin.addEventListener('click', (e)=>{ 
          e.target.classList.add('active'); tabRegister.classList.remove('active'); 
          document.getElementById('loginForm').style.display='block'; document.getElementById('registerForm').style.display='none'; 
      });
      tabRegister.addEventListener('click', (e)=>{ 
          e.target.classList.add('active'); tabLogin.classList.remove('active'); 
          document.getElementById('loginForm').style.display='none'; document.getElementById('registerForm').style.display='block'; 
      });
  }

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
      if(res && res.success) { showToast('Успіх! Увійдіть.'); document.getElementById('tabLogin').click(); }
  });

  // --- ADMIN MEMBERS MANAGEMENT ---
  async function loadAdminMembers() {
      const list = document.getElementById('adminMembersList');
      if(!list) return;
      const m = await apiFetch('/api/members');
      if(!m) { list.innerHTML = 'Помилка'; return; }
      list.innerHTML = m.map(x => `
        <div class="u-row">
            <div>${x.name} <small>(${x.role})</small></div>
            <button class="btn btn-outline" style="color:#d33; padding:5px 10px;" onclick="window.deleteMember('${x.id}')">DEL</button>
        </div>`).join('');
  }
  
  document.getElementById('openAdminAddMember')?.addEventListener('click', ()=>document.getElementById('adminAddMemberContainer').style.display='block');
  
  document.getElementById('adminAddMemberForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const body = { 
          name: document.getElementById('admName').value, 
          role: document.getElementById('admRole').value, 
          owner: document.getElementById('admOwner').value, 
          links: {discord:document.getElementById('admDiscord').value, youtube:document.getElementById('admYoutube').value} 
      };
      await apiFetch('/api/members', {method:'POST', body:JSON.stringify(body)});
      showToast('Учасника додано'); loadAdminMembers(); loadInitialData();
  });
  
  window.deleteMember = async (id) => customConfirm('Видалити?', async (r)=>{ 
      if(r) { await apiFetch(`/api/members/${id}`, {method:'DELETE'}); showToast('Видалено'); loadAdminMembers(); loadInitialData(); } 
  });

  // --- MY MEMBER TAB ---
  function loadMyMemberTab() {
      const container = document.getElementById('myMemberContainer');
      if(!container) return;
      // Якщо ми на "тестових даних", то персонажа не знайде
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
            
          const saveBtn = document.getElementById('saveStatusBtn');
          if(saveBtn) saveBtn.onclick=async()=>{
              let baseRole = myMember.role.split('|')[0].trim();
              let newStatus = document.getElementById('memberStatusSelect').value;
              let role = `${baseRole} | ${newStatus}`;
              await apiFetch(`/api/members/${myMember.id}`, {method:'PUT', body:JSON.stringify({role})});
              showToast('Статус оновлено'); loadInitialData(); loadMyMemberTab();
          };
      } else {
          container.innerHTML = `<p style="color:#aaa;">У вас ще немає персонажа в сім'ї.</p>`;
          const p = document.getElementById('myMemberStatusPanel');
          if(p) p.style.display='none';
      }
  }

  // --- INIT ---
  loadInitialData();
});
