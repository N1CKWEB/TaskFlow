from flask import Blueprint, request, jsonify
from backend.conection.conexion import get_connection

         # ← 2 en “connection”
from .common import get_or_create_personal_project, user_is_leader_of_task

#
task_bp = Blueprint('task_bp', __name__)


@task_bp.route('/tareas', methods=['POST'])
def nueva_tarea_legacy():
    """
    Espera: nombre, descripcion, prioridad, tiempo_estimado, id_usuario (V1)
    Crea la tarea en el PROYECTO PERSONAL del id_usuario.
    """
    data = request.get_json() or {}
    needed = ['nombre','descripcion','prioridad','tiempo_estimado','id_usuario']
    if not all(k in data for k in needed):
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    # proyecto personal (usuario es LIDER)
    project_id, _ = get_or_create_personal_project(data['id_usuario'])

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
          INSERT INTO tareas (nombre, descripcion, prioridad, tiempo_estimado, id_usuario, id_proyecto)
          VALUES (%s,%s,%s,%s,%s,%s)
        """, (data['nombre'], data['descripcion'], data['prioridad'],
              data['tiempo_estimado'], data['id_usuario'], project_id))
        conn.commit()
        return jsonify({"mensaje": "Tarea agregada", "id_tarea": cur.lastrowid}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close(); conn.close()


@task_bp.route('/tareas/<int:id_usuario>', methods=['GET'])
def listar_tareas_legacy(id_usuario):
    """
    V1: lista tareas por id_usuario.
    Ahora listamos las del PROYECTO PERSONAL de ese usuario.
    """
    project_id, _ = get_or_create_personal_project(id_usuario)

    estado = request.args.get('estado')  # opcional
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        if estado:
            cur.execute("""SELECT * FROM tareas
                           WHERE id_proyecto=%s AND estado=%s
                           ORDER BY fecha_creacion DESC""", (project_id, estado))
        else:
            cur.execute("""SELECT * FROM tareas
                           WHERE id_proyecto=%s
                           ORDER BY fecha_creacion DESC""", (project_id,))
        rows = cur.fetchall()
        return jsonify(rows), 200
    finally:
        cur.close(); conn.close()


@task_bp.route('/tareas/<int:id_tarea>', methods=['PUT'])
def actualizar_tarea_legacy(id_tarea):
    """
    V1: actualiza pasando todos los campos y id_usuario en el body.
    Permitimos update solo si el usuario es LIDER del proyecto de la tarea.
    """
    data = request.get_json() or {}
    needed = ['nombre','descripcion','prioridad','tiempo_estimado','id_usuario']
    if not all(k in data for k in needed):
        return jsonify({"error": "Faltan campos para actualizar la tarea"}), 400

    # check permiso (LIDER del proyecto al que pertenece la tarea)
    if not user_is_leader_of_task(data['id_usuario'], id_tarea):
        return jsonify({"error": "Permiso denegado"}), 403

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE tareas
               SET nombre=%s, descripcion=%s, prioridad=%s, tiempo_estimado=%s
             WHERE id_tarea=%s
        """, (data['nombre'], data['descripcion'], data['prioridad'], data['tiempo_estimado'], id_tarea))
        conn.commit()
        return jsonify({"mensaje": "Tarea actualizada"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close(); conn.close()
@task_bp.route('/tareas/<int:id_tarea>', methods=['DELETE'])
def eliminar_tarea_legacy(id_tarea):
    """
    V1: elimina tarea por id_tarea y id_usuario en el body.
    Permitimos delete solo si el usuario es LIDER del proyecto de la tarea.
    """
    data = request.get_json() or {}
    id_usuario = data.get('id_usuario')
    if not id_usuario:
        return jsonify({"error": "Falta id_usuario"}), 400

    # check permiso (LIDER del proyecto al que pertenece la tarea)
    if not user_is_leader_of_task(id_usuario, id_tarea):
        return jsonify({"error": "Permiso denegado"}), 403

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM tareas WHERE id_tarea=%s", (id_tarea,))
        conn.commit()
        return jsonify({"mensaje": "Tarea eliminada"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close(); conn.close()