import threading
import json
import os
from sdrfly.sdr.sdr_generic import SDRGeneric
import numpy as np

class sdr_scheduler_config:

    def __init__(self) -> None:
        self.settings_file = "/root/configurations/sdr_scheduler_config.json"

        # Default settings
        self.frequency = 102.1e6  # Center frequency in Hz
        self.sampleRate = 16e6   # Sample rate in Hz
        self.bandwidth = 16e6
        self.gain = 30            # Gain in dB
        self.tasks = []
        self.task_lock = threading.Lock()
        self.sleeptime = 0.01
        self.sample_size = 8 * 1024  # Adjust sample size to receive more data
        self.peak_threshold_minimum_dB = -25
        self.sweep_settings = {
            'frequency_start': 700e6,
            'frequency_stop': 820e6,
            'bandwidth': self.bandwidth
        }
        self.sweeping_enabled = False
        self.averagingCount = 20
        self.dc_suppress = True
        self.show_waterfall = True
        self.waterfall_samples = 100
        self.number_of_peaks = 5
        self.showFirstTrace = True
        self.showSecondTrace = False
        self.recordings_dir = "/root/workspace/data/recordings"
        self.lockBandwidthSampleRate = False  # Default setting for lock
        self.radio_name = "sidekiq"
        
        # Initialize SDRs
        self.sdr0 = SDRGeneric("sidekiq", center_freq=self.frequency, sample_rate=self.sampleRate, bandwidth=self.bandwidth, gain=self.gain, size=self.sample_size)
        self.sdr0.start()
        self.sdr1 = SDRGeneric("hackrf", center_freq=102.1e6, sample_rate=20e6, bandwidth=20e6,
                               gain=self.gain, size=self.sample_size)
        self.sdr1.start()
        
        # Load settings from file
        self.load_settings()

    def load_settings(self):
        """Load settings from a JSON file. If the file doesn't exist, create it with default values."""
        if os.path.exists(self.settings_file):
            try:
                with open(self.settings_file, 'r') as f:
                    settings = json.load(f)
                    self.apply_settings(settings)
            except Exception as e:
                print(f"Error loading settings: {e}")
        else:
            print(f"Settings file '{self.settings_file}' not found. Creating with default settings.")
            self.save_settings(self.get_default_config())
            with open(self.settings_file, 'r') as f:
                    settings = json.load(f)
                    self.apply_settings(settings)

    def save_settings(self, settings_ = None):
        """Save current settings to a JSON file."""
        if settings_:
            settings = settings_
        else:
            settings = self.get_settings()
        try:
            with open(self.settings_file, 'w') as f:
                json.dump(settings, f, indent=4)
        except Exception as e:
            print(f"Error saving settings: {e}")

    def validate_settings(self):
        """Validate and correct the settings to ensure they are within acceptable limits."""
        # Define acceptable limits for the settings
        MIN_FREQUENCY = 50e6  # Example minimum frequency
        MAX_FREQUENCY = 6000e6   # Example maximum frequency
        MIN_SAMPLE_RATE = 0.250e6  # Example minimum sample rate
        MAX_SAMPLE_RATE = 61.44e6  # Example maximum sample rate
        MIN_BANDWIDTH = 200e3   # Example minimum bandwidth
        MAX_BANDWIDTH = 61.44e6   # Example maximum bandwidth
        MIN_GAIN = 0            # Example minimum gain
        MAX_GAIN = 76           # Example maximum gain

        def validate_value(value, min_value, max_value):
            if not np.isfinite(value) or value < min_value or value > max_value:
                return min_value  # Default to minimum if out of range or not finite
            return value

        self.frequency = validate_value(self.frequency, MIN_FREQUENCY, MAX_FREQUENCY)
        self.sampleRate = validate_value(self.sampleRate, MIN_SAMPLE_RATE, MAX_SAMPLE_RATE)
        self.bandwidth = validate_value(self.bandwidth, MIN_BANDWIDTH, MAX_BANDWIDTH)
        self.gain = validate_value(self.gain, MIN_GAIN, MAX_GAIN)

        self.sweep_settings['frequency_start'] = validate_value(self.sweep_settings['frequency_start'], MIN_FREQUENCY, MAX_FREQUENCY)
        self.sweep_settings['frequency_stop'] = validate_value(self.sweep_settings['frequency_stop'], MIN_FREQUENCY, MAX_FREQUENCY)
        self.sweep_settings['bandwidth'] = validate_value(self.sweep_settings['bandwidth'], MIN_BANDWIDTH, MAX_BANDWIDTH)

    def get_settings(self):
        """Get current settings as a dictionary."""
        settings = {
            "frequency": self.frequency,
            "sample_rate": self.sampleRate,
            "bandwidth": self.bandwidth,
            "gain": self.gain,
            "sweep_settings": self.sweep_settings,
            "sweeping_enabled": self.sweeping_enabled,
            "peak_threshold_minimum_dB": self.peak_threshold_minimum_dB,
            "averagingCount": self.averagingCount,
            "dc_suppress": self.dc_suppress,
            "show_waterfall": self.show_waterfall,
            "waterfall_samples": self.waterfall_samples,
            "number_of_peaks": self.number_of_peaks,
            "recordings_dir": self.recordings_dir,
            "lockBandwidthSampleRate": self.lockBandwidthSampleRate,
            "radio_name": self.radio_name,
            "showFirstTrace": self.showFirstTrace,
            "showSecondTrace": self.showSecondTrace
        }
        return settings

    def apply_settings(self, settings):
        """Apply settings from a dictionary with validation."""
        self.frequency = settings.get("frequency", self.frequency)
        self.sampleRate = settings.get("sampleRate", self.sampleRate)
        self.bandwidth = settings.get("bandwidth", self.bandwidth)
        self.gain = settings.get("gain", self.gain)
        self.sweep_settings = settings.get("sweep_settings", self.sweep_settings)
        self.sweep_settings['frequency_start'] = settings.get("frequency_start", self.sweep_settings['frequency_start'])
        self.sweep_settings['frequency_stop'] = settings.get("frequency_stop", self.sweep_settings['frequency_stop'])
        self.sweeping_enabled = settings.get("sweeping_enabled", self.sweeping_enabled)
        self.peak_threshold_minimum_dB = settings.get("peak_threshold_minimum_dB", self.peak_threshold_minimum_dB)
        self.averagingCount = settings.get("averagingCount", self.averagingCount)
        self.dc_suppress = settings.get("dc_suppress", self.dc_suppress)
        self.show_waterfall = settings.get("show_waterfall", self.show_waterfall)
        self.waterfall_samples = settings.get("waterfall_samples", self.waterfall_samples)
        self.number_of_peaks = settings.get("number_of_peaks", self.number_of_peaks)
        self.recordings_dir = settings.get("recordings_dir", self.recordings_dir)
        self.lockBandwidthSampleRate = settings.get("lockBandwidthSampleRate", self.lockBandwidthSampleRate)
        self.showFirstTrace = settings.get("showFirstTrace", self.showFirstTrace)
        self.showSecondTrace = settings.get("showSecondTrace", self.showSecondTrace)
        self.radio_name = settings.get("radio_name", self.radio_name)

        # Validate the settings after applying them
        self.validate_settings()

        self.sdr_name = settings.get("sdr", self.radio_name)

        if self.sdr_name in 'hackrf':
            self.sdr1.set_frequency(self.frequency)
            self.sdr1.set_sample_rate(20e6 if self.sampleRate > 20e6 else self.sampleRate)
            self.sdr1.set_bandwidth(20e6 if self.sampleRate > 20e6 else self.sampleRate)
            self.sdr1.set_gain(self.gain)
        else:
            self.sdr0.set_frequency(self.frequency)
            self.sdr0.set_sample_rate(self.sampleRate)
            self.sdr0.set_bandwidth(self.sampleRate)
            self.sdr0.set_gain(self.gain)

    def reselect_radio(self, name: str) -> int:
        """Temporarily disabled due to the use of both radios."""
        print("Radio switching is currently disabled.")
        return 1
    
    def get_default_config(self):
        return """{
    "frequency": 751000000.0,
    "sample_rate": 60000000.0,
    "bandwidth": 60000000.0,
    "gain": 10,
    "sweep_settings": {
        "frequency_start": 700000000.0,
        "frequency_stop": 820000000.0,
        "bandwidth": 16000000.0
    },
    "sweeping_enabled": false,
    "peak_threshold_minimum_dB": -25,
    "averagingCount": 1,
    "dc_suppress": true,
    "show_waterfall": true,
    "waterfall_samples": 100,
    "number_of_peaks": 5,
    "recordings_dir": "/root/workspace/data/recordings",
    "lockBandwidthSampleRate": true,
    "radio_name": "sidekiq",
    "showFirstTrace": true,
    "showSecondTrace": true
        }"""

# Instantiate the configuration
vars = sdr_scheduler_config()
