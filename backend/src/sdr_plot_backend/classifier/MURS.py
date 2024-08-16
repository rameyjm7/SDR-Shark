from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class MURSClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "MURS", "frequency": 151.820, "bandwidth": 0.005, "metadata": "Multi-Use Radio Service"},
            {"label": "MURS", "frequency": 151.880, "bandwidth": 0.005, "metadata": "Multi-Use Radio Service"},
            {"label": "MURS", "frequency": 151.940, "bandwidth": 0.005, "metadata": "Multi-Use Radio Service"},
            {"label": "MURS", "frequency": 154.570, "bandwidth": 0.005, "metadata": "Multi-Use Radio Service"},
            {"label": "MURS", "frequency": 154.600, "bandwidth": 0.005, "metadata": "Multi-Use Radio Service"}
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
