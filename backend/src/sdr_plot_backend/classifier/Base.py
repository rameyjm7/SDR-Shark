from abc import ABC, abstractmethod

class BaseSignalClassifier(ABC):
    @abstractmethod
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        pass

    @abstractmethod
    def get_signals_in_range(self, start_freq_mhz, end_freq_mhz):
        pass
