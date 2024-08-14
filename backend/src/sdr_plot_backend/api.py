import atexit
import threading
import time
from collections import deque
from datetime import datetime
from werkzeug.utils import secure_filename
import os
import numpy as np
import json
from flask import Blueprint, jsonify, request, current_app, Response
from numba import jit

from sdr_plot_backend.signal_utils import perform_and_refine_scan, PeakDetector  # Import the new utility
from sdr_plot_backend.utils import vars

api_blueprint = Blueprint('api', __name__)

sample_buffer = np.zeros(vars.sample_size, dtype=np.complex64)  # Increase buffer size to decrease RBW
data_buffer = deque(maxlen=vars.sdr_averagingCount())
waterfall_buffer = deque(maxlen=100)  # Buffer for waterfall data
waterfall_buffer2 = deque(maxlen=100)  # Buffer for waterfall data

data_lock = threading.Lock()
fft_data = {
    'original_fft': [],
    'original_fft2': [],
    'peaks': [],
}
running = True

@jit(nopython=True)
def downsample(data, target_length=256):
    step = len(data) / target_length
    downsampled = np.zeros(target_length, dtype=np.float64)
    for i in range(target_length):
        start = int(i * step)
        end = int((i + 1) * step)
        chunk = data[start:end]
        avg = np.mean(chunk)
        downsampled[i] = avg
    return downsampled

def capture_samples():
    global sample_buffer
    while vars.sdr0 is None:
        time.sleep(0.1)
    sample_buffer = vars.sdr0.get_latest_samples()

def process_fft(samples):
    fft_result = np.fft.fftshift(np.fft.fft(samples))
    fft_magnitude = 20 * np.log10(np.abs(fft_result))
    return fft_magnitude

def generate_fft_data():
    full_fft = []
    sdr_name = "sidekiq"
    current_freq = vars.sweep_settings['frequency_start']
    while running:
        start_time = time.time()
        capture_samples()
        current_fft = process_fft(sample_buffer)
        
        if vars.dc_suppress:
            dc_index = len(current_fft) // 2
            current_fft[dc_index] = current_fft[dc_index + 1]

        # Normalize infinity values
        current_fft = np.where(np.isinf(current_fft), -20, current_fft)
        
        if vars.sweeping_enabled:
            # Append the current FFT to the full FFT for the sweep
            if len(full_fft) == 0:
                full_fft = current_fft
            else:
                full_fft = np.concatenate((full_fft, current_fft))

            # Tune to the next frequency
            current_freq += 60e6
            if current_freq > vars.sweep_settings['frequency_stop']:
                current_freq = vars.sweep_settings['frequency_start']
                # Complete sweep, deliver the full FFT
                averaged_fft = np.array(full_fft)
                downsampled_fft = downsample(averaged_fft, len(current_fft))  # Downsample to match the normal FFT size

                with data_lock:
                    fft_data['original_fft'] = downsampled_fft.tolist()
                    waterfall_buffer.append(downsample(downsampled_fft).tolist())
                
                full_fft = []  # Clear the full FFT for the next sweep
            vars.sdr_settings[sdr_name].frequency = current_freq
            vars.sdr0.set_frequency(current_freq)
            time.sleep(0.05)
        else:
            # Normal operation without sweeping
            if len(full_fft) == 0:
                full_fft = current_fft
            else:
                full_fft = (full_fft[:vars.sample_size] * \
                    ( vars.sdr_settings[sdr_name].averagingCount - 1) + current_fft) / vars.sdr_settings[sdr_name].averagingCount
                # dc_index = int(len(full_fft)/2)-1
                # full_fft[dc_index] = full_fft[dc_index+1]

            with data_lock:
                fft_data['original_fft'] = full_fft.tolist()
                waterfall_buffer.append(downsample(full_fft).tolist())

def radio_scanner():
    nfft = 8*1024
    detector = PeakDetector(sdr=vars.sdr1,averaging_count=30,nfft=nfft)
    detector.start_receiving_data()
    sdr_name = "hackrf"
    while running:
        detector.set_averaging(vars.sdr_settings[sdr_name].averagingCount)
        detected_peaks = detector.detect_signal_peaks(
            vars.sdr_frequency(),
            sample_rate=20e6,
            fft_size=nfft,  # wide_fft_size
            min_peak_distance=80,
            threshold_offset=5
        )
        if detected_peaks:
            with data_lock:
                fft_data['original_fft2'] = detector.get_latest_data()
                fft_data['peaks'] = detected_peaks
                fft_array = np.array(fft_data['original_fft2'])
                waterfall_buffer2.append(downsample(fft_array).tolist())
    detector.stop_receiving_data()
         
