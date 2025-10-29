# backend/controller/taskController.py
from flask import Blueprint, request, jsonify
from ..conection.conexion import get_connection
from .common import get_or_create_personal_project, user_is_leader_of_task
from ..model.taskModel import (
    crear_tarea,
    obtener_tareas_por_usuario,
    obtener_tareas_por_proyecto,
    obtener_tarea_por_id,
    obtener_tareas_por_estado,
    obtener_tareas_por_prioridad,
    actualizar_tarea,
    actualizar_estado_tarea,
    eliminar_tarea,
    crear_condicion_aceptacion,
    obtener_condiciones_tarea,
    reemplazar_condiciones_tarea,
    obtener_estadisticas_proyecto,
    validar_estado,
    validar_prioridad,
    obtener_proyecto_de_tarea
)

task_bp = Blueprint('task_bp', __name__)

# ================== FUNCIONES AUXILIARES ==================

def get_user_role_in_project(id_usuario: int, id_proyecto: int):
    """
    Retorna el rol del usuario en el proyecto ('LIDER', 'MIEMBRO', 'DUENO') o None
    """
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT r.codigo 
            FROM proyecto_miembros pm
            JOIN roles r ON pm.id_rol = r.id_rol
            WHERE pm.id_proyecto = %s AND pm.id_usuario = %s
        """, (id_proyecto, id_usuario))
        result = cur.fetchone()
        return result['codigo'] if result else None
    finally:
        cur.close()
        conn.close()


def user_can_modify_task(id_usuario: int, id_tarea: int):
    """
    Verifica si el usuario puede modificar/eliminar la tarea.
    Solo LIDER o DUENO pueden hacerlo.
    """
    id_proyecto = obtener_proyecto_de_tarea(id_tarea)
    if not id_proyecto:
        return False
    
    role = get_user_role_in_project(id_usuario, id_proyecto)
    return role in ('LIDER', 'DUENO')


def user_can_view_project(id_usuario: int, id_proyecto: int):
    """
    Verifica si el usuario puede ver las tareas del proyecto.
    Cualquier miembro puede ver.
    """
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT 1 
            FROM proyecto_miembros 
            WHERE id_proyecto = %s AND id_usuario = %s
        """, (id_proyecto, id_usuario))
        return cur.fetchone() is not None
    finally:
        cur.close()
        conn.close()


# ================== RUTAS LEGACY (compatibles con el front actual) ==================

@task_bp.route('/tareas', methods=['POST'])
def nueva_tarea_legacy():
    """
    Espera: nombre, descripcion, prioridad, tiempo_estimado, id_usuario
    Opcional: estado (default: PENDIENTE), condiciones_aceptacion (array)
    Crea la tarea en el PROYECTO PERSONAL del id_usuario.
    """
    data = request.get_json() or {}
    needed = ['nombre', 'descripcion', 'prioridad', 'tiempo_estimado', 'id_usuario']
    
    if not all(k in data for k in needed):
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    # Validar prioridad
    if not validar_prioridad(data['prioridad']):
        return jsonify({"error": "Prioridad debe ser: Alta, Media o Baja"}), 400

    # Validar estado si se proporciona
    estado = data.get('estado', 'PENDIENTE')
    if not validar_estado(estado):
        return jsonify({"error": "Estado debe ser: PENDIENTE, EN_PROGRESO o HECHA"}), 400

    try:
        # Obtener proyecto personal (usuario es LIDER o DUENO)
        project_id, _ = get_or_create_personal_project(int(data['id_usuario']))

        # Crear tarea usando el modelo
        id_tarea = crear_tarea(
            nombre=data['nombre'],
            descripcion=data['descripcion'],
            prioridad=data['prioridad'],
            tiempo_estimado=data['tiempo_estimado'],
            id_usuario=data['id_usuario'],
            id_proyecto=project_id,
            estado=estado
        )
        
        # Crear condiciones de aceptación si existen
        if 'condiciones_aceptacion' in data and data['condiciones_aceptacion']:
            for condicion in data['condiciones_aceptacion']:
                crear_condicion_aceptacion(id_tarea, condicion)
        
        return jsonify({
            "mensaje": "Tarea agregada exitosamente",
            "id_tarea": id_tarea
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"Error al crear tarea: {str(e)}"}), 500


@task_bp.route('/tareas/<int:id_usuario>', methods=['GET'])
def listar_tareas_legacy(id_usuario: int):
    """
    Lista tareas del PROYECTO PERSONAL de ese usuario.
    Filtros opcionales: 
    - ?estado=PENDIENTE|EN_PROGRESO|HECHA
    - ?prioridad=Alta|Media|Baja
    """
    try:
        project_id, _ = get_or_create_personal_project(id_usuario)
        estado = request.args.get('estado')
        prioridad = request.args.get('prioridad')

        # Aplicar filtros según los parámetros
        if estado and prioridad:
            # Si hay ambos filtros, obtenemos todas y filtramos manualmente
            tareas = obtener_tareas_por_proyecto(project_id)
            tareas = [t for t in tareas if t['estado'] == estado and t['prioridad'] == prioridad]
        elif estado:
            tareas = obtener_tareas_por_estado(project_id, estado)
        elif prioridad:
            tareas = obtener_tareas_por_prioridad(project_id, prioridad)
        else:
            tareas = obtener_tareas_por_proyecto(project_id)
        
        # Agregar condiciones de aceptación a cada tarea
        for tarea in tareas:
            tarea['condiciones_aceptacion'] = obtener_condiciones_tarea(tarea['id_tarea'])
        
        return jsonify(tareas), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al listar tareas: {str(e)}"}), 500


