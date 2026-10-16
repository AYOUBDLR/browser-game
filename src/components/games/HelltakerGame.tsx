import React, { useState } from 'react';
import { sounds } from '../../services/sound';
import { RotateCcw, Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Cell {
  type: 'empty' | 'wall' | 'stone' | 'skeleton' | 'spikes' | 'demon' | 'key' | 'chest';
}

const INITIAL_MAP: string[] = [
  'WWWWWWWWWW',
  'W...S...DW',
  'W.B.WW..WW',
  'W...K....W',
  'WW.B.S..WW',
  'W..P....WW',
  'WWWWWWWWWW',
];

export const HelltakerGame: React.FC = () => {
  const [stepsLeft, setStepsLeft] = useState(23);
  const [playerPos, setPlayerPos] = useState({ r: 5, c: 3 });
  const [grid, setGrid] = useState<string[][]>(() => INITIAL_MAP.map((row) => row.split('')));
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [demonName, setDemonName] = useState('Modeus, the Lustful Demon');
  const [won, setWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const resetGame = () => {
    setStepsLeft(23);
    setPlayerPos({ r: 5, c: 3 });
    setGrid(INITIAL_MAP.map((row) => row.split('')));
    setDialogueOpen(false);
    setWon(false);
    setGameOver(false);
  };

  const movePlayer = (dr: number, dc: number) => {
    if (gameOver || won || dialogueOpen) return;

    const newR = playerPos.r + dr;
    const newC = playerPos.c + dc;
    const currentGrid = grid.map((row) => [...row]);

    const target = currentGrid[newR]?.[newC];
    if (!target || target === 'W') {
      sounds.playClick();
      return;
    }

    // Push stone block
    if (target === 'B') {
      const pushR = newR + dr;
      const pushC = newC + dc;
      if (currentGrid[pushR]?.[pushC] === '.') {
        currentGrid[pushR][pushC] = 'B';
        currentGrid[newR][newC] = '.';
        sounds.playHover();
      } else {
        return; // blocked
      }
    }

    // Kick skeleton
    if (target === 'S') {
      const kickR = newR + dr;
      const kickC = newC + dc;
      sounds.playZombieHit();
      if (currentGrid[kickR]?.[kickC] === '.') {
        currentGrid[kickR][kickC] = 'S';
      }
      currentGrid[newR][newC] = '.';
    }

    // Reached Demon Girl
    if (target === 'D') {
      setDialogueOpen(true);
      sounds.playRoundStart();
      confetti({ particleCount: 50, spread: 70 });
      return;
    }

    // Move player
    currentGrid[playerPos.r][playerPos.c] = '.';
    currentGrid[newR][newC] = 'P';
    setGrid(currentGrid);
    setPlayerPos({ r: newR, c: newC });

    const newSteps = stepsLeft - 1;
    setStepsLeft(newSteps);
    sounds.playHover();

    if (newSteps <= 0) {
      setGameOver(true);
      sounds.playZombieHit();
    }
  };

  const handleDialogueChoice = (success: boolean) => {
    if (success) {
      setWon(true);
      setDialogueOpen(false);
      confetti({ particleCount: 100, spread: 90 });
    } else {
      setGameOver(true);
      setDialogueOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-[#13070b] text-white rounded-lg overflow-hidden border border-rose-950/60 shadow-2xl p-4">
      {/* Top HUD */}
      <div className="w-full bg-neutral-950 px-4 py-2 flex items-center justify-between border-b border-rose-900/40 text-xs sm:text-sm font-mono mb-4">
        <div className="flex items-center gap-2">
          <span className="text-rose-400 font-bold">WILLPOWER / STEPS:</span>
          <span className={`text-lg font-black ${stepsLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {stepsLeft}
          </span>
        </div>
        <button
          onClick={resetGame}
          className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-700/50 rounded text-rose-200 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RESET LEVEL
        </button>
      </div>

      {/* Grid Canvas */}
      <div className="relative bg-[#1f0910] p-4 rounded-lg border border-rose-900/40">
        <div className="grid grid-cols-10 gap-1.5">
          {grid.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isPlayer = playerPos.r === rIdx && playerPos.c === cIdx;
              let content = null;
              let bg = 'bg-[#2a0e18]';

              if (cell === 'W') {
                bg = 'bg-[#120509] border border-rose-950';
              } else if (cell === 'B') {
                bg = 'bg-stone-700 border border-stone-500 shadow-md';
                content = <span className="text-xs font-bold text-stone-300">🗿</span>;
              } else if (cell === 'S') {
                bg = 'bg-red-950 border border-red-800';
                content = <span className="text-xs">💀</span>;
              } else if (cell === 'D') {
                bg = 'bg-rose-900/80 border border-rose-500 animate-pulse';
                content = <span className="text-sm">👸</span>;
              }

              if (isPlayer) {
                bg = 'bg-neutral-900 border-2 border-rose-500 shadow-[0_0_10px_#e11d48]';
                content = <span className="text-sm">🤵</span>;
              }

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className={`w-9 h-9 sm:w-12 sm:h-12 rounded flex items-center justify-center font-bold text-sm ${bg}`}
                >
                  {content}
                </div>
              );
            })
          )}
        </div>

        {/* Onscreen Controls for Touch & Mouse */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            onClick={() => movePlayer(-1, 0)}
            className="w-12 h-10 bg-neutral-900 hover:bg-neutral-800 border border-rose-800 rounded font-black text-rose-400 cursor-pointer"
          >
            ▲
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => movePlayer(0, -1)}
              className="w-12 h-10 bg-neutral-900 hover:bg-neutral-800 border border-rose-800 rounded font-black text-rose-400 cursor-pointer"
            >
              ◀
            </button>
            <button
              onClick={() => movePlayer(1, 0)}
              className="w-12 h-10 bg-neutral-900 hover:bg-neutral-800 border border-rose-800 rounded font-black text-rose-400 cursor-pointer"
            >
              ▼
            </button>
            <button
              onClick={() => movePlayer(0, 1)}
              className="w-12 h-10 bg-neutral-900 hover:bg-neutral-800 border border-rose-800 rounded font-black text-rose-400 cursor-pointer"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Dialogue Encounter Modal */}
        {dialogueOpen && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-lg p-6 flex flex-col items-center justify-center text-center z-40">
            <div className="text-3xl mb-2">😈 ❤️</div>
            <h3 className="text-xl font-black text-rose-400 uppercase tracking-widest">{demonName}</h3>
            <p className="text-neutral-300 font-serif italic text-sm my-4 max-w-md">
              "You traversed the fiery pits just for me? What could you possibly offer a demon of the abyss?"
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              <button
                onClick={() => handleDialogueChoice(true)}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-600 rounded font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                1. "I made fresh chocolate pancakes and have an Xbox 360."
              </button>
              <button
                onClick={() => handleDialogueChoice(false)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                2. "I demand you surrender your demonic soul!"
              </button>
            </div>
          </div>
        )}

        {/* Won State */}
        {won && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-lg p-6 flex flex-col items-center justify-center text-center z-40">
            <h2 className="text-3xl font-black text-amber-400 uppercase tracking-widest">
              DEMON RECRUITED! 🥞
            </h2>
            <p className="text-neutral-300 text-sm my-3 font-mono">
              SUCCESS: Modeus joined your harem. You shared delicious pancakes.
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 bg-amber-500 text-black font-black uppercase rounded text-xs tracking-wider cursor-pointer"
            >
              PLAY AGAIN
            </button>
          </div>
        )}

        {/* Out of steps Game Over */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-lg p-6 flex flex-col items-center justify-center text-center z-40">
            <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest">
              OUT OF WILLPOWER
            </h2>
            <p className="text-neutral-400 text-sm my-3 font-mono">The underworld consumed your soul.</p>
            <button
              onClick={resetGame}
              className="px-6 py-2.5 bg-red-600 text-white font-black uppercase rounded text-xs tracking-wider cursor-pointer"
            >
              RETRY
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
