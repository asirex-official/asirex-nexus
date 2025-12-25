import { createContext, useContext, useEffect, ReactNode } from "react";
import { useActiveFestival, ActiveFestivalCampaign } from "@/hooks/useActiveFestival";

// Festival theme configurations
export const festivalThemeConfigs: Record<string, {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  gradientFrom: string;
  gradientTo: string;
  buttonStyle: string;
  borderStyle: string;
  glowColor: string;
}> = {
  christmas: {
    primary: "142 70% 45%", // Green
    secondary: "0 75% 50%", // Red
    accent: "45 100% 60%", // Gold
    background: "142 30% 8%",
    gradientFrom: "hsl(142, 70%, 45%)",
    gradientTo: "hsl(0, 75%, 50%)",
    buttonStyle: "bg-gradient-to-r from-red-600 to-green-600 hover:from-red-500 hover:to-green-500",
    borderStyle: "border-green-500/50",
    glowColor: "0, 75%, 50%",
  },
  diwali: {
    primary: "35 95% 55%", // Orange/Gold
    secondary: "345 80% 50%", // Pink
    accent: "45 100% 60%", // Gold
    background: "25 30% 6%",
    gradientFrom: "hsl(35, 95%, 55%)",
    gradientTo: "hsl(345, 80%, 50%)",
    buttonStyle: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400",
    borderStyle: "border-orange-500/50",
    glowColor: "35, 95%, 55%",
  },
  holi: {
    primary: "280 70% 55%", // Purple
    secondary: "330 80% 55%", // Pink
    accent: "45 100% 60%", // Yellow
    background: "280 20% 6%",
    gradientFrom: "hsl(280, 70%, 55%)",
    gradientTo: "hsl(330, 80%, 55%)",
    buttonStyle: "bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 hover:from-purple-400 hover:via-pink-400 hover:to-yellow-400",
    borderStyle: "border-purple-500/50",
    glowColor: "280, 70%, 55%",
  },
  new_year: {
    primary: "45 100% 60%", // Gold
    secondary: "0 0% 100%", // White
    accent: "220 100% 60%", // Blue
    background: "220 20% 5%",
    gradientFrom: "hsl(45, 100%, 60%)",
    gradientTo: "hsl(220, 100%, 60%)",
    buttonStyle: "bg-gradient-to-r from-yellow-500 to-blue-500 hover:from-yellow-400 hover:to-blue-400",
    borderStyle: "border-yellow-500/50",
    glowColor: "45, 100%, 60%",
  },
  halloween: {
    primary: "25 100% 50%", // Orange
    secondary: "270 60% 40%", // Purple
    accent: "120 80% 40%", // Sickly green
    background: "0 0% 3%",
    gradientFrom: "hsl(25, 100%, 50%)",
    gradientTo: "hsl(270, 60%, 40%)",
    buttonStyle: "bg-gradient-to-r from-orange-500 to-purple-700 hover:from-orange-400 hover:to-purple-600",
    borderStyle: "border-orange-500/50",
    glowColor: "25, 100%, 50%",
  },
  valentines: {
    primary: "340 80% 55%", // Pink
    secondary: "0 80% 50%", // Red
    accent: "0 0% 100%", // White
    background: "340 30% 5%",
    gradientFrom: "hsl(340, 80%, 55%)",
    gradientTo: "hsl(0, 80%, 50%)",
    buttonStyle: "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-400 hover:to-red-400",
    borderStyle: "border-pink-500/50",
    glowColor: "340, 80%, 55%",
  },
  easter: {
    primary: "180 60% 60%", // Turquoise
    secondary: "330 60% 70%", // Light pink
    accent: "45 80% 70%", // Light yellow
    background: "180 20% 8%",
    gradientFrom: "hsl(180, 60%, 60%)",
    gradientTo: "hsl(330, 60%, 70%)",
    buttonStyle: "bg-gradient-to-r from-teal-400 to-pink-400 hover:from-teal-300 hover:to-pink-300",
    borderStyle: "border-teal-400/50",
    glowColor: "180, 60%, 60%",
  },
  black_friday: {
    primary: "0 0% 0%", // Black
    secondary: "0 80% 50%", // Red
    accent: "45 100% 55%", // Gold
    background: "0 0% 3%",
    gradientFrom: "hsl(0, 80%, 50%)",
    gradientTo: "hsl(45, 100%, 55%)",
    buttonStyle: "bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400",
    borderStyle: "border-red-500/50",
    glowColor: "0, 80%, 50%",
  },
  cyber_monday: {
    primary: "180 100% 50%", // Cyan
    secondary: "260 100% 60%", // Purple
    accent: "300 100% 50%", // Magenta
    background: "220 30% 4%",
    gradientFrom: "hsl(180, 100%, 50%)",
    gradientTo: "hsl(260, 100%, 60%)",
    buttonStyle: "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500",
    borderStyle: "border-cyan-500/50",
    glowColor: "180, 100%, 50%",
  },
  independence_day: {
    primary: "35 100% 55%", // Saffron
    secondary: "145 65% 40%", // Green
    accent: "220 80% 50%", // Blue
    background: "35 20% 5%",
    gradientFrom: "hsl(35, 100%, 55%)",
    gradientTo: "hsl(145, 65%, 40%)",
    buttonStyle: "bg-gradient-to-r from-orange-500 via-white to-green-500 hover:from-orange-400 hover:via-gray-100 hover:to-green-400 text-black",
    borderStyle: "border-orange-500/50",
    glowColor: "35, 100%, 55%",
  },
  republic_day: {
    primary: "35 100% 55%",
    secondary: "145 65% 40%",
    accent: "220 80% 50%",
    background: "35 20% 5%",
    gradientFrom: "hsl(35, 100%, 55%)",
    gradientTo: "hsl(145, 65%, 40%)",
    buttonStyle: "bg-gradient-to-r from-orange-500 via-white to-green-500 hover:from-orange-400 hover:via-gray-100 hover:to-green-400 text-black",
    borderStyle: "border-orange-500/50",
    glowColor: "35, 100%, 55%",
  },
  eid: {
    primary: "160 80% 45%", // Teal
    secondary: "45 100% 55%", // Gold
    accent: "0 0% 100%", // White
    background: "160 30% 5%",
    gradientFrom: "hsl(160, 80%, 45%)",
    gradientTo: "hsl(45, 100%, 55%)",
    buttonStyle: "bg-gradient-to-r from-teal-500 to-yellow-500 hover:from-teal-400 hover:to-yellow-400",
    borderStyle: "border-teal-500/50",
    glowColor: "160, 80%, 45%",
  },
  navratri: {
    primary: "330 80% 55%", // Pink
    secondary: "45 100% 55%", // Yellow
    accent: "280 70% 55%", // Purple
    background: "330 25% 5%",
    gradientFrom: "hsl(330, 80%, 55%)",
    gradientTo: "hsl(45, 100%, 55%)",
    buttonStyle: "bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-400 hover:to-yellow-400",
    borderStyle: "border-pink-500/50",
    glowColor: "330, 80%, 55%",
  },
  durga_puja: {
    primary: "0 75% 50%", // Red
    secondary: "45 100% 55%", // Yellow
    accent: "0 0% 100%", // White
    background: "0 25% 5%",
    gradientFrom: "hsl(0, 75%, 50%)",
    gradientTo: "hsl(45, 100%, 55%)",
    buttonStyle: "bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400",
    borderStyle: "border-red-500/50",
    glowColor: "0, 75%, 50%",
  },
  thanksgiving: {
    primary: "25 80% 45%", // Orange/Brown
    secondary: "45 80% 45%", // Gold
    accent: "15 60% 35%", // Brown
    background: "25 30% 5%",
    gradientFrom: "hsl(25, 80%, 45%)",
    gradientTo: "hsl(45, 80%, 45%)",
    buttonStyle: "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500",
    borderStyle: "border-orange-600/50",
    glowColor: "25, 80%, 45%",
  },
  st_patricks: {
    primary: "145 80% 40%", // Green
    secondary: "45 100% 55%", // Gold
    accent: "0 0% 100%", // White
    background: "145 30% 5%",
    gradientFrom: "hsl(145, 80%, 40%)",
    gradientTo: "hsl(45, 100%, 55%)",
    buttonStyle: "bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-500 hover:to-yellow-400",
    borderStyle: "border-green-500/50",
    glowColor: "145, 80%, 40%",
  },
  chinese_new_year: {
    primary: "0 80% 50%", // Red
    secondary: "45 100% 50%", // Gold
    accent: "0 0% 100%", // White
    background: "0 30% 5%",
    gradientFrom: "hsl(0, 80%, 50%)",
    gradientTo: "hsl(45, 100%, 50%)",
    buttonStyle: "bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400",
    borderStyle: "border-red-500/50",
    glowColor: "0, 80%, 50%",
  },
  onam: {
    primary: "45 100% 55%", // Yellow
    secondary: "145 60% 45%", // Green
    accent: "0 0% 100%", // White
    background: "45 25% 5%",
    gradientFrom: "hsl(45, 100%, 55%)",
    gradientTo: "hsl(145, 60%, 45%)",
    buttonStyle: "bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-400 hover:to-green-400",
    borderStyle: "border-yellow-500/50",
    glowColor: "45, 100%, 55%",
  },
  ganesh_chaturthi: {
    primary: "35 100% 50%", // Orange
    secondary: "0 80% 50%", // Red
    accent: "45 100% 55%", // Gold
    background: "35 25% 5%",
    gradientFrom: "hsl(35, 100%, 50%)",
    gradientTo: "hsl(0, 80%, 50%)",
    buttonStyle: "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400",
    borderStyle: "border-orange-500/50",
    glowColor: "35, 100%, 50%",
  },
  raksha_bandhan: {
    primary: "280 60% 55%", // Purple
    secondary: "340 70% 55%", // Pink
    accent: "45 100% 55%", // Gold
    background: "280 25% 5%",
    gradientFrom: "hsl(280, 60%, 55%)",
    gradientTo: "hsl(340, 70%, 55%)",
    buttonStyle: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400",
    borderStyle: "border-purple-500/50",
    glowColor: "280, 60%, 55%",
  },
  mothers_day: {
    primary: "340 70% 55%", // Pink
    secondary: "280 50% 60%", // Lavender
    accent: "0 0% 100%", // White
    background: "340 25% 5%",
    gradientFrom: "hsl(340, 70%, 55%)",
    gradientTo: "hsl(280, 50%, 60%)",
    buttonStyle: "bg-gradient-to-r from-pink-500 to-purple-400 hover:from-pink-400 hover:to-purple-300",
    borderStyle: "border-pink-500/50",
    glowColor: "340, 70%, 55%",
  },
  fathers_day: {
    primary: "210 70% 50%", // Blue
    secondary: "200 60% 45%", // Teal
    accent: "45 100% 55%", // Gold
    background: "210 30% 5%",
    gradientFrom: "hsl(210, 70%, 50%)",
    gradientTo: "hsl(200, 60%, 45%)",
    buttonStyle: "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400",
    borderStyle: "border-blue-500/50",
    glowColor: "210, 70%, 50%",
  },
  summer: {
    primary: "35 100% 55%", // Orange
    secondary: "200 100% 50%", // Sky blue
    accent: "45 100% 60%", // Yellow
    background: "35 20% 5%",
    gradientFrom: "hsl(35, 100%, 55%)",
    gradientTo: "hsl(200, 100%, 50%)",
    buttonStyle: "bg-gradient-to-r from-orange-500 to-sky-500 hover:from-orange-400 hover:to-sky-400",
    borderStyle: "border-orange-500/50",
    glowColor: "35, 100%, 55%",
  },
  winter: {
    primary: "200 80% 60%", // Ice blue
    secondary: "0 0% 95%", // White
    accent: "220 60% 70%", // Light blue
    background: "200 30% 5%",
    gradientFrom: "hsl(200, 80%, 60%)",
    gradientTo: "hsl(220, 60%, 70%)",
    buttonStyle: "bg-gradient-to-r from-sky-400 to-blue-300 hover:from-sky-300 hover:to-blue-200",
    borderStyle: "border-sky-400/50",
    glowColor: "200, 80%, 60%",
  },
  spring: {
    primary: "150 60% 50%", // Green
    secondary: "330 60% 70%", // Pink
    accent: "45 80% 60%", // Yellow
    background: "150 25% 5%",
    gradientFrom: "hsl(150, 60%, 50%)",
    gradientTo: "hsl(330, 60%, 70%)",
    buttonStyle: "bg-gradient-to-r from-green-500 to-pink-400 hover:from-green-400 hover:to-pink-300",
    borderStyle: "border-green-500/50",
    glowColor: "150, 60%, 50%",
  },
  monsoon: {
    primary: "210 70% 50%", // Blue
    secondary: "180 50% 45%", // Teal
    accent: "0 0% 80%", // Grey
    background: "210 30% 5%",
    gradientFrom: "hsl(210, 70%, 50%)",
    gradientTo: "hsl(180, 50%, 45%)",
    buttonStyle: "bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-400 hover:to-teal-400",
    borderStyle: "border-blue-500/50",
    glowColor: "210, 70%, 50%",
  },
};

