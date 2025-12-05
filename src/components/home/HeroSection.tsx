import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRef } from "react";
import heroBg from "@/assets/hero-bg.jpg";
import { ParticleField, GridPattern } from "@/components/animations/FloatingElements";
import { MagneticButton } from "@/components/animations/MagneticButton";
import { SplitText, GradientTextAnimated } from "@/components/animations/TextAnimations";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Parallax Background */}
      <motion.div style={{ y }} className="absolute inset-0">
        <img
          src={heroBg}
          alt="AI neural network background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </motion.div>
      
      {/* Animated Effects */}
      <ParticleField count={40} />
      <GridPattern animated />
      
      {/* Animated gradient orbs with more movement */}
      <motion.div 
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[100px]"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]"
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />

      <motion.div style={{ opacity, scale }} className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[80vh]">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-center lg:text-left"
          >
            {/* Badge with glow effect */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/10 border border-accent/30 mb-8 relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-accent/20 to-primary/20"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <Sparkles className="w-4 h-4 text-accent relative z-10" />
              <span className="text-sm font-semibold text-accent relative z-10">
                Pioneering the Future
              </span>
            </motion.div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] mb-8">
              <motion.span 
                className="block"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Future Tech.
              </motion.span>
              <motion.span 
                className="block mt-3"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <GradientTextAnimated>
                  India's Future
                </GradientTextAnimated>
              </motion.span>
              <motion.span 
                className="block mt-3"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Depends on{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">ASIREX</span>
                  <motion.span
                    className="absolute -inset-2 bg-accent/20 blur-xl rounded-lg"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 200 12"
                    fill="none"
                  >
                    <motion.path
                      d="M2 10C50 2 150 2 198 10"
                      stroke="url(#underline-gradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ delay: 1.5, duration: 0.8 }}
                    />
                    <defs>
                      <linearGradient id="underline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--accent))" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed"
            >
              <SplitText delay={1.2}>
                Pioneering AI, robotics, and clean-tech solutions. We're building the technology that will transform India and the world.
              </SplitText>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <MagneticButton>
                <Button asChild variant="hero" size="xl" className="group relative overflow-hidden">
                  <Link to="/shop">
                    <motion.span
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%", skewX: "-15deg" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="relative z-10 flex items-center">
                      Explore Products
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button asChild variant="glass" size="xl" className="group">
                  <Link to="/projects">
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    View Projects
                  </Link>
                </Button>
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Enhanced 3D Effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative aspect-square max-w-lg mx-auto lg:max-w-none hidden lg:block perspective-1000"
          >
            {/* Glowing rings with rotation */}
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-accent/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-6 rounded-full border border-primary/30"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute inset-12 rounded-full border border-secondary/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Center orb with pulsing glow */}
            <div className="absolute inset-16 rounded-full bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 blur-2xl animate-pulse" />
            <motion.div 
              className="absolute inset-20 rounded-full bg-card border border-border/50 backdrop-blur-xl flex items-center justify-center overflow-hidden"
              animate={{ boxShadow: ["0 0 40px hsl(var(--primary) / 0.3)", "0 0 80px hsl(var(--accent) / 0.5)", "0 0 40px hsl(var(--primary) / 0.3)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {/* Inner rotating element */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-3/4 h-3/4"
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    <linearGradient id="hero-gradient-main" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--accent))" />
                      <stop offset="50%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--secondary))" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M100 10 L120 80 L190 100 L120 120 L100 190 L80 120 L10 100 L80 80 Z"
                    fill="none"
                    stroke="url(#hero-gradient-main)"
                    strokeWidth="2"
                  />
                  <motion.circle 
                    cx="100" 
                    cy="100" 
                    r="8" 
                    fill="hsl(var(--accent))"
                    animate={{ r: [8, 12, 8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </svg>
              </motion.div>
            </motion.div>

            {/* Floating elements with 3D feel */}
            <motion.div
              animate={{ 
                y: [-15, 15, -15],
                rotateZ: [0, 5, 0],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-xl border border-accent/30 flex items-center justify-center shadow-lg"
            >
              <span className="text-3xl">🤖</span>
            </motion.div>
            <motion.div
              animate={{ 
                y: [15, -15, 15],
                rotateZ: [0, -5, 0],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-16 left-4 w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-xl border border-primary/30 flex items-center justify-center shadow-lg"
            >
              <span className="text-2xl">⚡</span>
            </motion.div>
            <motion.div
              animate={{ 
                y: [-10, 20, -10],
                x: [0, 10, 0],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 left-0 w-14 h-14 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/5 backdrop-blur-xl border border-secondary/30 flex items-center justify-center shadow-lg"
            >
              <span className="text-xl">🌱</span>
            </motion.div>
            <motion.div
              animate={{ 
                y: [10, -20, 10],
                x: [0, -10, 0],
              }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-1/3 right-0 w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-primary/5 backdrop-blur-xl border border-accent/30 flex items-center justify-center shadow-lg"
            >
              <span className="text-lg">🚀</span>
            </motion.div>
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
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}