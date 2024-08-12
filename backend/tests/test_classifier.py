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

    # New tests for signals in range
    def test_signals_in_range_wifi_and_bluetooth(self):
        result = self.classifier.get_signals_in_range(2450, 60)  # 2420 MHz to 2480 MHz
        expected_labels = {'WiFi 2.4 GHz', 'Bluetooth Classic', 'Bluetooth Low Energy'}
        result_labels = {signal['label'] for signal in result}
        self.assertTrue(expected_labels.issubset(result_labels))

    def test_signals_in_range_fm_radio(self):
        result = self.classifier.get_signals_in_range(100, 10)  # 95 MHz to 105 MHz
        expected_labels = {'FM Radio'}
        result_labels = {signal['label'] for signal in result}
        self.assertTrue(expected_labels.issubset(result_labels))

    def test_signals_in_range_am_radio(self):
        result = self.classifier.get_signals_in_range(600, 100)  # 550 MHz to 650 MHz
        expected_labels = {'AM Radio'}
        result_labels = {signal['label'] for signal in result}
        self.assertTrue(expected_labels.issubset(result_labels))

    def test_signals_in_range_bluetooth_classic_only(self):
        result = self.classifier.get_signals_in_range(2440, 20)  # 2430 MHz to 2450 MHz
        expected_labels = {'Bluetooth Classic'}
        result_labels = {signal['label'] for signal in result}
        self.assertTrue(expected_labels.issubset(result_labels))

    # New tests for LTE signals in range
    def test_signals_in_range_lte_band_71(self):
        result = self.classifier.get_signals_in_range(670, 40)  # 650 MHz to 690 MHz
        expected_labels = {'LTE Band 71', '5G Band n71'}  # Updated to include both LTE and 5G
        result_labels = {signal['label'] for signal in result}
        self.assertTrue(expected_labels.issubset(result_labels))

    def test_signals_in_range_lte_band_66(self):
        result = self.classifier.get_signals_in_range(1720, 60)  # 1690 MHz to 1750 MHz
        expected_labels = {'LTE Band 66'}
        result_labels = {signal['label'] for signal in result}
        self.assertTrue(expected_labels.issubset(result_labels))

    # New tests for 5G signals in range
    def test_signals_in_range_5g_band_n71(self):
        result = self.classifier.get_signals_in_range(670, 40)  # 650 MHz to 690 MHz
        expected_labels = {'5G Band n71'}
        result_labels = {signal['label'] for signal in result}
        self.assertTrue(expected_labels.issubset(result_labels))

    def test_signals_in_range_5g_band_n77(self):
        result = self.classifier.get_signals_in_range(3500, 600)  # 3200 MHz to 3800 MHz
        expected_labels = {'5G Band n77'}
        result_labels = {signal['label'] for signal in result}
        self.assertTrue(expected_labels.issubset(result_labels))

if __name__ == '__main__':
    unittest.main()
