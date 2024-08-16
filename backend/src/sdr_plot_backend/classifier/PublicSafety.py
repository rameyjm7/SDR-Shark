from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class PublicSafetyClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "EMS Dispatch", "frequency": 155.340, "bandwidth": 0.005, "metadata": "EMS Dispatch"},
            {"label": "Fire Dispatch", "frequency": 155.160, "bandwidth": 0.005, "metadata": "Fire Dispatch"},
            {"label": "Fireground", "frequency": 154.280, "bandwidth": 0.005, "metadata": "Fireground"},
            {"label": "Law Enforcement", "frequency": 154.875, "bandwidth": 0.005, "metadata": "Law Enforcement"}
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
