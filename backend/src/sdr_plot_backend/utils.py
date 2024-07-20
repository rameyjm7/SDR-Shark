import threading

class sdr_scheduler_config:
    
    def __init__(self) -> None:
        self.center_freq = 102.1e6  # Center frequency in Hz
        self.sample_rate = 16e6     # Sample rate in Hz
        self.bandwidth = 16e6     
        self.gain = 30              # Gain in dB
        self.tasks = []
        self.task_lock = threading.Lock()
        self.sleeptime = 0.01
        self.sample_size = 1 * 1024  # Adjust sample size to receive more data
        self.center_freq = 102.1e6  # Center frequency in Hz
        self.sample_rate = 16e6     # Sample rate in Hz
        self.gain = 30              # Gain in dB
        self.fft_averaging = 20
        self.dc_suppress = True
        self.number_of_peaks = 5
        self.recordings_dir = "/root/workspace/data/recordings/"
        pass

vars = sdr_scheduler_config()