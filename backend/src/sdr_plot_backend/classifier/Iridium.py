from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class IridiumClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "Iridium", "frequency": 1616.0, "bandwidth": 10.0, "metadata": "Iridium Satellite Network"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)