from sdr_plot_backend.classifier import FM, AM, Bluetooth, WiFi

class SignalClassifier:
    def __init__(self):
        self.classifiers = [
            WiFi.WiFiSignalClassifier(),
            Bluetooth.BluetoothSignalClassifier(),
            FM.FMRadioSignalClassifier(),
            AM.AMRadioSignalClassifier(),
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        matches = []
        for classifier in self.classifiers:
            matches.extend(classifier.classify_signal(frequency_mhz, bandwidth_mhz))
        return matches


# Example usage
if __name__ == "__main__":
    classifier = SignalClassifier()
    potential_signals = classifier.classify_signal(2402, 1)  # Test with Bluetooth Classic frequency
    for signal in potential_signals:
        print(f"Potential Signal: {signal['label']} at {signal['frequency']} MHz, Bandwidth: {signal['bandwidth']} MHz, Channel: {signal.get('channel', 'N/A')}")
