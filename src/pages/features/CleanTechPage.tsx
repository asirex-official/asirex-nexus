import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Leaf, Sun, Wind, Droplets, Recycle, TreePine, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const solutions = [
  {
    icon: Sun,
    title: "Solar Energy Systems",
    description: "AI-optimized solar tracking and management systems that maximize energy capture and efficiency."
  },
  {
    icon: Droplets,
    title: "Water Purification",
    description: "Autonomous water treatment robots that clean rivers, lakes, and industrial wastewater."
  },
  {
    icon: Wind,
    title: "Smart Grid Integration",
    description: "Intelligent power management systems for renewable energy distribution and storage."
  },
  {
    icon: Recycle,
    title: "Waste Management",
    description: "AI-powered waste sorting and recycling systems for efficient resource recovery."
  }
];

export default function CleanTechPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-background to-background" />
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
              className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-green-500 to-accent p-1"
            >
              <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                <Leaf className="w-12 h-12 text-green-500" />
              </div>
            </motion.div>
            
            <h1 className="font-display text-5xl lg:text-7xl font-black mb-6">
              Clean <span className="gradient-text">Technology</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Sustainable energy solutions and eco-friendly technologies for a greener, 
              cleaner future. We're committed to protecting our planet while driving innovation.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button asChild variant="hero" size="lg">
                <Link to="/projects">
                  View Green Projects
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/support-us">Support Clean Tech</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <TreePine className="w-16 h-16 mx-auto mb-8 text-green-500" />
            <h2 className="font-display text-3xl lg:text-4xl font-black mb-6">
              Our Commitment to the <span className="gradient-text">Environment</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              India faces unprecedented environmental challenges—polluted rivers, air quality 
              crises, and mounting waste. At ASIREX, we don't just talk about solutions; 
              we build them. Our clean technology division combines AI, robotics, and 
              renewable energy to create tangible impact for our planet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl lg:text-5xl font-black mb-4">
              Our <span className="gradient-text">Solutions</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Technology-driven approaches to environmental challenges.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 rounded-3xl group hover:border-green-500/50 transition-colors"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-accent p-0.5 flex-shrink-0">
                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                      <solution.icon className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                      {solution.title}
                    </h3>
                    <p className="text-muted-foreground">{solution.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-28 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="font-display text-4xl lg:text-5xl font-black mb-6">
              Making a <span className="gradient-text">Real Impact</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our flagship Aqua River Purifier project aims to restore India's major rivers 
              to their pristine state. With a fleet of autonomous cleaning robots, we can 
              remove plastic waste, oil spills, and pollutants while monitoring water quality 
              in real-time.
            </p>
            <Button asChild variant="hero" size="lg">
              <Link to="/projects/aqua-river-purifier">
                Learn About Aqua River Purifier
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-3xl text-center"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-black mb-4">
              Join the Green Revolution
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Together, we can build a sustainable future for India and the world.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/support-us">Support Our Mission</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">Learn More About Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}