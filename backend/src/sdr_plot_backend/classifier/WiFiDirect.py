from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class WiFiDirectClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "WiFi Direct", "frequency": 2400.0, "bandwidth": 83.5, "metadata": "2.4 GHz Band"},
            {"label": "WiFi Direct", "frequency": 5000.0, "bandwidth": 160.0, "metadata": "5 GHz Band"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)
