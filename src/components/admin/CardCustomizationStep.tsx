import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, User, Building, Briefcase, Crown, Check, Sparkles } from "lucide-react";

interface CardCustomizationStepProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    name: string;
    role: string;
    department: string;
    coreType: string;
    isLead: boolean;
  };
  loginPath: "admin" | "manager";
  onConfirm: (data: {
    name: string;
    role: string;
    department: string;
    coreType: string;
    designation: string;
  }) => void;
  onBack: () => void;
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

const coreTypes = [
  "Founding Core",
  "Core Pillar",
  "Head and Lead",
  "Manager",
  "Developer",
  "Core Member",
  "Team Lead",
  "Senior Member",
];

const designations: Record<string, string[]> = {
  admin: [
    "CEO & Founder",
    "Production Head and Manager",
    "Sales Lead and Head",
    "Core Members and Managing Team Lead",
    "Engineering and R&D Lead",
    "Website Admin and SWE",
    "Department Head",
    "Chief Technology Officer",
    "Chief Operations Officer",
    "Vice President",
  ],
  manager: [
    "Department Manager",
    "Team Lead",
    "Project Manager",
    "Senior Developer",
    "Operations Manager",
    "Marketing Manager",
    "Product Manager",
    "Core Team Member",
  ],
};

export function CardCustomizationStep({
  open,
  onOpenChange,
  initialData,
  loginPath,
  onConfirm,
  onBack,
}: CardCustomizationStepProps) {
  const [formData, setFormData] = useState({
    name: initialData.name,
    role: initialData.role,
    department: initialData.department,
    coreType: initialData.coreType || (loginPath === "admin" ? "Core Pillar" : "Manager"),
    designation: initialData.role,
  });

  const handleConfirm = () => {
    onConfirm(formData);
  };

  const availableDesignations = designations[loginPath] || designations.manager;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            Customize ID Card Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Preview Badge */}
          <div className="p-3 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Card Preview</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="font-medium">{formData.name || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dept:</span>{" "}
                <span className="font-medium">{formData.department || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>{" "}
                <span className="font-medium">{formData.designation || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>{" "}
                <Badge variant="secondary" className="text-xs">{formData.coreType || "—"}</Badge>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Department
            </Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
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

          {/* Role/Designation */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Designation / Title
            </Label>
            <Select
              value={formData.designation}
              onValueChange={(value) => setFormData({ ...formData, designation: value, role: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select designation" />
              </SelectTrigger>
              <SelectContent>
                {availableDesignations.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
                {!availableDesignations.includes(formData.role) && formData.role && (
                  <SelectItem value={formData.role}>
                    {formData.role} (Custom)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Core Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Core Type
            </Label>
            <Select
              value={formData.coreType}
              onValueChange={(value) => setFormData({ ...formData, coreType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select core type" />
              </SelectTrigger>
              <SelectContent>
                {coreTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center gap-2">
                      {type}
                      {type === "Founding Core" && (
                        <Badge variant="secondary" className="text-[10px]">Highest</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleConfirm} className="bg-green-500 hover:bg-green-600">
            <Check className="w-4 h-4 mr-1" />
            Confirm & Create Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
