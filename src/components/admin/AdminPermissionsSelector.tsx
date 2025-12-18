import { useState, useEffect } from "react";
import { Shield, Check, AlertTriangle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface AdminPermission {
  id: string;
  label: string;
  description: string;
  category: string;
}

const allPermissions: AdminPermission[] = [
  // Team Management
  { id: "manage_team", label: "Manage Team", description: "Add, edit, fire team members", category: "Team" },
  { id: "view_salaries", label: "View Salaries", description: "Access salary information", category: "Team" },
  { id: "approve_salaries", label: "Approve Salaries", description: "Approve salary requests", category: "Team" },
  { id: "assign_tasks", label: "Assign Tasks", description: "Create and assign tasks", category: "Team" },
  
  // Content Management
  { id: "edit_products", label: "Edit Products", description: "Manage product catalog", category: "Content" },
  { id: "edit_projects", label: "Edit Projects", description: "Manage projects", category: "Content" },
  { id: "edit_events", label: "Edit Events", description: "Manage events", category: "Content" },
  { id: "edit_content", label: "Edit Site Content", description: "Manage website content", category: "Content" },
  
  // Orders & Finance
  { id: "view_orders", label: "View Orders", description: "Access order information", category: "Finance" },
  { id: "manage_orders", label: "Manage Orders", description: "Update order status", category: "Finance" },
  { id: "view_analytics", label: "View Analytics", description: "Access business analytics", category: "Finance" },
  { id: "manage_expenses", label: "Manage Expenses", description: "Track and approve expenses", category: "Finance" },
  
  // System
  { id: "manage_users", label: "Manage Users", description: "Manage user accounts", category: "System" },
  { id: "view_logs", label: "View Logs", description: "Access activity logs", category: "System" },
  { id: "site_settings", label: "Site Settings", description: "Modify site settings", category: "System" },
];

const rolePresets: Record<string, string[]> = {
  "super_admin": allPermissions.map(p => p.id),
  "admin": ["manage_team", "view_salaries", "assign_tasks", "edit_products", "edit_projects", "edit_events", "edit_content", "view_orders", "manage_orders", "view_analytics", "manage_users", "view_logs"],
  "manager": ["manage_team", "view_salaries", "assign_tasks", "edit_projects", "view_orders", "view_analytics"],
  "developer": ["edit_products", "edit_projects", "edit_content"],
  "core_member": ["assign_tasks", "edit_projects", "view_analytics"],
  "employee": ["edit_content"],
};

interface AdminPermissionsSelectorProps {
  selectedRole: string;
  permissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  disabled?: boolean;
}

export function AdminPermissionsSelector({ 
  selectedRole, 
  permissions, 
  onPermissionsChange,
  disabled = false 
}: AdminPermissionsSelectorProps) {
  const [customMode, setCustomMode] = useState(false);

  // Auto-set permissions based on role
  useEffect(() => {
    if (!customMode && rolePresets[selectedRole]) {
      onPermissionsChange(rolePresets[selectedRole]);
    }
  }, [selectedRole, customMode]);

  const togglePermission = (permissionId: string) => {
    if (disabled) return;
    setCustomMode(true);
    if (permissions.includes(permissionId)) {
      onPermissionsChange(permissions.filter(p => p !== permissionId));
    } else {
      onPermissionsChange([...permissions, permissionId]);
    }
  };

  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, AdminPermission[]>);

  const isHighPrivilegeRole = ["super_admin", "admin"].includes(selectedRole);

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <Label className="font-semibold">Admin Permissions</Label>
        </div>
        <Badge variant={isHighPrivilegeRole ? "destructive" : "secondary"}>
          {permissions.length}/{allPermissions.length} permissions
        </Badge>
      </div>

      {isHighPrivilegeRole && (
        <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-500">High Privilege Role</p>
            <p className="text-muted-foreground">
              This role has extensive access. Assign carefully.
            </p>
          </div>
        </div>
      )}

      {customMode && (
        <button
          type="button"
          onClick={() => {
            setCustomMode(false);
            if (rolePresets[selectedRole]) {
              onPermissionsChange(rolePresets[selectedRole]);
            }
          }}
          className="text-xs text-primary hover:underline"
        >
          Reset to default for {selectedRole.replace("_", " ")}
        </button>
      )}

      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([category, perms]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {perms.map(perm => (
                <label
                  key={perm.id}
                  className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    permissions.includes(perm.id)
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-background/50 border border-transparent hover:border-border"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Checkbox
                    checked={permissions.includes(perm.id)}
                    onCheckedChange={() => togglePermission(perm.id)}
                    disabled={disabled}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{perm.label}</span>
                      {permissions.includes(perm.id) && (
                        <Check className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{perm.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
