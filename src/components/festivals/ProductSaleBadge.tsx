import { motion } from "framer-motion";
import { Sparkles, Gift, PartyPopper } from "lucide-react";

interface ProductSaleBadgeProps {
  discountValue: number;
  discountType: string;
  festivalTheme?: string | null;
  campaignName?: string;
  size?: "sm" | "md" | "lg";
}

const themeStyles: Record<string, { bg: string; icon: string; label: string }> = {
  // Indian Festivals
  diwali: { 
    bg: "bg-gradient-to-r from-orange-500 to-yellow-500", 
    icon: "🪔",
    label: "Diwali Sale"
  },
  holi: { 
    bg: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500", 
    icon: "🌈",
    label: "Holi Sale"
  },
  independence_day: { 
    bg: "bg-gradient-to-r from-orange-500 via-white to-green-500", 
    icon: "🇮🇳",
    label: "Freedom Sale"
  },
  navratri: { 
    bg: "bg-gradient-to-r from-fuchsia-500 to-pink-500", 
    icon: "💃",
    label: "Navratri Sale"
  },
  ganesh_chaturthi: { 
    bg: "bg-gradient-to-r from-yellow-500 to-orange-500", 
    icon: "🐘",
    label: "Ganesh Chaturthi"
  },
  onam: { 
    bg: "bg-gradient-to-r from-yellow-400 to-green-500", 
    icon: "🛶",
    label: "Onam Sale"
  },
  raksha_bandhan: { 
    bg: "bg-gradient-to-r from-pink-400 to-rose-500", 
    icon: "🎀",
    label: "Rakhi Sale"
  },
  eid: { 
    bg: "bg-gradient-to-r from-teal-500 to-emerald-500", 
    icon: "🌙",
    label: "Eid Sale"
  },
  
  // Worldwide Festivals
  christmas: { 
    bg: "bg-gradient-to-r from-red-500 to-green-500", 
    icon: "🎄",
    label: "Christmas Sale"
  },
  new_year: { 
    bg: "bg-gradient-to-r from-indigo-500 to-purple-500", 
    icon: "🎆",
    label: "New Year Sale"
  },
  valentines: { 
    bg: "bg-gradient-to-r from-red-500 to-pink-500", 
    icon: "💕",
    label: "Valentine's Sale"
  },
  easter: { 
    bg: "bg-gradient-to-r from-purple-400 to-pink-400", 
    icon: "🐰",
    label: "Easter Sale"
  },
  halloween: { 
    bg: "bg-gradient-to-r from-orange-500 to-black", 
    icon: "👻",
    label: "Halloween Sale"
  },
  thanksgiving: { 
    bg: "bg-gradient-to-r from-amber-600 to-orange-500", 
    icon: "🦃",
    label: "Thanksgiving Sale"
  },
  black_friday: { 
    bg: "bg-gradient-to-r from-black to-gray-800", 
    icon: "🛒",
    label: "BLACK FRIDAY"
  },
  st_patricks: { 
    bg: "bg-gradient-to-r from-green-500 to-emerald-500", 
    icon: "☘️",
    label: "St. Patrick's Sale"
  },
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-1.5",
};

export function ProductSaleBadge({ 
  discountValue, 
  discountType, 
  festivalTheme,
  campaignName,
  size = "md"
}: ProductSaleBadgeProps) {
  const theme = festivalTheme ? themeStyles[festivalTheme] : null;
  const discountText = discountType === "percentage" 
    ? `${discountValue}% OFF` 
    : `₹${discountValue} OFF`;

  return (
    <motion.div
      className={`
        inline-flex items-center gap-1.5 rounded-full text-white font-bold shadow-lg
        ${theme?.bg || "bg-gradient-to-r from-primary to-primary/80"}
        ${sizeClasses[size]}
      `}
      initial={{ scale: 0, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {theme ? (
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {theme.icon}
        </motion.span>
      ) : (
        <Sparkles className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      )}
      
      <span className={festivalTheme === "independence_day" ? "text-orange-900" : ""}>
        {discountText}
      </span>

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
        style={{ position: "absolute" }}
      />
    </motion.div>
  );
}

// Special delivery badge for Christmas
export function ChristmasDeliveryBadge() {
  return (
    <motion.div
      className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-green-500 text-white px-3 py-1 rounded-full text-sm font-medium"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        🎅
      </motion.span>
      <span>Santa Delivery</span>
      <span>🎁</span>
    </motion.div>
  );
}

// Festival-specific product badges
export function FestivalProductTag({ theme, label }: { theme: string; label?: string }) {
  const style = themeStyles[theme];
  
  if (!style) return null;

  return (
    <motion.div
      className={`
        absolute -top-2 -right-2 z-10 flex items-center gap-1 
        ${style.bg} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg
      `}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", delay: 0.2 }}
    >
      <motion.span
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {style.icon}
      </motion.span>
      <span className={theme === "independence_day" ? "text-orange-900" : ""}>
        {label || style.label}
      </span>
    </motion.div>
  );
}
