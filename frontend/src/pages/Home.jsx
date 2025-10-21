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
import { Link } from 'react-router-dom';
import { GoProjectSymlink } from 'react-icons/go';

export function Home() {

// const [card,setCard]=useState(0)

// const text=setCard ? '+ Nuevo Proyecto' : 'Importar Proyecto'

async function crearProyecto() {
  
}

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
    {/* Saludo */}
    <h1 className="title">Hola Nicolás</h1>
    <p className="subtitle">¡Bienvenido de nuevo al espacio de trabajo, te extrañamos!</p>

    {/* Buscador */}
    <input
      type="text"
      className="search-input"
      placeholder="Buscar proyecto...."
    />

    {/* Lista de proyectos */}
    {
      <div className="projects-container">
      {/* cada tarjeta de proyecto */}
      {/* <h3>Iniciales del proyecto</h3> */}
      {/* <h4>Nombre del proyecto</h4> */}
    </div>
    }

    {/* Botones */}
    <h3 className='title-actions' >Proyectos</h3>
    <div className="actions">
      {
        <button onClick={()=> console.log("Creando proyecto")} className="new-btn">+ Nuevo Proyecto</button>
      }
      <button className="import-btn">Importar Proyecto</button>
    
   

     {/* Card Projects */}
   {    
<div className='card-new-project'>
  <h2 className='title-new-project'>Titulo del Proyecto</h2>
  <input
    type="text"
    className="search-input-project"
    placeholder="Introduce el nombre del proyecto"
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
      placeholder="Introduce el nombre del lider técnico"
    />
  </div>

  <div className="member-input">
    <TbUserCode className='icon-users' />
    <input
      type="text"
      className="search-input-members"
      placeholder="Introduce el nombre del desarrollador"
    />
  </div>

  <button className='button-user-add'>
    <LiaUserPlusSolid className='icon-users'/>
    <span className='title-user-add'>Agregar otro desarrollador</span>
  </button> 
  
  <button className='button-create-project'>
    <span className='title-user-add'>Crear Proyecto</span>
  </button> 
  </div>
   }
   

  </div>
  
  </main>

</div>

  );
}

export default Home;

