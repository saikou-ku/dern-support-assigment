const mongoose = require("mongoose")

const repairRequestSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
    },
    issueName: {
        type: String,
        required: true,
    },
    problemType: {
        type: String,
        required: true,
    },
    isOther: {
        type: Boolean,
        default: false,
    },
    description: {
        type: String,
    },
    location: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "WAITING",
        enum: ["WAITING", "IN_PROGRESS", "COMPLETED", "CANCELLED", "CONFIRMED"],
    },
    price: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("RepairRequest", repairRequestSchema)
