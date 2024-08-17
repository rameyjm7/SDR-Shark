from sdr_plot_backend.classifier.Base import BaseSignalClassifier

# https://www.ntia.doc.gov/files/ntia/publications/compendium/0460.00-0470.00_01MAR14.pdf

class FourSixtyToFourSeventyMHzClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            {
                "label": "Public Safety Interoperability",
                "frequency": 460.000,
                "bandwidth": 10.000,  # Covers the entire 460-470 MHz range
                "metadata": "Used for land mobile systems for public safety interoperability between Federal, State, and local entities."
            },
            {
                "label": "Medical Telemetry",
                "frequency": 460.6625,
                "bandwidth": 0.025,  # 25 kHz spacing for telemetry
                "metadata": "Low-power, non-voice biomedical telemetry systems in hospitals, medical centers, and convalescent centers."
            },
            {
                "label": "Medical Telemetry",
                "frequency": 460.6875,
                "bandwidth": 0.025,  # 25 kHz spacing for telemetry
                "metadata": "Low-power, non-voice biomedical telemetry systems in hospitals, medical centers, and convalescent centers."
            },
            {
                "label": "Medical Telemetry",
                "frequency": 460.7125,
                "bandwidth": 0.025,  # 25 kHz spacing for telemetry
                "metadata": "Low-power, non-voice biomedical telemetry systems in hospitals, medical centers, and convalescent centers."
            },
            {
                "label": "Medical Telemetry",
                "frequency": 460.7375,
                "bandwidth": 0.025,  # 25 kHz spacing for telemetry
                "metadata": "Low-power, non-voice biomedical telemetry systems in hospitals, medical centers, and convalescent centers."
            },
            {
                "label": "Medical Telemetry",
                "frequency": 460.7625,
                "bandwidth": 0.025,  # 25 kHz spacing for telemetry
                "metadata": "Low-power, non-voice biomedical telemetry systems in hospitals, medical centers, and convalescent centers."
            },
            {
                "label": "Medical Telemetry",
                "frequency": 460.7875,
                "bandwidth": 0.025,  # 25 kHz spacing for telemetry
                "metadata": "Low-power, non-voice biomedical telemetry systems in hospitals, medical centers, and convalescent centers."
            },
            {
                "label": "Medical Telemetry",
                "frequency": 460.8125,
                "bandwidth": 0.025,  # 25 kHz spacing for telemetry
                "metadata": "Low-power, non-voice biomedical telemetry systems in hospitals, medical centers, and convalescent centers."
            },
            {
                "label": "Medical Telemetry",
                "frequency": 460.8375,
                "bandwidth": 0.025,  # 25 kHz spacing for telemetry
                "metadata": "Low-power, non-voice biomedical telemetry systems in hospitals, medical centers, and convalescent centers."
            },
            {
                "label": "Medical Telemetry",
                "frequency": 460.8625,
                "bandwidth": 0.025,  # 25 kHz spacing for telemetry
                "metadata": "Low-power, non-voice biomedical telemetry systems in hospitals, medical centers, and convalescent centers."
            },
            {
                "label": "Meteorological Satellite",
                "frequency": 468.750,
                "bandwidth": 0.200,  # 200 kHz bandwidth for GOES satellite downlink
                "metadata": "GOES meteorological satellite downlink used for Data Collection Platforms (DCPs)."
            },
            {
                "label": "Meteorological Satellite",
                "frequency": 468.950,
                "bandwidth": 0.200,  # 200 kHz bandwidth for GOES satellite downlink
                "metadata": "GOES meteorological satellite downlink used for Data Collection Platforms (DCPs)."
            }
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
