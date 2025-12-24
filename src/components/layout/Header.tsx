import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingCart, User, LogOut, Settings, AlertTriangle, Package, Bell, MessageCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useLiveChat } from "@/hooks/useLiveChat";
import { toast } from "@/hooks/use-toast";

const navLinks = [
  { name: "Shop", href: "/shop" },
  { name: "Projects", href: "/projects" },
  { name: "Events", href: "/events" },
  { name: "About", href: "/about" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isStaff, signOut } = useAuth();
  const { totalItems } = useCart();
  const { openChat } = useLiveChat();

  const handleTrackOrder = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to track your orders.",
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        )
      });
      return;
    }
    navigate("/track-order");
  };

  const handleLiveChat = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to use live chat for customer support.",
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        )
      });
      return;
    }
    openChat();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="flex items-center">
                <span 
                  className="text-2xl lg:text-3xl font-bold tracking-wider"
                  style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #C0C0C0 50%, #A8A8A8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  ASIRE
                </span>
                <span 
                  className="text-2xl lg:text-3xl font-bold tracking-wider"
                  style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #C0C0C0 50%, #A8A8A8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  X
                </span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center flex-1 gap-2 xl:gap-6 2xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "px-3 xl:px-5 2xl:px-6 py-1.5 xl:py-2 rounded-lg text-xs xl:text-sm 2xl:text-base font-semibold tracking-wide xl:tracking-widest uppercase transition-all duration-300 whitespace-nowrap",
                  location.pathname === link.href
                    ? "text-white bg-white/10"
                    : "text-white hover:text-white/80 hover:bg-white/5"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 2xl:gap-3">
            <Button variant="glass" size="icon" className="relative w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10" asChild>
              <Link to="/cart">
                <ShoppingCart className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 xl:w-4 xl:h-4 bg-accent text-accent-foreground text-[8px] xl:text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            </Button>
            
            {/* Track Order - for all users */}
            <Button variant="glass" size="sm" className="text-[10px] xl:text-xs 2xl:text-sm px-2 xl:px-3 2xl:px-4 h-8 xl:h-9" onClick={handleTrackOrder}>
              <Package className="w-3 h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 mr-1 xl:mr-1.5 2xl:mr-2 flex-shrink-0" />
              <span className="hidden xl:inline">My Orders</span>
              <span className="xl:hidden">Orders</span>
            </Button>
            
            {/* Warranty Claim */}
            <Button variant="glass" size="sm" className="text-[10px] xl:text-xs 2xl:text-sm px-2 xl:px-3 2xl:px-4 h-8 xl:h-9" asChild>
              <Link to="/warranty-claims">
                <Shield className="w-3 h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 mr-1 xl:mr-1.5 2xl:mr-2 flex-shrink-0" />
                <span className="hidden xl:inline">Warranty Claim</span>
                <span className="xl:hidden">Warranty</span>
              </Link>
            </Button>
            
            {/* Live Chat - for all users */}
            <Button variant="glass" size="icon" className="w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10" onClick={handleLiveChat}>
              <MessageCircle className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
            </Button>
            
            {user ? (
              <>
                <Button asChild variant="glass" size="icon" className="relative w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10">
                  <Link to="/notifications">
                    <Bell className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 xl:w-4 xl:h-4 bg-accent text-accent-foreground text-[8px] xl:text-[10px] font-bold rounded-full flex items-center justify-center">
                      3
                    </span>
                  </Link>
                </Button>
                <Button asChild variant="glass" size="icon" className="w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10">
                  <Link to="/settings">
                    <Settings className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                  </Link>
                </Button>
                {isStaff && (
                  <Button asChild variant="glass" size="sm" className="text-[10px] xl:text-xs 2xl:text-sm px-2 xl:px-3 h-8 xl:h-9">
                    <Link to="/admin">
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="w-8 h-8 xl:w-9 xl:h-9 2xl:w-10 2xl:h-10" onClick={() => signOut()}>
                  <LogOut className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                </Button>
              </>
            ) : (
              <Button asChild variant="ghost" size="default" className="relative group overflow-hidden bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] text-white font-bold tracking-wide px-4 xl:px-6 2xl:px-8 py-1.5 xl:py-2 2xl:py-2.5 rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-500 border-0 text-[10px] xl:text-xs 2xl:text-sm">
                <Link to="/auth">
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <User className="w-3 h-3 xl:w-3.5 xl:h-3.5 2xl:w-4 2xl:h-4 mr-1 xl:mr-1.5 2xl:mr-2 relative z-10 flex-shrink-0" />
                  <span className="relative z-10 whitespace-nowrap">Sign up/Login</span>
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>
        
        {/* Progress Alert Bar - Only show on Projects pages */}
        {location.pathname.startsWith('/projects') && (
          <div className="flex items-center gap-3 py-2 px-4 bg-yellow-500/10 border-t border-yellow-500/20 rounded-b-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <span className="text-xs text-yellow-500 font-medium">Slow Progress Due to Lack of funds, Building Real Life Prototype on Our Own Funds — Please Support us</span>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      "block px-4 py-3 rounded-xl text-base font-medium transition-all",
                      location.pathname === link.href
                        ? "text-accent bg-accent/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              {/* Cart Button for Mobile */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
              >
                <Link
                  to="/cart"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                  </span>
                  {totalItems > 0 && (
                    <span className="px-2 py-0.5 bg-accent text-accent-foreground text-sm font-bold rounded-full">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (navLinks.length + 1) * 0.1 }}
                className="pt-4 flex flex-col gap-3"
              >
                {/* Track Order, Warranty Claim, and Live Chat - for all users */}
                <Button variant="glass" className="w-full justify-start" onClick={handleTrackOrder}>
                  <Package className="w-4 h-4 mr-2" />
                  My Orders
                </Button>
                <Button asChild variant="glass" className="w-full justify-start">
                  <Link to="/warranty-claims">
                    <Shield className="w-4 h-4 mr-2" />
                    Warranty Claim
                  </Link>
                </Button>
                <Button variant="glass" className="w-full justify-start" onClick={handleLiveChat}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Live Chat
                </Button>
                
                {user ? (
                  <>
                    <Button asChild variant="glass" className="w-full">
                      <Link to="/notifications">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                      </Link>
                    </Button>
                    <Button asChild variant="glass" className="w-full">
                      <Link to="/settings">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                    </Button>
                    {isStaff && (
                      <Button asChild variant="glass" className="w-full">
                        <Link to="/admin">
                          Admin Panel
                        </Link>
                      </Button>
                    )}
                    <Button variant="hero" className="w-full" onClick={() => signOut()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button asChild variant="hero" className="w-full">
                    <Link to="/auth">
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
