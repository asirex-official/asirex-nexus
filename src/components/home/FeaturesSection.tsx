import { motion } from "framer-motion";
import { Brain, Bot, Leaf, Globe } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI & Machine Learning",
    description: "Cutting-edge AI solutions from neural processors to intelligent software frameworks.",
    gradient: "from-accent to-primary",
  },
  {
    icon: Bot,
    title: "Advanced Robotics",
    description: "Professional-grade robotics platforms for education, research, and industry.",
    gradient: "from-primary to-secondary",
  },
  {
    icon: Leaf,
    title: "Clean Technology",
    description: "Sustainable energy solutions and eco-friendly tech for a greener future.",
    gradient: "from-secondary to-accent",
  },
  {
    icon: Globe,
    title: "Global Delivery",
    description: "Worldwide shipping with local support centers in India and Laos.",
    gradient: "from-accent via-primary to-secondary",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative bg-card/30">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(163,255,77,0.03)_0%,transparent_70%)]" />
      
      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
            Why Choose <span className="gradient-text">ASIREX</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're not just a tech company. We're building the future with 
            innovation, sustainability, and excellence at our core.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group"
            >
              <div className="glass-card p-8 h-full card-hover relative overflow-hidden">
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-6`}>
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-accent transition-colors">
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
