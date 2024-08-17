from sdr_plot_backend.classifier.Base import BaseSignalClassifier

# iDEN (Integrated Digital Enhanced Network) Classifier
class iDENClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "iDEN", "frequency": 806.0, "bandwidth": 19.0, "metadata": "800 MHz SMR (Specialized Mobile Radio)"},
            {"label": "iDEN", "frequency": 896.0, "bandwidth": 19.0, "metadata": "900 MHz SMR (Specialized Mobile Radio)"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)
