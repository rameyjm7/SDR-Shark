# Use an official Python runtime as a parent image
FROM python:3.11-buster

# Set the working directory in the container
WORKDIR /usr/src/app

# Add GPG keys and install dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg2

# Add the Debian buster GPG key
RUN curl -fsSL https://ftp-master.debian.org/keys/archive-key-10.asc | apt-key add - && \
    curl -fsSL https://ftp-master.debian.org/keys/archive-key-10-security.asc | apt-key add - && \
    apt-get update

# Install unzip
RUN apt-get install -y unzip && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Node.js, npm, and Yarn
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install --global yarn && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# Install supervisor to manage multiple services
RUN apt-get update && \
    apt-get install -y supervisor && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# Install backend dependencies
RUN pip install --upgrade pip


# Copy the zip file into the container at /usr/src/app
COPY code.zip .

# Extract the zip file
RUN unzip code.zip && rm code.zip

# Install backend
RUN cd backend && pip install -e .

# Install frontend dependencies
RUN cd frontend && yarn install


# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the ports the apps run on
EXPOSE 5000 3000

# Start supervisor
CMD ["/usr/bin/supervisord"]
