from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class LoRaWANClassifier(BaseSignalClassifier):
    def __init__(self):
        self.lorawan_bands = [
            # Uplink sub-bands
            {"label": "LoRaWAN", "frequency": 903.0, "bandwidth": 1.4, "channel": "0-7", "metadata": "Sub-Band 1"},
            {"label": "LoRaWAN", "frequency": 904.6, "bandwidth": 1.4, "channel": "8-15", "metadata": "Sub-Band 2"},
            {"label": "LoRaWAN", "frequency": 906.2, "bandwidth": 1.4, "channel": "16-23", "metadata": "Sub-Band 3"},
            {"label": "LoRaWAN", "frequency": 907.8, "bandwidth": 1.4, "channel": "24-31", "metadata": "Sub-Band 4"},
            {"label": "LoRaWAN", "frequency": 909.4, "bandwidth": 1.4, "channel": "32-39", "metadata": "Sub-Band 5"},
            {"label": "LoRaWAN", "frequency": 911.0, "bandwidth": 1.4, "channel": "40-47", "metadata": "Sub-Band 6"},
            {"label": "LoRaWAN", "frequency": 912.6, "bandwidth": 1.4, "channel": "48-55", "metadata": "Sub-Band 7"},
            {"label": "LoRaWAN", "frequency": 914.2, "bandwidth": 1.4, "channel": "56-63", "metadata": "Sub-Band 8"},
            # Downlink sub-bands
            {"label": "LoRaWAN", "frequency": 908.6, "bandwidth": 11.2, "channel": "64-71", "metadata": "Downlink Sub-Band"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        matches = []
        for band in self.lorawan_bands:
            if band["frequency"] - band["bandwidth"]/2 <= frequency_mhz <= band["frequency"] + band["bandwidth"]/2:
                matches.append({
                    "label": band["label"],
                    "frequency": band["frequency"],
                    "bandwidth": band["bandwidth"],
                    "channel": f"{band['channel']}",
                    "metadata": band["metadata"]
                })
        return matches

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        matches = []
        for band in self.lorawan_bands:
            if start_freq_mhz <= band["frequency"] <= end_freq_mhz:
                matches.append({
                    "label": band["label"],
                    "frequency": str(band["frequency"]),
                    "bandwidth": str(band["bandwidth"]),
                    "channel": f"{band['channel']}",
                    "metadata": band["metadata"]
                })
        return matches
