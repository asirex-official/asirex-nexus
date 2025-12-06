import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import aquaPurifier1 from "@/assets/aqua-purifier-1.png";
import aquaPurifier2 from "@/assets/aqua-purifier-2.png";
import { Calendar, ArrowRight, Bell, Clock, AlertTriangle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { CyclingProjectImage } from "@/components/projects/CyclingProjectImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
const projects = [{
  id: 1,
  name: "Project ASTRA",
  tagline: "Autonomous Satellite Technology for Rural Access",
  description: "A revolutionary satellite-based internet system designed to bring high-speed connectivity to remote areas of India. Using AI-powered mesh networking and solar-powered ground stations.",
  launchQuarter: "Q2 2025",
  status: "In Development",
  image: "🛰️",
  impact: "Connect 50M+ rural users",
  features: ["AI Mesh Networking", "Solar Powered", "Low Latency", "Affordable Access"],
  progress: 65
}, {
  id: 2,
  name: "Aqua River Purifier",
  tagline: "India's First Fully Autonomous AI River Cleaning Ecosystem",
  description: "A fleet of self-driving water-cleaning robots that roam rivers 24/7, collect waste, purify water, protect aquatic life, and send real-time environmental data to a national monitoring network. Operates using solar power, backup batteries, and AI-controlled operations without human supervision.",
  launchQuarter: "Q3 2025",
  status: "Prototype Phase",
  images: [aquaPurifier1, aquaPurifier2],
  impact: "In 5 Years our polluted rivers can be crystal clear | Goal: Restore our water bodies",
  features: ["AI Vision + Sensors", "AI Drones (5/dock)", "National Dashboard", "Multi-Pollution Filtration"],
  progress: 6,
  sections: [{
    icon: "⚙️",
    title: "How It Works",
    content: "Bots patrol rivers automatically, detect trash/oil/plastics/metals/toxic hotspots using AI vision + sensors, collect waste onboard with modules for each pollution type, release purified water back, and upload data to central server. Support units (drones + rescue bots) assist continuously."
  }, {
    icon: "🧪",
    title: "Pollution Removal Technologies",
    content: "Floating Plastics → Robotic arms + intake conveyor | Metallic Waste → Magnetic separator | Oil & Chemical Films → Eco-friendly enzyme dispersant jets | Micro-Waste & Bacteria → Multi-stage filter + UV treatment | Aquatic life detection ensures fish/wildlife safety."
  }, {
    icon: "🚢",
    title: "Smart Docking Stations",
    content: "AI-enabled stations recharge bots (solar + grid), store waste in separate bins (plastics/metals/toxic), auto-empty & clean bots, run health checks, upload data logs. Stations act as charging and maintenance homes for the fleet."
  }, {
    icon: "🤖",
    title: "Rescue Bots",
    content: "2 per dock - help stuck/damaged bots, replace/boost batteries, free blocked propellers, tow broken bots, perform emergency repairs. Ensures zero downtime across the entire fleet."
  }, {
    icon: "🛰️",
    title: "AI Drones",
    content: "5 per dock - scan for pollution zones, create real-time pollution maps, track cleaning progress, capture evidence for government reporting, redirect bots to hotspots instantly."
  }, {
    icon: "🧠",
    title: "Central Intelligence System",
    content: "Learns pollution patterns, plans optimal routes, predicts environmental damage, auto-increases bots where needed, alerts humans only when required. System gets smarter over time."
  }, {
    icon: "📲",
    title: "National Dashboard",
    content: "Live river map, water health ratings, progress stats, device monitoring, government transparency. India watches rivers recover in real time."
  }, {
    icon: "💎",
    title: "Vision",
    content: "Build the world's smartest AI Environmental Protection System and make India a global leader in clean-water robotics."
  }]
}, {
  id: 3,
  name: "EcoCity Blueprint",
  tagline: "Smart Sustainable Urban Solutions",
  description: "A comprehensive smart city solution featuring renewable energy grids, AI traffic management, and IoT-based waste management. Partnering with 5 major Indian cities.",
  launchQuarter: "Q4 2025",
  status: "Planning",
  image: "🏙️",
  impact: "Transform 5 cities",
  features: ["Renewable Energy Grid", "AI Traffic", "Smart Waste", "Clean Air"],
  progress: 25
}, {
  id: 4,
  name: "MedAssist AI",
  tagline: "Democratizing Healthcare with AI",
  description: "AI-powered diagnostic tool that helps rural health workers identify diseases from symptoms and basic tests. Integrating with government health programs for maximum reach.",
  launchQuarter: "Q1 2025",
  status: "Beta Testing",
  image: "🏥",
  impact: "Serve 100M+ patients",
  features: ["Symptom Analysis", "Offline Mode", "Multi-language", "Doctor Connect"],
  progress: 80
}];
export default function Projects() {
  type Project = typeof projects[0];
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const handleNotify = () => {
    if (notifyEmail) {
      setIsSubscribed(true);
      setNotifyEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };
  return <Layout>
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center mb-16">
            <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.2
          }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Building Tomorrow
              </span>
            </motion.div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Future <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the innovations we're building to transform India and beyond. 
              Sign up to get notified when these projects launch.
            </p>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {projects.map((project, index) => <motion.div key={project.id} initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }} className="group cursor-pointer" onClick={() => setSelectedProject(project)}>
                <div className="glass-card p-6 lg:p-8 card-hover h-full">
                  <div className="flex items-start gap-4 mb-6">
                    {'images' in project && project.images ? <div className="w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0">
                        <CyclingProjectImage images={project.images} interval={4000} className="w-full h-full" />
                      </div> : <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl flex-shrink-0">
                        {project.image}
                      </div>}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary uppercase tracking-wider">
                          {project.status}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {project.launchQuarter}
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-semibold group-hover:text-accent transition-colors">
                        {project.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-accent text-sm font-medium mb-3">
                    {project.tagline}
                  </p>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-yellow-500">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-yellow-500/20 rounded-full overflow-hidden">
                      <motion.div initial={{
                    width: 0
                  }} whileInView={{
                    width: `${project.progress}%`
                  }} viewport={{
                    once: true
                  }} transition={{
                    duration: 1,
                    delay: 0.5
                  }} className="h-full bg-yellow-500 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-yellow-500">Slow Progress Due to lack of funds</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Impact: <span className="text-foreground font-medium">{project.impact}</span>
                    </span>
                    <Button variant="glass" size="sm" className="group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-3xl glass-card border-border max-h-[90vh] overflow-y-auto">
          {selectedProject && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }}>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  {'images' in selectedProject && selectedProject.images ? <div className="w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0">
                      <CyclingProjectImage images={selectedProject.images} interval={4000} className="w-full h-full" />
                    </div> : <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-5xl">
                      {selectedProject.image}
                    </div>}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary/20 text-primary">
                        {selectedProject.status}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {selectedProject.launchQuarter}
                      </span>
                    </div>
                    <DialogTitle className="font-display text-2xl lg:text-3xl">
                      {selectedProject.name}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <p className="text-lg text-accent font-medium">
                  {selectedProject.tagline}
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  {selectedProject.description}
                </p>

                {/* Progress */}
                

                {/* Features */}
                <div>
                  <h4 className="font-display font-semibold mb-3">Key Features</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                {selectedProject.features.map(feature => <div key={feature} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/30">
                        <span className="w-2 h-2 bg-accent rounded-full" />
                        <span className="text-sm">{feature}</span>
                      </div>)}
                  </div>
                </div>

                {/* Detailed Sections */}
                {selectedProject.sections && selectedProject.sections.length > 0 && <div className="space-y-4">
                    <h4 className="font-display font-semibold">Detailed Overview</h4>
                    <div className="space-y-3">
                      {selectedProject.sections.map((section, idx) => <motion.div key={idx} initial={{
                  opacity: 0,
                  x: -10
                }} animate={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  delay: idx * 0.05
                }} className="glass-card p-4 bg-muted/20">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">{section.icon}</span>
                            <div>
                              <h5 className="font-semibold text-foreground mb-1">{section.title}</h5>
                              <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                            </div>
                          </div>
                        </motion.div>)}
                    </div>
                  </div>}

                {/* Impact */}
                <div className="glass-card p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
                  <h4 className="font-display font-semibold mb-2">Projected Impact</h4>
                  <p className="text-2xl font-bold gradient-text">
                    {selectedProject.impact}
                  </p>
                </div>

                {/* Notify Form */}
                <div className="border-t border-border pt-6">
                  <h4 className="font-display font-semibold mb-4 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-accent" />
                    Get Notified on Launch
                  </h4>
                  <AnimatePresence mode="wait">
                    {isSubscribed ? <motion.p initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -10
                }} className="text-accent font-medium">
                        ✓ You're on the list! We'll notify you when {selectedProject.name} launches.
                      </motion.p> : <motion.div initial={{
                  opacity: 0,
                  y: 10
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -10
                }} className="flex gap-3">
                        <Input type="email" placeholder="Enter your email" value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)} className="bg-muted/50" />
                        <Button variant="hero" onClick={handleNotify}>
                          Notify Me
                        </Button>
                      </motion.div>}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>}
        </DialogContent>
      </Dialog>
    </Layout>;
}