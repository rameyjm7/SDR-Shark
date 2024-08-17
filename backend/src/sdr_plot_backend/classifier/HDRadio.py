from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class HDRadioClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "HD Radio", "frequency": 87.7, "bandwidth": 0.4, "metadata": "HD Radio FM Band - Lower End"},
            {"label": "HD Radio", "frequency": 107.9, "bandwidth": 0.4, "metadata": "HD Radio FM Band - Upper End"},
            {"label": "HD Radio", "frequency": 530.0, "bandwidth": 0.01, "metadata": "HD Radio AM Band - Lower End"},
            {"label": "HD Radio", "frequency": 1710.0, "bandwidth": 0.01, "metadata": "HD Radio AM Band - Upper End"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        matches = []
        for band in self.bands:
            if band["frequency"] - band["bandwidth"]/2 <= frequency_mhz <= band["frequency"] + band["bandwidth"]/2:
                matches.append({
                    "label": band["label"],
                    "frequency": band["frequency"],
                    "bandwidth": band["bandwidth"],
                    "metadata": band["metadata"]
                })
        return matches

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        matches = []
        for band in self.bands:
            if start_freq_mhz <= band["frequency"] <= end_freq_mhz:
                matches.append({
                    "label": band["label"],
                    "frequency": band["frequency"],
                    "bandwidth": band["bandwidth"],
                    "metadata": band["metadata"]
                })
        return matches
