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
import { IoIosAddCircle } from "react-icons/io";
import { FaCalendarAlt } from "react-icons/fa";

export function DashboardTeam() {
  const [showForm, setShowForm] = useState(false);
  const [tareas, setTareas] = useState([]);

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [horas, setHoras] = useState("");
  const [condiciones, setCondiciones] = useState("");

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

  // Crear nueva tarea (solo en To-Do)
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
      status: "To-Do", // 👈 Siempre arranca en To-Do
    };

    setTareas([...tareas, nuevaTarea]);
    setShowForm(false);

    // Limpiar inputs
    setNombre("");
    setDescripcion("");
    setPrioridad("");
    setFechaEntrega("");
    setHoras("");
    setCondiciones("");
  };

  // === Drag & Drop ===
  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("taskId", id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

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
          {/* === Columnas === */}
          {renderColumn("To Do", "To-Do", true)}
          {renderColumn("In Progress", "In Progress")}
          {renderColumn("Done", "Done")}

          {/* === Miembros === */}
          <div className="members-template">
            <h2 className="title-principal-membrers">Miembros del equipo</h2>
            <img src={userImg} className="user-avatar--members" />
            <h2 className="title-name-user-avatar">Nicolás Díaz</h2>
            <h3 className="rol-name-user-avatar">Líder</h3>
          </div>
        </div>

        {/* === FORMULARIO DE CREAR TAREA === */}
        {showForm && (
          <div className="overlay">
            <div className="card-create-task">
              <h2 className="title-create-task">Crear nueva tarea</h2>

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
              ></textarea>

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

              <input
                type="text"
                className="input-conditions"
                placeholder="Condiciones de aceptación"
                value={condiciones}
                onChange={(e) => setCondiciones(e.target.value)}
              />

              <button
                onClick={handleCrearTareaFinal}
                className="button-create-task"
              >
                Crear tarea
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="button-close-task"
              >
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
