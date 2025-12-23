import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  RotateCcw,
  Shield,
  PackageX,
  Star,
  MessageSquare,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface Issue {
  id: string;
  order_id: string;
  user_id: string;
  issue_type: string;
  damage_type?: string;
  description: string;
  images?: string[];
  status: string;
  created_at: string;
  admin_notes?: string;
  order?: { customer_name: string; customer_email: string };
}

interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string;
  product_id?: string;
  request_type: string;
  reason: string;
  description?: string;
  images?: string[];
  status: string;
  created_at: string;
  admin_notes?: string;
  order?: { customer_name: string; customer_email: string };
}

interface WarrantyClaim {
  id: string;
  order_id: string;
  user_id: string;
  product_name: string;
  issue_description: string;
  images?: string[];
  status: string;
  created_at: string;
  warranty_start_date: string;
  warranty_end_date: string;
  admin_notes?: string;
  resolution_type?: string;
  order?: { customer_name: string; customer_email: string };
}

interface Review {
  id: string;
  order_id: string;
  user_id: string;
  product_id: string;
  rating: number;
  review_text?: string;
  images?: string[];
  status: string;
  created_at: string;
  product?: { name: string };
}

export default function CustomerIssuesManager() {
  const [activeTab, setActiveTab] = useState("issues");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [returnRequests, setReturnRequests] = useState<ReturnRequest[]>([]);
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAllData();
    setupRealtimeSubscriptions();
  }, []);

  const setupRealtimeSubscriptions = () => {
    const issuesChannel = supabase
      .channel('admin-issues')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_issues' }, () => {
        fetchIssues();
        toast.info("New customer issue reported", { icon: <AlertTriangle className="w-4 h-4 text-orange-500" /> });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'return_requests' }, () => {
        fetchReturns();
        toast.info("New return/replacement request", { icon: <RotateCcw className="w-4 h-4 text-blue-500" /> });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'warranty_claims' }, () => {
        fetchWarranty();
        toast.info("New warranty claim submitted", { icon: <Shield className="w-4 h-4 text-green-500" /> });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'product_reviews' }, () => {
        fetchReviews();
        toast.info("New product review received", { icon: <Star className="w-4 h-4 text-yellow-500" /> });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(issuesChannel);
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchIssues(), fetchReturns(), fetchWarranty(), fetchReviews()]);
    setLoading(false);
  };

  const fetchIssues = async () => {
    const { data } = await supabase
      .from("order_issues")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      const orderIds = [...new Set(data.map(i => i.order_id))];
      const { data: orders } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email")
        .in("id", orderIds);
      
      const orderMap = new Map(orders?.map(o => [o.id, o]) || []);
      setIssues(data.map(i => ({
        ...i,
        order: orderMap.get(i.order_id)
      })) as Issue[]);
    }
  };

  const fetchReturns = async () => {
    const { data } = await supabase
      .from("return_requests")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      const orderIds = [...new Set(data.map(r => r.order_id))];
      const { data: orders } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email")
        .in("id", orderIds);
      
      const orderMap = new Map(orders?.map(o => [o.id, o]) || []);
      setReturnRequests(data.map(r => ({
        ...r,
        order: orderMap.get(r.order_id)
      })) as ReturnRequest[]);
    }
  };

  const fetchWarranty = async () => {
    const { data } = await supabase
      .from("warranty_claims")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      const orderIds = [...new Set(data.map(w => w.order_id))];
      const { data: orders } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email")
        .in("id", orderIds);
      
      const orderMap = new Map(orders?.map(o => [o.id, o]) || []);
      setWarrantyClaims(data.map(w => ({
        ...w,
        order: orderMap.get(w.order_id)
      })) as WarrantyClaim[]);
    }
  };

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("product_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      // Fetch product names separately
      const productIds = [...new Set(data.map(r => r.product_id))];
      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);
      
      const productMap = new Map(products?.map(p => [p.id, p.name]) || []);
      
      setReviews(data.map(r => ({
        ...r,
        product: { name: productMap.get(r.product_id) || "Unknown" }
      })) as Review[]);
    }
  };

  const openDetailDialog = (item: any, type: string) => {
    setSelectedItem(item);
    setDialogType(type);
    setAdminNotes(item.admin_notes || "");
    setNewStatus(item.status);
  };

  const handleUpdateStatus = async () => {
    if (!selectedItem) return;
    setIsUpdating(true);

    try {
      const updateData: any = { status: newStatus };
      if (dialogType !== "review") {
        updateData.admin_notes = adminNotes;
      }
      if (newStatus === "resolved" || newStatus === "completed") {
        updateData.resolved_at = new Date().toISOString();
      }

      let error = null;
      
      if (dialogType === "issue") {
        const result = await supabase.from("order_issues").update(updateData).eq("id", selectedItem.id);
        error = result.error;
      } else if (dialogType === "return") {
        const result = await supabase.from("return_requests").update(updateData).eq("id", selectedItem.id);
        error = result.error;
      } else if (dialogType === "warranty") {
        const result = await supabase.from("warranty_claims").update(updateData).eq("id", selectedItem.id);
        error = result.error;
      } else if (dialogType === "review") {
        const result = await supabase.from("product_reviews").update(updateData).eq("id", selectedItem.id);
        error = result.error;
      }

      if (error) throw error;

      toast.success("Status updated successfully");
      fetchAllData();
      setSelectedItem(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      submitted: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      under_review: "bg-purple-500/20 text-purple-600 border-purple-500/30",
      in_progress: "bg-orange-500/20 text-orange-600 border-orange-500/30",
      approved: "bg-green-500/20 text-green-600 border-green-500/30",
      rejected: "bg-red-500/20 text-red-600 border-red-500/30",
      resolved: "bg-green-500/20 text-green-600 border-green-500/30",
      completed: "bg-green-500/20 text-green-600 border-green-500/30",
      published: "bg-green-500/20 text-green-600 border-green-500/30",
      hidden: "bg-gray-500/20 text-gray-600 border-gray-500/30",
    };
    return (
      <Badge variant="outline" className={styles[status] || "bg-muted"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const countByStatus = (items: any[], status: string) =>
    items.filter((i) => i.status === status).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Issues</h1>
          <p className="text-muted-foreground">Manage complaints, returns, warranty claims & reviews</p>
        </div>
        <Button variant="outline" onClick={fetchAllData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-orange-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issues.length}</div>
            <p className="text-xs text-muted-foreground">
              {countByStatus(issues, "submitted")} pending
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-500" />
              Returns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returnRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              {countByStatus(returnRequests, "pending")} pending
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Warranty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warrantyClaims.length}</div>
            <p className="text-xs text-muted-foreground">
              {countByStatus(warrantyClaims, "submitted")} pending
            </p>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground">
              {countByStatus(reviews, "pending")} to moderate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="issues" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="returns" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Returns
          </TabsTrigger>
          <TabsTrigger value="warranty" className="gap-2">
            <Shield className="w-4 h-4" />
            Warranty
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <Star className="w-4 h-4" />
            Reviews
          </TabsTrigger>
        </TabsList>

        {/* Issues Tab */}
        <TabsContent value="issues" className="space-y-4">
          {issues.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No issues reported</Card>
          ) : (
            issues.map((issue) => (
              <Card key={issue.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{issue.order?.customer_name || "Unknown"}</CardTitle>
                      <CardDescription>
                        Order #{issue.order_id.slice(0, 8)} • {issue.issue_type} {issue.damage_type && `(${issue.damage_type})`}
                      </CardDescription>
                    </div>
                    {getStatusBadge(issue.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{issue.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => openDetailDialog(issue, "issue")}>
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Returns Tab */}
        <TabsContent value="returns" className="space-y-4">
          {returnRequests.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No return requests</Card>
          ) : (
            returnRequests.map((req) => (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {req.order?.customer_name || "Unknown"}
                        <Badge variant="secondary">{req.request_type}</Badge>
                      </CardTitle>
                      <CardDescription>
                        Order #{req.order_id.slice(0, 8)} • {req.reason}
                      </CardDescription>
                    </div>
                    {getStatusBadge(req.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {req.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{req.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => openDetailDialog(req, "return")}>
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Warranty Tab */}
        <TabsContent value="warranty" className="space-y-4">
          {warrantyClaims.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No warranty claims</Card>
          ) : (
            warrantyClaims.map((claim) => (
              <Card key={claim.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{claim.product_name}</CardTitle>
                      <CardDescription>
                        {claim.order?.customer_name} • Order #{claim.order_id.slice(0, 8)}
                      </CardDescription>
                    </div>
                    {getStatusBadge(claim.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{claim.issue_description}</p>
                  <p className="text-xs text-green-600 mb-3">
                    Warranty: {claim.warranty_start_date} - {claim.warranty_end_date}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(claim.created_at).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => openDetailDialog(claim, "warranty")}>
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-4">
          {reviews.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">No reviews yet</Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {review.product?.name || "Unknown Product"}
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                            />
                          ))}
                        </div>
                      </CardTitle>
                      <CardDescription>Order #{review.order_id.slice(0, 8)}</CardDescription>
                    </div>
                    {getStatusBadge(review.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{review.review_text}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="outline" onClick={() => openDetailDialog(review, "review")}>
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogType === "issue" && <AlertTriangle className="w-5 h-5 text-orange-500" />}
              {dialogType === "return" && <RotateCcw className="w-5 h-5 text-blue-500" />}
              {dialogType === "warranty" && <Shield className="w-5 h-5 text-green-500" />}
              {dialogType === "review" && <Star className="w-5 h-5 text-yellow-500" />}
              {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} Details
            </DialogTitle>
            <DialogDescription>
              Review and update the status of this {dialogType}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Customer</h4>
                <p>{selectedItem.order?.customer_name || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">{selectedItem.order?.customer_email}</p>
                <p className="text-xs text-muted-foreground mt-1">Order: #{selectedItem.order_id?.slice(0, 8)}</p>
              </div>

              {/* Content */}
              <div className="space-y-3">
                {dialogType === "issue" && (
                  <>
                    <div>
                      <h4 className="font-medium">Issue Type</h4>
                      <p className="text-muted-foreground">{selectedItem.issue_type} {selectedItem.damage_type && `(${selectedItem.damage_type})`}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Description</h4>
                      <p className="text-muted-foreground">{selectedItem.description}</p>
                    </div>
                  </>
                )}
                {dialogType === "return" && (
                  <>
                    <div>
                      <h4 className="font-medium">Request Type</h4>
                      <Badge>{selectedItem.request_type}</Badge>
                    </div>
                    <div>
                      <h4 className="font-medium">Reason</h4>
                      <p className="text-muted-foreground">{selectedItem.reason}</p>
                    </div>
                    {selectedItem.description && (
                      <div>
                        <h4 className="font-medium">Additional Details</h4>
                        <p className="text-muted-foreground">{selectedItem.description}</p>
                      </div>
                    )}
                  </>
                )}
                {dialogType === "warranty" && (
                  <>
                    <div>
                      <h4 className="font-medium">Product</h4>
                      <p className="text-muted-foreground">{selectedItem.product_name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Warranty Period</h4>
                      <p className="text-green-600">{selectedItem.warranty_start_date} - {selectedItem.warranty_end_date}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Issue</h4>
                      <p className="text-muted-foreground">{selectedItem.issue_description}</p>
                    </div>
                  </>
                )}
                {dialogType === "review" && (
                  <>
                    <div>
                      <h4 className="font-medium">Rating</h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < selectedItem.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {selectedItem.review_text && (
                      <div>
                        <h4 className="font-medium">Review</h4>
                        <p className="text-muted-foreground">{selectedItem.review_text}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Images */}
              {selectedItem.images && selectedItem.images.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Attached Images</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(selectedItem.images as string[]).map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                        <img src={img} alt="" className="w-full aspect-square object-cover rounded-lg hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="space-y-3 border-t pt-4">
                <div>
                  <h4 className="font-medium mb-2">Update Status</h4>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dialogType === "review" ? (
                        <>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="hidden">Hidden</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {dialogType !== "review" && (
                  <div>
                    <h4 className="font-medium mb-2">Admin Notes</h4>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes..."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
