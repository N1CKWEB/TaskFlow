# backend/controller/userController.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity,create_refresh_token
from werkzeug.security import generate_password_hash, check_password_hash
from backend.conection.conexion import get_connection
from backend.controller.common import get_or_create_personal_project
from datetime import timedelta

user_bp = Blueprint("user_bp", __name__)

# ------------------------
# Helpers
# ------------------------
def _json_error(msg, status=400):
    return jsonify({"error": msg}), status

def _normalize_email(s: str) -> str:
    return (s or "").strip().lower()

# ------------------------
# Registro de usuario
# ------------------------
@user_bp.route("/usuarios", methods=["POST"])
def registrar_usuario():
    """
    Registra un nuevo usuario y crea su proyecto personal 'Mis Tareas' si no existe.
    Body requerido: nombre_completo, email, contraseña, confirmar_contraseña
    Opcional: id_rol (por defecto 3, p.ej. USUARIO)
    """
    data = request.get_json() or {}

    required = ["nombre_completo", "email", "contraseña", "confirmar_contraseña"]
    if not all(k in data for k in required):
        return _json_error("Datos incompletos", 400)

    if data["contraseña"] != data["confirmar_contraseña"]:
        return _json_error("Las contraseñas no coinciden", 400)

    id_rol = data.get("id_rol", 3)
    email = _normalize_email(data["email"])

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT id_usuario FROM usuarios WHERE email = %s", (email,))
        if cur.fetchone():
            return _json_error("El email ya está registrado", 409)

        password_hash = generate_password_hash(data["contraseña"], method="pbkdf2:sha256")

        cur.execute(
            """
            INSERT INTO usuarios (nombre_completo, email, contraseña, id_rol)
            VALUES (%s, %s, %s, %s)
            """,
            (data["nombre_completo"].strip(), email, password_hash, id_rol),
        )
        conn.commit()

        user_id = cur.lastrowid

        # Proyecto personal (fuente única en common.py)
        try:
            get_or_create_personal_project(user_id)
        except Exception as e:
            print(f"[WARN] Error al crear proyecto personal para user {user_id}: {e}")

        return jsonify({"mensaje": "Usuario registrado con éxito", "id_usuario": user_id}), 201

    except Exception as e:
        conn.rollback()
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()

# ------------------------
# Login
# ------------------------
@user_bp.route("/login", methods=["POST"])
def login():
    """
    Login de usuario.
    Body: email, contraseña
    """
    data = request.get_json() or {}
    email = _normalize_email(data.get("email"))
    contraseña = data.get("contraseña")

    if not email or not contraseña:
        return _json_error("Email y contraseña son requeridos", 400)

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT u.id_usuario, u.nombre_completo, u.email, u.contraseña,
                   u.id_rol, r.codigo AS rol_codigo, r.nombre AS rol_nombre
            FROM usuarios u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.email = %s
            """,
            (email,),
        )
        user = cur.fetchone()

        if not user or not check_password_hash(user["contraseña"], contraseña):
            return _json_error("Credenciales inválidas", 401)

       
        access_token = create_access_token(identity=str(user["id_usuario"]))
        refresh_token = create_refresh_token(identity=str(user["id_usuario"]))

        return jsonify(
            {
                "mensaje": "Login exitoso",
                "access_token": access_token,
                "refresh_token":refresh_token,
                "usuario": {
                    "id_usuario": user["id_usuario"],
                    "nombre_completo": user["nombre_completo"],
                    "email": user["email"],
                    "rol": {
                        "id": user["id_rol"],
                        "codigo": user["rol_codigo"],
                        "nombre": user["rol_nombre"],
                    },
                },
            }
        ), 200

    except Exception as e:
        print(f"[ERROR] Login: {e}")
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()





# ------------------------
# Perfil del usuario actual
# ------------------------
@user_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT u.id_usuario, u.nombre_completo, u.email, u.fecha_registro,
                   u.id_rol, r.codigo AS rol_codigo, r.nombre AS rol_nombre
            FROM usuarios u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = %s
            """,
            (user_id,),
        )
        user = cur.fetchone()
        if not user:
            return _json_error("Usuario no encontrado", 404)

        return jsonify(
            {
                "usuario": {
                    "id_usuario": user["id_usuario"],
                    "nombre_completo": user["nombre_completo"],
                    "email": user["email"],
                    "fecha_registro": user["fecha_registro"].isoformat() if user["fecha_registro"] else None,
                    "rol": {
                        "id": user["id_rol"],
                        "codigo": user["rol_codigo"],
                        "nombre": user["rol_nombre"],
                    },
                }
            }
        ), 200

    except Exception as e:
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()

