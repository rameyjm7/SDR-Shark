from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class AmRadioClassifier(BaseSignalClassifier):
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        frequency_khz = frequency_mhz * 1000  # Convert MHz to kHz
        bandwidth_khz = bandwidth_mhz * 1000 if bandwidth_mhz else None
        
        if 535 <= frequency_khz <= 1700:
            return [{"label": "AM Radio", "frequency": frequency_khz / 1000, "bandwidth": 10}]
        return []

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        start_freq_khz = start_freq_mhz * 1000  # Convert MHz to kHz
        end_freq_khz = end_freq_mhz * 1000  # Convert MHz to kHz
        
        if 535 <= end_freq_khz and start_freq_khz <= 1700:
            return [{"label": "AM Radio", "frequency": 535, "bandwidth": 10}]
        return []
