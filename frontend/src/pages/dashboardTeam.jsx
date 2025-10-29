import '../../src/styles/dashboardTeam.css';
import React, { useState, useEffect } from 'react';
import { AiOutlineTeam } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";
import { RiLogoutBoxRLine } from "react-icons/ri";
import userImg from '../assets/img/img-logo-perfil-user-new.png';
import { Link, useNavigate } from 'react-router-dom';
import { GoProjectSymlink } from 'react-icons/go';
import { IoCaretBackCircleOutline } from "react-icons/io5";
import { IoIosAddCircle } from "react-icons/io";
import { FaCalendarAlt } from "react-icons/fa";

export function DashboardTeam() {
  const navigate = useNavigate();

  // 🔐 Obtener datos del usuario logueado
  const [usuario, setUsuario] = useState({
    id: null,
    nombre: "",
    rol_id: null,
    rol_codigo: ""
  });

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

  // 🕓 Control de horas reales trabajadas
  const [horaInicio, setHoraInicio] = useState(null);
  const [horasTrabajadas, setHorasTrabajadas] = useState(0);
  const [horaInicioEquipo, setHoraInicioEquipo] = useState(null);

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

  // ✅ Verificar si puede crear tareas (Dueño o Líder)
  const puedeCrearTareas = () => {
    return usuario.rol_id === 1 || usuario.rol_id === 2;
  };

  // ✅ Verificar si puede editar/eliminar tareas
  const puedeEditarTareas = () => {
    return usuario.rol_id === 1 || usuario.rol_id === 2;
  };

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

  // 🟢 Inicia conteo cuando el usuario está logueado
  useEffect(() => {
    if (usuario.id && !horaInicioEquipo) {
      setHoraInicioEquipo(Date.now());
    }

    return () => {
      if (horaInicioEquipo) {
        const fin = Date.now();
        const horasTotales = (fin - horaInicioEquipo) / (1000 * 60 * 60);
        setHorasTrabajadas((prev) => prev + horasTotales);
        setHoraInicioEquipo(null);
      }
    };
  }, [usuario.id]);

  // 🔄 Actualización en tiempo real
  useEffect(() => {
    let interval;
    if (horaInicioEquipo) {
      interval = setInterval(() => {
        const ahora = Date.now();
        const horasActuales = (ahora - horaInicioEquipo) / (1000 * 60 * 60);
        setHorasTrabajadas(horasActuales);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [horaInicioEquipo]);

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
    if (!puedeCrearTareas()) {
      alert("No tienes permisos para crear tareas");
      return;
    }

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
      setCondiciones(
        Array.isArray(tareaSeleccionada.condiciones)
          ? tareaSeleccionada.condiciones
          : tareaSeleccionada.condiciones.split(',').map((c) => c.trim())
      );

      setHoraInicio(Date.now());
    }

    return () => {
      if (horaInicio) {
        const fin = Date.now();
        const horasTotales = (fin - horaInicio) / (1000 * 60 * 60);
        setHorasTrabajadas((prev) => prev + horasTotales);
        setHoraInicio(null);
      }
    };
  }, [tareaSeleccionada]);

  // 🕑 Actualizar contador visible en tiempo real
  useEffect(() => {
    let interval;
    if (horaInicio) {
      interval = setInterval(() => {
        const ahora = Date.now();
        const horasActuales = (ahora - horaInicio) / (1000 * 60 * 60);
        setHorasTrabajadas(horasActuales);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [horaInicio]);

  // === Editar tarea existente ===
  const handleEditarTarea = () => {
    if (!puedeEditarTareas()) {
      alert("No tienes permisos para editar tareas");
      return;
    }

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
    if (!puedeEditarTareas()) {
      alert("No tienes permisos para eliminar tareas");
      return;
    }

    setTareas(tareas.filter((t) => t.id !== tareaSeleccionada.id));
    handleCerrarForm();
  };

  // === Cerrar y limpiar formulario ===
  const handleCerrarForm = () => {
    if (horaInicio) {
      const fin = Date.now();
      const horasTotales = (fin - horaInicio) / (1000 * 60 * 60);
      setHorasTrabajadas((prev) => prev + horasTotales);
      setHoraInicio(null);
    }

    setShowForm(false);
    setTareaSeleccionada(null);
    setNombre("");
    setDescripcion("");
    setPrioridad("");
    setFechaEntrega("");
    setHoras("");
    setCondiciones([""]);
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
      
      {/* ✅ Solo mostrar botón si tiene permisos */}
      {allowCreate && puedeCrearTareas() && (
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
            draggable={puedeEditarTareas()}
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
          <Link to="/settings" className="menu-link">
            Ajustes
            <IoSettings className="icons" />
          </Link>
        </nav>

        <div className="user-box">
          <button className="logout-button" onClick={handleLogout}>
            <RiLogoutBoxRLine className="icon-logout" />
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

        {/* ⚠️ Mensaje para desarrolladores */}
        {!puedeCrearTareas() && (
          <div style={{ 
            padding: '15px', 
            margin: '10px 0',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            color: '#ffaa00',
            textAlign: 'center'
          }}>
            <p>⚠️ Solo puedes visualizar las tareas asignadas a ti.</p>
            <p style={{ fontSize: '14px', marginTop: '5px', color: '#888' }}>
              No tienes permisos para crear o editar tareas.
            </p>
          </div>
        )}

        <div className="container-template">
          {renderColumn("To Do", "To-Do", true)}
          {renderColumn("In Progress", "In Progress")}
          {renderColumn("Done", "Done")}

          <div className="members-template">
            <h2 className="title-principal-membrers">Miembros del equipo</h2>
            <img src={userImg} className="user-avatar--members" alt="Avatar" />
            <h2 className="title-name-user-avatar">{usuario.nombre}</h2>
            <h3 className="rol-name-user-avatar">{obtenerNombreRol()}</h3>
          </div>
        </div>

        {/* === FORMULARIO === */}
        {showForm && (
          <div className="overlay">
            <div className="card-create-task">
              <h2 className="title-create-task">
                {tareaSeleccionada ? "Ver tarea" : "Crear nueva tarea"}
              </h2>

              <input
                type="text"
                className="input-task"
                placeholder="Nombre de la tarea"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={tareaSeleccionada && !puedeEditarTareas()}
              />

              <textarea
                className="textarea-task"
                placeholder="Descripción de la tarea"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={tareaSeleccionada && !puedeEditarTareas()}
              />

              <select
                className="select-priority"
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                disabled={tareaSeleccionada && !puedeEditarTareas()}
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
                disabled={tareaSeleccionada && !puedeEditarTareas()}
              />

              <input
                type="number"
                className="input-hours"
                placeholder="Horas programadas"
                value={horas}
                min={1}
                step={1}
                onChange={(e) => {
                  const valor = parseInt(e.target.value, 10);
                  if (isNaN(valor) || valor < 1) {
                    setHoras(1);
                  } else {
                    setHoras(valor);
                  }
                }}
                onBlur={() => {
                  if (horas < 1) setHoras(1);
                }}
                disabled={tareaSeleccionada && !puedeEditarTareas()}
                required
              />

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
                      disabled={tareaSeleccionada && !puedeEditarTareas()}
                    />
                    {condiciones.length > 1 && puedeEditarTareas() && (
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

              <div className="horas-reales-container">
                <p style={{ color: "#e5e5e5", marginBottom: "8px" }}>
                  ⏱️ Horas programadas: <strong>{horas || 0}</strong> h
                </p>
                <p style={{ color: "#00ff88" }}>
                  🔄 Horas en tiempo real: <strong>{horasTrabajadas.toFixed(2)}</strong> h
                </p>
              </div>

              {tareaSeleccionada ? (
                <>
                  {/* ✅ Solo mostrar botones si tiene permisos */}
                  {puedeEditarTareas() ? (
                    <>
                      <button onClick={handleEditarTarea} className="button-edit-task">
                        Guardar cambios
                      </button>
                      <button onClick={handleEliminarTarea} className="button-delete-task">
                        Eliminar tarea
                      </button>
                    </>
                  ) : (
                    <p style={{ color: '#888', textAlign: 'center', marginTop: '10px' }}>
                      Solo puedes visualizar esta tarea
                    </p>
                  )}
                </>
              ) : (
                <>
                  {puedeCrearTareas() && (
                    <>
                      <button onClick={() => setCondiciones([...condiciones, ""])} className="button-add-condition-task">
                        <span className="title-user-add">+ Agregar otra condición</span>
                      </button>

                      <button onClick={handleCrearTareaFinal} className="button-create-task">
                        Crear tarea
                      </button>
                    </>
                  )}
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