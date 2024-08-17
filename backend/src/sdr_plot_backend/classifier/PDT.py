from sdr_plot_backend.classifier.Base import BaseSignalClassifier

# PDT (Police Digital Trunking) Classifier
class PDTClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "PDT", "frequency": 350.0, "bandwidth": 50.0, "metadata": "UHF"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches in range(start_freq_mhz, end_freq_mhz)
