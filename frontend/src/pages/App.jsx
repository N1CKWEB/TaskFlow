import '../../src/styles/App.css';
import React, { useState } from 'react';
import { AiOutlineTeam } from "react-icons/ai";
import { GoProjectSymlink } from "react-icons/go";
import { IoSettings } from "react-icons/io5";
import { RiLogoutBoxRLine } from "react-icons/ri";
import userImg from '../assets/img/img-logo-perfil-user-new.png';
import { RiUserStarFill } from "react-icons/ri";
import { GrUserManager } from "react-icons/gr";
import { LiaUserPlusSolid } from "react-icons/lia";
import { TbUserCode } from "react-icons/tb";

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
      
      <a href=''>Proyecto
      <GoProjectSymlink className='icons'/>
      </a>
      
      <a href=''>Equipo
      <AiOutlineTeam className='icons'/>
      </a>

      <a href=''>Ajustes
      <IoSettings className='icons' />
      </a>

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
    </div>
    }

    {/* Botones */}
      <h3 className='title-actions' >Proyectos</h3>
    <div className="actions">
      {
        <button onClick={()=> console.log("Creando proyecto")} className="new-btn">+ Nuevo Proyecto</button>
      }
      <button className="import-btn">Importar Proyecto</button>
    
      <div className='card-new-project'>
      <h2>Titulo del Proyecto</h2>
      <input
        type="text"
        className="search-input"
        placeholder="Introduce el nombre del proyecto"
        />
        <h2>Miembros del equipo</h2>
      <RiUserStarFill />
      <input
        type="text"
        className="search-input"
        placeholder="Introduce el nombre del dueño del proyecto"
        />

      <GrUserManager />
      <input
        type="text"
        className="search-input"
        placeholder="Introduce el nombre del lider técnico"
        />
      <TbUserCode />
      <input
        type="text"
        className="search-input"
        placeholder="Introduce el nombre del desarrollador"
        />
      
      <h3>Agregar otro desarrollador</h3>
      <LiaUserPlusSolid />






      </div>
    </div>
  </main>

</div>

  );
}

export default Home;

