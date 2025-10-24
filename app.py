from flask import Flask
from flask_cors import CORS

# Agregá el prefijo 'backend.' porque app.py está en la raíz del proyecto
from backend.controller.userController import user_bp
from backend.controller.taskController import task_bp
# (si tenés más blueprints, también con “backend.controller”)
#from backend.controller.proyectController import proyect_bp
#from backend.controller.auth_middleware import auth_middleware
from flask_jwt_extended import JWTManager

from flask import Flask
from flask_cors import CORS



app = Flask(__name__)
CORS(app)

app.register_blueprint(user_bp)
app.register_blueprint(task_bp)

if __name__ == '__main__':
    app.run(debug=True)

app = Flask(__name__)
CORS(app)

# Clave para JWT (en prod, usar variable de entorno)
app.config["JWT_SECRET_KEY"] = "dev-secret-change-me"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 60 * 60 * 6  # 6 hs

jwt = JWTManager(app)

# Blueprints
app.register_blueprint(user_bp, url_prefix="/api")
app.register_blueprint(project_bp, url_prefix="/api")
app.register_blueprint(task_bp, url_prefix="/api")

@app.route('/')
def home():
    return "✅ Servidor Flask corriendo correctamente - TaskFlow Backend"
