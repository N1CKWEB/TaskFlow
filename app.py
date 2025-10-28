# app.py
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# IMPORTA TUS BLUEPRINTS
from backend.controller.userController import user_bp
from backend.controller.taskController import task_bp
from backend.controller.proyectController import project_bp  as proyect_bp

app = Flask(__name__)

# --- Config JWT ---
app.config["JWT_SECRET_KEY"] = "cambia-esto-por-una-clave-larga-y-secreta"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
# Opcional:
app.config["JSON_AS_ASCII"] = False

# --- Inicializaciones ---
jwt = JWTManager(app)          # <<<< INICIALIZA JWT
CORS(app, supports_credentials=True,
     origins=[
       "http://127.0.0.1:5173", "http://localhost:5173",
       "http://127.0.0.1:3000", "http://localhost:3000"
     ])

# --- Blueprints ---
app.register_blueprint(user_bp)
app.register_blueprint(task_bp)
app.register_blueprint(proyect_bp)

# --- Rutas utiles / health ---
@app.get("/")
def ok():
    return jsonify(ok=True)

# --- Handlers JWT (opcionales pero útiles) ---
@jwt.unauthorized_loader
def jwt_unauth(err):
    return jsonify(error="Falta header Authorization Bearer"), 401

@jwt.invalid_token_loader
def jwt_invalid(err):
    return jsonify(error="Token inválido"), 401

@jwt.expired_token_loader
def jwt_expired(jwt_header, jwt_data):
    return jsonify(error="Token expirado"), 401

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)