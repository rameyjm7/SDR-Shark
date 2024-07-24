from flask import Blueprint, jsonify, request
import pickle
import base64
from PIL import Image
from io import BytesIO
from sdr_plot_backend.utils import vars

sigid_plugin_blueprint = Blueprint('sigid_plugin', __name__)

def pil_image_to_base64(image):
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

@sigid_plugin_blueprint.route('/sigid/data')
def get_data():
    # Load the dictionary from the pickle file
    with open('/home/dev/sdcard/workspace/webapps/sigid/data_dict.pkl', 'rb') as file:
        signals_database = pickle.load(file)

    # Convert PIL images to base64 strings for JSON serialization
    for key, value in signals_database.items():
        if 'Image' in value:
            value['Image'] = pil_image_to_base64(value['Image'])

    response = {
        'signals_database': signals_database
    }
    
    return jsonify(response)
