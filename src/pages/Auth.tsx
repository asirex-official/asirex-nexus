import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft, Shield, Users, Briefcase, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const loginBenefits = [
  "Track your orders in real-time",
  "Access exclusive member discounts",
  "Save your favorite products",
  "Get personalized recommendations",
];

const adminRoles = [
  {
    id: "admin",
    label: "Admin Login",
    icon: Shield,
    description: "Super Admins and Admins with full system access",
  },
  {
    id: "manager",
    label: "Core Pillars & Managers",
    icon: Users,
    description: "Core Members, Managers, and Developers",
  },
  {
    id: "employee",
    label: "Employees Login",
    icon: Briefcase,
    description: "Regular employees and staff members",
  },
];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdminOptions, setShowAdminOptions] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully logged in.",
          });
          navigate("/");
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account created!",
            description: "You can now log in with your credentials.",
          });
          setIsLogin(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRoleSelect = (roleId: string) => {
    navigate(`/authority-login?type=${roleId}`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl font-bold gradient-text mb-2">
              {isLogin ? "Welcome Back" : "Join ASIREX"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin 
                ? "Sign in to access your account" 
                : "Create an account to get started"}
            </p>
          </div>

          {/* Benefits Section */}
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm font-medium text-foreground mb-2">
              {isLogin ? "Why sign in?" : "Benefits of joining:"}
            </p>
            <ul className="space-y-1">
              {loginBenefits.map((benefit, index) => (
                <li key={index} className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>

          {/* Admin Login Section */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <button
              type="button"
              onClick={() => setShowAdminOptions(!showAdminOptions)}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <Shield className="w-4 h-4" />
              Login as Authority
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdminOptions ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showAdminOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-muted-foreground text-center mb-3">
                      Select your authority type:
                    </p>
                    {adminRoles.map((role) => (
                      <div key={role.id} className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant={selectedRole === role.id ? "default" : "outline"}
                          size="sm"
                          className="flex-1 justify-start gap-2"
                          onClick={() => handleAdminRoleSelect(role.id)}
                        >
                          <role.icon className="w-4 h-4" />
                          {role.label}
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="p-2 rounded-md hover:bg-muted transition-colors"
                            >
                              <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="bg-popover border border-border">
                            <p className="text-sm font-medium">Who can login?</p>
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}