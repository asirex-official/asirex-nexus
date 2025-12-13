import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Key, Usb, Eye, EyeOff, Shield, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CardLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const name = searchParams.get("name") || "User";
  const title = searchParams.get("title") || "Team Member";
  const id = searchParams.get("id") || "ASX-0000-000";
  const department = searchParams.get("department") || "Department";
  const role = searchParams.get("role") || "member";
  const email = searchParams.get("email") || "";
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getDashboardRoute = () => {
    // Route based on role type
    if (role === "ceo" || title.toLowerCase().includes("ceo") || title.toLowerCase().includes("founder")) {
      return "/dashboard/ceo";
    }
    if (role === "developer" || title.toLowerCase().includes("developer") || title.toLowerCase().includes("swe") || title.toLowerCase().includes("website admin")) {
      return "/dashboard/developer";
    }
    // All other Core Pillars go to their dashboard with params
    return `/dashboard/core-pillar?name=${encodeURIComponent(name)}&title=${encodeURIComponent(title)}&department=${encodeURIComponent(department)}`;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    if (!email) {
      toast.error("No email associated with this account");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Authenticate via Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        toast.error("Invalid credentials", {
          description: error.message
        });
        setIsLoading(false);
        return;
      }

      toast.success(`Welcome back, ${name.split(" ")[0]}!`);
      navigate(getDashboardRoute());
    } catch (err) {
      toast.error("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUSBPasskey = () => {
    toast.info("USB Passkey authentication coming soon", {
      description: "This feature is under development"
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6"
      >
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 border border-border/50 flex items-center justify-center"
            >
              <Shield className="w-10 h-10 text-primary" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground mb-1"
            >
              Welcome Back
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-semibold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent"
            >
              {name}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 space-y-1"
            >
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-xs text-muted-foreground/70">{department} • {id}</p>
            </motion.div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">Authenticate</span>
            </div>
          </div>

          {/* Password Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onSubmit={handlePasswordLogin}
            className="space-y-4"
          >
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 bg-background/50 border-border/50 focus:border-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-primary-foreground font-medium"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
              ) : (
                "Sign In"
              )}
            </Button>
          </motion.form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* USB Passkey */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              variant="outline"
              onClick={handleUSBPasskey}
              className="w-full h-12 border-border/50 hover:border-primary/50 hover:bg-primary/5 gap-3"
            >
              <Usb className="w-5 h-5" />
              Use USB Passkey
            </Button>
          </motion.div>

          {/* Biometric Option */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3"
          >
            <Button
              variant="ghost"
              onClick={() => toast.info("Biometric authentication coming soon")}
              className="w-full h-10 text-muted-foreground hover:text-foreground gap-2"
            >
              <Fingerprint className="w-4 h-4" />
              Use Biometric
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-center text-xs text-muted-foreground mt-6"
          >
            Trouble logging in?{" "}
            <a href="mailto:Support@asirex.in" className="text-primary hover:underline">
              Contact Support
            </a>
          </motion.p>
        </div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground"
        >
          <Shield className="w-3 h-3" />
          <span>Secured with end-to-end encryption</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CardLogin;
