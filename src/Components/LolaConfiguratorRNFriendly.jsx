import React, { useMemo, useState } from 'react';

/**
 * LOLA GUN STUDIO - ONLY 7 COLLECTION
 * Gallery-style configurator (React / React Native friendly)
 * - Each combination limited to 7 pieces
 * - Handcrafted, stamped, numbered
 * - Latin nomenclature
 * - Gallery aesthetic (not ecommerce)
 */

const COLORS = {
  bg: '#F6EFE6',
  ink: '#000000',
  ink70: 'rgba(0,0,0,0.70)',
  ink40: 'rgba(0,0,0,0.40)',
  ink20: 'rgba(0,0,0,0.20)',
  ink10: 'rgba(0,0,0,0.10)',
  panel: 'rgba(255,255,255,0.35)',
  line: '#A9D6E5',
  red: '#C23B3B',
};

const COLLECTION_NAME = 'ONLY 7 COLLECTION';
const COLLECTION_TAGLINE = 'ONLY 7 — EACH ONE UNIQUE';

// Base de datos de disponibilidad (simulada)
// Cada combinación MODEL + FORMAT + SUPPORT tiene un contador de 7 piezas
const INVENTORY_DB = {
  'ORIGO-MENSUS_LINEA-METALLUM_NIGRUM': { sold: 3, total: 7 },
  'ORIGO-MENSUS_LINEA-METALLUM_CHROMA': { sold: 0, total: 7 },
  'ORIGO-MENSUS_LINEA-ACRYLICUM_TRANSLUCIDUM': { sold: 5, total: 7 },
  'ORIGO-MENSUS_LINEA-LIGNUM_ROBUR': { sold: 7, total: 7 }, // SOLD OUT

  'FORMA-MENSUS_QUADRATA-METALLUM_NIGRUM': { sold: 1, total: 7 },
  'FORMA-MENSUS_QUADRATA-METALLUM_CHROMA': { sold: 2, total: 7 },
  'FORMA-MENSUS_QUADRATA-ACRYLICUM_TRANSLUCIDUM': { sold: 0, total: 7 },
  'FORMA-MENSUS_QUADRATA-LIGNUM_ROBUR': { sold: 4, total: 7 },

  'MOTUS-MENSUS_ORBIS-METALLUM_NIGRUM': { sold: 3, total: 7 },
  'MOTUS-MENSUS_ORBIS-METALLUM_CHROMA': { sold: 6, total: 7 },
  'MOTUS-MENSUS_ORBIS-ACRYLICUM_TRANSLUCIDUM': { sold: 2, total: 7 },
  'MOTUS-MENSUS_ORBIS-LIGNUM_ROBUR': { sold: 7, total: 7 }, // SOLD OUT

  'ESSENTIA-MENSUS_CAPSULA-METALLUM_NIGRUM': { sold: 0, total: 7 },
  'ESSENTIA-MENSUS_CAPSULA-METALLUM_CHROMA': { sold: 1, total: 7 },
  'ESSENTIA-MENSUS_CAPSULA-ACRYLICUM_TRANSLUCIDUM': { sold: 5, total: 7 },
  'ESSENTIA-MENSUS_CAPSULA-LIGNUM_ROBUR': { sold: 3, total: 7 },
};

// Función para obtener disponibilidad
function getAvailability(modelId, formatId, supportId) {
  const key = `${modelId}-${formatId}-${supportId}`;
  const inventory = INVENTORY_DB[key];

  if (!inventory) {
    // Si no existe en DB, asumimos disponible
    return { available: true, sold: 0, total: 7, remaining: 7 };
  }

  const remaining = inventory.total - inventory.sold;
  return {
    available: remaining > 0,
    sold: inventory.sold,
    total: inventory.total,
    remaining,
  };
}

const MODELS = [
  {
    id: 'ORIGO',
    label: 'ORIGO',
    tagline: 'the origin of the series',
    latinBase: 'BASIS LINEA',
    format: 'MENSUS LINEA',
    meta: 'Rectangular · 120 × 60 cm · metacrilato óptico',
  },
  {
    id: 'FORMA',
    label: 'FORMA',
    tagline: 'structure defines the piece',
    latinBase: 'BASIS QUADRATA',
    format: 'MENSUS_QUADRATA',
    meta: 'Cuadrada · 80 × 80 cm · bordes pulidos',
  },
  {
    id: 'MOTUS',
    label: 'MOTUS',
    tagline: 'controlled movement',
    latinBase: 'BASIS ORBIS',
    format: 'MENSUS ORBIS',
    meta: 'Redonda · Ø 90 cm · metacrilato óptico',
  },
  {
    id: 'ESSENTIA',
    label: 'ESSENTIA',
    tagline: 'only what matters',
    latinBase: 'BASIS CAPSULA',
    format: 'MENSUS_CAPSULA',
    meta: 'Cápsula · 120 × 50 cm · efecto galería',
  },
];

