import atexit
import threading
import time
from collections import deque
from datetime import datetime

import numpy as np
from flask import Blueprint, jsonify, request
from numba import jit
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


def find_peaks_with_bandwidth(fft_data, freq_data, threshold=-3, min_distance=250e3, number_of_peaks=5):
    # Calculate the noise floor
    noise_floor = np.mean(fft_data[:len(fft_data)//10])
    
    peaks, _ = find_peaks(fft_data, distance=int(min_distance / (freq_data[1] - freq_data[0])), height=noise_floor + threshold)
    peak_list = []
    for i in peaks:
        peak = {
            'index': int(i),  # Convert numpy int to Python int
            'frequency': float(freq_data[i]),  # Convert numpy float to Python float
            'power': float(fft_data[i])  # Convert numpy float to Python float
        }
        # Find -3 dB points relative to peak power
        peak_power = fft_data[i]
        threshold_power = peak_power + threshold

        # Find left -3dB point
        left_idx = i
        while left_idx > 0 and fft_data[left_idx] > threshold_power:
            left_idx -= 1
        # Find right -3dB point
        right_idx = i
        while right_idx < len(fft_data) and fft_data[right_idx] > threshold_power:
            right_idx += 1

        # Adjust right_idx to avoid index out of bounds
        right_idx = min(right_idx, len(fft_data) - 1)

        bandwidth = float(freq_data[right_idx] - freq_data[left_idx])
        peak['bandwidth'] = bandwidth
        peak_list.append(peak)
    
    peak_list = sorted(peak_list, key=lambda x: x['power'], reverse=True)[:number_of_peaks]
    return peak_list

def detect_peaks(fft_magnitude, threshold=-50, min_distance=250e3, number_of_peaks=5):
    sample_rate = 16e6  # Example sample rate in Hz
    distance_in_samples = int(min_distance * len(fft_magnitude) / sample_rate)
    peaks, _ = find_peaks(fft_magnitude, height=threshold, distance=distance_in_samples)
    sorted_peaks = sorted(peaks, key=lambda x: fft_magnitude[x], reverse=True)
    return sorted_peaks[:number_of_peaks]

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

                peaks = find_peaks_with_bandwidth(downsampled_fft, 
                            np.linspace(vars.center_freq - vars.sample_rate / 2, vars.center_freq + vars.sample_rate / 2, len(downsampled_fft)),
                            vars.peak_threshold_minimum_dB
                            )
                
                with data_lock:
                    fft_data['original_fft'] = downsampled_fft.tolist()
                    fft_data['peaks'] = peaks
                    waterfall_buffer.append(downsample(downsampled_fft).tolist())
                
                full_fft = []  # Clear the full FFT for the next sweep
            vars.center_freq = current_freq
            vars.hackrf_sdr.set_frequency(vars.center_freq)
            time.sleep(0.01)
        else:
            # Normal operation without sweeping
            if len(full_fft) == 0:
                full_fft = current_fft
            else:
                full_fft = (full_fft[:vars.sample_size] * (vars.fft_averaging - 1) + current_fft) / vars.fft_averaging

            peaks = find_peaks_with_bandwidth(full_fft,
                                              np.linspace(vars.center_freq - vars.sample_rate / 2, vars.center_freq + vars.sample_rate / 2, len(full_fft)),
                                              vars.peak_threshold_minimum_dB)

            with data_lock:
                fft_data['original_fft'] = full_fft.tolist()
                fft_data['peaks'] = peaks
                waterfall_buffer.append(downsample(full_fft).tolist())


fft_thread = threading.Thread(target=generate_fft_data)
fft_thread.start()

@api_blueprint.route('/api/data')
def get_data():
    with data_lock:
        fft_response = fft_data['original_fft'].copy()
        peaks_response = fft_data['peaks'].copy()
        waterfall_response = list(waterfall_buffer)

    current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]

    response = {
        'fft': fft_response,
        'peaks': peaks_response,
        'waterfall': waterfall_response,
        'time': current_time,
        'settings' : vars.get_settings()
    }

    if vars.sweeping_enabled:
        response['frequency_start'] = vars.sweep_settings['frequency_start']
        response['frequency_stop'] = vars.sweep_settings['frequency_stop']
        response['bandwidth'] = vars.sweep_settings['bandwidth']
        if float(response['frequency_start']) < 1e6:
            print("error")

    return jsonify(response)


@api_blueprint.route('/api/analytics')
def get_analytics():
    with data_lock:
        peaks_response = fft_data['peaks'].copy()
        fft_response = fft_data['original_fft'].copy()
        peaks_data = []
        for peak in peaks_response:
            freq = ((vars.center_freq - vars.sample_rate / 2) + (peak['index'] * vars.sample_rate / len(fft_response))) / 1e6  # Convert to MHz
            power = peak['power']
            bandwidth = peak['bandwidth']
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

    vars.hackrf_sdr.set_frequency(vars.center_freq)
    vars.hackrf_sdr.set_gain(vars.gain)
    vars.hackrf_sdr.set_sample_rate(vars.sample_rate)
    vars.hackrf_sdr.set_bandwidth(vars.bandwidth)

    return jsonify({'success': True, 'settings': settings})

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
    vars.hackrf_sdr.stop()
    fft_thread.join()
