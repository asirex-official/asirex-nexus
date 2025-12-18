import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Heart, Package, Sparkles, Shield, Star, Award, Users, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteStats } from "@/hooks/useSiteData";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerSatisfaction() {
  const { data: siteStats, isLoading } = useSiteStats();

  const satisfactionRate = siteStats?.find(s => s.key === "customer_satisfaction")?.value || 96;
  const happyCustomers = siteStats?.find(s => s.key === "products_shipped")?.value || 1000;

  const satisfactionPillars = [
    {
      icon: Package,
      title: "Premium Packaging",
      description: "Every product is wrapped with care using eco-friendly, premium materials.",
      highlights: ["Eco-friendly materials", "Shock-resistant design", "Beautiful unboxing experience"]
    },
    {
      icon: Sparkles,
      title: "Premium Delivery",
      description: "From our warehouse to your doorstep, we ensure the journey is smooth and trackable.",
      highlights: ["Real-time tracking", "Careful handling", "On-time delivery guarantee"]
    },
    {
      icon: Heart,
      title: "Manufactured with Love",
      description: "Each product goes through rigorous quality checks by our passionate team.",
      highlights: ["Quality-first approach", "Handpicked components", "Tested before shipping"]
    },
    {
      icon: Shield,
      title: "Premium Products",
      description: "Innovation meets reliability. Our products are designed to exceed expectations.",
      highlights: ["Cutting-edge technology", "Durable construction", "Industry-leading warranty"]
    }
  ];

  const testimonials = [
    {
      quote: "The attention to detail in ASIREX products is unmatched. From packaging to performance, everything exceeds expectations.",
      author: "Tech Enthusiast",
      location: "Bangalore"
    },
    {
      quote: "Finally, an Indian company that understands premium quality. The delivery experience was exceptional!",
      author: "Early Adopter",
      location: "Mumbai"
    },
    {
      quote: "ASIREX represents the future of Indian technology. Their commitment to customer satisfaction is inspiring.",
      author: "Innovation Partner",
      location: "Delhi"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-background to-background" />
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
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/20 mb-8"
            >
              <Star className="w-12 h-12 text-accent" />
            </motion.div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              {isLoading ? (
                <Skeleton className="h-16 w-64 mx-auto" />
              ) : (
                <>
                  <span className="gradient-text">{satisfactionRate}%</span> Customer Satisfaction
                </>
              )}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Where Every Customer Becomes Family
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our satisfaction rate isn't just a number—it's a reflection of our relentless commitment 
              to making every interaction meaningful.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-12 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <ThumbsUp className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="font-display text-2xl font-bold">{satisfactionRate}%</div>
              <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="font-display text-2xl font-bold">{happyCustomers}+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="font-display text-2xl font-bold">5★</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              The <span className="gradient-text">ASIREX Promise</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {satisfactionPillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <pillar.icon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold mb-3">{pillar.title}</h3>
                    <p className="text-muted-foreground mb-4">{pillar.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {pillar.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary"
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

      {/* Manufacturing with Love */}
      <section className="py-20 bg-gradient-to-b from-background via-card/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-8" />
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Crafted with Passion, Delivered with Pride
            </h2>
            <p className="text-lg text-muted-foreground">
              At ASIREX, every product starts with a dream and ends with a smile. Our team pours their 
              hearts into every creation. This isn't just business; it's our contribution to India's 
              technological renaissance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl font-bold mb-4">
              What Our <span className="gradient-text">Customers Say</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card/40 border border-border/50"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                <div className="text-sm">
                  <span className="font-semibold">{testimonial.author}</span>
                  <span className="text-muted-foreground"> • {testimonial.location}</span>
                </div>
              </motion.div>
            ))}
          </div>
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
              Experience the ASIREX Difference
            </h2>
            <Link to="/shop">
              <Button size="lg" className="gap-2">
                <Heart className="w-5 h-5" />
                Shop Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
