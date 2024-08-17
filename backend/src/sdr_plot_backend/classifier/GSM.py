from sdr_plot_backend.classifier.Base import BaseSignalClassifier

#  GSM (Global System for Mobile Communications)
class GSMClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "GSM", "frequency": 890.0, "bandwidth": 25.0, "metadata": "GSM 900"},
            {"label": "GSM", "frequency": 1710.0, "bandwidth": 60.0, "metadata": "GSM 1800"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)
