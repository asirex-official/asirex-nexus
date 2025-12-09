import { motion } from "framer-motion";
import { Brain, Bot, Leaf, Globe, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI & Machine Learning",
    description: "Cutting-edge AI solutions from neural processors to intelligent software frameworks.",
  },
  {
    icon: Bot,
    title: "Advanced Robotics",
    description: "Professional-grade robotics platforms for education, research, and industry.",
  },
  {
    icon: Leaf,
    title: "Clean Technology",
    description: "Sustainable energy solutions and eco-friendly tech for a greener future.",
  },
  {
    icon: Globe,
    title: "Global Delivery",
    description: "Worldwide shipping with local support centers across India.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-28 relative overflow-hidden bg-card/30">
      <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
      <div className="absolute inset-0 dot-grid opacity-20" />
      
      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl lg:text-5xl font-black mb-4">
            Why Choose <span className="gradient-text">ASIREX</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We're not just a tech company. We're building the future with 
            innovation, sustainability, and excellence at our core.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group"
            >
              <div className="glass-card p-8 h-full rounded-3xl relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                
                <motion.div 
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent p-0.5 mb-6 relative"
                  whileHover={{ rotate: 5, scale: 1.05 }}
                >
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                </motion.div>

                <h3 className="font-display text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
