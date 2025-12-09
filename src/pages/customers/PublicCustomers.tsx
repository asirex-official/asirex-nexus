import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Users, ShoppingBag, Heart, Star, Shield, Zap, Gift, Smile, ArrowRight, CheckCircle, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const products = [
  {
    name: "Spy Earpieces",
    price: "₹999 - ₹2,999",
    description: "Ultra-discreet wireless earpieces for exams, interviews, and more",
    features: ["Bluetooth 5.0", "10hr battery", "Invisible design"]
  },
  {
    name: "Decorative Items",
    price: "₹199 - ₹999",
    description: "Beautiful tech-inspired home décor and accessories",
    features: ["LED accents", "Premium materials", "Unique designs"]
  },
  {
    name: "Daily Essentials",
    price: "₹99 - ₹499",
    description: "Smart everyday gadgets that make life easier",
    features: ["USB powered", "Portable", "Durable"]
  }
];

const benefits = [
  { icon: IndianRupee, title: "Affordable Prices", desc: "Quality tech at middle-class friendly prices" },
  { icon: Shield, title: "Quality Assured", desc: "Every product tested before shipping" },
  { icon: Zap, title: "Fast Delivery", desc: "Quick shipping across India" },
  { icon: Heart, title: "Support a Dream", desc: "Your purchase funds our big projects" }
];

const testimonials = [
  { name: "Rahul K.", location: "Delhi", text: "Amazing quality at such low prices! The earpiece saved me during my interview." },
  { name: "Priya M.", location: "Mumbai", text: "Love supporting Indian startups. Products are genuinely good!" },
  { name: "Amit S.", location: "Bangalore", text: "Fast delivery and great customer service. Will buy again!" }
];

export default function PublicCustomers() {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-primary/5 to-transparent" />
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm font-medium text-blue-400">
                <Users className="w-4 h-4" />
                For Normal Public
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="font-display text-4xl lg:text-6xl font-bold mb-8 leading-tight"
            >
              Affordable Tech for <span className="gradient-text">Everyone</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Premium quality gadgets and accessories at prices that won't break the bank. 
              Made in India, for India's middle class.
            </motion.p>

            <motion.div variants={itemVariants}>
              <Button size="lg" asChild>
                <Link to="/shop">
                  <ShoppingBag className="w-5 h-5 mr-2" /> Browse Products
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              What We <span className="gradient-text">Offer You</span>
            </h2>
            <p className="text-muted-foreground text-lg">Quality products at honest prices</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {products.map((product, i) => (
              <motion.div
                key={product.name}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card p-6 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display text-xl font-semibold">{product.name}</h3>
                  <span className="text-primary font-bold">{product.price}</span>
                </div>
                <p className="text-muted-foreground mb-4">{product.description}</p>
                <ul className="space-y-2">
                  {product.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="glass" size="sm" className="mt-4 w-full group-hover:bg-primary group-hover:text-primary-foreground">
                  View Products <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Buy From Us */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Why Buy <span className="gradient-text">From Us</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-card p-6 text-center"
              >
                <benefit.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              What Our <span className="gradient-text">Customers Say</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                <div className="text-sm">
                  <span className="font-semibold">{testimonial.name}</span>
                  <span className="text-muted-foreground"> • {testimonial.location}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-primary/10 to-blue-500/10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Smile className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-6">
              Ready to Shop <span className="gradient-text">Smart</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of happy customers who've discovered quality at affordable prices.
            </p>
            <Button size="lg" asChild>
              <Link to="/shop">
                <Gift className="w-5 h-5 mr-2" /> Start Shopping
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}