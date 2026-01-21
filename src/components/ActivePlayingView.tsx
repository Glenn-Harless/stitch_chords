import React, { useState } from 'react';

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
}

interface ActivePlayingViewProps {
    song: Song;
    onBack: () => void;
}

const ActivePlayingView: React.FC<ActivePlayingViewProps> = ({ song, onBack }) => {
    const [transpose, setTranspose] = useState(0);
    const [instrument, setInstrument] = useState<'guitar' | 'keys'>('guitar');

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
                            <h1 className="text-lg font-bold leading-tight tracking-tight uppercase">{song.title} - {song.artist}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] uppercase text-chord-cyan/60">Tempo</p>
                            <p className="text-sm font-mono font-bold">{song.tempo} BPM</p>
                        </div>
                        <button className="flex items-center justify-center rounded border border-chord-cyan/30 p-2 hover:bg-chord-cyan/10">
                            <span className="material-symbols-outlined text-chord-cyan">more_vert</span>
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
                            <span className="text-[10px] font-bold opacity-40">-12</span>
                            <div className="flex h-1.5 flex-1 rounded-full bg-chord-cyan/20 relative">
                                <input
                                    type="range"
                                    min="-12"
                                    max="12"
                                    value={transpose}
                                    onChange={(e) => setTranspose(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div
                                    className="h-full rounded-full bg-chord-cyan transition-all duration-150"
                                    style={{ width: `${((transpose + 12) / 24) * 100}%` }}
                                />
                                <div
                                    className="absolute -top-2 size-5 rounded-full bg-chord-cyan border-4 border-chord-dark shadow-[0_0_10px_rgba(0,212,255,0.5)] transition-all duration-150 pointer-events-none"
                                    style={{ left: `calc(${((transpose + 12) / 24) * 100}% - 10px)` }}
                                />
                            </div>
                            <span className="text-[10px] font-bold opacity-40">+12</span>
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
                        <div className="grid grid-cols-4 gap-2 p-4">
                            {section.bars.map((chord, bIdx) => (
                                <div
                                    key={bIdx}
                                    className={`aspect-square flex flex-col items-center justify-center rounded border bg-chord-card relative group cursor-pointer transition-all duration-200 ${bIdx === 0 ? 'border-2 border-chord-cyan/60 shadow-[0_0_15px_rgba(0,212,255,0.2)]' : 'border-chord-cyan/20 hover:border-chord-cyan/40'
                                        }`}
                                >
                                    <span className="absolute top-1 left-1.5 text-[10px] font-mono text-chord-cyan/40">
                                        {(bIdx + 1).toString().padStart(2, '0')}
                                    </span>
                                    <h2 className="text-2xl font-bold tracking-tighter">{chord}</h2>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Reference Card */}
                <div className="px-4 mt-6">
                    <div className="rounded border border-chord-cyan/10 bg-chord-cyan/5 p-4 flex gap-4 items-center">
                        <div className="w-16 h-20 bg-chord-dark border border-chord-cyan/20 rounded flex flex-col items-center justify-center">
                            <div className="w-10 h-12 grid grid-cols-4 gap-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                    <div key={n} className={`rounded-full h-1.5 w-1.5 ${[1, 5].includes(n) ? 'bg-chord-cyan' : 'bg-chord-cyan/20'}`} />
                                ))}
                            </div>
                            <p className="text-[8px] uppercase tracking-tighter mt-2 text-chord-cyan/60">Am Shape</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-chord-cyan mb-1 uppercase tracking-widest">Active voicing</h4>
                            <p className="text-[11px] leading-relaxed opacity-60">
                                Standard E-Tuning. Bar chord on 5th fret recommended for optimal resonance.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Controls Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-chord-dark/95 backdrop-blur-xl border-t border-chord-cyan/30 z-50">
                <div className="max-w-2xl mx-auto p-4 pb-8 flex items-center justify-between gap-4">
                    {/* Wake Lock Toggle */}
                    <div className="flex items-center gap-3">
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-chord-cyan">
                            <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-chord-cyan leading-none tracking-widest uppercase">Wake Lock</span>
                            <span className="text-xs font-medium">KEEP ON</span>
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
