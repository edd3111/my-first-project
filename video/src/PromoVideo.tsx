import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

const C = {
  primary: "#A100FF",
  black: "#0D0D0D",
  white: "#ffffff",
  muted: "#a0aec0",
  violet: "#ddb3ff",
  light: "#f7f7f8",
  text: "#18181b",
};

function fi(
  frame: number,
  input: [number, number],
  output: [number, number],
): number {
  return interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function formatCount(value: number, target: number): string {
  if (target >= 10000) {
    const k = Math.floor(value / 1000);
    const rem = value % 1000;
    if (k === 0) return String(rem);
    return `${k} ${String(rem).padStart(3, "0")}`;
  }
  return String(value);
}

// ─── Scene 1: Intro (frames 0–89, 3 s) ────────────────────────────────────
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = spring({ frame, fps, config: { damping: 14, stiffness: 70 }, from: 0.75, to: 1 });
  const opacity = fi(frame, [0, 12], [0, 1]);
  const subOpacity = fi(frame, [25, 45], [0, 1]);
  const glow = fi(frame, [10, 60], [0, 0.65]);

  return (
    <AbsoluteFill
      style={{
        background: C.black,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ textAlign: "center", opacity, transform: `scale(${sc})` }}>
        <div
          style={{
            fontSize: 108,
            fontWeight: 800,
            color: C.white,
            letterSpacing: -3,
            lineHeight: 1,
            textShadow: `0 0 120px rgba(161,0,255,${glow})`,
          }}
        >
          Мастер<span style={{ color: C.primary }}>Переговоров</span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: C.muted,
            marginTop: 24,
            fontWeight: 500,
            opacity: subOpacity,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Профессиональный тренинг · 2 дня
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Tagline (frames 90–209, 4 s) ────────────────────────────────
const Tagline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const l1 = spring({ frame, fps, config: { damping: 12, stiffness: 60 } });
  const l1Op = fi(frame, [0, 12], [0, 1]);
  const l2 = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 12, stiffness: 60 },
  });
  const l2Op = fi(frame, [18, 30], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(140deg, ${C.black} 0%, #3d0066 45%, ${C.primary} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        padding: "0 120px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: C.white,
            lineHeight: 1.2,
            letterSpacing: -2,
            opacity: l1Op,
            transform: `translateY(${(1 - l1) * 50}px)`,
          }}
        >
          Переговоры,
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: -2,
            color: C.violet,
            opacity: l2Op,
            transform: `translateY(${(1 - l2) * 50}px)`,
          }}
        >
          которые приносят результат
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Stats (frames 210–359, 5 s) ─────────────────────────────────
const STATS: Array<{ target: number; suffix: string; label: string }> = [
  { target: 20000, suffix: "+", label: "Выпускников" },
  { target: 20, suffix: "+ лет", label: "Опыт тренера" },
  { target: 94, suffix: "%", label: "Рекомендуют" },
  { target: 40, suffix: "+", label: "Тем" },
];

