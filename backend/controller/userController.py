# backend/controller/userController.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from backend.conection.conexion import get_connection


from .common import get_or_create_personal_project

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/usuarios', methods=['POST'])
def registrar_usuario_legacy():
    """
    Mantiene el contrato V1: recibe nombre_completo, email, contraseña, confirmar_contraseña
    - Guarda contraseña hasheada
    - Crea proyecto personal (usuario como LIDER)
    """
    data = request.get_json() or {}
    req = ['nombre_completo','email','contraseña','confirmar_contraseña']
    if not all(k in data for k in req):
        return jsonify({"error": "Datos incompletos"}), 400
    if data['contraseña'] != data['confirmar_contraseña']:
        return jsonify({"error": "Las contraseñas no coinciden"}), 400

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""INSERT INTO usuarios (nombre_completo,email,contraseña)
                       VALUES (%s,%s,%s)""",
                    (data['nombre_completo'], data['email'],
                     generate_password_hash(data['contraseña'])))
        conn.commit()
        # crear proyecto personal
        cur.execute("SELECT LAST_INSERT_ID()")
        user_id = cur.fetchone()[0]
        get_or_create_personal_project(user_id)
        return jsonify({"mensaje": "Usuario registrado con éxito"}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close(); conn.close()


@user_bp.route('/login', methods=['POST'])
def login_legacy():
    """
    Mantiene el contrato V1: devuelve {id_usuario, nombre_completo, email} si OK.
    (Sin JWT porque el front no lo manda; pero debajo ya tenemos proyectos/roles)
    """
    data = request.get_json() or {}
    email = data.get('email'); pwd = data.get('contraseña')
    if not email or not pwd:
        return jsonify({"mensaje": "Email y contraseña requeridos"}), 400

    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT * FROM usuarios WHERE email=%s", (email,))
        u = cur.fetchone()
        if not u or not check_password_hash(u['contraseña'], pwd):
            return jsonify({"mensaje": "Credenciales incorrectas"}), 401

        # asegurar proyecto personal existe
        get_or_create_personal_project(u['id_usuario'])

        return jsonify({
            "id_usuario": u["id_usuario"],
            "nombre_completo": u["nombre_completo"],
            "email": u["email"]
        }), 200
    finally:
        cur.close(); conn.close()
