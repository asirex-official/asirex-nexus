import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Shield, Briefcase, Key, ChevronRight, Check, AlertCircle, User, Building } from "lucide-react";
import { useState, useEffect } from "react";
import { AdminPermissionsSelector } from "./AdminPermissionsSelector";

interface LoginPathSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  currentRole: string;
  currentDepartment: string;
  onConfirm: (data: {
    loginPath: "user" | "manager" | "admin";
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
    id: "user" as const,
    label: "Regular User",
    description: "Basic user access, no admin dashboard or ID card",
    icon: Briefcase,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
    noCard: true,
    permissionCount: 0,
  },
  {
    id: "manager" as const,
    label: "Managers & Core Members",
    description: "Access to management dashboard with ID card",
    icon: Users,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
    noCard: false,
    permissionCount: 8,
  },
  {
    id: "admin" as const,
    label: "Admin & Leadership",
    description: "Full admin access with all privileges",
    icon: Shield,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    noCard: false,
    permissionCount: 20,
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

const coreTypes = {
  admin: ["Founding Core", "Core Pillar", "Head and Lead"],
  manager: ["Manager", "Core Member", "Team Lead", "Developer"],
};

const designations = {
  admin: [
    "CEO & Founder",
    "Production Head and Manager",
    "Sales Lead and Head",
    "Core Members and Managing Team Lead",
    "Engineering and R&D Lead",
    "Website Admin and SWE",
  ],
  manager: [
    "Senior AI Engineer",
    "Robotics Software Developer",
    "Product Designer",
    "Machine Learning Engineer",
    "Embedded Systems Developer",
    "Marketing Manager",
    "Hardware Engineer",
    "Content Writer & Social Media",
    "Business Development Executive",
    "HR Manager",
    "Finance Manager",
    "Team Lead",
    "Senior Developer",
    "Developer",
  ],
};

export function LoginPathSelector({
  open,
  onOpenChange,
  memberName,
  currentRole,
  currentDepartment,
  onConfirm,
}: LoginPathSelectorProps) {
  const [step, setStep] = useState<"path" | "customize" | "permissions" | "password">("path");
  const [selectedPath, setSelectedPath] = useState<"user" | "manager" | "admin" | null>(null);
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  
  // Customization fields
  const [customRole, setCustomRole] = useState(currentRole);
  const [customDepartment, setCustomDepartment] = useState(currentDepartment);
  const [customCoreType, setCustomCoreType] = useState("");

  // Reset customization when dialog opens
  useEffect(() => {
    if (open) {
      setCustomRole(currentRole);
      setCustomDepartment(currentDepartment);
      setCustomCoreType("");
    }
  }, [open, currentRole, currentDepartment]);

  const handlePathSelect = (pathId: "user" | "manager" | "admin") => {
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
      // Manager or Admin path - go to customize step
      setCustomCoreType(pathId === "admin" ? "Core Pillar" : "Manager");
      setStep("customize");
    }
  };

  const handleCustomizeNext = () => {
    setStep("permissions");
  };

  const handlePermissionsNext = () => {
    setStep("password");
  };

  const handleConfirm = () => {
    onConfirm({
      loginPath: selectedPath || "user",
      role: customRole,
      department: customDepartment,
      coreType: customCoreType,
      isLead: selectedPath === "admin",
      password,
      permissions,
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep("path");
    setSelectedPath(null);
    setPassword("");
    setPermissions([]);
    setCustomRole(currentRole);
    setCustomDepartment(currentDepartment);
    setCustomCoreType("");
    onOpenChange(false);
  };

  const getAppRole = () => {
    if (selectedPath === "admin") return "admin";
    if (selectedPath === "manager") return "manager";
    return "employee";
  };

  const selectedPathInfo = loginPaths.find(p => p.id === selectedPath);
  const availableCoreTypes = selectedPath ? coreTypes[selectedPath as "admin" | "manager"] || [] : [];
  const availableDesignations = selectedPath ? designations[selectedPath as "admin" | "manager"] || [] : [];

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                <User className="w-5 h-5 text-primary" />
                Customize ID Card Details
              </>
            )}
            {step === "permissions" && (
              <>
                <Shield className="w-5 h-5 text-primary" />
                Select Permissions
              </>
            )}
            {step === "password" && (
              <>
                <Key className="w-5 h-5 text-primary" />
                Set Login Password
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Select Login Path */}
        {step === "path" && (
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Choose where <strong>{memberName}</strong> should login:
              </p>
            </div>
            
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
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-background">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{path.label}</div>
                          <div className="text-sm opacity-80">{path.description}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 opacity-50" />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      {path.noCard ? (
                        <Badge variant="secondary" className="text-xs">No ID Card</Badge>
                      ) : (
                        <>
                          <Badge variant="default" className="text-xs">ID Card Generated</Badge>
                          <Badge variant="outline" className="text-xs">{path.permissionCount} Permissions</Badge>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Customize Card Details */}
        {step === "customize" && selectedPath && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              {selectedPath === "manager" && <Users className="w-5 h-5 text-purple-500" />}
              {selectedPath === "admin" && <Shield className="w-5 h-5 text-amber-500" />}
              <span className="font-medium">
                {selectedPathInfo?.label} - Customize Card Details
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Customize the role, department, and core type for this team member's ID card.
            </p>

            <div className="space-y-4">
              {/* Role/Designation */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Role / Designation
                </Label>
                <Select value={customRole || undefined} onValueChange={setCustomRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDesignations.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                    {!availableDesignations.includes(currentRole) && currentRole && currentRole.trim() !== "" && (
                      <SelectItem value={currentRole}>
                        {currentRole} (current)
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Department
                </Label>
                <Select value={customDepartment || undefined} onValueChange={setCustomDepartment}>
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

              {/* Core Type */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Core Type
                </Label>
                <Select value={customCoreType || undefined} onValueChange={setCustomCoreType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select core type" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCoreTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-muted/50 rounded-lg border space-y-2">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Card Preview</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{memberName}</p>
                  <p className="text-sm text-muted-foreground">{customRole}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">{customDepartment}</Badge>
                <Badge variant="outline" className="text-xs">{customCoreType}</Badge>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setStep("path")}>
                Back
              </Button>
              <Button onClick={handleCustomizeNext}>
                Next: Permissions
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Select Permissions */}
        {step === "permissions" && selectedPath && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              {selectedPath === "manager" && <Users className="w-5 h-5 text-purple-500" />}
              {selectedPath === "admin" && <Shield className="w-5 h-5 text-amber-500" />}
              <span className="font-medium">
                {selectedPathInfo?.label} - Choose permissions for this user
              </span>
            </div>

            <AdminPermissionsSelector
              selectedRole={getAppRole()}
              permissions={permissions}
              onPermissionsChange={setPermissions}
              loginPath={selectedPath}
            />

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <strong>{permissions.length}</strong> permissions selected
                {permissions.length === 0 && (
                  <span className="text-amber-500 ml-2">— At least 1 permission recommended</span>
                )}
              </p>
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setStep("customize")}>
                Back
              </Button>
              <Button onClick={handlePermissionsNext}>
                Next: Set Password
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 4: Password */}
        {step === "password" && (
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Login Path:</span>
                <Badge variant={selectedPath === "admin" ? "destructive" : "default"}>
                  {selectedPathInfo?.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium">{customRole}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{customDepartment}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Core Type:</span>
                <Badge variant="outline">{customCoreType}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Permissions:</span>
                <span className="font-medium">{permissions.length} selected</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ID Card:</span>
                <span className="font-medium text-green-500">Will be generated</span>
              </div>
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
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                This password will be shown on the ID Card. User can change it after first login.
              </p>
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setStep("permissions")}>
                Back
              </Button>
              <Button onClick={handleConfirm} className="bg-green-500 hover:bg-green-600">
                <Check className="w-4 h-4 mr-1" />
                Create User & Generate Card
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
