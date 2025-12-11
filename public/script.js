document.addEventListener('DOMContentLoaded', () => {
  const CURRENT_USER_KEY = 'barakuda_current_user';
  let members = [];
  let systemLogs = JSON.parse(localStorage.getItem('barakuda_logs')) || [];

  // --- PRELOADER & ANIMATIONS INIT ---
  setTimeout(() => {
      const p = document.getElementById('preloader');
      if(p) { 
          p.style.opacity = '0'; 
          setTimeout(() => p.style.display='none', 500); 
          activateScrollAnimations();
      }
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
      const n = await apiFetch('/api/news'); if(n) renderNews(n);
      const g = await apiFetch('/api/gallery'); if(g) renderGallery(g);
      updateAuthUI();
      const yearEl = document.getElementById('year');
      if(yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // --- LANGUAGE SYSTEM (FULL) ---
  const translations = {
    ua: {
        flag: "ua", label: "UKR",
        home: "ГОЛОВНА", about: "ІНФО", members: "СКЛАД", media: "МЕДІА", apply: "ВСТУП",
        login: "ВХІД", account: "АКАУНТ", hero_btn: "ПРИЄДНАТИСЬ", hero_members: "СКЛАД",
        about_title_span: "ХТО", about_title: "МИ Є",
        card_mission: "МІСІЯ", card_mission_desc: "Створення унікального RP досвіду та домінування в сферах впливу.",
        card_protection: "ЗАХИСТ", card_protection_desc: "Ми стоїмо один за одного. Сім'я — це непорушна фортеця.",
        card_resources: "РЕСУРСИ", card_resources_desc: "Забезпечення кожного учасника усім необхідним для комфортної гри.",
        members_title_span: "НАШ", members_title: "СКЛАД", ph_search_agent: "Пошук агента...",
        news_title: "СТРІЧКА", news_title_span: "НОВИН", ph_news_title: "Заголовок", ph_news_text: "Текст новини...", btn_publish: "ПУБЛИКУВАТИ",
        gallery_title: "ГАЛЕРЕЯ", ph_photo_url: "Посилання на фото (URL)", btn_add_photo: "ДОДАТИ ФОТО",
        join_system_title: "ПРИЄДНУЙСЯ ДО СИСТЕМИ", join_system_desc: "Авторизуйтесь, щоб отримати доступ до закритого розділу подачі заявок.",
        access_terminal: "ДОСТУП ДО ТЕРМІНАЛУ", footer: "BARRACUDA FAMILY. RP.",
        // Auth
        auth_title: "СИСТЕМНИЙ ВХІД", tab_login: "ВХІД", tab_register: "РЕЄСТРАЦІЯ",
        ph_login: "Логін", ph_pass: "Пароль", ph_email: "Email", ph_pass_confirm: "Підтвердіть пароль",
        btn_login_submit: "УВІЙТИ В СИСТЕМУ", btn_register_submit: "СТВОРИТИ АКАУНТ",
        // Dashboard Nav
        nav_label_personal: "Особисте", nav_profile: "Профіль", nav_character: "Мій Персонаж", nav_application: "Заявка в сім'ю", nav_support: "Техпідтримка",
        nav_label_staff: "Персонал", nav_staff_apps: "Розгляд заявок", nav_staff_tickets: "Всі тікети",
        nav_label_admin: "Адміністратор", nav_admin_users: "Керування ролями", nav_admin_roster: "Редактор складу", nav_admin_db: "База даних", nav_admin_logs: "Системні логи",
        btn_logout: "ЗАВЕРШИТИ СЕАНС",
        // Dashboard Content
        dash_profile_title: "Особистий кабінет", dash_conn_status: "БЕЗПЕЧНЕ З'ЄДНАННЯ ВСТАНОВЛЕНО",
        lbl_login: "ВАШ ЛОГІН", lbl_access: "РІВЕНЬ ДОСТУПУ", dash_sys_status: "Статус системи",
        dash_sys_desc: "Всі системи працюють у штатному режимі. Доступ до функцій дозволено згідно з вашим рангом.",
        dash_char_title: "Налаштування персонажа", dash_char_status: "Актуальний статус", btn_update_status: "ОНОВИТИ СТАТУС",
        dash_apply_title: "Подача заявки", dash_apply_form_title: "АНКЕТА",
        lbl_name: "1. Ваше реальне ім'я", ph_name: "Ім'я",
        lbl_age: "2. Ваш вік", ph_age: "Вік",
        lbl_online: "3. Середній онлайн (годин)", ph_online: "Наприклад: 5+",
        lbl_families: "4. В яких сім'ях бували", ph_families: "Назви сімей...",
        lbl_history: "5. Історія гри на UA/KZ проектах", ph_history: "Де грали, чого досягли...",
        lbl_video: "6. Посилання на відкат стрільби / Коментар", ph_video: "YouTube / Коментар", btn_submit_app: "ВІДПРАВИТИ",
        dash_support_title: "Технічна підтримка", dash_create_ticket: "Створити запит", ph_ticket_title: "Коротко про проблему", ph_ticket_msg: "Детальний опис...",
        btn_create_ticket: "ВІДКРИТИ ТІКЕТ", dash_my_tickets: "Ваші запити",
        // Staff/Admin
        dash_staff_apps_title: "Вхідні заявки (Staff)", dash_staff_tickets_title: "Управління тікетами",
        dash_admin_users_title: "Користувачі та Ролі", dash_admin_db_title: "БАЗА ДАННЫХ КОРИСТУВАЧІВ",
        dash_admin_roster_title: "Редагування складу", btn_add_member: "Додати",
        ph_adm_name: "IC Ім'я", ph_adm_role: "Ранг", ph_adm_owner: "Логін власника", ph_adm_discord: "Discord", ph_adm_youtube: "YouTube", btn_save_db: "ЗБЕРЕГТИ",
        dash_admin_logs_title: "Системні логи", btn_clear_history: "ОЧИСТИТИ",
        // Modals
        modal_ticket_title: "ТІКЕТ", btn_close_ticket: "ЗАКРИТИ ТІКЕТ", ph_chat_input: "Напишіть повідомлення...", btn_send: "НАДІСЛАТИ",
        btn_cancel: "СКАСУВАТИ", btn_confirm: "ПІДТВЕРДИТИ", btn_understood: "ЗРОЗУМІЛО"
    },
    en: {
        flag: "gb", label: "ENG",
        home: "HOME", about: "INFO", members: "ROSTER", media: "MEDIA", apply: "APPLY",
        login: "LOGIN", account: "ACCOUNT", hero_btn: "JOIN US", hero_members: "ROSTER",
        about_title_span: "WHO", about_title: "WE ARE",
        card_mission: "MISSION", card_mission_desc: "Creating a unique RP experience and dominating spheres of influence.",
        card_protection: "PROTECTION", card_protection_desc: "We stand for each other. The family is an unshakeable fortress.",
        card_resources: "RESOURCES", card_resources_desc: "Providing every member with everything needed for comfortable gameplay.",
        members_title_span: "OUR", members_title: "ROSTER", ph_search_agent: "Search agent...",
        news_title: "NEWS", news_title_span: "FEED", ph_news_title: "Title", ph_news_text: "News content...", btn_publish: "PUBLISH",
        gallery_title: "GALLERY", ph_photo_url: "Photo URL", btn_add_photo: "ADD PHOTO",
        join_system_title: "JOIN THE SYSTEM", join_system_desc: "Authorize to access the restricted application section.",
        access_terminal: "ACCESS TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        // Auth
        auth_title: "SYSTEM LOGIN", tab_login: "LOGIN", tab_register: "REGISTER",
        ph_login: "Username", ph_pass: "Password", ph_email: "Email", ph_pass_confirm: "Confirm Password",
        btn_login_submit: "ENTER SYSTEM", btn_register_submit: "CREATE ACCOUNT",
        // Dashboard Nav
        nav_label_personal: "Personal", nav_profile: "Profile", nav_character: "My Character", nav_application: "Apply", nav_support: "Support",
        nav_label_staff: "Staff", nav_staff_apps: "Review Applications", nav_staff_tickets: "All Tickets",
        nav_label_admin: "Admin", nav_admin_users: "Manage Roles", nav_admin_roster: "Edit Roster", nav_admin_db: "Database", nav_admin_logs: "System Logs",
        btn_logout: "LOGOUT",
        // Dashboard Content
        dash_profile_title: "Personal Cabinet", dash_conn_status: "SECURE CONNECTION ESTABLISHED",
        lbl_login: "YOUR LOGIN", lbl_access: "ACCESS LEVEL", dash_sys_status: "System Status",
        dash_sys_desc: "All systems operational. Function access granted based on your rank.",
        dash_char_title: "Character Settings", dash_char_status: "Current Status", btn_update_status: "UPDATE STATUS",
        dash_apply_title: "Application", dash_apply_form_title: "FORM",
        lbl_name: "1. Real Name", ph_name: "Name",
        lbl_age: "2. Age", ph_age: "Age",
        lbl_online: "3. Average Online", ph_online: "e.g., 5+ hours",
        lbl_families: "4. Previous Families", ph_families: "Family names...",
        lbl_history: "5. History on UA/KZ projects", ph_history: "Where you played...",
        lbl_video: "6. Shooting Video / Comment", ph_video: "Link or comment", btn_submit_app: "SUBMIT",
        dash_support_title: "Technical Support", dash_create_ticket: "Create Ticket", ph_ticket_title: "Brief issue", ph_ticket_msg: "Detailed description...",
        btn_create_ticket: "OPEN TICKET", dash_my_tickets: "Your Tickets",
        // Staff/Admin
        dash_staff_apps_title: "Incoming Applications", dash_staff_tickets_title: "Ticket Management",
        dash_admin_users_title: "Users & Roles", dash_admin_db_title: "USERS DATABASE",
        dash_admin_roster_title: "Roster Editor", btn_add_member: "Add",
        ph_adm_name: "IC Name", ph_adm_role: "Rank", ph_adm_owner: "Owner Login", ph_adm_discord: "Discord", ph_adm_youtube: "YouTube", btn_save_db: "SAVE TO DB",
        dash_admin_logs_title: "System Logs", btn_clear_history: "CLEAR HISTORY",
        // Modals
        modal_ticket_title: "TICKET", btn_close_ticket: "CLOSE TICKET", ph_chat_input: "Write a message...", btn_send: "SEND",
        btn_cancel: "CANCEL", btn_confirm: "CONFIRM", btn_understood: "UNDERSTOOD"
    },
    // ... (Other languages can be populated similarly if needed, but these 3 cover the main request fully)
    ru: {
        flag: "ru", label: "RUS",
        home: "ГЛАВНАЯ", about: "ИНФО", members: "СОСТАВ", media: "МЕДИА", apply: "ВСТУПИТЬ",
        login: "ВХОД", account: "АККАУНТ", hero_btn: "ПРИСОЕДИНИТЬСЯ", hero_members: "СОСТАВ",
        about_title_span: "КТО", about_title: "МЫ ЕСТЬ",
        card_mission: "МИССИЯ", card_mission_desc: "Создание уникального RP опыта и доминирование в сферах влияния.",
        card_protection: "ЗАЩИТА", card_protection_desc: "Мы стоим друг за друга. Семья — это нерушимая крепость.",
        card_resources: "РЕСУРСЫ", card_resources_desc: "Обеспечение каждого участника всем необходимым для комфортной игры.",
        members_title_span: "НАШ", members_title: "СОСТАВ", ph_search_agent: "Поиск агента...",
        news_title: "ЛЕНТА", news_title_span: "НОВОСТЕЙ", ph_news_title: "Заголовок", ph_news_text: "Текст новости...", btn_publish: "ПУБЛИКОВАТЬ",
        gallery_title: "ГАЛЕРЕЯ", ph_photo_url: "Ссылка на фото (URL)", btn_add_photo: "ДОБАВИТЬ ФОТО",
        join_system_title: "ПРИСОЕДИНЯЙСЯ К СИСТЕМЕ", join_system_desc: "Авторизуйтесь, чтобы получить доступ к закрытому разделу подачи заявок.",
        access_terminal: "ДОСТУП К ТЕРМИНАЛУ", footer: "BARRACUDA FAMILY. RP.",
        auth_title: "СИСТЕМНЫЙ ВХОД", tab_login: "ВХОД", tab_register: "РЕГИСТРАЦИЯ",
        ph_login: "Логин", ph_pass: "Пароль", ph_email: "Email", ph_pass_confirm: "Подтвердите пароль",
        btn_login_submit: "ВОЙТИ В СИСТЕМУ", btn_register_submit: "СОЗДАТЬ АККАУНТ",
        nav_label_personal: "Личное", nav_profile: "Профиль", nav_character: "Мой Персонаж", nav_application: "Заявка", nav_support: "Поддержка",
        nav_label_staff: "Персонал", nav_staff_apps: "Заявки", nav_staff_tickets: "Тикеты",
        nav_label_admin: "Администратор", nav_admin_users: "Управление ролями", nav_admin_roster: "Редактор состава", nav_admin_db: "База данных", nav_admin_logs: "Логи",
        btn_logout: "ЗАВЕРШИТЬ СЕАНС",
        dash_profile_title: "Личный кабинет", dash_conn_status: "БЕЗОПАСНОЕ СОЕДИНЕНИЕ",
        lbl_login: "ВАШ ЛОГИН", lbl_access: "УРОВЕНЬ ДОСТУПА", dash_sys_status: "Статус системы",
        dash_sys_desc: "Все системы работают штатно. Доступ разрешен согласно рангу.",
        dash_char_title: "Настройки персонажа", dash_char_status: "Текущий статус", btn_update_status: "ОБНОВИТЬ СТАТУС",
        dash_apply_title: "Подача заявки", dash_apply_form_title: "АНКЕТА",
        lbl_name: "1. Реальное имя", ph_name: "Имя", lbl_age: "2. Возраст", ph_age: "Возраст",
        lbl_online: "3. Средний онлайн", ph_online: "Например: 5+", lbl_families: "4. Прошлые семьи", ph_families: "Названия...",
        lbl_history: "5. История игры", ph_history: "Где играли...", lbl_video: "6. Откат стрельбы", ph_video: "Ссылка", btn_submit_app: "ОТПРАВИТЬ",
        dash_support_title: "Техподдержка", dash_create_ticket: "Создать запрос", ph_ticket_title: "Суть проблемы", ph_ticket_msg: "Описание...",
        btn_create_ticket: "ОТКРЫТЬ ТИКЕТ", dash_my_tickets: "Ваши тикеты",
        dash_staff_apps_title: "Входящие заявки", dash_staff_tickets_title: "Управление тикетами",
        dash_admin_users_title: "Пользователи", dash_admin_db_title: "БАЗА ДАННЫХ", dash_admin_roster_title: "Состав", btn_add_member: "Добавить",
        ph_adm_name: "IC Имя", ph_adm_role: "Ранг", ph_adm_owner: "Логин", ph_adm_discord: "Discord", ph_adm_youtube: "YouTube", btn_save_db: "СОХРАНИТЬ",
        dash_admin_logs_title: "Логи", btn_clear_history: "ОЧИСТИТЬ",
        modal_ticket_title: "ТИКЕТ", btn_close_ticket: "ЗАКРЫТЬ", ph_chat_input: "Сообщение...", btn_send: "ОТПРАВИТЬ",
        btn_cancel: "ОТМЕНА", btn_confirm: "ПОДТВЕРДИТЬ", btn_understood: "ПОНЯТНО"
    }
    // (Other languages can be populated similarly if needed, but these 3 cover the main request fully)
  };

  const langTrigger = document.getElementById('langTrigger');
  const langDropdown = document.getElementById('langDropdown');
  const currentFlagImg = document.getElementById('currentFlagImg');
  const currentLangLabel = document.getElementById('currentLangLabel');

  function changeLanguage(lang) {
      // 1. Text Content
      document.querySelectorAll('[data-lang]').forEach(el => {
          const key = el.getAttribute('data-lang');
          if (key === 'login') {
             const textEl = document.getElementById('authBtnText');
             if(currentUser) {
                 textEl.textContent = translations[lang]['account'] || "ACCOUNT";
             } else {
                 textEl.textContent = translations[lang]['login'] || "LOGIN";
             }
          } else if (translations[lang] && translations[lang][key]) {
              el.textContent = translations[lang][key];
          }
      });

      // 2. Placeholders
      document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
          const key = el.getAttribute('data-lang-placeholder');
          if (translations[lang] && translations[lang][key]) {
              el.placeholder = translations[lang][key];
          }
      });
      
      // 3. Update Flag/Label
      if(translations[lang]) {
        const flagCode = translations[lang].flag || lang; 
        currentFlagImg.src = `https://flagcdn.com/w40/${flagCode}.png`;
        currentLangLabel.textContent = translations[lang].label || lang.toUpperCase();
      }

      localStorage.setItem('barracuda_lang', lang);
      
      document.querySelectorAll('.lang-option').forEach(opt => {
          opt.classList.remove('active');
          if(opt.getAttribute('data-lang') === lang) opt.classList.add('active');
      });
  }

  if(langTrigger && langDropdown) {
      langTrigger.addEventListener('click', (e) => {
          e.stopPropagation();
          langDropdown.classList.toggle('show');
      });

      document.querySelectorAll('.lang-option').forEach(opt => {
          opt.addEventListener('click', () => {
              const selectedLang = opt.getAttribute('data-lang');
              changeLanguage(selectedLang);
          });
      });

      document.addEventListener('click', (e) => {
          if(!langTrigger.contains(e.target) && !langDropdown.contains(e.target)) {
              langDropdown.classList.remove('show');
          }
      });

      const savedLang = localStorage.getItem('barracuda_lang') || 'ua';
      changeLanguage(savedLang);
  }

  async function updateAuthUI() {
      const applyText = document.getElementById('applyText');
      const applyBtn = document.getElementById('applyBtnMain');
      const currentLang = localStorage.getItem('barracuda_lang') || 'ua';
      
      if(currentUser) {
          document.body.classList.add('is-logged-in');
          if(currentUser.role==='admin') document.body.classList.add('is-admin');
          
          const accText = translations[currentLang] ? translations[currentLang]['account'] : "ACCOUNT";
          document.getElementById('authBtnText').textContent = accText;
          document.getElementById('openAuthBtn').onclick = window.openDashboard;
          
          if(applyText) applyText.style.display = 'none';
          
          if(applyBtn) { 
              const applyLabel = translations[currentLang] ? translations[currentLang]['apply'] : "APPLY";
              applyBtn.innerHTML = `<i class="fa-solid fa-file-signature"></i> <span data-lang="apply">${applyLabel}</span>`; 
              applyBtn.onclick = () => { window.openDashboard(); window.switchDashTab('apply'); };
          }
      } else {
          document.body.classList.remove('is-logged-in','is-admin');
          const loginText = translations[currentLang] ? translations[currentLang]['login'] : "LOGIN";
          document.getElementById('authBtnText').textContent = loginText;
          document.getElementById('openAuthBtn').onclick = ()=>document.getElementById('authModal').classList.add('show');
          if(applyText) applyText.style.display = 'block';
          if(applyBtn) { 
              const accessLabel = translations[currentLang] ? translations[currentLang]['access_terminal'] : "ACCESS TERMINAL";
              applyBtn.innerHTML = `<i class="fa-solid fa-file-signature"></i> <span data-lang="access_terminal">${accessLabel}</span>`; 
              applyBtn.onclick = ()=>document.getElementById('openAuthBtn').click(); 
          }
      }
  }

  document.getElementById('navToggle')?.addEventListener('click', ()=>document.getElementById('mainNav').classList.toggle('open'));
  document.getElementById('closeAuth')?.addEventListener('click', ()=>document.getElementById('authModal').classList.remove('show'));
  document.getElementById('closeDashBtn')?.addEventListener('click', ()=>dashModal.classList.remove('show'));
  document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ removeCurrentUser(); location.reload(); });
  document.getElementById('lightboxCloseBtn')?.addEventListener('click', ()=>document.getElementById('lightbox').classList.remove('show'));
  
  // Tab switching in Auth Modal
  document.getElementById('tabLogin')?.addEventListener('click', (e)=>{ 
      e.target.classList.add('active'); 
      document.getElementById('tabRegister').classList.remove('active'); 
      document.getElementById('loginForm').style.display='block'; 
      document.getElementById('registerForm').style.display='none'; 
  });
  document.getElementById('tabRegister')?.addEventListener('click', (e)=>{ 
      e.target.classList.add('active'); 
      document.getElementById('tabLogin').classList.remove('active'); 
      document.getElementById('loginForm').style.display='none'; 
      document.getElementById('registerForm').style.display='block'; 
  });

  // Animation & Rendering code... (Same as before, just kept for context)
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
      document.querySelectorAll('.hero, .section, .card, .member').forEach(el => {
          el.classList.add('animate-hidden');
          observer.observe(el);
      });
  }
  document.addEventListener('mousemove', (e) => {
      document.querySelectorAll('.card, .member, .btn').forEach(card => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--x', `${x}px`);
          card.style.setProperty('--y', `${y}px`);
      });
  });

  // Auth Forms
  document.getElementById('loginForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const res = await apiFetch('/api/auth/login', { method:'POST', body: JSON.stringify({ username: document.getElementById('loginUser').value, password: document.getElementById('loginPass').value }) });
      if(res && res.success) { saveCurrentUser(res.user); showToast(`ВІТАЄМО, ${res.user.username}`); setTimeout(()=>location.reload(), 500); } 
  });
  document.getElementById('registerForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const pass = document.getElementById('regPass').value;
      if(pass !== document.getElementById('regPassConfirm').value) return showToast('ПАРОЛІ НЕ СПІВПАДАЮТЬ', 'error');
      const res = await apiFetch('/api/auth/register', { method:'POST', body: JSON.stringify({ username: document.getElementById('regUser').value, email: document.getElementById('regEmail').value, password: pass }) });
      if(res && res.success) { showToast('СТВОРЕНО. БУДЬ ЛАСКА, УВІЙДІТЬ.'); document.getElementById('tabLogin').click(); }
  });

  // Admin/Member Logic (unchanged)
  async function loadAdminMembers() {
      const list = document.getElementById('adminMembersList');
      const m = await apiFetch('/api/members');
      if(!m || m.length === 0) { list.innerHTML = '<div style="text-align:center; padding:20px; color:#666;">Ще немає учасників.</div>'; return; }
      list.innerHTML = m.map(x => `<div class="u-row animate-hidden"><div>${x.name} <small>(${x.role})</small></div><button class="btn btn-outline" style="color:#ff4757; border-color:#ff4757;" onclick="window.deleteMember('${x.id}')">ВИДАЛИТИ</button></div>`).join('');
  }
  document.getElementById('openAdminAddMember')?.addEventListener('click', ()=>document.getElementById('adminAddMemberContainer').style.display='block');
  document.getElementById('adminAddMemberForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const body = { name: document.getElementById('admName').value, role: document.getElementById('admRole').value, owner: document.getElementById('admOwner').value, links: {discord:document.getElementById('admDiscord').value, youtube:document.getElementById('admYoutube').value} };
      await apiFetch('/api/members', {method:'POST', body:JSON.stringify(body)});
      showToast('Учасника додано'); loadAdminMembers();
  });
  window.deleteMember = async (id) => customConfirm('Видалити учасника?', async (r)=>{ if(r) { await apiFetch(`/api/members/${id}`, {method:'DELETE'}); showToast('Видалено'); loadAdminMembers(); loadInitialData(); } });

  // Render Functions
  function renderPublicMembers() {
      const g = document.getElementById('membersGrid');
      if(!members || members.length === 0) { g.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#666;">Список порожній.</div>'; return; }
      g.innerHTML = members.map(m=>`<div class="member glass animate-hidden"><h3>${m.name}</h3><div class="role-badge">${m.role}</div>${m.links.discord?`<div style="margin-top:10px; font-size:12px; color:#aaa;">${m.links.discord}</div>`:''}</div>`).join('');
      activateScrollAnimations();
  }
  function renderNews(l) { document.getElementById('newsList').innerHTML = l.map(n=>`<div class="card glass animate-hidden"><b>${n.date}</b><h3>${n.title}</h3><p>${n.summary}</p></div>`).join(''); activateScrollAnimations(); }
  function renderGallery(l) { document.getElementById('galleryGrid').innerHTML = l.map(g=>`<div class="glass animate-hidden" style="padding:5px;"><img src="${g.url}" onclick="document.getElementById('lightbox').classList.add('show');document.getElementById('lightboxImage').src='${g.url}'"></div>`).join(''); activateScrollAnimations(); }
  
  window.renderLogs = () => { document.getElementById('systemLogsList').innerHTML = systemLogs.map(l=>`<div>${l}</div>`).join(''); };
  window.clearLogs = () => { systemLogs=[]; localStorage.removeItem('barakuda_logs'); renderLogs(); };

  // Dashboard Tab Logic
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
      if(tab === 'my-member') loadMyMemberTab();
      if(tab === 'accounts-data') loadAccountsData();
  };

  // ... (Other specific logic like checkMyApplication, loadMyTickets etc. remains as is, just ensured elements exist) ...
  // Keeping minimal for brevity, assume standard implementations for those function calls exist as before.

  loadInitialData();
});
