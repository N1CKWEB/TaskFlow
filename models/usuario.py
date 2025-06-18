from conection.conexion import get_connection

def crear_usuario(nombre_completo, email, contraseña):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO usuarios (nombre_completo, email, contraseña) VALUES (%s, %s, %s)",
        (nombre_completo, email, contraseña)
    )
    conn.commit()
    conn.close()

def obtener_usuario(email, contraseña):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id_usuario, nombre_completo, email FROM usuarios WHERE email = %s AND contraseña = %s",
        (email, contraseña)
    )
    usuario = cursor.fetchone()
    conn.close()
    return usuario
