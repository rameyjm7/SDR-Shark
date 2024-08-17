from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class DMRClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            # VHF Band (136-174 MHz)
            {"label": "DMR", "frequency": 136.0, "bandwidth": 0.0125, "metadata": "VHF DMR Channel - Lower End"},
            {"label": "DMR", "frequency": 174.0, "bandwidth": 0.0125, "metadata": "VHF DMR Channel - Upper End"},
            
            # UHF Band (403-527 MHz)
            {"label": "DMR", "frequency": 403.0, "bandwidth": 0.0125, "metadata": "UHF DMR Channel - Lower End"},
            {"label": "DMR", "frequency": 527.0, "bandwidth": 0.0125, "metadata": "UHF DMR Channel - Upper End"},

            # Typical DMR Frequencies
            {"label": "DMR", "frequency": 446.0, "bandwidth": 0.0125, "metadata": "UHF DMR Common Frequency"},
            {"label": "DMR", "frequency": 464.5, "bandwidth": 0.0125, "metadata": "UHF DMR Business Band"},
            {"label": "DMR", "frequency": 461.0, "bandwidth": 0.0125, "metadata": "UHF DMR Industrial/Business"},
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
