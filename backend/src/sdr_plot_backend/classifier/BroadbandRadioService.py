from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class BroadbandRadioServiceClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "Broadband Radio Service", "frequency": 2527.5, "bandwidth": 155.000, "metadata": "Broadband Radio Service Band 1"},
            {"label": "Broadband Radio Service", "frequency": 2672.5, "bandwidth": 35.000, "metadata": "Broadband Radio Service Band 2"},
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
