import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MagneticButton } from "@/components/animations/MagneticButton";

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      
      <motion.div 
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.12) 0%, transparent 70%)" }}
        animate={{ scale: [1.2, 1, 1.2], x: [0, -50, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      
      <div className="container mx-auto px-4 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 mb-8"
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Join the Future</span>
          </motion.div>

          <h2 className="font-display text-5xl lg:text-6xl xl:text-7xl font-black mb-6">
            Ready to Build the{" "}
            <span className="gradient-text">Future</span>?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of innovators who trust ASIREX for cutting-edge 
            technology. Start your journey today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MagneticButton>
              <Button asChild variant="hero" size="xl">
                <Link to="/shop">
                  Start Shopping
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </MagneticButton>
            <MagneticButton>
              <Button asChild variant="glass" size="xl">
                <Link to="/about#contact">Contact Sales</Link>
              </Button>
            </MagneticButton>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-14 flex flex-wrap justify-center gap-10 text-muted-foreground text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Free Shipping Above ₹999
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              30-Day Returns
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              Secure Payments
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
