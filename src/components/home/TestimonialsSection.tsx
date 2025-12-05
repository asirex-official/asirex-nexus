import { motion, Variants } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "CTO, TechVision India",
    content: "ASIREX has revolutionized how we approach AI integration. Their Neural Core processor exceeded all our performance benchmarks.",
    rating: 5,
    avatar: "PS"
  },
  {
    name: "Rajesh Kumar",
    role: "Founder, RoboLabs",
    content: "The RoboKit Pro is exceptional. We've deployed it across our entire manufacturing line with incredible results.",
    rating: 5,
    avatar: "RK"
  },
  {
    name: "Sarah Chen",
    role: "Head of R&D, GlobalTech",
    content: "Working with ASIREX has been transformative. Their commitment to innovation and quality is unmatched in the industry.",
    rating: 5,
    avatar: "SC"
  },
  {
    name: "Amit Patel",
    role: "Director, CleanEnergy Solutions",
    content: "The SolarGrid Max exceeded our efficiency targets by 40%. ASIREX is truly leading the clean-tech revolution.",
    rating: 5,
    avatar: "AP"
  }
];

// Optimized animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export const TestimonialsSection = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/30 via-background to-card/30" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-6"
          >
            <Star className="w-4 h-4 text-accent fill-accent" />
            <span className="text-accent text-sm font-semibold">Testimonials</span>
          </motion.span>
          
          <h2 className="font-display text-4xl lg:text-5xl font-black mb-4">
            Trusted by <span className="gradient-text-static">Industry Leaders</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what our partners and customers say about working with ASIREX
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="glass-card p-8 h-full rounded-3xl relative overflow-hidden transition-colors duration-300 hover:border-primary/40">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
                
                {/* Quote icon */}
                <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10 group-hover:text-primary/20 transition-colors duration-300" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-5 relative">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground text-lg mb-6 leading-relaxed relative">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg shadow-glow-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-display font-bold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
