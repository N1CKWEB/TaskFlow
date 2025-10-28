import { useState, useEffect } from 'react';

function GestorTareas() {
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'Media',
    fechaEntrega: ''
  });

  const API_URL = "http://localhost:5000"; // Unificar puerto
  const today = new Date().toISOString().split("T")[0];

  // Cargar tareas al montar el componente
  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    const id_usuario = localStorage.getItem("usuario_id");
    if (!id_usuario) return;

    try {
      const response = await fetch(`${API_URL}/tareas/${id_usuario}`);
      const tareas = await response.json();

      const tareasFormateadas = tareas.map(t => ({
        id: t.id || t.id_tarea,
        titulo: t.nombre,
        descripcion: t.descripcion,
        prioridad: t.prioridad,
        fechaInicio: t.fecha_inicio || today,
        fechaEntrega: t.tiempo_estimado || today
      }));

      setAllTasks(tareasFormateadas);
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  };

  const crearTarea = async (e) => {
    e.preventDefault();
    const id_usuario = localStorage.getItem("usuario_id");

    if (!formData.titulo || !formData.prioridad || !formData.fechaEntrega) {
      alert("Completá todos los campos requeridos.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tareas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.titulo,
          descripcion: formData.descripcion || "Sin descripción",
          prioridad: formData.prioridad,
          tiempo_estimado: formData.fechaEntrega,
          id_usuario: parseInt(id_usuario)
        })
      });

      if (response.ok) {
        await cargarTareas();
        setFormData({ titulo: '', descripcion: '', prioridad: 'Media', fechaEntrega: '' });
      }
    } catch (error) {
      console.error("Error al crear tarea:", error);
    }
  };

  return (
    <div className="gestor-tareas">
      <div className="form-panel">
        <h2>Nueva Tarea</h2>
        <form onSubmit={crearTarea}>
          <input
            type="text"
            placeholder="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
          />
          <textarea
            placeholder="Descripción"
            value={formData.descripcion}
            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
          />
          <select
            value={formData.prioridad}
            onChange={(e) => setFormData({...formData, prioridad: e.target.value})}
          >
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
          <input
            type="date"
            min={today}
            value={formData.fechaEntrega}
            onChange={(e) => setFormData({...formData, fechaEntrega: e.target.value})}
          />
          <button type="submit">Crear Tarea</button>
        </form>
      </div>

      <div className="task-board">
        {allTasks.map(task => (
          <div key={task.id} className="tarea" onClick={() => {
            setSelectedTask(task);
            setShowModal(true);
          }}>
            <h3>{task.titulo}</h3>
            <p>{task.prioridad}</p>
          </div>
        ))}
      </div>

      {/* Modal aquí */}
    </div>
  );
}

export default GestorTareas;