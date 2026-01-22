// Simple Web Audio synth for chord preview

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new AudioContext();
    }
    return audioContext;
};

// Note frequencies (A4 = 440Hz)
const NOTE_FREQUENCIES: Record<string, number> = {
    'C': 261.63,
    'C#': 277.18,
    'Db': 277.18,
    'D': 293.66,
    'D#': 311.13,
    'Eb': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99,
    'Gb': 369.99,
    'G': 392.00,
    'G#': 415.30,
    'Ab': 415.30,
    'A': 440.00,
    'A#': 466.16,
    'Bb': 466.16,
    'B': 493.88,
};

// Get frequency for a note, optionally in a different octave
const getNoteFrequency = (note: string, octaveShift: number = 0): number => {
    const freq = NOTE_FREQUENCIES[note];
    if (!freq) return 440; // fallback
    return freq * Math.pow(2, octaveShift);
};

// Active oscillators for stopping
let activeOscillators: OscillatorNode[] = [];
let activeGains: GainNode[] = [];

// Play a single note
const playNote = (
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    volume: number = 0.15
): { osc: OscillatorNode; gain: GainNode } => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle'; // Soft, piano-like
    osc.frequency.value = frequency;

    // ADSR-ish envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02); // Attack
    gain.gain.linearRampToValueAtTime(volume * 0.7, startTime + 0.1); // Decay
    gain.gain.setValueAtTime(volume * 0.7, startTime + duration - 0.1); // Sustain
    gain.gain.linearRampToValueAtTime(0, startTime + duration); // Release

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    return { osc, gain };
};

// Play chord notes simultaneously
export const playChord = (notes: string[], duration: number = 1.5): void => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const now = ctx.currentTime;

    // Stop any currently playing
    stopPlayback();

    // Play root in lower octave, rest in middle
    notes.forEach((note, idx) => {
        const octaveShift = idx === 0 ? -1 : 0;
        const freq = getNoteFrequency(note, octaveShift);
        const { osc, gain } = playNote(ctx, freq, now, duration, 0.12);
        activeOscillators.push(osc);
        activeGains.push(gain);
    });
};

// Play a progression (array of chord note arrays)
export const playProgression = (
    chordNotesList: string[][],
    bpm: number = 120
): void => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    stopPlayback();

    const beatDuration = 60 / bpm;
    const chordDuration = beatDuration * 2; // 2 beats per chord
    const now = ctx.currentTime;

    chordNotesList.forEach((notes, chordIdx) => {
        const startTime = now + chordIdx * chordDuration;

        notes.forEach((note, noteIdx) => {
            const octaveShift = noteIdx === 0 ? -1 : 0;
            const freq = getNoteFrequency(note, octaveShift);
            const { osc, gain } = playNote(ctx, freq, startTime, chordDuration * 0.9, 0.1);
            activeOscillators.push(osc);
            activeGains.push(gain);
        });
    });
};

// Stop all currently playing sounds
export const stopPlayback = (): void => {
    const ctx = audioContext;
    if (!ctx) return;

    const now = ctx.currentTime;

    activeGains.forEach(gain => {
        try {
            gain.gain.cancelScheduledValues(now);
            gain.gain.linearRampToValueAtTime(0, now + 0.05);
        } catch (e) {
            // Ignore if already stopped
        }
    });

    activeOscillators.forEach(osc => {
        try {
            osc.stop(now + 0.06);
        } catch (e) {
            // Ignore if already stopped
        }
    });

    activeOscillators = [];
    activeGains = [];
};

// Resume audio context (needed for iOS/Chrome gesture requirement)
export const resumeAudio = (): void => {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
};
