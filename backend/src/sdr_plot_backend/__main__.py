import faulthandler

from flask import Flask
from flask_cors import CORS

from sdr_plot_backend.actions import actions_blueprint
from sdr_plot_backend.api import api_blueprint
from sdr_plot_backend.file_manager import file_mgr_blueprint
from sdr_plot_backend.sigid_plugin import sigid_plugin_blueprint

faulthandler.enable()

def create_app():
    app = Flask(__name__)
    app.register_blueprint(api_blueprint)
    app.register_blueprint(actions_blueprint)
    app.register_blueprint(file_mgr_blueprint)
    app.register_blueprint(sigid_plugin_blueprint)
    CORS(app)
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host='0.0.0.0', port=5000, threaded=True)
