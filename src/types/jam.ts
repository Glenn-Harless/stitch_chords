export type JamEnergy = 'low' | 'build' | 'peak';
export type JamComplexity = 'beginner' | 'guided' | 'spicy';

export interface JamProfile {
  key: string;
  vibe: string;
  energy: JamEnergy;
  complexity: JamComplexity;
  bars: 4 | 8;
  referenceArtist: string;
  instrument: 'keys' | 'guitar';
}

export interface JamSource {
  kind: 'artist' | 'theory';
  artistName: string;
  progressionName: string;
  progressionId?: string;
  key: string;
  vibe: string;
}

export interface MelodyGuide {
  anchorNotes: string[];
  colorNotes: string[];
  avoidNotes: string[];
  motif: string;
}

export interface JamMoment {
  bar: number;
  chord: string;
  roman: string;
  notes: string[];
  alternates: string[];
  bass: string;
  voicing: string;
  melody: MelodyGuide;
  action: string;
}

export interface JamCoachStep {
  label: string;
  instruction: string;
  theory: string;
}

export interface JamSession {
  id: string;
  title: string;
  profile: JamProfile;
  source: JamSource;
  moments: JamMoment[];
  coachSteps: JamCoachStep[];
  nextMoves: string[];
}
