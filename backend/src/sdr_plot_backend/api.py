import numpy as np
from flask import Blueprint, jsonify, request
from datetime import datetime
import threading
import time
from collections import deque
from numba import jit
import atexit
from scipy.signal import find_peaks
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
    while vars.hackrf_sdr is None:
        time.sleep(0.1)
    sample_buffer = vars.hackrf_sdr.get_latest_samples()

def process_fft(samples):
    fft_result = np.fft.fftshift(np.fft.fft(samples))
    fft_magnitude = 20 * np.log10(np.abs(fft_result))
    return fft_magnitude

def detect_peaks(fft_magnitude, threshold=-50, min_distance=250e3, number_of_peaks=5):
    sample_rate = 16e6  # Example sample rate in Hz
    distance_in_samples = int(min_distance * len(fft_magnitude) / sample_rate)
    peaks, _ = find_peaks(fft_magnitude, height=threshold, distance=distance_in_samples)
    sorted_peaks = sorted(peaks, key=lambda x: fft_magnitude[x], reverse=True)
    return sorted_peaks[:number_of_peaks]

def generate_fft_data():
    sweep_step = vars.sweep_settings['bandwidth'] if vars.sweep_settings else 0
    sweep_start = vars.sweep_settings['frequency_start']
    sweep_stop = vars.sweep_settings['frequency_stop']
    current_freq = vars.sweep_settings['frequency_start']
    full_fft = []

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

                peaks = detect_peaks(averaged_fft, number_of_peaks=vars.number_of_peaks)
                peaks = [int(p) for p in peaks]

                with data_lock:
                    fft_data['original_fft'] = averaged_fft.tolist()
                    fft_data['peaks'] = peaks
                    waterfall_buffer.append(downsample(averaged_fft).tolist())
                
                full_fft = []  # Clear the full FFT for the next sweep
            vars.hackrf_sdr.set_frequency(current_freq)
            print(f"Tuning to {current_freq}")
            # time.sleep(0.1)  # Allow time for tuning to the new frequency
        else:
            # Normal operation without sweeping
            if len(full_fft) == 0:
                full_fft = current_fft
            else:
                full_fft = (full_fft * (vars.fft_averaging - 1) + current_fft) / vars.fft_averaging

            peaks = detect_peaks(full_fft, number_of_peaks=vars.number_of_peaks)
            peaks = [int(p) for p in peaks]

            with data_lock:
                fft_data['original_fft'] = full_fft.tolist()
                fft_data['peaks'] = peaks
                waterfall_buffer.append(downsample(full_fft).tolist())

        # end_time = time.time()
        # elapsed_time = end_time - start_time
        # # time.sleep(max(0, vars.sleeptime - elapsed_time))

fft_thread = threading.Thread(target=generate_fft_data)
fft_thread.start()

@api_blueprint.route('/api/data')
def get_data():
    with data_lock:
        fft_response = fft_data['original_fft'].copy()
        peaks_response = fft_data['peaks'].copy()
        waterfall_response = list(waterfall_buffer)
    
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
    
    return jsonify({
        'fft': fft_response,
        'peaks': peaks_response,
        'waterfall': waterfall_response,
        'time': current_time
    })

@api_blueprint.route('/api/analytics')
def get_analytics():
    with data_lock:
        peaks_response = fft_data['peaks'].copy()
        fft_response = fft_data['original_fft'].copy()
        peaks_data = []
        for peak in peaks_response:
            freq = ((vars.center_freq - vars.sample_rate / 2) + (peak * vars.sample_rate / len(fft_response))) / 1e6  # Convert to MHz
            power = fft_response[peak]
            classification = "???"  # Placeholder for classification
            peaks_data.append({
                'peak': f'Peak {peak + 1}',
                'frequency': freq,
                'power': power,
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
    }
    return jsonify(settings)

@api_blueprint.route('/api/update_settings', methods=['POST'])
def update_settings():
    settings = request.json
    vars.center_freq = float(settings.get('frequency')) * 1e6  # Convert to Hz
    vars.gain = float(settings.get('gain'))
    vars.sample_rate = float(settings.get('sampleRate')) * 1e6  # Convert to Hz
    vars.bandwidth = float(settings.get('bandwidth')) * 1e6  # Convert to Hz
    vars.fft_averaging = int(settings.get('averagingCount', vars.fft_averaging))
    vars.number_of_peaks = int(settings.get('numberOfPeaks', 5))
    
    print(f"Updating settings: Frequency = {vars.center_freq} Hz, Gain = {vars.gain}, Sample Rate = {vars.sample_rate} Hz, Bandwidth = {vars.bandwidth} Hz, Averaging Count = {vars.fft_averaging}, Number of Peaks = {vars.number_of_peaks}")

    vars.hackrf_sdr.set_frequency(vars.center_freq)
    vars.hackrf_sdr.set_gain(vars.gain)
    vars.hackrf_sdr.set_sample_rate(vars.sample_rate)
    vars.hackrf_sdr.set_bandwidth(vars.bandwidth)

    return jsonify({'success': True, 'settings': settings})

@api_blueprint.route('/api/start_sweep', methods=['POST'])
def start_sweep():
    sweep_settings = request.json
    frequency_start = sweep_settings.get('frequencyStart')
    frequency_stop = sweep_settings.get('frequencyStop')
    bandwidth = sweep_settings.get('bandwidth')

    if frequency_start is None or frequency_stop is None or bandwidth is None:
        return jsonify({'error': 'Missing required sweep parameters'}), 400

    try:
        frequency_start = float(frequency_start) * 1e6  # Convert to Hz
        frequency_stop = float(frequency_stop) * 1e6  # Convert to Hz
        bandwidth = float(bandwidth) * 1e6  # Convert to Hz
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    # Store sweep settings in vars
    vars.sweep_settings = {
        'frequency_start': frequency_start,
        'frequency_stop': frequency_stop,
        'bandwidth': bandwidth,
    }
    
    # Recalculate total bandwidth for display purposes
    vars.center_freq = (frequency_start + frequency_stop) / 2
    vars.sample_rate = frequency_stop - frequency_start + bandwidth

    # Update SDR settings to reflect the sweep configuration
    vars.hackrf_sdr.set_frequency(vars.center_freq)
    vars.hackrf_sdr.set_bandwidth(vars.sample_rate)
    vars.hackrf_sdr.set_gain(vars.gain)
    vars.sweeping_enabled = True

    print(f"Starting sweep: Frequency Start = {frequency_start} Hz, Frequency Stop = {frequency_stop} Hz, Bandwidth = {bandwidth} Hz")

    return jsonify({'status': 'success', 'sweepSettings': sweep_settings})

@atexit.register
def cleanup():
    global running
    running = False
    vars.hackrf_sdr.stop()
    fft_thread.join()
