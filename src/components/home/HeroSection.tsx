import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { MagneticButton } from "@/components/animations/MagneticButton";

// Floating tech element - simplified for performance
function FloatingTechElement({ delay, className, children }: { delay: number; className: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
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

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden bg-background">
      {/* Static mesh gradient for performance */}
      <div className="absolute inset-0 bg-mesh-gradient" />
      <div className="absolute inset-0 tech-grid opacity-20" />
      
      {/* Optimized gradient orbs - reduced count and blur */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-40"
        style={{ 
          background: "radial-gradient(circle, hsl(192 100% 50% / 0.12) 0%, transparent 60%)",
          willChange: "transform"
        }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-30"
        style={{ 
          background: "radial-gradient(circle, hsl(161 100% 50% / 0.1) 0%, transparent 60%)",
          willChange: "transform"
        }}
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div style={{ opacity }} className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[85vh]">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-8 relative overflow-hidden"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary tracking-wide">
                Building the New Future
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.02] mb-8 tracking-tight">
              <motion.span 
                className="block text-foreground"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              >
                Future Tech.
              </motion.span>
              <motion.span 
                className="block mt-2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.6, ease: "easeOut" }}
              >
                <span className="gradient-text">India's Future</span>
              </motion.span>
              <motion.span 
                className="block mt-2 text-foreground"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              >
                Depends on{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">ASIREX</span>
                  <motion.span
                    className="absolute -inset-2 bg-primary/15 blur-xl rounded-xl"
                    animate={{ opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </span>
              </motion.span>
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed"
            >
              Pioneering AI, robotics, and clean-tech solutions. We're building 
              the technology that will transform India and the world.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <MagneticButton>
                <Button asChild variant="hero" size="xl" className="group">
                  <Link to="/shop">
                    <span className="flex items-center">
                      Explore Products
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </span>
                  </Link>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button asChild variant="glass" size="xl" className="group">
                  <Link to="/projects">
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    View Projects
                  </Link>
                </Button>
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Optimized */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="relative aspect-square max-w-lg mx-auto lg:max-w-none hidden lg:block"
          >
            {/* Rotating rings */}
            <motion.div 
              className="absolute inset-0 rounded-full border border-primary/15"
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-8 rounded-full border border-accent/10"
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-16 rounded-full border border-secondary/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Core glow */}
            <motion.div 
              className="absolute inset-20 rounded-full"
              style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 60%)" }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            
            {/* Center orb */}
            <motion.div 
              className="absolute inset-24 rounded-full bg-card/80 border border-border/50 backdrop-blur-xl flex items-center justify-center overflow-hidden"
              animate={{ boxShadow: ["0 0 30px hsl(var(--primary) / 0.15)", "0 0 60px hsl(var(--primary) / 0.25)", "0 0 30px hsl(var(--primary) / 0.15)"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <motion.svg
                viewBox="0 0 200 200"
                className="w-1/2 h-1/2"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <defs>
                  <linearGradient id="orb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
                <path
                  d="M100 20 L110 85 L175 100 L110 115 L100 180 L90 115 L25 100 L90 85 Z"
                  fill="none"
                  stroke="url(#orb-grad)"
                  strokeWidth="1.5"
                />
                <circle cx="100" cy="100" r="5" fill="hsl(var(--primary))" />
              </motion.svg>
            </motion.div>

            {/* Floating icons */}
            <FloatingTechElement delay={0.5} className="absolute top-4 right-4">
              <div className="w-14 h-14 rounded-2xl bg-card/80 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🤖</span>
              </div>
            </FloatingTechElement>
            <FloatingTechElement delay={0.6} className="absolute bottom-16 left-4">
              <div className="w-12 h-12 rounded-xl bg-card/80 border border-accent/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl">⚡</span>
              </div>
            </FloatingTechElement>
            <FloatingTechElement delay={0.7} className="absolute top-1/3 left-0">
              <div className="w-10 h-10 rounded-lg bg-card/80 border border-secondary/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-lg">🌱</span>
              </div>
            </FloatingTechElement>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-[0.15em] font-medium">Scroll</span>
            <div className="w-5 h-8 rounded-full border border-muted-foreground/30 flex items-start justify-center p-1.5">
              <motion.div
                animate={{ y: [0, 8, 0], opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-primary"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
