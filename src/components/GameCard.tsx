import React from 'react';
import { GameItem } from '../types/game';
import { GameCoverArt } from './GameCoverArt';
import { sounds } from '../services/sound';

interface GameCardProps {
  game: GameItem;
  onSelectGame: (game: GameItem) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelectGame }) => {
  const handleMouseEnter = () => {
    sounds.playHover();
  };

  const handleClick = () => {
    sounds.playLaunch();
    onSelectGame(game);
  };

  // If the game has a full card image (direct web URL)
  if (game.image.startsWith('http')) {
    return (
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className="group relative w-full aspect-[700/220] overflow-hidden cursor-pointer select-none bg-black border border-cyan-400/40 hover:border-cyan-300 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
      >
        {/* Top and Bottom Cyan Accent Lines */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-90 group-hover:opacity-100 z-30 transition-opacity" />
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 group-hover:opacity-100 z-30 transition-opacity" />

        <img
          src={game.image}
          alt={`${game.title} - ${game.subtitle}`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="sr-only">{game.title} - {game.subtitle}</span>
      </div>
    );
  }

  // Fallback layout for games with split cover art + title/subtitle
  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className="group relative flex flex-row items-stretch aspect-[700/220] min-h-[120px] w-full overflow-hidden cursor-pointer select-none bg-black border border-cyan-400/40 hover:border-cyan-300 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
    >
      {/* Top and Bottom Cyan Accent Lines */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-90 group-hover:opacity-100 z-30 transition-opacity" />
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 group-hover:opacity-100 z-30 transition-opacity" />

      {/* Left Thumbnail Cover Art Box */}
      <div className="w-[120px] sm:w-[135px] md:w-[155px] shrink-0 h-full relative z-10 border-r border-black/40">
        <GameCoverArt imageKey={game.image} title={game.title} />
      </div>

      {/* Right Content Pane with Blurred Atmospheric Aura Backdrop */}
      <div
        className={`relative flex-1 h-full px-3.5 py-3 sm:px-5 sm:py-3.5 flex flex-col justify-between overflow-hidden z-20 ${game.theme.backdropGradient}`}
      >
        {/* Ambient blurred color glow overlay inside card */}
        <div
          className="absolute -right-6 -top-6 w-36 h-36 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity pointer-events-none"
          style={{ backgroundColor: game.theme.primaryColor }}
        />

        {/* Top: Game Title */}
        <div className="relative z-10 pr-1">
          <h3 className="text-white font-black text-sm sm:text-base md:text-[18px] tracking-wide uppercase leading-tight font-sans drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            {game.title}
          </h3>
        </div>

        {/* Bottom: Feature Subtitle */}
        <div className="relative z-10 pr-1">
          <p className="text-white font-black text-[11px] sm:text-xs md:text-[13px] uppercase tracking-wide leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] line-clamp-2">
            {game.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