# ------------------------
# Listar usuarios (ADMIN)
# ------------------------
@user_bp.route("/usuarios", methods=["GET"])
@jwt_required()
def listar_usuarios():
    current_user_id = int(get_jwt_identity())

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(
            """
            SELECT r.codigo
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = %s
            """,
            (current_user_id,),
        )
        role = cur.fetchone()
        if not role or role["codigo"] != "ADMIN":
            return _json_error("Acceso denegado. Solo administradores", 403)

        cur.execute(
            """
            SELECT u.id_usuario, u.nombre_completo, u.email, u.fecha_registro,
                   r.codigo AS rol_codigo, r.nombre AS rol_nombre
            FROM usuarios u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            ORDER BY u.fecha_registro DESC
            """
        )
        rows = cur.fetchall() or []

        return jsonify(
            {
                "usuarios": [
                    {
                        "id_usuario": u["id_usuario"],
                        "nombre_completo": u["nombre_completo"],
                        "email": u["email"],
                        "fecha_registro": u["fecha_registro"].isoformat() if u["fecha_registro"] else None,
                        "rol": {"codigo": u["rol_codigo"], "nombre": u["rol_nombre"]},
                    }
                    for u in rows
                ]
            }
        ), 200

    except Exception as e:
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()

# ------------------------
# Cambiar contraseña (alias con/ sin ñ en la URL)
# ------------------------
@user_bp.route("/usuarios/<int:user_id>/cambiar-contraseña", methods=["PUT"])
@user_bp.route("/usuarios/<int:user_id>/cambiar-password", methods=["PUT"])
@jwt_required()
def cambiar_contraseña(user_id: int):
    current_user_id = int(get_jwt_identity())
    if current_user_id != user_id:
        return _json_error("No puedes cambiar la contraseña de otro usuario", 403)

    data = request.get_json() or {}
    required = ["contraseña_actual", "nueva_contraseña", "confirmar_nueva_contraseña"]
    if not all(k in data for k in required):
        return _json_error("Faltan campos requeridos", 400)

    if data["nueva_contraseña"] != data["confirmar_nueva_contraseña"]:
        return _json_error("Las contraseñas nuevas no coinciden", 400)

    if len(data["nueva_contraseña"]) < 8:
        return _json_error("La nueva contraseña debe tener al menos 8 caracteres", 400)

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT contraseña FROM usuarios WHERE id_usuario = %s", (user_id,))
        user = cur.fetchone()
        if not user:
            return _json_error("Usuario no encontrado", 404)

        if not check_password_hash(user["contraseña"], data["contraseña_actual"]):
            return _json_error("Contraseña actual incorrecta", 401)

        nueva_hash = generate_password_hash(data["nueva_contraseña"], method="pbkdf2:sha256")
        cur.execute("UPDATE usuarios SET contraseña = %s WHERE id_usuario = %s", (nueva_hash, user_id))
        conn.commit()
        return jsonify({"mensaje": "Contraseña actualizada con éxito"}), 200

    except Exception as e:
        conn.rollback()
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()

# /refresh
@user_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=user_id)
    return jsonify({"access_token": new_access_token}), 200
