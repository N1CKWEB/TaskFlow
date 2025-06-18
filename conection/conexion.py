import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",          # Cambiar si usás otro host
        user="root",         # Usuario de MySQL
        password="rootnico",  # Contraseña del usuario
        database="gestor_agenda"      # Tu base creada desde DBeaver
    )
