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

// ---- CREAR TAREA ----
export async function apiCrearTarea(body) {
  const r = await fetch(`${API}/tareas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw await r.json();
  return r.json();
}

// ---- LISTAR TAREAS ----
export async function apiListarTareas(idUsuario) {
  const r = await fetch(`${API}/tareas/${idUsuario}`);
  if (!r.ok) throw await r.json();
  return r.json();
}
