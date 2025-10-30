// Definí la URL base del backend
const API = 'http://127.0.0.1:5000';

// ---- LOGIN ----
export async function apiLogin(email, contraseña) {
  const r = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, contraseña })
  });
  if (!r.ok) throw await r.json();
  return r.json();
}

// ---- REGISTRO ----
export async function apiRegister(datos) {
  const r = await fetch(`${API}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  });
  if (!r.ok) throw await r.json();
  return r.json();
}

// ========================================
// PROYECTOS - NUEVOS ENDPOINTS
// ========================================

// ---- CREAR PROYECTO ----
export async function apiCrearProyecto(datos) {
  const token = localStorage.getItem("token");
  
  const r = await fetch(`${API}/proyectos`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });
  
  if (!r.ok) throw await r.json();
  return r.json();
}

// ---- LISTAR MIS PROYECTOS ----
export async function apiListarProyectos() {
  const token = localStorage.getItem("token");
  
  const r = await fetch(`${API}/proyectos`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!r.ok) throw await r.json();
  return r.json();
}

// ---- OBTENER DETALLES DE UN PROYECTO ----
export async function apiObtenerProyecto(idProyecto) {
  const token = localStorage.getItem("token");
  
  const r = await fetch(`${API}/proyectos/${idProyecto}`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!r.ok) throw await r.json();
  return r.json();
}

// ---- AGREGAR MIEMBRO A PROYECTO ----
export async function apiAgregarMiembro(idProyecto, datos) {
  const token = localStorage.getItem("token");
  
  const r = await fetch(`${API}/proyectos/${idProyecto}/miembros`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });
  
  if (!r.ok) throw await r.json();
  return r.json();
}

// ========================================
// TAREAS
// ========================================

// ---- CREAR TAREA ----
export async function apiCrearTarea(body) {
  const token = localStorage.getItem("token");
  
  const r = await fetch(`${API}/tareas`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  
  if (!r.ok) throw await r.json();
  return r.json();
}

// ---- LISTAR TAREAS DE UN PROYECTO ----
export async function apiListarTareas(idProyecto) {
  const token = localStorage.getItem("token");
  
  const r = await fetch(`${API}/tareas/proyecto/${idProyecto}`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!r.ok) throw await r.json();
  return r.json();
}

// ---- ACTUALIZAR TAREA ----
export async function apiActualizarTarea(idTarea, datos) {
  const token = localStorage.getItem("token");
  
  const r = await fetch(`${API}/tareas/${idTarea}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datos)
  });
  
  if (!r.ok) throw await r.json();
  return r.json();
}

// ---- ELIMINAR TAREA ----
export async function apiEliminarTarea(idTarea) {
  const token = localStorage.getItem("token");
  
  const r = await fetch(`${API}/tareas/${idTarea}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!r.ok) throw await r.json();
  return r.json();
}