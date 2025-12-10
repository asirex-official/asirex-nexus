import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Users, MapPin, Mail, Phone, Send, Briefcase, Upload, Rocket, Sparkles, Zap, Globe, Shield, Award, Star, TrendingUp, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ApplicationDialog } from "@/components/ApplicationDialog";
import { Link } from "react-router-dom";

// Animation variants for smooth staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
} as const;

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8
    }
  }
} as const;

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8
    }
  }
} as const;

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6
    }
  }
} as const;

const values = [{
  icon: Target,
  title: "Innovation First",
  description: "We push boundaries with cutting-edge AI, robotics, and clean-tech solutions that redefine what's possible.",
  link: "/values/innovation-first"
}, {
  icon: Eye,
  title: "Vision for India",
  description: "Building technology that transforms 1.4 billion lives and positions India as the global tech superpower.",
  link: "/values/vision-for-india"
}, {
  icon: Heart,
  title: "Customer Obsession",
  description: "Every product is crafted with passion, designed with precision, and built for the people who matter most.",
  link: "/values/customer-obsession"
}, {
  icon: TrendingUp,
  title: "Future-Driven Excellence",
  description: "We build for tomorrow, anticipating needs and crafting solutions that stand the test of time.",
  link: "/values/future-driven-excellence"
}];

const team = [{
  name: "Kapeesh Sorout",
  role: "CEO & Founder",
  emoji: "👨‍💼",
  slug: "kapeesh-sorout"
}, {
  name: "It can be you",
  role: "Website Admin and SWE",
  emoji: "+",
  slug: "open-position-swe"
}, {
  name: "It can be you",
  role: "Sales Manager and Head",
  emoji: "🧠+",
  slug: "open-position-sales"
}, {
  name: "It can be you",
  role: "Engineering and Research & Development Lead",
  emoji: "+",
  slug: "open-position-rd"
}, {
  name: "Vaibhav Ghatwal",
  role: "Production Head and Manager",
  emoji: "🌱",
  slug: "vaibhav-ghatwal"
}];

const openPositions = [{
  title: "Senior AI Engineer",
  location: "India",
  type: "Full-time",
  salary: "10-30 LPA"
}, {
  title: "Robotics Software Developer",
  location: "India",
  type: "Full-time",
  salary: "10-20 LPA"
}, {
  title: "Product Designer",
  location: "Remote",
  type: "Full-time",
  salary: "5-15 LPA"
}, {
  title: "Machine Learning Engineer",
  location: "India",
  type: "Full-time",
  salary: "12-25 LPA"
}, {
  title: "Embedded Systems Developer",
  location: "India",
  type: "Full-time",
  salary: "8-18 LPA"
}, {
  title: "Marketing Manager",
  location: "Remote",
  type: "Full-time",
  salary: "6-12 LPA"
}, {
  title: "Hardware Engineer",
  location: "India",
  type: "Full-time",
  salary: "10-22 LPA"
}, {
  title: "Content Writer & Social Media",
  location: "Remote",
  type: "Part-time",
  salary: "3-6 LPA"
}, {
  title: "Business Development Executive",
  location: "India",
  type: "Full-time",
  salary: "5-10 LPA + Commission"
}];

const whyJoinReasons = [
  { icon: Rocket, text: "Be part of India's next tech revolution" },
  { icon: TrendingUp, text: "Unlimited growth opportunities" },
  { icon: Award, text: "Work on world-changing projects" },
  { icon: Globe, text: "Global impact from day one" }
];

