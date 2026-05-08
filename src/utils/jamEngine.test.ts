import { describe, expect, it } from 'vitest';
import { DEFAULT_JAM_PROFILE, generateJam } from './jamEngine';

describe('generateJam', () => {
  it('creates a four bar guided jam by default', () => {
    const session = generateJam(DEFAULT_JAM_PROFILE, 0);

    expect(session.moments).toHaveLength(4);
    expect(session.profile.key).toBe('Am');
    expect(session.coachSteps.length).toBeGreaterThan(0);
    expect(session.moments[0].notes.length).toBeGreaterThan(0);
  });

  it('creates eight bar loops when requested', () => {
    const session = generateJam({ ...DEFAULT_JAM_PROFILE, bars: 8 }, 1);

    expect(session.moments).toHaveLength(8);
    expect(session.moments[7].bar).toBe(8);
  });

  it('transposes source material into the requested key', () => {
    const session = generateJam({ ...DEFAULT_JAM_PROFILE, key: 'Dm' }, 0);

    expect(session.profile.key).toBe('Dm');
    expect(session.moments.every((moment) => moment.chord.length > 0)).toBe(true);
  });

  it('includes beginner-friendly melody guidance', () => {
    const session = generateJam({ ...DEFAULT_JAM_PROFILE, complexity: 'beginner' }, 2);

    expect(session.moments[0].melody.motif).toContain('Repeat');
    expect(session.moments[0].melody.anchorNotes.length).toBeGreaterThan(0);
  });
});
