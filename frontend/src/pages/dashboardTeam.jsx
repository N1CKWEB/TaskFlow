import '../../src/styles/dashboardTeam.css';
import '../../src/styles/Home.css';
import React, { useState } from 'react';
import { AiOutlineTeam } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";
import { RiLogoutBoxRLine } from "react-icons/ri";
import userImg from '../assets/img/img-logo-perfil-user-new.png';
import { Link } from 'react-router-dom';
import { GoProjectSymlink } from 'react-icons/go';
import { IoCaretBackCircleOutline } from "react-icons/io5";
import { FaEdit } from "react-icons/fa";
import { IoIosAddCircle } from "react-icons/io";


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

    <IoCaretBackCircleOutline className='icon-project' />
    <h2 className='tittle-name-project' >Nombre del proyecto</h2>

    {/* Barra de progreso completado..  */}
    <div className='container-bar-progress'>
      <div className='barr-progress'/>

      <h2 className='tittle-bar--progress'>Progreso</h2>
      <h2 className='tittle-complete--progress'>Completado</h2>
      {/* <h2 className='number-complete--progress'></h2> */}
    </div>      
     
    <button className='button--projects'>
       <h2>Ver Proyectos</h2>      
    </button> 
   
    <div className='container-template'>

    {/* Cards To-Do */}
    <div className='template' >

      <h2 className='title-name' >To Do</h2>
      <FaEdit  className='icon-edit'/>
      <IoIosAddCircle className='icon-add'/>

      {/*Punto de color  */}
     <div className='template-color-to-do'/>
  
     {/* Tarea  creada*/}
     <div className='complete-task-template'/>
    
       
    </div>
    
    {/* Cards In Progress */}
    <div className='template' >

      <h2 className='title-name--v'>In Progress</h2>
      <FaEdit  className='icon-edit--v'/>
      <IoIosAddCircle className='icon-add--v'/>

      {/*Punto de color  */}
     <div className='template-color-in-progress'/>
      
      {/* Tarea  creada*/}
      <div className='complete-task-template'/>


    </div>

    {/* Cards Done */}
    <div className='template' >

      <h2 className='title-name'>Done</h2>
      <FaEdit  className='icon-edit'/>
      <IoIosAddCircle className='icon-add'/>

      {/*Punto de color  */}
     <div className='template-color-done'/>
      
      {/* Tarea  creada*/}
      <div className='complete-task-template'/>

    </div> 
      
     {/* Template Members*/}
    {
      <div className='members-template'>
      <h2 className='title-principal-membrers'>Miembros del equipo</h2>
      <img src={userImg} // reemplazá por la foto real
           className="user-avatar--members"/>  

       <h2 className='title-name-user-avatar'>Nicolás Díaz</h2> 
       <h3 className='rol-name-user-avatar'>Lider</h3>
     </div>
    }
      
  </div>

    </main>


</div>

  );
}

export default dashboardTeam;

