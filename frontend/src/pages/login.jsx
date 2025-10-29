import { useState } from "react";
import "../styles/login.css";
import { apiLogin, apiRegister } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const rolesMap = {
    dueño: 1,
    lider: 2,
    desarrollador: 3,
  };
  const [mensaje, setMensaje] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    userType: "dueño",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (activeTab === "login") {
        // ------------------ LOGIN ------------------
        if (!formData.email || !formData.password) {
          setError("Completa todos los campos");
          return;
        }

        const response = await apiLogin(formData.email, formData.password);

        // Acceder correctamente a los datos
        const { access_token, usuario } = response;

        // Guardar token y datos del usuario
        localStorage.setItem("usuario_id", usuario.id_usuario);
        localStorage.setItem("nombre_usuario", usuario.nombre_completo);
        localStorage.setItem("token", access_token); // ← El token real del backend

        // Mostrar mensaje antes de redirigir
        setMensaje(`Bienvenido, ${usuario.nombre_completo}`);

        setTimeout(() => {
          setMensaje("");
          navigate("/");
        }, 2000);

      } else {
        // ------------------ REGISTRO ------------------
        if (!formData.username || !formData.email || !formData.password || !formData.confirm) {
          setError("Completa todos los campos");
          return;
        }

        if (formData.password !== formData.confirm) {
          setError("Las contraseñas no coinciden");
          return;
        }

        const nuevoUsuario = {
          nombre_completo: formData.username,
          email: formData.email,
          contraseña: formData.password,
          confirmar_contraseña: formData.confirm,
          id_rol: rolesMap[formData.userType],
        };

        await apiRegister(nuevoUsuario);
        setMensaje("Usuario registrado correctamente. Ahora podés iniciar sesión.");
        setTimeout(() => setMensaje(""), 3000);
        setActiveTab("login");
      }
    } catch (err) {
      console.error(err);
      setError(err?.mensaje || err?.error || "Error en la conexión con el servidor");
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
          {/* LOGIN */}
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
              <button type="submit" className="submit-btn">
                Iniciar Sesión
              </button>
            </div>
          </form>

          {/* REGISTRO */}
          <form
            className={`form-container register-form ${activeTab === "register" ? "active" : ""}`}
            onSubmit={handleSubmit}
          >
            <div className="form-inner">
              <div className="form-group">
                <label>Nombre y Apellido</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Nombre y Apellido"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tucorreo@gmail.com"
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
              <button type="submit" className="submit-btn">
                Crear Cuenta
              </button>
            </div>
          </form>
        </div>
      </div>
      {mensaje && (
        <div className="toast-login">
          {mensaje}
        </div>
      )}
    </div>
  );
}