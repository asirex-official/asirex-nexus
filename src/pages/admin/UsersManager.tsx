import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Phone, Calendar, Shield, Edit, Search, Trash2, Activity, Key, ShoppingCart, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserWithDetails {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  birthdate: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: { role: string; department: string | null }[];
  ordersCount: number;
  totalSpent: number;
}

interface ActivityLog {
  id: string;
  userId: string;
  actionType: string;
  actionDetails: Record<string, any>;
  createdAt: string;
}

function calculateAge(birthdate: string | null): number | null {
  if (!birthdate) return null;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function UsersManager() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [userActivities, setUserActivities] = useState<ActivityLog[]>([]);
  const [newRole, setNewRole] = useState<string>('user');
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    birthdate: "",
  });

  // Fetch users with roles and order stats
  const { data: users, isLoading } = useQuery({
    queryKey: ["users-with-details"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const userIds = profiles?.map(p => p.user_id) || [];
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("user_id, role, department")
        .in("user_id", userIds.length > 0 ? userIds : ["none"]);

      // Fetch orders for stats
      const { data: ordersData } = await supabase
        .from("orders")
        .select("user_id, total_amount");

      const orderStats = ordersData?.reduce((acc, order) => {
        if (order.user_id) {
          if (!acc[order.user_id]) acc[order.user_id] = { count: 0, total: 0 };
          acc[order.user_id].count++;
          acc[order.user_id].total += order.total_amount || 0;
        }
        return acc;
      }, {} as Record<string, { count: number; total: number }>) || {};

      return profiles?.map(p => ({
        id: p.id,
        user_id: p.user_id,
        full_name: p.full_name,
        phone: p.phone,
        birthdate: p.birthdate,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        roles: rolesData?.filter(r => r.user_id === p.user_id).map(r => ({
          role: r.role,
          department: r.department
        })) || [],
        ordersCount: orderStats[p.user_id]?.count || 0,
        totalSpent: orderStats[p.user_id]?.total || 0,
      })) as UserWithDetails[];
    },
  });

  const filteredUsers = users?.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.includes(searchTerm)
  );

  const openEditDialog = (user: UserWithDetails) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || "",
      phone: user.phone || "",
      birthdate: user.birthdate || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name || null,
          phone: editForm.phone || null,
          birthdate: editForm.birthdate || null,
        })
        .eq("user_id", selectedUser.user_id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["users-with-details"] });
      toast.success("User profile updated successfully");
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update user profile");
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    
    try {
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", selectedUser.user_id)
        .single();

      if (existingRole) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole as any })
          .eq("user_id", selectedUser.user_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: selectedUser.user_id, role: newRole as any });
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["users-with-details"] });
      setShowRoleDialog(false);
      toast.success("User role updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  };

  const handleViewActivity = async (user: UserWithDetails) => {
    setSelectedUser(user);
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.user_id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setUserActivities((data || []).map(log => ({
        id: log.id,
        userId: log.user_id,
        actionType: log.action_type,
        actionDetails: log.action_details as Record<string, any>,
        createdAt: log.created_at,
      })));
      setShowActivityDialog(true);
    } catch (error: any) {
      toast.error("Failed to load activity log");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ user_id: selectedUser.user_id }),
        }
      );

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete user");
      }

      queryClient.invalidateQueries({ queryKey: ["users-with-details"] });
      setShowDeleteDialog(false);
      toast.success("User deleted completely from database");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users Manager</h1>
          <p className="text-muted-foreground">
            View and manage registered users with full control
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          <Users className="w-5 h-5 mr-2" />
          {users?.length || 0} Users
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : !filteredUsers?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.full_name || "User"}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="font-semibold text-primary">
                                {user.full_name?.charAt(0) || user.user_id.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {user.full_name || "Unnamed User"}
                            </p>
                            <code className="text-xs text-muted-foreground">
                              {user.user_id.slice(0, 8)}...
                            </code>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.roles.length > 0 ? (
                          user.roles.map((r, idx) => (
                            <Badge key={idx} variant="outline" className="capitalize mr-1">
                              {r.role.replace("_", " ")}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary">User</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.birthdate ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {calculateAge(user.birthdate)} yrs
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-green-500">
                          <ShoppingCart className="w-4 h-4" />
                          {user.ordersCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-emerald-500 font-medium">
                          <DollarSign className="w-4 h-4" />
                          ₹{user.totalSpent.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewActivity(user)}
                            title="View Activity"
                          >
                            <Activity className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                            title="Edit Profile"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.roles[0]?.role || "user");
                              setShowRoleDialog(true);
                            }}
                            title="Manage Role"
                          >
                            <Key className="w-4 h-4 text-yellow-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteDialog(true);
                            }}
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-amber-500/10 border-amber-500/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-500">Security Notice</h3>
              <p className="text-sm text-muted-foreground">
                User passwords are securely hashed and cannot be viewed. This is
                a security best practice to protect user accounts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit User Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label>Birthdate</Label>
              <Input
                type="date"
                value={editForm.birthdate}
                onChange={(e) =>
                  setEditForm({ ...editForm, birthdate: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Manage User Role
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Change role for: <span className="font-medium text-foreground">{selectedUser?.full_name || "User"}</span>
            </p>
            <div className="space-y-2">
              <Label>Select Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="core_member">Core Member</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete User Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm text-destructive font-medium mb-2">⚠️ Warning: This action cannot be undone!</p>
              <p className="text-sm text-muted-foreground">
                You are about to delete the account for <span className="font-semibold text-foreground">{selectedUser?.full_name || "User"}</span>.
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>User ID:</strong> {selectedUser?.user_id}</p>
              <p><strong>Orders placed:</strong> {selectedUser?.ordersCount || 0}</p>
              <p><strong>Total spent:</strong> ₹{selectedUser?.totalSpent?.toLocaleString() || 0}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              This will delete the user's profile, roles, and activity logs. Their order history will be preserved for business records.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} className="gap-2">
              <Trash2 className="w-4 h-4" />Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Activity Log Dialog */}
      <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Activity Log - {selectedUser?.full_name || "User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[50vh] overflow-y-auto">
            {userActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No activity recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.actionType === "order_placed" ? "bg-green-500/20 text-green-500" :
                      activity.actionType === "login" ? "bg-blue-500/20 text-blue-500" :
                      activity.actionType === "profile_updated" ? "bg-yellow-500/20 text-yellow-500" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {activity.actionType === "order_placed" ? <ShoppingCart className="w-4 h-4" /> :
                       activity.actionType === "login" ? <Key className="w-4 h-4" /> :
                       <Activity className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{activity.actionType.replace(/_/g, " ")}</p>
                      {activity.actionDetails && Object.keys(activity.actionDetails).length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {activity.actionType === "order_placed" && activity.actionDetails.total_amount && (
                            <span>Order amount: ₹{activity.actionDetails.total_amount.toLocaleString()}</span>
                          )}
                          {activity.actionDetails.items_count && (
                            <span className="ml-2">• {activity.actionDetails.items_count} items</span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivityDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
