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
    lastOpened?: number; // Unix timestamp
    createdAt?: number;  // Unix timestamp
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
        const existing = songs.find(s => s.id === song.id);
        const now = Date.now();
        const songToSave: Song = {
            ...song,
            createdAt: existing?.createdAt || song.createdAt || now,
            lastOpened: now,
        };
        const updated = [...songs.filter(s => s.id !== song.id), songToSave];
        setSongs(updated);
        localStorage.setItem('stitch_chords_saved_songs', JSON.stringify(updated));
    };

    const updateLastOpened = (id: string) => {
        const song = songs.find(s => s.id === id);
        if (song) {
            const updated = songs.map(s =>
                s.id === id ? { ...s, lastOpened: Date.now() } : s
            );
            setSongs(updated);
            localStorage.setItem('stitch_chords_saved_songs', JSON.stringify(updated));
        }
    };

    const removeSong = (id: string) => {
        const updated = songs.filter(s => s.id !== id);
        setSongs(updated);
        localStorage.setItem('stitch_chords_saved_songs', JSON.stringify(updated));
    };

    return { songs, saveSong, updateLastOpened, removeSong };
};
