// API Configuration
const API_BASE_URL = "http://localhost:5000/api"

// Service categories with subcategories and prices
const SERVICE_CATEGORIES = {
    Hardware: {
        name: "Kompyuter va Qurilma Xizmatlari",
        services: {
            "Noutbuk ta'mirlash": 150000,
            "Kompyuter yig'ish va tozalash": 120000,
            "Printer/skaner sozlash": 130000,
            "SSD/HDD almashtirish": 180000,
            "RAM kengaytirish": 100000,
            "Monitor ta'mirlash": 160000,
        },
    },
    Software: {
        name: "Dasturiy Ta'minot Xizmatlari",
        services: {
            "Windows/Linux o'rnatish": 100000,
            "Ofis dasturlari o'rnatish": 80000,
            "Antivirus o'rnatish va sozlash": 70000,
            "Drayver o'rnatish": 60000,
            "Ma'lumotlarni tiklash": 150000,
            "BIOS/UEFI yangilash": 90000,
        },
    },
    Network: {
        name: "Tarmoq va Internet Xizmatlari",
        services: {
            "Wi-Fi router sozlash": 100000,
            "LAN tarmoq qurish": 180000,
            "Modem o'rnatish va sozlash": 120000,
            "IP manzil sozlash": 80000,
            "Printerni tarmoq orqali ulash": 100000,
            "VPN va xavfsizlik sozlamalari": 130000,
        },
    },
}

// Global state
let currentUser = null
let currentTab = "new-request"

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
        showLandingPage()
        return
    }

    showDashboard()
})

// Show landing page
function showLandingPage() {
    const landingPage = document.querySelector(".landing-page")
    const dashboardContainer = document.querySelector(".dashboard-container")

    if (landingPage) landingPage.style.display = "flex"
    if (dashboardContainer) dashboardContainer.style.display = "none"

    initializeLandingEventListeners()
}

// Show dashboard
function showDashboard() {
    const landingPage = document.querySelector(".landing-page")
    const dashboardContainer = document.querySelector(".dashboard-container")

    if (landingPage) landingPage.style.display = "none"
    if (dashboardContainer) dashboardContainer.style.display = "block"

    initializeApp()
}

// Initialize landing page event listeners
function initializeLandingEventListeners() {
    const loginBtns = document.querySelectorAll("#landingLoginBtn")
    loginBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            window.location.href = "login.html"
        })
    })

    const registerBtns = document.querySelectorAll("#landingRegisterBtn")
    registerBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            window.location.href = "register.html"
        })
    })
}

// Initialize the app after authentication
function initializeApp() {
    checkAuth()
    initializeEventListeners()
}

