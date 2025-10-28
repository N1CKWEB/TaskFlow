# backend/controller/common.py
from ..conection.conexion import get_connection

def get_or_create_personal_project(user_id: int):
    """
    Devuelve (id_proyecto, 'LIDER') del proyecto personal del usuario.
    Si no existe, lo crea y lo asocia como LÍDER.
    """
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
          SELECT p.id_proyecto
          FROM proyectos p
          JOIN proyecto_miembros pm ON pm.id_proyecto = p.id_proyecto
          JOIN roles r ON r.id_rol = pm.id_rol
          WHERE p.creado_por = %s
            AND pm.id_usuario = %s
            AND r.codigo = 'LIDER'
          ORDER BY p.fecha_creacion ASC
          LIMIT 1
        """, (user_id, user_id))
        row = cur.fetchone()
        if row:
            return row['id_proyecto'], 'LIDER'

        # crear proyecto personal
        cur.execute("""
            INSERT INTO proyectos (nombre, descripcion, creado_por)
            VALUES (%s, %s, %s)
        """, (f"Personal-{user_id}", "Proyecto personal automático", user_id))
        project_id = cur.lastrowid

        # id rol LIDER
        cur.execute("SELECT id_rol FROM roles WHERE codigo='LIDER'")
        id_rol = cur.fetchone()['id_rol']

        # asociar como miembro LIDER
        cur.execute("""
            INSERT INTO proyecto_miembros (id_proyecto, id_usuario, id_rol)
            VALUES (%s, %s, %s)
        """, (project_id, user_id, id_rol))

        conn.commit()
        return project_id, 'LIDER'
    finally:
        cur.close(); conn.close()


def user_is_leader_of_task(user_id: int, id_tarea: int) -> bool:
    """True si el usuario es LÍDER del proyecto al que pertenece la tarea."""
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute("""
          SELECT r.codigo
          FROM tareas t
          JOIN proyecto_miembros pm ON pm.id_proyecto = t.id_proyecto
          JOIN roles r ON r.id_rol = pm.id_rol
          WHERE t.id_tarea = %s
            AND pm.id_usuario = %s
          LIMIT 1
        """, (id_tarea, user_id))
        row = cur.fetchone()
        return bool(row and row['codigo'] == 'LIDER')
    finally:
        cur.close(); conn.close()
