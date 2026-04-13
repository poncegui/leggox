import React, { useEffect, useMemo, useRef, useState } from 'react';

/** ---------------- CONFIG ---------------- */
const LANES = 3;
const TICK_MS = 16; // ~60fps
const SPAWN_EVERY_TICKS = 38;
const BASE_SPEED = 5;
const PICKUP_CHANCE = 0.3;
const START_SPEED = 2.1;
const RAMP_SECONDS = 12;

// LocalStorage keys
const STORAGE_KEY_BEST = 'leggox_race_best_score';
const STORAGE_KEY_SCORES = 'leggox_race_top_scores';

/** -------- THEME COLORS -------- */
const COLORS = {
  bg: '#3a3a3a',
  bgDark: '#2a2a2a',
  panel: 'rgba(224,30,55,0.10)',
  panelDark: 'rgba(0,0,0,0.8)',
  border: 'rgba(255,255,255,0.1)',
  white: '#FFFFFF',
  white70: 'rgba(255,255,255,0.70)',
  white40: 'rgba(255,255,255,0.40)',
  red: '#E01E37',
  darkRed: '#DC143C',
  green: '#00FF88',
  amber: '#FFB020',
  blue: '#1E90FF',
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pickLane(exceptLane = null) {
  let lane = randInt(0, LANES - 1);
  if (exceptLane !== null && LANES > 1) {
    while (lane === exceptLane) lane = randInt(0, LANES - 1);
  }
  return lane;
}
function formatScore(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

// LocalStorage helpers
function getBestScore() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY_BEST) || '0', 10);
  } catch {
    return 0;
  }
}

function setBestScore(score) {
  try {
    localStorage.setItem(STORAGE_KEY_BEST, score.toString());
  } catch {
    console.warn('No se pudo guardar el récord');
  }
}

function getTopScores() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SCORES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function addTopScore(score) {
  try {
    const scores = getTopScores();
    scores.push({ score, date: new Date().toISOString() });
    scores.sort((a, b) => b.score - a.score);
    const top10 = scores.slice(0, 10);
    localStorage.setItem(STORAGE_KEY_SCORES, JSON.stringify(top10));
    return top10;
  } catch {
    return [];
  }
}

