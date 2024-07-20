from flask import Blueprint, jsonify, request, Response
from sdr_plot_backend.utils import vars
import pickle
from datetime import datetime
import json
import time
import numpy as np
import os
import shutil

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
        
        # Log source and destination paths
        print(f'Moving file: {src_path} to {dest_path}')

        shutil.move(src_path, os.path.join(dest_path, ""))
        return jsonify({'success': True})
    except Exception as e:
        # Log the exception
        print(f'Error moving file: {e}')
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
    full_path = os.path.join(vars.recordings_dir, file_path[1:])
    
    try:
        with open(full_path, 'rb') as f:
            data = pickle.load(f)
            metadata = data['metadata']
            fft_data = data['fft_data']
            return jsonify({'metadata': metadata, 'fft_data': fft_data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
