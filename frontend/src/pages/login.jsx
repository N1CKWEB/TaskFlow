// src/App.jsx
import React, { useState } from "react";
import "../../src/styles/App.css";

export function Login() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="App flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        {/* Encabezado */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido</h1>
          <p className="text-gray-600 mt-2">
            Ingresa a tu cuenta o crea una nueva
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="grid grid-cols-2 border rounded-lg overflow-hidden text-center font-semibold">
            <button
              onClick={() => setActiveTab("login")}
              className={`py-2 transition ${
                activeTab === "login"
                  ? "bg-gray-100 text-gray-800 border-r border-gray-300"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Ingresar
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`py-2 transition ${
                activeTab === "signup"
                  ? "bg-gray-100 text-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Crear Cuenta
            </button>
          </div>
        </div>

        {/* Formulario de Login */}
        {activeTab === "login" && (
          <form id="form-login" className="space-y-4 animate-fadeIn">
            <div>
              <label
                htmlFor="login-email"
                className="text-sm font-medium block mb-1"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Ingresa tu email"
                  className="pl-3 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="text-sm font-medium block mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  required
                  placeholder="Ingresa tu Contraseña"
                  className="pl-3 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div id="login-message" className="text-sm text-red-500 hidden" />

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Ingresar
            </button>
          </form>
        )}

        {/* Formulario de Registro */}
        {activeTab === "signup" && (
          <form id="form-signup" className="space-y-4 mt-6 animate-fadeIn">
            <div>
              <label
                htmlFor="signup-name"
                className="text-sm font-medium block mb-1"
              >
                Nombre Completo
              </label>
              <div className="relative">
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ingresa tu Nombre"
                  className="pl-3 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="text-sm font-medium block mb-1"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Ingresa tu email"
                  className="pl-3 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="text-sm font-medium block mb-1"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  required
                  minLength="6"
                  placeholder="Ingresa tu Contraseña"
                  className="pl-3 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                La Contraseña debe contener al menos 6 caracteres
              </p>
            </div>

            <div>
              <label
                htmlFor="signup-confirm"
                className="text-sm font-medium block mb-1"
              >
                Confirma tu Contraseña
              </label>
              <div className="relative">
                <input
                  id="signup-confirm"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength="6"
                  placeholder="Confirma tu Contraseña"
                  className="pl-3 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div id="signup-message" className="text-sm text-red-500 hidden" />

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Crear Cuenta
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Al registrarte, aceptás nuestros{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Términos
          </a>{" "}
          y{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Política de Privacidad
          </a>
          .
        </div>
      </div>
    </div>
  );
}

export default Login;