// Icono de juego
function IconGamepad({ size = 24, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 12h4m2 0h4M8 8h.01M16 8h.01M8 16h.01M16 16h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

// Icono de trofeo
function IconTrophy({ size = 24, color = 'currentColor' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

export default function LeggoxRaceGame({ onClose }) {
  const [width, setWidth] = useState(1024);
  useEffect(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
    setWidth(w);
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 768;

  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showScores, setShowScores] = useState(false);

  const [lane, setLane] = useState(1);
  const [objects, setObjects] = useState([]);
  const [tick, setTick] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(getBestScore());
  const [picked, setPicked] = useState(0);
  const [particles, setParticles] = useState([]); // Partículas para efectos visuales

  const intervalRef = useRef(null);
  const runningRef = useRef(running);
  const pausedRef = useRef(paused);

  useEffect(() => {
    runningRef.current = running;
    pausedRef.current = paused;
  }, [running, paused]);

  // Bloquear scroll
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const TRACK = useMemo(() => {
    const trackWidth = clamp(width - (isMobile ? 40 : 80), 320, 600);
    const trackHeight = isMobile ? 550 : 700;
    const laneWidth = Math.floor(trackWidth / LANES);
    const carW = Math.floor(laneWidth * 0.65);
    const carH = isMobile ? 60 : 68;
    const objW = Math.floor(laneWidth * 0.58);
    const objH = isMobile ? 46 : 52;
    return { trackWidth, trackHeight, laneWidth, carW, carH, objW, objH };
  }, [width, isMobile]);

  const speed = useMemo(() => {
    const extra = Math.floor(score / 140);
    const target = BASE_SPEED + extra;
    const rampTicks = Math.max(1, Math.floor((RAMP_SECONDS * 1000) / TICK_MS));
    const t = clamp(tick / rampTicks, 0, 1);
    const eased = smoothstep(t);
    return START_SPEED + (target - START_SPEED) * eased;
  }, [score, tick]);

  function resetGame() {
    setObjects([]);
    setParticles([]);
    setLane(1);
    setTick(0);
    setScore(0);
    setPicked(0);
    setGameOver(false);
    setPaused(false);
    setRunning(true);
    setShowScores(false);
  }

  function stopGame() {
    setRunning(false);
    setPaused(false);
    setGameOver(true);

    // Guardar puntuación si es récord
    if (score > best) {
      setBest(score);
      setBestScore(score);
    }
    // Agregar a top scores
    if (score > 0) {
      addTopScore(score);
    }
  }

  function togglePause() {
    if (!running) return;
    setPaused(p => !p);
  }

  function moveLeft() {
    if (!running || paused || gameOver) return;
    setLane(l => clamp(l - 1, 0, LANES - 1));
  }

  function moveRight() {
    if (!running || paused || gameOver) return;
    setLane(l => clamp(l + 1, 0, LANES - 1));
  }

  function createParticles(x, y, color) {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color,
        life: 1,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!running) return;

    intervalRef.current = setInterval(() => {
      if (!runningRef.current || pausedRef.current) return;

      setTick(tPrev => {
        const t = tPrev + 1;

        setObjects(prev => {
          const moved = prev
            .map(o => ({ ...o, y: o.y + speed }))
            .filter(o => o.y < TRACK.trackHeight + 80);

          const shouldSpawn = t % SPAWN_EVERY_TICKS === 0;
          if (shouldSpawn) {
            const kind = Math.random() < PICKUP_CHANCE ? 'pickup' : 'obstacle';
            const laneSpawn = pickLane();
            const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
            moved.unshift({ id, lane: laneSpawn, y: -60, kind });
          }
          return moved;
        });

        // Actualizar partículas
        setParticles(prev =>
          prev
            .map(p => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              life: p.life - 0.02,
            }))
            .filter(p => p.life > 0),
        );

        setScore(s => s + 1);
        return t;
      });
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, speed, TRACK.trackHeight]);

  useEffect(() => {
    if (!running || paused || gameOver) return;

    const carY = TRACK.trackHeight - (isMobile ? 120 : 130);
    const hit = objects.find(o => {
      if (o.lane !== lane) return false;
      const dy = Math.abs(o.y - carY);
      return dy < (isMobile ? 34 : 38);
    });

    if (!hit) return;

    const trackPadding = 10;
    const hitX =
      trackPadding +
      hit.lane * TRACK.laneWidth +
      Math.floor(TRACK.laneWidth / 2);

    if (hit.kind === 'pickup') {
      setPicked(p => p + 1);
      setScore(s => s + 30);
      setObjects(prev => prev.filter(o => o.id !== hit.id));
      createParticles(hitX, hit.y, COLORS.green);
      return;
    }

    createParticles(hitX, hit.y, COLORS.red);
    stopGame();
  }, [objects, lane, running, paused, gameOver, TRACK, isMobile]);

  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft();
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight();

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault?.();
        if (!running) return;
        setPaused(p => !p);
      }

      if ((e.key === 'Enter' || e.key === 'Return') && !running) resetGame();
      if (e.key === 'Escape') {
        if (running && !gameOver) {
          setPaused(true);
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [running, paused, gameOver, onClose]);

  const trackPadding = 10;
  const laneX = l =>
    trackPadding +
    l * TRACK.laneWidth +
    Math.floor((TRACK.laneWidth - TRACK.objW) / 2);
  const carX =
    trackPadding +
    lane * TRACK.laneWidth +
    Math.floor((TRACK.laneWidth - TRACK.carW) / 2);
  const carY = TRACK.trackHeight - (isMobile ? 120 : 130);

  const topScores = getTopScores();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: COLORS.bg,
        zIndex: 999999,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: COLORS.bgDark,
          borderBottom: `2px solid ${COLORS.red}`,
          padding: isMobile ? '16px 20px' : '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'APERCU, sans-serif',
              fontSize: isMobile ? 24 : 32,
              fontWeight: 900,
              color: COLORS.white,
              letterSpacing: '-1px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <IconGamepad size={isMobile ? 28 : 36} color={COLORS.red} />
            LEGGOX RACE
          </div>
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 12,
              color: COLORS.white40,
              marginTop: 4,
              letterSpacing: '0.5px',
            }}
          >
            Esquiva conos · Recoge piezas · Bate tu récord
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: COLORS.red,
            border: `1px solid ${COLORS.red}`,
            borderRadius: 12,
            padding: isMobile ? '10px 16px' : '12px 20px',
            color: COLORS.white,
            fontWeight: 900,
            fontSize: isMobile ? 14 : 16,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'ui-monospace, monospace',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = COLORS.darkRed;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = COLORS.red;
          }}
        >
          {isMobile ? '✕' : '✕ SALIR'}
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 20,
          padding: isMobile ? 20 : 40,
          maxWidth: 1400,
          margin: '0 auto',
          width: '100%',
        }}
      >
        {/* Game Area */}
        <div
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          {/* HUD */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr 1fr'
                : 'repeat(4, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            <HudCard
              label="PUNTOS"
              value={formatScore(score)}
              isMobile={isMobile}
            />
            <HudCard
              label="RÉCORD"
              value={formatScore(best)}
              icon={<IconTrophy size={16} color={COLORS.amber} />}
              isMobile={isMobile}
            />
            <HudCard
              label="PIEZAS"
              value={picked.toString()}
              isMobile={isMobile}
            />
            <HudCard
              label="VELOCIDAD"
              value={`${Math.round(speed * 20)}km/h`}
              isMobile={isMobile}
            />
          </div>

          {/* Track */}
          <div
            style={{
              position: 'relative',
              margin: '0 auto',
              width: TRACK.trackWidth + trackPadding * 2,
              height: TRACK.trackHeight,
              borderRadius: 20,
              border: `2px solid ${COLORS.border}`,
              background: `linear-gradient(to bottom, #4a4a4a 0%, #3a3a3a 50%, #2a2a2a 100%)`,
              boxShadow: `0 0 40px rgba(224,30,55,0.2), inset 0 0 60px rgba(0,0,0,0.4)`,
              overflow: 'hidden',
            }}
          >
            {/* Lane lines */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
              }}
            >
              {Array.from({ length: LANES - 1 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: trackPadding + (i + 1) * TRACK.laneWidth,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    background:
                      'repeating-linear-gradient(to bottom, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 20px, transparent 20px, transparent 40px)',
                  }}
                />
              ))}
            </div>

            {/* Objects */}
            {objects.map(obj => (
              <div
                key={obj.id}
                style={{
                  position: 'absolute',
                  left: laneX(obj.lane),
                  top: obj.y,
                  width: TRACK.objW,
                  height: TRACK.objH,
                  borderRadius: obj.kind === 'pickup' ? '50%' : 8,
                  background:
                    obj.kind === 'pickup'
                      ? `radial-gradient(circle, ${COLORS.green} 0%, ${COLORS.green}dd 100%)`
                      : `linear-gradient(135deg, ${COLORS.red} 0%, ${COLORS.darkRed} 100%)`,
                  boxShadow:
                    obj.kind === 'pickup'
                      ? `0 0 20px ${COLORS.green}`
                      : `0 4px 12px rgba(224,30,55,0.5)`,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: isMobile ? 20 : 24,
                  transition: 'transform 0.1s ease',
                }}
              >
                {obj.kind === 'pickup' ? '⚙️' : '🚧'}
              </div>
            ))}

            {/* Particles */}
            {particles.map(p => (
              <div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: p.x,
                  top: p.y,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: p.color,
                  opacity: p.life,
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Car */}
            <div
              style={{
                position: 'absolute',
                left: carX,
                top: carY,
                width: TRACK.carW,
                height: TRACK.carH,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${COLORS.white} 0%, #DDDDDD 100%)`,
                boxShadow: `0 8px 24px rgba(255,255,255,0.3), 0 0 40px ${COLORS.red}`,
                display: 'grid',
                placeItems: 'center',
                fontSize: isMobile ? 28 : 32,
                transition: 'left 0.15s ease-out',
                border: `3px solid ${COLORS.red}`,
              }}
            >
              🏎️
            </div>

            {/* Overlays */}
            {!running && !gameOver && (
              <StartOverlay isMobile={isMobile} onStart={resetGame} />
            )}
            {paused && <PausedOverlay isMobile={isMobile} />}
            {gameOver && (
              <GameOverOverlay
                score={score}
                best={best}
                picked={picked}
                isMobile={isMobile}
                onRestart={resetGame}
                onViewScores={() => setShowScores(true)}
              />
            )}
          </div>

          {/* Controls */}
          {running && !gameOver && (
            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={moveLeft}
                style={controlButtonStyle}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.red;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(224,30,55,0.2)';
                }}
              >
                ← IZQUIERDA
              </button>
              <button
                onClick={togglePause}
                style={controlButtonStyle}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.amber;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,176,32,0.2)';
                }}
              >
                {paused ? '▶ CONTINUAR' : '⏸ PAUSA'}
              </button>
              <button
                onClick={moveRight}
                style={controlButtonStyle}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.red;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(224,30,55,0.2)';
                }}
              >
                DERECHA →
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - Top Scores */}
        {!isMobile && (
          <TopScoresSidebar scores={topScores} currentScore={score} />
        )}
      </div>

      {/* Scores Modal */}
      {showScores && (
        <ScoresModal
          scores={topScores}
          onClose={() => setShowScores(false)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

const controlButtonStyle = {
  padding: '12px 20px',
  borderRadius: 12,
  border: `1px solid ${COLORS.border}`,
  background: 'rgba(224,30,55,0.2)',
  color: COLORS.white,
  fontWeight: 800,
  fontSize: 14,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontFamily: 'ui-monospace, monospace',
  letterSpacing: '0.5px',
};

function HudCard({ label, value, icon, isMobile }) {
  return (
    <div
      style={{
        background: COLORS.panelDark,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: isMobile ? 12 : 14,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: 10,
          letterSpacing: '1.2px',
          color: COLORS.white40,
          fontWeight: 800,
          marginBottom: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontFamily: 'APERCU, sans-serif',
          fontSize: isMobile ? 18 : 22,
          fontWeight: 900,
          color: COLORS.white,
          letterSpacing: '-0.5px',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function StartOverlay({ isMobile, onStart }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 100,
      }}
    >
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div
          style={{
            fontFamily: 'APERCU, sans-serif',
            fontSize: isMobile ? 28 : 36,
            fontWeight: 900,
            color: COLORS.white,
            marginBottom: 16,
            letterSpacing: '-1px',
          }}
        >
          ¿Listo para la carrera?
        </div>
        <div
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 13,
            color: COLORS.white70,
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Usa ← → o A/D para moverte
          <br />
          ESPACIO para pausar
        </div>
        <button
          onClick={onStart}
          style={{
            padding: '16px 32px',
            borderRadius: 12,
            border: 'none',
            background: COLORS.red,
            color: COLORS.white,
            fontWeight: 900,
            fontSize: 16,
            cursor: 'pointer',
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '1px',
          }}
        >
          🏁 EMPEZAR
        </button>
      </div>
    </div>
  );
}

function PausedOverlay({ isMobile }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          fontFamily: 'APERCU, sans-serif',
          fontSize: isMobile ? 32 : 48,
          fontWeight: 900,
          color: COLORS.white,
          letterSpacing: '-1.5px',
        }}
      >
        ⏸ PAUSA
      </div>
    </div>
  );
}

function GameOverOverlay({
  score,
  best,
  picked,
  isMobile,
  onRestart,
  onViewScores,
}) {
  const isNewRecord = score === best && score > 0;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 100,
      }}
    >
      <div style={{ textAlign: 'center', padding: 20, maxWidth: 400 }}>
        <div
          style={{
            fontFamily: 'APERCU, sans-serif',
            fontSize: isMobile ? 32 : 44,
            fontWeight: 900,
            color: COLORS.red,
            marginBottom: 8,
            letterSpacing: '-1.5px',
          }}
        >
          ¡GOLPE!
        </div>
        {isNewRecord && (
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 14,
              color: COLORS.green,
              fontWeight: 900,
              marginBottom: 16,
              letterSpacing: '1px',
            }}
          >
            🏆 ¡NUEVO RÉCORD!
          </div>
        )}
        <div
          style={{
            background: COLORS.panelDark,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 14,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 12,
              color: COLORS.white40,
              marginBottom: 8,
              letterSpacing: '1px',
            }}
          >
            TU PUNTUACIÓN
          </div>
          <div
            style={{
              fontFamily: 'APERCU, sans-serif',
              fontSize: isMobile ? 36 : 48,
              fontWeight: 900,
              color: COLORS.white,
              letterSpacing: '-1.5px',
            }}
          >
            {formatScore(score)}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 20,
              justifyContent: 'center',
              marginTop: 16,
              fontSize: 13,
              color: COLORS.white70,
            }}
          >
            <div>⚙️ {picked} piezas</div>
            <div>🏆 Récord: {formatScore(best)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={onRestart}
            style={{
              padding: '14px 28px',
              borderRadius: 12,
              border: 'none',
              background: COLORS.red,
              color: COLORS.white,
              fontWeight: 900,
              fontSize: 15,
              cursor: 'pointer',
              fontFamily: 'ui-monospace, monospace',
              letterSpacing: '1px',
            }}
          >
            🔄 JUGAR DE NUEVO
          </button>
          <button
            onClick={onViewScores}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              border: `1px solid ${COLORS.border}`,
              background: 'transparent',
              color: COLORS.white70,
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            📊 VER PUNTUACIONES
          </button>
        </div>
      </div>
    </div>
  );
}

