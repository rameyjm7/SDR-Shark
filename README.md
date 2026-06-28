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

**Option 1:** (Recommended for speed): Gunicorn using scripts/start.sh

From the repository root after installing the dependencies (backend and frontend), run ./scripts/start.sh to run the gunicorn server.

Systemd service helper:

Use ./scripts/sdr-shark-service.sh to install/manage a service:

- install
- enable
- disable
- start
- stop
- restart
- status
- logs

If your `sdr-gateway` lives somewhere other than `http://127.0.0.1:8080`, set `SDR_SERVER_URL` before installing the service and the helper will write it into the service environment file alongside `SDR_GATEWAY_API_TOKEN`.

SDR backend options:

- Default: `SDR_BACKEND=soapy` uses local SoapySDR Python bindings directly and does not require `sdr-gateway`.
- Gateway mode: `SDR_BACKEND=gateway` uses `sdr-gateway` at `SDR_SERVER_URL`.

For direct SoapySDR mode, install SoapySDR and the driver packages for your radio, then verify:

```bash
SoapySDRUtil --find
python -c "import SoapySDR; print('SoapySDR ok')"
SDR_BACKEND=soapy ./scripts/start.sh
```

Optional: limit direct discovery with `SDR_SOAPY_DRIVERS=hackrf,rtlsdr,airspy,bladerf,sidekiq`.

SoapySDR/vendor probe and overflow warnings are written to `~/.sdr-shark/logs/soapysdr.log` by default instead of the service console. Override with `SDR_SOAPY_LOG_FILE=/path/to/soapysdr.log`, or set `SDR_SOAPY_LOG_STDERR=1` while debugging to show them on stderr again.

Backend startup auto-launches the React dev frontend when `frontend/node_modules` exists. If port `3000` is already in use, it skips auto-start instead of prompting for another port. Set `SDR_SHARK_AUTO_START_FRONTEND=0` to disable this behavior, or `SDR_SHARK_FRONTEND_PORT=3001` to use a different frontend port.


**Option 2:** If you want to make changes and develop

#run the frontend from the frontend folder
yarn start

#run the backend using python3
python3 -m sdr_plot_backend

Then, Browse to the IP Address of your PC, port 3000. i.e. 10.139.1.86:3000
