from flask import Blueprint, request, jsonify
from models.usuario import crear_usuario, obtener_usuario

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/usuarios', methods=['POST'])
def registrar_usuario():
    data = request.get_json()

    # Validar que las contraseñas coincidan
    if data['contraseña'] != data['confirmar_contraseña']:
        return jsonify({"error": "Las contraseñas no coinciden"}), 400

    try:
        crear_usuario(data['nombre_completo'], data['email'], data['contraseña'])
        return jsonify({"mensaje": "Usuario registrado con éxito"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    usuario = obtener_usuario(data['email'], data['contraseña'])

    if usuario:
        return jsonify(usuario)
    else:
        return jsonify({"mensaje": "Credenciales incorrectas"}), 401
