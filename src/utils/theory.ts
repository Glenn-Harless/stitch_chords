/**
 * Music Theory Engine for Stitch Chords
 * Handles note spelling, transposition, and chord parsing.
 */

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const INTERVAL_MAP: Record<string, number> = {
    '1': 0,
    'b2': 1,
    '2': 2,
    'b3': 3,
    '3': 4,
    '4': 5,
    'b5': 6,
    '5': 7,
    '#5': 8,
    'b6': 8,
    '6': 9,
    'bb7': 9,
    'b7': 10,
    '7': 11,
    'b9': 13,
    '9': 14,
    '#9': 15,
    '11': 17,
    '#11': 18,
    'b13': 20,
    '13': 21,
};

const MAJOR_ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
const MINOR_ROMAN = ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];

export const CHORD_QUALITY_MAP: Record<string, string[]> = {
    // Triads
    '': ['1', '3', '5'],
    'm': ['1', 'b3', '5'],
    'dim': ['1', 'b3', 'b5'],
    'aug': ['1', '3', '#5'],
    // Suspended
    'sus2': ['1', '2', '5'],
    'sus4': ['1', '4', '5'],
    // Sixths
    '6': ['1', '3', '5', '6'],
    'm6': ['1', 'b3', '5', '6'],
    '6/9': ['1', '3', '5', '6', '9'],
    // Sevenths
    'maj7': ['1', '3', '5', '7'],
    'm7': ['1', 'b3', '5', 'b7'],
    '7': ['1', '3', '5', 'b7'],
    'dim7': ['1', 'b3', 'b5', 'bb7'],
    'm7b5': ['1', 'b3', 'b5', 'b7'],
    '7sus4': ['1', '4', '5', 'b7'],
    '7#9': ['1', '3', '5', 'b7', '#9'],
    // Ninths
    'maj9': ['1', '3', '5', '7', '9'],
    'm9': ['1', 'b3', '5', 'b7', '9'],
    '9': ['1', '3', '5', 'b7', '9'],
    '9sus4': ['1', '4', '5', 'b7', '9'],
    // Elevenths
    'm11': ['1', 'b3', '5', 'b7', '9', '11'],
    // Thirteenths
    'maj13': ['1', '3', '5', '7', '9', '13'],
    '13': ['1', '3', '5', 'b7', '9', '13'],
    // Add chords
    'add9': ['1', '3', '5', '9'],
    'madd9': ['1', 'b3', '5', '9'],
    'add11': ['1', '3', '5', '11'],
    'add9(no3)': ['1', '5', '9'],
    // Extended maj7 variants
    'maj7#11': ['1', '3', '5', '7', '#11'],
    'maj9(no3)': ['1', '5', '7', '9'],
    'madd11': ['1', 'b3', '5', '11'],
    'maj7add6': ['1', '3', '5', '6', '7'],
};

export const SUPPORTED_QUALITIES = Object.keys(CHORD_QUALITY_MAP);

/**
 * Normalizes a note to its index (0-11).
 */
export function getNoteIndex(note: string): number {
    const cleanNote = note.trim().charAt(0).toUpperCase() + note.trim().slice(1);
    let index = NOTES_SHARP.indexOf(cleanNote);
    if (index === -1) index = NOTES_FLAT.indexOf(cleanNote);
    return index;
}

/**
 * Transposes a specific note by a number of semitones.
 */
export function transposeNote(note: string, semitones: number, preferFlats = false): string {
    const index = getNoteIndex(note);
    if (index === -1) return note;

    const newIndex = (index + semitones + 24) % 12;
    const scale = preferFlats ? NOTES_FLAT : NOTES_SHARP;
    return scale[newIndex];
}

/**
 * Parses a chord string into its root and quality parts.
 * Strips slash bass notes (e.g., "Gmaj7/B" -> root: "G", quality: "maj7").
 * Example: "Am9" -> { root: "A", quality: "m9" }
 */
