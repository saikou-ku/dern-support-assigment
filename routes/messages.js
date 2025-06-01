const express = require("express")
const Message = require("../models/Message")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Send message
router.post("/messages", auth, async (req, res) => {
    try {
        const { receiverId, message } = req.body
        const chatId = [req.user.uid, receiverId].sort().join("-")

        const newMessage = new Message({
            senderId: req.user.uid,
            receiverId,
            message,
            chatId,
        })

        await newMessage.save()

        res.json({
            message: "Message sent successfully",
            data: newMessage,
        })
    } catch (error) {
        console.error("Send message error:", error)
        res.status(500).json({ error: "Failed to send message" })
    }
})

// Get messages
router.get("/messages", auth, async (req, res) => {
    try {
        const { userId } = req.query

        if (!userId) {
            return res.status(400).json({ error: "User ID required" })
        }

        const chatId = [req.user.uid, userId].sort().join("-")
        const messages = await Message.find({ chatId }).sort({ timestamp: 1 })

        res.json({ messages })
    } catch (error) {
        console.error("Get messages error:", error)
        res.status(500).json({ error: "Failed to fetch messages" })
    }
})

module.exports = router
