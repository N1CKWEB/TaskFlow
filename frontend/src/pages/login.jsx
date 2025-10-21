import { useState } from "react";
import "../styles/login.css";

export default function Login() {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    userType: "dueño", // valor por defecto
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (activeTab === "login") {
      if (!formData.email || !formData.password) {
        setError("Completa todos los campos");
        return;
      }
      console.log("Login:", { email: formData.email, password: formData.password });
    } else {
      if (!formData.username || !formData.email || !formData.password || !formData.confirm || !formData.userType) {
        setError("Completa todos los campos");
        return;
      }
      if (formData.password !== formData.confirm) {
        setError("Las contraseñas no coinciden");
        return;
      }
      console.log("Register:", formData);
    }
  };

  return (
    <div className="login-container">
      <div className="card">
        <h1>Bienvenido</h1>
        <div className="tabs">
          <button
            className={activeTab === "login" ? "active" : ""}
            onClick={() => setActiveTab("login")}
          >
            Iniciar Sesión
          </button>
          <button
            className={activeTab === "register" ? "active" : ""}
            onClick={() => setActiveTab("register")}
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
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Confirmar Contraseña</label>
                <input
                  type="password"
                  name="confirm"
                  value={formData.confirm}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
              <div className="form-group">
                <label>Tipo de Usuario</label>
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
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
