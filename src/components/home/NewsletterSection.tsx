import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
    toast.success("Welcome to the future! Check your inbox for confirmation.");
    setEmail("");
  };

  return (
    <section className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/40 to-background" />
      
      {/* Subtle animated glow - reduced blur for performance */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 60%)" }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Grid pattern - static for performance */}
      <div className="absolute inset-0 tech-grid opacity-20" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-5 py-2.5 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-semibold">Join 10,000+ Innovators</span>
            </motion.div>

            <h2 className="font-display text-4xl lg:text-5xl font-black mb-4">
              Stay Ahead of the <span className="gradient-text-static">Future</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Get exclusive updates on new products, breakthrough technologies, and early access to ASIREX innovations.
            </p>

            {/* Form */}
            {!isSubmitted ? (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
              >
                <div className="relative flex-1 group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-14 h-14 bg-card/60 border-border/50 focus:border-primary rounded-2xl text-foreground placeholder:text-muted-foreground transition-all"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  variant="hero"
                  size="xl"
                  className="group"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Zap className="w-4 h-4 mr-2 animate-pulse" />
                      Subscribing...
                    </span>
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex items-center justify-center gap-3 glass-card py-5 px-8 max-w-md mx-auto rounded-2xl border-primary/30"
              >
                <CheckCircle className="w-6 h-6 text-primary" />
                <span className="text-foreground font-semibold">You're subscribed! Welcome to the future.</span>
              </motion.div>
            )}

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-8 mt-10 text-sm text-muted-foreground"
            >
              {["Early access", "Exclusive discounts", "Tech insights", "No spam"].map((benefit, i) => (
                <span key={benefit} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {benefit}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
