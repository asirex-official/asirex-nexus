import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ArrowLeft, Shield, Users, Briefcase, LockKeyhole, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const authorityTypes = {
  admin: {
    label: "Admin Login",
    icon: Shield,
    description: "Super Admins, Core Pillars, and Website Admin & SWE",
    color: "from-red-500/20 to-orange-500/20",
  },
  manager: {
    label: "Core Pillars & Managers",
    icon: Users,
    description: "Core Members, Managers, and Developers",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  employee: {
    label: "Employees Login",
    icon: Briefcase,
    description: "Regular employees and staff members",
    color: "from-green-500/20 to-emerald-500/20",
  },
};

// Default position templates for admin roles (positions that should always appear)
const adminPositionTemplates = [
  {
    id: "ASX-2025-000",
    title: "CEO and Founder",
    coreType: "Founding Core",
    department: "Executive Leadership",
  },
  {
    id: "ASX-2025-001",
    title: "Production Head and Manager",
    coreType: "Core Pillar",
    department: "Production & Operations",
  },
  {
    id: "ASX-2025-014",
    title: "Core Members and Managing Team Lead",
    coreType: "Core Pillar",
    department: "Management",
  },
  {
    id: "ASX-2025-013",
    title: "Engineering and R&D Lead",
    coreType: "Core Pillar",
    department: "Research & Development",
  },
  {
    id: "ASX-2025-011",
    title: "Website Admin and SWE",
    coreType: "Developer",
    department: "Software Engineering",
  },
];

// Default position templates for manager roles
const managerPositionTemplates = [
  {
    id: "ASX-2025-002",
    title: "Senior AI Engineer",
    coreType: "Core Member",
    department: "AI & Machine Learning",
  },
  {
    id: "ASX-2025-003",
    title: "Robotics Software Developer",
    coreType: "Developer",
    department: "Robotics Engineering",
  },
  {
    id: "ASX-2025-004",
    title: "Product Designer",
    coreType: "Core Member",
    department: "Design & UX",
  },
  {
    id: "ASX-2025-005",
    title: "Machine Learning Engineer",
    coreType: "Developer",
    department: "AI & Machine Learning",
  },
  {
    id: "ASX-2025-006",
    title: "Embedded Systems Developer",
    coreType: "Developer",
    department: "Hardware Engineering",
  },
  {
    id: "ASX-2025-007",
    title: "Marketing Manager",
    coreType: "Manager",
    department: "Marketing & Growth",
  },
  {
    id: "ASX-2025-008",
    title: "Hardware Engineer",
    coreType: "Core Member",
    department: "Production & Operations",
  },
  {
    id: "ASX-2025-009",
    title: "Content Writer & Social Media",
    coreType: "Core Member",
    department: "Marketing & Growth",
  },
  {
    id: "ASX-2025-010",
    title: "Business Development Executive",
    coreType: "Manager",
    department: "Business Development",
  },
];

interface RoleCard {
  id: string;
  title: string;
  name: string | null;
  email: string | null;
  coreType: string;
  department: string;
  isHired: boolean;
  photoUrl: string | null;
}

export default function AuthorityLogin() {
  const [searchParams] = useSearchParams();
  const authorityType = searchParams.get("type") || "employee";
  const authority = authorityTypes[authorityType as keyof typeof authorityTypes] || authorityTypes.employee;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminRoleCards, setAdminRoleCards] = useState<RoleCard[]>([]);
  const [managerRoleCards, setManagerRoleCards] = useState<RoleCard[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch team members from database and merge with templates
  // Uses full team_members table (requires admin access for emails)
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoadingCards(true);
      try {
        // Use team_members table to get emails for login cards
        const { data: teamMembers, error } = await supabase
          .from("team_members")
          .select("id, name, email, role, department, designation, serial_number, is_core_pillar, profile_image, status")
          .eq("status", "active");

        if (error) throw error;

        // Helper: Check if a member matches a template (case-insensitive, partial match)
        const matchesMember = (member: any, template: typeof adminPositionTemplates[0]) => {
          if (!member) return false;
          
          // Match by serial number
          if (member.serial_number === template.id) return true;
          
          // Match by role/designation (case-insensitive partial match)
          const memberRole = (member.role || "").toLowerCase();
          const memberDesignation = (member.designation || "").toLowerCase();
          const templateTitle = template.title.toLowerCase();
          
          // Exact match
          if (memberRole === templateTitle || memberDesignation === templateTitle) return true;
          
          // Partial match - title contains role keywords
          const keywords = templateTitle.split(" ").filter(w => w.length > 3);
          const roleMatches = keywords.some(kw => memberRole.includes(kw) || memberDesignation.includes(kw));
          
          // Special case for CEO
          if (templateTitle.includes("ceo") && (memberRole.includes("ceo") || memberDesignation.includes("ceo"))) {
            return true;
          }
          
          return roleMatches;
        };

        // Create admin role cards by merging templates with actual team members
        const adminCards: RoleCard[] = adminPositionTemplates.map(template => {
          const member = teamMembers?.find(m => matchesMember(m, template));

          // If DB is not readable or no match for CEO, keep CEO card alive
          if (!member && template.id === "ASX-2025-000") {
            return {
              id: template.id,
              title: template.title,
              name: "Kapeesh Sorout",
              email: "ceo@asirex.in",
              coreType: template.coreType,
              department: template.department,
              isHired: true,
              photoUrl: null,
            };
          }
          
          return {
            id: member?.serial_number || template.id,
            title: template.title,
            name: member?.name || null,
            email: member?.email || null,
            coreType: member?.is_core_pillar ? "Core Pillar" : template.coreType,
            department: member?.department || template.department,
            isHired: !!member,
            photoUrl: member?.profile_image || null,
          };
        });

        // Create manager role cards
        const managerCards: RoleCard[] = managerPositionTemplates.map(template => {
          const member = teamMembers?.find(m => matchesMember(m, template));
          
          return {
            id: member?.serial_number || template.id,
            title: template.title,
            name: member?.name || null,
            email: member?.email || null,
            coreType: member?.is_core_pillar ? "Core Pillar" : template.coreType,
            department: member?.department || template.department,
            isHired: !!member,
            photoUrl: member?.profile_image || null,
          };
        });

        // Track which emails are already in cards
        const usedEmails = new Set([
          ...adminCards.filter(c => c.email).map(c => c.email),
          ...managerCards.filter(c => c.email).map(c => c.email),
        ]);

        // Add any team members that don't match templates (newly added positions)
        teamMembers?.forEach(member => {
          // Skip if already matched to a template
          if (usedEmails.has(member.email)) return;
          
          // Determine if this should be in admin or manager section based on role/designation
          const roleText = (member.role || "").toLowerCase();
          const designationText = (member.designation || "").toLowerCase();
          
          const isAdmin = member.is_core_pillar || 
            ["ceo", "founder", "head", "lead", "director", "website admin", "swe"].some(keyword => 
              roleText.includes(keyword) || designationText.includes(keyword)
            );
          
          const isManager = !isAdmin && 
            ["manager", "team lead", "senior", "core member"].some(keyword => 
              roleText.includes(keyword) || designationText.includes(keyword)
            );
          
          const card: RoleCard = {
            id: member.serial_number || `ASX-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
            title: member.designation || member.role,
            name: member.name,
            email: member.email,
            coreType: member.is_core_pillar ? "Core Pillar" : (isAdmin ? "Head and Lead" : "Manager"),
            department: member.department || "General",
            isHired: true,
            photoUrl: member.profile_image,
          };
          
          if (isAdmin) {
            adminCards.push(card);
          } else if (isManager) {
            managerCards.push(card);
          }
          // If neither admin nor manager, they don't get a card (regular user)
        });

        setAdminRoleCards(adminCards);
        setManagerRoleCards(managerCards);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setIsLoadingCards(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate("/admin");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleCardClick = (card: RoleCard) => {
    if (!card.isHired) {
      toast({
        title: "Position Vacant",
        description: "This role is not yet filled. Apply for this position through our careers page!",
        variant: "destructive",
      });
      return;
    }
    
    // Determine role type for routing
    let roleType = "member";
    if (card.title.toLowerCase().includes("ceo") || card.title.toLowerCase().includes("founder")) {
      roleType = "ceo";
    } else if (card.title.toLowerCase().includes("developer") || card.title.toLowerCase().includes("swe") || card.title.toLowerCase().includes("website admin")) {
      roleType = "developer";
    }
    
    // Navigate to card login page with user details including email
    const params = new URLSearchParams({
      name: card.name || "",
      title: card.title,
      id: card.id,
      department: card.department,
      role: roleType,
      email: card.email || "",
    });
    navigate(`/card-login?${params.toString()}`);
  };

  const AuthorityIcon = authority.icon;

  // Show role cards for admin type (Core Pillars, Website Admin/SWE)
  if (authorityType === "admin") {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className={`fixed inset-0 bg-gradient-to-br ${authority.color} opacity-30 pointer-events-none`} />
        
        <div className="container mx-auto max-w-6xl relative">
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`p-4 rounded-full bg-gradient-to-br ${authority.color} border border-border/50`}>
                <AuthorityIcon className="w-8 h-8 text-foreground" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {authority.label}
            </h1>
            <p className="text-muted-foreground">
              Core Pillars & Website Admin - Select your role card
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 max-w-5xl mx-auto"
          >
            {adminRoleCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleRoleCardClick(card)}
                className={`
                  relative overflow-hidden rounded-xl border-2 transition-all duration-300
                  ${index === 0 ? "sm:col-start-1 sm:col-end-3 sm:justify-self-center sm:w-full sm:max-w-md" : ""}
                  ${index === adminRoleCards.length - 1 && index % 2 === 1 ? "sm:col-start-1 sm:col-end-3 sm:justify-self-center sm:w-full sm:max-w-md" : ""}
                  ${card.isHired 
                    ? "bg-gradient-to-br from-background via-primary/5 to-background border-primary/40 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 cursor-pointer hover:scale-[1.02]" 
                    : "bg-gradient-to-br from-background via-destructive/5 to-background border-destructive/30 cursor-not-allowed opacity-70"
                  }
                `}
              >
                <div className={`px-4 py-3 border-b ${card.isHired ? "bg-primary/10 border-primary/20" : "bg-destructive/10 border-destructive/20"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-muted-foreground">ASIREX ID CARD</span>
                    <span className={`text-xs font-mono ${card.isHired ? "text-primary" : "text-destructive"}`}>{card.id}</span>
                  </div>
                </div>
                
                <div className="p-5 flex gap-5">
                  <div className={`
                    w-24 h-28 rounded-lg border-2 flex items-center justify-center flex-shrink-0
                    ${card.isHired 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-destructive/5 border-destructive/20"
                    }
                  `}>
                    {card.isHired ? (
                      <User className="w-12 h-12 text-primary/60" />
                    ) : (
                      <LockKeyhole className="w-10 h-10 text-destructive/50" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Name</p>
                      <p className={`font-bold text-base ${card.isHired ? "text-foreground" : "text-destructive"}`}>
                        {card.isHired ? card.name : "— VACANT —"}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Designation</p>
                      <p className="font-semibold text-sm text-foreground">{card.title}</p>
                    </div>
                    
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Core Type</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          card.coreType === "Founding Core" ? "bg-purple-500/20 text-purple-400" :
                          card.coreType === "Core Pillar" ? "bg-yellow-500/20 text-yellow-400" :
                          card.coreType === "Head and Lead" ? "bg-green-500/20 text-green-400" :
                          card.coreType === "Manager" ? "bg-blue-500/20 text-blue-400" :
                          card.coreType === "Developer" ? "bg-cyan-500/20 text-cyan-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {card.coreType}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Dept</p>
                        <p className="text-xs text-muted-foreground">{card.department}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={`px-4 py-2 border-t text-center ${card.isHired ? "bg-primary/5 border-primary/10" : "bg-destructive/5 border-destructive/10"}`}>
                  {card.isHired ? (
                    <p className="text-xs text-primary font-medium">Click to Login →</p>
                  ) : (
                    <p className="text-xs text-destructive font-medium">Card Not Activated • No Admin Hired</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-muted-foreground text-sm mb-3">
              Can't find your Login card?
            </p>
            <a 
              href="mailto:Support@asirex.in"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Support@asirex.in
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show role cards for manager type
  if (authorityType === "manager") {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <div className={`fixed inset-0 bg-gradient-to-br ${authority.color} opacity-30 pointer-events-none`} />
        
        <div className="container mx-auto max-w-6xl relative">
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`p-4 rounded-full bg-gradient-to-br ${authority.color} border border-border/50`}>
                <AuthorityIcon className="w-8 h-8 text-foreground" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {authority.label}
            </h1>
            <p className="text-muted-foreground">
              Select your role card to login
            </p>
          </motion.div>

          {/* Role Cards Grid - 2 per row, ID card style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 max-w-5xl mx-auto"
          >
            {managerRoleCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleRoleCardClick(card)}
                className={`
                  relative overflow-hidden rounded-xl border-2 transition-all duration-300
                  ${card.isHired 
                    ? "bg-gradient-to-br from-background via-primary/5 to-background border-primary/40 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 cursor-pointer hover:scale-[1.02]" 
                    : "bg-gradient-to-br from-background via-destructive/5 to-background border-destructive/30 cursor-not-allowed opacity-70"
                  }
                `}
              >
                {/* ID Card Header */}
                <div className={`px-4 py-3 border-b ${card.isHired ? "bg-primary/10 border-primary/20" : "bg-destructive/10 border-destructive/20"}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-muted-foreground">ASIREX ID CARD</span>
                    <span className={`text-xs font-mono ${card.isHired ? "text-primary" : "text-destructive"}`}>{card.id}</span>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-5 flex gap-5">
                  {/* Photo Section */}
                  <div className={`
                    w-24 h-28 rounded-lg border-2 flex items-center justify-center flex-shrink-0
                    ${card.isHired 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-destructive/5 border-destructive/20"
                    }
                  `}>
                    {card.isHired ? (
                      <User className="w-12 h-12 text-primary/60" />
                    ) : (
                      <LockKeyhole className="w-10 h-10 text-destructive/50" />
                    )}
                  </div>
                  
                  {/* Info Section */}
                  <div className="flex-1 space-y-2">
                    {/* Name */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Name</p>
                      <p className={`font-bold text-base ${card.isHired ? "text-foreground" : "text-destructive"}`}>
                        {card.isHired ? card.name : "— VACANT —"}
                      </p>
                    </div>
                    
                    {/* Work/Title */}
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Designation</p>
                      <p className="font-semibold text-sm text-foreground">{card.title}</p>
                    </div>
                    
                    {/* Core Type & Department */}
                    <div className="flex gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Core Type</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          card.coreType === "Core Pillar" ? "bg-yellow-500/20 text-yellow-400" :
                          card.coreType === "Manager" ? "bg-blue-500/20 text-blue-400" :
                          card.coreType === "Developer" ? "bg-green-500/20 text-green-400" :
                          "bg-purple-500/20 text-purple-400"
                        }`}>
                          {card.coreType}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Dept</p>
                        <p className="text-xs text-muted-foreground">{card.department}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Card Footer */}
                <div className={`px-4 py-2 border-t text-center ${card.isHired ? "bg-primary/5 border-primary/10" : "bg-destructive/5 border-destructive/10"}`}>
                  {card.isHired ? (
                    <p className="text-xs text-primary font-medium">Click to Login →</p>
                  ) : (
                    <p className="text-xs text-destructive font-medium">Card Not Activated • No Manager Hired</p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Support Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-muted-foreground text-sm mb-3">
              Can't find your Login card?
            </p>
            <a 
              href="mailto:Support@asirex.in"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Support@asirex.in
            </a>
          </motion.div>
        </div>
      </div>
    );
  }

  // Default email/password login for employee type
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-gradient-to-br ${authority.color} opacity-50`} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <Link 
          to="/auth" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="glass-card p-8">
          {/* Authority Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className={`p-4 rounded-full bg-gradient-to-br ${authority.color} border border-border/50`}>
              <AuthorityIcon className="w-8 h-8 text-foreground" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              {authority.label}
            </h1>
            <p className="text-sm text-muted-foreground">
              {authority.description}
            </p>
          </div>

          {/* Company Email Notice */}
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-sm text-muted-foreground text-center">
              Please use your <span className="font-semibold text-foreground">company-provided email</span> and password to login.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Company Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@asirex.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="hero" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Forgot your password? Contact your administrator or email{" "}
              <a href="mailto:support@asirex.in" className="text-primary hover:underline">
                support@asirex.in
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
