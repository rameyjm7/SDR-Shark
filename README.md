# SDR-Shark
A React application with a Python backend for SIGINT applications with applied ML using PyTorch and TensorFlow

* Many changes will be coming soon *

This is an application I wrote before working on https://github.com/rameyjm7/ML-wireless-signal-classification

I will update the application to use some of these models and focus on performance improvements and building a foundation for a better app

For now,  An SDR is streamed from the backend (Python, SoapySDR) to the front end (React). 

![image](https://github.com/user-attachments/assets/7f075513-27fe-46db-9ee3-4bb546944a34)

Analysis is currently done using Python, and decision trees are used to classify signal types based on characteristics such as center frequency and bandwidth.

Plot controls such as Y-axis limits are available.

![image](https://github.com/user-attachments/assets/1d487253-c29c-434c-94fa-ff2c31845241)


The max trace (green), persistence trace (blue), and normal trace (yellow) are all available. The normal trace supports averaging.

Some statistics are ran on the signals

![image](https://github.com/user-attachments/assets/73b9d68d-9c32-48ad-99ab-bc1bd3c8c219)

There are band dictionaries for signals based on center frequency and bandwidth right now 

![image](https://github.com/user-attachments/assets/350209c7-25d9-4213-ab2a-a45eece924e4)

Peak annotations are available

![image](https://github.com/user-attachments/assets/1cc8edd8-28ef-4c25-acbe-3f888b2ae342)


# How to install

apt install python3-venv

python3-venv /home/eng/python

source /home/eng/python/bin/activate


#cd to the <repository root>/backend/ folder

pip install .


#for the frontend, in a new terminal, go the frontend folder and run these command to install the dependencies and run the frontend

yarn install

# How to run

**Option 1:** (Recommended for speed): Gunicorn using start.sh script

From the repository root after installing the dependencies (backend and frontend), run ./start.sh to run the gunicorn server


**Option 2:** If you want to make changes and develop

#run the frontend from the frontend folder
yarn start

#run the backend using python3
python3 -m sdr_plot_backend

Then, Browse to the IP Address of your PC, port 3000. i.e. 10.139.1.86:3000


