import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { 
  Droplets, 
  Bot, 
  Cpu, 
  Battery, 
  Wifi, 
  Shield, 
  Fish, 
  BarChart3, 
  Wrench,
  Plane,
  Server,
  Magnet,
  Radio,
  Camera,
  Gauge,
  ChevronRight,
  CheckCircle2,
  Target,
  TrendingUp,
  Building2,
  Leaf,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import aquaPurifier1 from "@/assets/aqua-purifier-1.png";
import aquaPurifier2 from "@/assets/aqua-purifier-2.png";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function AquaRiverPurifier() {
  const navigate = useNavigate();

  const systemComponents = [
    {
      title: "Main Purifier Bots",
      icon: Bot,
      quantity: "1,000 units",
      description: "Carbon-fiber autonomous cleaning units with 24/7 operation capability",
      features: [
        "Raspberry Pi 5 + microcontroller",
        "High-torque BLDC thrusters with 360° maneuverability",
        "Dual hot-swappable Li-ion battery packs",
        "Sonar, lidar, stereo cameras",
        "Multi-sieve separator & magnetic separator",
        "Surface oil skimmer",
        "5G / Wi-Fi 6 / LoRa connectivity"
      ]
    },
    {
      title: "Dock Stations",
      icon: Server,
      quantity: "AI Control Hub",
      description: "Mini data center and charging station with high-performance computing",
      features: [
        "Threadripper/EPYC + GPUs",
        "Route optimization AI",
        "Multi-bot coordination",
        "Object recognition at high accuracy",
        "Predictive maintenance",
        "Fast charging infrastructure",
        "Data storage and lake history"
      ]
    },
    {
      title: "Rescue Bots",
      icon: Wrench,
      quantity: "2 per dock",
      description: "Automated maintenance and recovery units for in-water support",
      features: [
        "Locate stuck/damaged bots",
        "Tow disabled bots to dock",
        "Swap batteries in water",
        "Clear jammed propellers",
        "Remove large debris",
        "Report issues to server"
      ]
    },
    {
      title: "AI Drones",
      icon: Plane,
      quantity: "5 per dock",
      description: "Aerial surveillance and mapping units for comprehensive coverage",
      features: [
        "Aerial lake/river mapping",
        "Trash cluster detection",
        "Oil patch identification",
        "Performance monitoring",
        "Live video streaming",
        "Environmental data collection"
      ]
    }
  ];

  const keyFeatures = [
    {
      icon: Droplets,
      title: "Autonomous Cleaning",
      description: "Bots automatically patrol assigned zones, collecting floating plastic, trash, organic debris, and skimming surface oil."
    },
    {
      icon: Fish,
      title: "Aquatic Life Protection",
      description: "Advanced sonar and AI pathfinding to avoid fish and aquatic plants. Safe operating modes around wildlife with no harmful suction."
    },
    {
      icon: Cpu,
      title: "Centralized AI Control",
      description: "Dock server coordinates all bots and drones with real-time route updates based on pollution density."
    },
    {
      icon: Wrench,
      title: "Rescue Automation",
      description: "Automatic fault detection with rescue bots dispatched without human intervention. Only complex cases escalate to technicians."
    },
    {
      icon: BarChart3,
      title: "Monitoring & Analytics",
      description: "Continuous logging of trash collected, metal recovered, oil removed, with dashboards showing environmental impact."
    },
    {
      icon: Battery,
      title: "24/7 Operation",
      description: "Fast charging and swappable battery packs enable round-the-clock cleaning without downtime."
    }
  ];

  const targetCustomers = [
    { icon: Building2, label: "Government Agencies" },
    { icon: Target, label: "Smart City Projects" },
    { icon: Leaf, label: "Environmental Missions" },
    { icon: TrendingUp, label: "Private Facilities" }
  ];

  const specs = [
    { label: "Body Material", value: "Carbon-fiber / Composite" },
    { label: "Operation", value: "24/7 Duty Cycle" },
    { label: "Controller", value: "Raspberry Pi 5 + MCU" },
    { label: "Motors", value: "High-torque BLDC" },
    { label: "Power", value: "Dual Li-ion Packs" },
    { label: "Connectivity", value: "5G / Wi-Fi 6 / LoRa" },
    { label: "Navigation", value: "Sonar + Lidar + Stereo Cameras" },
    { label: "Waterproofing", value: "Fully Sealed IP68" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate('/projects')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Flagship Project</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                <span className="gradient-text">Aqua Purifier</span>
                <br />
                <span className="text-foreground/80">India Lakes Module</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                An autonomous robotic system designed to continuously clean polluted lakes and rivers 
                by removing plastics, metals, floating debris, and surface oil while protecting aquatic life.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                {targetCustomers.map((customer, index) => (
                  <motion.div
                    key={customer.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card/50 border border-border/50"
                  >
                    <customer.icon className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground/80">{customer.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button variant="glow" size="lg">
                  Request Demo
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="glass" size="lg">
                  Download Specs
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-sm">
                <img 
                  src={aquaPurifier1} 
                  alt="Aqua Purifier Bot" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-xl overflow-hidden border border-border/50 shadow-2xl">
                <img 
                  src={aquaPurifier2} 
                  alt="Aqua Purifier Detail" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Purpose Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Core Purpose</h2>
            <p className="text-muted-foreground text-lg">
              Combining fleets of cleaning bots, rescue units, drones, and AI-powered dock stations 
              to deliver 24/7, data-driven water body management.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Droplets, title: "Remove Plastics & Debris", description: "Efficiently collect floating plastics, metals, and organic debris" },
              { icon: Gauge, title: "Treat Oil Layers", description: "Skim and treat surface oil layers with specialized separators" },
              { icon: Fish, title: "Protect Aquatic Life", description: "Safe operation around fish and aquatic plants" },
              { icon: Battery, title: "24/7 Operation", description: "Fast charging and centralized AI coordination" }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                className="p-6 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* System Architecture Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">System Architecture</h2>
            <p className="text-muted-foreground text-lg">
              A comprehensive ecosystem of autonomous units working in perfect harmony
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {systemComponents.map((component, index) => (
              <motion.div
                key={component.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <component.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{component.title}</h3>
                    <span className="text-sm text-primary font-medium">{component.quantity}</span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">{component.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {component.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-foreground/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Key Features</h2>
            <p className="text-muted-foreground text-lg">
              Advanced capabilities designed for maximum efficiency and environmental protection
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Technical Specifications</h2>
              <p className="text-muted-foreground mb-8">
                Each bot operates as a robust, waterproof, carbon-fiber unit with advanced sensors 
                and mechanical separation systems, coordinated by a central AI server at the dock.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {specs.map((spec, index) => (
                  <motion.div
                    key={spec.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-xl bg-card/50 border border-border/50"
                  >
                    <p className="text-xs text-muted-foreground mb-1">{spec.label}</p>
                    <p className="font-semibold text-foreground">{spec.value}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative p-8 rounded-3xl bg-card/80 border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Sensor Array</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    { icon: Radio, label: "Sonar and lidar for obstacle avoidance" },
                    { icon: Fish, label: "Ultrasonic array for aquatic life detection" },
                    { icon: Camera, label: "Stereo cameras for trash detection" },
                    { icon: Gauge, label: "IMU/gyroscope for stability" },
                    { icon: Magnet, label: "Magnetic separator for metals" }
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground/80">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Government Grade Solution</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Cost-Effective Environmental Protection
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8">
              At an estimated sale price of <span className="text-primary font-bold">₹10 Lakh per unit</span>, 
              the solution is cost-effective compared to traditional manual operations and machinery. 
              It reduces long-term labor costs, increases recycling revenue, and provides transparent 
              environmental impact data to municipalities and agencies.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { title: "24/7 Operation", description: "One bot replaces multiple manual workers and traditional boats" },
                { title: "Reduced Costs", description: "Lower recurring manual labor and equipment rental costs" },
                { title: "Data-Driven", description: "Transparent environmental impact statistics and reporting" }
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-background/50 border border-border/50"
                >
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="glow" size="lg">
                Request Government Quote
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="glass" size="lg">
                Download Pilot Proposal
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compatible Programs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Compatible Programs</h2>
            <p className="text-muted-foreground text-lg">
              Fits seamlessly with existing government initiatives and funding programs
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Smart City Missions",
              "River Cleaning Programs",
              "Urban Lake Rejuvenation",
              "CSR Funding",
              "Environmental Missions"
            ].map((program, index) => (
              <motion.div
                key={program}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium"
              >
                {program}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-card/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Water Management?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              After a successful prototype and pilot demonstration, this system can be deployed 
              across urban lakes and river segments as a scalable, government-grade solution 
              for water pollution control.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="glow" size="lg">
                Schedule a Demo
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="glass" size="lg" onClick={() => navigate('/about')}>
                Contact Our Team
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