function TopScoresSidebar({ scores, currentScore }) {
  return (
    <div
      style={{
        width: 300,
        background: COLORS.panelDark,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 18,
        padding: 20,
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          fontFamily: 'APERCU, sans-serif',
          fontSize: 20,
          fontWeight: 900,
          color: COLORS.white,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          letterSpacing: '-0.5px',
        }}
      >
        <IconTrophy size={24} color={COLORS.amber} />
        TOP 10
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {scores.length === 0 ? (
          <div
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: 12,
              color: COLORS.white40,
              textAlign: 'center',
              padding: '40px 20px',
            }}
          >
            No hay puntuaciones aún.
            <br />
            ¡Sé el primero!
          </div>
        ) : (
          scores.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                background:
                  i === 0 ? 'rgba(255,176,32,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 0 ? COLORS.amber : COLORS.border}`,
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontFamily: 'APERCU, sans-serif',
                  fontSize: 16,
                  fontWeight: 900,
                  color: i === 0 ? COLORS.amber : COLORS.white70,
                  minWidth: 24,
                }}
              >
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: 'APERCU, sans-serif',
                    fontSize: 18,
                    fontWeight: 900,
                    color: COLORS.white,
                    letterSpacing: '-0.5px',
                  }}
                >
                  {formatScore(s.score)}
                </div>
                <div
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: 10,
                    color: COLORS.white40,
                  }}
                >
                  {new Date(s.date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ScoresModal({ scores, onClose, isMobile }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: COLORS.bgDark,
          border: `2px solid ${COLORS.red}`,
          borderRadius: 18,
          padding: isMobile ? 20 : 30,
          maxWidth: 500,
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontFamily: 'APERCU, sans-serif',
              fontSize: isMobile ? 24 : 28,
              fontWeight: 900,
              color: COLORS.white,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <IconTrophy size={28} color={COLORS.amber} />
            TOP 10 PUNTUACIONES
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: '8px 12px',
              color: COLORS.white,
              cursor: 'pointer',
              fontSize: 18,
              fontWeight: 900,
            }}
          >
            ✕
          </button>
        </div>

        <TopScoresSidebar scores={scores} />
      </div>
    </div>
  );
}
