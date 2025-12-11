document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
      const p = document.getElementById('preloader');
      if(p) { 
          p.style.opacity = '0'; 
          setTimeout(() => p.style.display='none', 500); 
          try { activateScrollAnimations(); } catch(e) { console.log('Animation error', e); }
      }
  }, 2000);

  const CURRENT_USER_KEY = 'barakuda_current_user';
  let members = [];
  let systemLogs = [];
  try {
      const storedLogs = localStorage.getItem('barakuda_logs');
      systemLogs = storedLogs ? JSON.parse(storedLogs) : [];
  } catch(e) { systemLogs = []; }

  // Видалено 'shop' з перекладів для чистоти, але можна і залишити
  const translations = {
    ua: {
        flag: "ua", label: "UKR",
        home: "ГОЛОВНА", about: "ІНФО", members: "СКЛАД", media: "МЕДІА", apply: "ВСТУП",
        login: "ВХІД", account: "АКАУНТ", hero_btn: "ПРИЄДНАТИСЬ", hero_members: "СКЛАД",
        about_title_span: "ХТО", about_title: "МИ Є", hero_lead: "ДОМІНУВАННЯ. СТИЛЬ. ДИСЦИПЛІНА.",
        about_main_desc: "BARRACUDA — це елітна сім'я та організація, що об'єднує гравців на провідних RP проектах. Ми граємо на різних серверах GTA V, поширюючи свій вплив та встановлюючи свої правила.<br><br>Ми — це більше, ніж просто клан. Це братерство, скріплене залізною дисципліною та амбіціями. Ми контролюємо ресурси, захоплюємо території та завжди прикриваємо спини один одному. Наша мета — абсолютна першість у кожному місті, куди ступає нога Барракуди.",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "ВЛАСНИК",
        members_title_span: "НАШ", members_title: "СКЛАД",
        news_title: "СТРІЧКА", news_title_span: "НОВИН",
        gallery_title: "ГАЛЕРЕЯ",
        join_system_title: "ПРИЄДНУЙСЯ ДО СИСТЕМИ", join_system_desc: "Авторизуйтесь, щоб отримати доступ до закритого розділу подачі заявок.",
        access_terminal: "ДОСТУП ДО ТЕРМІНАЛУ", footer: "BARRACUDA FAMILY. RP.",
        dash_label_personal: "Особисте", dash_nav_profile: "Профіль", dash_nav_my_member: "Мій Персонаж", dash_nav_apply: "Заявка в сім'ю", dash_nav_support: "Техпідтримка",
        dash_label_staff: "Персонал", dash_nav_apps: "Розгляд заявок", dash_nav_tickets: "Всі тікети",
        dash_label_admin: "Адміністратор", dash_nav_users: "Керування ролями", dash_nav_roster: "Редактор складу", dash_nav_db: "База даних", dash_nav_logs: "Логи", dash_nav_logout: "ЗАВЕРШИТИ СЕАНС",
        dash_profile_title: "Особистий кабінет", dash_secure_conn: "БЕЗПЕЧНЕ ПІДКЛЮЧЕННЯ ВСТАНОВЛЕНО",
        dash_stat_login: "ВАШ ЛОГІН", dash_stat_role: "РІВЕНЬ ДОСТУПУ",
        dash_sys_status: "Статус системи", dash_sys_ok: "Всі системи працюють у штатному режимі.",
        dash_char_settings: "Налаштування персонажа", dash_char_status: "Актуальний статус", dash_char_update: "ОНОВИТИ СТАТУС",
        dash_apply_header: "Подача заявки", dash_form_title: "АНКЕТА",
        dash_form_name: "1. Ваше реальне ім'я", dash_form_age: "2. Ваш вік", dash_form_online: "3. Середній онлайн (годин)", dash_form_fam: "4. В яких сім'ях бували", dash_form_hist: "5. Історія гри", dash_form_note: "6. Посилання на відкат / Коментар", dash_form_submit: "ВІДПРАВИТИ",
        ph_name: "Ім'я", ph_age: "Вік", ph_online: "5+ годин", ph_fam: "Назви сімей...", ph_hist: "Де грали...", ph_note: "YouTube або коментар",
        dash_support_header: "Технічна підтримка", dash_create_ticket: "Створити запит", dash_my_tickets: "Ваші запити", dash_ticket_btn: "ВІДКРИТИ ТІКЕТ",
        ph_ticket_title: "Коротко про проблему", ph_ticket_msg: "Опис ситуації...",
        auth_title: "СИСТЕМНИЙ ВХОД", auth_tab_login: "ВХІД", auth_tab_reg: "РЕЄСТРАЦІЯ", auth_btn_login: "УВІЙТИ", auth_btn_reg: "СТВОРИТИ АКАУНТ",
        ph_login: "Логин", ph_pass: "Пароль", ph_email: "Email", ph_pass_conf: "Підтвердіть пароль",
        modal_cancel: "СКАСУВАТИ", modal_confirm: "ПІДТВЕРДИТИ", modal_ok: "ЗРОЗУМІЛО",
        search_placeholder: "Пошук агента...", ticket_close_btn: "ЗАКРИТИ ТІКЕТ", ph_chat: "Повідомлення...", chat_send: "НАДІСЛАТИ",
        msg_access_denied: "ДОСТУП ЗАБОРОНЕНО", msg_welcome: "ВІТАЄМО", msg_error: "Помилка", msg_pass_mismatch: "ПАРОЛІ НЕ СПІВПАДАЮТЬ",
        msg_created_login: "СТВОРЕНО. БУДЬ ЛАСКА, УВІЙДІТЬ.", msg_app_sent: "ЗАЯВКУ ВІДПРАВЛЕНО", msg_updated: "ОНОВЛЕНО", msg_deleted: "ВИДАЛЕНО",
        msg_ticket_created: "ТІКЕТ СТВОРЕНО", msg_empty_list: "Список порожній", msg_confirm_ban: "ЗАБАНИТИ КОРИСТУВАЧА?", msg_confirm_delete: "Видалити учасника?",
        msg_member_added: "Учасника додано",
        lbl_candidate: "КАНДИДАТ", lbl_history: "ІСТОРІЯ", lbl_status: "СТАТУС", btn_approve: "ОК", btn_reject: "НІ", btn_delete: "ВИДАЛИТИ", btn_ban: "BAN"
    },
    // ... (інші мови аналогічно видалити shop)
  };

  function getTrans(key) {
      const lang = localStorage.getItem('barracuda_lang') || 'ua';
      return translations[lang]?.[key] || translations['ua']?.[key] || key;
  }

  // ЗМІНА МОВИ
  const langTrigger = document.getElementById('langTrigger');
  const langDropdown = document.getElementById('langDropdown');
  const currentFlagImg = document.getElementById('currentFlagImg');
  const currentLangLabel = document.getElementById('currentLangLabel');

  function changeLanguage(lang) {
      if(!translations[lang]) return;
      document.querySelectorAll('[data-lang]').forEach(el => {
          const key = el.getAttribute('data-lang');
          if (key === 'login') {
             const textEl = document.getElementById('authBtnText');
             if(textEl) textEl.textContent = currentUser ? translations[lang]['account'] : translations[lang]['login'];
          } else if (translations[lang][key]) {
              if(key === 'about_main_desc') el.innerHTML = translations[lang][key];
              else el.textContent = translations[lang][key];
          }
      });
      document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
          const key = el.getAttribute('data-lang-placeholder');
          if(translations[lang][key]) el.placeholder = translations[lang][key];
      });
      
      const flagCode = translations[lang].flag; 
      if(currentFlagImg) currentFlagImg.src = `https://flagcdn.com/w40/${flagCode}.png`;
      if(currentLangLabel) currentLangLabel.textContent = translations[lang].label;

      try { localStorage.setItem('barracuda_lang', lang); } catch(e){}
      document.querySelectorAll('.lang-option').forEach(opt => {
          opt.classList.remove('active');
          if(opt.getAttribute('data-lang') === lang) opt.classList.add('active');
      });
  }

  // --- ЛОГІКА ВЛАСНИКА (НОВА) ---
  const serverData = {
      stake: {
          title: "STAKE RP",
          promo: "/promo BH",
          discord: "https://discord.gg/Fe6nWT4qge"
      },
      chicago: {
          title: "MAJESTIC RP CHICAGO",
          promo: "/promo Obiez",
          discord: "https://discord.gg/GF3jwfrVne"
      },
      ny: {
          title: "MAJESTIC RP NEW YORK",
          promo: "/promo mcclem",
          discord: "https://discord.gg/rdrCcPMTeQ"
      }
  };

  window.showOwnerInfo = (serverKey) => {
      const data = serverData[serverKey];
      if(!data) return;

      document.getElementById('ownerModalTitle').textContent = data.title;
      document.getElementById('ownerPromo').textContent = data.promo;
      document.getElementById('ownerDiscordBtn').href = data.discord;

      document.getElementById('ownerInfoModal').classList.add('show');
  };


  // --- РЕШТА КОДУ ---
  
  function loadCurrentUser(){ try{ return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)); } catch(e){ return null; } }
  function saveCurrentUser(val){ try { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(val)); } catch(e){} }
  function removeCurrentUser(){ try { localStorage.removeItem(CURRENT_USER_KEY); } catch(e){} }
  
  window.showToast = (msg, type = 'success') => {
      const c = document.getElementById('toastContainer');
      if(!c) return;
      const t = document.createElement('div'); t.className = `toast ${type}`;
      t.innerHTML = `<span>${msg}</span>`; c.appendChild(t);
      setTimeout(() => { t.style.opacity='0'; setTimeout(()=>t.remove(),300); }, 3000);
  };
  
  function addLog(action) {
      systemLogs.unshift(`[${new Date().toLocaleTimeString()}] ${action}`);
      if(systemLogs.length>50) systemLogs.pop();
      try { localStorage.setItem('barakuda_logs', JSON.stringify(systemLogs)); } catch(e){}
      if(document.getElementById('tab-logs')?.classList.contains('active')) renderLogs();
  }
  
  function customConfirm(msg, cb) {
      const m=document.getElementById('customConfirmModal');
      if(!m) return;
      document.getElementById('confirmMessage').textContent=msg;
      const ok=document.getElementById('confirmOkBtn');
      document.getElementById('confirmCancelBtn').textContent = getTrans('modal_cancel');
      ok.textContent = getTrans('modal_confirm');
      m.classList.add('show');
      const clean=(r)=>{ m.classList.remove('show'); ok.onclick=null; if(cb)cb(r); };
      ok.onclick=()=>clean(true); 
      const cancel = document.getElementById('confirmCancelBtn');
      if(cancel) cancel.onclick=()=>clean(false);
  }

  let currentUser = loadCurrentUser(); 
  async function apiFetch(url, opts={}) {
      try {
          const h={'Content-Type':'application/json', ...(opts.headers||{})};
          const r = await fetch(url, {...opts, headers:h});
          const d = await r.json();
          if(!r.ok) { showToast(d.message||getTrans('msg_error'), 'error'); return null; }
          return d;
      } catch(e) { console.error(e); return null; }
  }

  async function loadInitialData() {
      try {
          const m = await apiFetch('/api/members'); if(m) { members=m; renderPublicMembers(); }
          const n = await apiFetch('/api/news'); if(n) renderNews(n);
          const g = await apiFetch('/api/gallery'); if(g) renderGallery(g);
          // Shop removed
          updateAuthUI();
          const yearEl = document.getElementById('year');
          if(yearEl) yearEl.textContent = new Date().getFullYear();
          
          if(langTrigger && langDropdown) {
              langTrigger.addEventListener('click', (e) => { e.stopPropagation(); langDropdown.classList.toggle('show'); });
              document.querySelectorAll('.lang-option').forEach(opt => {
                  opt.addEventListener('click', () => {
                      const selectedLang = opt.getAttribute('data-lang');
                      try { localStorage.setItem('barracuda_lang', selectedLang); } catch(e){}
                      location.reload();
                  });
              });
              document.addEventListener('click', (e) => { if(!langTrigger.contains(e.target) && !langDropdown.contains(e.target)) { langDropdown.classList.remove('show'); } });
              let savedLang = 'ua'; try { savedLang = localStorage.getItem('barracuda_lang') || 'ua'; } catch(e){}
              changeLanguage(savedLang);
          }
      } catch(e) { console.error("Init data load failed:", e); }
  }

  function activateScrollAnimations() {
      if (!window.IntersectionObserver) return;
      const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  entry.target.classList.add('animate-visible');
                  entry.target.classList.remove('animate-hidden');
                  if (entry.target.classList.contains('reveal-on-scroll')) { entry.target.classList.add('visible'); }
                  observer.unobserve(entry.target);
              }
          });
      }, { threshold: 0.1 });
      document.querySelectorAll('.hero, .section, .card, .member, .u-row, .app-card-ultra, .reveal-on-scroll, .about-main-text').forEach((el) => {
          if (!el.classList.contains('reveal-on-scroll')) { el.classList.add('animate-hidden'); }
          observer.observe(el);
      });
  }

  const dashModal = document.getElementById('dashboardModal');
  const mobileToggle = document.getElementById('dashMobileToggle');
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('dashOverlay');

  if(mobileToggle && sidebar && overlay) { mobileToggle.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); }); }
  if(overlay && sidebar) { overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); }); }

  window.switchDashTab = (tab) => {
      if(['users', 'admin-members', 'logs', 'accounts-data'].includes(tab)) {
          if(!currentUser || currentUser.role !== 'admin') { showToast(getTrans('msg_access_denied'), 'error'); return; }
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
      if(tab === 'accounts-data') loadAccountsData();
  };

  window.openDashboard = () => {
      if(!currentUser) return;
      if(dashModal) dashModal.classList.add('show');
      document.getElementById('dashUsername').textContent = currentUser.username;
      document.getElementById('dashRole').textContent = currentUser.role;
      document.getElementById('pLogin').textContent = currentUser.username;
      document.getElementById('pRole').textContent = currentUser.role.toUpperCase();

      const role = currentUser.role;
      const isAdmin = role === 'admin';
      const isStaff = ['admin', 'moderator', 'support'].includes(role);

      document.querySelector('.staff-only-nav').style.display = isStaff ? 'block' : 'none';
      document.querySelector('.admin-only-nav').style.display = isAdmin ? 'block' : 'none';
      switchDashTab('profile');
  }

  window.loadAccountsData = async () => { const tbody = document.getElementById('accountsDataTableBody'); if(!tbody) return; tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>'; const users = await apiFetch('/api/users'); if(!users || !users.length) { tbody.innerHTML = `<tr><td colspan="5">${getTrans('msg_empty_list')}</td></tr>`; return; } tbody.innerHTML = users.map(u => `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);"><td style="padding:10px;">${u.username}</td><td style="padding:10px;">${u.email}</td><td style="padding:10px; color:var(--accent);">${u.password || '***'}</td><td style="padding:10px;">${u.role}</td><td style="padding:10px;">${new Date(u.regDate).toLocaleDateString()}</td></tr>`).join(''); };
  async function loadUsersAdmin() { const list = document.getElementById('adminUsersList'); if (!list) return; const users = await apiFetch('/api/users'); if(!users || !users.length) { list.innerHTML = `<div>${getTrans('msg_empty_list')}</div>`; return; } list.innerHTML = users.map(u => `<div class="u-row animate-hidden"><div><b>${u.username}</b> <small>(${u.role})</small></div>${u.username === 'ADMIN 🦈' ? '' : `<select onchange="window.changeUserRole('${u.username}', this.value)" style="width:auto; padding:5px;"><option value="member" ${u.role==='member'?'selected':''}>Member</option><option value="admin" ${u.role==='admin'?'selected':''}>Admin</option></select> <button class="btn btn-outline" onclick="window.banUser('${u.username}')">X</button>`}</div>`).join(''); }
  window.changeUserRole = async (u, role) => { await apiFetch(`/api/users/${u}/role`, { method:'PUT', body: JSON.stringify({role}) }); showToast(getTrans('msg_updated')); loadUsersAdmin(); };
  window.banUser = async (u) => customConfirm(`${getTrans('msg_confirm_ban')} ${u}?`, async(r)=>{ if(r) { await apiFetch(`/api/users/${u}`, {method:'DELETE'}); showToast(getTrans('msg_deleted')); loadUsersAdmin(); } });
  
  const dashAppForm = document.getElementById('dashAppForm'); if(dashAppForm) { dashAppForm.addEventListener('submit', async (e)=>{ e.preventDefault(); const body = { rlName: document.getElementById('appRlName').value, age: document.getElementById('appAge').value, onlineTime: document.getElementById('appOnline').value, prevFamilies: document.getElementById('appFamilies').value, history: document.getElementById('appHistory').value, note: document.getElementById('appNote').value, submittedBy: currentUser.username }; const res = await apiFetch('/api/applications', {method:'POST', body:JSON.stringify(body)}); if(res && res.success) { showToast(getTrans('msg_app_sent')); dashAppForm.reset(); checkMyApplication(); } }); }
  async function checkMyApplication() { const apps = await apiFetch('/api/applications/my'); const myApp = apps ? apps.filter(a => a.submittedBy === currentUser.username).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null; const form = document.getElementById('dashAppForm'); const statusBox = document.getElementById('applyStatusContainer'); const container = document.querySelector('.compact-square-container'); if(myApp) { if(container) container.style.display='none'; if(form) form.style.display='none'; if(statusBox) { statusBox.style.display='block'; statusBox.className='glass-panel status-panel ' + myApp.status; statusBox.innerHTML = `<div class="status-header"><h2>${myApp.status.toUpperCase()}</h2></div>${myApp.adminComment ? `<div>${myApp.adminComment}</div>` : ''}`; } } else { if(container) container.style.display='block'; if(form) form.style.display='block'; if(statusBox) statusBox.style.display='none'; } }
  async function loadApplicationsStaff() { const list = document.getElementById('applicationsList'); if(!list) return; const apps = await apiFetch('/api/applications'); if(!apps || !apps.length) { list.innerHTML = `<div>${getTrans('msg_empty_list')}</div>`; return; } list.innerHTML = apps.map((a, i) => `<div class="app-card-ultra animate-hidden"><span class="app-id-badge">#${i+1}</span><div class="ultra-row"><span class="ultra-label">${getTrans('lbl_candidate')}</span> <b>${a.rlName}</b></div><div class="ultra-row"><span class="ultra-label">${getTrans('lbl_history')}</span> <div class="ultra-history">${a.history}</div></div>${a.status === 'pending' ? `<div class="ultra-input-group"><input id="reason-${a.id}" class="ultra-input" placeholder="Comms..."><button onclick="window.updateAppStatus('${a.id}','approved')">${getTrans('btn_approve')}</button><button onclick="window.updateAppStatus('${a.id}','rejected')">${getTrans('btn_reject')}</button></div>` : `<div>${getTrans('lbl_status')}: ${a.status} <button onclick="window.deleteApp('${a.id}')">${getTrans('btn_delete')}</button></div>`}</div>`).join(''); }
  window.updateAppStatus = async (id, status) => { const input = document.getElementById(`reason-${id}`); await apiFetch(`/api/applications/${id}`, {method:'PUT', body:JSON.stringify({status, adminComment: input?input.value:''})}); showToast(getTrans('msg_updated')); loadApplicationsStaff(); };
  window.deleteApp = async (id) => { await apiFetch(`/api/applications/${id}`, { method: 'DELETE' }); showToast(getTrans('msg_deleted')); loadApplicationsStaff(); };
  const ticketForm = document.getElementById('createTicketForm'); if(ticketForm) { ticketForm.addEventListener('submit', async (e)=>{ e.preventDefault(); const body = { author: currentUser.username, title: document.getElementById('ticketTitle').value, messages: [{ sender: currentUser.username, text: document.getElementById('ticketMessage').value, isStaff: false }] }; const res = await apiFetch('/api/tickets', {method:'POST', body:JSON.stringify(body)}); if(res && res.success) { showToast(getTrans('msg_ticket_created')); ticketForm.reset(); loadMyTickets(); } }); }
  async function loadMyTickets() { const list = document.getElementById('myTicketsList'); if(!list) return; const all = await apiFetch('/api/tickets'); const my = all ? all.filter(t => t.author === currentUser.username) : []; list.innerHTML = my.map(t => `<div class="ticket-card-ultra ${t.status}" onclick="window.openTicket('${t.id}')"><b>${t.title}</b> <span class="status-tag ${t.status}">${t.status}</span></div>`).join(''); }
  async function loadAllTickets() { const list = document.getElementById('allTicketsList'); if(!list) return; const all = await apiFetch('/api/tickets'); list.innerHTML = all ? all.map(t => `<div class="ticket-card-ultra ${t.status}" onclick="window.openTicket('${t.id}')"><b>${t.author}: ${t.title}</b> <span class="status-tag ${t.status}">${t.status}</span></div>`).join('') : ''; }
  let currentTicketId = null;
  window.openTicket = async (id) => { currentTicketId = id; const all = await apiFetch('/api/tickets'); const t = all.find(x => x.id === id); if(!t) return; document.getElementById('ticketModal').classList.add('show'); document.getElementById('tmTitle').textContent = t.title; document.getElementById('tmMessages').innerHTML = t.messages.map(m => `<div class="msg ${m.sender===currentUser.username?'me':'other'}"><b>${m.sender}</b>: ${m.text}</div>`).join(''); document.getElementById('tmCloseTicketBtn').onclick = async () => { await apiFetch(`/api/tickets/${id}`, { method:'PUT', body: JSON.stringify({ status: 'closed' }) }); document.getElementById('ticketModal').classList.remove('show'); loadMyTickets(); loadAllTickets(); }; };
  document.getElementById('tmSendBtn')?.addEventListener('click', async () => { if(!currentTicketId) return; const txt = document.getElementById('tmInput').value; if(!txt) return; await apiFetch(`/api/tickets/${currentTicketId}`, { method:'PUT', body: JSON.stringify({ message: { sender: currentUser.username, text: txt, isStaff: ['admin','moderator'].includes(currentUser.role) } }) }); document.getElementById('tmInput').value = ''; window.openTicket(currentTicketId); });
  async function updateAuthUI() { const applyText = document.getElementById('applyText'); const applyBtn = document.getElementById('applyBtnMain'); let currentLang = 'ua'; try { currentLang = localStorage.getItem('barracuda_lang') || 'ua'; } catch(e){} const btnLabel = translations[currentLang] || translations['ua']; const authBtnText = document.getElementById('authBtnText'); if(currentUser) { document.body.classList.add('is-logged-in'); if(currentUser.role==='admin') document.body.classList.add('is-admin'); if(authBtnText) authBtnText.textContent = btnLabel.account; document.getElementById('openAuthBtn').onclick = window.openDashboard; if(applyText) applyText.style.display = 'none'; if(applyBtn) { applyBtn.innerHTML = '<i class="fa-solid fa-file-signature"></i> <span data-lang="apply">' + btnLabel.apply + '</span>'; applyBtn.onclick = () => { window.openDashboard(); window.switchDashTab('apply'); }; } } else { document.body.classList.remove('is-logged-in','is-admin'); if(authBtnText) authBtnText.textContent = btnLabel.login; document.getElementById('openAuthBtn').onclick = ()=>document.getElementById('authModal').classList.add('show'); if(applyText) applyText.style.display = 'block'; if(applyBtn) { applyBtn.innerHTML = '<i class="fa-solid fa-file-signature"></i> <span data-lang="access_terminal">' + btnLabel.access_terminal + '</span>'; applyBtn.onclick = ()=>document.getElementById('openAuthBtn').click(); } } }
  document.getElementById('navToggle')?.addEventListener('click', ()=>document.getElementById('mainNav').classList.toggle('open')); document.getElementById('closeAuth')?.addEventListener('click', ()=>document.getElementById('authModal').classList.remove('show')); if(dashModal) document.getElementById('closeDashBtn')?.addEventListener('click', ()=>dashModal.classList.remove('show')); document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ removeCurrentUser(); location.reload(); }); document.getElementById('lightboxCloseBtn')?.addEventListener('click', ()=>document.getElementById('lightbox').classList.remove('show')); document.getElementById('tabLogin')?.addEventListener('click', (e)=>{ e.target.classList.add('active'); document.getElementById('tabRegister').classList.remove('active'); document.getElementById('loginForm').style.display='block'; document.getElementById('registerForm').style.display='none'; }); document.getElementById('tabRegister')?.addEventListener('click', (e)=>{ e.target.classList.add('active'); document.getElementById('tabLogin').classList.remove('active'); document.getElementById('loginForm').style.display='none'; document.getElementById('registerForm').style.display='block'; }); document.getElementById('loginForm')?.addEventListener('submit', async (e)=>{ e.preventDefault(); const res = await apiFetch('/api/auth/login', { method:'POST', body: JSON.stringify({ username: document.getElementById('loginUser').value, password: document.getElementById('loginPass').value }) }); if(res && res.success) { saveCurrentUser(res.user); showToast(`${getTrans('msg_welcome')}, ${res.user.username}`); setTimeout(()=>location.reload(), 500); } }); document.getElementById('registerForm')?.addEventListener('submit', async (e)=>{ e.preventDefault(); const pass = document.getElementById('regPass').value; if(pass !== document.getElementById('regPassConfirm').value) return showToast(getTrans('msg_pass_mismatch'), 'error'); const res = await apiFetch('/api/auth/register', { method:'POST', body: JSON.stringify({ username: document.getElementById('regUser').value, email: document.getElementById('regEmail').value, password: pass }) }); if(res && res.success) { showToast(getTrans('msg_created_login')); document.getElementById('tabLogin').click(); } });
  document.getElementById('openAdminAddMember')?.addEventListener('click', ()=>document.getElementById('adminAddMemberContainer').style.display='block'); document.getElementById('adminAddMemberForm')?.addEventListener('submit', async (e)=>{ e.preventDefault(); const body = { name: document.getElementById('admName').value, role: document.getElementById('admRole').value, owner: document.getElementById('admOwner').value, links: {discord:document.getElementById('admDiscord').value, youtube:document.getElementById('admYoutube').value} }; await apiFetch('/api/members', {method:'POST', body:JSON.stringify(body)}); showToast(getTrans('msg_member_added')); loadAdminMembers(); }); async function loadAdminMembers() { const list = document.getElementById('adminMembersList'); if(!list) return; const m = await apiFetch('/api/members'); if(!m || m.length === 0) { list.innerHTML = `<div>${getTrans('msg_empty_list')}</div>`; return; } list.innerHTML = m.map(x => `<div class="u-row animate-hidden"><div>${x.name} <small>(${x.role})</small></div><button class="btn btn-outline" onclick="window.deleteMember('${x.id}')">${getTrans('btn_delete')}</button></div>`).join(''); } window.deleteMember = async (id) => customConfirm(getTrans('msg_confirm_delete'), async (r)=>{ if(r) { await apiFetch(`/api/members/${id}`, {method:'DELETE'}); showToast(getTrans('msg_deleted')); loadAdminMembers(); loadInitialData(); } });
  function loadMyMemberTab() { const container = document.getElementById('myMemberContainer'); if(!container) return; const myMember = members.find(m => m.owner === currentUser.username); const statusPanel = document.getElementById('myMemberStatusPanel'); if(myMember) { if(statusPanel) statusPanel.style.display='block'; container.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><div><h3 style="margin:0 0 5px 0;">${myMember.name}</h3><div style="font-size:12px; color:#888;">РАНГ: <span style="color:#fff">${myMember.role}</span></div></div><div class="dash-avatar"><i class="fa-solid fa-user-shield"></i></div></div>`; const saveBtn = document.getElementById('saveStatusBtn'); if(saveBtn) { saveBtn.onclick=async()=>{ let role = myMember.role.split(' | ')[0] + ' | ' + document.getElementById('memberStatusSelect').value; await apiFetch(`/api/members/${myMember.id}`, {method:'PUT', body:JSON.stringify({role})}); showToast(getTrans('msg_updated')); loadInitialData(); loadMyMemberTab(); }; } } else { container.innerHTML = `<p style="color:#aaa;">ПЕРСОНАЖА НЕ ЗНАЙДЕНО.</p>`; if(statusPanel) statusPanel.style.display='none'; } }
  function renderPublicMembers() { const g = document.getElementById('membersGrid'); if(!g || !members.length) { if(g) g.innerHTML = `<div>${getTrans('msg_empty_list')}</div>`; return; } g.innerHTML = members.map(m=>`<div class="member glass animate-hidden"><h3>${m.name}</h3><div class="role-badge">${m.role}</div>${m.links.discord?`<div style="margin-top:10px; font-size:12px; color:#aaa;">${m.links.discord}</div>`:''}</div>`).join(''); activateScrollAnimations(); }
  function renderNews(l) { const c = document.getElementById('newsList'); if(c) { c.innerHTML = l.map(n=>`<div class="card glass animate-hidden"><b>${n.date}</b><h3>${n.title}</h3><p>${n.summary}</p></div>`).join(''); activateScrollAnimations(); } }
  function renderGallery(l) { const g = document.getElementById('galleryGrid'); if(g) { g.innerHTML = l.map(g=>`<div class="glass animate-hidden" style="padding:5px;"><img src="${g.url}" onclick="document.getElementById('lightbox').classList.add('show');document.getElementById('lightboxImage').src='${g.url}'"></div>`).join(''); activateScrollAnimations(); } }
  window.renderLogs = () => { const l = document.getElementById('systemLogsList'); if(l) l.innerHTML = systemLogs.map(l=>`<div>${l}</div>`).join(''); };
  window.clearLogs = () => { systemLogs=[]; try { localStorage.removeItem('barakuda_logs'); } catch(e){} renderLogs(); };
  window.closeCyberModal = () => { const modal = document.getElementById('cyberModal'); if (modal) modal.classList.remove('active'); }; const cyberModal = document.getElementById('cyberModal'); if (cyberModal) { cyberModal.addEventListener('click', (e) => { if (e.target.classList.contains('cyber-modal-overlay')) closeCyberModal(); }); } document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCyberModal(); });
  loadInitialData();
});
