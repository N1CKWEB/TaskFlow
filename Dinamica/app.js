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
  const editBtn = document.getElementById("edit-task");
  const deleteBtn = document.getElementById("delete-task");
  const closeModal = document.getElementById("close-modal");

  const togglePanel = document.getElementById("toggle-panel");
  const formPanel = document.getElementById("form-panel");

  const bordeToggle = document.getElementById("borde-toggle");
  const abrirPanelBtn = document.getElementById("abrir-panel");

  let allTasks = JSON.parse(localStorage.getItem("taskflow_tasks")) || [];
  let selectedTask = null;

  const today = new Date().toISOString().split("T")[0];
  deadlineInput.setAttribute("min", today);

  // Cerrar panel y mostrar borde
  togglePanel.addEventListener("click", () => {
    formPanel.classList.remove("show");
    bordeToggle.classList.add("show");
  });

  // Abrir panel al hacer clic en el borde izquierdo
  abrirPanelBtn.addEventListener("click", () => {
    formPanel.classList.add("show");
    bordeToggle.classList.remove("show");
  });

  function showAlerta() {
    alerta.style.display = "block";
    setTimeout(() => alerta.style.display = "none", 2000);
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
        modalTitle.textContent = task.titulo;
        modalDesc.textContent = task.descripcion || "Sin descripción";
        modalPriority.textContent = "Prioridad: " + task.prioridad;
        modalFechas.textContent = `Inicio: ${task.fechaInicio} | Entrega: ${task.fechaEntrega}`;
        modal.style.display = "flex";
      });
      columna.appendChild(div);
    });
  }

  createBtn.addEventListener("click", () => {
    const titulo = titleInput.value.trim();
    const descripcion = descInput.value.trim();
    const prioridad = prioridadInput.value;
    const fechaEntrega = deadlineInput.value;

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
      fechaEntrega
    };

    allTasks.push(nuevaTarea);
    guardarEnLocalStorage();
    renderTareas();
    showAlerta();

    titleInput.value = "";
    descInput.value = "";
    prioridadInput.selectedIndex = 0;
    deadlineInput.value = "";

    // Responsive: cerrar panel y mostrar borde
    formPanel.classList.remove("show");
    bordeToggle.classList.add("show");
  });

  closeModal.addEventListener("click", () => modal.style.display = "none");

  deleteBtn.addEventListener("click", () => {
    allTasks = allTasks.filter(t => t.id !== selectedTask.id);
    guardarEnLocalStorage();
    renderTareas();
    modal.style.display = "none";
  });

  editBtn.addEventListener("click", () => {
    const nuevoTitulo = prompt("Editar título:", selectedTask.titulo);
    const nuevaDesc = prompt("Editar descripción:", selectedTask.descripcion);
    const nuevaFecha = prompt("Editar fecha de entrega:", selectedTask.fechaEntrega);
    if (nuevoTitulo) selectedTask.titulo = nuevoTitulo;
    if (nuevaDesc !== null) selectedTask.descripcion = nuevaDesc;
    if (nuevaFecha) selectedTask.fechaEntrega = nuevaFecha;
    guardarEnLocalStorage();
    renderTareas();
    modal.style.display = "none";
  });

  filtroSelect.addEventListener("change", () => {
    let tareasFiltradas = [...allTasks];
    if (filtroSelect.value === "Prioridad") {
      const orden = { "Alta": 1, "Media": 2, "Baja": 3 };
      tareasFiltradas.sort((a, b) => orden[a.prioridad] - orden[b.prioridad]);
    } else if (filtroSelect.value === "Inicio") {
      tareasFiltradas.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
    } else if (filtroSelect.value === "Entrega") {
      tareasFiltradas.sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega));
    }
    renderTareas(tareasFiltradas);
  });

  renderTareas();
});
