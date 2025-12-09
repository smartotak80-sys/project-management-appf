require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const os = require('os'); // Додано для пошуку IP

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/barracuda_db";

// --- ФУНКЦІЯ ОТРИМАННЯ IP (Щоб друзі могли зайти) ---
function getLocalExternalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Шукаємо IPv4 адресу, яка не є локальною (не 127.0.0.1)
            // Це часто адреса з Radmin VPN або Wi-Fi роутера
            if ('IPv4' === iface.family && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

console.log("------------------------------------------------");
console.log("🦈 BARRACUDA FAMILY SYSTEM STARTING...");
console.log("⏳ Підключення до бази даних...");
console.log("------------------------------------------------");

mongoose.set('bufferTimeoutMS', 5000);

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ БАЗА ДАНИХ ПІДКЛЮЧЕНА!"))
    .catch(err => console.error("❌ ПОМИЛКА БАЗИ ДАНИХ (Перевір чи запущено MongoDB):", err.message));

app.use(cors()); // Дозволяє вхід з інших IP
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Роздає html/css/js

// --- СХЕМИ ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }, 
    role: { type: String, default: 'member' }, 
    regDate: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const MemberSchema = new mongoose.Schema({
    name: String, role: String, owner: String, 
    links: { discord: String, youtube: String, tg: String },
    createdAt: { type: Date, default: Date.now }
});
const Member = mongoose.model('Member', MemberSchema);

const NewsSchema = new mongoose.Schema({ title: String, date: String, summary: String, createdAt: { type: Date, default: Date.now } });
const News = mongoose.model('News', NewsSchema);

const GallerySchema = new mongoose.Schema({ url: String, createdAt: { type: Date, default: Date.now } });
const Gallery = mongoose.model('Gallery', GallerySchema);

const ApplicationSchema = new mongoose.Schema({
    rlNameAge: String, onlineTime: String, history: String, shootingVideo: String,
    status: { type: String, default: 'pending' }, 
    submittedBy: String, 
    createdAt: { type: Date, default: Date.now }
});
const Application = mongoose.model('Application', ApplicationSchema);

const TicketSchema = new mongoose.Schema({
    author: String, title: String,
    messages: [{ sender: String, text: String, date: { type: Date, default: Date.now }, isStaff: Boolean }],
    status: { type: String, default: 'open' },
    createdAt: { type: Date, default: Date.now }
});
const Ticket = mongoose.model('Ticket', TicketSchema);

// --- API ---

// AUTH
app.post('/api/auth/register', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) return res.status(500).json({ success: false, message: 'Помилка з\'єднання з БД' });
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) return res.status(400).json({ success: false, message: 'Логін або Email вже зайняті' });
        
        // Створюємо користувача
        await new User({ username, email, password, role: 'member' }).save();
        res.json({ success: true, message: 'Успішна реєстрація!' });
    } catch (err) { res.status(500).json({ success: false, message: 'Помилка сервера' }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    // Адмін логін з .env або стандартний
    const adminLogin = process.env.ADMIN_LOGIN || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin';

    if(username === adminLogin && password === adminPass) {
         return res.json({ success: true, user: { username: 'ADMIN 🦈', role: 'admin' } });
    }
    try {
        const user = await User.findOne({ username, password });
        if (user) res.json({ success: true, user: { username: user.username, role: user.role } });
        else res.status(401).json({ success: false, message: 'Невірний логін або пароль' });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.put('/api/users/:username/role', async (req, res) => {
    try { await User.findOneAndUpdate({ username: req.params.username }, { role: req.body.role }); res.json({ success: true }); } 
    catch(e) { res.status(500).json({ success: false }); }
});

// CRUD ROUTES
app.post('/api/members', async (req, res) => { try { await new Member(req.body).save(); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });
app.get('/api/members', async (req, res) => { if (mongoose.connection.readyState !== 1) return res.json([]); const m = await Member.find().sort({ createdAt: -1 }); res.json(m.map(x => ({ ...x._doc, id: x._id }))); });
app.put('/api/members/:id', async (req, res) => { await Member.findByIdAndUpdate(req.params.id, req.body); res.json({ success: true }); });
app.delete('/api/members/:id', async (req, res) => { await Member.findByIdAndDelete(req.params.id); res.json({ success: true }); });

app.get('/api/news', async (req, res) => { if (mongoose.connection.readyState !== 1) return res.json([]); const n = await News.find().sort({ createdAt: -1 }); res.json(n.map(x => ({ ...x._doc, id: x._id }))); });
app.post('/api/news', async (req, res) => { await new News(req.body).save(); res.json({ success: true }); });
app.delete('/api/news/:id', async (req, res) => { await News.findByIdAndDelete(req.params.id); res.json({ success: true }); });

app.get('/api/gallery', async (req, res) => { if (mongoose.connection.readyState !== 1) return res.json([]); const g = await Gallery.find().sort({ createdAt: -1 }); res.json(g.map(x => ({ ...x._doc, id: x._id }))); });
app.post('/api/gallery', async (req, res) => { await new Gallery(req.body).save(); res.json({ success: true }); });
app.delete('/api/gallery/:id', async (req, res) => { await Gallery.findByIdAndDelete(req.params.id); res.json({ success: true }); });

app.get('/api/users', async (req, res) => { if (mongoose.connection.readyState !== 1) return res.json([]); const u = await User.find().sort({ regDate: -1 }); res.json(u); });
app.delete('/api/users/:username', async (req, res) => { try { await User.findOneAndDelete({ username: req.params.username }); await Member.deleteMany({ owner: req.params.username }); res.json({ success: true }); } catch (e) { res.status(500).json({ success: false }); } });
app.get('/api/users/count', async (req, res) => { if (mongoose.connection.readyState !== 1) return res.json({}); const total = await User.countDocuments(); const admins = await User.countDocuments({ role: 'admin' }); res.json({ totalUsers: total, totalAdmins: admins + 1 });});

app.post('/api/applications', async (req, res) => { try { await new Application(req.body).save(); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });
app.get('/api/applications', async (req, res) => { const apps = await Application.find().sort({ createdAt: -1 }); res.json(apps.map(a => ({ ...a._doc, id: a._id }))); });
app.get('/api/applications/my', async (req, res) => { const apps = await Application.find().sort({ createdAt: -1 }); res.json(apps.map(a => ({ ...a._doc, id: a._id }))); });
app.put('/api/applications/:id', async (req, res) => { try { await Application.findByIdAndUpdate(req.params.id, { status: req.body.status }); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });

app.post('/api/tickets', async (req, res) => { try { await new Ticket(req.body).save(); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });
app.get('/api/tickets', async (req, res) => { const tickets = await Ticket.find().sort({ createdAt: -1 }); res.json(tickets.map(t => ({ ...t._doc, id: t._id }))); });
app.put('/api/tickets/:id', async (req, res) => { try { const { message, status } = req.body; const update = {}; if (status) update.status = status; if (message) update.$push = { messages: message }; await Ticket.findByIdAndUpdate(req.params.id, update); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });

// Головна сторінка
app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")); });

// --- ЗАПУСК СЕРВЕРА ---
app.listen(PORT, '0.0.0.0', () => { // '0.0.0.0' дозволяє підключення ззовні
    const ip = getLocalExternalIP();
    console.log(`\n🚀 СЕРВЕР ЗАПУЩЕНО!`);
    console.log(`💻 Твій вхід (локально): http://localhost:${PORT}`);
    console.log(`🌍 Вхід для друзів (МЕРЕЖА): http://${ip}:${PORT}`);
    console.log(`\n👉 Скопіюй посилання з "МЕРЕЖА" і кидай друзям!\n`);
});