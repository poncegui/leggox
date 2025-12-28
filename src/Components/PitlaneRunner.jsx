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

/** ---------------- THEME TOKENS ---------------- */
const COLORS = {
  bg: '#0B0B0B',
  panel: 'rgba(255,255,255,0.06)',
  panel2: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.14)',
  borderSoft: 'rgba(255,255,255,0.10)',
  white: '#FFFFFF',
  white70: 'rgba(255,255,255,0.70)',
  white55: 'rgba(255,255,255,0.55)',
  red: '#E01E37',
  green: '#2BD576',
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
        background: `radial-gradient(1200px 600px at 20% -10%, rgba(224,30,55,0.18), transparent 55%),
                     radial-gradient(900px 500px at 110% 10%, rgba(43,213,118,0.14), transparent 55%),
                     ${COLORS.bg}`,
        padding: pagePad,
        color: COLORS.white,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
        minHeight: 480,
        borderRadius: 18,
        margin: isMobile ? '18px auto' : '32px auto',
        maxWidth: isMobile ? '100vw' : 620,
        width: isMobile ? '100vw' : undefined,
        overflowX: isMobile ? 'hidden' : undefined,
        boxShadow: '0 18px 60px rgba(0,0,0,0.28)',
        border: `1px solid ${COLORS.borderSoft}`,
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
      },
      subtitle: {
        color: COLORS.white70,
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
        background: COLORS.panel,
        border: `1px solid ${COLORS.borderSoft}`,
        borderRadius: 14,
        padding: isMobile ? '10px 10px' : '10px 12px',
        minWidth: 0,
        boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(10px)',
      },
      hudLabel: {
        color: COLORS.white55,
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
      },
      hudSub: {
        color: COLORS.white55,
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
        borderRadius: 18,
        border: `1px solid ${COLORS.border}`,
        background: `linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
        boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
      },
      laneLines: { position: 'absolute', inset: 0, pointerEvents: 'none' },

      obj: {
        position: 'absolute',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid',
        fontSize: 20,
        boxShadow: '0 10px 18px rgba(0,0,0,0.22)',
        backdropFilter: 'blur(8px)',
      },
      obstacle: {
        background: 'rgba(255,176,32,0.16)',
        borderColor: 'rgba(255,176,32,0.36)',
      },
      pickup: {
        background: 'rgba(43,213,118,0.14)',
        borderColor: 'rgba(43,213,118,0.36)',
      },

      car: {
        position: 'absolute',
        borderRadius: 16,
        background: 'rgba(224,30,55,0.18)',
        border: '1px solid rgba(224,30,55,0.38)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 46,
        boxShadow: '0 18px 30px rgba(0,0,0,0.30)',
        backdropFilter: 'blur(10px)',
        transform: 'translateZ(0)',
        // Si quieres animación al cambiar de carril:
        // transition: "left 90ms ease-out",
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
        background: 'rgba(0,0,0,0.22)',
        zIndex: 3,
        padding: 18,
        textAlign: 'center',
      },
      bigTitle: {
        fontSize: isMobile ? 34 : 40,
        fontWeight: 950,
        letterSpacing: 2,
        lineHeight: '42px',
      },
      centerHint: {
        marginTop: 10,
        color: COLORS.white70,
        fontSize: isMobile ? 16 : 18,
        lineHeight: isMobile ? '22px' : '24px',
        fontWeight: 750,
        maxWidth: 520,
      },
      centerHint2: {
        marginTop: 8,
        color: COLORS.white55,
        fontSize: 12,
        lineHeight: '16px',
      },

      pauseOverlay: {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.30)',
        zIndex: 4,
      },
      pausePill: {
        padding: '10px 14px',
        borderRadius: 999,
        border: `1px solid ${COLORS.borderSoft}`,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(10px)',
        fontWeight: 900,
        letterSpacing: 2,
      },

      buttons: {
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 120px',
        gap: 10,
        marginTop: 10,
      },
      btn: {
        padding: '12px 14px',
        borderRadius: 14,
        fontWeight: 900,
        fontSize: 14,
        cursor: 'pointer',
        border: '1px solid transparent',
        transition: 'transform 120ms ease, filter 120ms ease',
      },
      btnPrimary: {
        background: COLORS.red,
        borderColor: 'rgba(224,30,55,0.65)',
        color: COLORS.white,
      },
      btnSecondary: {
        background: 'rgba(255,255,255,0.92)',
        borderColor: 'rgba(255,255,255,0.92)',
        color: '#111',
      },
      btnGhost: {
        background: 'rgba(255,255,255,0.06)',
        borderColor: COLORS.border,
        color: COLORS.white70,
      },

      smallNote: {
        marginTop: 12,
        color: COLORS.white55,
        fontSize: 12,
        lineHeight: '16px',
        textAlign: 'center',
        padding: 10,
        borderRadius: 14,
        border: `1px solid ${COLORS.borderSoft}`,
        background: COLORS.panel2,
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
              onMouseDown={e =>
                (e.currentTarget.style.transform = 'scale(0.98)')
              }
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {gameOver ? 'Reiniciar' : 'Empezar'}
            </button>
          ) : (
            <button
              onClick={togglePause}
              style={{ ...S.btn, ...S.btnSecondary }}
              onMouseDown={e =>
                (e.currentTarget.style.transform = 'scale(0.98)')
              }
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
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
