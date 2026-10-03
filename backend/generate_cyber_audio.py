import math
import struct
import wave
import os

sample_rate = 44100
duration = 24.0  # 24 seconds seamless loop
num_samples = int(sample_rate * duration)

left_channel = [0.0] * num_samples
right_channel = [0.0] * num_samples

def note_to_freq(note_name):
    notes = {
        'C2': 65.41, 'G2': 98.00, 'Ab2': 103.83, 'Bb2': 116.54, 'Eb2': 77.78, 'F2': 87.31,
        'C3': 130.81, 'Eb3': 155.56, 'F3': 174.61, 'G3': 196.00, 'Ab3': 207.65, 'Bb3': 233.08,
        'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'F4': 349.23, 'G4': 392.00, 'Ab4': 415.30, 'Bb4': 466.16,
        'C5': 523.25, 'Eb5': 622.25, 'G5': 783.99, 'Bb5': 932.33
    }
    return notes.get(note_name, 261.63)

# 4 Chords: Cm -> Ab -> Eb -> Bb (6 seconds each)
chords = [
    {'bass': 'C2', 'notes': ['C3', 'Eb3', 'G3', 'C4', 'Eb4', 'G4']},
    {'bass': 'Ab2', 'notes': ['Ab3', 'C4', 'Eb4', 'Ab4', 'C5', 'Eb5']},
    {'bass': 'Eb2', 'notes': ['Eb3', 'G3', 'Bb3', 'Eb4', 'G4', 'Bb4']},
    {'bass': 'Bb2', 'notes': ['Bb2', 'D4', 'F4', 'Bb3', 'D4', 'F4']},
]

chord_duration = 6.0

for i in range(num_samples):
    t = i / sample_rate
    chord_idx = int(t / chord_duration) % 4
    chord_t = t % chord_duration
    cur_chord = chords[chord_idx]
    
    # Smooth chord crossfade envelope
    fade_len = 0.8
    env = 1.0
    if chord_t < fade_len:
        env = 0.5 - 0.5 * math.cos(math.pi * chord_t / fade_len)
    elif chord_t > (chord_duration - fade_len):
        env = 0.5 + 0.5 * math.cos(math.pi * (chord_t - (chord_duration - fade_len)) / fade_len)
    
    # 1. Warm Analog Bass (Saw + Sine sub)
    bass_freq = note_to_freq(cur_chord['bass'])
    bass_saw1 = (2.0 * ((t * bass_freq) % 1.0) - 1.0) * 0.18
    bass_saw2 = (2.0 * ((t * (bass_freq * 1.003)) % 1.0) - 1.0) * 0.18
    bass_sub = math.sin(2.0 * math.pi * bass_freq * 0.5 * t) * 0.35
    bass_val = (bass_saw1 + bass_saw2 + bass_sub) * env * 0.4
    
    # 2. Rich Lush Ambient Pads (Detuned multi-oscillator with chorus)
    pad_left = 0.0
    pad_right = 0.0
    for n_idx, note in enumerate(cur_chord['notes']):
        f = note_to_freq(note)
        # 3 detuned oscillators per note for silky cyberpunk pad
        lfo = math.sin(2.0 * math.pi * 0.25 * t + n_idx) * 0.8
        o1 = math.sin(2.0 * math.pi * (f - 0.35 + lfo) * t)
        o2 = math.sin(2.0 * math.pi * (f + 0.45 - lfo) * t)
        o3 = math.sin(2.0 * math.pi * (f * 2.0) * t) * 0.25  # subtle octave shimmer
        
        pan = (n_idx / len(cur_chord['notes'])) * 0.6 - 0.3
        pad_left += (o1 * 0.6 + o3 * 0.4) * (0.5 - pan)
        pad_right += (o2 * 0.6 + o3 * 0.4) * (0.5 + pan)
    
    pad_left *= env * 0.045
    pad_right *= env * 0.045
    
    # 3. Ambient Cyber Arpeggiator (16th notes with echo)
    tempo_bpm = 120
    sixteenth_duration = 60.0 / (tempo_bpm * 4)  # 0.125s
    arp_step = int(t / sixteenth_duration)
    arp_t = (t % sixteenth_duration) / sixteenth_duration
    arp_env = math.exp(-arp_t * 6.0)
    
    arp_scale = cur_chord['notes']
    arp_note = arp_scale[arp_step % len(arp_scale)]
    arp_freq = note_to_freq(arp_note)
    
    # Pluck sine with soft harmonics
    arp_val = (math.sin(2.0 * math.pi * arp_freq * t) + 0.3 * math.sin(4.0 * math.pi * arp_freq * t)) * arp_env * 0.06
    arp_pan = math.sin(t * 1.5) * 0.4
    
    # 4. Combine
    left_channel[i] = bass_val * 0.5 + pad_left + arp_val * (0.5 - arp_pan)
    right_channel[i] = bass_val * 0.5 + pad_right + arp_val * (0.5 + arp_pan)

# Add stereo delay effect for vast cyber space feel
delay_samples = int(sample_rate * 0.375)  # 375ms delay (dotted eighth)
feedback = 0.35
delayed_left = [0.0] * num_samples
delayed_right = [0.0] * num_samples

for i in range(num_samples):
    prev_r = delayed_right[(i - delay_samples) % num_samples]
    prev_l = delayed_left[(i - delay_samples) % num_samples]
    
    delayed_left[i] = left_channel[i] + prev_r * feedback
    delayed_right[i] = right_channel[i] + prev_l * feedback

# Normalize & write WAV
max_amp = max(max(abs(s) for s in delayed_left), max(abs(s) for s in delayed_right), 0.001)
norm_factor = 0.85 / max_amp

output_dir = r"c:\imp\CODEMEET2026\frontend\public\audio"
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "cyberpunk_theme.wav")

with wave.open(output_path, 'wb') as wav_file:
    wav_file.setnchannels(2)  # Stereo
    wav_file.setsampwidth(2)  # 16-bit
    wav_file.setframerate(sample_rate)
    
    for i in range(num_samples):
        # Soft limiter / tape saturation tanh
        l = math.tanh(delayed_left[i] * norm_factor)
        r = math.tanh(delayed_right[i] * norm_factor)
        
        sample_l = int(l * 32767)
        sample_r = int(r * 32767)
        wav_file.writeframes(struct.pack('<hh', sample_l, sample_r))

print(f"Generated studio-quality ambient cyberpunk theme at: {output_path}")
