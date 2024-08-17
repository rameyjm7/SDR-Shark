from sdr_plot_backend.classifier.Base import BaseSignalClassifier

# ADS-B (Automatic Dependent Surveillance-Broadcast)
class ADSBClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "ADS-B", "frequency": 1090.0, "bandwidth": 1.0, "metadata": "ADS-B Broadcast"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)
