import os
import pickle
import shutil
from datetime import datetime

from flask import Blueprint, jsonify, request

from sdr_plot_backend.utils import vars

file_mgr_blueprint = Blueprint('file_mgr', __name__)

@file_mgr_blueprint.route('/file_manager/files', methods=['GET'])
def list_files():
    path = request.args.get('path', '')
    dir_path = os.path.join(vars.recordings_dir, path.strip('/'))

    if not os.path.isdir(dir_path):
        return jsonify({'error': 'Directory not found'}), 404

    files = []
    for file_name in os.listdir(dir_path):
        file_path = os.path.join(dir_path, file_name)
        if os.path.isfile(file_path):
            files.append({
                'id': file_name,
                'name': file_name,
                'ext': os.path.splitext(file_name)[1],
                'size': os.path.getsize(file_path),
                'date': datetime.fromtimestamp(os.path.getmtime(file_path)).strftime('%Y-%m-%d %H:%M:%S'),
                'isDir': False,
                'thumbnailUrl': None,
            })
        elif os.path.isdir(file_path):
            files.append({
                'id': file_name,
                'name': file_name,
                'ext': '',
                'size': 0,
                'date': datetime.fromtimestamp(os.path.getmtime(file_path)).strftime('%Y-%m-%d %H:%M:%S'),
                'isDir': True,
                'thumbnailUrl': None,
            })
    return jsonify({'files': files, 'path': path})

@file_mgr_blueprint.route('/file_manager/files/create_directory', methods=['POST'])
def create_directory():
    data = request.json
    path = data.get('path')
    name = data.get('name')
    new_directory_path = os.path.join(vars.recordings_dir, path.strip('/'), name)

    if not os.path.exists(new_directory_path):
        os.makedirs(new_directory_path)
        return jsonify({'status': 'success', 'message': 'Directory created successfully'}), 201
    else:
        return jsonify({'status': 'error', 'message': 'Directory already exists'}), 400

@file_mgr_blueprint.route('/file_manager/files/move', methods=['POST'])
def move_file():
    data = request.json
    src_path = os.path.join(vars.recordings_dir, data.get('src').strip('/'))
    dest_path = os.path.join(vars.recordings_dir, data.get('dest').strip('/'))
    file_name = data.get('name')

    try:
        if not os.path.exists(src_path):
            return jsonify({'error': 'Source file not found'}), 404

        shutil.move(src_path, os.path.join(dest_path, ""))
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_mgr_blueprint.route('/file_manager/files/rename', methods=['POST'])
def rename_file():
    data = request.json
    old_path = os.path.join(vars.recordings_dir, data.get('old_path').strip('/'))
    new_path = os.path.join(vars.recordings_dir, data.get('new_path').strip('/'))

    try:
        if not os.path.exists(old_path):
            return jsonify({'error': 'File not found'}), 404
        if os.path.exists(new_path):
            return jsonify({'error': 'New file name already exists'}), 409

        os.rename(old_path, new_path)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_mgr_blueprint.route('/file_manager/files/delete', methods=['POST'])
def delete_file():
    data = request.json
    file_path = os.path.join(vars.recordings_dir, data.get('path').strip('/'))

    try:
        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found'}), 404

        if os.path.isdir(file_path):
            shutil.rmtree(file_path)
        else:
            os.remove(file_path)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@file_mgr_blueprint.route('/file_manager/files/metadata', methods=['GET'])
def get_file_metadata():
    file_path = request.args.get('path')
    if file_path is None:
        return jsonify({'error': "File path is None"}), 500
    current_dir = request.args.get('current_dir', '')
    current_dir_abs = os.path.join(vars.recordings_dir, current_dir.strip('/'))
    full_path = os.path.join(current_dir_abs, file_path)

    print(f"Received request for file metadata. File path: {file_path}, Current dir: {current_dir}")
    print(f"Full path: {full_path}")

    try:
        with open(full_path, 'rb') as f:
            data = pickle.load(f)
            metadata = data['metadata']
            fft_data = data['fft_data']
            return jsonify({'metadata': metadata, 'fft_data': fft_data})
    except Exception as e:
        print(f"Error loading file metadata: {e}")
        return jsonify({'error': str(e)}), 500
