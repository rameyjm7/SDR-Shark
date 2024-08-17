from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class TETRAClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "TETRA", "frequency": 380.0, "bandwidth": 20.0, "metadata": "Government and Emergency Services"},
            {"label": "TETRA", "frequency": 410.0, "bandwidth": 20.0, "metadata": "Civilian Use"},
            {"label": "TETRA", "frequency": 450.0, "bandwidth": 20.0, "metadata": "General TETRA"},
            {"label": "TETRA", "frequency": 806.0, "bandwidth": 64.0, "metadata": "General TETRA"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)
