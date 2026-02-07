import React, { useRef, useState } from 'react';
import artistsData from '../data/artists.json';
import { getChordNotes, getRomanNumeral } from '../utils/theory';
import { playProgression, stopPlayback } from '../utils/audio';

interface ArtistLibraryProps {
    artistId: string;
    onBack: () => void;
    onAddProgression: (progression: any, targetSection: string) => void;
}

// Convert compact key format to analysis format: "Am" → "A MINOR", "C" → "C MAJOR"
const keyToAnalysis = (key: string): string => {
    if (key.endsWith('m')) {
        return key.slice(0, -1) + ' MINOR';
    }
    return key + ' MAJOR';
};

const ArtistLibrary: React.FC<ArtistLibraryProps> = ({ artistId, onBack, onAddProgression }) => {
    const artist = artistsData.artists.find(a => a.id === artistId);
    const [previewingId, setPreviewingId] = useState<string | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const startPreview = (prog: any) => {
        // Get chord notes for each chord in progression
        const chordNotesList = prog.chords.map((c: any) =>
            getChordNotes(c.root + (c.quality || ''))
        );
        setPreviewingId(prog.id);
        playProgression(chordNotesList, prog.bpm || 120);
    };

    const isLongPress = useRef(false);

    const handlePressStart = (prog: any) => {
        isLongPress.current = false;
        longPressTimer.current = setTimeout(() => {
            isLongPress.current = true;
            startPreview(prog);
        }, 300);
    };

    const handlePressEnd = (prog?: any) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        if (previewingId) {
            setPreviewingId(null);
            stopPlayback();
        }
        // Short tap: add to suggested section
        if (!isLongPress.current && prog) {
            onAddProgression(prog, prog.suggested_section || 'VERSE');
        }
    };

    if (!artist) {
        return (
            <div className="min-h-screen bg-chord-dark flex items-center justify-center p-8">
                <div className="text-center">
                    <p className="font-mono text-zinc-500 mb-4 uppercase">Artist_Not_Found</p>
                    <button onClick={onBack} className="text-chord-cyan font-mono text-xs uppercase hover:underline">Return_to_Artists</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-chord-dark text-white font-display flex flex-col max-w-md mx-auto relative border-x border-white/5">
            <div className="scanline" />

            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-50 bg-chord-dark/95 backdrop-blur-md border-b border-chord-cyan/10">
                <div className="flex items-center justify-between px-4 h-16">
                    <div className="flex items-center gap-3">
                        <span
                            onClick={onBack}
                            className="material-symbols-outlined text-chord-cyan cursor-pointer hover:bg-chord-cyan/10 p-2 rounded-full transition-colors text-lg"
                        >
                            arrow_back_ios_new
                        </span>
                        <div className="flex flex-col">
                            <h1 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Artist Library</h1>
                            <h2 className="text-xl font-bold leading-none tracking-tight text-white uppercase italic">{artist.name}</h2>
                        </div>
                    </div>
                    <span className="text-[10px] text-chord-cyan/40 font-mono uppercase tracking-tighter">
                        TAP TO ADD
                    </span>
                </div>
            </div>

            {/* Main Scrollable Area */}
            <main className="flex flex-col w-full pb-24 h-full overflow-y-auto scrollbar-hide">
                {/* Utility Stats Row */}
                <div className="flex items-center justify-between px-4 py-3 bg-chord-cyan/5 border-b border-chord-cyan/10">
                    <span className="text-[10px] uppercase tracking-widest text-chord-cyan/70 font-bold">
                        {artist.progressions.length} Progressions Found
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-chord-cyan/70 font-bold">
                        GENRE: {artist.genre}
                    </span>
                </div>

                {/* Progression Items */}
                <div className="flex flex-col">
                    {artist.progressions.map((prog) => (
                        <div
                            key={prog.id}
                            className={`group flex items-center justify-between px-4 py-5 border-b border-white/5 transition-colors select-none ${
                                previewingId === prog.id
                                    ? 'bg-chord-cyan/20 border-l-2 border-l-chord-cyan'
                                    : 'hover:bg-chord-cyan/[0.02]'
                            }`}
                            onMouseDown={() => handlePressStart(prog)}
                            onMouseUp={() => handlePressEnd(prog)}
                            onMouseLeave={() => handlePressEnd()}
                            onTouchStart={(e) => { e.preventDefault(); handlePressStart(prog); }}
                            onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(prog); }}
                        >
                            <div className="flex flex-col gap-1 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <p className="text-chord-cyan text-lg font-bold tracking-wider uppercase leading-none">
                                        {prog.chords.map((c: any) => getRomanNumeral(c.root + (c.quality || ''), keyToAnalysis(prog.key))).join(' - ')}
                                    </p>
                                    {previewingId === prog.id && (
                                        <span className="material-symbols-outlined text-chord-cyan text-sm animate-pulse">volume_up</span>
                                    )}
                                </div>
                                <p className="text-zinc-500 text-xs font-medium tracking-tight opacity-80 uppercase">
                                    {prog.chords.map((c: any) => c.root + (c.quality || '')).join(' - ')}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 ml-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAddProgression(prog, 'VERSE'); }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    className="flex flex-col items-center justify-center w-10 h-10 border border-chord-cyan/20 rounded hover:bg-chord-cyan hover:text-black transition-all group/btn"
                                    title="Add to Verse"
                                >
                                    <span className="text-[10px] font-bold">V</span>
                                    <span className="material-symbols-outlined text-sm leading-none mt-[-2px]">add</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAddProgression(prog, 'BRIDGE'); }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    className="flex flex-col items-center justify-center w-10 h-10 border border-chord-cyan/20 rounded hover:bg-chord-cyan hover:text-black transition-all group/btn"
                                    title="Add to Bridge"
                                >
                                    <span className="text-[10px] font-bold">B</span>
                                    <span className="material-symbols-outlined text-sm leading-none mt-[-2px]">add</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onAddProgression(prog, 'CHORUS'); }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    className="flex flex-col items-center justify-center w-10 h-10 border border-chord-cyan/20 rounded hover:bg-chord-cyan hover:text-black transition-all group/btn"
                                    title="Add to Chorus"
                                >
                                    <span className="text-[10px] font-bold">C</span>
                                    <span className="material-symbols-outlined text-sm leading-none mt-[-2px]">add</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {artist.progressions.length === 0 && (
                        <div className="p-12 text-center">
                            <p className="text-zinc-600 font-mono text-xs uppercase italic">No_Progressions_Available</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-chord-dark/95 backdrop-blur-md border-t border-chord-cyan/10 px-6 pb-6 pt-3">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <button className="flex flex-col items-center gap-1 text-chord-cyan">
                        <span className="material-symbols-outlined">library_music</span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Artists</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">favorite</span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Favorites</span>
                    </button>
                    <div className="relative -top-6">
                        <button className="flex items-center justify-center w-14 h-14 bg-chord-cyan text-black rounded-full shadow-[0_0_20px_rgba(46,234,255,0.4)]">
                            <span className="material-symbols-outlined text-3xl font-bold">add</span>
                        </button>
                    </div>
                    <button className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">queue_music</span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Builder</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 text-zinc-600 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">settings_input_component</span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default ArtistLibrary;
