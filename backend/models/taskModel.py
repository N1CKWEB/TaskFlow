from conection.conexion import get_connection

# 🟢 Crear una nueva tarea
def crear_tarea(nombre, descripcion, prioridad, tiempo_estimado, id_usuario):
    """
    Inserta una nueva tarea en la base de datos, asociada a un usuario.
    """
    # 1. Conectar con la base
    conn = get_connection()
    cursor = conn.cursor()

    # 2. Ejecutar la consulta de inserción
    cursor.execute(
        "INSERT INTO tareas (nombre, descripcion, prioridad, tiempo_estimado, id_usuario) VALUES (%s, %s, %s, %s, %s)",
        (nombre, descripcion, prioridad, tiempo_estimado, id_usuario)
    )

    # 3. Guardar y cerrar
    conn.commit()
    conn.close()


# 🔵 Obtener todas las tareas de un usuario
def obtener_tareas(id_usuario):
    """
    Devuelve todas las tareas asociadas al usuario dado por su ID.
    """
    # 1. Conectar con la base
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # 2. Ejecutar la consulta
    cursor.execute("SELECT * FROM tareas WHERE id_usuario = %s", (id_usuario,))

    # 3. Obtener resultados
    tareas = cursor.fetchall()

    # 4. Cerrar conexión y devolver
    conn.close()
    return tareas


def actualizar_tarea_por_id(id_tarea, nombre, descripcion, prioridad, tiempo_estimado, id_usuario):
    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute("""
            UPDATE tareas
            SET nombre = %s,
                descripcion = %s,
                prioridad = %s,
                tiempo_estimado = %s,
                id_usuario = %s
            WHERE id_tarea = %s
        """, (nombre, descripcion, prioridad, tiempo_estimado, id_usuario, id_tarea))
    conn.commit()
    conn.close()
