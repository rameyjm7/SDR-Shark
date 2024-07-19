# Stage 1: Build the React frontend
FROM node:22 AS build-frontend

# Set the working directory
WORKDIR /frontend

# Copy the frontend package.json and yarn.lock
COPY ./frontend/package.json ./frontend/yarn.lock ./

# Install frontend dependencies
RUN yarn install

# Copy the rest of the frontend code
COPY ./frontend ./

# Build the frontend
RUN yarn build

# Stage 2: Set up the Python backend
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the Python requirements file and install dependencies
COPY ./backend/pyproject.toml ./backend/README.md ./
RUN pip install --no-cache-dir hatch

# Copy the rest of the application code
COPY ./backend ./backend

# Install the application
RUN hatch build

# Copy the built frontend files from the first stage
COPY --from=build-frontend /frontend/build /app/backend/src/sdr_plot_backend/static

# Set environment variables
ENV FLASK_APP=sdr_plot_backend
ENV FLASK_ENV=production

# Expose port 5000 for the Flask server
EXPOSE 5000

# Install usbutils
RUN apt-get update && apt-get install -y usbutils && rm -rf /var/lib/apt/lists/*


# Run the Flask server
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
