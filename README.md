
# 🗂️ Backend - Gestor de Usuarios y Tareas (Flask + MySQL)

Este backend permite el registro e inicio de sesión de usuarios, así como la creación y consulta de tareas personales. Está construido en Python usando **Flask** y conectado a una base de datos **MySQL**, que puede ser gestionada fácilmente desde herramientas como **DBeaver**.

---

## 🚀 Funcionalidades

### 👤 Usuarios
- Registrar un nuevo usuario (nombre completo, email y contraseña)
- Iniciar sesión con email y contraseña

### ✅ Tareas
- Crear nuevas tareas con:
  - Nombre
  - Descripción
  - Prioridad (Alta, Media o Baja)
  - Tiempo estimado
- Listar tareas del usuario logueado

---

## 📁 Estructura del Proyecto

```
proyecto/
├── app.py                     # Archivo principal que inicia Flask
├── conection/
│   └── conexion.py            # Función para conectar a MySQL
├── controller/
│   └── userController.py      # Rutas para login y registro
│   └── taskController.py      # Rutas para tareas
├── models/
│   └── usuario.py             # Modelo de datos de usuarios
│   └── taskModel.py           # Modelo de datos de tareas
```

---

## 🧰 Requisitos

- Python 3.x instalado
- MySQL instalado y funcionando
- DBeaver (opcional, para gestionar la base de datos)
- Pip (gestor de paquetes de Python)

---

## 🔧 Instalación y configuración

1. **Cloná o copiá el proyecto**

2. **Instalá las dependencias**

```bash
pip install flask mysql-connector-python
```

3. **Crear base de datos y tablas en MySQL**

Abrí tu cliente (como DBeaver) y ejecutá:

```sql
CREATE DATABASE gestion_usuarios;
USE gestion_usuarios;

-- Tabla de usuarios
CREATE TABLE usuarios (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  nombre_completo VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(100) NOT NULL,
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tareas
CREATE TABLE tareas (
  id_tarea INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  prioridad ENUM('Alta', 'Media', 'Baja') NOT NULL,
  tiempo_estimado VARCHAR(20) NOT NULL,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  id_usuario INT,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);
```

4. **Configurá la conexión en `conection/conexion.py`**

```python
def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="tu_usuario_mysql",
        password="tu_contraseña_mysql",
        database="gestion_usuarios"
    )
```

5. **Ejecutá la app**

Desde la terminal:

```bash
python app.py
```

Por defecto, el servidor Flask se inicia en:

```
http://localhost:5000
```

---

## 🧪 Endpoints disponibles

### Registro de usuario
`POST /usuarios`

```json
{
  "nombre_completo": "Ana Pérez",
  "email": "ana@gmail.com",
  "contraseña": "1234",
  "confirmar_contraseña": "1234"
}
```

### Login de usuario
`POST /login`

```json
{
  "email": "ana@gmail.com",
  "contraseña": "1234"
}
```

### Crear tarea
`POST /tareas`

```json
{
  "nombre": "Estudiar",
  "descripcion": "Leer capítulo 3",
  "prioridad": "Alta",
  "tiempo_estimado": "01:30",
  "id_usuario": 1
}
```

### Obtener tareas de un usuario
`GET /tareas/<id_usuario>`

---

## 📌 Notas finales

- Las contraseñas están sin cifrar por simplicidad (pueden cifrarse con `werkzeug.security` en el futuro).
- Se puede integrar fácilmente con un frontend HTML + JS o una app móvil.
- El código está preparado para escalar con más funcionalidades si lo necesitás.

---

## 🧑‍💻 Autor
Proyecto desarrollado como práctica para arquitectura de software y gestión de tareas personales.
