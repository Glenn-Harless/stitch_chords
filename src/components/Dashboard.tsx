import React from 'react';
import chordsData from '../data/chords.json';

interface DashboardProps {
    onSelect: () => void;
    songsCount: number;
    onNavigate: (view: 'dashboard' | 'library' | 'utility' | 'artists') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelect, songsCount, onNavigate }) => {
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
                    <span className="text-[10px] opacity-40 font-mono tracking-tighter">STORED_RECORDS: {songsCount.toString().padStart(2, '0')}</span>
                </div>

                <div className="grid gap-4">
                    <div
                        onClick={onSelect}
                        className="rounded border border-chord-cyan/20 bg-chord-card p-6 flex justify-between items-center group hover:border-chord-cyan transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.1)]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full border border-chord-cyan/30 flex items-center justify-center group-hover:border-chord-cyan transition-colors">
                                <span className="material-symbols-outlined text-chord-cyan">play_arrow</span>
                            </div>
                            <div>
                                <h3 className="font-mono font-bold text-sm tracking-tight uppercase group-hover:text-chord-cyan transition-colors">RESUME_LAST_SESSION</h3>
                                <p className="text-[10px] opacity-40 uppercase tracking-widest mt-0.5">STAY - THE KID LAROI</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-chord-cyan/40 group-hover:text-chord-cyan">chevron_right</span>
                    </div>

                    <div
                        onClick={() => onNavigate('artists')}
                        className="rounded border border-chord-cyan/20 bg-chord-cyan/5 p-6 flex justify-between items-center group hover:border-chord-cyan transition-all cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(0,212,255,0.05)]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-full border border-chord-cyan/30 flex items-center justify-center group-hover:border-chord-cyan transition-colors">
                                <span className="material-symbols-outlined text-chord-cyan">library_music</span>
                            </div>
                            <div>
                                <h3 className="font-mono font-bold text-sm tracking-tight uppercase group-hover:text-chord-cyan transition-colors">ARTIST_INSPIRATION</h3>
                                <p className="text-[10px] opacity-40 uppercase tracking-widest mt-0.5">DISCOVER_PROGRESSIONS</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-chord-cyan/40 group-hover:text-chord-cyan">arrow_forward</span>
                    </div>
                </div>
            </section>

            <section className="mt-12">
                <h2 className="text-chord-cyan text-[10px] font-bold tracking-[0.3em] uppercase mb-4 opacity-60">System_Library</h2>
                <div className="grid gap-2">
                    {chordsData.progressions.map(prog => (
                        <div
                            key={prog.id}
                            onClick={onSelect}
                            className="p-4 rounded border border-chord-cyan/10 bg-chord-cyan/5 hover:border-chord-cyan/40 cursor-pointer transition-all group flex justify-between items-center"
                        >
                            <div>
                                <div className="flex items-baseline gap-3">
                                    <h3 className="font-mono font-bold text-sm tracking-tight uppercase group-hover:text-chord-cyan">{prog.title.replace(/\s+/g, '_')}</h3>
                                    <span className="text-[9px] font-mono text-chord-cyan/40 uppercase tracking-tighter">{prog.tempo}_BPM</span>
                                </div>
                                <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1 font-display">{prog.artist}</p>
                            </div>
                            <span className="material-symbols-outlined text-chord-cyan opacity-20 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                        </div>
                    ))}
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
                        onClick={() => onNavigate('utility')}
                        className="flex flex-col items-center gap-1 opacity-40 hover:opacity-80 transition-opacity"
                    >
                        <span className="material-symbols-outlined text-xl">tune</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Utility</span>
                    </button>
                </div>
            </footer>
        </main>
    );
};

export default Dashboard;
