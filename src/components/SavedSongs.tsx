import React, { useState, useMemo } from 'react';
import type { Song as SavedSong } from '../hooks/useSavedSongs';

interface SavedSongsProps {
    songs: SavedSong[];
    onSelect: (song: SavedSong) => void;
    onNew: () => void;
}

type SortMode = 'lastOpened' | 'alphabetical' | 'created';
type SectionFilter = 'VERSE' | 'CHORUS' | 'BRIDGE';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
    { value: 'lastOpened', label: 'LAST_OPENED' },
    { value: 'alphabetical', label: 'A-Z' },
    { value: 'created', label: 'CREATED' },
];

const SECTION_FILTERS: SectionFilter[] = ['VERSE', 'CHORUS', 'BRIDGE'];

const formatRelativeTime = (timestamp?: number): string => {
    if (!timestamp) return 'never';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just_now';
    if (minutes < 60) return `${minutes}m_ago`;
    if (hours < 24) return `${hours}h_ago`;
    if (days < 7) return `${days}d_ago`;
    return `${Math.floor(days / 7)}w_ago`;
};

const SavedSongs: React.FC<SavedSongsProps> = ({ songs, onSelect, onNew }) => {
    const [sortMode, setSortMode] = useState<SortMode>('lastOpened');
    const [activeFilters, setActiveFilters] = useState<Set<SectionFilter>>(new Set());

    const toggleFilter = (filter: SectionFilter) => {
        setActiveFilters(prev => {
            const next = new Set(prev);
            if (next.has(filter)) {
                next.delete(filter);
            } else {
                next.add(filter);
            }
            return next;
        });
    };

    const cycleSortMode = () => {
        const currentIndex = SORT_OPTIONS.findIndex(o => o.value === sortMode);
        const nextIndex = (currentIndex + 1) % SORT_OPTIONS.length;
        setSortMode(SORT_OPTIONS[nextIndex].value);
    };

    const filteredAndSortedSongs = useMemo(() => {
        // Filter
        let result = songs;
        if (activeFilters.size > 0) {
            result = songs.filter(song =>
                Array.from(activeFilters).every(filter =>
                    song.sections?.some(s => s.name.toUpperCase().startsWith(filter))
                )
            );
        }

        // Sort
        return [...result].sort((a, b) => {
            switch (sortMode) {
                case 'lastOpened':
                    return (b.lastOpened || 0) - (a.lastOpened || 0);
                case 'alphabetical':
                    return a.title.localeCompare(b.title);
                case 'created':
                    return (b.createdAt || 0) - (a.createdAt || 0);
                default:
                    return 0;
            }
        });
    }, [songs, sortMode, activeFilters]);

    const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortMode)?.label || 'LAST_OPENED';

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
                    {/* Sort Chip */}
                    <button
                        onClick={cycleSortMode}
                        className="flex h-6 shrink-0 items-center justify-center gap-x-1 border border-chord-cyan/30 px-2 bg-chord-cyan/10 hover:bg-chord-cyan/20 transition-colors cursor-pointer"
                    >
                        <span className="text-[9px] text-chord-cyan/60 font-mono uppercase">SORT:</span>
                        <span className="text-chord-cyan text-[10px] font-medium font-mono">{currentSortLabel}</span>
                    </button>

                    {/* Section Filter Chips */}
                    {SECTION_FILTERS.map(filter => {
                        const isActive = activeFilters.has(filter);
                        return (
                            <button
                                key={filter}
                                onClick={() => toggleFilter(filter)}
                                className={`flex h-6 shrink-0 items-center justify-center gap-x-1 border px-2 transition-colors cursor-pointer ${
                                    isActive
                                        ? 'border-chord-cyan bg-chord-cyan/20 text-chord-cyan'
                                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                                }`}
                            >
                                <span className="text-[10px] font-medium font-mono">{filter}</span>
                                {isActive && <span className="text-[8px]">✓</span>}
                            </button>
                        );
                    })}
                </div>
            </header>

            <main className="flex flex-col max-w-2xl mx-auto w-full flex-1">
                {/* Metadata Line */}
                <div className="px-4 py-2 border-b border-white/5 bg-white/5">
                    <p className="text-[10px] text-white/30 font-mono tracking-tighter uppercase">
                        INDEX_START | SHOWING: {filteredAndSortedSongs.length.toString().padStart(2, '0')} / {songs.length.toString().padStart(2, '0')}
                    </p>
                </div>

                {/* Song List Items */}
                <div className="divide-y divide-white/5">
                    {filteredAndSortedSongs.length === 0 ? (
                        <div className="px-4 py-20 text-center opacity-40">
                            <span className="material-symbols-outlined text-4xl mb-4 block">
                                {songs.length === 0 ? 'folder_open' : 'filter_alt_off'}
                            </span>
                            <p className="text-xs font-mono uppercase tracking-[0.2em]">
                                {songs.length === 0 ? 'Library_Empty' : 'No_Matches_Found'}
                            </p>
                            {activeFilters.size > 0 && (
                                <button
                                    onClick={() => setActiveFilters(new Set())}
                                    className="mt-4 text-chord-cyan text-[10px] font-mono uppercase hover:underline"
                                >
                                    Clear_Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredAndSortedSongs.map((song) => (
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
                                        {formatRelativeTime(song.lastOpened)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-chord-cyan/40 bg-chord-cyan/5 px-1 uppercase">{song.tempo} BPM</span>
                                    <p className="text-[#9ab8bc] text-xs leading-none line-clamp-1 tracking-wide uppercase">
                                        {song.sections?.map(s => s.name).join(' • ') || 'No sections'}
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
