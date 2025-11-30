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
    Opcional: descripcion, prioridad (BAJA|MEDIA|ALTA), fecha_inicio, fecha_limite, asignado_a (id_usuario)
    """
    data = request.get_json() or {}
    
    # ✅ Adaptado para recibir tanto 'titulo' como 'nombre'
    titulo = (data.get("titulo") or data.get("nombre") or "").strip()
    if not titulo:
        return _json_error("titulo o nombre es requerido", 400)

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

        # ✅ Mapear estado del frontend al backend
        estado_frontend = data.get("estado", "To-Do")
        estado_mapa = {
            "To-Do": "PENDIENTE",
            "In Progress": "EN_PROGRESO", 
            "Done": "COMPLETADA",
            "PENDIENTE": "PENDIENTE",
            "EN_PROGRESO": "EN_PROGRESO",
            "COMPLETADA": "COMPLETADA"
        }
        estado_bd = estado_mapa.get(estado_frontend, "PENDIENTE")

        # ✅ Mapear prioridad a mayúsculas
        prioridad = (data.get("prioridad") or "MEDIA").upper()
        if prioridad not in ("BAJA", "MEDIA", "ALTA"):
            prioridad = "MEDIA"

        # ✅ Convertir fecha_entrega a fecha_limite
        fecha_limite = data.get("fecha_limite") or data.get("fecha_entrega")
        
        horario_estimado=data.get("horas_estimadas")

        cur.execute(
            """
            INSERT INTO tareas
                (id_proyecto, titulo, descripcion, prioridad, estado, fecha_inicio, fecha_entrega,horas_estimadas, creado_por, asignado_a)
            VALUES
                (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                project_id,
                titulo,
                (data.get("descripcion") or "").strip(),
                prioridad,
                estado_bd,
                data.get("fecha_inicio"),
                fecha_limite,
                horario_estimado,
                uid,
                asignado_a,
            ),
        )
        conn.commit()
        
        id_tarea = cur.lastrowid

        # ✅ Devolver la tarea creada en formato esperado por el frontend
        return jsonify({
            "mensaje": "Tarea creada",
            "id_tarea": id_tarea,
            "titulo": titulo,
            "descripcion": data.get("descripcion", ""),
            "prioridad": prioridad,
            "estado": estado_frontend,  # Devolver en formato frontend
            "fecha_limite": fecha_limite,
            "horas_estimadas": horario_estimado,
            "horas_trabajadas": data.get("horas_trabajadas", 0),
            "condiciones_aceptacion": data.get("condiciones_aceptacion", "")
        }), 201

    except Exception as e:
        conn.rollback()
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()

# ------------------------
# Listar tareas de un proyecto específico
# ------------------------
@task_bp.route("/proyectos/<int:project_id>/tareas", methods=["GET"])
@jwt_required()
def listar_tareas_proyecto(project_id: int):
    """
    Lista todas las tareas de un proyecto específico.
    El usuario debe ser miembro del proyecto.
    """
    uid = _now_user_id()
    
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # Verificar que el usuario es miembro del proyecto
        role = _project_role(cur, uid, project_id)
        if not role:
            return _json_error("No tienes acceso a este proyecto", 403)

        cur.execute("""
            SELECT 
                t.id_tarea as id,
                t.titulo,
                t.descripcion,
                t.prioridad,
                t.estado,
                t.fecha_inicio,
                t.fecha_entrega as fecha_limite,
                t.asignado_a,
                t.creado_por,
                t.fecha_creacion,
                t.fecha_actualizacion,
                horas_estimadas,
                u_asignado.nombre_completo as nombre_asignado,
                u_creador.nombre_completo as nombre_creador
            FROM tareas t
            LEFT JOIN usuarios u_asignado ON t.asignado_a = u_asignado.id_usuario
            LEFT JOIN usuarios u_creador ON t.creado_por = u_creador.id_usuario
            WHERE t.id_proyecto = %s
            ORDER BY t.fecha_creacion DESC
        """, (project_id,))
        
        tareas = cur.fetchall() or []
        
        # ✅ Mapear estado de BD a formato frontend
        estado_mapa = {
            "PENDIENTE": "To-Do",
            "EN_PROGRESO": "In Progress",
            "COMPLETADA": "Done"
        }
        
        for tarea in tareas:
            tarea['status'] = estado_mapa.get(tarea['estado'], 'To-Do')
            tarea['nombre'] = tarea['titulo']  # Alias para compatibilidad
            tarea['fechaEntrega'] = tarea['fecha_limite']
            
        return jsonify({"tareas": tareas}), 200

    except Exception as e:
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()

# ------------------------
# Listar todas las tareas visibles para el usuario
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
               t.fecha_inicio, t.fecha_entrega, t.asignado_a, t.creado_por, t.fecha_creacion, t.fecha_actualizacion,t.horas_estimadas
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
            values.append(data["prioridad"].upper())

        if "estado" in data:
            # ✅ Mapear estado frontend a BD
            estado_mapa = {
                "To-Do": "PENDIENTE",
                "In Progress": "EN_PROGRESO",
                "Done": "COMPLETADA"
            }
            estado_bd = estado_mapa.get(data["estado"], data["estado"])
            updates.append("estado = %s")
            values.append(estado_bd)

        if "fecha_inicio" in data:
            updates.append("fecha_inicio = %s")
            values.append(data["fecha_inicio"])

        if "fecha_limite" in data or "fecha_entrega" in data:
            updates.append("fecha_entrega = %s")
            values.append(data.get("fecha_limite") or data.get("fecha_entrega"))

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