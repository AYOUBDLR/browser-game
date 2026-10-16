import React, { useState, useEffect } from 'react';
import { GameItem } from '../types/game';
import { ArrowLeft, ExternalLink, Play, Maximize2, Minimize2, Volume2, VolumeX, Keyboard } from 'lucide-react';
import { sounds } from '../services/sound';
import { ZombieSurvivalGame } from './games/ZombieSurvivalGame';
import { GtaCityGame } from './games/GtaCityGame';
import { ClustertruckGame } from './games/ClustertruckGame';
import { HelltakerGame } from './games/HelltakerGame';
import { UltrakillArenaGame } from './games/UltrakillArenaGame';

const TARGET_REDIRECT_URL = 'https://apptrck.net/cl/i/mejdow';

interface GameLauncherPageProps {
  game: GameItem;
  onBack: () => void;
}

export const GameLauncherPage: React.FC<GameLauncherPageProps> = ({ game, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [showControlsGuide, setShowControlsGuide] = useState(false);

  const categoryBadge = game.shortCategory || (game.category.includes('Shooter') ? 'Shooter' : game.category.split(' ')[0]);

  // Handle ESC key to return
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPlaying) {
          setIsPlaying(false);
        } else {
          onBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, onBack]);

  const handleLaunchClick = () => {
    sounds.playLaunch();
  };

  const handleBack = () => {
    sounds.playClick();
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      onBack();
    }
  };

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const renderGameEngine = () => {
    switch (game.engine) {
      case 'zombie_survival':
        return <ZombieSurvivalGame mapName={game.title} onClose={() => setIsPlaying(false)} />;
      case 'gta_drive':
        return (
          <GtaCityGame
            title={game.title}
            theme={game.id === 'gta-vice-city' ? 'vice_city' : 'los_santos'}
          />
        );
      case 'clustertruck':
        return <ClustertruckGame />;
      case 'helltaker':
        return <HelltakerGame />;
      case 'ultrakill_arena':
      case 'halo_combat':
      default:
        return <UltrakillArenaGame title={game.title} />;
    }
  };

  // Determine wallpaper image
  const bannerSrc = game.bannerImage || (game.image.startsWith('/') || game.image.startsWith('http') ? game.image : null);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-[#ffbe1a] selection:text-black">
      {/* Top Header Bar strictly matching the uploaded screenshot */}
      <header className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between z-20">
        {/* Left: Back Arrow + Game Title */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2.5 text-white hover:text-neutral-100 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6 stroke-[2.5] transition-transform group-hover:-translate-x-1" />
          <span className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
            {game.title}
          </span>
        </button>

        {/* Right: Yellow Category Pill Badge */}
        <div className="flex items-center gap-3">
          {isPlaying && (
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full text-xs font-mono">
              <button
                onClick={toggleSound}
                className="p-1 text-white hover:text-[#ffbe1a] transition-colors cursor-pointer"
                title="Mute / Unmute Audio"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
              </button>
              <button
                onClick={() => setShowControlsGuide(!showControlsGuide)}
                className="p-1 text-white hover:text-[#ffbe1a] transition-colors cursor-pointer"
                title="View Key Controls"
              >
                <Keyboard className="w-4 h-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1 text-white hover:text-[#ffbe1a] transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          )}

          <div className="bg-[#ffbe1a] text-black px-4 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-black tracking-wide shadow-md uppercase select-none">
            {categoryBadge}
          </div>
        </div>
      </header>

      {/* Main Center Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-2 sm:py-6 flex flex-col items-center justify-center">
        {isPlaying ? (
          /* Active Playing Screen */
          <div className="w-full flex flex-col items-center">
            {showControlsGuide && (
              <div className="w-full max-w-4xl bg-black/90 border border-neutral-700 rounded-lg p-4 mb-3 text-xs font-mono text-neutral-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[#ffbe1a] font-bold">
                  <Keyboard className="w-4 h-4" /> CONTROLS:
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {game.controls.map((ctrl, i) => (
                    <span key={i}>
                      <kbd className="bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-600 text-white font-bold mr-1">
                        {ctrl.key}
                      </kbd>
                      {ctrl.action}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setShowControlsGuide(false)}
                  className="text-neutral-400 hover:text-white underline cursor-pointer"
                >
                  Hide
                </button>
              </div>
            )}

            <div className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-black/30 bg-black">
              {renderGameEngine()}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(false)}
                className="px-4 py-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Banner
              </button>
            </div>
          </div>
        ) : (
          /* The Exact Banner Card from Screenshot */
          <div className="w-full max-w-4xl aspect-[16/10] sm:aspect-[16/9] max-h-[560px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.45)] relative border border-cyan-500/20 group bg-black">
            {/* Background Artwork - Clickable to redirect */}
            {bannerSrc ? (
              <a
                href={TARGET_REDIRECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLaunchClick}
                className="relative block w-full h-full overflow-hidden bg-black flex items-center justify-center cursor-pointer"
                title={`Launch ${game.title}`}
              >
                <img
                  src={bannerSrc}
                  alt=""
                  aria-hidden="true"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover blur-md opacity-40 scale-105 pointer-events-none"
                />
                <img
                  src={bannerSrc}
                  alt={game.title}
                  referrerPolicy="no-referrer"
                  className="relative z-10 w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] transition-transform duration-700 group-hover:scale-[1.02]"
                />
                {/* Dark Vignette & Contrast Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />
              </a>
            ) : (
              <a
                href={TARGET_REDIRECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLaunchClick}
                className="block w-full h-full bg-[#181a1f] flex items-center justify-center relative overflow-hidden cursor-pointer"
                title={`Launch ${game.title}`}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-stone-900 via-neutral-900 to-black" />
                <div className="relative z-10 text-center p-6">
                  <div className="text-6xl mb-3">🎮</div>
                  <h2 className="text-3xl font-black uppercase text-white tracking-wider">
                    {game.title}
                  </h2>
                </div>
                {/* Dark Vignette & Contrast Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />
              </a>
            )}

            {/* Center Action Box: Yellow Circle Launch Button that redirects to the URL */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 sm:pb-14 z-20 px-4 pointer-events-none">
              <a
                href={TARGET_REDIRECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLaunchClick}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ffbe1a] hover:bg-[#ffc933] text-black flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.85)] hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer pointer-events-auto border-2 border-[#ffd043]/80 hover:shadow-[0_0_30px_rgba(255,190,26,0.6)]"
                title={`Launch ${game.title}`}
              >
                <ExternalLink className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.8]" />
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="w-full py-3 px-6 text-center text-xs font-mono text-neutral-500">
        <span>Click banner or yellow button to launch · Press ESC to return to catalog</span>
      </footer>
    </div>
  );
};
