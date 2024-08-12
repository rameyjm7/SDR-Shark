from sdr_plot_backend.classifier.Base import BaseSignalClassifier
from typing import List, Dict, Any

class BluetoothClassicClassifier(BaseSignalClassifier):
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        if 2402 <= frequency_mhz <= 2480:
            channel_offset = round((frequency_mhz - 2402))
            if 0 <= channel_offset < 79:
                channel = f"Channel {channel_offset} (Bluetooth Classic)"
            else:
                channel = "Unknown Channel"
            return [{"label": "Bluetooth Classic", "frequency": frequency_mhz, "bandwidth": 1, "channel": channel}]
        return []

    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        if 2402 <= end_freq_mhz and start_freq_mhz <= 2480:
            return [{"label": "Bluetooth Classic", "frequency": 2402, "bandwidth": 1}]
        return []


class BluetoothLowEnergyClassifier(BaseSignalClassifier):
    def __init__(self):
        super().__init__()
        self.label = "Bluetooth Low Energy"
        self.advertising_channels = {
            37: "Channel 37 (BLE Advertising)",
            38: "Channel 38 (BLE Advertising)",
            39: "Channel 39 (BLE Advertising)",
        }
        self.data_channels = {
            i: f"Channel {i} (BLE Data)" for i in range(37)
        }

    def classify_signal(self, frequency_mhz: float, bandwidth_mhz: float) -> List[Dict[str, Any]]:
        matches = []
        signal_copy = {"label": self.label, "frequency": frequency_mhz, "bandwidth": bandwidth_mhz}

        if frequency_mhz in [2402, 2426, 2480]:  # Advertising channels
            channel = {2402: 37, 2426: 38, 2480: 39}.get(frequency_mhz)
            signal_copy["channel"] = self.advertising_channels.get(channel, "Unknown Channel")
        elif 2404 <= frequency_mhz <= 2478 and (frequency_mhz - 2404) % 2 == 0:  # Data channels
            channel_offset = (frequency_mhz - 2404) // 2
            signal_copy["channel"] = self.data_channels.get(channel_offset, "Unknown Channel")
        else:
            signal_copy["channel"] = "Unknown Channel"

        matches.append(signal_copy)
        return matches

    def get_signals_in_range(self, start_freq_mhz: float, end_freq_mhz: float) -> List[Dict[str, Any]]:
        matches = []
        for freq in range(int(start_freq_mhz), int(end_freq_mhz) + 1, 2):
            if freq in [2402, 2426, 2480]:  # Advertising channels
                channel = {2402: 37, 2426: 38, 2480: 39}.get(freq)
                channel_label = self.advertising_channels.get(channel, "Unknown Channel")
            elif 2404 <= freq <= 2478 and (freq - 2404) % 2 == 0:  # Data channels
                channel_offset = (freq - 2404) // 2
                channel_label = self.data_channels.get(channel_offset, "Unknown Channel")
            else:
                continue

            signal_copy = {"label": self.label, "frequency": freq, "bandwidth": 2, "channel": channel_label}
            matches.append(signal_copy)

        return matches
