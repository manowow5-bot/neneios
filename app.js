// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCOs7pOfT8zPk0URs6wfKGuqH_7jCrMFcc",
    authDomain: "nene-ios.firebaseapp.com",
    projectId: "nene-ios",
    storageBucket: "nene-ios.firebasestorage.app",
    messagingSenderId: "718214960003",
    appId: "1:718214960003:web:6a3cdb51c57948c7075cb6",
    measurementId: "G-539NWBQJRZ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

function switchForm(formType) {
    const registerFormEl = document.getElementById('registerForm');
    const loginFormEl = document.getElementById('loginForm');

    if (formType === 'register') {
        registerFormEl.classList.add('active');
        loginFormEl.classList.remove('active');
        document.getElementById('authMessage').textContent = 'Regístrate con tu nombre, gmail y teléfono.';
    } else {
        registerFormEl.classList.remove('active');
        loginFormEl.classList.add('active');
        document.getElementById('authMessage').textContent = 'Ingresa con tu correo electrónico y contraseña.';
    }

    document.getElementById('authMessage').style.color = '#ffffff';
}

async function saveUserData(uid, data) {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
}

async function getUserData(uid) {
    const docSnap = await getDoc(doc(db, 'users', uid));
    return docSnap.exists() ? docSnap.data() : null;
}

function showMainContent(username) {
    document.querySelector('header p').textContent = `Bienvenido, ${username}`;
    document.getElementById('login').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setErrorMessage(message) {
    const authMessage = document.getElementById('authMessage');
    authMessage.textContent = message;
    authMessage.style.color = '#ff7777';
}

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');

    showRegister.addEventListener('click', () => switchForm('register'));
    showLogin.addEventListener('click', () => switchForm('login'));

    registerForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value.trim();
        const countryCode = document.getElementById('countryCode').value;
        const phone = document.getElementById('phone').value.trim();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await saveUserData(user.uid, {
                uid: user.uid,
                name,
                email,
                countryCode,
                phone,
                createdAt: new Date().toISOString()
            });

            showMainContent(name);
        } catch (error) {
            console.error(error);
            setErrorMessage('No se pudo crear la cuenta.');
        }
    });

    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const loginUser = document.getElementById('loginUser').value.trim();
        const loginPassword = document.getElementById('loginPassword').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginUser, loginPassword);
            const user = userCredential.user;

            let userData = await getUserData(user.uid);

            if (!userData) {
                userData = {
                    uid: user.uid,
                    name: user.email.split('@')[0],
                    email: user.email,
                    countryCode: '',
                    phone: '',
                    createdAt: new Date().toISOString()
                };

                await saveUserData(user.uid, userData);
            }

            showMainContent(userData.name || user.email);
        } catch (error) {
            console.error(error);
            setErrorMessage('Correo o contraseña incorrectos.');
        }
    });

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    });

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            let userData = await getUserData(user.uid);

            if (!userData) {
                userData = {
                    uid: user.uid,
                    name: user.email.split('@')[0],
                    email: user.email,
                    countryCode: '',
                    phone: '',
                    createdAt: new Date().toISOString()
                };

                await saveUserData(user.uid, userData);
            }

            showMainContent(userData.name || user.email);
        } else {
            switchForm('login');
            document.getElementById('logoutBtn').style.display = 'none';
            document.getElementById('login').style.display = 'block';
            document.getElementById('mainContent').style.display = 'none';
        }
    });
});
