# backend/controller/userController.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from backend.conection.conexion import get_connection
from datetime import timedelta

user_bp = Blueprint('user_bp', __name__)

# =========================================================
# REGISTRO DE USUARIO
# =========================================================
@user_bp.route('/usuarios', methods=['POST'])
def registrar_usuario():
    """
    Registra un nuevo usuario.
    """
    data = request.get_json() or {}
    
    req = ['nombre_completo', 'email', 'contraseña', 'confirmar_contraseña']
    if not all(k in data for k in req):
        return jsonify({"error": "Datos incompletos"}), 400
    
    if data['contraseña'] != data['confirmar_contraseña']:
        return jsonify({"error": "Las contraseñas no coinciden"}), 400
    
    id_rol = data.get('id_rol', 3)

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT id_usuario FROM usuarios WHERE email = %s", (data['email'],))
        if cur.fetchone():
            return jsonify({"error": "El email ya está registrado"}), 409
        
        # ✅ Especificar método pbkdf2:sha256
        password_hash = generate_password_hash(
            data['contraseña'], 
            method='pbkdf2:sha256'  # ✅ Agregar esto
        )
        
        cur.execute("""
            INSERT INTO usuarios (nombre_completo, email, contraseña, id_rol)
            VALUES (%s, %s, %s, %s)
        """, (
            data['nombre_completo'].strip(),
            data['email'].strip().lower(),
            password_hash,
            id_rol
        ))
        conn.commit()
        
        user_id = cur.lastrowid
        
        try:
            get_or_create_personal_project(user_id, cur, conn)
        except Exception as e:
            print(f"Error al crear proyecto personal: {e}")
        
        return jsonify({
            "mensaje": "Usuario registrado con éxito",
            "id_usuario": user_id
        }), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()
