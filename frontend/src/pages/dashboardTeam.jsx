import '../../src/styles/dashboardTeam.css';
import '../../src/styles/Home.css';
import React, { useState, useEffect } from 'react';
import { AiOutlineTeam } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";
import { RiLogoutBoxRLine } from "react-icons/ri";
import userImg from '../assets/img/img-logo-perfil-user-new.png';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { GoProjectSymlink } from 'react-icons/go';
import { IoCaretBackCircleOutline } from "react-icons/io5";
import { IoIosAddCircle } from "react-icons/io";
import { FaCalendarAlt } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { 
  apiObtenerProyecto, 
  apiCrearTarea, 
  apiListarTareas, 
  apiActualizarTarea, 
  apiEliminarTarea 
} from '../api/api';

export function DashboardTeam() {
  const navigate = useNavigate();
  const { idProyecto } = useParams(); // Obtener ID del proyecto desde la URL

  // 🔐 Obtener datos del usuario logueado
  const [usuario, setUsuario] = useState({
    id: null,
    nombre: "",
    rol_id: null,
    rol_codigo: ""
  });

  // 📊 Estado del proyecto actual
  const [proyectoActual, setProyectoActual] = useState(null);
  const [miembrosEquipo, setMiembrosEquipo] = useState([]);
  const [cargandoProyecto, setCargandoProyecto] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [sidebarAbierta, setSidebarAbierta] = useState(false);
  
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

  // 📥 Cargar proyecto actual desde el backend
  useEffect(() => {
    if (idProyecto) {
      cargarProyecto(idProyecto);
      cargarTareas(idProyecto);
    } else {
      // Si no hay ID en la URL, intentar cargar desde localStorage
      const proyectoGuardado = localStorage.getItem("proyecto_actual");
      if (proyectoGuardado) {
        const proyecto = JSON.parse(proyectoGuardado);
        setProyectoActual(proyecto);
        cargarProyecto(proyecto.id);
        cargarTareas(proyecto.id);
      }
    }
  }, [idProyecto]);

  // 📥 Cargar datos del proyecto desde el backend
  const cargarProyecto = async (id) => {
    try {
      setCargandoProyecto(true);
      const proyecto = await apiObtenerProyecto(id);
      
      setProyectoActual({
        id: proyecto.id_proyecto,
        nombre: proyecto.titulo,
        descripcion: proyecto.descripcion,
        creador: proyecto.creador
      });

      setMiembrosEquipo(proyecto.miembros || []);
      
    } catch (error) {
      console.error("Error al cargar proyecto:", error);
      alert("Error al cargar el proyecto");
    } finally {
      setCargandoProyecto(false);
    }
  };

  // 📥 Cargar tareas del proyecto desde el backend
  const cargarTareas = async (id) => {
    try {
      const response = await apiListarTareas(id);
      setTareas(response.tareas || []);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

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
    localStorage.removeItem("proyecto_actual");
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
  const handleCrearTareaFinal = async () => {
    if (!puedeCrearTareas()) {
      alert("No tienes permisos para crear tareas");
      return;
    }

    if (!nombre || !prioridad || !fechaEntrega) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    if (!proyectoActual) {
      alert("No hay proyecto seleccionado");
      return;
    }

    try {
      const datosTarea = {
        id_proyecto: proyectoActual.id,
        titulo: nombre,
        descripcion: descripcion,
        prioridad: prioridad,
        fecha_limite: fechaEntrega,
        horas_estimadas: parseInt(horas) || 0,
        condiciones_aceptacion: condiciones.filter(c => c.trim() !== "").join(", "),
        estado: "To-Do"
      };

      const response = await apiCrearTarea(datosTarea);

      const nuevaTarea = {
        id: response.id_tarea,
        nombre: nombre,
        descripcion: descripcion,
        prioridad: prioridad,
        fechaEntrega: fechaEntrega,
        horas: horas,
        condiciones: condiciones,
        status: "To-Do",
      };

      setTareas([...tareas, nuevaTarea]);
      alert("✅ Tarea creada exitosamente");
      handleCerrarForm();

    } catch (error) {
      console.error("Error al crear tarea:", error);
      alert(error?.error || "Error al crear la tarea");
    }
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
  const handleEditarTarea = async () => {
    if (!puedeEditarTareas()) {
      alert("No tienes permisos para editar tareas");
      return;
    }

    try {
      const datosActualizar = {
        titulo: nombre,
        descripcion: descripcion,
        prioridad: prioridad,
        fecha_limite: fechaEntrega,
        horas_estimadas: parseInt(horas) || 0,
        condiciones_aceptacion: condiciones.filter(c => c.trim() !== "").join(", ")
      };

      await apiActualizarTarea(tareaSeleccionada.id, datosActualizar);

      setTareas((prev) =>
        prev.map((t) =>
          t.id === tareaSeleccionada.id
            ? { ...t, nombre, descripcion, prioridad, fechaEntrega, horas, condiciones }
            : t
        )
      );

      alert("✅ Tarea actualizada exitosamente");
      handleCerrarForm();

    } catch (error) {
      console.error("Error al editar tarea:", error);
      alert(error?.error || "Error al editar la tarea");
    }
  };

  // === Eliminar tarea ===
  const handleEliminarTarea = async () => {
    if (!puedeEditarTareas()) {
      alert("No tienes permisos para eliminar tareas");
      return;
    }

    if (!("¿Estás seguro de que deseas eliminar esta tarea?")) {
      return;
    }

    try {
      await apiEliminarTarea(tareaSeleccionada.id);
      
      setTareas(tareas.filter((t) => t.id !== tareaSeleccionada.id));
      
      alert("✅ Tarea eliminada exitosamente");
      handleCerrarForm();

    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      alert(error?.error || "Error al eliminar la tarea");
    }
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

  const handleDrop = async (e, newStatus) => {
    const id = e.dataTransfer.getData("taskId");
    
    try {
      // Actualizar en el backend
      await apiActualizarTarea(id, { estado: newStatus });
      
      // Actualizar en el estado local
      setTareas((prev) =>
        prev.map((t) => (t.id == id ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      console.error("Error al actualizar estado de tarea:", error);
    }
  };

  // === Volver a proyectos ===
  const handleVolverProyectos = () => {
    localStorage.removeItem("proyecto_actual");
    navigate("/");
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

  if (cargandoProyecto) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: '#fff'
      }}>
        <p>Cargando proyecto...</p>
      </div>
    );
  }

  return (
    <div className={`layout ${sidebarAbierta ? 'sidebar-open' : ''}`}>
      {/* === SIDEBAR DESLIZANTE === */}
      <aside className={`sidebar ${sidebarAbierta ? 'open' : ''}`}>
        <h2 className="sidebar-title">TaskFlow</h2>
        <hr className='sidebar-line' />
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
    
      {/* === BOTÓN HAMBURGUESA === */}
      <button
        className="hamburger-btn"
        onClick={() => setSidebarAbierta(!sidebarAbierta)}>
        {sidebarAbierta ? <FaTimes/> : <GiHamburgerMenu/> }
      </button>

      <main className="content">
        <IoCaretBackCircleOutline 
          className="icon-project--back" 
          onClick={handleVolverProyectos}
          style={{ cursor: 'pointer' }}
        />
        <h2 className="tittle-name-project">
          {proyectoActual?.nombre || "Nombre del proyecto"}
        </h2>

        <div className="container-bar-progress">
          <div className="barr-progress" />
          <h2 className="tittle-bar--progress">Progreso</h2>
          <h2 className="tittle-complete--progress">Completado</h2>
        </div>

        <button className="button--projects" onClick={handleVolverProyectos}>
          <h2>Ver Proyectos</h2>
        </button>

        {/* ⚠️ Mensaje para desarrolladores */}
        {!puedeCrearTareas() && (
          <div style={{ 
            padding: '15px', 
            margin: '10px auto',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            color: '#ffaa00',
            textAlign: 'center',
            maxWidth: '600px'
          }}>
            <p style={{ fontSize: '16px', fontWeight: 'bold' }}>⚠️ Modo Solo Lectura</p>
            <p style={{ fontSize: '14px', marginTop: '8px', color: '#ccc' }}>
              Solo puedes visualizar las tareas asignadas a ti.
            </p>
            <p style={{ fontSize: '12px', marginTop: '5px', color: '#888' }}>
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
            {miembrosEquipo.length > 0 ? (
              miembrosEquipo.map((miembro, index) => (
                <div key={index} style={{ marginBottom: '15px' }}>
                  <img src={userImg} className="user-avatar--members" alt="Avatar" />
                  <h2 className="title-name-user-avatar">{miembro.nombre_completo}</h2>
                  <h3 className="rol-name-user-avatar">{miembro.nombre_rol}</h3>
                </div>
              ))
            ) : (
              <>
                <img src={userImg} className="user-avatar--members" alt="Avatar" />
                <h2 className="title-name-user-avatar">{usuario.nombre}</h2>
                <h3 className="rol-name-user-avatar">{obtenerNombreRol()}</h3>
              </>
            )}
          </div>
        </div>

        {/* === FORMULARIO === */}
        {showForm && (
          <div className="overlay">
            <div className="card-create-task">
              <h2 className="title-create-task">
                {tareaSeleccionada 
                  ? (puedeEditarTareas() ? "Editar tarea" : "Ver tarea")
                  : "Crear nueva tarea"
                }
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
                    <p style={{ 
                      color: '#ffaa00', 
                      textAlign: 'center', 
                      marginTop: '15px',
                      padding: '10px',
                      backgroundColor: '#2a2a2a',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}>
                      ⚠️ Solo puedes visualizar esta tarea (Modo Lectura)
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