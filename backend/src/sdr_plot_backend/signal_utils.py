from sdrfly.sdr.sdr_generic import SDRGeneric
import numpy as np
import time
from sdr_plot_backend.utils import vars

def detect_signal_peaks(fft_magnitude_db, center_freq, sample_rate, fft_size, min_peak_distance=10, threshold_offset=1):
    center_freq = vars.frequency
    # Calculate the noise floor and adaptive threshold
    noise_floor = np.median(fft_magnitude_db)
    adaptive_threshold = noise_floor + threshold_offset  # Adjust to make the threshold more sensitive

    # Detect peaks and their bandwidths
    above_threshold = np.where(fft_magnitude_db > adaptive_threshold)[0]

    signal_peaks = []
    signal_bandwidths = []

    if len(above_threshold) > 0:
        left_idx = None
        for i in range(1, len(above_threshold)):
            if left_idx is None:
                left_idx = above_threshold[i-1]

            if above_threshold[i] - above_threshold[i-1] > min_peak_distance:  # Merge close peaks
                right_idx = above_threshold[i-1]
                peak_idx = left_idx + np.argmax(fft_magnitude_db[left_idx:right_idx+1])
                peak_freq = center_freq - (sample_rate/2) + (peak_idx/fft_size) * sample_rate
                signal_start_freq = center_freq - (sample_rate/2) + (left_idx/fft_size) * sample_rate
                signal_stop_freq = center_freq - (sample_rate/2) + (right_idx/fft_size) * sample_rate
                bandwidth_mhz = (signal_stop_freq - signal_start_freq) / 1e6

                signal_peaks.append(peak_freq / 1e6)
                signal_bandwidths.append(bandwidth_mhz)

                left_idx = above_threshold[i]

        # For the last segment
        if left_idx is not None:
            right_idx = above_threshold[-1]
            peak_idx = left_idx + np.argmax(fft_magnitude_db[left_idx:right_idx+1])
            peak_freq = center_freq - (sample_rate/2) + (peak_idx/fft_size) * sample_rate
            signal_start_freq = center_freq - (sample_rate/2) + (left_idx/fft_size) * sample_rate
            signal_stop_freq = center_freq - (sample_rate/2) + (right_idx/fft_size) * sample_rate
            bandwidth_mhz = (signal_stop_freq - signal_start_freq) / 1e6

            signal_peaks.append(peak_freq / 1e6)
            signal_bandwidths.append(bandwidth_mhz)

    return signal_peaks, signal_bandwidths


def detect_signal_peaks_freq_power(fft_magnitude_db, center_freq, sample_rate, fft_size, min_peak_distance=10, threshold_offset=1):
    """
    Detect peaks in the FFT data and return their frequencies and power levels.

    Parameters:
        fft_magnitude_db (array): The FFT magnitude in dB.
        center_freq (float): The center frequency of the current FFT segment.
        sample_rate (float): The sample rate of the SDR.
        fft_size (int): The size of the FFT.
        min_peak_distance (int): Minimum distance between peaks to be considered separate.
        threshold_offset (int): The threshold offset above the noise floor.

    Returns:
        signal_peaks (list): List of tuples containing the frequency and power of each detected peak.
    """
    # Calculate the noise floor and adaptive threshold
    noise_floor = np.median(fft_magnitude_db)
    adaptive_threshold = noise_floor + threshold_offset  # Adjust to make the threshold more sensitive

    # Detect peaks
    above_threshold = np.where(fft_magnitude_db > adaptive_threshold)[0]

    signal_peaks = []

    if len(above_threshold) > 0:
        left_idx = None
        for i in range(1, len(above_threshold)):
            if left_idx is None:
                left_idx = above_threshold[i-1]

            if above_threshold[i] - above_threshold[i-1] > min_peak_distance:  # Merge close peaks
                right_idx = above_threshold[i-1]
                peak_idx = left_idx + np.argmax(fft_magnitude_db[left_idx:right_idx+1])
                peak_freq = center_freq - (sample_rate / 2) + (peak_idx / fft_size) * sample_rate
                peak_power = fft_magnitude_db[peak_idx]

                signal_peaks.append((peak_freq / 1e6, peak_power))  # Frequency in MHz and power in dB

                left_idx = above_threshold[i]

        # For the last segment
        if left_idx is not None:
            right_idx = above_threshold[-1]
            peak_idx = left_idx + np.argmax(fft_magnitude_db[left_idx:right_idx+1])
            peak_freq = center_freq - (sample_rate / 2) + (peak_idx / fft_size) * sample_rate
            peak_power = fft_magnitude_db[peak_idx]

            signal_peaks.append((peak_freq / 1e6, peak_power))  # Frequency in MHz and power in dB

    return signal_peaks


