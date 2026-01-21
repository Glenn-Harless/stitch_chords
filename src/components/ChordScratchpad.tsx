import React, { useState } from 'react';
import { getChordNotes, parseChord, SUPPORTED_QUALITIES } from '../utils/theory';

interface ChordScratchpadProps {
    onBack: () => void;
    onAddProgression: (progression: any, targetSection?: string) => void;
}

const ChordScratchpad: React.FC<ChordScratchpadProps> = ({ onBack, onAddProgression }) => {
    const [input, setInput] = useState('Dmaj9');

    // Sync selectors with terminal input
    const { root: currentRoot, quality: currentQuality } = parseChord(input);
    const rootLetter = currentRoot.charAt(0);
    const rootAccidental = currentRoot.slice(1);

    const chordNotes = getChordNotes(input);

    const handleAdd = (section: string) => {
        onAddProgression({
            id: `custom-${Date.now()}`,
            name: input,
            bpm: 120,
            chords: [{ root: currentRoot, quality: currentQuality }]
        }, section);
    };

    const updateChord = (newRoot: string, newAccidental: string, newQuality: string) => {
        setInput(`${newRoot}${newAccidental}${newQuality}`);
    };

    const roots = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto overflow-hidden border-x border-white/5 bg-chord-dark">
            <div className="scanline opacity-10" />

            {/* Header */}
            <header className="flex items-center justify-between px-4 pt-12 pb-4 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-chord-cyan text-sm">terminal</span>
                    <h1 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">Custom Scratchpad</h1>
                </div>
                <button onClick={onBack} className="text-zinc-500 hover:text-chord-cyan transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </header>

            {/* Main Console Area */}
            <main className="flex-1 flex flex-col gap-6 px-4 overflow-y-auto pb-48 scrollbar-hide">
                {/* Monospace Input Console */}
                <section className="mt-2 shrink-0">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-chord-cyan/20 rounded-lg blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
                        <div className="relative flex items-center bg-chord-card border border-chord-cyan/30 rounded-lg overflow-hidden h-16 px-4">
                            <span className="font-mono text-chord-cyan mr-3 text-lg">&gt;</span>
                            <input
                                className="bg-transparent border-none focus:ring-0 w-full font-mono text-2xl text-chord-cyan uppercase tracking-wider placeholder:text-zinc-700"
                                placeholder="TYPE CHORD..."
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <span className="material-symbols-outlined text-chord-cyan/40 animate-pulse">keyboard_arrow_left</span>
                        </div>
                    </div>
                </section>

                {/* Chord Builder Controls */}
                <section className="space-y-4 shrink-0">
                    <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Root & Accidental</h3>
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-7 gap-1">
                                {roots.map(r => (
                                    <button
                                        key={r}
                                        onClick={() => updateChord(r, rootAccidental, currentQuality)}
                                        className={`py-2 text-xs font-bold rounded border transition-all ${rootLetter === r ? 'bg-chord-cyan text-chord-dark border-chord-cyan' : 'bg-white/5 border-white/10 hover:border-chord-cyan/40 text-zinc-400'}`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-1">
                                {[
                                    { label: 'FLAT (b)', val: 'b' },
                                    { label: 'NATURAL', val: '' },
                                    { label: 'SHARP (#)', val: '#' }
                                ].map(acc => (
                                    <button
                                        key={acc.val}
                                        onClick={() => updateChord(rootLetter, acc.val, currentQuality)}
                                        className={`py-2 text-[10px] font-bold rounded border transition-all ${rootAccidental === acc.val ? 'bg-chord-cyan/20 text-chord-cyan border-chord-cyan/50' : 'bg-white/5 border-white/10 hover:border-chord-cyan/40 text-zinc-500'}`}
                                    >
                                        {acc.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Chord Quality</h3>
                        <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                            {SUPPORTED_QUALITIES.map(q => (
                                <button
                                    key={q}
                                    onClick={() => updateChord(rootLetter, rootAccidental, q)}
                                    className={`py-2 text-xs font-bold rounded border transition-all ${currentQuality === q ? 'bg-chord-cyan/20 text-chord-cyan border-chord-cyan/50' : 'bg-white/5 border-white/10 hover:border-chord-cyan/40 text-zinc-500'}`}
                                >
                                    {q === '' ? 'Major' : q}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Note Spelling Section */}
                <section className="shrink-0">
                    <h3 className="text-[10px] font-bold text-zinc-500 mb-2 tracking-widest uppercase flex items-center gap-2">
                        <span className="w-1 h-1 bg-chord-cyan rounded-full"></span> Note Spelling
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                        {chordNotes.map((note, idx) => (
                            <div key={idx} className={`flex-1 min-w-[50px] aspect-square flex flex-col items-center justify-center rounded-lg border bg-chord-card ${idx === 0 ? 'border-chord-cyan/40 bg-chord-cyan/5 shadow-[inset_0_0_10px_rgba(46,234,255,0.05)]' : 'border-white/10'}`}>
                                <span className={`${idx === 0 ? 'text-chord-cyan text-glow' : 'text-white'} text-xl font-bold`}>{note}</span>
                                <span className={`text-[8px] font-mono ${idx === 0 ? 'text-chord-cyan/60' : 'text-zinc-600'}`}>
                                    {idx === 0 ? 'ROOT' : `DEG_${idx + 1}`}
                                </span>
                            </div>
                        ))}
                        {chordNotes.length === 0 && (
                            <div className="w-full p-4 border border-dashed border-white/10 rounded-lg text-center">
                                <span className="text-zinc-600 font-mono text-[10px] uppercase">Waiting_for_valid_input...</span>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Fixed Bottom Action Dock */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-chord-dark via-chord-dark/95 to-transparent pt-10 z-20">
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => handleAdd('VERSE')}
                        className="flex-1 bg-chord-cyan py-4 rounded-lg flex flex-col items-center justify-center shadow-[0_0_20px_rgba(46,234,255,0.2)] active:scale-95 transition-transform"
                    >
                        <span className="text-[9px] font-black text-chord-dark tracking-tighter uppercase opacity-60 leading-none">SEQUENCE_01</span>
                        <span className="text-sm font-black text-chord-dark tracking-widest uppercase">[ ADD TO VERSE ]</span>
                    </button>
                    <button
                        onClick={() => handleAdd('CHORUS')}
                        className="flex-1 bg-chord-card border border-chord-cyan/50 py-4 rounded-lg flex flex-col items-center justify-center active:scale-95 transition-transform"
                    >
                        <span className="text-[9px] font-black text-chord-cyan/60 tracking-tighter uppercase leading-none">SEQUENCE_02</span>
                        <span className="text-sm font-black text-chord-cyan tracking-widest uppercase text-glow">[ ADD TO CHORUS ]</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChordScratchpad;
