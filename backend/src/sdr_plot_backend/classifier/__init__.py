from sdr_plot_backend.classifier import FM, AM, Bluetooth, WiFi, LTE, FiveG



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
            FiveG.FiveGClassifier()
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

# Example usage
if __name__ == "__main__":
    classifier = SignalClassifier()
    potential_signals = classifier.classify_signal(2402, 1)  # Test with Bluetooth Classic frequency
    for signal in potential_signals:
        print(f"Potential Signal: {signal['label']} at {signal['frequency']} MHz, Bandwidth: {signal['bandwidth']} MHz, Channel: {signal.get('channel', 'N/A')}")
