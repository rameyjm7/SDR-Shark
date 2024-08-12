from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class LteClassifier(BaseSignalClassifier):
    def __init__(self):
        self.lte_bands = [
            {"label": "LTE Band 71", "uplink": (663, 698), "downlink": (617, 652), "bandwidth": 36},
            {"label": "LTE Band 29", "downlink": (717, 728), "bandwidth": 12},
            {"label": "LTE Band 12", "uplink": (699, 716), "downlink": (729, 746), "bandwidth": 18},
            {"label": "LTE Band 17", "uplink": (704, 716), "downlink": (734, 746), "bandwidth": 13},
            {"label": "LTE Band 13", "uplink": (777, 787), "downlink": (746, 756), "bandwidth": 11},
            {"label": "LTE Band 14", "uplink": (788, 798), "downlink": (758, 768), "bandwidth": 11},
            {"label": "LTE Band 5", "uplink": (824, 849), "downlink": (869, 894), "bandwidth": 26},
            {"label": "LTE Band 26", "uplink": (814, 849), "downlink": (859, 894), "bandwidth": 36},
            {"label": "LTE Band 4", "uplink": (1710, 1755), "downlink": (2110, 2155), "bandwidth": 46},
            {"label": "LTE Band 66", "uplink": (1710, 1780), "downlink": (2110, 2200), "bandwidth": 71},
            {"label": "LTE Band 2", "uplink": (1850, 1910), "downlink": (1930, 1990), "bandwidth": 61},
            {"label": "LTE Band 25", "uplink": (1850, 1915), "downlink": (1930, 1995), "bandwidth": 66},
            {"label": "LTE Band 30", "downlink": (2305, 2360), "bandwidth": 11},
            {"label": "LTE Band 41", "downlink": (2496, 2690), "bandwidth": 195},
            {"label": "LTE Band 38", "downlink": (2570, 2620), "bandwidth": 50},
            {"label": "LTE Band 48", "downlink": (3550, 3700), "bandwidth": 151},
            {"label": "LTE Band 46", "downlink": (5150, 5925), "bandwidth": 776},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        matches = []
        for band in self.lte_bands:
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
        for band in self.lte_bands:
            if "uplink" in band and not (end_freq_mhz < band["uplink"][0] or start_freq_mhz > band["uplink"][1]):
                signal = {"label": band["label"] + " Uplink", "frequency": band["uplink"][0], "bandwidth": band["bandwidth"]}
                matches.append(signal)
            if "downlink" in band and not (end_freq_mhz < band["downlink"][0] or start_freq_mhz > band["downlink"][1]):
                signal = {"label": band["label"] + " Downlink", "frequency": band["downlink"][0], "bandwidth": band["bandwidth"]}
                matches.append(signal)
        return matches
