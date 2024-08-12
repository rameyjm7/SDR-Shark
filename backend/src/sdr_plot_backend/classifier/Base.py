from abc import ABC, abstractmethod

class BaseSignalClassifier(ABC):
    @abstractmethod
    def classify_signal(self, frequency_mhz, bandwidth_mhz=None):
        pass


