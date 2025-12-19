import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Briefcase, Key, Building, Crown, ChevronRight, Check } from "lucide-react";
import { useState } from "react";
import { AdminPermissionsSelector } from "./AdminPermissionsSelector";

interface LoginPathSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  currentRole: string;
  currentDepartment: string;
  onConfirm: (data: {
    loginPath: string;
    role: string;
    department: string;
    coreType: string;
    isLead: boolean;
    password: string;
    permissions: string[];
  }) => void;
}

const loginPaths = [
  {
    id: "user",
    label: "Regular User",
    description: "Basic user access, no admin dashboard",
    icon: Briefcase,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    noCard: true,
  },
  {
    id: "manager",
    label: "Managers & Core Members",
    description: "Access to management dashboard with ID card",
    icon: Users,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
    noCard: false,
  },
  {
    id: "admin",
    label: "Admin & Leadership",
    description: "Full admin access with all privileges",
    icon: Shield,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    noCard: false,
  },
];

const departments = [
  "Executive Leadership",
  "Production & Operations",
  "Sales & Marketing",
  "Technology & Development",
  "Research & Development",
  "Human Resources",
  "Finance & Accounting",
  "AI & Machine Learning",
  "Robotics Engineering",
  "Design & UX",
  "Hardware Engineering",
  "Marketing & Growth",
  "Business Development",
  "Software Engineering",
  "Management",
];

const rolesByPath: Record<string, string[]> = {
  manager: [
    "Department Manager",
    "Team Lead",
    "Project Manager",
    "Core Member",
    "Senior Developer",
    "Operations Manager",
  ],
  admin: [
    "Production Head and Manager",
    "Sales Lead and Head",
    "Core Members and Managing Team Lead",
    "Engineering and R&D Lead",
    "Website Admin and SWE",
    "Department Head",
  ],
};

const coreTypes = ["Core Pillar", "Head and Lead", "Manager", "Team Lead", "Core Member"];

export function LoginPathSelector({
  open,
  onOpenChange,
  memberName,
  currentRole,
  currentDepartment,
  onConfirm,
}: LoginPathSelectorProps) {
  const [step, setStep] = useState<"path" | "customize" | "password">("path");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState(currentRole);
  const [customDepartment, setCustomDepartment] = useState(currentDepartment);
  const [customCoreType, setCustomCoreType] = useState("");
  const [isLead, setIsLead] = useState(false);
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

  const handlePathSelect = (pathId: string) => {
    setSelectedPath(pathId);
    const path = loginPaths.find(p => p.id === pathId);
    
    if (path?.noCard) {
      // Regular user - no card, just confirm
      onConfirm({
        loginPath: pathId,
        role: currentRole,
        department: currentDepartment,
        coreType: "",
        isLead: false,
        password: "",
        permissions: [],
      });
      resetAndClose();
    } else {
      // Manager or Admin path - go to customize
      setStep("customize");
    }
  };

  const handleCustomizeNext = () => {
    setStep("password");
  };

  const handleConfirm = () => {
    onConfirm({
      loginPath: selectedPath || "user",
      role: customRole,
      department: customDepartment,
      coreType: customCoreType,
      isLead,
      password,
      permissions,
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep("path");
    setSelectedPath(null);
    setCustomRole(currentRole);
    setCustomDepartment(currentDepartment);
    setCustomCoreType("");
    setIsLead(false);
    setPassword("");
    setPermissions([]);
    onOpenChange(false);
  };

  const getAppRole = () => {
    if (selectedPath === "admin") return "manager";
    if (customCoreType === "Core Pillar") return "core_member";
    if (isLead) return "manager";
    return "employee";
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "path" && (
              <>
                <Users className="w-5 h-5 text-primary" />
                Select Login Path for {memberName}
              </>
            )}
            {step === "customize" && (
              <>
                <Building className="w-5 h-5 text-primary" />
                Customize Role & Department
              </>
            )}
            {step === "password" && (
              <>
                <Key className="w-5 h-5 text-primary" />
                Set Access & Password
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Select Login Path */}
        {step === "path" && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground mb-4">
              No predefined card template found for this role. Please select where this team member should login:
            </p>
            
            <div className="space-y-3">
              {loginPaths.map((path) => {
                const Icon = path.icon;
                return (
                  <button
                    key={path.id}
                    onClick={() => handlePathSelect(path.id)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50 hover:bg-primary/5 ${path.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-background">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold">{path.label}</div>
                          <div className="text-sm opacity-80">{path.description}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-50" />
                    </div>
                    {path.noCard && (
                      <Badge variant="secondary" className="mt-2 text-xs">No ID Card Generated</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Customize Role & Department */}
        {step === "customize" && selectedPath && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20 mb-4">
              {selectedPath === "manager" && <Users className="w-5 h-5 text-purple-500" />}
              {selectedPath === "admin" && <Shield className="w-5 h-5 text-amber-500" />}
              <span className="font-medium">
                {loginPaths.find(p => p.id === selectedPath)?.label}
              </span>
            </div>

            <div className="space-y-2">
              <Label>Role/Position</Label>
              <Select value={customRole} onValueChange={setCustomRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {rolesByPath[selectedPath]?.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                  <SelectItem value={currentRole}>{currentRole} (Original)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={customDepartment} onValueChange={setCustomDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Core Type</Label>
              <Select value={customCoreType} onValueChange={setCustomCoreType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select core type (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {coreTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-indigo-500" />
                <Label htmlFor="lead-toggle" className="text-sm font-medium">Mark as Lead/Head</Label>
              </div>
              <Switch
                id="lead-toggle"
                checked={isLead}
                onCheckedChange={setIsLead}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setStep("path")}>
                Back
              </Button>
              <Button onClick={handleCustomizeNext}>
                Next: Set Password
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Password & Permissions */}
        {step === "password" && (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium">{customRole}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{customDepartment}</span>
              </div>
              {customCoreType && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Core Type:</span>
                  <Badge variant="secondary">{customCoreType}</Badge>
                </div>
              )}
              {isLead && (
                <div className="flex items-center gap-2 text-sm text-amber-500">
                  <Crown className="w-4 h-4" />
                  <span>Lead/Head Status</span>
                </div>
              )}
            </div>

            <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                Set Login Password
              </Label>
              <Input
                id="password"
                type="text"
                placeholder="Leave empty for auto-generated password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Creates a login account for admin dashboard access.
              </p>
            </div>

            <AdminPermissionsSelector
              selectedRole={getAppRole()}
              permissions={permissions}
              onPermissionsChange={setPermissions}
            />

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setStep("customize")}>
                Back
              </Button>
              <Button onClick={handleConfirm} className="bg-green-500 hover:bg-green-600">
                <Check className="w-4 h-4 mr-1" />
                Confirm & Generate Card
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
