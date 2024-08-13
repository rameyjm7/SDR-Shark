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
