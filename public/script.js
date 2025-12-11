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

  // ОНОВЛЕНИЙ ОБ'ЄКТ ПЕРЕКЛАДІВ
  const translations = {
    ua: {
        flag: "ua", label: "UKR",
        home: "ГОЛОВНА", about: "ІНФО", members: "СКЛАД", shop: "МАГАЗИН", media: "МЕДІА", apply: "ВСТУП",
        login: "ВХІД", account: "АКАУНТ", hero_btn: "ПРИЄДНАТИСЬ", hero_members: "СКЛАД",
        about_title_span: "ХТО", about_title: "МИ Є", hero_lead: "ДОМІНУВАННЯ. СТИЛЬ. ДИСЦИПЛІНА.",
        about_main_desc: "BARRACUDA — це елітна сім'я та організація, що об'єднує гравців на провідних RP проектах. Ми граємо на різних серверах GTA V, поширюючи свій вплив та встановлюючи свої правила.<br><br>Ми — це більше, ніж просто клан. Це братерство, скріплене залізною дисципліною та амбіціями. Ми контролюємо ресурси, захоплюємо території та завжди прикриваємо спини один одному. Наша мета — абсолютна першість у кожному місті, куди ступає нога Барракуди.",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "ВЛАСНИК",
        members_title_span: "НАШ", members_title: "СКЛАД",
        shop_title: "МАГАЗИН", shop_desc: "Ексклюзивні товари для членів сім'ї. Оплата здійснюється через Discord або внутрішню валюту.",
        news_title: "СТРІЧКА", news_title_span: "НОВИН",
        gallery_title: "ГАЛЕРЕЯ",
        join_system_title: "ПРИЄДНУЙСЯ ДО СИСТЕМИ", join_system_desc: "Авторизуйтесь, щоб отримати доступ до закритого розділу подачі заявок.",
        access_terminal: "ДОСТУП ДО ТЕРМІНАЛУ", footer: "BARRACUDA FAMILY. RP.",
        dash_label_personal: "Особисте", dash_nav_profile: "Профіль", dash_nav_my_member: "Мій Персонаж", dash_nav_apply: "Заявка в сім'ю", dash_nav_support: "Техпідтримка",
        dash_label_staff: "Персонал", dash_nav_apps: "Розгляд заявок", dash_nav_tickets: "Всі тікети",
        dash_label_admin: "Адміністратор", dash_nav_shop: "Магазин (Керування)", dash_nav_users: "Керування ролями", dash_nav_roster: "Редактор складу", dash_nav_db: "База даних", dash_nav_logs: "Логи", dash_nav_logout: "ЗАВЕРШИТИ СЕАНС",
        dash_profile_title: "Особистий кабінет", dash_secure_conn: "БЕЗПЕЧНЕ ПІДКЛЮЧЕННЯ ВСТАНОВЛЕНО",
        dash_stat_login: "ВАШ ЛОГІН", dash_stat_role: "РІВЕНЬ ДОСТУПУ",
        dash_sys_status: "Статус системи", dash_sys_ok: "Всі системи працюють у штатному режимі.",
        dash_char_settings: "Налаштування персонажа", dash_char_status: "Актуальний статус", dash_char_update: "ОНОВИТИ СТАТУС",
        dash_shop_admin_title: "Керування Магазином", dash_shop_add: "Додати товар", dash_shop_list: "Список товарів", btn_add_item: "ДОДАТИ ТОВАР",
        dash_apply_header: "Подача заявки", dash_form_title: "АНКЕТА",
        dash_form_name: "1. Ваше реальне ім'я", dash_form_age: "2. Ваш вік", dash_form_online: "3. Середній онлайн (годин)", dash_form_fam: "4. В яких сім'ях бували", dash_form_hist: "5. Історія гри", dash_form_note: "6. Посилання на відкат / Коментар", dash_form_submit: "ВІДПРАВИТИ",
        ph_name: "Ім'я", ph_age: "Вік", ph_online: "5+ годин", ph_fam: "Назви сімей...", ph_hist: "Де грали...", ph_note: "YouTube або коментар",
        dash_support_header: "Технічна підтримка", dash_create_ticket: "Створити запит", dash_my_tickets: "Ваші запити", dash_ticket_btn: "ВІДКРИТИ ТІКЕТ",
        ph_ticket_title: "Коротко про проблему", ph_ticket_msg: "Опис ситуації...",
        auth_title: "СИСТЕМНИЙ ВХІД", auth_tab_login: "ВХІД", auth_tab_reg: "РЕЄСТРАЦІЯ", auth_btn_login: "УВІЙТИ", auth_btn_reg: "СТВОРИТИ АКАУНТ",
        ph_login: "Логин", ph_pass: "Пароль", ph_email: "Email", ph_pass_conf: "Підтвердіть пароль",
        modal_cancel: "СКАСУВАТИ", modal_confirm: "ПІДТВЕРДИТИ", modal_ok: "ЗРОЗУМІЛО",
        search_placeholder: "Пошук агента...", ticket_close_btn: "ЗАКРИТИ ТІКЕТ", ph_chat: "Повідомлення...", chat_send: "НАДІСЛАТИ",
        msg_access_denied: "ДОСТУП ЗАБОРОНЕНО", msg_welcome: "ВІТАЄМО", msg_error: "Помилка", msg_pass_mismatch: "ПАРОЛІ НЕ СПІВПАДАЮТЬ",
        msg_created_login: "СТВОРЕНО. БУДЬ ЛАСКА, УВІЙДІТЬ.", msg_app_sent: "ЗАЯВКУ ВІДПРАВЛЕНО", msg_updated: "ОНОВЛЕНО", msg_deleted: "ВИДАЛЕНО",
        msg_ticket_created: "ТІКЕТ СТВОРЕНО", msg_empty_list: "Список порожній", msg_confirm_ban: "ЗАБАНИТИ КОРИСТУВАЧА?", msg_confirm_delete: "Видалити учасника?",
        msg_member_added: "Учасника додано", msg_item_added: "Товар додано",
        lbl_candidate: "КАНДИДАТ", lbl_history: "ІСТОРІЯ", lbl_status: "СТАТУС", btn_approve: "ОК", btn_reject: "НІ", btn_delete: "ВИДАЛИТИ", btn_ban: "BAN", btn_buy: "ПРИДБАТИ"
    },
    en: {
        flag: "gb", label: "ENG",
        home: "HOME", about: "INFO", members: "ROSTER", shop: "SHOP", media: "MEDIA", apply: "APPLY",
        login: "LOGIN", account: "ACCOUNT", hero_btn: "JOIN US", hero_members: "ROSTER",
        about_title_span: "WHO", about_title: "WE ARE", hero_lead: "DOMINANCE. STYLE. DISCIPLINE.",
        about_main_desc: "BARRACUDA is an elite family and organization uniting players on leading RP projects. We operate on various GTA V servers, expanding our influence and setting our own rules.<br><br>We are more than just a clan. This is a brotherhood forged by iron discipline and ambition. We control resources, conquer territories, and always watch each other's backs. Our goal is absolute supremacy in every city Barracuda steps into.",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "OWNER",
        members_title_span: "OUR", members_title: "ROSTER",
        shop_title: "SHOP", shop_desc: "Exclusive items for family members. Payment via Discord or internal currency.",
        news_title: "NEWS", news_title_span: "FEED",
        gallery_title: "GALLERY",
        join_system_title: "JOIN THE SYSTEM", join_system_desc: "Authorize to access the restricted application section.",
        access_terminal: "ACCESS TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        dash_label_personal: "Personal", dash_nav_profile: "Profile", dash_nav_my_member: "My Character", dash_nav_apply: "Join Family", dash_nav_support: "Support",
        dash_label_staff: "Staff", dash_nav_apps: "Applications", dash_nav_tickets: "All Tickets",
        dash_label_admin: "Administrator", dash_nav_shop: "Shop (Manage)", dash_nav_users: "User Roles", dash_nav_roster: "Edit Roster", dash_nav_db: "Database", dash_nav_logs: "Logs", dash_nav_logout: "LOGOUT",
        dash_profile_title: "Personal Cabinet", dash_secure_conn: "SECURE CONNECTION ESTABLISHED",
        dash_stat_login: "YOUR LOGIN", dash_stat_role: "ACCESS LEVEL",
        dash_sys_status: "System Status", dash_sys_ok: "All systems operational.",
        dash_char_settings: "Character Settings", dash_char_status: "Current Status", dash_char_update: "UPDATE STATUS",
        dash_shop_admin_title: "Shop Management", dash_shop_add: "Add Item", dash_shop_list: "Item List", btn_add_item: "ADD ITEM",
        dash_apply_header: "Application", dash_form_title: "FORM",
        dash_form_name: "1. Real Name", dash_form_age: "2. Age", dash_form_online: "3. Online (hours)", dash_form_fam: "4. Previous Families", dash_form_hist: "5. Game History", dash_form_note: "6. Video / Note", dash_form_submit: "SUBMIT",
        ph_name: "Name", ph_age: "Age", ph_online: "5+ hours", ph_fam: "Family names...", ph_hist: "History...", ph_note: "Link or note",
        dash_support_header: "Tech Support", dash_create_ticket: "Create Ticket", dash_my_tickets: "Your Tickets", dash_ticket_btn: "OPEN TICKET",
        ph_ticket_title: "Issue Summary", ph_ticket_msg: "Description...",
        auth_title: "SYSTEM LOGIN", auth_tab_login: "LOGIN", auth_tab_reg: "REGISTER", auth_btn_login: "ENTER SYSTEM", auth_btn_reg: "CREATE ACCOUNT",
        ph_login: "Login", ph_pass: "Password", ph_email: "Email", ph_pass_conf: "Confirm Password",
        modal_cancel: "CANCEL", modal_confirm: "CONFIRM", modal_ok: "UNDERSTOOD",
        search_placeholder: "Search agent...", ticket_close_btn: "CLOSE TICKET", ph_chat: "Message...", chat_send: "SEND",
        msg_access_denied: "ACCESS DENIED", msg_welcome: "WELCOME", msg_error: "Error", msg_pass_mismatch: "PASSWORDS DO NOT MATCH",
        msg_created_login: "CREATED. PLEASE LOGIN.", msg_app_sent: "APPLICATION SENT", msg_updated: "UPDATED", msg_deleted: "DELETED",
        msg_ticket_created: "TICKET CREATED", msg_empty_list: "List is empty", msg_confirm_ban: "BAN USER?", msg_confirm_delete: "Delete member?",
        msg_member_added: "Member added", msg_item_added: "Item added",
        lbl_candidate: "CANDIDATE", lbl_history: "HISTORY", lbl_status: "STATUS", btn_approve: "OK", btn_reject: "NO", btn_delete: "DEL", btn_ban: "BAN", btn_buy: "BUY"
    },
    ru: {
        flag: "ru", label: "RUS",
        home: "ГЛАВНАЯ", about: "ИНФО", members: "СОСТАВ", shop: "МАГАЗИН", media: "МЕДИА", apply: "ВСТУПИТЬ",
        login: "ВХОД", account: "АККАУНТ", hero_btn: "ПРИСОЕДИНИТЬСЯ", hero_members: "СОСТАВ",
        about_title_span: "КТО", about_title: "МЫ ЕСТЬ", hero_lead: "ДОМИНИРОВАНИЕ. СТИЛЬ. ДИСЦИПЛИНА.",
        about_main_desc: "BARRACUDA — это элитная семья и организация, объединяющая игроков на ведущих RP проектах. Мы играем на различных серверах GTA V, распространяя свое влияние и устанавливая свои правила.<br><br>Мы — это больше, чем просто клан. Это братство, скрепленное железной дисциплиной и амбициями. Мы контролируем ресурсы, захватываем территории и всегда прикрываем спины друг друга. Наша цель — абсолютное первенство.",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "ВЛАДЕЛЕЦ",
        members_title_span: "НАШ", members_title: "СОСТАВ",
        shop_title: "МАГАЗИН", shop_desc: "Эксклюзивные товары для членов семьи. Оплата через Discord или внутреннюю валюту.",
        news_title: "ЛЕНТА", news_title_span: "НОВОСТЕЙ",
        gallery_title: "ГАЛЕРЕЯ",
        join_system_title: "ПРИСОЕДИНЯЙСЯ К СИСТЕМЕ", join_system_desc: "Авторизуйтесь, чтобы получить доступ к закрытому разделу подачи заявок.",
        access_terminal: "ДОСТУП К ТЕРМИНАЛУ", footer: "BARRACUDA FAMILY. RP.",
        dash_label_personal: "Личное", dash_nav_profile: "Профиль", dash_nav_my_member: "Мой Персонаж", dash_nav_apply: "Заявка в семью", dash_nav_support: "Техподдержка",
        dash_label_staff: "Персонал", dash_nav_apps: "Заявки", dash_nav_tickets: "Все тикеты",
        dash_label_admin: "Администратор", dash_nav_shop: "Магазин (Упр.)", dash_nav_users: "Роли", dash_nav_roster: "Редактор состава", dash_nav_db: "База данных", dash_nav_logs: "Логи", dash_nav_logout: "ВЫЙТИ",
        dash_profile_title: "Личный кабинет", dash_secure_conn: "БЕЗОПАСНОЕ СОЕДИНЕНИЕ УСТАНОВЛЕНО",
        dash_stat_login: "ВАШ ЛОГИН", dash_stat_role: "УРОВЕНЬ ДОСТУПА",
        dash_sys_status: "Статус системы", dash_sys_ok: "Все системы работают в штатном режиме.",
        dash_char_settings: "Настройки персонажа", dash_char_status: "Текущий статус", dash_char_update: "ОБНОВИТЬ СТАТУС",
        dash_shop_admin_title: "Управление Магазином", dash_shop_add: "Добавить товар", dash_shop_list: "Список товаров", btn_add_item: "ДОБАВИТЬ ТОВАР",
        dash_apply_header: "Подача заявки", dash_form_title: "АНКЕТА",
        dash_form_name: "1. Ваше реальное имя", dash_form_age: "2. Ваш возраст", dash_form_online: "3. Средний онлайн (часов)", dash_form_fam: "4. В каких семьях были", dash_form_hist: "5. История игры", dash_form_note: "6. Ссылка на откат / Комментарий", dash_form_submit: "ОТПРАВИТЬ",
        ph_name: "Имя", ph_age: "Возраст", ph_online: "5+ часов", ph_fam: "Названия семей...", ph_hist: "Где играли...", ph_note: "YouTube или комментарий",
        dash_support_header: "Техническая поддержка", dash_create_ticket: "Создать запрос", dash_my_tickets: "Ваши запросы", dash_ticket_btn: "ОТКРЫТЬ ТИКЕТ",
        ph_ticket_title: "Кратко о проблеме", ph_ticket_msg: "Описание ситуации...",
        auth_title: "СИСТЕМНЫЙ ВХОД", auth_tab_login: "ВХОД", auth_tab_reg: "РЕГИСТРАЦИЯ", auth_btn_login: "ВОЙТИ", auth_btn_reg: "СОЗДАТЬ АККАУНТ",
        ph_login: "Логин", ph_pass: "Пароль", ph_email: "Email", ph_pass_conf: "Подтвердите пароль",
        modal_cancel: "ОТМЕНА", modal_confirm: "ПОДТВЕРДИТЬ", modal_ok: "ПОНЯТНО",
        search_placeholder: "Поиск агента...", ticket_close_btn: "ЗАКРЫТЬ ТИКЕТ", ph_chat: "Сообщение...", chat_send: "ОТПРАВИТЬ",
        msg_access_denied: "ДОСТУП ЗАПРЕЩЕН", msg_welcome: "ДОБРО ПОЖАЛОВАТЬ", msg_error: "Ошибка", msg_pass_mismatch: "ПАРОЛИ НЕ СОВПАДАЮТ",
        msg_created_login: "СОЗДАНО. ВОЙДИТЕ В СИСТЕМУ.", msg_app_sent: "ЗАЯВКА ОТПРАВЛЕНА", msg_updated: "ОБНОВЛЕНО", msg_deleted: "УДАЛЕНО",
        msg_ticket_created: "ТИКЕТ СОЗДАН", msg_empty_list: "Список пуст", msg_confirm_ban: "ЗАБАНИТЬ ПОЛЬЗОВАТЕЛЯ?", msg_confirm_delete: "Удалить участника?",
        msg_member_added: "Участник добавлен", msg_item_added: "Товар добавлен",
        lbl_candidate: "КАНДИДАТ", lbl_history: "ИСТОРИЯ", lbl_status: "СТАТУС", btn_approve: "ОК", btn_reject: "НЕТ", btn_delete: "УДАЛИТЬ", btn_ban: "BAN", btn_buy: "КУПИТЬ"
    },
    de: {
        flag: "de", label: "DEU",
        home: "STARTSEITE", about: "INFO", members: "TEAM", shop: "SHOP", media: "MEDIEN", apply: "BEWERBEN",
        login: "ANMELDEN", account: "KONTO", hero_btn: "BEITRETEN", hero_members: "TEAM",
        about_title_span: "WER", about_title: "WIR SIND", hero_lead: "DOMINANZ. STIL. DISZIPLIN.",
        about_main_desc: "BARRACUDA ist eine Elite-Familie und Organisation, die Spieler auf führenden RP-Projekten vereint. Wir spielen auf verschiedenen GTA V Servern, erweitern unseren Einfluss und stellen unsere eigenen Regeln auf.<br><br>Wir sind mehr als nur ein Clan. Dies ist eine Bruderschaft, geschmiedet aus eiserner Disziplin und Ehrgeiz. Wir kontrollieren Ressourcen, erobern Gebiete und halten uns immer gegenseitig den Rücken frei.",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "BESITZER",
        members_title_span: "UNSER", members_title: "TEAM",
        shop_title: "SHOP", shop_desc: "Exklusive Artikel für Familienmitglieder. Zahlung über Discord oder interne Währung.",
        news_title: "NEWS", news_title_span: "FEED",
        gallery_title: "GALERIE",
        join_system_title: "TRITT DEM SYSTEM BEI", join_system_desc: "Autorisieren Sie sich, um auf den geschlossenen Bewerbungsbereich zuzugreifen.",
        access_terminal: "ZUGRIFF AUF TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        dash_label_personal: "Persönlich", dash_nav_profile: "Profil", dash_nav_my_member: "Mein Charakter", dash_nav_apply: "Bewerbung", dash_nav_support: "Support",
        dash_label_staff: "Personal", dash_nav_apps: "Bewerbungen", dash_nav_tickets: "Tickets",
        dash_label_admin: "Admin", dash_nav_shop: "Shop (Verwaltung)", dash_nav_users: "Benutzer", dash_nav_roster: "Dienstplan", dash_nav_db: "Datenbank", dash_nav_logs: "Logs", dash_nav_logout: "ABMELDEN",
        dash_profile_title: "Persönliches Kabinett", dash_secure_conn: "SICHERE VERBINDUNG HERGESTELLT",
        dash_stat_login: "DEIN LOGIN", dash_stat_role: "ZUGRIFFSEBENE",
        dash_sys_status: "Systemstatus", dash_sys_ok: "Alle Systeme funktionieren normal.",
        dash_char_settings: "Charaktereinstellungen", dash_char_status: "Aktueller Status", dash_char_update: "STATUS AKTUALISIEREN",
        dash_shop_admin_title: "Shop-Verwaltung", dash_shop_add: "Artikel hinzufügen", dash_shop_list: "Artikelliste", btn_add_item: "ARTIKEL HINZUFÜGEN",
        dash_apply_header: "Bewerbung", dash_form_title: "FORMULAR",
        dash_form_name: "1. Ihr echter Name", dash_form_age: "2. Ihr Alter", dash_form_online: "3. Online (Stunden)", dash_form_fam: "4. Vorherige Familien", dash_form_hist: "5. Spielgeschichte", dash_form_note: "6. Video / Notiz", dash_form_submit: "ABSENDEN",
        ph_name: "Name", ph_age: "Alter", ph_online: "5+ Stunden", ph_fam: "Familien...", ph_hist: "Geschichte...", ph_note: "Link oder Notiz",
        dash_support_header: "Tech Support", dash_create_ticket: "Ticket erstellen", dash_my_tickets: "Ihre Tickets", dash_ticket_btn: "TICKET ÖFFNEN",
        ph_ticket_title: "Problem", ph_ticket_msg: "Beschreibung...",
        auth_title: "SYSTEM LOGIN", auth_tab_login: "ANMELDEN", auth_tab_reg: "REGISTRIEREN", auth_btn_login: "EINTRETEN", auth_btn_reg: "KONTO ERSTELLEN",
        ph_login: "Benutzer", ph_pass: "Passwort", ph_email: "E-Mail", ph_pass_conf: "Passwort bestätigen",
        modal_cancel: "ABBRECHEN", modal_confirm: "BESTÄTIGEN", modal_ok: "VERSTANDEN",
        search_placeholder: "Agent suchen...", ticket_close_btn: "SCHLIESSEN", ph_chat: "Nachricht...", chat_send: "SENDEN",
        msg_access_denied: "ZUGRIFF VERWEIGERT", msg_welcome: "WILLKOMMEN", msg_error: "Fehler", msg_pass_mismatch: "PASSWÖRTER STIMMEN NICHT ÜBEREIN",
        msg_created_login: "ERSTELLT. BITTE ANMELDEN.", msg_app_sent: "BEWERBUNG GESENDET", msg_updated: "AKTUALISIERT", msg_deleted: "GELÖSCHT",
        msg_ticket_created: "TICKET ERSTELLT", msg_empty_list: "Liste ist leer", msg_confirm_ban: "BENUTZER SPERREN?", msg_confirm_delete: "Mitglied löschen?",
        msg_member_added: "Mitglied hinzugefügt", msg_item_added: "Artikel hinzugefügt",
        lbl_candidate: "KANDIDAT", lbl_history: "GESCHICHTE", lbl_status: "STATUS", btn_approve: "OK", btn_reject: "NEIN", btn_delete: "LÖSCHEN", btn_ban: "BAN", btn_buy: "KAUFEN"
    },
    es: {
        flag: "es", label: "ESP",
        home: "INICIO", about: "INFO", members: "MIEMBROS", shop: "TIENDA", media: "MEDIOS", apply: "APLICAR",
        login: "ACCESO", account: "CUENTA", hero_btn: "ÚNETE", hero_members: "MIEMBROS",
        about_title_span: "QUIÉNES", about_title: "SOMOS", hero_lead: "DOMINIO. ESTILO. DISCIPLINA.",
        about_main_desc: "BARRACUDA es una familia de élite y organización que une a jugadores en los principales proyectos de RP. Operamos en varios servidores de GTA V, expandiendo nuestra influencia y estableciendo nuestras propias reglas.<br><br>Somos más que un simple clan. Esto es una hermandad forjada por una disciplina de hierro y ambición.",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "DUEÑO",
        members_title_span: "NUESTRO", members_title: "EQUIPO",
        shop_title: "TIENDA", shop_desc: "Artículos exclusivos para miembros de la familia. Pago vía Discord o moneda interna.",
        news_title: "NOTICIAS", news_title_span: "FEED",
        gallery_title: "GALERÍA",
        join_system_title: "ÚNETE AL SISTEMA", join_system_desc: "Autorízate para acceder a la sección de aplicaciones restringida.",
        access_terminal: "ACCESO A LA TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        dash_label_personal: "Personal", dash_nav_profile: "Perfil", dash_nav_my_member: "Mi Personaje", dash_nav_apply: "Aplicar", dash_nav_support: "Soporte",
        dash_label_staff: "Personal", dash_nav_apps: "Aplicaciones", dash_nav_tickets: "Tickets",
        dash_label_admin: "Admin", dash_nav_shop: "Tienda (Admin)", dash_nav_users: "Roles", dash_nav_roster: "Lista", dash_nav_db: "Base de Datos", dash_nav_logs: "Logs", dash_nav_logout: "SALIR",
        dash_profile_title: "Gabinete Personal", dash_secure_conn: "CONEXIÓN SEGURA ESTABLECIDA",
        dash_stat_login: "TU LOGIN", dash_stat_role: "NIVEL DE ACCESO",
        dash_sys_status: "Estado del Sistema", dash_sys_ok: "Todos los sistemas operativos.",
        dash_char_settings: "Ajustes de Personaje", dash_char_status: "Estado Actual", dash_char_update: "ACTUALIZAR ESTADO",
        dash_shop_admin_title: "Gestión de Tienda", dash_shop_add: "Añadir Artículo", dash_shop_list: "Lista de Artículos", btn_add_item: "AÑADIR ARTÍCULO",
        dash_apply_header: "Aplicación", dash_form_title: "FORMULARIO",
        dash_form_name: "1. Nombre Real", dash_form_age: "2. Edad", dash_form_online: "3. Online (horas)", dash_form_fam: "4. Familias Anteriores", dash_form_hist: "5. Historia", dash_form_note: "6. Video / Nota", dash_form_submit: "ENVIAR",
        ph_name: "Nombre", ph_age: "Edad", ph_online: "5+ horas", ph_fam: "Familias...", ph_hist: "Historia...", ph_note: "Link o nota",
        dash_support_header: "Soporte Técnico", dash_create_ticket: "Crear Ticket", dash_my_tickets: "Tus Tickets", dash_ticket_btn: "ABRIR TICKET",
        ph_ticket_title: "Resumen", ph_ticket_msg: "Descripción...",
        auth_title: "LOGIN SISTEMA", auth_tab_login: "ENTRAR", auth_tab_reg: "REGISTRO", auth_btn_login: "ENTRAR", auth_btn_reg: "CREAR CUENTA",
        ph_login: "Usuario", ph_pass: "Contraseña", ph_email: "Email", ph_pass_conf: "Confirmar",
        modal_cancel: "CANCELAR", modal_confirm: "CONFIRMAR", modal_ok: "ENTENDIDO",
        search_placeholder: "Buscar agente...", ticket_close_btn: "CERRAR", ph_chat: "Mensaje...", chat_send: "ENVIAR",
        msg_access_denied: "ACCESO DENEGADO", msg_welcome: "BIENVENIDO", msg_error: "Error", msg_pass_mismatch: "LAS CONTRASEÑAS NO COINCIDEN",
        msg_created_login: "CREADO. POR FAVOR INICIA SESIÓN.", msg_app_sent: "SOLICITUD ENVIADA", msg_updated: "ACTUALIZADO", msg_deleted: "ELIMINADO",
        msg_ticket_created: "TICKET CREADO", msg_empty_list: "La lista está vacía", msg_confirm_ban: "¿PROHIBIR USUARIO?", msg_confirm_delete: "¿Eliminar miembro?",
        msg_member_added: "Miembro añadido", msg_item_added: "Artículo añadido",
        lbl_candidate: "CANDIDATO", lbl_history: "HISTORIA", lbl_status: "ESTADO", btn_approve: "OK", btn_reject: "NO", btn_delete: "ELIMINAR", btn_ban: "BAN", btn_buy: "COMPRAR"
    },
    pt: {
        flag: "br", label: "POR",
        home: "INÍCIO", about: "INFO", members: "MEMBROS", shop: "LOJA", media: "MÍDIA", apply: "APLICAR",
        login: "LOGIN", account: "CONTA", hero_btn: "JUNTAR-SE", hero_members: "MEMBROS",
        about_title_span: "QUEM", about_title: "SOMOS", hero_lead: "DOMÍNIO. ESTILO. DISCIPLINA.",
        about_main_desc: "BARRACUDA é uma família de elite e organização que une jogadores nos principais projetos de RP. Operamos em vários servidores de GTA V, expandindo nossa influência e estabelecendo nossas próprias regras.",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "PROPRIETÁRIO",
        members_title_span: "NOSSO", members_title: "TIME",
        shop_title: "LOJA", shop_desc: "Itens exclusivos para membros da família. Pagamento via Discord ou moeda interna.",
        news_title: "NOTÍCIAS", news_title_span: "FEED",
        gallery_title: "GALERIA",
        join_system_title: "JUNTE-SE AO SISTEMA", join_system_desc: "Autorize-se para acessar a seção de aplicativos restrita.",
        access_terminal: "ACESSO AO TERMINAL", footer: "BARRACUDA FAMILY. RP.",
        dash_label_personal: "Pessoal", dash_nav_profile: "Perfil", dash_nav_my_member: "Meu Personagem", dash_nav_apply: "Aplicar", dash_nav_support: "Suporte",
        dash_label_staff: "Staff", dash_nav_apps: "Aplicações", dash_nav_tickets: "Tickets",
        dash_label_admin: "Admin", dash_nav_shop: "Loja (Admin)", dash_nav_users: "Papéis", dash_nav_roster: "Lista", dash_nav_db: "Banco de Dados", dash_nav_logs: "Logs", dash_nav_logout: "SAIR",
        dash_profile_title: "Gabinete Pessoal", dash_secure_conn: "CONEXÃO SEGURA ESTABELECIDA",
        dash_stat_login: "SEU LOGIN", dash_stat_role: "NÍVEL DE ACESSO",
        dash_sys_status: "Status do Sistema", dash_sys_ok: "Todos os sistemas operacionais.",
        dash_char_settings: "Configurações do Personagem", dash_char_status: "Status Atual", dash_char_update: "ATUALIZAR STATUS",
        dash_shop_admin_title: "Gestão da Loja", dash_shop_add: "Adicionar Item", dash_shop_list: "Lista de Itens", btn_add_item: "ADICIONAR ITEM",
        dash_apply_header: "Aplicação", dash_form_title: "FORMULÁRIO",
        dash_form_name: "1. Nome Real", dash_form_age: "2. Idade", dash_form_online: "3. Online (horas)", dash_form_fam: "4. Famílias Anteriores", dash_form_hist: "5. Histórico", dash_form_note: "6. Vídeo / Nota", dash_form_submit: "ENVIAR",
        ph_name: "Nome", ph_age: "Idade", ph_online: "5+ horas", ph_fam: "Famílias...", ph_hist: "Histórico...", ph_note: "Link ou nota",
        dash_support_header: "Suporte Técnico", dash_create_ticket: "Criar Ticket", dash_my_tickets: "Seus Tickets", dash_ticket_btn: "ABRIR TICKET",
        ph_ticket_title: "Resumo", ph_ticket_msg: "Descrição...",
        auth_title: "LOGIN DO SISTEMA", auth_tab_login: "ENTRAR", auth_tab_reg: "REGISTRO", auth_btn_login: "ENTRAR", auth_btn_reg: "CRIAR CONTA",
        ph_login: "Usuário", ph_pass: "Senha", ph_email: "Email", ph_pass_conf: "Confirmar",
        modal_cancel: "CANCELAR", modal_confirm: "CONFIRMAR", modal_ok: "ENTENDIDO",
        search_placeholder: "Buscar agente...", ticket_close_btn: "FECHAR", ph_chat: "Mensagem...", chat_send: "ENVIAR",
        msg_access_denied: "ACESSO NEGADO", msg_welcome: "BEM-VINDO", msg_error: "Erro", msg_pass_mismatch: "AS SENHAS NÃO COINCIDEM",
        msg_created_login: "CRIADO. POR FAVOR FAÇA LOGIN.", msg_app_sent: "INSCRIÇÃO ENVIADA", msg_updated: "ATUALIZADO", msg_deleted: "EXCLUÍDO",
        msg_ticket_created: "TICKET CRIADO", msg_empty_list: "A lista está vazia", msg_confirm_ban: "BANIR USUÁRIO?", msg_confirm_delete: "Excluir membro?",
        msg_member_added: "Membro adicionado", msg_item_added: "Item adicionado",
        lbl_candidate: "CANDIDATO", lbl_history: "HISTÓRICO", lbl_status: "STATUS", btn_approve: "OK", btn_reject: "NÃO", btn_delete: "EXCLUIR", btn_ban: "BAN", btn_buy: "COMPRAR"
    },
    pl: {
        flag: "pl", label: "POL",
        home: "GŁÓWNA", about: "INFO", members: "SKŁAD", shop: "SKLEP", media: "MEDIA", apply: "REKRUTACJA",
        login: "LOGOWANIE", account: "KONTO", hero_btn: "DOŁĄCZ", hero_members: "SKŁAD",
        about_title_span: "KIM", about_title: "JESTEŚMY", hero_lead: "DOMINACJA. STYL. DYSCYPLINA.",
        about_main_desc: "BARRACUDA to elitarna rodzina i organizacja zrzeszająca graczy na wiodących projektach RP. Gramy na różnych serwerach GTA V, rozszerzając nasze wpływy i ustalając własne zasady.",
        server_stake: "Stake RP", server_chicago: "Majestic RP Chicago", server_ny: "Majestic RP New York", lbl_owner: "WŁAŚCICIEL",
        members_title_span: "NASZ", members_title: "SKŁAD",
        shop_title: "SKLEP", shop_desc: "Ekskluzywne przedmioty dla członków rodziny. Płatność przez Discord lub walutę wewnętrzną.",
        news_title: "AKTUALNOŚCI", news_title_span: "FEED",
        gallery_title: "GALERIA",
        join_system_title: "DOŁĄCZ DO SYSTEMU", join_system_desc: "Zaloguj się, aby uzyskać dostęp do zamkniętej sekcji rekrutacji.",
        access_terminal: "DOSTĘP DO TERMINALA", footer: "BARRACUDA FAMILY. RP.",
        dash_label_personal: "Osobiste", dash_nav_profile: "Profil", dash_nav_my_member: "Moja Postać", dash_nav_apply: "Podanie", dash_nav_support: "Wsparcie",
        dash_label_staff: "Personel", dash_nav_apps: "Podania", dash_nav_tickets: "Tickety",
        dash_label_admin: "Admin", dash_nav_shop: "Sklep (Zarządzanie)", dash_nav_users: "Role", dash_nav_roster: "Skład", dash_nav_db: "Baza Danych", dash_nav_logs: "Logi", dash_nav_logout: "WYLOGUJ",
        dash_profile_title: "Gabinet Osobisty", dash_secure_conn: "BEZPIECZNE POŁĄCZENIE NAWIĄZANE",
        dash_stat_login: "TWÓJ LOGIN", dash_stat_role: "POZIOM DOSTĘPU",
        dash_sys_status: "Status Systemu", dash_sys_ok: "Wszystkie systemy działają poprawnie.",
        dash_char_settings: "Ustawienia Postaci", dash_char_status: "Aktualny Status", dash_char_update: "AKTUALIZUJ STATUS",
        dash_shop_admin_title: "Zarządzanie Sklepem", dash_shop_add: "Dodaj Przedmiot", dash_shop_list: "Lista Przedmiotów", btn_add_item: "DODAJ PRZEDMIOT",
        dash_apply_header: "Podanie", dash_form_title: "FORMULARZ",
        dash_form_name: "1. Twoje imię", dash_form_age: "2. Wiek", dash_form_online: "3. Online (godziny)", dash_form_fam: "4. Poprzednie rodziny", dash_form_hist: "5. Historia gry", dash_form_note: "6. Wideo / Notatka", dash_form_submit: "WYŚLIJ",
        ph_name: "Imię", ph_age: "Wiek", ph_online: "5+ godzin", ph_fam: "Nazwy rodzin...", ph_hist: "Historia...", ph_note: "Link lub notatka",
        dash_support_header: "Wsparcie Techniczne", dash_create_ticket: "Utwórz Zgłoszenie", dash_my_tickets: "Twoje Zgłoszenia", dash_ticket_btn: "OTWÓRZ TICKET",
        ph_ticket_title: "Temat", ph_ticket_msg: "Opis...",
        auth_title: "LOGOWANIE SYSTEMOWE", auth_tab_login: "WEJŚCIE", auth_tab_reg: "REJESTRACJA", auth_btn_login: "ZALOGUJ", auth_btn_reg: "UTWÓRZ KONTO",
        ph_login: "Login", ph_pass: "Hasło", ph_email: "Email", ph_pass_conf: "Potwierdź hasło",
        modal_cancel: "ANULUJ", modal_confirm: "POTWIERDŹ", modal_ok: "ZROZUMIANO",
        search_placeholder: "Szukaj agenta...", ticket_close_btn: "ZAMKNIJ TICKET", ph_chat: "Wiadomość...", chat_send: "WYŚLIJ",
        msg_access_denied: "ODMOWA DOSTĘPU", msg_welcome: "WITAJ", msg_error: "Błąd", msg_pass_mismatch: "HASŁA NIE PASUJĄ",
        msg_created_login: "UTWORZONO. ZALOGUJ SIĘ.", msg_app_sent: "APLIKACJA WYSŁANA", msg_updated: "ZAKTUALIZOWANO", msg_deleted: "USUNIĘTO",
        msg_ticket_created: "TICKET UTWORZONY", msg_empty_list: "Lista jest pusta", msg_confirm_ban: "ZBANOWAĆ UŻYTKOWNIKA?", msg_confirm_delete: "Usunąć członka?",
        msg_member_added: "Członek dodany", msg_item_added: "Przedmiot dodany",
        lbl_candidate: "KANDYDAT", lbl_history: "HISTORIA", lbl_status: "STATUS", btn_approve: "OK", btn_reject: "NIE", btn_delete: "USUŃ", btn_ban: "BAN", btn_buy: "KUP"
    }
  };

  function getTrans(key) {
      const lang = localStorage.getItem('barracuda_lang') || 'ua';
      return translations[lang]?.[key] || translations['ua']?.[key] || key;
  }

  // ЗМІНА МОВИ (оновлена логіка для innerHTML та інших елементів)
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
              // Використовуємо innerHTML для about_main_desc, щоб зберегти <br>
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

  // --- ЛОГІКА МАГАЗИНУ ---
  async function loadShopItems() {
      const grid = document.getElementById('shopGrid');
      if(!grid) return;
      const items = await apiFetch('/api/shop');
      if (!items || items.length === 0) {
          grid.innerHTML = '<p style="text-align:center; width:100%; color:#666;">Товари відсутні</p>';
          return;
      }
      grid.innerHTML = items.map(item => `
        <div class="shop-card animate-hidden glass">
            <div class="shop-img" style="background-image: url('${item.image}')"></div>
            <div class="shop-content">
                <div class="shop-header">
                    <h3>${item.title}</h3>
                    <span class="shop-price">${item.price}</span>
                </div>
                <p class="shop-desc">${item.description}</p>
                <button class="btn btn-primary full-width" onclick="window.buyItem('${item.title}')">${getTrans('btn_buy')}</button>
            </div>
        </div>
      `).join('');
      activateScrollAnimations();
  }

  window.buyItem = (title) => {
      // Проста заглушка для покупки
      if(!currentUser) return showToast(getTrans('join_system_desc'), 'error');
      showToast(`Запит на покупку "${title}" відправлено! Зв'яжіться з адміністрацією в Discord.`, 'success');
  };

  // ЛОГІКА АДМІНКИ МАГАЗИНУ
  async function loadAdminShop() {
      const list = document.getElementById('adminShopList');
      if(!list) return;
      const items = await apiFetch('/api/shop');
      if(!items || !items.length) { list.innerHTML = `<div>${getTrans('msg_empty_list')}</div>`; return; }
      list.innerHTML = items.map(i => `
        <div class="u-row animate-hidden">
            <div style="display:flex; gap:10px; align-items:center;">
                <img src="${i.image}" style="width:40px; height:40px; border-radius:5px; object-fit:cover;">
                <div><b>${i.title}</b> <span style="color:var(--accent)">${i.price}</span></div>
            </div>
            <button class="btn btn-outline" onclick="window.deleteShopItem('${i.id}')">${getTrans('btn_delete')}</button>
        </div>
      `).join('');
  }

  const adminShopForm = document.getElementById('adminShopForm');
  if(adminShopForm) {
      adminShopForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const body = {
              title: document.getElementById('shopTitle').value,
              price: document.getElementById('shopPrice').value,
              image: document.getElementById('shopImage').value,
              description: document.getElementById('shopDesc').value
          };
          await apiFetch('/api/shop', {method:'POST', body:JSON.stringify(body)});
          showToast(getTrans('msg_item_added'));
          adminShopForm.reset();
          loadAdminShop();
          loadShopItems(); // Оновлюємо публічний список
      });
  }

  window.deleteShopItem = async (id) => {
      if(confirm('Видалити товар?')) {
          await apiFetch(`/api/shop/${id}`, {method:'DELETE'});
          showToast(getTrans('msg_deleted'));
          loadAdminShop();
          loadShopItems();
      }
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
          loadShopItems(); // Завантаження магазину
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
      document.querySelectorAll('.hero, .section, .card, .member, .shop-card, .u-row, .app-card-ultra, .reveal-on-scroll, .about-main-text').forEach((el) => {
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
      if(['users', 'admin-members', 'logs', 'accounts-data', 'shop-admin'].includes(tab)) {
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
      if(tab === 'shop-admin') loadAdminShop();
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
