import React, { useState } from 'react';
import { getDiatonicChords, getChordNotes, parseChord, getRomanNumeral } from '../utils/theory';
import { playChord, stopPlayback } from '../utils/audio';

interface HotSwapMenuProps {
    chord: string;
    onClose: () => void;
    onSwap: (newChord: string) => void;
    onDelete: () => void;
    onEdit: () => void;
    roman: string;
    songKey: string;
}

const QUALITY_GROUPS = [
    { label: 'Triads', items: ['', 'm', 'dim', 'aug'] },
    { label: '7ths', items: ['maj7', 'm7', '7', 'dim7', 'm7b5', '7sus4'] },
    { label: '9ths', items: ['maj9', 'm9', '9', '9sus4'] },
    { label: 'Sus', items: ['sus2', 'sus4'] },
    { label: 'Add', items: ['add9', 'madd9', 'add11', '6', 'm6', '6/9'] },
    { label: 'Ext', items: ['m11', '13', 'maj13', '7#9', 'maj7#11'] },
];

const HotSwapMenu: React.FC<HotSwapMenuProps> = ({ chord, onClose, onSwap, onDelete, onEdit, roman, songKey }) => {
    const { root } = parseChord(chord);
    const diatonic = getDiatonicChords(songKey);
    const [preview, setPreview] = useState<string | null>(null);

    const activeChord = preview || chord;
    const activeNotes = getChordNotes(activeChord);
    const isMinor = songKey.endsWith('m');
    const keyAnalysis = isMinor ? songKey.slice(0, -1) + ' MINOR' : songKey + ' MAJOR';
    const activeRoman = preview ? getRomanNumeral(activeChord, keyAnalysis) : roman;

    const handlePreview = (chordName: string) => {
        setPreview(chordName);
        playChord(getChordNotes(chordName), 1.5);
    };

    const handleConfirm = () => {
        stopPlayback();
        if (preview && preview !== chord) {
            onSwap(preview);
        }
        onClose();
    };

    const handleClose = () => {
        stopPlayback();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-chord-dark/60 backdrop-blur-sm p-4" onClick={handleClose}>
            <div
                className="w-full max-w-md bg-chord-card border border-chord-cyan/30 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle bar */}
                <div className="flex justify-center py-3 sticky top-0 bg-chord-card z-10">
                    <div className="w-12 h-1 bg-chord-cyan/20 rounded-full" />
                </div>

                <div className="px-6 pb-8">
                    {/* Active Chord Header — shows preview or original */}
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-[10px] font-bold text-chord-cyan/60 tracking-[0.2em] uppercase mb-1">
                                {preview ? 'Previewing' : 'Editing Chord'}
                            </p>
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-3xl font-bold text-white uppercase">{activeChord}</h3>
                                <span className="text-xl font-mono text-chord-cyan/40">{activeRoman}</span>
                                <button
                                    onClick={() => playChord(activeNotes, 1.5)}
                                    className="p-1.5 rounded-full hover:bg-chord-cyan/10 transition-colors"
                                    title="Play chord"
                                >
                                    <span className="material-symbols-outlined text-chord-cyan text-lg">volume_up</span>
                                </button>
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-2 rounded-full hover:bg-white/5">
                            <span className="material-symbols-outlined text-zinc-500">close</span>
                        </button>
                    </div>

                    {/* Notes Display — always visible, prominent */}
                    <div className={`rounded-lg p-3 mb-4 border transition-all ${
                        preview
                            ? 'border-chord-cyan/40 bg-chord-cyan/10'
                            : 'border-white/10 bg-white/5'
                    }`}>
                        <p className="text-[9px] font-bold text-chord-cyan/50 tracking-widest uppercase mb-1">Notes</p>
                        <p className="text-lg font-bold text-white tracking-wider">
                            {activeNotes.join('  ')}
                        </p>
                        {preview && preview !== chord && (
                            <p className="text-[9px] text-zinc-500 mt-1">
                                was: {chord} ({getChordNotes(chord).join(' ')})
                            </p>
                        )}
                    </div>

                    {/* Confirm / Cancel — only when previewing */}
                    {preview && preview !== chord && (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                onClick={handleConfirm}
                                className="flex items-center justify-center gap-2 py-3 rounded-lg bg-chord-cyan text-chord-dark font-black text-[10px] tracking-widest uppercase shadow-[0_4px_15px_rgba(46,234,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">check</span>
                                Confirm
                            </button>
                            <button
                                onClick={() => setPreview(null)}
                                className="flex items-center justify-center gap-2 py-3 rounded-lg border border-white/20 text-white/60 font-black text-[10px] tracking-widest uppercase hover:bg-white/5 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">undo</span>
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Diatonic Chords */}
                    <div className="mb-4">
                        <p className="text-[10px] font-bold text-chord-cyan tracking-widest uppercase mb-2">
                            Diatonic in {songKey}
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                            {diatonic.map((d) => (
                                <button
                                    key={d.chord}
                                    onClick={() => handlePreview(d.chord)}
                                    className={`py-2 px-1 rounded border transition-all text-center ${
                                        d.chord === activeChord
                                            ? 'border-chord-cyan bg-chord-cyan/20 text-chord-cyan'
                                            : 'border-white/10 hover:border-chord-cyan hover:text-chord-cyan bg-white/5'
                                    }`}
                                >
                                    <span className="block text-[10px] font-mono font-bold text-chord-cyan/70">{d.roman}</span>
                                    <span className="block text-xs font-black uppercase">{d.chord}</span>
                                    <span className="block text-[8px] text-white/40 mt-0.5">{d.notes.slice(0, 4).join(' ')}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quality Swap */}
                    <div className="mb-4">
                        <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-2">Quality Swap ({root})</p>
                        {QUALITY_GROUPS.map((group) => (
                            <div key={group.label} className="mb-2">
                                <span className="text-[8px] text-zinc-600 uppercase tracking-wider">{group.label}</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {group.items.map((q) => {
                                        const newChord = root + q;
                                        return (
                                            <button
                                                key={q}
                                                onClick={() => handlePreview(newChord)}
                                                className={`px-2 py-1 text-[10px] font-bold rounded border transition-all uppercase ${
                                                    newChord === activeChord
                                                        ? 'border-chord-cyan bg-chord-cyan/20 text-chord-cyan'
                                                        : 'border-white/10 hover:border-chord-cyan hover:text-chord-cyan bg-white/5'
                                                }`}
                                            >
                                                {q || 'maj'}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onEdit}
                            className="flex items-center justify-center gap-2 py-3 rounded-lg bg-chord-cyan text-chord-dark font-black text-[10px] tracking-widest uppercase shadow-[0_4px_15px_rgba(46,234,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            Scratchpad
                        </button>
                        <button
                            onClick={() => { stopPlayback(); onDelete(); }}
                            className="flex items-center justify-center gap-2 py-3 rounded-lg border border-red-500/30 text-red-500 font-black text-[10px] tracking-widest uppercase hover:bg-red-500/10 transition-all"
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
