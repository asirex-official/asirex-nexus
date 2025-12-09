import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Eye, Globe, Rocket, Star, Sparkles, ArrowRight, CheckCircle, Target, Zap, Crown, TrendingUp } from "lucide-react";
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

const visionElements = [
  {
    icon: Globe,
    title: "Global Tech Leader",
    description: "India becoming the world's premier hub for AI, robotics, and clean technology",
    timeline: "By 2035"
  },
  {
    icon: Zap,
    title: "Everyday AI",
    description: "Advanced AI tools accessible in every home, school, and workplace across India",
    timeline: "By 2030"
  },
  {
    icon: Star,
    title: "Clean Future",
    description: "Technology-driven solutions solving India's environmental challenges",
    timeline: "Ongoing"
  },
  {
    icon: Crown,
    title: "Innovation Hub",
    description: "ASIREX becoming synonymous with Indian technological excellence",
    timeline: "Our Legacy"
  }
];

const futureImpact = [
  { number: "1B+", label: "Lives Transformed", desc: "Through accessible technology" },
  { number: "100K+", label: "Jobs Created", desc: "In the tech ecosystem" },
  { number: "50+", label: "Patents Filed", desc: "For Indian innovations" },
  { number: "10+", label: "Countries Served", desc: "Exporting Indian tech" }
];

const roadmap = [
  { year: "2024-25", milestone: "Foundation & Products", desc: "Building core products and gathering funds" },
  { year: "2026-27", milestone: "Scale & Impact", desc: "Launching major projects like Aqua River Purifier" },
  { year: "2028-30", milestone: "National Reach", desc: "Presence in every major city and government partnership" },
  { year: "2030+", milestone: "Global Expansion", desc: "Taking Indian innovation to the world" }
];

export default function Vision() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent" />
        <motion.div 
          className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <Eye className="w-4 h-4" />
                Our Vision
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="font-display text-4xl lg:text-6xl font-bold mb-8 leading-tight"
            >
              India Leading the <span className="gradient-text">World</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              We envision a world where cutting-edge AI, robotics, and sustainable technology 
              are not luxuries but everyday tools. Where Indian innovation leads global progress.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="glass-card p-8 max-w-2xl mx-auto border-2 border-primary/30"
            >
              <Eye className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-2xl font-display font-semibold italic">
                "Dream big. Build bigger. Impact biggest."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Vision Elements */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              The Future We're <span className="gradient-text">Building</span>
            </h2>
            <p className="text-muted-foreground text-lg">Our vision for India and the world</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
          >
            {visionElements.map((element, i) => (
              <motion.div
                key={element.title}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card p-8 group relative overflow-hidden"
              >
                <motion.div
                  className="absolute top-0 right-0 px-4 py-2 bg-primary/20 text-primary text-sm font-medium rounded-bl-xl"
                >
                  {element.timeline}
                </motion.div>
                <motion.div
                  className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <element.icon className="w-7 h-7 text-primary" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold mb-3">{element.title}</h3>
                <p className="text-muted-foreground">{element.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Future Impact */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              The Impact We'll <span className="gradient-text">Create</span>
            </h2>
            <p className="text-muted-foreground text-lg">Our goals for the next decade</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {futureImpact.map((impact, i) => (
              <motion.div
                key={impact.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 text-center"
              >
                <motion.div
                  className="text-4xl lg:text-5xl font-bold gradient-text mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  {impact.number}
                </motion.div>
                <h3 className="font-semibold mb-1">{impact.label}</h3>
                <p className="text-muted-foreground text-sm">{impact.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Roadmap</span>
            </h2>
            <p className="text-muted-foreground text-lg">The journey to our vision</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {roadmap.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-6 mb-8 ${i % 2 === 0 ? '' : 'flex-row-reverse text-right'}`}
              >
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{item.year}</span>
                  </div>
                </div>
                <div className="glass-card p-6 flex-1">
                  <h3 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    {item.milestone}
                  </h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
            </motion.div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              Be Part of This <span className="gradient-text">Vision</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              The future we dream of won't build itself. Join us in making it a reality.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link to="/about#careers">
                  Join the Team <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/projects">Our Projects</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}