// Check authentication
function checkAuth() {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
        showLandingPage()
        return
    }

    try {
        currentUser = JSON.parse(userData)
        updateNavbar()
        initializeDashboard()
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
    const adminBadge = document.getElementById("adminBadge")

    if (usernameElement) {
        usernameElement.textContent = currentUser.username
    }

    if (profileImgElement) {
        profileImgElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=667eea&color=fff&size=32`
        profileImgElement.onerror = function () {
            this.src = "https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=32"
        }
    }

    if (adminBadge && currentUser.isAdmin) {
        adminBadge.style.display = "inline-flex"
    }
}

// Initialize dashboard based on user role
function initializeDashboard() {
    const userDashboard = document.getElementById("userDashboard")
    const adminDashboard = document.getElementById("adminDashboard")

    if (currentUser.isAdmin) {
        if (userDashboard) userDashboard.style.display = "none"
        if (adminDashboard) {
            adminDashboard.style.display = "block"
            loadAdminData()
        }
    } else {
        if (userDashboard) userDashboard.style.display = "block"
        if (adminDashboard) adminDashboard.style.display = "none"
        loadUserRequests()
    }
}

// Initialize event listeners
function initializeEventListeners() {
    const repairForm = document.getElementById("repairRequestForm")
    if (repairForm) {
        repairForm.addEventListener("submit", handleRepairRequestSubmit)
    }

    // Initialize service category dropdown
    initializeServiceDropdowns()
}

// Initialize service dropdown functionality
function initializeServiceDropdowns() {
    const categorySelect = document.getElementById("serviceCategory")
    const serviceSelect = document.getElementById("specificService")
    const priceDisplay = document.getElementById("estimatedPrice")
    const isOtherCheckbox = document.getElementById("isOther")

    if (!categorySelect || !serviceSelect) return

    // Populate main categories
    categorySelect.innerHTML = '<option value="">Xizmat kategoriyasini tanlang</option>'
    Object.keys(SERVICE_CATEGORIES).forEach((key) => {
        const option = document.createElement("option")
        option.value = key
        option.textContent = SERVICE_CATEGORIES[key].name
        categorySelect.appendChild(option)
    })

    // Add "Other" option
    const otherOption = document.createElement("option")
    otherOption.value = "Other"
    otherOption.textContent = "Boshqa (maxsus xizmat)"
    categorySelect.appendChild(otherOption)

    // Handle category change
    categorySelect.addEventListener("change", function () {
        const selectedCategory = this.value

        if (!selectedCategory) {
            serviceSelect.style.display = "none"
            serviceSelect.innerHTML = '<option value="">Avval kategoriyani tanlang</option>'
            priceDisplay.textContent = ""
            isOtherCheckbox.checked = false
            return
        }

        if (selectedCategory === "Other") {
            serviceSelect.style.display = "none"
            priceDisplay.textContent = "Narx admin tomonidan belgilanadi"
            isOtherCheckbox.checked = true
            return
        }

        // Show and populate service dropdown
        serviceSelect.style.display = "block"
        serviceSelect.innerHTML = '<option value="">Aniq xizmatni tanlang</option>'

        const services = SERVICE_CATEGORIES[selectedCategory].services
        Object.keys(services).forEach((serviceName) => {
            const option = document.createElement("option")
            option.value = serviceName
            option.textContent = serviceName
            option.dataset.price = services[serviceName]
            serviceSelect.appendChild(option)
        })

        priceDisplay.textContent = ""
        isOtherCheckbox.checked = false
    })

    // Handle service change
    serviceSelect.addEventListener("change", function () {
        const selectedOption = this.options[this.selectedIndex]
        if (selectedOption.dataset.price) {
            const price = Number.parseInt(selectedOption.dataset.price)
            priceDisplay.textContent = `Taxminiy narx: ${price.toLocaleString()} so'm`
        } else {
            priceDisplay.textContent = ""
        }
    })
}

