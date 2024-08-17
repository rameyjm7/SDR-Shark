from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class OpenSkyClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "OpenSky", "frequency": 851.0, "bandwidth": 18.0, "metadata": "800 MHz Public Safety"},
            {"label": "OpenSky", "frequency": 935.0, "bandwidth": 12.5, "metadata": "900 MHz Public Safety"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        return self.match_frequency(frequency_mhz, bandwidth_mhz)

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        return self.get_matches_in_range(start_freq_mhz, end_freq_mhz)
