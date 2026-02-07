import { describe, it, expect } from 'vitest'
import {
  getNoteIndex,
  transposeNote,
  parseChord,
  transposeChord,
  getChordNotes,
  getRomanNumeral,
  getDiatonicChords,
  CHORD_QUALITY_MAP,
} from './theory'

describe('getNoteIndex', () => {
  it('returns 0 for C', () => {
    expect(getNoteIndex('C')).toBe(0)
  })

  it('returns 9 for A', () => {
    expect(getNoteIndex('A')).toBe(9)
  })

  it('handles sharps', () => {
    expect(getNoteIndex('F#')).toBe(6)
    expect(getNoteIndex('C#')).toBe(1)
  })

  it('handles flats', () => {
    expect(getNoteIndex('Bb')).toBe(10)
    expect(getNoteIndex('Eb')).toBe(3)
  })

  it('returns -1 for invalid notes', () => {
    expect(getNoteIndex('X')).toBe(-1)
    expect(getNoteIndex('')).toBe(-1)
  })
})

describe('transposeNote', () => {
  it('transposes C up 2 to D', () => {
    expect(transposeNote('C', 2)).toBe('D')
  })

  it('wraps around octave', () => {
    expect(transposeNote('B', 1)).toBe('C')
    expect(transposeNote('A', 3)).toBe('C')
  })

  it('handles negative transposition', () => {
    expect(transposeNote('D', -2)).toBe('C')
  })

  it('uses sharps by default', () => {
    expect(transposeNote('C', 1)).toBe('C#')
  })

  it('uses flats when preferFlats is true', () => {
    expect(transposeNote('C', 1, true)).toBe('Db')
  })
})

describe('parseChord', () => {
  it('parses major chord', () => {
    expect(parseChord('C')).toEqual({ root: 'C', quality: '' })
  })

  it('parses minor chord', () => {
    expect(parseChord('Am')).toEqual({ root: 'A', quality: 'm' })
  })

  it('parses minor 9th', () => {
    expect(parseChord('Am9')).toEqual({ root: 'A', quality: 'm9' })
  })

  it('parses chord with sharp', () => {
    expect(parseChord('F#m7')).toEqual({ root: 'F#', quality: 'm7' })
  })

  it('parses chord with flat', () => {
    expect(parseChord('Bbmaj7')).toEqual({ root: 'Bb', quality: 'maj7' })
  })

  it('strips slash bass note', () => {
    expect(parseChord('Gmaj7/B')).toEqual({ root: 'G', quality: 'maj7' })
    expect(parseChord('Bbmaj7/D')).toEqual({ root: 'Bb', quality: 'maj7' })
  })
})

describe('transposeChord', () => {
  it('transposes Am up 2 to Bm', () => {
    expect(transposeChord('Am', 2)).toBe('Bm')
  })

  it('transposes Cmaj7 up 5 to Fmaj7', () => {
    expect(transposeChord('Cmaj7', 5)).toBe('Fmaj7')
  })

  it('preserves quality when transposing', () => {
    expect(transposeChord('Dm7b5', 2)).toBe('Em7b5')
  })
})

describe('getChordNotes', () => {
  it('returns triad for major chord', () => {
    expect(getChordNotes('C')).toEqual(['C', 'E', 'G'])
  })

  it('returns triad for minor chord', () => {
    expect(getChordNotes('Am')).toEqual(['A', 'C', 'E'])
  })

  it('returns 4 notes for maj7', () => {
    expect(getChordNotes('Cmaj7')).toEqual(['C', 'E', 'G', 'B'])
  })

  it('returns 5 notes for m9', () => {
    expect(getChordNotes('Am9')).toEqual(['A', 'C', 'E', 'G', 'B'])
  })

  it('returns empty array for invalid root', () => {
    expect(getChordNotes('Xm7')).toEqual([])
  })

  it('returns 6 notes for m11', () => {
    expect(getChordNotes('Cm11')).toEqual(['C', 'D#', 'G', 'A#', 'D', 'F'])
  })

  it('returns correct notes for sus2', () => {
    expect(getChordNotes('Csus2')).toEqual(['C', 'D', 'G'])
  })

  it('returns correct notes for sus4', () => {
    expect(getChordNotes('Csus4')).toEqual(['C', 'F', 'G'])
  })

  it('returns correct notes for 6/9', () => {
    expect(getChordNotes('C6/9')).toEqual(['C', 'E', 'G', 'A', 'D'])
  })

  it('returns correct notes for 7#9', () => {
    expect(getChordNotes('C7#9')).toEqual(['C', 'E', 'G', 'A#', 'D#'])
  })

  it('returns correct notes for 9sus4', () => {
    expect(getChordNotes('C9sus4')).toEqual(['C', 'F', 'G', 'A#', 'D'])
  })

  it('returns correct notes for add11', () => {
    expect(getChordNotes('Cadd11')).toEqual(['C', 'E', 'G', 'F'])
  })

  it('returns correct notes for add9(no3)', () => {
    expect(getChordNotes('Cadd9(no3)')).toEqual(['C', 'G', 'D'])
  })

  it('returns correct notes for maj7#11', () => {
    expect(getChordNotes('Cmaj7#11')).toEqual(['C', 'E', 'G', 'B', 'F#'])
  })

  it('returns correct notes for madd11', () => {
    expect(getChordNotes('Cmadd11')).toEqual(['C', 'D#', 'G', 'F'])
  })

  it('returns correct notes for maj7add6', () => {
    expect(getChordNotes('Cmaj7add6')).toEqual(['C', 'E', 'G', 'A', 'B'])
  })
})

