import json
import os
import pickle
import time
from datetime import datetime

import numpy as np
from flask import Blueprint, Response, jsonify, request

from sdr_plot_backend.utils import vars

actions_blueprint = Blueprint('actions', __name__)


@actions_blueprint.route('/actions/tasks', methods=['GET'])
def get_tasks():
    with vars.task_lock:
        return jsonify(vars.tasks)

@actions_blueprint.route('/actions/tasks', methods=['POST'])
def add_task():
    task = request.json
    print(f"Received task: {task}")
    with vars.task_lock:
        vars.tasks.append(task)
        print(f"Current tasks: {vars.tasks}")
    return jsonify(task), 201



@actions_blueprint.route('/actions/tasks/execute', methods=['POST'])
def execute_tasks():
    def task_event_stream():
        with vars.task_lock:
            for i, task in enumerate(vars.tasks):
                if task['type'] == 'tune':
                    vars.sdr_settings[vars.sdr_name].frequency = task['frequency']
                    yield f"data: {json.dumps({'status': f'Tuning to {vars.sdr_frequency() / 1e6} MHz...', 'taskIndex': i})}\n\n"
                    try:
                        vars.sdr0.set_frequency(vars.sdr_frequency())
                        yield f"data: {json.dumps({'status': f'Successfully tuned to {vars.sdr_frequency() / 1e6} MHz', 'taskIndex': i})}\n\n"
                    except Exception as e:
                        yield f"data: {json.dumps({'status': f'Failed to tune: {e!s}', 'taskIndex': i})}\n\n"
                    time.sleep(0.25)
                elif task['type'] == 'record':
                    duration = task['duration']
                    label = task['label']
                    num_records = task.get('num_records', 10)  # Number of records to capture
                    interval = task.get('interval', 1)  # Interval between records in seconds

                    yield f"data: {json.dumps({'status': f'Recording {num_records} records, each for {duration} seconds with label {label}...', 'taskIndex': i})}\n\n"
                    try:
                        records = []
                        for record_index in range(num_records):
                            # Capture samples
                            num_samples = int(vars.sdr_sampleRate() * duration)
                            samples = vars.sdr0.get_latest_samples()

                            # Apply FFT and calculate the magnitude
                            fft_data = np.fft.fftshift(np.fft.fft(samples))
                            fft_magnitude = 20 * np.log10(np.abs(fft_data))
                            fft_magnitude = np.where(np.isinf(fft_magnitude), -20, fft_magnitude)

                            if vars.dc_suppress:
                                dc_index = len(fft_magnitude) // 2
                                fft_magnitude[dc_index] = fft_magnitude[dc_index + 1]

                            # Convert IQ data to 16-bit signed integer format
                            iq_data = np.clip(samples * 32767, -32768, 32767).astype(np.int16)

                            # Store the data in a dictionary
                            record = {
                                'fft_magnitude': fft_magnitude.tolist(),
                                'iq_data': iq_data.tolist(),
                            }
                            records.append(record)

                            yield f"data: {json.dumps({'status': f'Recorded {record_index + 1}/{num_records} records', 'taskIndex': i})}\n\n"

                            # Sleep for the specified interval before the next record
                            time.sleep(interval)

                        # Define the base file name
                        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                        base_filename = f'{label}_{timestamp}'

                        # Save the records in a pickle file
                        pickle_file_path = os.path.join(vars.recordings_dir, f'{base_filename}.pkl')
                        with open(pickle_file_path, 'wb') as pickle_file:
                            pickle.dump({
                                'metadata': {
                                    "label": label,
                                    "frequency": vars.sdr_frequency(),
                                    "sample_rate": vars.sdr_sampleRate(),
                                    "gain": vars.sdr_gain(),
                                    "bandwidth": vars.sdr_bandwidth(),
                                    "fft_averaging": vars.sdr_averagingCount(),
                                    "timestamp": timestamp
                                },
                                'records': records
                            }, pickle_file)

                        yield f"data: {json.dumps({'status': f'Successfully recorded {label}', 'taskIndex': i})}\n\n"

                    except Exception as e:
                        yield f"data: {json.dumps({'status': f'Failed to record: {e!s}', 'taskIndex': i})}\n\n"
                elif task['type'] == 'gain':
                    gain = task['value']
                    yield f"data: {json.dumps({'status': f'Setting gain to {gain}...', 'taskIndex': i})}\n\n"
                    try:
                        vars.sdr0.set_gain(gain)
                        yield f"data: {json.dumps({'status': f'Successfully set gain to {gain}', 'taskIndex': i})}\n\n"
                    except Exception as e:
                        yield f"data: {json.dumps({'status': f'Failed to set gain: {e!s}', 'taskIndex': i})}\n\n"
                    time.sleep(0.25)
                elif task['type'] == 'bandwidth':
                    bandwidth = task['value']
                    yield f"data: {json.dumps({'status': f'Setting bandwidth to {bandwidth / 1e6} MHz...', 'taskIndex': i})}\n\n"
                    try:
                        vars.sdr0.set_bandwidth(bandwidth)
                        yield f"data: {json.dumps({'status': f'Successfully set bandwidth to {bandwidth / 1e6} MHz', 'taskIndex': i})}\n\n"
                    except Exception as e:
                        yield f"data: {json.dumps({'status': f'Failed to set bandwidth: {e!s}', 'taskIndex': i})}\n\n"
                    time.sleep(0.25)
                elif task['type'] == 'sweep':
                    dwell_time = task['dwellTime']
                    yield f"data: {json.dumps({'status': 'Starting sweep...', 'taskIndex': i})}\n\n"
                    try:
                        if task['sweepType'] == 'full':
                            start_freq = vars.sdr0.min_frequency
                            end_freq = vars.sdr0.max_frequency
                        else:
                            start_freq = task['startFreq']
                            end_freq = task['endFreq']
                        current_freq = start_freq
                        while current_freq <= end_freq:
                            vars.sdr0.set_frequency(current_freq)
                            yield f"data: {json.dumps({'status': f'Sweeping at {current_freq / 1e6} MHz...', 'taskIndex': i})}\n\n"
                            time.sleep(dwell_time)
                            current_freq += bandwidth
                        yield f"data: {json.dumps({'status': 'Sweep completed', 'taskIndex': i})}\n\n"
                    except Exception as e:
                        yield f"data: {json.dumps({'status': f'Failed to sweep: {e!s}', 'taskIndex': i})}\n\n"
            yield f"data: {json.dumps({'status': 'Finished executing tasks'})}\n\n"

    return Response(task_event_stream(), content_type='text/event-stream')
