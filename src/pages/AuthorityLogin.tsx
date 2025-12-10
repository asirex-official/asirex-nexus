import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Shield, Users, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const authorityTypes = {
  admin: {
    label: "Admin Login",
    icon: Shield,
    description: "Super Admins and Admins with full system access",
    color: "from-red-500/20 to-orange-500/20",
  },
  manager: {
    label: "Core Pillars & Managers",
    icon: Users,
    description: "Core Members, Managers, and Developers",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  employee: {
    label: "Employees Login",
    icon: Briefcase,
    description: "Regular employees and staff members",
    color: "from-green-500/20 to-emerald-500/20",
  },
};

export default function AuthorityLogin() {
  const [searchParams] = useSearchParams();
  const authorityType = searchParams.get("type") || "employee";
  const authority = authorityTypes[authorityType as keyof typeof authorityTypes] || authorityTypes.employee;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  const AuthorityIcon = authority.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${authority.color} opacity-50`} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Link 
          to="/auth" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="glass-card p-8">
          {/* Authority Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className={`p-4 rounded-full bg-gradient-to-br ${authority.color} border border-border/50`}>
              <AuthorityIcon className="w-8 h-8 text-foreground" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {authority.label}
            </h1>
            <p className="text-sm text-muted-foreground">
              {authority.description}
            </p>
          </div>

          {/* Company Email Notice */}
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground text-center">
              Please use your <span className="font-semibold text-foreground">company-provided email</span> and password to login.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Company Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@asirex.in"
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
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Forgot your password? Contact your administrator or email{" "}
              <a href="mailto:support@asirex.in" className="text-primary hover:underline">
                support@asirex.in
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
