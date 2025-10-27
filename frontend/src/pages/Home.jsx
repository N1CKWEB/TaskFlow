import '../../src/styles/Home.css';
import React, { useState } from 'react';
import { AiOutlineTeam } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { GoProjectSymlink } from 'react-icons/go';
import { FaTimes } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import userImg from '../assets/img/img-logo-perfil-user-new.png';
import { RiUserStarFill } from "react-icons/ri";
import { GrUserManager } from "react-icons/gr";
import { LiaUserPlusSolid } from "react-icons/lia";
import { TbUserCode } from "react-icons/tb";
import { Link } from 'react-router-dom';

export function Home() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [animando, setAnimando] = useState(false);
  const [sidebarAbierta, setSidebarAbierta] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [nuevoProyecto, setNuevoProyecto] = useState("");
  const [desarrolladores, setDesarrolladores] = useState([""]);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const handleCrearProyecto = () => {
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
    if (nuevoProyecto.trim() === "") return;

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

  const proyectosVisibles = mostrarTodos ? proyectos : proyectos.slice(0, 5);

  return (
    <div className={`layout ${sidebarAbierta ? 'sidebar-open' : ''}`}>
      {/* === SIDEBAR DESLIZANTE === */}
      <aside className={`sidebar ${sidebarAbierta ? 'open' : ''}`}>
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
          <button className="logout-button">
            <RiLogoutBoxRLine className='icon-logout' />
            <span>Cerrar Sesión</span>
          </button>
          <div className="user-info">
            <img src={userImg} className="user-avatar" alt="Usuario" />
            <div className="user-texts">
              <p className="title-user-box">Nombre Usuario</p>
              <p className="subtitle-user-box">Líder de Proyecto</p>
            </div>
          </div>
        </div>
      </aside>
      {/* === BOTÓN HAMBURGUESA === */}
      <button
        className="hamburger-btn"
        onClick={() => setSidebarAbierta(!sidebarAbierta)}
      >
        {sidebarAbierta ? <FaTimes /> : <GiHamburgerMenu />}
      </button>

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="content">
        <h1 className="title">Hola Nicolás</h1>
        <p className="subtitle">¡Bienvenido de nuevo al espacio de trabajo, te extrañamos!</p>

        <input
          type="text"
          className="search-input"
          placeholder="Buscar proyecto...."
        />

        <h3 className='title-actions'>Proyectos</h3>

        <div className="project-grid">
          {proyectosVisibles.map(proyecto => (
            <div
              key={proyecto.id}
              className="project-card"
              style={{ backgroundColor: proyecto.color }}
            >
              <div className="project-initials">{proyecto.siglas}</div>
              <p className="project-name">{proyecto.nombre}</p>
            </div>
          ))}

          {proyectos.length > 5 && (
            <div
              className="project-card ver-mas"
              onClick={() => setMostrarTodos(!mostrarTodos)}
            >
              <p className="project-name">
                {mostrarTodos ? "Ver menos proyectos..." : "Ver más proyectos..."}
              </p>
            </div>
          )}
        </div>

        <div className="actions">
          {!mostrarFormulario && (
            <>
              <button onClick={handleCrearProyecto} className="new-btn">+ Nuevo Proyecto</button>
              <button className="import-btn">Importar Proyecto</button>
            </>
          )}
        </div>

        {mostrarFormulario && (
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
