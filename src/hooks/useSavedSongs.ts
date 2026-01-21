import { useState, useEffect } from 'react';

export interface Section {
    name: string;
    bars: string[];
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    tempo: number;
    sections: Section[];
    key?: string;
    lastPlayed?: string;
}

export const useSavedSongs = () => {
    const [songs, setSongs] = useState<Song[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('stitch_chords_saved_songs');
        if (saved) {
            try {
                setSongs(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved songs', e);
            }
        }
    }, []);

    const saveSong = (song: Song) => {
        const updated = [...songs.filter(s => s.id !== song.id), song];
        setSongs(updated);
        localStorage.setItem('stitch_chords_saved_songs', JSON.stringify(updated));
    };

    const removeSong = (id: string) => {
        const updated = songs.filter(s => s.id !== id);
        setSongs(updated);
        localStorage.setItem('stitch_chords_saved_songs', JSON.stringify(updated));
    };

    return { songs, saveSong, removeSong };
};
