import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import find_peaks

# Import your SDR module (assuming it's installed as sdr_plot_backend)
import sdr_plot_backend
# Constants
center_freq = 751e6  # Center frequency in Hz
bandwidth = 60e6     # Bandwidth in Hz
sample_rate = 60e6   # Sample rate in Hz
fft_size = 1024      # Size of the FFT

# Generate frequency axis
frequencies = np.linspace(center_freq - sample_rate/2, center_freq + sample_rate/2, fft_size)

# Simulate a Gaussian-shaped peak centered at 751MHz
peak_center_freq = 751e6
peak_bandwidth = 5e6  # Bandwidth of the peak (can be adjusted)

# Create a Gaussian peak
fft_magnitude = np.exp(-0.5 * ((frequencies - peak_center_freq) / (peak_bandwidth/2))**2) * 100

# Add noise
fft_magnitude += np.random.normal(0, 1, fft_size)

# Convert magnitude to dB
fft_magnitude_db = 20 * np.log10(np.abs(fft_magnitude))

plt.figure(figsize=(10, 6))
plt.plot(frequencies / 1e6, fft_magnitude_db, label="FFT Magnitude (dB)")
plt.title("Simulated FFT around 751 MHz")
plt.xlabel("Frequency (MHz)")
plt.ylabel("Magnitude (dB)")
plt.grid(True)
plt.show()

# Find the peak
peaks, _ = find_peaks(fft_magnitude_db, height=-3)

# Select the highest peak
peak_index = peaks[np.argmax(fft_magnitude_db[peaks])]
peak_frequency = frequencies[peak_index]
peak_height = fft_magnitude_db[peak_index]

# Find the -3dB points
half_max = peak_height - 3
indices_above_half_max = np.where(fft_magnitude_db > half_max)[0]

# Determine the peak width at the -3dB points
left_idx = indices_above_half_max[indices_above_half_max < peak_index][-1]
right_idx = indices_above_half_max[indices_above_half_max > peak_index][0]

left_freq = frequencies[left_idx]
right_freq = frequencies[right_idx]

peak_width_hz = right_freq - left_freq

# Convert to MHz for display
peak_width_mhz = peak_width_hz / 1e6

print(f"Peak Frequency: {peak_frequency / 1e6:.2f} MHz")
print(f"Peak Height: {peak_height:.2f} dB")
print(f"Peak Width at -3dB: {peak_width_mhz:.2f} MHz")

plt.figure(figsize=(10, 6))
plt.plot(frequencies / 1e6, fft_magnitude_db, label="FFT Magnitude (dB)")
plt.axvline(peak_frequency / 1e6, color='r', linestyle='--', label="Peak Frequency")
plt.axvline(left_freq / 1e6, color='g', linestyle='--', label="-3dB Left")
plt.axvline(right_freq / 1e6, color='g', linestyle='--', label="-3dB Right")
plt.title(f"Peak Width at -3dB: {peak_width_mhz:.2f} MHz")
plt.xlabel("Frequency (MHz)")
plt.ylabel("Magnitude (dB)")
plt.grid(True)
plt.legend()
plt.show()
