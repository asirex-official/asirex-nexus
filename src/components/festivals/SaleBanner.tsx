import { motion } from "framer-motion";
import { X, Gift, Sparkles, PartyPopper, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SaleBannerProps {
  message: string;
  color: string;
  festivalTheme?: string | null;
  discountValue: number;
  discountType: string;
  onClose?: () => void;
}

const themeIcons: Record<string, React.ReactNode> = {
  diwali: <span className="text-2xl">🪔</span>,
  christmas: <span className="text-2xl">🎄</span>,
  holi: <span className="text-2xl">🌈</span>,
  new_year: <span className="text-2xl">🎆</span>,
  independence_day: <span className="text-2xl">🇮🇳</span>,
};

const themeDecorations: Record<string, string> = {
  diwali: "✨ 🪔 ✨",
  christmas: "🎁 ❄️ 🎅",
  holi: "💜 💚 💛",
  new_year: "🎊 🥳 🎉",
  independence_day: "🧡 🤍 💚",
};

export function SaleBanner({ 
  message, 
  color, 
  festivalTheme, 
  discountValue, 
  discountType,
  onClose 
}: SaleBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const discountText = discountType === "percentage" 
    ? `${discountValue}% OFF` 
    : `₹${discountValue} OFF`;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="sticky top-0 z-40 w-full"
    >
      <div 
        className="relative py-3 px-4 text-white overflow-hidden"
        style={{ backgroundColor: color }}
      >
        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)`,
          }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        <div className="container mx-auto flex items-center justify-center gap-4 relative">
          {/* Left decoration */}
          {festivalTheme && (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {themeIcons[festivalTheme] || <Sparkles className="w-6 h-6" />}
            </motion.span>
          )}

          {/* Main message */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <motion.span
              className="font-bold text-lg md:text-xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {message || "🎉 Special Sale!"}
            </motion.span>
            
            <motion.span
              className="px-3 py-1 bg-white/20 rounded-full font-bold text-sm md:text-base backdrop-blur-sm"
              animate={{ 
                boxShadow: ["0 0 10px rgba(255,255,255,0.5)", "0 0 20px rgba(255,255,255,0.8)", "0 0 10px rgba(255,255,255,0.5)"]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {discountText}
            </motion.span>

            {festivalTheme && (
              <span className="hidden md:inline text-lg">
                {themeDecorations[festivalTheme]}
              </span>
            )}
          </div>

          {/* Right decoration */}
          {festivalTheme && (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              {themeIcons[festivalTheme] || <Gift className="w-6 h-6" />}
            </motion.span>
          )}

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Bottom decorative border */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}
