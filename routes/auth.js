const express = require("express")
const User = require("../models/User")
const { hashPassword, comparePassword, generateToken, generateUID } = require("../utils/auth")
const { auth } = require("../middleware/auth")

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" })
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password)
        const uid = generateUID()

        const user = new User({
            uid,
            email,
            username,
            password: hashedPassword,
        })

        await user.save()

        // Generate token
        const token = generateToken({ uid: user.uid, email: user.email })

        res.json({
            message: "User created successfully",
            token,
            user: {
                uid: user.uid,
                email: user.email,
                username: user.username,
                isAdmin: user.isAdmin,
                profileImage: user.profileImage,
            },
        })
    } catch (error) {
        console.error("Register error:", error)
        res.status(500).json({ error: "Registration failed" })
    }
})

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body

        // Find user
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" })
        }

        // Check password
        const isValidPassword = await comparePassword(password, user.password)
        if (!isValidPassword) {
            return res.status(400).json({ error: "Invalid credentials" })
        }

        // Generate token
        const token = generateToken({ uid: user.uid, email: user.email })

        res.json({
            message: "Login successful",
            token,
            user: {
                uid: user.uid,
                email: user.email,
                username: user.username,
                isAdmin: user.isAdmin,
                profileImage: user.profileImage,
            },
        })
    } catch (error) {
        console.error("Login error:", error)
        res.status(500).json({ error: "Login failed" })
    }
})

// Get Profile
router.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid }).select("-password")
        res.json({ user })
    } catch (error) {
        console.error("Get profile error:", error)
        res.status(500).json({ error: "Failed to fetch profile" })
    }
})

// Update Profile
router.put("/profile", auth, async (req, res) => {
    try {
        const { username, email, currentPassword, newPassword } = req.body
        const updateData = {}

        // Update username if provided
        if (username) {
            updateData.username = username
        }

        // Update email if provided
        if (email) {
            // Check if email is already taken
            const existingUser = await User.findOne({ email, uid: { $ne: req.user.uid } })
            if (existingUser) {
                return res.status(400).json({ error: "Email already taken" })
            }
            updateData.email = email
        }

        // Update password if provided
        if (currentPassword && newPassword) {
            const user = await User.findOne({ uid: req.user.uid })
            const isValidPassword = await comparePassword(currentPassword, user.password)

            if (!isValidPassword) {
                return res.status(400).json({ error: "Current password is incorrect" })
            }

            updateData.password = await hashPassword(newPassword)
        }

        const updatedUser = await User.findOneAndUpdate({ uid: req.user.uid }, updateData, { new: true }).select(
            "-password",
        )

        res.json({
            message: "Profile updated successfully",
            user: updatedUser,
        })
    } catch (error) {
        console.error("Update profile error:", error)
        res.status(500).json({ error: "Failed to update profile" })
    }
})

module.exports = router
