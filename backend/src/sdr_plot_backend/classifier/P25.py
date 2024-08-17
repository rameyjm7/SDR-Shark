from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class P25Classifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            # VHF Band (138-174 MHz)
            {"label": "P25", "frequency": 138.0, "bandwidth": 0.0125, "metadata": "VHF P25 - Lower End"},
            {"label": "P25", "frequency": 174.0, "bandwidth": 0.0125, "metadata": "VHF P25 - Upper End"},

            # UHF Band (380-512 MHz)
            {"label": "P25", "frequency": 380.0, "bandwidth": 0.0125, "metadata": "UHF P25 - Federal LMR Band"},
            {"label": "P25", "frequency": 406.1, "bandwidth": 0.0125, "metadata": "UHF P25 - Military/Federal"},
            {"label": "P25", "frequency": 450.0, "bandwidth": 0.0125, "metadata": "UHF P25 - Public Safety Band"},
            {"label": "P25", "frequency": 512.0, "bandwidth": 0.0125, "metadata": "UHF P25 - Upper End"},

            # 700 MHz Band (764-776 MHz and 794-806 MHz)
            {"label": "P25", "frequency": 764.0, "bandwidth": 0.0125, "metadata": "700 MHz P25 - Lower End"},
            {"label": "P25", "frequency": 776.0, "bandwidth": 0.0125, "metadata": "700 MHz P25 - Upper End"},
            {"label": "P25", "frequency": 794.0, "bandwidth": 0.0125, "metadata": "700 MHz P25 - Public Safety"},
            {"label": "P25", "frequency": 806.0, "bandwidth": 0.0125, "metadata": "700 MHz P25 - Upper End"},

            # 800 MHz Band (806-824 MHz and 851-869 MHz)
            {"label": "P25", "frequency": 806.0, "bandwidth": 0.0125, "metadata": "800 MHz P25 - Lower End"},
            {"label": "P25", "frequency": 824.0, "bandwidth": 0.0125, "metadata": "800 MHz P25 - Public Safety"},
            {"label": "P25", "frequency": 851.0, "bandwidth": 0.0125, "metadata": "800 MHz P25 - Repeater Input"},
            {"label": "P25", "frequency": 869.0, "bandwidth": 0.0125, "metadata": "800 MHz P25 - Upper End"},

            # 900 MHz Band (896-902 MHz and 935-941 MHz)
            {"label": "P25", "frequency": 896.0, "bandwidth": 0.0125, "metadata": "900 MHz P25 - Lower End"},
            {"label": "P25", "frequency": 902.0, "bandwidth": 0.0125, "metadata": "900 MHz P25 - Trunked"},
            {"label": "P25", "frequency": 935.0, "bandwidth": 0.0125, "metadata": "900 MHz P25 - Repeater Output"},
            {"label": "P25", "frequency": 941.0, "bandwidth": 0.0125, "metadata": "900 MHz P25 - Upper End"},
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
