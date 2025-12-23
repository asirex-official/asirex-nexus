import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Loader2, Camera, X, Package, Clock, CheckCircle, AlertTriangle, Info, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLiveChat } from "@/hooks/useLiveChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeliveredOrder {
  id: string;
  delivered_at: string;
  items: { id: string; name: string; product_id?: string }[];
}

export default function WarrantyClaims() {
  const { user, loading: authLoading } = useAuth();
  const { openChat } = useLiveChat();
  const navigate = useNavigate();
  const [deliveredOrders, setDeliveredOrders] = useState<DeliveredOrder[]>([]);
  const [existingClaims, setExistingClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleContactSupport = (claimId: string) => {
    openChat(`Hi, I need help with my warranty claim #${claimId.slice(0, 8)}. Can you assist me?`);
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/warranty-claims");
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [ordersRes, claimsRes] = await Promise.all([
        supabase.from("orders").select("*").eq("user_id", user.id).eq("order_status", "delivered"),
        supabase.from("warranty_claims").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (ordersRes.data) {
        setDeliveredOrders(ordersRes.data.map((o) => ({
          id: o.id,
          delivered_at: o.delivered_at || o.updated_at,
          items: Array.isArray(o.items) ? (o.items as any[]) : [],
        })));
      }
      if (claimsRes.data) setExistingClaims(claimsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOrderData = deliveredOrders.find((o) => o.id === selectedOrder);
  const selectedProductData = selectedOrderData?.items.find((i) => i.id === selectedProduct);

  const getWarrantyDates = () => {
    if (!selectedOrderData) return { start: "", end: "", isValid: false };
    const start = new Date(selectedOrderData.delivered_at);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 12);
    return { start: start.toLocaleDateString(), end: end.toLocaleDateString(), isValid: end > new Date() };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || images.length + files.length > 5) return;
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileName = `warranty/${selectedOrder}/${Date.now()}.${file.name.split(".").pop()}`;
        await supabase.storage.from("media-uploads").upload(fileName, file);
        const { data } = supabase.storage.from("media-uploads").getPublicUrl(fileName);
        setImages((prev) => [...prev, data.publicUrl]);
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrder || !selectedProduct || !issueDescription || !termsAccepted) {
      toast.error("Please fill all required fields");
      return;
    }
    const { start, end, isValid } = getWarrantyDates();
    if (!isValid) {
      toast.error("This product is out of warranty");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("warranty_claims").insert({
        order_id: selectedOrder,
        user_id: user!.id,
        product_id: selectedProductData?.product_id || selectedProduct,
        product_name: selectedProductData?.name || "Unknown Product",
        warranty_start_date: new Date(selectedOrderData!.delivered_at).toISOString().split("T")[0],
        warranty_end_date: new Date(new Date(selectedOrderData!.delivered_at).setMonth(new Date(selectedOrderData!.delivered_at).getMonth() + 12)).toISOString().split("T")[0],
        issue_description: issueDescription,
        images,
        terms_accepted: termsAccepted,
        status: "submitted",
      });
      if (error) throw error;
      toast.success("Warranty claim submitted successfully!");
      fetchData();
      setSelectedOrder("");
      setSelectedProduct("");
      setIssueDescription("");
      setImages([]);
      setTermsAccepted(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit claim");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      submitted: "bg-blue-500/20 text-blue-500",
      under_review: "bg-yellow-500/20 text-yellow-500",
      approved: "bg-green-500/20 text-green-500",
      rejected: "bg-red-500/20 text-red-500",
      completed: "bg-green-500/20 text-green-500",
    };
    return <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || "bg-muted"}`}>{status.replace("_", " ")}</span>;
  };

  if (authLoading || isLoading) {
    return <Layout><div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div></Layout>;
  }

  return (
    <Layout>
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-4xl font-bold mb-2">Warranty <span className="gradient-text">Claims</span></h1>
            <p className="text-muted-foreground">File a warranty claim for your purchased products</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* New Claim Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> New Claim</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Order</Label>
                  <Select value={selectedOrder} onValueChange={(v) => { setSelectedOrder(v); setSelectedProduct(""); }}>
                    <SelectTrigger><SelectValue placeholder="Choose an order" /></SelectTrigger>
                    <SelectContent>
                      {deliveredOrders.map((o) => (
                        <SelectItem key={o.id} value={o.id}>Order #{o.id.slice(0, 8)} - {new Date(o.delivered_at).toLocaleDateString()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedOrder && (
                  <div className="space-y-2">
                    <Label>Select Product</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger><SelectValue placeholder="Choose a product" /></SelectTrigger>
                      <SelectContent>
                        {selectedOrderData?.items.map((item) => (
                          <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedProduct && (
                  <>
                    <div className="p-3 bg-primary/10 rounded-lg text-sm">
                      <p><strong>Warranty Period:</strong> {getWarrantyDates().start} - {getWarrantyDates().end}</p>
                      <p className={getWarrantyDates().isValid ? "text-green-500" : "text-red-500"}>
                        {getWarrantyDates().isValid ? "✓ Within warranty period" : "✗ Out of warranty"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Describe the Issue *</Label>
                      <Textarea value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} placeholder="Describe the problem..." rows={4} />
                    </div>

                    <div className="space-y-2">
                      <Label>Upload Photos (Max 5)</Label>
                      <div className="flex gap-2 flex-wrap">
                        {images.map((img, i) => (
                          <div key={i} className="relative w-16 h-16 rounded overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                        {images.length < 5 && (
                          <label className="w-16 h-16 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-primary">
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5 text-muted-foreground" />}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm">
                      <p className="font-medium text-amber-600">Warranty Covers:</p>
                      <p className="text-muted-foreground">Manufacturing defects, internal component failures</p>
                      <p className="font-medium text-amber-600 mt-2">Not Covered:</p>
                      <p className="text-muted-foreground">Water damage, misuse, accidental breakage, unauthorized repairs</p>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(c) => setTermsAccepted(c as boolean)} />
                      <Label htmlFor="terms" className="text-sm font-normal">I accept the warranty terms and conditions</Label>
                    </div>

                    <Button onClick={handleSubmit} disabled={isSubmitting || !getWarrantyDates().isValid} className="w-full">
                      {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit Warranty Claim"}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>

            {/* Existing Claims */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2"><Clock className="w-5 h-5" /> Your Claims</h2>
              {existingClaims.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground">No warranty claims yet</div>
              ) : (
                existingClaims.map((claim) => (
                  <div key={claim.id} className="glass-card p-4">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{claim.product_name}</p>
                      {getStatusBadge(claim.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{claim.issue_description}</p>
                    <p className="text-xs text-muted-foreground mt-2">Submitted: {new Date(claim.created_at).toLocaleDateString()}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3 w-full"
                      onClick={() => handleContactSupport(claim.id)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
