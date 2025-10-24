# backend/controller/projectController.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.conection.conexion import get_connection


project_bp = Blueprint('project_bp', __name__)

@project_bp.route('/proyectos', methods=['POST'])
@jwt_required()
def crear_proyecto():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    nombre = data.get("nombre")
    descripcion = data.get("descripcion", "")
    if not nombre:
        return jsonify({"error": "nombre es requerido"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        # crear proyecto
        cur.execute("INSERT INTO proyectos (nombre, descripcion, creado_por) VALUES (%s, %s, %s)",
                    (nombre, descripcion, user_id))
        project_id = cur.lastrowid
        # agregar creador como LÍDER
        cur.execute("SELECT id_rol FROM roles WHERE codigo='LIDER'")
        id_rol = cur.fetchone()[0]
        cur.execute("""INSERT INTO proyecto_miembros (id_proyecto, id_usuario, id_rol)
                       VALUES (%s, %s, %s)""", (project_id, user_id, id_rol))
        conn.commit()
        return jsonify({"id_proyecto": project_id, "mensaje": "Proyecto creado"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close(); conn.close()

@project_bp.route('/proyectos', methods=['GET'])
@jwt_required()
def mis_proyectos():
    user_id = get_jwt_identity()
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("""
      SELECT p.id_proyecto, p.nombre, p.descripcion, r.codigo AS rol
      FROM proyectos p
      JOIN proyecto_miembros pm ON pm.id_proyecto=p.id_proyecto
      JOIN roles r ON r.id_rol=pm.id_rol
      WHERE pm.id_usuario=%s
      ORDER BY p.fecha_creacion DESC
    """, (user_id,))
    rows = cur.fetchall()
    cur.close(); conn.close()
    return jsonify(rows), 200

@project_bp.route('/proyectos/<int:id_proyecto>/miembros', methods=['POST'])
@jwt_required()
def agregar_miembro(id_proyecto):
    """Solo LÍDER puede invitar miembros y asignar rol."""
    from .auth_middleware import require_project_role
    @require_project_role(['LIDER'])
    def _add_member(id_proyecto):
        data = request.get_json() or {}
        id_usuario = data.get("id_usuario")
        rol = data.get("rol", "MIEMBRO")  # 'LIDER' o 'MIEMBRO'
        if not id_usuario:
            return jsonify({"error": "id_usuario requerido"}), 400
        conn = get_connection()
        cur = conn.cursor()
        try:
            cur.execute("SELECT id_rol FROM roles WHERE codigo=%s", (rol,))
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "rol inválido"}), 400
            id_rol = row[0]
            cur.execute("""INSERT INTO proyecto_miembros (id_proyecto, id_usuario, id_rol)
                           VALUES (%s, %s, %s)
                           ON DUPLICATE KEY UPDATE id_rol=VALUES(id_rol)""",
                        (id_proyecto, id_usuario, id_rol))
            conn.commit()
            return jsonify({"mensaje": "Miembro agregado"}), 201
        except Exception as e:
            conn.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            cur.close(); conn.close()
    return _add_member(id_proyecto)
