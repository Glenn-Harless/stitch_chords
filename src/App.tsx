import { useState } from 'react'
import { useSavedSongs } from './hooks/useSavedSongs'
import chordsData from './data/chords.json'
import Dashboard from './components/Dashboard'
import ActivePlayingView from './components/ActivePlayingView'
import SavedSongs from './components/SavedSongs'
import ArtistList from './components/ArtistList'
import ArtistLibrary from './components/ArtistLibrary'
import ExpansionMenu from './components/ExpansionMenu'
import ChordScratchpad from './components/ChordScratchpad'

type ViewType = 'dashboard' | 'active' | 'library' | 'utility' | 'artists' | 'artist-detail' | 'expansion' | 'scratchpad'

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null)
  const { songs, saveSong } = useSavedSongs()
  const [editingTarget, setEditingTarget] = useState<{ sIdx: number, bIdx: number } | null>(null)

  // Default to first progression or null
  const [activeSong, setActiveSong] = useState<any>(chordsData.progressions[0])

  const handleArtistSelect = (id: string) => {
    setSelectedArtistId(id)
    setCurrentView('artist-detail')
  }

  const handleAddProgression = (progression: any) => {
    const sectionName = progression.suggested_section || 'VERSE'
    const bars = progression.chords.map((c: any) => c.root + (c.quality || ''))

    setActiveSong((prev: any) => {
      // If we are editing a specific chord from Hot Swap
      if (editingTarget) {
        const newSections = [...prev.sections]
        newSections[editingTarget.sIdx].bars[editingTarget.bIdx] = bars[0] // Assume first chord from scratchpad
        setEditingTarget(null)
        return { ...prev, sections: newSections }
      }

      // Normal path: append progression
      const newSections = prev.sections ? [...prev.sections] : []
      const existingSectionIdx = newSections.findIndex((s: any) => s.name === sectionName)

      if (existingSectionIdx >= 0) {
        newSections[existingSectionIdx] = {
          ...newSections[existingSectionIdx],
          bars: [...newSections[existingSectionIdx].bars, ...bars]
        }
      } else {
        newSections.push({ name: sectionName, bars })
      }

      return {
        ...prev,
        title: progression.name || prev.title,
        artist: selectedArtistId?.toUpperCase() || prev.artist,
        sections: newSections
      }
    })

    setCurrentView('active')
  }

  const handleEditChord = (_chord: string, sIdx: number, bIdx: number) => {
    setEditingTarget({ sIdx, bIdx })
    setCurrentView('scratchpad')
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
          onSave={saveSong}
          onEditChord={handleEditChord}
          onUpdateSections={(newSections) => setActiveSong({ ...activeSong, sections: newSections })}
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

      {currentView === 'expansion' && (
        <ExpansionMenu
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'scratchpad' && (
        <ChordScratchpad
          onBack={() => setCurrentView('dashboard')}
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
