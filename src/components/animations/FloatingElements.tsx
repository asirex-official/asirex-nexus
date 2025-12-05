import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  amplitude?: number;
}

export function FloatingElement({ 
  children, 
  className = "",
  delay = 0,
  duration = 4,
  amplitude = 20
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-amplitude / 2, amplitude / 2, -amplitude / 2],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {children}
    </motion.div>
  );
}

interface OrbitingElementProps {
  children: ReactNode;
  className?: string;
  radius?: number;
  duration?: number;
  delay?: number;
  reverse?: boolean;
}

export function OrbitingElement({ 
  children, 
  className = "",
  radius = 100,
  duration = 20,
  delay = 0,
  reverse = false
}: OrbitingElementProps) {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        rotate: reverse ? -360 : 360
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
      style={{ transformOrigin: `${radius}px center` }}
    >
      <motion.div
        animate={{
          rotate: reverse ? 360 : -360
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

interface PulsingGlowProps {
  className?: string;
  color?: string;
  size?: number;
  intensity?: number;
}

export function PulsingGlow({ 
  className = "",
  color = "var(--primary)",
  size = 200,
  intensity = 0.5
}: PulsingGlowProps) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, hsl(${color} / ${intensity}) 0%, transparent 70%)`
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 0.8, 0.5]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
}

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

export function ParticleField({ count = 30, className = "" }: ParticleFieldProps) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-accent/30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

interface GridPatternProps {
  className?: string;
  animated?: boolean;
}

export function GridPattern({ className = "", animated = true }: GridPatternProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px"
        }}
        animate={animated ? {
          backgroundPosition: ["0px 0px", "60px 60px"]
        } : undefined}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}