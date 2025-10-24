document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");
  const prioridadInput = document.getElementById("select-prioridad");
  const deadlineInput = document.getElementById("task-deadline");
  const createBtn = document.getElementById("create-task");
  const filtroSelect = document.getElementById("filtro");
  const board = document.getElementById("task-board");
  const alerta = document.getElementById("alerta-exito");

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalPriority = document.getElementById("modal-priority");
  const modalFechas = document.getElementById("modal-fechas");
  const modalDeadline = document.getElementById("modal-deadline");
  const saveBtn = document.getElementById("save-task");
  const editBtn = document.getElementById("edit-task");
  const deleteBtn = document.getElementById("delete-task");
  const closeModal = document.getElementById("close-modal");

  const togglePanel = document.getElementById("toggle-panel");
  const formPanel = document.getElementById("form-panel");
  const bordeToggle = document.getElementById("borde-toggle");
  const abrirPanelBtn = document.getElementById("abrir-panel");

  let allTasks = [];
  let selectedTask = null;
  const today = new Date().toISOString().split("T")[0];
  deadlineInput.setAttribute("min", today);

  async function cargarTareasDesdeBD() {
    const id_usuario = localStorage.getItem("usuario_id");
    if (!id_usuario) return;

    try {
      const response = await fetch(`http://localhost:3000/tareas/${id_usuario}`);
      const tareas = await response.json();

      allTasks = tareas.map(t => ({
        id: t.id || t.id_tarea || Date.now(),
        titulo: t.nombre,
        descripcion: t.descripcion,
        prioridad: t.prioridad,
        fechaInicio: t.fecha_inicio || today,
        fechaEntrega: t.tiempo_estimado || today
      }));

      renderTareas();
    } catch (error) {
      console.error("Error al cargar tareas:", error);
    }
  }

  togglePanel.addEventListener("click", () => {
    formPanel.classList.remove("show");
    bordeToggle.classList.add("show");
  });

  abrirPanelBtn.addEventListener("click", () => {
    formPanel.classList.add("show");
    bordeToggle.classList.remove("show");
  });

  function showAlerta() {
    alerta.style.display = "block";
    setTimeout(() => (alerta.style.display = "none"), 2000);
  }

  function guardarEnLocalStorage() {
    localStorage.setItem("taskflow_tasks", JSON.stringify(allTasks));
  }

  function crearColumna(index) {
    const col = document.createElement("div");
    col.classList.add("column");
    const title = document.createElement("h3");
    title.textContent = `Tareas ${index * 9 + 1} - ${index * 9 + 9}`;
    title.classList.add("column-title");
    col.appendChild(title);
    board.appendChild(col);
    return col;
  }

  function renderTareas(tareas = allTasks) {
    board.innerHTML = "";
    let columna = null;
    tareas.forEach((task, i) => {
      if (i % 9 === 0) columna = crearColumna(Math.floor(i / 9));
      const div = document.createElement("div");
      div.classList.add("tarea");
      div.textContent = `${task.titulo} (${task.prioridad})`;
      div.addEventListener("click", () => {
        selectedTask = task;
        modalTitle.value = task.titulo;
        modalDesc.value = task.descripcion || "Sin descripción";
        modalPriority.textContent = "Prioridad: " + task.prioridad;
        modalDeadline.value = task.fechaEntrega;
        modalFechas.textContent = `Inicio: ${task.fechaInicio} | Entrega: ${task.fechaEntrega}`;
        modal.style.display = "flex";
        modalTitle.disabled = true;
        modalDesc.disabled = true;
        modalDeadline.disabled = true;
        saveBtn.style.display = "none";
        editBtn.style.display = "inline-block";
      });
      columna.appendChild(div);
    });
  }

  createBtn.addEventListener("click", async () => {
    const titulo = titleInput.value.trim();
    const descripcion = descInput.value.trim();
    const prioridad = prioridadInput.value;
    const fechaEntrega = deadlineInput.value;
    const id_usuario = localStorage.getItem("usuario_id");

    if (!titulo || !prioridad || !fechaEntrega) {
      alert("Completá todos los campos requeridos.");
      return;
    }

    const nuevaTarea = {
      id: Date.now(),
      titulo,
      descripcion,
      prioridad,
      fechaInicio: today,
      fechaEntrega,
    };

    try {
      const response = await fetch("http://localhost:5000/tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: titulo,
          descripcion: descripcion || "Sin descripción",
          prioridad: prioridad,
          tiempo_estimado: fechaEntrega,
          id_usuario: parseInt(id_usuario)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error al guardar:", data);
        alert(data.error || "Error al guardar en la base de datos.");
        return;
      }

      allTasks.push(nuevaTarea);
      guardarEnLocalStorage();
      renderTareas();
      showAlerta();

      titleInput.value = "";
      descInput.value = "";
      prioridadInput.selectedIndex = 0;
      deadlineInput.value = "";

      formPanel.classList.remove("show");
      bordeToggle.classList.add("show");

    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      alert("Error de conexión con el servidor.");
    }
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  deleteBtn.addEventListener("click", () => {
    allTasks = allTasks.filter((t) => t.id !== selectedTask.id);
    guardarEnLocalStorage();
    renderTareas();
    modal.style.display = "none";
  });

  editBtn.addEventListener("click", () => {
    modalTitle.disabled = false;
    modalDesc.disabled = false;
    modalDeadline.disabled = false;
    saveBtn.style.display = "inline-block";
    editBtn.style.display = "none";
  });

  // Actualizar tarea
  saveBtn.addEventListener("click", async () => {
    const nuevoTitulo = modalTitle.value.trim();
    const nuevaDesc = modalDesc.value.trim();
    const nuevaFecha = modalDeadline.value;
    const id_usuario = localStorage.getItem("usuario_id");

    if (!nuevoTitulo || !nuevaFecha || !selectedTask.prioridad || !id_usuario) {
      alert("Faltan datos para actualizar la tarea.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/tareas/${selectedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: nuevoTitulo,
          descripcion: nuevaDesc || "Sin descripción",
          prioridad: selectedTask.prioridad,
          tiempo_estimado: nuevaFecha,
          id_usuario: parseInt(id_usuario)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error al actualizar:", data);
        alert(data.error || "No se pudo actualizar la tarea.");
        return;
      }

      selectedTask.titulo = nuevoTitulo;
      selectedTask.descripcion = nuevaDesc;
      selectedTask.fechaEntrega = nuevaFecha;

      guardarEnLocalStorage();
      renderTareas();
      showAlerta();

      modal.style.display = "none";
      saveBtn.style.display = "none";
      editBtn.style.display = "inline-block";

      modalTitle.disabled = true;
      modalDesc.disabled = true;
      modalDeadline.disabled = true;

    } catch (error) {
      console.error("Error en PUT:", error);
      alert("Error de red al intentar actualizar la tarea.");
    }
  });

  filtroSelect.addEventListener("change", () => {
    let tareasFiltradas = [...allTasks];
    if (filtroSelect.value === "Prioridad") {
      const orden = { Alta: 1, Media: 2, Baja: 3 };
      tareasFiltradas.sort((a, b) => orden[a.prioridad] - orden[b.prioridad]);
    } else if (filtroSelect.value === "Inicio") {
      tareasFiltradas.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
    } else if (filtroSelect.value === "Entrega") {
      tareasFiltradas.sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega));
    }
    renderTareas(tareasFiltradas);
  });

  cargarTareasDesdeBD();
});
