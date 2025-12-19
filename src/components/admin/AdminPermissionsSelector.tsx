import { useState, useEffect } from "react";
import { Shield, Check, AlertTriangle, Eye, Users, ShoppingCart, Settings, FileText, BarChart, DollarSign, Bell, Lock, Trash, Edit, Plus, Calendar, MessageSquare, Database, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminPermission {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  level: "admin" | "manager" | "basic"; // Which levels can see this permission
}

// 20 granular permissions for admin, 8 for managers
const allPermissions: AdminPermission[] = [
  // Team Management (5 permissions)
  { id: "view_team", label: "View Team Members", description: "See all team member profiles", category: "Team", icon: Eye, level: "basic" },
  { id: "manage_team", label: "Add/Edit Team Members", description: "Add new members and edit details", category: "Team", icon: Users, level: "manager" },
  { id: "fire_team", label: "Remove Team Members", description: "Fire or deactivate members", category: "Team", icon: Trash, level: "admin" },
  { id: "view_salaries", label: "View Salary Data", description: "Access salary information", category: "Team", icon: DollarSign, level: "admin" },
  { id: "approve_salaries", label: "Approve Salary Requests", description: "Approve or reject salary payments", category: "Team", icon: Check, level: "admin" },
  
  // Task Management (3 permissions)
  { id: "view_tasks", label: "View All Tasks", description: "See tasks across departments", category: "Tasks", icon: FileText, level: "basic" },
  { id: "assign_tasks", label: "Assign Tasks", description: "Create and assign tasks to members", category: "Tasks", icon: Plus, level: "manager" },
  { id: "manage_tasks", label: "Manage All Tasks", description: "Edit and delete any task", category: "Tasks", icon: Edit, level: "manager" },
  
  // Content Management (4 permissions)
  { id: "edit_products", label: "Manage Products", description: "Add, edit, delete products", category: "Content", icon: ShoppingCart, level: "manager" },
  { id: "edit_projects", label: "Manage Projects", description: "Create and edit projects", category: "Content", icon: Zap, level: "manager" },
  { id: "edit_events", label: "Manage Events", description: "Create and manage events", category: "Content", icon: Calendar, level: "manager" },
  { id: "edit_content", label: "Edit Site Content", description: "Modify website pages", category: "Content", icon: FileText, level: "admin" },
  
  // Orders & Finance (4 permissions)
  { id: "view_orders", label: "View Orders", description: "Access order list and details", category: "Finance", icon: ShoppingCart, level: "basic" },
  { id: "manage_orders", label: "Manage Orders", description: "Update order status and shipping", category: "Finance", icon: Edit, level: "manager" },
  { id: "view_analytics", label: "View Analytics", description: "Access business dashboards", category: "Finance", icon: BarChart, level: "manager" },
  { id: "manage_expenses", label: "Manage Expenses", description: "Track and approve expenses", category: "Finance", icon: DollarSign, level: "admin" },
  
  // System & Security (4 permissions)
  { id: "manage_users", label: "Manage User Accounts", description: "Create/modify user logins", category: "System", icon: Users, level: "admin" },
  { id: "view_logs", label: "View Activity Logs", description: "Access security & audit logs", category: "System", icon: FileText, level: "admin" },
  { id: "manage_notices", label: "Post Notices", description: "Create team announcements", category: "System", icon: Bell, level: "manager" },
  { id: "site_settings", label: "Site Settings", description: "Modify system configuration", category: "System", icon: Settings, level: "admin" },
];

// Admin gets all 20 permissions available to select
// Manager gets 8 permissions available to select
const rolePresets: Record<string, string[]> = {
  "super_admin": allPermissions.map(p => p.id),
  "admin": ["view_team", "manage_team", "fire_team", "view_salaries", "approve_salaries", "view_tasks", "assign_tasks", "manage_tasks", "edit_products", "edit_projects", "edit_events", "edit_content", "view_orders", "manage_orders", "view_analytics", "manage_expenses", "manage_users", "view_logs", "manage_notices", "site_settings"],
  "manager": ["view_team", "manage_team", "view_tasks", "assign_tasks", "manage_tasks", "edit_projects", "view_orders", "view_analytics", "manage_notices"],
  "developer": ["view_team", "view_tasks", "edit_products", "edit_projects", "edit_content"],
  "core_member": ["view_team", "view_tasks", "assign_tasks", "edit_projects", "view_analytics"],
  "employee": ["view_team", "view_tasks"],
};

// Admin can see all 20, Manager can see only manager+basic level (8)
const getAvailablePermissions = (loginPath: string): AdminPermission[] => {
  if (loginPath === "admin") {
    return allPermissions; // All 20
  }
  // Manager sees only manager and basic level permissions (8)
  return allPermissions.filter(p => p.level === "manager" || p.level === "basic");
};

interface AdminPermissionsSelectorProps {
  selectedRole: string;
  permissions: string[];
  onPermissionsChange: (permissions: string[]) => void;
  disabled?: boolean;
  loginPath?: "admin" | "manager" | "user";
}

export function AdminPermissionsSelector({ 
  selectedRole, 
  permissions, 
  onPermissionsChange,
  disabled = false,
  loginPath = "admin"
}: AdminPermissionsSelectorProps) {
  const [customMode, setCustomMode] = useState(false);

  const availablePermissions = getAvailablePermissions(loginPath);

  // Auto-set permissions based on role
  useEffect(() => {
    if (!customMode && rolePresets[selectedRole]) {
      // Filter preset permissions by what's available for this login path
      const presetPerms = rolePresets[selectedRole];
      const availableIds = availablePermissions.map(p => p.id);
      const filteredPerms = presetPerms.filter(p => availableIds.includes(p));
      onPermissionsChange(filteredPerms);
    }
  }, [selectedRole, customMode, loginPath]);

  const togglePermission = (permissionId: string) => {
    if (disabled) return;
    setCustomMode(true);
    if (permissions.includes(permissionId)) {
      onPermissionsChange(permissions.filter(p => p !== permissionId));
    } else {
      onPermissionsChange([...permissions, permissionId]);
    }
  };

  const groupedPermissions = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, AdminPermission[]>);

  const isHighPrivilegeRole = ["super_admin", "admin"].includes(selectedRole);
  const totalAvailable = availablePermissions.length;

  const selectAll = () => {
    setCustomMode(true);
    onPermissionsChange(availablePermissions.map(p => p.id));
  };

  const clearAll = () => {
    setCustomMode(true);
    onPermissionsChange([]);
  };

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <Label className="font-semibold">
            {loginPath === "admin" ? "Admin Permissions (20 available)" : "Manager Permissions (8 available)"}
          </Label>
        </div>
        <Badge variant={isHighPrivilegeRole ? "destructive" : "secondary"}>
          {permissions.length}/{totalAvailable} selected
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

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={selectAll}
          disabled={disabled}
          className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
        >
          Select All ({totalAvailable})
        </button>
        <button
          type="button"
          onClick={clearAll}
          disabled={disabled}
          className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
        >
          Clear All
        </button>
        {customMode && (
          <button
            type="button"
            onClick={() => {
              setCustomMode(false);
              if (rolePresets[selectedRole]) {
                const presetPerms = rolePresets[selectedRole];
                const availableIds = availablePermissions.map(p => p.id);
                onPermissionsChange(presetPerms.filter(p => availableIds.includes(p)));
              }
            }}
            className="text-xs text-primary hover:underline ml-auto"
          >
            Reset to defaults
          </button>
        )}
      </div>

      <ScrollArea className="h-[280px] pr-4">
        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                {category}
                <Badge variant="outline" className="text-xs">
                  {perms.filter(p => permissions.includes(p.id)).length}/{perms.length}
                </Badge>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {perms.map(perm => {
                  const Icon = perm.icon;
                  return (
                    <label
                      key={perm.id}
                      className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
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
                      <Icon className={`w-4 h-4 mt-0.5 ${permissions.includes(perm.id) ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{perm.label}</span>
                          {perm.level === "admin" && (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0">Admin</Badge>
                          )}
                          {permissions.includes(perm.id) && (
                            <Check className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export { allPermissions, rolePresets };
