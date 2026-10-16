import React from 'react';

interface GameCoverArtProps {
  imageKey: string;
  title: string;
}

export const GameCoverArt: React.FC<GameCoverArtProps> = ({ imageKey, title }) => {
  // If it's a direct file path or web URL
  if (imageKey.startsWith('/') || imageKey.startsWith('http')) {
    return (
      <div className="relative w-full h-full overflow-hidden bg-neutral-900 flex items-center justify-center">
        <img
          src={imageKey}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // Curated authentic custom cover graphics matching original screenshots
  switch (imageKey) {
    case 'black_ops_zombies':
      return (
        <div className="relative w-full h-full bg-[#0a0708] flex flex-col items-center justify-center p-2 overflow-hidden border-r border-red-950/40">
          {/* Gritty bunker wall texture and eerie red light */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/40 via-black to-black opacity-80" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
          
          {/* Creepy glowing zombie eyes */}
          <div className="relative z-10 flex gap-4 my-auto">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 blur-[1px] animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 blur-[1px] animate-pulse shadow-[0_0_8px_#f59e0b]" />
          </div>

          {/* Authentic Logo */}
          <div className="relative z-20 text-center select-none mt-auto pb-1">
            <div className="text-[10px] font-extrabold tracking-widest text-neutral-300 uppercase leading-none font-sans">
              CALL OF DUTY
            </div>
            <div className="text-[13px] font-black tracking-tight text-white uppercase leading-tight font-sans drop-shadow-md">
              BLACK OPS
            </div>
            <div className="text-sm font-black tracking-wider text-red-600 uppercase font-sans drop-shadow-[0_2px_4px_rgba(225,29,72,0.8)] -mt-0.5">
              ZOMBIES
            </div>
          </div>
        </div>
      );

    case 'modern_warfare_2':
      return (
        <div className="relative w-full h-full bg-[#14120e] flex flex-col items-center justify-center p-2 overflow-hidden border-r border-amber-950/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-600/30 via-neutral-900 to-black" />
          {/* Tactical Soldier silhouette */}
          <div className="relative z-10 flex items-center justify-center w-12 h-14 opacity-85">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-amber-200/80">
              <path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zm-5 8v2h1v9h8v-9h1v-2l-2-2h-6l-2 2z" />
            </svg>
          </div>
          <div className="relative z-20 text-center select-none mt-auto pb-1">
            <div className="text-[9px] font-bold tracking-widest text-neutral-300 uppercase">
              CALL OF DUTY
            </div>
            <div className="text-[11px] font-black tracking-tighter text-emerald-400 uppercase drop-shadow">
              MODERN WARFARE 2
            </div>
          </div>
        </div>
      );

    case 'skate_3':
      return (
        <div className="relative w-full h-full bg-[#18191c] flex flex-col items-center justify-center p-2 overflow-hidden border-r border-orange-950/40">
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
          {/* Skateboard icon / jump */}
          <div className="relative z-10 w-12 h-12 flex items-center justify-center transform -rotate-12">
            <div className="w-12 h-4 rounded-full border-2 border-orange-500 bg-orange-600/30 shadow-[0_0_12px_rgba(249,115,22,0.5)] flex items-center justify-around px-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <div className="relative z-20 text-center select-none mt-auto pb-1">
            <span className="text-xl font-black italic tracking-tighter text-orange-500 drop-shadow">
              skate.
            </span>
            <span className="text-xl font-black italic text-white ml-0.5">3</span>
          </div>
        </div>
      );

    case 'simpsons_hit_and_run':
      return (
        <div className="relative w-full h-full bg-[#fed429] flex flex-col items-center justify-center p-2 overflow-hidden border-r border-yellow-700/40">
          <div className="absolute inset-0 bg-gradient-to-t from-sky-500 via-amber-400 to-yellow-300" />
          {/* Donut and car graphic */}
          <div className="relative z-10 w-11 h-11 rounded-full border-4 border-pink-500 bg-amber-100 flex items-center justify-center shadow-md">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
          </div>
          <div className="relative z-20 text-center select-none mt-auto pb-1 bg-black/60 px-2 py-0.5 rounded">
            <div className="text-[10px] font-black uppercase text-yellow-300 tracking-tight leading-tight">
              HIT & RUN
            </div>
            <div className="text-[8px] font-bold text-white uppercase tracking-wider">
              THE SIMPSONS
            </div>
          </div>
        </div>
      );

    case 'world_at_war_zombies':
      return (
        <div className="relative w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center p-2 overflow-hidden border-r border-neutral-800">
          <div className="absolute inset-0 bg-gradient-to-b from-stone-900 via-black to-red-950/40" />
          <div className="relative z-10 flex gap-3 my-auto">
            <div className="w-2 h-2 rounded-full bg-red-600 blur-[0.5px] shadow-[0_0_8px_#dc2626]" />
            <div className="w-2 h-2 rounded-full bg-red-600 blur-[0.5px] shadow-[0_0_8px_#dc2626]" />
          </div>
          <div className="relative z-20 text-center select-none mt-auto pb-1">
            <div className="text-[8px] font-extrabold tracking-widest text-neutral-400 uppercase">
              CALL OF DUTY
            </div>
            <div className="text-[10px] font-black text-stone-200 uppercase tracking-tighter">
              WORLD AT WAR
            </div>
            <div className="text-[12px] font-black text-red-600 tracking-wider font-serif">
              ZOMBIES
            </div>
          </div>
        </div>
      );

    case 'clustertruck':
      return (
        <div className="relative w-full h-full bg-[#0f172a] flex flex-col items-center justify-center p-2 overflow-hidden border-r border-sky-900/40">
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-950 via-amber-950/50 to-neutral-900" />
          {/* Flying truck box outline */}
          <div className="relative z-10 w-12 h-6 border-2 border-sky-400 bg-sky-500/20 rounded-xs transform -rotate-6 shadow-[0_0_10px_rgba(56,189,248,0.5)] flex items-center justify-center">
            <span className="text-[8px] font-black text-sky-200 uppercase tracking-wider">SEMI</span>
          </div>
          <div className="relative z-20 text-center select-none mt-auto pb-1">
            <div className="text-[12px] font-black uppercase text-sky-400 tracking-tight drop-shadow leading-tight">
              CLUSTER
            </div>
            <div className="text-[11px] font-black uppercase text-amber-400 tracking-wider leading-none">
              TRUCK
            </div>
          </div>
        </div>
      );

    case 'helltaker':
      return (
        <div className="relative w-full h-full bg-[#180a0e] flex flex-col items-center justify-center p-2 overflow-hidden border-r border-rose-950/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-rose-900/40 via-neutral-950 to-black" />
          {/* Demon horns and heart */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="text-xl">😈</div>
            <div className="w-2 h-2 rotate-45 bg-rose-600 mt-1 shadow-[0_0_6px_#e11d48]" />
          </div>
          <div className="relative z-20 text-center select-none mt-auto pb-1">
            <div className="text-[13px] font-black text-rose-500 uppercase tracking-widest font-mono drop-shadow">
              HELLTAKER
            </div>
          </div>
        </div>
      );

    case 'gta_vice_city':
      return (
        <div className="relative w-full h-full bg-[#1c0823] flex flex-col items-center justify-center p-2 overflow-hidden border-r border-pink-900/40">
          <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-900/40 via-purple-950 to-black" />
          <div className="relative z-10 text-center">
            <div className="text-lg">🌴</div>
          </div>
          <div className="relative z-20 text-center select-none mt-auto pb-1">
            <div className="text-[8px] font-extrabold text-neutral-300 uppercase tracking-widest">
              GRAND THEFT AUTO
            </div>
            <div className="text-[13px] font-black italic text-pink-500 uppercase tracking-tighter drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]">
              VICE CITY
            </div>
          </div>
        </div>
      );

    case 'peak':
      return (
        <div className="relative w-full h-full bg-[#2e1065] flex flex-col items-center justify-center p-2 overflow-hidden border-r border-purple-900/40">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-purple-900 to-pink-900/40" />
          <div className="relative z-10 text-center">
            <div className="text-lg">⛰️</div>
          </div>
          <div className="relative z-20 text-center select-none mt-auto pb-1">
            <div className="text-base font-black text-white uppercase tracking-widest font-sans drop-shadow">
              PEAK
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="relative w-full h-full bg-neutral-900 flex flex-col items-center justify-center p-2 border-r border-neutral-800">
          <span className="text-lg">🎮</span>
          <span className="text-[10px] font-bold text-white text-center uppercase tracking-wide truncate max-w-[90%]">
            {title}
          </span>
        </div>
      );
  }
};
