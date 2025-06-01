// API Configuration
const API_BASE_URL = "http://localhost:5000/api"

// Global state
let currentUser = null
let otherUserId = "av3sv3yzs"
let otherUserName = "Admin Yordam"

// Initialize messages page
document.addEventListener("DOMContentLoaded", () => {
    checkAuth()
    initializeChat()
    initializeEventListeners()
})

// Check authentication
function checkAuth() {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
        window.location.href = "login.html"
        return
    }

    try {
        currentUser = JSON.parse(userData)
        updateNavbar()
        setupChatUser()
    } catch (error) {
        console.error("Error parsing user data:", error)
        logout()
    }
}

// Update navbar with user info
function updateNavbar() {
    if (!currentUser) return

    const usernameElement = document.getElementById("username")
    const profileImgElement = document.getElementById("profileImg")

    if (usernameElement) {
        usernameElement.textContent = currentUser.username
    }

    if (profileImgElement) {
        profileImgElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=667eea&color=fff&size=32`
        profileImgElement.onerror = function () {
            this.src = "https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=32"
        }
    }
}

// Setup chat user based on current user role
function setupChatUser() {
    const urlParams = new URLSearchParams(window.location.search)
    const userIdParam = urlParams.get("userId")

    if (currentUser.isAdmin && userIdParam) {
        otherUserId = userIdParam
        otherUserName = "Foydalanuvchi"
    } else if (currentUser.isAdmin) {
        otherUserId = "user123"
        otherUserName = "Foydalanuvchi"
    } else {
        otherUserId = "admin"
        otherUserName = "Admin Yordam"
    }

    // Update chat header with proper avatar
    const chatUserNameElement = document.getElementById("chatUserName")
    const chatDescriptionElement = document.getElementById("chatDescription")
    const chatAvatarElement = document.querySelector(".chat-avatar")

    if (chatUserNameElement) {
        chatUserNameElement.textContent = otherUserName
    }

    if (chatDescriptionElement) {
        chatDescriptionElement.textContent = currentUser.isAdmin
            ? "Foydalanuvchilar bilan suhbat"
            : "Yordam xizmati bilan suhbat"
    }

    if (chatAvatarElement) {
        chatAvatarElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUserName)}&background=667eea&color=fff&size=40`
        chatAvatarElement.onerror = function () {
            this.src = "https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=40"
        }
    }
}

// Initialize chat - REMOVED AUTO REFRESH
function initializeChat() {
    loadMessages()
}

// Initialize event listeners
function initializeEventListeners() {
    const messageForm = document.getElementById("messageForm")
    if (messageForm) {
        messageForm.addEventListener("submit", handleSendMessage)
    }

    // Add refresh button functionality
    const refreshBtn = document.getElementById("refreshMessages")
    if (refreshBtn) {
        refreshBtn.addEventListener("click", loadMessages)
    }
}

// Load messages
async function loadMessages() {
    try {
        const response = await fetch(`${API_BASE_URL}/messages?userId=${otherUserId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })

        const data = await response.json()

        if (response.ok) {
            displayMessages(data.messages || [])
        } else {
            console.error("Failed to load messages:", data.error)
        }
    } catch (error) {
        console.error("Error loading messages:", error)
    }
}

// Display messages
function displayMessages(messages) {
    const container = document.getElementById("chatMessages")
    if (!container) return

    if (!messages || messages.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="color: #6b7280; padding: 40px;">
                <p>Hali xabarlar yo'q. Suhbatni boshlang!</p>
            </div>
        `
        return
    }

    container.innerHTML = messages
        .map((message) => {
            const isSent = message.senderId === currentUser.uid
            const avatarName = isSent ? currentUser.username : otherUserName
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=667eea&color=fff&size=32`

            return `
            <div class="message-item ${isSent ? "sent" : "received"}">
                <div class="message-avatar">
                    <img src="${avatarUrl}" alt="${avatarName}" onerror="this.src='https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=32'">
                </div>
                <div class="message-bubble">
                    <div class="message-text">${escapeHtml(message.message)}</div>
                    <div class="message-time">${new Date(message.timestamp).toLocaleTimeString("uz-UZ")}</div>
                </div>
            </div>
        `
        })
        .join("")

    container.scrollTop = container.scrollHeight
}

// Handle send message
async function handleSendMessage(e) {
    e.preventDefault()

    const form = e.target
    const messageInput = document.getElementById("messageInput")
    const message = messageInput.value.trim()

    if (!message) return

    try {
        const response = await fetch(`${API_BASE_URL}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                receiverId: otherUserId,
                message: message,
            }),
        })

        const data = await response.json()

        if (response.ok) {
            messageInput.value = ""
            loadMessages()
        } else {
            showNotification(data.error || "Xabar yuborishda xatolik", "error")
        }
    } catch (error) {
        console.error("Error sending message:", error)
        showNotification("Tarmoq xatosi. Qaytadan urinib ko'ring.", "error")
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `

    switch (type) {
        case "success":
            notification.style.backgroundColor = "#10b981"
            break
        case "error":
            notification.style.backgroundColor = "#ef4444"
            break
        case "warning":
            notification.style.backgroundColor = "#f59e0b"
            break
        default:
            notification.style.backgroundColor = "#3b82f6"
    }

    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
        notification.style.transform = "translateX(0)"
    }, 100)

    setTimeout(() => {
        notification.style.transform = "translateX(100%)"
        setTimeout(() => {
            document.body.removeChild(notification)
        }, 300)
    }, 5000)
}

function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "login.html"
}
