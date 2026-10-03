import math
import struct
import wave
import os
import random

sample_rate = 44100
bpm = 140
beat_sec = 60.0 / bpm            # ~0.42857s per beat
bar_sec = beat_sec * 4           # ~1.71428s per bar
total_bars = 16                  # 16 bars (~27.428s seamless loop)
num_samples = int(sample_rate * bar_sec * total_bars)

left_chan = [0.0] * num_samples
right_chan = [0.0] * num_samples

def note_freq(note):
    freqs = {
        'D1': 36.71, 'F1': 43.65, 'G1': 49.00, 'A1': 55.00, 'Bb1': 58.27, 'C2': 65.41,
        'D2': 73.42, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'Bb2': 116.54, 'C3': 130.81,
        'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08, 'C4': 261.63,
        'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'C5': 523.25,
        'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'A5': 880.00
    }
    return freqs.get(note, 293.66)

# Chord progression per 4 bars: Dm -> Bb -> F -> C/A (Valorant style)
bar_chords = [
    # Bars 0-3 (Intro build)
    {'bass': 'D2', 'stab': ['D3', 'F3', 'A3', 'D4', 'F4']},
    {'bass': 'Bb1', 'stab': ['Bb2', 'D3', 'F3', 'Bb3', 'D4']},
    {'bass': 'F1', 'stab': ['F2', 'A2', 'C3', 'F3', 'A3']},
    {'bass': 'C2', 'stab': ['C3', 'E3', 'G3', 'C4', 'E4']},
    # Bars 4-7 (Drop Phase 1 - Hard Hit)
    {'bass': 'D1', 'stab': ['D3', 'F3', 'A3', 'D4', 'F4']},
    {'bass': 'Bb1', 'stab': ['Bb2', 'D3', 'F3', 'Bb3', 'D4']},
    {'bass': 'F1', 'stab': ['F2', 'A2', 'C3', 'F3', 'A3']},
    {'bass': 'A1', 'stab': ['A2', 'C#3', 'E3', 'A3', 'C#4']},
    # Bars 8-11 (Drop Phase 2 - High Energy Lead)
    {'bass': 'D1', 'stab': ['D3', 'F3', 'A3', 'D4', 'F4']},
    {'bass': 'Bb1', 'stab': ['Bb2', 'D3', 'F3', 'Bb3', 'D4']},
    {'bass': 'F1', 'stab': ['F2', 'A2', 'C3', 'F3', 'A3']},
    {'bass': 'C2', 'stab': ['C3', 'E3', 'G3', 'C4', 'E4']},
    # Bars 12-15 (Climax / Outro Loop Transition)
    {'bass': 'D1', 'stab': ['D3', 'F3', 'A3', 'D4', 'F4']},
    {'bass': 'Bb1', 'stab': ['Bb2', 'D3', 'F3', 'Bb3', 'D4']},
    {'bass': 'G1', 'stab': ['G2', 'Bb2', 'D3', 'G3', 'Bb3']},
    {'bass': 'A1', 'stab': ['A2', 'C#3', 'E3', 'A3', 'C#4']},
]

# Lead Motif (Valorant Iconic Hero Staccato Arp) in 16th notes
lead_melody = [
    'D4', 'D4', 'F4', 'D4', 'A4', 'G4', 'F4', 'D4',
    'F4', 'F4', 'G4', 'A4', 'C5', 'A4', 'G4', 'E4',
    'D4', 'D4', 'F4', 'D4', 'A4', 'D5', 'C5', 'A4',
    'Bb4', 'A4', 'G4', 'F4', 'E4', 'F4', 'E4', 'C4'
]

# Generate samples
random.seed(42)

