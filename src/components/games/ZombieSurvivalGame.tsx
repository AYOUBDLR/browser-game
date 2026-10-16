import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sounds } from '../../services/sound';
import { Shield, Sparkles, Crosshair, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ZombieSurvivalGameProps {
  mapName?: string;
  onClose?: () => void;
}

interface Zombie {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  id: number;
  radius: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  type: 'bullet' | 'raygun';
  distance: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

interface Weapon {
  name: string;
  damage: number;
  fireRate: number; // ms
  magSize: number;
  ammo: number;
  reserveAmmo: number;
  reloadTime: number; // ms
  type: 'pistol' | 'shotgun' | 'raygun';
  pellets?: number;
}

const WEAPONS: Record<string, Weapon> = {
  colt: {
    name: 'Colt M1911',
    damage: 25,
    fireRate: 200,
    magSize: 8,
    ammo: 8,
    reserveAmmo: 64,
    reloadTime: 1200,
    type: 'pistol',
  },
  shotgun: {
    name: 'Trench Shotgun',
    damage: 35,
    fireRate: 650,
    magSize: 6,
    ammo: 6,
    reserveAmmo: 48,
    reloadTime: 2000,
    type: 'shotgun',
    pellets: 5,
  },
  raygun: {
    name: 'Ray Gun Mark II',
    damage: 180,
    fireRate: 350,
    magSize: 20,
    ammo: 20,
    reserveAmmo: 120,
    reloadTime: 1800,
    type: 'raygun',
  },
};

export const ZombieSurvivalGame: React.FC<ZombieSurvivalGameProps> = ({ mapName = 'KINO DER TOTEN' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state
  const [round, setRound] = useState(1);
  const [points, setPoints] = useState(500);
  const [kills, setKills] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [hasJugg, setHasJugg] = useState(false);
  const [hasSpeedCola, setHasSpeedCola] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentWeaponKey, setCurrentWeaponKey] = useState<string>('colt');
  const [weapons, setWeapons] = useState<Record<string, Weapon>>({ ...WEAPONS });
  const [isReloading, setIsReloading] = useState(false);
  const [mysteryBoxMessage, setMysteryBoxMessage] = useState<string | null>(null);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('aero_zombies_highscore') || '0');
  });

  // Mutable game refs for 60fps loop
  const stateRef = useRef({
    px: 400,
    py: 300,
    angle: 0,
    keys: { w: false, a: false, s: false, d: false, space: false },
    mouse: { x: 400, y: 300, down: false },
    lastShot: 0,
    lastDamage: 0,
    zombies: [] as Zombie[],
    bullets: [] as Bullet[],
    particles: [] as Particle[],
    zombiesSpawned: 0,
    zombiesRemaining: 6,
    isWaveActive: true,
    nextWaveTimer: 0,
    barricades: [
      { x: 80, y: 300, planks: 4, maxPlanks: 4, repairCooldown: 0 },
      { x: 720, y: 300, planks: 4, maxPlanks: 4, repairCooldown: 0 },
      { x: 400, y: 60, planks: 4, maxPlanks: 4, repairCooldown: 0 },
      { x: 400, y: 540, planks: 4, maxPlanks: 4, repairCooldown: 0 },
    ],
  });

  const activeWeapon = weapons[currentWeaponKey];

  // Reload handler
  const handleReload = useCallback(() => {
    if (isReloading) return;
    const current = weapons[currentWeaponKey];
    if (current.ammo === current.magSize || current.reserveAmmo <= 0) return;

    setIsReloading(true);
    const duration = hasSpeedCola ? current.reloadTime * 0.5 : current.reloadTime;

    setTimeout(() => {
      setWeapons((prev) => {
        const w = { ...prev[currentWeaponKey] };
        const needed = w.magSize - w.ammo;
        const available = Math.min(needed, w.reserveAmmo);
        w.ammo += available;
        w.reserveAmmo -= available;
        return { ...prev, [currentWeaponKey]: w };
      });
      setIsReloading(false);
    }, duration);
  }, [currentWeaponKey, hasSpeedCola, isReloading, weapons]);

  // Mystery Box purchase
  const handleMysteryBox = () => {
    if (points < 950) {
      setMysteryBoxMessage('NEED 950 POINTS FOR MYSTERY BOX');
      setTimeout(() => setMysteryBoxMessage(null), 1500);
      return;
    }

    setPoints((p) => p - 950);
    sounds.playCoin();
    const weaponKeys = Object.keys(WEAPONS);
    const chosen = weaponKeys[Math.floor(Math.random() * weaponKeys.length)];

    setMysteryBoxMessage(`MYSTERY BOX: YOU RECEIVED ${WEAPONS[chosen].name}!`);
    setTimeout(() => setMysteryBoxMessage(null), 3000);

    setWeapons((prev) => ({
      ...prev,
      [chosen]: { ...WEAPONS[chosen] },
    }));
    setCurrentWeaponKey(chosen);
  };

  // Buy Perk
  const handleBuyJugg = () => {
    if (hasJugg) return;
    if (points < 2500) {
      setMysteryBoxMessage('NEED 2,500 POINTS FOR JUGGER-NOG');
      setTimeout(() => setMysteryBoxMessage(null), 1500);
      return;
    }
    setPoints((p) => p - 2500);
    setHasJugg(true);
    setMaxHp(250);
    setPlayerHp(250);
    sounds.playCoin();
    setMysteryBoxMessage('PERK ACQUIRED: JUGGER-NOG (250 HP)');
    setTimeout(() => setMysteryBoxMessage(null), 2500);
  };

  const handleBuySpeedCola = () => {
    if (hasSpeedCola) return;
    if (points < 3000) {
      setMysteryBoxMessage('NEED 3,000 POINTS FOR SPEED COLA');
      setTimeout(() => setMysteryBoxMessage(null), 1500);
      return;
    }
    setPoints((p) => p - 3000);
    setHasSpeedCola(true);
    sounds.playCoin();
    setMysteryBoxMessage('PERK ACQUIRED: SPEED COLA (2X RELOAD SPEED)');
    setTimeout(() => setMysteryBoxMessage(null), 2500);
  };

  // Restart Game
  const restartGame = () => {
    setRound(1);
    setPoints(500);
    setKills(0);
    setPlayerHp(100);
    setMaxHp(100);
    setHasJugg(false);
    setHasSpeedCola(false);
    setGameOver(false);
    setCurrentWeaponKey('colt');
    setWeapons({ ...WEAPONS });
    setIsReloading(false);

    stateRef.current.px = 400;
    stateRef.current.py = 300;
    stateRef.current.zombies = [];
    stateRef.current.bullets = [];
    stateRef.current.particles = [];
    stateRef.current.zombiesSpawned = 0;
    stateRef.current.zombiesRemaining = 6;
    stateRef.current.isWaveActive = true;
    sounds.playRoundStart();
  };

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sounds.playRoundStart();

    let animationFrameId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w') stateRef.current.keys.w = true;
      if (k === 'a') stateRef.current.keys.a = true;
      if (k === 's') stateRef.current.keys.s = true;
      if (k === 'd') stateRef.current.keys.d = true;
      if (k === ' ') stateRef.current.keys.space = true;
      if (k === 'r') handleReload();
      if (k === '1') setCurrentWeaponKey('colt');
      if (k === '2') setCurrentWeaponKey('shotgun');
      if (k === '3' && weapons.raygun) setCurrentWeaponKey('raygun');
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w') stateRef.current.keys.w = false;
      if (k === 'a') stateRef.current.keys.a = false;
      if (k === 's') stateRef.current.keys.s = false;
      if (k === 'd') stateRef.current.keys.d = false;
      if (k === ' ') stateRef.current.keys.space = false;
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

    // Game loop
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const state = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      if (!gameOver) {
        // Player movement
        const speed = 210;
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

        // Player aiming
        state.angle = Math.atan2(state.mouse.y - state.py, state.mouse.x - state.px);

        // Player shooting
        const now = performance.now();
        const currentW = weapons[currentWeaponKey];

        if (state.mouse.down && !isReloading && currentW.ammo > 0 && now - state.lastShot >= currentW.fireRate) {
          state.lastShot = now;
          setWeapons((prev) => {
            const w = { ...prev[currentWeaponKey] };
            w.ammo -= 1;
            return { ...prev, [currentWeaponKey]: w };
          });

          sounds.playShoot(currentW.type);

          // Add bullets
          if (currentW.type === 'shotgun') {
            for (let i = 0; i < (currentW.pellets || 5); i++) {
              const spread = (Math.random() - 0.5) * 0.35;
              const bAngle = state.angle + spread;
              const bSpeed = 650;
              state.bullets.push({
                x: state.px + Math.cos(state.angle) * 18,
                y: state.py + Math.sin(state.angle) * 18,
                vx: Math.cos(bAngle) * bSpeed,
                vy: Math.sin(bAngle) * bSpeed,
                damage: currentW.damage,
                type: 'bullet',
                distance: 0,
              });
            }
          } else {
            const bSpeed = currentW.type === 'raygun' ? 700 : 850;
            state.bullets.push({
              x: state.px + Math.cos(state.angle) * 18,
              y: state.py + Math.sin(state.angle) * 18,
              vx: Math.cos(state.angle) * bSpeed,
              vy: Math.sin(state.angle) * bSpeed,
              damage: currentW.damage,
              type: currentW.type === 'raygun' ? 'raygun' : 'bullet',
              distance: 0,
            });
          }
        }

        // Auto reload if empty
        if (currentW.ammo === 0 && !isReloading && currentW.reserveAmmo > 0) {
          handleReload();
        }

        // Zombie Spawning
        const waveQuota = round * 6;
        if (state.zombiesSpawned < waveQuota && Math.random() < 0.035) {
          state.zombiesSpawned += 1;
          const spawnCorners = [
            { x: 30, y: 30 },
            { x: width - 30, y: 30 },
            { x: 30, y: height - 30 },
            { x: width - 30, y: height - 30 },
          ];
          const spawn = spawnCorners[Math.floor(Math.random() * spawnCorners.length)];
          state.zombies.push({
            x: spawn.x,
            y: spawn.y,
            hp: 60 + round * 25,
            maxHp: 60 + round * 25,
            speed: 55 + Math.min(round * 8, 80) + Math.random() * 20,
            id: Math.random(),
            radius: 14,
          });
        }

        // Wave End Check
        if (state.zombiesSpawned >= waveQuota && state.zombies.length === 0) {
          setRound((r) => {
            const nextRound = r + 1;
            state.zombiesSpawned = 0;
            sounds.playRoundStart();
            confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
            return nextRound;
          });
        }

        // Update Bullets
        for (let i = state.bullets.length - 1; i >= 0; i--) {
          const b = state.bullets[i];
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.distance += Math.hypot(b.vx * dt, b.vy * dt);

          if (b.distance > 800 || b.x < 0 || b.x > width || b.y < 0 || b.y > height) {
            state.bullets.splice(i, 1);
            continue;
          }

          // Bullet hits zombies
          for (let j = state.zombies.length - 1; j >= 0; j--) {
            const z = state.zombies[j];
            const dist = Math.hypot(b.x - z.x, b.y - z.y);
            if (dist < z.radius + 6) {
              z.hp -= b.damage;
              setPoints((p) => p + 10);
              sounds.playZombieHit();

              // Blood particles
              for (let p = 0; p < 4; p++) {
                state.particles.push({
                  x: z.x,
                  y: z.y,
                  vx: (Math.random() - 0.5) * 120,
                  vy: (Math.random() - 0.5) * 120,
                  color: b.type === 'raygun' ? '#22c55e' : '#dc2626',
                  alpha: 1,
                  size: 2 + Math.random() * 3,
                });
              }

              state.bullets.splice(i, 1);

              if (z.hp <= 0) {
                state.zombies.splice(j, 1);
                setPoints((p) => p + 90);
                setKills((k) => k + 1);
              }
              break;
            }
          }
        }

        // Update Zombies
        for (let i = 0; i < state.zombies.length; i++) {
          const z = state.zombies[i];
          const angleToPlayer = Math.atan2(state.py - z.y, state.px - z.x);
          z.x += Math.cos(angleToPlayer) * z.speed * dt;
          z.y += Math.sin(angleToPlayer) * z.speed * dt;

          // Zombie hits player
          const distToPlayer = Math.hypot(state.px - z.x, state.py - z.y);
          if (distToPlayer < z.radius + 15) {
            if (now - state.lastDamage > 900) {
              state.lastDamage = now;
              sounds.playZombieHit();
              setPlayerHp((hp) => {
                const nextHp = hp - 40;
                if (nextHp <= 0) {
                  setGameOver(true);
                  setHighScore((prev) => {
                    const newHigh = Math.max(prev, points);
                    localStorage.setItem('aero_zombies_highscore', String(newHigh));
                    return newHigh;
                  });
                  return 0;
                }
                return nextHp;
              });
            }
          }
        }

        // Update Particles
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.alpha -= dt * 1.5;
          if (p.alpha <= 0) {
            state.particles.splice(i, 1);
          }
        }
      }

      // --- RENDER PASS ---
      ctx.fillStyle = '#0a090b';
      ctx.fillRect(0, 0, width, height);

      // Floor tiles grid
      ctx.strokeStyle = '#18141c';
      ctx.lineWidth = 1;
      const tileSize = 40;
      for (let x = 0; x < width; x += tileSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += tileSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Wall borders
      ctx.strokeStyle = '#3f1218';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, width - 8, height - 8);

      // Flashlight cone
      const grad = ctx.createRadialGradient(state.px, state.py, 15, state.px, state.py, 380);
      grad.addColorStop(0, 'rgba(255, 245, 200, 0.35)');
      grad.addColorStop(0.3, 'rgba(255, 230, 160, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(state.px, state.py);
      ctx.arc(state.px, state.py, 420, state.angle - 0.5, state.angle + 0.5);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Render Particles
      for (const p of state.particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Bullets
      for (const b of state.bullets) {
        ctx.save();
        if (b.type === 'raygun') {
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(b.x, b.y, 6, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Render Zombies
      for (const z of state.zombies) {
        ctx.save();
        ctx.translate(z.x, z.y);

        // Body
        ctx.fillStyle = '#22543d';
        ctx.beginPath();
        ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#143826';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glowing zombie eyes
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(4, -3, 2, 0, Math.PI * 2);
        ctx.arc(4, 3, 2, 0, Math.PI * 2);
        ctx.fill();

        // HP bar above zombie
        const hpPercent = z.hp / z.maxHp;
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-12, -22, 24, 4);
        ctx.fillStyle = hpPercent > 0.4 ? '#ef4444' : '#b91c1c';
        ctx.fillRect(-12, -22, 24 * hpPercent, 4);

        ctx.restore();
      }

      // Render Player
      ctx.save();
      ctx.translate(state.px, state.py);
      ctx.rotate(state.angle);

      // Player hands & Gun
      ctx.fillStyle = '#374151';
      ctx.fillRect(8, 5, 14, 4); // Gun barrel
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(4, 6, 4, 0, Math.PI * 2);
      ctx.arc(4, -6, 4, 0, Math.PI * 2);
      ctx.fill();

      // Player torso
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      // Crosshair cursor
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(state.mouse.x, state.mouse.y, 8, 0, Math.PI * 2);
      ctx.moveTo(state.mouse.x - 12, state.mouse.y);
      ctx.lineTo(state.mouse.x + 12, state.mouse.y);
      ctx.moveTo(state.mouse.x, state.mouse.y - 12);
      ctx.lineTo(state.mouse.x, state.mouse.y + 12);
      ctx.stroke();

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
  }, [gameOver, handleReload, isReloading, currentWeaponKey, round, weapons, points]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-black text-white rounded-lg overflow-hidden border border-red-950/50 shadow-2xl">
      {/* Top HUD Bar */}
      <div className="w-full bg-neutral-950 px-4 py-2.5 flex items-center justify-between border-b border-red-900/40 text-xs sm:text-sm font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-red-500 font-black">
            <span className="text-[10px] text-neutral-400">ROUND</span>
            <span className="text-xl tracking-tighter text-red-600 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">
              {round}
            </span>
          </div>
          <div className="text-amber-400 font-bold tracking-wide">
            {points.toLocaleString()} <span className="text-[10px] text-neutral-400">PTS</span>
          </div>
          <div className="text-neutral-400">
            KILLS: <span className="text-white font-bold">{kills}</span>
          </div>
        </div>

        {/* Player Health Bar */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <span>HP</span>
              <span className={playerHp < 40 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}>
                {playerHp}/{maxHp}
              </span>
            </div>
            <div className="w-24 sm:w-32 h-2 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
              <div
                className={`h-full transition-all duration-200 ${
                  playerHp < 40 ? 'bg-red-600' : 'bg-emerald-500'
                }`}
                style={{ width: `${(playerHp / maxHp) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full aspect-[4/3] max-h-[500px] bg-black flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {/* Mystery Box / Notification Banner */}
        {mysteryBoxMessage && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-amber-950/90 border border-amber-500/80 text-amber-200 px-4 py-1.5 rounded text-xs font-mono tracking-widest shadow-lg animate-bounce">
            {mysteryBoxMessage}
          </div>
        )}

        {/* Reloading Indicator */}
        {isReloading && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 border border-neutral-700 text-yellow-400 px-3 py-1 rounded text-xs font-mono font-bold tracking-wider">
            RELOADING...
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-50">
            <h2 className="text-3xl sm:text-5xl font-black text-red-600 uppercase tracking-widest font-['Chakra_Petch',sans-serif] drop-shadow-[0_0_15px_rgba(220,38,38,0.9)]">
              GAME OVER
            </h2>
            <p className="text-neutral-400 font-mono mt-2 text-sm">YOU SURVIVED UNTIL ROUND {round}</p>
            <div className="my-6 grid grid-cols-2 gap-4 text-left font-mono text-xs bg-neutral-900/80 p-4 rounded border border-neutral-800">
              <div>Zombies Slain: <span className="text-white font-bold">{kills}</span></div>
              <div>Final Points: <span className="text-amber-400 font-bold">{points}</span></div>
              <div>High Score: <span className="text-cyan-400 font-bold">{highScore}</span></div>
              <div>Map: <span className="text-neutral-300">{mapName}</span></div>
            </div>

            <button
              onClick={restartGame}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm tracking-wider uppercase rounded font-mono flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Bottom Store & Weapon Bar */}
      <div className="w-full bg-neutral-950 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 text-xs font-mono">
        {/* Active Weapon Status */}
        <div className="flex items-center gap-3">
          <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded">
            <div className="text-[10px] text-neutral-400 uppercase font-sans">WEAPON</div>
            <div className="text-sm font-bold text-white tracking-wide">{activeWeapon.name}</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded">
            <div className="text-[10px] text-neutral-400 uppercase font-sans">AMMO</div>
            <div className="text-sm font-bold text-amber-400">
              {activeWeapon.ammo} / <span className="text-neutral-500">{activeWeapon.reserveAmmo}</span>
            </div>
          </div>
        </div>

        {/* Interactive Buy Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleMysteryBox}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-amber-600/50 hover:border-amber-400 text-amber-300 rounded font-bold transition-all cursor-pointer"
          >
            Mystery Box (950 PTS)
          </button>
          <button
            onClick={handleBuyJugg}
            disabled={hasJugg}
            className={`px-3 py-1.5 rounded font-bold border transition-all cursor-pointer ${
              hasJugg
                ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                : 'bg-neutral-900 hover:bg-neutral-800 border-red-600/50 hover:border-red-400 text-red-400'
            }`}
          >
            {hasJugg ? 'Juggernog (Active)' : 'Juggernog (2500 PTS)'}
          </button>
          <button
            onClick={handleBuySpeedCola}
            disabled={hasSpeedCola}
            className={`px-3 py-1.5 rounded font-bold border transition-all cursor-pointer ${
              hasSpeedCola
                ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                : 'bg-neutral-900 hover:bg-neutral-800 border-emerald-600/50 hover:border-emerald-400 text-emerald-400'
            }`}
          >
            {hasSpeedCola ? 'Speed Cola (Active)' : 'Speed Cola (3000 PTS)'}
          </button>
        </div>
      </div>
    </div>
  );
};
