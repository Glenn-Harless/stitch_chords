import { useState } from 'react'
import { useSavedSongs } from './hooks/useSavedSongs'
import chordsData from './data/chords.json'
import Dashboard from './components/Dashboard'
import ActivePlayingView from './components/ActivePlayingView'
import SavedSongs from './components/SavedSongs'
import ArtistList from './components/ArtistList'
import ArtistLibrary from './components/ArtistLibrary'

type ViewType = 'dashboard' | 'active' | 'library' | 'utility' | 'artists' | 'artist-detail'

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null)
  const { songs } = useSavedSongs()

  // Default to first progression or null
  const [activeSong, setActiveSong] = useState<any>(chordsData.progressions[0])

  const handleArtistSelect = (id: string) => {
    setSelectedArtistId(id)
    setCurrentView('artist-detail')
  }

  const handleAddProgression = (progression: any) => {
    // Transform artist progression format to the format expected by ActivePlayingView
    const formattedSong = {
      id: progression.id,
      title: progression.name,
      artist: selectedArtistId?.toUpperCase() || 'UNKNOWN',
      tempo: progression.bpm,
      sections: [
        {
          name: progression.suggested_section || 'VERSE',
          bars: progression.chords.map((c: any) => c.root + (c.quality !== 'm' ? c.quality : ''))
        }
      ]
    }
    setActiveSong(formattedSong)
    setCurrentView('active')
  }

  return (
    <div className="min-h-screen bg-chord-dark text-white font-display overflow-x-hidden">
      {currentView === 'dashboard' && (
        <Dashboard
          onSelect={() => setCurrentView('active')}
          songsCount={songs.length}
          onNavigate={(view) => setCurrentView(view)}
        />
      )}

      {currentView === 'active' && (
        <ActivePlayingView
          song={activeSong}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'library' && (
        <SavedSongs
          songs={songs}
          onSelect={() => setCurrentView('active')}
          onNew={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'artists' && (
        <ArtistList
          onBack={() => setCurrentView('dashboard')}
          onSelectArtist={handleArtistSelect}
        />
      )}

      {currentView === 'artist-detail' && selectedArtistId && (
        <ArtistLibrary
          artistId={selectedArtistId}
          onBack={() => setCurrentView('artists')}
          onAddProgression={handleAddProgression}
        />
      )}

      {currentView === 'utility' && (
        <div className="p-8 text-center opacity-40 min-h-screen flex flex-col items-center justify-center">
          <span className="terminal-border p-4 rounded-full mb-4">
            <span className="material-symbols-outlined text-4xl text-chord-cyan animate-spin-slow">settings</span>
          </span>
          <h2 className="text-sm font-mono uppercase tracking-[0.4em]">Utility_Module_Offline</h2>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="mt-8 text-chord-cyan text-[10px] font-mono hover:underline"
          >
            RETURN_TO_BASE
          </button>
        </div>
      )}
    </div>
  )
}

export default App