describe('getRomanNumeral', () => {
  it('returns I for tonic in major key', () => {
    expect(getRomanNumeral('C', 'C MAJOR')).toBe('I')
  })

  it('returns vi for Am in C major', () => {
    expect(getRomanNumeral('Am', 'C MAJOR')).toBe('vi')
  })

  it('returns IV for F in C major', () => {
    expect(getRomanNumeral('F', 'C MAJOR')).toBe('IV')
  })

  it('returns V for G in C major', () => {
    expect(getRomanNumeral('G', 'C MAJOR')).toBe('V')
  })

  it('returns ? for invalid chord', () => {
    expect(getRomanNumeral('X', 'C MAJOR')).toBe('?')
  })

  it('handles Bb major key', () => {
    expect(getRomanNumeral('Bb', 'Bb MAJOR')).toBe('I')
    expect(getRomanNumeral('F', 'Bb MAJOR')).toBe('V')
    expect(getRomanNumeral('Eb', 'Bb MAJOR')).toBe('IV')
  })

  it('handles Eb major key', () => {
    expect(getRomanNumeral('Eb', 'Eb MAJOR')).toBe('I')
    expect(getRomanNumeral('Bb', 'Eb MAJOR')).toBe('V')
    expect(getRomanNumeral('Ab', 'Eb MAJOR')).toBe('IV')
  })

  it('handles Ab major key', () => {
    expect(getRomanNumeral('Ab', 'Ab MAJOR')).toBe('I')
    expect(getRomanNumeral('Eb', 'Ab MAJOR')).toBe('V')
  })

  it('handles Db major key', () => {
    expect(getRomanNumeral('Db', 'Db MAJOR')).toBe('I')
    expect(getRomanNumeral('Ab', 'Db MAJOR')).toBe('V')
  })

  it('handles Gb major key', () => {
    expect(getRomanNumeral('Gb', 'Gb MAJOR')).toBe('I')
    expect(getRomanNumeral('Db', 'Gb MAJOR')).toBe('V')
  })

  it('normalizes case variations in key name', () => {
    expect(getRomanNumeral('C', 'c major')).toBe('I')
    expect(getRomanNumeral('Bb', 'bb major')).toBe('I')
    expect(getRomanNumeral('F#', 'F# MAJOR')).toBe('I')
  })
})

describe('CHORD_QUALITY_MAP', () => {
  it('has 31 supported qualities', () => {
    expect(Object.keys(CHORD_QUALITY_MAP)).toHaveLength(31)
  })

  it('includes common qualities', () => {
    expect(CHORD_QUALITY_MAP['']).toBeDefined()
    expect(CHORD_QUALITY_MAP['m']).toBeDefined()
    expect(CHORD_QUALITY_MAP['7']).toBeDefined()
    expect(CHORD_QUALITY_MAP['maj7']).toBeDefined()
    expect(CHORD_QUALITY_MAP['m7']).toBeDefined()
  })
})

describe('getDiatonicChords', () => {
  it('returns 7 diatonic chords for C major', () => {
    const chords = getDiatonicChords('C')
    expect(chords).toHaveLength(7)
    expect(chords.map(c => c.chord)).toEqual([
      'Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5'
    ])
  })

  it('returns correct roman numerals for major key', () => {
    const chords = getDiatonicChords('C')
    expect(chords.map(c => c.roman)).toEqual([
      'I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'
    ])
  })

  it('returns 7 diatonic chords for A minor', () => {
    const chords = getDiatonicChords('Am')
    expect(chords).toHaveLength(7)
    expect(chords.map(c => c.chord)).toEqual([
      'Am7', 'Bm7b5', 'Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7'
    ])
  })

  it('handles flat keys', () => {
    const chords = getDiatonicChords('Bb')
    expect(chords[0].chord).toBe('Bbmaj7')
    expect(chords[3].chord).toBe('Ebmaj7')
  })

  it('returns empty array for invalid key', () => {
    expect(getDiatonicChords('X')).toEqual([])
  })

  it('includes note arrays for each chord', () => {
    const chords = getDiatonicChords('C')
    expect(chords[0].notes).toEqual(['C', 'E', 'G', 'B']) // Cmaj7
    expect(chords[1].notes).toEqual(['D', 'F', 'A', 'C']) // Dm7
  })
})
