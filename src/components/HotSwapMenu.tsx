import React from 'react';

interface HotSwapMenuProps {
    chord: string;
    onClose: () => void;
    onSwap: (newChord: string) => void;
    onDelete: () => void;
    onEdit: () => void;
    roman: string;
}

const HotSwapMenu: React.FC<HotSwapMenuProps> = ({ chord, onClose, onSwap, onDelete, onEdit, roman }) => {
    // Quick substitutes (diatonic or common shifts)
    const substitutes = [
        { label: 'maj7', val: 'maj7' },
        { label: 'm7', val: 'm7' },
        { label: '7', val: '7' },
        { label: 'maj9', val: 'maj9' },
        { label: 'm9', val: 'm9' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-chord-dark/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="w-full max-w-md bg-chord-card border border-chord-cyan/30 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div className="flex justify-center py-3">
                    <div className="w-12 h-1 bg-chord-cyan/20 rounded-full" />
                </div>

                <div className="px-6 pb-8">
                    {/* Active Chord Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-bold text-chord-cyan/60 tracking-[0.2em] uppercase mb-1">Editing Chord</p>
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-3xl font-bold text-white uppercase">{chord}</h3>
                                <span className="text-xl font-mono text-chord-cyan/40">{roman}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5">
                            <span className="material-symbols-outlined text-zinc-500">close</span>
                        </button>
                    </div>

                    {/* Quick Quality Swap */}
                    <div className="mb-8">
                        <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-3">Quick Quality Swap</p>
                        <div className="grid grid-cols-5 gap-2">
                            {substitutes.map((s) => (
                                <button
                                    key={s.val}
                                    onClick={() => {
                                        const root = chord.match(/^([A-G][#b]?)/)?.[1] || chord;
                                        onSwap(root + s.val);
                                    }}
                                    className="py-2 text-[10px] font-black rounded border border-white/10 hover:border-chord-cyan hover:text-chord-cyan bg-white/5 transition-all uppercase"
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onEdit}
                            className="flex items-center justify-center gap-3 py-4 rounded-lg bg-chord-cyan text-chord-dark font-black tracking-widest uppercase shadow-[0_4px_15px_rgba(46,234,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Open Scratchpad
                        </button>
                        <button
                            onClick={onDelete}
                            className="flex items-center justify-center gap-3 py-4 rounded-lg border border-red-500/30 text-red-500 font-black tracking-widest uppercase hover:bg-red-500/10 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotSwapMenu;
