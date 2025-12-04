import { motion } from "framer-motion";

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

export const PartnersSection = () => {
  return (
    <section className="py-20 bg-muted/20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-accent font-semibold text-sm tracking-wider uppercase mb-2 block">
            Our Partners
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Powering Innovation Together
          </h2>
        </motion.div>

        {/* Infinite scroll animation */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
          
          <div className="flex overflow-hidden">
            <motion.div
              animate={{ x: [0, -1920] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 30,
                  ease: "linear",
                },
              }}
              className="flex gap-12 items-center"
            >
              {[...partners, ...partners, ...partners].map((partner, index) => (
                <div
                  key={`${partner.name}-${index}`}
                  className="flex-shrink-0 group"
                >
                  <div className="w-40 h-20 bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:border-primary/50 hover:bg-card/80">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">{partner.abbr}</span>
                    </div>
                    <span className="text-foreground/70 font-medium group-hover:text-foreground transition-colors">
                      {partner.name}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Stats below partners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
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
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
