document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.getElementById("task-title");
  const descInput = document.getElementById("task-desc");
  const prioridadInput = document.getElementById("select-prioridad");
  const deadlineInput = document.getElementById("task-deadline");
  const createBtn = document.getElementById("create-task");
  const filtroSelect = document.getElementById("filtro");
  const board = document.getElementById("task-board");

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalPriority = document.getElementById("modal-priority");
  const modalFechas = document.getElementById("modal-fechas");
  const editBtn = document.getElementById("edit-task");
  const deleteBtn = document.getElementById("delete-task");
  const closeModal = document.getElementById("close-modal");

  let allTasks = [];
  let selectedTask = null;

  // Establecer fecha mínima como hoy
 const today=new Date().toISOString().split("T")[0];
 deadlineInput.setAttribute("min",today);

  function crearColumna(index) {
    const col = document.createElement("div");
    col.classList.add("column");
    col.setAttribute("data-index", index);
    const title = document.createElement("h3");
    title.textContent = "Tareas " + (index * 9 + 1) + " - " + ((index + 1) * 9);
    title.classList.add("column-title");
    col.appendChild(title);
    board.appendChild(col);
    return col;
  }

  function renderTareas() {
    board.innerHTML = "";
    let columnaActual = null;
    allTasks.forEach((task, index) => {
      if (index % 9 === 0) {
        columnaActual = crearColumna(Math.floor(index / 9));
      }
      const tareaDiv = document.createElement("div");
      tareaDiv.classList.add("tarea");
      tareaDiv.textContent = `${task.titulo} (${task.prioridad})`;

      tareaDiv.addEventListener("click", () => {
        selectedTask = task;
        modalTitle.textContent = task.titulo;
        modalDesc.textContent = task.descripcion || "Sin descripción";
        modalPriority.textContent = "Prioridad: " + task.prioridad;
        modalFechas.textContent = `Inicio: ${task.fechaInicio} | Entrega: ${task.fechaEntrega}`;
        modal.style.display = "flex";
      });

      columnaActual.appendChild(tareaDiv);
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
      fechaInicio: new Date().toLocaleDateString(),
      fechaEntrega
    };

    allTasks.push(nuevaTarea);
    renderTareas();

    // Reset inputs
    titleInput.value = "";
    descInput.value = "";
    prioridadInput.selectedIndex = 0;
    deadlineInput.value = "";
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  deleteBtn.addEventListener("click", () => {
    allTasks = allTasks.filter(t => t.id !== selectedTask.id);
    modal.style.display = "none";
    renderTareas();
  });

  editBtn.addEventListener("click", () => {
    const nuevoTitulo = prompt("Editar título:", selectedTask.titulo);
    const nuevaDesc = prompt("Editar descripción:", selectedTask.descripcion);
    const nuevaFecha = prompt("Editar fecha de entrega:", selectedTask.fechaEntrega);

    if (nuevoTitulo) selectedTask.titulo = nuevoTitulo;
    if (nuevaDesc !== null) selectedTask.descripcion = nuevaDesc;
    if (nuevaFecha) selectedTask.fechaEntrega = nuevaFecha;

    renderTareas();
    modal.style.display = "none";
  });

  filtroSelect.addEventListener("change", () => {
    const criterio = filtroSelect.value;
    let tareasFiltradas = [...allTasks];

    if (criterio === "Prioridad") {
      tareasFiltradas.sort((a, b) => {
        const orden = { "Alta": 1, "Media": 2, "Baja": 3 };
        return orden[a.prioridad] - orden[b.prioridad];
      });
    } else if (criterio === "Inicio") {
      tareasFiltradas.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));
    } else if (criterio === "Entrega") {
      tareasFiltradas.sort((a, b) => new Date(a.fechaEntrega) - new Date(b.fechaEntrega));
    }

    board.innerHTML = "";
    let columnaActual = null;
    tareasFiltradas.forEach((task, index) => {
      if (index % 9 === 0) {
        columnaActual = crearColumna(Math.floor(index / 9));
      }
      const tareaDiv = document.createElement("div");
      tareaDiv.classList.add("tarea");
      tareaDiv.textContent = `${task.titulo} (${task.prioridad})`;

      tareaDiv.addEventListener("click", () => {
        selectedTask = task;
        modalTitle.textContent = task.titulo;
        modalDesc.textContent = task.descripcion || "Sin descripción";
        modalPriority.textContent = "Prioridad: " + task.prioridad;
        modalFechas.textContent = `Inicio: ${task.fechaInicio} | Entrega: ${task.fechaEntrega}`;
        modal.style.display = "flex";
      });

      columnaActual.appendChild(tareaDiv);
    });
  });
});
