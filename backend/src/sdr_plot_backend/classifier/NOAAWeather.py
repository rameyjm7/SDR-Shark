from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class NOAAWeatherRadioClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "NOAA Weather Radio", "frequency": 162.400, "bandwidth": 0.025, "metadata": "Weather Radio"},
            {"label": "NOAA Weather Radio", "frequency": 162.425, "bandwidth": 0.025, "metadata": "Weather Radio"},
            {"label": "NOAA Weather Radio", "frequency": 162.450, "bandwidth": 0.025, "metadata": "Weather Radio"},
            {"label": "NOAA Weather Radio", "frequency": 162.475, "bandwidth": 0.025, "metadata": "Weather Radio"},
            {"label": "NOAA Weather Radio", "frequency": 162.500, "bandwidth": 0.025, "metadata": "Weather Radio"},
            {"label": "NOAA Weather Radio", "frequency": 162.525, "bandwidth": 0.025, "metadata": "Weather Radio"},
            {"label": "NOAA Weather Radio", "frequency": 162.550, "bandwidth": 0.025, "metadata": "Weather Radio"}
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
