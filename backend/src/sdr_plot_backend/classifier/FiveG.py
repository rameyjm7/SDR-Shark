from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class FiveGClassifier(BaseSignalClassifier):
    def __init__(self):
        self.fiveg_bands = [
            {"label": "5G Band n71", "uplink": (663, 698), "downlink": (617, 652), "bandwidth": 36},
            {"label": "5G Band n29", "downlink": (717, 728), "bandwidth": 12},
            {"label": "5G Band n12", "uplink": (699, 716), "downlink": (729, 746), "bandwidth": 18},
            {"label": "5G Band n5", "uplink": (824, 849), "downlink": (869, 894), "bandwidth": 26},
            {"label": "5G Band n70", "uplink": (1695, 1710), "downlink": (1995, 2020), "bandwidth": 16},
            {"label": "5G Band n4", "uplink": (1710, 1755), "downlink": (2110, 2155), "bandwidth": 46},
            {"label": "5G Band n66", "uplink": (1710, 1780), "downlink": (2110, 2200), "bandwidth": 71},
            {"label": "5G Band n2", "uplink": (1850, 1910), "downlink": (1930, 1990), "bandwidth": 61},
            {"label": "5G Band n25", "uplink": (1850, 1915), "downlink": (1930, 1995), "bandwidth": 66},
            {"label": "5G Band n40", "downlink": (2300, 2400), "bandwidth": 100},
            {"label": "5G Band n41", "downlink": (2496, 2690), "bandwidth": 195},
            {"label": "5G Band n38", "downlink": (2570, 2620), "bandwidth": 50},
            {"label": "5G Band n77", "downlink": (3450, 3980), "bandwidth": 530},
            {"label": "5G Band n258", "downlink": (24250, 27500), "bandwidth": 3250},
            {"label": "5G Band n261", "downlink": (27500, 28350), "bandwidth": 850},
            {"label": "5G Band n260", "downlink": (37000, 40000), "bandwidth": 3000},
            {"label": "5G Band n262", "downlink": (47200, 48200), "bandwidth": 1000},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        matches = []
        for band in self.fiveg_bands:
            # Check if the signal falls within the uplink or downlink range
            if "uplink" in band and band["uplink"][0] <= frequency_mhz <= band["uplink"][1]:
                signal = {"label": band["label"] + " Uplink", "frequency": frequency_mhz, "bandwidth": band["bandwidth"]}
                matches.append(signal)
            if "downlink" in band and band["downlink"][0] <= frequency_mhz <= band["downlink"][1]:
                signal = {"label": band["label"] + " Downlink", "frequency": frequency_mhz, "bandwidth": band["bandwidth"]}
                matches.append(signal)
        return matches

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        matches = []
        for band in self.fiveg_bands:
            if "uplink" in band and not (end_freq_mhz < band["uplink"][0] or start_freq_mhz > band["uplink"][1]):
                signal = {"label": band["label"] + " Uplink", "frequency": band["uplink"][0], "bandwidth": band["bandwidth"]}
                matches.append(signal)
            if "downlink" in band and not (end_freq_mhz < band["downlink"][0] or start_freq_mhz > band["downlink"][1]):
                signal = {"label": band["label"] + " Downlink", "frequency": band["downlink"][0], "bandwidth": band["bandwidth"]}
                matches.append(signal)
        return matches
