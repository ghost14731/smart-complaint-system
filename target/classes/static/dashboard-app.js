// Dashboard application logic

requireAuth();

let currentUser = getCurrentUser();
let complaints = [];
let users = [];
let notifications = [];

// Initialize dashboard
function initDashboard() {
    if (!currentUser) return;

    // Set user info
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = currentUser.role;
    document.getElementById('user-avatar').textContent = currentUser.name.charAt(0).toUpperCase();

    // Show appropriate navigation items
    if (currentUser.role === 'USER') {
        document.getElementById('nav-user').classList.remove('nav-item-hidden');
        showPanel(null, 'user');
    } else if (currentUser.role === 'ADMIN') {
        document.getElementById('nav-admin').classList.remove('nav-item-hidden');
        showPanel(null, 'admin');
    } else if (currentUser.role === 'STAFF') {
        document.getElementById('nav-staff').classList.remove('nav-item-hidden');
        showPanel(null, 'staff');
    }

    // Setup complaint form for users
    if (currentUser.role === 'USER') {
        const form = document.getElementById('complaint-form');
        if (form) form.addEventListener('submit', submitComplaint);
        fetchMyComplaints();
    }

    // Setup admin dashboard
    if (currentUser.role === 'ADMIN') {
        fetchAdminData();
    }

    // Setup staff dashboard
    if (currentUser.role === 'STAFF') {
        fetchStaffComplaints();
    }

    // Setup notifications
    fetchNotifications();
    setInterval(fetchNotifications, 30000); // poll every 30 seconds
    
    const notifBtn = document.getElementById('notif-btn');
    if (notifBtn) {
        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('notif-dropdown').classList.toggle('hidden');
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notifications-wrapper')) {
                document.getElementById('notif-dropdown').classList.add('hidden');
            }
        });
    }
}

function showPanel(event, panelName) {
    if (event) {
        event.preventDefault();
    }

    // Hide all panels
    document.querySelectorAll('.dashboard-panel').forEach(p => p.classList.add('hidden'));

    // Show selected panel
    const panel = document.getElementById(`${panelName}-panel`);
    if (panel) {
        panel.classList.remove('hidden');
    }

    // Update nav highlight
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('nav-item-active'));
    const navLink = document.getElementById(`nav-${panelName}`);
    if (navLink) {
        navLink.classList.add('nav-item-active');
    }
}

async function submitComplaint(e) {
    e.preventDefault();
    
    const title = document.getElementById('complaint-title').value.trim();
    const description = document.getElementById('complaint-description').value.trim();
    const category = document.getElementById('complaint-category').value;

    const submitBtn = document.querySelector('#complaint-form button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : null;
    if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add('btn-loading'); }

    try {
        const response = await fetch('/complaints', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title, 
                description, 
                category, 
                userId: currentUser.id 
            })
        });

        if (!response.ok) {
            showMessage('Unable to submit complaint.', 'danger');
            return;
        }

        // Use the saved complaint returned by the server so UI shows generated id/status immediately
        const saved = await response.json();
        document.getElementById('complaint-form').reset();
        showMessage('Complaint submitted successfully!');

        const tbody = document.querySelector('#user-complaint-table tbody');
        const newRow = `
            <tr>
                <td>#${saved.id}</td>
                <td>${saved.title}</td>
                <td>${saved.category || '-'}</td>
                <td><span class="tag status-${saved.status.toLowerCase().replace(/[_\s]+/g, '-')}">${saved.status}</span></td>
                <td>${saved.assignedStaffId || '-'}</td>
                <td class="actions-cell">
                    <div class="btn-group">
                        <button onclick="openTrackingModal(${saved.id})" class="btn btn-outline btn-xs">Track</button>
                        ${saved.status === 'RESOLVED' ? `
                            <button onclick="verifyComplaint(${saved.id})" class="btn btn-success btn-xs">Confirm</button>
                            <button onclick="reopenComplaint(${saved.id})" class="btn btn-danger btn-xs">Re-open</button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;

        // If table shows no complaints message, replace it. Otherwise prepend the new complaint.
        if (!tbody || tbody.querySelector('td.text-center')) {
            if (tbody) tbody.innerHTML = newRow;
        } else if (tbody) {
            tbody.insertAdjacentHTML('afterbegin', newRow);
            // animate the newly-inserted row
            const firstRow = tbody.querySelector('tr');
            if (firstRow) firstRow.classList.add('new-item');
            setTimeout(() => { if (firstRow) firstRow.classList.remove('new-item'); }, 1800);
        }

        // Refresh in background to reconcile data
        fetchMyComplaints();
    } catch (error) {
        showMessage('Error submitting complaint.', 'danger');
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove('btn-loading'); if (originalBtnText) submitBtn.textContent = originalBtnText; }
    }
}

