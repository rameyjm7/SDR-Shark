from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class WiFiSignalClassifier(BaseSignalClassifier):
    def __init__(self):
        self.signals = [
            {"label": "WiFi 2.4 GHz", "frequency": 2400, "bandwidth": 22, "channel": "802.11 WLAN"},
            {"label": "WiFi 5 GHz", "frequency": 5180, "bandwidth": 160, "channel": "802.11 WLAN"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        matches = []
        for signal in self.signals:
            freq_diff = abs(signal["frequency"] - frequency_mhz)
            if freq_diff <= (signal["bandwidth"] / 2):
                signal_copy = signal.copy()
                signal_copy["frequency"] = frequency_mhz
                signal_copy["bandwidth"] = signal["bandwidth"]
                matches.append(signal_copy)
        return matches