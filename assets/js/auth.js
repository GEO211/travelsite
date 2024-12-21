const auth = firebase.auth();

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                let errorMessage = '';

                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'Account not registered. Please Create an Account.';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Incorrect password. Please try again.';
                } else {
                    errorMessage = 'Account not registered or Invalid Password.';
                }

                document.getElementById('errorMessage').textContent = errorMessage;
                document.getElementById('errorMessage').classList.remove('hidden');
            });
    });
}


const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        auth.createUserWithEmailAndPassword(email, password)
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                document.getElementById('errorMessage').textContent = error.message;
                document.getElementById('errorMessage').classList.remove('hidden');
            });
    });
}


const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        auth.sendPasswordResetEmail(email)
            .then(() => {
                const message = document.getElementById('message');
                message.textContent = 'Password reset email sent. Check your inbox.';
                message.classList.remove('hidden');
                message.classList.add('text-green-500');
            })
            .catch((error) => {
                const message = document.getElementById('message');
                message.textContent = error.message;
                message.classList.remove('hidden');
                message.classList.add('text-red-500');
            });
    });
}
