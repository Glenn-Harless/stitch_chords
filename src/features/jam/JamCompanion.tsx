import { useMemo, useState } from 'react';
import type { JamComplexity, JamEnergy, JamMoment, JamProfile, JamSession } from '../../types/jam';
import {
  COMPLEXITY_OPTIONS,
  DEFAULT_JAM_PROFILE,
  ENERGY_OPTIONS,
  JAM_KEYS,
  JAM_VIBES,
  REFERENCE_ARTISTS,
  describeComplexity,
  generateJam,
} from '../../utils/jamEngine';
import { getNoteIndex, parseChord } from '../../utils/theory';

type SaveState = 'idle' | 'saving' | 'saved' | 'local' | 'error';
type JamTab = 'chords' | 'melody' | 'bass' | 'coach';

const TABS: { value: JamTab; label: string }[] = [
  { value: 'chords', label: 'Chords' },
  { value: 'melody', label: 'Melody' },
  { value: 'bass', label: 'Bass' },
  { value: 'coach', label: 'Coach' },
];

function noteToFrequency(note: string): number {
  const index = getNoteIndex(note);
  if (index === -1) return 220;
  const midi = 48 + index;
  return 440 * 2 ** ((midi - 69) / 12);
}

function SectionLabel({ children }: { children: string }) {
  return <h2 className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300/70">{children}</h2>;
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[] | readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="h-12 rounded-lg border border-cyan-300/20 bg-[#0d1727] px-3 text-base font-black uppercase text-cyan-100 outline-none transition focus:border-cyan-300"
      >
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          return (
            <option key={optionValue} value={optionValue} className="bg-[#081020] text-white">
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function ChordPill({ note, active = false }: { note: string; active?: boolean }) {
  return (
    <span
      className={`min-w-8 rounded px-2 py-1 text-center font-mono text-xs font-black ${
        active ? 'bg-cyan-300 text-[#081020]' : 'border border-cyan-300/20 bg-cyan-300/10 text-cyan-100'
      }`}
    >
      {note}
    </span>
  );
}

async function persistSession(session: JamSession): Promise<SaveState> {
  try {
    const response = await fetch('/api/jams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    });

    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return 'saved';
  } catch {
    const saved = JSON.parse(localStorage.getItem('jam_companion_sessions') ?? '[]') as JamSession[];
    const next = [session, ...saved.filter((item) => item.id !== session.id)].slice(0, 20);
    localStorage.setItem('jam_companion_sessions', JSON.stringify(next));
    return 'local';
  }
}

async function playPreview(session: JamSession): Promise<void> {
  const context = new AudioContext();
  const now = context.currentTime + 0.05;
  const secondsPerBar = 1.1;

  session.moments.forEach((moment, index) => {
    const root = parseChord(moment.chord).root;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = noteToFrequency(root);
    gain.gain.setValueAtTime(0.0001, now + index * secondsPerBar);
    gain.gain.exponentialRampToValueAtTime(0.13, now + index * secondsPerBar + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (index + 1) * secondsPerBar - 0.05);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now + index * secondsPerBar);
    oscillator.stop(now + (index + 1) * secondsPerBar);
  });
}

function LoopCard({ moment }: { moment: JamMoment }) {
  return (
    <article className="min-h-[160px] rounded-lg border border-cyan-300/15 bg-[#111b2d] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Bar {moment.bar}</span>
        <span className="font-mono text-sm font-black text-cyan-300">{moment.roman}</span>
      </div>
      <h3 className="mt-3 text-[clamp(1.8rem,10vw,2.4rem)] font-black uppercase leading-none tracking-tight text-white">
        {moment.chord}
      </h3>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {moment.notes.map((note, index) => (
          <ChordPill key={note} note={note} active={index < 2} />
        ))}
      </div>
    </article>
  );
}

function ChordsPanel({ moments }: { moments: JamMoment[] }) {
  return (
    <section className="space-y-3">
      <SectionLabel>Voicings</SectionLabel>
      {moments.map((moment) => (
        <div key={`${moment.bar}-chords`} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs font-black text-cyan-200">Bar {moment.bar}</p>
              <h3 className="mt-1 text-2xl font-black uppercase text-white">{moment.chord}</h3>
            </div>
            <span className="font-mono text-lg font-black text-cyan-300">{moment.roman}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{moment.voicing}</p>
          {moment.alternates.length > 0 && (
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-slate-500">Swap: {moment.alternates.join(' / ')}</p>
          )}
        </div>
      ))}
    </section>
  );
}

function MelodyPanel({ moments }: { moments: JamMoment[] }) {
  return (
    <section className="space-y-3">
      <SectionLabel>Melody Runway</SectionLabel>
      {moments.map((moment) => (
        <div key={`${moment.bar}-melody`} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs font-black text-cyan-200">Bar {moment.bar}: {moment.chord}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">safe</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {moment.melody.anchorNotes.map((note) => (
              <ChordPill key={note} note={note} active />
            ))}
            {moment.melody.colorNotes.map((note) => (
              <ChordPill key={note} note={note} />
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{moment.melody.motif}</p>
          {moment.melody.avoidNotes.length > 0 && (
            <p className="mt-2 text-xs leading-5 text-slate-500">Avoid for now: {moment.melody.avoidNotes.join(', ')}</p>
          )}
        </div>
      ))}
    </section>
  );
}

function BassPanel({ moments }: { moments: JamMoment[] }) {
  return (
    <section className="space-y-3">
      <SectionLabel>Bass And Energy</SectionLabel>
      {moments.map((moment) => (
        <div key={`${moment.bar}-bass`} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <p className="font-mono text-xs font-black text-cyan-200">Bar {moment.bar}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-white">{moment.bass}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{moment.action}</p>
        </div>
      ))}
    </section>
  );
}

function CoachPanel({ session }: { session: JamSession }) {
  return (
    <section className="space-y-4">
      <div className="space-y-3">
        <SectionLabel>Coach</SectionLabel>
        {session.coachSteps.map((step) => (
          <div key={step.label} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">{step.label}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white">{step.instruction}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{step.theory}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <SectionLabel>Next Moves</SectionLabel>
        {session.nextMoves.map((move) => (
          <p key={move} className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-slate-300">
            {move}
          </p>
        ))}
      </div>
    </section>
  );
}

export default function JamCompanion() {
  const [profile, setProfile] = useState<JamProfile>(DEFAULT_JAM_PROFILE);
  const [seed, setSeed] = useState(0);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [activeTab, setActiveTab] = useState<JamTab>('chords');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const session = useMemo(() => generateJam(profile, seed), [profile, seed]);

  const updateProfile = <K extends keyof JamProfile>(key: K, value: JamProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaveState('idle');
  };

  const regenerate = () => {
    setSeed((current) => current + 1);
    setSaveState('idle');
  };

  const save = async () => {
    setSaveState('saving');
    setSaveState(await persistSession(session));
  };

  const saveLabel =
    saveState === 'saving' ? 'Saving' : saveState === 'saved' ? 'Saved API' : saveState === 'local' ? 'Saved Local' : 'Save';

  return (
    <main className="min-h-dvh bg-[#081020] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.16),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_20%)]" />

      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-3 pb-28 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:max-w-lg">
        <header className="sticky top-0 z-30 -mx-3 border-b border-cyan-300/10 bg-[#081020]/95 px-3 pb-3 pt-[calc(env(safe-area-inset-top)+0.25rem)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-cyan-300/50">Jam Copilot</p>
              <h1 className="mt-1 truncate text-2xl font-black uppercase leading-none tracking-tight text-white">Jam Companion</h1>
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="min-h-11 shrink-0 rounded-lg border border-cyan-300/25 px-3 text-xs font-black uppercase tracking-[0.16em] text-cyan-200"
            >
              Tune
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            {[profile.key, profile.vibe, profile.energy, profile.complexity, `${profile.bars} bars`].map((item) => (
              <span key={item} className="shrink-0 rounded-full border border-cyan-300/15 bg-cyan-300/5 px-3 py-1 text-[10px] font-black uppercase text-cyan-100">
                {item}
              </span>
            ))}
          </div>
        </header>

        <section className="py-4">
          <div className="rounded-xl border border-cyan-300/15 bg-[#0a1424]/90 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <SectionLabel>Current Loop</SectionLabel>
                <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">
                  <span className="font-bold text-cyan-200">{session.source.artistName}</span> / {session.source.progressionName}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-cyan-300 px-2.5 py-1 font-mono text-[10px] font-black uppercase text-[#081020]">
                {profile.key}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">{describeComplexity(profile.complexity)}</p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {session.moments.map((moment) => (
              <LoopCard key={`${moment.bar}-${moment.chord}`} moment={moment} />
            ))}
          </div>
        </section>

        <nav className="sticky top-[104px] z-20 -mx-3 border-y border-cyan-300/10 bg-[#081020]/95 px-3 py-2 backdrop-blur-xl">
          <div className="grid grid-cols-4 gap-1 rounded-lg border border-white/10 bg-white/[0.035] p-1">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`min-h-10 rounded-md text-[10px] font-black uppercase tracking-[0.1em] transition ${
                  activeTab === tab.value ? 'bg-cyan-300 text-[#081020]' : 'text-cyan-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="py-4">
          {activeTab === 'chords' && <ChordsPanel moments={session.moments} />}
          {activeTab === 'melody' && <MelodyPanel moments={session.moments} />}
          {activeTab === 'bass' && <BassPanel moments={session.moments} />}
          {activeTab === 'coach' && <CoachPanel session={session} />}
        </div>

        <section className="rounded-lg border border-cyan-300/15 bg-[#0a1424]/90 p-4">
          <SectionLabel>Persistence</SectionLabel>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            API saves to SQLite when running. Otherwise this phone-first POC falls back to localStorage.
          </p>
        </section>
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-cyan-300/20 bg-[#081020]/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2 sm:max-w-lg">
          <button
            onClick={() => void playPreview(session)}
            className="min-h-12 rounded-lg border border-cyan-300/40 bg-cyan-300 text-xs font-black uppercase tracking-[0.14em] text-[#081020]"
          >
            Preview
          </button>
          <button
            onClick={regenerate}
            className="min-h-12 rounded-lg border border-cyan-300/25 text-xs font-black uppercase tracking-[0.14em] text-cyan-100"
          >
            Vary
          </button>
          <button
            onClick={() => void save()}
            className="min-h-12 rounded-lg border border-white/15 text-xs font-black uppercase tracking-[0.14em] text-slate-100"
          >
            {saveLabel}
          </button>
        </div>
      </footer>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60" onClick={() => setSettingsOpen(false)}>
          <div
            className="max-h-[86dvh] w-full overflow-y-auto rounded-t-2xl border-t border-cyan-300/20 bg-[#081020] p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[0_-20px_60px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto max-w-md">
              <div className="flex items-center justify-between">
                <div>
                  <SectionLabel>Session Tuning</SectionLabel>
                  <p className="mt-1 text-xs text-slate-500">Shape the loop before you play.</p>
                </div>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="min-h-11 rounded-lg border border-white/10 px-3 text-xs font-black uppercase tracking-[0.16em] text-slate-300"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid gap-4">
                <SelectField label="Key" value={profile.key} options={JAM_KEYS} onChange={(value) => updateProfile('key', value)} />
                <SelectField label="Vibe" value={profile.vibe} options={JAM_VIBES} onChange={(value) => updateProfile('vibe', value)} />
                <SelectField
                  label="Energy"
                  value={profile.energy}
                  options={ENERGY_OPTIONS}
                  onChange={(value) => updateProfile('energy', value as JamEnergy)}
                />
                <SelectField
                  label="Complexity"
                  value={profile.complexity}
                  options={COMPLEXITY_OPTIONS}
                  onChange={(value) => updateProfile('complexity', value as JamComplexity)}
                />
                <SelectField
                  label="Bars"
                  value={String(profile.bars)}
                  options={['4', '8'] as const}
                  onChange={(value) => updateProfile('bars', value === '8' ? 8 : 4)}
                />
                <SelectField
                  label="Reference"
                  value={profile.referenceArtist}
                  options={REFERENCE_ARTISTS}
                  onChange={(value) => updateProfile('referenceArtist', value)}
                />
                <SelectField
                  label="Instrument"
                  value={profile.instrument}
                  options={['keys', 'guitar'] as const}
                  onChange={(value) => updateProfile('instrument', value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
