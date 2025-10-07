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

// LOGIN form validation + conexión al backend
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Siempre prevenir el submit

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const msg = document.getElementById('login-message');
    msg.classList.add('hidden');

    if (!email || !isValidEmail(email)) {
        msg.textContent = "Por favor ingresa un email valido.";
        msg.classList.remove('hidden');
        return;
    }

    if (!password) {
        msg.textContent = "Por favor ingresa tu contraseña.";
        msg.classList.remove('hidden');
        return;
    }

    // Conectar al backend Flask
    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, contraseña: password })
        });

        const data = await response.json();

        if (response.ok) {
            // ✅ Guardar ID del usuario en localStorage
            localStorage.setItem("usuario_id", data.id_usuario);

            alert("Bienvenido, " + data.nombre_completo);
            window.location.href = '../index.html';
        } else {
            msg.textContent = data.mensaje || "Credenciales incorrectas.";
            msg.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error al conectar:", error);
        msg.textContent = "Error de conexión con el servidor.";
        msg.classList.remove('hidden');
    }
});

// SIGN-UP form validation + conexión al backend
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const confirm = document.getElementById('signup-confirm').value.trim();
    const msg = document.getElementById('signup-message');
    msg.classList.add('hidden');

    if (!name) {
        msg.textContent = "Por favor ingresa tu nombre completo.";
        msg.classList.remove('hidden');
        return;
    }

    if (!email || !isValidEmail(email)) {
        msg.textContent = "Por favor ingresa un email valido.";
        msg.classList.remove('hidden');
        return;
    }

    if (password.length < 6) {
        msg.textContent = "La contraseña debe contener al menos 6 caracteres.";
        msg.classList.remove('hidden');
        return;
    }

    if (password !== confirm) {
        msg.textContent = "Las contraseñas NO coinciden.";
        msg.classList.remove('hidden');
        return;
    }

    // Conectar al backend Flask
    try {
        const response = await fetch('http://localhost:5000/usuarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre_completo: name,
                email,
                contraseña: password,
                confirmar_contraseña: confirm
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Usuario registrado con éxito");
            signupForm.reset();
            loginTab.click(); // Cambiar a pestaña login automáticamente
        } else {
            msg.textContent = data.error || "Error al registrar usuario.";
            msg.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error al conectar:", error);
        msg.textContent = "Error de conexión con el servidor.";
        msg.classList.remove('hidden');
    }
});

// Cargar íconos de Lucide
lucide.createIcons();
