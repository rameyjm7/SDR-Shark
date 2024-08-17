from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class SiriusXMRadioClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "Sirius XM Radio", "frequency": 2320.0, "bandwidth": 4.0, "metadata": "Sirius XM Satellite Radio Band 1"},
            {"label": "Sirius XM Radio", "frequency": 2332.5, "bandwidth": 4.0, "metadata": "Sirius XM Satellite Radio Band 2"},
            {"label": "Sirius XM Radio", "frequency": 2345.0, "bandwidth": 4.0, "metadata": "Sirius XM Satellite Radio Band 3"},
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
