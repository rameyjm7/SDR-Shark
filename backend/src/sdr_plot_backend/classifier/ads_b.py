from sdr_plot_backend.classifier.Base import BaseSignalClassifier

# ADS-B (Automatic Dependent Surveillance-Broadcast)
class ADSBClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "ADS-B", "frequency": 1090.0, "bandwidth": 1.0, "metadata": "ADS-B Broadcast"},
        ]