import React, { useState } from 'react';
import { getChordNotes } from '../utils/theory';

interface ChordScratchpadProps {
    onBack: () => void;
    onAddProgression: (progression: any) => void;
}

const ChordScratchpad: React.FC<ChordScratchpadProps> = ({ onBack, onAddProgression }) => {
    const [input, setInput] = useState('Dmaj9');

    const chordNotes = getChordNotes(input);

    const handleAdd = (section: string) => {
        onAddProgression({
            id: `custom-${Date.now()}`,
            name: input,
            bpm: 120,
            suggested_section: section,
            chords: [{ root: input, quality: '' }] // Simple wrapper for now
        });
    };

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto overflow-hidden border-x border-white/5 bg-chord-dark">
            <div className="scanline opacity-10" />

            {/* Header */}
            <header className="flex items-center justify-between px-4 pt-12 pb-4">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-chord-cyan text-sm">terminal</span>
                    <h1 className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">Custom Scratchpad</h1>
                </div>
                <button onClick={onBack} className="text-zinc-500 hover:text-chord-cyan transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </header>

            {/* Main Console Area */}
            <main className="flex-1 flex flex-col gap-4 px-4 overflow-y-auto pb-48 scrollbar-hide">
                {/* Monospace Input Console */}
                <section className="mt-2">
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

                {/* Quick Global Key Selector */}
                <section className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className="text-[10px] font-bold text-zinc-500 ml-2 tracking-widest uppercase">Global Key</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 bg-chord-cyan text-chord-dark text-xs font-bold rounded">D MAJOR</button>
                        <button className="px-3 py-1 hover:bg-white/5 text-zinc-500 text-xs font-bold rounded transition-colors">SET</button>
                    </div>
                </section>

                {/* Note Spelling Section */}
                <section>
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

                {/* Theoretical Data Grid */}
                <section className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg bg-chord-card border border-white/5 flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Roman Numeral</p>
                        <p className="text-2xl font-bold text-chord-cyan text-glow uppercase">I Δ 9</p>
                    </div>
                    <div className="p-4 rounded-lg bg-chord-card border border-white/5 flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Function</p>
                        <p className="text-2xl font-bold text-white uppercase">TONIC</p>
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
