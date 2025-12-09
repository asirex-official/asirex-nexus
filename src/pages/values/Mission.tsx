import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Target, Heart, Users, Globe, Lightbulb, ArrowRight, CheckCircle, Rocket, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const missionPillars = [
  {
    icon: Heart,
    title: "Accessible Technology",
    description: "Making cutting-edge tech affordable for everyone, from students to startups",
    examples: ["Affordable AI tools", "Open-source initiatives", "Educational programs"]
  },
  {
    icon: Globe,
    title: "India-First Innovation",
    description: "Building solutions designed for Indian challenges, by Indian minds",
    examples: ["Local language support", "Climate-adapted designs", "Rural-friendly interfaces"]
  },
  {
    icon: Users,
    title: "Empowering Communities",
    description: "Creating technology that uplifts and transforms communities across the nation",
    examples: ["Skill development", "Job creation", "Community tech hubs"]
  },
  {
    icon: Lightbulb,
    title: "Sustainable Progress",
    description: "Building for the long term with environmental and social responsibility",
    examples: ["Clean energy focus", "Eco-friendly materials", "Circular economy approach"]
  }
];

const missionStatements = [
  "To democratize access to advanced technology across India and Southeast Asia",
  "To create affordable, powerful tools that empower developers and businesses",
  "To build a future where Indian innovation leads global progress",
  "Technology should be a right, not a privilege"
];

const howWeDeliver = [
  { title: "Research & Development", desc: "Continuous innovation in AI, robotics, and clean-tech" },
  { title: "Affordable Products", desc: "Quality tech at middle-class friendly prices" },
  { title: "Excellence First", desc: "Uncompromising quality in everything we build" },
  { title: "Customer Focus", desc: "Solutions designed around real user needs" }
];

export default function Mission() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-primary/5 to-transparent" />
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-medium text-accent">
                <Target className="w-4 h-4" />
                Our Mission
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="font-display text-4xl lg:text-6xl font-bold mb-8 leading-tight"
            >
              Technology for <span className="gradient-text">Everyone</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              We believe that the power of AI, robotics, and advanced technology shouldn't be 
              limited to the privileged few. It should be accessible to everyone who dreams of building a better future.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="glass-card p-8 max-w-2xl mx-auto border-2 border-accent/30"
            >
              <Target className="w-12 h-12 text-accent mx-auto mb-4" />
              <p className="text-2xl font-display font-semibold italic">
                "Technology should be a right, not a privilege."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission Statements */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                What We <span className="gradient-text">Stand For</span>
              </h2>
            </div>

            <div className="space-y-4">
              {missionStatements.map((statement, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 glass-card p-6"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-lg">{statement}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Pillars */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Our Mission <span className="gradient-text">Pillars</span>
            </h2>
            <p className="text-muted-foreground text-lg">The foundations of everything we do</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {missionPillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card p-8 group"
              >
                <motion.div
                  className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <pillar.icon className="w-7 h-7 text-accent" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold mb-3">{pillar.title}</h3>
                <p className="text-muted-foreground mb-4">{pillar.description}</p>
                <ul className="space-y-2">
                  {pillar.examples.map((example, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 text-accent" />
                      {example}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How We Deliver */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              How We <span className="gradient-text">Deliver</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {howWeDeliver.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 text-center"
              >
                <Zap className="w-8 h-8 text-accent mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Rocket className="w-16 h-16 text-accent mx-auto mb-6" />
            </motion.div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              Join Us on This <span className="gradient-text">Mission</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Whether as a customer, partner, or team member — be part of the change.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/about#careers">
                  Join the Team <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/support-us">Support Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}