import artistsData from '../data/artists.json';
import { transposeChord, getNoteIndex } from './theory';

interface Progression {
    id: string;
    name: string;
    bpm: number;
    key: string;
    chords: { root: string; quality: string; notes: string }[];
    suggested_section: string;
    vibe: string;
}

interface Suggestion {
    source: 'artist' | 'theory';
    label: string;
    chords: string[];
    key: string;
    vibe: string;
    artistName?: string;
    progressionId?: string;
}

// Theory-based common progressions (interval formulas from root)
const THEORY_PATTERNS: Record<string, { name: string; intervals: number[]; qualities: string[]; vibe: string }[]> = {
    CHORUS: [
        { name: 'I-IV-V-I', intervals: [0, 5, 7, 0], qualities: ['maj7', 'maj7', '7', 'maj7'], vibe: 'Classic resolution' },
        { name: 'IV-V-vi-I', intervals: [5, 7, 9, 0], qualities: ['maj7', '7', 'm7', 'maj7'], vibe: 'Uplifting pop' },
        { name: 'I-V-vi-IV', intervals: [0, 7, 9, 5], qualities: ['maj7', '7', 'm7', 'maj7'], vibe: 'Anthem' },
    ],
    BRIDGE: [
        { name: 'vi-IV-I-V', intervals: [9, 5, 0, 7], qualities: ['m7', 'maj7', 'maj7', '7'], vibe: 'Reflective lift' },
        { name: 'ii-V-I-IV', intervals: [2, 7, 0, 5], qualities: ['m7', '7', 'maj7', 'maj7'], vibe: 'Jazz resolution' },
        { name: 'bVI-bVII-I', intervals: [8, 10, 0], qualities: ['maj7', 'maj7', 'maj7'], vibe: 'Epic arrival' },
    ],
    VERSE: [
        { name: 'I-V-vi-IV', intervals: [0, 7, 9, 5], qualities: ['maj7', '7', 'm7', 'maj7'], vibe: 'Flowing' },
        { name: 'vi-IV-I-V', intervals: [9, 5, 0, 7], qualities: ['m7', 'maj7', 'maj7', '7'], vibe: 'Melancholy drift' },
        { name: 'i-VI-III-VII', intervals: [0, 8, 3, 10], qualities: ['m7', 'maj7', 'maj7', '7'], vibe: 'Dark float' },
    ],
};

const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function noteFromIndex(idx: number, useFlats: boolean): string {
    const i = ((idx % 12) + 12) % 12;
    return useFlats ? NOTES_FLAT[i] : NOTES_SHARP[i];
}

/**
 * Get suggestions for a section type based on the current artist and key.
 */
export function getSuggestions(
    artistId: string | null,
    sectionType: string,
    currentKey: string,
    _existingSections: string[]
): Suggestion[] {
    const suggestions: Suggestion[] = [];

    // 1. Same-artist suggestions
    if (artistId) {
        const artist = artistsData.artists.find(a => a.id === artistId);
        if (artist) {
            const matching = artist.progressions.filter(
                (p: Progression) => p.suggested_section.toUpperCase() === sectionType.toUpperCase()
            );
            for (const prog of matching) {
                const chords = prog.chords.map((c: { root: string; quality: string }) => c.root + (c.quality || ''));
                // Transpose to current key if different
                const progKeyRoot = getNoteIndex(prog.key.replace('m', ''));
                const currentKeyRoot = getNoteIndex(currentKey.replace('m', ''));
                const semitones = progKeyRoot !== -1 && currentKeyRoot !== -1
                    ? (currentKeyRoot - progKeyRoot + 12) % 12
                    : 0;
                const transposedChords = semitones !== 0
                    ? chords.map(c => transposeChord(c, semitones))
                    : chords;

                suggestions.push({
                    source: 'artist',
                    label: prog.name,
                    chords: transposedChords,
                    key: currentKey,
                    vibe: prog.vibe,
                    artistName: artist.name,
                    progressionId: prog.id,
                });
            }
        }
    }

    // 2. Theory-based suggestions
    const patterns = THEORY_PATTERNS[sectionType.toUpperCase()] || THEORY_PATTERNS.VERSE;
    const keyRoot = currentKey.replace('m', '');
    const keyIdx = getNoteIndex(keyRoot);
    const useFlats = keyRoot.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(keyRoot);

    if (keyIdx !== -1) {
        for (const pattern of patterns) {
            const chords = pattern.intervals.map((interval, i) => {
                const note = noteFromIndex(keyIdx + interval, useFlats);
                return note + pattern.qualities[i];
            });

            suggestions.push({
                source: 'theory',
                label: pattern.name,
                chords,
                key: currentKey,
                vibe: pattern.vibe,
            });
        }
    }

    return suggestions;
}
