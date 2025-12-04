import { motion } from "framer-motion";
import { Construction, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface MaintenanceProps {
  message?: string;
}

export default function Maintenance({ message = "We are currently updating our systems. Please check back soon." }: MaintenanceProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg relative"
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 mb-8"
        >
          <Construction className="w-12 h-12 text-primary" />
        </motion.div>

        <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
          Coming <span className="gradient-text">Soon</span>
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          {message}
        </p>

        <div className="font-display text-6xl font-bold gradient-text mb-8">
          ASIREX
        </div>

        <p className="text-sm text-muted-foreground">
          Building the future of technology for India and beyond.
        </p>

        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/auth">
              Admin Login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
