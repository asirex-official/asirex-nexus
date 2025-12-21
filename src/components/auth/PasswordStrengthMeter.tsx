import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { calculatePasswordStrength, getPasswordStrengthLabel } from "@/lib/security/passwordValidation";

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

const requirements = [
  { regex: /.{12,}/, label: "At least 12 characters" },
  { regex: /[A-Z]/, label: "One uppercase letter" },
  { regex: /[a-z]/, label: "One lowercase letter" },
  { regex: /[0-9]/, label: "One number" },
  { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, label: "One special character" },
];

export function PasswordStrengthMeter({ password, showRequirements = true }: PasswordStrengthMeterProps) {
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
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1">
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

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {requirements.map((req, index) => {
            const isMet = req.regex.test(password);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-1.5 text-xs ${
                  isMet ? "text-green-500" : "text-muted-foreground"
                }`}
              >
                {isMet ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
                <span>{req.label}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
