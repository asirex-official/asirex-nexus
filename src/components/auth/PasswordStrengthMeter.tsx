import { useMemo } from "react";
import { motion } from "framer-motion";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { calculatePasswordStrength, getPasswordStrengthLabel } from "@/lib/security/passwordValidation";

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => calculatePasswordStrength(password), [password]);
  const { label, color } = useMemo(() => getPasswordStrengthLabel(strength), [strength]);

  const getBarColor = () => {
    if (strength < 30) return "bg-red-500";
    if (strength < 50) return "bg-orange-500";
    if (strength < 70) return "bg-yellow-500";
    if (strength < 90) return "bg-green-500";
    return "bg-emerald-500";
  };

  const getIcon = () => {
    if (strength < 50) return <ShieldAlert className="w-4 h-4 text-red-500" />;
    if (strength < 70) return <Shield className="w-4 h-4 text-yellow-500" />;
    return <ShieldCheck className="w-4 h-4 text-green-500" />;
  };

  if (!password) return null;

  return (
    <div className="space-y-1 mt-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          {getIcon()}
          <span className={color}>{label}</span>
        </div>
        <span className="text-muted-foreground">{strength}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${strength}%` }}
          transition={{ duration: 0.3 }}
          className={`h-full rounded-full ${getBarColor()}`}
        />
      </div>
    </div>
  );
}
