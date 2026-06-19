import { useState, useEffect, useRef } from "react";

// TODO: Integrar API real de IA para análisis de numerología/astrología en AI Dream
// TODO: Implementar backend (Firebase/Supabase) para persistencia de tableros y metas
// TODO: Añadir notificaciones push para afirmaciones y recordatorios diarios
// TODO: Sistema de suscripción premium con Stripe
// TODO: Subida real de imágenes para el vision board

const AFIRMACIONES = [
  "Soy capaz de lograr todo lo que me proponga.",
  "Mi futuro está lleno de posibilidades ilimitadas.",
  "Merezco el éxito, la felicidad y el amor.",
  "Cada día me acerco más a mis sueños.",
  "Confío en mi camino y en mi proceso.",
  "Soy fuerte, valiente y estoy listo/a para el cambio.",
  "Mi mente es poderosa y mis pensamientos crean mi realidad.",
  "Atraigo abundancia en todas las áreas de mi vida.",
  "Soy la arquitecto/a de mi propio destino.",
  "Hoy doy un paso más hacia mi mejor versión.",
  "El universo conspira a mi favor.",
  "Mis sueños son válidos y los haré realidad.",
];

const CATEGORIAS_BOARD = [
  { id: "salud", label: "Salud", emoji: "💪", color: "#4CAF50" },
  { id: "amor", label: "Amor", emoji: "❤️", color: "#E91E63" },
  { id: "carrera", label: "Carrera", emoji: "🚀", color: "#2196F3" },
  { id: "finanzas", label: "Finanzas", emoji: "💰", color: "#FF9800" },
  { id: "familia", label: "Familia", emoji: "🏠", color: "#9C27B0" },
  { id: "viajes", label: "Viajes", emoji: "✈️", color: "#00BCD4" },
  { id: "educacion", label: "Educación", emoji: "📚", color: "#FF5722" },
  { id: "bienestar", label: "Bienestar", emoji: "🌸", color: "#8BC34A" },
];

