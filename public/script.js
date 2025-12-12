document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
      const p = document.getElementById('preloader');
      if(p) { p.style.opacity = '0'; setTimeout(() => p.style.display='none', 500); try { activateScrollAnimations(); } catch(e) {} }
  }, 2000);

  const CURRENT_USER_KEY = 'barakuda_current_user';
  let members = [];
  let systemLogs = [];
  try { systemLogs = JSON.parse(localStorage.getItem('barakuda_logs')) || []; } catch(e) { systemLogs = []; }

  // ПОВНИЙ СЛОВНИК ПЕРЕКЛАДІВ
  const translations = {
    ua: {
        flag: "ua", label: "UKR",
        home: "ГОЛОВНА", about: "ІНФО", members: "СКЛАД", gallery: "ГАЛЕРЕЯ", videos: "МЕДІЙКИ", apply: "ВСТУП",
        login: "ВХІД", account: "АКАУНТ", 
        hero_btn: "ПРИЄДНАТИСЬ", hero_members: "СКЛАД",
        owner_label: "ВЛАСНИК СІМ'Ї:",
        about_title_span: "ХТО", about_title: "МИ Є", 
        about_main_desc: "BARRACUDA — це елітна сім'я та організація...",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "ВЛАСНИК",
        members_title_span: "НАШ", members_title: "СКЛАД",
        news_title: "СТРІЧКА", news_title_span: "НОВИН",
        gallery_title: "ГАЛЕРЕЯ", videos_title: "МЕДІЙКИ",
        join_system_title: "ПРИЄДНУЙСЯ ДО СИСТЕМИ", join_system_desc: "Авторизуйтесь, щоб отримати доступ...",
        access_terminal: "ДОСТУП ДО ТЕРМІНАЛУ", footer: "BARRACUDA FAMILY. RP.",
        modal_promo_label: "PROMO CODE", modal_close: "ЗАКРИТИ",
        dash_profile_title: "Особистий кабінет", dash_stat_login: "ВАШ ЛОГІН", dash_stat_role: "РІВЕНЬ ДОСТУПУ",
        dash_sys_status: "Статус системи", dash_sys_ok: "Всі системи працюють нормально.",
        dash_char_settings: "Налаштування персонажа", dash_char_status: "Актуальний статус", dash_char_update: "ОНОВИТИ СТАТУС",
        dash_apply_header: "Подача заявки", dash_form_title: "АНКЕТА", dash_form_submit: "ВІДПРАВИТИ",
        dash_support_header: "Технічна підтримка", dash_create_ticket: "Створити запит", dash_my_tickets: "Ваші запити", dash_ticket_btn: "ВІДКРИТИ ТІКЕТ",
        auth_title: "СИСТЕМНИЙ ВХІД", auth_btn_login: "ВХІД", auth_btn_reg: "СТВОРИТИ АКАУНТ",
        msg_welcome: "ВІТАЄМО", msg_error: "Помилка", msg_access_denied: "ДОСТУП ЗАБОРОНЕНО"
    },
    en: {
        flag: "gb", label: "ENG",
        home: "HOME", about: "INFO", members: "ROSTER", gallery: "GALLERY", videos: "MEDIA", apply: "APPLY",
        login: "LOGIN", account: "ACCOUNT", 
        hero_btn: "JOIN US", hero_members: "ROSTER",
        owner_label: "FAMILY OWNER:",
        about_title_span: "WHO", about_title: "WE ARE",
        about_main_desc: "BARRACUDA is an elite family and organization...",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "OWNER",
        members_title_span: "OUR", members_title: "ROSTER",
        news_title: "NEWS", news_title_span: "FEED",
        gallery_title: "GALLERY", videos_title: "MEDIA",
        join_system_title: "JOIN THE SYSTEM", join_system_desc: "Authorize to access restricted area...",
        access_terminal: "ACCESS TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        modal_promo_label: "PROMO CODE", modal_close: "CLOSE",
        dash_profile_title: "Personal Cabinet", dash_stat_login: "YOUR LOGIN", dash_stat_role: "ACCESS LEVEL",
        dash_sys_status: "System Status", dash_sys_ok: "All systems operational.",
        dash_char_settings: "Character Settings", dash_char_status: "Current Status", dash_char_update: "UPDATE STATUS",
        dash_apply_header: "Application", dash_form_title: "FORM", dash_form_submit: "SUBMIT",
        dash_support_header: "Tech Support", dash_create_ticket: "Create Ticket", dash_my_tickets: "Your Tickets", dash_ticket_btn: "OPEN TICKET",
        auth_title: "SYSTEM LOGIN", auth_btn_login: "ENTER", auth_btn_reg: "CREATE ACCOUNT",
        msg_welcome: "WELCOME", msg_error: "Error", msg_access_denied: "ACCESS DENIED"
    },
    ru: {
        flag: "ru", label: "RUS",
        home: "ГЛАВНАЯ", about: "ИНФО", members: "СОСТАВ", gallery: "ГАЛЕРЕЯ", videos: "МЕДИА", apply: "ВСТУПИТЬ",
        login: "ВХОД", account: "АККАУНТ",
        hero_btn: "ПРИСОЕДИНИТЬСЯ", hero_members: "СОСТАВ",
        owner_label: "ВЛАДЕЛЕЦ СЕМЬИ:",
        about_title_span: "КТО", about_title: "МЫ ЕСТЬ",
        about_main_desc: "BARRACUDA — это элитная семья и организация...",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "ВЛАДЕЛЕЦ",
        members_title_span: "НАШ", members_title: "СОСТАВ",
        news_title: "ЛЕНТА", news_title_span: "НОВОСТЕЙ",
        gallery_title: "ГАЛЕРЕЯ", videos_title: "МЕДИА",
        join_system_title: "ПРИСОЕДИНЯЙСЯ К СИСТЕМЕ", join_system_desc: "Авторизуйтесь для доступа...",
        access_terminal: "ДОСТУП К ТЕРМИНАЛУ", footer: "BARRACUDA FAMILY. RP.",
        modal_promo_label: "PROMO CODE", modal_close: "ЗАКРЫТЬ",
        dash_profile_title: "Личный кабинет", dash_stat_login: "ВАШ ЛОГИН", dash_stat_role: "УРОВЕНЬ ДОСТУПА",
        dash_sys_status: "Статус системы", dash_sys_ok: "Все системы работают штатно.",
        dash_char_settings: "Настройки персонажа", dash_char_status: "Текущий статус", dash_char_update: "ОБНОВИТЬ СТАТУС",
        dash_apply_header: "Подача заявки", dash_form_title: "АНКЕТА", dash_form_submit: "ОТПРАВИТЬ",
        dash_support_header: "Техподдержка", dash_create_ticket: "Создать запрос", dash_my_tickets: "Ваши запросы", dash_ticket_btn: "ОТКРЫТЬ ТИКЕТ",
        auth_title: "СИСТЕМНЫЙ ВХОД", auth_btn_login: "ВОЙТИ", auth_btn_reg: "СОЗДАТЬ АККАУНТ",
        msg_welcome: "ДОБРО ПОЖАЛОВАТЬ", msg_error: "Ошибка", msg_access_denied: "ДОСТУП ЗАПРЕЩЕН"
    },
    pl: {
        flag: "pl", label: "POL",
        home: "GŁÓWNA", about: "INFO", members: "SKŁAD", gallery: "GALERIA", videos: "MEDIA", apply: "REKRUTACJA",
        login: "LOGOWANIE", account: "KONTO",
        hero_btn: "DOŁĄCZ", hero_members: "SKŁAD",
        owner_label: "WŁAŚCICIEL RODZINY:",
        about_title_span: "KIM", about_title: "JESTEŚMY",
        about_main_desc: "BARRACUDA to elitarna rodzina i organizacja...",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "WŁAŚCICIEL",
        members_title_span: "NASZ", members_title: "SKŁAD",
        news_title: "AKTUALNOŚCI", news_title_span: "FEED",
        gallery_title: "GALERIA", videos_title: "MEDIA",
        join_system_title: "DOŁĄCZ DO SYSTEMU", join_system_desc: "Zaloguj się aby uzyskać dostęp...",
        access_terminal: "DOSTĘP DO TERMINALA", footer: "BARRACUDA FAMILY. RP.",
        modal_promo_label: "KOD PROMOCYJNY", modal_close: "ZAMKNIJ",
        dash_profile_title: "Gabinet Osobisty", dash_stat_login: "TWÓJ LOGIN", dash_stat_role: "POZIOM DOSTĘPU",
        dash_sys_status: "Status Systemu", dash_sys_ok: "Wszystkie systemy działają poprawnie.",
        dash_char_settings: "Ustawienia Postaci", dash_char_status: "Aktualny Status", dash_char_update: "AKTUALIZUJ STATUS",
        dash_apply_header: "Podanie", dash_form_title: "FORMULARZ", dash_form_submit: "WYŚLIJ",
        dash_support_header: "Wsparcie Techniczne", dash_create_ticket: "Utwórz Zgłoszenie", dash_my_tickets: "Twoje Zgłoszenia", dash_ticket_btn: "OTWÓRZ TICKET",
        auth_title: "LOGOWANIE SYSTEMOWE", auth_btn_login: "ZALOGUJ", auth_btn_reg: "UTWÓRZ KONTO",
        msg_welcome: "WITAJ", msg_error: "Błąd", msg_access_denied: "ODMOWA DOSTĘPU"
    },
    de: {
        flag: "de", label: "DEU",
        home: "STARTSEITE", about: "INFO", members: "TEAM", gallery: "GALERIE", videos: "MEDIEN", apply: "BEWERBEN",
        login: "ANMELDEN", account: "KONTO",
        hero_btn: "BEITRETEN", hero_members: "TEAM",
        owner_label: "FAMILIENBESITZER:",
        about_title_span: "WER", about_title: "WIR SIND",
        about_main_desc: "BARRACUDA ist eine Elite-Familie...",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "BESITZER",
        members_title_span: "UNSER", members_title: "TEAM",
        news_title: "NEWS", news_title_span: "FEED",
        gallery_title: "GALERIE", videos_title: "MEDIEN",
        join_system_title: "TRITT DEM SYSTEM BEI", join_system_desc: "Anmelden für Zugriff...",
        access_terminal: "ZUGRIFF AUF TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        modal_promo_label: "PROMO-CODE", modal_close: "SCHLIESSEN",
        dash_profile_title: "Persönliches Kabinett", dash_stat_login: "DEIN LOGIN", dash_stat_role: "ZUGRIFFSEBENE",
        dash_sys_status: "Systemstatus", dash_sys_ok: "Alle Systeme normal.",
        dash_char_settings: "Charaktereinstellungen", dash_char_status: "Aktueller Status", dash_char_update: "STATUS AKTUALISIEREN",
        dash_apply_header: "Bewerbung", dash_form_title: "FORMULAR", dash_form_submit: "ABSENDEN",
        dash_support_header: "Support", dash_create_ticket: "Ticket erstellen", dash_my_tickets: "Ihre Tickets", dash_ticket_btn: "TICKET ÖFFNEN",
        auth_title: "SYSTEM LOGIN", auth_btn_login: "EINTRETEN", auth_btn_reg: "KONTO ERSTELLEN",
        msg_welcome: "WILLKOMMEN", msg_error: "Fehler", msg_access_denied: "ZUGRIFF VERWEIGERT"
    },
    es: {
        flag: "es", label: "ESP",
        home: "INICIO", about: "INFO", members: "EQUIPO", gallery: "GALERÍA", videos: "MEDIOS", apply: "APLICAR",
        login: "ACCESO", account: "CUENTA",
        hero_btn: "ÚNETE", hero_members: "MIEMBROS",
        owner_label: "DUEÑO DE FAMILIA:",
        about_title_span: "QUIÉNES", about_title: "SOMOS",
        about_main_desc: "BARRACUDA es una familia de élite...",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "DUEÑO",
        members_title_span: "NUESTRO", members_title: "EQUIPO",
        news_title: "NOTICIAS", news_title_span: "FEED",
        gallery_title: "GALERÍA", videos_title: "MEDIOS",
        join_system_title: "ÚNETE AL SISTEMA", join_system_desc: "Autorízate para acceder...",
        access_terminal: "ACCESO A LA TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        modal_promo_label: "CÓDIGO PROMO", modal_close: "CERRAR",
        dash_profile_title: "Gabinete Personal", dash_stat_login: "TU LOGIN", dash_stat_role: "NIVEL DE ACCESO",
        dash_sys_status: "Estado del Sistema", dash_sys_ok: "Sistemas operativos.",
        dash_char_settings: "Ajustes de Personaje", dash_char_status: "Estado Actual", dash_char_update: "ACTUALIZAR ESTADO",
        dash_apply_header: "Aplicación", dash_form_title: "FORMULARIO", dash_form_submit: "ENVIAR",
        dash_support_header: "Soporte", dash_create_ticket: "Crear Ticket", dash_my_tickets: "Tus Tickets", dash_ticket_btn: "ABRIR TICKET",
        auth_title: "LOGIN SISTEMA", auth_btn_login: "ENTRAR", auth_btn_reg: "CREAR CUENTA",
        msg_welcome: "BIENVENIDO", msg_error: "Error", msg_access_denied: "ACCESO DENEGADO"
    },
    pt: {
        flag: "br", label: "POR",
        home: "INÍCIO", about: "INFO", members: "MEMBROS", gallery: "GALERIA", videos: "MÍDIA", apply: "APLICAR",
        login: "LOGIN", account: "CONTA",
        hero_btn: "JUNTAR-SE", hero_members: "MEMBROS",
        owner_label: "DONO DA FAMÍLIA:",
        about_title_span: "QUEM", about_title: "SOMOS",
        about_main_desc: "BARRACUDA é uma família de elite...",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "DONO",
        members_title_span: "NOSSO", members_title: "TIME",
        news_title: "NOTÍCIAS", news_title_span: "FEED",
        gallery_title: "GALERIA", videos_title: "MÍDIA",
        join_system_title: "JUNTE-SE AO SISTEMA", join_system_desc: "Autorize-se para acessar...",
        access_terminal: "ACESSO AO TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        modal_promo_label: "CÓDIGO PROMOCIONAL", modal_close: "FECHAR",
        dash_profile_title: "Gabinete Pessoal", dash_stat_login: "SEU LOGIN", dash_stat_role: "NÍVEL DE ACESSO",
        dash_sys_status: "Status do Sistema", dash_sys_ok: "Sistemas operacionais.",
        dash_char_settings: "Configurações", dash_char_status: "Status Atual", dash_char_update: "ATUALIZAR STATUS",
        dash_apply_header: "Aplicação", dash_form_title: "FORMULÁRIO", dash_form_submit: "ENVIAR",
        dash_support_header: "Suporte", dash_create_ticket: "Criar Ticket", dash_my_tickets: "Seus Tickets", dash_ticket_btn: "ABRIR TICKET",
        auth_title: "LOGIN DO SISTEMA", auth_btn_login: "ENTRAR", auth_btn_reg: "CRIAR CONTA",
        msg_welcome: "BEM-VINDO", msg_error: "Erro", msg_access_denied: "ACESSO NEGADO"
    }
  };

  function getTrans(key) {
      const lang = localStorage.getItem('barracuda_lang') || 'ua';
      return translations[lang]?.[key] || translations['ua']?.[key] || key;
  }

  // --- МОВА ---
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

  // --- ДАНІ СЕРВЕРІВ ---
  const serverData = {
      stake: { title: "STAKE RP", promo: "/promo BH", discord: "https://discord.gg/Fe6nWT4qge" },
      chicago: { title: "MAJESTIC RP CHICAGO", promo: "/promo Obiez", discord: "https://discord.gg/GF3jwfrVne" },
      ny: { title: "MAJESTIC RP NEW YORK", promo: "/promo mcclem", discord: "https://discord.gg/rdrCcPMTeQ" }
  };
  window.showOwnerInfo = (serverKey) => {
      const data = serverData[serverKey];
      if(!data) return;
      document.getElementById('ownerModalTitle').textContent = data.title;
      document.getElementById('ownerPromo').textContent = data.promo;
      document.getElementById('ownerDiscordBtn').href = data.discord;
      document.getElementById('ownerInfoModal').classList.add('show');
  };

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
      const m = await apiFetch('/api/members'); if(m) { members=m; renderPublicMembers(); }
      const n = await apiFetch('/api/news'); if(n) renderNews(n);
      const g = await apiFetch('/api/gallery'); if(g) renderGallery(g);
      const v = await apiFetch('/api/videos'); if(v) renderVideos(v);
      updateAuthUI();
      if(langTrigger) {
          langTrigger.onclick = (e) => { e.stopPropagation(); langDropdown.classList.toggle('show'); };
          document.querySelectorAll('.lang-option').forEach(opt => {
              opt.onclick = () => { changeLanguage(opt.getAttribute('data-lang')); location.reload(); };
          });
          document.onclick = (e) => { if(!langTrigger.contains(e.target)) langDropdown.classList.remove('show'); };
          changeLanguage(localStorage.getItem('barracuda_lang') || 'ua');
      }
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
      document.querySelectorAll('.hero, .section, .card, .member, .glass-panel').forEach(el => {
          el.classList.add('animate-hidden'); observer.observe(el);
      });
  }

  // DASHBOARD LOGIC
  const dashModal = document.getElementById('dashboardModal');
  const mobileToggle = document.getElementById('dashMobileToggle');
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('dashOverlay');
  if(mobileToggle) mobileToggle.onclick = () => { sidebar.classList.add('open'); overlay.classList.add('active'); };
  if(overlay) overlay.onclick = () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); };

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
      if(tab === 'my-member') loadMyMemberTab();
      if(tab === 'accounts-data') loadAccountsData();
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
      switchDashTab('profile');
  }

  // --- API CALLS ---
  window.loadAccountsData = async () => { 
      const tbody = document.getElementById('accountsDataTableBody'); 
      const users = await apiFetch('/api/users'); 
      tbody.innerHTML = users.map(u => `<tr><td>${u.username}</td><td>${u.email}</td><td>***</td><td>${u.role}</td><td>${new Date(u.regDate).toLocaleDateString()}</td></tr>`).join(''); 
  };
  async function loadUsersAdmin() { 
      const list = document.getElementById('adminUsersList'); 
      const users = await apiFetch('/api/users'); 
      list.innerHTML = users.map(u => `<div class="u-row animate-hidden"><div><b>${u.username}</b> <small>(${u.role})</small></div>${u.username === 'admin' ? '' : `<select onchange="window.changeUserRole('${u.username}', this.value)" style="width:auto; padding:5px;"><option value="member" ${u.role==='member'?'selected':''}>Member</option><option value="admin" ${u.role==='admin'?'selected':''}>Admin</option></select> <button class="btn btn-outline" onclick="window.banUser('${u.username}')">X</button>`}</div>`).join(''); 
  }
  window.changeUserRole = async (u, role) => { await apiFetch(`/api/users/${u}/role`, { method:'PUT', body: JSON.stringify({role}) }); showToast(getTrans('msg_updated')); };
  window.banUser = async (u) => { if(confirm(`${getTrans('msg_confirm_ban')} ${u}?`)) { await apiFetch(`/api/users/${u}`, {method:'DELETE'}); showToast('Deleted'); loadUsersAdmin(); } };
  
  const dashAppForm = document.getElementById('dashAppForm'); 
  if(dashAppForm) { 
      dashAppForm.addEventListener('submit', async (e)=>{ 
          e.preventDefault(); 
          const body = { rlName: document.getElementById('appRlName').value, age: document.getElementById('appAge').value, onlineTime: document.getElementById('appOnline').value, prevFamilies: document.getElementById('appFamilies').value, history: document.getElementById('appHistory').value, note: document.getElementById('appNote').value, submittedBy: currentUser.username }; 
          await apiFetch('/api/applications', {method:'POST', body:JSON.stringify(body)}); 
          showToast(getTrans('msg_app_sent')); dashAppForm.reset(); checkMyApplication(); 
      }); 
  }
  async function checkMyApplication() { 
      const apps = await apiFetch('/api/applications/my'); 
      const myApp = apps ? apps.filter(a => a.submittedBy === currentUser.username).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null; 
      const statusBox = document.getElementById('applyStatusContainer'); 
      const container = document.querySelector('.compact-square-container'); 
      if(myApp) { 
          container.style.display='none'; 
          statusBox.style.display='block'; 
          statusBox.innerHTML = `<div class="status-header"><h2>${myApp.status.toUpperCase()}</h2></div>${myApp.adminComment ? `<div>${myApp.adminComment}</div>` : ''}`; 
      } else { 
          container.style.display='block'; statusBox.style.display='none'; 
      } 
  }
  async function loadApplicationsStaff() { 
      const list = document.getElementById('applicationsList'); 
      const apps = await apiFetch('/api/applications'); 
      list.innerHTML = apps.map((a, i) => `<div class="app-card-ultra animate-hidden"><span class="app-id-badge">#${i+1}</span><div class="ultra-row"><span class="ultra-label">${getTrans('lbl_candidate')}</span> <b>${a.rlName}</b></div><div class="ultra-row"><span class="ultra-label">${getTrans('lbl_history')}</span> <div class="ultra-history">${a.history}</div></div>${a.status === 'pending' ? `<div class="ultra-input-group"><input id="reason-${a.id}" class="ultra-input" placeholder="Comms..."><button onclick="window.updateAppStatus('${a.id}','approved')">ОК</button><button onclick="window.updateAppStatus('${a.id}','rejected')">НІ</button></div>` : `<div>${getTrans('lbl_status')}: ${a.status} <button onclick="window.deleteApp('${a.id}')">DEL</button></div>`}</div>`).join(''); 
  }
  window.updateAppStatus = async (id, status) => { const input = document.getElementById(`reason-${id}`); await apiFetch(`/api/applications/${id}`, {method:'PUT', body:JSON.stringify({status, adminComment: input?input.value:''})}); showToast('Updated'); loadApplicationsStaff(); };
  window.deleteApp = async (id) => { await apiFetch(`/api/applications/${id}`, { method: 'DELETE' }); showToast('Deleted'); loadApplicationsStaff(); };
  
  const ticketForm = document.getElementById('createTicketForm'); 
  if(ticketForm) { 
      ticketForm.addEventListener('submit', async (e)=>{ 
          e.preventDefault(); 
          const body = { author: currentUser.username, title: document.getElementById('ticketTitle').value, messages: [{ sender: currentUser.username, text: document.getElementById('ticketMessage').value, isStaff: false }] }; 
          await apiFetch('/api/tickets', {method:'POST', body:JSON.stringify(body)}); 
          showToast(getTrans('msg_ticket_created')); ticketForm.reset(); loadMyTickets(); 
      }); 
  }
  async function loadMyTickets() { const list = document.getElementById('myTicketsList'); const all = await apiFetch('/api/tickets'); const my = all ? all.filter(t => t.author === currentUser.username) : []; list.innerHTML = my.map(t => `<div class="ticket-card-ultra ${t.status}" onclick="window.openTicket('${t.id}')"><b>${t.title}</b> <span class="status-tag ${t.status}">${t.status}</span></div>`).join(''); }
  async function loadAllTickets() { const list = document.getElementById('allTicketsList'); const all = await apiFetch('/api/tickets'); list.innerHTML = all ? all.map(t => `<div class="ticket-card-ultra ${t.status}" onclick="window.openTicket('${t.id}')"><b>${t.author}: ${t.title}</b> <span class="status-tag ${t.status}">${t.status}</span></div>`).join('') : ''; }
  
  let currentTicketId = null;
  window.openTicket = async (id) => { 
      currentTicketId = id; const all = await apiFetch('/api/tickets'); const t = all.find(x => x.id === id); 
      if(!t) return; 
      document.getElementById('ticketModal').classList.add('show'); 
      document.getElementById('tmTitle').textContent = t.title; 
      document.getElementById('tmMessages').innerHTML = t.messages.map(m => `<div class="msg ${m.sender===currentUser.username?'me':'other'}"><b>${m.sender}</b>: ${m.text}</div>`).join(''); 
      document.getElementById('tmCloseTicketBtn').onclick = async () => { await apiFetch(`/api/tickets/${id}`, { method:'PUT', body: JSON.stringify({ status: 'closed' }) }); document.getElementById('ticketModal').classList.remove('show'); loadMyTickets(); loadAllTickets(); }; 
  };
  document.getElementById('tmSendBtn')?.addEventListener('click', async () => { if(!currentTicketId) return; const txt = document.getElementById('tmInput').value; if(!txt) return; await apiFetch(`/api/tickets/${currentTicketId}`, { method:'PUT', body: JSON.stringify({ message: { sender: currentUser.username, text: txt, isStaff: ['admin','moderator'].includes(currentUser.role) } }) }); document.getElementById('tmInput').value = ''; window.openTicket(currentTicketId); });

  async function updateAuthUI() { 
      const applyText = document.getElementById('applyText'); 
      const applyBtn = document.getElementById('applyBtnMain'); 
      const videosSection = document.getElementById('videos'); 
      const navVideos = document.getElementById('navVideos');
      const authBtnText = document.getElementById('authBtnText'); 
      
      let btnLabel = translations[localStorage.getItem('barracuda_lang') || 'ua'];

      if(currentUser) { 
          document.body.classList.add('is-logged-in'); 
          if(authBtnText) authBtnText.textContent = btnLabel.account; 
          document.getElementById('openAuthBtn').onclick = window.openDashboard; 
          if(applyText) applyText.style.display = 'none'; 
          if(applyBtn) { applyBtn.innerHTML = btnLabel.apply; applyBtn.onclick = () => { window.openDashboard(); window.switchDashTab('apply'); }; }
          if(videosSection) videosSection.style.display = 'block';
          if(navVideos) navVideos.style.display = 'block';
      } else { 
          document.body.classList.remove('is-logged-in'); 
          if(authBtnText) authBtnText.textContent = btnLabel.login; 
          document.getElementById('openAuthBtn').onclick = ()=>document.getElementById('authModal').classList.add('show'); 
          if(applyText) applyText.style.display = 'block'; 
          if(applyBtn) { applyBtn.innerHTML = btnLabel.access_terminal; applyBtn.onclick = ()=>document.getElementById('openAuthBtn').click(); }
          if(videosSection) videosSection.style.display = 'none';
          if(navVideos) navVideos.style.display = 'none';
      } 
  }

  document.getElementById('closeAuth')?.addEventListener('click', ()=>document.getElementById('authModal').classList.remove('show')); 
  document.getElementById('closeDashBtn')?.addEventListener('click', ()=>dashModal.classList.remove('show')); 
  document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ removeCurrentUser(); location.reload(); }); 
  
  document.getElementById('tabLogin')?.addEventListener('click', (e)=>{ e.target.classList.add('active'); document.getElementById('tabRegister').classList.remove('active'); document.getElementById('loginForm').style.display='block'; document.getElementById('registerForm').style.display='none'; }); 
  document.getElementById('tabRegister')?.addEventListener('click', (e)=>{ e.target.classList.add('active'); document.getElementById('tabLogin').classList.remove('active'); document.getElementById('loginForm').style.display='none'; document.getElementById('registerForm').style.display='block'; }); 
  
  document.getElementById('loginForm')?.addEventListener('submit', async (e)=>{ e.preventDefault(); const res = await apiFetch('/api/auth/login', { method:'POST', body: JSON.stringify({ username: document.getElementById('loginUser').value, password: document.getElementById('loginPass').value }) }); if(res && res.success) { saveCurrentUser(res.user); showToast(`${getTrans('msg_welcome')}, ${res.user.username}`); setTimeout(()=>location.reload(), 500); } }); 
  document.getElementById('registerForm')?.addEventListener('submit', async (e)=>{ e.preventDefault(); const pass = document.getElementById('regPass').value; if(pass !== document.getElementById('regPassConfirm').value) return showToast(getTrans('msg_pass_mismatch'), 'error'); const res = await apiFetch('/api/auth/register', { method:'POST', body: JSON.stringify({ username: document.getElementById('regUser').value, email: document.getElementById('regEmail').value, password: pass }) }); if(res && res.success) { showToast(getTrans('msg_created_login')); document.getElementById('tabLogin').click(); } });
  
  document.getElementById('openAdminAddMember')?.addEventListener('click', ()=>document.getElementById('adminAddMemberContainer').style.display='block'); 
  document.getElementById('adminAddMemberForm')?.addEventListener('submit', async (e)=>{ 
      e.preventDefault(); 
      const body = { name: document.getElementById('admName').value, role: document.getElementById('admRole').value, owner: document.getElementById('admOwner').value, server: document.getElementById('admServer').value, links: {discord:document.getElementById('admDiscord').value, youtube:document.getElementById('admYoutube').value} }; 
      await apiFetch('/api/members', {method:'POST', body:JSON.stringify(body)}); 
      showToast(getTrans('msg_member_added')); loadAdminMembers(); 
  });
  
  document.getElementById('openAdminAddMemberUser')?.addEventListener('click', ()=>document.getElementById('adminAddMemberContainer').style.display='block'); 
  
  async function loadAdminMembers() { const list = document.getElementById('adminMembersList'); const m = await apiFetch('/api/members'); list.innerHTML = m.map(x => `<div class="u-row animate-hidden"><div>${x.name} <small>(${x.role})</small> <span style="font-size:10px; color:#ff2a2a; border:1px solid #ff2a2a; padding:2px 4px; border-radius:3px;">${x.server || 'No Server'}</span></div><button class="btn btn-outline" onclick="window.deleteMember('${x.id}')">DEL</button></div>`).join(''); } 
  window.deleteMember = async (id) => { if(confirm("Видалити?")) { await apiFetch(`/api/members/${id}`, {method:'DELETE'}); showToast('Deleted'); loadAdminMembers(); loadInitialData(); } };
  
  function loadMyMemberTab() { 
      const container = document.getElementById('myMemberContainer'); 
      const createBlock = document.getElementById('createMemberBlock');
      const myMember = members.find(m => m.owner === currentUser.username); 
      const statusPanel = document.getElementById('myMemberStatusPanel'); 
      if(myMember) { 
          statusPanel.style.display='block'; createBlock.style.display='none'; container.style.display = 'block';
          container.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><div><h3 style="margin:0 0 5px 0;">${myMember.name}</h3><div style="font-size:12px; color:#888;">РАНГ: <span style="color:#fff">${myMember.role}</span></div><div style="font-size:12px; color:#888;">SERVER: <span style="color:var(--accent)">${myMember.server || 'Pending...'}</span></div></div><div class="dash-avatar"><i class="fa-solid fa-user-shield"></i></div></div>`; 
          document.getElementById('saveStatusBtn').onclick=async()=>{ let role = myMember.role.split(' | ')[0] + ' | ' + document.getElementById('memberStatusSelect').value; await apiFetch(`/api/members/${myMember.id}`, {method:'PUT', body:JSON.stringify({role})}); showToast('Updated'); loadInitialData(); loadMyMemberTab(); }; 
      } else { 
          createBlock.style.display='block'; container.style.display='none'; statusPanel.style.display='none'; 
      } 
  }
  
  function renderPublicMembers() { const g = document.getElementById('membersGrid'); g.innerHTML = members.map(m=>`<div class="member glass animate-hidden"><div style="display:flex; justify-content:space-between; align-items:flex-start;"><h3>${m.name}</h3>${m.server ? `<span style="font-size:10px; background:var(--accent-dim); color:var(--accent); padding:2px 6px; border-radius:4px; border:1px solid rgba(255,42,42,0.3);">${m.server}</span>` : ''}</div><div class="role-badge">${m.role}</div>${m.links.discord?`<div style="margin-top:10px; font-size:12px; color:#aaa;">${m.links.discord}</div>`:''}</div>`).join(''); activateScrollAnimations(); }
  
  function renderNews(l) { const c = document.getElementById('newsList'); c.innerHTML = l.map(n=>`<div class="card glass animate-hidden"><b>${n.date}</b><h3>${n.title}</h3><p>${n.summary}</p></div>`).join(''); activateScrollAnimations(); }
  function renderGallery(l) { const g = document.getElementById('galleryGrid'); g.innerHTML = l.map(g=>`<div class="glass animate-hidden" style="padding:5px;"><img src="${g.url}" onclick="document.getElementById('lightbox').classList.add('show');document.getElementById('lightboxImage').src='${g.url}'"></div>`).join(''); activateScrollAnimations(); }
  
  function renderVideos(l) {
      const g = document.getElementById('videosGrid');
      g.innerHTML = l.map(v => `<div class="card glass animate-hidden"><div class="card-icon"><i class="fa-solid fa-play"></i></div><h3>${v.title}</h3><a href="${v.url}" target="_blank" class="btn btn-primary full-width">ДИВИТИСЬ</a>${currentUser && currentUser.role === 'admin' ? `<button class="btn btn-outline full-width" style="margin-top:5px;" onclick="window.deleteVideo('${v.id}')">ВИДАЛИТИ</button>` : ''}</div>`).join('');
      activateScrollAnimations();
  }
  
  document.getElementById('addVideoBtn')?.addEventListener('click', async () => { const title = document.getElementById('videoTitle').value; const url = document.getElementById('videoUrl').value; await apiFetch('/api/videos', {method:'POST', body:JSON.stringify({title, url})}); showToast("Відео додано"); location.reload(); });
  window.deleteVideo = async (id) => { if(confirm("Видалити?")) { await apiFetch(`/api/videos/${id}`, {method:'DELETE'}); showToast("Видалено"); location.reload(); } };

  loadInitialData();
});
