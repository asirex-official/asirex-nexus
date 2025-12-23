import { useEffect, useState, useCallback } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, 
  FolderKanban, 
  Calendar, 
  FileText, 
  Mail,
  MessageSquare,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  UserPlus,
  Newspaper,
  Sparkles,
  BarChart3,
  Info,
  ShieldAlert,
  Key,
  Banknote,
  HeadphonesIcon,
  FileCheck
} from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadChats } from "@/hooks/useUnreadChats";
import PinVerification from "@/components/admin/PinVerification";
import ChangePinDialog from "@/components/admin/ChangePinDialog";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { toast } from "sonner";

const navItems = [
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/products", icon: Package, label: "Products" },
  { path: "/admin/projects", icon: FolderKanban, label: "Projects" },
  { path: "/admin/events", icon: Calendar, label: "Events" },
  { path: "/admin/content", icon: FileText, label: "Site Content" },
  { path: "/admin/features", icon: Sparkles, label: "Feature Pages" },
  { path: "/admin/stats", icon: BarChart3, label: "Stats Pages" },
  { path: "/admin/about", icon: Info, label: "About Page" },
  { path: "/admin/messages", icon: Mail, label: "Contact Messages" },
  { path: "/admin/chats", icon: MessageSquare, label: "Live Chats", showBadge: true },
  { path: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { path: "/admin/order-complaints", icon: AlertCircle, label: "Order Complaints" },
  { path: "/admin/customer-issues", icon: HeadphonesIcon, label: "Customer Issues" },
  { path: "/admin/refunds", icon: Banknote, label: "Refunds" },
  { path: "/admin/subscribers", icon: Newspaper, label: "Subscribers" },
  { path: "/admin/applications", icon: UserPlus, label: "Applications" },
  { path: "/admin/invoice-verifier", icon: FileCheck, label: "Invoice Verifier" },
  { path: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  const { user, isAdmin, isSuperAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { totalUnread: unreadChats } = useUnreadChats();
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);

  // Session timeout - lock after 5 minutes of inactivity
  const handleSessionTimeout = useCallback(() => {
    if (isPinVerified) {
      setIsPinVerified(false);
      toast.warning("Session locked due to inactivity. Please re-enter your PIN.");
    }
  }, [isPinVerified]);

  useIdleTimeout({
    timeout: 5 * 60 * 1000, // 5 minutes for admin
    onIdle: handleSessionTimeout,
    enabled: isPinVerified,
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  // Show PIN verification screen for admins
  if (!isPinVerified) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <PinVerification 
          userId={user.id} 
          onVerified={() => setIsPinVerified(true)}
          onSetupComplete={() => setIsPinVerified(true)}
        />
        <div className="fixed bottom-8 left-0 right-0 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <ShieldAlert className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-yellow-600 dark:text-yellow-400">
              Admin Panel Protected - PIN Required
            </span>
          </div>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    setIsPinVerified(false);
    await signOut();
    navigate("/");
  };

  const handleLockSession = () => {
    setIsPinVerified(false);
    toast.info("Session locked. Enter your PIN to continue.");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <Link to="/dashboard/ceo" className="font-display text-xl font-bold gradient-text">
          ASIREX Admin
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40 transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-border hidden lg:block">
          <Link to="/dashboard/ceo" className="font-display text-xl font-bold gradient-text">
            ASIREX Admin
          </Link>
        </div>

        <nav className="p-4 pt-20 lg:pt-4 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {(item as any).showBadge && unreadChats > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white border-none animate-pulse text-xs px-2">
                    {unreadChats > 99 ? '99+' : unreadChats}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3 mb-4 px-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                {isSuperAdmin ? "Super Admin" : "Administrator"}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => setShowChangePin(true)}
              >
                <Key className="w-4 h-4 mr-1" />
                PIN
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={handleLockSession}
              >
                <ShieldAlert className="w-4 h-4 mr-1" />
                Lock
              </Button>
            </div>
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Change PIN Dialog */}
      <ChangePinDialog 
        open={showChangePin}
        onOpenChange={setShowChangePin}
        userId={user.id}
      />
    </div>
  );
}