const IMAGENES_PLACEHOLDER = [
  { id: 1, url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop", cat: "viajes" },
  { id: 2, url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop", cat: "salud" },
  { id: 3, url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=200&fit=crop", cat: "finanzas" },
  { id: 4, url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop", cat: "educacion" },
  { id: 5, url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&h=200&fit=crop", cat: "amor" },
  { id: 6, url: "https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?w=300&h=200&fit=crop", cat: "carrera" },
];

const METAS_INICIALES = [
  { id: 1, titulo: "Correr 5km sin parar", categoria: "salud", completado: false, pasos: [
    { id: 1, texto: "Salir a caminar 20 minutos cada día", hecho: true },
    { id: 2, texto: "Correr 1km esta semana", hecho: false },
    { id: 3, texto: "Aumentar a 3km el próximo mes", hecho: false },
  ]},
  { id: 2, titulo: "Ahorrar para mi viaje a Europa", categoria: "finanzas", completado: false, pasos: [
    { id: 1, texto: "Abrir cuenta de ahorro dedicada", hecho: true },
    { id: 2, texto: "Guardar 200€ este mes", hecho: false },
    { id: 3, texto: "Investigar vuelos económicos", hecho: false },
  ]},
];

export default function App() {
  const [tabActiva, setTabActiva] = useState("inicio");
  const [afirmacionIndex, setAfirmacionIndex] = useState(0);
  const [afirmacionVisible, setAfirmacionVisible] = useState(true);
  const [boardItems, setBoardItems] = useState(IMAGENES_PLACEHOLDER);
  const [metas, setMetas] = useState(METAS_INICIALES);
  const [metaSeleccionada, setMetaSeleccionada] = useState(null);
  const [modalNuevaMeta, setModalNuevaMeta] = useState(false);
  const [nuevaMeta, setNuevaMeta] = useState({ titulo: "", categoria: "salud" });
  const [aiDreamVisible, setAiDreamVisible] = useState(false);
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [aiResultado, setAiResultado] = useState(null);
  const [aiCargando, setAiCargando] = useState(false);
  const [modalImagenBoard, setModalImagenBoard] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [afirmacionFavorita, setAfirmacionFavorita] = useState(false);
  const [favoritas, setFavoritas] = useState([]);
  const [onboardingVisible, setOnboardingVisible] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [nombre, setNombre] = useState("");
  const [nombreGuardado, setNombreGuardado] = useState("");
  const [modalPremium, setModalPremium] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("dreamer_nombre");
    const onboarding = localStorage.getItem("dreamer_onboarding");
    if (saved) {
      setNombreGuardado(saved);
      setOnboardingVisible(false);
    }
    if (onboarding === "done") setOnboardingVisible(false);
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setAfirmacionVisible(false);
      setTimeout(() => {
        setAfirmacionIndex((prev) => (prev + 1) % AFIRMACIONES.length);
        setAfirmacionVisible(true);
        setAfirmacionFavorita(false);
      }, 500);
    }, 6000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const completarOnboarding = () => {
    if (nombre.trim()) {
      localStorage.setItem("dreamer_nombre", nombre.trim());
      localStorage.setItem("dreamer_onboarding", "done");
      setNombreGuardado(nombre.trim());
    }
    setOnboardingVisible(false);
  };

  const calcularNumerologia = (fecha) => {
    if (!fecha) return null;
    const nums = fecha.replace(/-/g, "").split("").map(Number);
    let suma = nums.reduce((a, b) => a + b, 0);
    while (suma > 9 && suma !== 11 && suma !== 22 && suma !== 33) {
      suma = suma.toString().split("").map(Number).reduce((a, b) => a + b, 0);
    }
    return suma;
  };

  const NUMEROLOGIA_DATA = {
    1: { titulo: "El Líder", desc: "Eres pionero/a e independiente. Tu camino de vida es crear, liderar e innovar. Tienes una energía poderosa para iniciar proyectos nuevos.", fortalezas: ["Liderazgo", "Determinación", "Originalidad"], color: "#FF6B6B" },
    2: { titulo: "El Diplomático", desc: "Eres sensible, cooperativo/a y armonioso/a. Tu misión es unir a las personas y crear paz en tu entorno.", fortalezas: ["Empatía", "Diplomacia", "Intuición"], color: "#4ECDC4" },
    3: { titulo: "El Creativo", desc: "Eres expresivo/a, creativo/a y lleno/a de alegría. El arte, la comunicación y la creatividad son tu esencia.", fortalezas: ["Creatividad", "Optimismo", "Comunicación"], color: "#FFE66D" },
    4: { titulo: "El Constructor", desc: "Eres práctico/a, trabajador/a y confiable. Tu propósito es construir bases sólidas para ti y los demás.", fortalezas: ["Disciplina", "Confiabilidad", "Organización"], color: "#A8E6CF" },
    5: { titulo: "El Aventurero", desc: "Eres libre, adaptable y curioso/a. Tu camino implica experimentar la vida en toda su amplitud y variedad.", fortalezas: ["Adaptabilidad", "Aventura", "Versatilidad"], color: "#FFB347" },
    6: { titulo: "El Guardián", desc: "Eres amoroso/a, responsable y orientado/a al hogar. Tu misión es nutrir y proteger a quienes te rodean.", fortalezas: ["Amor incondicional", "Responsabilidad", "Cuidado"], color: "#FF85A1" },
    7: { titulo: "El Sabio", desc: "Eres analítico/a, introspectivo/a y espiritual. Tu camino es la búsqueda de la verdad y el conocimiento profundo.", fortalezas: ["Inteligencia", "Espiritualidad", "Análisis"], color: "#C3A6FF" },
    8: { titulo: "El Ejecutivo", desc: "Eres ambicioso/a, orientado/a al éxito y con gran poder personal. Tu camino es alcanzar la abundancia material y espiritual.", fortalezas: ["Ambición", "Poder personal", "Abundancia"], color: "#FFD700" },
    9: { titulo: "El Humanista", desc: "Eres compasivo/a, idealista y generoso/a. Tu misión es servir a la humanidad y dejar un legado de amor.", fortalezas: ["Compasión", "Sabiduría", "Altruismo"], color: "#87CEEB" },
    11: { titulo: "El Visionario (Maestro 11)", desc: "Tienes un número maestro. Eres altamente intuitivo/a y con una misión espiritual elevada. Eres un faro de luz para los demás.", fortalezas: ["Intuición suprema", "Inspiración", "Liderazgo espiritual"], color: "#E0AAFF" },
    22: { titulo: "El Constructor Maestro (22)", desc: "Tienes el número maestro más poderoso. Puedes convertir sueños en realidad a gran escala. Eres un arquitecto/a del cambio.", fortalezas: ["Visión práctica", "Poder creador", "Logros monumentales"], color: "#B5E48C" },
    33: { titulo: "El Maestro Sanador (33)", desc: "El número maestro más raro. Eres un/a sanador/a espiritual con capacidad de elevar la consciencia de todos a tu alrededor.", fortalezas: ["Sanación", "Amor universal", "Enseñanza espiritual"], color: "#FFC8DD" },
  };

  const ejecutarAiDream = () => {
    if (!fechaNacimiento) return;
    setAiCargando(true);
    setAiResultado(null);
    // TODO: Reemplazar con llamada real a API de IA/astrología
    setTimeout(() => {
      const num = calcularNumerologia(fechaNacimiento);
      const data = NUMEROLOGIA_DATA[num] || NUMEROLOGIA_DATA[9];
      const fecha = new Date(fechaNacimiento);
      const meses = ["Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo", "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis"];
      const signo = meses[fecha.getMonth()];
      setAiResultado({ ...data, numerologia: num, signo, fecha });
      setAiCargando(false);
    }, 2500);
  };

  const agregarMeta = () => {
    if (!nuevaMeta.titulo.trim()) return;
    const meta = {
      id: Date.now(),
      titulo: nuevaMeta.titulo,
      categoria: nuevaMeta.categoria,
      completado: false,
      pasos: [],
    };
    setMetas((prev) => [meta, ...prev]);
    setNuevaMeta({ titulo: "", categoria: "salud" });
    setModalNuevaMeta(false);
  };

  const togglePaso = (metaId, pasoId) => {
    setMetas((prev) =>
      prev.map((m) =>
        m.id === metaId
          ? { ...m, pasos: m.pasos.map((p) => (p.id === pasoId ? { ...p, hecho: !p.hecho } : p)) }
          : m
      )
    );
  };

  const toggleFavorita = () => {
    const afirmacion = AFIRMACIONES[afirmacionIndex];
    if (favoritas.includes(afirmacion)) {
      setFavoritas((prev) => prev.filter((a) => a !== afirmacion));
      setAfirmacionFavorita(false);
    } else {
      setFavoritas((prev) => [...prev, afirmacion]);
      setAfirmacionFavorita(true);
    }
  };

  const agregarAlBoard = (categoria) => {
    const cats = IMAGENES_PLACEHOLDER.filter((i) => i.cat === categoria);
    const nuevas = cats.filter((c) => !boardItems.find((b) => b.id === c.id));
    if (nuevas.length > 0) {
      setBoardItems((prev) => [...prev, nuevas[0]]);
    }
    setModalImagenBoard(false);
  };

  const progresoCat = (cat) => {
    const metasCat = metas.filter((m) => m.categoria === cat.id);
    if (metasCat.length === 0) return 0;
    const pasosTotales = metasCat.flatMap((m) => m.pasos).length;
    const pasosHechos = metasCat.flatMap((m) => m.pasos).filter((p) => p.hecho).length;
    if (pasosTotales === 0) return 0;
    return Math.round((pasosHechos / pasosTotales) * 100);
  };

  const styles = {
    app: {
      maxWidth: 430,
      margin: "0 auto",
      minHeight: "100vh",
      background: "linear-gradient(160deg, #1a0533 0%, #2d1b69 40%, #1a0533 100%)",
      color: "#fff",
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    header: {
      padding: "50px 20px 20px",
      textAlign: "center",
      background: "linear-gradient(180deg, rgba(106,13,173,0.3) 0%, transparent 100%)",
    },
    logo: {
      fontSize: 28,
      fontWeight: 800,
      background: "linear-gradient(135deg, #FFD700, #FF69B4, #9B59B6)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      letterSpacing: -0.5,
    },
    subtitle: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 4 },
    content: { padding: "0 16px 90px", overflowY: "auto" },
    tabBar: {
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 430,
      background: "rgba(20,5,50,0.95)",
      backdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255,215,0,0.2)",
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 0 12px",
      zIndex: 100,
    },
    tab: (activa) => ({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      padding: "6px 16px",
      borderRadius: 12,
      cursor: "pointer",
      background: activa ? "rgba(255,215,0,0.15)" : "transparent",
      border: "none",
      color: activa ? "#FFD700" : "rgba(255,255,255,0.5)",
      fontSize: 10,
      fontWeight: activa ? 700 : 400,
      transition: "all 0.2s ease",
    }),
    tabEmoji: { fontSize: 22 },
    card: {
      background: "rgba(255,255,255,0.07)",
      borderRadius: 20,
      padding: "20px",
      marginBottom: 16,
      border: "1px solid rgba(255,255,255,0.1)",
      backdropFilter: "blur(10px)",
    },
    cardGold: {
      background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,105,180,0.1))",
      borderRadius: 20,
      padding: "20px",
      marginBottom: 16,
      border: "1px solid rgba(255,215,0,0.3)",
    },
    afirmacionCard: {
      background: "linear-gradient(135deg, rgba(155,89,182,0.4), rgba(52,152,219,0.3))",
      borderRadius: 24,
      padding: "30px 24px",
      marginBottom: 20,
      textAlign: "center",
      border: "1px solid rgba(255,255,255,0.15)",
      position: "relative",
      overflow: "hidden",
    },
    afirmacionTexto: {
      fontSize: 18,
      fontWeight: 600,
      lineHeight: 1.5,
      opacity: afirmacionVisible ? 1 : 0,
      transform: afirmacionVisible ? "translateY(0)" : "translateY(10px)",
      transition: "all 0.5s ease",
      marginBottom: 16,
    },
    btnPrimario: {
      background: "linear-gradient(135deg, #9B59B6, #6C3483)",
      color: "#fff",
      border: "none",
      borderRadius: 14,
      padding: "14px 28px",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      width: "100%",
      marginTop: 8,
      transition: "transform 0.1s ease, opacity 0.2s ease",
    },
    btnGold: {
      background: "linear-gradient(135deg, #FFD700, #FFA500)",
      color: "#1a0533",
      border: "none",
      borderRadius: 14,
      padding: "14px 28px",
      fontSize: 15,
      fontWeight: 800,
      cursor: "pointer",
      width: "100%",
      marginTop: 8,
    },
    btnOutline: {
      background: "transparent",
      color: "rgba(255,255,255,0.7)",
      border: "1px solid rgba(255,255,255,0.3)",
      borderRadius: 14,
      padding: "12px 24px",
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      width: "100%",
      marginTop: 8,
    },
    seccionTitulo: {
      fontSize: 20,
      fontWeight: 800,
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    boardGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginBottom: 16,
    },
    boardItem: {
      borderRadius: 16,
      overflow: "hidden",
      aspectRatio: "3/2",
      position: "relative",
    },
    boardImg: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    metaCard: {
      background: "rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: "16px",
      marginBottom: 12,
      border: "1px solid rgba(255,255,255,0.1)",
      cursor: "pointer",
      transition: "transform 0.1s ease",
    },
    metaTitulo: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
    progresoBarra: (pct) => ({
      height: 6,
      background: "rgba(255,255,255,0.15)",
      borderRadius: 3,
      overflow: "hidden",
      marginTop: 8,
    }),
    progresoRelleno: (pct, color) => ({
      height: "100%",
      width: `${pct}%`,
      background: color || "linear-gradient(90deg, #9B59B6, #FFD700)",
      borderRadius: 3,
      transition: "width 0.5s ease",
    }),
    badge: (color) => ({
      display: "inline-block",
      background: color + "33",
      color: color,
      border: `1px solid ${color}55`,
      borderRadius: 20,
      padding: "3px 10px",
      fontSize: 11,
      fontWeight: 700,
    }),
    pasoItem: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 0",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
    },
    checkbox: (hecho) => ({
      width: 22,
      height: 22,
      borderRadius: 8,
      border: `2px solid ${hecho ? "#9B59B6" : "rgba(255,255,255,0.3)"}`,
      background: hecho ? "linear-gradient(135deg, #9B59B6, #6C3483)" : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flexShrink: 0,
      transition: "all 0.2s ease",
    }),
    modal: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      zIndex: 200,
    },
    modalContent: {
      background: "linear-gradient(160deg, #2d1b69, #1a0533)",
      borderRadius: "24px 24px 0 0",
      padding: "24px",
      width: "100%",
      maxWidth: 430,
      maxHeight: "85vh",
      overflowY: "auto",
      border: "1px solid rgba(255,215,0,0.2)",
    },
    input: {
      width: "100%",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 12,
      padding: "14px 16px",
      color: "#fff",
      fontSize: 15,
      outline: "none",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      background: "#2d1b69",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: 12,
      padding: "14px 16px",
      color: "#fff",
      fontSize: 15,
      outline: "none",
      boxSizing: "border-box",
      marginTop: 10,
    },
    label: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 6, display: "block" },
    starsBg: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: "none",
      overflow: "hidden",
    },
    salutoBanner: {
      background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(155,89,182,0.2))",
      borderRadius: 16,
      padding: "16px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 12,
    },
    streakBadge: {
      background: "linear-gradient(135deg, #FF6B35, #F7931E)",
      borderRadius: 12,
      padding: "12px 16px",
      textAlign: "center",
      flex: 1,
    },
  };

  // ONBOARDING
  if (onboardingVisible) {
    const steps = [
      {
        emoji: "✨",
        titulo: "Bienvenido/a a Dreamer",
        desc: "Tu app para visualizar, crear y manifestar tus sueños más grandes.",
        accion: null,
      },
      {
        emoji: "🎯",
        titulo: "Diseña tu Vision Board",
        desc: "Crea un mapa visual de tus sueños y metas. Vívelo cada día.",
        accion: null,
      },
      {
        emoji: "🌟",
        titulo: "Afirmaciones diarias",
        desc: "Potencia tu mentalidad con afirmaciones positivas cada mañana.",
        accion: null,
      },
      {
        emoji: "👤",
        titulo: "¿Cómo te llamas?",
        desc: "Personaliza tu experiencia con tu nombre.",
        accion: "nombre",
      },
    ];
    const step = steps[onboardingStep];
    return (
      <div style={{ ...styles.app, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ textAlign: "center", maxWidth: 340 }}>
          <div style={{ fontSize: 80, marginBottom: 24 }}>{step.emoji}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 12, background: "linear-gradient(135deg, #FFD700, #FF69B4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {step.titulo}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 32 }}>{step.desc}</p>
          {step.accion === "nombre" && (
            <input
              style={{ ...styles.input, marginBottom: 20, textAlign: "center" }}
              placeholder="Tu nombre..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && completarOnboarding()}
            />
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
            {steps.map((_, i) => (
              <div key={i} style={{ width: i === onboardingStep ? 24 : 8, height: 8, borderRadius: 4, background: i === onboardingStep ? "#FFD700" : "rgba(255,255,255,0.3)", transition: "all 0.3s" }} />
            ))}
          </div>
          {onboardingStep < steps.length - 1 ? (
            <button style={styles.btnGold} onClick={() => setOnboardingStep((p) => p + 1)}>
              Continuar →
            </button>
          ) : (
            <button style={styles.btnGold} onClick={completarOnboarding}>
              ¡Comenzar mi viaje! 🚀
            </button>
          )}
          {onboardingStep > 0 && (
            <button style={{ ...styles.btnOutline, marginTop: 12 }} onClick={() => setOnboardingStep((p) => p - 1)}>
              Atrás
            </button>
          )}
        </div>
      </div>
    );
  }

  const renderInicio = () => (
    <div>
      {/* Saludo */}
      <div style={styles.salutoBanner}>
        <div style={{ fontSize: 36 }}>🌅</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17 }}>
            Buenos días{nombreGuardado ? `, ${nombreGuardado}` : ""}! ✨
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
        <div style={{ ...styles.streakBadge, background: "linear-gradient(135deg, rgba(255,107,53,0.3), rgba(247,147,30,0.2))" }}>
          <div style={{ fontSize: 22 }}>🔥</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>7</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Días seguidos</div>
        </div>
        <div style={{ ...styles.streakBadge, background: "linear-gradient(135deg, rgba(155,89,182,0.3), rgba(52,152,219,0.2))" }}>
          <div style={{ fontSize: 22 }}>🎯</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{metas.length}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Metas activas</div>
        </div>
        <div style={{ ...styles.streakBadge, background: "linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,105,180,0.15))" }}>
          <div style={{ fontSize: 22 }}>💫</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{favoritas.length}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Favoritas</div>
        </div>
      </div>

      {/* Afirmación del día */}
      <div style={styles.afirmacionCard}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>
          ✨ Afirmación del día
        </div>
        <div style={styles.afirmacionTexto}>
          "{AFIRMACIONES[afirmacionIndex]}"
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          <button
            onClick={toggleFavorita}
            style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", transition: "transform 0.2s" }}
          >
            {favoritas.includes(AFIRMACIONES[afirmacionIndex]) ? "❤️" : "🤍"}
          </button>
          <button
            onClick={() => {
              setAfirmacionVisible(false);
              setTimeout(() => {
                setAfirmacionIndex((prev) => (prev + 1) % AFIRMACIONES.length);
                setAfirmacionVisible(true);
              }, 300);
            }}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 20, padding: "6px 16px", cursor: "pointer", fontSize: 13 }}
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Acceso rápido a Vision Board */}
      <div style={styles.cardGold}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>🖼️ Mi Vision Board</div>
          <button
            onClick={() => setTabActiva("board")}
            style={{ background: "rgba(255,215,0,0.2)", border: "none", color: "#FFD700", borderRadius: 10, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
          >
            Ver todo
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {boardItems.slice(0, 3).map((item) => (
            <div key={item.id} style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "1" }}>
              <img src={item.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Próxima meta */}
      {metas[0] && (
        <div style={styles.card}>
          <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>🎯 Meta más reciente</div>
          <div
            style={{ cursor: "pointer" }}
            onClick={() => { setMetaSeleccionada(metas[0]); setTabActiva("metas"); }}
          >
            <div style={{ fontWeight: 600, fontSize: 15 }}>{metas[0].titulo}</div>
            <div style={styles.progresoBarra()}>
              <div
                style={{
                  height: "100%",
                  width: `${metas[0].pasos.length ? Math.round(metas[0].pasos.filter((p) => p.hecho).length / metas[0].pasos.length * 100) : 0}%`,
                  background: "linear-gradient(90deg, #9B59B6, #FFD700)",
                  borderRadius: 3,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
              {metas[0].pasos.filter((p) => p.hecho).length} / {metas[0].pasos.length} pasos completados
            </div>
          </div>
        </div>
      )}

      {/* AI Dream acceso */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(75,0,130,0.5), rgba(30,30,100,0.4))",
          borderRadius: 20,
          padding: 20,
          border: "1px solid rgba(147,112,219,0.4)",
          cursor: "pointer",
        }}
        onClick={() => setTabActiva("ai")}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 42 }}>🔮</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>AI Dream</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
              Descubre tu propósito de vida con numerología y astrología
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBoard = () => (
    <div>
      <div style={styles.seccionTitulo}>
        🖼️ Mi Vision Board
        <button
          onClick={() => setModalImagenBoard(true)}
          style={{ marginLeft: "auto", background: "linear-gradient(135deg, #9B59B6, #6C3483)", border: "none", color: "#fff", borderRadius: 12, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}
        >
          + Añadir
        </button>
      </div>

      {/* Filtros de categoría */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 16, scrollbarWidth: "none" }}>
        <button
          onClick={() => setCategoriaFiltro("todas")}
          style={{
            flexShrink: 0,
            background: categoriaFiltro === "todas" ? "#9B59B6" : "rgba(255,255,255,0.08)",
            border: "none",
            color: "#fff",
            borderRadius: 20,
            padding: "6px 14px",
            fontSize: 12,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Todas
        </button>
        {CATEGORIAS_BOARD.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaFiltro(cat.id)}
            style={{
              flexShrink: 0,
              background: categoriaFiltro === cat.id ? cat.color + "aa" : "rgba(255,255,255,0.08)",
              border: `1px solid ${categoriaFiltro === cat.id ? cat.color : "transparent"}`,
              color: "#fff",
              borderRadius: 20,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Grid del board */}
      <div style={styles.boardGrid}>
        {boardItems
          .filter((i) => categoriaFiltro === "todas" || i.cat === categoriaFiltro)
          .map((item) => {
            const cat = CATEGORIAS_BOARD.find((c) => c.id === item.cat);
            return (
              <div key={item.id} style={styles.boardItem}>
                <img src={item.url} alt="" style={styles.boardImg} />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "20px 8px 8px",
                    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  }}
                >
                  <span style={styles.badge(cat?.color || "#fff")}>{cat?.emoji} {cat?.label}</span>
                </div>
                <button
                  onClick={() => setBoardItems((prev) => prev.filter((b) => b.id !== item.id))}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(0,0,0,0.5)",
                    border: "none",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 26,
                    height: 26,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}
        {/* Botón añadir */}
        <div
          onClick={() => setModalImagenBoard(true)}
          style={{
            borderRadius: 16,
            aspectRatio: "3/2",
            border: "2px dashed rgba(255,215,0,0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 28 }}>+</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Añadir sueño</div>
        </div>
      </div>

      {/* Progreso por categorías */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>📊 Progreso por área</div>
        {CATEGORIAS_BOARD.map((cat) => {
          const pct = progresoCat(cat);
          return (
            <div key={cat.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13 }}>{cat.emoji} {cat.label}</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{pct}%</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 3, transition: "width 0.5s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMetas = () => (
    <div>
      {metaSeleccionada ? (
        <div>
          <button
            onClick={() => setMetaSeleccionada(null)}
            style={{ background: "none", border: "none", color: "#FFD700", fontSize: 15, cursor: "pointer", marginBottom: 16, fontWeight: 600 }}
          >
            ← Volver
          </button>
          <div style={styles.card}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{metaSeleccionada.titulo}</div>
            {(() => {
              const cat = CATEGORIAS_BOARD.find((c) => c.id === metaSeleccionada.categoria);
              return cat ? <span style={styles.badge(cat.color)}>{cat.emoji} {cat.label}</span> : null;
            })()}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>📋 Plan de acción</div>
              {metaSeleccionada.pasos.length === 0 && (
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textAlign: "center", padding: 20 }}>
                  Aún no hay pasos. ¡Añade el primero!
                </div>
              )}
              {metaSeleccionada.pasos.map((paso) => (
                <div
                  key={paso.id}
                  style={styles.pasoItem}
                  onClick={() => togglePaso(metaSeleccionada.id, paso.id)}
                >
                  <div style={styles.checkbox(paso.hecho)}>
                    {paso.hecho && <span style={{ color: "#fff", fontSize: 12 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 14, textDecoration: paso.hecho ? "line-through" : "none", color: paso.hecho ? "rgba(255,255,255,0.4)" : "#fff" }}>
                    {paso.texto}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Progreso</div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${metaSeleccionada.pasos.length ? Math.round(metaSeleccionada.pasos.filter((p) => p.hecho).length / metaSeleccionada.pasos.length * 100) : 0}%`,
                    background: "linear-gradient(90deg, #9B59B6, #FFD700)",
                    borderRadius: 4,
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
              <div style={{ textAlign: "right", fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                {metaSeleccionada.pasos.filter((p) => p.hecho).length} / {metaSeleccionada.pasos.length} pasos
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setMetas((prev) => prev.filter((m) => m.id !== metaSeleccionada.id));
              setMetaSeleccionada(null);
            }}
            style={{ ...styles.btnOutline, color: "#ff6b6b", borderColor: "rgba(255,107,107,0.4)", marginTop: 8 }}
          >
            🗑️ Eliminar esta meta
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={styles.seccionTitulo}>🎯 Mis Metas</div>
            <button
              onClick={() => setModalNuevaMeta(true)}
              style={{ background: "linear-gradient(135deg, #9B59B6, #6C3483)", border: "none", color: "#fff", borderRadius: 12, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontWeight: 700 }}
            >
              + Nueva
            </button>
          </div>

          {metas.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Sin metas aún</div>
              <div style={{ fontSize: 14 }}>Crea tu primera meta y empieza a construir tu futuro ideal.</div>
            </div>
          )}

          {metas.map((meta) => {
            const cat = CATEGORIAS_BOARD.find((c) => c.id === meta.categoria);
            const pct = meta.pasos.length ? Math.round(meta.pasos.filter((p) => p.hecho).length / meta.pasos.length * 100) : 0;
            return (
              <div
                key={meta.id}
                style={styles.metaCard}
                onClick={() => setMetaSeleccionada(meta)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.metaTitulo}>{meta.titulo}</div>
                    {cat && <span style={styles.badge(cat.color)}>{cat.emoji} {cat.label}</span>}
                  </div>
                  <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>›</div>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden", marginTop: 12 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: cat?.color || "#9B59B6", borderRadius: 3, transition: "width 0.5s ease" }} />
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  {meta.pasos.filter((p) => p.hecho).length}/{meta.pasos.length} pasos · {pct}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAfirmaciones = () => (
    <div>
      <div style={styles.seccionTitulo}>💫 Afirmaciones</div>

      {/* Afirmación principal */}
      <div style={{
        background: "linear-gradient(135deg, rgba(155,89,182,0.5), rgba(52,152,219,0.4))",
        borderRadius: 24,
        padding: "36px 24px",
        textAlign: "center",
        marginBottom: 20,
        border: "1px solid rgba(255,255,255,0.15)",
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🌟</div>
        <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.5, marginBottom: 20 }}>
          "{AFIRMACIONES[afirmacionIndex]}"
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={toggleFavorita}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 12, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
          >
            {favoritas.includes(AFIRMACIONES[afirmacionIndex]) ? "❤️ Guardada" : "🤍 Guardar"}
          </button>
          <button
            onClick={() => {
              setAfirmacionVisible(false);
              setTimeout(() => { setAfirmacionIndex((prev) => (prev + 1) % AFIRMACIONES.length); setAfirmacionVisible(true); }, 300);
            }}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 12, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
          >
            Siguiente →
          </button>
        </div>
      </div>

      {/* Lista de todas las afirmaciones */}
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>📋 Todas las afirmaciones</div>
      {AFIRMACIONES.map((afirmacion, idx) => (
        <div
          key={idx}
          style={{
            background: idx === afirmacionIndex ? "rgba(155,89,182,0.3)" : "rgba(255,255,255,0.05)",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 8,
            border: `1px solid ${idx === afirmacionIndex ? "rgba(155,89,182,0.5)" : "rgba(255,255,255,0.08)"}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
          }}
          onClick={() => setAfirmacionIndex(idx)}
        >
          <div style={{ fontSize: 20, flexShrink: 0 }}>
            {favoritas.includes(afirmacion) ? "❤️" : "💬"}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(255,255,255,0.9)" }}>
            "{afirmacion}"
          </div>
        </div>
      ))}

      {favoritas.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>❤️ Mis favoritas ({favoritas.length})</div>
          {favoritas.map((afirmacion, idx) => (
            <div
              key={idx}
              style={{
                background: "linear-gradient(135deg, rgba(255,105,180,0.15), rgba(155,89,182,0.1))",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 8,
                border: "1px solid rgba(255,105,180,0.2)",
              }}
            >
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>"{afirmacion}"</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAiDream = () => (
    <div>
      <div style={styles.seccionTitulo}>🔮 AI Dream</div>

      <div style={{
        background: "linear-gradient(135deg, rgba(75,0,130,0.5), rgba(25,25,112,0.4))",
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        border: "1px solid rgba(147,112,219,0.3)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌌</div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Descubre tu propósito de vida</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
          Usando tu fecha de nacimiento, analizamos tu número de camino de vida según la numerología y te revelamos tu misión personal.
        </div>
      </div>

      {!aiResultado ? (
        <div style={styles.card}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>📅 Tu fecha de nacimiento</div>
          <label style={styles.label}>Ingresa tu fecha de nacimiento</label>
          <input
            type="date"
            style={styles.input}
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
          <button
            style={{ ...styles.btnGold, marginTop: 20, opacity: fechaNacimiento ? 1 : 0.5 }}
            onClick={ejecutarAiDream}
            disabled={!fechaNacimiento || aiCargando}
          >
            {aiCargando ? "✨ Calculando tu camino..." : "🔮 Descubrir mi propósito"}
          </button>
          {aiCargando && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                Analizando patrones de numerología y energía astral...
              </div>
              {/* TODO: Animación de carga más elaborada con partículas */}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Número de vida */}
          <div style={{
            background: `linear-gradient(135deg, ${aiResultado.color}33, ${aiResultado.color}11)`,
            borderRadius: 24,
            padding: "28px 20px",
            textAlign: "center",
            marginBottom: 16,
            border: `1px solid ${aiResultado.color}44`,
          }}>
            <div style={{ fontSize: 60, fontWeight: 900, color: aiResultado.color, marginBottom: 8 }}>
              {aiResultado.numerologia}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{aiResultado.titulo}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Tu número de camino de vida</div>
          </div>

          {/* Descripción */}
          <div style={styles.card}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>🌟 Tu misión de vida</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.85)" }}>
              {aiResultado.desc}
            </div>
          </div>

          {/* Fortalezas */}
          <div style={styles.card}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>💪 Tus fortalezas</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {aiResultado.fortalezas.map((f, i) => (
                <span key={i} style={{ ...styles.badge(aiResultado.color), padding: "6px 14px", fontSize: 13 }}>
                  ✨ {f}
                </span>
              ))}
            </div>
          </div>

          {/* Signo */}
          <div style={{ ...styles.card, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Tu signo zodiacal</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>♈ {aiResultado.signo}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
              {/* TODO: Descripción real del signo zodiacal */}
              Energías únicas que complementan tu número de vida
            </div>
          </div>

          <button
            style={styles.btnOutline}
            onClick={() => { setAiResultado(null); setFechaNacimiento(""); }}
          >
            🔄 Volver a calcular
          </button>
          <button
            style={{ ...styles.btnGold, marginTop: 10 }}
            onClick={() => setModalPremium(true)}
          >
            ⭐ Ver análisis completo con Premium
          </button>
        </div>
      )}

      {/* Sección info */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>🧠 ¿Cómo funciona?</div>
        {[
          { emoji: "🔢", titulo: "Numerología", desc: "Tu fecha de nacimiento se convierte en tu número de camino de vida, revelando tu misión y propósito." },
          { emoji: "⭐", titulo: "Astrología", desc: "La posición de los astros en tu nacimiento determina energías, talentos y desafíos únicos." },
          { emoji: "🎯", titulo: "Plan Personal", desc: "Combina ambos sistemas para crear un mapa personalizado hacia tu mejor versión." },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>{item.emoji}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{item.titulo}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={styles.app}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>✨ Dreamer</div>
        <div style={styles.subtitle}>Piensa en grande · Cree · Sueña · Atrévete</div>
      </div>

      {/* Contenido principal */}
      <div style={styles.content}>
        {tabActiva === "inicio" && renderInicio()}
        {tabActiva === "board" && renderBoard()}
        {tabActiva === "metas" && renderMetas()}
        {tabActiva === "afirmaciones" && renderAfirmaciones()}
        {tabActiva === "ai" && renderAiDream()}
      </div>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {[
          { id: "inicio", emoji: "🏠", label: "Inicio" },
          { id: "board", emoji: "🖼️", label: "Board" },
          { id: "metas", emoji: "🎯", label: "Metas" },
          { id: "afirmaciones", emoji: "💫", label: "Afirmar" },
          { id: "ai", emoji: "🔮", label: "AI Dream" },
        ].map((tab) => (
          <button key={tab.id} style={styles.tab(tabActiva === tab.id)} onClick={() => setTabActiva(tab.id)}>
            <span style={styles.tabEmoji}>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Modal: Nueva Meta */}
      {modalNuevaMeta && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && setModalNuevaMeta(false)}>
          <div style={styles.modalContent}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>🎯 Nueva Meta</div>
            <label style={styles.label}>Nombre de tu meta</label>
            <input
              style={styles.input}
              placeholder="Ej: Aprender a tocar la guitarra..."
              value={nuevaMeta.titulo}
              onChange={(e) => setNuevaMeta((p) => ({ ...p, titulo: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && agregarMeta()}
            />
            <label style={{ ...styles.label, marginTop: 14 }}>Categoría</label>
            <select
              style={styles.select}
              value={nuevaMeta.categoria}
              onChange={(e) => setNuevaMeta((p) => ({ ...p, categoria: e.target.value }))}
            >
              {CATEGORIAS_BOARD.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
              ))}
            </select>
            <button style={styles.btnGold} onClick={agregarMeta}>
              ✨ Crear meta
            </button>
            <button style={styles.btnOutline} onClick={() => setModalNuevaMeta(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal: Añadir al Board */}
      {modalImagenBoard && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && setModalImagenBoard(false)}>
          <div style={styles.modalContent}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>🖼️ Añadir al Vision Board</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 20 }}>
              Elige una categoría para añadir una imagen inspiradora
              {/* TODO: Permitir subida de imágenes personalizadas del usuario */}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {CATEGORIAS_BOARD.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => agregarAlBoard(cat.id)}
                  style={{
                    background: cat.color + "22",
                    border: `1px solid ${cat.color}44`,
                    borderRadius: 14,
                    padding: "16px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "transform 0.1s",
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{cat.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: cat.color }}>{cat.label}</div>
                </div>
              ))}
            </div>
            <button style={{ ...styles.btnOutline, marginTop: 16 }} onClick={() => setModalImagenBoard(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal: Premium */}
      {modalPremium && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && setModalPremium(false)}>
          <div style={styles.modalContent}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>⭐</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, background: "linear-gradient(135deg, #FFD700, #FFA500)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Dreamer Premium
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                Desbloquea todo el poder de tu mente y tu potencial
              </div>
            </div>
            {[
              "🔮 Análisis astrológico completo",
              "📊 Reportes personalizados de numerología",
              "🎯 Metas ilimitadas con seguimiento avanzado",
              "💫 Afirmaciones personalizadas con IA",
              "🖼️ Vision Board premium con 1000+ imágenes",
              "🔔 Recordatorios inteligentes diarios",
              "📈 Estadísticas de progreso detalladas",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,215,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10 }}>✓</div>
                <div style={{ fontSize: 14 }}>{item}</div>
              </div>
            ))}
            {/* TODO: Implementar pasarela de pago real con Stripe */}
            <div style={{ background: "rgba(255,215,0,0.1)", borderRadius: 14, padding: "14px", textAlign: "center", marginTop: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#FFD700" }}>4,99€</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>por mes · Cancela cuando quieras</div>
            </div>
            <button style={styles.btnGold} onClick={() => setModalPremium(false)}>
              🚀 Comenzar prueba gratis 7 días
            </button>
            <button style={styles.btnOutline} onClick={() => setModalPremium(false)}>
              Ahora no
            </button>
          </div>
        </div>
      )}
    </div>
  );
}