export function parseChord(chord: string): { root: string; quality: string } {
    // Strip slash bass note (e.g., "Gmaj7/B" -> "Gmaj7")
    // But don't strip "6/9" which is a chord quality
    const slashIdx = chord.indexOf('/');
    const afterSlash = slashIdx > 0 ? chord.slice(slashIdx + 1) : '';
    const isSlashBass = slashIdx > 0 && /^[A-G][#b]?$/.test(afterSlash);
    const base = isSlashBass ? chord.slice(0, slashIdx) : chord;
    const match = base.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return { root: chord, quality: '' };
    return { root: match[1], quality: match[2] };
}

/**
 * Transposes a full chord name.
 * Example: transposeChord("Am9", 2) -> "Bm9"
 */
export function transposeChord(chord: string, semitones: number): string {
    const { root, quality } = parseChord(chord);
    const transposedRoot = transposeNote(root, semitones);
    return transposedRoot + quality;
}

/**
 * Returns the individual notes of a chord.
 * Example: "Cmaj7" -> ["C", "E", "G", "B"]
 */
export function getChordNotes(chord: string): string[] {
    const { root, quality } = parseChord(chord);
    const rootIndex = getNoteIndex(root);
    if (rootIndex === -1) return [];

    const intervals = CHORD_QUALITY_MAP[quality] || CHORD_QUALITY_MAP[''];

    return intervals.map(interval => {
        const semitones = INTERVAL_MAP[interval];
        const noteIndex = (rootIndex + semitones) % 12;
        // Simple logic: if root is flat or specific keys, use flats. 
        // For now, default to sharps unless the root is explicitly flat.
        const useFlats = root.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root);
        return (useFlats ? NOTES_FLAT : NOTES_SHARP)[noteIndex];
    });
}

/**
 * Returns the Roman Numeral for a chord in a given key.
 * Example: getRomanNumeral("Am", "C MAJOR") -> "vi"
 */
export function getRomanNumeral(chord: string, keyName: string): string {
    const { root: chordRoot } = parseChord(chord);
    const parts = keyName.split(' ');
    // Normalize key root: uppercase first char, preserve accidental case (e.g., "Bb" not "BB")
    const keyRoot = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const keyQuality = (parts[1] || '').toUpperCase();
    
    const chordIdx = getNoteIndex(chordRoot);
    const keyIdx = getNoteIndex(keyRoot);
    
    if (chordIdx === -1 || keyIdx === -1) return '?';
    
    const interval = (chordIdx - keyIdx + 12) % 12;
    const isMinorKey = keyQuality === 'MINOR';
    
    // Simplistic mapping for common diatonic intervals
    const intervalToDegree: Record<number, number> = {
        0: 0, 2: 1, 4: 2, 5: 3, 7: 4, 9: 5, 11: 6 // Major scale steps
    };
    
    const minorIntervalToDegree: Record<number, number> = {
        0: 0, 2: 1, 3: 2, 5: 3, 7: 4, 8: 5, 10: 6 // Natural minor steps
    };
    
    const mapping = isMinorKey ? minorIntervalToDegree : intervalToDegree;
    const degree = mapping[interval];
    
    if (degree === undefined) return 'N.C.'; // Non-chromatic or pivot
    
    return isMinorKey ? MINOR_ROMAN[degree] : MAJOR_ROMAN[degree];
}

/**
 * Returns the 7 diatonic seventh chords for a key.
 * Key format: "C" (major), "Am" (minor), "F#" (major), "F#m" (minor)
 * Returns: [{ root, quality, roman, chord, notes }]
 */
export function getDiatonicChords(key: string): { root: string; quality: string; roman: string; chord: string; notes: string[] }[] {
    const isMinor = key.endsWith('m');
    const keyRoot = isMinor ? key.slice(0, -1) : key;
    const keyIdx = getNoteIndex(keyRoot);
    if (keyIdx === -1) return [];

    const useFlats = keyRoot.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(keyRoot);
    const scale = useFlats ? NOTES_FLAT : NOTES_SHARP;

    // Major scale intervals in semitones: W W H W W W H
    const majorSteps = [0, 2, 4, 5, 7, 9, 11];
    // Natural minor: W H W W H W W
    const minorSteps = [0, 2, 3, 5, 7, 8, 10];

    const steps = isMinor ? minorSteps : majorSteps;
    // Diatonic seventh chord qualities per degree
    const majorQualities = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5'];
    const minorQualities = ['m7', 'm7b5', 'maj7', 'm7', 'm7', 'maj7', '7'];
    const qualities = isMinor ? minorQualities : majorQualities;
    const romans = isMinor ? MINOR_ROMAN : MAJOR_ROMAN;

    return steps.map((step, i) => {
        const noteIdx = (keyIdx + step) % 12;
        const root = scale[noteIdx];
        const quality = qualities[i];
        const chord = root + quality;
        const notes = getChordNotes(chord);
        return { root, quality, roman: romans[i], chord, notes };
    });
}
