import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LiveChat } from "@/components/LiveChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FestivalEffectsProvider } from "@/components/festivals/FestivalEffects";
import { SaleBanner } from "@/components/festivals/SaleBanner";
import { useActiveFestival } from "@/hooks/useActiveFestival";
import { FestivalThemeProvider } from "@/components/festivals/FestivalThemeProvider";
import { FestivalDecorations } from "@/components/festivals/FestivalDecorations";
import { NewYearGreeting } from "@/components/festivals/NewYearGreeting";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: activeFestival } = useActiveFestival();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Don't show back button on home page
  const showBackButton = location.pathname !== "/";

  // Don't show festival effects on admin/dashboard pages
  const showFestivalEffects = !location.pathname.includes("/dashboard") && 
                               !location.pathname.includes("/admin");

  return (
    <FestivalThemeProvider>
      <div className="min-h-screen flex flex-col bg-background corner-glow">
        {/* Festival Effects Overlay */}
        {showFestivalEffects && activeFestival?.festival_theme && (
          <>
            <FestivalEffectsProvider theme={activeFestival.festival_theme} />
            <FestivalDecorations />
          </>
        )}
        
        <Header />
        
        {/* Sale Banner */}
        {showFestivalEffects && activeFestival && (
          <SaleBanner
            message={activeFestival.banner_message || `${activeFestival.name} - Special Discount!`}
            color={activeFestival.banner_color || "#6366f1"}
            festivalTheme={activeFestival.festival_theme}
            discountValue={activeFestival.discount_value}
            discountType={activeFestival.discount_type}
          />
        )}
        
        <main className="flex-1 pt-16 lg:pt-20">
          {showBackButton && (
            <div className="container mx-auto px-4 lg:px-8 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </div>
          )}
          {children}
        </main>
        <Footer />
        <LiveChat />
        {showFestivalEffects && <NewYearGreeting />}
      </div>
    </FestivalThemeProvider>
  );
}
