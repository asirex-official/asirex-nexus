import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { Globe, MapPin, Truck, Headphones, Clock, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Truck,
    title: "Nationwide Shipping",
    description: "Fast and reliable delivery across all states and union territories of India."
  },
  {
    icon: Headphones,
    title: "Local Support Centers",
    description: "Dedicated customer support teams in major cities for quick assistance."
  },
  {
    icon: Clock,
    title: "Express Delivery",
    description: "Priority shipping options for urgent orders with real-time tracking."
  },
  {
    icon: Shield,
    title: "Secure Packaging",
    description: "Premium packaging to ensure your products arrive in perfect condition."
  }
];

const cities = [
  "Delhi NCR", "Mumbai", "Bangalore", "Chennai", 
  "Hyderabad", "Kolkata", "Pune", "Ahmedabad",
  "Jaipur", "Lucknow", "Chandigarh", "Kochi"
];

export default function GlobalDeliveryPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-background to-background" />
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
              className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-secondary to-primary p-1"
            >
              <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                <Globe className="w-12 h-12 text-secondary" />
              </div>
            </motion.div>
            
            <h1 className="font-display text-5xl lg:text-7xl font-black mb-6">
              Global <span className="gradient-text">Delivery</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Worldwide shipping with local support centers across India. 
              We bring cutting-edge technology to your doorstep, no matter where you are.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button asChild variant="hero" size="lg">
                <Link to="/shop">
                  Browse Products
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">Contact Us</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl lg:text-5xl font-black mb-4">
              Our <span className="gradient-text">Services</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Comprehensive delivery and support services designed for your convenience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 rounded-3xl group hover:border-secondary/50 transition-colors"
              >
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-primary p-0.5 flex-shrink-0">
                    <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold mb-2 group-hover:text-secondary transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground">{service.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Map Section */}
      <section className="py-28 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <MapPin className="w-16 h-16 mx-auto mb-8 text-secondary" />
            <h2 className="font-display text-4xl lg:text-5xl font-black mb-4">
              Support Centers <span className="gradient-text">Across India</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our network of support centers ensures you're never far from expert assistance.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cities.map((city, index) => (
              <motion.div
                key={city}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4 rounded-2xl text-center"
              >
                <MapPin className="w-5 h-5 mx-auto mb-2 text-secondary" />
                <span className="font-medium">{city}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise Section */}
      <section className="py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="font-display text-4xl lg:text-5xl font-black mb-6">
              Our <span className="gradient-text">Promise</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              We understand that receiving your order is just the beginning. Our commitment 
              extends beyond delivery—we provide ongoing support, warranty services, and 
              expert guidance to ensure you get the most out of your ASIREX products.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/shop">Shop Now</Link>
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