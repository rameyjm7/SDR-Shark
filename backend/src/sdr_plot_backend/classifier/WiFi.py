from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class WiFi24GHzClassifier(BaseSignalClassifier):
    def __init__(self):
        self.channels = [
            {"channel": 1, "frequency": 2412, "bandwidth": 22},
            {"channel": 2, "frequency": 2417, "bandwidth": 22},
            {"channel": 3, "frequency": 2422, "bandwidth": 22},
            {"channel": 4, "frequency": 2427, "bandwidth": 22},
            {"channel": 5, "frequency": 2432, "bandwidth": 22},
            {"channel": 6, "frequency": 2437, "bandwidth": 22},
            {"channel": 7, "frequency": 2442, "bandwidth": 22},
            {"channel": 8, "frequency": 2447, "bandwidth": 22},
            {"channel": 9, "frequency": 2452, "bandwidth": 22},
            {"channel": 10, "frequency": 2457, "bandwidth": 22},
            {"channel": 11, "frequency": 2462, "bandwidth": 22},
            {"channel": 12, "frequency": 2467, "bandwidth": 22},
            {"channel": 13, "frequency": 2472, "bandwidth": 22},
            {"channel": 14, "frequency": 2484, "bandwidth": 22},  # Only in Japan
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        for channel in self.channels:
            if frequency_mhz == channel["frequency"]:
                return [{
                    "label": "WiFi 2.4 GHz",
                    "frequency": channel["frequency"],
                    "bandwidth": channel["bandwidth"],
                    "channel": f"Channel {channel['channel']}"
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
                    "channel": f"Channel {channel['channel']}"
                })
        return matches

class WiFi5GHzClassifier(BaseSignalClassifier):
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        if 5180 <= frequency_mhz <= 5340:
            return [{"label": "WiFi 5 GHz", "frequency": 5180, "bandwidth": 160, "channel": "802.11 WLAN"}]
        return []

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        if 5180 <= end_freq_mhz and start_freq_mhz <= 5340:
            return [{"label": "WiFi 5 GHz", "frequency": 5180, "bandwidth": 160, "channel": "802.11 WLAN"}]
        return []