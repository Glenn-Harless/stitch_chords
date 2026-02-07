import React, { useState, useMemo } from 'react';
import { getSuggestions } from '../utils/suggestions';
import { getChordNotes } from '../utils/theory';

interface SuggestionPanelProps {
    artistId: string | null;
    songKey: string;
    existingSections: string[];
    onAddProgression: (chords: string[], sectionType: string) => void;
}

const SECTION_TYPES = ['VERSE', 'CHORUS', 'BRIDGE'];

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ artistId, songKey, existingSections, onAddProgression }) => {
    const [expanded, setExpanded] = useState(false);
    const [selectedSection, setSelectedSection] = useState('CHORUS');

    const suggestions = useMemo(
        () => getSuggestions(artistId, selectedSection, songKey, existingSections),
        [artistId, selectedSection, songKey, existingSections]
    );

    const artistSuggestions = suggestions.filter(s => s.source === 'artist');
    const theorySuggestions = suggestions.filter(s => s.source === 'theory');

    if (!expanded) {
        return (
            <div className="px-4 mt-4">
                <button
                    onClick={() => setExpanded(true)}
                    className="w-full py-3 rounded border border-dashed border-chord-cyan/20 hover:border-chord-cyan/50 transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined text-chord-cyan/40 text-sm">auto_awesome</span>
                    <span className="text-[10px] text-chord-cyan/50 font-bold uppercase tracking-widest">Suggestions</span>
                </button>
            </div>
        );
    }

    return (
        <div className="px-4 mt-4">
            <div className="rounded border border-chord-cyan/20 bg-chord-cyan/5 overflow-hidden">
                <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-chord-cyan text-sm">auto_awesome</span>
                        <span className="text-[10px] text-chord-cyan font-bold uppercase tracking-widest">Suggest for:</span>
                    </div>
                    <button onClick={() => setExpanded(false)} className="p-1 hover:bg-white/5 rounded">
                        <span className="material-symbols-outlined text-zinc-500 text-sm">expand_less</span>
                    </button>
                </div>

                {/* Section Type Picker */}
                <div className="flex gap-1 px-3 pb-3">
                    {SECTION_TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedSection(type)}
                            className={`flex-1 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                                selectedSection === type
                                    ? 'bg-chord-cyan text-chord-dark'
                                    : 'bg-white/5 text-chord-cyan/50 hover:text-chord-cyan'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Results */}
                <div className="max-h-64 overflow-y-auto">
                    {artistSuggestions.length > 0 && (
                        <div className="px-3 pb-2">
                            <p className="text-[8px] text-chord-cyan/50 uppercase tracking-wider mb-2">
                                From {artistSuggestions[0].artistName}
                            </p>
                            {artistSuggestions.map((s, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white uppercase truncate">
                                            {s.chords.join(' - ')}
                                        </p>
                                        <p className="text-[9px] text-zinc-500 italic">{s.vibe}</p>
                                    </div>
                                    <button
                                        onClick={() => onAddProgression(s.chords, selectedSection)}
                                        className="shrink-0 ml-2 px-2 py-1 rounded bg-chord-cyan/10 text-chord-cyan text-[9px] font-bold uppercase hover:bg-chord-cyan/20 transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {theorySuggestions.length > 0 && (
                        <div className="px-3 pb-3">
                            <p className="text-[8px] text-chord-cyan/50 uppercase tracking-wider mb-2">Theory Match</p>
                            {theorySuggestions.map((s, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] font-mono text-chord-cyan/60">{s.label}</p>
                                        </div>
                                        <p className="text-xs font-bold text-white uppercase">
                                            {s.chords.join(' - ')}
                                        </p>
                                        <div className="flex gap-1 mt-0.5">
                                            {s.chords.map((c, j) => (
                                                <span key={j} className="text-[8px] text-zinc-500">
                                                    {getChordNotes(c).slice(0, 3).join(' ')}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-zinc-500 italic">{s.vibe}</p>
                                    </div>
                                    <button
                                        onClick={() => onAddProgression(s.chords, selectedSection)}
                                        className="shrink-0 ml-2 px-2 py-1 rounded bg-chord-cyan/10 text-chord-cyan text-[9px] font-bold uppercase hover:bg-chord-cyan/20 transition-all"
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {suggestions.length === 0 && (
                        <p className="text-center text-zinc-600 text-[9px] font-mono uppercase py-4">
                            No suggestions available
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuggestionPanel;