const StatBox: React.FC<{
  target: number;
  suffix: string;
  label: string;
  delay: number;
}> = ({ target, suffix, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const localFrame = Math.max(0, frame - delay);
  const opacity = fi(frame, [delay, delay + 15], [0, 1]);
  const sc = spring({
    frame: localFrame,
    fps,
    config: { damping: 12, stiffness: 80 },
    from: 0.7,
    to: 1,
  });
  const count = Math.round(
    interpolate(localFrame, [0, 60], [0, target], { extrapolateRight: "clamp" }),
  );

  return (
    <div style={{ textAlign: "center", opacity, transform: `scale(${sc})` }}>
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: C.primary,
          lineHeight: 1,
          letterSpacing: -2,
        }}
      >
        {formatCount(count, target)}
        <span style={{ fontSize: 48 }}>{suffix}</span>
      </div>
      <div
        style={{
          fontSize: 22,
          color: C.muted,
          marginTop: 12,
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const Stats: React.FC = () => {
  const frame = useCurrentFrame();
  const titleOp = fi(frame, [0, 20], [0, 1]);
  const titleY = fi(frame, [0, 20], [-30, 0]);

  return (
    <AbsoluteFill
      style={{
        background: C.black,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        gap: 64,
      }}
    >
      <div
        style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontSize: 36,
          fontWeight: 700,
          color: C.white,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        Наши результаты
      </div>
      <div
        style={{
          display: "flex",
          gap: 100,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {STATS.map((s, i) => (
          <StatBox key={i} {...s} delay={i * 15} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4: Program (frames 360–479, 4 s) ───────────────────────────────
const MODULES = [
  "Психология переговоров",
  "Подготовка и планирование",
  "Техники влияния",
  "Жёсткие переговоры",
  "Переговоры о цене",
  "Практический турнир",
];

const Program: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headOp = fi(frame, [0, 20], [0, 1]);
  const headY = fi(frame, [0, 20], [-20, 0]);

  return (
    <AbsoluteFill
      style={{
        background: C.light,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        padding: "60px 120px",
      }}
    >
      <div
        style={{
          opacity: headOp,
          transform: `translateY(${headY}px)`,
          textAlign: "center",
          marginBottom: 48,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: C.primary,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 16,
          }}
        >
          Программа
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: C.text,
            letterSpacing: -1.5,
          }}
        >
          6 модулей за 2 дня
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 24,
          width: "100%",
          maxWidth: 1400,
        }}
      >
        {MODULES.map((title, i) => {
          const delay = 25 + i * 10;
          const localFrame = Math.max(0, frame - delay);
          const opacity = fi(frame, [delay, delay + 15], [0, 1]);
          const sc = spring({
            frame: localFrame,
            fps,
            config: { damping: 14, stiffness: 80 },
            from: 0.88,
            to: 1,
          });
          const ty = fi(frame, [delay, delay + 20], [24, 0]);

          return (
            <div
              key={i}
              style={{
                background: C.white,
                borderRadius: 8,
                padding: "28px 32px",
                borderLeft: `4px solid ${C.primary}`,
                opacity,
                transform: `scale(${sc}) translateY(${ty}px)`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.primary,
                  marginBottom: 8,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Модуль {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: C.text,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: CTA (frames 480–599, 4 s) ───────────────────────────────────
const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOp = fi(frame, [0, 20], [0, 1]);
  const titleSc = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 60 },
    from: 0.8,
    to: 1,
  });
  const dateOp = fi(frame, [20, 40], [0, 1]);
  const dateY = fi(frame, [20, 40], [20, 0]);
  const btnOp = fi(frame, [40, 60], [0, 1]);
  const btnSc = spring({
    frame: Math.max(0, frame - 40),
    fps,
    config: { damping: 10, stiffness: 70 },
    from: 0.7,
    to: 1,
  });

  return (
    <AbsoluteFill
      style={{
        background: C.black,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "0 120px",
      }}
    >
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: C.primary,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 20,
          opacity: titleOp,
        }}
      >
        Осталось 8 мест
      </div>
      <div
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: C.white,
          letterSpacing: -2,
          lineHeight: 1.1,
          marginBottom: 32,
          opacity: titleOp,
          transform: `scale(${titleSc})`,
        }}
      >
        Готовы переговорить лучше?
      </div>
      <div
        style={{
          fontSize: 40,
          fontWeight: 800,
          color: C.violet,
          marginBottom: 48,
          opacity: dateOp,
          transform: `translateY(${dateY}px)`,
        }}
      >
        15–16 мая 2026 · Москва · Онлайн
      </div>
      <div
        style={{
          background: C.primary,
          color: C.white,
          fontSize: 28,
          fontWeight: 700,
          padding: "24px 64px",
          borderRadius: 8,
          opacity: btnOp,
          transform: `scale(${btnSc})`,
          letterSpacing: 0.5,
        }}
      >
        Записаться → t.me/eduardcoach
      </div>
    </AbsoluteFill>
  );
};

// ─── Root composition ─────────────────────────────────────────────────────
export const PromoVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={90}>
        <Intro />
      </Sequence>
      <Sequence from={90} durationInFrames={120}>
        <Tagline />
      </Sequence>
      <Sequence from={210} durationInFrames={150}>
        <Stats />
      </Sequence>
      <Sequence from={360} durationInFrames={120}>
        <Program />
      </Sequence>
      <Sequence from={480} durationInFrames={120}>
        <CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
