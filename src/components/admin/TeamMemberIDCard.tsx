import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Copy, Printer, Check, Building, Mail, Phone, Key, User, Calendar, IdCard, Crown, Shield, Briefcase, Users, Code, Wrench, Factory, TrendingUp, Cpu, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import asirexLogo from "@/assets/asirex-logo.png";

interface TeamMemberCredentials {
  name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  serialNumber: string;
  password: string;
  coreType?: string;
  joinDate: string;
  photo?: string;
}

interface TeamMemberIDCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: TeamMemberCredentials | null;
  onCoreTypeChange?: (isCorePillar: boolean) => void;
}

// Role to icon mapping
const getRoleIcon = (role: string) => {
  if (role.includes("CEO") || role.includes("Founder")) return Crown;
  if (role.includes("Production") || role.includes("Factory")) return Factory;
  if (role.includes("Sales") || role.includes("Marketing") || role.includes("Business")) return TrendingUp;
  if (role.includes("Core") || role.includes("Managing") || role.includes("Team Lead")) return Users;
  if (role.includes("Engineering") || role.includes("R&D")) return Cpu;
  if (role.includes("Developer") || role.includes("SWE") || role.includes("Software")) return Code;
  if (role.includes("Head") || role.includes("Lead") || role.includes("Manager")) return Shield;
  if (role.includes("Engineer") || role.includes("Robotics") || role.includes("Hardware")) return Wrench;
  return Briefcase;
};

// Role color mapping
const getRoleColor = (role: string) => {
  if (role.includes("CEO") || role.includes("Founder")) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
  if (role.includes("Production")) return "text-orange-500 bg-orange-500/10 border-orange-500/30";
  if (role.includes("Sales") || role.includes("Marketing")) return "text-green-500 bg-green-500/10 border-green-500/30";
  if (role.includes("Core") || role.includes("Managing")) return "text-purple-500 bg-purple-500/10 border-purple-500/30";
  if (role.includes("Engineering") || role.includes("R&D")) return "text-cyan-500 bg-cyan-500/10 border-cyan-500/30";
  if (role.includes("Developer") || role.includes("SWE")) return "text-blue-500 bg-blue-500/10 border-blue-500/30";
  if (role.includes("Head") || role.includes("Lead") || role.includes("Manager")) return "text-indigo-500 bg-indigo-500/10 border-indigo-500/30";
  return "text-primary bg-primary/10 border-primary/30";
};

