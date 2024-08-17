from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class InmarsatClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "Inmarsat", "frequency": 1525.0, "bandwidth": 16.5, "metadata": "Inmarsat-C"},
            {"label": "Inmarsat", "frequency": 1626.5, "bandwidth": 14.0, "metadata": "Inmarsat-M"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)
