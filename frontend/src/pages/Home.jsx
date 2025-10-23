import '../../src/styles/Home.css';
import React, { useState } from 'react';
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
import { Link } from 'react-router-dom';

export function Home() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [animando, setAnimando] = useState(false);
  const [desarrolladores, setDesarrolladores] = useState([""]);

  // 👉 Mostrar el CRUD
  const handleCrearProyecto = () => {
    setMostrarFormulario(true);
    setAnimando("opening");
  };

  // 👉 Cerrar el CRUD con animación
  const handleCerrarFormulario = () => {
    setAnimando("closing");
    setTimeout(() => setMostrarFormulario(false), 500);
  };

  // 👉 Agregar un nuevo campo de desarrollador
  const agregarDesarrollador = () => {
    setDesarrolladores([...desarrolladores, ""]);
  };

  // 👉 Eliminar un campo específico
  const eliminarDesarrollador = (index) => {
    const nuevos = [...desarrolladores];
    nuevos.splice(index, 1);
    setDesarrolladores(nuevos);
  };

  // 👉 Actualizar el valor de un campo
  const manejarCambio = (index, value) => {
    const nuevos = [...desarrolladores];
    nuevos[index] = value;
    setDesarrolladores(nuevos);
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

          <Link to='/settings'>
            Ajustes
            <IoSettings className='icons' />
          </Link>
        </nav>

        <div className="user-box">
          <button className="logout-button">
            <RiLogoutBoxRLine className='icon-logout' />
            Cerrar Sesión
          </button>
          <div className="user-info">
            <img src={userImg} className="user-avatar" />
            <div className="user-texts">
              <p className="title-user-box">Nombre Usuario</p>
              <p className="subtitle-user-box">Líder de Proyecto</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="content">
        <h1 className="title">Hola Nicolás</h1>
        <p className="subtitle">¡Bienvenido de nuevo al espacio de trabajo, te extrañamos!</p>

        <input
          type="text"
          className="search-input"
          placeholder="Buscar proyecto...."
        />

        <h3 className='title-actions'>Proyectos</h3>
        <div className="actions">
          {/* ✅ Mostrar botones solo cuando el formulario NO está visible */}
          {!mostrarFormulario && (
            <>
              <button onClick={handleCrearProyecto} className="new-btn">+ Nuevo Proyecto</button>
              <button className="import-btn">Importar Proyecto</button>
            </>
          )}
        </div>

        {/* ✅ Mostrar formulario solo cuando mostrarFormulario es true */}
        {mostrarFormulario && (
          <div className={`card-new-project ${animando}`}>
            <h2 className='title-new-project'>Título del Proyecto</h2>
            <input
              type="text"
              className="search-input-project"
              placeholder="Introduce el nombre del proyecto"
            />

            <h2 className='title-team'>Miembros del equipo</h2>

            {/* Dueño */}
            <div className="member-input">
              <RiUserStarFill className='icon-users' />
              <input
                type="text"
                className="search-input-members"
                placeholder="Introduce el nombre del dueño del proyecto"
              />
            </div>

            {/* Líder */}
            <div className="member-input">
              <GrUserManager className='icon-users' />
              <input
                type="text"
                className="search-input-members"
                placeholder="Introduce el nombre del líder técnico"
              />
            </div>

            {/* Desarrolladores dinámicos */}
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

            {/* Agregar más desarrolladores */}
            <button
              className='button-user-add'
              type="button"
              onClick={agregarDesarrollador}
            >
              <LiaUserPlusSolid className='icon-users' />
              <span className='title-user-add'>Agregar otro desarrollador</span>
            </button>

            {/* Crear / Cerrar */}
            <div className="buttons-create-close">
              <button className='button-create-project'>
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
