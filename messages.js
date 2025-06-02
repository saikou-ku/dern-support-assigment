// API Configuration
const API_BASE_URL = "http://localhost:5000/api"

// Global state
let currentUser = null
let otherUserId = null
let otherUserName = "Admin Yordam"
let messageRefreshInterval = null

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
        profileImgElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=1e293b&color=fff&size=32`
        profileImgElement.onerror = function () {
            this.src = "https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=32"
        }
    }
}

// Setup chat user based on current user role and URL parameters
function setupChatUser() {
    const urlParams = new URLSearchParams(window.location.search)
    const userIdParam = urlParams.get("userId")

    if (currentUser.isAdmin) {
        if (userIdParam) {
            // Admin chatting with specific user
            otherUserId = userIdParam
            fetchUserDetails(userIdParam)
        } else {
            // Admin general chat - find first available user or use default
            otherUserId = "user_default"
            otherUserName = "Foydalanuvchi"
        }
    } else {
        // Regular user chatting with admin
        otherUserId = "admin"
        otherUserName = "Admin Yordam"
        findAdminUser()
    }

    updateChatHeader()
}

// Fetch user details for admin chat
async function fetchUserDetails(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })

        if (response.ok) {
            const data = await response.json()
            const user = data.users.find((u) => u.uid === userId)
            if (user) {
                otherUserName = user.username
                updateChatHeader()
            }
        }
    } catch (error) {
        console.error("Error fetching user details:", error)
    }
}

// Find admin user for regular users
async function findAdminUser() {
    try {
        // For regular users, we'll use a default admin ID
        // In a real app, you'd fetch the admin list
        otherUserId = "av3sv3yzs"
        otherUserName = "Admin Yordam"
    } catch (error) {
        console.error("Error finding admin:", error)
    }
}

// Update chat header
function updateChatHeader() {
    const chatUserNameElement = document.getElementById("chatUserName")
    const chatDescriptionElement = document.getElementById("chatDescription")
    const chatAvatarElement = document.querySelector(".chat-avatar")

    if (chatUserNameElement) {
        chatUserNameElement.textContent = otherUserName
    }

    if (chatDescriptionElement) {
        chatDescriptionElement.textContent = currentUser.isAdmin
            ? "Foydalanuvchi bilan suhbat"
            : "Yordam xizmati bilan suhbat"
    }

    if (chatAvatarElement) {
        chatAvatarElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUserName)}&background=1e293b&color=fff&size=40`
        chatAvatarElement.onerror = function () {
            this.src = "https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=40"
        }
    }
}

// Initialize chat
function initializeChat() {
    loadMessages()

    // Set up auto-refresh every 5 seconds
    messageRefreshInterval = setInterval(loadMessages, 5000)
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
        refreshBtn.addEventListener("click", () => {
            loadMessages()
            showNotification("Xabarlar yangilandi", "success")
        })
    }

    // Handle page visibility change to pause/resume auto-refresh
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (messageRefreshInterval) {
                clearInterval(messageRefreshInterval)
            }
        } else {
            messageRefreshInterval = setInterval(loadMessages, 5000)
        }
    })
}

