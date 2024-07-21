from flask import Blueprint, jsonify, request
from datetime import datetime
import numpy as np
import threading
import time
from collections import deque
from numba import jit
import atexit
from scipy.signal import find_peaks
# from bluetooth_demod.sdr.sdr_hackrf import HackRFSdr
# from bluetooth_demod.sdr.sdr_sidekiq import SidekiqSdr as Sdr
from sdr_plot_backend.utils import vars
api_blueprint = Blueprint('api', __name__)

# Initialize SDR


sample_buffer = np.zeros(vars.sample_size, dtype=np.complex64)  # Increase buffer size to decrease RBW

# Buffer for streaming data
data_buffer = deque(maxlen=vars.fft_averaging)
waterfall_buffer = deque(maxlen=100)  # Buffer for waterfall data

# Shared data structure for processed data
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
    averaged_fft = None

    while running:
        start_time = time.time()
        capture_samples()
        current_fft = process_fft(sample_buffer)
        
        if averaged_fft is None:
            averaged_fft = current_fft
        else:
            averaged_fft = (averaged_fft * (vars.fft_averaging - 1) + current_fft) / vars.fft_averaging
        
        # Replace -Infinity with -20
        averaged_fft = np.where(np.isinf(averaged_fft), -20, averaged_fft)
        
        # Suppress DC spike
        if vars.dc_suppress:
            dc_index = len(averaged_fft) // 2
            averaged_fft[dc_index] = averaged_fft[dc_index + 1]
        
        peaks = detect_peaks(averaged_fft, number_of_peaks=vars.number_of_peaks)
        peaks = [int(p) for p in peaks]  # Convert to list of Python integers

        with data_lock:
            fft_data['original_fft'] = averaged_fft.tolist()
            fft_data['peaks'] = peaks
            waterfall_buffer.append(downsample(averaged_fft).tolist())
        
        end_time = time.time()
        elapsed_time = end_time - start_time
        time.sleep(max(0, vars.sleeptime - elapsed_time))  # Adjust sleep time for real-time performance

fft_thread = threading.Thread(target=generate_fft_data)
fft_thread.start()

@api_blueprint.route('/api/data')
def get_data():
    with data_lock:
        fft_response = fft_data['original_fft'].copy()
        peaks_response = fft_data['peaks'].copy()
        waterfall_response = list(waterfall_buffer)
    
    # Get current time
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

@api_blueprint.route('/api/update_settings', methods=['POST'])
def update_settings():
    settings = request.json
    # Update settings
    frequency = float(settings.get('frequency')) * 1e6  # Convert to Hz
    gain = float(settings.get('gain'))
    sample_rate = float(settings.get('sampleRate')) * 1e6  # Convert to Hz
    bandwidth = float(settings.get('bandwidth')) * 1e6  # Convert to Hz
    vars.fft_averaging = int(settings.get('averagingCount', vars.fft_averaging))
    vars.number_of_peaks = int(settings.get('numberOfPeaks', 5))
    
    # Log the settings
    print(f"Updating settings: Frequency = {frequency} Hz, Gain = {gain}, Sample Rate = {sample_rate} Hz, Bandwidth = {bandwidth} Hz, Averaging Count = {vars.fft_averaging}, Number of Peaks = {vars.number_of_peaks}")

    # Perform the SDR configuration update
    vars.hackrf_sdr.set_frequency(frequency)
    vars.hackrf_sdr.set_gain(gain)
    vars.hackrf_sdr.set_sample_rate(sample_rate)
    vars.hackrf_sdr.set_bandwidth(bandwidth)

    return jsonify({'success': True, 'settings': settings})

    

# Ensure the SDR stops when the application exits
@atexit.register
def cleanup():
    global running
    running = False
    vars.hackrf_sdr.stop()
    fft_thread.join()
