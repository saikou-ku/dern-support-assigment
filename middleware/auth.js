const jwt = require("jsonwebtoken")
const User = require("../models/User")

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return res.status(401).json({ error: "No token provided" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "618a2ac6c5125155271cfb36cc6e99cb986e07d988f3497d49bdfd96b1db34612ec84281915cf26985901b38cd0de032566dfb2dbd4c7c35ac6481b322d6ee0039c5155b896bfebf190b44765b0f08ba3661b9502f00e42a14da69c885ee92864073869c6410d13a93e7ed912820d51af167126ac16ab28eb3fe96a65208c1798fa4197858761665113d717652bef7caac7023056653b3b38a2ffaf4f2373b26708b73743cde52848a259a0a0f1e9ae5698cbf2f926bcc87b7ef251634d2e916407b1c17747caa9991baebac1888b48f4ba2c44ac0a6487bf39376d226f68761681d18252be2011334079108e56c70dd2d352c3037f60e0d7ead2a48cc18d8d8")
        const user = await User.findOne({ uid: decoded.uid })

        if (!user) {
            return res.status(401).json({ error: "User not found" })
        }

        req.user = user
        next()
    } catch (error) {
        console.error("Auth middleware error:", error)
        res.status(401).json({ error: "Invalid token" })
    }
}

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {})

        if (!req.user.isAdmin) {
            return res.status(403).json({ error: "Admin access required" })
        }

        next()
    } catch (error) {
        console.error("Admin auth error:", error)
        res.status(403).json({ error: "Admin access required" })
    }
}

module.exports = { auth, adminAuth }
