import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Eye, Heart, Users, MapPin, Mail, Phone, Send, Briefcase, Upload } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
const values = [{
  icon: Target,
  title: "Innovation First",
  description: "We push boundaries with cutting-edge AI, robotics, and clean-tech solutions."
}, {
  icon: Eye,
  title: "Vision for India",
  description: "Building technology that transforms lives and drives national progress."
}, {
  icon: Heart,
  title: "Customer Obsession",
  description: "Every product is designed with user needs at the center of development."
}, {
  icon: Users,
  title: "Collaborative Spirit",
  description: "We believe in community, open innovation, and growing together."
}];
const team = [{
  name: "Kapeesh Sorout",
  role: "CEO & Founder",
  emoji: "👨‍💼"
}, {
  name: "Ayush Soni",
  role: "Website Admin and SWE",
  emoji: "👩‍💻"
}, {
  name: "Vikram Singh",
  role: "Head of Robotics",
  emoji: "+"
}, {
  name: "Ananya Patel",
  role: "Head of AI Research",
  emoji: "🧠"
}, {
  name: "Vaibhav Ghatwal",
  role: "Product Manager and Production Head",
  emoji: "🌱"
}];
const openPositions = [{
  title: "Senior AI Engineer",
  location: "Bangalore",
  type: "Full-time"
}, {
  title: "Robotics Software Developer",
  location: "Bangalore",
  type: "Full-time"
}, {
  title: "Product Designer",
  location: "Remote",
  type: "Full-time"
}, {
  title: "Sales Manager - Laos",
  location: "Vientiane",
  type: "Full-time"
}];
export default function About() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
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
  return <Layout>
      {/* Hero */}
      <section className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="max-w-4xl mx-auto text-center">
            <h1 className="font-display text-4xl lg:text-6xl font-bold mb-6">
              Pioneering India's{" "}
              <span className="gradient-text">Tech Future</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10">
              ASIREX was founded with a bold vision: to make India a global leader 
              in AI, robotics, and clean technology. We're building the products 
              and platforms that will shape tomorrow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div initial={{
            opacity: 0,
            x: -30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} className="glass-card p-8 lg:p-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-accent-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To democratize access to advanced technology across India and Southeast Asia. 
                We create affordable, powerful tools that empower developers, businesses, 
                and institutions to build a better future.
              </p>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            x: 30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} className="glass-card p-8 lg:p-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-primary-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                A world where cutting-edge AI, robotics, and sustainable tech are not luxuries 
                but everyday tools. Where Indian innovation leads global progress. 
                Where technology serves humanity.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Values</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => <motion.div key={value.title} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="glass-card p-6 text-center card-hover">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Asirex's <span className="gradient-text">Pillars</span>
            </h2>
          </motion.div>

          {/* CEO - Top of hierarchy */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="flex justify-center mb-8">
            <div className="glass-card p-6 text-center card-hover max-w-xs">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4 text-4xl">
                {team[0].emoji}
              </div>
              <h3 className="font-display font-semibold">{team[0].name}</h3>
              <p className="text-sm text-muted-foreground">{team[0].role}</p>
            </div>
          </motion.div>

          {/* Animated Arrow Connector */}
          <motion.div initial={{
          opacity: 0,
          scaleY: 0
        }} whileInView={{
          opacity: 1,
          scaleY: 1
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="flex flex-col items-center mb-6 origin-top">
            <div className="w-0.5 h-10 bg-gradient-to-b from-primary via-accent to-primary/50" />
            <motion.div animate={{
            y: [0, 4, 0]
          }} transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }} className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-accent" />
          </motion.div>

          {/* Core Members Label */}
          <motion.div initial={{
          opacity: 0,
          y: 10
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.3
        }} className="text-center mb-8">
            <h3 className="font-display text-2xl lg:text-3xl font-bold">
              Your <span className="gradient-text">Core Members</span>
            </h3>
          </motion.div>

          {/* Branching Arrow Connector */}
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: 0.4
        }} className="flex justify-center mb-4 w-full max-w-5xl mx-auto px-4">
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
              
              {/* Glow layer */}
              <g filter="url(#arrowGlow)" opacity="0.5">
                <path
                  d="M500,0 L500,50 C500,65 485,65 470,65 L140,65 C120,65 110,75 110,90 L110,140"
                  stroke="hsl(var(--accent))"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M500,50 C500,65 485,65 470,65 L360,65 C340,65 330,75 330,90 L330,140"
                  stroke="hsl(var(--accent))"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M500,50 C500,65 515,65 530,65 L640,65 C660,65 670,75 670,90 L670,140"
                  stroke="hsl(var(--accent))"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M500,50 C500,65 515,65 530,65 L860,65 C880,65 890,75 890,90 L890,140"
                  stroke="hsl(var(--accent))"
                  strokeWidth="3"
                  fill="none"
                />
              </g>
              
              {/* Main stem + far left branch */}
              <path
                d="M500,0 L500,50 C500,65 485,65 470,65 L140,65 C120,65 110,75 110,90 L110,140"
                stroke="url(#arrowGradientMain)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Left-center branch */}
              <path
                d="M500,50 C500,65 485,65 470,65 L360,65 C340,65 330,75 330,90 L330,140"
                stroke="url(#arrowGradientMain)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Right-center branch */}
              <path
                d="M500,50 C500,65 515,65 530,65 L640,65 C660,65 670,75 670,90 L670,140"
                stroke="url(#arrowGradientMain)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Far right branch */}
              <path
                d="M500,50 C500,65 515,65 530,65 L860,65 C880,65 890,75 890,90 L890,140"
                stroke="url(#arrowGradientMain)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Arrow head 1 */}
              <path
                d="M110,155 L102,140 L110,143 L118,140 Z"
                fill="hsl(var(--accent))"
              />
              
              {/* Arrow head 2 */}
              <path
                d="M330,155 L322,140 L330,143 L338,140 Z"
                fill="hsl(var(--accent))"
              />
              
              {/* Arrow head 3 */}
              <path
                d="M670,155 L662,140 L670,143 L678,140 Z"
                fill="hsl(var(--accent))"
              />
              
              {/* Arrow head 4 */}
              <path
                d="M890,155 L882,140 L890,143 L898,140 Z"
                fill="hsl(var(--accent))"
              />
            </svg>
          </motion.div>

          {/* Other Pillars - Below CEO */}
          <div className="flex flex-row justify-center gap-4 max-w-5xl mx-auto px-2">
            {team.slice(1).map((member, index) => <motion.div key={member.name} initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="glass-card p-3 sm:p-4 lg:p-6 text-center card-hover flex-1 min-w-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-2 sm:mb-4 text-2xl sm:text-3xl lg:text-4xl">
                  {member.emoji}
                </div>
                <h3 className="font-display font-semibold text-xs sm:text-sm lg:text-base truncate">{member.name}</h3>
                <p className="text-xs text-muted-foreground truncate">{member.role}</p>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Careers */}
      <section id="careers" className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Join Our <span className="gradient-text">Team</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Be part of building the future. We're always looking for talented 
              individuals who share our passion for innovation.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {openPositions.map((position, index) => <motion.div key={position.title} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover">
                <div>
                  <h3 className="font-display font-semibold mb-1">{position.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {position.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {position.type}
                    </span>
                  </div>
                </div>
                <Button variant="glass">
                  Apply Now
                </Button>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <motion.div initial={{
            opacity: 0,
            x: -30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }}>
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Get in <span className="gradient-text">Touch</span>
              </h2>
              <p className="text-muted-foreground mb-8">
                Have questions about our products or interested in partnerships? 
                We'd love to hear from you.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">hello@asirex.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div className="font-medium">+91 80 1234 5678</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Headquarters</div>
                    <div className="font-medium">Bangalore, India</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{
            opacity: 0,
            x: 30
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }}>
              <form onSubmit={handleContactSubmit} className="glass-card p-6 lg:p-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input value={contactForm.name} onChange={e => setContactForm({
                    ...contactForm,
                    name: e.target.value
                  })} placeholder="Your name" required className="bg-muted/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input type="email" value={contactForm.email} onChange={e => setContactForm({
                    ...contactForm,
                    email: e.target.value
                  })} placeholder="your@email.com" required className="bg-muted/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea value={contactForm.message} onChange={e => setContactForm({
                    ...contactForm,
                    message: e.target.value
                  })} placeholder="How can we help?" required rows={4} className="bg-muted/50" />
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : <>
                        Send Message
                        <Send className="w-4 h-4 ml-2" />
                      </>}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>;
}