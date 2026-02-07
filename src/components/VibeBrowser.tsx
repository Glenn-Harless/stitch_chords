import React, { useState, useMemo } from 'react';
import artistsData from '../data/artists.json';
import { getRomanNumeral } from '../utils/theory';

interface VibeBrowserProps {
    onBack: () => void;
    onAddProgression: (progression: any, targetSection: string) => void;
}

const keyToAnalysis = (key: string): string => {
    if (key.endsWith('m')) return key.slice(0, -1) + ' MINOR';
    return key + ' MAJOR';
};

// Collect all mood tags from all progressions
const ALL_MOODS = (() => {
    const tags = new Set<string>();
    artistsData.artists.forEach(a =>
        a.progressions.forEach((p: any) =>
            (p.mood_tags || []).forEach((t: string) => tags.add(t))
        )
    );
    return Array.from(tags).sort();
})();

const VibeBrowser: React.FC<VibeBrowserProps> = ({ onBack, onAddProgression }) => {
    const [selectedMoods, setSelectedMoods] = useState<Set<string>>(new Set());

    const toggleMood = (mood: string) => {
        setSelectedMoods(prev => {
            const next = new Set(prev);
            if (next.has(mood)) next.delete(mood);
            else next.add(mood);
            return next;
        });
    };

    const results = useMemo(() => {
        if (selectedMoods.size === 0) return [];
        const matches: { artist: string; prog: any }[] = [];
        artistsData.artists.forEach(artist => {
            artist.progressions.forEach((prog: any) => {
                const tags = prog.mood_tags || [];
                if (tags.some((t: string) => selectedMoods.has(t))) {
                    matches.push({ artist: artist.name, prog });
                }
            });
        });
        return matches;
    }, [selectedMoods]);

    return (
        <div className="min-h-screen bg-chord-dark text-white font-display relative pb-32">
            <div className="scanline" />

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
                            <h2 className="text-[10px] uppercase tracking-widest text-chord-cyan/60 font-bold">Explore</h2>
                            <h1 className="text-lg font-bold leading-tight tracking-tight uppercase">Vibe Browser</h1>
                        </div>
                    </div>
                    {selectedMoods.size > 0 && (
                        <button
                            onClick={() => setSelectedMoods(new Set())}
                            className="text-[10px] text-chord-cyan/60 uppercase tracking-wider hover:text-chord-cyan"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </nav>

            <main className="max-w-2xl mx-auto">
                {/* Mood Chips */}
                <div className="p-4">
                    <p className="text-[10px] font-bold text-chord-cyan tracking-widest uppercase mb-3">Select Vibes</p>
                    <div className="flex flex-wrap gap-2">
                        {ALL_MOODS.map(mood => (
                            <button
                                key={mood}
                                onClick={() => toggleMood(mood)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                                    selectedMoods.has(mood)
                                        ? 'bg-chord-cyan text-chord-dark shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                                        : 'border border-chord-cyan/20 text-chord-cyan/50 hover:border-chord-cyan/60'
                                }`}
                            >
                                {mood}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                {selectedMoods.size > 0 && (
                    <div className="px-4 mt-4">
                        <p className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase mb-3">
                            {results.length} matches
                        </p>
                        <div className="flex flex-col gap-2">
                            {results.map(({ artist, prog }) => (
                                <div
                                    key={prog.id}
                                    className="rounded border border-chord-cyan/10 bg-chord-card p-4 hover:border-chord-cyan/30 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-[10px] text-chord-cyan/50 uppercase tracking-wider">{artist}</p>
                                            <p className="text-chord-cyan text-sm font-bold tracking-wider uppercase">
                                                {prog.chords.map((c: any) => getRomanNumeral(c.root + (c.quality || ''), keyToAnalysis(prog.key))).join(' - ')}
                                            </p>
                                            <p className="text-zinc-500 text-[10px] uppercase mt-0.5">
                                                {prog.chords.map((c: any) => c.root + (c.quality || '')).join(' - ')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] text-zinc-600 font-mono">{prog.key}</span>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 italic mb-2">{prog.vibe}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex flex-wrap gap-1 flex-1">
                                            {(prog.mood_tags || []).map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase ${
                                                        selectedMoods.has(tag)
                                                            ? 'bg-chord-cyan/20 text-chord-cyan'
                                                            : 'bg-white/5 text-zinc-500'
                                                    }`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => onAddProgression(prog, prog.suggested_section || 'VERSE')}
                                            className="shrink-0 px-3 py-1.5 rounded bg-chord-cyan text-chord-dark text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {results.length === 0 && (
                                <p className="text-center text-zinc-600 text-[10px] font-mono uppercase py-8">
                                    No matches for selected vibes
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {selectedMoods.size === 0 && (
                    <div className="px-4 mt-12 text-center">
                        <span className="material-symbols-outlined text-chord-cyan/20 text-5xl">graphic_eq</span>
                        <p className="text-zinc-600 text-[10px] font-mono uppercase mt-4">
                            Tap vibes above to explore progressions
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VibeBrowser;