fft_thread = threading.Thread(target=generate_fft_data)
scanner_thread = threading.Thread(target=radio_scanner)
fft_thread.start()
scanner_thread.start()

@api_blueprint.route('/api/data')
def get_data():
    with data_lock:
        if vars.sdr_name == "hackrf":
            fft_response = [float(x) for x in fft_data['original_fft2']]
            waterfall_response = [[float(y) for y in x] for x in waterfall_buffer2]
            
        else:
            fft_response = [float(x) for x in fft_data['original_fft']]
            waterfall_response = [[float(y) for y in x] for x in waterfall_buffer]
            
            
        # fft_response = [float(x) for x in fft_data['original_fft']]
        
        # Dynamically add an index or remove if not needed
        peaks_response = [{
            'index': idx,  # Dynamically generate index
            'frequency': float(peak['frequency']),
            'power': float(peak['power']),
            'bandwidth': float(peak.get('bandwidth', 0.0))  # Handle missing 'bandwidth' key
        } for idx, peak in enumerate(fft_data['peaks'])]


    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

    response = {
        'fft': fft_response,
        'peaks': peaks_response,
        'waterfall': waterfall_response,
        'time': current_time,
        'settings': vars.get_settings()
    }

    # Convert all settings values to native Python types
    settings = response['settings']
    settings['frequency'] = float(settings['frequency'])
    settings['sample_rate'] = float(settings['sample_rate'])
    settings['bandwidth'] = float(settings['bandwidth'])
    settings['gain'] = float(settings['gain'])
    settings['sweep_settings'] = {k: float(v) for k, v in settings['sweep_settings'].items()}

    if vars.sweeping_enabled:
        response['frequency_start'] = float(vars.sweep_settings['frequency_start'])
        response['frequency_stop'] = float(vars.sweep_settings['frequency_stop'])
        response['bandwidth'] = float(vars.sweep_settings['bandwidth'])
        if response['frequency_start'] < 1e6:
            print("error")

    return jsonify(response)

@api_blueprint.route('/api/analytics')
def get_analytics():
    num_digits = 3
    payload = {}
    with data_lock:
        
        # General classifications based on the current SDR frequency and bandwidth
        general_classifications = []
        current_frequency = vars.sdr_frequency() / 1e6  # Convert to MHz
        current_bandwidth = vars.sdr_bandwidth() / 1e6  # Convert to MHz
        classifications = vars.classifier.get_signals_in_range(current_frequency, current_bandwidth)
        classifications_list = classifications
        payload['classifications'] = classifications_list
        
        # Peak classifications
        peaks_response = fft_data['peaks'].copy()
        fft_response = np.array(fft_data['original_fft'], dtype=float)
        peaks_data = []

        for peak in peaks_response:
            freq = round(float(peak['frequency']), num_digits)  # Convert to MHz and round
            power = float(peak['power'])
            bandwidth = round(float(peak.get('bandwidth', 0.0)), num_digits)  # Convert to MHz and round 

            # Classify the signal
            classifications = vars.classifier.classify_signal(freq, bandwidth)
            classifications_list = [{"label": c['label'], "channel": c.get('channel', 'N/A')} for c in classifications]

            peaks_data.append({
                'peak': f'Peak {peaks_response.index(peak) + 1}',  # Generate peak index based on position
                'frequency': freq,
                'power': power,
                'bandwidth': bandwidth,
                'classification': classifications_list
            })
            payload['peaks'] = peaks_data
    
    return jsonify(payload)

@api_blueprint.route('/api/get_classifiers', methods=['GET'])
def get_classifiers():
    classifiers = vars.classifier.get_all_bands()
    return jsonify(classifiers)


