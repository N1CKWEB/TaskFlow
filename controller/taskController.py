from flask import Blueprint, request, jsonify
from models.taskModel import crear_tarea, obtener_tareas

task_bp = Blueprint('task_bp', __name__)

@task_bp.route('/tareas', methods=['POST'])
def nueva_tarea():
    data = request.get_json()
    
    # Verificamos que todos los campos necesarios estén presentes
    if not all(key in data for key in ['nombre', 'descripcion', 'prioridad', 'tiempo_estimado', 'id_usuario']):
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    # Llamamos a la función del modelo pasando todos los datos necesarios
    crear_tarea(
        data['nombre'],
        data['descripcion'],
        data['prioridad'],
        data['tiempo_estimado'],
        data['id_usuario']
    )

    return jsonify({"mensaje": "Tarea agregada"})

@task_bp.route('/tareas/<int:id_usuario>', methods=['GET'])
def listar_tareas(id_usuario):
    tareas = obtener_tareas(id_usuario)
    return jsonify(tareas)
