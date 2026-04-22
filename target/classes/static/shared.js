// Shared utilities for all pages

function showMessage(text, type = 'success', elementId = 'status-message') {
    const messageEl = document.getElementById(elementId);
    if (!messageEl) return;

    messageEl.classList.remove('hidden', 'status-success', 'status-danger', 'status-warning');
    messageEl.textContent = text;
    messageEl.classList.add(`status-${type}`);

    if (type !== 'danger') {
        setTimeout(() => messageEl.classList.add('hidden'), 4000);
    }
}

function getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem('currentUser');
}

function isAuthenticated() {
    return getCurrentUser() !== null;
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}
