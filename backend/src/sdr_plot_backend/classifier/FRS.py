from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class FRSClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "FRS", "frequency": 462.5625, "bandwidth": 0.0125, "channel": "1", "metadata": "Channel 1"},
            {"label": "FRS", "frequency": 462.5875, "bandwidth": 0.0125, "channel": "2", "metadata": "Channel 2"},
            {"label": "FRS", "frequency": 462.6125, "bandwidth": 0.0125, "channel": "3", "metadata": "Channel 3"},
            {"label": "FRS", "frequency": 462.6375, "bandwidth": 0.0125, "channel": "4", "metadata": "Channel 4"},
            {"label": "FRS", "frequency": 462.6625, "bandwidth": 0.0125, "channel": "5", "metadata": "Channel 5"},
            {"label": "FRS", "frequency": 462.6875, "bandwidth": 0.0125, "channel": "6", "metadata": "Channel 6"},
            {"label": "FRS", "frequency": 462.7125, "bandwidth": 0.0125, "channel": "7", "metadata": "Channel 7"},
            {"label": "FRS", "frequency": 467.5625, "bandwidth": 0.0125, "channel": "8", "metadata": "Channel 8"},
            {"label": "FRS", "frequency": 467.5875, "bandwidth": 0.0125, "channel": "9", "metadata": "Channel 9"},
            {"label": "FRS", "frequency": 467.6125, "bandwidth": 0.0125, "channel": "10", "metadata": "Channel 10"},
            {"label": "FRS", "frequency": 467.6375, "bandwidth": 0.0125, "channel": "11", "metadata": "Channel 11"},
            {"label": "FRS", "frequency": 467.6625, "bandwidth": 0.0125, "channel": "12", "metadata": "Channel 12"},
            {"label": "FRS", "frequency": 467.6875, "bandwidth": 0.0125, "channel": "13", "metadata": "Channel 13"},
            {"label": "FRS", "frequency": 467.7125, "bandwidth": 0.0125, "channel": "14", "metadata": "Channel 14"},
            {"label": "FRS", "frequency": 462.5500, "bandwidth": 0.0125, "channel": "15", "metadata": "Channel 15"},
            {"label": "FRS", "frequency": 462.5750, "bandwidth": 0.0125, "channel": "16", "metadata": "Channel 16"},
            {"label": "FRS", "frequency": 462.6000, "bandwidth": 0.0125, "channel": "17", "metadata": "Channel 17"},
            {"label": "FRS", "frequency": 462.6250, "bandwidth": 0.0125, "channel": "18", "metadata": "Channel 18"},
            {"label": "FRS", "frequency": 462.6500, "bandwidth": 0.0125, "channel": "19", "metadata": "Channel 19"},
            {"label": "FRS", "frequency": 462.6750, "bandwidth": 0.0125, "channel": "20", "metadata": "Channel 20"},
            {"label": "FRS", "frequency": 462.7000, "bandwidth": 0.0125, "channel": "21", "metadata": "Channel 21"},
            {"label": "FRS", "frequency": 462.7250, "bandwidth": 0.0125, "channel": "22", "metadata": "Channel 22"}
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        matches = []
        for band in self.bands:
            if band["frequency"] - band["bandwidth"]/2 <= frequency_mhz <= band["frequency"] + band["bandwidth"]/2:
                matches.append({
                    "label": band["label"],
                    "frequency": band["frequency"],
                    "bandwidth": band["bandwidth"],
                    "channel": f"Channel {band['channel']}",
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
                    "channel": f"Channel {band['channel']}",
                    "metadata": band["metadata"]
                })
        return matches
