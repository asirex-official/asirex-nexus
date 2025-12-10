import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Shield, Users, Briefcase, LockKeyhole, UserCheck } from "lucide-react";
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

// Role cards with job positions - some are filled, some are vacant
const roleCards = [
  {
    id: "production-head",
    title: "Production Head and Manager",
    name: "Vaibhav Ghatwal",
    isHired: true,
    emoji: "🌱",
  },
  {
    id: "senior-ai-engineer",
    title: "Senior AI Engineer",
    name: null,
    isHired: false,
    emoji: "🤖",
  },
  {
    id: "robotics-developer",
    title: "Robotics Software Developer",
    name: null,
    isHired: false,
    emoji: "⚙️",
  },
  {
    id: "product-designer",
    title: "Product Designer",
    name: null,
    isHired: false,
    emoji: "🎨",
  },
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    name: null,
    isHired: false,
    emoji: "🧠",
  },
  {
    id: "embedded-systems",
    title: "Embedded Systems Developer",
    name: null,
    isHired: false,
    emoji: "💻",
  },
  {
    id: "marketing-manager",
    title: "Marketing Manager",
    name: null,
    isHired: false,
    emoji: "📈",
  },
  {
    id: "hardware-engineer",
    title: "Hardware Engineer",
    name: null,
    isHired: false,
    emoji: "🔧",
  },
  {
    id: "content-writer",
    title: "Content Writer & Social Media",
    name: null,
    isHired: false,
    emoji: "✍️",
  },
  {
    id: "business-dev",
    title: "Business Development Executive",
    name: null,
    isHired: false,
    emoji: "💼",
  },
  {
    id: "website-admin-swe",
    title: "Website Admin and SWE",
    name: null,
    isHired: false,
    emoji: "🌐",
  },
  {
    id: "sales-manager",
    title: "Sales Manager and Head",
    name: null,
    isHired: false,
    emoji: "📊",
  },
  {
    id: "rd-lead",
    title: "Engineering and Research & Development Lead",
    name: null,
    isHired: false,
    emoji: "🔬",
  },
];

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

  const handleRoleCardClick = (card: typeof roleCards[0]) => {
    if (!card.isHired) {
      toast({
        title: "Position Vacant",
        description: "This role is not yet filled. Apply for this position through our careers page!",
        variant: "destructive",
      });
      return;
    }
    // For hired positions, show login prompt
    toast({
      title: `Welcome, ${card.name}`,
      description: "Please use your company email and password to login.",
    });
  };

  const AuthorityIcon = authority.icon;

  // Show role cards for manager type
  if (authorityType === "manager") {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className={`fixed inset-0 bg-gradient-to-br ${authority.color} opacity-30 pointer-events-none`} />
        
        <div className="container mx-auto max-w-6xl relative">
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`p-4 rounded-full bg-gradient-to-br ${authority.color} border border-border/50`}>
                <AuthorityIcon className="w-8 h-8 text-foreground" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {authority.label}
            </h1>
            <p className="text-muted-foreground">
              Select your role card to login
            </p>
          </motion.div>

          {/* Role Cards Grid - 2 per row, ID card style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto"
          >
            {roleCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleRoleCardClick(card)}
                className={`
                  relative overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300
                  ${card.isHired 
                    ? "bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/30 hover:border-primary hover:shadow-xl hover:shadow-primary/20 cursor-pointer hover:scale-[1.02]" 
                    : "bg-gradient-to-br from-destructive/5 via-background to-destructive/10 border-destructive/30 cursor-not-allowed"
                  }
                `}
              >
                {/* ID Card Header Strip */}
                <div className={`absolute top-0 left-0 right-0 h-2 ${card.isHired ? "bg-gradient-to-r from-primary to-primary/50" : "bg-gradient-to-r from-destructive to-destructive/50"}`} />
                
                {/* Card Content */}
                <div className="flex flex-col items-center text-center pt-4">
                  {/* Avatar/Icon */}
                  <div className={`
                    text-5xl w-20 h-20 rounded-full flex items-center justify-center mb-4 border-2
                    ${card.isHired 
                      ? "bg-primary/20 border-primary/30" 
                      : "bg-destructive/10 border-destructive/30"
                    }
                  `}>
                    {card.isHired ? card.emoji : <LockKeyhole className="w-8 h-8 text-destructive" />}
                  </div>
                  
                  {/* Title */}
                  <h3 className="font-bold text-lg text-foreground mb-2">
                    {card.title}
                  </h3>
                  
                  {/* Status */}
                  {card.isHired ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                      <UserCheck className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-500 font-semibold">{card.name}</span>
                    </div>
                  ) : (
                    <div className="px-4 py-2 rounded-full bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-destructive font-semibold">
                        Card not activated - No one hired
                      </p>
                    </div>
                  )}
                  
                  {/* Click to Login indicator for hired cards */}
                  {card.isHired && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Click to login →
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Support Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-muted-foreground text-sm mb-3">
              Can't find your Login card?
            </p>
            <a 
              href="mailto:Support@asirex.in"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Support@asirex.in
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  // Default email/password login for admin and employee types
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
