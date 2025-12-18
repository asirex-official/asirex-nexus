import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Upload, Mail, Phone, Building, Briefcase, DollarSign, Key, X, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { TeamMemberIDCard } from "./TeamMemberIDCard";
import { AdminPermissionsSelector } from "./AdminPermissionsSelector";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "active" | "inactive";
  joinDate: string;
  salary: string;
  email: string;
  phone?: string;
  photo?: string;
  coreType?: string;
  designation?: string;
  serialNumber?: string;
  lastSeen?: string;
}

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (member: TeamMember) => void;
}

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

const roles = [
  "CEO & Founder",
  "Production Head and Manager",
  "Sales Lead and Head",
  "Core Members and Managing Team Lead",
  "Engineering and R&D Lead",
  "Website Admin and SWE",
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
  "Junior Developer",
  "Intern",
];

const coreTypes = ["Founding Core", "Core Pillar", "Head and Lead", "Manager", "Developer", "Core Member", "Team Lead", "Employee", "Intern"];

export function AddTeamMemberDialog({ open, onOpenChange, onAdd }: AddTeamMemberDialogProps) {
  const auditLogger = useAuditLog();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    salary: "",
    coreType: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showIDCard, setShowIDCard] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
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
  } | null>(null);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);

  const generateSerialNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `ASX-${year}-${randomNum}`;
  };

  const generateTemporaryPassword = () => {
    return `ASIREX@${Math.random().toString(36).slice(-8)}`;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadProfileImage = async (teamMemberId: string): Promise<string | null> => {
    if (!profileImage) return null;
    
    const fileExt = profileImage.name.split('.').pop();
    const fileName = `${teamMemberId}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('team-profiles')
      .upload(fileName, profileImage);
    
    if (error) {
      console.error("Error uploading image:", error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('team-profiles')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role || !formData.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const serialNumber = generateSerialNumber();
      const salaryValue = formData.salary ? parseFloat(formData.salary.replace(/[₹,]/g, '')) : 0;
      const tempPassword = formData.password || generateTemporaryPassword();
      
      // Determine if this is a core pillar or admin role
      const isCorePillar = formData.coreType === "Core Pillar" || formData.coreType === "Founding Core";
      const isAdminRole = ["CEO & Founder", "Production Head and Manager", "Sales Lead and Head", 
        "Core Members and Managing Team Lead", "Engineering and R&D Lead", "Website Admin and SWE"].includes(formData.role);

      // Create auth account for admin/core roles
      let userId: string | null = null;
      if (isAdminRole || isCorePillar) {
        // Sign up the new team member with auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: tempPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.name,
            }
          }
        });

        if (authError) {
          // If user already exists, that's okay - we'll just add them to team_members
          if (!authError.message.includes("already registered")) {
            throw authError;
          }
        } else if (authData.user) {
          userId = authData.user.id;
          
          // Assign appropriate role based on position
          let roleToAssign: 'admin' | 'manager' | 'developer' | 'core_member' | 'employee' = 'employee';
          if (formData.role.includes("CEO") || formData.coreType === "Founding Core") {
            roleToAssign = 'admin'; // super_admin should be manually assigned
          } else if (formData.role.includes("Head") || formData.role.includes("Lead") || formData.role.includes("Manager")) {
            roleToAssign = 'manager';
          } else if (formData.role.includes("Developer") || formData.role.includes("SWE") || formData.role.includes("Engineer")) {
            roleToAssign = 'developer';
          } else if (isCorePillar) {
            roleToAssign = 'core_member';
          }

          // Add user role
          await supabase.from('user_roles').insert({
            user_id: userId,
            role: roleToAssign,
            department: formData.department
          });
        }
      }

      // Create team member record first to get the ID
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          designation: formData.role,
          salary: salaryValue,
          serial_number: serialNumber,
          is_core_pillar: isCorePillar,
          status: "active",
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload profile image if selected
      let profileImageUrl: string | null = null;
      if (profileImage) {
        profileImageUrl = await uploadProfileImage(data.id);
        if (profileImageUrl) {
          // Update team member with profile image URL
          await supabase
            .from('team_members')
            .update({ profile_image: profileImageUrl })
            .eq('id', data.id);
        }
      }

      const newMember: TeamMember = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: formData.phone,
        role: data.role,
        department: data.department || "",
        salary: formData.salary || "To be decided",
        status: "active",
        joinDate: new Date().toISOString().split("T")[0],
        coreType: formData.coreType,
        serialNumber: data.serial_number || serialNumber,
        photo: profileImageUrl || undefined,
      };

      onAdd(newMember);
      
      // Log audit event
      await auditLogger.logTeamMemberAdded(formData.name, formData.role, formData.department);
      
      // Show ID Card for admin/core roles with credentials
      if (userId && (isAdminRole || isCorePillar)) {
        setCreatedCredentials({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          role: formData.role,
          department: formData.department,
          serialNumber: data.serial_number || serialNumber,
          password: tempPassword,
          coreType: formData.coreType || undefined,
          joinDate: new Date().toISOString().split("T")[0],
          photo: profileImageUrl || undefined,
        });
        setShowIDCard(true);
        toast.success(`${formData.name} added! ID Card generated.`);
      } else {
        toast.success(`${formData.name} has been added to the team!`);
      }
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "",
        department: "",
        salary: "",
        coreType: "",
        password: "",
      });
      setProfileImage(null);
      setPreviewUrl(null);
      setAdminPermissions([]);
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding team member:", error);
      toast.error(error.message || "Failed to add team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserPlus className="w-6 h-6 text-green-500" />
            Add New Team Member
          </DialogTitle>
          <DialogDescription>
            Fill in the details to add a new team member to ASIREX
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${
                previewUrl 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 bg-muted"
              }`}
            >
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full rounded-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center hover:bg-destructive/80"
                  >
                    <X className="w-4 h-4 text-destructive-foreground" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Add Photo</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Click to upload profile photo (Max 5MB)</p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@asirex.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Role/Position <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Department <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
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
          </div>

          {/* Core Type & Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Core Type</Label>
              <Select value={formData.coreType} onValueChange={(value) => setFormData({ ...formData, coreType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {coreTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Salary
              </Label>
              <Input
                id="salary"
                placeholder="₹XX,XXX/month"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </div>
          </div>

          {/* Password and Permissions for admin/core roles */}
          {(formData.coreType === "Core Pillar" || formData.coreType === "Founding Core" || 
            ["CEO & Founder", "Production Head and Manager", "Sales Lead and Head", 
             "Core Members and Managing Team Lead", "Engineering and R&D Lead", "Website Admin and SWE"].includes(formData.role)) && (
            <div className="space-y-4">
              <div className="space-y-2 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  Set Login Password
                </Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="Leave empty for auto-generated password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  This will create a login account for admin dashboard access. Leave empty for auto-generated password.
                </p>
              </div>

              {/* Admin Permissions Selector */}
              <AdminPermissionsSelector
                selectedRole={
                  formData.role.includes("CEO") || formData.coreType === "Founding Core" ? "admin" :
                  formData.role.includes("Head") || formData.role.includes("Lead") || formData.role.includes("Manager") ? "manager" :
                  formData.role.includes("Developer") || formData.role.includes("SWE") || formData.role.includes("Engineer") ? "developer" :
                  formData.coreType === "Core Pillar" ? "core_member" : "employee"
                }
                permissions={adminPermissions}
                onPermissionsChange={setAdminPermissions}
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-500 hover:bg-green-600" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Team Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* ID Card Dialog */}
      <TeamMemberIDCard
        open={showIDCard}
        onOpenChange={setShowIDCard}
        credentials={createdCredentials}
      />
    </Dialog>
  );
}
