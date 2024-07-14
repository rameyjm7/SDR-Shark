from flask import Flask
from python_flask_simple.api import api_blueprint

def create_app():
    app = Flask(__name__)
    app.register_blueprint(api_blueprint)
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=6000, threaded=True)
    