const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })
}

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    } catch (error) {
        return null
    }
}

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12)
}

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword)
}

const generateUID = () => {
    return Math.random().toString(36).substr(2, 9)
}

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    generateUID,
}