// Load messages with enhanced error handling
async function loadMessages() {
    if (!otherUserId) return

    try {
        const response = await fetch(`${API_BASE_URL}/messages/messages?userId=${otherUserId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })

        if (response.ok) {
            const data = await response.json()
            displayMessages(data.messages || [])
        } else if (response.status === 401) {
            logout()
        } else {
            console.error("Failed to load messages:", response.status)
        }
    } catch (error) {
        console.error("Error loading messages:", error)
    }
}

// Display messages with enhanced styling
function displayMessages(messages) {
    const container = document.getElementById("chatMessages")
    if (!container) return

    const wasScrolledToBottom = isScrolledToBottom(container)

    if (!messages || messages.length === 0) {
        container.innerHTML = `
            <div class="empty-chat-state">
                <div class="empty-chat-icon">
                    <i class="fas fa-comments"></i>
                </div>
                <h3>Suhbat boshlang</h3>
                <p>Hali xabarlar yo'q. Birinchi xabaringizni yuboring!</p>
            </div>
        `
        return
    }

    container.innerHTML = messages
        .map((message, index) => {
            const isSent = message.senderId === currentUser.uid
            const avatarName = isSent ? currentUser.username : otherUserName
            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=1e293b&color=fff&size=32`

            const messageTime = new Date(message.timestamp)
            const timeString = messageTime.toLocaleTimeString("uz-UZ", {
                hour: "2-digit",
                minute: "2-digit",
            })

            const dateString = messageTime.toLocaleDateString("uz-UZ")
            const isToday = new Date().toLocaleDateString("uz-UZ") === dateString

            // Show date separator if this is the first message of a new day
            let dateSeparator = ""
            if (index === 0 || new Date(messages[index - 1].timestamp).toLocaleDateString("uz-UZ") !== dateString) {
                dateSeparator = `
                    <div class="date-separator">
                        <span>${isToday ? "Bugun" : dateString}</span>
                    </div>
                `
            }

            return `
                ${dateSeparator}
                <div class="message-item ${isSent ? "sent" : "received"}">
                    <div class="message-avatar">
                        <img src="${avatarUrl}" alt="${avatarName}" onerror="this.src='https://ui-avatars.com/api/?name=User&background=1e293b&color=fff&size=32'">
                    </div>
                    <div class="message-bubble">
                        <div class="message-text">${escapeHtml(message.message)}</div>
                        <div class="message-time">${timeString}</div>
                    </div>
                </div>
            `
        })
        .join("")

    // Scroll to bottom if user was already at bottom or if it's a new message
    if (wasScrolledToBottom || messages.length === 1) {
        container.scrollTop = container.scrollHeight
    }
}

// Handle send message with enhanced validation
async function handleSendMessage(e) {
    e.preventDefault()

    const form = e.target
    const messageInput = document.getElementById("messageInput")
    const message = messageInput.value.trim()

    if (!message) {
        showNotification("Xabar bo'sh bo'lishi mumkin emas", "error")
        return
    }

    if (message.length > 1000) {
        showNotification("Xabar juda uzun (maksimal 1000 belgi)", "error")
        return
    }

    if (!otherUserId) {
        showNotification("Qabul qiluvchi aniqlanmagan", "error")
        return
    }

    // Disable input while sending
    messageInput.disabled = true

    try {
        const response = await fetch(`${API_BASE_URL}/messages/messages`, {
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

        if (response.ok) {
            messageInput.value = ""
            loadMessages() // Reload messages to show the new one
        } else if (response.status === 401) {
            logout()
        } else {
            const errorData = await response.json().catch(() => ({ error: "Xabar yuborishda xatolik" }))
            showNotification(errorData.error || "Xabar yuborishda xatolik", "error")
        }
    } catch (error) {
        console.error("Error sending message:", error)
        showNotification("Tarmoq xatosi. Qaytadan urinib ko'ring.", "error")
    } finally {
        messageInput.disabled = false
        messageInput.focus()
    }
}

// Utility functions
function escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

function isScrolledToBottom(element) {
    return element.scrollHeight - element.clientHeight <= element.scrollTop + 1
}

function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `

    switch (type) {
        case "success":
            notification.style.backgroundColor = "#059669"
            break
        case "error":
            notification.style.backgroundColor = "#dc2626"
            break
        case "warning":
            notification.style.backgroundColor = "#d97706"
            break
        default:
            notification.style.backgroundColor = "#1e40af"
    }

    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
        notification.style.transform = "translateX(0)"
    }, 100)

    setTimeout(() => {
        notification.style.transform = "translateX(100%)"
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification)
            }
        }, 300)
    }, 5000)
}

function logout() {
    // Clear auto-refresh interval
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval)
    }

    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "login.html"
}

// Clean up on page unload
window.addEventListener("beforeunload", () => {
    if (messageRefreshInterval) {
        clearInterval(messageRefreshInterval)
    }
})
