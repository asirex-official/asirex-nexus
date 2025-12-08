import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { 
  Droplets, 
  Cpu, 
  Zap, 
  Shield, 
  Wifi, 
  Battery, 
  Bot, 
  Plane,
  Building2,
  Target,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Beaker,
  Wrench,
  Package,
  ClipboardList,
  FlaskConical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import aquaPurifier1 from "@/assets/aqua-purifier-1.png";
import aquaPurifier2 from "@/assets/aqua-purifier-2.png";

const developmentStages = [
  { name: "Planning", icon: ClipboardList, status: "completed" },
  { name: "Prototype", icon: Beaker, status: "in-progress" },
  { name: "Development", icon: Wrench, status: "upcoming" },
  { name: "Testing", icon: FlaskConical, status: "upcoming" },
  { name: "Production", icon: Package, status: "upcoming" },
];

const technicalSpecs = [
  { label: "Hull Material", value: "Carbon-Fiber Waterproof Body" },
  { label: "Controller", value: "Raspberry Pi 5" },
  { label: "Power", value: "Dual Swappable Li-ion Batteries" },
  { label: "Propulsion", value: "BLDC Thrusters" },
  { label: "Sensors", value: "Sonar, LiDAR, Stereo Cameras, IMU" },
  { label: "Connectivity", value: "5G / Wi-Fi 6" },
  { label: "Target Units", value: "1,000+ Bots" },
  { label: "Price Target", value: "₹10 Lakh per unit" },
];

const features = [
  {
    icon: Droplets,
    title: "Autonomous River Patrol",
    description: "24/7 autonomous operation with intelligent route optimization and obstacle avoidance."
  },
  {
    icon: Cpu,
    title: "AI-Powered Detection",
    description: "Advanced computer vision for real-time pollution detection and classification."
  },
  {
    icon: Shield,
    title: "Multi-Layer Purification",
    description: "Removes plastics, metals, oils, chemicals, micro-waste, bacteria, and silt."
  },
  {
    icon: Battery,
    title: "Smart Charging",
    description: "Fast charging and battery swapping at intelligent docking stations."
  },
  {
    icon: Bot,
    title: "Rescue Bots",
    description: "2 rescue bots per dock for automated maintenance and emergency towing."
  },
  {
    icon: Plane,
    title: "AI Drones",
    description: "5 drones per dock for aerial pollution mapping and real-time surveillance."
  },
];

const impactMetrics = [
  { label: "Rivers to Restore", value: "5", suffix: "Major Rivers" },
  { label: "Timeline", value: "3-5", suffix: "Years" },
  { label: "Target Fleet", value: "500+", suffix: "Bots" },
  { label: "Coverage", value: "National", suffix: "Scale" },
];

export default function AquaRiverPurifier() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/projects">
            <Button variant="ghost" className="mb-8 group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Projects
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-6">
              Flagship Project • Prototype Phase
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-accent to-primary bg-clip-text text-transparent">
              Aqua River Purifier
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              India's first AI-powered autonomous water purification system designed to restore our sacred rivers. 
              A fleet of intelligent bots working 24/7 to remove pollution and protect aquatic ecosystems.
            </p>
            
            {/* Progress */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Development Progress</span>
                  <span className="text-accent font-semibold">6%</span>
                </div>
                <Progress value={6} className="h-2" />
              </div>
              <div className="px-6 py-3 bg-accent/10 rounded-xl border border-accent/20">
                <span className="text-accent font-semibold">Launch: August 2026</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Development Stages */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Development Stages</h2>
            <p className="text-muted-foreground">Track our progress from concept to production</p>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {developmentStages.map((stage, index) => (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant={stage.status === "completed" ? "default" : stage.status === "in-progress" ? "outline" : "ghost"}
                  className={`
                    relative px-6 py-3 h-auto flex items-center gap-3
                    ${stage.status === "completed" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                    ${stage.status === "in-progress" ? "border-accent text-accent animate-pulse" : ""}
                    ${stage.status === "upcoming" ? "text-muted-foreground" : ""}
                  `}
                >
                  {stage.status === "completed" && (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {stage.status !== "completed" && (
                    <stage.icon className="w-4 h-4" />
                  )}
                  {stage.name}
                  {stage.status === "in-progress" && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping" />
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Revolutionary Design</h2>
              <p className="text-muted-foreground leading-relaxed">
                The Aqua River Purifier combines cutting-edge robotics with AI-powered intelligence 
                to create the world's most advanced autonomous water cleaning system. Each bot is 
                engineered for maximum efficiency and durability in harsh river environments.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {impactMetrics.map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-card rounded-xl border border-border"
                  >
                    <div className="text-2xl font-bold text-accent">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.suffix}</div>
                    <div className="text-xs text-muted-foreground/70">{metric.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              <img 
                src={aquaPurifier1} 
                alt="Aqua River Purifier Design 1" 
                className="rounded-2xl w-full h-48 object-cover shadow-lg shadow-accent/20"
              />
              <img 
                src={aquaPurifier2} 
                alt="Aqua River Purifier Design 2" 
                className="rounded-2xl w-full h-48 object-cover shadow-lg shadow-primary/20 mt-8"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Technical Specifications</h2>
            <p className="text-muted-foreground">Built with cutting-edge technology for maximum performance</p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4">
            {technicalSpecs.map((spec, index) => (
              <motion.div
                key={spec.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-accent/50 transition-colors"
              >
                <span className="text-muted-foreground">{spec.label}</span>
                <span className="font-semibold text-foreground">{spec.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground">Advanced capabilities for comprehensive river restoration</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-card rounded-2xl border border-border hover:border-accent/50 transition-all group"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* System Architecture */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">System Architecture</h2>
            <p className="text-muted-foreground">A complete ecosystem for river restoration</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-card to-accent/5 rounded-2xl border border-border text-center"
            >
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Purifier Bots</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Autonomous robots that patrol rivers, detect pollution, and perform multi-layer purification 24/7.
              </p>
              <div className="text-3xl font-bold text-accent">1,000+</div>
              <div className="text-sm text-muted-foreground">Target Fleet Size</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-gradient-to-br from-card to-primary/5 rounded-2xl border border-border text-center"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Docking Stations</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Intelligent hubs for charging, waste storage, auto-cleaning, and health diagnostics.
              </p>
              <div className="text-3xl font-bold text-primary">High-Performance</div>
              <div className="text-sm text-muted-foreground">Server Infrastructure</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-gradient-to-br from-card to-green-500/5 rounded-2xl border border-border text-center"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Cpu className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Central AI System</h3>
              <p className="text-muted-foreground text-sm mb-4">
                The brain managing the entire network with route optimization and predictive maintenance.
              </p>
              <div className="text-3xl font-bold text-green-500">Real-Time</div>
              <div className="text-sm text-muted-foreground">National Dashboard</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Target Rivers */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Rivers We'll Restore</h2>
            <p className="text-muted-foreground">Our mission to clean India's sacred waterways</p>
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {["Ganga", "Yamuna", "Godavari", "Narmada", "Krishna"].map((river, index) => (
              <motion.div
                key={river}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="px-8 py-4 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full border border-accent/30"
              >
                <span className="text-lg font-semibold">{river}</span>
              </motion.div>
            ))}
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-muted-foreground mt-8 max-w-2xl mx-auto"
          >
            With a fleet of 500 bots, we can make the Yamuna the cleanest river in India within 5 years.
            Our vision is to create the world's smartest AI environmental protection system.
          </motion.p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">Support This Project</h2>
            <p className="text-muted-foreground mb-8">
              Help us build India's future. Your support can accelerate the development of this 
              revolutionary technology and bring clean water to millions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/projects">
                <Button variant="outline" size="lg">
                  <Target className="w-4 h-4 mr-2" />
                  View All Projects
                </Button>
              </Link>
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                <Zap className="w-4 h-4 mr-2" />
                Support Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