interface FestivalThemeContextType {
  festival: ActiveFestivalCampaign | null;
  theme: typeof festivalThemeConfigs[string] | null;
}

const FestivalThemeContext = createContext<FestivalThemeContextType>({
  festival: null,
  theme: null,
});

export function useFestivalTheme() {
  return useContext(FestivalThemeContext);
}

interface FestivalThemeProviderProps {
  children: ReactNode;
}

export function FestivalThemeProvider({ children }: FestivalThemeProviderProps) {
  const { data: festival } = useActiveFestival();
  const theme = festival?.festival_theme 
    ? festivalThemeConfigs[festival.festival_theme] || null 
    : null;

  // Apply theme CSS variables dynamically
  useEffect(() => {
    if (theme && festival?.festival_theme) {
      const root = document.documentElement;
      
      // Store original values
      const originalPrimary = getComputedStyle(root).getPropertyValue('--primary');
      
      // Apply festival theme
      root.style.setProperty('--festival-primary', theme.primary);
      root.style.setProperty('--festival-secondary', theme.secondary);
      root.style.setProperty('--festival-accent', theme.accent);
      root.style.setProperty('--festival-glow', theme.glowColor);
      root.style.setProperty('--festival-gradient-from', theme.gradientFrom);
      root.style.setProperty('--festival-gradient-to', theme.gradientTo);
      
      // Add festival theme class to body
      document.body.classList.add('festival-theme');
      document.body.dataset.festivalTheme = festival.festival_theme;
      
      return () => {
        // Cleanup
        root.style.removeProperty('--festival-primary');
        root.style.removeProperty('--festival-secondary');
        root.style.removeProperty('--festival-accent');
        root.style.removeProperty('--festival-glow');
        root.style.removeProperty('--festival-gradient-from');
        root.style.removeProperty('--festival-gradient-to');
        document.body.classList.remove('festival-theme');
        delete document.body.dataset.festivalTheme;
      };
    }
  }, [theme, festival?.festival_theme]);

  return (
    <FestivalThemeContext.Provider value={{ festival, theme }}>
      {children}
    </FestivalThemeContext.Provider>
  );
}
