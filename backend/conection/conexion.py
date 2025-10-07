import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",          # Cambiar si usás otro host
        user="root",         # Usuario de MySQL
        password="root",  # Contraseña del usuario
        database="gestion_usuarios"      # Tu base creada desde DBeaver
    )
