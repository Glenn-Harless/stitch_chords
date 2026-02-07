import React, { useState } from 'react';
import artistsData from '../data/artists.json';

interface ArtistListProps {
    onBack: () => void;
    onSelectArtist: (id: string) => void;
}

const ArtistList: React.FC<ArtistListProps> = ({ onBack, onSelectArtist }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredArtists = artistsData.artists.filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden max-w-md mx-auto border-x border-white/5 bg-chord-dark">
            <div className="scanline" />

            {/* Header */}
            <header className="pt-12 px-6 pb-4">
                <div className="flex items-center justify-between mb-8">
                    <span
                        onClick={onBack}
                        className="text-chord-cyan text-xs font-bold tracking-widest uppercase cursor-pointer hover:opacity-80 transition-opacity"
                    >
                        &lt; BACK
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono tracking-tighter">REF_V2.0.4</span>
                </div>
                <h1 className="text-4xl font-bold text-white tracking-[0.2em] uppercase mb-2 leading-none">
                    Artists
                </h1>
                <div className="h-1 w-12 bg-chord-cyan"></div>
            </header>

            {/* Search Bar */}
            <div className="px-6 py-6">
                <div className="relative group">
                    <input
                        className="w-full bg-transparent border-t-0 border-x-0 border-b border-zinc-800 focus:border-chord-cyan focus:ring-0 text-chord-cyan placeholder:text-zinc-700 text-lg uppercase tracking-widest py-2 px-0 transition-colors duration-300 font-medium"
                        placeholder="SEARCH_ARTIST"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Artist List */}
            <main className="flex-1 overflow-y-auto px-6 pb-20 scrollbar-hide">
                <div className="flex flex-col">
                    {filteredArtists.map(artist => (
                        <div
                            key={artist.id}
                            onClick={() => onSelectArtist(artist.id)}
                            className="py-2 border-b border-zinc-900 cursor-pointer transition-all hover:bg-chord-cyan/5 active:border-l-4 active:border-chord-cyan active:bg-chord-cyan/10"
                        >
                            <div className="flex items-baseline justify-between group">
                                <span className="text-2xl font-medium tracking-tight uppercase py-4 group-hover:text-chord-cyan transition-colors">
                                    {artist.name}
                                </span>
                                <span className="text-[10px] text-zinc-600 font-mono group-hover:text-chord-cyan transition-colors uppercase">
                                    {artist.progressions.length.toString().padStart(2, '0')}_PROG
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Spacer for scrolling comfort */}
                    <div className="h-12"></div>
                </div>
            </main>

            {/* Footer status bar info */}
            <footer className="p-4 bg-chord-dark border-t border-zinc-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-chord-cyan animate-pulse"></div>
                    <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Syncing_Lib</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                    {filteredArtists.length.toString().padStart(2, '0')}_ARTISTS_FOUND
                </div>
            </footer>
        </div>
    );
};

export default ArtistList;
