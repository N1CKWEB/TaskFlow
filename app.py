from flask import Flask
from controller.userController import user_bp
from controller.taskController import task_bp  # <== IMPORTANTE

app = Flask(__name__)

# Registrar ambos blueprints
app.register_blueprint(user_bp)
app.register_blueprint(task_bp)

if __name__ == '__main__':
    app.run(debug=True)
