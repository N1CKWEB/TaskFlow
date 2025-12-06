import '../../src/styles/Home.css';
import React, { useState, useEffect } from 'react';
import { AiOutlineTeam } from "react-icons/ai";
import { IoSettings } from "react-icons/io5";
import { RiLogoutBoxRLine } from "react-icons/ri";
import { GoProjectSymlink } from 'react-icons/go';
import { FaTimes } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import userImg from '../assets/img/img-logo-perfil-user-new.png';
import { RiUserStarFill } from "react-icons/ri";
import { GrUserManager } from "react-icons/gr";
import { LiaUserPlusSolid } from "react-icons/lia";
import { TbUserCode } from "react-icons/tb";
import { Link, useNavigate } from 'react-router-dom';
import { apiCrearProyecto, apiListarProyectos,apiBuscarProyectos } from '../api/api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
export function Home() {
  const navigate = useNavigate();

  const [search,setSearch] = useState("");

  // 🔐 Estados del usuario
  const [usuario, setUsuario] = useState({
    id: null,
    nombre: "",
    rol_id: null,
    rol_codigo: ""
  });

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [animando, setAnimando] = useState(false);
  const [sidebarAbierta, setSidebarAbierta] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [nuevoProyecto, setNuevoProyecto] = useState("");
  const [nombreDueno, setNombreDueno] = useState("");
  const [nombreLider, setNombreLider] = useState("");
  const [desarrolladores, setDesarrolladores] = useState([""]);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [mensajeLogout, setMensajeLogout] = useState("");
  const [cargando, setCargando] = useState(false);
  const[mostrarAlertaProyectoCreado,setMostrarAlertaProyectoCreado] = useState(false);

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [openError, setOpenError] = React.useState(false);
    const handleOpenError = () => setOpenError(true);
    const handleCloseError = () => setOpenError(false);
  
  // 🔄 Cargar datos del usuario al montar
  useEffect(() => {
    const usuarioData = {
      id: localStorage.getItem("usuario_id"),
      nombre: localStorage.getItem("nombre_usuario") || "Usuario",
      rol_id: parseInt(localStorage.getItem("rol_id")),
      rol_codigo: localStorage.getItem("rol_codigo") || ""
    };
    setUsuario(usuarioData);

    // Cargar proyectos del backend
    cargarProyectos();
  }, []);

  // 📥 Cargar proyectos desde el backend
  const cargarProyectos = async () => {
    try {
      setCargando(true);
      const response = await apiListarProyectos();
      
      // Transformar datos del backend al formato del frontend
      const proyectosFormateados = response.proyectos.map(p => ({
        id: p.id_proyecto,
        nombre: p.titulo,
        siglas: p.titulo
          .split(" ")
          .map(palabra => palabra[0].toUpperCase())
          .join("")
          .slice(0, 3),
        color: obtenerColorAleatorio(),
        descripcion: p.descripcion
      }));
      
      setProyectos(proyectosFormateados);
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
    } finally {
      setCargando(false);
    }
  };

  // 🎨 Obtener color aleatorio para proyecto
  const obtenerColorAleatorio = () => {
    const colores = ["#F4A261", "#2A9D8F", "#E76F51", "#264653", "#A7C957", "#3A86FF"];
    return colores[Math.floor(Math.random() * colores.length)];
  };

  // ✅ Verificar si puede crear proyectos (Dueño o Líder)
  const puedeCrearProyectos = () => {
    return usuario.rol_id === 1 || usuario.rol_id === 2;
  };

  // 📋 Obtener nombre del rol
  const obtenerNombreRol = () => {
    switch(usuario.rol_id) {
      case 1: return "Dueño del Proyecto";
      case 2: return "Líder de Proyecto";
      case 3: return "Desarrollador";
      default: return "Usuario";
    }
  };

  // 🚪 Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("usuario_id");
    localStorage.removeItem("nombre_usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("rol_id");
    localStorage.removeItem("rol_codigo");

    setMensajeLogout("Sesión cerrada");

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  const handleCrearProyecto = () => {
    if (!puedeCrearProyectos()) {
      alert("No tienes permisos para crear proyectos");
      return;
    }
    setMostrarFormulario(true);
    setAnimando("opening");
  };

  const handleCerrarFormulario = () => {
    setAnimando("closing");
    setTimeout(() => {
      setMostrarFormulario(false);
      // Limpiar formulario
      setNuevoProyecto("");
      setNombreDueno("");
      setNombreLider("");
      setDesarrolladores([""]);
    }, 500);
  };

  const handleAgregarDesarrollador = () => {
    setDesarrolladores([...desarrolladores, ""]);
  };

  const manejarCambio = (index, value) => {
    const nuevos = [...desarrolladores];
    nuevos[index] = value;
    setDesarrolladores(nuevos);
  };

  const eliminarDesarrollador = (index) => {
    const nuevos = [...desarrolladores];
    nuevos.splice(index, 1);
    setDesarrolladores(nuevos);
  };

  //  Crear proyecto y enviarlo al backend
  const handleCrearProyectoFinal = async () => {
    if (nuevoProyecto.trim() === "") {
      handleOpenError();
      return;
    }    
    try {
      setCargando(true);

      // Datos a enviar al backend
      const datosProyecto = {
        titulo: nuevoProyecto,
        nombre_dueno: nombreDueno,
        nombre_lider_tecnico: nombreLider,
        desarrolladores: desarrolladores.filter(dev => dev.trim() !== "")
      };

      // Enviar al backend
      const response = await apiCrearProyecto(datosProyecto);

      // Agregar el nuevo proyecto a la lista
      const nuevoProyectoObj = {
        id: response.id_proyecto,
        nombre: response.titulo,
        siglas: response.titulo
          .split(" ")
          .map(p => p[0].toUpperCase())
          .join("")
          .slice(0, 3),
        color: obtenerColorAleatorio(),
        nombre_dueno: response.nombre_dueno,
        nombre_lider_tecnico: response.nombre_lider_tecnico,
        desarrolladores: response.desarrolladores
      };

      setProyectos([...proyectos, nuevoProyectoObj]);
    
      setMostrarAlertaProyectoCreado(true);
    
      handleCerrarFormulario();
      handleOpen();          
      


    } catch (error) {
      console.error("Error al crear proyecto:", error);
      alert(error?.error || "Error al crear el proyecto");
    } finally {
      setCargando(false);
    }
  };

  // 🖱️ Hacer clic en un proyecto para ir al dashboard de ese proyecto

    const handleClickProyecto = (proyecto) => {
  localStorage.setItem("proyecto_actual", JSON.stringify(proyecto));
  navigate(`/dashboardTeam/${proyecto.id}`);

};


  const proyectosVisibles = mostrarTodos ? proyectos : proyectos.slice(0, 5);

  useEffect(() => {
  const buscar = async () => {
    try {
      if (!search.trim()) {
        const data = await apiListarProyectos();
        
        const proyectosFormateados = data.proyectos.map(p => ({
          id: p.id_proyecto,
          nombre: p.titulo,
          descripcion: p.descripcion,
          siglas: p.titulo
            .split(" ")
            .map(x => x[0].toUpperCase())
            .join("")
            .slice(0, 3),
          color: obtenerColorAleatorio()
        }));

        setProyectos(proyectosFormateados);
        return;
      }

      const data = await apiBuscarProyectos(search);

      const proyectosFormateados = data.proyectos.map(p => ({
        id: p.id_proyecto,
        nombre: p.titulo,
        descripcion: p.descripcion,
        siglas: p.titulo
          .split(" ")
          .map(x => x[0].toUpperCase())
          .join("")
          .slice(0, 3),
        color: obtenerColorAleatorio()
      }));

      setProyectos(proyectosFormateados);

    } catch (e) {
      console.error("Error:", e);
    }
  };

  const t = setTimeout(buscar, 300);
  return () => clearTimeout(t);
}, [search]);
 

  return (


    <div className={`layout ${sidebarAbierta ? 'sidebar-open' : ''}`}>
      {/* === SIDEBAR === */}
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
            <RiLogoutBoxRLine className='icon-logout' />
            <span>Cerrar Sesión</span>
          </button>
          {mensajeLogout && (
            <div className="toast-logout">{mensajeLogout}</div>
          )}
          <div className="user-info">
            <img src={userImg} className="user-avatar" alt="Usuario" />
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
        {sidebarAbierta ? <FaTimes /> : <GiHamburgerMenu />}
      </button>

      {/* === CONTENIDO PRINCIPAL === */}
      <main className="content">
        <h1 className="title">Hola {usuario.nombre}</h1>
        <p className="subtitle">¡Bienvenido de nuevo al espacio de trabajo, te extrañamos!</p>
 
        <input
          type="text"
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar proyecto...."
        />

        <h3 className='title-actions'>Proyectos</h3>

        {cargando ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Cargando proyectos...</p>
        ) : (
          <div className="project-grid">
            {proyectosVisibles.map(proyecto => (
              <div
                key={proyecto.id}
                className="project-card"
                style={{ backgroundColor: proyecto.color, cursor: 'pointer' }}
                onClick={() => handleClickProyecto(proyecto)}
              >
                <div className="project-initials">{proyecto.siglas}</div>
                <p className="project-name">{proyecto.nombre}</p>
              </div>
            ))}

            {proyectos.length > 5 && (
              <div
                className="project-card ver-mas"
                onClick={() => setMostrarTodos(!mostrarTodos)}
              >
                <p className="project-name">
                  {mostrarTodos ? "Ver menos proyectos..." : "Ver más proyectos..."}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="actions">
          {!mostrarFormulario && (
            <>
              {/* ✅ Solo Dueño y Líder pueden crear proyectos */}
              {puedeCrearProyectos() ? (
                <>
                  <button onClick={handleCrearProyecto} className="new-btn">
                    + Nuevo Proyecto
                  </button>
                  
                </>
              ) : (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#888',
                  fontStyle: 'italic',
                  backgroundColor: '#2a2a2a',
                  borderRadius: '8px',
                  marginTop: '10px'
                }}>
                  <p>⚠️ No tienes permisos para crear proyectos.</p>
                  <p style={{ fontSize: '14px', marginTop: '8px' }}>
                    Solo los Dueños y Líderes pueden crear proyectos.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ✅ Solo mostrar formulario si tiene permisos */}
        {mostrarFormulario && puedeCrearProyectos() && (
          <div className='overlay'>

          <div className={`card-new-project ${animando}`}>
            <h2 className='title-new-project'>Título del Proyecto</h2>
            <input
              type="text"
              className="search-input-project"
              placeholder="Introduce el nombre del proyecto"
              value={nuevoProyecto}
              onChange={(e) => setNuevoProyecto(e.target.value)}
            />

            <h2 className='title-team'>Miembros del equipo</h2>

            <div className="member-input">
              <RiUserStarFill className='icon-users' />
              <input
                type="text"
                className="search-input-members"
                placeholder="Introduce el nombre del dueño del proyecto"
                value={nombreDueno}
                onChange={(e) => setNombreDueno(e.target.value)}
                />
            </div>

            <div className="member-input">
              <GrUserManager className='icon-users' />
              <input
                type="text"
                className="search-input-members"
                placeholder="Introduce el nombre del líder técnico"
                value={nombreLider}
                onChange={(e) => setNombreLider(e.target.value)}
                />
            </div>

            {desarrolladores.map((dev, index) => (
              <div key={index} className="member-input fadeIn">
                <TbUserCode className='icon-users' />
                <input
                  type="text"
                  className="search-input-members"
                  placeholder={`Desarrollador ${index + 1}`}
                  value={dev}
                  onChange={(e) => manejarCambio(index, e.target.value)}
                  />
                {desarrolladores.length > 1 && (
                  <button
                  type="button"
                  className="delete-dev-btn"
                  onClick={() => eliminarDesarrollador(index)}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}
            
            <button onClick={handleAgregarDesarrollador} className='button-user-add'>
              <LiaUserPlusSolid className='icon-users' />
              <span className='title-user-add'>Agregar otro desarrollador</span>
            </button>
           

          
            <div className="buttons-create-close">
              
              <button onClick={handleCrearProyectoFinal}  className='button-create-project' disabled={cargando}>
              
                <span className='title-user-add'>
                  {cargando ? "Creando..." : "Crear Proyecto"} 
                </span>

              </button>

              <button onClick={handleCerrarFormulario} className='button-close-project'>
                <span className='title-user-add'>Cerrar</span>
              </button>

            </div>
            </div>
          </div>
        )}
            <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            
           >
       <Box 
            sx={{
              p: 4,
              width: 360,
              bgcolor: "white",
              borderRadius: "20px",
              boxShadow: "0px 20px 40px rgba(0,0,0,0.1)",
              textAlign: "center",
              justifyContent:'center',
              margin:'0 auto 15px',
              backdropFilter: "blur(6px)",
              animation: "fadeIn 0.3s ease-out",
              position:'relative',
              top:200
            }}
      >
        <div
          style={{
            width: 70,
            height: 70,
            margin: "0 auto 15px",
            background: "#e7f5ff",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 35,
            color: "#1e80ff",
            fontWeight: "bold",
          }}
          >
          ✓
        </div>

        <Typography variant="h6" sx={{ fontWeight: "600", mb: 1 }}>
          Proyecto creado
        </Typography>

        <Typography sx={{ mb: 3, fontSize: "15px", color: "#555" }}>
          Todo salió bien. Ya podés continuar.
        </Typography>

        <button
            
            onClick={handleClose}
            style={{
              padding: "10px 0",
              background: "#1e80ff",
              color: "white",
              width: "100%",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
            }}
            >
          Aceptar
        </button>
      </Box>
    </Modal>
     {/* Modal para campos incompletos de crear proyecto */}
    <Modal
            
            open={openError}
            onClose={handleCloseError}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            
           >
       <Box 
            sx={{
              p: 4,
              width: 360,
              bgcolor: "white",
              borderRadius: "20px",
              boxShadow: "0px 20px 40px rgba(0,0,0,0.1)",
              textAlign: "center",
              justifyContent:'center',
              margin:'0 auto 15px',
              backdropFilter: "blur(6px)",
              animation: "fadeIn 0.3s ease-out",
              position:'relative',
              top:200
            }}
      >
        <div
          style={{
            width: 70,
            height: 70,
            margin: "0 auto 15px",
            background: "#e7f5ff",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 35,
            color: "#1e80ff",
            fontWeight: "bold",
          }}
          >
          ❌
        </div>

        <Typography variant="h6" sx={{ fontWeight: "920", mb: 1,color:'red' }}>
        Campo requerido nombre del proyecto
       </Typography>

        <Typography sx={{ mb: 3, fontSize: "15px", color: "#555" }}>
        Por favor ingresa un nombre para el proyecto para poder continuar
         </Typography>

        <button
            
            onClick={handleCloseError}
            style={{
              padding: "10px 0",
              background: "#1e80ff",
              color: "white",
              width: "100%",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
            }}
            >
          Aceptar
        </button>
      </Box>
    </Modal>
      </main>
              
    </div>
  );
}

export default Home;