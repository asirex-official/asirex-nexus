import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Briefcase, Building2, Cog, LineChart, Shield, Zap, Users, ArrowRight, CheckCircle, Handshake, Target, Cpu } from "lucide-react";
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

const services = [
  {
    icon: Cpu,
    title: "Custom AI Solutions",
    description: "Tailored AI models and automation systems for your specific business needs",
    features: ["Machine Learning", "Computer Vision", "NLP Solutions"]
  },
  {
    icon: Cog,
    title: "Industrial Automation",
    description: "Robotics and IoT solutions to optimize your manufacturing and operations",
    features: ["Process Automation", "Quality Control", "Predictive Maintenance"]
  },
  {
    icon: Building2,
    title: "Enterprise Software",
    description: "Custom software development for complex business requirements",
    features: ["Web Applications", "Mobile Apps", "System Integration"]
  }
];

const benefits = [
  { icon: LineChart, title: "Increase Efficiency", desc: "Reduce operational costs by up to 40%" },
  { icon: Shield, title: "Secure & Reliable", desc: "Enterprise-grade security standards" },
  { icon: Zap, title: "Fast Implementation", desc: "Quick deployment with minimal downtime" },
  { icon: Users, title: "Dedicated Support", desc: "24/7 technical support team" }
];

const caseStudies = [
  {
    company: "Manufacturing Corp",
    industry: "Manufacturing",
    result: "35% reduction in production defects",
    solution: "AI-powered quality control system"
  },
  {
    company: "Logistics Ltd",
    industry: "Logistics",
    result: "50% faster inventory management",
    solution: "Automated warehouse robotics"
  },
  {
    company: "Retail Chain",
    industry: "Retail",
    result: "25% increase in sales",
    solution: "Customer behavior analytics"
  }
];

const partnershipModels = [
  { title: "Project-Based", desc: "One-time implementation with full handover" },
  { title: "Retainer", desc: "Ongoing support and continuous improvement" },
  { title: "Revenue Share", desc: "Partner in your success with shared outcomes" }
];

export default function PrivateCompanies() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-primary/5 to-transparent" />
        <motion.div 
          className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
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
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm font-medium text-purple-400">
                <Briefcase className="w-4 h-4" />
                For Private Companies
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="font-display text-4xl lg:text-6xl font-bold mb-8 leading-tight"
            >
              Enterprise Solutions That <span className="gradient-text">Scale</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Partner with ASIREX for cutting-edge AI, robotics, and automation solutions 
              that transform your business operations.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
              <Button size="lg">
                <Handshake className="w-5 h-5 mr-2" /> Partner With Us
              </Button>
              <Button variant="outline" size="lg">
                Request Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Enterprise Services</span>
            </h2>
            <p className="text-muted-foreground text-lg">Comprehensive solutions for modern businesses</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card p-8 group"
              >
                <motion.div
                  className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <service.icon className="w-7 h-7 text-purple-400" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Why Partner With <span className="gradient-text">ASIREX</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 text-center"
              >
                <benefit.icon className="w-10 h-10 text-purple-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Success <span className="gradient-text">Stories</span>
            </h2>
            <p className="text-muted-foreground text-lg">See how we've helped businesses transform</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {caseStudies.map((study, i) => (
              <motion.div
                key={study.company}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-6"
              >
                <div className="text-sm text-purple-400 mb-2">{study.industry}</div>
                <h3 className="font-display text-lg font-semibold mb-3">{study.company}</h3>
                <p className="text-2xl font-bold text-primary mb-2">{study.result}</p>
                <p className="text-muted-foreground text-sm">{study.solution}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Models */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Flexible <span className="gradient-text">Partnership Models</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {partnershipModels.map((model, i) => (
              <motion.div
                key={model.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <h3 className="font-display text-xl font-semibold mb-2">{model.title}</h3>
                <p className="text-muted-foreground">{model.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-primary/10 to-purple-500/10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Target className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              Ready to <span className="gradient-text">Transform</span> Your Business?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Let's discuss how ASIREX can help you achieve your business goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg">
                <Handshake className="w-5 h-5 mr-2" /> Schedule a Call
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