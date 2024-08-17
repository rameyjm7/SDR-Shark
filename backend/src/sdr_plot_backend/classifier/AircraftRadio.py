from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class AircraftRadioClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "Aircraft Radio", "frequency": 118.0, "bandwidth": 0.025, "metadata": "ATC Ground"},
            {"label": "Aircraft Radio", "frequency": 118.025, "bandwidth": 0.025, "metadata": "ATC Ground"},
            {"label": "Aircraft Radio", "frequency": 118.05, "bandwidth": 0.025, "metadata": "ATC Ground"},
            {"label": "Aircraft Radio", "frequency": 121.5, "bandwidth": 0.025, "metadata": "Emergency"},
            {"label": "Aircraft Radio", "frequency": 122.2, "bandwidth": 0.025, "metadata": "Flight Service Station (FSS)"},
            {"label": "Aircraft Radio", "frequency": 122.75, "bandwidth": 0.025, "metadata": "Air-to-Air"},
            {"label": "Aircraft Radio", "frequency": 122.8, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 122.9, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 122.95, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.0, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.05, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.1, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.125, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.15, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.2, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.225, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.25, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.275, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.3, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.325, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.35, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.375, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.4, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.425, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 123.45, "bandwidth": 0.025, "metadata": "UNICOM"},
            {"label": "Aircraft Radio", "frequency": 122.0, "bandwidth": 0.025, "metadata": "Flight Watch"},
            {"label": "Aircraft Radio", "frequency": 122.1, "bandwidth": 0.025, "metadata": "FSS via VOR"},
            {"label": "Aircraft Radio", "frequency": 109.7, "bandwidth": 0.025, "metadata": "VOR"},
            {"label": "Aircraft Radio", "frequency": 118.7, "bandwidth": 0.025, "metadata": "ATC Tower"},
            {"label": "Aircraft Radio", "frequency": 121.7, "bandwidth": 0.025, "metadata": "ATC Ground"},
            {"label": "Aircraft Radio", "frequency": 121.9, "bandwidth": 0.025, "metadata": "ATC Ground"},
            {"label": "Aircraft Radio", "frequency": 123.675, "bandwidth": 0.025, "metadata": "ATIS/ASOS"},
            {"label": "Aircraft Radio", "frequency": 108.0, "bandwidth": 0.025, "metadata": "VOR"},
            {"label": "Aircraft Radio", "frequency": 110.0, "bandwidth": 0.025, "metadata": "VOR"},
            {"label": "Aircraft Radio", "frequency": 108.05, "bandwidth": 0.025, "metadata": "VOR"},
            {"label": "Aircraft Radio", "frequency": 118.1, "bandwidth": 0.025, "metadata": "ATC Ground"},
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
