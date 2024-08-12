from abc import ABC, abstractmethod


class BaseSignalClassifier(ABC):
    @abstractmethod
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        pass


class WiFiSignalClassifier(BaseSignalClassifier):
    def __init__(self):
        self.signals = [
            {"label": "WiFi 2.4 GHz", "frequency": 2400, "bandwidth": 22, "channel": "802.11 WLAN"},
            {"label": "WiFi 5 GHz", "frequency": 5180, "bandwidth": 160, "channel": "802.11 WLAN"},
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


class BluetoothSignalClassifier(BaseSignalClassifier):
    def __init__(self):
        self.signals = [
            {
                "label": "Bluetooth Classic",
                "frequency": 2402,
                "bandwidth": 1,
                "channels": {i: f"Channel {i} (Bluetooth Classic)" for i in range(79)},
            },
            {
                "label": "Bluetooth Low Energy",
                "frequency": 2404,
                "bandwidth": 2,
                "advertising_channels": {
                    37: "Channel 37 (BLE Advertising)",
                    38: "Channel 38 (BLE Advertising)",
                    39: "Channel 39 (BLE Advertising)",
                },
                "data_channels": {
                    i: f"Channel {i} (BLE Data)" for i in range(37)
                },
            },
        ]

    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        matches = []
        for signal in self.signals:
            signal_copy = signal.copy()

            if signal["label"] == "Bluetooth Classic":
                if 2402 <= frequency_mhz <= 2480:
                    channel_offset = round((frequency_mhz - signal["frequency"]))
                    if 0 <= channel_offset < 79:
                        signal_copy["channel"] = signal["channels"].get(channel_offset, "Unknown Channel")
                        signal_copy["frequency"] = frequency_mhz
                        signal_copy["bandwidth"] = 1
                    else:
                        signal_copy["channel"] = "Unknown Channel"
                    matches.append(signal_copy)

            elif signal["label"] == "Bluetooth Low Energy":
                if frequency_mhz in [2402, 2426, 2480]:  # Advertising channels
                    channel = {2402: 37, 2426: 38, 2480: 39}.get(frequency_mhz)
                    signal_copy["channel"] = signal["advertising_channels"].get(channel, "Unknown Channel")
                    signal_copy["frequency"] = frequency_mhz
                    signal_copy["bandwidth"] = 2
                elif 2404 <= frequency_mhz <= 2478 and (frequency_mhz - 2404) % 2 == 0:  # Data channels
                    channel_offset = (frequency_mhz - 2404) // 2
                    signal_copy["channel"] = signal["data_channels"].get(channel_offset, "Unknown Channel")
                    signal_copy["frequency"] = frequency_mhz
                    signal_copy["bandwidth"] = 2
                else:
                    signal_copy["channel"] = "Unknown Channel"
                matches.append(signal_copy)
        return matches


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


class AMRadioSignalClassifier(BaseSignalClassifier):
    def __init__(self):
        self.signals = [
            {"label": "AM Radio", "frequency": 535, "bandwidth": 10},
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


class SignalClassifier:
    def __init__(self):
        self.classifiers = [
            WiFiSignalClassifier(),
            BluetoothSignalClassifier(),
            FMRadioSignalClassifier(),
            AMRadioSignalClassifier(),
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
