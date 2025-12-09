import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Brain, Cpu, Sparkles, Zap, Target, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const capabilities = [
  {
    icon: Cpu,
    title: "Neural Processing Units",
    description: "Custom-designed AI chips that deliver unprecedented processing power for edge computing and real-time inference."
  },
  {
    icon: Sparkles,
    title: "Intelligent Software Frameworks",
    description: "Comprehensive AI development kits and libraries that accelerate your machine learning projects."
  },
  {
    icon: Target,
    title: "Computer Vision",
    description: "Advanced image recognition and object detection systems for industrial automation and smart surveillance."
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description: "AI-powered forecasting and decision support systems for business intelligence and optimization."
  }
];

const stats = [
  { value: "10x", label: "Faster Processing" },
  { value: "99.9%", label: "Accuracy Rate" },
  { value: "50+", label: "AI Models" },
  { value: "24/7", label: "Real-time Analysis" }
];

export default function AIMLPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="absolute inset-0 dot-grid opacity-20" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-primary to-accent p-1"
            >
              <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                <Brain className="w-12 h-12 text-primary" />
              </div>
            </motion.div>
            
            <h1 className="font-display text-5xl lg:text-7xl font-black mb-6">
              AI & <span className="gradient-text">Machine Learning</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Pioneering the future of artificial intelligence with cutting-edge neural processors, 
              intelligent software frameworks, and transformative AI solutions that redefine what's possible.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button asChild variant="hero" size="lg">
                <Link to="/projects">
                  Explore Our Projects
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/support-us">Support Our Vision</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="font-display text-4xl lg:text-5xl font-black gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl lg:text-5xl font-black mb-4">
              Our <span className="gradient-text">Capabilities</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From neural processing hardware to intelligent software solutions, 
              we're building the AI infrastructure of tomorrow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {capabilities.map((cap, index) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 rounded-3xl group hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent p-0.5 flex-shrink-0">
                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                      <cap.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {cap.title}
                    </h3>
                    <p className="text-muted-foreground">{cap.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-28 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Zap className="w-16 h-16 mx-auto mb-8 text-accent" />
            <h2 className="font-display text-4xl lg:text-5xl font-black mb-6">
              The Future is <span className="gradient-text">Intelligent</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              At ASIREX, we believe AI is not just a technology—it's the key to solving humanity's 
              greatest challenges. From environmental protection to healthcare, from education to 
              industrial automation, our AI solutions are designed to make a real difference in 
              people's lives.
            </p>
            <p className="text-lg text-muted-foreground">
              Join us in building a smarter, more efficient, and sustainable future. 
              Together, we can unlock the full potential of artificial intelligence 
              for the benefit of India and the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-3xl text-center"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-black mb-4">
              Ready to Transform Your Business with AI?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Partner with ASIREX to integrate cutting-edge AI solutions into your operations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/about">Learn More About Us</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/support-us">Support Our Mission</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}