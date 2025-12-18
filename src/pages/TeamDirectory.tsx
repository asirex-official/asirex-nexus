import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Users,
  Building2,
  Circle,
  Mail,
  Phone,
  ChevronDown,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { ViewTeamMemberDialog } from "@/components/admin/ViewTeamMemberDialog";
import { TeamMemberProfile } from "@/components/admin/TeamMemberProfileCard";
import { useAuth } from "@/hooks/useAuth";
import { differenceInMinutes } from "date-fns";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

interface TeamMemberData {
  id: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
  department: string | null;
  designation: string | null;
  serial_number: string | null;
  is_core_pillar: boolean | null;
  profile_image: string | null;
  status: string | null;
  hired_at: string | null;
  created_at: string | null;
}

const departments = [
  "All Departments",
  "Executive Leadership",
  "Production & Operations",
  "Sales",
  "Research & Development",
  "Software Engineering",
  "Management",
  "AI & Machine Learning",
  "Robotics Engineering",
  "Design & UX",
  "Hardware Engineering",
  "Marketing & Growth",
  "Business Development",
];

const statuses = ["All", "Active", "Inactive"];

export default function TeamDirectory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showCorePillarsOnly, setShowCorePillarsOnly] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMemberProfile | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const { isAdmin, isSuperAdmin } = useAuth();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("team_members_public")
        .select("*")
        .order("hired_at", { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (member.role?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesDepartment =
        selectedDepartment === "All Departments" ||
        member.department === selectedDepartment;

      const matchesStatus =
        selectedStatus === "All" ||
        member.status?.toLowerCase() === selectedStatus.toLowerCase();

      const matchesCorePillar = !showCorePillarsOnly || member.is_core_pillar;

      return matchesSearch && matchesDepartment && matchesStatus && matchesCorePillar;
    });
  }, [teamMembers, searchQuery, selectedDepartment, selectedStatus, showCorePillarsOnly]);

  const getOnlineStatus = (lastSeen: string | null) => {
    if (!lastSeen) return { status: "offline", label: "Offline", color: "bg-muted-foreground" };
    const minutesAgo = differenceInMinutes(new Date(), new Date(lastSeen));
    if (minutesAgo < 5) return { status: "online", label: "Online", color: "bg-green-500" };
    if (minutesAgo < 30) return { status: "away", label: "Away", color: "bg-yellow-500" };
    return { status: "offline", label: "Offline", color: "bg-muted-foreground" };
  };

  const handleViewProfile = (member: TeamMemberData) => {
    setSelectedMember({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: null, // Not available in public view
      role: member.role,
      department: member.department,
      designation: member.designation,
      serial_number: member.serial_number,
      is_core_pillar: member.is_core_pillar,
      profile_image: member.profile_image,
      status: member.status,
      hired_at: member.hired_at,
      last_seen: null, // Not available in public view
    });
    setShowProfileDialog(true);
  };

  const groupedByDepartment = useMemo(() => {
    const groups: Record<string, TeamMemberData[]> = {};
    filteredMembers.forEach((member) => {
      const dept = member.department || "General";
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(member);
    });
    return groups;
  }, [filteredMembers]);

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Team Directory</h1>
                <p className="text-muted-foreground">
                  Browse and connect with ASIREX team members
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, role, or designation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Department Filter */}
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full md:w-[220px]">
                    <Building2 className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <Circle className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* More Filters */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filters
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={showCorePillarsOnly}
                      onCheckedChange={setShowCorePillarsOnly}
                    >
                      Core Pillars Only
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Results count */}
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredMembers.length} of {teamMembers.length} team members
              </div>
            </CardContent>
          </Card>

          {/* Team Members Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No team members found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            Object.entries(groupedByDepartment).map(([department, members]) => (
              <div key={department} className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">{department}</h2>
                  <Badge variant="secondary">{members.length}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {members.map((member, index) => {
                    // Public view doesn't have last_seen, show as inactive
                    const onlineStatus = { status: "offline", label: "Offline", color: "bg-muted-foreground" };
                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className="h-full hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer group"
                          onClick={() => handleViewProfile(member)}
                        >
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                              {/* Avatar with online status */}
                              <div className="relative mb-4">
                                <Avatar className="w-20 h-20 border-2 border-border">
                                  <AvatarImage src={member.profile_image || undefined} alt={member.name || ""} />
                                  <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                                    {(member.name || "").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div
                                  className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-background ${onlineStatus.color}`}
                                  title={onlineStatus.label}
                                />
                              </div>

                              {/* Name & Role */}
                              <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                              <p className="text-sm text-primary font-medium mb-2">
                                {member.designation || member.role}
                              </p>

                              {/* Badges */}
                              <div className="flex flex-wrap justify-center gap-1 mb-3">
                                {member.is_core_pillar && (
                                  <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                                    Core Pillar
                                  </Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className={`${
                                    member.status === "active"
                                      ? "bg-green-500/10 text-green-500 border-green-500/30"
                                      : "bg-red-500/10 text-red-500 border-red-500/30"
                                  }`}
                                >
                                  {member.status || "Active"}
                                </Badge>
                              </div>

                              {/* Contact */}
                              <div className="w-full space-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center justify-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate">{member.email}</span>
                                </div>
                              </div>


                              {/* View Profile Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Profile
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Profile Dialog */}
        <ViewTeamMemberDialog
          open={showProfileDialog}
          onOpenChange={setShowProfileDialog}
          member={selectedMember}
          canEdit={isAdmin || isSuperAdmin}
          onUpdate={fetchTeamMembers}
        />
      </div>
    </Layout>
  );
}