// Add request helper function
async function makeAuthenticatedRequest(url, options = {}) {
    try {
        const token = localStorage.getItem("token")
        const defaultOptions = {
            headers: {
                Accept: "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            ...options,
        }

        if (!(options.body instanceof FormData)) {
            defaultOptions.headers["Content-Type"] = "application/json"
        }

        console.log("Making authenticated request to:", url)
        const response = await fetch(url, defaultOptions)

        if (!response.ok) {
            if (response.status === 401) {
                logout()
                return
            }
            const errorData = await response.json().catch(() => ({ error: "Tarmoq xatosi" }))
            throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Authenticated request failed:", error)
        throw error
    }
}

// Handle repair request submit with service-based pricing
async function handleRepairRequestSubmit(e) {
    e.preventDefault()

    const form = e.target
    const submitBtn = form.querySelector('button[type="submit"]')

    toggleButtonLoading(submitBtn, true)

    try {
        const categorySelect = document.getElementById("serviceCategory")
        const serviceSelect = document.getElementById("specificService")
        const isOther = form.isOther.checked

        let problemType = ""
        let price = 0

        if (isOther || categorySelect.value === "Other") {
            problemType = "Boshqa"
            price = 0 // Admin will set price
        } else if (categorySelect.value && serviceSelect.value) {
            problemType = serviceSelect.value
            const selectedOption = serviceSelect.options[serviceSelect.selectedIndex]
            price = Number.parseInt(selectedOption.dataset.price) || 0
        } else {
            showNotification("Iltimos, xizmat kategoriyasi va aniq xizmatni tanlang", "error")
            return
        }

        const requestData = {
            issueName: form.issueName.value,
            problemType: problemType,
            serviceCategory: categorySelect.value,
            description: form.description.value,
            location: form.location.value,
            isOther: isOther || categorySelect.value === "Other",
            price: price,
        }

        const data = await makeAuthenticatedRequest(`${API_BASE_URL}/user/request`, {
            method: "POST",
            body: JSON.stringify(requestData),
        })

        showNotification("Ta'mirlash so'rovi muvaffaqiyatli yuborildi!", "success")
        form.reset()

        // Reset dropdowns
        document.getElementById("serviceCategory").value = ""
        document.getElementById("specificService").style.display = "none"
        document.getElementById("estimatedPrice").textContent = ""

        showTab("my-requests")
        loadUserRequests()
    } catch (error) {
        console.error("Error submitting request:", error)
        showNotification(error.message || "Ta'mirlash so'rovini yuborishda xatolik", "error")
    } finally {
        toggleButtonLoading(submitBtn, false)
    }
}

// Load user requests
async function loadUserRequests() {
    const container = document.getElementById("userRequestsList")
    if (!container) return

    try {
        const data = await makeAuthenticatedRequest(`${API_BASE_URL}/user/requests`)
        displayRequests(data.requests || [], container, false)
    } catch (error) {
        console.error("Error loading requests:", error)
        showNotification(error.message || "So'rovlarni yuklashda xatolik", "error")
        container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Ma'lumotlarni yuklashda xatolik yuz berdi</p>
        <button class="btn btn-secondary" onclick="loadUserRequests()">Qayta urinish</button>
      </div>
    `
    }
}

// Load admin data
async function loadAdminData() {
    try {
        await Promise.all([loadAllRequests(), loadUsers(), loadStats()])
    } catch (error) {
        console.error("Error loading admin data:", error)
        showNotification("Ma'lumotlarni yuklashda xatolik yuz berdi", "error")
    }
}

// Load all requests (admin)
async function loadAllRequests() {
    const container = document.getElementById("adminRequestsList")
    if (!container) return

    try {
        const data = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/requests`)
        displayRequests(data.requests || [], container, true)
        return data
    } catch (error) {
        console.error("Error loading requests:", error)
        showNotification(error.message || "So'rovlarni yuklashda xatolik", "error")
        container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>So'rovlarni yuklashda xatolik yuz berdi</p>
        <button class="btn btn-secondary" onclick="loadAllRequests()">Qayta urinish</button>
      </div>
    `
        throw error
    }
}

// Load users (admin)
async function loadUsers() {
    const container = document.getElementById("usersList")
    if (!container) return

    try {
        const data = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/users`)
        displayUsers(data.users || [], container)
        return data
    } catch (error) {
        console.error("Error loading users:", error)
        showNotification(error.message || "Foydalanuvchilarni yuklashda xatolik", "error")
        container.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Foydalanuvchilarni yuklashda xatolik yuz berdi</p>
        <button class="btn btn-secondary" onclick="loadUsers()">Qayta urinish</button>
      </div>
    `
        throw error
    }
}

// Load stats (admin)
async function loadStats() {
    try {
        const requestsData = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/requests`)
        const usersData = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/users`)

        const totalRequestsElement = document.getElementById("totalRequests")
        const totalUsersElement = document.getElementById("totalUsers")
        const totalMessagesElement = document.getElementById("totalMessages")
        const completionRateElement = document.getElementById("completionRate")

        if (totalRequestsElement) {
            totalRequestsElement.textContent = requestsData.requests ? requestsData.requests.length : 0
        }
        if (totalUsersElement) {
            totalUsersElement.textContent = usersData.users ? usersData.users.length : 0
        }
        if (totalMessagesElement) {
            totalMessagesElement.textContent = "0"
        }

        const requests = requestsData.requests || []
        const completedRequests = requests.filter((req) => req.status === "COMPLETED" || req.status === "CONFIRMED").length
        const completionRate = requests.length > 0 ? Math.round((completedRequests / requests.length) * 100) : 0
        if (completionRateElement) {
            completionRateElement.textContent = `${completionRate}%`
        }

        return { requestsData, usersData }
    } catch (error) {
        console.error("Error loading stats:", error)
        throw error
    }
}

// Display requests with improved service information
function displayRequests(requests, container, isAdmin) {
    if (!requests || requests.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-clipboard-list"></i>
        <h3>Hech qanday so'rov topilmadi</h3>
        <p>Hali ta'mirlash so'rovlari yuborilmagan.</p>
      </div>
    `
        return
    }

    container.innerHTML = requests
        .map(
            (request) => `
        <div class="request-card">
            <div class="request-header">
                <div class="request-title-section">
                    <h3 class="request-title">${request.issueName}</h3>
                    <div class="request-meta">
                        <span class="meta-item"><i class="fas fa-calendar"></i> ${new Date(request.createdAt).toLocaleDateString("uz-UZ")}</span>
                        <span class="meta-item"><i class="fas fa-map-marker-alt"></i> ${request.location}</span>
                        ${isAdmin && request.user ? `<span class="meta-item"><i class="fas fa-user"></i> ${request.user.username} (ID: ${request.user.uid})</span>` : ""}
                    </div>
                </div>
                <span class="status-badge status-${request.status.toLowerCase().replace("_", "-")}">${getStatusText(request.status)}</span>
            </div>
            <div class="request-content">
                <div class="request-info">
                    <div class="info-item">
                        <strong>Xizmat turi:</strong> 
                        <span class="problem-type">${request.problemType}</span>
                        ${request.serviceCategory ? `<span class="service-category">${getServiceCategoryName(request.serviceCategory)}</span>` : ""}
                        ${request.isOther ? '<span class="other-badge">Maxsus</span>' : ""}
                    </div>
                    ${
                request.description
                    ? `
                        <div class="info-item">
                            <strong>Tavsif:</strong> 
                            <span class="description">${request.description}</span>
                        </div>
                    `
                    : ""
            }
                    <div class="info-item price-info">
                        <strong>Narx:</strong> 
                        ${
                request.price > 0
                    ? `<span class="price">${request.price.toLocaleString()} so'm</span>`
                    : request.isOther
                        ? '<span class="price-pending">Admin tomonidan belgilanadi</span>'
                        : '<span class="price-free">Bepul konsultatsiya</span>'
            }
                        ${request.isOther && request.price > 0 && !request.priceConfirmed ? '<span class="price-status">Tasdiqlash kutilmoqda</span>' : ""}
                    </div>
                </div>
                
                <div class="request-actions">
                    ${getRequestActions(request, isAdmin)}
                </div>
            </div>
        </div>
    `,
        )
        .join("")
}

// Get service category name
function getServiceCategoryName(categoryKey) {
    return SERVICE_CATEGORIES[categoryKey]?.name || categoryKey
}

// Get status text in Uzbek
function getStatusText(status) {
    const statusTexts = {
        WAITING: "Kutilmoqda",
        IN_PROGRESS: "Jarayonda",
        COMPLETED: "Bajarildi",
        CANCELLED: "Bekor qilindi",
        CONFIRMED: "Tasdiqlandi",
        PRICE_PENDING: "Narx kutilmoqda",
    }
    return statusTexts[status] || status
}

// Get request actions with improved pricing logic
function getRequestActions(request, isAdmin) {
    if (isAdmin) {
        const canChangeStatus = !request.isOther || request.priceConfirmed || request.price === 0

        return `
      <button class="btn btn-primary" onclick="editRequest('${request._id}', '${request.status}', '${request.price || ""}', ${request.isOther}, ${request.priceConfirmed || false})" ${!canChangeStatus ? 'disabled title="Narx tasdiqlanishini kuting"' : ""}>
          <i class="fas fa-edit"></i> So'rovni Yangilash
      </button>
      ${
            request.isOther && request.price === 0
                ? `
        <button class="btn btn-warning" onclick="setPriceForOther('${request._id}')">
            <i class="fas fa-dollar-sign"></i> Narx Belgilash
        </button>
      `
                : ""
        }
    `
    } else {
        let actions = ""

        if (request.isOther && request.price > 0 && !request.priceConfirmed) {
            actions += `
        <button class="btn btn-success" onclick="confirmPrice('${request._id}')">
            <i class="fas fa-check"></i> Narxni Tasdiqlash
        </button>
        <button class="btn btn-danger" onclick="rejectPrice('${request._id}')">
            <i class="fas fa-times"></i> Narxni Rad Etish
        </button>
      `
        }

        if (request.status === "COMPLETED") {
            actions += `
        <button class="btn btn-success" onclick="confirmRequest('${request._id}')">
            <i class="fas fa-check"></i> Bajarilganini Tasdiqlash
        </button>
      `
        }

        if (request.status === "WAITING") {
            actions += `
        <button class="btn btn-warning" onclick="cancelRequest('${request._id}')">
            <i class="fas fa-times"></i> Bekor Qilish
        </button>
        <button class="btn btn-danger" onclick="deleteRequest('${request._id}')">
            <i class="fas fa-trash"></i> O'chirish
        </button>
      `
        }

        return actions
    }
}

// Display users with user IDs for admins
function displayUsers(users, container) {
    if (!users || users.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users"></i>
        <h3>Foydalanuvchilar topilmadi</h3>
        <p>Hali ro'yxatdan o'tgan foydalanuvchilar yo'q.</p>
      </div>
    `
        return
    }

    container.innerHTML = users
        .map(
            (user) => `
        <div class="user-card">
            <div class="user-info">
                <div class="user-avatar-container">
                    <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=667eea&color=fff&size=48" 
                         alt="${user.username}" 
                         class="user-avatar"
                         onerror="this.src='https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=48'">
                    ${user.isAdmin ? '<span class="admin-indicator">Admin</span>' : ""}
                </div>
                <div class="user-details">
                    <h3 class="user-name">${user.username}</h3>
                    <p class="user-email">${user.email}</p>
                    <p class="user-id"><strong>ID:</strong> ${user.uid}</p>
                    <div class="user-meta">
                        <span class="meta-item">
                            <i class="fas fa-calendar"></i>
                            Qo'shilgan: ${new Date(user.createdAt).toLocaleDateString("uz-UZ")}
                        </span>
                    </div>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn btn-outline" onclick="messageUser('${user.uid}')">
                    <i class="fas fa-message"></i> Xabar
                </button>
                ${
                !user.isAdmin
                    ? `
                    <button class="btn btn-danger" onclick="deleteUser('${user.uid}', '${user.username}')">
                        <i class="fas fa-trash"></i> O'chirish
                    </button>
                `
                    : ""
            }
            </div>
        </div>
    `,
        )
        .join("")
}