# =========================================================
# LOGIN
# =========================================================
@user_bp.route('/login', methods=['POST'])
def login():
    """
    Login de usuario.
    """
    data = request.get_json() or {}
    
    email = data.get('email')
    contraseña = data.get('contraseña')
    
    if not email or not contraseña:
        return jsonify({"error": "Email y contraseña son requeridos"}), 400
    
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT u.id_usuario, u.nombre_completo, u.email, u.contraseña, 
                   u.id_rol, r.codigo as rol_codigo, r.nombre as rol_nombre
            FROM usuarios u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.email = %s
        """, (email.strip().lower(),))
        
        user = cur.fetchone()
        
        if not user:
            return jsonify({"error": "Credenciales inválidas"}), 401
        
        # ✅ Verificar contraseña
        if not check_password_hash(user['contraseña'], contraseña):
            return jsonify({"error": "Credenciales inválidas"}), 401
        
        # Crear token JWT
        access_token = create_access_token(
            identity=user['id_usuario'],
            expires_delta=timedelta(hours=24)
        )
        
        return jsonify({
            "mensaje": "Login exitoso",
            "access_token": access_token,
            "usuario": {
                "id_usuario": user['id_usuario'],
                "nombre_completo": user['nombre_completo'],
                "email": user['email'],
                "rol": {
                    "id": user['id_rol'],
                    "codigo": user['rol_codigo'],
                    "nombre": user['rol_nombre']
                }
            }
        }), 200
        
    except Exception as e:
        print(f"Error en login: {str(e)}")  # ✅ Debug
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =========================================================
# OBTENER PERFIL DEL USUARIO ACTUAL
# =========================================================
@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Obtiene los datos del usuario autenticado.
    Requiere token JWT en header: Authorization: Bearer {token}
    """
    user_id = get_jwt_identity()
    
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
            SELECT u.id_usuario, u.nombre_completo, u.email, u.fecha_registro,
                   u.id_rol, r.codigo as rol_codigo, r.nombre as rol_nombre
            FROM usuarios u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = %s
        """, (user_id,))
        
        user = cur.fetchone()
        
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        return jsonify({
            "usuario": {
                "id_usuario": user['id_usuario'],
                "nombre_completo": user['nombre_completo'],
                "email": user['email'],
                "fecha_registro": user['fecha_registro'].isoformat() if user['fecha_registro'] else None,
                "rol": {
                    "id": user['id_rol'],
                    "codigo": user['rol_codigo'],
                    "nombre": user['rol_nombre']
                }
            }
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =========================================================
# OBTENER TODOS LOS USUARIOS (solo para ADMIN)
# =========================================================
@user_bp.route('/usuarios', methods=['GET'])
@jwt_required()
def listar_usuarios():
    """
    Lista todos los usuarios (solo para administradores).
    Requiere rol ADMIN.
    """
    current_user_id = get_jwt_identity()
    
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # Verificar que el usuario actual sea ADMIN
        cur.execute("""
            SELECT r.codigo 
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = %s
        """, (current_user_id,))
        
        user_role = cur.fetchone()
        
        if not user_role or user_role['codigo'] != 'ADMIN':
            return jsonify({"error": "Acceso denegado. Solo administradores"}), 403
        
        # Obtener todos los usuarios
        cur.execute("""
            SELECT u.id_usuario, u.nombre_completo, u.email, u.fecha_registro,
                   r.codigo as rol_codigo, r.nombre as rol_nombre
            FROM usuarios u
            LEFT JOIN roles r ON u.id_rol = r.id_rol
            ORDER BY u.fecha_registro DESC
        """)
        
        usuarios = cur.fetchall()
        
        return jsonify({
            "usuarios": [
                {
                    "id_usuario": u['id_usuario'],
                    "nombre_completo": u['nombre_completo'],
                    "email": u['email'],
                    "fecha_registro": u['fecha_registro'].isoformat() if u['fecha_registro'] else None,
                    "rol": {
                        "codigo": u['rol_codigo'],
                        "nombre": u['rol_nombre']
                    }
                }
                for u in usuarios
            ]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =========================================================
# ACTUALIZAR PERFIL
# =========================================================
@user_bp.route('/usuarios/<int:user_id>', methods=['PUT'])
@jwt_required()
def actualizar_usuario(user_id):
    """
    Actualiza los datos de un usuario.
    Un usuario solo puede actualizar sus propios datos (excepto ADMIN).
    Campos opcionales: nombre_completo, email
    """
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # Verificar permisos
        cur.execute("""
            SELECT r.codigo 
            FROM usuarios u
            JOIN roles r ON u.id_rol = r.id_rol
            WHERE u.id_usuario = %s
        """, (current_user_id,))
        
        current_user_role = cur.fetchone()
        is_admin = current_user_role and current_user_role['codigo'] == 'ADMIN'
        
        # Solo el mismo usuario o un ADMIN pueden actualizar
        if current_user_id != user_id and not is_admin:
            return jsonify({"error": "No tienes permiso para actualizar este usuario"}), 403
        
        # Construir query dinámicamente
        updates = []
        values = []
        
        if 'nombre_completo' in data:
            updates.append("nombre_completo = %s")
            values.append(data['nombre_completo'].strip())
        
        if 'email' in data:
            # Verificar que el email no esté en uso por otro usuario
            cur.execute(
                "SELECT id_usuario FROM usuarios WHERE email = %s AND id_usuario != %s",
                (data['email'].strip().lower(), user_id)
            )
            if cur.fetchone():
                return jsonify({"error": "El email ya está en uso"}), 409
            
            updates.append("email = %s")
            values.append(data['email'].strip().lower())
        
        # Solo ADMIN puede cambiar roles
        if 'id_rol' in data and is_admin:
            updates.append("id_rol = %s")
            values.append(data['id_rol'])
        
        if not updates:
            return jsonify({"error": "No hay campos para actualizar"}), 400
        
        # Ejecutar update
        values.append(user_id)
        query = f"UPDATE usuarios SET {', '.join(updates)} WHERE id_usuario = %s"
        cur.execute(query, values)
        conn.commit()
        
        return jsonify({"mensaje": "Usuario actualizado con éxito"}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =========================================================
# CAMBIAR CONTRASEÑA
# =========================================================
@user_bp.route('/usuarios/<int:user_id>/cambiar-contraseña', methods=['PUT'])
@jwt_required()
def cambiar_contraseña(user_id):
    """
    Cambia la contraseña de un usuario.
    Requiere: contraseña_actual, nueva_contraseña, confirmar_nueva_contraseña
    """
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    # Solo el mismo usuario puede cambiar su contraseña
    if current_user_id != user_id:
        return jsonify({"error": "No puedes cambiar la contraseña de otro usuario"}), 403
    
    req = ['contraseña_actual', 'nueva_contraseña', 'confirmar_nueva_contraseña']
    if not all(k in data for k in req):
        return jsonify({"error": "Faltan campos requeridos"}), 400
    
    if data['nueva_contraseña'] != data['confirmar_nueva_contraseña']:
        return jsonify({"error": "Las contraseñas nuevas no coinciden"}), 400
    
    if len(data['nueva_contraseña']) < 8:
        return jsonify({"error": "La nueva contraseña debe tener al menos 8 caracteres"}), 400
    
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        # Obtener contraseña actual
        cur.execute("SELECT contraseña FROM usuarios WHERE id_usuario = %s", (user_id,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        # Verificar contraseña actual
        if not check_password_hash(user['contraseña'], data['contraseña_actual']):
            return jsonify({"error": "Contraseña actual incorrecta"}), 401
        
        # Actualizar contraseña
        nueva_contraseña_hash = generate_password_hash(data['nueva_contraseña'])
        cur.execute(
            "UPDATE usuarios SET contraseña = %s WHERE id_usuario = %s",
            (nueva_contraseña_hash, user_id)
        )
        conn.commit()
        
        return jsonify({"mensaje": "Contraseña actualizada con éxito"}), 200
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# =========================================================
# FUNCIÓN AUXILIAR: Crear proyecto personal
# =========================================================
def get_or_create_personal_project(user_id, cur=None, conn=None):
    """
    Crea un proyecto personal para el usuario si no existe.
    El usuario es asignado como LÍDER de su proyecto personal.
    """
    close_conn = False
    if not conn:
        conn = get_connection()
        cur = conn.cursor()
        close_conn = True
    
    try:
        # Verificar si ya tiene un proyecto personal
        cur.execute("""
            SELECT id_proyecto 
            FROM proyectos 
            WHERE nombre = %s AND creado_por = %s
        """, (f"Mis Tareas", user_id))
        
        proyecto = cur.fetchone()
        
        if not proyecto:
            # Crear proyecto personal
            cur.execute("""
                INSERT INTO proyectos (nombre, descripcion, creado_por)
                VALUES (%s, %s, %s)
            """, (f"Mis Tareas", "Proyecto personal", user_id))
            
            proyecto_id = cur.lastrowid
            
            # Obtener id_rol de LÍDER
            cur.execute("SELECT id_rol FROM roles WHERE codigo = 'LIDER'")
            rol_lider = cur.fetchone()
            id_rol_lider = rol_lider[0] if rol_lider else 2
            
            # Agregar usuario como LÍDER del proyecto
            cur.execute("""
                INSERT INTO proyecto_miembros (id_proyecto, id_usuario, id_rol)
                VALUES (%s, %s, %s)
            """, (proyecto_id, user_id, id_rol_lider))
            
            conn.commit()
            
            return proyecto_id
        
        return proyecto[0]
        
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if close_conn:
            cur.close()
            conn.close()