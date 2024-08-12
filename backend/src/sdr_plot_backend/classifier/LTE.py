from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class LTEClassifier(BaseSignalClassifier):
    def __init__(self):
        self.lte_bands = [
            {"label": "LTE Band 71 Uplink", "frequency": 663, "bandwidth": 36, "channel": "71"},
            {"label": "LTE Band 71 Downlink", "frequency": 617, "bandwidth": 36, "channel": "71"},
            {"label": "LTE Band 29 Downlink", "frequency": 722.5, "bandwidth": 12, "channel": "29"},
            {"label": "LTE Band 12 Uplink", "frequency": 707.5, "bandwidth": 18, "channel": "12"},
            {"label": "LTE Band 12 Downlink", "frequency": 737.5, "bandwidth": 18, "channel": "12"},
            {"label": "LTE Band 17 Uplink", "frequency": 710, "bandwidth": 12, "channel": "17"},
            {"label": "LTE Band 17 Downlink", "frequency": 740, "bandwidth": 12, "channel": "17"},
            {"label": "LTE Band 13 Uplink", "frequency": 782, "bandwidth": 10, "channel": "13"},
            {"label": "LTE Band 13 Downlink", "frequency": 751, "bandwidth": 10, "channel": "13"},
            {"label": "LTE Band 14 Uplink", "frequency": 793, "bandwidth": 11, "channel": "14"},
            {"label": "LTE Band 14 Downlink", "frequency": 763, "bandwidth": 11, "channel": "14"},
            {"label": "LTE Band 5 Uplink", "frequency": 836.5, "bandwidth": 25, "channel": "5"},
            {"label": "LTE Band 5 Downlink", "frequency": 881.5, "bandwidth": 25, "channel": "5"},
            {"label": "LTE Band 26 Uplink", "frequency": 831.5, "bandwidth": 35, "channel": "26"},
            {"label": "LTE Band 26 Downlink", "frequency": 876.5, "bandwidth": 35, "channel": "26"},
            {"label": "LTE Band 4 Uplink", "frequency": 1732.5, "bandwidth": 45, "channel": "4"},
            {"label": "LTE Band 4 Downlink", "frequency": 2132.5, "bandwidth": 45, "channel": "4"},
            {"label": "LTE Band 66 Uplink", "frequency": 1745, "bandwidth": 70, "channel": "66"},
            {"label": "LTE Band 66 Downlink", "frequency": 2155, "bandwidth": 70, "channel": "66"},
            {"label": "LTE Band 2 Uplink", "frequency": 1880, "bandwidth": 60, "channel": "2"},
            {"label": "LTE Band 2 Downlink", "frequency": 1960, "bandwidth": 60, "channel": "2"},
            {"label": "LTE Band 25 Uplink", "frequency": 1882.5, "bandwidth": 65, "channel": "25"},
            {"label": "LTE Band 25 Downlink", "frequency": 1962.5, "bandwidth": 65, "channel": "25"},
            {"label": "LTE Band 30 Uplink", "frequency": 2310, "bandwidth": 10, "channel": "30"},
            {"label": "LTE Band 30 Downlink", "frequency": 2355, "bandwidth": 10, "channel": "30"},
            {"label": "LTE Band 41 Uplink/Downlink", "frequency": 2593, "bandwidth": 194, "channel": "41"},
            {"label": "LTE Band 38 Uplink/Downlink", "frequency": 2595, "bandwidth": 50, "channel": "38"},
            {"label": "LTE Band 48 Uplink/Downlink", "frequency": 3625, "bandwidth": 150, "channel": "48"},
            {"label": "LTE Band 46 Uplink/Downlink", "frequency": 5537.5, "bandwidth": 775, "channel": "46"},
        ]
    
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        matches = []
        for band in self.lte_bands:
            if band["frequency"] - band["bandwidth"]/2 <= frequency_mhz <= band["frequency"] + band["bandwidth"]/2:
                matches.append({
                    "label": band["label"],
                    "frequency": band["frequency"],
                    "bandwidth": band["bandwidth"],
                    "channel": f"Channel {band['channel']} (Center Frequency: {band['frequency']} MHz)"
                })
        return matches

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        matches = []
        for band in self.lte_bands:
            if start_freq_mhz <= band["frequency"] <= end_freq_mhz:
                matches.append({
                    "label": band["label"],
                    "frequency": str(band["frequency"]),
                    "bandwidth": str(band["bandwidth"]),
                    "channel": f"{band['channel']} (Center Frequency: {band['frequency']} MHz)"
                })
        return matches
