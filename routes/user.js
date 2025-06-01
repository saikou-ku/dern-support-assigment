const express = require("express")
const RepairRequest = require("../models/RepairRequest")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Create repair request
router.post("/request", auth, async (req, res) => {
    try {
        const { issueName, problemType, description, location, isOther } = req.body

        const repairRequest = new RepairRequest({
            uid: req.user.uid,
            issueName,
            problemType,
            description,
            location,
            isOther: isOther || false,
        })

        await repairRequest.save()

        res.json({
            message: "Repair request created successfully",
            request: repairRequest,
        })
    } catch (error) {
        console.error("Create request error:", error)
        res.status(500).json({ error: "Failed to create repair request" })
    }
})

// Get user's repair requests
router.get("/requests", auth, async (req, res) => {
    try {
        const requests = await RepairRequest.find({ uid: req.user.uid }).sort({ createdAt: -1 })
        res.json({ requests })
    } catch (error) {
        console.error("Get requests error:", error)
        res.status(500).json({ error: "Failed to fetch requests" })
    }
})

// Update user's repair request
router.put("/request/:id", auth, async (req, res) => {
    try {
        const { id } = req.params
        const { action } = req.body

        const repairRequest = await RepairRequest.findById(id)
        if (!repairRequest) {
            return res.status(404).json({ error: "Request not found" })
        }

        // Check if user owns this request
        if (repairRequest.uid !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" })
        }

        let updatedRequest
        if (action === "confirm" && repairRequest.status === "COMPLETED") {
            // User confirms completion
            updatedRequest = await RepairRequest.findByIdAndUpdate(id, { status: "CONFIRMED" }, { new: true })
        } else if (action === "cancel" && repairRequest.status === "WAITING") {
            // User cancels pending request
            updatedRequest = await RepairRequest.findByIdAndUpdate(id, { status: "CANCELLED" }, { new: true })
        } else {
            return res.status(400).json({ error: "Invalid action or status" })
        }

        res.json({
            message: "Request updated successfully",
            request: updatedRequest,
        })
    } catch (error) {
        console.error("Update request error:", error)
        res.status(500).json({ error: "Failed to update request" })
    }
})

// Delete user's repair request
router.delete("/request/:id", auth, async (req, res) => {
    try {
        const { id } = req.params

        const repairRequest = await RepairRequest.findById(id)
        if (!repairRequest) {
            return res.status(404).json({ error: "Request not found" })
        }

        // Check if user owns this request
        if (repairRequest.uid !== req.user.uid) {
            return res.status(403).json({ error: "Unauthorized" })
        }

        // Only allow deletion if status is WAITING
        if (repairRequest.status !== "WAITING") {
            return res.status(400).json({ error: "Cannot delete request that is already in progress" })
        }

        await RepairRequest.findByIdAndDelete(id)

        res.json({ message: "Request deleted successfully" })
    } catch (error) {
        console.error("Delete request error:", error)
        res.status(500).json({ error: "Failed to delete request" })
    }
})

module.exports = router