for i in range(num_samples):
    t = i / sample_rate
    bar_num = int(t / bar_sec) % total_bars
    t_in_bar = t % bar_sec
    beat_num = int(t_in_bar / beat_sec)
    t_in_beat = t_in_bar % beat_sec
    
    cur_chord = bar_chords[bar_num]
    
    # ----------------- 1. DRUMS (Punchy Kick & Snare & Hi-Hats) -----------------
    drum_l = 0.0
    drum_r = 0.0
    
    # Half-time Trap Beat: Kick on beat 0 and beat 2.5, Snare on beat 2
    # Kick instances
    kick_times = [0.0, 1.75 * beat_sec, 2.5 * beat_sec] if bar_num % 2 == 1 else [0.0, 2.25 * beat_sec]
    if bar_num >= 4:
        for kt in kick_times:
            dt = t_in_bar - kt
            if 0 <= dt < 0.35:
                # Pitch drop from 140Hz to 40Hz
                k_freq = 45.0 + 110.0 * math.exp(-dt * 38.0)
                k_env = math.exp(-dt * 16.0)
                k_sub = math.sin(2.0 * math.pi * k_freq * dt)
                # Click transient
                k_click = (math.sin(2.0 * math.pi * 900.0 * dt) if dt < 0.015 else 0.0) * math.exp(-dt * 150.0)
                kick_val = (k_sub * 0.85 + k_click * 0.4) * k_env
                drum_l += kick_val * 0.75
                drum_r += kick_val * 0.75

    # Snare on Beat 2 (half-time backbeat)
    if bar_num >= 4:
        dt_snare = t_in_bar - (2.0 * beat_sec)
        if 0 <= dt_snare < 0.3:
            s_env = math.exp(-dt_snare * 18.0)
            s_tone = math.sin(2.0 * math.pi * 210.0 * dt_snare) * math.exp(-dt_snare * 25.0) * 0.45
            s_noise = (random.random() * 2.0 - 1.0) * s_env * 0.55
            snare_val = s_tone + s_noise
            drum_l += snare_val * 0.65
            drum_r += snare_val * 0.65

    # Hi-Hats (16th notes with velocity accents and rolls)
    if bar_num >= 2:
        sixteenth = beat_sec / 4.0
        dt_hat = t_in_bar % sixteenth
        hat_step = int(t_in_bar / sixteenth)
        if dt_hat < 0.05:
            hat_env = math.exp(-dt_hat * 95.0)
            hat_noise = (random.random() * 2.0 - 1.0) * hat_env
            # Velocity groove
            vel = 0.3 if hat_step % 2 == 0 else 0.18
            if hat_step % 8 == 6: vel = 0.45  # Accent
            drum_l += hat_noise * vel * 0.8
            drum_r += hat_noise * vel * 1.2

    # ----------------- 2. VALORANT 808 REESE BASS -----------------
    bass_l = 0.0
    bass_r = 0.0
    if bar_num >= 2:
        b_freq = note_freq(cur_chord['bass'])
        # Sidechain ducking when kick hits
        ducking = 1.0
        for kt in kick_times:
            dt_k = t_in_bar - kt
            if 0 <= dt_k < 0.25:
                ducking = min(ducking, (dt_k / 0.25) ** 1.5)
        
        # Heavy detuned reese bass with overdrive
        b_saw1 = (2.0 * ((t * b_freq) % 1.0) - 1.0)
        b_saw2 = (2.0 * ((t * (b_freq * 1.008)) % 1.0) - 1.0)
        b_sub = math.sin(2.0 * math.pi * b_freq * t) * 1.4
        
        raw_bass = (b_saw1 * 0.4 + b_saw2 * 0.4 + b_sub) * ducking
        # Distortion / Saturation overdrive
        dist_bass = math.tanh(raw_bass * 1.8) * 0.45
        
        bass_l = dist_bass
        bass_r = dist_bass

    # ----------------- 3. CINEMATIC BRASS / SUPERSAW STABS -----------------
    stab_l = 0.0
    stab_r = 0.0
    # Stabs on rhythm: (0.0, 1.5, 3.0)
    stab_triggers = [0.0, 1.5 * beat_sec, 3.0 * beat_sec]
    for st in stab_triggers:
        dt_s = t_in_bar - st
        if 0 <= dt_s < (0.8 * beat_sec):
            s_env = math.exp(-dt_s * 6.5)
            s_val_l = 0.0
            s_val_r = 0.0
            for note in cur_chord['stab']:
                sf = note_freq(note)
                # 3 saw oscillators with stereo spread
                o1 = (2.0 * ((t * (sf * 0.996)) % 1.0) - 1.0)
                o2 = (2.0 * ((t * (sf * 1.004)) % 1.0) - 1.0)
                o3 = math.sin(2.0 * math.pi * sf * t)
                s_val_l += (o1 * 0.6 + o3 * 0.4)
                s_val_r += (o2 * 0.6 + o3 * 0.4)
            
            s_val_l = (s_val_l / len(cur_chord['stab'])) * s_env * 0.45
            s_val_r = (s_val_r / len(cur_chord['stab'])) * s_env * 0.45
            stab_l += s_val_l
            stab_r += s_val_r

    # ----------------- 4. GLITCH LEAD MOTIF (Valorant Style) -----------------
    lead_l = 0.0
    lead_r = 0.0
    if bar_num >= 4:
        sixteenth = beat_sec / 4.0
        lead_step = int(t / sixteenth) % len(lead_melody)
        dt_lead = t % sixteenth
        lead_env = math.exp(-dt_lead * 12.0)
        
        lf = note_freq(lead_melody[lead_step])
        l_pulse = math.sin(2.0 * math.pi * lf * t) + 0.5 * math.sin(4.0 * math.pi * lf * t)
        l_val = l_pulse * lead_env * 0.22
        
        # Panning ping-pong
        pan = math.sin(t * 4.0) * 0.4
        lead_l = l_val * (0.5 - pan)
        lead_r = l_val * (0.5 + pan)

    # ----------------- 5. MASTER MIX -----------------
    left_chan[i] = drum_l + bass_l + stab_l + lead_l
    right_chan[i] = drum_r + bass_r + stab_r + lead_r

# Add stereo space & reverb/delay
delay_samples = int(sample_rate * (beat_sec * 0.75))  # Dotted 8th delay
feedback = 0.28
out_left = [0.0] * num_samples
out_right = [0.0] * num_samples

for i in range(num_samples):
    prev_r = out_right[(i - delay_samples) % num_samples]
    prev_l = out_left[(i - delay_samples) % num_samples]
    
    out_left[i] = left_chan[i] + prev_r * feedback
    out_right[i] = right_chan[i] + prev_l * feedback

# Peak limiter & normalization
max_peak = max(max(abs(s) for s in out_left), max(abs(s) for s in out_right), 0.001)
norm = 0.88 / max_peak

output_dir = r"c:\imp\CODEMEET2026\frontend\public\audio"
os.makedirs(output_dir, exist_ok=True)
output_path = os.path.join(output_dir, "cyberpunk_theme.wav")

with wave.open(output_path, 'wb') as wav_file:
    wav_file.setnchannels(2)
    wav_file.setsampwidth(2)
    wav_file.setframerate(sample_rate)
    
    for i in range(num_samples):
        # Analog soft clipping
        l = math.tanh(out_left[i] * norm)
        r = math.tanh(out_right[i] * norm)
        
        sl = int(l * 32767)
        sr = int(r * 32767)
        wav_file.writeframes(struct.pack('<hh', sl, sr))

print(f"Generated High-Energy Valorant Cyber Theme successfully at: {output_path}")