export function TeamMemberIDCard({ open, onOpenChange, credentials, onCoreTypeChange }: TeamMemberIDCardProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [isCorePillar, setIsCorePillar] = useState(
    credentials?.coreType === "Core Pillar" || credentials?.coreType === "Founding Core"
  );
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  if (!credentials) return null;

  const RoleIcon = getRoleIcon(credentials.role);
  const roleColorClass = getRoleColor(credentials.role);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAllCredentials = () => {
    const text = `
ASIREX Team Member Credentials
==============================
Name: ${credentials.name}
Email: ${credentials.email}
Password: ${credentials.password}
Serial Number: ${credentials.serialNumber}
Role: ${credentials.role}
Department: ${credentials.department}
${credentials.coreType ? `Core Type: ${credentials.coreType}` : ''}
Join Date: ${credentials.joinDate}

Login URL: ${window.location.origin}/authority-login
    `.trim();
    navigator.clipboard.writeText(text);
    toast.success("All credentials copied to clipboard");
  };

  const handlePrint = () => {
    const printContent = cardRef.current?.innerHTML;
    if (!printContent) return;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>ASIREX ID Card - ${credentials.name}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
              .card { max-width: 400px; margin: 0 auto; border: 2px solid #333; border-radius: 12px; padding: 24px; }
              .header { text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 16px; margin-bottom: 16px; }
              .logo { font-size: 24px; font-weight: bold; color: #8B5CF6; }
              .name { font-size: 20px; font-weight: bold; margin: 8px 0; }
              .role { color: #666; display: flex; align-items: center; justify-content: center; gap: 8px; }
              .info { margin: 8px 0; }
              .label { font-weight: 600; color: #333; }
              .value { color: #666; }
              .credentials { background: #f5f5f5; padding: 16px; border-radius: 8px; margin-top: 16px; }
              .credential-item { margin: 8px 0; }
              .core-badge { background: #8B5CF6; color: white; padding: 4px 12px; border-radius: 999px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <div class="logo">ASIREX</div>
                <div class="name">${credentials.name}</div>
                <div class="role">${credentials.role}</div>
                ${isCorePillar ? `<div class="core-badge">Core Pillar</div>` : ''}
              </div>
              <div class="info"><span class="label">Serial Number:</span> <span class="value">${credentials.serialNumber}</span></div>
              <div class="info"><span class="label">Department:</span> <span class="value">${credentials.department}</span></div>
              <div class="info"><span class="label">Email:</span> <span class="value">${credentials.email}</span></div>
              ${credentials.phone ? `<div class="info"><span class="label">Phone:</span> <span class="value">${credentials.phone}</span></div>` : ''}
              <div class="info"><span class="label">Join Date:</span> <span class="value">${credentials.joinDate}</span></div>
              <div class="credentials">
                <div style="font-weight: bold; margin-bottom: 8px;">Login Credentials</div>
                <div class="credential-item"><span class="label">Email:</span> ${credentials.email}</div>
                <div class="credential-item"><span class="label">Password:</span> ${credentials.password}</div>
                <div class="credential-item"><span class="label">Login URL:</span> ${window.location.origin}/authority-login</div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCardClick = () => {
    onOpenChange(false);
    navigate('/authority-login?type=admin');
  };

  const handleCorePillarToggle = (checked: boolean) => {
    setIsCorePillar(checked);
    onCoreTypeChange?.(checked);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IdCard className="w-5 h-5 text-primary" />
            Team Member ID Card Generated
          </DialogTitle>
        </DialogHeader>

        <div ref={cardRef} className="space-y-4">
          {/* ID Card Visual - Clickable */}
          <div 
            onClick={handleCardClick}
            className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 border-2 border-primary/30 rounded-xl p-6 overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group"
          >
            {/* Click hint */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Go to Login
              </Badge>
            </div>

            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <img src={asirexLogo} alt="ASIREX" className="w-8 h-8 object-contain" />
                <span className="font-bold text-lg text-primary">ASIREX</span>
              </div>
              <Badge className={`${roleColorClass} flex items-center gap-1`}>
                <RoleIcon className="w-3 h-3" />
                {isCorePillar ? "Core Pillar" : credentials.coreType || "Team Member"}
              </Badge>
            </div>

            {/* Profile Section */}
            <div className="flex items-start gap-4 mb-4 relative z-10">
              <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center border-2 border-primary/30 overflow-hidden">
                {credentials.photo ? (
                  <img src={credentials.photo} alt={credentials.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-primary/60" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-foreground">{credentials.name}</h3>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <RoleIcon className="w-4 h-4" />
                  <span>{credentials.role}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{credentials.serialNumber}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm relative z-10">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{credentials.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{credentials.joinDate}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate">{credentials.email}</span>
              </div>
              {credentials.phone && (
                <div className="flex items-center gap-2 col-span-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{credentials.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Core Pillar Toggle */}
          <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-purple-500" />
              <Label htmlFor="core-toggle" className="text-sm font-medium">Mark as Core Pillar</Label>
            </div>
            <Switch
              id="core-toggle"
              checked={isCorePillar}
              onCheckedChange={handleCorePillarToggle}
            />
          </div>

          {/* Login Credentials Section */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-amber-500">Login Credentials</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-background/50 rounded-md px-3 py-2">
                <div>
                  <span className="text-xs text-muted-foreground">Email</span>
                  <p className="font-mono text-sm">{credentials.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(credentials.email, "Email")}
                >
                  {copied === "Email" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="flex items-center justify-between bg-background/50 rounded-md px-3 py-2">
                <div>
                  <span className="text-xs text-muted-foreground">Password</span>
                  <p className="font-mono text-sm">{credentials.password}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(credentials.password, "Password")}
                >
                  {copied === "Password" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-3">
              Login at: <code className="bg-muted px-1 rounded">{window.location.origin}/authority-login</code>
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={copyAllCredentials} className="flex-1">
            <Copy className="w-4 h-4 mr-2" />
            Copy All
          </Button>
          <Button variant="outline" onClick={handlePrint} className="flex-1">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
