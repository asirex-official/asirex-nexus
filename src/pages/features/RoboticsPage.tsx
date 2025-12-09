import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Bot, Cog, GraduationCap, Factory, Wrench, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const applications = [
  {
    icon: GraduationCap,
    title: "Educational Robotics",
    description: "STEM learning kits and programmable robots designed to inspire the next generation of engineers and innovators."
  },
  {
    icon: Factory,
    title: "Industrial Automation",
    description: "High-precision robotic systems for manufacturing, assembly, and quality control in industrial environments."
  },
  {
    icon: Wrench,
    title: "Research Platforms",
    description: "Advanced robotic platforms for academic research, prototyping, and experimental development."
  },
  {
    icon: Shield,
    title: "Environmental Robots",
    description: "Autonomous systems designed for environmental monitoring, cleanup, and conservation efforts."
  }
];

const features = [
  "Modular and customizable designs",
  "AI-powered navigation and decision making",
  "Real-time sensor integration",
  "Cloud connectivity for remote monitoring",
  "Open-source software compatibility",
  "Made in India with global standards"
];

export default function RoboticsPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-background to-background" />
        <div className="absolute inset-0 dot-grid opacity-20" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-accent to-primary p-1"
            >
              <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                <Bot className="w-12 h-12 text-accent" />
              </div>
            </motion.div>
            
            <h1 className="font-display text-5xl lg:text-7xl font-black mb-6">
              Advanced <span className="gradient-text">Robotics</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Professional-grade robotics platforms that push the boundaries of automation, 
              designed for education, research, industry, and environmental protection.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button asChild variant="hero" size="lg">
                <Link to="/projects">
                  See Our Robots in Action
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/support-us">Join the Revolution</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Applications Section */}
      <section className="py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl lg:text-5xl font-black mb-4">
              Robotics <span className="gradient-text">Applications</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our robotic systems serve diverse sectors, from classrooms to factories, 
              from research labs to environmental frontlines.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {applications.map((app, index) => (
              <motion.div
                key={app.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 rounded-3xl group hover:border-accent/50 transition-colors"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary p-0.5 flex-shrink-0">
                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                      <app.icon className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                      {app.title}
                    </h3>
                    <p className="text-muted-foreground">{app.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-28 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl lg:text-5xl font-black mb-6">
                Built for <span className="gradient-text">Excellence</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Every ASIREX robot is engineered with precision, reliability, and innovation at its core. 
                Our platforms combine cutting-edge AI with robust mechanical design to deliver 
                exceptional performance in any environment.
              </p>
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-foreground">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-3xl" />
                <div className="relative w-64 h-64 rounded-3xl bg-gradient-to-br from-accent to-primary p-1">
                  <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                    <Cog className="w-32 h-32 text-accent animate-spin-slow" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Flagship Project */}
      <section className="py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-3xl text-center"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-black mb-4">
              Flagship Project: <span className="gradient-text">Aqua River Purifier</span>
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-8 text-lg">
              Our most ambitious robotics project combines AI, autonomous navigation, and environmental 
              science to create an army of river-cleaning robots. These autonomous vessels patrol 
              India's rivers, removing pollution and restoring our water bodies to their natural glory.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/projects/aqua-river-purifier">
                  Explore Aqua River Purifier
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-black mb-4">
              The Future of Robotics is Here
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Partner with ASIREX to bring world-class robotics solutions to your organization.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/about">Learn More About Us</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/support-us">Support Our Mission</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}