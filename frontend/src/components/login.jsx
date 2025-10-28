import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {


    const [activeTab, setActiveTab] = useState('login');
    const [loginMessage, setLoginMessage] = useState('');
    const [signupMessage, setSignupMessage] = useState('');
    const navigate = useNavigate();

    // Utilidad: Validar formato de email
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // LOGIN form validation + conexión al backend
    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        const email = e.target['login-email'].value.trim();
        const password = e.target['login-password'].value.trim();
        setLoginMessage('');

        if (!email || !isValidEmail(email)) {
            setLoginMessage("Por favor ingresa un email valido.");
            return;
        }

        if (!password) {
            setLoginMessage("Por favor ingresa tu contraseña.");
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
                navigate('/');
            } else {
                setLoginMessage(data.mensaje || "Credenciales incorrectas.");
            }
        } catch (error) {
            console.error("Error al conectar:", error);
            setLoginMessage("Error de conexión con el servidor.");
        }
    };

    // SIGN-UP form validation + conexión al backend
    const handleSignupSubmit = async (e) => {
        e.preventDefault();

        const name = e.target['signup-name'].value.trim();
        const email = e.target['signup-email'].value.trim();
        const password = e.target['signup-password'].value.trim();
        const confirm = e.target['signup-confirm'].value.trim();
        setSignupMessage('');

        if (!name) {
            setSignupMessage("Por favor ingresa tu nombre completo.");
            return;
        }

        if (!email || !isValidEmail(email)) {
            setSignupMessage("Por favor ingresa un email valido.");
            return;
        }

        if (password.length < 6) {
            setSignupMessage("La contraseña debe contener al menos 6 caracteres.");
            return;
        }

        if (password !== confirm) {
            setSignupMessage("Las contraseñas NO coinciden.");
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
                e.target.reset();
                setActiveTab('login');
            } else {
                setSignupMessage(data.error || "Error al registrar usuario.");
            }
        } catch (error) {
            console.error("Error al conectar:", error);
            setSignupMessage("Error de conexión con el servidor.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex mb-6">
                    <button
                        id="tab-login"
                        className={`flex-1 py-2 text-center ${
                            activeTab === 'login' ? 'bg-gray-100 text-gray-800' : ''
                        }`}
                        onClick={() => setActiveTab('login')}
                    >
                        Login
                    </button>
                    <button
                        id="tab-signup"
                        className={`flex-1 py-2 text-center ${
                            activeTab === 'signup' ? 'bg-gray-100 text-gray-800' : ''
                        }`}
                        onClick={() => setActiveTab('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Login Form */}
                <form
                    id="form-login"
                    className={activeTab === 'login' ? '' : 'hidden'}
                    onSubmit={handleLoginSubmit}
                >
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="login-email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="login-email"
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="login-password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="login-password"
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    {loginMessage && (
                        <div id="login-message" className="text-red-500 mb-4">
                            {loginMessage}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Login
                    </button>
                </form>

                {/* Signup Form */}
                <form
                    id="form-signup"
                    className={activeTab === 'signup' ? '' : 'hidden'}
                    onSubmit={handleSignupSubmit}
                >
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="signup-name">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="signup-name"
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="signup-email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="signup-email"
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="signup-password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="signup-password"
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2" htmlFor="signup-confirm">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="signup-confirm"
                            className="w-full px-3 py-2 border rounded"
                            required
                        />
                    </div>
                    {signupMessage && (
                        <div id="signup-message" className="text-red-500 mb-4">
                            {signupMessage}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Sign Up
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
