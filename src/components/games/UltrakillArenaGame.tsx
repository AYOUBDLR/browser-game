import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../../services/sound';
import { RotateCcw, Zap, Flame, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UltrakillArenaGameProps {
  title?: string;
}

interface Enemy {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  type: 'filth' | 'stray';
}

const STYLE_RANKS = [
  { name: 'DESTRUCTIVE', color: 'text-blue-400', threshold: 100 },
  { name: 'CHAOTIC', color: 'text-green-400', threshold: 300 },
  { name: 'BRUTAL', color: 'text-yellow-400', threshold: 600 },
  { name: 'ANARCHIC', color: 'text-orange-400', threshold: 1000 },
  { name: 'SUPREME', color: 'text-rose-400', threshold: 1600 },
  { name: 'SSADISTIC', color: 'text-red-500', threshold: 2400 },
  { name: 'ULTRAKILL', color: 'text-yellow-300 animate-pulse', threshold: 3500 },
];

export const UltrakillArenaGame: React.FC<UltrakillArenaGameProps> = ({
  title = 'ULTRAKILL: CYBER ARENA',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hp, setHp] = useState(100);
  const [stylePoints, setStylePoints] = useState(0);
  const [rankIndex, setRankIndex] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [dashCooldown, setDashCooldown] = useState(100);

  const stateRef = useRef({
    px: 400,
    py: 300,
    vx: 0,
    vy: 0,
    angle: 0,
    isDashing: false,
    keys: { w: false, a: false, s: false, d: false, shift: false },
    mouse: { x: 400, y: 300, down: false },
    enemies: [] as Enemy[],
    bullets: [] as { x: number; y: number; vx: number; vy: number; damage: number }[],
    bloodPools: [] as { x: number; y: number; alpha: number }[],
    coins: [] as { x: number; y: number; vy: number; alpha: number }[],
    lastShot: 0,
    lastSpawn: 0,
  });

  const restartGame = () => {
    setHp(100);
    setStylePoints(0);
    setRankIndex(0);
    setIsGameOver(false);
    stateRef.current.px = 400;
    stateRef.current.py = 300;
    stateRef.current.enemies = [];
    stateRef.current.bullets = [];
    stateRef.current.bloodPools = [];
    stateRef.current.coins = [];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w') stateRef.current.keys.w = true;
      if (k === 'a') stateRef.current.keys.a = true;
      if (k === 's') stateRef.current.keys.s = true;
      if (k === 'd') stateRef.current.keys.d = true;
      if (e.key === 'Shift') {
        // Dash
        const state = stateRef.current;
        if (!state.isDashing) {
          state.isDashing = true;
          sounds.playHover();
          setTimeout(() => {
            state.isDashing = false;
          }, 180);
        }
      }
      if (k === 'f' || k === 'q') {
        // Toss Coin
        const state = stateRef.current;
        state.coins.push({
          x: state.px + Math.cos(state.angle) * 30,
          y: state.py + Math.sin(state.angle) * 30,
          vy: -200,
          alpha: 1,
        });
        sounds.playCoin();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w') stateRef.current.keys.w = false;
      if (k === 'a') stateRef.current.keys.a = false;
      if (k === 's') stateRef.current.keys.s = false;
      if (k === 'd') stateRef.current.keys.d = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      stateRef.current.mouse.x = (e.clientX - rect.left) * scaleX;
      stateRef.current.mouse.y = (e.clientY - rect.top) * scaleY;
    };

    const handleMouseDown = () => {
      stateRef.current.mouse.down = true;
    };

    const handleMouseUp = () => {
      stateRef.current.mouse.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      if (!isGameOver) {
        // Movement
        const speed = state.isDashing ? 750 : 320;
        let dx = 0;
        let dy = 0;
        if (state.keys.w) dy -= 1;
        if (state.keys.s) dy += 1;
        if (state.keys.a) dx -= 1;
        if (state.keys.d) dx += 1;

        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        state.px = Math.max(30, Math.min(width - 30, state.px + dx * speed * dt));
        state.py = Math.max(30, Math.min(height - 30, state.py + dy * speed * dt));
        state.angle = Math.atan2(state.mouse.y - state.py, state.mouse.x - state.px);

        // Firing weapon
        const now = performance.now();
        if (state.mouse.down && now - state.lastShot > 160) {
          state.lastShot = now;
          sounds.playShoot('shotgun');
          for (let i = 0; i < 4; i++) {
            const spread = (Math.random() - 0.5) * 0.35;
            const bAngle = state.angle + spread;
            state.bullets.push({
              x: state.px,
              y: state.py,
              vx: Math.cos(bAngle) * 900,
              vy: Math.sin(bAngle) * 900,
              damage: 35,
            });
          }
        }

        // Enemy spawn
        if (currentTime - state.lastSpawn > 1200 && state.enemies.length < 15) {
          state.lastSpawn = currentTime;
          const side = Math.floor(Math.random() * 4);
          let ex = 0;
          let ey = 0;
          if (side === 0) { ex = Math.random() * width; ey = 20; }
          else if (side === 1) { ex = width - 20; ey = Math.random() * height; }
          else if (side === 2) { ex = Math.random() * width; ey = height - 20; }
          else { ex = 20; ey = Math.random() * height; }

          state.enemies.push({
            x: ex,
            y: ey,
            hp: 60,
            maxHp: 60,
            speed: 120 + Math.random() * 60,
            type: Math.random() > 0.4 ? 'filth' : 'stray',
          });
        }

        // Bullets
        for (let i = state.bullets.length - 1; i >= 0; i--) {
          const b = state.bullets[i];
          b.x += b.vx * dt;
          b.y += b.vy * dt;

          if (b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
            state.bullets.splice(i, 1);
            continue;
          }

          // Bullet hits enemy
          for (let j = state.enemies.length - 1; j >= 0; j--) {
            const en = state.enemies[j];
            const dist = Math.hypot(b.x - en.x, b.y - en.y);
            if (dist < 18) {
              en.hp -= b.damage;
              state.bullets.splice(i, 1);

              // Blood absorption healing mechanic from Ultrakill
              const distToPlayer = Math.hypot(state.px - en.x, state.py - en.y);
              if (distToPlayer < 90) {
                setHp((h) => Math.min(100, h + 15));
              }

              if (en.hp <= 0) {
                state.enemies.splice(j, 1);
                state.bloodPools.push({ x: en.x, y: en.y, alpha: 1 });
                setStylePoints((p) => {
                  const newPts = p + 120;
                  // Update Style Rank
                  for (let r = STYLE_RANKS.length - 1; r >= 0; r--) {
                    if (newPts >= STYLE_RANKS[r].threshold) {
                      setRankIndex(r);
                      break;
                    }
                  }
                  return newPts;
                });
                sounds.playZombieHit();
              }
              break;
            }
          }
        }

        // Enemies chase player
        for (let i = 0; i < state.enemies.length; i++) {
          const en = state.enemies[i];
          const ang = Math.atan2(state.py - en.y, state.px - en.x);
          en.x += Math.cos(ang) * en.speed * dt;
          en.y += Math.sin(ang) * en.speed * dt;

          const dist = Math.hypot(state.px - en.x, state.py - en.y);
          if (dist < 20) {
            setHp((h) => {
              const next = h - 35 * dt;
              if (next <= 0) {
                setIsGameOver(true);
                return 0;
              }
              return next;
            });
          }
        }
      }

      // --- RENDER PASS ---
      ctx.fillStyle = '#0f0507';
      ctx.fillRect(0, 0, width, height);

      // Arena grid lines
      ctx.strokeStyle = '#270c12';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Blood pools
      for (const bp of state.bloodPools) {
        ctx.fillStyle = `rgba(225, 29, 72, ${bp.alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      // Bullets
      ctx.fillStyle = '#fde047';
      for (const b of state.bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Enemies
      for (const en of state.enemies) {
        ctx.save();
        ctx.translate(en.x, en.y);
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-2, -2, 4, 4);
        ctx.restore();
      }

      // Player V1
      ctx.save();
      ctx.translate(state.px, state.py);
      ctx.rotate(state.angle);

      // Cyber Wings
      ctx.fillStyle = '#eab308';
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      ctx.fillRect(-16, -18, 6, 12);
      ctx.fillRect(-16, 6, 6, 12);
      ctx.shadowBlur = 0;

      // Chassis
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(8, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isGameOver]);

  const currentRank = STYLE_RANKS[rankIndex];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-black text-white rounded-lg overflow-hidden border border-red-950/60 shadow-2xl">
      {/* Top HUD */}
      <div className="w-full bg-neutral-950 px-4 py-2 flex items-center justify-between border-b border-red-900/40 text-xs sm:text-sm font-mono">
        <div className="flex items-center gap-3">
          <span className="text-red-500 font-bold">HEALTH:</span>
          <div className="w-28 h-3 bg-neutral-800 rounded overflow-hidden border border-neutral-700">
            <div className="h-full bg-red-600 transition-all" style={{ width: `${hp}%` }} />
          </div>
          <span className="font-bold">{Math.round(hp)}</span>
        </div>

        {/* Dynamic Style Rank Meter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-400">STYLE:</span>
          <span className={`text-base font-black tracking-widest ${currentRank.color}`}>
            {currentRank.name}
          </span>
          <span className="text-xs text-neutral-400">({stylePoints} PTS)</span>
        </div>
      </div>

      <div className="relative w-full aspect-[4/3] max-h-[500px] bg-black flex items-center justify-center">
        <canvas ref={canvasRef} width={800} height={500} className="w-full h-full object-contain cursor-crosshair" />

        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-50">
            <h2 className="text-4xl sm:text-6xl font-black text-red-600 uppercase tracking-widest font-['Chakra_Petch',sans-serif]">
              YOU DIED
            </h2>
            <p className="text-neutral-400 font-mono mt-2 text-sm">
              FINAL STYLE RANK: {currentRank.name} ({stylePoints} PTS)
            </p>
            <button
              onClick={restartGame}
              className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded font-mono flex items-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              RESTART ARENA
            </button>
          </div>
        )}
      </div>

      <div className="w-full bg-neutral-950 px-4 py-2 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono flex justify-between">
        <span>WASD: Move · CLICK: Fire Shotgun · SHIFT: Dash · F/Q: Coin Toss</span>
        <span className="text-red-400">BLOOD IS FUEL: Kill close to heal!</span>
      </div>
    </div>
  );
};
