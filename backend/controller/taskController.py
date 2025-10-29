# backend/controller/taskController.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.conection.conexion import get_connection

task_bp = Blueprint("task_bp", __name__)

# ------------------------
# Helpers
# ------------------------
def _json_error(msg, status=400):
    return jsonify({"error": msg}), status

def _now_user_id() -> int:
    return int(get_jwt_identity())

def _user_is_global_admin(cur, user_id: int) -> bool:
    cur.execute(
        """
        SELECT r.codigo
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = %s
        """,
        (user_id,),
    )
    row = cur.fetchone()
    return bool(row and row["codigo"] == "ADMIN")

def _project_role(cur, user_id: int, project_id: int) -> str | None:
    """
    Devuelve el codigo de rol del usuario dentro del proyecto (ADMIN/LIDER/USUARIO)
    Si no está en el proyecto pero es ADMIN global, devuelve 'ADMIN'.
    """
    if _user_is_global_admin(cur, user_id):
        return "ADMIN"

    cur.execute(
        """
        SELECT r.codigo
        FROM proyecto_miembros pm
        JOIN roles r ON pm.id_rol = r.id_rol
        WHERE pm.id_usuario = %s AND pm.id_proyecto = %s
        """,
        (user_id, project_id),
    )
    row = cur.fetchone()
    return row["codigo"] if row else None

def _require_membership(cur, user_id: int, project_id: int):
    role = _project_role(cur, user_id, project_id)
    if role is None:
        return None, _json_error("No perteneces a este proyecto", 403)
    return role, None

def _task_visibility_filter_for_user() -> str:
    """
    Filtro de visibilidad: tareas del usuario (asignado) o de proyectos donde es miembro.
    """
    return """
    WHERE
        t.asignado_a = %(uid)s
        OR EXISTS (
            SELECT 1
            FROM proyecto_miembros pm
            WHERE pm.id_proyecto = t.id_proyecto AND pm.id_usuario = %(uid)s
        )
    """

