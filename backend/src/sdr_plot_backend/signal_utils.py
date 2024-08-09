# src/sdr_plot_backend/signal_utils.py

import numpy as np

def detect_signal_peaks(fft_magnitude_db, center_freq, sample_rate, fft_size, min_peak_distance=10, threshold_offset=1):
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
