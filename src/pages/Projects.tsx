import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import aquaPurifier1 from "@/assets/aqua-purifier-1.png";
import aquaPurifier2 from "@/assets/aqua-purifier-2.png";
import { Calendar, ArrowRight, Bell, Clock, AlertTriangle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { CyclingProjectImage } from "@/components/projects/CyclingProjectImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Helper to get stage status
const getStageStatus = (currentStage: string, stage: string) => {
  const stages = ['Planning', 'Prototype', 'Development', 'Testing', 'Production'];
  const currentIndex = stages.indexOf(currentStage);
  const stageIndex = stages.indexOf(stage);
  if (stageIndex < currentIndex) return 'completed';
  if (stageIndex === currentIndex) return 'active';
  return 'pending';
};

const projects = [{
  id: 1,
  name: "Project ASTRA",
  tagline: "Autonomous Satellite Technology for Rural Access",
  description: "A revolutionary satellite-based internet system designed to bring high-speed connectivity to remote areas of India. Using AI-powered mesh networking and solar-powered ground stations.",
  launchQuarter: "Q2 2025",
  status: "In Development",
  stage: "Development",
  image: "🛰️",
  impact: "Connect 50M+ rural users",
  features: ["AI Mesh Networking", "Solar Powered", "Low Latency", "Affordable Access"],
  progress: 65,
  budget: "₹50Cr - ₹200Cr"
}, {
  id: 2,
  name: "Aqua River Purifier",
  tagline: "India's First Fully Autonomous AI River Cleaning Ecosystem",
  description: "A Team of AI Powered River-cleaning robots that will work 24/7, collect waste, purify water, protect aquatic life, and send real-time environmental data to a national monitoring network. Charges in seconds — it just needs a battery swap which the docking station will do. In 5 years, a team of 500 Bots can make our Yamuna the Cleanest River in INDIA.",
  launchQuarter: "August 2026",
  status: "Prototype Phase",
  stage: "Prototype",
  images: [aquaPurifier1, aquaPurifier2],
  impact: "In 5 Years our polluted rivers can be crystal clear | Goal: Restore our water bodies",
  features: ["AI Vision + Sensors", "AI Drones (5/dock)", "National Dashboard", "Multi-Pollution Filtration"],
  progress: 6,
  budget: "₹10Cr - ₹1000Cr",
  detailsPath: "/projects/aqua-river-purifier",
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
  stage: "Planning",
  image: "🏙️",
  impact: "Transform 5 cities",
  features: ["Renewable Energy Grid", "AI Traffic", "Smart Waste", "Clean Air"],
  progress: 25,
  budget: "₹100Cr - ₹500Cr"
}, {
  id: 4,
  name: "MedAssist AI",
  tagline: "Democratizing Healthcare with AI",
  description: "AI-powered diagnostic tool that helps rural health workers identify diseases from symptoms and basic tests. Integrating with government health programs for maximum reach.",
  launchQuarter: "Q1 2025",
  status: "Beta Testing",
  stage: "Testing",
  image: "🏥",
  impact: "Serve 100M+ patients",
  features: ["Symptom Analysis", "Offline Mode", "Multi-language", "Doctor Connect"],
  progress: 80,
  budget: "₹15Cr - ₹75Cr"
}];

// Completed Projects Data
const completedProjects = [{
  id: 101,
  name: "ASIREX AI Assistant",
  tagline: "Internal AI-Powered Productivity Tool",
  category: "AI",
  icon: "🤖",
  description: "Internal AI-powered assistant for team productivity, document analysis, and automated workflows. Built with cutting-edge natural language processing.",
  completedDate: "March 2024",
  impact: "50% increase in team productivity",
  features: ["Natural Language Processing", "Document Analysis", "Workflow Automation", "Smart Scheduling"],
  techStack: ["Python", "TensorFlow", "FastAPI", "React"],
  highlights: [
    { title: "Documents Processed", value: "10,000+" },
    { title: "Tasks Automated", value: "500+" },
    { title: "Time Saved", value: "200+ hrs/month" }
  ]
}, {
  id: 102,
  name: "RoboCore Control Suite",
  tagline: "Modular Robotics Control System",
  category: "Robotics",
  icon: "⚙️",
  description: "Modular robotics control system for autonomous navigation, sensor fusion, and real-time decision making. Powers all ASIREX robotic systems.",
  completedDate: "January 2024",
  impact: "Powers 15+ robotic systems",
  features: ["Autonomous Navigation", "Sensor Fusion", "Real-time Control", "Modular Architecture"],
  techStack: ["C++", "ROS2", "Python", "CUDA"],
  highlights: [
    { title: "Response Time", value: "<10ms" },
    { title: "Sensor Support", value: "50+ types" },
    { title: "Accuracy", value: "99.7%" }
  ]
}, {
  id: 103,
  name: "EcoSense Monitor",
  tagline: "IoT Environmental Monitoring",
  category: "Environment",
  icon: "🌍",
  description: "IoT-based environmental monitoring system for air quality, temperature, and pollution tracking. Deployed across multiple cities for real-time environmental data.",
  completedDate: "November 2023",
  impact: "Monitoring 25+ locations",
  features: ["Air Quality Index", "Temperature Monitoring", "Pollution Alerts", "Data Analytics"],
  techStack: ["IoT Sensors", "AWS IoT", "Node.js", "React"],
  highlights: [
    { title: "Data Points/Day", value: "1M+" },
    { title: "Locations", value: "25+" },
    { title: "Uptime", value: "99.9%" }
  ]
}, {
  id: 104,
  name: "ASIREX Cloud Platform",
  tagline: "Scalable Cloud Infrastructure",
  category: "Tech",
  icon: "💻",
  description: "Scalable cloud infrastructure powering all ASIREX services, APIs, and data processing pipelines. Built for reliability and performance.",
  completedDate: "August 2023",
  impact: "99.99% uptime achieved",
  features: ["Auto-scaling", "Load Balancing", "Data Pipelines", "API Gateway"],
  techStack: ["Kubernetes", "Docker", "PostgreSQL", "Redis"],
  highlights: [
    { title: "API Requests/Day", value: "5M+" },
    { title: "Uptime", value: "99.99%" },
    { title: "Services", value: "20+" }
  ]
}, {
  id: 105,
  name: "ClimatePredict AI",
  tagline: "Climate Pattern Prediction",
  category: "Climate",
  icon: "🌡️",
  description: "Machine learning model for climate pattern prediction and environmental impact assessment. Helps organizations plan for climate change.",
  completedDate: "February 2024",
  impact: "85% prediction accuracy",
  features: ["Weather Forecasting", "Impact Assessment", "Trend Analysis", "Risk Prediction"],
  techStack: ["Python", "PyTorch", "Scikit-learn", "Pandas"],
  highlights: [
    { title: "Accuracy", value: "85%" },
    { title: "Predictions/Day", value: "10,000+" },
    { title: "Data Sources", value: "50+" }
  ]
}, {
  id: 106,
  name: "AgriBot Vision",
  tagline: "Smart Agriculture Computer Vision",
  category: "AgriTech",
  icon: "🌾",
  description: "Computer vision system for crop health monitoring, pest detection, and yield optimization. Helping farmers increase productivity sustainably.",
  completedDate: "December 2023",
  impact: "30% yield improvement",
  features: ["Crop Health Analysis", "Pest Detection", "Yield Prediction", "Disease Identification"],
  techStack: ["Python", "OpenCV", "YOLO", "TensorFlow"],
  highlights: [
    { title: "Crops Analyzed", value: "500K+" },
    { title: "Pest Detection", value: "95% accuracy" },
    { title: "Farmers Helped", value: "1,000+" }
  ]
}];

export default function Projects() {
  type Project = typeof projects[0];
  type CompletedProject = typeof completedProjects[0];
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCompletedProject, setSelectedCompletedProject] = useState<CompletedProject | null>(null);
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

          {/* Projects Grid - New Detailed Layout */}
          <div className="space-y-8">
            {projects.map((project, index) => (
              <motion.div 
                key={project.id} 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="glass-card p-8 lg:p-10 border border-border/50 hover:border-primary/30 transition-colors relative overflow-hidden">
                  {/* Animated Background Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative">
                    <div className="flex flex-col lg:flex-row items-start gap-8">
                      {/* Project Image with Budget */}
                      <div className="flex-shrink-0">
                        {'images' in project && project.images ? (
                          <div className="w-full lg:w-64 h-48 rounded-2xl overflow-hidden">
                            <CyclingProjectImage images={project.images} interval={4000} className="w-full h-full" />
                          </div>
                        ) : (
                          <div className="w-full lg:w-64 h-48 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-7xl">
                            {project.image}
                          </div>
                        )}
                        {/* Budget Badge */}
                        <div className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center">
                          <span className="text-xs text-muted-foreground">Est. Budget</span>
                          <p className="text-sm font-bold text-green-500">{project.budget}</p>
                        </div>
                      </div>

                      <div className="flex-1">
                        {/* Status Badge */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-primary/20 text-primary border border-primary/30">
                            🔧 {project.status}
                          </span>
                          <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted/50 text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {project.launchQuarter}
                          </span>
                        </div>

                        <h3 className="font-display text-2xl lg:text-3xl font-bold mb-2 group-hover:text-accent transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-accent font-medium mb-4">
                          {project.tagline}
                        </p>
                        <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-2">
                          {project.description}
                        </p>

                        {/* Development Stage Buttons */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {['Planning', 'Prototype', 'Development', 'Testing', 'Production'].map((stage) => {
                            const status = getStageStatus(project.stage, stage);
                            return (
                              <span 
                                key={stage}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full border ${
                                  status === 'completed' 
                                    ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                                    : status === 'active'
                                    ? 'bg-primary/20 text-primary border-primary/30 animate-pulse'
                                    : 'bg-muted/30 text-muted-foreground border-border'
                                }`}
                              >
                                {status === 'completed' ? '✓' : status === 'active' ? '◉' : '○'} {stage}
                              </span>
                            );
                          })}
                        </div>

                        {/* Progress */}
                        <div className="mb-6">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Overall Progress</span>
                            <span className="font-bold text-yellow-500">{project.progress}%</span>
                          </div>
                          <div className="h-3 bg-yellow-500/20 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${project.progress}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, delay: 0.3 }}
                              className="h-full bg-yellow-500 rounded-full"
                            />
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
                          <Button 
                            variant="hero" 
                            size="sm"
                            className="group-hover:scale-105 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation();
                              if ('detailsPath' in project && project.detailsPath) {
                                navigate(project.detailsPath);
                              } else {
                                setSelectedProject(project);
                              }
                            }}
                          >
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Completed Projects Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium text-green-500">Production Ready</span>
              </motion.div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Completed <span className="gradient-text">Projects</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Projects we've successfully delivered and are now in production.
              </p>
            </div>

            <div className="space-y-6">
              {completedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedCompletedProject(project)}
                >
                  <div className="glass-card p-8 lg:p-10 border border-green-500/20 hover:border-green-500/40 transition-colors relative overflow-hidden">
                    {/* Animated Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative">
                      <div className="flex flex-col lg:flex-row items-start gap-8">
                        {/* Project Icon/Banner */}
                        <div className="flex-shrink-0">
                          <div className="w-full lg:w-64 h-48 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center text-7xl border border-green-500/20">
                            {project.icon}
                          </div>
                          {/* Completed Badge */}
                          <div className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-center">
                            <span className="text-xs text-muted-foreground">Completed</span>
                            <p className="text-sm font-bold text-green-500">{project.completedDate}</p>
                          </div>
                        </div>

                        <div className="flex-1">
                          {/* Status Badge */}
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-green-500/20 text-green-500 border border-green-500/30">
                              ✓ Production
                            </span>
                            <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted/50 text-muted-foreground">
                              {project.category}
                            </span>
                          </div>

                          <h3 className="font-display text-2xl lg:text-3xl font-bold mb-2 group-hover:text-green-400 transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-green-400 font-medium mb-4">
                            {project.tagline}
                          </p>
                          <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-2">
                            {project.description}
                          </p>

                          {/* All Stages Complete */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            {['Planning', 'Prototype', 'Development', 'Testing', 'Production'].map((stage) => (
                              <span 
                                key={stage}
                                className="px-3 py-1.5 text-xs font-medium rounded-full bg-green-500/20 text-green-500 border border-green-500/30"
                              >
                                ✓ {stage}
                              </span>
                            ))}
                          </div>

                          {/* Progress - 100% */}
                          <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Project Status</span>
                              <span className="font-bold text-green-500">100% Complete</span>
                            </div>
                            <div className="h-3 bg-green-500/20 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: "100%" }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.5, delay: 0.3 }}
                                className="h-full bg-green-500 rounded-full"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Impact: <span className="text-foreground font-medium">{project.impact}</span>
                            </span>
                            <Button 
                              variant="glass" 
                              size="sm"
                              className="group-hover:bg-green-500 group-hover:text-white transition-colors"
                            >
                              View Details
                              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
                  <p className="text-2xl font-bold gradient-text mb-4">
                    {selectedProject.impact}
                  </p>
                  <Button 
                    variant="glass" 
                    size="sm"
                    onClick={() => navigate('/projects/aqua-river-purifier')}
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
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

      {/* Completed Project Detail Modal */}
      <Dialog open={!!selectedCompletedProject} onOpenChange={() => setSelectedCompletedProject(null)}>
        <DialogContent className="max-w-3xl glass-card border-green-500/30 max-h-[90vh] overflow-y-auto">
          {selectedCompletedProject && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-5xl border border-green-500/30">
                    {selectedCompletedProject.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-500 border border-green-500/30">
                        ✓ Production
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {selectedCompletedProject.category}
                      </span>
                    </div>
                    <DialogTitle className="font-display text-2xl lg:text-3xl">
                      {selectedCompletedProject.name}
                    </DialogTitle>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <p className="text-lg text-green-400 font-medium">
                  {selectedCompletedProject.tagline}
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  {selectedCompletedProject.description}
                </p>

                {/* Key Highlights */}
                <div>
                  <h4 className="font-display font-semibold mb-4">Key Highlights</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedCompletedProject.highlights.map((highlight, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card p-4 text-center bg-green-500/5 border border-green-500/20"
                      >
                        <p className="text-2xl font-bold text-green-500">{highlight.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{highlight.title}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-display font-semibold mb-3">Key Features</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {selectedCompletedProject.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <h4 className="font-display font-semibold mb-3">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompletedProject.techStack.map((tech) => (
                      <span 
                        key={tech} 
                        className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted/50 text-muted-foreground border border-border"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Impact & Completion */}
                <div className="glass-card p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-display font-semibold mb-1">Project Impact</h4>
                      <p className="text-xl font-bold text-green-500">
                        {selectedCompletedProject.impact}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-lg font-bold text-foreground">{selectedCompletedProject.completedDate}</p>
                    </div>
                  </div>
                  
                  {/* 100% Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-bold text-green-500">100% Complete</span>
                    </div>
                    <div className="h-3 bg-green-500/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1 }}
                        className="h-full bg-green-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>;
}