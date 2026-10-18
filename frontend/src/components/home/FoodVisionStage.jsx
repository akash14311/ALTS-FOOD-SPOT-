import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DitherVeil from '../common/DitherVeil';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/foodVision.css';

// Custom Animated Sensory SVG Icons
const GlassesIcon = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Bridge */}
    <path d="M10 13.5h4" />
    {/* Left Frame */}
    <rect x="2" y="9.5" width="8" height="7.5" rx="3.5" />
    {/* Right Frame */}
    <rect x="14" y="9.5" width="8" height="7.5" rx="3.5" />
    {/* Temple arms */}
    <path d="M2 13L0.5 9" />
    <path d="M22 13L23.5 9" />
    {/* Lens specular reflections */}
    <path d="M4.5 12L7 14.5" strokeWidth="1.5" strokeOpacity="0.75" />
    <path d="M16.5 12L19 14.5" strokeWidth="1.5" strokeOpacity="0.75" />
  </svg>
);

const BrainIcon = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Left Cerebral Hemisphere */}
    <path d="M12 4.5a3.5 3.5 0 0 0-3.5-2.5A4.5 4.5 0 0 0 4 6.5a4 4 0 0 0-1 4 4 4 0 0 0 1.5 4.5 3.5 3.5 0 0 0 2.5 5 3.5 3.5 0 0 0 5-1.5" />
    {/* Right Cerebral Hemisphere */}
    <path d="M12 4.5a3.5 3.5 0 0 1 3.5-2.5A4.5 4.5 0 0 1 20 6.5a4 4 0 0 1 1 4 4 4 0 0 1-1.5 4.5 3.5 3.5 0 0 1-2.5 5 3.5 3.5 0 0 1-5-1.5" />
    {/* Central Fissure */}
    <path d="M12 2.5v16" strokeDasharray="1.5 1.5" strokeWidth="1.5" strokeOpacity="0.6" />
    {/* Neural Synapses */}
    <path d="M6.5 10c1.5 0 2.5 1 2.5 2.5" strokeWidth="1.5" />
    <path d="M17.5 10c-1.5 0-2.5 1-2.5 2.5" strokeWidth="1.5" />
    <circle cx="12" cy="10" r="1" fill="currentColor" />
  </svg>
);

const LipsIcon = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Upper lip with Cupid's bow */}
    <path
      d="M2.5 12c3-3.8 6.5-3.8 9.5-1.8 3-2 6.5-2 9.5 1.8-2.5 2-6 2.5-9.5 0.5-3.5 2-7 1.5-9.5-0.5z"
      fill="currentColor"
      fillOpacity="0.18"
    />
    {/* Lower full lip contour */}
    <path
      d="M2.5 12c3 4.8 6.5 7.2 9.5 7.2s6.5-2.4 9.5-7.2c-3 1.5-6.5 2-9.5 2s-6.5-0.5-9.5-2z"
      fill="currentColor"
      fillOpacity="0.28"
    />
    {/* Sensorial mouth line */}
    <path d="M3 12c3 1.5 6 2 9 2s6-0.5 9-2" strokeWidth="1.8" />
    {/* Gloss highlight */}
    <path d="M9.5 15.8c1.5 0.5 3.5 0.5 5 0" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />
  </svg>
);

const HeartIcon = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Cardio Chamber Shape */}
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
      fillOpacity="0.2"
    />
    {/* Dynamic ECG Heartbeat pulse line */}
    <path
      d="M5 11.5h3l1.5-3.2 2.5 6.2 1.8-4.5 1.2 2.5H19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Bio-sensory points positioned cleanly in the adjacent dashboard
