"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

// 5 phases cinématographiques
type Phase = "apparition" | "souffle" | "construction" | "revelation" | "transition";

interface PhaseConfig {
  duration: number;
  next: Phase | null;
}

const PHASES: Record<Phase, PhaseConfig> = {
  apparition: { duration: 2200, next: "souffle" },
  souffle: { duration: 2000, next: "construction" },
  construction: { duration: 2000, next: "revelation" },
  revelation: { duration: 1400, next: "transition" },
  transition: { duration: 800, next: null },
};

interface BokehParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  blur: number;
  opacity: number;
  vx: number;
  vy: number;
  hue: number;
}

export default function Generation() {
  const [phase, setPhase] = useState<Phase>("apparition");
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [drawnLetters, setDrawnLetters] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bokehRef = useRef<BokehParticle[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Récupère le nom et la description
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const urlName = urlParams.get("name");
    const urlDesc = urlParams.get("description") || urlParams.get("prompt");

    const storedName = localStorage.getItem("sellia_shop_name");
    const storedDesc = localStorage.getItem("sellia_prompt");

    const finalName = urlName || storedName || "Votre Boutique";
    const finalDesc = urlDesc || storedDesc || "Boutique en ligne";

    setShopName(finalName);
    setShopDescription(finalDesc);

    if (urlName) localStorage.setItem("sellia_shop_name", urlName);
    if (urlDesc) localStorage.setItem("sellia_prompt", urlDesc);
  }, []);

  // Audio ambient (Web Audio API)
  useEffect(() => {
    if (!audioEnabled || typeof window === "undefined") return;

    const startAudio = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Drone ambient : 3 oscillateurs harmoniques
        const baseFreq = 110; // A2
        const harmonics = [baseFreq, baseFreq * 1.5, baseFreq * 2];

        const masterGain = ctx.createGain();
        masterGain.gain.value = 0;
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Filter pour adoucir
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 800;
        filter.Q.value = 1;
        filter.connect(masterGain);

        harmonics.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = idx === 0 ? "sine" : "triangle";
          osc.frequency.value = freq;

          // LFO pour vibrato subtil
          const lfo = ctx.createOscillator();
          lfo.frequency.value = 0.2 + idx * 0.1;
          const lfoGain = ctx.createGain();
          lfoGain.gain.value = 1.5;
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);

          const oscGain = ctx.createGain();
          oscGain.gain.value = 0.15 / (idx + 1);

          osc.connect(oscGain);
          oscGain.connect(filter);
          osc.start();
          lfo.start();
          oscillatorsRef.current.push(osc);
        });

        // Fade in
        masterGain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 1.5);
        setAudioReady(true);
      } catch (e) {
        console.warn("Audio init failed", e);
      }
    };

    startAudio();

    return () => {
      const ctx = audioContextRef.current;
      const gain = gainNodeRef.current;
      if (ctx && gain) {
        try {
          gain.gain.cancelScheduledValues(ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
          setTimeout(() => {
            oscillatorsRef.current.forEach((osc) => {
              try { osc.stop(); } catch {}
            });
            try { ctx.close(); } catch {}
          }, 600);
        } catch {}
      }
    };
  }, [audioEnabled]);

  // Toggle audio
  const toggleAudio = () => {
    if (audioEnabled && audioContextRef.current && gainNodeRef.current) {
      gainNodeRef.current.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContextRef.current.currentTime + 0.3
      );
      setTimeout(() => {
        oscillatorsRef.current.forEach((osc) => {
          try { osc.stop(); } catch {}
        });
        oscillatorsRef.current = [];
        try { audioContextRef.current?.close(); } catch {}
      }, 400);
    }
    setAudioEnabled(!audioEnabled);
  };

  // Phases sequencer
  useEffect(() => {
    const config = PHASES[phase];
    if (!config.next) {
      // Fin : sauvegarde + redirection
      if (typeof window !== "undefined") {
        const generated = {
          name: shopName,
          tagline: "Une histoire à raconter, une marque à créer.",
          description: shopDescription,
          generatedAt: new Date().toISOString(),
        };
        localStorage.setItem("sellia_generated_shop", JSON.stringify(generated));
      }
      const timer = setTimeout(() => {
        window.location.href = "/apercu";
      }, config.duration);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setPhase(config.next as Phase);
    }, config.duration);

    return () => clearTimeout(timer);
  }, [phase, shopName, shopDescription]);

  // Animation des lettres dessinées (ink draw)
  useEffect(() => {
    if (phase === "apparition" && shopName) {
      let i = 0;
      const totalDuration = 1800;
      const perLetter = totalDuration / shopName.length;
      const interval = setInterval(() => {
        if (i <= shopName.length) {
          setDrawnLetters(i);
          i++;
        } else {
          clearInterval(interval);
        }
      }, perLetter);
      return () => clearInterval(interval);
    }
  }, [phase, shopName]);

  // Canvas Bokeh particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Init bokeh
    if (bokehRef.current.length === 0) {
      for (let i = 0; i < 25; i++) {
        bokehRef.current.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 80 + 30,
          blur: Math.random() * 30 + 20,
          opacity: Math.random() * 0.15 + 0.05,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          hue: Math.random() > 0.6 ? 16 : 35, // ember ou warm
        });
      }
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bokehRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.size) p.x = canvas.width + p.size;
        if (p.x > canvas.width + p.size) p.x = -p.size;
        if (p.y < -p.size) p.y = canvas.height + p.size;
        if (p.y > canvas.height + p.size) p.y = -p.size;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${p.opacity})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, 80%, 60%, ${p.opacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Construction d'éléments visuels par phase
  const renderShopName = () => {
    if (!shopName) return null;
    const visibleName = shopName.slice(0, drawnLetters);
    const remainingName = shopName.slice(drawnLetters);

    return (
      <span className="cinema-name-text">
        <span className="cinema-name-visible">{visibleName}</span>
        <span className="cinema-name-pending">{remainingName}</span>
        {drawnLetters < shopName.length && drawnLetters > 0 && (
          <span className="cinema-name-cursor"></span>
        )}
      </span>
    );
  };

  return (
    <div className={`cinema-page cinema-phase-${phase}`}>
      {/* Bokeh canvas */}
      <canvas ref={canvasRef} className="cinema-bokeh"></canvas>

      {/* Background atmospheric */}
      <div className="cinema-atmosphere">
        <div className="cinema-glow-center"></div>
        <div className="cinema-vignette-deep"></div>
      </div>

      {/* Lens flare (apparaît à la révélation) */}
      <div className="cinema-lens-flare"></div>

      {/* Audio control */}
      <button
        onClick={toggleAudio}
        className="cinema-audio-toggle"
        aria-label={audioEnabled ? "Couper le son" : "Activer le son"}
      >
        {audioEnabled ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>

      {/* Logo discret en haut */}
      <Link href="/" className="cinema-logo" aria-label="Sellia">
        <svg width="100" height="28" viewBox="0 0 220 60" fill="none">
          <path d="M 8 8 L 38 8 L 54 24 L 54 54 L 8 54 Z" fill="#FAFAF7" opacity="0.7" />
          <circle cx="16" cy="16" r="2.4" fill="#0E1116" />
          <path d="M 38 30 L 24 30 L 24 36 L 38 36 L 38 44 L 24 44" stroke="#E84B1F" strokeWidth="2.6" fill="none" strokeLinecap="square" />
          <text x="68" y="44" fontFamily="Inter, system-ui, sans-serif" fontSize="32" fontWeight="600" fill="#FAFAF7" letterSpacing="-1.2" opacity="0.7">sellia</text>
        </svg>
      </Link>

      {/* Contenu central */}
      <div className="cinema-stage">
        {/* Nom de la boutique - élément principal */}
        <div className="cinema-name-container">
          {/* Cadre lumineux (apparaît en phase 1) */}
          <div className="cinema-name-frame">
            <span className="cinema-frame-line cinema-frame-top-left"></span>
            <span className="cinema-frame-line cinema-frame-top-right"></span>
            <span className="cinema-frame-line cinema-frame-bottom-left"></span>
            <span className="cinema-frame-line cinema-frame-bottom-right"></span>
          </div>

          {/* Eyebrow texte poétique */}
          <span className="cinema-eyebrow">
            {phase === "apparition" && "Voici"}
            {phase === "souffle" && "Une histoire commence"}
            {phase === "construction" && "Nous l'habillons"}
            {phase === "revelation" && "Votre boutique est née"}
            {phase === "transition" && "Bienvenue"}
          </span>

          {/* Nom géant */}
          <h1 className="cinema-name">
            {renderShopName()}
          </h1>

          {/* Sous-texte qui apparaît selon la phase */}
          <span className="cinema-subtitle">
            {phase === "souffle" && "Nous tissons votre univers"}
            {phase === "construction" && "Nous donnons vie à votre vision"}
            {phase === "revelation" && "Prête à accueillir vos premiers clients"}
            {phase === "transition" && "Préparation de votre aperçu..."}
          </span>
        </div>

        {/* Layer 2 : éléments qui se tissent (phase souffle) */}
        <div className="cinema-weaving">
          {/* Palette qui se forme */}
          <div className="cinema-palette-element">
            <span className="cinema-palette-dot" style={{ background: "#1A1A1A" }}></span>
            <span className="cinema-palette-dot" style={{ background: "#F5F1EA" }}></span>
            <span className="cinema-palette-dot" style={{ background: "#A89484" }}></span>
            <span className="cinema-palette-dot" style={{ background: "#E84B1F" }}></span>
          </div>

          {/* Mots flottants - métaphores */}
          <span className="cinema-floating-word cinema-word-1">Identité</span>
          <span className="cinema-floating-word cinema-word-2">Élégance</span>
          <span className="cinema-floating-word cinema-word-3">Style</span>
          <span className="cinema-floating-word cinema-word-4">Caractère</span>
          <span className="cinema-floating-word cinema-word-5">Singulier</span>
          <span className="cinema-floating-word cinema-word-6">Unique</span>
        </div>

        {/* Layer 3 : Construction mockup miniature (phase construction) */}
        <div className="cinema-construction">
          <div className="cinema-mini-shop">
            <div className="cinema-mini-line cinema-mini-nav"></div>
            <div className="cinema-mini-block cinema-mini-hero">
              <div className="cinema-mini-line cinema-mini-line-1"></div>
              <div className="cinema-mini-line cinema-mini-line-2"></div>
              <div className="cinema-mini-line cinema-mini-line-3"></div>
            </div>
            <div className="cinema-mini-grid">
              <div className="cinema-mini-tile cinema-mini-tile-1"></div>
              <div className="cinema-mini-tile cinema-mini-tile-2"></div>
              <div className="cinema-mini-tile cinema-mini-tile-3"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer ultra-minimal */}
      <div className="cinema-footer">
        <span className="cinema-footer-mono">
          {phase === "transition" ? "→ Transition" : "Création..."}
        </span>
      </div>

      {/* Transition finale (fade noir) */}
      <div className="cinema-transition-overlay"></div>
    </div>
  );
}
