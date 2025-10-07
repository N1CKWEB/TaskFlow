from flask import Flask
from flask_cors import CORS
from controller.userController import user_bp
from controller.taskController import task_bp

app = Flask(__name__)
CORS(app)  # 👈 Esto permite que el frontend (127.0.0.1:5500) acceda al backend (localhost:5000)

# Registrar ambos blueprints
app.register_blueprint(user_bp)
app.register_blueprint(task_bp)

if __name__ == '__main__':
    app.run(debug=True)
