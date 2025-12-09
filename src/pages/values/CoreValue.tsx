import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Target, Eye, Heart, Users, ArrowRight, CheckCircle, Star, Lightbulb, Shield, Zap, Rocket, Award } from "lucide-react";
import { Link, useParams } from "react-router-dom";

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

const valuesData: Record<string, {
  icon: typeof Target;
  title: string;
  tagline: string;
  description: string;
  principles: { title: string; desc: string }[];
  examples: string[];
  quote: string;
  color: string;
}> = {
  "innovation-first": {
    icon: Target,
    title: "Innovation First",
    tagline: "Pushing boundaries with cutting-edge solutions",
    description: "At ASIREX, innovation isn't just a buzzword — it's our DNA. We believe that every problem has a solution that hasn't been invented yet. We push boundaries with cutting-edge AI, robotics, and clean-tech solutions that redefine what's possible.",
    principles: [
      { title: "Challenge the Status Quo", desc: "We never accept 'that's how it's always been done' as an answer" },
      { title: "Embrace Failure", desc: "Every failed experiment is a step closer to breakthrough" },
      { title: "Think 10x", desc: "We don't aim for 10% improvement — we aim for 10x transformation" },
      { title: "Stay Curious", desc: "Continuous learning is the fuel of innovation" }
    ],
    examples: [
      "Developing AI-powered water purification systems",
      "Creating affordable robotics kits for education",
      "Building IoT solutions for smart cities"
    ],
    quote: "The best way to predict the future is to invent it.",
    color: "primary"
  },
  "vision-for-india": {
    icon: Eye,
    title: "Vision for India",
    tagline: "Building technology that transforms 1.4 billion lives",
    description: "We're not just building a company — we're building India's technological future. Every decision we make is guided by one question: How will this impact India? We're committed to positioning India as the global tech superpower it deserves to be.",
    principles: [
      { title: "India-First Design", desc: "Solutions designed for Indian challenges, by Indian minds" },
      { title: "Affordable Access", desc: "Technology should reach every corner of India" },
      { title: "Local Language", desc: "Breaking language barriers with vernacular interfaces" },
      { title: "Rural Innovation", desc: "Technology that works in villages, not just cities" }
    ],
    examples: [
      "Products priced for middle-class affordability",
      "Multi-language support in all applications",
      "Solar-powered solutions for areas with unreliable electricity"
    ],
    quote: "A country's progress is measured by its technology, and we're here to lead that progress.",
    color: "accent"
  },
  "customer-obsession": {
    icon: Heart,
    title: "Customer Obsession",
    tagline: "Every product is crafted with passion for the people who matter most",
    description: "Our customers aren't just users — they're the reason we exist. Every product is crafted with passion, designed with precision, and built for the people who matter most. We don't just meet expectations; we exceed them.",
    principles: [
      { title: "Listen First", desc: "Customer feedback drives our roadmap" },
      { title: "Quality Over Speed", desc: "We'd rather delay than ship something subpar" },
      { title: "Surprise & Delight", desc: "Going beyond what's expected, always" },
      { title: "Lifetime Relationship", desc: "We build for the long term, not quick sales" }
    ],
    examples: [
      "24/7 customer support for all products",
      "Free replacements for any manufacturing defects",
      "Regular product updates based on user feedback"
    ],
    quote: "When you put customers first, everything else falls into place.",
    color: "red"
  },
  "collaborative-spirit": {
    icon: Users,
    title: "Collaborative Spirit",
    tagline: "Together we rise — the power of community drives us forward",
    description: "No one builds the future alone. At ASIREX, we believe in the power of collaboration — with our team, our partners, our community, and even our competitors. Open innovation, shared dreams, and the collective genius of many minds drive us forward.",
    principles: [
      { title: "Open Source Mindset", desc: "Share knowledge, grow together" },
      { title: "Partner-First", desc: "We win when our partners win" },
      { title: "Diverse Perspectives", desc: "The best ideas come from diverse teams" },
      { title: "Community Building", desc: "Nurturing the ecosystem around us" }
    ],
    examples: [
      "Open-source contributions to key projects",
      "Partnership programs with startups and institutions",
      "Community events and knowledge sharing sessions"
    ],
    quote: "If you want to go fast, go alone. If you want to go far, go together.",
    color: "blue"
  }
};

export default function CoreValue() {
  const { valueId } = useParams<{ valueId: string }>();
  const value = valuesData[valueId || "innovation-first"];

  if (!value) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Value Not Found</h1>
            <Button asChild>
              <Link to="/about">Back to About</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const ValueIcon = value.icon;

  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent" />
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
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
                <Star className="w-4 h-4" />
                Core Value
              </span>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-8"
            >
              <ValueIcon className="w-10 h-10 text-primary" />
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="font-display text-4xl lg:text-6xl font-bold mb-6 leading-tight"
            >
              <span className="gradient-text">{value.title}</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              {value.tagline}
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="glass-card p-8 max-w-3xl mx-auto"
            >
              <p className="text-lg leading-relaxed">{value.description}</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Principles</span>
            </h2>
            <p className="text-muted-foreground text-lg">How we live this value every day</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {value.principles.map((principle, i) => (
              <motion.div
                key={principle.title}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card p-6 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{principle.title}</h3>
                  <p className="text-muted-foreground">{principle.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Examples */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              In <span className="gradient-text">Action</span>
            </h2>
            <p className="text-muted-foreground text-lg">Real examples of this value</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {value.examples.map((example, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 glass-card p-4"
              >
                <Zap className="w-6 h-6 text-primary flex-shrink-0" />
                <p className="text-lg">{example}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Award className="w-12 h-12 text-primary mx-auto mb-6" />
            <p className="text-2xl lg:text-3xl font-display font-semibold italic mb-6">
              "{value.quote}"
            </p>
          </motion.div>
        </div>
      </section>

      {/* Other Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Explore Other <span className="gradient-text">Values</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {Object.entries(valuesData)
              .filter(([key]) => key !== valueId)
              .map(([key, val], i) => {
                const Icon = val.icon;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to={`/values/${key}`}>
                      <motion.div
                        whileHover={{ y: -5, scale: 1.02 }}
                        className="glass-card p-4 text-center group cursor-pointer"
                      >
                        <Icon className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-sm">{val.title}</h3>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
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
            <Rocket className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              Live These <span className="gradient-text">Values</span> With Us
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join a team that doesn't just talk about values — we live them every day.
            </p>
            <Button size="lg" asChild>
              <Link to="/about#careers">
                Join the Team <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}