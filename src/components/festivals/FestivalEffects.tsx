import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  rotation?: number;
  color?: string;
}

// Diwali Firecrackers Effect
export function DiwaliEffects() {
  const [sparks, setSparks] = useState<Particle[]>([]);
  const [diyas, setDiyas] = useState<Particle[]>([]);

  useEffect(() => {
    // Create floating diyas
    const diyaParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 85 + Math.random() * 15,
      size: 20 + Math.random() * 15,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 2,
    }));
    setDiyas(diyaParticles);

    // Create sparkles
    const sparkParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 6,
      delay: Math.random() * 5,
      duration: 1 + Math.random() * 2,
      color: ['#fbbf24', '#f97316', '#ef4444', '#fcd34d'][Math.floor(Math.random() * 4)],
    }));
    setSparks(sparkParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Floating Diyas */}
      {diyas.map((diya) => (
        <motion.div
          key={`diya-${diya.id}`}
          className="absolute"
          style={{ left: `${diya.x}%`, bottom: `${100 - diya.y}%` }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: diya.duration,
            delay: diya.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="relative" style={{ fontSize: diya.size }}>
            🪔
            <motion.div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-6 rounded-full"
              style={{
                background: "radial-gradient(ellipse at bottom, #fbbf24 0%, transparent 70%)",
                filter: "blur(2px)",
              }}
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      ))}

      {/* Sparkles */}
      {sparks.map((spark) => (
        <motion.div
          key={`spark-${spark.id}`}
          className="absolute rounded-full"
          style={{
            left: `${spark.x}%`,
            top: `${spark.y}%`,
            width: spark.size,
            height: spark.size,
            background: spark.color,
            boxShadow: `0 0 ${spark.size * 2}px ${spark.color}`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: spark.duration,
            delay: spark.delay,
            repeat: Infinity,
          }}
        />
      ))}

      {/* Rangoli corners */}
      <div className="absolute bottom-4 left-4 text-6xl opacity-50 animate-pulse">🌸</div>
      <div className="absolute bottom-4 right-4 text-6xl opacity-50 animate-pulse" style={{ animationDelay: "0.5s" }}>🌸</div>
    </div>
  );
}

// Christmas Snow & Santa Effect
export function ChristmasEffects() {
  const snowflakes = useMemo(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 8,
      drift: (Math.random() - 0.5) * 30,
    }))
  , []);

  const [santaVisible, setSantaVisible] = useState(false);

  useEffect(() => {
    // Randomly show Santa sleigh
    const showSanta = () => {
      setSantaVisible(true);
      setTimeout(() => setSantaVisible(false), 8000);
    };
    
    const interval = setInterval(showSanta, 30000);
    setTimeout(showSanta, 5000); // Show once after 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Snowflakes */}
      {snowflakes.map((flake) => (
        <motion.div
          key={`snow-${flake.id}`}
          className="absolute text-white opacity-80"
          style={{
            left: `${flake.x}%`,
            top: `${flake.y}%`,
            fontSize: flake.size,
          }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, flake.drift, -flake.drift, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ❄
        </motion.div>
      ))}

      {/* Santa Sleigh */}
      <AnimatePresence>
        {santaVisible && (
          <motion.div
            className="absolute top-10 text-5xl"
            initial={{ x: "-100px", opacity: 0 }}
            animate={{ x: "calc(100vw + 100px)", opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 8, ease: "linear" }}
          >
            🎅🦌🛷
          </motion.div>
        )}
      </AnimatePresence>

      {/* Christmas decorations */}
      <div className="absolute top-2 left-4 text-4xl">🎄</div>
      <div className="absolute top-2 right-4 text-4xl">🎄</div>
      <motion.div 
        className="absolute top-10 left-1/4 text-3xl"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🔔
      </motion.div>
      <motion.div 
        className="absolute top-10 right-1/4 text-3xl"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        🔔
      </motion.div>
    </div>
  );
}

// Holi Colors Effect
export function HoliEffects() {
  const colors = useMemo(() => 
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 20 + Math.random() * 40,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 3,
      color: ['#ec4899', '#8b5cf6', '#22c55e', '#f97316', '#3b82f6', '#eab308'][Math.floor(Math.random() * 6)],
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {colors.map((splash) => (
        <motion.div
          key={`splash-${splash.id}`}
          className="absolute rounded-full"
          style={{
            left: `${splash.x}%`,
            top: `${splash.y}%`,
            width: splash.size,
            height: splash.size,
            background: splash.color,
            filter: "blur(10px)",
          }}
          animate={{
            opacity: [0, 0.4, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: splash.duration,
            delay: splash.delay,
            repeat: Infinity,
          }}
        />
      ))}
      
      {/* Pichkari in corners */}
      <div className="absolute bottom-4 left-4 text-5xl">💦</div>
      <div className="absolute top-20 right-4 text-5xl transform -rotate-45">🎨</div>
    </div>
  );
}

// New Year Confetti Effect
export function NewYearEffects() {
  const confetti = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -5,
      size: 6 + Math.random() * 10,
      delay: Math.random() * 8,
      duration: 4 + Math.random() * 4,
      rotation: Math.random() * 720,
      color: ['#fbbf24', '#ef4444', '#22c55e', '#3b82f6', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 6)],
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={`confetti-${piece.id}`}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: piece.size,
            height: piece.size * 0.6,
            background: piece.color,
            borderRadius: "2px",
          }}
          animate={{
            y: ["0vh", "110vh"],
            rotate: [0, piece.rotation],
            x: [0, (Math.random() - 0.5) * 100],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      
      {/* Balloons */}
      <motion.div 
        className="absolute bottom-20 left-10 text-5xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        🎈
      </motion.div>
      <motion.div 
        className="absolute bottom-20 right-10 text-5xl"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      >
        🎈
      </motion.div>
      
      {/* Fireworks text */}
      <motion.div 
        className="absolute top-4 left-1/2 -translate-x-1/2 text-4xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🎆
      </motion.div>
    </div>
  );
}

// Independence Day Effect
export function IndependenceDayEffects() {
  const flags = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: 5 + (i * 6.5),
      y: 2,
      size: 25 + Math.random() * 10,
      delay: Math.random() * 2,
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Tricolor ribbons at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-green-600" />
      
      {/* Flags */}
      {flags.map((flag) => (
        <motion.div
          key={`flag-${flag.id}`}
          className="absolute"
          style={{ left: `${flag.x}%`, top: `${flag.y}%`, fontSize: flag.size }}
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1, delay: flag.delay, repeat: Infinity }}
        >
          🇮🇳
        </motion.div>
      ))}
      
      {/* Ashoka Chakra in center */}
      <motion.div 
        className="absolute top-20 left-1/2 -translate-x-1/2 text-6xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        ☸️
      </motion.div>
    </div>
  );
}

// Main Festival Effects Component
interface FestivalEffectsProps {
  theme: string | null;
}

export function FestivalEffectsProvider({ theme }: FestivalEffectsProps) {
  if (!theme) return null;

  switch (theme) {
    case "diwali":
      return <DiwaliEffects />;
    case "christmas":
      return <ChristmasEffects />;
    case "holi":
      return <HoliEffects />;
    case "new_year":
      return <NewYearEffects />;
    case "independence_day":
      return <IndependenceDayEffects />;
    default:
      return null;
  }
}