// Tab functions
function showTab(tabName) {
    document.querySelectorAll(".tab-content").forEach((tab) => {
        tab.classList.remove("active")
    })

    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active")
    })

    const selectedTab = document.getElementById(tabName)
    if (selectedTab) {
        selectedTab.classList.add("active")
    }

    const clickedButton = document.querySelector(`.tab-btn[onclick="showTab('${tabName}')"]`)
    if (clickedButton) {
        clickedButton.classList.add("active")
    }

    currentTab = tabName

    if (tabName === "my-requests") {
        loadUserRequests()
    }
}

function showAdminTab(tabName) {
    document.querySelectorAll("#adminDashboard .tab-content").forEach((tab) => {
        tab.classList.remove("active")
    })

    document.querySelectorAll("#adminDashboard .tab-btn").forEach((btn) => {
        btn.classList.remove("active")
    })

    const selectedTab = document.getElementById(tabName)
    if (selectedTab) {
        selectedTab.classList.add("active")
    }

    const clickedButton = document.querySelector(`.tab-btn[onclick="showAdminTab('${tabName}')"]`)
    if (clickedButton) {
        clickedButton.classList.add("active")
    }

    if (tabName === "admin-requests") {
        loadAllRequests()
    } else if (tabName === "admin-users") {
        loadUsers()
    }
}

