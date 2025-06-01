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

// Add request interceptor for better error handling
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

// Update the handleLogin function to use makeRequest
async function handleLogin(e) {
    e.preventDefault()

    const form = e.target
    const submitBtn = form.querySelector('button[type="submit"]')
    const errorElement = document.getElementById("errorMessage")

    // Clear previous errors
    hideError(errorElement)

    // Show loading state
    toggleButtonLoading(submitBtn, true)

    try {
        const data = await makeRequest(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
                email: form.email.value,
                password: form.password.value,
            }),
        })

        // Store token and user data
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect to dashboard
        window.location.href = "index.html"
    } catch (error) {
        console.error("Login error:", error)
        showError(errorElement, error.message || "Tarmoq xatosi. Qaytadan urinib ko'ring.")
    } finally {
        toggleButtonLoading(submitBtn, false)
    }
}

// Update the handleRegister function similarly
async function handleRegister(e) {
    e.preventDefault()

    const form = e.target
    const submitBtn = form.querySelector('button[type="submit"]')
    const errorElement = document.getElementById("errorMessage")

    // Clear previous errors
    hideError(errorElement)

    // Validate passwords match
    const password = form.password.value
    const confirmPassword = form.confirmPassword.value

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
                email: form.email.value,
                username: form.username.value,
                password: password,
            }),
        })

        // Store token and user data
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect to welcome page
        window.location.href = "welcome.html"
    } catch (error) {
        console.error("Registration error:", error)
        showError(errorElement, error.message || "Tarmoq xatosi. Qaytadan urinib ko'ring.")
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
    }
}

function hideError(element) {
    if (element) {
        element.style.display = "none"
    }
}
