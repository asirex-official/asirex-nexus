import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Heart, Share2, MessageCircle, Users, Megaphone, Instagram, Twitter, Youtube, Mail, HandHeart, Rocket, Target, Sparkles, ArrowRight, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

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

const supportWays = [
  {
    icon: Share2,
    title: "Share Our Story",
    description: "Share ASIREX on your social media. Every share reaches new supporters.",
    action: "Share Now",
    color: "primary"
  },
  {
    icon: MessageCircle,
    title: "Comment & Engage",
    description: "Comment on our posts, share your thoughts, and help us reach more people.",
    action: "Engage",
    color: "accent"
  },
  {
    icon: Megaphone,
    title: "Tag Officials",
    description: "Mention government officials in our posts to bring attention to our projects.",
    action: "Learn How",
    color: "blue"
  },
  {
    icon: Users,
    title: "Spread the Word",
    description: "Tell your friends, family, and colleagues about ASIREX's mission.",
    action: "Share",
    color: "green"
  }
];

const socialPlatforms = [
  { icon: Instagram, name: "Instagram", handle: "@asirex.official", link: "#", color: "pink" },
  { icon: Twitter, name: "Twitter/X", handle: "@asirex_tech", link: "#", color: "blue" },
  { icon: Youtube, name: "YouTube", handle: "ASIREX Tech", link: "#", color: "red" }
];

const whyWeNeedSupport = [
  "We are building real-life prototypes entirely on our own funds",
  "No external funding or venture capital backing yet",
  "Every rupee goes directly into R&D and product development",
  "Government grants require visibility and public support",
  "Your engagement helps us attract investors and partners"
];

export default function SupportUs() {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied!", description: "Link copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent" />
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                <Heart className="w-4 h-4 animate-pulse" />
                We Need Your Support
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="font-display text-4xl lg:text-6xl font-bold mb-8 leading-tight"
            >
              Help Us Build <span className="gradient-text">India's Future</span>
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              We're building revolutionary technology on limited funds. Your support — even just a share or comment — 
              can change everything.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="glass-card p-6 max-w-xl mx-auto border-2 border-primary/30"
            >
              <HandHeart className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                "Slow Progress Due to Lack of Funds"
              </p>
              <p className="text-muted-foreground">
                We're building real-life prototypes entirely on our own savings. 
                Your engagement helps us get noticed by investors and government programs.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why We Need Support */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Why We <span className="gradient-text">Need Your Help</span>
              </h2>
              <p className="text-muted-foreground text-lg">The honest truth about our situation</p>
            </div>

            <div className="glass-card p-8 lg:p-10">
              <div className="space-y-4">
                {whyWeNeedSupport.map((reason, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-lg">{reason}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How to Support */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              How You Can <span className="gradient-text">Support Us</span>
            </h2>
            <p className="text-muted-foreground text-lg">Every action counts — here's how you can help</p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {supportWays.map((way, i) => (
              <motion.div
                key={way.title}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass-card p-6 text-center group cursor-pointer"
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <way.icon className="w-8 h-8 text-primary" />
                </motion.div>
                <h3 className="font-display text-xl font-semibold mb-2">{way.title}</h3>
                <p className="text-muted-foreground mb-4">{way.description}</p>
                <Button variant="glass" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                  {way.action} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Media */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Follow & <span className="gradient-text">Engage</span>
            </h2>
            <p className="text-muted-foreground text-lg">Connect with us on social media</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {socialPlatforms.map((platform, i) => (
              <motion.a
                key={platform.name}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card p-6 text-center group"
              >
                <platform.icon className="w-10 h-10 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">{platform.name}</h3>
                <p className="text-muted-foreground text-sm">{platform.handle}</p>
                <ExternalLink className="w-4 h-4 mx-auto mt-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Tag Officials Guide */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Help Us Get <span className="gradient-text">Noticed</span>
              </h2>
              <p className="text-muted-foreground text-lg">Tag government officials in our posts</p>
            </div>

            <div className="glass-card p-8 lg:p-10">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    Who to Tag
                  </h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li>• Ministry of Electronics & IT (@GoI_MeitY)</li>
                    <li>• NITI Aayog (@NITIAayog)</li>
                    <li>• Startup India (@startupindia)</li>
                    <li>• PM Office (@PMOIndia)</li>
                    <li>• Local MPs and MLAs</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-accent" />
                    Sample Comment
                  </h3>
                  <div className="bg-background/50 p-4 rounded-lg text-sm mb-4">
                    "Check out @asirex_tech — a young Indian startup building amazing AI and robotics solutions! 
                    They need support to scale. #MakeInIndia #StartupIndia 🇮🇳"
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopy("Check out @asirex_tech — a young Indian startup building amazing AI and robotics solutions! They need support to scale. #MakeInIndia #StartupIndia 🇮🇳")}
                    className="w-full"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy Text"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10" />
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Rocket className="w-16 h-16 text-primary mx-auto mb-6" />
            </motion.div>
            <h2 className="font-display text-3xl lg:text-5xl font-bold mb-6">
              Together, We Can <span className="gradient-text">Change India</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Your support today could help build the technology that transforms millions of lives tomorrow.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="gap-2">
                <Share2 className="w-5 h-5" /> Share ASIREX
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Mail className="w-5 h-5" /> Contact Us
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}