// Enhanced request actions with pricing logic
async function editRequest(requestId, currentStatus, currentPrice, isOther, priceConfirmed) {
    if (isOther && !priceConfirmed && currentPrice > 0) {
        showNotification("Foydalanuvchi narxni tasdiqlaguncha status o'zgartirib bo'lmaydi", "warning")
        return
    }

    const statusOptions = {
        WAITING: "Kutilmoqda",
        IN_PROGRESS: "Jarayonda",
        COMPLETED: "Bajarildi",
        CANCELLED: "Bekor qilindi",
    }

    const statusText = Object.entries(statusOptions)
        .map(([key, value]) => `${key} - ${value}`)
        .join("\n")
    const newStatus = prompt(`Yangi holatni kiriting:\n${statusText}`, currentStatus)
    if (!newStatus) return

    try {
        const data = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/request/${requestId}`, {
            method: "PUT",
            body: JSON.stringify({
                status: newStatus,
            }),
        })

        showNotification("So'rov muvaffaqiyatli yangilandi!", "success")
        loadAllRequests()
        loadStats()
    } catch (error) {
        console.error("Error updating request:", error)
        showNotification(error.message || "So'rovni yangilashda xatolik", "error")
    }
}

// Set price for "other" type requests
async function setPriceForOther(requestId) {
    const price = prompt("Narxni kiriting (so'm):")
    if (!price || isNaN(price) || Number(price) <= 0) {
        showNotification("Iltimos, to'g'ri narx kiriting", "error")
        return
    }

    try {
        const data = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/request/${requestId}`, {
            method: "PUT",
            body: JSON.stringify({
                price: Number(price),
                status: "PRICE_PENDING",
            }),
        })

        showNotification("Narx muvaffaqiyatli belgilandi!", "success")
        loadAllRequests()
        loadStats()
    } catch (error) {
        console.error("Error setting price:", error)
        showNotification(error.message || "Narx belgilashda xatolik", "error")
    }
}

