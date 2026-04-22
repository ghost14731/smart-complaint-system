// Authentication related functions

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        clearCurrentUser();
        window.location.href = 'login.html';
    }
}
