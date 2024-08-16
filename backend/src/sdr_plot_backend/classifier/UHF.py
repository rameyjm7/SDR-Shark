from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class UHFFrequenciesClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "70 cm Amateur Band", "frequency": 435.000, "bandwidth": 30.000, "metadata": "Ham Radio"},
            {"label": "GMRS", "frequency": 462.550, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 462.575, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 462.600, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 462.625, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 462.650, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 462.675, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 462.700, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 462.725, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 467.550, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 467.575, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 467.600, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 467.625, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 467.650, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 467.675, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 467.700, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"},
            {"label": "GMRS", "frequency": 467.725, "bandwidth": 0.025, "metadata": "General Mobile Radio Service"}
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
