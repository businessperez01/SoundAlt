// Check authentication status
function checkAuth() {
    const token = localStorage.getItem('token');
    const elements = {
        loginLink: document.getElementById('loginLink'),
        registerLink: document.getElementById('registerLink'),
        profileLink: document.getElementById('profileLink'),
        logoutBtn: document.getElementById('logoutBtn'),
        uploadLink: document.getElementById('uploadLink')
    };

    // Only modify elements that exist on the current page
    if (token) {
        elements.loginLink?.style.setProperty('display', 'none');
        elements.registerLink?.style.setProperty('display', 'none');
        elements.profileLink?.style.setProperty('display', 'inline-block');
        elements.logoutBtn?.style.setProperty('display', 'inline-block');
        elements.uploadLink?.style.setProperty('display', 'inline-block');
    } else {
        elements.loginLink?.style.setProperty('display', 'inline-block');
        elements.registerLink?.style.setProperty('display', 'inline-block');
        elements.profileLink?.style.setProperty('display', 'none');
        elements.logoutBtn?.style.setProperty('display', 'none');
        elements.uploadLink?.style.setProperty('display', 'none');
    }

    return elements;
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            checkAuth();
            return { success: true };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
}

// Register function
async function register(username, email, password) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            return { success: true };
        } else {
            return { success: false, error: data.message };
        }
    } catch (error) {
        return { success: false, error: 'Network error' };
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    checkAuth();
    window.location.href = '/';
}

// Initialize auth elements and event listeners
const elements = checkAuth();

// Add event listeners only if elements exist
if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', logout);
}
