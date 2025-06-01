const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (uid, isAdmin) => {
    return jwt.sign({ uid, isAdmin }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

async function register(req, res) {
    const { email, username, password, confirmPassword, isAdmin = false, profileImage } = req.body;
    if (!email || !username || !password || !confirmPassword) {
        return res.status(400).json({ error: 'Barcha maydonlar to‘ldirilishi shart.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Parollar mos emas.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email allaqachon ro‘yxatdan o‘tgan.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const uid = new require('mongoose').Types.ObjectId().toString();
        const newUser = new User({
            uid,
            email,
            username,
            password: hashedPassword,
            isAdmin,
            profileImage: profileImage || 'https://www.mona.uwi.edu/modlang/sites/default/files/modlang/male-avatar-placeholder.png',
        });

        await newUser.save();
        const token = generateToken(uid, isAdmin);
        return res.status(201).json({ uid, token });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email va parol kerak.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Noto‘g‘ri parol.' });
        }

        const token = generateToken(user.uid, user.isAdmin);
        return res.json({ uid: user.uid, token });
    } catch (err) {
        return res.status(500).json({ error: 'Server xatosi.' });
    }
}

async function getUser(req, res) {
    const { uid } = req.params;
    try {
        const user = await User.findOne({ uid }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
        }
        return res.json(user);
    } catch (err) {
        return res.status(500).json({ error: 'Xizmat vaqtiinchalik mavjud emas.' });
    }
}

async function updateUser(req, res) {
    const { uid } = req.params;
    if (!uid) return res.status(400).json({ error: 'UID kiritilishi shart.' });

    try {
        const user = await User.findOne({ uid });
        if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });

        const updates = { ...req.body };
        if (req.file) {
            // For simplicity, we're not implementing file upload here
            // You can add Multer with cloud storage (e.g., AWS S3) for production
            updates.profileImage = 'https://example.com/placeholder.jpg';
        }

        await User.updateOne({ uid }, updates);
        return res.status(200).json({ success: true, updatedFields: updates });
    } catch (err) {
        return res.status(500).json({ error: 'Xizmat vaqtiinchalik mavjud emas.' });
    }
}

async function forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email kiritilishi shart.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
        }
        // Implement email service (e.g., Nodemailer) for password reset
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).json({ error: 'Email yuborishda xato yuz berdi.' });
    }
}

async function checkIsAdmin(req, res) {
    const { uid } = req.query;
    if (!uid) {
        return res.status(400).json({ error: 'UID kiritilishi shart.' });
    }

    try {
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
        }
        return res.status(200).json({ isAdmin: user.isAdmin });
    } catch (err) {
        return res.status(500).json({ error: 'Server xatosi.' });
    }
}

module.exports = {
    register,
    login,
    getUser,
    updateUser,
    forgotPassword,
    checkIsAdmin,
};