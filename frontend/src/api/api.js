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

export async function apiRefresh() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw { error: "No hay refresh token guardado" };

  const r = await fetch(`${API}/refresh`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${refreshToken}`
    }
  });

  if (!r.ok) throw await r.json();

  const data = await r.json();

  // Guardar el nuevo access token
  localStorage.setItem("token", data.access_token);

  return data.access_token;
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
async function fetchWithAuth(url, options = {}) {
  let token = localStorage.getItem("token");

  options.headers = {
    ...(options.headers || {}),
    "Authorization": `Bearer ${token}`
  };

  let r = await fetch(url, options);

  // Si expiró el token → refrescamos
  if (r.status === 401) {
    const newToken = await apiRefresh();

    // Reintentar la petición
    options.headers["Authorization"] = `Bearer ${newToken}`;
    r = await fetch(url, options);
  }

  if (!r.ok) throw await r.json();
  
  return r.json();
}


export async function apiListarProyectos() {
  return fetchWithAuth(`${API}/proyectos`, { method: "GET" });
}


export async function apiBuscarProyectos(search) {
  const token = localStorage.getItem("token");

  const r = await fetch(`${API}/proyectos?search=${encodeURIComponent(search)}`, {
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
  
  // ✅ Obtener el ID del proyecto
  const proyectoActual = JSON.parse(localStorage.getItem("proyecto_actual") || "{}");
  const projectId = body.id_proyecto || proyectoActual.id;
  
  if (!projectId) {
    throw { error: "No hay proyecto seleccionado" };
  }
  
  // ✅ URL correcta con el project_id
  const r = await fetch(`${API}/proyectos/${projectId}/tareas`, {
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

// Listar tareas de un proyecto específico
export const apiListarTareas = async (idProyecto) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API}/proyectos/${idProyecto}/tareas`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return await response.json();
};


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

export async function apiObtenerMiembrosProyecto(idProyecto) {
  return API.get(`/proyectos/${idProyecto}/miembros`)
    .then(res => res.data)
    .catch(err => { throw err });
}


