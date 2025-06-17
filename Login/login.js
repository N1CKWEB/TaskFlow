// Tabs
const loginTab = document.getElementById('tab-login');
const signupTab = document.getElementById('tab-signup');
const loginForm = document.getElementById('form-login');
const signupForm = document.getElementById('form-signup');

// Switch Tabs
loginTab.addEventListener('click', () => {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginTab.classList.add('bg-gray-100', 'text-gray-800');
    signupTab.classList.remove('bg-gray-100', 'text-gray-800');
});

signupTab.addEventListener('click', () => {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    signupTab.classList.add('bg-gray-100', 'text-gray-800');
    loginTab.classList.remove('bg-gray-100', 'text-gray-800');
});

// Utilidad: Validar formato de email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// LOGIN form validation
loginForm.addEventListener('submit', (e) => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const msg = document.getElementById('login-message');
    msg.classList.add('hidden');

    if (!email || !isValidEmail(email)) {
        e.preventDefault();
        msg.textContent = "Por favor ingresa un email valido.";
        msg.classList.remove('hidden');
        return;
    }

    if (!password) {
        e.preventDefault();
        msg.textContent = "Por favor ingresa tu contraseña.";
        msg.classList.remove('hidden');
        return;
    }
});

// SIGN-UP form validation
signupForm.addEventListener('submit', (e) => {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const confirm = document.getElementById('signup-confirm').value.trim();
    const msg = document.getElementById('signup-message');
    msg.classList.add('hidden');

    if (!name) {
        e.preventDefault();
        msg.textContent = "Por favor ingresa tu nombre completo.";
        msg.classList.remove('hidden');
        return;
    }

    if (!email || !isValidEmail(email)) {
        e.preventDefault();
        msg.textContent = "Por favor ingresa un email valido.";
        msg.classList.remove('hidden');
        return;
    }

    if (password.length < 6) {
        e.preventDefault();
        msg.textContent = "La contraseña debe contener al menos 6 caracteres.";
        msg.classList.remove('hidden');
        return;
    }

    if (password !== confirm) {
        e.preventDefault();
        msg.textContent = "Las contraseñas NO coinciden.";
        msg.classList.remove('hidden');
        return;
    }
});

// Cargar íconos de Lucide
lucide.createIcons();
