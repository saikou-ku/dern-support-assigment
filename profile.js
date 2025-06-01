// API Configuration
const API_BASE_URL = "http://localhost:5000/api"

// Global state
let currentUser = null

// Initialize profile page
document.addEventListener("DOMContentLoaded", () => {
    checkAuth()
    initializeEventListeners()
    loadProfile()
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
        profileImgElement.src = "https://via.placeholder.com/32"
        profileImgElement.onerror = function () {
            this.src = "https://via.placeholder.com/32"
        }
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Profile form
    const profileForm = document.getElementById("profileForm")
    if (profileForm) {
        profileForm.addEventListener("submit", handleProfileUpdate)
    }
}

// Load profile data
async function loadProfile() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })

        const data = await response.json()

        if (response.ok) {
            populateProfileForm(data.user)
        } else {
            showMessage(data.error || "Profilni yuklashda xatolik", "error")
        }
    } catch (error) {
        console.error("Error loading profile:", error)
        showMessage("Tarmoq xatosi. Qaytadan urinib ko'ring.", "error")
    }
}

// Populate profile form with user data
function populateProfileForm(user) {
    // Basic information
    const usernameInput = document.getElementById("profileUsername")
    const emailInput = document.getElementById("profileEmail")

    if (usernameInput) usernameInput.value = user.username || ""
    if (emailInput) emailInput.value = user.email || ""

    // Account information
    const userIdInfo = document.getElementById("userIdInfo")
    const memberSinceInfo = document.getElementById("memberSinceInfo")

    if (userIdInfo) userIdInfo.textContent = user.uid || "-"
    if (memberSinceInfo) {
        memberSinceInfo.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString("uz-UZ") : "-"
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault()

    const form = e.target
    const submitBtn = form.querySelector('button[type="submit"]')
    const messageElement = document.getElementById("profileMessage")

    // Clear previous messages
    hideMessage(messageElement)

    // Validate password confirmation if passwords are provided
    const newPassword = form.newPassword.value
    const confirmNewPassword = form.confirmNewPassword.value

    if (newPassword && newPassword !== confirmNewPassword) {
        showMessage("Yangi parollar mos kelmaydi", "error")
        return
    }

    // Show loading state
    toggleButtonLoading(submitBtn, true)

    try {
        // Use JSON instead of FormData
        const profileData = {
            username: form.username.value,
            email: form.email.value,
        }

        // Add password fields if provided
        const currentPassword = form.currentPassword.value
        if (currentPassword && newPassword) {
            profileData.currentPassword = currentPassword
            profileData.newPassword = newPassword
        }

        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(profileData),
        })

        const data = await response.json()

        if (response.ok) {
            showMessage("Profil muvaffaqiyatli yangilandi!", "success")

            // Update stored user data
            const updatedUser = { ...currentUser, ...data.user }
            localStorage.setItem("user", JSON.stringify(updatedUser))
            currentUser = updatedUser

            // Update navbar
            updateNavbar()

            // Clear password fields
            document.getElementById("currentPassword").value = ""
            document.getElementById("newPassword").value = ""
            document.getElementById("confirmNewPassword").value = ""
        } else {
            showMessage(data.error || "Profilni yangilashda xatolik", "error")
        }
    } catch (error) {
        console.error("Error updating profile:", error)
        showMessage("Tarmoq xatosi. Qaytadan urinib ko'ring.", "error")
    } finally {
        toggleButtonLoading(submitBtn, false)
    }
}

// Utility functions
function toggleButtonLoading(button, isLoading) {
    const btnText = button.querySelector(".btn-text")
    const btnLoading = button.querySelector(".btn-loading")

    if (isLoading) {
        button.disabled = true
        if (btnText) btnText.style.display = "none"
        if (btnLoading) btnLoading.style.display = "flex"
    } else {
        button.disabled = false
        if (btnText) btnText.style.display = "inline"
        if (btnLoading) btnLoading.style.display = "none"
    }
}

function showMessage(message, type = "info") {
    const messageElement = document.getElementById("profileMessage")
    if (messageElement) {
        messageElement.textContent = message
        messageElement.className = `message ${type}`
        messageElement.style.display = "block"

        // Auto-hide success messages after 5 seconds
        if (type === "success") {
            setTimeout(() => {
                hideMessage(messageElement)
            }, 5000)
        }
    }
}

function hideMessage(element) {
    if (element) {
        element.style.display = "none"
    }
}

function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "login.html"
}
