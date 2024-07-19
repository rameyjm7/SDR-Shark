# Makefile for building and running the Docker container

# Docker image name
IMAGE_NAME = iq_analyzer_app

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME) .

# Run the Docker container with USB device access
run:
	docker run --privileged --device /dev/bus/usb:/dev/bus/usb -p 5000:5000 $(IMAGE_NAME)

# Run the Docker container interactively with USB device access
run-interactive:
	docker run --privileged --device /dev/bus/usb:/dev/bus/usb -it -p 5000:5000 $(IMAGE_NAME) /bin/bash
