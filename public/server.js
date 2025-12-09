require('dotenv').config(); 
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Отримуємо посилання з .env (твоє посилання на Railway)
const MONGO_URI = process.env.MONGODB_URI;

// --- ФУНКЦІЯ ОТРИМАННЯ ЛОКАЛЬНОГО IP (Для гри з друзями через Radmin/LAN) ---
function getLocalExternalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if ('IPv4' === iface.family && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

console.log("------------------------------------------------");
console.log("🦈 BARRACUDA FAMILY SYSTEM");
console.log("☁️  Підключення до хмарної бази Railway...");
console.log("------------------------------------------------");

// Налаштування для стабільного підключення до хмари
mongoose.set('strictQuery', false);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ ХМАРНА БАЗА ДАНИХ ПІДКЛЮЧЕНА!");
        console.log("   Тепер дані зберігаються в інтернеті.");
    })
    .catch(err => {
        console.error("❌ ПОМИЛКА ПІДКЛЮЧЕННЯ:");
        console.error(err.message);
        console.log("👉 Перевір, чи правильне посилання в файлі .env");
    });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

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

// --- API ROUTES ---

// AUTH
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) return res.status(400).json({ success: false, message: 'Логін/Email зайняті' });
        await new User({ username, email, password, role: 'member' }).save();
        res.json({ success: true, message: 'ОК' });
    } catch (err) { res.status(500).json({ success: false, message: 'Помилка сервера' }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const adminLogin = process.env.ADMIN_LOGIN || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin';

    if(username === adminLogin && password === adminPass) {
         return res.json({ success: true, user: { username: 'ADMIN 🦈', role: 'admin' } });
    }
    try {
        const user = await User.findOne({ username, password });
        if (user) res.json({ success: true, user: { username: user.username, role: user.role } });
        else res.status(401).json({ success: false, message: 'Невірні дані' });
    } catch (err) { res.status(500).json({ success: false }); }
});

app.put('/api/users/:username/role', async (req, res) => {
    try { await User.findOneAndUpdate({ username: req.params.username }, { role: req.body.role }); res.json({ success: true }); } 
    catch(e) { res.status(500).json({ success: false }); }
});

// MEMBERS & CONTENT
app.post('/api/members', async (req, res) => { try { await new Member(req.body).save(); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });
app.get('/api/members', async (req, res) => { const m = await Member.find().sort({ createdAt: -1 }); res.json(m.map(x => ({ ...x._doc, id: x._id }))); });
app.put('/api/members/:id', async (req, res) => { await Member.findByIdAndUpdate(req.params.id, req.body); res.json({ success: true }); });
app.delete('/api/members/:id', async (req, res) => { await Member.findByIdAndDelete(req.params.id); res.json({ success: true }); });

app.get('/api/news', async (req, res) => { const n = await News.find().sort({ createdAt: -1 }); res.json(n.map(x => ({ ...x._doc, id: x._id }))); });
app.post('/api/news', async (req, res) => { await new News(req.body).save(); res.json({ success: true }); });
app.delete('/api/news/:id', async (req, res) => { await News.findByIdAndDelete(req.params.id); res.json({ success: true }); });

app.get('/api/gallery', async (req, res) => { const g = await Gallery.find().sort({ createdAt: -1 }); res.json(g.map(x => ({ ...x._doc, id: x._id }))); });
app.post('/api/gallery', async (req, res) => { await new Gallery(req.body).save(); res.json({ success: true }); });
app.delete('/api/gallery/:id', async (req, res) => { await Gallery.findByIdAndDelete(req.params.id); res.json({ success: true }); });

app.get('/api/users', async (req, res) => { const u = await User.find().sort({ regDate: -1 }); res.json(u); });
app.delete('/api/users/:username', async (req, res) => { try { await User.findOneAndDelete({ username: req.params.username }); await Member.deleteMany({ owner: req.params.username }); res.json({ success: true }); } catch (e) { res.status(500).json({ success: false }); } });
app.get('/api/users/count', async (req, res) => { 
    try {
        const total = await User.countDocuments(); 
        const admins = await User.countDocuments({ role: 'admin' });
        res.json({ totalUsers: total, totalAdmins: admins + 1 });
    } catch(e) { res.json({ totalUsers: 0, totalAdmins: 0 }); }
});

app.post('/api/applications', async (req, res) => { try { await new Application(req.body).save(); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });
app.get('/api/applications', async (req, res) => { const apps = await Application.find().sort({ createdAt: -1 }); res.json(apps.map(a => ({ ...a._doc, id: a._id }))); });
app.get('/api/applications/my', async (req, res) => { const apps = await Application.find().sort({ createdAt: -1 }); res.json(apps.map(a => ({ ...a._doc, id: a._id }))); });
app.put('/api/applications/:id', async (req, res) => { try { await Application.findByIdAndUpdate(req.params.id, { status: req.body.status }); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });

app.post('/api/tickets', async (req, res) => { try { await new Ticket(req.body).save(); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });
app.get('/api/tickets', async (req, res) => { const tickets = await Ticket.find().sort({ createdAt: -1 }); res.json(tickets.map(t => ({ ...t._doc, id: t._id }))); });
app.put('/api/tickets/:id', async (req, res) => { try { const { message, status } = req.body; const update = {}; if (status) update.status = status; if (message) update.$push = { messages: message }; await Ticket.findByIdAndUpdate(req.params.id, update); res.json({ success: true }); } catch(e) { res.status(500).json({ success: false }); } });

// Фронтенд
app.get("*", (req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")); });

app.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalExternalIP();
    console.log(`\n🚀 СЕРВЕР ЗАПУЩЕНО!`);
    console.log(`💻 Вхід для тебе: http://localhost:${PORT}`);
    console.log(`🌍 Вхід для друзів: http://${ip}:${PORT}`);
    console.log(`\n✅ Підключено до Railway. Тепер не важливо, чи працює MongoDB на ПК.`);
});
