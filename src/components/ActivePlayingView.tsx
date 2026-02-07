import React, { useState, useEffect, useRef } from 'react';
import { transposeChord, getChordNotes, getRomanNumeral, getNoteIndex } from '../utils/theory';
import { playChord, stopPlayback, resumeAudio } from '../utils/audio';
import HotSwapMenu from './HotSwapMenu';
import SaveOverlay from './SaveOverlay';
import InlineChordPicker from './InlineChordPicker';
import SuggestionPanel from './SuggestionPanel';

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
    onClear?: () => void;
    artistId?: string | null;
}

// Compact key format: "C", "Am", "F#m", etc.
const KEYS = [
    'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F',
    'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'
];

// Convert compact key format to analysis format: "Am" → "A MINOR", "C" → "C MAJOR"
const keyToAnalysis = (key: string): string => {
    if (key.endsWith('m')) {
        return key.slice(0, -1) + ' MINOR';
    }
    return key + ' MAJOR';
};

// Get the root note of a key: "Am" → "A", "F#m" → "F#", "C" → "C"
const getKeyRoot = (key: string): string => {
    if (key.endsWith('m')) {
        return key.slice(0, -1);
    }
    return key;
};

// Calculate semitone difference between two keys
const getSemitonesBetweenKeys = (fromKey: string, toKey: string): number => {
    const fromRoot = getKeyRoot(fromKey);
    const toRoot = getKeyRoot(toKey);
    const fromIdx = getNoteIndex(fromRoot);
    const toIdx = getNoteIndex(toRoot);
    if (fromIdx === -1 || toIdx === -1) return 0;
    return (toIdx - fromIdx + 12) % 12;
};

