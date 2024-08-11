import atexit
import threading
import time
from collections import deque
from datetime import datetime

import numpy as np
from flask import Blueprint, jsonify, request
from numba import jit

from sdr_plot_backend.signal_utils import perform_and_refine_scan, PeakDetector  # Import the new utility
from sdr_plot_backend.utils import vars

api_blueprint = Blueprint('api', __name__)

sample_buffer = np.zeros(vars.sample_size, dtype=np.complex64)  # Increase buffer size to decrease RBW
data_buffer = deque(maxlen=vars.averagingCount)
waterfall_buffer = deque(maxlen=100)  # Buffer for waterfall data

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
            vars.frequency = current_freq
            vars.sdr0.set_frequency(vars.frequency)
            time.sleep(0.05)
        else:
            # Normal operation without sweeping
            if len(full_fft) == 0:
                full_fft = current_fft
            else:
                full_fft = (full_fft[:vars.sample_size] * (vars.averagingCount - 1) + current_fft) / vars.averagingCount

            with data_lock:
                fft_data['original_fft'] = full_fft.tolist()
                waterfall_buffer.append(downsample(full_fft).tolist())

def radio_scanner():
    nfft = 8*1024
    detector = PeakDetector(sdr=vars.sdr1,averaging_count=30,nfft=nfft)
    detector.start_receiving_data()

    while running:
        detector.set_averaging(vars.averagingCount)
        detected_peaks = detector.detect_signal_peaks(
            vars.frequency,
            sample_rate=20e6,
            fft_size=nfft,  # wide_fft_size
            min_peak_distance=80,
            threshold_offset=5
        )
        if detected_peaks:
            with data_lock:
                fft_data['original_fft2'] = detector.get_latest_data()
                fft_data['peaks'] = detected_peaks

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
        else:
            fft_response = [float(x) for x in fft_data['original_fft']]
            
        # fft_response = [float(x) for x in fft_data['original_fft']]
        
        # Dynamically add an index or remove if not needed
        peaks_response = [{
            'index': idx,  # Dynamically generate index
            'frequency': float(peak['frequency']),
            'power': float(peak['power']),
            'bandwidth': float(peak.get('bandwidth', 0.0))  # Handle missing 'bandwidth' key
        } for idx, peak in enumerate(fft_data['peaks'])]

        waterfall_response = [[float(y) for y in x] for x in waterfall_buffer]

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
    with data_lock:
        peaks_response = fft_data['peaks'].copy()
        fft_response = fft_data['original_fft'].copy()
        peaks_data = []

        for peak in peaks_response:
            freq = round(float(peak['frequency']), 2)  # Convert to MHz and round to 0.01 MHz
            power = float(peak['power'])
            bandwidth = round(float(peak.get('bandwidth', 0.0)), 2)  # Convert to MHz and round to 0.01 MHz
            classification = "???"  # Placeholder for classification

            peaks_data.append({
                'peak': f'Peak {peaks_response.index(peak) + 1}',  # Generate peak index based on position
                'frequency': freq,
                'power': power,
                'bandwidth': bandwidth,
                'classification': classification
            })

    return jsonify({'peaks': peaks_data})


@api_blueprint.route('/api/select_sdr', methods=['POST'])
def select_sdr():
    sdr_name = request.json.get('sdr_name', 'hackrf')
    result = vars.reselect_radio(sdr_name)
    return jsonify({'status': 'success', 'result': result})

@api_blueprint.route('/api/get_settings', methods=['GET'])
def get_settings():
    settings = {
        'sdr': vars.radio_name,
        'frequency': vars.frequency / 1e6,  # Convert to MHz
        'gain': vars.gain,
        'sampleRate': vars.sample_rate / 1e6,  # Convert to MHz
        'bandwidth': vars.bandwidth / 1e6,  # Convert to MHz
        'averagingCount': vars.averagingCount,
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

# @api_blueprint.route('/api/get_settings', methods=['GET'])
# def get_settings():
#     settings = vars.get_settings()
#     return jsonify(settings)

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
