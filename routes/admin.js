const express = require("express")
const RepairRequest = require("../models/RepairRequest")
const User = require("../models/User")
const { adminAuth } = require("../middleware/auth")

const router = express.Router()

// Get all repair requests (admin)
router.get("/requests", adminAuth, async (req, res) => {
    try {
        const requests = await RepairRequest.find().sort({ createdAt: -1 })

        // Get user details for each request
        const requestsWithUsers = await Promise.all(
            requests.map(async (req) => {
                const user = await User.findOne({ uid: req.uid })
                return {
                    ...req.toObject(),
                    user: user ? { username: user.username, email: user.email } : null,
                }
            }),
        )

        res.json({ requests: requestsWithUsers })
    } catch (error) {
        console.error("Get admin requests error:", error)
        res.status(500).json({ error: "Failed to fetch requests" })
    }
})

// Update repair request (admin)
router.put("/request/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params
        const { status, price } = req.body

        const updatedRequest = await RepairRequest.findByIdAndUpdate(id, { status, price }, { new: true })

        if (!updatedRequest) {
            return res.status(404).json({ error: "Request not found" })
        }

        res.json({
            message: "Request updated successfully",
            request: updatedRequest,
        })
    } catch (error) {
        console.error("Update admin request error:", error)
        res.status(500).json({ error: "Failed to update request" })
    }
})

// Get all users (admin)
router.get("/users", adminAuth, async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false }).select("-password").sort({ createdAt: -1 })
        res.json({ users })
    } catch (error) {
        console.error("Get users error:", error)
        res.status(500).json({ error: "Failed to fetch users" })
    }
})

// Delete user (admin)
router.delete("/users", adminAuth, async (req, res) => {
    try {
        const { uid } = req.body

        const deletedUser = await User.findOneAndDelete({ uid })
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" })
        }

        // Also delete user's repair requests
        await RepairRequest.deleteMany({ uid })

        res.json({ message: "User deleted successfully" })
    } catch (error) {
        console.error("Delete user error:", error)
        res.status(500).json({ error: "Failed to delete user" })
    }
})

module.exports = router
