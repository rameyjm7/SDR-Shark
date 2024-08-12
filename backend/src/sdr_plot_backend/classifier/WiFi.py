from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class WiFi24GHzClassifier(BaseSignalClassifier):
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        if 2400 <= frequency_mhz <= 2422:
            return [{"label": "WiFi 2.4 GHz", "frequency": 2400, "bandwidth": 22, "channel": "802.11 WLAN"}]
        return []

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        if 2400 <= end_freq_mhz and start_freq_mhz <= 2422:
            return [{"label": "WiFi 2.4 GHz", "frequency": 2400, "bandwidth": 22, "channel": "802.11 WLAN"}]
        return []

class WiFi5GHzClassifier(BaseSignalClassifier):
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        if 5180 <= frequency_mhz <= 5340:
            return [{"label": "WiFi 5 GHz", "frequency": 5180, "bandwidth": 160, "channel": "802.11 WLAN"}]
        return []

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        if 5180 <= end_freq_mhz and start_freq_mhz <= 5340:
            return [{"label": "WiFi 5 GHz", "frequency": 5180, "bandwidth": 160, "channel": "802.11 WLAN"}]
        return []
