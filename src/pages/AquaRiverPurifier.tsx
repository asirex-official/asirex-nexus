import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { useState } from "react";
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
  FlaskConical,
  Eye,
  Satellite,
  LayoutDashboard,
  Gem,
  Settings,
  Anchor,
  Brain,
  Smartphone,
  Bell,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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

const keyFeatures = [
  { icon: Eye, label: "AI Vision + Sensors" },
  { icon: Satellite, label: "AI Drones (5/dock)" },
  { icon: LayoutDashboard, label: "National Dashboard" },
  { icon: Shield, label: "Multi-Pollution Filtration" },
];

const detailedOverview = [
  {
    emoji: "⚙️",
    title: "How It Works",
    description: "Bots patrol rivers automatically, detect trash/oil/plastics/metals/toxic hotspots using AI vision + sensors, collect waste onboard with modules for each pollution type, release purified water back, and upload data to central server. Support units (drones + rescue bots) assist continuously."
  },
  {
    emoji: "🧪",
    title: "Pollution Removal Technologies",
    description: "Floating Plastics → Robotic arms + intake conveyor | Metallic Waste → Magnetic separator | Oil & Chemical Films → Eco-friendly enzyme dispersant jets | Micro-Waste & Bacteria → Multi-stage filter + UV treatment | Aquatic life detection ensures fish/wildlife safety."
  },
  {
    emoji: "🚢",
    title: "Smart Docking Stations",
    description: "AI-enabled stations recharge bots (solar + grid), store waste in separate bins (plastics/metals/toxic), auto-empty & clean bots, run health checks, upload data logs. Stations act as charging and maintenance homes for the fleet."
  },
  {
    emoji: "🤖",
    title: "Rescue Bots",
    description: "2 per dock - help stuck/damaged bots, replace/boost batteries, free blocked propellers, tow broken bots, perform emergency repairs. Ensures zero downtime across the entire fleet."
  },
  {
    emoji: "🛰️",
    title: "AI Drones",
    description: "5 per dock - scan for pollution zones, create real-time pollution maps, track cleaning progress, capture evidence for government reporting, redirect bots to hotspots instantly."
  },
  {
    emoji: "🧠",
    title: "Central Intelligence System",
    description: "Learns pollution patterns, plans optimal routes, predicts environmental damage, auto-increases bots where needed, alerts humans only when required. System gets smarter over time."
  },
  {
    emoji: "📲",
    title: "National Dashboard",
    description: "Live river map, water health ratings, progress stats, device monitoring, government transparency. India watches rivers recover in real time."
  },
  {
    emoji: "💎",
    title: "Vision",
    description: "Build the world's smartest AI Environmental Protection System and make India a global leader in clean-water robotics."
  },
];

export default function AquaRiverPurifier() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleNotifyMe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already subscribed!",
            description: "You're already on the notification list.",
          });
        } else {
          throw error;
        }
      } else {
        setIsSubscribed(true);
        toast({
          title: "You're on the list!",
          description: "We'll notify you when Aqua River Purifier launches.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* New Hero Section with Key Features */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-b from-primary/20 via-accent/10 to-background">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center items-center gap-4 mb-6"
            >
              <span className="px-4 py-1.5 bg-accent/20 text-accent rounded-full text-sm font-medium">
                Prototype Phase
              </span>
              <span className="px-4 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium">
                August 2026
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-accent to-primary bg-clip-text text-transparent"
            >
              Aqua River Purifier
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-accent font-semibold mb-6"
            >
              India's First Fully Autonomous AI River Cleaning Ecosystem
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-lg md:text-xl mb-8 leading-relaxed max-w-3xl mx-auto"
            >
              A Team of AI Powered River-cleaning robots that will work 24/7, collect waste, purify water, 
              protect aquatic life, and send real-time environmental data to a national monitoring network. 
              Charges in seconds — it just needs a battery swap which the docking station will do. In 5 years, 
              a team of 500 Bots can make our Yamuna the Cleanest River in INDIA.
            </motion.p>

            {/* Key Features Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-10"
            >
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Key Features</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {keyFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-border/50 hover:border-accent/50 transition-colors"
                  >
                    <feature.icon className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Detailed Overview Section */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Detailed Overview</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {detailedOverview.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-6 bg-card rounded-2xl border border-border hover:border-accent/50 transition-all group"
              >
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="text-lg font-semibold mb-3 group-hover:text-accent transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projected Impact Section */}
      <section className="py-16 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Projected Impact</h2>
            <p className="text-xl text-muted-foreground mb-8">
              In 5 Years our polluted rivers can be crystal clear | <span className="text-accent font-semibold">Goal: Restore our water bodies</span>
            </p>
            
            {/* Learn More Button */}
            <a 
              href="#learn-more" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('learn-more')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90">
                Learn More
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Get Notified on Launch</h2>
            
            {isSubscribed ? (
              <div className="flex items-center justify-center gap-2 text-green-500">
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-lg font-medium">You're on the list!</span>
              </div>
            ) : (
              <form onSubmit={handleNotifyMe} className="flex gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-2" />
                      Notify Me
                    </>
                  )}
                </Button>
              </form>
            )}

            <Link to="/projects" className="inline-block mt-6">
              <Button variant="ghost" className="group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Projects
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Learn More Section */}
      <section id="learn-more" className="relative pt-20 pb-16 overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl"
          >
            <span className="inline-block px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium mb-6">
              Flagship Project • Prototype Phase
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-accent to-primary bg-clip-text text-transparent">
              Aqua River Purifier
            </h2>
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
              <Link to="/support-us">
                <Button size="lg" className="bg-accent hover:bg-accent/90">
                  <Zap className="w-4 h-4 mr-2" />
                  Support Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
