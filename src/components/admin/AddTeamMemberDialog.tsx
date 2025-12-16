import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { UserPlus, Upload, Mail, Phone, Building, Briefcase, DollarSign, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  const generateSerialNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `ASX-${year}-${randomNum}`;
  };

  const generateTemporaryPassword = () => {
    // Generate a temporary password
    return `ASIREX@${Math.random().toString(36).slice(-8)}`;
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

      // Create team member record
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
      };

      onAdd(newMember);
      
      // Show success message with login credentials if created
      if (userId && (isAdminRole || isCorePillar)) {
        toast.success(
          `${formData.name} added! Login credentials: Email: ${formData.email}, Password: ${tempPassword}`,
          { duration: 10000 }
        );
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
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
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

          {/* Password for admin/core roles */}
          {(formData.coreType === "Core Pillar" || formData.coreType === "Founding Core" || 
            ["CEO & Founder", "Production Head and Manager", "Sales Lead and Head", 
             "Core Members and Managing Team Lead", "Engineering and R&D Lead", "Website Admin and SWE"].includes(formData.role)) && (
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
    </Dialog>
  );
}
