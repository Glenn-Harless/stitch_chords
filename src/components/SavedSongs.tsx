import React from 'react';
import type { Song as SavedSong } from '../hooks/useSavedSongs';

interface SavedSongsProps {
    songs: SavedSong[];
    onSelect: (song: SavedSong) => void;
    onNew: () => void;
}

const SavedSongs: React.FC<SavedSongsProps> = ({ songs, onSelect, onNew }) => {
    return (
        <div className="min-h-screen bg-chord-dark text-[#e5e5e5] flex flex-col font-display relative">
            <div className="scanline" />

            {/* Terminal Header / TopAppBar */}
            <header className="sticky top-0 z-10 bg-chord-dark/95 backdrop-blur-sm border-b border-white/5">
                <div className="flex items-center justify-between p-4 pt-10 max-w-2xl mx-auto w-full">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-chord-cyan/60 font-mono tracking-widest uppercase mb-1">DIRECTORY: /ROOT/LIBRARY</span>
                        <h1 className="text-white text-xl font-bold tracking-tight uppercase">Saved_Songs</h1>
                    </div>
                    <button
                        onClick={onNew}
                        className="text-chord-cyan font-bold text-sm tracking-wider hover:bg-chord-cyan/10 px-3 py-1 rounded transition-colors uppercase border border-chord-cyan/20"
                    >
                        NEW SONG +
                    </button>
                </div>

                {/* Filter Chips / Utility Bar */}
                <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar max-w-2xl mx-auto w-full">
                    <div className="flex h-6 shrink-0 items-center justify-center gap-x-1 border border-white/10 px-2 bg-white/5">
                        <span className="text-[9px] text-white/40 font-mono uppercase">SORT:</span>
                        <span className="text-white text-[10px] font-medium font-mono">LAST_OPENED</span>
                    </div>
                    <div className="flex h-6 shrink-0 items-center justify-center gap-x-1 border border-white/10 px-2 bg-white/5">
                        <span className="text-[9px] text-white/40 font-mono uppercase">TYPE:</span>
                        <span className="text-white text-[10px] font-medium font-mono">CHORDS</span>
                    </div>
                    <div className="flex h-6 shrink-0 items-center justify-center gap-x-1 border border-white/10 px-2 bg-white/5">
                        <span className="text-[9px] text-white/40 font-mono uppercase">VIEW:</span>
                        <span className="text-white text-[10px] font-medium font-mono">DENSE</span>
                    </div>
                </div>
            </header>

            <main className="flex flex-col max-w-2xl mx-auto w-full flex-1">
                {/* Metadata Line */}
                <div className="px-4 py-2 border-b border-white/5 bg-white/5">
                    <p className="text-[10px] text-white/30 font-mono tracking-tighter uppercase">
                        INDEX_START | TOTAL_RECORDS: {songs.length.toString().padStart(2, '0')}
                    </p>
                </div>

                {/* Song List Items */}
                <div className="divide-y divide-white/5">
                    {songs.length === 0 ? (
                        <div className="px-4 py-20 text-center opacity-40">
                            <span className="material-symbols-outlined text-4xl mb-4 block">folder_open</span>
                            <p className="text-xs font-mono uppercase tracking-[0.2em]">Library_Empty</p>
                        </div>
                    ) : (
                        songs.map((song, idx) => (
                            <div
                                key={song.id}
                                onClick={() => onSelect(song)}
                                className="group flex flex-col px-4 py-4 hover:bg-chord-cyan/5 cursor-pointer transition-colors active:bg-chord-cyan/20 border-l-2 border-l-transparent hover:border-l-chord-cyan"
                            >
                                <div className="flex items-baseline justify-between mb-1">
                                    <h2 className="text-white font-mono font-bold text-sm tracking-tight uppercase group-hover:text-chord-cyan transition-colors">
                                        {song.title.replace(/\s+/g, '_')}
                                    </h2>
                                    <span className="text-[10px] text-white/30 font-mono shrink-0 uppercase">
                                        {idx === 0 ? '2m_ago' : `${idx + 1}h_ago`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-chord-cyan/40 bg-chord-cyan/5 px-1 uppercase">{song.tempo} BPM</span>
                                    <p className="text-[#9ab8bc] text-xs leading-none line-clamp-1 tracking-wide uppercase">
                                        {song.artist} • v0.1.2
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer / System Status */}
                <div className="px-4 py-12 mt-auto flex flex-col items-center">
                    <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-4">END_OF_LIBRARY</p>
                    <div className="h-1 w-1 bg-chord-cyan animate-pulse shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
                </div>
            </main>

            {/* Floating System Feedback */}
            <div className="fixed bottom-6 right-6 pointer-events-none z-50">
                <div className="bg-chord-dark/80 border border-chord-cyan/20 backdrop-blur-md px-3 py-1.5 rounded-sm shadow-2xl">
                    <span className="text-[9px] font-mono text-chord-cyan uppercase tracking-tighter italic">SYS.MONITOR: STABLE_V2</span>
                </div>
            </div>
        </div>
    );
};

export default SavedSongs;
