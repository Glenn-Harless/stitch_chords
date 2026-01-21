import React from 'react';

interface ExpansionMenuProps {
    onBack: () => void;
}

const ExpansionMenu: React.FC<ExpansionMenuProps> = ({ onBack }) => {
    const techniques = [
        { id: '01', char: 'A', name: 'PROLONGATION', desc: 'Sequence generator (Am -> Am7 -> Am9)' },
        { id: '02', char: 'B', name: 'PASSING CHORDS', desc: 'Insert chromatic targets' },
        { id: '03', char: 'C', name: 'MODAL SWAPS', desc: 'Parallel minor/major swaps' },
        { id: '04', char: 'D', name: 'DOMINANT DELAY', desc: 'V to Vsus4 transformations' },
        { id: '05', char: 'E', name: 'PEDAL BASS', desc: 'Drift bass under chord arrays' },
        { id: '06', char: 'F', name: 'ENERGY SCALING', desc: 'Adjust bar/beat durations' },
    ];

    return (
        <div className="bg-chord-dark text-slate-200 min-h-screen font-display flex flex-col overflow-hidden max-w-md mx-auto relative border-x border-white/5">
            <div className="scanline opacity-20" />

            {/* Top Navigation Bar */}
            <header className="border-b border-chord-cyan/20 bg-chord-dark px-4 pt-10 pb-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1 group"
                    >
                        <span className="material-symbols-outlined text-chord-cyan text-sm">arrow_back_ios</span>
                        <span className="text-xs font-bold tracking-widest text-chord-cyan/80 group-active:text-chord-cyan uppercase">ESC</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-chord-cyan animate-pulse"></div>
                        <h1 className="text-xs font-bold tracking-[0.2em] text-zinc-500 uppercase">System::Reference</h1>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col w-full">
                {/* Hero Header */}
                <div className="p-6 pt-8 pb-4">
                    <div className="border-l-2 border-chord-cyan pl-4">
                        <h2 className="text-2xl font-bold leading-none tracking-tighter text-white uppercase italic">
                            EXPANSION_TECHNIQUES
                        </h2>
                        <p className="text-[10px] mt-2 font-medium text-chord-cyan/60 tracking-[0.3em] uppercase">
                            Harmonic Utility v4.02
                        </p>
                    </div>
                </div>

                {/* List Section */}
                <nav className="flex-1 overflow-y-auto px-6 py-4 space-y-1 scrollbar-hide">
                    {techniques.map((tech) => (
                        <div
                            key={tech.id}
                            className="group flex items-center justify-between py-4 border-b border-white/5 cursor-pointer transition-all active:bg-chord-cyan/5"
                        >
                            <div className="flex items-baseline gap-4">
                                <span className="text-[10px] font-bold text-zinc-600">{tech.id}</span>
                                <p className="text-lg font-medium tracking-tight text-chord-cyan group-hover:translate-x-1 transition-transform uppercase">
                                    {tech.char}. {tech.name}
                                </p>
                            </div>
                            <span className="material-symbols-outlined text-chord-cyan opacity-0 group-hover:opacity-100 transition-opacity">chevron_right</span>
                        </div>
                    ))}
                </nav>

                {/* Visual Divider */}
                <div className="px-6 py-4">
                    <div className="w-full h-[1px] bg-white/10 relative">
                        <div className="absolute right-0 top-0 h-[3px] w-12 bg-chord-cyan -mt-[1px]"></div>
                    </div>
                </div>
            </main>

            {/* Footer Status Bar */}
            <footer className="bg-chord-dark/80 backdrop-blur-sm border-t border-chord-cyan/10 px-6 py-6 pb-8">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase">Status:</span>
                            <span className="text-[9px] font-bold tracking-widest text-chord-cyan uppercase">Ready_to_load</span>
                        </div>
                        <p className="text-[8px] font-medium text-zinc-600 tracking-tighter uppercase font-mono">LOC: MEM_SECTOR_0x7F // CORE_REF_ID: 9912</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-600">6_TECHNIQUES_LOADED</p>
                        <div className="flex gap-0.5 justify-end mt-1">
                            <div className="size-1 bg-chord-cyan"></div>
                            <div className="size-1 bg-chord-cyan"></div>
                            <div className="size-1 bg-chord-cyan"></div>
                            <div className="size-1 bg-chord-cyan/20"></div>
                            <div className="size-1 bg-chord-cyan/20"></div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ExpansionMenu;