const SUPPORTS = [
  {
    id: 'metal-black',
    title: 'Metal negro mate',
    meta: 'Industrial · estable',
    latinSupport: 'METALLUM NIGRUM',
  },
  {
    id: 'metal-chrome',
    title: 'Metal cromado',
    meta: 'Brillo · premium',
    latinSupport: 'METALLUM CHROMA',
  },
  {
    id: 'acrylic-clear',
    title: 'Metacrilato transparente',
    meta: 'Minimal · efecto flotante',
    latinSupport: 'ACRYLICUM TRANSLUCIDUM',
  },
  {
    id: 'wood-oak',
    title: 'Madera roble',
    meta: 'Cálido · contraste',
    latinSupport: 'LIGNUM ROBUR',
  },
];

const MATERIA_OPTIONS = [
  {
    id: 'CURATA',
    title: 'Studio curated',
    meta: 'Vosotros aportáis materiales/ingredientes',
    latinMateria: 'MATERIA CURATA',
  },
  {
    id: 'PROPRIA',
    title: 'Client provided',
    meta: 'Me dais instrucciones de envío',
    latinMateria: 'MATERIA PROPRIA',
  },
];

const LOLA_DESIGNS = [
  { id: 'DESIGN_I', label: 'DESIGN I', meta: 'Composición clásica' },
  { id: 'DESIGN_II', label: 'DESIGN II', meta: 'Estilo moderno' },
  { id: 'DESIGN_III', label: 'DESIGN III', meta: 'Minimalista' },
];

function formatEUR(amount) {
  const n = Number(amount || 0);
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

/** RN-like primitives */
function Container({ children, style }) {
  return <div style={{ ...styles.container, ...style }}>{children}</div>;
}
function Row({ children, style }) {
  return <div style={{ ...styles.row, ...style }}>{children}</div>;
}
function Column({ children, style }) {
  return <div style={{ ...styles.col, ...style }}>{children}</div>;
}
function Text({ children, style }) {
  return <div style={{ ...styles.text, ...style }}>{children}</div>;
}
function Mono({ children, style }) {
  return <div style={{ ...styles.mono, ...style }}>{children}</div>;
}
function Button({ children, onPress, disabled, style }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onPress}
      style={{
        ...styles.button,
        ...(disabled ? styles.buttonDisabled : {}),
        ...style,
      }}
    >
      {children}
    </button>
  );
}
function Card({ children, onPress, selected }) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        ...styles.card,
        ...(selected ? styles.cardSelected : {}),
      }}
    >
      {children}
    </button>
  );
}

function StepPill({ index, label, active, done, onPress, disabled }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onPress}
      disabled={disabled}
      style={{
        ...styles.stepPill,
        ...(active ? styles.stepPillActive : {}),
        ...(disabled ? styles.stepPillDisabled : {}),
      }}
    >
      <span
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 12,
        }}
      >
        {String(index).padStart(2, '0')}
      </span>
      <span style={{ marginLeft: 8, fontSize: 13 }}>{label}</span>
      <span style={{ marginLeft: 8, fontSize: 12 }}>{done ? '✓' : ''}</span>
    </button>
  );
}

