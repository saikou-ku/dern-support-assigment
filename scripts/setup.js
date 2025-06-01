const fs = require("fs")
const path = require("path")

// Create default avatar
const createDefaultAvatar = () => {
    const uploadsDir = path.join(__dirname, "../uploads")
    const profilesDir = path.join(uploadsDir, "profiles")

    // Create directories if they don't exist
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir)
    }
    if (!fs.existsSync(profilesDir)) {
        fs.mkdirSync(profilesDir)
    }

    // Create a simple default avatar placeholder
    const defaultAvatarPath = path.join(profilesDir, "default-avatar.png")
    if (!fs.existsSync(defaultAvatarPath)) {
        // Create a simple text file as placeholder
        fs.writeFileSync(defaultAvatarPath, "Default Avatar Placeholder")
        console.log("Default avatar placeholder created")
    }
}

createDefaultAvatar()
console.log("Setup completed!")