// User confirms price
async function confirmPrice(requestId) {
    if (!confirm("Ushbu narxni tasdiqlaysizmi?")) return

    try {
        const data = await makeAuthenticatedRequest(`${API_BASE_URL}/user/request/${requestId}`, {
            method: "PUT",
            body: JSON.stringify({ action: "confirm_price" }),
        })

        showNotification("Narx muvaffaqiyatli tasdiqlandi!", "success")
        loadUserRequests()
    } catch (error) {
        console.error("Error confirming price:", error)
        showNotification(error.message || "Narxni tasdiqlashda xatolik", "error")
    }
}

// User rejects price
async function rejectPrice(requestId) {
    if (!confirm("Ushbu narxni rad etasizmi?")) return

    try {
        const data = await makeAuthenticatedRequest(`${API_BASE_URL}/user/request/${requestId}`, {
            method: "PUT",
            body: JSON.stringify({ action: "reject_price" }),
        })

        showNotification("Narx rad etildi", "info")
        loadUserRequests()
    } catch (error) {
        console.error("Error rejecting price:", error)
        showNotification(error.message || "Narxni rad etishda xatolik", "error")
    }
}

async function confirmRequest(requestId) {
    if (!confirm("Ushbu so'rov bajarilganini tasdiqlaysizmi?")) return

    try {
        const data = await makeAuthenticatedRequest(`${API_BASE_URL}/user/request/${requestId}`, {
            method: "PUT",
            body: JSON.stringify({ action: "confirm" }),
        })

        showNotification("So'rov muvaffaqiyatli tasdiqlandi!", "success")
        loadUserRequests()
    } catch (error) {
        console.error("Error confirming request:", error)
        showNotification(error.message || "So'rovni tasdiqlashda xatolik", "error")
    }
}

async function cancelRequest(requestId) {
    if (!confirm("Ushbu so'rovni bekor qilasizmi?")) return

    try {
        const data = await makeAuthenticatedRequest(`${API_BASE_URL}/user/request/${requestId}`, {
            method: "PUT",
            body: JSON.stringify({ action: "cancel" }),
        })

        showNotification("So'rov muvaffaqiyatli bekor qilindi!", "success")
        loadUserRequests()
    } catch (error) {
        console.error("Error cancelling request:", error)
        showNotification(error.message || "So'rovni bekor qilishda xatolik", "error")
    }
}

async function deleteRequest(requestId) {
    if (!confirm("Ushbu so'rovni o'chirasizmi? Bu amalni qaytarib bo'lmaydi.")) return

    try {
        const data = await makeAuthenticatedRequest(`${API_BASE_URL}/user/request/${requestId}`, {
            method: "DELETE",
        })

        showNotification("So'rov muvaffaqiyatli o'chirildi!", "success")
        loadUserRequests()
    } catch (error) {
        console.error("Error deleting request:", error)
        showNotification(error.message || "So'rovni o'chirishda xatolik", "error")
    }
}

// User actions
async function deleteUser(uid, username) {
    if (!confirm(`"${username}" foydalanuvchisini o'chirasizmi? Bu amalni qaytarib bo'lmaydi.`)) return

    try {
        const data = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/users`, {
            method: "DELETE",
            body: JSON.stringify({ uid }),
        })

        showNotification("Foydalanuvchi muvaffaqiyatli o'chirildi!", "success")
        loadUsers()
    } catch (error) {
        console.error("Error deleting user:", error)
        showNotification(error.message || "Foydalanuvchini o'chirishda xatolik", "error")
    }
}

function messageUser(uid) {
    window.location.href = `messages.html?userId=${uid}`
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
    showLandingPage()
}
