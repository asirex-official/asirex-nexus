import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Building, Flag, Award, FileCheck, Shield, Globe, Landmark, ArrowRight, CheckCircle, FileText, Handshake, Target, Scale, Users } from "lucide-react";
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

const projects = [
  {
    icon: Globe,
    title: "Aqua River Purifier",
    description: "AI-powered autonomous water purification system for India's rivers",
    status: "In Development",
    impact: "Clean water for millions"
  },
  {
    icon: Shield,
    title: "Smart City Solutions",
    description: "IoT infrastructure for urban management and safety",
    status: "Planning Phase",
    impact: "Safer, smarter cities"
  },
  {
    icon: Users,
    title: "Public Service AI",
    description: "AI assistants for government service delivery",
    status: "Concept Phase",
    impact: "Faster citizen services"
  }
];

const governmentBenefits = [
  { icon: Flag, title: "Made in India", desc: "100% indigenous technology supporting Atmanirbhar Bharat" },
  { icon: Scale, title: "Transparent Pricing", desc: "Government-friendly pricing with no hidden costs" },
  { icon: FileCheck, title: "Compliance Ready", desc: "Built to meet all government procurement standards" },
  { icon: Award, title: "Quality Assured", desc: "Rigorous testing and documentation" }
];

const howWeWork = [
  { step: "1", title: "Proposal Submission", desc: "We submit detailed project proposals with clear deliverables" },
  { step: "2", title: "Technical Review", desc: "Joint technical assessment and feasibility study" },
  { step: "3", title: "Pilot Program", desc: "Small-scale implementation for proof of concept" },
  { step: "4", title: "Full Deployment", desc: "Phased rollout with continuous support" }
];

const alignedMissions = [
  "Digital India",
  "Smart Cities Mission",
  "Swachh Bharat",
  "Make in India",
  "Startup India",
  "National AI Mission"
];

export default function GovernmentCustomers() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 via-primary/5 to-transparent" />
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl"
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-sm font-medium text-green-400">
                <Landmark className="w-4 h-4" />
                For Government
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="font-display text-4xl lg:text-6xl font-bold mb-8 leading-tight"
            >
              Building <span className="gradient-text">Nation-Scale</span> Solutions
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Partner with ASIREX for innovative technology solutions that serve the nation. 
              We're committed to India's development through cutting-edge AI and robotics.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
              <Button size="lg">
                <FileText className="w-5 h-5 mr-2" /> View Proposals
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.location.href = 'mailto:partner@asirex.in'}>
                <Handshake className="w-5 h-5 mr-2" /> Partner With Us
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Projects */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Projects for <span className="gradient-text">National Impact</span>
            </h2>
            <p className="text-muted-foreground text-lg">Technology solutions designed for government deployment</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {projects.map((project, i) => (
              <motion.div
                key={project.title}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card p-8 group"
              >
                <motion.div
                  className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <project.icon className="w-7 h-7 text-green-400" />
                </motion.div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-display text-xl font-semibold">{project.title}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">{project.status}</span>
                </div>
                <p className="text-muted-foreground mb-4">{project.description}</p>
                <div className="flex items-center gap-2 text-green-400">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">{project.impact}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Government Should Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Why <span className="gradient-text">Choose ASIREX</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {governmentBenefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 text-center"
              >
                <benefit.icon className="w-10 h-10 text-green-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Process</span>
            </h2>
            <p className="text-muted-foreground text-lg">How we work with government agencies</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {howWeWork.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center relative"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-400">
                  {step.step}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
                {i < howWeWork.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Aligned Missions */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Aligned With <span className="gradient-text">National Missions</span>
            </h2>
            <p className="text-muted-foreground text-lg">Our work supports India's key development initiatives</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {alignedMissions.map((mission, i) => (
              <motion.div
                key={mission}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="px-6 py-3 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 font-medium"
              >
                {mission}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-primary/10 to-green-500/10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Flag className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              Let's Build <span className="gradient-text">India's Future</span> Together
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Partner with us to bring transformative technology to every corner of India.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg">
                <FileText className="w-5 h-5 mr-2" /> Request Proposal
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/about#contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}