async function fetchMyComplaints() {
    try {
        const response = await fetch('/complaints');
        complaints = await response.json();
        const myComplaints = complaints.filter(c => c.userId == currentUser.id);
        
        const tbody = document.querySelector('#user-complaint-table tbody');
        if (myComplaints.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No complaints submitted yet.</td></tr>';
        } else {
            tbody.innerHTML = myComplaints.map(complaint => `
                <tr>
                    <td>#${complaint.id}</td>
                    <td>${complaint.title}</td>
                    <td>${complaint.category || '-'}</td>
                    <td><span class="tag status-${complaint.status.toLowerCase().replace(/[_\s]+/g, '-')}">${complaint.status}</span></td>
                    <td>${complaint.assignedStaffId || '-'}</td>
                    <td class="actions-cell">
                        <div class="btn-group">
                            <button onclick="openTrackingModal(${complaint.id})" class="btn btn-outline btn-xs">Track</button>
                            ${complaint.status === 'RESOLVED' ? `
                                <button onclick="verifyComplaint(${complaint.id})" class="btn btn-success btn-xs">Confirm</button>
                                <button onclick="reopenComplaint(${complaint.id})" class="btn btn-danger btn-xs">Re-open</button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showMessage('Error fetching complaints.', 'danger');
    }
}

async function fetchAdminData() {
    try {
        const [complaintRes, userRes] = await Promise.all([
            fetch('/admin/complaints'),
            fetch('/admin/users')
        ]);

        const adminComplaints = await complaintRes.json();
        users = await userRes.json();

        // Populate complaints table
        const complaintBody = document.querySelector('#admin-complaint-table tbody');
        if (adminComplaints.length === 0) {
            complaintBody.innerHTML = '<tr><td colspan="7" class="text-center">No complaints found.</td></tr>';
        } else {
            // Precompute staff users for the assign dropdown
            const staffUsers = users.filter(u => u.role === 'STAFF');

            complaintBody.innerHTML = adminComplaints.map(complaint => {
                const user = users.find(u => u.id == complaint.userId);
                const assigned = users.find(u => u.id == complaint.assignedStaffId);
                const userDisplay = user ? `${user.name} (#${complaint.userId})` : `#${complaint.userId}`;
                const assignedDisplay = assigned ? `${assigned.name} (#${complaint.assignedStaffId})` : (complaint.assignedStaffId || '-');

                const staffOptions = staffUsers.map(st => `
                    <option value="${st.id}" ${st.id == complaint.assignedStaffId ? 'selected' : ''}>${st.name} (#${st.id})</option>
                `).join('');

                return `
                <tr>
                    <td>#${complaint.id}</td>
                    <td>${complaint.title}</td>
                    <td>${userDisplay}</td>
                    <td>${complaint.category || '-'}</td>
                    <td><span class="tag status-${complaint.status.toLowerCase().replace(/[_\s]+/g, '-')}">${complaint.status}</span></td>
                    <td>${assignedDisplay}</td>
                    <td class="actions-cell">
                        <div class="btn-group">
                            <button onclick="updateStatus(${complaint.id}, '${complaint.status}')" class="btn btn-outline btn-xs">Update</button>
                            <select class="assign-select" data-complaint-id="${complaint.id}" style="padding: 6px; font-size: 0.8rem; width: auto;">
                                <option value="">Assign staff...</option>
                                ${staffOptions}
                            </select>
                            <button class="btn btn-primary btn-xs assign-btn" data-complaint-id="${complaint.id}">Assign</button>
                        </div>
                    </td>
                </tr>
            `}).join('');

            // Attach handlers for the newly created assign buttons
            setTimeout(() => {
                document.querySelectorAll('.assign-btn').forEach(btn => {
                    btn.addEventListener('click', async (ev) => {
                        const cid = ev.currentTarget.dataset.complaintId;
                        const select = document.querySelector(`.assign-select[data-complaint-id="${cid}"]`);
                        const staffId = select ? select.value : null;
                        if (!staffId) {
                            showMessage('Please select a staff member to assign.', 'warning');
                            return;
                        }

                        try {
                            const remarks = prompt('Enter assignment remarks (optional):');
                            if (remarks === null) return;
                            
                            const res = await fetch(`/admin/complaints/${cid}/assign?staffId=${encodeURIComponent(staffId)}&remarks=${encodeURIComponent(remarks || '')}`, {
                                method: 'PUT'
                            });
                            if (res.ok) {
                                showMessage('Staff assigned successfully!');
                                fetchAdminData();
                            } else {
                                showMessage('Failed to assign staff. Make sure the ID is valid and is a staff member.', 'danger');
                            }
                        } catch (error) {
                            showMessage('Error assigning staff.', 'danger');
                        }
                    });
                });
            }, 0);
        }

        // Populate users table
        const userBody = document.querySelector('#admin-user-table tbody');
        if (users.length === 0) {
            userBody.innerHTML = '<tr><td colspan="4" class="text-center">No users found.</td></tr>';
        } else {
            userBody.innerHTML = users.map(user => `
                <tr>
                    <td>#${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="tag role-${user.role.toLowerCase()}">${user.role}</span></td>
                </tr>
            `).join('');
        }

        // Populate staff table
        const staffUsers = users.filter(u => u.role === 'STAFF');
        const staffBody = document.querySelector('#admin-staff-table tbody');
        if (staffUsers.length === 0) {
            staffBody.innerHTML = '<tr><td colspan="4" class="text-center">No staff members found.</td></tr>';
        } else {
            staffBody.innerHTML = staffUsers.map(staff => {
                const assignedCount = adminComplaints.filter(c => c.assignedStaffId == staff.id).length;
                return `
                    <tr>
                        <td>#${staff.id}</td>
                        <td>${staff.name}</td>
                        <td>${staff.email}</td>
                        <td><span class="badge">${assignedCount}</span></td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        showMessage('Error fetching admin data.', 'danger');
    }
}

async function fetchStaffComplaints() {
    try {
        const response = await fetch(`/staff/complaints?staffId=${currentUser.id}`);
        const assigned = await response.json();
        
        const tbody = document.querySelector('#staff-complaint-table tbody');
        if (assigned.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No complaints assigned yet.</td></tr>';
        } else {
            tbody.innerHTML = assigned.map(complaint => `
                <tr>
                    <td>#${complaint.id}</td>
                    <td>${complaint.title}</td>
                    <td>${complaint.userId}</td>
                    <td>${complaint.category || '-'}</td>
                    <td><span class="tag status-${complaint.status.toLowerCase().replace(/[_\s]+/g, '-')}">${complaint.status}</span></td>
                    <td class="actions-cell">
                        <button onclick="markResolved(${complaint.id})" class="btn btn-primary btn-xs">
                            ${complaint.status === 'RESOLVED' ? 'Resolved' : 'Mark Resolved'}
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showMessage('Error fetching assigned complaints.', 'danger');
    }
}

function switchAdminTab(event, tabName) {
    if (event) {
        event.preventDefault();
    }

    // Hide all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('tab-active'));

    // Show selected tab
    const tab = document.getElementById(`admin-${tabName}-tab`);
    if (tab) {
        tab.classList.remove('hidden');
    }

    // Highlight button
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('tab-active');
    }
}

function updateStatus(complaintId, currentStatus) {
    const newStatus = prompt(`Enter new status (PENDING, ASSIGNED, IN_PROGRESS, RESOLVED):\nCurrent: ${currentStatus}`);
    if (!newStatus) return;
    const normalizedStatus = newStatus.trim().toUpperCase();
    
    const remarks = prompt('Enter remarks for this status update (optional):');
    if (remarks === null) return;

    fetch(`/admin/complaints/${complaintId}/status?status=${encodeURIComponent(normalizedStatus)}&remarks=${encodeURIComponent(remarks || '')}`, {
        method: 'PUT'
    })
    .then(res => {
        if (res.ok) {
            showMessage('Status updated successfully!');
            fetchAdminData();
        } else {
            showMessage('Failed to update status.', 'danger');
        }
    })
    .catch(() => showMessage('Error updating status.', 'danger'));
}

function assignStaff(complaintId) {
    const staffId = prompt('Enter staff user ID to assign:');
    if (!staffId) return;

    fetch(`/admin/complaints/${complaintId}/assign?staffId=${staffId}`, {
        method: 'PUT'
    })
    .then(res => {
        if (res.ok) {
            showMessage('Staff assigned successfully!');
            fetchAdminData();
        } else {
            showMessage('Failed to assign staff. Make sure the ID is valid and is a staff member.', 'danger');
        }
    })
    .catch(() => showMessage('Error assigning staff.', 'danger'));
}

function markResolved(complaintId) {
    if (confirm('Mark this complaint as resolved?')) {
        const remarks = prompt('Enter resolution remarks (optional):');
        if (remarks === null) return;

        fetch(`/staff/complaints/${complaintId}/status?status=RESOLVED&remarks=${encodeURIComponent(remarks || '')}`, {
            method: 'PUT'
        })
        .then(res => {
            if (res.ok) {
                showMessage('Complaint marked as resolved!');
                fetchStaffComplaints();
            } else {
                showMessage('Failed to mark as resolved.', 'danger');
            }
        })
        .catch(() => showMessage('Error marking as resolved.', 'danger'));
    }
}

function logout(event) {
    if (event) {
        event.preventDefault();
    }
    clearCurrentUser();
    window.location.href = 'login.html';
}

window.openTrackingModal = async function(complaintId) {
    const modal = document.getElementById('tracking-modal');
    const timeline = document.getElementById('complaint-timeline');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    
    // Find the complaint
    const complaint = complaints.find(c => c.id === complaintId);
    if (!complaint) return;
    
    modalTitle.textContent = complaint.title;
    modalDesc.textContent = complaint.description;
    timeline.innerHTML = '<div class="text-center">Loading history...</div>';
    
    modal.classList.remove('hidden');
    
    try {
        const res = await fetch(`/complaints/${complaintId}/history`);
        const history = await res.json();
        
        if (history.length === 0) {
            timeline.innerHTML = '<div class="text-center muted">No history available yet.</div>';
        } else {
            timeline.innerHTML = history.map(item => `
                <div class="timeline-item">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-action">${item.action}</div>
                        ${item.remarks ? `<div class="timeline-remarks">"${item.remarks}"</div>` : ''}
                        <div class="timeline-date">${new Date(item.createdAt).toLocaleString()}</div>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {
        timeline.innerHTML = '<div class="text-center danger">Failed to load history.</div>';
    }
};

window.closeTrackingModal = function() {
    document.getElementById('tracking-modal').classList.add('hidden');
};

window.verifyComplaint = async function(id) {
    if (!confirm('Are you sure you want to confirm this resolution? This will close the complaint.')) return;
    const remarks = prompt('Any final feedback? (optional)');
    try {
        const res = await fetch(`/complaints/${id}/verify?remarks=${encodeURIComponent(remarks || '')}`, { method: 'PUT' });
        if (res.ok) {
            showMessage('Complaint closed successfully!');
            fetchMyComplaints();
        }
    } catch (e) { showMessage('Error verifying complaint.', 'danger'); }
};

window.reopenComplaint = async function(id) {
    const remarks = prompt('Please tell us why you are re-opening this complaint:');
    if (!remarks) return;
    try {
        const res = await fetch(`/complaints/${id}/reopen?remarks=${encodeURIComponent(remarks)}`, { method: 'PUT' });
        if (res.ok) {
            showMessage('Complaint re-opened.');
            fetchMyComplaints();
        }
    } catch (e) { showMessage('Error re-opening complaint.', 'danger'); }
};

async function fetchNotifications() {
    if (!currentUser) return;
    try {
        const res = await fetch(`/notifications?userId=${currentUser.id}`);
        notifications = await res.json();
        updateNotifUI();
    } catch (e) { console.error('Failed to fetch notifications'); }
}

function updateNotifUI() {
    const unread = notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notif-badge');
    if (badge) {
        if (unread > 0) {
            badge.textContent = unread;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
    
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) {
        if (notifications.length === 0) {
            dropdown.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--muted);">No notifications</div>';
        } else {
            dropdown.innerHTML = notifications.map(n => `
                <div class="notif-item ${n.read ? '' : 'unread'}" style="padding: 12px 16px; border-bottom: 1px solid var(--border); background: ${n.read ? 'transparent' : 'rgba(79, 70, 229, 0.05)'}; cursor: pointer; transition: background 0.2s;" onclick="markNotifRead(${n.id})">
                    <p style="margin: 0 0 4px 0; font-size: 0.9rem; color: var(--text);">${n.message}</p>
                    <small style="color: var(--muted); font-size: 0.8rem;">${new Date(n.createdAt).toLocaleString()}</small>
                </div>
            `).join('');
        }
    }
}

window.markNotifRead = async function(id) {
    const notif = notifications.find(n => n.id === id);
    if (!notif || notif.read) return;
    
    try {
        await fetch(`/notifications/${id}/read`, { method: 'PUT' });
        notif.read = true;
        updateNotifUI();
    } catch (e) { console.error('Failed to mark read'); }
};

// Ensure the logout function is available on the global window object
window.logout = logout;

// Attach logout handlers for dashboard nav links
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-logout').forEach(link => {
        link.addEventListener('click', logout);
    });
    initDashboard();
});
