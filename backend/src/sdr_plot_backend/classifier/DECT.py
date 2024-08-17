from sdr_plot_backend.classifier.Base import BaseSignalClassifier

# DECT (Digital Enhanced Cordless Telecommunications)
class DECTClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "DECT", "frequency": 1880.0, "bandwidth": 20.0, "metadata": "Europe"},
            {"label": "DECT", "frequency": 1920.0, "bandwidth": 20.0, "metadata": "USA"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)
