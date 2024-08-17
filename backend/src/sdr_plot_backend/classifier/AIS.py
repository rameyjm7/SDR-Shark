from sdr_plot_backend.classifier.Base import BaseSignalClassifier

# AIS (Automatic Identification System)
class AISClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "AIS", "frequency": 161.975, "bandwidth": 0.025, "metadata": "AIS Channel 1"},
            {"label": "AIS", "frequency": 162.025, "bandwidth": 0.025, "metadata": "AIS Channel 2"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)
