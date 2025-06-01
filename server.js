// This is a guide for fixing your server.js file
// Add the following code to your server.js file:

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bodyParser = require("body-parser")
const path = require("path")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const adminRoutes = require("./routes/admin")
const messageRoutes = require("./routes/messages")

const app = express()

// Middleware
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow any origin
            callback(null, true)
        },
        credentials: true,
    }),
)

// Important: Add body-parser middleware before routes
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Serve static files
app.use(express.static(path.join(__dirname, "public")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/messages", messageRoutes)

// Test route
app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!" })
})

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err))

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Test API: http://localhost:${PORT}/api/test`)
})
