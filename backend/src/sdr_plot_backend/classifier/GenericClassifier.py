from sdr_plot_backend.classifier.Base import BaseSignalClassifier

class GenericClassifier(BaseSignalClassifier):
    def __init__(self):
        self.bands = [
            # APCO-16
            {"label": "APCO-16", "frequency": 821.0, "bandwidth": 45.0, "channel": "", "metadata": "Public Safety Uplink"},
            {"label": "APCO-16", "frequency": 866.0, "bandwidth": 45.0, "channel": "", "metadata": "Public Safety Downlink"},
            
            # CDMA
            {"label": "CDMA", "frequency": 824.0, "bandwidth": 25.0, "channel": "", "metadata": "CDMA Cellular"},
            {"label": "CDMA", "frequency": 1850.0, "bandwidth": 60.0, "channel": "", "metadata": "CDMA PCS"},
            
            # DECT
            {"label": "DECT", "frequency": 1880.0, "bandwidth": 20.0, "channel": "", "metadata": "DECT Cordless Telephones"},
            {"label": "DECT", "frequency": 1920.0, "bandwidth": 20.0, "channel": "", "metadata": "DECT Cordless Telephones"},

            # dPMR
            {"label": "dPMR", "frequency": 446.0, "bandwidth": 12.5, "channel": "", "metadata": "dPMR"},
            {"label": "dPMR", "frequency": 169.0, "bandwidth": 12.5, "channel": "", "metadata": "dPMR"},

            # GSM
            {"label": "GSM", "frequency": 890.0, "bandwidth": 25.0, "channel": "", "metadata": "GSM 900 Uplink"},
            {"label": "GSM", "frequency": 935.0, "bandwidth": 25.0, "channel": "", "metadata": "GSM 900 Downlink"},
            {"label": "GSM", "frequency": 1710.0, "bandwidth": 75.0, "channel": "", "metadata": "GSM 1800 Uplink"},
            {"label": "GSM", "frequency": 1805.0, "bandwidth": 75.0, "channel": "", "metadata": "GSM 1800 Downlink"},

            # iDEN
            {"label": "iDEN", "frequency": 806.0, "bandwidth": 25.0, "channel": "", "metadata": "iDEN"},
            {"label": "iDEN", "frequency": 821.0, "bandwidth": 45.0, "channel": "", "metadata": "iDEN"},
            {"label": "iDEN", "frequency": 851.0, "bandwidth": 45.0, "channel": "", "metadata": "iDEN"},

            # Inmarsat
            {"label": "Inmarsat", "frequency": 1525.0, "bandwidth": 16.5, "channel": "", "metadata": "Inmarsat-C"},
            {"label": "Inmarsat", "frequency": 1626.5, "bandwidth": 14.0, "channel": "", "metadata": "Inmarsat-M"},

            # Iridium
            {"label": "Iridium", "frequency": 1616.0, "bandwidth": 30.0, "channel": "", "metadata": "Iridium Satellite Communication"},

            # LTR
            {"label": "LTR", "frequency": 450.0, "bandwidth": 12.5, "channel": "", "metadata": "LTR Trunked Radio"},

            # MPT1327
            {"label": "MPT1327", "frequency": 450.0, "bandwidth": 12.5, "channel": "", "metadata": "MPT1327 Trunked Radio"},
            {"label": "MPT1327", "frequency": 806.0, "bandwidth": 12.5, "channel": "", "metadata": "MPT1327 Trunked Radio"},

            # NXDN
            {"label": "NXDN", "frequency": 450.0, "bandwidth": 12.5, "channel": "", "metadata": "NXDN"},
            {"label": "NXDN", "frequency": 935.0, "bandwidth": 25.0, "channel": "", "metadata": "NXDN"},

            # OpenSky
            {"label": "OpenSky", "frequency": 806.0, "bandwidth": 45.0, "channel": "", "metadata": "OpenSky"},
            {"label": "OpenSky", "frequency": 851.0, "bandwidth": 45.0, "channel": "", "metadata": "OpenSky"},

            # PDT
            {"label": "PDT", "frequency": 350.0, "bandwidth": 20.0, "channel": "", "metadata": "PDT Public Safety"},
            {"label": "PDT", "frequency": 800.0, "bandwidth": 20.0, "channel": "", "metadata": "PDT Public Safety"},

            # TETRA
            {"label": "TETRA", "frequency": 380.0, "bandwidth": 20.0, "channel": "", "metadata": "Government and Emergency Services"},
            {"label": "TETRA", "frequency": 410.0, "bandwidth": 20.0, "channel": "", "metadata": "Civilian Use"},
            {"label": "TETRA", "frequency": 450.0, "bandwidth": 20.0, "channel": "", "metadata": "General TETRA"},
            {"label": "TETRA", "frequency": 806.0, "bandwidth": 64.0, "channel": "", "metadata": "General TETRA"},

            # TDMA
            {"label": "TDMA", "frequency": 824.0, "bandwidth": 25.0, "channel": "", "metadata": "TDMA Cellular"},
            {"label": "TDMA", "frequency": 1850.0, "bandwidth": 60.0, "channel": "", "metadata": "TDMA PCS"},

            # UMTS
            {"label": "UMTS", "frequency": 1920.0, "bandwidth": 60.0, "channel": "", "metadata": "UMTS WCDMA Uplink"},
            {"label": "UMTS", "frequency": 2110.0, "bandwidth": 60.0, "channel": "", "metadata": "UMTS WCDMA Downlink"},

            # WiFiDirect
            {"label": "WiFiDirect", "frequency": 2412.0, "bandwidth": 22.0, "channel": "", "metadata": "WiFi Direct 2.4 GHz"},
            {"label": "WiFiDirect", "frequency": 5180.0, "bandwidth": 160.0, "channel": "", "metadata": "WiFi Direct 5 GHz"},

            # WiMAX
            {"label": "WiMAX", "frequency": 2300.0, "bandwidth": 100.0, "channel": "", "metadata": "WiMAX TDD"},
            {"label": "WiMAX", "frequency": 3500.0, "bandwidth": 100.0, "channel": "", "metadata": "WiMAX TDD"},
        ]
