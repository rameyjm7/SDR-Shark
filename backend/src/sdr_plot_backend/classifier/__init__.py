import csv
import json
from sdr_plot_backend.classifier.Base import BaseSignalClassifier
from sdr_plot_backend.classifier import FM, AM, Bluetooth, WiFi, LTE, FiveG, LoRaWAN, FRS, AeronauticalNavigation, AviationService
from sdr_plot_backend.classifier import BroadbandRadioService, BroadcastTV, EarthExpSatellite, FederalPart15
                                            

class SignalClassifier:
    def __init__(self):
        self.classifiers = [
            WiFi.WiFi24GHzClassifier(),
            WiFi.WiFi5GHzClassifier(),
            FM.FmRadioClassifier(),
            AM.AmRadioClassifier(),
            Bluetooth.BluetoothClassicClassifier(),
            Bluetooth.BluetoothLowEnergyClassifier(),
            LTE.LTEClassifier(),
            FiveG.FiveGClassifier(),
            FiveG.NRClassifier(),
            LoRaWAN.LoRaWANClassifier(),
            FRS.FRSClassifier(),
            AeronauticalNavigation.AeronauticalNavigationClassifier(),
            AviationService.AviationServiceClassifier(),
            BroadbandRadioService.BroadbandRadioServiceClassifier(),
            BroadcastTV.USBroadcastTVAndLPTVClassifier(),
            EarthExpSatellite.EarthExpSatelliteClassifier(),
            FederalPart15.FederalPart15Classifier()
            
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        results = []
        for classifier in self.classifiers:
            results.extend(classifier.classify_signal(frequency_mhz, bandwidth_mhz))
        return results

    def get_signals_in_range(self, center_freq_mhz, bandwidth_mhz):
        start_freq_mhz = center_freq_mhz - bandwidth_mhz / 2
        end_freq_mhz = center_freq_mhz + bandwidth_mhz / 2
        signals_in_range = []

        for classifier in self.classifiers:
            signals_in_range.extend(classifier.get_signals_in_range(start_freq_mhz, end_freq_mhz))

        return signals_in_range
    
    def get_all_bands(self):
        """Returns a list of all bands across all classifiers."""
        all_bands = []
        for classifier in self.classifiers:
            all_bands.extend(classifier.get_bands())
        return all_bands
    
    def dump_all_bands(self, file_path, format="json"):
        """Dump all bands from all classifiers into a JSON or CSV file."""
        all_bands = self.get_all_bands()
        
        if format == "json":
            with open(file_path, 'w') as json_file:
                json.dump(all_bands, json_file, indent=4)
        elif format == "csv":
            with open(file_path, 'w', newline='') as csv_file:
                fieldnames = ["label", "frequency", "bandwidth", "channel", "metadata"]
                writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

                writer.writeheader()
                for band in all_bands:
                    writer.writerow(band)
        else:
            raise ValueError(f"Unsupported format: {format}. Use 'json' or 'csv'.")
        
    def load_classifier_from_csv(self, file_path):
        """Load a classifier from a CSV file and add it to the list of classifiers."""
        class CustomClassifier(BaseSignalClassifier):
            def __init__(self, bands):
                self.bands = bands

            def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
                matches = []
                for band in self.bands:
                    if band["frequency"] - band["bandwidth"]/2 <= frequency_mhz <= band["frequency"] + band["bandwidth"]/2:
                        matches.append({
                            "label": band["label"],
                            "frequency": band["frequency"],
                            "bandwidth": band["bandwidth"],
                            "channel": band["channel"],
                            "metadata": band.get("metadata", "")
                        })
                return matches

            def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
                matches = []
                for band in self.bands:
                    if start_freq_mhz <= band["frequency"] <= end_freq_mhz:
                        matches.append({
                            "label": band["label"],
                            "frequency": str(band["frequency"]),
                            "bandwidth": str(band["bandwidth"]),
                            "channel": band["channel"],
                            "metadata": band.get("metadata", "")
                        })
                return matches
            
            def get_bands(self):
                """Return the list of bands."""
                return self.bands

        bands = []
        with open(file_path, mode='r') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            for row in csv_reader:
                band = {
                    "label": row["label"],
                    "frequency": float(row["frequency"]),
                    "bandwidth": float(row["bandwidth"]),
                    "channel": row.get("channel", ""),
                    "metadata": row.get("metadata", "")
                }
                bands.append(band)

        new_classifier = CustomClassifier(bands)
        self.classifiers.append(new_classifier)

    def load_classifier_from_json(self, file_path):
        """Load a classifier from a JSON file and add it to the list of classifiers."""
        class CustomClassifier(BaseSignalClassifier):
            def __init__(self, bands):
                self.bands = bands

            def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
                matches = []
                for band in self.bands:
                    if band["frequency"] - band["bandwidth"]/2 <= frequency_mhz <= band["frequency"] + band["bandwidth"]/2:
                        matches.append({
                            "label": band["label"],
                            "frequency": band["frequency"],
                            "bandwidth": band["bandwidth"],
                            "channel": band["channel"],
                            "metadata": band.get("metadata", "")
                        })
                return matches

            def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
                matches = []
                for band in self.bands:
                    if start_freq_mhz <= band["frequency"] <= end_freq_mhz:
                        matches.append({
                            "label": band["label"],
                            "frequency": str(band["frequency"]),
                            "bandwidth": str(band["bandwidth"]),
                            "channel": band["channel"],
                            "metadata": band.get("metadata", "")
                        })
                return matches
            
            def get_bands(self):
                """Return the list of bands."""
                return self.bands

        with open(file_path, mode='r') as json_file:
            bands = json.load(json_file)

        new_classifier = CustomClassifier(bands)
        self.classifiers.append(new_classifier)

# Example usage
if __name__ == "__main__":
    classifier = SignalClassifier()
    classifier.load_classifier_from_csv('signals.csv')
    classifier.load_classifier_from_json('signals.json')
    potential_signals = classifier.classify_signal(462.5625)  # Test with FRS frequency
    for signal in potential_signals:
        print(f"Potential Signal: {signal['label']} at {signal['frequency']} MHz, Bandwidth: {signal['bandwidth']} MHz, Channel: {signal.get('channel', 'N/A')}")
