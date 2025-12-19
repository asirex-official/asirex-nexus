import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Briefcase, Key, ChevronRight, Check, AlertCircle } from "lucide-react";
import { useState } from "react";
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
    description: "Access to management dashboard with ID card (8 permissions)",
    icon: Users,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
    noCard: false,
    permissionCount: 8,
  },
  {
    id: "admin" as const,
    label: "Admin & Leadership",
    description: "Full admin access with all privileges (20 permissions)",
    icon: Shield,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    noCard: false,
    permissionCount: 20,
  },
];

export function LoginPathSelector({
  open,
  onOpenChange,
  memberName,
  currentRole,
  currentDepartment,
  onConfirm,
}: LoginPathSelectorProps) {
  const [step, setStep] = useState<"path" | "permissions" | "password">("path");
  const [selectedPath, setSelectedPath] = useState<"user" | "manager" | "admin" | null>(null);
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

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
      // Manager or Admin path - go to permissions
      setStep("permissions");
    }
  };

  const handlePermissionsNext = () => {
    setStep("password");
  };

  const handleConfirm = () => {
    onConfirm({
      loginPath: selectedPath || "user",
      role: currentRole,
      department: currentDepartment,
      coreType: selectedPath === "admin" ? "Core Pillar" : "Manager",
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
    onOpenChange(false);
  };

  const getAppRole = () => {
    if (selectedPath === "admin") return "admin";
    if (selectedPath === "manager") return "manager";
    return "employee";
  };

  const selectedPathInfo = loginPaths.find(p => p.id === selectedPath);

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
            {step === "permissions" && (
              <>
                <Shield className="w-5 h-5 text-primary" />
                Select Permissions ({selectedPath === "admin" ? "20 available" : "8 available"})
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
                No predefined card template found for <strong>{currentRole}</strong>. 
                Choose where this team member should login:
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

        {/* Step 2: Select Permissions */}
        {step === "permissions" && selectedPath && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              {selectedPath === "manager" && <Users className="w-5 h-5 text-purple-500" />}
              {selectedPath === "admin" && <Shield className="w-5 h-5 text-amber-500" />}
              <span className="font-medium">
                {selectedPathInfo?.label} - Choose permissions for this user
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              {selectedPath === "admin" 
                ? "Admin & Leadership can access all 20 permissions. Select which ones to grant:"
                : "Managers & Core Members can access 8 permissions. Select which ones to grant:"
              }
            </p>

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
              <Button variant="outline" onClick={() => setStep("path")}>
                Back
              </Button>
              <Button onClick={handlePermissionsNext}>
                Next: Set Password
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Password */}
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
