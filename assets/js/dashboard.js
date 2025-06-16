const firebaseConfig = {
    apiKey: "AIzaSyC7uVtT5hVCIaAW_bJCneGXVXbLxFXc040",
    authDomain: "travelsite-bac6f.firebaseapp.com",
    projectId: "travelsite-bac6f",
    storageBucket: "travelsite-bac6f.firebasestorage.app",
    messagingSenderId: "117830187443",
    appId: "1:117830187443:web:40cfae0ca76866aaf873c6",
    measurementId: "G-YZRT52WSB2"
  };
  

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let inquiryToDelete = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize delete functionality
    initializeDeleteFunctionality();
    
    // Check authentication and load data
    auth.onAuthStateChanged((user) => {
        const isGuest = sessionStorage.getItem('isGuest') === 'true';
        if (user) {
            db.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists && doc.data().isAdmin) {
                        document.getElementById('adminEmail').textContent = user.email;
                        loadInquiries();
                        setupEventListeners();
                    } else {
                        window.location.href = 'index.html';
                    }
                });
        } else if (isGuest) {
            // Allow guest access
            document.getElementById('adminEmail').textContent = 'Guest User';
            loadInquiries();
            setupEventListeners();
        } else {
            window.location.href = 'admin-login.html';
        }
    });
});

function initializeDeleteFunctionality() {
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDelete = document.getElementById('cancelDelete');
    const modal = document.getElementById('deleteModal');

    if (confirmDelete) {
        confirmDelete.addEventListener('click', () => {
            if (inquiryToDelete) {
                db.collection('inquiries').doc(inquiryToDelete).delete()
                    .then(() => {
                        closeModal();
                    })
                    .catch((error) => {
                        console.error('Error deleting inquiry:', error);
                        alert('Error deleting inquiry. Please try again.');
                    });
            }
        });
    }

    if (cancelDelete) {
        cancelDelete.addEventListener('click', closeModal);
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function deleteInquiry(id) {
    inquiryToDelete = id;
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.remove('active');
        inquiryToDelete = null;
    }
}

function setupEventListeners() {
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut()
                .then(() => {
                    window.location.href = 'login.html';
                })
                .catch((error) => {
                    console.error('Error signing out:', error);
                });
        });
    }

    // Search and filter functionality
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterInquiries);
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', filterInquiries);
    }
}

function loadInquiries() {
    db.collection('inquiries').orderBy('created_at', 'desc').onSnapshot((snapshot) => {
        const inquiries = [];
        snapshot.forEach((doc) => {
            inquiries.push({ id: doc.id, ...doc.data() });
        });
        updateDashboardStats(inquiries);
        displayInquiries(inquiries);
    });
}

function updateDashboardStats(inquiries) {
    const totalInquiries = document.getElementById('totalInquiries');
    const pendingCount = document.getElementById('pendingCount');
    const approvedCount = document.getElementById('approvedCount');
    const rejectedCount = document.getElementById('rejectedCount');

    if (totalInquiries) totalInquiries.textContent = inquiries.length;
    if (pendingCount) pendingCount.textContent = inquiries.filter(inq => inq.status === 'pending').length;
    if (approvedCount) approvedCount.textContent = inquiries.filter(inq => inq.status === 'approved').length;
    if (rejectedCount) rejectedCount.textContent = inquiries.filter(inq => inq.status === 'rejected').length;
}

function displayInquiries(inquiries) {
    const tableBody = document.getElementById('inquiriesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    inquiries.forEach(inquiry => {
        const row = document.createElement('tr');
        const date = inquiry.created_at ? new Date(inquiry.created_at.toDate()).toLocaleDateString() : 'N/A';
        
        row.innerHTML = `
            <td>${date}</td>
            <td>${inquiry.destination}</td>
            <td>${inquiry.email}</td>
            <td>${inquiry.checkin_date}</td>
            <td>${inquiry.checkout_date}</td>
            <td>${inquiry.people}</td>
            <td><span class="status-badge status-${inquiry.status}">${inquiry.status}</span></td>
            <td class="action-buttons">
                ${inquiry.status === 'pending' ? `
                    <button onclick="updateStatus('${inquiry.id}', 'approved')" class="btn-action btn-approve">
                        Approve
                    </button>
                    <button onclick="updateStatus('${inquiry.id}', 'rejected')" class="btn-action btn-reject">
                        Reject
                    </button>
                ` : ''}
            </td>
            <td>
                <button onclick="deleteInquiry('${inquiry.id}')" class="btn-delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateStatus(inquiryId, newStatus) {
    db.collection('inquiries').doc(inquiryId).update({
        status: newStatus
    }).catch(error => {
        console.error('Error updating status:', error);
        alert('Error updating status. Please try again.');
    });
}

function filterInquiries() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    
    if (!searchInput || !statusFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;

    db.collection('inquiries').get().then((snapshot) => {
        let inquiries = [];
        snapshot.forEach((doc) => {
            inquiries.push({ id: doc.id, ...doc.data() });
        });

        // Apply filters
        inquiries = inquiries.filter(inquiry => {
            const matchesSearch = 
                inquiry.destination.toLowerCase().includes(searchTerm) ||
                inquiry.email.toLowerCase().includes(searchTerm);
            const matchesStatus = 
                statusValue === 'all' || inquiry.status === statusValue;
            
            return matchesSearch && matchesStatus;
        });

        updateDashboardStats(inquiries);
        displayInquiries(inquiries);
    });
} 