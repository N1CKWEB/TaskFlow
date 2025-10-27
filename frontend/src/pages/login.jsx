import { useState } from "react";
import "../styles/login.css";

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    userType: "dueño",
  });
  const [error, setError] = useState("");

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (activeTab === "login") {
      if (!loginData.email || !loginData.password) {
        setError("Completa todos los campos");
        return;
      }
      console.log("Login:", loginData);
      // Aquí iría tu petición al backend para login
    } else {
      const { username, email, password, confirm, userType } = registerData;
      if (!username || !email || !password || !confirm || !userType) {
        setError("Completa todos los campos");
        return;
      }
      if (password !== confirm) {
        setError("Las contraseñas no coinciden");
        return;
      }
      console.log("Register:", registerData);
      // Aquí iría tu petición al backend para registro
    }
  };

  const handleTabSwitch = (tab) => {
    setError("");
    setActiveTab(tab);
    // Limpiamos el formulario de la pestaña activa
    if (tab === "login") {
      setLoginData({ email: "", password: "" });
    } else {
      setRegisterData({
        username: "",
        email: "",
        password: "",
        confirm: "",
        userType: "dueño",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="card">
        <h1>Bienvenido</h1>
        <div className="tabs">
          <button
            className={activeTab === "login" ? "active" : ""}
            onClick={() => handleTabSwitch("login")}
          >
            Iniciar Sesión
          </button>
          <button
            className={activeTab === "register" ? "active" : ""}
            onClick={() => handleTabSwitch("register")}
          >
            Crear Cuenta
          </button>
        </div>

        <div className="forms-wrapper">
          {/* Login */}
          <form
            className={`form-container login-form ${activeTab === "login" ? "active" : ""}`}
            onSubmit={handleSubmit}
          >
            <div className="form-inner">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  placeholder="••••••••"
                />
              </div>
              {error && <div className="error">{error}</div>}
              <button type="submit" className="submit-btn">Iniciar Sesión</button>
            </div>
          </form>

          {/* Registro */}
          <form
            className={`form-container register-form ${activeTab === "register" ? "active" : ""}`}
            onSubmit={handleSubmit}
          >
            <div className="form-inner">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirm"
                  value={registerData.confirm}
                  onChange={handleRegisterChange}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Tipo de Usuario</label>
                <select
                  name="userType"
                  value={registerData.userType}
                  onChange={handleRegisterChange}
                >
                  <option value="dueño">Dueño</option>
                  <option value="lider">Líder</option>
                  <option value="desarrollador">Desarrollador</option>
                </select>
              </div>
              {error && <div className="error">{error}</div>}
              <button type="submit" className="submit-btn">Crear Cuenta</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
