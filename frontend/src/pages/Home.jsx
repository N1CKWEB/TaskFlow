import '../../src/styles/Home.css';
import React, { useState, useEffect } from 'react';
import { AiOutlineTeam } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";
import { RiLogoutBoxRLine } from "react-icons/ri";
import userImg from '../assets/img/img-logo-perfil-user-new.png';
import { RiUserStarFill } from "react-icons/ri";
import { GrUserManager } from "react-icons/gr";
import { LiaUserPlusSolid } from "react-icons/lia";
import { TbUserCode } from "react-icons/tb";
import { GoProjectSymlink } from 'react-icons/go';
import { FaTimes } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();
  
  // 🔐 Obtener datos del usuario logueado
  const [usuario, setUsuario] = useState({
    id: null,
    nombre: "",
    rol_id: null,
    rol_codigo: ""
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [animando, setAnimando] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [nuevoProyecto, setNuevoProyecto] = useState("");
  const [desarrolladores, setDesarrolladores] = useState([""]);

  // 🔄 Cargar datos del usuario al montar el componente
  useEffect(() => {
    const usuarioData = {
      id: localStorage.getItem("usuario_id"),
      nombre: localStorage.getItem("nombre_usuario") || "Usuario",
      rol_id: parseInt(localStorage.getItem("rol_id")),
      rol_codigo: localStorage.getItem("rol_codigo") || ""
    };
    setUsuario(usuarioData);
  }, []);

  // ✅ Verificar si puede crear proyectos (Dueño o Líder)
  const puedeCrearProyectos = () => {
    return usuario.rol_id === 1 || usuario.rol_id === 2;
  };

  // 🚪 Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("nombre_usuario");
    localStorage.removeItem("rol_id");
    localStorage.removeItem("rol_codigo");
    navigate("/login");
  };

  // 📋 Obtener nombre del rol en español
  const obtenerNombreRol = () => {
    switch(usuario.rol_id) {
      case 1:
        return "Dueño del Proyecto";
      case 2:
        return "Líder de Proyecto";
      case 3:
        return "Desarrollador";
      default:
        return "Usuario";
    }
  };

  const handleCrearProyecto = () => {
    if (!puedeCrearProyectos()) {
      alert("No tienes permisos para crear proyectos");
      return;
    }
    setMostrarFormulario(true);
    setAnimando("opening");
  };

  const handleCerrarFormulario = () => {
    setAnimando("closing");
    setTimeout(() => setMostrarFormulario(false), 500);
  };

  const handleAgregarDesarrollador = () => {
    setDesarrolladores([...desarrolladores, ""]);
  };

  const manejarCambio = (index, value) => {
    const nuevos = [...desarrolladores];
    nuevos[index] = value;
    setDesarrolladores(nuevos);
  };

  const eliminarDesarrollador = (index) => {
    const nuevos = [...desarrolladores];
    nuevos.splice(index, 1);
    setDesarrolladores(nuevos);
  };

  const handleCrearProyectoFinal = () => {
    if (nuevoProyecto.trim() === "") {
      alert("Por favor ingresa un nombre para el proyecto");
      return;
    }

    const siglas = nuevoProyecto
      .split(" ")
      .map(p => p[0].toUpperCase())
      .join("")
      .slice(0, 3);

    const colores = ["#F4A261", "#2A9D8F", "#E76F51", "#264653", "#A7C957", "#3A86FF"];
    const colorRandom = colores[Math.floor(Math.random() * colores.length)];
    
    const nuevo = {
      id: Date.now(),
      nombre: nuevoProyecto,
      siglas,
      color: colorRandom,
      desarrolladores
    };

    setProyectos([...proyectos, nuevo]);
    setNuevoProyecto("");
    setDesarrolladores([""]);
    handleCerrarFormulario();
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">TaskFlow</h2>
        <hr className='sidebar-line' />
        <nav className="menu">
          <Link to="/" className="menu-link">
            Proyecto
            <GoProjectSymlink className='icons' />
          </Link>

          <Link to="/dashboard-team" className='menu-link'>
            Equipo
            <AiOutlineTeam className='icons' />
          </Link>

          <Link to='/settings' className='menu-link'>
            Ajustes
            <IoSettings className='icons' />
          </Link>
        </nav>

        <div className="user-box">
          <button className="logout-button" onClick={handleLogout}>
            <RiLogoutBoxRLine className='icon-logout' />
            <span>Cerrar Sesión</span>
          </button>
          <div className="user-info">
            <img src={userImg} className="user-avatar" alt="Avatar" />
            <div className="user-texts">
              <p className="title-user-box">{usuario.nombre}</p>
              <p className="subtitle-user-box">{obtenerNombreRol()}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="content">
        <h1 className="title">Hola {usuario.nombre}</h1>
        <p className="subtitle">¡Bienvenido de nuevo al espacio de trabajo, te extrañamos!</p>

        <input
          type="text"
          className="search-input"
          placeholder="Buscar proyecto...."
        />

        <h3 className='title-actions'>Proyectos</h3>

        <div className="project-grid">
          {proyectos.map(proyecto => (
            <div
              key={proyecto.id}
              className="project-card"
              style={{ backgroundColor: proyecto.color }}
            >
              <div className="project-initials">{proyecto.siglas}</div>
              <p className="project-name">{proyecto.nombre}</p>
            </div>
          ))}
        </div>

        <div className="actions">
          {!mostrarFormulario && (
            <>
              {/* ✅ Solo Dueño (1) y Líder (2) pueden crear proyectos */}
              {puedeCrearProyectos() ? (
                <>
                  <button onClick={handleCrearProyecto} className="new-btn">
                    + Nuevo Proyecto
                  </button>
                  <button className="import-btn">Importar Proyecto</button>
                </>
              ) : (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: '#888',
                  fontStyle: 'italic' 
                }}>
                  <p>⚠️ No tienes permisos para crear proyectos.</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Solo los Dueños y Líderes pueden crear proyectos.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ✅ Solo mostrar formulario si tiene permisos */}
        {mostrarFormulario && puedeCrearProyectos() && (
          <div className={`card-new-project ${animando}`}>
            <h2 className='title-new-project'>Título del Proyecto</h2>
            <input
              type="text"
              className="search-input-project"
              placeholder="Introduce el nombre del proyecto"
              value={nuevoProyecto}
              onChange={(e) => setNuevoProyecto(e.target.value)}
            />

            <h2 className='title-team'>Miembros del equipo</h2>

            <div className="member-input">
              <RiUserStarFill className='icon-users' />
              <input
                type="text"
                className="search-input-members"
                placeholder="Introduce el nombre del dueño del proyecto"
              />
            </div>

            <div className="member-input">
              <GrUserManager className='icon-users' />
              <input
                type="text"
                className="search-input-members"
                placeholder="Introduce el nombre del líder técnico"
              />
            </div>

            {desarrolladores.map((dev, index) => (
              <div key={index} className="member-input fadeIn">
                <TbUserCode className='icon-users' />
                <input
                  type="text"
                  className="search-input-members"
                  placeholder={`Desarrollador ${index + 1}`}
                  value={dev}
                  onChange={(e) => manejarCambio(index, e.target.value)}
                />
                {desarrolladores.length > 1 && (
                  <button
                    type="button"
                    className="delete-dev-btn"
                    onClick={() => eliminarDesarrollador(index)}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}

            <button onClick={handleAgregarDesarrollador} className='button-user-add'>
              <LiaUserPlusSolid className='icon-users' />
              <span className='title-user-add'>Agregar otro desarrollador</span>
            </button>

            <div className="buttons-create-close">
              <button onClick={handleCrearProyectoFinal} className='button-create-project'>
                <span className='title-user-add'>Crear Proyecto</span>
              </button>

              <button onClick={handleCerrarFormulario} className='button-close-project'>
                <span className='title-user-add'>Cerrar</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;