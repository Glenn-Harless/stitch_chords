import React, { useState } from 'react';
import { getDiatonicChords, parseChord, getChordNotes } from '../utils/theory';

interface InlineChordPickerProps {
    songKey: string;
    sectionName: string;
    onAdd: (chord: string) => void;
    onClose: () => void;
}

const InlineChordPicker: React.FC<InlineChordPickerProps> = ({ songKey, sectionName, onAdd, onClose }) => {
    const [freeformText, setFreeformText] = useState('');
    const diatonic = getDiatonicChords(songKey);

    const handleFreeformAdd = () => {
        const trimmed = freeformText.trim();
        if (!trimmed) return;
        const { root } = parseChord(trimmed);
        if (root) {
            onAdd(trimmed);
            setFreeformText('');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-chord-dark/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="w-full max-w-md bg-chord-card border border-chord-cyan/30 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up max-h-[70vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center py-3 sticky top-0 bg-chord-card z-10">
                    <div className="w-12 h-1 bg-chord-cyan/20 rounded-full" />
                </div>

                <div className="px-6 pb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[10px] font-bold text-chord-cyan/60 tracking-[0.2em] uppercase mb-1">Add Chord</p>
                            <p className="text-xs text-zinc-400 uppercase">to [ {sectionName} ]</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5">
                            <span className="material-symbols-outlined text-zinc-500">close</span>
                        </button>
                    </div>

                    {/* Diatonic Quick Picks */}
                    <div className="mb-4">
                        <p className="text-[10px] font-bold text-chord-cyan tracking-widest uppercase mb-2">
                            Diatonic in {songKey}
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                            {diatonic.map((d) => (
                                <button
                                    key={d.chord}
                                    onClick={() => onAdd(d.chord)}
                                    className="py-2 px-1 rounded border border-white/10 hover:border-chord-cyan hover:text-chord-cyan bg-white/5 transition-all text-center"
                                >
                                    <span className="block text-[10px] font-mono font-bold text-chord-cyan/70">{d.roman}</span>
                                    <span className="block text-xs font-black uppercase">{d.chord}</span>
                                    <span className="block text-[8px] text-white/40 mt-0.5">{d.notes.slice(0, 4).join(' ')}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Freeform Input */}
                    <div>
                        <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-2">Custom Chord</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={freeformText}
                                onChange={(e) => setFreeformText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFreeformAdd()}
                                placeholder="e.g. Cmaj7, Dm9, F#m7b5"
                                className="flex-1 bg-chord-dark border border-chord-cyan/20 rounded px-3 py-2 text-sm text-white font-mono uppercase placeholder:text-zinc-600 focus:border-chord-cyan focus:ring-0 focus:outline-none"
                            />
                            <button
                                onClick={handleFreeformAdd}
                                disabled={!freeformText.trim()}
                                className="px-4 py-2 rounded bg-chord-cyan text-chord-dark font-black text-[10px] uppercase tracking-widest disabled:opacity-30 hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                Add
                            </button>
                        </div>
                        {freeformText.trim() && (
                            <div className="mt-2 flex gap-1.5 items-center">
                                <span className="text-[9px] text-zinc-500 uppercase">Notes:</span>
                                {getChordNotes(freeformText.trim()).map((n, i) => (
                                    <span key={i} className="text-[10px] font-mono text-chord-cyan/80">{n}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InlineChordPicker;
