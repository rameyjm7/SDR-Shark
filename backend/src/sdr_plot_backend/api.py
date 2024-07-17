from flask import Blueprint, jsonify, Response, stream_with_context, request
from datetime import datetime
import numpy as np
import threading
import time
from collections import deque
import json
import atexit
import shutil
import os
from scipy.signal import find_peaks

# Import the HackRFSdr class from the bluetooth_demod module
from bluetooth_demod.sdr.sdr_hackrf import HackRFSdr

api_blueprint = Blueprint('api', __name__)

# Initialize SDR
sleeptime = 0.01
sample_size = 1 * 1024  # Adjust sample size to receive more data
center_freq = 102.1e6  # Center frequency in Hz
sample_rate = 16e6     # Sample rate in Hz
gain = 30              # Gain in dB
fft_averaging = 20
dc_suppress = True

hackrf_sdr = HackRFSdr(center_freq=center_freq, sample_rate=sample_rate, bandwidth=sample_rate, gain=gain, size=sample_size)
hackrf_sdr.start()
sample_buffer = np.zeros(sample_size, dtype=np.complex64)  # Increase buffer size to decrease RBW

# Buffer for streaming data
data_buffer = deque(maxlen=fft_averaging)
waterfall_buffer = deque(maxlen=100)  # Buffer for waterfall data

# Shared data structure for processed data
data_lock = threading.Lock()
fft_data = {
    'original_fft': [],
    'peaks': [],
}
running = True

def capture_samples():
    global sample_buffer
    sample_buffer = hackrf_sdr.get_latest_samples()

def process_fft(samples):
    fft_result = np.fft.fftshift(np.fft.fft(samples))
    fft_magnitude = 20 * np.log10(np.abs(fft_result))
    return fft_magnitude

def detect_peaks(fft_magnitude, threshold=-50):
    peaks, _ = find_peaks(fft_magnitude, height=threshold)
    return peaks

def generate_fft_data():
    global running, dc_suppress, fft_averaging
    averaged_fft = None
    while running:
        start_time = time.time()
        capture_samples()
        current_fft = process_fft(sample_buffer)
        
        if averaged_fft is None:
            averaged_fft = current_fft
        else:
            averaged_fft = (averaged_fft * (fft_averaging - 1) + current_fft) / fft_averaging
        
        # Replace -Infinity with -20
        averaged_fft = np.where(np.isinf(averaged_fft), -20, averaged_fft)
        
        # Suppress DC spike
        if dc_suppress:
            dc_index = len(averaged_fft) // 2
            averaged_fft[dc_index] = averaged_fft[dc_index + 1]
        
        peaks = detect_peaks(averaged_fft)

        with data_lock:
            fft_data['original_fft'] = averaged_fft.tolist()
            fft_data['peaks'] = peaks.tolist()
            waterfall_buffer.append(averaged_fft.tolist())
        
        end_time = time.time()
        elapsed_time = end_time - start_time
        time.sleep(max(0, sleeptime - elapsed_time))  # Adjust sleep time for real-time performance

fft_thread = threading.Thread(target=generate_fft_data)
fft_thread.start()

@api_blueprint.route('/api/data')
def get_data():
    with data_lock:
        fft_response = fft_data['original_fft'].copy()
        peaks_response = fft_data['peaks'].copy()
    
    # Get current time
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
    
    return jsonify({
        'fft': fft_response,
        'peaks': peaks_response,
        'time': current_time
    })

@api_blueprint.route('/api/stream')
def stream():
    def event_stream():
        while True:
            with data_lock:
                fft_response = fft_data['original_fft'].copy()
                peaks_response = fft_data['peaks'].copy()
            # Get current time
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
            yield f"data: {json.dumps({'fft': fft_response, 'peaks': peaks_response, 'time': current_time})}\n\n"
            time.sleep(0.033)  # 30Hz

    return Response(event_stream(), content_type='text/event-stream')

@api_blueprint.route('/api/update_settings', methods=['POST'])
def update_settings():
    try:
        settings = request.json
        # Update settings
        frequency = float(settings.get('frequency')) * 1e6  # Convert to Hz
        gain = float(settings.get('gain'))
        sample_rate = float(settings.get('sampleRate')) * 1e6  # Convert to Hz
        bandwidth = float(settings.get('bandwidth')) * 1e6  # Convert to Hz
        global fft_averaging
        fft_averaging = int(settings.get('averagingCount', fft_averaging))
        
        # Log the settings
        print(f"Updating settings: Frequency = {frequency} Hz, Gain = {gain}, Sample Rate = {sample_rate} Hz, Bandwidth = {bandwidth} Hz, Averaging Count = {fft_averaging}")

        # Perform the SDR configuration update
        hackrf_sdr.set_frequency(frequency)
        hackrf_sdr.set_gain(gain)
        hackrf_sdr.set_sample_rate(sample_rate)
        hackrf_sdr.set_bandwidth(bandwidth)

        return jsonify({'success': True, 'settings': settings})
    except Exception as e:
        print(f'Error updating settings: {e}')
        return jsonify({'error': str(e)}), 500
    

# Ensure the SDR stops when the application exits
@atexit.register
def cleanup():
    global running
    running = False
    hackrf_sdr.stop()
    fft_thread.join()
