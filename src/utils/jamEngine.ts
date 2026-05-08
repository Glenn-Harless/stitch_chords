import artistsData from '../data/artists.json';
import type {
  JamCoachStep,
  JamComplexity,
  JamEnergy,
  JamMoment,
  JamProfile,
  JamSession,
  JamSource,
} from '../types/jam';
import {
  getChordNotes,
  getDiatonicChords,
  getNoteIndex,
  getRomanNumeral,
  parseChord,
  transposeChord,
} from './theory';

interface ArtistChord {
  root: string;
  quality: string;
}

interface ArtistProgression {
  id: string;
  name: string;
  bpm: number;
  key: string;
  chords: ArtistChord[];
  suggested_section: string;
  vibe: string;
  mood_tags?: string[];
}

interface ArtistSeed {
  id: string;
  name: string;
  genre: string;
  progressions: ArtistProgression[];
}

interface Candidate {
  artist: ArtistSeed;
  progression: ArtistProgression;
  score: number;
}

interface GroupedChord {
  primary: string;
  alternates: string[];
}

export const JAM_KEYS = ['Am', 'Dm', 'Em', 'Cm', 'Gm', 'Fm', 'C', 'D', 'F', 'G', 'Bb', 'Eb'] as const;

export const JAM_VIBES = [
  'melancholy',
  'atmospheric',
  'dark',
  'dreamy',
  'driving',
  'hypnotic',
  'warm',
  'tense',
] as const;

export const REFERENCE_ARTISTS = [
  { value: 'any', label: 'Any electronica' },
  { value: 'jon-hopkins', label: 'Jon Hopkins' },
  { value: 'apparat', label: 'Apparat' },
  { value: 'four-tet', label: 'Four Tet' },
  { value: 'bonobo', label: 'Bonobo' },
  { value: 'zhu', label: 'Zhu' },
] as const;

export const ENERGY_OPTIONS: { value: JamEnergy; label: string }[] = [
  { value: 'low', label: 'Low drift' },
  { value: 'build', label: 'Slow build' },
  { value: 'peak', label: 'Peak loop' },
];

export const COMPLEXITY_OPTIONS: { value: JamComplexity; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'guided', label: 'Guided' },
  { value: 'spicy', label: 'Spicy' },
];

export const DEFAULT_JAM_PROFILE: JamProfile = {
  key: 'Am',
  vibe: 'melancholy',
  energy: 'build',
  complexity: 'guided',
  bars: 4,
  referenceArtist: 'any',
  instrument: 'keys',
};

const FALLBACK_PATTERNS: Record<string, string[]> = {
  melancholy: ['Am9', 'Fmaj7', 'Cmaj9', 'Gadd9'],
  atmospheric: ['Am9', 'Dm9', 'Fmaj7#11', 'G6/9'],
  dark: ['Am9', 'Fmaj7', 'Dm9', 'E7#9'],
  dreamy: ['Amadd9', 'Fmaj7', 'Cmaj7', 'G6/9'],
  driving: ['Am7', 'G', 'Fmaj7', 'Gadd9'],
  hypnotic: ['Am9', 'Am11', 'Fmaj7', 'Gadd9'],
  warm: ['Cmaj9', 'Am9', 'Fmaj7', 'G6/9'],
  tense: ['Am9', 'Bbmaj7#11', 'G7sus4', 'E7#9'],
};

function compactKeyRoot(key: string): string {
  return key.endsWith('m') ? key.slice(0, -1) : key;
}

function keyToAnalysis(key: string): string {
  return key.endsWith('m') ? `${compactKeyRoot(key)} MINOR` : `${key} MAJOR`;
}

function semitonesBetween(fromKey: string, toKey: string): number {
  const from = getNoteIndex(compactKeyRoot(fromKey));
  const to = getNoteIndex(compactKeyRoot(toKey));
  if (from === -1 || to === -1) return 0;
  return (to - from + 12) % 12;
}

