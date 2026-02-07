import React from 'react';

interface Song {
    id: string;
    title: string;
    artist: string;
    tempo: number;
    key?: string;
    sections: { name: string; bars: string[] }[];
    lastOpened?: number;
}

interface DashboardProps {
    onSelect: () => void;
    onSelectSong: (song: Song) => void;
    onNewSong: () => void;
    songs: Song[];
    onNavigate: (view: 'dashboard' | 'library' | 'utility' | 'artists' | 'scratchpad' | 'expansion' | 'vibe-browse') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelect, onSelectSong, onNewSong, songs, onNavigate }) => {
    // Show most recent 5 songs, sorted by lastOpened
    const recentSongs = [...songs]
        .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))
        .slice(0, 5);
    return (
        <main className="max-w-2xl mx-auto p-4 pb-32 relative min-h-screen">
            <div className="scanline" />

            <header className="py-12">
                <span className="text-[10px] text-chord-cyan/60 font-mono tracking-[0.4em] uppercase mb-2 block animate-pulse">System.Initialized</span>
                <h1 className="text-5xl font-bold tracking-tighter text-white uppercase">Stitch Chords</h1>
                <div className="h-[1px] w-12 bg-chord-cyan mt-4 shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
            </header>

            <section className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-chord-cyan text-xs font-bold tracking-[0.3em] uppercase bg-chord-cyan/10 px-2 py-1 rounded">Quick_Access</h2>
                    <span className="text-[10px] opacity-40 font-mono tracking-tighter">STORED_RECORDS: {songs.length.toString().padStart(2, '0')}</span>
                </div>

                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            onClick={onSelect}
                            className="rounded border border-chord-cyan/20 bg-chord-card p-4 flex flex-col gap-3 group hover:border-chord-cyan transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]"
                        >
                            <div className="size-10 rounded-full border border-chord-cyan/30 flex items-center justify-center group-hover:border-chord-cyan transition-colors">
                                <span className="material-symbols-outlined text-chord-cyan">play_arrow</span>
                            </div>
                            <div>
                                <h3 className="font-mono font-bold text-[11px] tracking-tight uppercase group-hover:text-chord-cyan transition-colors">RESUME_SESSION</h3>
                                <p className="text-[9px] opacity-40 uppercase tracking-widest mt-0.5">CONTINUE</p>
                            </div>
                        </div>
                        <div
                            onClick={onNewSong}
                            className="rounded border border-chord-cyan/20 bg-chord-card p-4 flex flex-col gap-3 group hover:border-chord-cyan transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]"
                        >
                            <div className="size-10 rounded-full border border-chord-cyan/30 flex items-center justify-center group-hover:border-chord-cyan transition-colors">
                                <span className="material-symbols-outlined text-chord-cyan">add</span>
                            </div>
                            <div>
                                <h3 className="font-mono font-bold text-[11px] tracking-tight uppercase group-hover:text-chord-cyan transition-colors">NEW_SONG</h3>
                                <p className="text-[9px] opacity-40 uppercase tracking-widest mt-0.5">START_FRESH</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div
                            onClick={() => onNavigate('artists')}
                            className="rounded border border-chord-cyan/20 bg-chord-cyan/5 p-4 flex flex-col gap-3 group hover:border-chord-cyan transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-chord-cyan group-hover:text-glow transition-all">library_music</span>
                            <div>
                                <h3 className="font-mono font-bold text-[10px] tracking-tight uppercase">ARTISTS</h3>
                                <p className="text-[8px] opacity-40 uppercase tracking-widest mt-0.5">BROWSE</p>
                            </div>
                        </div>
                        <div
                            onClick={() => onNavigate('vibe-browse')}
                            className="rounded border border-chord-cyan/20 bg-chord-cyan/5 p-4 flex flex-col gap-3 group hover:border-chord-cyan transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-chord-cyan group-hover:text-glow transition-all">graphic_eq</span>
                            <div>
                                <h3 className="font-mono font-bold text-[10px] tracking-tight uppercase">VIBES</h3>
                                <p className="text-[8px] opacity-40 uppercase tracking-widest mt-0.5">EXPLORE</p>
                            </div>
                        </div>
                        <div
                            onClick={() => onNavigate('scratchpad')}
                            className="rounded border border-chord-cyan/20 bg-chord-cyan/5 p-4 flex flex-col gap-3 group hover:border-chord-cyan transition-all cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-chord-cyan group-hover:text-glow transition-all">edit_square</span>
                            <div>
                                <h3 className="font-mono font-bold text-[10px] tracking-tight uppercase">SCRATCH</h3>
                                <p className="text-[8px] opacity-40 uppercase tracking-widest mt-0.5">CUSTOM</p>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => onNavigate('expansion')}
                        className="rounded border border-chord-cyan/10 bg-chord-card/50 p-3 flex justify-between items-center group hover:border-chord-cyan/30 transition-all cursor-pointer opacity-50 hover:opacity-80"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-chord-cyan/40 text-sm">analytics</span>
                            <span className="font-mono text-[10px] tracking-tight uppercase text-zinc-500">Expansion Techniques</span>
                        </div>
                        <span className="material-symbols-outlined text-chord-cyan/20 text-sm">chevron_right</span>
                    </div>
                </div>
            </section>

            <section className="mt-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-chord-cyan text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">Recent_Songs</h2>
                    {songs.length > 5 && (
                        <button
                            onClick={() => onNavigate('library')}
                            className="text-[9px] text-chord-cyan/60 hover:text-chord-cyan uppercase tracking-wider"
                        >
                            View All →
                        </button>
                    )}
                </div>
                <div className="grid gap-2">
                    {recentSongs.length === 0 ? (
                        <div className="p-6 rounded border border-dashed border-chord-cyan/20 text-center">
                            <p className="text-[10px] opacity-40 uppercase tracking-widest font-mono">No_Saved_Songs</p>
                            <button
                                onClick={onNewSong}
                                className="mt-3 text-chord-cyan text-[10px] uppercase tracking-wider hover:underline"
                            >
                                Create_First_Song →
                            </button>
                        </div>
                    ) : (
                        recentSongs.map(song => (
                            <div
                                key={song.id}
                                onClick={() => onSelectSong(song)}
                                className="p-4 rounded border border-chord-cyan/10 bg-chord-cyan/5 hover:border-chord-cyan/40 cursor-pointer transition-all group flex justify-between items-center"
                            >
                                <div>
                                    <div className="flex items-baseline gap-3">
                                        <h3 className="font-mono font-bold text-sm tracking-tight uppercase group-hover:text-chord-cyan">{song.title.replace(/\s+/g, '_')}</h3>
                                        {song.key && (
                                            <span className="text-[9px] font-mono text-chord-cyan/40 uppercase tracking-tighter">{song.key}</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1 font-display">
                                        {song.sections.length} section{song.sections.length !== 1 ? 's' : ''} • {song.sections.reduce((acc, s) => acc + s.bars.length, 0)} chords
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-chord-cyan opacity-20 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Floating System Status */}
            <div className="fixed bottom-24 right-6 pointer-events-none">
                <div className="bg-chord-dark/80 border border-chord-cyan/10 backdrop-blur-sm px-2 py-1 rounded text-[8px] font-mono text-chord-cyan/40 uppercase italic">
                    v0.8.4_ALPHA_STABLE
                </div>
            </div>

            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-chord-dark/95 backdrop-blur-xl border-t border-chord-cyan/20 z-50">
                <div className="max-w-2xl mx-auto flex justify-around">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="flex flex-col items-center gap-1 text-chord-cyan"
                    >
                        <span className="material-symbols-outlined text-xl">terminal</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Dashboard</span>
                    </button>
                    <button
                        onClick={() => onNavigate('library')}
                        className="flex flex-col items-center gap-1 opacity-40 hover:opacity-80 transition-opacity"
                    >
                        <span className="material-symbols-outlined text-xl">folder_open</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Library</span>
                    </button>
                    <button
                        onClick={() => onNavigate('artists')}
                        className="flex flex-col items-center gap-1 opacity-40 hover:opacity-80 transition-opacity"
                    >
                        <span className="material-symbols-outlined text-xl">library_music</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Artists</span>
                    </button>
                </div>
            </footer>
        </main>
    );
};

export default Dashboard;
