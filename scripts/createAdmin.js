const mongoose = require("mongoose")
const User = require("../models/User")
const { hashPassword, generateUID } = require("../utils/auth")

const createAdmin = async () => {
    try {
        // Connect to database
        await mongoose.connect("mongodb+srv://virgroupuz:96SsKyZyTMehvcAN@cluster0.58s23ow.mongodb.net/?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            dbName: "virgroupuz",
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: "admin@gmail.com" })
        if (existingAdmin) {
            console.log("Admin user already exists!")
            process.exit(0)
        }

        // Create admin user
        const hashedPassword = await hashPassword("admin22")
        const uid = generateUID()

        const admin = new User({
            uid,
            email: "admin@gmail.com",
            username: "Admin",
            password: hashedPassword,
            isAdmin: true,
        })

        await admin.save()
        console.log("Admin user created successfully!")
        console.log("Email: admin@repair.com")
        console.log("Password: admin123")

        process.exit(0)
    } catch (error) {
        console.error("Error creating admin:", error)
        process.exit(1)
    }
}

createAdmin()