const SENSORY_POINTS = [
  {
    id: 'glasses',
    name: 'Food-Frame Glasses',
    tagline: 'Visual Appetite Engine',
    metric: '99.4% Craving Focus',
    accent: '#ff4d2e',
    bg: 'rgba(255, 77, 46, 0.12)',
    iconComponent: GlassesIcon,
    description:
      'Gourmet spectacle frames sculpted from mini sesame burgers, crisp golden fries, and berry glazes. Locks on to top chef creations in your city.',
    foodHint: 'Browse Burgers & Kebabs',
    link: '/search?cuisine=Burgers'
  },
  {
    id: 'brain',
    name: 'Craving Synapse',
    tagline: 'Cerebral Appetite Center',
    metric: 'Dopamine Surge: +85%',
    accent: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.12)',
    iconComponent: BrainIcon,
    description:
      'Triggers dopamine spikes and sweet-tooth impulses. Predicts whether your mood needs piping hot biryani or decadent chocolate cake.',
    foodHint: 'Explore Desserts & Sweets',
    link: '/search?cuisine=Desserts'
  },
  {
    id: 'lips',
    name: 'Tastebud Receptors',
    tagline: 'Multi-Flavor Calibration',
    metric: '10,000 Papillae Active',
    accent: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    iconComponent: LipsIcon,
    description:
      'Tuned for extreme crunch, rich buttery makhani gravies, and tangy street chaats that awaken all 10,000 tastebuds.',
    foodHint: 'Explore North Indian Curries',
    link: '/search?cuisine=North%20Indian'
  },
  {
    id: 'heart',
    name: 'Comfort Heart Rate',
    tagline: 'Soul-Food Endorphins',
    metric: '72 BPM Soothed',
    accent: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    iconComponent: HeartIcon,
    description:
      'Warm comforting meals that nourish the soul and slow down a busy day with 30-minute doorstep delivery.',
    foodHint: 'Explore South Indian Meals',
    link: '/search?cuisine=South%20Indian'
  }
];

const LIGHT_PALETTES = [
  {
    id: 'roast',
    label: 'Dark Roast',
    ink: '#1C1917',
    paper: '#FAF7F2',
    rim: '#FF4D2E',
    mode: 'duotone'
  },
  {
    id: 'sunset',
    label: 'Sunset Amber',
    ink: '#260A02',
    paper: '#FEF3C7',
    rim: '#FF8A00',
    mode: 'duotone'
  },
  {
    id: 'berry',
    label: 'Berry Glaze',
    ink: '#1A0826',
    paper: '#FCE7F3',
    rim: '#EC4899',
    mode: 'duotone'
  },
  {
    id: 'rgb',
    label: 'Vibrant RGB',
    ink: '#0A0A0F',
    paper: '#FFFFFF',
    rim: '#38BDF8',
    mode: 'rgb'
  }
];

const DARK_PALETTES = [
  {
    id: 'obsidian',
    label: 'Obsidian Glow',
    ink: '#FF5A3D',
    paper: '#0B0F19',
    rim: '#FF8A00',
    mode: 'duotone'
  },
  {
    id: 'cyberpunk',
    label: 'Neon Cyber',
    ink: '#38BDF8',
    paper: '#0F172A',
    rim: '#818CF8',
    mode: 'duotone'
  },
  {
    id: 'amber',
    label: 'Golden Ember',
    ink: '#FBBF24',
    paper: '#181109',
    rim: '#FF5A3D',
    mode: 'duotone'
  },
  {
    id: 'matrix',
    label: 'Matrix Emerald',
    ink: '#34D399',
    paper: '#061712',
    rim: '#10B981',
    mode: 'duotone'
  }
];

const PATTERNS = [
  { id: 'floyd', label: 'Floyd-Steinberg' },
  { id: 'atkinson', label: 'Atkinson' },
  { id: 'noise', label: 'Blue Noise' },
  { id: 'bayer', label: 'Bayer Grid' },
  { id: 'lines', label: 'Engraving' }
];

