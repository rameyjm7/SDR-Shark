from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class AircraftRadioClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {"label": "Emergency", "frequency": 121.5, "metadata": "International Aeronautical Emergency Frequency"},
            {"label": "Air-to-Air", "frequency": 122.75, "metadata": "Air-to-Air Communication"},
            {"label": "ATIS", "frequency": 122.2, "metadata": "Automatic Terminal Information Service"},
            {"label": "Flight Watch", "frequency": 122.0, "metadata": "En Route Flight Advisory Service"},
            {"label": "Clearance", "frequency": 121.7, "metadata": "Clearance Delivery"},
            {"label": "Ground Control", "frequency": 121.3, "metadata": "Ground Control"},
            {"label": "Tower", "frequency": 118.0, "metadata": "Control Tower"},
            {"label": "Tower", "frequency": 118.3, "metadata": "Control Tower"},
            {"label": "Tower", "frequency": 119.1, "metadata": "Control Tower"},
            {"label": "Approach/Departure", "frequency": 119.7, "metadata": "Approach and Departure Control"},
            {"label": "Approach/Departure", "frequency": 120.1, "metadata": "Approach and Departure Control"},
            {"label": "Approach/Departure", "frequency": 120.5, "metadata": "Approach and Departure Control"},
            {"label": "Flight Service", "frequency": 122.2, "metadata": "Flight Service Station"},
            {"label": "Weather", "frequency": 122.1, "metadata": "Flight Service Weather Information"},
            {"label": "Weather", "frequency": 122.675, "metadata": "Flight Service Weather Information"},
            {"label": "ATIS", "frequency": 122.8, "metadata": "Automatic Terminal Information Service"},
            {"label": "CTAF/UNICOM", "frequency": 122.7, "metadata": "Common Traffic Advisory Frequency (CTAF) / UNICOM"},
            {"label": "CTAF/UNICOM", "frequency": 123.0, "metadata": "Common Traffic Advisory Frequency (CTAF) / UNICOM"},
            {"label": "CTAF/UNICOM", "frequency": 123.05, "metadata": "Common Traffic Advisory Frequency (CTAF) / UNICOM"},
            {"label": "CTAF/UNICOM", "frequency": 123.075, "metadata": "Common Traffic Advisory Frequency (CTAF) / UNICOM"},
            {"label": "VOR", "frequency": 108.0, "metadata": "VHF Omnidirectional Range"},
            {"label": "VOR", "frequency": 108.1, "metadata": "VHF Omnidirectional Range"},
            {"label": "VOR", "frequency": 108.2, "metadata": "VHF Omnidirectional Range"},
            {"label": "VOR", "frequency": 108.3, "metadata": "VHF Omnidirectional Range"},
            {"label": "VOR", "frequency": 108.4, "metadata": "VHF Omnidirectional Range"},
            {"label": "VOR", "frequency": 108.5, "metadata": "VHF Omnidirectional Range"},
            {"label": "VOR", "frequency": 108.6, "metadata": "VHF Omnidirectional Range"},
            {"label": "VOR", "frequency": 108.7, "metadata": "VHF Omnidirectional Range"},
            {"label": "VOR", "frequency": 108.8, "metadata": "VHF Omnidirectional Range"},
            {"label": "VOR", "frequency": 108.9, "metadata": "VHF Omnidirectional Range"},
            {"label": "VOR", "frequency": 109.0, "metadata": "VHF Omnidirectional Range"},
            {"label": "ILS Localizer", "frequency": 108.1, "metadata": "Instrument Landing System Localizer"},
            {"label": "ILS Localizer", "frequency": 108.3, "metadata": "Instrument Landing System Localizer"},
            {"label": "ILS Localizer", "frequency": 108.5, "metadata": "Instrument Landing System Localizer"},
            {"label": "ILS Localizer", "frequency": 108.7, "metadata": "Instrument Landing System Localizer"},
            {"label": "ILS Localizer", "frequency": 108.9, "metadata": "Instrument Landing System Localizer"},
            {"label": "ILS Glideslope", "frequency": 329.3, "metadata": "Instrument Landing System Glideslope"},
            {"label": "ILS Glideslope", "frequency": 329.6, "metadata": "Instrument Landing System Glideslope"},
            {"label": "ILS Glideslope", "frequency": 329.9, "metadata": "Instrument Landing System Glideslope"},
            {"label": "ILS Glideslope", "frequency": 330.2, "metadata": "Instrument Landing System Glideslope"},
            {"label": "ILS Glideslope", "frequency": 330.5, "metadata": "Instrument Landing System Glideslope"},
            {"label": "ILS Glideslope", "frequency": 330.8, "metadata": "Instrument Landing System Glideslope"},
            {"label": "ILS Glideslope", "frequency": 331.1, "metadata": "Instrument Landing System Glideslope"},
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        for band in self.bands:
            if abs(frequency_mhz - band["frequency"]) <= (bandwidth_mhz or 0):
                return [{
                    "label": band["label"],
                    "frequency": band["frequency"],
                    "metadata": band["metadata"]
                }]
        return []

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        matches = []
        for band in self.bands:
            if start_freq_mhz <= band["frequency"] <= end_freq_mhz:
                matches.append({
                    "label": band["label"],
                    "frequency": band["frequency"],
                    "metadata": band["metadata"]
                })
        return matches
