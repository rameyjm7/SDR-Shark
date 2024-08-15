from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class AviationServiceClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "Aviation Service", "frequency": 2850.0, "bandwidth": 100.0, "metadata": "Aviation Service Band 1"},
            {"label": "Aviation Service", "frequency": 2375.0, "bandwidth": 30.0, "metadata": "Aviation Service Band 2"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        for band in self.bands:
            if band["frequency"] - band["bandwidth"]/2 <= frequency_mhz <= band["frequency"] + band["bandwidth"]/2:
                return [{
                    "label": band["label"],
                    "frequency": band["frequency"],
                    "bandwidth": band["bandwidth"],
                    "metadata": band["metadata"]
                }]
        return []

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
