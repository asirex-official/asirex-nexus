import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform, MotionValue } from "framer-motion";
import { useSiteStats } from "@/hooks/useSiteData";

function AnimatedNumber({ value, duration = 2 }: { value: MotionValue<number>; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const unsubscribe = value.on("change", (v) => setDisplayValue(Math.round(v)));
    return unsubscribe;
  }, [value]);

  return <span className="tabular-nums">{displayValue.toLocaleString()}</span>;
}

function StatCard({ stat, index }: { stat: { value: number; suffix: string; label: string }; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const springValue = useSpring(0, { duration: 2000, bounce: 0.1 });

  useEffect(() => {
    if (isInView) {
      springValue.set(stat.value);
    }
  }, [isInView, stat.value, springValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      className="relative group"
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute -inset-px rounded-2xl bg-gradient-to-r from-primary/50 via-accent/50 to-secondary/50 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
      />
      
      <div className="relative text-center p-8 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-xl">
        {/* Number */}
        <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-black mb-3">
          <span className="gradient-text">
            <AnimatedNumber value={springValue} />
            {stat.suffix}
          </span>
        </div>
        
        {/* Label */}
        <div className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          {stat.label}
        </div>
        
        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />
      </div>
    </motion.div>
  );
}

export function StatsSection() {
  const { data: stats, isLoading } = useSiteStats();

  const displayStats = stats || [
    { id: "1", value: 10000, suffix: "+", label: "Devices Shipped" },
    { id: "2", value: 25, suffix: "+", label: "Active Projects" },
    { id: "3", value: 15, suffix: "", label: "Countries Impacted" },
    { id: "4", value: 99, suffix: "%", label: "Customer Satisfaction" },
  ];

  return (
    <section className="relative py-28 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
      
      {/* Animated line at top */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      
      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
            Our <span className="gradient-text-static">Impact</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Numbers that define our journey towards building the future
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {displayStats.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} index={index} />
          ))}
        </div>
      </div>
      
      {/* Animated line at bottom */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
    </section>
  );
}
