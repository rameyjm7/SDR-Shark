from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class FmRadioClassifier(BaseSignalClassifier):
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        if 88 <= frequency_mhz <= 108:
            return [{"label": "FM Radio", "frequency": 88, "bandwidth": 20}]
        return []

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        if 88 <= end_freq_mhz and start_freq_mhz <= 108:
            return [{"label": "FM Radio", "frequency": 88, "bandwidth": 20}]
        return []