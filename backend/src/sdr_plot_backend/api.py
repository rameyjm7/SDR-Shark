import atexit
import threading
import time
from collections import deque
from datetime import datetime

import numpy as np
from flask import Blueprint, jsonify, request
from numba import jit

from sdr_plot_backend.signal_utils import perform_and_refine_scan, detect_signal_peaks  # Import the new utility
from sdr_plot_backend.utils import vars

api_blueprint = Blueprint('api', __name__)

sample_buffer = np.zeros(vars.sample_size, dtype=np.complex64)  # Increase buffer size to decrease RBW
data_buffer = deque(maxlen=vars.fft_averaging)
waterfall_buffer = deque(maxlen=100)  # Buffer for waterfall data

data_lock = threading.Lock()
fft_data = {
    'original_fft': [],
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
            current_freq += vars.sweep_settings['bandwidth']
            if current_freq > vars.sweep_settings['frequency_stop']:
                current_freq = vars.sweep_settings['frequency_start']
                # Complete sweep, deliver the full FFT
                averaged_fft = np.array(full_fft)
                downsampled_fft = downsample(averaged_fft, len(current_fft))  # Downsample to match the normal FFT size

                with data_lock:
                    fft_data['original_fft'] = downsampled_fft.tolist()
                    waterfall_buffer.append(downsample(downsampled_fft).tolist())
                
                full_fft = []  # Clear the full FFT for the next sweep
            vars.center_freq = current_freq
            vars.sdr0.set_frequency(vars.center_freq)
            time.sleep(0.01)
        else:
            # Normal operation without sweeping
            if len(full_fft) == 0:
                full_fft = current_fft
            else:
                full_fft = (full_fft[:vars.sample_size] * (vars.fft_averaging - 1) + current_fft) / vars.fft_averaging

            with data_lock:
                fft_data['original_fft'] = full_fft.tolist()
                waterfall_buffer.append(downsample(full_fft).tolist())

def radio_scanner():
    while running:
        # Capture and average the FFTs for peak detection
        fft_magnitude_sum = np.zeros(1024 * 8)  # Adjusted to match the wide_fft_size
        for _ in range(vars.fft_averaging):
            iq_data = vars.sdr1.get_latest_samples()
            fft_result = np.fft.fftshift(np.fft.fft(iq_data, 1024 * 8))  # Using the wide_fft_size
            fft_magnitude = np.abs(fft_result)
            fft_magnitude_sum += fft_magnitude

        fft_magnitude_avg = fft_magnitude_sum / vars.fft_averaging
        fft_magnitude_db = 20 * np.log10(fft_magnitude_avg)

        sample_rate = 20e6
        # Detect peaks using the detect_signal_peaks function
        signal_peaks, signal_bandwidths = detect_signal_peaks(
            fft_magnitude_db,
            vars.center_freq,
            sample_rate,
            1024 * 8,  # wide_fft_size
            min_peak_distance=10 * 8,
            threshold_offset=5
        )

        # Create refined peaks list
        refined_peaks = []
        for peak_freq, bandwidth_mhz in zip(signal_peaks, signal_bandwidths):
            refined_peaks.append({
                'frequency': peak_freq * 1e6,  # Convert MHz to Hz
                'power': fft_magnitude_db[int((peak_freq * 1e6 - vars.center_freq + sample_rate / 2) * 1024 * 8 / sample_rate)],
                'bandwidth': bandwidth_mhz * 1e6  # Convert MHz to Hz
            })

        with data_lock:
            fft_data['peaks'] = [{'index': 0, 'frequency': peak['frequency'], 'power': peak['power'], 'bandwidth': peak['bandwidth']} for peak in refined_peaks]
        
        time.sleep(1)  # Add some delay to prevent the loop from running too fast

fft_thread = threading.Thread(target=generate_fft_data)
scanner_thread = threading.Thread(target=radio_scanner)
fft_thread.start()
scanner_thread.start()

@api_blueprint.route('/api/data')
def get_data():
    with data_lock:
        fft_response = [float(x) for x in fft_data['original_fft']]
        peaks_response = [{
            'index': int(peak['index']),
            'frequency': float(peak['frequency']),
            'power': float(peak['power']),
            'bandwidth': float(peak['bandwidth'])
        } for peak in fft_data['peaks']]
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
    settings['center_freq'] = float(settings['center_freq'])
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
            freq = float(peak['frequency'])
            power = float(peak['power'])
            bandwidth = float(peak['bandwidth'])
            classification = "???"  # Placeholder for classification
            peaks_data.append({
                'peak': f'Peak {peak["index"] + 1}',
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
        'frequency': vars.center_freq / 1e6,  # Convert to MHz
        'gain': vars.gain,
        'sampleRate': vars.sample_rate / 1e6,  # Convert to MHz
        'bandwidth': vars.bandwidth / 1e6,  # Convert to MHz
        'averagingCount': vars.fft_averaging,
        'dcSuppress': vars.dc_suppress,
        'showWaterfall': vars.show_waterfall,
        'updateInterval': vars.sleeptime * 1000,  # Convert to ms
        'waterfallSamples': vars.waterfall_samples,
        'frequency_start': vars.sweep_settings['frequency_start'] / 1e6,
        'frequency_stop': vars.sweep_settings['frequency_stop'] / 1e6,
        'sweeping_enabled': vars.sweeping_enabled,
        'peakThreshold' : vars.peak_threshold_minimum_dB
    }
    return jsonify(settings)

@api_blueprint.route('/api/update_settings', methods=['POST'])
def update_settings():
    try:
        settings = request.json
        vars.center_freq = float(settings.get('frequency')) * 1e6  # Convert to Hz
        vars.gain = float(settings.get('gain'))
        vars.sample_rate = float(settings.get('sampleRate')) * 1e6  # Convert to Hz
        vars.bandwidth = float(settings.get('bandwidth')) * 1e6  # Convert to Hz
        vars.fft_averaging = int(settings.get('averagingCount', vars.fft_averaging))
        vars.number_of_peaks = int(settings.get('numberOf_peaks', 5))
        vars.peak_threshold_minimum_dB = int(settings.get('peakThreshold', 5))

        vars.sweep_settings['frequency_start'] = float(settings.get('frequency_start')) * 1e6  # Convert to Hz
        vars.sweep_settings['frequency_stop'] = float(settings.get('frequency_stop')) * 1e6  # Convert to Hz
        vars.sweeping_enabled = settings.get('sweeping_enabled', False)
        if vars.sweeping_enabled:
            if vars.radio_name == "sidekiq":
                vars.sweep_settings['bandwidth'] = 60e6
            if vars.radio_name == "hackrf":
                vars.sweep_settings['bandwidth'] = 20e6

        print(f"Updating settings: Frequency = {vars.center_freq} Hz, Gain = {vars.gain}, Sample Rate = {vars.sample_rate} Hz, Bandwidth = {vars.bandwidth} Hz, Averaging Count = {vars.fft_averaging}, Number of Peaks = {vars.number_of_peaks}")

        vars.sdr0.set_frequency(vars.center_freq)
        vars.sdr0.set_gain(vars.gain)
        vars.sdr0.set_sample_rate(vars.sample_rate)
        vars.sdr0.set_bandwidth(vars.bandwidth)
        
        vars.sdr1.set_frequency(vars.center_freq)
        vars.sdr1.set_sample_rate(20e6)
        vars.sdr1.set_bandwidth(20e6)

        return jsonify({'success': True, 'settings': settings})
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'settings': settings})

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
    fft_thread.join()
    scanner_thread.join()
