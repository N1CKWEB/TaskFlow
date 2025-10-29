# backend/model/taskModel.py
from conection.conexion import get_connection

# ================== FUNCIONES PARA TAREAS ==================

def crear_tarea(nombre, descripcion, prioridad, tiempo_estimado, id_usuario, id_proyecto, estado='PENDIENTE'):
    """
    Inserta una nueva tarea en la base de datos, asociada a un usuario y proyecto.
    
    Args:
        nombre: Nombre de la tarea
        descripcion: Descripción detallada
        prioridad: 'Alta', 'Media' o 'Baja'
        tiempo_estimado: Tiempo estimado para completar
        id_usuario: ID del usuario responsable
        id_proyecto: ID del proyecto al que pertenece
        estado: 'PENDIENTE', 'EN_PROGRESO' o 'HECHA' (default: PENDIENTE)
    
    Returns:
        int: ID de la tarea creada
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO tareas (nombre, descripcion, prioridad, tiempo_estimado, 
                              id_usuario, id_proyecto, estado)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (nombre, descripcion, prioridad, tiempo_estimado, id_usuario, id_proyecto, estado))
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def obtener_tareas_por_usuario(id_usuario):
    """
    Devuelve todas las tareas del proyecto personal de un usuario.
    
    Args:
        id_usuario: ID del usuario
    
    Returns:
        list: Lista de tareas con información completa
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT t.*, 
                   u.nombre_completo as nombre_usuario,
                   p.nombre as nombre_proyecto
            FROM tareas t
            LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
            LEFT JOIN proyectos p ON t.id_proyecto = p.id_proyecto
            WHERE t.id_usuario = %s
            ORDER BY t.fecha_creacion DESC
        """, (id_usuario,))
        return cursor.fetchall()
    finally:
        conn.close()


def obtener_tareas_por_proyecto(id_proyecto):
    """
    Devuelve todas las tareas de un proyecto específico.
    
    Args:
        id_proyecto: ID del proyecto
    
    Returns:
        list: Lista de tareas del proyecto
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT t.*, 
                   u.nombre_completo as nombre_usuario
            FROM tareas t
            LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
            WHERE t.id_proyecto = %s
            ORDER BY t.fecha_creacion DESC
        """, (id_proyecto,))
        return cursor.fetchall()
    finally:
        conn.close()


def obtener_tarea_por_id(id_tarea):
    """
    Obtiene una tarea específica por su ID con toda su información.
    
    Args:
        id_tarea: ID de la tarea
    
    Returns:
        dict: Información completa de la tarea o None si no existe
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT t.*, 
                   u.nombre_completo as nombre_usuario,
                   p.nombre as nombre_proyecto
            FROM tareas t
            LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
            LEFT JOIN proyectos p ON t.id_proyecto = p.id_proyecto
            WHERE t.id_tarea = %s
        """, (id_tarea,))
        return cursor.fetchone()
    finally:
        conn.close()


def obtener_tareas_por_estado(id_proyecto, estado):
    """
    Filtra tareas de un proyecto por su estado.
    
    Args:
        id_proyecto: ID del proyecto
        estado: 'PENDIENTE', 'EN_PROGRESO' o 'HECHA'
    
    Returns:
        list: Tareas filtradas por estado
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT t.*, 
                   u.nombre_completo as nombre_usuario
            FROM tareas t
            LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
            WHERE t.id_proyecto = %s AND t.estado = %s
            ORDER BY t.fecha_creacion DESC
        """, (id_proyecto, estado))
        return cursor.fetchall()
    finally:
        conn.close()


def obtener_tareas_por_prioridad(id_proyecto, prioridad):
    """
    Filtra tareas de un proyecto por prioridad.
    
    Args:
        id_proyecto: ID del proyecto
        prioridad: 'Alta', 'Media' o 'Baja'
    
    Returns:
        list: Tareas filtradas por prioridad
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT t.*, 
                   u.nombre_completo as nombre_usuario
            FROM tareas t
            LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
            WHERE t.id_proyecto = %s AND t.prioridad = %s
            ORDER BY t.fecha_creacion DESC
        """, (id_proyecto, prioridad))
        return cursor.fetchall()
    finally:
        conn.close()


def actualizar_tarea(id_tarea, **campos):
    """
    Actualiza campos específicos de una tarea de forma dinámica.
    
    Args:
        id_tarea: ID de la tarea a actualizar
        **campos: Campos a actualizar (nombre, descripcion, prioridad, 
                 tiempo_estimado, estado, id_usuario)
    
    Returns:
        bool: True si se actualizó, False si no existe la tarea
    
    Ejemplo:
        actualizar_tarea(1, nombre="Nueva tarea", estado="EN_PROGRESO")
    """
    if not campos:
        return False
    
    # Campos permitidos para actualizar
    campos_permitidos = {'nombre', 'descripcion', 'prioridad', 'tiempo_estimado', 
                        'estado', 'id_usuario'}
    campos_validos = {k: v for k, v in campos.items() if k in campos_permitidos}
    
    if not campos_validos:
        return False
    
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Construir query dinámicamente
        set_clause = ', '.join([f"{k} = %s" for k in campos_validos.keys()])
        valores = list(campos_validos.values()) + [id_tarea]
        
        cursor.execute(f"""
            UPDATE tareas
            SET {set_clause}
            WHERE id_tarea = %s
        """, valores)
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def actualizar_estado_tarea(id_tarea, estado):
    """
    Actualiza solo el estado de una tarea.
    
    Args:
        id_tarea: ID de la tarea
        estado: 'PENDIENTE', 'EN_PROGRESO' o 'HECHA'
    
    Returns:
        bool: True si se actualizó correctamente
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE tareas
            SET estado = %s
            WHERE id_tarea = %s
        """, (estado, id_tarea))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def eliminar_tarea(id_tarea):
    """
    Elimina una tarea por su ID.
    Las condiciones de aceptación se eliminan automáticamente (CASCADE).
    
    Args:
        id_tarea: ID de la tarea a eliminar
    
    Returns:
        bool: True si se eliminó, False si no existía
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM tareas WHERE id_tarea = %s", (id_tarea,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


