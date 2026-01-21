import React, { useState } from 'react';

interface Section {
    name: string;
    bars: string[];
}

interface SaveOverlayProps {
    title: string;
    sections: Section[];
    onSave: (newTitle: string) => void;
    onCancel: () => void;
}

const SaveOverlay: React.FC<SaveOverlayProps> = ({ title, sections, onSave, onCancel }) => {
    const [editedTitle, setEditedTitle] = useState(title || 'Untitled');

    const totalChords = sections.reduce((sum, s) => sum + s.bars.length, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-chord-dark border border-chord-cyan/30 rounded-lg shadow-[0_0_40px_rgba(0,212,255,0.15)] overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b border-chord-cyan/20 bg-chord-cyan/5">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-chord-cyan text-sm">save</span>
                        <h2 className="text-[10px] font-bold tracking-[0.2em] uppercase text-chord-cyan">Save Song</h2>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase block">
                            Song Title
                        </label>
                        <div className="relative">
                            <div className="absolute -inset-0.5 bg-chord-cyan/20 rounded blur opacity-20"></div>
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="relative w-full bg-chord-card border border-chord-cyan/30 rounded px-3 py-2 text-white font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-chord-cyan focus:ring-1 focus:ring-chord-cyan/50"
                                placeholder="Enter song title..."
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Section Summary */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase block">
                            Structure Summary
                        </label>
                        <div className="bg-chord-card border border-white/10 rounded p-3 space-y-2">
                            {sections.length === 0 ? (
                                <p className="text-zinc-600 text-xs font-mono italic">No sections yet</p>
                            ) : (
                                sections.map((section, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <span className="text-chord-cyan text-xs font-bold tracking-wider uppercase">
                                            [{section.name}]
                                        </span>
                                        <span className="text-zinc-400 text-[10px] font-mono">
                                            {section.bars.length} chord{section.bars.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">Total</span>
                                <span className="text-chord-cyan text-xs font-mono font-bold">{totalChords} chords</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded border border-white/20 text-zinc-400 text-[10px] font-bold tracking-widest uppercase hover:border-white/40 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(editedTitle)}
                        className="flex-1 py-3 rounded bg-chord-cyan text-chord-dark text-[10px] font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(46,234,255,0.3)] hover:shadow-[0_0_30px_rgba(46,234,255,0.5)] active:scale-95 transition-all"
                    >
                        Save Song
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveOverlay;
