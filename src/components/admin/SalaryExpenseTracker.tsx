import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Wallet, DollarSign, Plus, Check, X, Clock, 
  FileText, Calendar, TrendingUp, TrendingDown,
  Building, User
} from "lucide-react";
import { format } from "date-fns";
import { useAuditLog } from "@/hooks/useAuditLog";

interface SalaryRequest {
  id: string;
  team_member_id: string;
  requested_by: string;
  amount: number;
  month: string;
  year: number;
  status: "pending" | "approved" | "paid" | "rejected";
  approved_by: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  team_member?: {
    name: string;
    department: string | null;
    role: string;
  };
}

interface Expense {
  id: string;
  category: string;
  description: string | null;
  amount: number;
  date: string;
  status: "pending" | "approved" | "paid" | "rejected";
  created_at: string;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const expenseCategories = [
  "Office Supplies", "Equipment", "Travel", "Marketing", 
  "Utilities", "Software", "Hardware", "Maintenance", "Other"
];

export function SalaryExpenseTracker() {
  const queryClient = useQueryClient();
  const auditLog = useAuditLog();
  const [showAddSalary, setShowAddSalary] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [viewMode, setViewMode] = useState<"salary" | "expense">("salary");

  // Form states
  const [salaryForm, setSalaryForm] = useState({
    teamMemberId: "",
    amount: "",
    month: "",
    year: new Date().getFullYear().toString(),
    notes: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Fetch team members for salary requests
  const { data: teamMembers } = useQuery({
    queryKey: ["team-members-for-salary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name, department, role, salary")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  // Fetch salary requests
  const { data: salaryRequests, isLoading: loadingSalary } = useQuery({
    queryKey: ["salary-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_requests")
        .select(`
          *,
          team_member:team_members(name, department, role)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SalaryRequest[];
    },
  });

  // Fetch expenses
  const { data: expenses, isLoading: loadingExpenses } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
  });

  // Add salary request mutation
  const addSalaryRequest = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("salary_requests").insert({
        team_member_id: salaryForm.teamMemberId,
        requested_by: user.id,
        amount: parseFloat(salaryForm.amount),
        month: salaryForm.month,
        year: parseInt(salaryForm.year),
        notes: salaryForm.notes || null,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-requests"] });
      setShowAddSalary(false);
      setSalaryForm({ teamMemberId: "", amount: "", month: "", year: new Date().getFullYear().toString(), notes: "" });
      toast.success("Salary request created");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create request");
    },
  });

  // Add expense mutation
  const addExpense = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("expenses").insert({
        category: expenseForm.category,
        description: expenseForm.description || null,
        amount: parseFloat(expenseForm.amount),
        date: expenseForm.date,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setShowAddExpense(false);
      setExpenseForm({ category: "", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
      toast.success("Expense added");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add expense");
    },
  });

  // Update salary status
  const updateSalaryStatus = useMutation({
    mutationFn: async ({ id, status, memberName, amount, month, year }: { id: string; status: string; memberName?: string; amount?: number; month?: string; year?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const updateData: any = { status };
      if (status === "approved") updateData.approved_by = user?.id;
      if (status === "paid") updateData.paid_at = new Date().toISOString();

      const { error } = await supabase
        .from("salary_requests")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
      
      if (memberName && amount && month && year) {
        await auditLog.logSalaryApproval(memberName, id, amount, month, year, status);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salary-requests"] });
      toast.success("Status updated");
    },
  });

  // Update expense status
  const updateExpenseStatus = useMutation({
    mutationFn: async ({ id, status, category, amount }: { id: string; status: string; category?: string; amount?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const updateData: any = { status };
      if (status === "approved") updateData.approved_by = user?.id;

      const { error } = await supabase
        .from("expenses")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
      
      if (category && amount) {
        await auditLog.logExpenseApproval(category, id, amount, status);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense status updated");
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500";
      case "approved": return "bg-blue-500/20 text-blue-500";
      case "paid": return "bg-green-500/20 text-green-500";
      case "rejected": return "bg-red-500/20 text-red-500";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Calculate totals
  const totalPendingSalary = salaryRequests?.filter(s => s.status === "pending").reduce((sum, s) => sum + s.amount, 0) || 0;
  const totalApprovedSalary = salaryRequests?.filter(s => s.status === "approved").reduce((sum, s) => sum + s.amount, 0) || 0;
  const totalPaidSalary = salaryRequests?.filter(s => s.status === "paid").reduce((sum, s) => sum + s.amount, 0) || 0;

  const totalPendingExpense = expenses?.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0) || 0;
  const totalApprovedExpense = expenses?.filter(e => e.status === "approved" || e.status === "paid").reduce((sum, e) => sum + e.amount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalPendingSalary.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Pending Salary</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Check className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalApprovedSalary.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Approved Salary</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalPaidSalary.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Paid Salary</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹{totalApprovedExpense.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "salary" ? "default" : "outline"}
                onClick={() => setViewMode("salary")}
                className="gap-2"
              >
                <Wallet className="w-4 h-4" />
                Salary Requests
              </Button>
              <Button
                variant={viewMode === "expense" ? "default" : "outline"}
                onClick={() => setViewMode("expense")}
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Expenses
              </Button>
            </div>
            <Button
              onClick={() => viewMode === "salary" ? setShowAddSalary(true) : setShowAddExpense(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {viewMode === "salary" ? "Salary Request" : "Expense"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "salary" ? (
            loadingSalary ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : salaryRequests?.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No salary requests yet</p>
            ) : (
              <div className="space-y-3">
                {salaryRequests?.map((request) => (
                  <div key={request.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {request.team_member?.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{request.team_member?.name || "Unknown"}</p>
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.team_member?.department} • {request.month} {request.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{request.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.created_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-500"
                          onClick={() => updateSalaryStatus.mutate({ 
                            id: request.id, 
                            status: "approved",
                            memberName: request.team_member?.name,
                            amount: request.amount,
                            month: request.month,
                            year: request.year
                          })}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500"
                          onClick={() => updateSalaryStatus.mutate({ 
                            id: request.id, 
                            status: "rejected",
                            memberName: request.team_member?.name,
                            amount: request.amount,
                            month: request.month,
                            year: request.year
                          })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {request.status === "approved" && (
                      <Button
                        size="sm"
                        onClick={() => updateSalaryStatus.mutate({ 
                          id: request.id, 
                          status: "paid",
                          memberName: request.team_member?.name,
                          amount: request.amount,
                          month: request.month,
                          year: request.year
                        })}
                      >
                        Mark Paid
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            loadingExpenses ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : expenses?.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No expenses recorded</p>
            ) : (
              <div className="space-y-3">
                {expenses?.map((expense) => (
                  <div key={expense.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{expense.category}</p>
                        <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{expense.description || "No description"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-red-500">-₹{expense.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(expense.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    {expense.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-500"
                          onClick={() => updateExpenseStatus.mutate({ 
                            id: expense.id, 
                            status: "approved",
                            category: expense.category,
                            amount: expense.amount
                          })}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500"
                          onClick={() => updateExpenseStatus.mutate({ 
                            id: expense.id, 
                            status: "rejected",
                            category: expense.category,
                            amount: expense.amount
                          })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Add Salary Request Dialog */}
      <Dialog open={showAddSalary} onOpenChange={setShowAddSalary}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Salary Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Team Member</Label>
              <Select value={salaryForm.teamMemberId} onValueChange={(v) => setSalaryForm(p => ({ ...p, teamMemberId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} - {m.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={salaryForm.month} onValueChange={(v) => setSalaryForm(p => ({ ...p, month: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={salaryForm.year}
                  onChange={(e) => setSalaryForm(p => ({ ...p, year: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                placeholder="e.g., 50000"
                value={salaryForm.amount}
                onChange={(e) => setSalaryForm(p => ({ ...p, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any additional notes..."
                value={salaryForm.notes}
                onChange={(e) => setSalaryForm(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSalary(false)}>Cancel</Button>
            <Button onClick={() => addSalaryRequest.mutate()} disabled={addSalaryRequest.isPending}>
              {addSalaryRequest.isPending ? "Adding..." : "Add Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={expenseForm.category} onValueChange={(v) => setExpenseForm(p => ({ ...p, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                placeholder="e.g., 5000"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm(p => ({ ...p, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm(p => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="What was this expense for..."
                value={expenseForm.description}
                onChange={(e) => setExpenseForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExpense(false)}>Cancel</Button>
            <Button onClick={() => addExpense.mutate()} disabled={addExpense.isPending}>
              {addExpense.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
