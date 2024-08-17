from sdr_plot_backend.classifier.Base import BaseSignalClassifier

# UMTS (Universal Mobile Telecommunications System)
class UMTSClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "UMTS", "frequency": 1920.0, "bandwidth": 60.0, "metadata": "UMTS Band 1"},
            {"label": "UMTS", "frequency": 2110.0, "bandwidth": 60.0, "metadata": "UMTS Band 1"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)
