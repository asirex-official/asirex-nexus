import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Package, Truck, MapPin, Shield, Heart, Zap, CheckCircle, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ProductsShipped() {
  const deliveryFeatures = [
    {
      icon: Truck,
      title: "Pan-India Delivery",
      description: "We deliver to every corner of India, from metropolitan cities to remote villages, ensuring technology reaches everyone."
    },
    {
      icon: Shield,
      title: "Secure Packaging",
      description: "Every product is packed with premium materials, ensuring it reaches you in perfect condition, every single time."
    },
    {
      icon: Zap,
      title: "Express Shipping",
      description: "Fast-track delivery options available for urgent requirements. Your innovation shouldn't wait."
    },
    {
      icon: Heart,
      title: "Shipped with Love",
      description: "Each package carries our passion for technology and our commitment to India's technological advancement."
    }
  ];

  const impactStats = [
    { value: "28+", label: "States Covered" },
    { value: "500+", label: "Cities Reached" },
    { value: "1000+", label: "Happy Customers" },
    { value: "99.9%", label: "Safe Delivery Rate" }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
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
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 mb-8"
            >
              <Package className="w-12 h-12 text-primary" />
            </motion.div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              <span className="gradient-text">1000+</span> Products Shipped
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Impacting the Whole Nation
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every product we ship carries the promise of innovation, quality, and India's technological future. 
              We're not just delivering products—we're delivering dreams.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {impactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-2xl bg-card/60 border border-border/50"
              >
                <div className="font-display text-3xl md:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              How We <span className="gradient-text">Deliver Excellence</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our commitment to quality extends beyond our products to every step of the delivery process.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {deliveryFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 p-6 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-gradient-to-b from-background via-card/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Globe className="w-16 h-16 text-primary mx-auto mb-8" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Connecting India Through Technology
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              From the bustling streets of Mumbai to the serene valleys of Kashmir, from the tech hubs of Bangalore 
              to the emerging cities of the Northeast—ASIREX products are reaching every Indian who dreams of a 
              technologically advanced future. Every shipment is a step towards Digital India, a promise kept, 
              and a dream delivered.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Quality Assured</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Tracked Delivery</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Customer Support</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
              Be Part of India's Tech Revolution
            </h2>
            <Link to="/shop">
              <Button size="lg" className="gap-2">
                <Package className="w-5 h-5" />
                Explore Our Products
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