function OptionList({ data, value, onChange, showRedDot }) {
  return (
    <div style={styles.grid}>
      {data.map(item => {
        const selected = value === item.id;
        return (
          <Card
            key={item.id}
            selected={selected}
            onPress={() => onChange(item.id)}
          >
            <Row
              style={{
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <Column style={{ flex: 1 }}>
                <Row style={{ alignItems: 'center', gap: 8 }}>
                  {showRedDot && selected && (
                    <span
                      aria-hidden="true"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: COLORS.red,
                      }}
                    />
                  )}
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: -0.2,
                    }}
                  >
                    {item.title || item.label}
                  </Text>
                </Row>
                <Text
                  style={{ fontSize: 13, color: COLORS.ink70, marginTop: 6 }}
                >
                  {item.meta || item.tagline}
                </Text>
              </Column>

              <div
                style={{
                  ...styles.badge,
                  ...(selected ? styles.badgeSelected : {}),
                }}
              >
                {selected ? 'Elegido' : 'Elegir'}
              </div>
            </Row>

            <Row style={{ marginTop: 14, alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  ...styles.radio,
                  ...(selected ? styles.radioSelected : {}),
                }}
              />
              <Text style={{ fontSize: 12, color: COLORS.ink70 }}>
                {selected ? 'Seleccionado' : 'Toca para seleccionar'}
              </Text>
            </Row>
          </Card>
        );
      })}
    </div>
  );
}

