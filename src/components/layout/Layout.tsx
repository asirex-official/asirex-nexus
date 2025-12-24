import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LiveChat } from "@/components/LiveChat";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Don't show back button on home page
  const showBackButton = location.pathname !== "/";

  return (
    <div className="min-h-screen flex flex-col bg-background corner-glow">
      <Header />
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
    </div>
  );
}