@api_blueprint.route('/api/download_all_bands', methods=['GET'])
def download_all_bands():
    try:
        all_bands = vars.classifier.get_all_bands()
        # Convert to JSON format with pretty print
        json_data = json.dumps(all_bands, indent=4)

        # Create a response with the pretty-printed JSON as a file download
        response = Response(json_data, mimetype='application/json')
        response.headers['Content-Disposition'] = 'attachment; filename=all_bands.json'
        return response
    except Exception as e:
        current_app.logger.error(f"Error downloading bands: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@api_blueprint.route('/api/upload_classifier', methods=['POST'])
def upload_classifier():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'status': 'error', 'message': 'No file part'}), 400

    file = request.files['file']
    
    # If user does not select a file, the browser submits an empty file without a filename
    if file.filename == '':
        return jsonify({'status': 'error', 'message': 'No selected file'}), 400

    # Ensure the file has a secure filename
    filename = secure_filename(file.filename)
    file_path = os.path.join(vars.classifiers_path, filename)
    
    # Save the file
    file.save(file_path)

    # Determine file extension to choose appropriate loading method
    file_extension = os.path.splitext(filename)[1].lower()

    try:
        if file_extension == '.csv':
            vars.classifier.load_classifier_from_csv(file_path)
        elif file_extension == '.json':
            vars.classifier.load_classifier_from_json(file_path)
        else:
            return jsonify({'status': 'error', 'message': 'Unsupported file type'}), 400
        
        return jsonify({'status': 'success', 'message': f'Classifier {filename} uploaded and loaded successfully'})
    
    except Exception as e:
        current_app.logger.error(f"Error loading classifier: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@api_blueprint.route('/api/select_sdr', methods=['POST'])
def select_sdr():
    sdr_name = request.json.get('sdr_name', 'hackrf')
    result = vars.reselect_radio(sdr_name)
    return jsonify({'status': 'success', 'result': result})

@api_blueprint.route('/api/get_settings', methods=['GET'])
def get_settings():
    settings = {
        'sdr': vars.radio_name,
        'frequency': vars.sdr_frequency() / 1e6,  # Convert to MHz
        'gain': vars.sdr_gain(),
        'sampleRate': vars.sdr_sampleRate() / 1e6,  # Convert to MHz
        'bandwidth': vars.sdr_bandwidth() / 1e6,  # Convert to MHz
        'averagingCount': vars.sdr_settings[vars.sdr_name].averagingCount,
        'dcSuppress': vars.dc_suppress,
        'showWaterfall': vars.show_waterfall,
        'updateInterval': vars.sleeptime * 1000,  # Convert to ms
        'waterfallSamples': vars.waterfall_samples,
        'frequency_start': vars.sweep_settings['frequency_start'] / 1e6,
        'frequency_stop': vars.sweep_settings['frequency_stop'] / 1e6,
        'sweeping_enabled': vars.sweeping_enabled,
        'peakThreshold' : vars.peak_threshold_minimum_dB,
        'showFirstTrace': vars.showFirstTrace,
        'showSecondTrace': vars.showSecondTrace,
        'lockBandwidthSampleRate': vars.lockBandwidthSampleRate
    }
    return jsonify(settings)

@api_blueprint.route('/api/update_settings', methods=['POST'])
def update_settings():
    try:
        settings = request.json
        if settings['frequency'] == 0 or  settings['frequency'] is None or  settings['sampleRate'] is None or settings['bandwidth'] is None:
            return jsonify({'success': True, 'settings': settings})
        new_settings = settings.copy()
        # Update vars with the new settings and save them
        new_settings['frequency'] = settings['frequency'] * 1e6
        new_settings['frequency_stop'] = settings['frequency_stop'] * 1e6
        new_settings['frequency_start'] = settings['frequency_start'] * 1e6
        new_settings['sampleRate'] = settings['sampleRate'] * 1e6
        new_settings['bandwidth'] = settings['bandwidth'] * 1e6
        vars.apply_settings(new_settings)
        vars.save_settings()

        return jsonify({'success': True, 'settings': settings})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'error': str(e)})

@api_blueprint.route('/api/start_sweep', methods=['POST'])
def start_sweep():
    vars.sweeping_enabled = True
    return jsonify({'status': 'success', 'sweeping_enabled': vars.sweeping_enabled})

@api_blueprint.route('/api/stop_sweep', methods=['POST'])
def stop_sweep():
    vars.sweeping_enabled = False
    return jsonify({'status': 'success', 'sweeping_enabled': vars.sweeping_enabled})

@atexit.register
def cleanup():
    global running
    running = False
    vars.sdr0.stop()
    vars.sdr1.stop()
    fft_thread.join()
    scanner_thread.join()
