from flask import Blueprint, jsonify, Response, stream_with_context
from datetime import datetime
from scipy.fft import fft
import numpy as np
import threading
import time
from collections import deque
import json

# Import the HackRFSdr class from the bluetooth_demod module
from bluetooth_demod.sdr.sdr_hackrf import HackRFSdr

api_blueprint = Blueprint('api', __name__)

# Initialize SDR
sleeptime = 0.03
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
}
running = True

def capture_samples():
    global sample_buffer
    sample_buffer = hackrf_sdr.get_latest_samples()

def process_fft(samples):
    fft_result = np.fft.fftshift(np.fft.fft(samples))
    fft_magnitude = 20 * np.log10(np.abs(fft_result))
    return fft_magnitude

def generate_fft_data():
    global running, dc_suppress
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
        
        with data_lock:
            fft_data['original_fft'] = averaged_fft.tolist()
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
    
    # Get current time
    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
    
    return jsonify({
        'fft': fft_response,
        'time': current_time
    })

@api_blueprint.route('/api/stream')
def stream():
    def event_stream():
        while True:
            with data_lock:
                fft_response = fft_data['original_fft'].copy()
            # Get current time
            current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
            yield f"data: {json.dumps({'fft': fft_response, 'time': current_time})}\n\n"
            time.sleep(0.033)  # 30Hz

    return Response(event_stream(), content_type='text/event-stream')

# Ensure the SDR stops when the application exits
import atexit

@atexit.register
def cleanup():
    global running
    running = False
    hackrf_sdr.stop()
    fft_thread.join()
