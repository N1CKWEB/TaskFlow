# backend/controller/auth_middleware.py
from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from conection.conexion import get_connection



def _role_code(user_id, project_id):
    sql = """
      SELECT r.codigo
      FROM proyecto_miembros pm
      JOIN roles r ON r.id_rol = pm.id_rol
      WHERE pm.id_usuario=%s AND pm.id_proyecto=%s
    """
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(sql, (user_id, project_id))
    row = cur.fetchone()
    cur.close(); conn.close()
    return row["codigo"] if row else None

def require_project_role(allowed_codes):
    def deco(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            # buscar id_proyecto en path, args o body
            project_id = kwargs.get("id_proyecto") or request.view_args.get("id_proyecto") \
                         or request.args.get("id_proyecto") \
                         or (request.get_json() or {}).get("id_proyecto")

            if not project_id:
                return jsonify({"error": "id_proyecto requerido"}), 400

            code = _role_code(user_id, project_id)
            if code not in allowed_codes:
                return jsonify({"error": "Permiso denegado"}), 403

            return fn(*args, **kwargs)
        return wrapper
    return deco