export default function LolaConfiguratorRNFriendly({
  onModelSelect,
  onCompletedChange,
}) {
  const [step, setStep] = useState(1);

  const [modelId, setModelId] = useState('');
  const [supportId, setSupportId] = useState('');
  const [materiaMode, setMateriaMode] = useState('');
  const [designId, setDesignId] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const selectedModel = useMemo(
    () => MODELS.find(x => x.id === modelId),
    [modelId]
  );
  const selectedSupport = useMemo(
    () => SUPPORTS.find(x => x.id === supportId),
    [supportId]
  );
  const selectedMateria = useMemo(
    () => MATERIA_OPTIONS.find(x => x.id === materiaMode),
    [materiaMode]
  );
  const selectedDesign = useMemo(
    () => LOLA_DESIGNS.find(x => x.id === designId),
    [designId]
  );

  // Calcular disponibilidad
  const availability = useMemo(() => {
    if (!modelId || !supportId) return null;
    return getAvailability(modelId, selectedModel?.format, supportId);
  }, [modelId, selectedModel?.format, supportId]);

  // Notificar al padre cuando cambia el modelo
  React.useEffect(() => {
    if (selectedModel?.id && onModelSelect) {
      onModelSelect(selectedModel.id);
    } else if (onModelSelect) {
      onModelSelect(null);
    }
  }, [selectedModel, onModelSelect]);

  // Notificar al padre cuando cambia isCompleted
  React.useEffect(() => {
    if (onCompletedChange) {
      onCompletedChange(isCompleted);
    }
  }, [isCompleted, onCompletedChange]);

  const canGo2 = Boolean(modelId);
  const canGo3 = Boolean(modelId && supportId);
  const needsDesign = materiaMode === 'CURATA';
  const canSubmit = Boolean(
    modelId &&
      supportId &&
      materiaMode &&
      (materiaMode === 'PROPRIA' || (materiaMode === 'CURATA' && designId)) &&
      availability?.available
  );

  function next() {
    setStep(s => Math.min(3, s + 1));
  }
  function prev() {
    setStep(s => Math.max(1, s - 1));
  }

  function submit() {
    if (!canSubmit) return;

    const payload = {
      collection: COLLECTION_NAME,
      model: selectedModel,
      support: selectedSupport,
      materia: selectedMateria,
      design: selectedDesign,
      stamp: `${selectedModel?.id} · ${selectedModel?.format}`,
      availability: availability,
      pieceNumber: `${availability.sold + 1}/7`,
    };

    console.log('ONLY 7 CONFIG:', payload);
    setIsCompleted(true);
  }

  // Si está completado, mostrar resumen final
  if (isCompleted) {
    return (
      <div style={styles.page}>
        <Container>
          <Column
            style={{
              gap: 24,
              alignItems: 'center',
              paddingTop: 60,
              paddingBottom: 60,
            }}
          >
            <Column style={{ gap: 8, alignItems: 'center' }}>
              <Mono
                style={{
                  fontSize: 11,
                  letterSpacing: 0.8,
                  color: COLORS.ink70,
                }}
              >
                CONFIGURATION COMPLETE
              </Mono>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  textAlign: 'center',
                  maxWidth: 480,
                }}
              >
                Now you are exclusive.
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 400,
                  color: COLORS.ink70,
                  textAlign: 'center',
                }}
              >
                This is yours.
              </Text>
            </Column>

            <div
              style={{
                border: `1px solid ${COLORS.ink20}`,
                borderRadius: 22,
                padding: 32,
                maxWidth: 480,
                backgroundColor: 'rgba(255,255,255,0.55)',
              }}
            >
              <Column style={{ gap: 16 }}>
                <Row style={{ alignItems: 'center', gap: 10 }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: COLORS.red,
                    }}
                  />
                  <Mono
                    style={{
                      fontSize: 11,
                      letterSpacing: 0.8,
                      color: COLORS.ink70,
                    }}
                  >
                    RESERVED
                  </Mono>
                </Row>

                <Mono
                  style={{
                    fontSize: 11,
                    letterSpacing: 0.8,
                    color: COLORS.ink70,
                  }}
                >
                  LOLA GUN STUDIO
                </Mono>
                <Mono
                  style={{
                    fontSize: 11,
                    letterSpacing: 0.8,
                    color: COLORS.ink70,
                  }}
                >
                  {COLLECTION_NAME}
                </Mono>

                <Mono
                  style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.3 }}
                >
                  {selectedModel?.id} · {selectedModel?.format}
                </Mono>

                <Mono style={{ fontSize: 15, color: COLORS.ink70 }}>
                  {selectedSupport?.latinSupport}
                </Mono>

                <div
                  style={{
                    height: 1,
                    backgroundColor: COLORS.ink20,
                    marginTop: 8,
                    marginBottom: 8,
                  }}
                />

                <Mono style={{ fontSize: 14, fontWeight: 700 }}>
                  ONLY 7 · {availability.sold + 1}/7
                </Mono>

                <Mono
                  style={{
                    fontSize: 12,
                    color: COLORS.ink70,
                    fontStyle: 'italic',
                  }}
                >
                  Handmade · Stamped · Numbered
                </Mono>
              </Column>
            </div>

            <Button
              onPress={() => {
                setIsCompleted(false);
                setModelId('');
                setSupportId('');
                setMateriaMode('');
                setDesignId('');
                setStep(1);
              }}
              style={{ marginTop: 20 }}
            >
              Configure Another Piece
            </Button>
          </Column>
        </Container>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Container>
        {/* Header */}
        <Column style={{ gap: 16 }}>
          <Mono
            style={{ fontSize: 11, letterSpacing: 0.8, color: COLORS.ink70 }}
          >
            {COLLECTION_NAME}
          </Mono>
          <Text style={styles.bigTitle}>{COLLECTION_TAGLINE}</Text>
          <div style={styles.line} />
          <Mono style={{ maxWidth: 720 }}>
            Each combination limited to 7 pieces.
            <br />
            <span style={{ color: 'rgba(0,0,0,0.9)' }}>
              Handmade · Stamped · Numbered
            </span>
          </Mono>

          {/* Step pills */}
          <Row style={styles.stepRow}>
            <StepPill
              index={1}
              label="Model"
              active={step === 1}
              done={Boolean(modelId)}
              onPress={() => setStep(1)}
              disabled={false}
            />
            <StepPill
              index={2}
              label="Support"
              active={step === 2}
              done={Boolean(supportId)}
              onPress={() => setStep(2)}
              disabled={!canGo2}
            />
            <StepPill
              index={3}
              label="Materia"
              active={step === 3}
              done={Boolean(materiaMode)}
              onPress={() => setStep(3)}
              disabled={!canGo3}
            />
          </Row>
        </Column>

        {/* Content + Summary */}
        <div style={styles.layout}>
          {/* Main */}
          <div style={styles.main}>
            {step === 1 && (
              <Column style={{ gap: 14 }}>
                <Text style={styles.sectionTitle}>01 · Select Model</Text>
                <OptionList
                  data={MODELS}
                  value={modelId}
                  onChange={id => setModelId(id)}
                  showRedDot={true}
                />
              </Column>
            )}

            {step === 2 && (
              <Column style={{ gap: 14 }}>
                <Text style={styles.sectionTitle}>02 · Select Support</Text>
                {!canGo2 ? (
                  <Text style={{ color: COLORS.ink70 }}>
                    First select a model to continue.
                  </Text>
                ) : (
                  <OptionList
                    data={SUPPORTS}
                    value={supportId}
                    onChange={id => setSupportId(id)}
                  />
                )}
              </Column>
            )}

            {step === 3 && (
              <Column style={{ gap: 14 }}>
                <Text style={styles.sectionTitle}>03 · Materia</Text>
                {!canGo3 ? (
                  <Text style={{ color: COLORS.ink70 }}>
                    Select model and support first.
                  </Text>
                ) : (
                  <>
                    <OptionList
                      data={MATERIA_OPTIONS}
                      value={materiaMode}
                      onChange={id => {
                        setMateriaMode(id);
                        setDesignId('');
                      }}
                    />

                    {materiaMode === 'CURATA' && (
                      <Column style={{ gap: 14, marginTop: 18 }}>
                        <Text style={{ fontSize: 14, fontWeight: 700 }}>
                          Select Studio Design
                        </Text>
                        <OptionList
                          data={LOLA_DESIGNS}
                          value={designId}
                          onChange={id => setDesignId(id)}
                        />
                      </Column>
                    )}
                  </>
                )}
              </Column>
            )}

            {/* Navigation */}
            <Row
              style={{
                marginTop: 18,
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <Button
                onPress={prev}
                disabled={step === 1}
                style={{ minWidth: 140 }}
              >
                ← Atrás
              </Button>

              <Row style={{ gap: 12, flexWrap: 'wrap' }}>
                {step < 3 && (
                  <Button
                    onPress={next}
                    disabled={
                      (step === 1 && !canGo2) || (step === 2 && !canGo3)
                    }
                    style={{ minWidth: 180 }}
                  >
                    Continuar →
                  </Button>
                )}

                {step === 3 && (
                  <>
                    {availability && !availability.available && (
                      <Text
                        style={{
                          color: COLORS.red,
                          fontSize: 13,
                          marginBottom: 8,
                        }}
                      >
                        This combination is sold out. Please select a different
                        support.
                      </Text>
                    )}
                    <Button
                      onPress={submit}
                      disabled={!canSubmit}
                      style={{ minWidth: 220 }}
                    >
                      Complete Configuration
                    </Button>
                  </>
                )}
              </Row>
            </Row>
          </div>

          {/* Summary (sticky-ish but RN-friendly) */}
          <div style={styles.summaryWrap}>
            <div style={styles.summary}>
              <Text style={{ fontWeight: 600, letterSpacing: -0.2 }}>
                Configuration
              </Text>
              <div style={styles.hr} />

              {canSubmit ? (
                <Column style={{ gap: 12 }}>
                  {/* Indicador de disponibilidad */}
                  {availability && (
                    <Row
                      style={{ alignItems: 'center', gap: 8, marginBottom: 8 }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: availability.available
                            ? '#4CAF50'
                            : COLORS.red,
                        }}
                      />
                      <Mono style={{ fontSize: 11, color: COLORS.ink70 }}>
                        {availability.available
                          ? `AVAILABLE · ${availability.remaining}/7 remaining`
                          : 'SOLD OUT'}
                      </Mono>
                    </Row>
                  )}

                  <Mono
                    style={{
                      fontSize: 11,
                      letterSpacing: 0.8,
                      color: COLORS.ink70,
                    }}
                  >
                    LOLA GUN STUDIO
                  </Mono>
                  <Mono
                    style={{
                      fontSize: 11,
                      letterSpacing: 0.8,
                      color: COLORS.ink70,
                    }}
                  >
                    {COLLECTION_NAME}
                  </Mono>

                  <Mono
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      letterSpacing: 0.3,
                    }}
                  >
                    {selectedModel?.id} · {selectedModel?.format}
                  </Mono>

                  <Mono style={{ fontSize: 13, color: COLORS.ink70 }}>
                    {selectedSupport?.latinSupport}
                  </Mono>

                  <div style={styles.hr} />

                  <Mono style={{ fontSize: 12, fontWeight: 700 }}>
                    ONLY 7 · {availability?.sold || 0}/7
                  </Mono>
                </Column>
              ) : (
                <Column style={{ gap: 10 }}>
                  <Row style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Model</Text>
                    <Text style={styles.summaryValue}>
                      {selectedModel ? selectedModel.id : '—'}
                    </Text>
                  </Row>
                  <Row style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Support</Text>
                    <Text style={styles.summaryValue}>
                      {selectedSupport ? selectedSupport.title : '—'}
                    </Text>
                  </Row>
                  <Row style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Materia</Text>
                    <Text style={styles.summaryValue}>
                      {selectedMateria ? selectedMateria.title : '—'}
                    </Text>
                  </Row>
                </Column>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

/** Styles (RN-like) */
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: COLORS.bg,
    color: COLORS.ink,
  },
  container: {
    width: '100%',
    maxWidth: 1120,
    margin: '0 auto',
    padding: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
  },
  text: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  },
  mono: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 14,
    lineHeight: 1.7,
    color: COLORS.ink70,
  },
  bigTitle: {
    fontSize: 54,
    fontWeight: 500,
    letterSpacing: -1.2,
    lineHeight: 1.0,
  },
  line: {
    height: 3,
    width: 360,
    maxWidth: '70vw',
    backgroundColor: COLORS.line,
  },

  stepRow: {
    marginTop: 6,
    gap: 10,
    flexWrap: 'wrap',
  },
  stepPill: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    border: `1px solid ${COLORS.ink20}`,
    padding: '10px 14px',
    backgroundColor: 'rgba(255,255,255,0.25)',
    color: COLORS.ink,
    cursor: 'pointer',
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
  stepPillActive: {
    backgroundColor: COLORS.ink,
    color: COLORS.bg,
    border: `1px solid ${COLORS.ink}`,
  },
  stepPillDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },

  layout: {
    marginTop: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  main: {
    flex: 1,
    borderRadius: 22,
    border: `1px solid ${COLORS.ink10}`,
    backgroundColor: COLORS.panel,
    padding: 16,
    minWidth: 0,
  },

  summaryWrap: {
    width: '100%',
    minWidth: 0,
  },
  summary: {
    borderRadius: 22,
    border: `1px solid ${COLORS.ink10}`,
    backgroundColor: 'rgba(255,255,255,0.55)',
    padding: 16,
  },
  hr: {
    height: 1,
    backgroundColor: COLORS.ink10,
    marginTop: 12,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: -0.2,
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 12,
  },

  card: {
    width: '100%',
    textAlign: 'left',
    borderRadius: 18,
    border: `1px solid ${COLORS.ink20}`,
    backgroundColor: 'rgba(255,255,255,0.55)',
    padding: 16,
    cursor: 'pointer',
    minHeight: 'auto',
  },
  cardSelected: {
    border: `1px solid ${COLORS.ink}`,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  badge: {
    borderRadius: 999,
    padding: '6px 10px',
    fontSize: 12,
    border: `1px solid ${COLORS.ink20}`,
    backgroundColor: 'rgba(0,0,0,0.04)',
    color: COLORS.ink70,
    alignSelf: 'flex-start',
  },
  badgeSelected: {
    border: `1px solid ${COLORS.ink}`,
    backgroundColor: COLORS.ink,
    color: COLORS.bg,
  },

  radio: {
    width: 12,
    height: 12,
    borderRadius: 999,
    border: `1px solid ${COLORS.ink40}`,
    backgroundColor: 'transparent',
  },
  radioSelected: {
    border: `1px solid ${COLORS.ink}`,
    backgroundColor: COLORS.ink,
  },

  button: {
    borderRadius: 999,
    border: `1px solid ${COLORS.ink}`,
    backgroundColor: COLORS.ink,
    color: COLORS.bg,
    padding: '12px 16px',
    fontWeight: 800,
    cursor: 'pointer',
    fontSize: 14,
    whiteSpace: 'nowrap',
  },
  buttonDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },

  summaryRow: {
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.ink70,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'right',
  },
};

