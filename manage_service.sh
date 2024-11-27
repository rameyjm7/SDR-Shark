#!/bin/bash

SERVICE_NAME="sdr_shark"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
WORKING_DIR="/home/dev/workspace/SDR-Shark"
EXEC_START="/bin/bash ${WORKING_DIR}/start.sh"
PYTHON_VENV="/home/dev/python3.9"
PYTHON_PATH="${PYTHON_VENV}/bin/python3"
USER="dev"  # Replace with the appropriate user if needed

setup_dependencies() {
    echo "Setting up Python virtual environment and installing dependencies..."
    if [ ! -d "${PYTHON_VENV}" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv ${PYTHON_VENV}
    fi
    echo "Activating Python virtual environment and installing dependencies..."
    source ${PYTHON_VENV}/bin/activate
    pip install --upgrade pip
    pip install gunicorn
    deactivate
    echo "Dependencies installed successfully!"
}


install_service() {
    echo "Installing systemd service..."
    sudo bash -c "cat > ${SERVICE_FILE}" <<EOL
[Unit]
Description=SDR Shark Service
After=network.target

[Service]
WorkingDirectory=${WORKING_DIR}
ExecStart=/bin/bash -c 'source ${PYTHON_VENV}/bin/activate && gunicorn -w 1 --threads 4 -b 0.0.0.0:5000 sdr_plot_backend.__main__:app'
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOL

    sudo systemctl daemon-reload
    sudo systemctl enable ${SERVICE_NAME}
    echo "Service installed successfully!"
}


uninstall_service() {
    echo "Uninstalling systemd service..."
    sudo systemctl stop ${SERVICE_NAME}
    sudo systemctl disable ${SERVICE_NAME}
    sudo rm -f ${SERVICE_FILE}
    sudo systemctl daemon-reload
    echo "Service uninstalled successfully!"
}

start_service() {
    echo "Starting systemd service..."
    sudo systemctl start ${SERVICE_NAME}
    echo "Service started!"
}

stop_service() {
    echo "Stopping systemd service..."
    sudo systemctl stop ${SERVICE_NAME}
    echo "Service stopped!"
}

status_service() {
    echo "Getting status of systemd service..."
    sudo systemctl status ${SERVICE_NAME}
}

case "$1" in
    setup)
        setup_dependencies
        ;;
    install)
        install_service
        ;;
    uninstall)
        uninstall_service
        ;;
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    status)
        status_service
        ;;
    *)
        echo "Usage: $0 {install|uninstall|start|stop|status}"
        exit 1
        ;;
esac
