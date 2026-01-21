import React, { useState } from 'react';
import { transposeChord, getChordNotes, getRomanNumeral } from '../utils/theory';
import HotSwapMenu from './HotSwapMenu';

interface Section {
    name: string;
    bars: string[];
}

interface Song {
    id: string;
    title: string;
    artist: string;
    tempo: number;
    sections: Section[];
    key?: string;
}

interface ActivePlayingViewProps {
    song: Song;
    onBack: () => void;
    onSave?: (song: Song) => void;
    onEditChord?: (chord: string, sIdx: number, bIdx: number) => void;
    onUpdateSections?: (sections: Section[]) => void;
}

const KEYS = [
    'C MAJOR', 'G MAJOR', 'D MAJOR', 'A MAJOR', 'E MAJOR', 'B MAJOR', 'F# MAJOR', 'Db MAJOR', 'Ab MAJOR', 'Eb MAJOR', 'Bb MAJOR', 'F MAJOR',
    'A MINOR', 'E MINOR', 'B MINOR', 'F# MINOR', 'C# MINOR', 'G# MINOR', 'D# MINOR', 'Bb MINOR', 'F MINOR', 'C MINOR', 'G MINOR', 'D MINOR'
];

const ActivePlayingView: React.FC<ActivePlayingViewProps> = ({ song, onBack, onSave, onEditChord, onUpdateSections }) => {
    const [transpose, setTranspose] = useState(0);
    const [instrument, setInstrument] = useState<'guitar' | 'keys'>('guitar');
    const [selectedChord, setSelectedChord] = useState<{ sIdx: number; bIdx: number }>({ sIdx: 0, bIdx: 0 });
    const [wakeLockEnabled, setWakeLockEnabled] = useState(true);
    const [songKey, setSongKey] = useState(song.key || 'C MAJOR');
    const [hotSwapTarget, setHotSwapTarget] = useState<{ sIdx: number; bIdx: number } | null>(null);

    const currentChordName = song.sections[selectedChord.sIdx]?.bars[selectedChord.bIdx] || '';
    const transposedChordName = transposeChord(currentChordName, transpose);
    const chordNotes = getChordNotes(transposedChordName);

    const handleSave = () => {
        if (onSave) {
            onSave({ ...song, key: songKey });
        }
    };

    const swapChord = (newChord: string, sIdx: number, bIdx: number) => {
        if (onUpdateSections) {
            const newSections = JSON.parse(JSON.stringify(song.sections));
            newSections[sIdx].bars[bIdx] = newChord;
            onUpdateSections(newSections);
        }
        setHotSwapTarget(null);
    };

    const deleteChord = (sIdx: number, bIdx: number) => {
        if (onUpdateSections) {
            const newSections = JSON.parse(JSON.stringify(song.sections));
            newSections[sIdx].bars.splice(bIdx, 1);
            onUpdateSections(newSections);
        }
        setHotSwapTarget(null);
    };

    return (
        <div className="min-h-screen bg-chord-dark text-white font-display relative pb-32">
            <div className="scanline" />

            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-40 bg-chord-dark/95 backdrop-blur-md border-b border-chord-cyan/20">
                <div className="flex items-center p-4 justify-between max-w-2xl mx-auto">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onBack}
                            className="material-symbols-outlined text-chord-cyan text-xl hover:opacity-70 transition-opacity"
                        >
                            arrow_back_ios
                        </button>
                        <div>
                            <h2 className="text-[10px] uppercase tracking-widest text-chord-cyan/60 font-bold">Now Playing</h2>
                            <h1 className="text-lg font-bold leading-tight tracking-tight uppercase truncate max-w-[180px]">
                                {song.title}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] uppercase text-chord-cyan/60 tracking-tighter">Global Key</p>
                            <select
                                value={songKey}
                                onChange={(e) => setSongKey(e.target.value)}
                                className="bg-transparent border-none text-xs font-mono font-black text-chord-cyan p-0 focus:ring-0 appearance-none text-right cursor-pointer"
                            >
                                {KEYS.map(k => <option key={k} value={k} className="bg-chord-dark text-white">{k}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={handleSave}
                            className="flex items-center justify-center rounded border border-chord-cyan/30 px-3 py-1.5 hover:bg-chord-cyan/10 transition-colors"
                        >
                            <span className="text-[10px] font-black text-chord-cyan tracking-widest uppercase">SAVE</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto">
                {/* Global Transpose Slider */}
                <div className="p-4 mt-2">
                    <div className="rounded-lg border border-chord-cyan/20 bg-chord-cyan/5 p-4">
                        <div className="flex w-full items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-chord-cyan text-sm">swap_vert</span>
                                <p className="text-xs font-bold tracking-[0.2em] uppercase text-chord-cyan">Global Transpose</p>
                            </div>
                            <p className="text-chord-cyan font-mono font-bold text-lg">
                                {transpose > 0 ? `+${transpose}` : transpose} <span className="text-[10px] opacity-60">ST</span>
                            </p>
                        </div>
                        <div className="flex h-6 w-full items-center gap-4">
                            <span className="text-[10px] font-bold opacity-40">-6</span>
                            <div className="flex h-1.5 flex-1 rounded-full bg-chord-cyan/20 relative">
                                <input
                                    type="range"
                                    min="-6"
                                    max="6"
                                    step="1"
                                    value={transpose}
                                    onChange={(e) => setTranspose(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                    className="h-full rounded-full bg-chord-cyan transition-all duration-150"
                                    style={{ width: `${((transpose + 6) / 12) * 100}%` }}
                                />
                                <div
                                    className="absolute -top-2 size-5 rounded-full bg-chord-cyan border-4 border-chord-dark shadow-[0_0_10px_rgba(0,212,255,0.5)] transition-all duration-150 pointer-events-none"
                                    style={{ left: `calc(${((transpose + 6) / 12) * 100}% - 10px)` }}
                                />
                            </div>
                            <span className="text-[10px] font-bold opacity-40">+6</span>
                        </div>
                    </div>
                </div>

                {/* Sections */}
                {song.sections.map((section, sIdx) => (
                    <div key={sIdx} className="mt-6">
                        <div className="px-4 flex items-center gap-3">
                            <h2 className="text-chord-cyan text-[10px] font-bold tracking-[0.3em] bg-chord-cyan/10 px-2 py-1 rounded">
                                [ {section.name} ]
                            </h2>
                            <div className="h-[1px] flex-1 bg-chord-cyan/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-3 p-4">
                            {section.bars.map((chord, bIdx) => {
                                const isSelected = selectedChord.sIdx === sIdx && selectedChord.bIdx === bIdx;
                                const currentTransposed = transposeChord(chord, transpose);
                                const roman = getRomanNumeral(currentTransposed, songKey);
                                const notes = getChordNotes(currentTransposed);
                                return (
                                    <div
                                        key={bIdx}
                                        onClick={() => {
                                            setSelectedChord({ sIdx, bIdx });
                                            setHotSwapTarget({ sIdx, bIdx });
                                        }}
                                        className={`aspect-[16/10] flex flex-col justify-between p-3 rounded border bg-chord-card relative group cursor-pointer transition-all duration-200 ${isSelected ? 'border-2 border-chord-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)]' : 'border-chord-cyan/10 hover:border-chord-cyan/40 hover:bg-chord-cyan/5'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-mono text-chord-cyan/40">
                                                {(bIdx + 1).toString().padStart(2, '0')}
                                            </span>
                                            <span className="text-xs font-mono font-bold text-chord-cyan/60 uppercase">
                                                {roman}
                                            </span>
                                        </div>

                                        <h2 className={`font-black tracking-tighter text-center uppercase ${currentTransposed.length > 4 ? 'text-lg' : 'text-2xl'}`}>
                                            {currentTransposed}
                                        </h2>

                                        <div className="flex flex-wrap gap-1 mt-1 justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                            {notes.slice(0, 4).map((n, i) => (
                                                <span key={i} className="text-[8px] font-bold text-white leading-none">{n}</span>
                                            ))}
                                            {notes.length > 4 && <span className="text-[8px] font-bold text-white/50">+</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Reference Card (Note Spelling) */}
                <div className="px-4 mt-6">
                    <div className="rounded border border-chord-cyan/20 bg-chord-cyan/5 p-4 flex gap-4 items-center">
                        <div className="w-16 h-20 bg-chord-dark border border-chord-cyan/20 rounded flex flex-col items-center justify-center shrink-0">
                            <div className="w-10 h-12 grid grid-cols-4 gap-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                    <div key={n} className={`rounded-full h-1.5 w-1.5 ${chordNotes.length >= n ? 'bg-chord-cyan' : 'bg-chord-cyan/20'}`} />
                                ))}
                            </div>
                            <p className="text-[8px] uppercase tracking-tighter mt-2 text-chord-cyan/60">VOICING_REF</p>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="text-xs font-bold text-chord-cyan uppercase tracking-widest">Note Spelling</h4>
                                <span className="text-[10px] font-mono opacity-40">AUTO_GEN</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {chordNotes.map((note, idx) => (
                                    <span key={idx} className="bg-chord-cyan/10 text-chord-cyan text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border border-chord-cyan/20">
                                        {note}
                                    </span>
                                ))}
                                {chordNotes.length === 0 && <span className="text-zinc-500 italic text-[10px]">Select a valid chord</span>}
                            </div>
                            <p className="text-[10px] mt-2 opacity-40 italic">
                                Roman Numeral: <span className="text-chord-cyan/80 not-italic uppercase font-bold">{getRomanNumeral(transposedChordName, songKey)}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Hot Swap Menu Modal */}
            {hotSwapTarget && (
                <HotSwapMenu
                    chord={song.sections[hotSwapTarget.sIdx].bars[hotSwapTarget.bIdx]}
                    roman={getRomanNumeral(transposeChord(song.sections[hotSwapTarget.sIdx].bars[hotSwapTarget.bIdx], transpose), songKey)}
                    onClose={() => setHotSwapTarget(null)}
                    onSwap={(newChord) => swapChord(newChord, hotSwapTarget.sIdx, hotSwapTarget.bIdx)}
                    onDelete={() => deleteChord(hotSwapTarget.sIdx, hotSwapTarget.bIdx)}
                    onEdit={() => {
                        if (onEditChord) {
                            onEditChord(song.sections[hotSwapTarget.sIdx].bars[hotSwapTarget.bIdx], hotSwapTarget.sIdx, hotSwapTarget.bIdx);
                        }
                        setHotSwapTarget(null);
                    }}
                />
            )}

            {/* Bottom Controls Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-chord-dark/95 backdrop-blur-xl border-t border-chord-cyan/30 z-50">
                <div className="max-w-2xl mx-auto p-4 pb-8 flex items-center justify-between gap-4">
                    {/* Wake Lock Toggle */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setWakeLockEnabled(!wakeLockEnabled)}
                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${wakeLockEnabled ? 'bg-chord-cyan' : 'bg-zinc-800'}`}
                        >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${wakeLockEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-chord-cyan leading-none tracking-widest uppercase">Wake Lock</span>
                            <span className="text-[10px] font-medium">{wakeLockEnabled ? 'KEEP ON' : 'DISABLED'}</span>
                        </div>
                    </div>

                    <div className="h-8 w-[1px] bg-chord-cyan/20" />

                    {/* Instrument Switcher */}
                    <div className="flex-1 flex bg-chord-card rounded border border-chord-cyan/30 p-1">
                        <button
                            onClick={() => setInstrument('guitar')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded font-bold text-[10px] uppercase tracking-widest transition-all ${instrument === 'guitar' ? 'bg-chord-cyan text-chord-dark shadow-lg' : 'text-chord-cyan/60 hover:text-chord-cyan'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                            Guitar
                        </button>
                        <button
                            onClick={() => setInstrument('keys')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded font-bold text-[10px] uppercase tracking-widest transition-all ${instrument === 'keys' ? 'bg-chord-cyan text-chord-dark shadow-lg' : 'text-chord-cyan/60 hover:text-chord-cyan'
                                }`}
                        >
                            <span className="material-symbols-outlined text-sm">piano</span>
                            Keys
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ActivePlayingView;