const FoodVisionStage = () => {
  const { isDark } = useTheme();
  const palettes = isDark ? DARK_PALETTES : LIGHT_PALETTES;
  const [activePoint, setActivePoint] = useState(SENSORY_POINTS[0]);
  const [currentPattern, setCurrentPattern] = useState('floyd');
  const [currentPalette, setCurrentPalette] = useState(() => (isDark ? DARK_PALETTES[0] : LIGHT_PALETTES[0]));
  const [pixelSize, setPixelSize] = useState(2);
  const [wander, setWander] = useState(false);
  const [reverse, setReverse] = useState(false);

  // Sync palette automatically when dark/light mode toggles
  useEffect(() => {
    setCurrentPalette(isDark ? DARK_PALETTES[0] : LIGHT_PALETTES[0]);
  }, [isDark]);

  return (
    <section className="foodvision-section" id="foodvision-stage">
      <div className="container">
        <div className="foodvision-container">
          
          {/* Interactive WebGL Canvas with DitherVeil (100% clean, unobstructed portrait) */}
          <div className="foodvision-stage-box">
            <div className="foodvision-canvas-wrapper">
              <DitherVeil
                src="/images/food_glasses_portrait.jpg"
                fit="cover"
                pattern={currentPattern}
                pixelSize={pixelSize}
                palette={currentPalette.mode}
                inkColor={currentPalette.ink}
                paperColor={currentPalette.paper}
                rimColor={currentPalette.rim}
                rim={0.12}
                contrast={1.2}
                brightness={0.02}
                revealRadius={190}
                softness={0.65}
                linger={1.3}
                reverse={reverse}
                wander={wander}
                clickBurst={true}
              />
            </div>
          </div>

          {/* Functional Details & Sensory Controller Panel */}
          <div className="foodvision-panel">
            <div>
              <div className="foodvision-badge">
                <FiStar />
                <span>Food-Frame Vision™ Sensory Experience</span>
              </div>
              <h2 className="foodvision-title">
                The <span>Food-Frame</span> Vision
              </h2>
              <p className="foodvision-description">
                Experience how gourmet culinary design interacts with human sensory anatomy.
                Hover across the portrait to reveal the handcrafted burger & fry spectacle frames,
                and tune into sensory response centers below.
              </p>
            </div>

            {/* Sensory Organ Cards Dashboard (Cleanly arranged outside the image) */}
            <div className="foodvision-sensory-grid">
              {SENSORY_POINTS.map((pt) => {
                const isActive = activePoint.id === pt.id;
                const Icon = pt.iconComponent;
                return (
                  <div
                    key={pt.id}
                    className={`foodvision-sensory-card ${isActive ? 'active' : ''}`}
                    style={{ '--card-accent': pt.accent }}
                    onClick={() => setActivePoint(pt)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setActivePoint(pt);
                      }
                    }}
                  >
                    <div className="foodvision-card-header">
                      <div
                        className="foodvision-icon-wrap"
                        style={{
                          background: pt.bg,
                          color: pt.accent,
                          boxShadow: isActive ? `0 0 16px ${pt.accent}40` : 'none'
                        }}
                      >
                        <Icon className={`sensory-svg-icon icon-${pt.id}`} />
                      </div>
                      <span className="foodvision-metric-badge">{pt.metric}</span>
                    </div>
                    <div>
                      <div className="foodvision-sensory-name">{pt.name}</div>
                      <div className="foodvision-sensory-tagline">{pt.tagline}</div>
                      <p className="foodvision-sensory-desc">{pt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DitherVeil Real-Time Shader Controls */}
            <div className="foodvision-controls-box">
              <div className="foodvision-control-group">
                <div className="foodvision-control-label">
                  <span>Dithering Algorithm</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{currentPattern}</span>
                </div>
                <div className="foodvision-chip-group">
                  {PATTERNS.map((p) => (
                    <button
                      key={p.id}
                      className={`foodvision-chip ${currentPattern === p.id ? 'active' : ''}`}
                      onClick={() => setCurrentPattern(p.id)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="foodvision-control-group">
                <div className="foodvision-control-label">
                  <span>Shader Palette & Mood</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{currentPalette.label}</span>
                </div>
                <div className="foodvision-chip-group">
                  {palettes.map((pal) => (
                    <button
                      key={pal.id}
                      className={`foodvision-chip ${currentPalette.id === pal.id ? 'active' : ''}`}
                      onClick={() => setCurrentPalette(pal)}
                    >
                      {pal.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="foodvision-control-group" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className={`foodvision-chip ${wander ? 'active' : ''}`}
                  onClick={() => setWander(!wander)}
                >
                  {wander ? '✦ Auto-Wander Active' : 'Enable Auto-Wander'}
                </button>
                <button
                  className={`foodvision-chip ${reverse ? 'active' : ''}`}
                  onClick={() => setReverse(!reverse)}
                >
                  {reverse ? 'Mode: Reverse Dither' : 'Mode: Reveal Color'}
                </button>
                <button
                  className="foodvision-chip"
                  onClick={() => setPixelSize(pixelSize === 2 ? 4 : pixelSize === 4 ? 6 : 2)}
                >
                  Pixel Size: {pixelSize}px
                </button>
              </div>
            </div>

            {/* Quick Link to Current Craving */}
            <div className="foodvision-actions">
              <Link to={activePoint.link} className="foodvision-cta-btn">
                <span>{activePoint.foodHint}</span>
                <FiArrowRight />
              </Link>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Click portrait to send shockwave color ripples
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FoodVisionStage;