export default function About() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<typeof openPositions[0] | null>(null);

  const handleApply = (position: typeof openPositions[0]) => {
    setSelectedPosition(position);
    setApplicationOpen(true);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours."
    });
    setContactForm({
      name: "",
      email: "",
      message: ""
    });
    setIsSubmitting(false);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 lg:py-40 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent" />
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-5xl mx-auto text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <Sparkles className="w-4 h-4" />
                India's Future Tech Company
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="font-display text-5xl lg:text-7xl font-bold mb-8 leading-tight"
            >
              Pioneering India's{" "}
              <span className="gradient-text">Tech Future</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              ASIREX was founded with an audacious dream: to make India a global leader 
              in AI, robotics, and clean technology. We're not just building products — 
              <span className="text-foreground font-medium"> we're building India's tomorrow.</span>
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span>Made in India</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-5 h-5 text-accent" />
                <span>For the World</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>By Dreamers</span>
              </div>
            </motion.div>

            <motion.p 
              variants={itemVariants}
              className="text-lg text-primary font-semibold italic"
            >
              "The future belongs to those who believe in the beauty of their dreams."
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Inspiring Quote Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-block mb-6"
            >
              <Rocket className="w-12 h-12 text-primary" />
            </motion.div>
            <h2 className="font-display text-3xl lg:text-5xl font-bold mb-6 leading-tight">
              Every great journey starts with a{" "}
              <span className="gradient-text">single step</span>
            </h2>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              We started with nothing but a vision. Today, we're building the technology 
              that will define the next century. Join us in writing history.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Affordable Products & Customers */}
      <section className="py-20 bg-gradient-to-b from-card/50 to-transparent border-y border-border/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="max-w-5xl mx-auto"
          >
            {/* Main Message */}
            <motion.div 
              variants={scaleIn}
              className="glass-card p-8 lg:p-12 mb-10 text-center relative overflow-hidden"
            >
              <motion.div
                className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block mb-4"
              >
                <Heart className="w-10 h-10 text-primary" />
              </motion.div>
              
              <h2 className="font-display text-2xl lg:text-4xl font-bold mb-6">
                We Also Create <span className="gradient-text">Affordable Tech</span> for Everyone
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg max-w-3xl mx-auto mb-6">
                ASIREX also creates cheap, affordable products like Spy Earpieces, Decorative Items, 
                and Daily Life essentials for middle-class people. But that doesn't mean we'll stop here — 
                we're just gathering funds to launch a <span className="text-primary font-semibold">game-changing project</span>.
              </p>
              <Link to="/support-us">
                <motion.div 
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Heart className="w-5 h-5 text-primary animate-pulse" />
                  <span className="font-medium">Please Support Us If You Want a Tech Giant from India That'll Change India</span>
                  <ArrowRight className="w-4 h-4 text-primary" />
                </motion.div>
              </Link>
            </motion.div>

            {/* Customer Segments */}
            <motion.div variants={itemVariants} className="text-center mb-8">
              <h3 className="font-display text-2xl lg:text-3xl font-semibold mb-3">
                Our <span className="gradient-text">Customers</span>
              </h3>
              <p className="text-muted-foreground">We serve everyone — from individuals to institutions, dreamers to doers</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              {[
                { icon: Users, title: "Normal Public", desc: "Affordable tech for everyday heroes", bgClass: "from-blue-500/20 to-blue-600/20", iconClass: "text-blue-400", delay: 0.1, link: "/customers/public" },
                { icon: Target, title: "Government", desc: "Nation-building projects", bgClass: "from-green-500/20 to-green-600/20", iconClass: "text-green-400", delay: 0.2, link: "/customers/government" },
                { icon: Briefcase, title: "Private Companies", desc: "Enterprise solutions that scale", bgClass: "from-purple-500/20 to-purple-600/20", iconClass: "text-purple-400", delay: 0.3, link: "/customers/private" }
              ].map((customer, i) => (
                <Link key={customer.title} to={customer.link}>
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: customer.delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass-card p-8 text-center group cursor-pointer h-full"
                  >
                    <motion.div 
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${customer.bgClass} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <customer.icon className={`w-8 h-8 ${customer.iconClass}`} />
                    </motion.div>
                    <h4 className="font-display font-semibold text-xl mb-2">{customer.title}</h4>
                    <p className="text-muted-foreground">{customer.desc}</p>
                    <ArrowRight className="w-5 h-5 text-primary mx-auto mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Tech Fields */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center glass-card p-6 max-w-2xl mx-auto"
            >
              <Zap className="w-6 h-6 text-accent mx-auto mb-3" />
              <p className="text-lg">
                We are in <span className="text-foreground font-semibold">every tech and AI field</span> — 
                and if we're not, <span className="text-primary font-semibold">we're planning to be</span>.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-card/30 relative overflow-hidden">
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl lg:text-5xl font-bold mb-4">
              What <span className="gradient-text">Drives Us</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              More than just a company — we're a movement. A force for change. A beacon of hope.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Link to="/values/mission" className="h-full">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideInLeft}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-10 lg:p-12 relative overflow-hidden group cursor-pointer h-full"
              >
                <motion.div
                  className="absolute -top-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-500"
                />
                <div className="relative">
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-8"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Target className="w-8 h-8 text-accent-foreground" />
                  </motion.div>
                  <h2 className="font-display text-3xl font-bold mb-6">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                    To democratize access to advanced technology across India and Southeast Asia. 
                    We create affordable, powerful tools that empower developers, businesses, 
                    and institutions to build a better future.
                  </p>
                  <p className="text-primary font-medium italic">
                    "Technology should be a right, not a privilege."
                  </p>
                  <ArrowRight className="w-5 h-5 text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </Link>

            <Link to="/values/vision" className="h-full">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideInRight}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-10 lg:p-12 relative overflow-hidden group cursor-pointer h-full"
              >
                <motion.div
                  className="absolute -bottom-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500"
                />
                <div className="relative">
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-8"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Eye className="w-8 h-8 text-primary-foreground" />
                  </motion.div>
                  <h2 className="font-display text-3xl font-bold mb-6">Our Vision</h2>
                  <p className="text-muted-foreground leading-relaxed text-lg mb-4">
                    A world where cutting-edge AI, robotics, and sustainable tech are not luxuries 
                    but everyday tools. Where Indian innovation leads global progress. 
                    Where technology serves humanity.
                  </p>
                  <p className="text-accent font-medium italic">
                    "Dream big. Build bigger. Impact biggest."
                  </p>
                  <ArrowRight className="w-5 h-5 text-accent mt-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-medium text-accent mb-4">
              <Star className="w-4 h-4" />
              What We Stand For
            </span>
            <h2 className="font-display text-3xl lg:text-5xl font-bold mb-4">
              Our <span className="gradient-text">Core Values</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              These aren't just words on a wall. They're the principles that guide every decision we make.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
          {values.map((value, index) => (
              <Link key={value.title} to={value.link}>
                <motion.div 
                  variants={itemVariants}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="glass-card p-8 text-center group cursor-pointer relative overflow-hidden h-full"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <motion.div 
                    className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-accent/20 transition-colors duration-300"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <value.icon className="w-7 h-7 text-accent" />
                  </motion.div>
                  <h3 className="font-display text-xl font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-card/30 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl lg:text-5xl font-bold mb-4">
              The <span className="gradient-text">Dreamers & Builders</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A small team with a massive vision. We're not just colleagues — we're a family united by purpose.
            </p>
          </motion.div>

          {/* CEO - Top of hierarchy */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center mb-10"
          >
            <Link to="/team/kapeesh-sorout">
              <motion.div 
                whileHover={{ y: -8 }}
                className="glass-card p-8 text-center max-w-sm relative overflow-hidden group cursor-pointer"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <motion.div 
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4 text-5xl relative"
                  animate={{ boxShadow: ["0 0 0 0 rgba(var(--primary), 0)", "0 0 0 20px rgba(var(--primary), 0)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {team[0].emoji}
                </motion.div>
                <h3 className="font-display text-xl font-semibold">{team[0].name}</h3>
                <p className="text-muted-foreground">{team[0].role}</p>
                <p className="text-sm text-primary mt-2 font-medium">Visionary Leader</p>
              </motion.div>
            </Link>
          </motion.div>

          {/* Animated Arrow Connector */}
          <motion.div 
            initial={{ opacity: 0, scaleY: 0 }}
            whileInView={{ opacity: 1, scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center mb-8 origin-top"
          >
            <div className="w-1 h-12 bg-gradient-to-b from-primary via-accent to-primary/50 rounded-full" />
            <motion.div 
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-accent" 
            />
          </motion.div>

          {/* Core Members Label */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mb-10"
          >
            <h3 className="font-display text-2xl lg:text-3xl font-bold">
              The <span className="gradient-text">Core Team</span>
            </h3>
            <p className="text-muted-foreground mt-2">The backbone of ASIREX</p>
          </motion.div>

          {/* Branching Arrow Connector */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center mb-6 w-full max-w-5xl mx-auto px-4"
          >
            <svg width="100%" height="160" viewBox="0 0 1000 160" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
              <defs>
                <linearGradient id="arrowGradientMain" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--accent))" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.6" />
                </linearGradient>
                <filter id="arrowGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              <g filter="url(#arrowGlow)" opacity="0.5">
                <path d="M500,0 L500,50 C500,65 485,65 470,65 L140,65 C120,65 110,75 110,90 L110,140" stroke="hsl(var(--accent))" strokeWidth="3" fill="none" />
                <path d="M500,50 C500,65 485,65 470,65 L360,65 C340,65 330,75 330,90 L330,140" stroke="hsl(var(--accent))" strokeWidth="3" fill="none" />
                <path d="M500,50 C500,65 515,65 530,65 L640,65 C660,65 670,75 670,90 L670,140" stroke="hsl(var(--accent))" strokeWidth="3" fill="none" />
                <path d="M500,50 C500,65 515,65 530,65 L860,65 C880,65 890,75 890,90 L890,140" stroke="hsl(var(--accent))" strokeWidth="3" fill="none" />
              </g>
              
              <path d="M500,0 L500,50 C500,65 485,65 470,65 L140,65 C120,65 110,75 110,90 L110,140" stroke="url(#arrowGradientMain)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M500,50 C500,65 485,65 470,65 L360,65 C340,65 330,75 330,90 L330,140" stroke="url(#arrowGradientMain)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M500,50 C500,65 515,65 530,65 L640,65 C660,65 670,75 670,90 L670,140" stroke="url(#arrowGradientMain)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M500,50 C500,65 515,65 530,65 L860,65 C880,65 890,75 890,90 L890,140" stroke="url(#arrowGradientMain)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              
              <path d="M110,155 L102,140 L110,143 L118,140 Z" fill="hsl(var(--accent))" />
              <path d="M330,155 L322,140 L330,143 L338,140 Z" fill="hsl(var(--accent))" />
              <path d="M670,155 L662,140 L670,143 L678,140 Z" fill="hsl(var(--accent))" />
              <path d="M890,155 L882,140 L890,143 L898,140 Z" fill="hsl(var(--accent))" />
            </svg>
          </motion.div>

          {/* Other Pillars - Below CEO */}
          <div className="flex flex-row justify-center gap-4 max-w-5xl mx-auto px-2">
            {team.slice(1).map((member, index) => (
              <Link key={`${member.name}-${index}`} to={`/team/${member.slug}`} className="flex-1 min-w-0">
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8 }}
                  className="glass-card p-4 sm:p-5 lg:p-7 text-center group cursor-pointer h-full"
                >
                  {member.name === "It can be you" ? (
                    <motion.div 
                      className="w-14 h-14 sm:w-18 sm:h-18 lg:w-22 lg:h-22 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center mx-auto mb-3 sm:mb-4"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-light text-primary/70">+</span>
                    </motion.div>
                  ) : (
                    <div className="w-14 h-14 sm:w-18 sm:h-18 lg:w-22 lg:h-22 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl group-hover:scale-110 transition-transform duration-300">
                      {member.emoji}
                    </div>
                  )}
                  <h3 className="font-display font-semibold text-sm sm:text-base lg:text-lg truncate">{member.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.role}</p>
                  {member.name === "It can be you" && (
                    <Button variant="glass" size="sm" className="mt-3">
                      Join Us
                    </Button>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section id="careers" className="py-24 relative overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent"
        />
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
              <Rocket className="w-4 h-4" />
              Build Your Future With Us
            </span>
            <h2 className="font-display text-3xl lg:text-5xl font-bold mb-4">
              Join the <span className="gradient-text">Revolution</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Be part of building the future. We're looking for dreamers, builders, and believers 
              who want to change the world.
            </p>

            {/* Why Join */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              {whyJoinReasons.map((reason, i) => (
                <motion.div 
                  key={reason.text}
                  variants={itemVariants}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border/50"
                >
                  <reason.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm">{reason.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="max-w-4xl mx-auto space-y-4"
          >
            {openPositions.map((position, index) => (
              <motion.div 
                key={position.title} 
                variants={itemVariants}
                whileHover={{ scale: 1.02, x: 8 }}
                className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
              >
                <div>
                  <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{position.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {position.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {position.type}
                    </span>
                    <span className="flex items-center gap-1 text-primary font-medium">
                      ₹ {position.salary}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="glass" 
                  onClick={() => handleApply(position)}
                  className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                >
                  Apply Now
                </Button>
              </motion.div>
            ))}
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-muted-foreground mt-10"
          >
            Don't see your role? <span className="text-primary font-medium">Reach out anyway</span> — 
            we're always looking for exceptional talent.
          </motion.p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-card/30 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInLeft}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-sm font-medium text-accent mb-6">
                <Mail className="w-4 h-4" />
                Let's Connect
              </span>
              <h2 className="font-display text-3xl lg:text-5xl font-bold mb-6">
                Get in <span className="gradient-text">Touch</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Have questions about our products? Interested in partnerships? 
                Want to support our mission? We'd love to hear from you.
              </p>
              <p className="text-primary font-medium italic mb-10">
                "Every conversation is an opportunity to change the world."
              </p>

              <div className="space-y-6">
                {[
                  { icon: Mail, label: "Email", value: "Asirex.official@gmail.com" },
                  { icon: Phone, label: "Phone", value: "Coming soon!" },
                  { icon: MapPin, label: "Headquarters", value: "Noida, India" }
                ].map((contact, i) => (
                  <motion.div 
                    key={contact.label}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <contact.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">{contact.label}</div>
                      <div className="font-medium text-lg">{contact.value}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={slideInRight}
            >
              <form onSubmit={handleContactSubmit} className="glass-card p-8 lg:p-10">
                <h3 className="font-display text-2xl font-bold mb-6">Send us a message</h3>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input 
                      value={contactForm.name} 
                      onChange={e => setContactForm({ ...contactForm, name: e.target.value })} 
                      placeholder="Your name" 
                      required 
                      className="bg-muted/50 h-12" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input 
                      type="email" 
                      value={contactForm.email} 
                      onChange={e => setContactForm({ ...contactForm, email: e.target.value })} 
                      placeholder="your@email.com" 
                      required 
                      className="bg-muted/50 h-12" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea 
                      value={contactForm.message} 
                      onChange={e => setContactForm({ ...contactForm, message: e.target.value })} 
                      placeholder="How can we help you?" 
                      required 
                      rows={5} 
                      className="bg-muted/50" 
                    />
                  </div>
                  <Button type="submit" variant="hero" className="w-full h-12 text-base" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        Sending...
                      </motion.span>
                    ) : (
                      <>
                        Send Message
                        <Send className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Closing Motivation */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              The future is not something we enter.{" "}
              <span className="gradient-text">It's something we create.</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Together, let's build something extraordinary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Application Dialog */}
      {selectedPosition && (
        <ApplicationDialog
          open={applicationOpen}
          onOpenChange={setApplicationOpen}
          position={selectedPosition}
        />
      )}
    </Layout>
  );
}
