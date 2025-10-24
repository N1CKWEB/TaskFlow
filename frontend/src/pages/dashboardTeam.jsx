import '../../src/styles/dashboardTeam.css';
import '../../src/styles/Home.css';
import React, { useState, useEffect } from 'react';
import { AiOutlineTeam } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";
import { RiLogoutBoxRLine } from "react-icons/ri";
import userImg from '../assets/img/img-logo-perfil-user-new.png';
import { Link } from 'react-router-dom';
import { GoProjectSymlink } from 'react-icons/go';
import { IoCaretBackCircleOutline } from "react-icons/io5";
import { IoIosAddCircle } from "react-icons/io";
import { FaCalendarAlt } from "react-icons/fa";
import { MdOutlineVerifiedUser } from "react-icons/md";

export function DashboardTeam() {
  const [showForm, setShowForm] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [tareas, setTareas] = useState([]);
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horas, setHoras] = useState("");
  const [condiciones, setCondiciones] = useState([""]);
  const [estado, setEstado] = useState("To-Do");

  // Colores según prioridad
  const getPriorityColor = (p) => {
    switch (p?.toLowerCase()) {
      case "alta":
        return "#ff4444";
      case "media":
        return "#ffaa00";
      case "baja":
        return "#00c851";
      default:
        return "#888";
    }
  };

  // === Crear nueva tarea ===
  const handleCrearTareaFinal = () => {
    if (!nombre || !prioridad || !fechaEntrega) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    const nuevaTarea = {
      id: Date.now(),
      nombre,
      descripcion,
      prioridad,
      fechaEntrega,
      horas,
      condiciones,
      status: "To-Do",
    };

    setTareas([...tareas, nuevaTarea]);
    handleCerrarForm();
  };

  // === Cargar datos si hay tarea seleccionada ===
  useEffect(() => {
    if (tareaSeleccionada) {
      setNombre(tareaSeleccionada.nombre);
      setDescripcion(tareaSeleccionada.descripcion);
      setPrioridad(tareaSeleccionada.prioridad);
      setFechaEntrega(tareaSeleccionada.fechaEntrega);
      setHoras(tareaSeleccionada.horas);
      setCondiciones([tareaSeleccionada.condiciones]);
      setEstado(tareaSeleccionada.status);
    }
  }, [tareaSeleccionada]);

  // === Editar tarea existente ===
  const handleEditarTarea = () => {
    setTareas((prev) =>
      prev.map((t) =>
        t.id === tareaSeleccionada.id
          ? { ...t, nombre, descripcion, prioridad, fechaEntrega, horas, condiciones }
          : t
      )
    );
    handleCerrarForm();
  };

  // === Eliminar tarea ===
  const handleEliminarTarea = () => {
    setTareas(tareas.filter((t) => t.id !== tareaSeleccionada.id));
    handleCerrarForm();
  };

  // === Cerrar y limpiar formulario ===
  const handleCerrarForm = () => {
    setShowForm(false);
    setTareaSeleccionada(null);
    setNombre("");
    setDescripcion("");
    setPrioridad("");
    setFechaEntrega("");
    setHoras("");
    setCondiciones([""]);
  };

  
  const handleAgregarCondiciones = () => {
    setCondiciones([...condiciones, ""]);
  };


  // === Drag & Drop ===
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("taskId", id);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, newStatus) => {
    const id = e.dataTransfer.getData("taskId");
    setTareas((prev) =>
      prev.map((t) => (t.id == id ? { ...t, status: newStatus } : t))
    );
  };

  // === Render columnas ===
  const renderColumn = (title, status, allowCreate = false) => (
    <div
      className="template"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, status)}
    >
      <h2 className="title-name">{title}</h2>
      {allowCreate && (
        <IoIosAddCircle
          onClick={() => setShowForm(true)}
          className="icon-add"
        />
      )}

      <div className={`template-color-${status.replace(" ", "-").toLowerCase()}`} />

      {tareas
        .filter((t) => t.status === status)
        .map((t) => (
          <div
            key={t.id}
            className="complete-task-template"
            draggable
            onClick={() => {
              setTareaSeleccionada(t);
              setShowForm(true);
            }}
            onDragStart={(e) => handleDragStart(e, t.id)}
          >
            <h3 className="title-complete-task-template">{t.nombre}</h3>
            <h4 className="date-complete-task-template">
              <FaCalendarAlt className="icon-calendar-task--complete" />{" "}
              {t.fechaEntrega}
            </h4>
            <h4
              className="priority-complete-task-template"
              style={{
                backgroundColor: getPriorityColor(t.prioridad),
                padding: "4px 8px",
                borderRadius: "8px",
                display: "inline-block",
                color: "white",
              }}
            >
              {t.prioridad}
            </h4>
          </div>
        ))}
    </div>
  );

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="sidebar-title">TaskFlow</h2>
        <hr className="sidebar-line" />
        <nav className="menu">
          <Link to="/" className="menu-link">
            Proyecto
            <GoProjectSymlink className="icons" />
          </Link>
          <Link to="/dashboard-team" className="menu-link">
            Equipo
            <AiOutlineTeam className="icons" />
          </Link>
          <Link to="/settings">
            Ajustes
            <IoSettings className="icons" />
          </Link>
        </nav>

        <div className="user-box">
          <button className="logout-button">
            <RiLogoutBoxRLine className="icon-logout" />
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
        <IoCaretBackCircleOutline className="icon-project" />
        <h2 className="tittle-name-project">Nombre del proyecto</h2>

        <div className="container-bar-progress">
          <div className="barr-progress" />
          <h2 className="tittle-bar--progress">Progreso</h2>
          <h2 className="tittle-complete--progress">Completado</h2>
        </div>

        <button className="button--projects">
          <h2>Ver Proyectos</h2>
        </button>

        <div className="container-template">
          {renderColumn("To Do", "To-Do", true)}
          {renderColumn("In Progress", "In Progress")}
          {renderColumn("Done", "Done")}

          <div className="members-template">
            <h2 className="title-principal-membrers">Miembros del equipo</h2>
            <img src={userImg} className="user-avatar--members" />
            <h2 className="title-name-user-avatar">Nicolás Díaz</h2>
            <h3 className="rol-name-user-avatar">Líder</h3>
          </div>
        </div>

        {/* === FORMULARIO === */}
        {showForm && (
          <div className="overlay">

            <div className="card-create-task">
              <h2 className="title-create-task">
                {tareaSeleccionada ? "Editar tarea" : "Crear nueva tarea"}
              </h2>

              <input
                type="text"
                className="input-task"
                placeholder="Nombre de la tarea"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                />

              <textarea
                className="textarea-task"
                placeholder="Descripción de la tarea"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                />

              <select
                className="select-priority"
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                >
                <option disabled value="">
                  Prioridad
                </option>
                <option value="Alta">🔥 Alta</option>
                <option value="Media">⚠️ Media</option>
                <option value="Baja">🕓 Baja</option>
              </select>


              <input
                type="date"
                className="input-date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                />

              <input
                type="number"
                className="input-hours"
                placeholder="Horas programadas"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                />


              {/* === Condiciones de aceptación === */}
            <h3 className="subtitle-conditions">Condiciones de aceptación</h3>

            <div className="conditions-container">
              {condiciones.map((cond, index) => (
                <div key={index} className="member-input fadeIn">
                  <input
                    type="text"
                    className="input-conditions"
                    placeholder={`Condición ${index + 1}`}
                    value={cond}
                    onChange={(e) => {
                      const nuevas = [...condiciones];
                      nuevas[index] = e.target.value;
                      setCondiciones(nuevas);
                    }}
                    />
                  {condiciones.length > 1 && (
                    <button
                    type="button"
                    className="delete-dev-btn"
                    onClick={() => {
                      const nuevas = condiciones.filter((_, i) => i !== index);
                      setCondiciones(nuevas);
                    }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
                  </div>

         

            
              {tareaSeleccionada ? (
                <>
                  <button onClick={handleEditarTarea} className="button-edit-task">
                    Guardar cambios
                  </button>
                  <button onClick={handleEliminarTarea} className="button-delete-task">
                    Eliminar tarea
                  </button>
                </>
              ) : (
                <>
                <button  type="button" onClick={() => setCondiciones([...condiciones, ""])} className='button-condition-add'>
                <span className='title-user-add'>+</span>
                </button>

                <button onClick={handleCrearTareaFinal} className="button-create-task">
                  Crear tarea
                </button>
                
                
                </>
         
              )}
              <button onClick={handleCerrarForm} className="button-close-task">
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
