from flask import Flask
from sdr_plot_backend.api import api_blueprint
from sdr_plot_backend.actions import actions_blueprint
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.register_blueprint(api_blueprint)
    app.register_blueprint(actions_blueprint)
    CORS(app)
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=5000, threaded=True)
    