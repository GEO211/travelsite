// Initialize Firebase
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

// Admin Login
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                return db.collection('users').doc(userCredential.user.uid).get();
            })
            .then((doc) => {
                if (doc.exists && doc.data().isAdmin) {
                    window.location.href = 'dashboard.html';
                } else {
                    throw new Error('Unauthorized access. Admin privileges required.');
                }
            })
            .catch((error) => {
                document.getElementById('errorMessage').textContent = error.message;
            });
    });
}

// Admin Signup
const adminSignupForm = document.getElementById('adminSignupForm');
if (adminSignupForm) {
    adminSignupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const adminCode = document.getElementById('adminCode').value;

        // Verify admin registration code
        if (adminCode !== 'ADMIN123') { // Change this to your desired admin code
            document.getElementById('adminCodeError').textContent = 'Invalid admin registration code';
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                return db.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    isAdmin: true,
                    created_at: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                alert('Admin registration successful!');
                window.location.href = 'admin-login.html';
            })
            .catch((error) => {
                document.getElementById('errorMessage').textContent = error.message;
            });
    });
}

// Forgot Password
const adminForgotPasswordForm = document.getElementById('adminForgotPasswordForm');
if (adminForgotPasswordForm) {
    adminForgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        
        auth.sendPasswordResetEmail(email)
            .then(() => {
                const message = document.getElementById('message');
                message.textContent = 'Password reset email sent. Please check your inbox.';
                message.classList.add('success');
            })
            .catch((error) => {
                const message = document.getElementById('message');
                message.textContent = error.message;
                message.classList.remove('success');
            });
    });
}

// Password strength checker
const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const strengthText = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        const strengthColor = ['#dc3545', '#ffc107', '#17a2b8', '#28a745', '#20c997'];
        
        const passwordError = document.getElementById('passwordError');
        if (passwordError) {
            passwordError.textContent = `Password strength: ${strengthText[strength - 1]}`;
            passwordError.style.color = strengthColor[strength - 1];
        }
    });
} 