# ================== FUNCIONES PARA CONDICIONES DE ACEPTACIÓN ==================

def crear_condicion_aceptacion(id_tarea, texto_condicion):
    """
    Crea una condición de aceptación para una tarea.
    
    Args:
        id_tarea: ID de la tarea
        texto_condicion: Texto de la condición
    
    Returns:
        int: ID de la condición creada
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO condiciones_aceptacion (id_tarea, texto_condicion)
            VALUES (%s, %s)
        """, (id_tarea, texto_condicion))
        conn.commit()
        return cursor.lastrowid
    finally:
        conn.close()


def obtener_condiciones_tarea(id_tarea):
    """
    Obtiene todas las condiciones de aceptación de una tarea.
    
    Args:
        id_tarea: ID de la tarea
    
    Returns:
        list: Lista de condiciones de aceptación
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT id_condicion, texto_condicion
            FROM condiciones_aceptacion
            WHERE id_tarea = %s
            ORDER BY id_condicion
        """, (id_tarea,))
        return cursor.fetchall()
    finally:
        conn.close()


def actualizar_condicion_aceptacion(id_condicion, texto_condicion):
    """
    Actualiza el texto de una condición de aceptación.
    
    Args:
        id_condicion: ID de la condición
        texto_condicion: Nuevo texto
    
    Returns:
        bool: True si se actualizó correctamente
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE condiciones_aceptacion
            SET texto_condicion = %s
            WHERE id_condicion = %s
        """, (texto_condicion, id_condicion))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def eliminar_condicion_aceptacion(id_condicion):
    """
    Elimina una condición de aceptación específica.
    
    Args:
        id_condicion: ID de la condición a eliminar
    
    Returns:
        bool: True si se eliminó correctamente
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            DELETE FROM condiciones_aceptacion
            WHERE id_condicion = %s
        """, (id_condicion,))
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def eliminar_todas_condiciones_tarea(id_tarea):
    """
    Elimina todas las condiciones de aceptación de una tarea.
    
    Args:
        id_tarea: ID de la tarea
    
    Returns:
        int: Número de condiciones eliminadas
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            DELETE FROM condiciones_aceptacion
            WHERE id_tarea = %s
        """, (id_tarea,))
        conn.commit()
        return cursor.rowcount
    finally:
        conn.close()


