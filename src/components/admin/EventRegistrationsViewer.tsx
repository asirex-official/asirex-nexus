import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, User, Mail, Phone, Calendar, CreditCard, Ticket, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  email: string | null;
  status: string | null;
  payment_status: string | null;
  payment_id: string | null;
  amount_paid: number | null;
  verification_code: string | null;
  registered_at: string;
  event: {
    name: string;
    event_date: string;
    ticket_price: number | null;
  } | null;
  profile: {
    full_name: string | null;
    phone: string | null;
    birthdate: string | null;
  } | null;
  user_email: string | null;
}

export function EventRegistrationsViewer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);

  const { data: registrations, isLoading } = useQuery({
    queryKey: ["admin-event-registrations"],
    queryFn: async () => {
      // First get all registrations with event details
      const { data: regs, error } = await supabase
        .from("event_registrations")
        .select(`
          id,
          event_id,
          user_id,
          email,
          status,
          payment_status,
          payment_id,
          amount_paid,
          verification_code,
          registered_at,
          events:event_id (
            name,
            event_date,
            ticket_price
          )
        `)
        .order("registered_at", { ascending: false });

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set(regs?.map(r => r.user_id) || [])];
      
      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, birthdate")
        .in("user_id", userIds);

      // Create a map of user_id to profile
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Fetch user emails from auth (via a workaround - check if email is in registration)
      // For users without email in registration, we'll show the profile name

      return regs?.map(reg => ({
        ...reg,
        event: reg.events,
        profile: profileMap.get(reg.user_id) || null,
        user_email: reg.email,
      })) as Registration[];
    },
  });

  const { data: events } = useQuery({
    queryKey: ["events-list-for-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, name")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredRegistrations = registrations?.filter(reg => {
    const matchesSearch = 
      reg.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.verification_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.event?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEvent = eventFilter === "all" || reg.event_id === eventFilter;
    const matchesPayment = paymentFilter === "all" || reg.payment_status === paymentFilter;
    
    return matchesSearch && matchesEvent && matchesPayment;
  });

  const getPaymentBadge = (status: string | null, amount: number | null) => {
    if (!amount || amount === 0) {
      return <Badge variant="secondary">Free</Badge>;
    }
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "registered":
        return <Badge className="bg-blue-500">Registered</Badge>;
      case "attended":
        return <Badge className="bg-green-500">Attended</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or verification code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events?.map(event => (
              <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        Total Registrations: {filteredRegistrations?.length || 0}
      </div>

      <ScrollArea className="h-[500px] rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verification Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegistrations?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No registrations found
                </TableCell>
              </TableRow>
            ) : (
              filteredRegistrations?.map((reg) => (
                <TableRow key={reg.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{reg.profile?.full_name || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">{reg.email || "No email"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{reg.event?.name || "Unknown Event"}</span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(reg.registered_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getPaymentBadge(reg.payment_status, reg.amount_paid)}
                      {reg.amount_paid ? (
                        <span className="text-xs text-muted-foreground">₹{reg.amount_paid}</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(reg.status)}</TableCell>
                  <TableCell>
                    {reg.verification_code ? (
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                        {reg.verification_code}
                      </code>
                    ) : (
                      <span className="text-muted-foreground text-xs">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRegistration(reg)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      <Dialog open={!!selectedRegistration} onOpenChange={() => setSelectedRegistration(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{selectedRegistration.profile?.full_name || "Unknown User"}</p>
                  <p className="text-sm text-muted-foreground">User ID: {selectedRegistration.user_id.slice(0, 8)}...</p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedRegistration.email || "No email provided"}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedRegistration.profile?.phone || "No phone"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{selectedRegistration.event?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedRegistration.event?.event_date 
                        ? format(new Date(selectedRegistration.event.event_date), "PPP 'at' p")
                        : "Date unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    {getPaymentBadge(selectedRegistration.payment_status, selectedRegistration.amount_paid)}
                    {selectedRegistration.amount_paid ? (
                      <span>₹{selectedRegistration.amount_paid}</span>
                    ) : (
                      <span className="text-muted-foreground">Free event</span>
                    )}
                  </div>
                </div>

                {selectedRegistration.payment_id && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Payment ID:</span>{" "}
                    <code className="bg-muted px-1 rounded">{selectedRegistration.payment_id}</code>
                  </div>
                )}

                {selectedRegistration.verification_code && (
                  <div className="flex items-center gap-3">
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Code</p>
                      <code className="bg-primary/10 text-primary px-3 py-1 rounded font-mono text-lg">
                        {selectedRegistration.verification_code}
                      </code>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">
                  Registered: {format(new Date(selectedRegistration.registered_at), "PPP")}
                </span>
                {getStatusBadge(selectedRegistration.status)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
