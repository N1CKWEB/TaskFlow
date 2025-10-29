# backend/controller/projectController.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.conection.conexion import get_connection
from backend.controller.auth_middleware import require_project_role

project_bp = Blueprint('project_bp', __name__)


@project_bp.route('/proyectos', methods=['POST'])
@jwt_required()
def crear_proyecto():
    """
    Crea un proyecto con título y miembros del equipo (solo nombres).
    Solo usuarios con rol LIDER o ADMIN pueden crear proyectos.
    """
    user_id = int(get_jwt_identity())  # ✅ Convertir a int
    
    # Verificar que el usuario sea LIDER o ADMIN
    conn = get_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT r.codigo 
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = %s
    """, (user_id,))
    
    rol = cur.fetchone()
    
    if not rol or rol[0] not in ['LIDER', 'ADMIN']:
        cur.close()
        conn.close()
        return jsonify({
            "error": "No tienes permisos para crear proyectos. Solo LIDER o ADMIN."
        }), 403
    
    # Obtener datos del request
    data = request.get_json() or {}
    
    titulo = data.get("titulo", "").strip()
    nombre_dueno = data.get("nombre_dueno", "").strip()
    nombre_lider_tecnico = data.get("nombre_lider_tecnico", "").strip()
    desarrolladores = data.get("desarrolladores", [])  # Lista de strings
    
    # Validaciones
    if not titulo:
        cur.close()
        conn.close()
        return jsonify({"error": "El título del proyecto es requerido"}), 400
    
    try:
        # 1. Crear el proyecto
        cur.execute(
            """INSERT INTO proyectos (nombre, descripcion, creado_por) 
               VALUES (%s, %s, %s)""",
            (titulo, f"Dueño: {nombre_dueno}, Líder: {nombre_lider_tecnico}", user_id)
        )
        project_id = cur.lastrowid
        
        # 2. Agregar al creador como LIDER del proyecto
        cur.execute("SELECT id_rol FROM roles WHERE codigo='LIDER'")
        id_rol_lider = cur.fetchone()[0]
        
        cur.execute(
            """INSERT INTO proyecto_miembros (id_proyecto, id_usuario, id_rol)
               VALUES (%s, %s, %s)""",
            (project_id, user_id, id_rol_lider)
        )
        
        conn.commit()
        
        return jsonify({
            "id_proyecto": project_id,
            "mensaje": "Proyecto creado exitosamente",
            "titulo": titulo,
            "nombre_dueno": nombre_dueno,
            "nombre_lider_tecnico": nombre_lider_tecnico,
            "desarrolladores": desarrolladores
        }), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@project_bp.route('/proyectos', methods=['GET'])
@jwt_required()
def mis_proyectos():
    """
    Lista todos los proyectos donde el usuario es miembro.
    Cualquier usuario puede ver sus proyectos.
    """
    user_id = int(get_jwt_identity())  # ✅ Convertir a int
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    
    cur.execute("""
        SELECT 
            p.id_proyecto, 
            p.nombre AS titulo,
            p.descripcion,
            p.fecha_creacion,
            r.codigo AS mi_rol,
            r.nombre AS nombre_rol
        FROM proyectos p
        JOIN proyecto_miembros pm ON pm.id_proyecto = p.id_proyecto
        JOIN roles r ON r.id_rol = pm.id_rol
        WHERE pm.id_usuario = %s
        ORDER BY p.fecha_creacion DESC
    """, (user_id,))
    
    proyectos = cur.fetchall()
    cur.close()
    conn.close()
    
    return jsonify({
        "total": len(proyectos),
        "proyectos": proyectos
    }), 200


@project_bp.route('/proyectos/<int:id_proyecto>', methods=['GET'])
@jwt_required()
def detalle_proyecto(id_proyecto):
    """
    Obtiene los detalles de un proyecto específico.
    """
    user_id = int(get_jwt_identity())  # ✅ Convertir a int
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    
    # Verificar que el usuario sea miembro del proyecto
    cur.execute("""
        SELECT pm.id_usuario
        FROM proyecto_miembros pm
        WHERE pm.id_proyecto = %s AND pm.id_usuario = %s
    """, (id_proyecto, user_id))
    
    if not cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"error": "No tienes acceso a este proyecto"}), 403
    
    # Obtener información del proyecto
    cur.execute("""
        SELECT 
            p.id_proyecto,
            p.nombre AS titulo,
            p.descripcion,
            p.fecha_creacion,
            u.nombre_completo AS creador
        FROM proyectos p
        JOIN usuarios u ON p.creado_por = u.id_usuario
        WHERE p.id_proyecto = %s
    """, (id_proyecto,))
    
    proyecto = cur.fetchone()
    
    if not proyecto:
        cur.close()
        conn.close()
        return jsonify({"error": "Proyecto no encontrado"}), 404
    
    # Obtener miembros del proyecto
    cur.execute("""
        SELECT 
            u.id_usuario,
            u.nombre_completo,
            u.email,
            r.codigo AS rol,
            r.nombre AS nombre_rol
        FROM proyecto_miembros pm
        JOIN usuarios u ON pm.id_usuario = u.id_usuario
        JOIN roles r ON pm.id_rol = r.id_rol
        WHERE pm.id_proyecto = %s
        ORDER BY 
            CASE r.codigo 
                WHEN 'LIDER' THEN 1
                WHEN 'ADMIN' THEN 2
                WHEN 'MIEMBRO' THEN 3
            END
    """, (id_proyecto,))
    
    miembros = cur.fetchall()
    proyecto['miembros'] = miembros
    
    cur.close()
    conn.close()
    
    return jsonify(proyecto), 200


@project_bp.route('/proyectos/<int:id_proyecto>/miembros', methods=['POST'])
@jwt_required()
@require_project_role(['LIDER', 'ADMIN'])
def agregar_miembro(id_proyecto):
    """
    Agrega un miembro existente al proyecto.
    Solo LIDER o ADMIN del proyecto pueden hacerlo.
    """
    data = request.get_json() or {}
    email_usuario = data.get("email")
    rol = data.get("rol", "MIEMBRO")
    
    if not email_usuario:
        return jsonify({"error": "Email del usuario es requerido"}), 400
    
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        # Buscar usuario por email
        cur.execute(
            "SELECT id_usuario FROM usuarios WHERE email = %s",
            (email_usuario,)
        )
        usuario = cur.fetchone()
        
        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        id_usuario = usuario[0]
        
        # Obtener id_rol
        cur.execute("SELECT id_rol FROM roles WHERE codigo = %s", (rol,))
        row_rol = cur.fetchone()
        
        if not row_rol:
            return jsonify({"error": "Rol inválido"}), 400
        
        id_rol = row_rol[0]
        
        # Agregar miembro al proyecto
        cur.execute(
            """INSERT INTO proyecto_miembros (id_proyecto, id_usuario, id_rol)
               VALUES (%s, %s, %s)
               ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol)""",
            (id_proyecto, id_usuario, id_rol)
        )
        
        conn.commit()
        return jsonify({"mensaje": "Miembro agregado exitosamente"}), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


@project_bp.route('/usuarios/buscar', methods=['GET'])
@jwt_required()
def buscar_usuarios():
    """
    Busca usuarios por email o nombre para agregar a proyectos.
    """
    query = request.args.get('q', '').strip()
    
    if len(query) < 2:
        return jsonify({"error": "La búsqueda debe tener al menos 2 caracteres"}), 400
    
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    
    cur.execute("""
        SELECT 
            id_usuario,
            nombre_completo,
            email,
            r.nombre AS rol
        FROM usuarios u
        JOIN roles r ON u.id_rol = r.id_rol
        WHERE 
            u.email LIKE %s 
            OR u.nombre_completo LIKE %s
        LIMIT 10
    """, (f"%{query}%", f"%{query}%"))
    
    usuarios = cur.fetchall()
    cur.close()
    conn.close()
    
    return jsonify(usuarios), 200

@project_bp.route('/proyectos/<int:id_proyecto>/miembros/<int:id_usuario>', methods=['DELETE'])
@jwt_required()
@require_project_role(['LIDER', 'ADMIN'])
def eliminar_miembro(id_proyecto, id_usuario):
    """
    Elimina un miembro del proyecto.
    Solo LIDER o ADMIN del proyecto pueden hacerlo.
    No se puede eliminar al creador del proyecto.
    """
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    
    try:
        # Verificar que no sea el creador del proyecto
        cur.execute(
            "SELECT creado_por FROM proyectos WHERE id_proyecto = %s",
            (id_proyecto,)
        )
        proyecto = cur.fetchone()
        
        if not proyecto:
            return _json_error("Proyecto no encontrado", 404)
        
        if proyecto['creado_por'] == id_usuario:
            return _json_error("No puedes eliminar al creador del proyecto", 400)
        
        # Eliminar miembro
        cur.execute(
            """DELETE FROM proyecto_miembros 
               WHERE id_proyecto = %s AND id_usuario = %s""",
            (id_proyecto, id_usuario)
        )
        
        if cur.rowcount == 0:
            return _json_error("El usuario no es miembro del proyecto", 404)
        
        conn.commit()
        return jsonify({"mensaje": "Miembro eliminado exitosamente"}), 200
        
    except Exception as e:
        conn.rollback()
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()



@project_bp.route('/proyectos/<int:id_proyecto>', methods=['DELETE'])
@jwt_required()
def eliminar_proyecto(id_proyecto):
    """
    Elimina un proyecto completo.
    Solo el creador del proyecto o un ADMIN global pueden eliminarlo.
    Esto eliminará en cascada: tareas, miembros, etc.
    """
    user_id = int(get_jwt_identity())
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    
    try:
        # Verificar que el proyecto existe
        cur.execute(
            "SELECT creado_por FROM proyectos WHERE id_proyecto = %s",
            (id_proyecto,)
        )
        proyecto = cur.fetchone()
        
        if not proyecto:
            return _json_error("Proyecto no encontrado", 404)
        
        # Verificar permisos: creador o ADMIN global
        es_creador = proyecto['creado_por'] == user_id
        es_admin = _user_is_global_admin(cur, user_id)
        
        if not (es_creador or es_admin):
            return _json_error("Solo el creador o un ADMIN pueden eliminar este proyecto", 403)
        
        # Eliminar proyecto (CASCADE eliminará tareas y miembros automáticamente)
        cur.execute("DELETE FROM proyectos WHERE id_proyecto = %s", (id_proyecto,))
        conn.commit()
        
        return jsonify({
            "mensaje": "Proyecto eliminado exitosamente",
            "id_proyecto": id_proyecto
        }), 200
        
    except Exception as e:
        conn.rollback()
        return _json_error(str(e), 500)
    finally:
        cur.close()
        conn.close()