/**
 * Tiny responsive upgrade with a single media query-ish approach:
 * If quieres, lo hago 100% RN style sin grid (solo flexWrap).
 * En web, el grid ayuda, pero se puede quitar.
 */

// Optional: quick responsive tweak without CSS files.
// In real projects, move this to CSS or use a breakpoint hook.
if (typeof window !== 'undefined') {
  const applyResponsive = () => {
    const wide = window.innerWidth >= 980;
    const tablet = window.innerWidth >= 768 && window.innerWidth < 980;
    const mobile = window.innerWidth < 768;
    const smallMobile = window.innerWidth < 480;

    // Layout direction and summary width
    // Desktop y tablet: mantener diseño de 2 columnas (horizontal)
    // Mobile: cambiar a vertical
    if (mobile || smallMobile) {
      styles.layout.flexDirection = 'column';
      styles.summaryWrap.width = '100%';
      styles.summaryWrap.maxWidth = '100%';
      styles.summaryWrap.minWidth = '0';
    } else {
      // Desktop y tablet mantienen layout horizontal
      styles.layout.flexDirection = 'row';
      styles.summaryWrap.width = '360px';
      styles.summaryWrap.maxWidth = '360px';
      styles.summaryWrap.minWidth = '360px';
    }

    // Main padding and border radius
    if (smallMobile) {
      styles.main.padding = 12;
      styles.main.borderRadius = 16;
      styles.container.padding = '12px';
      styles.container.paddingTop = 16;
      styles.container.paddingBottom = 30;
    } else if (mobile) {
      styles.main.padding = 14;
      styles.main.borderRadius = 18;
      styles.container.padding = '15px';
      styles.container.paddingTop = 20;
      styles.container.paddingBottom = 35;
    } else if (tablet) {
      styles.main.padding = 16;
      styles.main.borderRadius = 20;
      styles.container.padding = '18px';
      styles.container.paddingTop = 24;
    } else {
      styles.main.padding = 18;
      styles.main.borderRadius = 22;
      styles.container.padding = '20px';
      styles.container.paddingTop = 28;
    }

    // Grid columns: mantener 2 columnas en desktop/tablet, 1 en mobile
    if (mobile || smallMobile) {
      styles.grid.gridTemplateColumns = '1fr';
    } else {
      styles.grid.gridTemplateColumns = '1fr 1fr';
    }

    // Responsive title size
    if (smallMobile) {
      styles.bigTitle.fontSize = 22;
      styles.bigTitle.letterSpacing = -0.6;
      styles.bigTitle.lineHeight = 1.1;
      styles.container.padding = 12;
      styles.container.paddingTop = 16;
      styles.container.paddingBottom = 30;
    } else if (mobile) {
      styles.bigTitle.fontSize = 28;
      styles.bigTitle.letterSpacing = -0.8;
      styles.bigTitle.lineHeight = 1.15;
      styles.container.padding = 15;
      styles.container.paddingTop = 20;
      styles.container.paddingBottom = 35;
    } else if (tablet) {
      styles.bigTitle.fontSize = 38;
      styles.bigTitle.letterSpacing = -1;
      styles.bigTitle.lineHeight = 1.2;
      styles.container.padding = 18;
      styles.container.paddingTop = 24;
    } else {
      styles.bigTitle.fontSize = 54;
      styles.bigTitle.letterSpacing = -1.2;
      styles.bigTitle.lineHeight = 1;
      styles.container.padding = 20;
      styles.container.paddingTop = 28;
    }

    // Responsive mono text
    if (smallMobile) {
      styles.mono.fontSize = 11;
      styles.mono.lineHeight = 1.5;
    } else if (mobile) {
      styles.mono.fontSize = 12;
      styles.mono.lineHeight = 1.6;
    } else {
      styles.mono.fontSize = 14;
      styles.mono.lineHeight = 1.7;
    }

    // Responsive section title
    if (smallMobile) {
      styles.sectionTitle.fontSize = 14;
    } else if (mobile) {
      styles.sectionTitle.fontSize = 15;
    } else {
      styles.sectionTitle.fontSize = 16;
    }

    // Responsive card padding
    if (smallMobile) {
      styles.card.padding = 12;
      styles.card.borderRadius = 14;
    } else if (mobile) {
      styles.card.padding = 14;
      styles.card.borderRadius = 16;
    } else {
      styles.card.padding = 16;
      styles.card.borderRadius = 18;
    }

    // Responsive summary
    if (smallMobile) {
      styles.summary.padding = 12;
      styles.summary.borderRadius = 16;
    } else if (mobile) {
      styles.summary.padding = 14;
      styles.summary.borderRadius = 18;
    } else {
      styles.summary.padding = 16;
      styles.summary.borderRadius = 22;
    }

    // Responsive button sizing
    if (smallMobile) {
      styles.button.padding = '10px 12px';
      styles.button.fontSize = 12;
    } else if (mobile) {
      styles.button.padding = '11px 14px';
      styles.button.fontSize = 13;
    } else {
      styles.button.padding = '12px 16px';
      styles.button.fontSize = 14;
    }

    // Responsive step pill
    if (smallMobile) {
      styles.stepPill.padding = '8px 10px';
      styles.stepPill.fontSize = 11;
    } else if (mobile) {
      styles.stepPill.padding = '9px 12px';
      styles.stepPill.fontSize = 12;
    } else {
      styles.stepPill.padding = '10px 14px';
      styles.stepPill.fontSize = 13;
    }
  };
  // One-time + resize listener
  applyResponsive();
  window.addEventListener('resize', applyResponsive);
}
