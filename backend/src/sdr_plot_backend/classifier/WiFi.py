from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class WiFi24GHzClassifier(BaseSignalClassifier):
    def __init__(self):
        self.channels = [
            {"channel": 1, "frequency": 2412, "bandwidth": 22, "metadata": ""},
            {"channel": 2, "frequency": 2417, "bandwidth": 22, "metadata": ""},
            {"channel": 3, "frequency": 2422, "bandwidth": 22, "metadata": ""},
            {"channel": 4, "frequency": 2427, "bandwidth": 22, "metadata": ""},
            {"channel": 5, "frequency": 2432, "bandwidth": 22, "metadata": ""},
            {"channel": 6, "frequency": 2437, "bandwidth": 22, "metadata": ""},
            {"channel": 7, "frequency": 2442, "bandwidth": 22, "metadata": ""},
            {"channel": 8, "frequency": 2447, "bandwidth": 22, "metadata": ""},
            {"channel": 9, "frequency": 2452, "bandwidth": 22, "metadata": ""},
            {"channel": 10, "frequency": 2457, "bandwidth": 22, "metadata": ""},
            {"channel": 11, "frequency": 2462, "bandwidth": 22, "metadata": ""},
            {"channel": 12, "frequency": 2467, "bandwidth": 22, "metadata": "Low Power Only (US)"},
            {"channel": 13, "frequency": 2472, "bandwidth": 22, "metadata": "Low Power Only (US)"},
            {"channel": 14, "frequency": 2484, "bandwidth": 22, "metadata": "Japan Only"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        for channel in self.channels:
            if frequency_mhz == channel["frequency"]:
                return [{
                    "label": "WiFi 2.4 GHz",
                    "frequency": channel["frequency"],
                    "bandwidth": channel["bandwidth"],
                    "channel": f"{channel['channel']}",
                    "metadata": channel["metadata"]
                }]
        return []

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        matches = []
        for channel in self.channels:
            if start_freq_mhz <= channel["frequency"] <= end_freq_mhz:
                matches.append({
                    "label": "WiFi 2.4 GHz",
                    "frequency": channel["frequency"],
                    "bandwidth": channel["bandwidth"],
                    "channel": f"{channel['channel']}",
                    "metadata": channel["metadata"]
                })
        return matches

class WiFi5GHzClassifier(BaseSignalClassifier):
    def __init__(self):
        self.channels = [
            {"channel": 36, "frequency": 5180, "bandwidth": 20, "metadata": ""},
            {"channel": 40, "frequency": 5200, "bandwidth": 20, "metadata": ""},
            {"channel": 44, "frequency": 5220, "bandwidth": 20, "metadata": ""},
            {"channel": 48, "frequency": 5240, "bandwidth": 20, "metadata": ""},
            {"channel": 52, "frequency": 5260, "bandwidth": 20, "metadata": "DFS"},
            {"channel": 56, "frequency": 5280, "bandwidth": 20, "metadata": "DFS"},
            {"channel": 60, "frequency": 5300, "bandwidth": 20, "metadata": "DFS"},
            {"channel": 64, "frequency": 5320, "bandwidth": 20, "metadata": "DFS"},
            {"channel": 149, "frequency": 5745, "bandwidth": 20, "metadata": ""},
            {"channel": 153, "frequency": 5765, "bandwidth": 20, "metadata": ""},
            {"channel": 157, "frequency": 5785, "bandwidth": 20, "metadata": ""},
            {"channel": 161, "frequency": 5805, "bandwidth": 20, "metadata": ""},
            {"channel": 165, "frequency": 5825, "bandwidth": 20, "metadata": ""}
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        for channel in self.channels:
            if channel["frequency"] - channel["bandwidth"]/2 <= frequency_mhz <= channel["frequency"] + channel["bandwidth"]/2:
                return [{
                    "label": "WiFi 5 GHz",
                    "frequency": channel["frequency"],
                    "bandwidth": channel["bandwidth"],
                    "channel": f"{channel['channel']}",
                    "metadata": channel["metadata"]
                }]
        return []

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        matches = []
        for channel in self.channels:
            if start_freq_mhz <= channel["frequency"] <= end_freq_mhz:
                matches.append({
                    "label": "WiFi 5 GHz",
                    "frequency": channel["frequency"],
                    "bandwidth": channel["bandwidth"],
                    "channel": f"{channel['channel']}",
                    "metadata": channel["metadata"]
                })
        return matches
