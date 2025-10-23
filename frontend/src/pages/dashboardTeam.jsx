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
import { RiUserStarFill } from "react-icons/ri";
import { GrUserManager } from "react-icons/gr";
import { LiaUserPlusSolid } from "react-icons/lia";
import { TbUserCode } from "react-icons/tb";


export function DashboardTeam() {
  
  const [showForm,setShowForm] = useState(false)

  const iconAdd=showForm ? "icon-add" : "card-create-task" 

  const handleForm = () => {
       setShowForm(!showForm)
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
    <IoCaretBackCircleOutline className='icon-project' />
    <h2 className='tittle-name-project' >Nombre del proyecto</h2>

    <div className='container-bar-progress'>
      <div className='barr-progress'/>

      <h2 className='tittle-bar--progress'>Progreso</h2>
      <h2 className='tittle-complete--progress'>Completado</h2>
    </div>      
     
    <button className='button--projects'>
       <h2>Ver Proyectos</h2>      
    </button> 
   
    
    <div className='container-template'>

    <div className='template' >

      <h2 className='title-name' >To Do</h2>
      <FaEdit  className='icon-edit'/>
      <IoIosAddCircle onClick={()=> setShowForm(true)} className='icon-add'/>

     <div className='template-color-to-do'/>

     <div className='complete-task-template'/>
    
       
    </div>
    
    <div className='template' >

      <h2 className='title-name--v'>In Progress</h2>
      <FaEdit  className='icon-edit--v'/>
      <IoIosAddCircle onClick={()=> setShowForm(true)} className='icon-add--v'/>

     <div className='template-color-in-progress'/>
      
      <div className='complete-task-template'/>


    </div>

    <div className='template' >

      <h2 className='title-name'>Done</h2>
      <FaEdit  className='icon-edit'/>
      <IoIosAddCircle onClick={()=> setShowForm(true)} className='icon-add'/>

     <div className='template-color-done'/>
      
      <div className='complete-task-template'/>
    
    </div> 
      
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
   
   {showForm && (

    <div className='overlay'>

    <div  className="card-create-task">


      <h2 className="title-create-task">Crear nueva tarea</h2>

      <input
        type="text"
        className="input-task"
        placeholder="Nombre de la tarea"
        />

      <textarea
        className="textarea-task"
        placeholder="Descripción de la tarea"
        ></textarea>

      <select className="select-priority">
        <option disabled selected>Prioridad</option>
        <option value="Alta">🔥 Alta</option>
        <option value="Media">⚠️ Media</option>
        <option value="Baja">🕓 Baja</option>
      </select>

      <input
        type="date"
        className="input-date"
        placeholder="Fecha de inicio"
        
        
        />

      <input
        type="number"
        className="input-hours" 
        placeholder="Horas programadas" 
        min={1}
        step={1}
        />
      
      <input
        type="text"
        className="input-conditions"
        placeholder="Condiciones de aceptación"
        />

      <button className="button-add-condition">
        ➕ Agregar otra condición
      </button>

      <button className="button-create-task">
        Crear tarea
      </button>
    
      <button onClick={()=> setShowForm(false)} className="button-close-task">
       Cerrar 
      </button>
    
      </div>
   </div>
    
   )}

  </main>
  </div>
  
  
  
  
 



  );
}

export default DashboardTeam;

