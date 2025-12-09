import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Globe, MapPin, Users, Handshake, Target, ArrowRight, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function CountriesImpacted() {
  const regions = [
    {
      name: "India",
      flag: "🇮🇳",
      status: "Primary Market",
      description: "Our home and primary focus. Every state, every city, every village—ASIREX is committed to transforming India's technological landscape.",
      highlights: ["28+ States Covered", "500+ Cities", "Growing Rural Presence"]
    },
    {
      name: "Laos",
      flag: "🇱🇦",
      status: "Expansion",
      description: "Strategic expansion into Southeast Asia, bringing ASIREX innovation to our neighboring nations.",
      highlights: ["Upcoming Launch Event", "Partnership Discussions", "Market Research Complete"]
    },
    {
      name: "Nepal",
      flag: "🇳🇵",
      status: "Planned",
      description: "Extending our reach to Nepal, sharing technology solutions that address common regional challenges.",
      highlights: ["Partnership Talks", "Clean Tech Focus", "2025 Target"]
    },
    {
      name: "Bangladesh",
      flag: "🇧🇩",
      status: "Planned",
      description: "Planning to bring our water purification and clean energy solutions to Bangladesh.",
      highlights: ["Water Solutions Focus", "Strategic Planning", "2026 Target"]
    }
  ];

  const globalVision = [
    {
      icon: Target,
      title: "Start Local, Think Global",
      description: "Our innovations are designed for India first, but built with global scalability in mind."
    },
    {
      icon: Handshake,
      title: "Strategic Partnerships",
      description: "Collaborating with governments, NGOs, and businesses to maximize our positive impact."
    },
    {
      icon: Users,
      title: "Technology for All",
      description: "Making advanced technology accessible and affordable for developing nations."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-background to-background" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        
        <div className="container mx-auto px-4 relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-500/20 mb-8"
            >
              <Globe className="w-12 h-12 text-blue-500" />
            </motion.div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">15</span> Countries Impacted
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              From India to the World
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              While our heart beats in India, our vision spans continents. We're building technology 
              that transcends borders and creates impact across the developing world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* India Focus */}
      <section className="py-16 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center md:text-left">
            <div className="text-6xl">🇮🇳</div>
            <div>
              <h2 className="font-display text-2xl font-bold mb-2">India First</h2>
              <p className="text-muted-foreground max-w-xl">
                Our primary mission is to transform India into a global technology leader. 
                Every innovation, every product, every project starts with one question: 
                "How does this help India?"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Global Footprint</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Current markets and expansion plans across South and Southeast Asia.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {regions.map((region, index) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{region.flag}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display text-xl font-semibold">{region.name}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        region.status === "Primary Market" 
                          ? "bg-green-500/20 text-green-500"
                          : region.status === "Expansion"
                          ? "bg-blue-500/20 text-blue-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}>
                        {region.status}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{region.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {region.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-20 bg-gradient-to-b from-background via-card/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Global Vision</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {globalVision.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Markets */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Flag className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              The Journey Has Just Begun
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              From 15 countries today to every corner of the developing world tomorrow. Our technology 
              is built to solve universal challenges—clean water, sustainable energy, accessible AI, 
              smart agriculture. These aren't just Indian problems; they're global opportunities.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              As we grow, our impact multiplies. Every new market we enter brings our solutions to 
              millions more lives, proving that innovation born in India can change the world.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/about">
                <Button size="lg" className="gap-2">
                  <Globe className="w-5 h-5" />
                  Learn About Our Vision
                </Button>
              </Link>
              <Link to="/support-us">
                <Button variant="outline" size="lg" className="gap-2">
                  Support Global Expansion
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
