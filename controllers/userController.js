const RepairRequest = require('../models/RepairRequest');
const Message = require('../models/Message');

async function requestRepair(req, res) {
    const { uid } = req.user;
    const { issueName, problemType, description, price } = req.body;
    const files = req.files || [];

    if (!uid || !issueName || !problemType || files.length !== 2) {
        return res.status(400).json({ error: 'Barcha maydonlar va 2 ta rasm kerak.' });
    }

    const isOther = problemType.toLowerCase() === 'other';
    if (isOther && !description?.trim()) {
        return res.status(400).json({ error: 'Other uchun description kerak.' });
    }
    if (!isOther && (price == null || isNaN(price))) {
        return res.status(400).json({ error: 'Price kerak.' });
    }

    try {
        const imageUrls = files.map(file => 'https://example.com/placeholder.jpg'); // Replace with actual storage logic
        const newRequest = new RepairRequest({
            uid,
            issueName,
            problemType,
            isOther,
            description: description || null,
            status: 'WAITING',
            price: isOther ? null : parseFloat(price),
            images: imageUrls,
            location: req.body.location || null,
        });

        await newRequest.save();
        return res.status(201).json(newRequest);
    } catch (err) {
        return res.status(500).json({ error: 'So‘rovni yaratishda xatolik.' });
    }
}

async function listUserRequests(req, res) {
    const { uid } = req.user;
    try {
        const requests = await RepairRequest.find({ uid }).sort({ createdAt: -1 });
        return res.status(200).json(requests);
    } catch (err) {
        return res.status(500).json({ error: 'So‘rovlar ro‘yxatini olishda xatolik.' });
    }
}

async function confirmOtherRequest(req, res) {
    const { id } = req.params;
    const { uid } = req.user;

    try {
        const request = await RepairRequest.findById(id);
        if (!request) return res.status(404).json({ error: 'So‘rov topilmadi.' });
        if (request.uid !== uid || request.problemType !== 'other' || request.status !== 'PENDING') {
            return res.status(400).json({ error: 'Tasdiqlash shartlari bajarilmagan.' });
        }

        request.status = 'CONFIRMED';
        await request.save();
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Server xatosi.' });
    }
}

async function deleteRequest(req, res) {
    const { id } = req.params;
    const { uid } = req.user;

    try {
        const request = await RepairRequest.findById(id);
        if (!request || request.uid !== uid || request.status !== 'WAITING') {
            return res.status(400).json({ error: 'So‘rovni o‘chirishga ruxsat yo‘q.' });
        }
        await request.deleteOne();
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: 'Server xatosi.' });
    }
}

async function cancelPendingRequest(req, res) {
    const { id } = req.params;

    try {
        const request = await RepairRequest.findById(id);
        if (!request) return res.status(404).json({ error: 'So‘rov topilmadi.' });
        if (request.status !== 'WAITING' && request.status !== 'PENDING') {
            return res.status(400).json({ error: 'Faqatgina kutishdagi yoki tasdiqlanmagan so‘rovni bekor qilish mumkin.' });
        }

        await request.deleteOne();
        return res.status(200).json({ success: true, message: 'So‘rov bekor qilindi.' });
    } catch (err) {
        return res.status(500).json({ error: 'Server xatosi.' });
    }
}

async function sendMessageToAdmin(req, res) {
    const { uid } = req.user;
    const { message } = req.body;

    if (!message?.trim()) {
        return res.status(400).json({ error: 'Xabar matni kerak.' });
    }

    const chatId = `${uid}_admin`;

    try {
        const newMessage = new Message({
            senderId: uid,
            receiverId: 'admin',
            message,
            chatId,
        });
        await newMessage.save();

        return res.status(200).json({ success: true, message: 'Xabar yuborildi' });
    } catch (err) {
        return res.status(500).json({ error: 'Xabar yuborishda xato yuz berdi.' });
    }
}

async function getChatMessages(req, res) {
    const { uid } = req.user;
    const chatId = `${uid}_admin`;

    try {
        const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
        return res.status(200).json({ messages });
    } catch (err) {
        return res.status(500).json({ error: 'Xabarlarni olishda xatolik yuz berdi.' });
    }
}

module.exports = {
    requestRepair,
    listUserRequests,
    confirmOtherRequest,
    deleteRequest,
    cancelPendingRequest,
    sendMessageToAdmin,
    getChatMessages,
};