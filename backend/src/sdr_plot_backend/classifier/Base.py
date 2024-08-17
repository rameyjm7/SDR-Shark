import json
import csv
from abc import ABC, abstractmethod

class BaseSignalClassifier(ABC):
    def __init__(self):
        self.bands = []

    @abstractmethod
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        pass

    @abstractmethod
    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        pass

    def get_bands(self):
        """Returns the list of bands handled by the classifier."""
        return self.bands

    def dump_bands(self, file_path, file_format='json'):
        """
        Dumps the list of bands to a file in the specified format (JSON or CSV).
        
        :param file_path: Path to the output file.
        :param file_format: Format to save the bands ('json' or 'csv').
        """
        if file_format == 'json':
            with open(file_path, 'w') as f:
                json.dump(self.bands, f, indent=4)
        elif file_format == 'csv':
            if self.bands:
                with open(file_path, 'w', newline='') as f:
                    writer = csv.DictWriter(f, fieldnames=self.bands[0].keys())
                    writer.writeheader()
                    for band in self.bands:
                        writer.writerow(band)
        else:
            raise ValueError("Unsupported file format. Use 'json' or 'csv'.")

    
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        matches = []
        for band in self.bands:
            if band["frequency"] - band["bandwidth"]/2 <= frequency_mhz <= band["frequency"] + band["bandwidth"]/2:
                matches.append({
                    "label": band["label"],
                    "frequency": band["frequency"],
                    "bandwidth": band["bandwidth"],
                    "channel": band["channel"],
                    "metadata": band["metadata"]
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
                    "metadata": band["metadata"]
                })
        return matches
