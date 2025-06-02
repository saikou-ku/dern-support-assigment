// API Configuration
const API_BASE_URL = "http://localhost:5000/api"

// Initialize auth pages
document.addEventListener("DOMContentLoaded", () => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    if (token) {
        window.location.href = "index.html"
        return
    }

    initializeAuthForms()
})

function initializeAuthForms() {
    // Login form
    const loginForm = document.getElementById("loginForm")
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin)
    }

    // Register form
    const registerForm = document.getElementById("registerForm")
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister)
    }
}

// Enhanced request function with better error handling
async function makeRequest(url, options = {}) {
    try {
        const defaultOptions = {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            ...options,
        }

        console.log("Making request to:", url)
        const response = await fetch(url, defaultOptions)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Tarmoq xatosi" }))
            throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Request failed:", error)
        throw error
    }
}

// Handle login with enhanced validation
async function handleLogin(e) {
    e.preventDefault()

    const form = e.target
    const submitBtn = form.querySelector('button[type="submit"]')
    const errorElement = document.getElementById("errorMessage")

    // Clear previous errors
    hideError(errorElement)

    // Validate form
    const email = form.email.value.trim()
    const password = form.password.value

    if (!email || !password) {
        showError(errorElement, "Iltimos, barcha maydonlarni to'ldiring")
        return
    }

    if (!isValidEmail(email)) {
        showError(errorElement, "Iltimos, to'g'ri email manzilini kiriting")
        return
    }

    // Show loading state
    toggleButtonLoading(submitBtn, true)

    try {
        const data = await makeRequest(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        })

        // Store token and user data
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Show success message
        showSuccessMessage("Muvaffaqiyatli kirildi! Yo'naltirilmoqda...")

        // Redirect to dashboard after short delay
        setTimeout(() => {
            window.location.href = "index.html"
        }, 1000)
    } catch (error) {
        console.error("Login error:", error)
        showError(errorElement, error.message || "Kirish jarayonida xatolik yuz berdi")
    } finally {
        toggleButtonLoading(submitBtn, false)
    }
}

// Handle registration with enhanced validation
async function handleRegister(e) {
    e.preventDefault()

    const form = e.target
    const submitBtn = form.querySelector('button[type="submit"]')
    const errorElement = document.getElementById("errorMessage")

    // Clear previous errors
    hideError(errorElement)

    // Get form values
    const email = form.email.value.trim()
    const username = form.username.value.trim()
    const password = form.password.value
    const confirmPassword = form.confirmPassword.value

    // Validate form
    if (!email || !username || !password || !confirmPassword) {
        showError(errorElement, "Iltimos, barcha maydonlarni to'ldiring")
        return
    }

    if (!isValidEmail(email)) {
        showError(errorElement, "Iltimos, to'g'ri email manzilini kiriting")
        return
    }

    if (username.length < 3) {
        showError(errorElement, "Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak")
        return
    }

    if (password.length < 6) {
        showError(errorElement, "Parol kamida 6 ta belgidan iborat bo'lishi kerak")
        return
    }

    if (password !== confirmPassword) {
        showError(errorElement, "Parollar mos kelmaydi")
        return
    }

    // Show loading state
    toggleButtonLoading(submitBtn, true)

    try {
        const data = await makeRequest(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            body: JSON.stringify({
                email: email,
                username: username,
                password: password,
            }),
        })

        // Store token and user data
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Show success message
        showSuccessMessage("Hisob muvaffaqiyatli yaratildi! Yo'naltirilmoqda...")

        // Redirect to dashboard after short delay
        setTimeout(() => {
            window.location.href = "index.html"
        }, 1000)
    } catch (error) {
        console.error("Registration error:", error)
        showError(errorElement, error.message || "Ro'yxatdan o'tishda xatolik yuz berdi")
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

function showError(element, message) {
    if (element) {
        element.textContent = message
        element.style.display = "block"
        element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
}

function hideError(element) {
    if (element) {
        element.style.display = "none"
    }
}

function showSuccessMessage(message) {
    const notification = document.createElement("div")
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #059669;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `
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
    }, 3000)
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}
