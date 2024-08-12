from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class AmRadioClassifier(BaseSignalClassifier):
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        if 535 <= frequency_mhz <= 1700:
            return [{"label": "AM Radio", "frequency": 535, "bandwidth": 10}]
        return []

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        if 535 <= end_freq_mhz and start_freq_mhz <= 1700:
            return [{"label": "AM Radio", "frequency": 535, "bandwidth": 10}]
        return []
