import '../../src/styles/Home.css';
import React, { useState, useEffect } from 'react';
import { AiOutlineTeam } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";
import { RiLogoutBoxRLine } from "react-icons/ri";
import userImg from '../assets/img/img-logo-perfil-user-new.png';
import { Link, useNavigate } from 'react-router-dom';
import { GoProjectSymlink } from 'react-icons/go';
import { SelectionCard } from '../components/selectionCard.jsx';
import { FaTimes } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";

export function Settings() {
    const [sidebarAbierta, setSidebarAbierta] = useState(false);
  
  const navigate = useNavigate();

  // 🔐 Obtener datos del usuario logueado
  const [usuario, setUsuario] = useState({
    id: null,
    nombre: "",
    rol_id: null,
    rol_codigo: ""
  });

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

   

          <Link to='/settings' className='menu-link'>
            Ajustes
            <IoSettings className='icons' />
          </Link>
        </nav>

        <div className="user-box">
          <button className="logout-button" onClick={handleLogout}>
            <RiLogoutBoxRLine className='icon-logout'/>
            Cerrar Sesión
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

{/* === BOTÓN HAMBURGUESA === */}
      <button
        className="hamburger-btn"
        onClick={() => setSidebarAbierta(!sidebarAbierta)}>

        {sidebarAbierta ? <FaTimes/> : <GiHamburgerMenu/> }
      </button>

      <main className="content">
        <SelectionCard />
      </main>
    </div>
  );
}

export default Settings;
