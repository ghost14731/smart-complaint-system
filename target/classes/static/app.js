const authPane = document.getElementById('auth-pane');
const dashboard = document.getElementById('dashboard');
const userPane = document.getElementById('user-pane');
const adminPane = document.getElementById('admin-pane');
const staffPane = document.getElementById('staff-pane');
const statusPanel = document.getElementById('status-panel');
const statusMessage = document.getElementById('status-message');
const currentUserEl = document.getElementById('current-user');
const panelTitle = document.getElementById('panel-title');

let currentUser = null;
let users = [];
let complaints = [];

function showMessage(text, type='success') {
    statusPanel.classList.remove('hidden');
    statusMessage.textContent = text;
    statusMessage.style.color = type === 'danger' ? '#dc2626' : '#054f00';
    setTimeout(() => statusPanel.classList.add('hidden'), 4000);
}

function showView(role) {
    authPane.classList.add('hidden');
    dashboard.classList.remove('hidden');
    userPane.classList.add('hidden');
    adminPane.classList.add('hidden');
    staffPane.classList.add('hidden');

    currentUserEl.textContent = `${currentUser.name} • ${currentUser.role}`;

    if (role === 'ADMIN') {
        panelTitle.textContent = 'Admin Dashboard';
        adminPane.classList.remove('hidden');
        fetchAdminData();
    } else if (role === 'STAFF') {
        panelTitle.textContent = 'Staff Dashboard';
        staffPane.classList.remove('hidden');
        fetchStaffComplaints();
    } else {
        panelTitle.textContent = 'User Dashboard';
        userPane.classList.remove('hidden');
        fetchMyComplaints();
    }
}

function logout() {
    currentUser = null;
    authPane.classList.remove('hidden');
    dashboard.classList.add('hidden');
    panelTitle.textContent = 'Dashboard';
}

document.getElementById('logout-button').addEventListener('click', logout);

document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
        showMessage('Login failed: invalid credentials.', 'danger');
        return;
    }

    currentUser = await response.json();
    showMessage(`Welcome back, ${currentUser.name}!`);
    showView(currentUser.role);
});

document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const role = document.getElementById('register-role').value;

    const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
    });

    if (!response.ok) {
        const errorText = await response.text();
        showMessage(`Registration failed: ${errorText}`, 'danger');
        return;
    }

    const user = await response.json();
    showMessage(`Registered successfully as ${user.name}. Please log in.`);
    document.getElementById('register-form').reset();
});

document.getElementById('complaint-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentUser) return;

    const title = document.getElementById('complaint-title').value.trim();
    const description = document.getElementById('complaint-description').value.trim();
    const category = document.getElementById('complaint-category').value;

    const response = await fetch('/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, userId: currentUser.id })
    });

    if (!response.ok) {
        showMessage('Unable to submit complaint.', 'danger');
        return;
    }

    document.getElementById('complaint-form').reset();
    showMessage('Complaint submitted successfully.');
    fetchMyComplaints();
});

async function fetchMyComplaints() {
    const response = await fetch('/complaints');
    complaints = await response.json();
    const myComplaints = complaints.filter(c => c.userId === currentUser.id);
    const tbody = document.querySelector('#user-complaint-table tbody');
    tbody.innerHTML = myComplaints.map(complaint => `
        <tr>
            <td>${complaint.id}</td>
            <td>${complaint.title}</td>
            <td><span class="tag status-${complaint.status.toLowerCase().replace(/ /g, '_')}">${complaint.status}</span></td>
            <td>${complaint.assignedStaffId || '-'}</td>
        </tr>
    `).join('');
}

async function fetchAdminData() {
    const [complaintRes, userRes] = await Promise.all([
        fetch('/admin/complaints'),
        fetch('/admin/users')
    ]);
    const adminComplaints = await complaintRes.json();
    users = await userRes.json();

    const complaintBody = document.querySelector('#admin-complaint-table tbody');
    complaintBody.innerHTML = adminComplaints.map(complaint => `
        <tr>
            <td>${complaint.id}</td>
            <td>${complaint.title}</td>
            <td>${complaint.userId}</td>
            <td><span class="tag status-${complaint.status.toLowerCase().replace(/ /g, '_')}">${complaint.status}</span></td>
            <td>${complaint.assignedStaffId || '-'}</td>
            <td class="actions-row">
                <button onclick="openStatusDialog(${complaint.id}, '${complaint.status}')">Update</button>
                <button onclick="assignToStaff(${complaint.id})">Assign</button>
            </td>
        </tr>
    `).join('');

    const userBody = document.querySelector('#admin-user-table tbody');
    userBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
        </tr>
    `).join('');
}

async function fetchStaffComplaints() {
    const response = await fetch(`/staff/complaints?staffId=${currentUser.id}`);
    const assigned = await response.json();
    const tbody = document.querySelector('#staff-complaint-table tbody');
    tbody.innerHTML = assigned.map(complaint => `
        <tr>
            <td>${complaint.id}</td>
            <td>${complaint.title}</td>
            <td><span class="tag status-${complaint.status.toLowerCase().replace(/ /g, '_')}">${complaint.status}</span></td>
            <td>${complaint.userId}</td>
            <td><button onclick="updateComplaintStatus(${complaint.id}, 'RESOLVED')">Mark Resolved</button></td>
        </tr>
    `).join('');
}

window.openStatusDialog = async function(id) {
    const newStatus = prompt('Enter new status (PENDING, ASSIGNED, IN_PROGRESS, RESOLVED):');
    if (!newStatus) return;
    await updateComplaintStatus(id, newStatus);
    fetchAdminData();
};

window.assignToStaff = async function(id) {
    const staffId = prompt('Enter staff user ID to assign:');
    if (!staffId) return;
    const response = await fetch(`/admin/complaints/${id}/assign?staffId=${staffId}`, { method: 'PUT' });
    if (!response.ok) {
        showMessage('Assignment failed. Make sure staff ID is valid and the user is staff.', 'danger');
        return;
    }
    showMessage('Complaint assigned successfully.');
    fetchAdminData();
};

async function updateComplaintStatus(id, status) {
    const url = currentUser.role === 'ADMIN'
        ? `/admin/complaints/${id}/status?status=${encodeURIComponent(status)}`
        : `/staff/complaints/${id}/status?status=${encodeURIComponent(status)}`;
    const response = await fetch(url, { method: 'PUT' });
    if (!response.ok) {
        showMessage('Status update failed.', 'danger');
        return;
    }
    showMessage('Status updated successfully.');
    if (currentUser.role === 'ADMIN') {
        fetchAdminData();
    } else {
        fetchStaffComplaints();
    }
}

window.addEventListener('load', () => {
    authPane.classList.remove('hidden');
});