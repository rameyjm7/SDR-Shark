from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class AMRadioSignalClassifier(BaseSignalClassifier):
    def __init__(self):
        self.signals = [
            {"label": "AM Radio", "frequency": 535, "bandwidth": 10},
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