@task_bp.route('/tareas/<int:id_tarea>', methods=['GET'])
def obtener_tarea(id_tarea: int):
    """
    Obtiene los detalles de una tarea específica con sus condiciones de aceptación.
    """
    try:
        tarea = obtener_tarea_por_id(id_tarea)
        
        if not tarea:
            return jsonify({"error": "Tarea no encontrada"}), 404
        
        # Agregar condiciones de aceptación
        tarea['condiciones_aceptacion'] = obtener_condiciones_tarea(id_tarea)
        
        return jsonify(tarea), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al obtener tarea: {str(e)}"}), 500


@task_bp.route('/tareas/<int:id_tarea>', methods=['PUT'])
def actualizar_tarea_legacy(id_tarea: int):
    """
    Actualiza una tarea. Campos opcionales en el body:
    - nombre, descripcion, prioridad, tiempo_estimado, estado
    - condiciones_aceptacion (array de strings)
    Requiere: id_usuario (para verificar permisos)
    """
    data = request.get_json() or {}
    id_usuario = data.get('id_usuario')
    
    if not id_usuario:
        return jsonify({"error": "id_usuario es requerido"}), 400

    # Verificar permisos
    if not user_can_modify_task(int(id_usuario), id_tarea):
        return jsonify({"error": "No tienes permisos para modificar esta tarea"}), 403

    # Validar estado si se proporciona
    if 'estado' in data and not validar_estado(data['estado']):
        return jsonify({"error": "Estado debe ser: PENDIENTE, EN_PROGRESO o HECHA"}), 400

    # Validar prioridad si se proporciona
    if 'prioridad' in data and not validar_prioridad(data['prioridad']):
        return jsonify({"error": "Prioridad debe ser: Alta, Media o Baja"}), 400

    try:
        # Preparar campos para actualizar (excluyendo id_usuario y condiciones)
        campos_actualizar = {k: v for k, v in data.items() 
                           if k in ['nombre', 'descripcion', 'prioridad', 'tiempo_estimado', 'estado']}
        
        # Actualizar tarea si hay campos
        if campos_actualizar:
            exito = actualizar_tarea(id_tarea, **campos_actualizar)
            if not exito:
                return jsonify({"error": "Tarea no encontrada"}), 404
        
        # Actualizar condiciones de aceptación si se proporcionan
        if 'condiciones_aceptacion' in data:
            reemplazar_condiciones_tarea(id_tarea, data['condiciones_aceptacion'])
        
        return jsonify({"mensaje": "Tarea actualizada exitosamente"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al actualizar tarea: {str(e)}"}), 500


@task_bp.route('/tareas/<int:id_tarea>/estado', methods=['PATCH'])
def actualizar_estado_tarea_route(id_tarea: int):
    """
    Actualiza solo el estado de una tarea.
    Body: { "estado": "PENDIENTE|EN_PROGRESO|HECHA", "id_usuario": int }
    """
    data = request.get_json() or {}
    
    if 'estado' not in data or 'id_usuario' not in data:
        return jsonify({"error": "estado e id_usuario son requeridos"}), 400
    
    if not validar_estado(data['estado']):
        return jsonify({"error": "Estado debe ser: PENDIENTE, EN_PROGRESO o HECHA"}), 400
    
    # Verificar permisos
    if not user_can_modify_task(int(data['id_usuario']), id_tarea):
        return jsonify({"error": "No tienes permisos para modificar esta tarea"}), 403
    
    try:
        exito = actualizar_estado_tarea(id_tarea, data['estado'])
        
        if not exito:
            return jsonify({"error": "Tarea no encontrada"}), 404
        
        return jsonify({"mensaje": "Estado actualizado exitosamente"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al actualizar estado: {str(e)}"}), 500

        
@task_bp.route('/tareas/<int:id_tarea>', methods=['DELETE'])
def eliminar_tarea_legacy(id_tarea: int):
    """
    Elimina una tarea si el usuario es LIDER o DUENO del proyecto.
    Las condiciones de aceptación se eliminan automáticamente (CASCADE).
    """
    data = request.get_json() or {}
    id_usuario = data.get('id_usuario')
    
    if not id_usuario:
        return jsonify({"error": "id_usuario es requerido"}), 400

    # Verificar permisos
    if not user_can_modify_task(int(id_usuario), id_tarea):
        return jsonify({"error": "No tienes permisos para eliminar esta tarea"}), 403

    try:
        exito = eliminar_tarea(id_tarea)
        
        if not exito:
            return jsonify({"error": "Tarea no encontrada"}), 404
        
        return jsonify({"mensaje": "Tarea eliminada exitosamente"}), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al eliminar tarea: {str(e)}"}), 500


# ================== RUTAS NUEVAS PARA PROYECTOS ==================

@task_bp.route('/proyectos/<int:id_proyecto>/tareas', methods=['GET'])
def listar_tareas_proyecto(id_proyecto: int):
    """
    Lista todas las tareas de un proyecto específico.
    Requiere: ?id_usuario=X (para verificar permisos)
    Filtros opcionales: ?estado=X&prioridad=Y
    """
    id_usuario = request.args.get('id_usuario', type=int)
    if not id_usuario:
        return jsonify({"error": "id_usuario es requerido como parámetro"}), 400
    
    # Verificar que el usuario pertenece al proyecto
    if not user_can_view_project(id_usuario, id_proyecto):
        return jsonify({"error": "No tienes acceso a este proyecto"}), 403
    
    try:
        estado = request.args.get('estado')
        prioridad = request.args.get('prioridad')
        
        # Aplicar filtros
        if estado and prioridad:
            tareas = obtener_tareas_por_proyecto(id_proyecto)
            tareas = [t for t in tareas if t['estado'] == estado and t['prioridad'] == prioridad]
        elif estado:
            tareas = obtener_tareas_por_estado(id_proyecto, estado)
        elif prioridad:
            tareas = obtener_tareas_por_prioridad(id_proyecto, prioridad)
        else:
            tareas = obtener_tareas_por_proyecto(id_proyecto)
        
        # Agregar condiciones de aceptación
        for tarea in tareas:
            tarea['condiciones_aceptacion'] = obtener_condiciones_tarea(tarea['id_tarea'])
        
        return jsonify(tareas), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al listar tareas: {str(e)}"}), 500


@task_bp.route('/proyectos/<int:id_proyecto>/tareas', methods=['POST'])
def crear_tarea_proyecto(id_proyecto: int):
    """
    Crea una tarea en un proyecto específico.
    Body: { nombre, descripcion, prioridad, tiempo_estimado, id_usuario, 
            estado (opcional), condiciones_aceptacion (opcional) }
    """
    data = request.get_json() or {}
    needed = ['nombre', 'descripcion', 'prioridad', 'tiempo_estimado', 'id_usuario']
    
    if not all(k in data for k in needed):
        return jsonify({"error": "Faltan datos obligatorios"}), 400
    
    # Verificar que el usuario puede crear tareas (LIDER o DUENO)
    role = get_user_role_in_project(int(data['id_usuario']), id_proyecto)
    if role not in ('LIDER', 'DUENO'):
        return jsonify({"error": "Solo líderes o dueños pueden crear tareas"}), 403
    
    # Validaciones
    if not validar_prioridad(data['prioridad']):
        return jsonify({"error": "Prioridad debe ser: Alta, Media o Baja"}), 400
    
    estado = data.get('estado', 'PENDIENTE')
    if not validar_estado(estado):
        return jsonify({"error": "Estado debe ser: PENDIENTE, EN_PROGRESO o HECHA"}), 400
    
    try:
        # Crear tarea
        id_tarea = crear_tarea(
            nombre=data['nombre'],
            descripcion=data['descripcion'],
            prioridad=data['prioridad'],
            tiempo_estimado=data['tiempo_estimado'],
            id_usuario=data['id_usuario'],
            id_proyecto=id_proyecto,
            estado=estado
        )
        
        # Crear condiciones de aceptación
        if 'condiciones_aceptacion' in data and data['condiciones_aceptacion']:
            for condicion in data['condiciones_aceptacion']:
                crear_condicion_aceptacion(id_tarea, condicion)
        
        return jsonify({
            "mensaje": "Tarea creada exitosamente",
            "id_tarea": id_tarea
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"Error al crear tarea: {str(e)}"}), 500


@task_bp.route('/tareas/estadisticas/<int:id_usuario>', methods=['GET'])
def estadisticas_tareas_usuario(id_usuario: int):
    """
    Obtiene estadísticas de las tareas del proyecto personal del usuario.
    """
    try:
        project_id, _ = get_or_create_personal_project(id_usuario)
        stats = obtener_estadisticas_proyecto(project_id)
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al obtener estadísticas: {str(e)}"}), 500


@task_bp.route('/proyectos/<int:id_proyecto>/estadisticas', methods=['GET'])
def estadisticas_proyecto(id_proyecto: int):
    """
    Obtiene estadísticas de las tareas de un proyecto.
    Requiere: ?id_usuario=X (para verificar permisos)
    """
    id_usuario = request.args.get('id_usuario', type=int)
    if not id_usuario:
        return jsonify({"error": "id_usuario es requerido como parámetro"}), 400
    
    # Verificar acceso
    if not user_can_view_project(id_usuario, id_proyecto):
        return jsonify({"error": "No tienes acceso a este proyecto"}), 403
    
    try:
        stats = obtener_estadisticas_proyecto(id_proyecto)
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({"error": f"Error al obtener estadísticas: {str(e)}"}), 500