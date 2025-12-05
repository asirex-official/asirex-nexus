import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Play, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { MagneticButton } from "@/components/animations/MagneticButton";

// Animated text that reveals character by character
function AnimatedText({ children, delay = 0 }: { children: string; delay?: number }) {
  return (
    <span className="inline-block">
      {children.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.03,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}

// Floating tech elements with 3D effect
function FloatingTechElement({ delay, className, children }: { delay: number; className: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      <motion.div
        animate={{
          y: [-10, 10, -10],
          rotateZ: [-2, 2, -2],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [1, 0.95]);

  // Mouse parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-5, 5]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 bg-mesh-gradient" />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 tech-grid opacity-30" />
      
      {/* Premium Gradient Orbs */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)" }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 80, 0],
          y: [0, -60, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.12) 0%, transparent 70%)" }}
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -60, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full blur-[80px]"
        style={{ background: "radial-gradient(circle, hsl(var(--secondary) / 0.1) 0%, transparent 70%)" }}
        animate={{
          scale: [1, 1.4, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div style={{ opacity, scale }} className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[85vh]">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            {/* Premium Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-8 relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"
                animate={{ x: ["-200%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <Sparkles className="w-4 h-4 text-primary relative z-10" />
              <span className="text-sm font-semibold text-primary relative z-10 tracking-wide">
                Pioneering the Future
              </span>
            </motion.div>

            {/* Main Heading with Character Animation */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.02] mb-8 tracking-tight">
              <motion.span 
                className="block text-foreground"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              >
                Future Tech.
              </motion.span>
              <motion.span 
                className="block mt-2"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <span className="gradient-text">India's Future</span>
              </motion.span>
              <motion.span 
                className="block mt-2 text-foreground"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              >
                Depends on{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-foreground">ASIREX</span>
                  <motion.span
                    className="absolute -inset-3 bg-primary/20 blur-2xl rounded-2xl"
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.svg
                    className="absolute -bottom-3 left-0 w-full h-4"
                    viewBox="0 0 200 16"
                    fill="none"
                  >
                    <motion.path
                      d="M2 12C50 4 150 4 198 12"
                      stroke="url(#asirex-underline)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="asirex-underline" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="50%" stopColor="hsl(var(--accent))" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
              </motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed"
            >
              Pioneering AI, robotics, and clean-tech solutions. We're building 
              the technology that will transform India and the world.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <MagneticButton>
                <Button asChild variant="hero" size="xl" className="group">
                  <Link to="/shop">
                    <motion.span
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%", skewX: "-15deg" }}
                      whileHover={{ x: "200%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10 flex items-center">
                      Explore Products
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
                    </span>
                  </Link>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button asChild variant="glass" size="xl" className="group">
                  <Link to="/projects">
                    <Play className="w-5 h-5 mr-2 group-hover:scale-125 transition-transform duration-300" />
                    View Projects
                  </Link>
                </Button>
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Premium 3D Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ rotateX, rotateY }}
            className="relative aspect-square max-w-lg mx-auto lg:max-w-none hidden lg:block perspective-2000 preserve-3d"
          >
            {/* Outer Rotating Rings */}
            <motion.div 
              className="absolute inset-0 rounded-full border border-primary/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-6 rounded-full border border-accent/15"
              animate={{ rotate: -360 }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-12 rounded-full border border-secondary/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Pulsing Glow Core */}
            <motion.div 
              className="absolute inset-16 rounded-full"
              style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, hsl(var(--accent) / 0.1) 50%, transparent 70%)" }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            {/* Center Orb */}
            <motion.div 
              className="absolute inset-20 rounded-full bg-card/80 border border-border/50 backdrop-blur-2xl flex items-center justify-center overflow-hidden shadow-premium"
              animate={{ boxShadow: ["0 0 40px hsl(var(--primary) / 0.2)", "0 0 80px hsl(var(--primary) / 0.4)", "0 0 40px hsl(var(--primary) / 0.2)"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {/* Inner Rotating SVG */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="w-2/3 h-2/3"
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    <linearGradient id="orb-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="50%" stopColor="hsl(var(--accent))" />
                      <stop offset="100%" stopColor="hsl(var(--secondary))" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M100 20 L115 85 L180 100 L115 115 L100 180 L85 115 L20 100 L85 85 Z"
                    fill="none"
                    stroke="url(#orb-gradient)"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 1 }}
                  />
                  <motion.circle 
                    cx="100" 
                    cy="100" 
                    r="6" 
                    fill="hsl(var(--primary))"
                    animate={{ r: [6, 10, 6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </svg>
              </motion.div>
            </motion.div>

            {/* Floating Tech Icons */}
            <FloatingTechElement delay={0.6} className="absolute top-2 right-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-xl border border-primary/20 flex items-center justify-center shadow-glow-sm">
                <span className="text-2xl">🤖</span>
              </div>
            </FloatingTechElement>
            <FloatingTechElement delay={0.8} className="absolute bottom-12 left-2">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-xl border border-accent/20 flex items-center justify-center shadow-glow-accent">
                <span className="text-xl">⚡</span>
              </div>
            </FloatingTechElement>
            <FloatingTechElement delay={1.0} className="absolute top-1/3 left-0">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-xl border border-secondary/20 flex items-center justify-center">
                <span className="text-lg">🌱</span>
              </div>
            </FloatingTechElement>
            <FloatingTechElement delay={1.2} className="absolute bottom-1/3 right-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/5 backdrop-blur-xl border border-primary/20 flex items-center justify-center">
                <span className="text-sm">🚀</span>
              </div>
            </FloatingTechElement>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-[0.2em] font-medium">Scroll</span>
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
