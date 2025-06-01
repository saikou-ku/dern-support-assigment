const User = require('../models/User');
const RepairRequest = require('../models/RepairRequest');
const Message = require('../models/Message');

async function listUsers(req, res) {
    try {
        const users = await User.find({ isAdmin: false }).select('-password');
        return res.json(users);
    } catch (err) {
        return res.status(500).json({ error: 'Xizmat vaqtiinchalik mavjud emas.' });
    }
}

async function deleteUser(req, res) {
    const { uid } = req.query;
    if (!uid) {
        return res.status(400).json({ error: 'UID talab qilinadi.' });
    }

    try {
        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
        }

        await User.deleteOne({ uid });
        await RepairRequest.deleteMany({ uid });
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'O‘chirishda xato.' });
    }
}

async function notifyOtherRequestByEmail(req, res) {
    const { id } = req.params;
    const { price, adminMessage } = req.body;

    if (price == null || isNaN(price)) {
        return res.status(400).json({ error: 'Narx raqam bo‘lishi kerak.' });
    }

    try {
        const request = await RepairRequest.findById(id);
        if (!request) return res.status(404).json({ error: 'So‘rov topilmadi.' });
        if (request.problemType !== 'other') return res.status(400).json({ error: 'Faqat other turdagi so‘rovlar uchun.' });
        if (request.status !== 'WAITING') return res.status(400).json({ error: 'So‘rov holati noto‘g‘ri.' });

        const user = await User.findOne({ uid: request.uid });
        if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });

        // Simulate email notification (implement with Nodemailer in production)
        request.price = price;
        request.status = 'PENDING';
        await request.save();

        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Server xatosi.' });
    }
}

async function updateRequest(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const request = await RepairRequest.findById(id);
        if (!request) return res.status(404).json({ error: 'So‘rov topilmadi.' });

        if (request.status !== 'IN_PROGRESS' && request.problemType === 'other' && request.status !== 'CONFIRMED') {
            return res.status(400).json({ error: 'Narx tasdiqlanmagan.' });
        }

        request.status = status;
        await request.save();
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Server xatosi.' });
    }
}

async function listAllRequests(req, res) {
    try {
        let query = RepairRequest.find();
        if (req.query.status) {
            query = query.where('status').equals(req.query.status);
        }
        const requests = await query.sort({ createdAt: -1 });
        return res.status(200).json(requests);
    } catch (err) {
        return res.status(500).json({ error: 'Xatolik yuz berdi.' });
    }
}

async function getAllChatUsers(req, res) {
    try {
        const messages = await Message.find({ receiverId: 'admin' }).distinct('senderId');
        const users = await User.find({ uid: { $in: messages } }).select('-password');
        return res.status(200).json({ users });
    } catch (err) {
        return res.status(500).json({ error: 'Xatolik yuz berdi.' });
    }
}

async function sendMessageToUser(req, res) {
    const { userId, message } = req.body;

    if (!userId || !message?.trim()) {
        return res.status(400).json({ error: 'Foydalanuvchi va xabar matni kerak.' });
    }

    const chatId = `${userId}_admin`;

    try {
        const newMessage = new Message({
            senderId: 'admin',
            receiverId: userId,
            message,
            chatId,
        });
        await newMessage.save();
        return res.status(200).json({ success: true, message: 'Xabar yuborildi' });
    } catch (err) {
        return res.status(500).json({ error: 'Xabar yuborishda xato.' });
    }
}

async function getChatMessages(req, res) {
    const { userId } = req.params;
    const chatId = `${userId}_admin`;

    try {
        const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
        return res.status(200).json({ messages });
    } catch (err) {
        return res.status(500).json({ error: 'Xabarlarni olishda xatolik yuz berdi.' });
    }
}

module.exports = {
    listUsers,
    deleteUser,
    notifyOtherRequestByEmail,
    updateRequest,
    listAllRequests,
    getAllChatUsers,
    sendMessageToUser,
    getChatMessages,
};