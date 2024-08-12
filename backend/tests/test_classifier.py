import unittest
from sdr_plot_backend.classifier import SignalClassifier

class TestSignalClassifier(unittest.TestCase):

    def setUp(self):
        self.classifier = SignalClassifier()

    def test_wifi_2_4_ghz(self):
        result = self.classifier.classify_signal(2400, 22)
        self.assertTrue(any(signal['label'] == 'WiFi 2.4 GHz' for signal in result))

    def test_wifi_5_ghz(self):
        result = self.classifier.classify_signal(5180, 160)
        self.assertTrue(any(signal['label'] == 'WiFi 5 GHz' for signal in result))

    def test_fm_radio(self):
        result = self.classifier.classify_signal(92.1, 0.15)
        self.assertTrue(any(signal['label'] == 'FM Radio' for signal in result))
        result = self.classifier.classify_signal(102.1, 0.2)
        self.assertTrue(any(signal['label'] == 'FM Radio' for signal in result))
        
    def test_am_radio(self):
        result = self.classifier.classify_signal(535, 10)
        self.assertTrue(any(signal['label'] == 'AM Radio' for signal in result))

    def test_bluetooth_classic_channel_0(self):
        result = self.classifier.classify_signal(2402, 1)
        self.assertTrue(any(signal['label'] == 'Bluetooth Classic' and signal['channel'] == 'Channel 0 (Bluetooth Classic)' for signal in result))

    def test_bluetooth_classic_channel_78(self):
        result = self.classifier.classify_signal(2480, 1)
        self.assertTrue(any(signal['label'] == 'Bluetooth Classic' and signal['channel'] == 'Channel 78 (Bluetooth Classic)' for signal in result))

    def test_ble_channel_0(self):
        result = self.classifier.classify_signal(2404, 2)
        self.assertTrue(any(signal['label'] == 'Bluetooth Low Energy' and signal['channel'] == 'Channel 0 (BLE Data)' for signal in result))

    def test_ble_channel_35(self):
        result = self.classifier.classify_signal(2476, 2)
        self.assertTrue(any(signal['label'] == 'Bluetooth Low Energy' and signal['channel'] == 'Channel 35 (BLE Data)' for signal in result))

    def test_ble_channel_36(self):
        result = self.classifier.classify_signal(2478, 2)
        self.assertTrue(any(signal['label'] == 'Bluetooth Low Energy' and signal['channel'] == 'Channel 36 (BLE Data)' for signal in result))

    def test_ble_advertising_channel_37(self):
        result = self.classifier.classify_signal(2402, 2)
        self.assertTrue(any(signal['label'] == 'Bluetooth Low Energy' and signal['channel'] == 'Channel 37 (BLE Advertising)' for signal in result))

    def test_ble_advertising_channel_38(self):
        result = self.classifier.classify_signal(2426, 2)
        self.assertTrue(any(signal['label'] == 'Bluetooth Low Energy' and signal['channel'] == 'Channel 38 (BLE Advertising)' for signal in result))

    def test_ble_advertising_channel_39(self):
        result = self.classifier.classify_signal(2480, 2)
        self.assertTrue(any(signal['label'] == 'Bluetooth Low Energy' and signal['channel'] == 'Channel 39 (BLE Advertising)' for signal in result))

    def test_ble_unknown_channel(self):
        result = self.classifier.classify_signal(2415, 2)
        self.assertTrue(any(signal['label'] == 'Bluetooth Low Energy' and signal['channel'] == 'Unknown Channel' for signal in result))

    def test_bluetooth_classic_unknown_channel(self):
        result = self.classifier.classify_signal(2490, 1)
        self.assertFalse(any(signal['label'] == 'Bluetooth Classic' for signal in result))

if __name__ == '__main__':
    unittest.main()
