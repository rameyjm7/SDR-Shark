from sdr_plot_backend.classifier.Base import BaseSignalClassifier

#  WiMAX (Worldwide Interoperability for Microwave Access)
class WiMAXClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "WiMAX", "frequency": 2300.0, "bandwidth": 100.0, "metadata": "Band 7"},
            {"label": "WiMAX", "frequency": 2496.0, "bandwidth": 55.5, "metadata": "Band 41"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)
