import React, { useEffect, useMemo, useRef, useState } from 'react';

/** ---------------- CONFIG ---------------- */
const LANES = 3;
const TICK_MS = 16; // ~60fps
const SPAWN_EVERY_TICKS = 38; // densidad de objetos
const BASE_SPEED = 5; // velocidad "normal" (luego sube con score)
const PICKUP_CHANCE = 0.25;

// Arranque progresivo
const START_SPEED = 2.1; // velocidad inicial (más lenta)
const RAMP_SECONDS = 12; // segundos para llegar al ritmo "normal"

/** -------- THEME TOKENS - ENHANCED MODERN DESIGN -------- */
const COLORS = {
  bg: '#0A0E27',
  bgGrad: 'linear-gradient(135deg, #0A0E27 0%, #1a1a3e 50%, #0A0E27 100%)',
  panel: 'rgba(255,255,255,0.08)',
  panel2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.16)',
  borderSoft: 'rgba(255,255,255,0.12)',
  white: '#FFFFFF',
  white70: 'rgba(255,255,255,0.70)',
  white55: 'rgba(255,255,255,0.55)',
  red: '#FF0040',
  green: '#00FF88',
  amber: '#FFB020',
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
// easing suave
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

export default function PitlaneRunner({
  title = 'LEGGOX Race',
  subtitle = 'Esquiva conos, recoge piezas y bate tu récord',
}) {
  /** ---------------- Responsive width (SSR safe) ---------------- */
  const [width, setWidth] = useState(1024);
  useEffect(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
    setWidth(w);
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = width < 720;

  /** ---------------- Game state ---------------- */
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [lane, setLane] = useState(1);
  const [objects, setObjects] = useState([]); // {id, lane, y, kind}
  const [tick, setTick] = useState(0);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [picked, setPicked] = useState(0);

  /** ---------------- Refs to avoid stale closures ---------------- */
  const intervalRef = useRef(null);
  const runningRef = useRef(running);
  const pausedRef = useRef(paused);

  useEffect(() => {
    runningRef.current = running;
    pausedRef.current = paused;
  }, [running, paused]);

  const TRACK = useMemo(() => {
    const trackWidth = clamp(width - (isMobile ? 24 : 32), 320, 560);
    const trackHeight = isMobile ? 520 : 640;
    const laneWidth = Math.floor(trackWidth / LANES);

    const carW = Math.floor(laneWidth * 0.62);
    const carH = isMobile ? 56 : 64;

    const objW = Math.floor(laneWidth * 0.56);
    const objH = isMobile ? 44 : 48;

    return { trackWidth, trackHeight, laneWidth, carW, carH, objW, objH };
  }, [width, isMobile]);

  /** ---------------- Progressive speed ---------------- */
  const speed = useMemo(() => {
    // dificultad normal según score
    const extra = Math.floor(score / 140);
    const target = BASE_SPEED + extra;

    // rampa suave los primeros RAMP_SECONDS
    const rampTicks = Math.max(1, Math.floor((RAMP_SECONDS * 1000) / TICK_MS));
    const t = clamp(tick / rampTicks, 0, 1);
    const eased = smoothstep(t);

    // mezcla: empieza en START_SPEED y llega a target
    return START_SPEED + (target - START_SPEED) * eased;
  }, [score, tick]);

  function resetGame() {
    setObjects([]);
    setLane(1);
    setTick(0);
    setScore(0);
    setPicked(0);
    setGameOver(false);
    setPaused(false);
    setRunning(true);
  }

  function stopGame() {
    setRunning(false);
    setPaused(false);
    setGameOver(true);
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

  /** ---------------- Tick loop (spawn consistent) ---------------- */
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

        setScore(s => s + 1);
        return t;
      });
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, speed, TRACK.trackHeight]);

  /** ---------------- Collisions ---------------- */
  useEffect(() => {
    if (!running || paused || gameOver) return;

    const carY = TRACK.trackHeight - (isMobile ? 108 : 118);
    const hit = objects.find(o => {
      if (o.lane !== lane) return false;
      const dy = Math.abs(o.y - carY);
      return dy < (isMobile ? 32 : 34);
    });

    if (!hit) return;

    if (hit.kind === 'pickup') {
      setPicked(p => p + 1);
      setScore(s => s + 25);
      setObjects(prev => prev.filter(o => o.id !== hit.id));
      return;
    }

    setBest(b => Math.max(b, score));
    stopGame();
  }, [
    objects,
    lane,
    running,
    paused,
    gameOver,
    TRACK.trackHeight,
    isMobile,
    score,
  ]);

  /** ---------------- Keyboard (web) ---------------- */
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
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [running, paused, gameOver]);

  /** ---------------- Swipe touch (mobile) ---------------- */
  // Para swipe: guardamos posición inicial y final del toque
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Detectar swipe en móvil
  function handleTouchStart(e) {
    if (!isMobile) return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchEndX.current = null;
  }

  function handleTouchMove(e) {
    if (!isMobile) return;
    const touch = e.touches[0];
    touchEndX.current = touch.clientX;
  }

  function handleTouchEnd() {
    if (!isMobile || touchStartX.current === null || touchEndX.current === null)
      return;
    const dx = touchEndX.current - touchStartX.current;
    const threshold = 40; // píxeles mínimos para considerar swipe
    if (dx > threshold) {
      moveRight();
    } else if (dx < -threshold) {
      moveLeft();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }

  /** ---------------- UI helpers ---------------- */
  const statusText = useMemo(() => {
    if (!running && !gameOver) return 'Pulsa “Empezar”';
    if (paused) return 'Pausa';
    if (gameOver) return '¡Golpe! Fin de carrera';
    return 'En carrera';
  }, [running, paused, gameOver]);

  const trackPadding = 10;
  const laneX = l =>
    trackPadding +
    l * TRACK.laneWidth +
    Math.floor((TRACK.laneWidth - TRACK.objW) / 2);
  const carX =
    trackPadding +
    lane * TRACK.laneWidth +
    Math.floor((TRACK.laneWidth - TRACK.carW) / 2);
  const carY = TRACK.trackHeight - (isMobile ? 108 : 118);

  /** ---------------- Styles ---------------- */
  const S = useMemo(() => {
    const pagePad = isMobile ? 14 : 18;

    return {
      page: {
        background: '#FFFFFF',
        backgroundAttachment: 'fixed',
        padding: pagePad,
        color: '#000000',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
        minHeight: 480,
        borderRadius: 24,
        margin: isMobile ? '18px auto' : '32px auto',
        maxWidth: isMobile ? '100vw' : 620,
        width: isMobile ? '100vw' : undefined,
        overflowX: isMobile ? 'hidden' : undefined,
        boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
        border: '2px solid #E0E0E0',
        backdropFilter: 'none',
      },

      headerRow: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 12,
        flexWrap: 'wrap',
      },
      titleBlock: { minWidth: 220 },
      kicker: {
        fontSize: isMobile ? 18 : 20,
        fontWeight: 900,
        letterSpacing: 0.8,
        lineHeight: '24px',
        color: '#000000',
      },
      subtitle: {
        color: '#666666',
        fontSize: isMobile ? 12.5 : 13,
        lineHeight: '18px',
        marginTop: 4,
        maxWidth: 520,
      },

      hud: {
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))',
        gap: isMobile ? 10 : 12,
        marginTop: 10,
        marginBottom: 14,
      },
      hudCard: {
        background: '#F5F5F5',
        border: '1.5px solid #DDDDDD',
        borderRadius: 16,
        padding: isMobile ? '12px 11px' : '13px 14px',
        minWidth: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        backdropFilter: 'none',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      hudLabel: {
        color: '#999999',
        fontSize: 11,
        letterSpacing: 1.1,
        fontWeight: 800,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      hudValue: {
        marginTop: 6,
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 10,
      },
      hudMain: {
        fontSize: isMobile ? 16 : 17,
        fontWeight: 900,
        letterSpacing: 0.2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: '#000000',
      },
      hudSub: {
        color: '#999999',
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: 'nowrap',
      },

      trackWrap: { padding: isMobile ? 6 : 8 },
      track: {
        position: 'relative',
        margin: '0 auto',
        marginBottom: 14,
        overflow: 'hidden',
        borderRadius: 20,
        border: '1.5px solid #444444',
        background: '#1a1a1a',
        boxShadow:
          '0 20px 50px rgba(0,0,0,0.35), inset 0 0 2px rgba(0,0,0,0.5)',
        backdropFilter: 'none',
      },
      laneLines: { position: 'absolute', inset: 0, pointerEvents: 'none' },

      obj: {
        position: 'absolute',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1.5px solid',
        fontSize: isMobile ? 18 : 20,
        boxShadow:
          '0 12px 24px rgba(0,0,0,0.28), inset 0 1px 2px rgba(255,255,255,0.12)',
        backdropFilter: 'blur(10px)',
      },
      obstacle: {
        background:
          'linear-gradient(135deg, rgba(255,176,32,0.22) 0%, rgba(255,176,32,0.12) 100%)',
        borderColor: 'rgba(255,176,32,0.55)',
        boxShadow:
          '0 12px 24px rgba(0,0,0,0.28), 0 0 20px rgba(255,176,32,0.15), inset 0 1px 2px rgba(255,255,255,0.12)',
      },
      pickup: {
        background:
          'linear-gradient(135deg, rgba(43,213,118,0.22) 0%, rgba(43,213,118,0.12) 100%)',
        borderColor: 'rgba(43,213,118,0.55)',
        boxShadow:
          '0 12px 24px rgba(0,0,0,0.28), 0 0 20px rgba(43,213,118,0.15), inset 0 1px 2px rgba(255,255,255,0.12)',
      },

      car: {
        position: 'absolute',
        borderRadius: 18,
        background:
          'linear-gradient(135deg, rgba(255,0,64,0.25) 0%, rgba(255,0,64,0.12) 100%)',
        border: '1.5px solid rgba(255,0,64,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 46,
        boxShadow:
          '0 20px 40px rgba(255,0,64,0.35), 0 0 30px rgba(255,0,64,0.2), inset 0 1px 2px rgba(255,255,255,0.15)',
        backdropFilter: 'blur(12px)',
        transform: 'translateZ(0)',
        transition:
          'left 110ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
      },

      touchRow: { position: 'absolute', inset: 0, display: 'flex', zIndex: 2 },
      touchHalf: {
        flex: 1,
        cursor: 'pointer',
        background: 'transparent',
        border: 'none',
        outline: 'none',
      },

      overlay: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 3,
        padding: 18,
        textAlign: 'center',
        backdropFilter: 'blur(6px)',
      },
      bigTitle: {
        fontSize: isMobile ? 34 : 40,
        fontWeight: 950,
        letterSpacing: 2,
        lineHeight: '42px',
        textShadow: 'none',
        color: '#FFFFFF',
      },
      centerHint: {
        marginTop: 10,
        color: '#BBBBBB',
        fontSize: isMobile ? 16 : 18,
        lineHeight: isMobile ? '22px' : '24px',
        fontWeight: 750,
        maxWidth: 520,
      },
      centerHint2: {
        marginTop: 8,
        color: '#999999',
        fontSize: 12,
        lineHeight: '16px',
      },

      pauseOverlay: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        zIndex: 4,
        backdropFilter: 'blur(6px)',
      },
      pausePill: {
        padding: '12px 18px',
        borderRadius: 999,
        border: '1.5px solid #555555',
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(14px)',
        fontWeight: 900,
        letterSpacing: 2.5,
        fontSize: 16,
        color: COLORS.white,
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.1)',
      },

      buttons: {
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 120px',
        gap: 10,
        marginTop: 10,
      },
      btn: {
        padding: '13px 16px',
        borderRadius: 16,
        fontWeight: 900,
        fontSize: 14,
        letterSpacing: 0.5,
        cursor: 'pointer',
        border: '1.5px solid',
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow:
          '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.1)',
      },
      btnPrimary: {
        background: `linear-gradient(135deg, ${COLORS.red} 0%, rgba(255,0,64,0.8) 100%)`,
        borderColor: 'rgba(255,0,64,0.7)',
        color: COLORS.white,
        boxShadow:
          '0 8px 24px rgba(255,0,64,0.3), inset 0 1px 2px rgba(255,255,255,0.1)',
      },
      btnSecondary: {
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.88) 100%)',
        borderColor: 'rgba(255,255,255,0.8)',
        color: '#050505',
        boxShadow:
          '0 8px 24px rgba(255,255,255,0.2), inset 0 1px 2px rgba(255,255,255,0.3)',
      },
      btnGhost: {
        background: 'rgba(255,255,255,0.08)',
        borderColor: 'rgba(255,255,255,0.18)',
        color: COLORS.white70,
        boxShadow:
          '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.06)',
      },

      smallNote: {
        marginTop: 12,
        color: '#666666',
        fontSize: 12,
        lineHeight: '16px',
        textAlign: 'center',
        padding: 12,
        borderRadius: 16,
        border: '1.5px solid #E0E0E0',
        background: '#F9F9F9',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        backdropFilter: 'none',
      },
    };
  }, [isMobile]);

  /** ---------------- Render ---------------- */
  return (
    <div style={S.page} aria-label="Juego Pitlane Runner">
      {/* Header */}
      <div style={S.headerRow}>
        <div style={S.titleBlock}>
          <div style={S.kicker}>{title}</div>
          <div style={S.subtitle}>{subtitle}</div>
        </div>
      </div>

      {/* HUD */}
      <div style={S.hud}>
        <div style={S.hudCard}>
          <div style={S.hudLabel}>Estado</div>
          <div style={S.hudValue}>
            <div style={S.hudMain}>{statusText}</div>
            <div style={S.hudSub}>{paused ? '⏸' : running ? '▶' : '⏺'}</div>
          </div>
        </div>

        <div style={S.hudCard}>
          <div style={S.hudLabel}>Puntos</div>
          <div style={S.hudValue}>
            <div style={S.hudMain}>{formatScore(score)}</div>
            <div style={S.hudSub}>+1/tick</div>
          </div>
        </div>

        <div style={S.hudCard}>
          <div style={S.hudLabel}>Piezas</div>
          <div style={S.hudValue}>
            <div style={S.hudMain}>{picked}</div>
            <div style={S.hudSub}>+25</div>
          </div>
        </div>

        <div style={S.hudCard}>
          <div style={S.hudLabel}>Récord</div>
          <div style={S.hudValue}>
            <div style={S.hudMain}>{formatScore(best)}</div>
            <div style={S.hudSub}>🏁</div>
          </div>
        </div>
      </div>

      {/* Track */}
      <div style={S.trackWrap}>
        <div
          style={{
            ...S.track,
            width: TRACK.trackWidth,
            height: TRACK.trackHeight,
          }}
        >
          {/* Lane lines */}
          <div style={S.laneLines} aria-hidden="true">
            {[1, 2].map(i => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: i * TRACK.laneWidth,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: 'rgba(255,255,255,0.10)',
                }}
              />
            ))}
          </div>

          {/* Objects */}
          {objects.map(o => (
            <div
              key={o.id}
              style={{
                ...S.obj,
                ...(o.kind === 'pickup' ? S.pickup : S.obstacle),
                width: TRACK.objW,
                height: TRACK.objH,
                left: laneX(o.lane),
                top: o.y,
              }}
            >
              <span aria-hidden="true">
                {o.kind === 'pickup' ? '⚙️' : '⛔'}
              </span>
            </div>
          ))}

          {/* Car */}
          <div
            style={{
              ...S.car,
              width: TRACK.carW,
              height: TRACK.carH,
              left: carX,
              top: carY,
            }}
            aria-label="Coche"
          >
            <span role="img" aria-label="Coche">
              🚗
            </span>
          </div>

          {/* Swipe touch: solo en móvil, sin botones */}
          {isMobile && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                background: 'transparent',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              aria-label="Zona táctil para swipe"
            />
          )}

          {/* Overlays */}
          {!running && (
            <div style={S.overlay}>
              <div style={S.bigTitle}>{gameOver ? 'FIN' : 'LISTO'}</div>
              <div style={S.centerHint}>
                {gameOver
                  ? 'Pulsa Reiniciar para intentarlo otra vez'
                  : 'Esquiva ⛔ y recoge ⚙️'}
              </div>
              <div style={S.centerHint2}>
                Web: ← → para moverte · Espacio para pausar · Enter para empezar
              </div>
            </div>
          )}

          {paused && running && (
            <div style={S.pauseOverlay} aria-label="Pausa">
              <div style={S.pausePill}>PAUSA</div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={S.buttons}>
          {!running ? (
            <button
              onClick={resetGame}
              style={{ ...S.btn, ...S.btnPrimary }}
              onMouseDown={e => {
                e.currentTarget.style.transform = 'scale(0.96)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(255,0,64,0.2), inset 0 1px 2px rgba(0,0,0,0.2)';
              }}
              onMouseUp={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 8px 24px rgba(255,0,64,0.3), inset 0 1px 2px rgba(255,255,255,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 8px 24px rgba(255,0,64,0.3), inset 0 1px 2px rgba(255,255,255,0.1)';
              }}
            >
              {gameOver ? 'Reiniciar' : 'Empezar'}
            </button>
          ) : (
            <button
              onClick={togglePause}
              style={{ ...S.btn, ...S.btnSecondary }}
              onMouseDown={e => {
                e.currentTarget.style.transform = 'scale(0.96)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(255,255,255,0.1), inset 0 1px 2px rgba(0,0,0,0.2)';
              }}
              onMouseUp={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 8px 24px rgba(255,255,255,0.2), inset 0 1px 2px rgba(255,255,255,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 8px 24px rgba(255,255,255,0.2), inset 0 1px 2px rgba(255,255,255,0.3)';
              }}
            >
              {paused ? 'Reanudar' : 'Pausar'}
            </button>
          )}

          <button
            onClick={() => {
              setBest(b => Math.max(b, score));
              setRunning(false);
              setPaused(false);
              setGameOver(false);
              setScore(0);
              setPicked(0);
              setObjects([]);
              setLane(1);
              setTick(0);
            }}
            style={{ ...S.btn, ...S.btnGhost }}
            onMouseDown={e => {
              e.currentTarget.style.transform = 'scale(0.96)';
              e.currentTarget.style.boxShadow =
                '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 2px rgba(0,0,0,0.2)';
            }}
            onMouseUp={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow =
                '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.06)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow =
                '0 8px 24px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.06)';
            }}
          >
            Salir
          </button>
        </div>

        <div style={S.smallNote}>
          Bonus: cada ⚙️ vale +25 puntos. Ideal para amenizar mientras cargan
          catálogos o como sección de comunidad.
        </div>
      </div>
    </div>
  );
}
