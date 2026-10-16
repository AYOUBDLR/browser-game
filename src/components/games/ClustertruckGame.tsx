import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../../services/sound';
import { RotateCcw, Clock, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Truck {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
}

export const ClustertruckGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [slowMo, setSlowMo] = useState(false);
  const [slowMoEnergy, setSlowMoEnergy] = useState(100);

  const stateRef = useRef({
    player: {
      x: 200,
      y: 280,
      vy: 0,
      isGrounded: true,
      jumpsLeft: 2,
    },
    trucks: [] as Truck[],
    keys: { left: false, right: false, space: false, shift: false },
    lastSpawn: 0,
  });

  const restartGame = () => {
    setIsGameOver(false);
    setScore(0);
    setDistance(0);
    setSlowMoEnergy(100);
    stateRef.current.player = {
      x: 200,
      y: 280,
      vy: 0,
      isGrounded: true,
      jumpsLeft: 2,
    };
    stateRef.current.trucks = [
      { x: 120, y: 320, width: 140, height: 45, speed: 220, color: '#0284c7' },
      { x: 300, y: 320, width: 140, height: 45, speed: 210, color: '#f59e0b' },
      { x: 480, y: 320, width: 140, height: 45, speed: 230, color: '#e11d48' },
    ];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    restartGame();

    let animationFrameId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.left = true;
      if (k === 'd' || e.key === 'ArrowRight') stateRef.current.keys.right = true;
      if (e.key === ' ' || k === 'w' || e.key === 'ArrowUp') {
        e.preventDefault();
        const p = stateRef.current.player;
        if (p.jumpsLeft > 0) {
          p.vy = -420;
          p.isGrounded = false;
          p.jumpsLeft -= 1;
          sounds.playHover();
        }
      }
      if (e.key === 'Shift') {
        stateRef.current.keys.shift = true;
        setSlowMo(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.left = false;
      if (k === 'd' || e.key === 'ArrowRight') stateRef.current.keys.right = false;
      if (e.key === 'Shift') {
        stateRef.current.keys.shift = false;
        setSlowMo(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      let dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = stateRef.current;
      const { player, keys } = state;
      const width = canvas.width;
      const height = canvas.height;

      // Slow-mo time dilation
      if (keys.shift && slowMoEnergy > 0) {
        dt *= 0.35;
        setSlowMoEnergy((e) => Math.max(0, e - dt * 40));
      } else {
        setSlowMo(false);
        setSlowMoEnergy((e) => Math.min(100, e + dt * 15));
      }

      if (!isGameOver) {
        setDistance((d) => d + Math.round(200 * dt));

        // Horizontal movement
        const moveSpeed = 340;
        if (keys.left) player.x -= moveSpeed * dt;
        if (keys.right) player.x += moveSpeed * dt;

        // Gravity
        const gravity = 900;
        player.vy += gravity * dt;
        player.y += player.vy * dt;

        // Truck Spawning
        if (currentTime - state.lastSpawn > 1100) {
          state.lastSpawn = currentTime;
          const colors = ['#0284c7', '#ea580c', '#e11d48', '#16a34a', '#8b5cf6'];
          state.trucks.push({
            x: width + 50,
            y: 280 + (Math.random() - 0.5) * 80,
            width: 130 + Math.random() * 40,
            height: 44,
            speed: 210 + Math.random() * 80,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }

        // Update Trucks
        let onAnyTruck = false;
        for (let i = state.trucks.length - 1; i >= 0; i--) {
          const t = state.trucks[i];
          t.x -= t.speed * dt;

          // Check landing on top of truck
          const playerBottom = player.y + 14;
          const playerLeft = player.x - 10;
          const playerRight = player.x + 10;

          if (
            playerRight > t.x &&
            playerLeft < t.x + t.width &&
            playerBottom >= t.y &&
            playerBottom <= t.y + 18 &&
            player.vy >= 0
          ) {
            player.y = t.y - 14;
            player.vy = 0;
            player.isGrounded = true;
            player.jumpsLeft = 2;
            player.x -= t.speed * dt; // carried by truck
            onAnyTruck = true;
            setScore((s) => s + Math.round(dt * 100));
          }

          if (t.x + t.width < -100) {
            state.trucks.splice(i, 1);
          }
        }

        // Fell onto lava ground!
        if (player.y > height - 40 || player.x < -20 || player.x > width + 20) {
          setIsGameOver(true);
          sounds.playZombieHit();
        }
      }

      // --- RENDER PASS ---
      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0c4a6e');
      skyGrad.addColorStop(0.6, '#38bdf8');
      skyGrad.addColorStop(1, '#f97316');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant desert canyon silhouettes
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.moveTo(0, height - 120);
      ctx.lineTo(150, height - 200);
      ctx.lineTo(350, height - 150);
      ctx.lineTo(600, height - 230);
      ctx.lineTo(width, height - 130);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fill();

      // Lava highway floor
      const lavaGrad = ctx.createLinearGradient(0, height - 60, 0, height);
      lavaGrad.addColorStop(0, '#ef4444');
      lavaGrad.addColorStop(0.5, '#dc2626');
      lavaGrad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = lavaGrad;
      ctx.fillRect(0, height - 50, width, 50);

      // Lava bubbling particles
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < 15; i++) {
        const bx = (Math.sin(currentTime * 0.003 + i) * 0.5 + 0.5) * width;
        ctx.fillRect(bx, height - 45 + (i % 5) * 6, 4, 4);
      }

      // Render Trucks
      for (const t of state.trucks) {
        ctx.save();
        // Truck trailer body
        ctx.fillStyle = t.color;
        ctx.fillRect(t.x, t.y, t.width, t.height);

        // Cab
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(t.x, t.y + 10, 24, t.height - 10);

        // Wheels
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(t.x + 16, t.y + t.height + 4, 6, 0, Math.PI * 2);
        ctx.arc(t.x + t.width - 20, t.y + t.height + 4, 6, 0, Math.PI * 2);
        ctx.fill();

        // Highlight stripe
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(t.x, t.y, t.width, 4);

        ctx.restore();
      }

      // Render Player
      ctx.save();
      ctx.translate(player.x, player.y);

      // Parkour runner stick figure / stylized hero
      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, -6, 7, 0, Math.PI * 2); // Head
      ctx.fill();

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 10); // Body
      ctx.moveTo(0, 10);
      ctx.lineTo(-6, 18); // Leg 1
      ctx.moveTo(0, 10);
      ctx.lineTo(6, 18); // Leg 2
      ctx.moveTo(0, 4);
      ctx.lineTo(-8, 8); // Arm 1
      ctx.moveTo(0, 4);
      ctx.lineTo(8, 8); // Arm 2
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameOver, slowMoEnergy]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-black text-white rounded-lg overflow-hidden border border-sky-900/50 shadow-2xl">
      {/* Top HUD */}
      <div className="w-full bg-neutral-950 px-4 py-2.5 flex items-center justify-between border-b border-neutral-800 text-xs sm:text-sm font-mono">
        <div className="flex items-center gap-4">
          <div>
            SCORE: <span className="text-amber-400 font-black">{score}</span>
          </div>
          <div>
            DISTANCE: <span className="text-sky-400 font-black">{distance}m</span>
          </div>
        </div>

        {/* Slow-mo meter */}
        <div className="flex items-center gap-2">
          <Clock className={`w-3.5 h-3.5 ${slowMo ? 'text-amber-400 animate-spin' : 'text-neutral-400'}`} />
          <span className="text-xs">SLOW-MO (SHIFT)</span>
          <div className="w-24 h-2 bg-neutral-800 rounded overflow-hidden">
            <div className="h-full bg-amber-400" style={{ width: `${slowMoEnergy}%` }} />
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full aspect-[4/3] max-h-[500px] bg-neutral-900 flex items-center justify-center">
        <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-contain" />

        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-50">
            <h2 className="text-4xl sm:text-6xl font-black text-red-500 uppercase tracking-widest font-['Chakra_Petch',sans-serif] drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]">
              YOU TOUCHED THE LAVA!
            </h2>
            <p className="text-neutral-300 font-mono mt-2 text-sm">
              FINAL SCORE: {score} · DISTANCE: {distance}m
            </p>
            <button
              onClick={restartGame}
              className="mt-6 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-black font-black text-sm tracking-wider uppercase rounded font-mono flex items-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              TRY AGAIN
            </button>
          </div>
        )}
      </div>

      <div className="w-full bg-neutral-950 px-4 py-2 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono flex justify-between">
        <span>A / D: Strafe · SPACE: Jump / Double Jump · SHIFT: Slow Motion</span>
        <span className="text-amber-400">DON'T TOUCH THE GROUND!</span>
      </div>
    </div>
  );
};
