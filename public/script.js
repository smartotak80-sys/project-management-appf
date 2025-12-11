document.addEventListener('DOMContentLoaded', () => {
  // --- 1. ПРІОРИТЕТНЕ ПРИБИРАННЯ ЗАСТАВКИ (SAFE MODE) ---
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

  // UTILS
  function loadCurrentUser(){ try{ return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)); } catch(e){ return null; } }
  function saveCurrentUser(val){ try { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(val)); } catch(e){} }
  function removeCurrentUser(){ try { localStorage.removeItem(CURRENT_USER_KEY); } catch(e){} }
  
  // --- FULL TRANSLATION SYSTEM (ALL SECTIONS) ---
  const translations = {
    ua: {
        flag: "ua", label: "UKR",
        home: "ГОЛОВНА", about: "ІНФО", members: "СКЛАД", media: "МЕДІА", apply: "ВСТУП",
        login: "ВХІД", account: "АКАУНТ", hero_btn: "ПРИЄДНАТИСЬ", hero_members: "СКЛАД",
        about_title_span: "ХТО", about_title: "МИ Є", hero_lead: "ДОМІНУВАННЯ. СТИЛЬ. ДИСЦИПЛІНА.",
        card_mission: "МІСІЯ", card_mission_desc: "Створення унікального RP досвіду та домінування в сферах впливу.",
        card_protection: "ЗАХИСТ", card_protection_desc: "Ми стоїмо один за одного. Сім'я — це непорушна фортеця.",
        card_resources: "РЕСУРСИ", card_resources_desc: "Забезпечення кожного учасника усім необхідним для комфортної гри.",
        members_title_span: "НАШ", members_title: "СКЛАД",
        news_title: "СТРІЧКА", news_title_span: "НОВИН",
        gallery_title: "ГАЛЕРЕЯ",
        join_system_title: "ПРИЄДНУЙСЯ ДО СИСТЕМИ", join_system_desc: "Авторизуйтесь, щоб отримати доступ до закритого розділу подачі заявок.",
        access_terminal: "ДОСТУП ДО ТЕРМІНАЛУ", footer: "BARRACUDA FAMILY. RP.",
        auth_title: "СИСТЕМНИЙ ВХІД", auth_tab_login: "ВХІД", auth_tab_reg: "РЕЄСТРАЦІЯ", auth_btn_login: "УВІЙТИ В СИСТЕМУ", auth_btn_reg: "СТВОРИТИ АКАУНТ",
        ph_login: "Логін", ph_pass: "Пароль", ph_email: "Email", ph_pass_conf: "Підтвердіть пароль",
        modal_cancel: "СКАСУВАТИ", modal_confirm: "ПІДТВЕРДИТИ", modal_ok: "ЗРОЗУМІЛО",
        search_placeholder: "Пошук агента...", ticket_close_btn: "ЗАКРИТИ ТІКЕТ", ph_chat: "Повідомлення...", chat_send: "НАДІСЛАТИ",
        // DASHBOARD
        dash_mobile_title: "PANEL v3.0",
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
        dash_staff_apps: "Вхідні заявки (Staff)", dash_staff_tickets: "Управління тікетами",
        dash_admin_users: "Користувачі та Ролі", dash_admin_roster: "Редагування складу", dash_admin_db: "USERS DATABASE", dash_admin_logs: "Системні логи",
        dash_btn_add: "Додати", dash_btn_save: "ЗБЕРЕГТИ В БАЗУ", dash_btn_clear: "CLEAR HISTORY", dash_btn_refresh: "ОНОВИТИ",
        ph_adm_name: "IC Ім'я", ph_adm_role: "Ранг", ph_adm_owner: "Логін (Login)",
        // DB Headers
        db_user: "КОРИСТУВАЧ", db_email: "EMAIL", db_hash: "ПАРОЛЬ (HASH)", db_role: "РІВЕНЬ ДОСТУПУ", db_reg: "РЕЄСТРАЦІЯ",
        // JS Messages
        msg_access_denied: "ДОСТУП ЗАБОРОНЕНО", msg_error: "Помилка", msg_updated: "Оновлено", msg_deleted: "Видалено", msg_sent: "ВІДПРАВЛЕНО",
        msg_pass_mismatch: "ПАРОЛІ НЕ СПІВПАДАЮТЬ", msg_welcome: "ВІТАЄМО", msg_login_plz: "СТВОРЕНО. БУДЬ ЛАСКА, УВІЙДІТЬ.",
        msg_empty: "Список порожній", msg_loading: "Завантаження...", msg_ban_confirm: "ЗАБАНИТИ КОРИСТУВАЧА?", msg_del_confirm: "ВИДАЛИТИ?",
        role_guest: "Гість"
    },
    en: {
        flag: "gb", label: "ENG",
        home: "HOME", about: "INFO", members: "ROSTER", media: "MEDIA", apply: "APPLY",
        login: "LOGIN", account: "ACCOUNT", hero_btn: "JOIN US", hero_members: "ROSTER",
        about_title_span: "WHO", about_title: "WE ARE", hero_lead: "DOMINANCE. STYLE. DISCIPLINE.",
        card_mission: "MISSION", card_mission_desc: "Creating a unique RP experience and dominating spheres of influence.",
        card_protection: "PROTECTION", card_protection_desc: "We stand for each other. The family is an unshakeable fortress.",
        card_resources: "RESOURCES", card_resources_desc: "Providing every member with everything needed for comfortable gameplay.",
        members_title_span: "OUR", members_title: "ROSTER",
        news_title: "NEWS", news_title_span: "FEED",
        gallery_title: "GALLERY",
        join_system_title: "JOIN THE SYSTEM", join_system_desc: "Authorize to access the restricted application section.",
        access_terminal: "ACCESS TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        auth_title: "SYSTEM LOGIN", auth_tab_login: "LOGIN", auth_tab_reg: "REGISTER", auth_btn_login: "ENTER SYSTEM", auth_btn_reg: "CREATE ACCOUNT",
        ph_login: "Login", ph_pass: "Password", ph_email: "Email", ph_pass_conf: "Confirm Password",
        modal_cancel: "CANCEL", modal_confirm: "CONFIRM", modal_ok: "UNDERSTOOD",
        search_placeholder: "Search agent...", ticket_close_btn: "CLOSE TICKET", ph_chat: "Message...", chat_send: "SEND",
        // DASHBOARD
        dash_mobile_title: "PANEL v3.0",
        dash_label_personal: "Personal", dash_nav_profile: "Profile", dash_nav_my_member: "My Character", dash_nav_apply: "Join Family", dash_nav_support: "Support",
        dash_label_staff: "Staff", dash_nav_apps: "Applications", dash_nav_tickets: "All Tickets",
        dash_label_admin: "Administrator", dash_nav_users: "User Roles", dash_nav_roster: "Edit Roster", dash_nav_db: "Database", dash_nav_logs: "Logs", dash_nav_logout: "LOGOUT",
        dash_profile_title: "Personal Cabinet", dash_secure_conn: "SECURE CONNECTION ESTABLISHED",
        dash_stat_login: "YOUR LOGIN", dash_stat_role: "ACCESS LEVEL",
        dash_sys_status: "System Status", dash_sys_ok: "All systems operational.",
        dash_char_settings: "Character Settings", dash_char_status: "Current Status", dash_char_update: "UPDATE STATUS",
        dash_apply_header: "Application", dash_form_title: "FORM",
        dash_form_name: "1. Real Name", dash_form_age: "2. Age", dash_form_online: "3. Online (hours)", dash_form_fam: "4. Previous Families", dash_form_hist: "5. Game History", dash_form_note: "6. Video / Note", dash_form_submit: "SUBMIT",
        ph_name: "Name", ph_age: "Age", ph_online: "5+ hours", ph_fam: "Family names...", ph_hist: "History...", ph_note: "Link or note",
        dash_support_header: "Tech Support", dash_create_ticket: "Create Ticket", dash_my_tickets: "Your Tickets", dash_ticket_btn: "OPEN TICKET",
        ph_ticket_title: "Issue Summary", ph_ticket_msg: "Description...",
        dash_staff_apps: "Incoming Applications (Staff)", dash_staff_tickets: "Ticket Management",
        dash_admin_users: "Users & Roles", dash_admin_roster: "Roster Editor", dash_admin_db: "USERS DATABASE", dash_admin_logs: "System Logs",
        dash_btn_add: "Add", dash_btn_save: "SAVE TO DB", dash_btn_clear: "CLEAR HISTORY", dash_btn_refresh: "REFRESH",
        ph_adm_name: "IC Name", ph_adm_role: "Rank", ph_adm_owner: "Login User",
        // DB Headers
        db_user: "USERNAME", db_email: "EMAIL", db_hash: "HASH", db_role: "ACCESS LEVEL", db_reg: "REGISTERED",
        // JS Messages
        msg_access_denied: "ACCESS DENIED", msg_error: "Error", msg_updated: "Updated", msg_deleted: "Deleted", msg_sent: "SENT",
        msg_pass_mismatch: "PASSWORDS DO NOT MATCH", msg_welcome: "WELCOME", msg_login_plz: "CREATED. PLEASE LOGIN.",
        msg_empty: "List is empty", msg_loading: "Loading...", msg_ban_confirm: "BAN USER?", msg_del_confirm: "DELETE?",
        role_guest: "Guest"
    },
    ru: {
        flag: "ru", label: "RUS",
        home: "ГЛАВНАЯ", about: "ИНФО", members: "СОСТАВ", media: "МЕДИА", apply: "ВСТУПИТЬ",
        login: "ВХОД", account: "АККАУНТ", hero_btn: "ПРИСОЕДИНИТЬСЯ", hero_members: "СОСТАВ",
        about_title_span: "КТО", about_title: "МЫ ЕСТЬ", hero_lead: "ДОМИНИРОВАНИЕ. СТИЛЬ. ДИСЦИПЛИНА.",
        card_mission: "МИССИЯ", card_mission_desc: "Создание уникального RP опыта и доминирование в сферах влияния.",
        card_protection: "ЗАЩИТА", card_protection_desc: "Мы стоим друг за друга. Семья — это нерушимая крепость.",
        card_resources: "РЕСУРСИ", card_resources_desc: "Обеспечение каждого участника всем необходимым для комфортной игры.",
        members_title_span: "НАШ", members_title: "СОСТАВ",
        news_title: "ЛЕНТА", news_title_span: "НОВОСТЕЙ",
        gallery_title: "ГАЛЕРЕЯ",
        join_system_title: "ПРИСОЕДИНЯЙСЯ К СИСТЕМЕ", join_system_desc: "Авторизуйтесь, чтобы получить доступ к закрытому разделу подачи заявок.",
        access_terminal: "ДОСТУП К ТЕРМИНАЛУ", footer: "BARRACUDA FAMILY. RP.",
        auth_title: "СИСТЕМНЫЙ ВХОД", auth_tab_login: "ВХОД", auth_tab_reg: "РЕГИСТРАЦИЯ", auth_btn_login: "ВОЙТИ", auth_btn_reg: "СОЗДАТЬ АККАУНТ",
        ph_login: "Логин", ph_pass: "Пароль", ph_email: "Email", ph_pass_conf: "Подтвердите пароль",
        modal_cancel: "ОТМЕНА", modal_confirm: "ПОДТВЕРДИТЬ", modal_ok: "ПОНЯТНО",
        search_placeholder: "Поиск агента...", ticket_close_btn: "ЗАКРЫТЬ ТИКЕТ", ph_chat: "Сообщение...", chat_send: "ОТПРАВИТЬ",
        // DASHBOARD
        dash_mobile_title: "PANEL v3.0",
        dash_label_personal: "Личное", dash_nav_profile: "Профиль", dash_nav_my_member: "Мой Персонаж", dash_nav_apply: "Заявка в семью", dash_nav_support: "Техподдержка",
        dash_label_staff: "Персонал", dash_nav_apps: "Заявки", dash_nav_tickets: "Все тикеты",
        dash_label_admin: "Администратор", dash_nav_users: "Роли", dash_nav_roster: "Редактор состава", dash_nav_db: "База данных", dash_nav_logs: "Логи", dash_nav_logout: "ВЫЙТИ",
        dash_profile_title: "Личный кабинет", dash_secure_conn: "БЕЗОПАСНОЕ СОЕДИНЕНИЕ УСТАНОВЛЕНО",
        dash_stat_login: "ВАШ ЛОГИН", dash_stat_role: "УРОВЕНЬ ДОСТУПА",
        dash_sys_status: "Статус системы", dash_sys_ok: "Все системы работают в штатном режиме.",
        dash_char_settings: "Настройки персонажа", dash_char_status: "Текущий статус", dash_char_update: "ОБНОВИТЬ СТАТУС",
        dash_apply_header: "Подача заявки", dash_form_title: "АНКЕТА",
        dash_form_name: "1. Ваше реальное имя", dash_form_age: "2. Ваш возраст", dash_form_online: "3. Средний онлайн (часов)", dash_form_fam: "4. В каких семьях были", dash_form_hist: "5. История игры", dash_form_note: "6. Ссылка на откат / Комментарий", dash_form_submit: "ОТПРАВИТЬ",
        ph_name: "Имя", ph_age: "Возраст", ph_online: "5+ часов", ph_fam: "Названия семей...", ph_hist: "Где играли...", ph_note: "YouTube или комментарий",
        dash_support_header: "Техническая поддержка", dash_create_ticket: "Создать запрос", dash_my_tickets: "Ваши запросы", dash_ticket_btn: "ОТКРЫТЬ ТИКЕТ",
        ph_ticket_title: "Кратко о проблеме", ph_ticket_msg: "Описание ситуации...",
        dash_staff_apps: "Входящие заявки (Staff)", dash_staff_tickets: "Управление тикетами",
        dash_admin_users: "Пользователи и Роли", dash_admin_roster: "Редактор состава", dash_admin_db: "БАЗА ДАННЫХ", dash_admin_logs: "Системные логи",
        dash_btn_add: "Добавить", dash_btn_save: "СОХРАНИТЬ", dash_btn_clear: "ОЧИСТИТЬ", dash_btn_refresh: "ОБНОВИТЬ",
        ph_adm_name: "IC Имя", ph_adm_role: "Ранг", ph_adm_owner: "Логин на сайте",
        // DB Headers
        db_user: "ПОЛЬЗОВАТЕЛЬ", db_email: "EMAIL", db_hash: "ПАРОЛЬ (HASH)", db_role: "ДОСТУП", db_reg: "РЕГИСТРАЦИЯ",
        // JS Messages
        msg_access_denied: "ДОСТУП ЗАПРЕЩЕН", msg_error: "Ошибка", msg_updated: "Обновлено", msg_deleted: "Удалено", msg_sent: "ОТПРАВЛЕНО",
        msg_pass_mismatch: "ПАРОЛИ НЕ СОВПАДАЮТ", msg_welcome: "ПРИВЕТСТВУЕМ", msg_login_plz: "СОЗДАНО. ПОЖАЛУЙСТА, ВОЙДИТЕ.",
        msg_empty: "Список пуст", msg_loading: "Загрузка...", msg_ban_confirm: "ЗАБАНИТЬ?", msg_del_confirm: "УДАЛИТЬ?",
        role_guest: "Гость"
    },
    de: {
        flag: "de", label: "DEU",
        home: "STARTSEITE", about: "INFO", members: "TEAM", media: "MEDIEN", apply: "BEWERBEN",
        login: "LOGIN", account: "KONTO", hero_btn: "BEITRETEN", hero_members: "TEAM",
        about_title_span: "WER", about_title: "WIR SIND", hero_lead: "DOMINANZ. STIL. DISZIPLIN.",
        card_mission: "MISSION", card_mission_desc: "Schaffung eines einzigartigen RP-Erlebnisses und Dominanz in Einflussbereichen.",
        card_protection: "SCHUTZ", card_protection_desc: "Wir stehen füreinander ein. Die Familie ist eine unerschütterliche Festung.",
        card_resources: "RESSOURCEN", card_resources_desc: "Bereitstellung von allem, was für ein komfortables Spiel benötigt wird.",
        members_title_span: "UNSER", members_title: "TEAM",
        news_title: "NEWS", news_title_span: "FEED",
        gallery_title: "GALERIE",
        join_system_title: "TRITT DEM SYSTEM BEI", join_system_desc: "Autorisieren Sie sich, um auf den geschlossenen Bewerbungsbereich zuzugreifen.",
        access_terminal: "ZUGRIFF AUF TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        auth_title: "SYSTEM LOGIN", auth_tab_login: "LOGIN", auth_tab_reg: "REGISTRIEREN", auth_btn_login: "EINTRETEN", auth_btn_reg: "KONTO ERSTELLEN",
        ph_login: "Login", ph_pass: "Passwort", ph_email: "Email", ph_pass_conf: "Passwort bestätigen",
        modal_cancel: "ABBRECHEN", modal_confirm: "BESTÄTIGEN", modal_ok: "VERSTANDEN",
        search_placeholder: "Agent suchen...", ticket_close_btn: "SCHLIESSEN", ph_chat: "Nachricht...", chat_send: "SENDEN",
        // DASHBOARD
        dash_mobile_title: "PANEL v3.0",
        dash_label_personal: "Persönlich", dash_nav_profile: "Profil", dash_nav_my_member: "Mein Charakter", dash_nav_apply: "Bewerbung", dash_nav_support: "Support",
        dash_label_staff: "Personal", dash_nav_apps: "Bewerbungen", dash_nav_tickets: "Tickets",
        dash_label_admin: "Admin", dash_nav_users: "Benutzer", dash_nav_roster: "Dienstplan", dash_nav_db: "Datenbank", dash_nav_logs: "Logs", dash_nav_logout: "LOGOUT",
        dash_profile_title: "Persönliches Kabinett", dash_secure_conn: "SICHERE VERBINDUNG HERGESTELLT",
        dash_stat_login: "DEIN LOGIN", dash_stat_role: "ZUGRIFFSEBENE",
        dash_sys_status: "Systemstatus", dash_sys_ok: "Alle Systeme funktionieren normal.",
        dash_char_settings: "Charaktereinstellungen", dash_char_status: "Aktueller Status", dash_char_update: "STATUS AKTUALISIEREN",
        dash_apply_header: "Bewerbung", dash_form_title: "FORMULAR",
        dash_form_name: "1. Ihr echter Name", dash_form_age: "2. Ihr Alter", dash_form_online: "3. Online (Stunden)", dash_form_fam: "4. Vorherige Familien", dash_form_hist: "5. Spielgeschichte", dash_form_note: "6. Video / Notiz", dash_form_submit: "ABSENDEN",
        ph_name: "Name", ph_age: "Alter", ph_online: "5+ Stunden", ph_fam: "Familien...", ph_hist: "Geschichte...", ph_note: "Link oder Notiz",
        dash_support_header: "Tech Support", dash_create_ticket: "Ticket erstellen", dash_my_tickets: "Ihre Tickets", dash_ticket_btn: "TICKET ÖFFNEN",
        ph_ticket_title: "Problem", ph_ticket_msg: "Beschreibung...",
        dash_staff_apps: "Bewerbungen (Staff)", dash_staff_tickets: "Ticketverwaltung",
        dash_admin_users: "Benutzer & Rollen", dash_admin_roster: "Dienstplan bearbeiten", dash_admin_db: "BENUTZER-DB", dash_admin_logs: "Systemprotokolle",
        dash_btn_add: "Hinzufügen", dash_btn_save: "SPEICHERN", dash_btn_clear: "LÖSCHEN", dash_btn_refresh: "AKTUALISIEREN",
        ph_adm_name: "IC Name", ph_adm_role: "Rang", ph_adm_owner: "Benutzer-Login",
        // DB Headers
        db_user: "BENUTZER", db_email: "EMAIL", db_hash: "PASSWORT (HASH)", db_role: "ZUGRIFF", db_reg: "REGISTRIERT",
        // JS Messages
        msg_access_denied: "ZUGRIFF VERWEIGERT", msg_error: "Fehler", msg_updated: "Aktualisiert", msg_deleted: "Gelöscht", msg_sent: "GESENDET",
        msg_pass_mismatch: "PASSWÖRTER STIMMEN NICHT ÜBEREIN", msg_welcome: "WILLKOMMEN", msg_login_plz: "ERSTELLT. BITTE EINLOGGEN.",
        msg_empty: "Liste ist leer", msg_loading: "Wird geladen...", msg_ban_confirm: "BENUTZER SPERREN?", msg_del_confirm: "LÖSCHEN?",
        role_guest: "Gast"
    },
    es: {
        flag: "es", label: "ESP",
        home: "INICIO", about: "INFO", members: "MIEMBROS", media: "MEDIOS", apply: "APLICAR",
        login: "ACCESO", account: "CUENTA", hero_btn: "ÚNETE", hero_members: "MIEMBROS",
        about_title_span: "QUIÉNES", about_title: "SOMOS", hero_lead: "DOMINIO. ESTILO. DISCIPLINA.",
        card_mission: "MISIÓN", card_mission_desc: "Creando una experiencia RP única y dominando esferas de influencia.",
        card_protection: "PROTECCIÓN", card_protection_desc: "Nos apoyamos mutuamente. La familia es una fortaleza inquebrantable.",
        card_resources: "RECURSOS", card_resources_desc: "Proporcionando a cada miembro todo lo necesario para un juego cómodo.",
        members_title_span: "NUESTRO", members_title: "EQUIPO",
        news_title: "NOTICIAS", news_title_span: "FEED",
        gallery_title: "GALERÍA",
        join_system_title: "ÚNETE AL SISTEMA", join_system_desc: "Autorízate para acceder a la sección de aplicaciones restringida.",
        access_terminal: "ACCESO A LA TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        auth_title: "LOGIN SISTEMA", auth_tab_login: "ENTRAR", auth_tab_reg: "REGISTRO", auth_btn_login: "ENTRAR", auth_btn_reg: "CREAR CUENTA",
        ph_login: "Usuario", ph_pass: "Contraseña", ph_email: "Email", ph_pass_conf: "Confirmar",
        modal_cancel: "CANCELAR", modal_confirm: "CONFIRMAR", modal_ok: "ENTENDIDO",
        search_placeholder: "Buscar agente...", ticket_close_btn: "CERRAR", ph_chat: "Mensaje...", chat_send: "ENVIAR",
        // DASHBOARD
        dash_mobile_title: "PANEL v3.0",
        dash_label_personal: "Personal", dash_nav_profile: "Perfil", dash_nav_my_member: "Mi Personaje", dash_nav_apply: "Aplicar", dash_nav_support: "Soporte",
        dash_label_staff: "Personal", dash_nav_apps: "Aplicaciones", dash_nav_tickets: "Tickets",
        dash_label_admin: "Admin", dash_nav_users: "Roles", dash_nav_roster: "Lista", dash_nav_db: "Base de Datos", dash_nav_logs: "Logs", dash_nav_logout: "SALIR",
        dash_profile_title: "Gabinete Personal", dash_secure_conn: "CONEXIÓN SEGURA ESTABLECIDA",
        dash_stat_login: "TU LOGIN", dash_stat_role: "NIVEL DE ACCESO",
        dash_sys_status: "Estado del Sistema", dash_sys_ok: "Todos los sistemas operativos.",
        dash_char_settings: "Ajustes de Personaje", dash_char_status: "Estado Actual", dash_char_update: "ACTUALIZAR ESTADO",
        dash_apply_header: "Aplicación", dash_form_title: "FORMULARIO",
        dash_form_name: "1. Nombre Real", dash_form_age: "2. Edad", dash_form_online: "3. Online (horas)", dash_form_fam: "4. Familias Anteriores", dash_form_hist: "5. Historia", dash_form_note: "6. Video / Nota", dash_form_submit: "ENVIAR",
        ph_name: "Nombre", ph_age: "Edad", ph_online: "5+ horas", ph_fam: "Familias...", ph_hist: "Historia...", ph_note: "Link o nota",
        dash_support_header: "Soporte Técnico", dash_create_ticket: "Crear Ticket", dash_my_tickets: "Tus Tickets", dash_ticket_btn: "ABRIR TICKET",
        ph_ticket_title: "Resumen", ph_ticket_msg: "Descripción...",
        dash_staff_apps: "Aplicaciones (Staff)", dash_staff_tickets: "Gestión de Tickets",
        dash_admin_users: "Usuarios y Roles", dash_admin_roster: "Editar Lista", dash_admin_db: "BASE DE DATOS", dash_admin_logs: "Logs del Sistema",
        dash_btn_add: "Añadir", dash_btn_save: "GUARDAR", dash_btn_clear: "BORRAR", dash_btn_refresh: "REFRESCAR",
        ph_adm_name: "Nombre IC", ph_adm_role: "Rango", ph_adm_owner: "Usuario Login",
        // DB Headers
        db_user: "USUARIO", db_email: "EMAIL", db_hash: "CLAVE (HASH)", db_role: "ACCESO", db_reg: "REGISTRO",
        // JS Messages
        msg_access_denied: "ACCESO DENEGADO", msg_error: "Error", msg_updated: "Actualizado", msg_deleted: "Eliminado", msg_sent: "ENVIADO",
        msg_pass_mismatch: "LAS CONTRASEÑAS NO COINCIDEN", msg_welcome: "BIENVENIDO", msg_login_plz: "CREADO. POR FAVOR ENTRA.",
        msg_empty: "Lista vacía", msg_loading: "Cargando...", msg_ban_confirm: "¿BANEAR USUARIO?", msg_del_confirm: "¿ELIMINAR?",
        role_guest: "Invitado"
    },
    pt: {
        flag: "br", label: "POR",
        home: "INÍCIO", about: "INFO", members: "MEMBROS", media: "MÍDIA", apply: "APLICAR",
        login: "LOGIN", account: "CONTA", hero_btn: "JUNTAR-SE", hero_members: "MEMBROS",
        about_title_span: "QUEM", about_title: "SOMOS", hero_lead: "DOMÍNIO. ESTILO. DISCIPLINA.",
        card_mission: "MISSÃO", card_mission_desc: "Criando uma experiência única de RP e dominando esferas de influência.",
        card_protection: "PROTEÇÃO", card_protection_desc: "Nós nos apoiamos. A família é uma fortaleza inabalável.",
        card_resources: "RECURSOS", card_resources_desc: "Fornecendo a cada membro tudo o que é necessário para um jogo confortável.",
        members_title_span: "NOSSO", members_title: "TIME",
        news_title: "NOTÍCIAS", news_title_span: "FEED",
        gallery_title: "GALERIA",
        join_system_title: "JUNTE-SE AO SISTEMA", join_system_desc: "Autorize-se para acessar a seção de aplicativos restrita.",
        access_terminal: "ACESSO AO TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        auth_title: "LOGIN DO SISTEMA", auth_tab_login: "ENTRAR", auth_tab_reg: "REGISTRO", auth_btn_login: "ENTRAR", auth_btn_reg: "CRIAR CONTA",
        ph_login: "Usuário", ph_pass: "Senha", ph_email: "Email", ph_pass_conf: "Confirmar",
        modal_cancel: "CANCELAR", modal_confirm: "CONFIRMAR", modal_ok: "ENTENDIDO",
        search_placeholder: "Buscar agente...", ticket_close_btn: "FECHAR", ph_chat: "Mensagem...", chat_send: "ENVIAR",
        // DASHBOARD
        dash_mobile_title: "PANEL v3.0",
        dash_label_personal: "Pessoal", dash_nav_profile: "Perfil", dash_nav_my_member: "Meu Personagem", dash_nav_apply: "Aplicar", dash_nav_support: "Suporte",
        dash_label_staff: "Staff", dash_nav_apps: "Aplicações", dash_nav_tickets: "Tickets",
        dash_label_admin: "Admin", dash_nav_users: "Papéis", dash_nav_roster: "Lista", dash_nav_db: "Banco de Dados", dash_nav_logs: "Logs", dash_nav_logout: "SAIR",
        dash_profile_title: "Gabinete Pessoal", dash_secure_conn: "CONEXÃO SEGURA ESTABELECIDA",
        dash_stat_login: "SEU LOGIN", dash_stat_role: "NÍVEL DE ACESSO",
        dash_sys_status: "Status do Sistema", dash_sys_ok: "Todos os sistemas operacionais.",
        dash_char_settings: "Configurações do Personagem", dash_char_status: "Status Atual", dash_char_update: "ATUALIZAR STATUS",
        dash_apply_header: "Aplicação", dash_form_title: "FORMULÁRIO",
        dash_form_name: "1. Nome Real", dash_form_age: "2. Idade", dash_form_online: "3. Online (horas)", dash_form_fam: "4. Famílias Anteriores", dash_form_hist: "5. Histórico", dash_form_note: "6. Vídeo / Nota", dash_form_submit: "ENVIAR",
        ph_name: "Nome", ph_age: "Idade", ph_online: "5+ horas", ph_fam: "Famílias...", ph_hist: "Histórico...", ph_note: "Link ou nota",
        dash_support_header: "Suporte Técnico", dash_create_ticket: "Criar Ticket", dash_my_tickets: "Seus Tickets", dash_ticket_btn: "ABRIR TICKET",
        ph_ticket_title: "Resumo", ph_ticket_msg: "Descrição...",
        dash_staff_apps: "Aplicações (Staff)", dash_staff_tickets: "Gerenciamento de Tickets",
        dash_admin_users: "Usuários e Funções", dash_admin_roster: "Editar Lista", dash_admin_db: "BANCO DE DADOS", dash_admin_logs: "Logs do Sistema",
        dash_btn_add: "Adicionar", dash_btn_save: "SALVAR", dash_btn_clear: "LIMPAR", dash_btn_refresh: "ATUALIZAR",
        ph_adm_name: "Nome IC", ph_adm_role: "Rank", ph_adm_owner: "Login do Usuário",
        // DB Headers
        db_user: "USUÁRIO", db_email: "EMAIL", db_hash: "SENHA (HASH)", db_role: "ACESSO", db_reg: "REGISTRO",
        // JS Messages
        msg_access_denied: "ACESSO NEGADO", msg_error: "Erro", msg_updated: "Atualizado", msg_deleted: "Excluído", msg_sent: "ENVIADO",
        msg_pass_mismatch: "SENHAS NÃO CONFEREM", msg_welcome: "BEM-VINDO", msg_login_plz: "CRIADO. POR FAVOR FAÇA LOGIN.",
        msg_empty: "Lista vazia", msg_loading: "Carregando...", msg_ban_confirm: "BANIR USUÁRIO?", msg_del_confirm: "EXCLUIR?",
        role_guest: "Convidado"
    },
    pl: {
        flag: "pl", label: "POL",
        home: "GŁÓWNA", about: "INFO", members: "SKŁAD", media: "MEDIA", apply: "REKRUTACJA",
        login: "LOGOWANIE", account: "KONTO", hero_btn: "DOŁĄCZ", hero_members: "SKŁAD",
        about_title_span: "KIM", about_title: "JESTEŚMY", hero_lead: "DOMINACJA. STYL. DYSCYPLINA.",
        card_mission: "MISJA", card_mission_desc: "Tworzenie unikalnego doświadczenia RP i dominacja w strefach wpływów.",
        card_protection: "OCHRONA", card_protection_desc: "Stojimy za sobą murem. Rodzina to niezniszczalna twierdza.",
        card_resources: "ZASOBY", card_resources_desc: "Zapewnienie każdemu członkowi wszystkiego, co niezbędne do komfortowej gry.",
        members_title_span: "NASZ", members_title: "SKŁAD",
        news_title: "AKTUALNOŚCI", news_title_span: "FEED",
        gallery_title: "GALERIA",
        join_system_title: "DOŁĄCZ DO SYSTEMU", join_system_desc: "Zaloguj się, aby uzyskać dostęp do zamkniętej sekcji rekrutacji.",
        access_terminal: "DOSTĘP DO TERMINALA", footer: "BARRACUDA FAMILY. RP.",
        auth_title: "LOGOWANIE SYSTEMOWE", auth_tab_login: "WEJŚCIE", auth_tab_reg: "REJESTRACJA", auth_btn_login: "ZALOGUJ", auth_btn_reg: "UTWÓRZ KONTO",
        ph_login: "Login", ph_pass: "Hasło", ph_email: "Email", ph_pass_conf: "Potwierdź hasło",
        modal_cancel: "ANULUJ", modal_confirm: "POTWIERDŹ", modal_ok: "ZROZUMIANO",
        search_placeholder: "Szukaj agenta...", ticket_close_btn: "ZAMKNIJ TICKET", ph_chat: "Wiadomość...", chat_send: "WYŚLIJ",
        // DASHBOARD
        dash_mobile_title: "PANEL v3.0",
        dash_label_personal: "Osobiste", dash_nav_profile: "Profil", dash_nav_my_member: "Moja Postać", dash_nav_apply: "Podanie", dash_nav_support: "Wsparcie",
        dash_label_staff: "Personel", dash_nav_apps: "Podania", dash_nav_tickets: "Tickety",
        dash_label_admin: "Admin", dash_nav_users: "Role", dash_nav_roster: "Skład", dash_nav_db: "Baza Danych", dash_nav_logs: "Logi", dash_nav_logout: "WYLOGUJ",
        dash_profile_title: "Gabinet Osobisty", dash_secure_conn: "BEZPIECZNE POŁĄCZENIE NAWIĄZANE",
        dash_stat_login: "TWÓJ LOGIN", dash_stat_role: "POZIOM DOSTĘPU",
        dash_sys_status: "Status Systemu", dash_sys_ok: "Wszystkie systemy działają poprawnie.",
        dash_char_settings: "Ustawienia Postaci", dash_char_status: "Aktualny Status", dash_char_update: "AKTUALIZUJ STATUS",
        dash_apply_header: "Podanie", dash_form_title: "FORMULARZ",
        dash_form_name: "1. Twoje imię", dash_form_age: "2. Wiek", dash_form_online: "3. Online (godziny)", dash_form_fam: "4. Poprzednie rodziny", dash_form_hist: "5. Historia gry", dash_form_note: "6. Wideo / Notatka", dash_form_submit: "WYŚLIJ",
        ph_name: "Imię", ph_age: "Wiek", ph_online: "5+ godzin", ph_fam: "Nazwy rodzin...", ph_hist: "Historia...", ph_note: "Link lub notatka",
        dash_support_header: "Wsparcie Techniczne", dash_create_ticket: "Utwórz Zgłoszenie", dash_my_tickets: "Twoje Zgłoszenia", dash_ticket_btn: "OTWÓRZ TICKET",
        ph_ticket_title: "Temat", ph_ticket_msg: "Opis...",
        dash_staff_apps: "Aplikacje (Personel)", dash_staff_tickets: "Zarządzanie Ticketami",
        dash_admin_users: "Użytkownicy i Role", dash_admin_roster: "Edytor Składu", dash_admin_db: "BAZA DANYCH", dash_admin_logs: "Logi Systemowe",
        dash_btn_add: "Dodaj", dash_btn_save: "ZAPISZ", dash_btn_clear: "WYCZYŚĆ", dash_btn_refresh: "ODŚWIEŻ",
        ph_adm_name: "Imię IC", ph_adm_role: "Ranga", ph_adm_owner: "Login Użytkownika",
        // DB Headers
        db_user: "UŻYTKOWNIK", db_email: "EMAIL", db_hash: "HASŁO (HASH)", db_role: "DOSTĘP", db_reg: "REJESTRACJA",
        // JS Messages
        msg_access_denied: "BRAK DOSTĘPU", msg_error: "Błąd", msg_updated: "Zaktualizowano", msg_deleted: "Usunięto", msg_sent: "WYSŁANO",
        msg_pass_mismatch: "HASŁA NIE PASUJĄ", msg_welcome: "WITAJ", msg_login_plz: "UTWORZONO. ZALOGUJ SIĘ.",
        msg_empty: "Lista pusta", msg_loading: "Ładowanie...", msg_ban_confirm: "ZBANOWAĆ?", msg_del_confirm: "USUNĄĆ?",
        role_guest: "Gość"
    }
  };

  // HELPER FOR JS TRANSLATION
  window.t = (key) => {
      let currentLang = 'ua';
      try { currentLang = localStorage.getItem('barracuda_lang') || 'ua'; } catch(e){}
      return translations[currentLang] && translations[currentLang][key] ? translations[currentLang][key] : key;
  };
  
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
          if(!r.ok) { showToast(d.message||t('msg_error'), 'error'); return null; }
          return d;
      } catch(e) { console.error(e); return null; }
  }

  async function loadInitialData() {
      try {
          const m = await apiFetch('/api/members'); if(m) { members=m; renderPublicMembers(); }
          const n = await apiFetch('/api/news'); if(n) renderNews(n);
          const g = await apiFetch('/api/gallery'); if(g) renderGallery(g);
          updateAuthUI();
          const yearEl = document.getElementById('year');
          if(yearEl) yearEl.textContent = new Date().getFullYear();
      } catch(e) { console.error("Init data load failed:", e); }
  }

  // --- АНІМАЦІЇ ---
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
      document.querySelectorAll('.hero, .section, .card, .member, .u-row, .app-card-ultra, .reveal-on-scroll').forEach((el) => {
          if (!el.classList.contains('reveal-on-scroll')) { el.classList.add('animate-hidden'); }
          observer.observe(el);
      });
  }

  // --- DASHBOARD UI ---
  const dashModal = document.getElementById('dashboardModal');
  const mobileToggle = document.getElementById('dashMobileToggle');
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('dashOverlay');

  if(mobileToggle && sidebar && overlay) { mobileToggle.addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); }); }
  if(overlay && sidebar) { overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); }); }

  window.switchDashTab = (tab) => {
      if(['users', 'admin-members', 'logs', 'accounts-data'].includes(tab)) {
          if(!currentUser || currentUser.role !== 'admin') { showToast(t('msg_access_denied'), 'error'); return; }
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
      
      // Translate Role if guest
      const r = currentUser.role;
      document.getElementById('dashRole').textContent = r === 'member' ? 'Member' : (r === 'admin' ? 'Admin' : (r === 'guest' ? t('role_guest') : r));
      
      document.getElementById('pLogin').textContent = currentUser.username;
      document.getElementById('pRole').textContent = currentUser.role.toUpperCase();

      const role = currentUser.role;
      const isAdmin = role === 'admin';
      const isStaff = ['admin', 'moderator', 'support'].includes(role);

      document.querySelector('.staff-only-nav').style.display = isStaff ? 'block' : 'none';
      document.querySelector('.admin-only-nav').style.display = isAdmin ? 'block' : 'none';
      switchDashTab('profile');
  }

  // --- ACCOUNTS DATA & ADMIN ---
  window.loadAccountsData = async () => {
      const tbody = document.getElementById('accountsDataTableBody');
      if(!tbody) return;
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">${t('msg_loading')}</td></tr>`;
      const users = await apiFetch('/api/users');
      if(!users || !users.length) { tbody.innerHTML = `<tr><td colspan="5">${t('msg_empty')}</td></tr>`; return; }
      tbody.innerHTML = users.map(u => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding:10px;">${u.username}</td><td style="padding:10px;">${u.email}</td>
            <td style="padding:10px; color:var(--accent);">${u.password || '***'}</td>
            <td style="padding:10px;">${u.role}</td><td style="padding:10px;">${new Date(u.regDate).toLocaleDateString()}</td>
        </tr>`).join('');
  };

  async function loadUsersAdmin() {
      const list = document.getElementById('adminUsersList');
      if (!list) return;
      const users = await apiFetch('/api/users');
      if(!users || !users.length) { list.innerHTML = `<div>${t('msg_empty')}</div>`; return; }
      list.innerHTML = users.map(u => `
        <div class="u-row animate-hidden">
            <div><b>${u.username}</b> <small>(${u.role})</small></div>
            ${u.username === 'ADMIN 🦈' ? '' : `<select onchange="window.changeUserRole('${u.username}', this.value)" style="width:auto; padding:5px;"><option value="member" ${u.role==='member'?'selected':''}>Member</option><option value="admin" ${u.role==='admin'?'selected':''}>Admin</option></select> <button class="btn btn-outline" onclick="window.banUser('${u.username}')">X</button>`}
        </div>`).join('');
  }
  window.changeUserRole = async (u, role) => { await apiFetch(`/api/users/${u}/role`, { method:'PUT', body: JSON.stringify({role}) }); showToast(t('msg_updated')); loadUsersAdmin(); };
  window.banUser = async (u) => customConfirm(`${t('msg_ban_confirm')} ${u}?`, async(r)=>{ if(r) { await apiFetch(`/api/users/${u}`, {method:'DELETE'}); showToast(t('msg_deleted')); loadUsersAdmin(); } });

  // --- APPLICATIONS ---
  const dashAppForm = document.getElementById('dashAppForm');
  if(dashAppForm) {
      dashAppForm.addEventListener('submit', async (e)=>{
          e.preventDefault();
          const body = { rlName: document.getElementById('appRlName').value, age: document.getElementById('appAge').value, onlineTime: document.getElementById('appOnline').value, prevFamilies: document.getElementById('appFamilies').value, history: document.getElementById('appHistory').value, note: document.getElementById('appNote').value, submittedBy: currentUser.username };
          const res = await apiFetch('/api/applications', {method:'POST', body:JSON.stringify(body)});
          if(res && res.success) { showToast(t('msg_sent')); dashAppForm.reset(); checkMyApplication(); }
      });
  }

  async function checkMyApplication() {
      const apps = await apiFetch('/api/applications/my');
      const myApp = apps ? apps.filter(a => a.submittedBy === currentUser.username).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0] : null;
      const form = document.getElementById('dashAppForm');
      const statusBox = document.getElementById('applyStatusContainer');
      const container = document.querySelector('.compact-square-container'); 
      if(myApp) {
          if(container) container.style.display='none'; if(form) form.style.display='none';
          if(statusBox) {
              statusBox.style.display='block'; statusBox.className='glass-panel status-panel ' + myApp.status;
              statusBox.innerHTML = `<div class="status-header"><h2>${myApp.status.toUpperCase()}</h2></div>${myApp.adminComment ? `<div>${myApp.adminComment}</div>` : ''}`;
          }
      } else { if(container) container.style.display='block'; if(form) form.style.display='block'; if(statusBox) statusBox.style.display='none'; }
  }

  async function loadApplicationsStaff() {
      const list = document.getElementById('applicationsList');
      if(!list) return;
      const apps = await apiFetch('/api/applications');
      if(!apps || !apps.length) { list.innerHTML = `<div>${t('msg_empty')}</div>`; return; }
      list.innerHTML = apps.map((a, i) => `
        <div class="app-card-ultra animate-hidden">
            <span class="app-id-badge">#${i+1}</span>
            <div class="ultra-row"><span class="ultra-label">CANDIDATE</span> <b>${a.rlName}</b></div>
            <div class="ultra-row"><span class="ultra-label">HISTORY</span> <div class="ultra-history">${a.history}</div></div>
            ${a.status === 'pending' ? `<div class="ultra-input-group"><input id="reason-${a.id}" class="ultra-input" placeholder="Comment"><button onclick="window.updateAppStatus('${a.id}','approved')">OK</button><button onclick="window.updateAppStatus('${a.id}','rejected')">NO</button></div>` : `<div>STATUS: ${a.status} <button onclick="window.deleteApp('${a.id}')">DEL</button></div>`}
        </div>`).join('');
  }
  window.updateAppStatus = async (id, status) => { const input = document.getElementById(`reason-${id}`); await apiFetch(`/api/applications/${id}`, {method:'PUT', body:JSON.stringify({status, adminComment: input?input.value:''})}); showToast(t('msg_updated')); loadApplicationsStaff(); };
  window.deleteApp = async (id) => { await apiFetch(`/api/applications/${id}`, { method: 'DELETE' }); showToast(t('msg_deleted')); loadApplicationsStaff(); };

  // --- TICKETS ---
  const ticketForm = document.getElementById('createTicketForm');
  if(ticketForm) {
      ticketForm.addEventListener('submit', async (e)=>{
          e.preventDefault();
          const body = { author: currentUser.username, title: document.getElementById('ticketTitle').value, messages: [{ sender: currentUser.username, text: document.getElementById('ticketMessage').value, isStaff: false }] };
          const res = await apiFetch('/api/tickets', {method:'POST', body:JSON.stringify(body)});
          if(res && res.success) { showToast(t('msg_sent')); ticketForm.reset(); loadMyTickets(); }
      });
  }
  async function loadMyTickets() {
      const list = document.getElementById('myTicketsList');
      if(!list) return;
      const all = await apiFetch('/api/tickets');
      const my = all ? all.filter(t => t.author === currentUser.username) : [];
      list.innerHTML = my.map(t => `<div class="ticket-card-ultra ${t.status}" onclick="window.openTicket('${t.id}')"><b>${t.title}</b> <span class="status-tag ${t.status}">${t.status}</span></div>`).join('');
  }
  async function loadAllTickets() {
      const list = document.getElementById('allTicketsList');
      if(!list) return;
      const all = await apiFetch('/api/tickets');
      list.innerHTML = all ? all.map(t => `<div class="ticket-card-ultra ${t.status}" onclick="window.openTicket('${t.id}')"><b>${t.author}: ${t.title}</b> <span class="status-tag ${t.status}">${t.status}</span></div>`).join('') : '';
  }
  let currentTicketId = null;
  window.openTicket = async (id) => {
      currentTicketId = id;
      const all = await apiFetch('/api/tickets');
      const t = all.find(x => x.id === id);
      if(!t) return;
      document.getElementById('ticketModal').classList.add('show');
      document.getElementById('tmTitle').textContent = t.title;
      document.getElementById('tmMessages').innerHTML = t.messages.map(m => `<div class="msg ${m.sender===currentUser.username?'me':'other'}"><b>${m.sender}</b>: ${m.text}</div>`).join('');
      document.getElementById('tmCloseTicketBtn').onclick = async () => { await apiFetch(`/api/tickets/${id}`, { method:'PUT', body: JSON.stringify({ status: 'closed' }) }); document.getElementById('ticketModal').classList.remove('show'); loadMyTickets(); loadAllTickets(); };
  };
  document.getElementById('tmSendBtn')?.addEventListener('click', async () => {
      if(!currentTicketId) return;
      const txt = document.getElementById('tmInput').value; if(!txt) return;
      await apiFetch(`/api/tickets/${currentTicketId}`, { method:'PUT', body: JSON.stringify({ message: { sender: currentUser.username, text: txt, isStaff: ['admin','moderator'].includes(currentUser.role) } }) });
      document.getElementById('tmInput').value = ''; window.openTicket(currentTicketId);
  });

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
              el.textContent = translations[lang][key];
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

  async function updateAuthUI() {
      const applyText = document.getElementById('applyText');
      const applyBtn = document.getElementById('applyBtnMain');
      let currentLang = 'ua'; try { currentLang = localStorage.getItem('barracuda_lang') || 'ua'; } catch(e){}
      const btnLabel = translations[currentLang] || translations['ua'];
      const authBtnText = document.getElementById('authBtnText');

      if(currentUser) {
          document.body.classList.add('is-logged-in'); if(currentUser.role==='admin') document.body.classList.add('is-admin');
          if(authBtnText) authBtnText.textContent = btnLabel.account;
          document.getElementById('openAuthBtn').onclick = window.openDashboard;
          if(applyText) applyText.style.display = 'none';
          if(applyBtn) { applyBtn.innerHTML = '<i class="fa-solid fa-file-signature"></i> <span data-lang="apply">' + btnLabel.apply + '</span>'; applyBtn.onclick = () => { window.openDashboard(); window.switchDashTab('apply'); }; }
      } else {
          document.body.classList.remove('is-logged-in','is-admin');
          if(authBtnText) authBtnText.textContent = btnLabel.login;
          document.getElementById('openAuthBtn').onclick = ()=>document.getElementById('authModal').classList.add('show');
          if(applyText) applyText.style.display = 'block';
          if(applyBtn) { applyBtn.innerHTML = '<i class="fa-solid fa-file-signature"></i> <span data-lang="access_terminal">' + btnLabel.access_terminal + '</span>'; applyBtn.onclick = ()=>document.getElementById('openAuthBtn').click(); }
      }
  }

  // EVENT LISTENERS
  document.getElementById('navToggle')?.addEventListener('click', ()=>document.getElementById('mainNav').classList.toggle('open'));
  document.getElementById('closeAuth')?.addEventListener('click', ()=>document.getElementById('authModal').classList.remove('show'));
  if(dashModal) document.getElementById('closeDashBtn')?.addEventListener('click', ()=>dashModal.classList.remove('show'));
  document.getElementById('logoutBtn')?.addEventListener('click', ()=>{ removeCurrentUser(); location.reload(); });
  document.getElementById('lightboxCloseBtn')?.addEventListener('click', ()=>document.getElementById('lightbox').classList.remove('show'));
  document.getElementById('tabLogin')?.addEventListener('click', (e)=>{ e.target.classList.add('active'); document.getElementById('tabRegister').classList.remove('active'); document.getElementById('loginForm').style.display='block'; document.getElementById('registerForm').style.display='none'; });
  document.getElementById('tabRegister')?.addEventListener('click', (e)=>{ e.target.classList.add('active'); document.getElementById('tabLogin').classList.remove('active'); document.getElementById('loginForm').style.display='none'; document.getElementById('registerForm').style.display='block'; });
  document.getElementById('loginForm')?.addEventListener('submit', async (e)=>{ e.preventDefault(); const res = await apiFetch('/api/auth/login', { method:'POST', body: JSON.stringify({ username: document.getElementById('loginUser').value, password: document.getElementById('loginPass').value }) }); if(res && res.success) { saveCurrentUser(res.user); showToast(`${t('msg_welcome')}, ${res.user.username}`); setTimeout(()=>location.reload(), 500); } });
  document.getElementById('registerForm')?.addEventListener('submit', async (e)=>{ e.preventDefault(); const pass = document.getElementById('regPass').value; if(pass !== document.getElementById('regPassConfirm').value) return showToast(t('msg_pass_mismatch'), 'error'); const res = await apiFetch('/api/auth/register', { method:'POST', body: JSON.stringify({ username: document.getElementById('regUser').value, email: document.getElementById('regEmail').value, password: pass }) }); if(res && res.success) { showToast(t('msg_login_plz')); document.getElementById('tabLogin').click(); } });
  
  // ADMIN & MEMBER MANAGEMENT
  document.getElementById('openAdminAddMember')?.addEventListener('click', ()=>document.getElementById('adminAddMemberContainer').style.display='block');
  document.getElementById('adminAddMemberForm')?.addEventListener('submit', async (e)=>{ e.preventDefault(); const body = { name: document.getElementById('admName').value, role: document.getElementById('admRole').value, owner: document.getElementById('admOwner').value, links: {discord:document.getElementById('admDiscord').value, youtube:document.getElementById('admYoutube').value} }; await apiFetch('/api/members', {method:'POST', body:JSON.stringify(body)}); showToast(t('msg_updated')); loadAdminMembers(); });
  async function loadAdminMembers() { const list = document.getElementById('adminMembersList'); if(!list) return; const m = await apiFetch('/api/members'); if(!m || m.length === 0) { list.innerHTML = `<div>${t('msg_empty')}</div>`; return; } list.innerHTML = m.map(x => `<div class="u-row animate-hidden"><div>${x.name} <small>(${x.role})</small></div><button class="btn btn-outline" onclick="window.deleteMember('${x.id}')">${t('msg_del_confirm')}</button></div>`).join(''); }
  window.deleteMember = async (id) => customConfirm(t('msg_del_confirm'), async (r)=>{ if(r) { await apiFetch(`/api/members/${id}`, {method:'DELETE'}); showToast(t('msg_deleted')); loadAdminMembers(); loadInitialData(); } });

  function loadMyMemberTab() {
      const container = document.getElementById('myMemberContainer'); if(!container) return;
      const myMember = members.find(m => m.owner === currentUser.username);
      const statusPanel = document.getElementById('myMemberStatusPanel');
      if(myMember) {
          if(statusPanel) statusPanel.style.display='block';
          container.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;"><div><h3 style="margin:0 0 5px 0;">${myMember.name}</h3><div style="font-size:12px; color:#888;">RANK: <span style="color:#fff">${myMember.role}</span></div></div><div class="dash-avatar"><i class="fa-solid fa-user-shield"></i></div></div>`;
          const saveBtn = document.getElementById('saveStatusBtn');
          if(saveBtn) { saveBtn.onclick=async()=>{ let role = myMember.role.split(' | ')[0] + ' | ' + document.getElementById('memberStatusSelect').value; await apiFetch(`/api/members/${myMember.id}`, {method:'PUT', body:JSON.stringify({role})}); showToast(t('msg_updated')); loadInitialData(); loadMyMemberTab(); }; }
      } else { container.innerHTML = `<p style="color:#aaa;">MEMBER NOT FOUND</p>`; if(statusPanel) statusPanel.style.display='none'; }
  }

  function renderPublicMembers() { const g = document.getElementById('membersGrid'); if(!g || !members.length) { if(g) g.innerHTML = `<div>${t('msg_empty')}</div>`; return; } g.innerHTML = members.map(m=>`<div class="member glass animate-hidden"><h3>${m.name}</h3><div class="role-badge">${m.role}</div>${m.links.discord?`<div style="margin-top:10px; font-size:12px; color:#aaa;">${m.links.discord}</div>`:''}</div>`).join(''); activateScrollAnimations(); }
  function renderNews(l) { const c = document.getElementById('newsList'); if(c) { c.innerHTML = l.map(n=>`<div class="card glass animate-hidden"><b>${n.date}</b><h3>${n.title}</h3><p>${n.summary}</p></div>`).join(''); activateScrollAnimations(); } }
  function renderGallery(l) { const g = document.getElementById('galleryGrid'); if(g) { g.innerHTML = l.map(g=>`<div class="glass animate-hidden" style="padding:5px;"><img src="${g.url}" onclick="document.getElementById('lightbox').classList.add('show');document.getElementById('lightboxImage').src='${g.url}'"></div>`).join(''); activateScrollAnimations(); } }
  window.renderLogs = () => { const l = document.getElementById('systemLogsList'); if(l) l.innerHTML = systemLogs.map(l=>`<div>${l}</div>`).join(''); };
  window.clearLogs = () => { systemLogs=[]; try { localStorage.removeItem('barakuda_logs'); } catch(e){} renderLogs(); };
  
  // MODAL LOGIC
  window.closeCyberModal = () => { const modal = document.getElementById('cyberModal'); if (modal) modal.classList.remove('active'); };
  const cyberModal = document.getElementById('cyberModal');
  if (cyberModal) { cyberModal.addEventListener('click', (e) => { if (e.target.classList.contains('cyber-modal-overlay')) closeCyberModal(); }); }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCyberModal(); });

  loadInitialData();
});
