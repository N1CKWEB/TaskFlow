import '../../src/styles/App.css';
import React, { useState } from 'react';
import { AiOutlineTeam } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";
import { RiLogoutBoxRLine } from "react-icons/ri";
import userImg from '../assets/img/img-logo-perfil-user-new.png';
import { Link } from 'react-router-dom';
import { GoProjectSymlink } from 'react-icons/go';
import { IoCaretBackCircleOutline } from "react-icons/io5";


export function dashboardTeam() {

 return (
<div className="layout">

  <aside className="sidebar">
    {/* Logo */}
    <h2 className="sidebar-title">TaskFlow</h2>
    <hr className='sidebar-line' />
    {/* Menú */}
    <nav className="menu">
      
      {/* ✅ Link correcto a dashboardTeam */}
      
      <Link to="/" className="menu-link">
      Proyecto
      <GoProjectSymlink className='icons' />
      </Link>

      <Link to="/dashboard-team" className='menu-link'>
      Equipo
      <AiOutlineTeam className='icons'/>
      </Link>

      <Link to='/settings'>
      Ajustes
      <IoSettings className='icons' />
      </Link>
    </nav>

        {/* Usuario y logout */}
        <div className="user-box">
          <button className="logout-button">
            {/* Podés agregar un ícono si querés */}
            <RiLogoutBoxRLine className='icon-logout'/>
            Cerrar Sesión
          </button>
          <div className="user-info">
            <img
              src={userImg} // reemplazá por la foto real
              className="user-avatar"
            />
    
            <div className="user-texts">
              <p className="title-user-box">Nombre Usuario</p>
              <p className="subtitle-user-box">Líder de Proyecto</p>
            </div>
          </div>
        </div>

  </aside>
        
  <main className="content">

  <IoCaretBackCircleOutline />
  <h2>Nombre del proyecto</h2>
  

  <div>
    
  </div>      
  
  </main>


</div>

  );
}

export default dashboardTeam;