function scoreProgression(artist: ArtistSeed, progression: ArtistProgression, profile: JamProfile): number {
  const tags = progression.mood_tags ?? [];
  const artistMatch = profile.referenceArtist !== 'any' && artist.id === profile.referenceArtist ? 24 : 0;
  const vibeMatch = tags.includes(profile.vibe) ? 18 : 0;
  const vibeTextMatch = progression.vibe.toLowerCase().includes(profile.vibe) ? 8 : 0;
  const sectionScore = progression.suggested_section === 'LOOP' ? 8 : 0;
  const electronicScore = artist.genre.toLowerCase().includes('electronic') ? 5 : 0;
  return artistMatch + vibeMatch + vibeTextMatch + sectionScore + electronicScore;
}

function pickCandidate(profile: JamProfile, seed: number): Candidate | null {
  const candidates: Candidate[] = (artistsData.artists as ArtistSeed[]).flatMap((artist) =>
    artist.progressions.map((progression) => ({
      artist,
      progression,
      score: scoreProgression(artist, progression, profile),
    })),
  );

  const filtered = candidates
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.progression.id.localeCompare(b.progression.id));

  if (filtered.length === 0) return null;

  const topScore = filtered[0].score;
  const topBand = filtered.filter((candidate) => candidate.score >= topScore - 5);
  return topBand[Math.abs(seed) % topBand.length] ?? filtered[0];
}

function groupSourceChords(chords: string[]): GroupedChord[] {
  const groups: GroupedChord[] = [];

  for (const chord of chords) {
    const root = parseChord(chord).root;
    const previous = groups.at(-1);
    const previousRoot = previous ? parseChord(previous.primary).root : '';

    if (previous && previousRoot === root) {
      previous.alternates.push(chord);
      previous.primary = chord;
    } else {
      groups.push({ primary: chord, alternates: [] });
    }
  }

  return groups;
}

function resizeLoop(groups: GroupedChord[], bars: 4 | 8): GroupedChord[] {
  if (groups.length === 0) return [];
  return Array.from({ length: bars }, (_, index) => groups[index % groups.length]);
}

function enrichChord(chord: string, profile: JamProfile, bar: number, alternates: string[]): JamMoment {
  const notes = getChordNotes(chord);
  const roman = getRomanNumeral(chord, keyToAnalysis(profile.key));
  const root = parseChord(chord).root;
  const chordTone = notes[1] ?? notes[0] ?? root;
  const colorTone = notes.find((note) => note !== root && note !== chordTone) ?? notes[0] ?? root;
  const diatonic = getDiatonicChords(profile.key).flatMap((item) => item.notes);
  const avoidNotes = diatonic.filter((note) => !notes.includes(note)).slice(0, 2);

  const bass =
    profile.energy === 'low'
      ? `Hold ${compactKeyRoot(profile.key)} as a pedal under the chord.`
      : `Pulse ${root} on the downbeat, then leave space.`;

  const voicing =
    profile.instrument === 'keys'
      ? `Left hand: ${root}. Right hand: ${notes.slice(1, 4).join(' - ') || chord}.`
      : `Keep ${root} in the low register and let the top note ring.`;

  const motif =
    profile.complexity === 'beginner'
      ? `Repeat ${chordTone} twice, then land on ${root}.`
      : `Start on ${chordTone}, touch ${colorTone}, then answer with ${root}.`;

  const action =
    bar === 1
      ? 'Establish the loop. Do less than you think.'
      : profile.energy === 'peak'
        ? 'Add rhythm or octave movement here.'
        : 'Change one note only; keep the pattern familiar.';

  return {
    bar,
    chord,
    roman,
    notes,
    alternates,
    bass,
    voicing,
    melody: {
      anchorNotes: [root, chordTone].filter(Boolean),
      colorNotes: notes.slice(2, 5),
      avoidNotes,
      motif,
    },
    action,
  };
}

