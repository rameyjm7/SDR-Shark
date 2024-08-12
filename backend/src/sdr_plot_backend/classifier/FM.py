from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class FMRadioSignalClassifier(BaseSignalClassifier):
    def __init__(self):
        self.signals = [
            {"label": "FM Radio", "frequency": 88, "bandwidth": 0.25},
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