def reemplazar_condiciones_tarea(id_tarea, lista_condiciones):
    """
    Reemplaza todas las condiciones de una tarea con una nueva lista.
    
    Args:
        id_tarea: ID de la tarea
        lista_condiciones: Lista de strings con las nuevas condiciones
    
    Returns:
        int: Número de condiciones creadas
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Eliminar condiciones existentes
        cursor.execute("""
            DELETE FROM condiciones_aceptacion
            WHERE id_tarea = %s
        """, (id_tarea,))
        
        # Insertar nuevas condiciones
        count = 0
        for condicion in lista_condiciones:
            cursor.execute("""
                INSERT INTO condiciones_aceptacion (id_tarea, texto_condicion)
                VALUES (%s, %s)
            """, (id_tarea, condicion))
            count += 1
        
        conn.commit()
        return count
    finally:
        conn.close()


# ================== FUNCIONES DE ESTADÍSTICAS ==================

def obtener_estadisticas_proyecto(id_proyecto):
    """
    Obtiene estadísticas de las tareas de un proyecto.
    
    Args:
        id_proyecto: ID del proyecto
    
    Returns:
        dict: Estadísticas (total, por estado, por prioridad)
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'EN_PROGRESO' THEN 1 ELSE 0 END) as en_progreso,
                SUM(CASE WHEN estado = 'HECHA' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN prioridad = 'Alta' THEN 1 ELSE 0 END) as prioridad_alta,
                SUM(CASE WHEN prioridad = 'Media' THEN 1 ELSE 0 END) as prioridad_media,
                SUM(CASE WHEN prioridad = 'Baja' THEN 1 ELSE 0 END) as prioridad_baja
            FROM tareas
            WHERE id_proyecto = %s
        """, (id_proyecto,))
        return cursor.fetchone()
    finally:
        conn.close()


def contar_tareas_por_usuario(id_usuario):
    """
    Cuenta las tareas asignadas a un usuario (en todos los proyectos).
    
    Args:
        id_usuario: ID del usuario
    
    Returns:
        dict: Conteo de tareas por estado
    """
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'PENDIENTE' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'EN_PROGRESO' THEN 1 ELSE 0 END) as en_progreso,
                SUM(CASE WHEN estado = 'HECHA' THEN 1 ELSE 0 END) as completadas
            FROM tareas
            WHERE id_usuario = %s
        """, (id_usuario,))
        return cursor.fetchone()
    finally:
        conn.close()


# ================== FUNCIONES AUXILIARES ==================

def existe_tarea(id_tarea):
    """
    Verifica si existe una tarea con el ID dado.
    
    Args:
        id_tarea: ID de la tarea
    
    Returns:
        bool: True si existe, False si no
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT 1 FROM tareas WHERE id_tarea = %s", (id_tarea,))
        return cursor.fetchone() is not None
    finally:
        conn.close()


def obtener_proyecto_de_tarea(id_tarea):
    """
    Obtiene el ID del proyecto al que pertenece una tarea.
    
    Args:
        id_tarea: ID de la tarea
    
    Returns:
        int: ID del proyecto o None si no existe la tarea
    """
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id_proyecto FROM tareas WHERE id_tarea = %s", (id_tarea,))
        result = cursor.fetchone()
        return result[0] if result else None
    finally:
        conn.close()


def validar_estado(estado):
    """
    Valida si un estado es válido.
    
    Args:
        estado: Estado a validar
    
    Returns:
        bool: True si es válido
    """
    return estado in ['PENDIENTE', 'EN_PROGRESO', 'HECHA']


def validar_prioridad(prioridad):
    """
    Valida si una prioridad es válida.
    
    Args:
        prioridad: Prioridad a validar
    
    Returns:
        bool: True si es válida
    """
    return prioridad in ['Alta', 'Media', 'Baja']