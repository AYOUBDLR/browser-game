import React, { useState, useEffect, useMemo } from 'react';
import { GAMES_DATA } from './data/games';
import { GameItem, GameCategory } from './types/game';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { GameCard } from './components/GameCard';
import { GameLauncherPage } from './components/GameLauncherPage';
import { Gamepad2 } from 'lucide-react';

export default function App() {
  const [games] = useState<GameItem[]>(GAMES_DATA);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);

  // Hotkey listener for search focus '/'
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Category filter
      if (selectedCategory !== 'All') {
        if (game.category !== selectedCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = game.title.toLowerCase().includes(q);
        const matchesSubtitle = game.subtitle.toLowerCase().includes(q);
        const matchesTag = game.tags.some((t) => t.toLowerCase().includes(q));
        const matchesDesc = game.description.toLowerCase().includes(q);
        return matchesTitle || matchesSubtitle || matchesTag || matchesDesc;
      }

      return true;
    });
  }, [games, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <Header
        currentCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col">
        {/* Search Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalGames={filteredGames.length}
        />

        {/* 2-Column Game Cards Grid (Matches User Screenshots Exactly!) */}
        {filteredGames.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#0d0e14] border border-neutral-800 rounded-lg">
            <Gamepad2 className="w-12 h-12 text-neutral-600 mb-3" />
            <h3 className="text-lg font-bold text-white uppercase font-mono">No Games Found</h3>
            <p className="text-xs text-neutral-400 font-mono mt-1 mb-4">
              Try adjusting your search query or switching categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-cyan-400 font-mono text-xs rounded font-bold cursor-pointer"
            >
              RESET FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 lg:gap-5">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelectGame={setSelectedGame}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-900 bg-[#060608] py-6 px-4 text-center text-xs font-mono text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 AERO Web Games Hub · Built for smooth browser gameplay.</p>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Press <kbd className="px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 font-bold">/</kbd> to Search</span>
          </div>
        </div>
      </footer>

      {/* Full Page Game Launcher View matching the user screenshot */}
      {selectedGame ? (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <GameLauncherPage
            game={selectedGame}
            onBack={() => setSelectedGame(null)}
          />
        </div>
      ) : null}
    </div>
  );
}
