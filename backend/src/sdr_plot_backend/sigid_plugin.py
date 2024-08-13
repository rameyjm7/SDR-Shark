import base64
import pickle
from io import BytesIO

from flask import Blueprint, jsonify

sigid_plugin_blueprint = Blueprint('sigid_plugin', __name__)

def pil_image_to_base64(image):
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def calculate_bandwidths(data):
    peaks, properties = find_peaks(data, height=0)
    bandwidths = np.diff(peaks) if len(peaks) > 1 else [0]
    return peaks, bandwidths

@sigid_plugin_blueprint.route('/sigid/data')
def get_data():
    # Load the dictionary from the pickle file
    with open('/home/dev/sdcard/workspace/webapps/sigid/data_dict.pkl', 'rb') as file:
        signals_database = pickle.load(file)

    # Convert PIL images to base64 strings for JSON serialization
    for key, value in signals_database.items():
        if 'Image' in value:
            value['Image'] = pil_image_to_base64(value['Image'])
        if 'fft_data' in value:  # Assuming fft_data is part of the signal data
            fft_data = value['fft_data']
            peaks, bandwidths = calculate_bandwidths(fft_data)
            value['Peaks'] = peaks.tolist()
            value['Bandwidths'] = bandwidths.tolist()

    response = {
        'signals_database': signals_database
    }

    return jsonify(response)