# ------------------------
# Crear tarea (LIDER/ADMIN)
# ------------------------
@task_bp.route("/proyectos/<int:project_id>/tareas", methods=["POST"])
@jwt_required()
def crear_tarea(project_id: int):
    """
    Crea una tarea en un proyecto.
    Requiere rol LIDER o ADMIN en el proyecto (o ADMIN global).
    Body requerido: titulo
    Opcional: descripcion, prioridad (BAJA|MEDIA|ALTA), fecha_inicio, fecha_entrega (YYYY-MM-DD), asignado_a (id_usuario)
    """
    data = request.get_json() or {}
    titulo = (data.get("titulo") or "").strip()
    if not titulo:
        return _json_error("titulo es requerido", 400)

    uid = _now_user_id()

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        role = _project_role(cur, uid, project_id)
        if role not in ("ADMIN", "LIDER"):
            return _json_error("Solo LIDER o ADMIN pueden crear tareas", 403)

        # Validar asignado_a (si viene, debe ser miembro del proyecto)
        asignado_a = data.get("asignado_a")
        if asignado_a:
            cur.execute(
                "SELECT 1 FROM proyecto_miembros WHERE id_proyecto = %s AND id_usuario = %s",
                (project_id, asignado_a),
            )
            if not cur.fetchone():
                return _json_error("El usuario asignado no pertenece al proyecto", 400)

        cur.execute(
            """
            INSERT INTO tareas
                (id_proyecto, titulo, descripcion, prioridad, estado, fecha_inicio, fecha_entrega, creado_por, asignado_a)
            VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                project_id,
                titulo,
                (data.get("descripcion") or "").strip(),
                data.get("prioridad") or "MEDIA",
                "PENDIENTE",
                data.get("fecha_inicio"),
                data.get("fecha_entrega"),
                uid,
                asignado_a,
            ),
        )
        conn.commit()
        return jsonify({"mensaje": "Tarea creada", "id_tarea": cur.lastrowid}), 201

    except Exception as e:
        conn.rollback()
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()

# ------------------------
# Listar tareas visibles para el usuario (filtros opcionales)
# ------------------------
@task_bp.route("/tareas", methods=["GET"])
@jwt_required()
def listar_tareas():
    """
    Lista tareas visibles para el usuario (asignadas a él o en proyectos donde es miembro).
    Filtros opcionales: estado, proyecto_id, prioridad
    """
    uid = _now_user_id()
    estado = request.args.get("estado")
    proyecto_id = request.args.get("proyecto_id", type=int)
    prioridad = request.args.get("prioridad")

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        base = f"""
        SELECT t.id_tarea, t.id_proyecto, t.titulo, t.descripcion, t.prioridad, t.estado,
               t.fecha_inicio, t.fecha_entrega, t.asignado_a, t.creado_por, t.fecha_creacion, t.fecha_actualizacion
        FROM tareas t
        {_task_visibility_filter_for_user()}
        """
        params = {"uid": uid}

        if proyecto_id:
            base += " AND t.id_proyecto = %(pid)s"
            params["pid"] = proyecto_id
        if estado:
            base += " AND t.estado = %(estado)s"
            params["estado"] = estado
        if prioridad:
            base += " AND t.prioridad = %(prioridad)s"
            params["prioridad"] = prioridad

        base += " ORDER BY t.fecha_creacion DESC"

        cur.execute(base, params)
        rows = cur.fetchall() or []
        return jsonify({"tareas": rows}), 200

    except Exception as e:
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()

# ------------------------
# Obtener detalle de una tarea (visible)
# ------------------------
@task_bp.route("/tareas/<int:task_id>", methods=["GET"])
@jwt_required()
def obtener_tarea(task_id: int):
    uid = _now_user_id()
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(
            f"""
            SELECT t.*
            FROM tareas t
            {_task_visibility_filter_for_user()}
            AND t.id_tarea = %(tid)s
            """,
            {"uid": uid, "tid": task_id},
        )
        t = cur.fetchone()
        if not t:
            return _json_error("Tarea no encontrada o sin permisos", 404)
        return jsonify({"tarea": t}), 200

    except Exception as e:
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()

# ------------------------
# Actualizar tarea (LIDER/ADMIN del proyecto o ADMIN global)
# ------------------------
@task_bp.route("/tareas/<int:task_id>", methods=["PUT"])
@jwt_required()
def actualizar_tarea(task_id: int):
    """
    Actualiza campos de una tarea.
    Permisos: LIDER/ADMIN del proyecto o ADMIN global.
    USUARIO no puede editar (salvo completar con endpoint dedicado).
    """
    data = request.get_json() or {}
    uid = _now_user_id()

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # Traer tarea y proyecto
        cur.execute("SELECT id_proyecto FROM tareas WHERE id_tarea = %s", (task_id,))
        row = cur.fetchone()
        if not row:
            return _json_error("Tarea no encontrada", 404)

        project_id = row["id_proyecto"]
        role = _project_role(cur, uid, project_id)
        if role not in ("ADMIN", "LIDER"):
            return _json_error("No tienes permiso para editar esta tarea", 403)

        updates, values = [], []

        if "titulo" in data:
            updates.append("titulo = %s")
            values.append((data["titulo"] or "").strip())

        if "descripcion" in data:
            updates.append("descripcion = %s")
            values.append((data["descripcion"] or "").strip())

        if "prioridad" in data:
            updates.append("prioridad = %s")
            values.append(data["prioridad"])

        if "estado" in data:
            updates.append("estado = %s")
            values.append(data["estado"])

        if "fecha_inicio" in data:
            updates.append("fecha_inicio = %s")
            values.append(data["fecha_inicio"])

        if "fecha_entrega" in data:
            updates.append("fecha_entrega = %s")
            values.append(data["fecha_entrega"])

        if "asignado_a" in data:
            asignado_a = data["asignado_a"]
            if asignado_a:
                cur.execute(
                    "SELECT 1 FROM proyecto_miembros WHERE id_proyecto = %s AND id_usuario = %s",
                    (project_id, asignado_a),
                )
                if not cur.fetchone():
                    return _json_error("El usuario asignado no pertenece al proyecto", 400)
            updates.append("asignado_a = %s")
            values.append(asignado_a)

        if not updates:
            return _json_error("No hay campos para actualizar", 400)

        values.append(task_id)
        cur.execute(f"UPDATE tareas SET {', '.join(updates)} WHERE id_tarea = %s", values)
        conn.commit()
        return jsonify({"mensaje": "Tarea actualizada"}), 200

    except Exception as e:
        conn.rollback()
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()

# ------------------------
# Completar tarea (asignado o LIDER/ADMIN)
# ------------------------
@task_bp.route("/tareas/<int:task_id>/completar", methods=["PATCH"])
@jwt_required()
def completar_tarea(task_id: int):
    """
    Marca una tarea como COMPLETADA.
    Permisos: el asignado a la tarea o LIDER/ADMIN del proyecto.
    """
    uid = _now_user_id()
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT id_proyecto, asignado_a FROM tareas WHERE id_tarea = %s", (task_id,))
        t = cur.fetchone()
        if not t:
            return _json_error("Tarea no encontrada", 404)

        project_id = t["id_proyecto"]
        role = _project_role(cur, uid, project_id)

        if not (t["asignado_a"] == uid or role in ("ADMIN", "LIDER")):
            return _json_error("No tienes permiso para completar esta tarea", 403)

        cur.execute("UPDATE tareas SET estado = 'COMPLETADA' WHERE id_tarea = %s", (task_id,))
        conn.commit()
        return jsonify({"mensaje": "Tarea completada"}), 200

    except Exception as e:
        conn.rollback()
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()

# ------------------------
# Eliminar tarea (LIDER/ADMIN)
# ------------------------
@task_bp.route("/tareas/<int:task_id>", methods=["DELETE"])
@jwt_required()
def eliminar_tarea(task_id: int):
    uid = _now_user_id()
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT id_proyecto FROM tareas WHERE id_tarea = %s", (task_id,))
        t = cur.fetchone()
        if not t:
            return _json_error("Tarea no encontrada", 404)

        project_id = t["id_proyecto"]
        role = _project_role(cur, uid, project_id)
        if role not in ("ADMIN", "LIDER"):
            return _json_error("No tienes permiso para eliminar esta tarea", 403)

        cur.execute("DELETE FROM tareas WHERE id_tarea = %s", (task_id,))
        conn.commit()
        return jsonify({"mensaje": "Tarea eliminada"}), 200

    except Exception as e:
        conn.rollback()
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()
