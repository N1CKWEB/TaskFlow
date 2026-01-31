# ✅ TaskFlow – Aplicación de Gestión de Tareas (Frontend + Backend)

TaskFlow es una aplicación moderna estilo **Trello** que permite crear, visualizar, editar y eliminar tareas de forma organizada. El frontend está desarrollado con **HTML, CSS y JavaScript puro**, con una interfaz responsive, y se conecta a un backend creado en **Flask + MySQL** que maneja usuarios y tareas en una base de datos relacional.

---

## 🎨 FRONTEND – Aplicación Visual de Tareas (REACT JS )

### 🔍 Funcionalidades principales

- 📝 Crear tareas con título, descripción, prioridad y fecha de entrega
- 📋 Visualizar tareas en columnas (máx. 9 por columna)
- 🔍 Modal para ver, editar o eliminar cada tarea
- ✅ Alerta de confirmación al crear
- 🔃 Filtrado por prioridad, fecha de inicio o entrega
- 📱 Responsive para **celular, tablet y escritorio**
- 📁 Panel lateral que se **desliza tipo Trello** (☰)
- ✏️ Edición inline dentro del modal (sin `prompt`)
- 🔗 Datos sincronizados entre el frontend y el backend (con API REST)

---

### 📂 Estructura del Frontend

```
TaskFlow/
├── index.html                 # Estructura principal
├── Estilos/
│   └── style.css             # Estilos y diseño responsive
├── Dinamica/
│   └── app.js                # Lógica de tareas, panel, modal y conexión API
```

---

### 📸 Vista de la App

> 📷 Insertá una captura de pantalla aquí para mostrar cómo luce el registrarse de TaskFlow en acción.

![image](https://github.com/user-attachments/assets/6dd716f1-f522-4ffc-870e-df4614e58aa7)

> 📷 Insertá una captura de pantalla aquí para mostrar cómo luce el iniciar sesión de TaskFlow en acción.

![image](https://github.com/user-attachments/assets/e3f1b4bd-44e1-4ec6-a2a1-fe85c4c6c2fa)

> 📷 Insertá una captura de pantalla aquí para mostrar cómo luce TaskFlow en acción.

![image](https://github.com/user-attachments/assets/f2ee084d-eb67-4fee-a69b-d9a11818e45a)

---

## 🗂️ BACKEND – Gestor de Usuarios y Tareas (Flask + MySQL)

Este backend permite el registro e inicio de sesión de usuarios, así como la creación y consulta de tareas personales. Está construido en **Python** usando **Flask** y conectado a una base de datos **MySQL**, que puede ser gestionada fácilmente desde herramientas como **DBeaver**.

---

## 🚀 Funcionalidades Backend

### 👤 Usuarios

- 🧾 Registrar un nuevo usuario (nombre completo, email y contraseña)
- 🔐 Iniciar sesión con email y contraseña

### ✅ Tareas

- ➕ Crear nuevas tareas con:
  - Nombre
  - Descripción
  - Prioridad (Alta, Media o Baja)
  - Tiempo estimado
- 📄 Listar tareas del usuario logueado
- ✏️ Editar tareas desde el modal del frontend
- ❌ Eliminar tareas

---

## 📁 Estructura del Backend

```
proyecto/
├── app.py                     # Archivo principal que inicia Flask
├── conection/
│   └── conexion.py            # Función para conectar a MySQL
├── controller/
│   ├── userController.py      # Rutas para login y registro
│   └── taskController.py      # Rutas para tareas
├── models/
│   ├── usuario.py             # Modelo de datos de usuarios
│   └── taskModel.py           # Modelo de datos de tareas
```

---

## 🧰 Requisitos

- Python 3.x instalado
- MySQL instalado y funcionando
- DBeaver (opcional, para gestionar la base de datos)
- Pip (gestor de paquetes de Python)

---

## ⚙️ Instalación y Configuración

### 1. Clonar el proyecto

```bash
git clone https://github.com/tu-usuario/TaskFlow.git
cd TaskFlow
```

### 2. Instalar dependencias

```bash
pip install flask mysql-connector-python
```

### 3. Crear base de datos y tablas en MySQL

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

### 4. Configurar conexión en `conection/conexion.py`

```python
def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="tu_usuario_mysql",
        password="tu_contraseña_mysql",
        database="gestion_usuarios"
    )
```

### 5. Ejecutar la aplicación

```bash
python app.py
```

Por defecto, estará disponible en:  
📍 `http://localhost:5000`

---

## 🔗 Endpoints disponibles

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

### Obtener tareas

`GET /tareas/<id_usuario>`

---

## 📝 Notas Finales

- Las contraseñas están sin cifrar por simplicidad (pueden cifrarse con `werkzeug.security`).
- Se puede conectar fácilmente a cualquier frontend HTML/JS o app móvil.
- Código escalable para añadir nuevas funciones.

---

## 👨‍💻 Autores

Proyecto realizado por:
- Nicolás Araya  
- Matías Morán  
- Nicolás Díaz
