import React from 'react';
import { GameCategory } from '../types/game';

interface HeaderProps {
  currentCategory: GameCategory;
  onSelectCategory: (category: GameCategory) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
}) => {
  return (
    <header className="w-full bg-black border-b border-neutral-900 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element in display face) */}
        <a
          href="/"
          className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase whitespace-nowrap shrink-0 font-['Chakra_Petch',sans-serif] hover:text-cyan-400 transition-colors"
        >
          AERO<span className="text-cyan-400">GAMES</span>
        </a>

        {/* Zone 2: 4–5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider font-mono text-neutral-400">
          <button
            onClick={() => onSelectCategory('All')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer ${
              currentCategory === 'All' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : ''
            }`}
          >
            All Games
          </button>
          <button
            onClick={() => onSelectCategory('Zombies & Survival')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer ${
              currentCategory === 'Zombies & Survival' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : ''
            }`}
          >
            Zombies
          </button>
          <button
            onClick={() => onSelectCategory('Shooter & Action')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer ${
              currentCategory === 'Shooter & Action' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : ''
            }`}
          >
            Shooters
          </button>
          <button
            onClick={() => onSelectCategory('Open World & Driving')}
            className={`whitespace-nowrap shrink-0 hover:text-white transition-colors cursor-pointer ${
              currentCategory === 'Open World & Driving' ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : ''
            }`}
          >
            Open World
          </button>
        </nav>
      </div>
    </header>
  );
};
