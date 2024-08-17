from sdr_plot_backend.classifier.Base import BaseSignalClassifier

# TDMA (Time Division Multiple Access)
class TDMAClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "TDMA", "frequency": 935.0, "bandwidth": 25.0, "metadata": "TDMA Cellular"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)