function fallbackSource(profile: JamProfile): { source: JamSource; groups: GroupedChord[] } {
  const base = FALLBACK_PATTERNS[profile.vibe] ?? FALLBACK_PATTERNS.melancholy;
  const fromKey = base[0]?.startsWith('C') ? 'C' : 'Am';
  const transposition = semitonesBetween(fromKey, profile.key);
  const groups = base.map((chord) => ({
    primary: transposeChord(chord, transposition),
    alternates: [],
  }));

  return {
    groups,
    source: {
      kind: 'theory',
      artistName: 'Internal engine',
      progressionName: `${profile.vibe} ${profile.bars}-bar loop`,
      key: profile.key,
      vibe: profile.vibe,
    },
  };
}

function sourceFromCandidate(candidate: Candidate, profile: JamProfile): { source: JamSource; groups: GroupedChord[] } {
  const transposition = semitonesBetween(candidate.progression.key, profile.key);
  const chords = candidate.progression.chords.map((item) => transposeChord(`${item.root}${item.quality ?? ''}`, transposition));
  const groups = groupSourceChords(chords);

  return {
    groups,
    source: {
      kind: 'artist',
      artistName: candidate.artist.name,
      progressionName: candidate.progression.name,
      progressionId: candidate.progression.id,
      key: profile.key,
      vibe: candidate.progression.vibe,
    },
  };
}

function buildCoachSteps(profile: JamProfile, moments: JamMoment[]): JamCoachStep[] {
  const root = compactKeyRoot(profile.key);
  const first = moments[0];
  const last = moments.at(-1);

  return [
    {
      label: 'Start',
      instruction: `Set a simple ${root} pulse first. Do not change chords until that feels locked.`,
      theory: 'Electronica often gets power from repetition before harmony gets fancy.',
    },
    {
      label: 'Chords',
      instruction: `Play the chord grid as whole notes. Use the voicing hint on each bar before adding rhythm.`,
      theory: 'The extensions add color; the roots tell your ear where home is.',
    },
    {
      label: 'Melody',
      instruction: first
        ? `For the first pass, only use ${first.melody.anchorNotes.join(' and ')}. Add color notes later.`
        : 'Use one or two chord tones until the loop feels stable.',
      theory: 'A small motif repeated with one changed note usually sounds more electronic than constant new notes.',
    },
    {
      label: 'Lift',
      instruction: last
        ? `On bar ${last.bar}, raise energy by opening the filter, adding octaves, or repeating ${last.melody.colorNotes[0] ?? last.chord}.`
        : 'Raise energy with rhythm or texture before adding more harmony.',
      theory: 'Arrangement moves can create tension without requiring harder theory.',
    },
  ];
}

function buildNextMoves(profile: JamProfile): string[] {
  const moves = [
    'Make a copy and mute the third in one chord for a more suspended color.',
    'Keep the bass pedal the same for two loops, then let it follow the roots.',
    'Turn the melody into a two-note call and response before adding more notes.',
  ];

  if (profile.energy !== 'peak') {
    moves.push('For the next section, keep the chords but double the rhythmic density.');
  } else {
    moves.push('For contrast, drop back to the first chord and remove the bass for four bars.');
  }

  return moves;
}

export function generateJam(profile: JamProfile = DEFAULT_JAM_PROFILE, seed = 0): JamSession {
  const candidate = pickCandidate(profile, seed);
  const sourceData = candidate ? sourceFromCandidate(candidate, profile) : fallbackSource(profile);
  const loop = resizeLoop(sourceData.groups, profile.bars);
  const moments = loop.map((group, index) =>
    enrichChord(group.primary, profile, index + 1, group.alternates.filter((chord) => chord !== group.primary)),
  );

  return {
    id: `jam-${profile.key}-${profile.vibe}-${profile.energy}-${profile.complexity}-${profile.bars}-${seed}`,
    title: `${profile.vibe} ${profile.key} jam`,
    profile,
    source: sourceData.source,
    moments,
    coachSteps: buildCoachSteps(profile, moments),
    nextMoves: buildNextMoves(profile),
  };
}

export function describeComplexity(complexity: JamComplexity): string {
  if (complexity === 'beginner') return 'Simple chords, very explicit note choices.';
  if (complexity === 'spicy') return 'More color tones, tension, and reharmonization options.';
  return 'Playable guidance with enough color for electronica.';
}
