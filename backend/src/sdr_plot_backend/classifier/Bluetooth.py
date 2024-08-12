from sdr_plot_backend.classifier.Base import BaseSignalClassifier

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

