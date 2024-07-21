import threading
from sdrfly.sdr.sdr_generic import SDRGeneric

class sdr_scheduler_config:
    
    def __init__(self) -> None:
        self.center_freq = 102.1e6  # Center frequency in Hz
        self.sample_rate = 16e6     # Sample rate in Hz
        self.bandwidth = 16e6     
        self.gain = 30              # Gain in dB
        self.tasks = []
        self.task_lock = threading.Lock()
        self.sleeptime = 0.01
        self.sample_size = 8 * 1024  # Adjust sample size to receive more data
        self.center_freq = 102.1e6  # Center frequency in Hz
        self.sample_rate = 11e6     # Sample rate in Hz
        self.gain = 30              # Gain in dB
        self.fft_averaging = 20
        self.dc_suppress = True
        self.number_of_peaks = 5
        self.recordings_dir = "/root/workspace/data/recordings"
        

        self.radio_name = "sidekiq"
        self.hackrf_sdr =  SDRGeneric(self.radio_name, center_freq=self.center_freq, sample_rate=self.sample_rate, bandwidth=self.sample_rate, gain=self.gain, size=self.sample_size)
        self.hackrf_sdr.start()
    
    def reselect_radio(self, name : str) -> int:
        names = ["sidekiq", "hackrf"]
        for _name in names:
            if _name in name:
                self.hackrf_sdr.stop()
                self.hackrf_sdr.close()
                self.hackrf_sdr = None
                self.radio_name = name
                self.hackrf_sdr =  SDRGeneric(self.radio_name, center_freq=self.center_freq, sample_rate=self.sample_rate, bandwidth=self.sample_rate, gain=self.gain, size=self.sample_size)
                return 0
        return 1
        


vars = sdr_scheduler_config()