const ActivePlayingView: React.FC<ActivePlayingViewProps> = ({ song, onBack, onSave, onEditChord, onUpdateSections, onClear, artistId }) => {
    const [transpose, setTranspose] = useState(0);
    const [instrument, setInstrument] = useState<'guitar' | 'keys'>('guitar');
    const [selectedChord, setSelectedChord] = useState<{ sIdx: number; bIdx: number }>({ sIdx: 0, bIdx: 0 });
    const [wakeLockEnabled, setWakeLockEnabled] = useState(true);
    const [songKey, setSongKey] = useState(song.key || 'C');
    const [hotSwapTarget, setHotSwapTarget] = useState<{ sIdx: number; bIdx: number } | null>(null);
    const [showSaveOverlay, setShowSaveOverlay] = useState(false);
    const [previewingChord, setPreviewingChord] = useState<{ sIdx: number; bIdx: number } | null>(null);
    const [dragSource, setDragSource] = useState<{ sIdx: number; bIdx: number } | null>(null);
    const [dragOverTarget, setDragOverTarget] = useState<{ sIdx: number; bIdx: number } | null>(null);
    const [addChordTarget, setAddChordTarget] = useState<number | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPress = useRef(false);
    const baseKey = useRef(song.key || 'C'); // Original key of the song
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);
    const audioBootstrapped = useRef(false);

    // Bootstrap audio context on first touch (required for iOS/mobile)
    useEffect(() => {
        const bootstrap = () => {
            if (!audioBootstrapped.current) {
                resumeAudio();
                audioBootstrapped.current = true;
            }
        };
        document.addEventListener('touchstart', bootstrap, { once: true });
        document.addEventListener('pointerdown', bootstrap, { once: true });
        return () => {
            document.removeEventListener('touchstart', bootstrap);
            document.removeEventListener('pointerdown', bootstrap);
        };
    }, []);

    // Wake Lock API
    useEffect(() => {
        if (!wakeLockEnabled) {
            wakeLockRef.current?.release().catch(() => {});
            wakeLockRef.current = null;
            return;
        }
        let cancelled = false;
        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    const sentinel = await navigator.wakeLock.request('screen');
                    if (cancelled) { sentinel.release(); return; }
                    wakeLockRef.current = sentinel;
                }
            } catch { /* device doesn't support wake lock or permission denied */ }
        };
        requestWakeLock();
        return () => {
            cancelled = true;
            wakeLockRef.current?.release().catch(() => {});
            wakeLockRef.current = null;
        };
    }, [wakeLockEnabled]);

    // Reset state when a different song is loaded
    useEffect(() => {
        const newKey = song.key || 'C';
        baseKey.current = newKey;
        setSongKey(newKey);
        setTranspose(0);
        setSelectedChord({ sIdx: 0, bIdx: 0 });
        setHotSwapTarget(null);
    }, [song.id]);

    // Handle key change - auto-update transpose to match
    const handleKeyChange = (newKey: string) => {
        const semitones = getSemitonesBetweenKeys(baseKey.current, newKey);
        // Normalize to -6 to +6 range for the slider
        const normalizedTranspose = semitones > 6 ? semitones - 12 : semitones;
        setSongKey(newKey);
        setTranspose(normalizedTranspose);
    };

    const currentChordName = song.sections[selectedChord.sIdx]?.bars[selectedChord.bIdx] || '';
    const transposedChordName = transposeChord(currentChordName, transpose);
    const chordNotes = getChordNotes(transposedChordName);

    const handleSaveWithTitle = (newTitle: string) => {
        if (onSave) {
            onSave({ ...song, title: newTitle, key: songKey });
        }
        setShowSaveOverlay(false);
    };

    // Pointer-based drag and drop (works on mobile and desktop)
    const dragLongPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isDragging = useRef(false);

    const handlePointerDown = (e: React.PointerEvent, sIdx: number, bIdx: number, chord: string) => {
        isDragging.current = false;
        isLongPress.current = false;

        // Start long-press timer for audio preview (300ms)
        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            const transposed = transposeChord(chord, transpose);
            const notes = getChordNotes(transposed);
            setPreviewingChord({ sIdx, bIdx });
            playChord(notes, 2);
        }, 300);

        // Start drag timer (500ms — longer than preview)
        dragLongPressTimer.current = setTimeout(() => {
            isDragging.current = true;
            // Cancel audio preview if drag starts
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
            if (previewingChord) {
                setPreviewingChord(null);
                stopPlayback();
            }
            setDragSource({ sIdx, bIdx });
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        }, 500);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current || !dragSource) return;
        // Find element under pointer
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (el) {
            const card = (el as HTMLElement).closest('[data-chord-pos]');
            if (card) {
                const pos = (card as HTMLElement).dataset.chordPos;
                if (pos) {
                    const [s, b] = pos.split(',').map(Number);
                    setDragOverTarget({ sIdx: s, bIdx: b });
                    return;
                }
            }
        }
        setDragOverTarget(null);
    };

    const handlePointerUp = (_e: React.PointerEvent, sIdx: number, bIdx: number) => {
        // Clear timers
        if (dragLongPressTimer.current) {
            clearTimeout(dragLongPressTimer.current);
            dragLongPressTimer.current = null;
        }
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }

        if (isDragging.current && dragSource && dragOverTarget && onUpdateSections) {
            // Perform the drop
            const { sIdx: sourceSIdx, bIdx: sourceBIdx } = dragSource;
            const { sIdx: targetSIdx, bIdx: targetBIdx } = dragOverTarget;

            if (!(sourceSIdx === targetSIdx && sourceBIdx === targetBIdx)) {
                const newSections = JSON.parse(JSON.stringify(song.sections));
                const chord = newSections[sourceSIdx].bars[sourceBIdx];
                newSections[sourceSIdx].bars.splice(sourceBIdx, 1);
                let adjustedTargetBIdx = targetBIdx;
                if (sourceSIdx === targetSIdx && sourceBIdx < targetBIdx) {
                    adjustedTargetBIdx--;
                }
                newSections[targetSIdx].bars.splice(adjustedTargetBIdx, 0, chord);
                onUpdateSections(newSections);
            }
            setDragSource(null);
            setDragOverTarget(null);
            isDragging.current = false;
            return;
        }

        // Clean up drag state
        if (isDragging.current) {
            setDragSource(null);
            setDragOverTarget(null);
            isDragging.current = false;
            return;
        }

        // Handle preview cleanup
        if (previewingChord) {
            setPreviewingChord(null);
            stopPlayback();
            return;
        }

        // Short tap: open hot swap
        if (!isLongPress.current && !isDragging.current) {
            setSelectedChord({ sIdx, bIdx });
            setHotSwapTarget({ sIdx, bIdx });
        }
    };

    const handlePointerCancel = () => {
        if (dragLongPressTimer.current) {
            clearTimeout(dragLongPressTimer.current);
            dragLongPressTimer.current = null;
        }
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        if (previewingChord) {
            setPreviewingChord(null);
            stopPlayback();
        }
        setDragSource(null);
        setDragOverTarget(null);
        isDragging.current = false;
    };

    const addSuggestionProgression = (chords: string[], sectionType: string) => {
        if (onUpdateSections) {
            const newSections = JSON.parse(JSON.stringify(song.sections));
            const existingIdx = newSections.findIndex((s: Section) => s.name === sectionType);
            if (existingIdx >= 0) {
                newSections[existingIdx].bars.push(...chords);
            } else {
                newSections.push({ name: sectionType, bars: chords });
            }
            onUpdateSections(newSections);
        }
    };

    const addChordToSection = (chord: string, sIdx: number) => {
        if (onUpdateSections) {
            const newSections = JSON.parse(JSON.stringify(song.sections));
            newSections[sIdx].bars.push(chord);
            onUpdateSections(newSections);
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
            // Remove empty sections after deleting last chord
            const filtered = newSections.filter((s: Section) => s.bars.length > 0);
            onUpdateSections(filtered);
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
                                onChange={(e) => handleKeyChange(e.target.value)}
                                className="bg-transparent border-none text-xs font-mono font-black text-chord-cyan p-0 focus:ring-0 appearance-none text-right cursor-pointer"
                            >
                                {KEYS.map(k => <option key={k} value={k} className="bg-chord-dark text-white">{k}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={() => setShowSaveOverlay(true)}
                            className="flex items-center justify-center rounded border border-chord-cyan/30 px-3 py-1.5 hover:bg-chord-cyan/10 transition-colors"
                        >
                            <span className="text-[10px] font-black text-chord-cyan tracking-widest uppercase">SAVE</span>
                        </button>
                        {onClear && (
                            <button
                                onClick={onClear}
                                className="flex items-center justify-center rounded border border-red-500/30 px-2 py-1.5 hover:bg-red-500/10 transition-colors"
                                title="Clear song"
                            >
                                <span className="material-symbols-outlined text-red-400 text-lg">delete</span>
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto">
                {/* Key Picker */}
                <div className="px-4 mt-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-chord-cyan text-sm">music_note</span>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-chord-cyan">Key</p>
                        {transpose !== 0 && (
                            <span className="text-[10px] font-mono text-chord-cyan/50">
                                ({transpose > 0 ? '+' : ''}{transpose} ST)
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                        {KEYS.map(k => (
                            <button
                                key={k}
                                onClick={() => handleKeyChange(k)}
                                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                                    songKey === k
                                        ? 'bg-chord-cyan text-chord-dark shadow-[0_0_12px_rgba(0,212,255,0.4)]'
                                        : 'border border-chord-cyan/20 text-chord-cyan/60 hover:border-chord-cyan/60 hover:text-chord-cyan'
                                }`}
                            >
                                {k}
                            </button>
                        ))}
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
                                const isPreviewing = previewingChord?.sIdx === sIdx && previewingChord?.bIdx === bIdx;
                                const currentTransposed = transposeChord(chord, transpose);
                                const roman = getRomanNumeral(currentTransposed, keyToAnalysis(songKey));
                                const notes = getChordNotes(currentTransposed);
                                const isBeingDragged = dragSource?.sIdx === sIdx && dragSource?.bIdx === bIdx;
                                const isDragOverThis = dragOverTarget?.sIdx === sIdx && dragOverTarget?.bIdx === bIdx;
                                return (
                                    <div
                                        key={bIdx}
                                        data-chord-pos={`${sIdx},${bIdx}`}
                                        onPointerDown={(e) => handlePointerDown(e, sIdx, bIdx, chord)}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={(e) => handlePointerUp(e, sIdx, bIdx)}
                                        onPointerCancel={handlePointerCancel}
                                        className={`aspect-[16/10] flex flex-col justify-between p-3 rounded border bg-chord-card relative group transition-all duration-200 select-none ${dragSource ? 'touch-none' : ''} ${
                                            isBeingDragged
                                                ? 'opacity-50 border-dashed border-chord-cyan scale-95'
                                                : isDragOverThis
                                                    ? 'border-2 border-green-400 bg-green-400/10 shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                                                    : isPreviewing
                                                        ? 'border-2 border-chord-cyan bg-chord-cyan/20 shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                                                        : isSelected
                                                            ? 'border-2 border-chord-cyan shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                                                            : 'border-chord-cyan/10 hover:border-chord-cyan/40 hover:bg-chord-cyan/5'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-mono font-black text-chord-cyan uppercase">
                                                {roman}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {isPreviewing && (
                                                    <span className="material-symbols-outlined text-chord-cyan text-xs animate-pulse">volume_up</span>
                                                )}
                                                <button
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteChord(sIdx, bIdx);
                                                    }}
                                                    className="p-0.5 rounded hover:bg-red-500/20 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-white/20 hover:text-red-400 text-xs">close</span>
                                                </button>
                                            </div>
                                        </div>

                                        <h2 className={`font-black tracking-tighter text-center uppercase ${currentTransposed.length > 5 ? 'text-lg' : 'text-2xl'}`}>
                                            {currentTransposed}
                                        </h2>

                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {notes.map((n, i) => (
                                                <span key={i} className="text-[11px] font-bold text-white/70 leading-none">{n}</span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Add chord button */}
                            <button
                                onClick={() => setAddChordTarget(sIdx)}
                                className="aspect-[16/10] flex flex-col items-center justify-center rounded border border-dashed border-chord-cyan/20 hover:border-chord-cyan/60 hover:bg-chord-cyan/5 transition-all"
                            >
                                <span className="material-symbols-outlined text-chord-cyan/40 text-2xl">add</span>
                                <span className="text-[9px] text-chord-cyan/40 uppercase mt-1">Add</span>
                            </button>
                        </div>
                    </div>
                ))}

                {/* Suggestion Panel */}
                <SuggestionPanel
                    artistId={artistId || null}
                    songKey={songKey}
                    existingSections={song.sections.map(s => s.name)}
                    onAddProgression={addSuggestionProgression}
                />

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
                                Roman Numeral: <span className="text-chord-cyan/80 not-italic uppercase font-bold">{getRomanNumeral(transposedChordName, keyToAnalysis(songKey))}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Hot Swap Menu Modal */}
            {hotSwapTarget && (
                <HotSwapMenu
                    chord={song.sections[hotSwapTarget.sIdx].bars[hotSwapTarget.bIdx]}
                    roman={getRomanNumeral(transposeChord(song.sections[hotSwapTarget.sIdx].bars[hotSwapTarget.bIdx], transpose), keyToAnalysis(songKey))}
                    songKey={songKey}
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

            {/* Inline Chord Picker Modal */}
            {addChordTarget !== null && song.sections[addChordTarget] && (
                <InlineChordPicker
                    songKey={songKey}
                    sectionName={song.sections[addChordTarget].name}
                    onAdd={(chord) => {
                        addChordToSection(chord, addChordTarget);
                        setAddChordTarget(null);
                    }}
                    onClose={() => setAddChordTarget(null)}
                />
            )}

            {/* Save Overlay Modal */}
            {showSaveOverlay && (
                <SaveOverlay
                    title={song.title}
                    sections={song.sections}
                    onSave={handleSaveWithTitle}
                    onCancel={() => setShowSaveOverlay(false)}
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
