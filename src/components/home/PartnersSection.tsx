import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const partners = [
  { name: "TechVision", abbr: "TV" },
  { name: "RoboLabs", abbr: "RL" },
  { name: "GlobalTech", abbr: "GT" },
  { name: "CleanEnergy", abbr: "CE" },
  { name: "InnovateLabs", abbr: "IL" },
  { name: "FutureDev", abbr: "FD" },
  { name: "SmartSystems", abbr: "SS" },
  { name: "AICore", abbr: "AC" },
];

// Duplicate for seamless loop
const allPartners = [...partners, ...partners];

export const PartnersSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // CSS-based infinite scroll for better performance
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isPaused) return;

    let animationId: number;
    let scrollPosition = 0;
    const speed = 0.5; // pixels per frame

    const scroll = () => {
      scrollPosition += speed;
      const maxScroll = scrollContainer.scrollWidth / 2;
      
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
      }
      
      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  return (
    <section className="py-24 relative overflow-hidden bg-card/20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-primary font-semibold text-sm tracking-wider uppercase mb-2 block">
            Our Partners
          </span>
          <h2 className="font-display text-3xl lg:text-4xl font-black">
            Powering Innovation <span className="gradient-text-static">Together</span>
          </h2>
        </motion.div>

        {/* Infinite scroll marquee */}
        <div 
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div className="overflow-hidden">
            <div 
              ref={scrollRef}
              className="flex gap-8 items-center will-change-transform"
              style={{ width: "max-content" }}
            >
              {allPartners.map((partner, index) => (
                <div
                  key={`${partner.name}-${index}`}
                  className="flex-shrink-0 group"
                >
                  <div className="w-44 h-24 glass-card rounded-2xl flex items-center justify-center gap-3 transition-all duration-200 hover:border-primary/40 cursor-pointer">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                      <span className="text-primary font-bold text-sm">{partner.abbr}</span>
                    </div>
                    <span className="text-muted-foreground font-semibold group-hover:text-foreground transition-colors">
                      {partner.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Partner Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto"
        >
          {[
            { value: "50+", label: "Global Partners" },
            { value: "12", label: "Countries" },
            { value: "₹100Cr+", label: "Partner Revenue" },
            { value: "98%", label: "Satisfaction Rate" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="text-center p-4"
            >
              <p className="text-3xl lg:text-4xl font-black gradient-text-static mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
