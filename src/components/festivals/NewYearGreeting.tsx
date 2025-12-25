import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface SparkleProps {
  delay: number;
  left: string;
  size: number;
}

const Sparkle = ({ delay, left, size }: SparkleProps) => (
  <motion.div
    className="absolute text-yellow-400"
    style={{ left, top: -20 }}
    initial={{ opacity: 0, y: 0 }}
    animate={{
      opacity: [0, 1, 1, 0],
      y: [0, 100, 200, 300],
      x: [0, Math.random() * 40 - 20, Math.random() * 60 - 30],
      rotate: [0, 180, 360],
      scale: [0.5, 1, 0.8, 0],
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  >
    <Sparkles className={`w-${size} h-${size}`} style={{ width: size, height: size }} />
  </motion.div>
);

export function NewYearGreeting() {
  const [showGreeting, setShowGreeting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already seen the greeting today
    const today = new Date().toDateString();
    const lastSeen = localStorage.getItem("newYearGreetingSeen");
    
    // Show greeting if it's December 25 - January 5 and not seen today
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    const isNewYearPeriod = (month === 11 && day >= 25) || (month === 0 && day <= 5);
    
    if (isNewYearPeriod && lastSeen !== today) {
      setTimeout(() => {
        setShowGreeting(true);
        setShowBanner(true);
      }, 1500);
    } else if (isNewYearPeriod) {
      setShowBanner(true);
    }
  }, []);

  const handleThankYou = () => {
    const today = new Date().toDateString();
    localStorage.setItem("newYearGreetingSeen", today);
    setShowGreeting(false);
  };

  // Generate sparkles
  const sparkles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    left: `${Math.random() * 100}%`,
    size: Math.floor(Math.random() * 16) + 8,
  }));

  return (
    <>
      {/* Top Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[60] overflow-hidden"
          >
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 py-3 text-center">
              {/* Sparkle effects on banner */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {sparkles.slice(0, 15).map((sparkle) => (
                  <Sparkle key={sparkle.id} {...sparkle} />
                ))}
              </div>
              
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center justify-center gap-3"
              >
                <PartyPopper className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-bold text-lg tracking-wide">
                  🎆 Happy New Year 2026! 🎆
                </span>
                <PartyPopper className="w-5 h-5 text-yellow-300" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting Popup */}
      <Dialog open={showGreeting} onOpenChange={setShowGreeting}>
        <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0 overflow-visible">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl p-8 overflow-hidden"
          >
            {/* Sparkle effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {sparkles.map((sparkle) => (
                <Sparkle key={sparkle.id} {...sparkle} />
              ))}
            </div>

            {/* Glowing orbs */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

            {/* Content */}
            <div className="relative z-10 text-center space-y-6">
              <motion.div
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(255,255,255,0.5)",
                    "0 0 40px rgba(255,255,255,0.8)",
                    "0 0 20px rgba(255,255,255,0.5)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200">
                  🎆 Happy New Year! 🎆
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-white/90"
              >
                Wishing you a wonderful year ahead filled with joy, success, and endless possibilities!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500"
              >
                2026
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-white/70 text-sm"
              >
                Thank you for being with us!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  onClick={handleThankYou}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-8 py-3 rounded-full text-lg shadow-lg shadow-orange-500/30"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Thank You!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}