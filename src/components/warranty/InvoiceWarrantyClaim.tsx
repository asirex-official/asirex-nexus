import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, FileCheck, AlertCircle, CheckCircle, 
  Loader2, Shield, ArrowRight, Package, Calendar,
  X, ImagePlus, Camera
} from "lucide-react";
import { extractVerificationData } from "@/utils/invoiceGenerator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface VerifiedOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  delivered_at: string;
  items: { id: string; name: string; product_id?: string; price?: number; quantity?: number }[];
  total_amount: number;
  payment_method: string;
  warrantyValid: boolean;
  warrantyEndDate: string;
}

interface InvoiceWarrantyClaimProps {
  userId: string;
  onClaimSubmitted: () => void;
}

export function InvoiceWarrantyClaim({ userId, onClaimSubmitted }: InvoiceWarrantyClaimProps) {
  const [step, setStep] = useState<'upload' | 'verify' | 'describe' | 'submitting' | 'success'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState<VerifiedOrder | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [issueDescription, setIssueDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      verifyInvoice(file);
    } else {
      toast.error("Please upload a PDF invoice file");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      verifyInvoice(file);
    } else {
      toast.error("Please upload a PDF invoice file");
    }
  };

  const verifyInvoice = async (file: File) => {
    setIsVerifying(true);
    setVerificationError(null);
    setStep('verify');

    try {
      // Extract verification data from the PDF
      const result = await extractVerificationData(file);
      
      if (!result.isValid || !result.orderId) {
        setVerificationError("Invalid or unverified invoice. Please upload a genuine ASIREX invoice.");
        return;
      }

      // Fetch order from database
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', result.orderId)
        .single();

      if (error || !order) {
        setVerificationError("Order not found in our records. Please ensure you're using a valid invoice.");
        return;
      }

      // Check if order belongs to user
      if (order.user_id !== userId) {
        setVerificationError("This order doesn't belong to your account.");
        return;
      }

      // Check if order is delivered
      if (order.order_status !== 'delivered') {
        setVerificationError("Warranty claims can only be filed for delivered orders.");
        return;
      }

      // Calculate warranty status
      const deliveryDate = new Date(order.delivered_at || order.updated_at);
      const warrantyEndDate = new Date(deliveryDate);
      warrantyEndDate.setMonth(warrantyEndDate.getMonth() + 12);
      const warrantyValid = warrantyEndDate > new Date();

      setVerifiedOrder({
        id: order.id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        delivered_at: order.delivered_at || order.updated_at,
        items: Array.isArray(order.items) ? (order.items as any[]) : [],
        total_amount: order.total_amount,
        payment_method: order.payment_method || 'cod',
        warrantyValid,
        warrantyEndDate: warrantyEndDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      });

    } catch (error) {
      console.error("Invoice verification error:", error);
      setVerificationError("Failed to verify invoice. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `warranty-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `warranty-claims/${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media-uploads')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('media-uploads')
          .getPublicUrl(filePath);

        newImages.push(urlData.publicUrl);
      }

      setImages([...images, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const submitClaim = async () => {
    if (!verifiedOrder || !issueDescription.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    setStep('submitting');

    try {
      // Check for existing active claim
      const { data: existingClaim } = await supabase
        .from('order_complaints')
        .select('id')
        .eq('order_id', verifiedOrder.id)
        .eq('user_id', userId)
        .eq('complaint_type', 'warranty')
        .eq('investigation_status', 'investigating')
        .single();

      if (existingClaim) {
        toast.error("You already have an active warranty claim for this order");
        setStep('describe');
        return;
      }

      // Create warranty claim
      const { error } = await supabase
        .from('order_complaints')
        .insert({
          order_id: verifiedOrder.id,
          user_id: userId,
          complaint_type: 'warranty',
          description: issueDescription,
          images: images,
          investigation_status: 'investigating',
        });

      if (error) throw error;

      // Create notification for user
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Warranty Claim Submitted',
        message: `Your warranty claim for order #${verifiedOrder.id.slice(0, 8)} has been submitted and is under review.`,
        type: 'warranty',
        link: '/warranty-claims',
      });

      setStep('success');
      toast.success("Warranty claim submitted successfully!");
      
      setTimeout(() => {
        onClaimSubmitted();
      }, 2000);

    } catch (error) {
      console.error("Error submitting claim:", error);
      toast.error("Failed to submit warranty claim");
      setStep('describe');
    }
  };

  const resetFlow = () => {
    setStep('upload');
    setVerifiedOrder(null);
    setVerificationError(null);
    setIssueDescription("");
    setImages([]);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-purple-500/10">
          <Shield className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h3 className="font-semibold">File Warranty Claim with Invoice</h3>
          <p className="text-sm text-muted-foreground">Upload your ASIREX invoice to verify and file a claim</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Upload Invoice */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'}
              `}
            >
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium mb-1">Drop your invoice PDF here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Only genuine ASIREX invoices with embedded verification codes will be accepted. 
                The system will automatically detect your order and verify warranty status.
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Verification */}
        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-8"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
                <p className="font-medium">Verifying Invoice...</p>
                <p className="text-sm text-muted-foreground">Checking authenticity and warranty status</p>
              </>
            ) : verificationError ? (
              <>
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                <p className="font-medium text-destructive mb-2">Verification Failed</p>
                <p className="text-sm text-muted-foreground mb-4">{verificationError}</p>
                <Button variant="outline" onClick={resetFlow}>
                  Try Again
                </Button>
              </>
            ) : verifiedOrder ? (
              <div className="text-left">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="w-6 h-6 text-green-500" />
                  <span className="font-medium text-green-500">Invoice Verified!</span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Order ID</span>
                      <code className="font-mono text-sm">{verifiedOrder.id.slice(0, 8)}</code>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Delivered On</span>
                      <span className="text-sm">{format(new Date(verifiedOrder.delivered_at), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Warranty Status</span>
                      <Badge className={verifiedOrder.warrantyValid 
                        ? "bg-green-500/20 text-green-500" 
                        : "bg-red-500/20 text-red-500"
                      }>
                        {verifiedOrder.warrantyValid ? `Valid till ${verifiedOrder.warrantyEndDate}` : 'Expired'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Products:</p>
                    {verifiedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="w-4 h-4" />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>

                  {verifiedOrder.warrantyValid ? (
                    <Button className="w-full" onClick={() => setStep('describe')}>
                      Proceed to File Claim
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="p-4 bg-red-500/10 rounded-lg">
                      <p className="text-sm text-red-500">
                        This order is out of the 12-month warranty period. Warranty claims cannot be filed.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Step 3: Describe Issue */}
        {step === 'describe' && verifiedOrder && (
          <motion.div
            key="describe"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="p-3 bg-muted/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Order #{verifiedOrder.id.slice(0, 8)} verified</span>
              </div>
              <Badge className="bg-green-500/20 text-green-500">Warranty Valid</Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issue">Describe the Issue *</Label>
              <Textarea
                id="issue"
                placeholder="Please describe the problem you're experiencing with the product in detail..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Images (Optional)</Label>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                    ) : (
                      <ImagePlus className="w-6 h-6 text-muted-foreground" />
                    )}
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Add photos showing the issue (max 4 images)</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetFlow} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={submitClaim} 
                disabled={!issueDescription.trim()}
                className="flex-1"
              >
                Submit Warranty Claim
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Submitting */}
        {step === 'submitting' && (
          <motion.div
            key="submitting"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-8"
          >
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary animate-spin" />
            <p className="font-medium">Submitting Your Claim...</p>
          </motion.div>
        )}

        {/* Step 5: Success */}
        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-8"
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="font-semibold text-lg mb-2">Claim Submitted Successfully!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your warranty claim is under review. We'll notify you via email once it's processed.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
