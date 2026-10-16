import React from 'react';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalGames: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  totalGames,
}) => {
  return (
    <div className="w-full flex flex-col gap-4 mb-6">
      {/* Search & Game Counter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search games, maps, zombies... (Press '/' to focus)"
            className="w-full bg-[#0d0d11] border border-neutral-800 focus:border-cyan-400 rounded-md pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 font-mono outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Game Counter */}
        <div className="text-xs font-mono text-neutral-400 tabular-nums">
          <span className="text-cyan-400 font-bold">{totalGames}</span> TITLES
        </div>
      </div>
    </div>
  );
};