def refine_peak_bandwidth(sdr, peak_freq, narrow_sample_rate=1e6, fft_size=1024, num_captures=10):
    """
    Refines the bandwidth of a detected peak by tuning to its center frequency with a narrower sample rate.
    
    Parameters:
        sdr (SDRGeneric): A handle to the currently active SDR object.
        peak_freq (float): The center frequency of the peak in Hz.
        narrow_sample_rate (float): The narrower sample rate for refining the peak bandwidth.
        fft_size (int): FFT size.
        num_captures (int): Number of captures to average.
    
    Returns:
        refined_bandwidth (float): The refined bandwidth in MHz.
        refined_fft_magnitude_db (np.ndarray): The FFT magnitude in dB.
        frequencies (np.ndarray): The frequency axis for plotting.
    """

    # Set the SDR to the narrow sample rate and tune to the peak frequency
    sdr.set_sample_rate(narrow_sample_rate)
    sdr.set_frequency(peak_freq)

    # Capture and average the FFTs
    fft_magnitude_sum = np.zeros(fft_size)
    for _ in range(num_captures):
        iq_data = sdr.get_latest_samples()
        fft_result = np.fft.fftshift(np.fft.fft(iq_data, fft_size))
        fft_magnitude = np.abs(fft_result)
        fft_magnitude_sum += fft_magnitude

    fft_magnitude_avg = fft_magnitude_sum / num_captures

    # Convert magnitude to dB
    fft_magnitude_db = 20 * np.log10(fft_magnitude_avg)

    # Calculate the noise floor and adaptive threshold
    noise_floor = np.median(fft_magnitude_db)
    adaptive_threshold = noise_floor + 3  # 3dB above the noise floor

    # Detect the bandwidth of the signal
    above_threshold = np.where(fft_magnitude_db > adaptive_threshold)[0]
    if len(above_threshold) > 0:
        left_idx = above_threshold[0]
        right_idx = above_threshold[-1]
        signal_start_freq = peak_freq - (narrow_sample_rate / 2) + (left_idx / fft_size) * narrow_sample_rate
        signal_stop_freq = peak_freq - (narrow_sample_rate / 2) + (right_idx / fft_size) * narrow_sample_rate
        refined_bandwidth = (signal_stop_freq - signal_start_freq) / 1e6  # Convert to MHz
    else:
        refined_bandwidth = 0  # If no signal is detected

    # Generate frequency axis for plotting
    frequencies = np.linspace(peak_freq - narrow_sample_rate/2, peak_freq + narrow_sample_rate/2, fft_size)

    return refined_bandwidth, fft_magnitude_db, frequencies


def perform_and_refine_scan(sdr: SDRGeneric, wide_sample_rate: float, wide_fft_size: int, num_captures: int, narrow_sample_rate: float = 1e6, narrow_fft_size: int = 1024, min_peak_distance: int = 80, threshold_offset: int = 5):
    """
    Perform a wideband FFT scan to detect peaks and then refine each peak's bandwidth.

    Args:
        sdr (SDRGeneric): Instance of the SDR to use for scanning.
        wide_sample_rate (float): Sample rate for the wideband scan.
        wide_fft_size (int): FFT size for the wideband scan.
        num_captures (int): Number of captures to average.
        narrow_sample_rate (float): Sample rate for the narrowband refinement. Default is 1 MHz.
        narrow_fft_size (int): FFT size for the narrowband refinement. Default is 1024.
        min_peak_distance (int): Minimum distance between peaks to consider them separate signals.
        threshold_offset (int): Offset above the noise floor to detect peaks.

    Returns:
        List of tuples containing the center frequency (MHz), power (dB), and refined bandwidth (MHz) of each detected signal.
    """

    # Capture and average the FFTs for the wideband scan
    fft_magnitude_sum = np.zeros(wide_fft_size)
    for _ in range(num_captures):
        iq_data = sdr.get_latest_samples()
        fft_result = np.fft.fftshift(np.fft.fft(iq_data, wide_fft_size))
        fft_magnitude = np.abs(fft_result)
        fft_magnitude_sum += fft_magnitude

    fft_magnitude_avg = fft_magnitude_sum / num_captures

    # Convert magnitude to dB
    fft_magnitude_db = 20 * np.log10(fft_magnitude_avg)

    # Detect peaks and bandwidths using the function from signal_utils
    signal_peaks, signal_bandwidths = detect_signal_peaks(
        fft_magnitude_db, sdr.frequency, wide_sample_rate, wide_fft_size, min_peak_distance, threshold_offset
    )

    refined_signals = []

    # Refine each detected peak
    for peak_freq, _ in zip(signal_peaks, signal_bandwidths):
        # Set the SDR to the narrowband settings
        sdr.set_frequency(peak_freq * 1e6)
        sdr.set_sample_rate(narrow_sample_rate)
        sdr.set_bandwidth(narrow_sample_rate)
        time.sleep(0.1)

        # Capture and average the FFTs for the refined settings
        fft_captures = []
        for _ in range(num_captures):
            iq_data = sdr.get_latest_samples()
            fft_result = np.fft.fftshift(np.fft.fft(iq_data, narrow_fft_size))
            fft_magnitude = np.abs(fft_result)
            fft_captures.append(fft_magnitude)

        refined_fft_magnitude_avg = np.mean(fft_captures, axis=0)

        # Convert magnitude to dB for refined FFT
        refined_fft_magnitude_db = 20 * np.log10(refined_fft_magnitude_avg)

        # Detect the refined bandwidth
        noise_floor = np.median(refined_fft_magnitude_db)
        adaptive_threshold = noise_floor + threshold_offset

        above_threshold = np.where(refined_fft_magnitude_db > adaptive_threshold)[0]
        if len(above_threshold) > 0:
            left_idx = above_threshold[0]
            right_idx = above_threshold[-1]
            refined_bandwidth_mhz = (right_idx - left_idx) * (narrow_sample_rate / narrow_fft_size) / 1e6
        else:
            refined_bandwidth_mhz = 0.0  # No signal detected in the narrowband scan

        max_power = np.max(refined_fft_magnitude_db)

        refined_signals.append((peak_freq, max_power, refined_bandwidth_mhz))

    return refined_signals
