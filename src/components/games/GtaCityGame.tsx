import React, { useEffect, useRef, useState } from 'react';
import { sounds } from '../../services/sound';
import { Radio, Siren, Flame, RotateCcw, Volume2, ShieldAlert } from 'lucide-react';

interface GtaCityGameProps {
  title?: string;
  theme?: 'los_santos' | 'vice_city';
}

interface CopCar {
  x: number;
  y: number;
  angle: number;
  speed: number;
}

interface SkidMark {
  x: number;
  y: number;
  alpha: number;
}

export const GtaCityGame: React.FC<GtaCityGameProps> = ({
  title = 'GTA V: LOS SANTOS CHASE',
  theme = 'los_santos',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [wantedLevel, setWantedLevel] = useState(1);
  const [cash, setCash] = useState(1250);
  const [speedMph, setSpeedMph] = useState(0);
  const [currentStation, setCurrentStation] = useState('Radio Los Santos');
  const [isBusted, setIsBusted] = useState(false);
  const [nitroFuel, setNitroFuel] = useState(100);

  const RADIO_STATIONS = [
    'Radio Los Santos',
    'Flash FM (80s Pop)',
    'West Coast Classics',
    'V-Rock (Heavy Metal)',
    'Non-Stop-Pop FM',
  ];

  const stateRef = useRef({
    car: {
      x: 400,
      y: 300,
      angle: -Math.PI / 2,
      speed: 0,
      maxSpeed: 380,
      accel: 280,
      friction: 0.98,
      steer: 0,
      drift: false,
      nitro: false,
    },
    cops: [] as CopCar[],
    skids: [] as SkidMark[],
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    },
    lastCopSpawn: 0,
  });

  const nextRadioStation = () => {
    const currentIndex = RADIO_STATIONS.indexOf(currentStation);
    const nextIndex = (currentIndex + 1) % RADIO_STATIONS.length;
    setCurrentStation(RADIO_STATIONS[nextIndex]);
    sounds.playClick();
  };

  const restartChase = () => {
    setIsBusted(false);
    setWantedLevel(1);
    setCash(1250);
    setNitroFuel(100);
    stateRef.current.car = {
      x: 400,
      y: 300,
      angle: -Math.PI / 2,
      speed: 0,
      maxSpeed: 380,
      accel: 280,
      friction: 0.98,
      steer: 0,
      drift: false,
      nitro: false,
    };
    stateRef.current.cops = [];
    stateRef.current.skids = [];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') stateRef.current.keys.up = true;
      if (k === 's' || e.key === 'ArrowDown') stateRef.current.keys.down = true;
      if (k === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.left = true;
      if (k === 'd' || e.key === 'ArrowRight') stateRef.current.keys.right = true;
      if (e.key === ' ') {
        e.preventDefault();
        stateRef.current.keys.space = true;
      }
      if (e.key === 'Shift') stateRef.current.keys.shift = true;
      if (k === 'r') nextRadioStation();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') stateRef.current.keys.up = false;
      if (k === 's' || e.key === 'ArrowDown') stateRef.current.keys.down = false;
      if (k === 'a' || e.key === 'ArrowLeft') stateRef.current.keys.left = false;
      if (k === 'd' || e.key === 'ArrowRight') stateRef.current.keys.right = false;
      if (e.key === ' ') stateRef.current.keys.space = false;
      if (e.key === 'Shift') stateRef.current.keys.shift = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const state = stateRef.current;
      const { car, keys } = state;
      const width = canvas.width;
      const height = canvas.height;

      if (!isBusted) {
        // Acceleration
        let maxS = car.maxSpeed;
        if (keys.shift && nitroFuel > 0) {
          maxS = 520;
          car.speed += car.accel * 1.5 * dt;
          setNitroFuel((f) => Math.max(0, f - dt * 25));
        } else {
          setNitroFuel((f) => Math.min(100, f + dt * 5));
        }

        if (keys.up) {
          car.speed = Math.min(maxS, car.speed + car.accel * dt);
          sounds.playEngine();
        } else if (keys.down) {
          car.speed = Math.max(-120, car.speed - car.accel * 1.2 * dt);
        } else {
          car.speed *= car.friction;
        }

        // Drifting / Steering
        const turnSpeed = keys.space ? 3.5 : 2.5;
        if (Math.abs(car.speed) > 10) {
          const dir = car.speed > 0 ? 1 : -1;
          if (keys.left) car.angle -= turnSpeed * dt * dir;
          if (keys.right) car.angle += turnSpeed * dt * dir;
        }

        if (keys.space && Math.abs(car.speed) > 100) {
          car.speed *= 0.985;
          sounds.playScreech();
          setCash((c) => c + Math.floor(Math.abs(car.speed) * dt * 0.5));
          state.skids.push({ x: car.x, y: car.y, alpha: 1 });
        }

        // Move car
        car.x += Math.cos(car.angle) * car.speed * dt;
        car.y += Math.sin(car.angle) * car.speed * dt;

        // Screen wrap
        if (car.x < -20) car.x = width + 20;
        if (car.x > width + 20) car.x = -20;
        if (car.y < -20) car.y = height + 20;
        if (car.y > height + 20) car.y = -20;

        setSpeedMph(Math.round(Math.abs(car.speed) * 0.28));

        // Wanted level scaling
        if (time - state.lastCopSpawn > 4000 && state.cops.length < wantedLevel * 2) {
          state.lastCopSpawn = time;
          const spawnAngle = Math.random() * Math.PI * 2;
          const dist = 450;
          state.cops.push({
            x: car.x + Math.cos(spawnAngle) * dist,
            y: car.y + Math.sin(spawnAngle) * dist,
            angle: 0,
            speed: 180 + wantedLevel * 25,
          });
        }

        // Update Cops
        for (let i = 0; i < state.cops.length; i++) {
          const cop = state.cops[i];
          const targetAngle = Math.atan2(car.y - cop.y, car.x - cop.x);
          cop.angle = targetAngle;
          cop.x += Math.cos(cop.angle) * cop.speed * dt;
          cop.y += Math.sin(cop.angle) * cop.speed * dt;

          // Check if Cop rams player
          const dist = Math.hypot(cop.x - car.x, cop.y - car.y);
          if (dist < 32 && Math.abs(car.speed) < 40) {
            setIsBusted(true);
            sounds.playZombieHit();
            break;
          }
        }

        // Skid mark fade
        for (let i = state.skids.length - 1; i >= 0; i--) {
          state.skids[i].alpha -= dt * 0.3;
          if (state.skids[i].alpha <= 0) {
            state.skids.splice(i, 1);
          }
        }
      }

      // --- RENDER PASS ---
      // Asphalt
      ctx.fillStyle = theme === 'vice_city' ? '#140f22' : '#1c1c24';
      ctx.fillRect(0, 0, width, height);

      // Road markings
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.strokeRect(60, 60, width - 120, height - 120);

      // Dashed lane lines
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.setLineDash([16, 16]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Render Skid marks
      for (const s of state.skids) {
        ctx.fillStyle = `rgba(0, 0, 0, ${s.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render Cops
      for (const cop of state.cops) {
        ctx.save();
        ctx.translate(cop.x, cop.y);
        ctx.rotate(cop.angle);

        // Cop Car body
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-18, -10, 36, 20);

        // White roof
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-6, -8, 16, 16);

        // Siren lights flashing
        const isRed = Math.floor(time / 150) % 2 === 0;
        ctx.fillStyle = isRed ? '#ef4444' : '#3b82f6';
        ctx.shadowColor = isRed ? '#ef4444' : '#3b82f6';
        ctx.shadowBlur = 8;
        ctx.fillRect(-2, -6, 6, 12);
        ctx.shadowBlur = 0;

        ctx.restore();
      }

      // Render Player Car
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);

      // Nitro exhaust flame
      if (keys.shift && nitroFuel > 0) {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(-20, -5);
        ctx.lineTo(-32 - Math.random() * 10, 0);
        ctx.lineTo(-20, 5);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Car Chassis
      ctx.fillStyle = theme === 'vice_city' ? '#ec4899' : '#f59e0b';
      ctx.fillRect(-20, -11, 40, 22);

      // Windshield & windows
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-8, -9, 16, 18);

      // Headlights
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(18, -10, 3, 5);
      ctx.fillRect(18, 5, 3, 5);

      // Taillights
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-21, -10, 2, 5);
      ctx.fillRect(-21, 5, 2, 5);

      ctx.restore();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentStation, isBusted, nitroFuel, theme, wantedLevel]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto bg-black text-white rounded-lg overflow-hidden border border-amber-950/50 shadow-2xl">
      {/* Top HUD */}
      <div className="w-full bg-neutral-950 px-4 py-2.5 flex items-center justify-between border-b border-neutral-800 text-xs sm:text-sm font-mono">
        {/* Wanted Stars */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-400 uppercase font-sans">WANTED</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-base font-bold ${
                  star <= wantedLevel
                    ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                    : 'text-neutral-700'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Speed & Cash */}
        <div className="flex items-center gap-4">
          <div className="text-white font-black text-base">
            {speedMph} <span className="text-[10px] text-neutral-400 font-sans">MPH</span>
          </div>
          <div className="text-emerald-400 font-black text-sm">
            ${cash.toLocaleString()}
          </div>
        </div>

        {/* Radio Station Selector */}
        <button
          onClick={nextRadioStation}
          className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 px-3 py-1 rounded text-neutral-300 border border-neutral-700 hover:border-neutral-500 cursor-pointer"
        >
          <Radio className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate max-w-[130px] font-sans text-xs">{currentStation}</span>
        </button>
      </div>

      {/* Main Driving Canvas */}
      <div className="relative w-full aspect-[4/3] max-h-[500px] bg-neutral-950 flex items-center justify-center">
        <canvas ref={canvasRef} width={800} height={600} className="w-full h-full object-contain" />

        {/* Nitro Gauge */}
        <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1.5 rounded border border-neutral-700 font-mono text-[11px] flex items-center gap-2">
          <Flame className="w-4 h-4 text-sky-400" />
          <span>NITRO</span>
          <div className="w-20 h-2 bg-neutral-800 rounded overflow-hidden">
            <div className="h-full bg-sky-400 transition-all" style={{ width: `${nitroFuel}%` }} />
          </div>
        </div>

        {/* Busted Overlay */}
        {isBusted && (
          <div className="absolute inset-0 bg-red-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-50">
            <h2 className="text-4xl sm:text-6xl font-black text-red-500 uppercase tracking-widest font-['Chakra_Petch',sans-serif] drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]">
              BUSTED!
            </h2>
            <p className="text-neutral-300 font-mono mt-2 text-sm">
              YOU WERE APPREHENDED BY THE POLICE DEPARTMENT
            </p>
            <div className="my-5 bg-black/60 p-4 rounded border border-neutral-800 font-mono text-xs">
              <div>Drift Cash Earned: <span className="text-emerald-400 font-bold">${cash}</span></div>
              <div>Top Speed: <span className="text-amber-400 font-bold">{speedMph} MPH</span></div>
            </div>
            <button
              onClick={restartChase}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm tracking-wider uppercase rounded font-mono flex items-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              RESPAWN AT HOSPITAL
            </button>
          </div>
        )}
      </div>

      {/* Control Info Footer */}
      <div className="w-full bg-neutral-950 px-4 py-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
        <div>WASD / Arrows: Steer & Gas · SPACE: Drift / Handbrake · SHIFT: Nitro Boost · R: Radio</div>
      </div>
    </div>
  );
};
