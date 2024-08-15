from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class USBroadcastTVAndLPTVClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "US Broadcast TV", "frequency": 491.000, "bandwidth": 42.000, "metadata": "UHF television broadcast channels, primarily used for TV broadcasting."},
            {"label": "US Broadcast TV and LPTV", "frequency": 560.000, "bandwidth": 96.000, "metadata": "UHF television broadcast channels, including low-power television stations."},
            {"label": "US Broadcast TV and LPTV", "frequency": 656.000, "bandwidth": 84.000, "metadata": "UHF television broadcast channels, including low-power television stations."},
            {"label": "US Broadcast TV and LPTV", "frequency": 730.500, "bandwidth": 65.000, "metadata": "UHF television broadcast channels, including low-power television stations."},
            {"label": "Broadcast TV", "frequency": 54.0, "bandwidth": 18.0, "metadata": "VHF television broadcast channels"},
            {"label": "Broadcast TV", "frequency": 76.0, "bandwidth": 12.0, "metadata": "VHF television broadcast channels"}
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
