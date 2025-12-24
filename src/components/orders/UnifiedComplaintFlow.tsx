import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, Loader2, Camera, X, Info, CheckCircle, 
  PackageX, RotateCcw, Shield, CreditCard, Building2, Gift, Clock, MessageSquare, Smartphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLiveChat } from "@/hooks/useLiveChat";
import { motion } from "framer-motion";

interface UnifiedComplaintFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  userId: string;
  complaintType: "not_received" | "damaged" | "return" | "replace" | "warranty";
  orderItems: { id: string; name: string; product_id?: string; price?: number; quantity?: number }[];
  orderPaymentMethod: string;
  orderAmount: number;
  deliveredAt?: string;
  onCompleted: () => void;
}

const DAMAGE_TYPES = [
  { value: "internal", label: "Internal Component Damage", covered: true },
  { value: "manufacturing", label: "Manufacturing Defect", covered: true },
  { value: "transit", label: "Transit Damage (within 48hrs)", covered: true },
  { value: "water", label: "Water Damage", covered: false },
  { value: "external", label: "External/Accidental Damage", covered: false },
];

const RETURN_REASONS = [
  "Product not as described",
  "Wrong size/fit",
  "Quality not as expected",
  "Received wrong item",
  "Changed my mind",
  "Other",
];

const REFUND_METHODS = [
  { id: "upi", label: "UPI Transfer", description: "Up to 24 hours", icon: Smartphone },
  { id: "bank", label: "Bank Transfer", description: "Up to 2 business days", icon: Building2 },
  { id: "gift_card", label: "Store Credit", description: "Instant (within 1 minute after approval)", icon: Gift },
];

export function UnifiedComplaintFlow({
  open,
  onOpenChange,
  orderId,
  userId,
  complaintType,
  orderItems,
  orderPaymentMethod,
  orderAmount,
  deliveredAt,
  onCompleted,
}: UnifiedComplaintFlowProps) {
  const { openChat } = useLiveChat();
  
  // Step management
  const [step, setStep] = useState<"form" | "refund_method" | "success">("form");
  
  // Form states
  const [selectedProduct, setSelectedProduct] = useState("");
  const [damageType, setDamageType] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedRefundMethod, setSelectedRefundMethod] = useState<string | null>(null);
  
  // Refund details states
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");
  const [bankAccountHolder, setBankAccountHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountConfirm, setBankAccountConfirm] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Result
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  // Check warranty validity
  const getWarrantyStatus = () => {
    if (!deliveredAt) return { isValid: false, endDate: null };
    const deliveryDate = new Date(deliveredAt);
    const warrantyEnd = new Date(deliveryDate);
    warrantyEnd.setMonth(warrantyEnd.getMonth() + 12);
    return { 
      isValid: warrantyEnd > new Date(), 
      endDate: warrantyEnd.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    };
  };

  const warrantyStatus = getWarrantyStatus();

  const getTitle = () => {
    switch (complaintType) {
      case "not_received": return "Report Order Not Received";
      case "damaged": return "Report Damaged Product";
      case "return": return "Request Return (Refund)";
      case "replace": return "Request Replacement";
      case "warranty": return "File Warranty Claim";
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const maxImages = complaintType === "not_received" ? 0 : 5;
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `complaints/${orderId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("media-uploads")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("media-uploads")
          .getPublicUrl(fileName);

        setImages((prev) => [...prev, urlData.publicUrl]);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (complaintType !== "not_received" && !selectedProduct) {
      toast.error("Please select a product");
      return false;
    }
    if (complaintType === "damaged" && !damageType) {
      toast.error("Please select damage type");
      return false;
    }
    if ((complaintType === "return" || complaintType === "replace") && !returnReason) {
      toast.error("Please select a reason");
      return false;
    }
    if (complaintType !== "not_received" && !description.trim()) {
      toast.error("Please provide a description");
      return false;
    }
    if ((complaintType === "damaged" || complaintType === "warranty") && images.length === 0) {
      toast.error("Please upload at least one image");
      return false;
    }
    if (!termsAccepted) {
      toast.error("Please accept the terms");
      return false;
    }
    if (complaintType === "warranty" && !warrantyStatus.isValid) {
      toast.error("Product is out of warranty");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const selectedItem = orderItems.find((i) => i.id === selectedProduct);
      
      // Build description based on type
      let fullDescription = description;
      if (complaintType === "damaged") {
        const damageLabel = DAMAGE_TYPES.find(d => d.value === damageType)?.label;
        fullDescription = `Damage Type: ${damageLabel}\n\n${description}`;
      }
      if (complaintType === "return" || complaintType === "replace") {
        fullDescription = `Reason: ${returnReason}\n\n${description}`;
      }
      if (complaintType === "not_received") {
        fullDescription = "Customer reported order not received";
      }

      // Create complaint
      const { data: complaint, error } = await supabase
        .from("order_complaints")
        .insert({
          order_id: orderId,
          user_id: userId,
          complaint_type: complaintType,
          description: fullDescription,
          images: images.length > 0 ? images : null,
          investigation_status: "investigating",
        })
        .select()
        .single();

      if (error) throw error;

      setComplaintId(complaint.id);

      // Update order with complaint reference
      await supabase
        .from("orders")
        .update({ 
          active_complaint_id: complaint.id,
          complaint_status: "investigating"
        })
        .eq("id", orderId);

      // Send notification
      await supabase.functions.invoke("send-complaint-notification", {
        body: {
          complaintId: complaint.id,
          orderId,
          userId,
          notificationType: "complaint_received",
          complaintType,
          customerName: "Customer",
          customerEmail: "",
        },
      });

      // For prepaid orders with return/not_received, ask for refund method
      if ((complaintType === "not_received" || complaintType === "return") && orderPaymentMethod !== "cod") {
        setStep("refund_method");
      } else {
        // Returns do NOT get coupons - only refund after approval
        // Other types (damaged, replace, warranty) just get submitted and wait for admin
        await finishComplaint(complaint.id);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Coupons are NOT generated by customer-side submission
  // Admin will generate coupon when approving (for eligible types only: damaged, replace, warranty, not_received)
  // Returns NEVER get coupons - only refund
  const finishComplaint = async (cId?: string) => {
    setIsLoading(true);
    try {
      // Build refund details based on method
      let refundMethodDetails = selectedRefundMethod;
      if (selectedRefundMethod === "upi") {
        refundMethodDetails = `upi:${upiId}:${upiName}`;
      } else if (selectedRefundMethod === "bank") {
        refundMethodDetails = `bank:${bankAccountHolder}:${bankName}:${bankAccountNumber}:${bankIfsc}`;
      }
      
      // Update complaint with refund method if selected
      await supabase
        .from("order_complaints")
        .update({
          refund_method: refundMethodDetails || null,
          resolution_type: complaintType === "return" ? "refund" : 
                          complaintType === "replace" ? "replacement" : null,
          // No coupon code - admin will add if eligible and approved
        })
        .eq("id", cId || complaintId);

      setStep("success");
      toast.success("Request submitted successfully! Our team will review it.");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundMethodSelect = () => {
    if (!selectedRefundMethod) return;
    
    // Validate UPI details
    if (selectedRefundMethod === "upi") {
      if (!upiId.trim()) {
        toast.error("Please enter your UPI ID");
        return;
      }
      if (!upiName.trim()) {
        toast.error("Please enter account holder name");
        return;
      }
    }
    
    // Validate Bank details
    if (selectedRefundMethod === "bank") {
      if (!bankAccountHolder.trim()) {
        toast.error("Please enter account holder name");
        return;
      }
      if (!bankName.trim()) {
        toast.error("Please enter bank name");
        return;
      }
      if (!bankAccountNumber.trim()) {
        toast.error("Please enter account number");
        return;
      }
      if (bankAccountNumber !== bankAccountConfirm) {
        toast.error("Account numbers do not match");
        return;
      }
      if (!bankIfsc.trim()) {
        toast.error("Please enter IFSC code");
        return;
      }
    }
    
    finishComplaint(complaintId!);
  };

  const handleContactSupport = () => {
    const message = `Order Issue - Order #${orderId.slice(0, 8)}\nType: ${complaintType}\n\nI need help with my complaint.`;
    openChat(message);
    onOpenChange(false);
  };

  const handleClose = () => {
    if (step === "success") {
      onCompleted();
    }
    onOpenChange(false);
  };

  const selectedDamageType = DAMAGE_TYPES.find((d) => d.value === damageType);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {complaintType === "not_received" && <PackageX className="w-5 h-5 text-red-500" />}
            {complaintType === "damaged" && <AlertTriangle className="w-5 h-5 text-orange-500" />}
            {(complaintType === "return" || complaintType === "replace") && <RotateCcw className="w-5 h-5 text-blue-500" />}
            {complaintType === "warranty" && <Shield className="w-5 h-5 text-purple-500" />}
            {step === "form" && getTitle()}
            {step === "refund_method" && "Select Refund Method"}
            {step === "success" && "Request Submitted"}
          </DialogTitle>
          <DialogDescription>
            {step === "form" && "Our team will review your request and get back to you within 24-48 hours."}
            {step === "refund_method" && "How would you like to receive your refund once verified?"}
            {step === "success" && "We've received your request. Here's what happens next:"}
          </DialogDescription>
        </DialogHeader>

        {/* Form Step */}
        {step === "form" && (
          <div className="space-y-4">
            {/* Product Selection (not for not_received) */}
            {complaintType !== "not_received" && (
              <div className="space-y-2">
                <Label>Select Product *</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {orderItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Damage Type (for damaged) */}
            {complaintType === "damaged" && (
              <div className="space-y-2">
                <Label>Type of Damage *</Label>
                <Select value={damageType} onValueChange={setDamageType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select damage type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAMAGE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          {type.label}
                          {!type.covered && <span className="text-xs text-red-500">(Not Covered)</span>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedDamageType && (
                  <div className={`p-3 rounded-lg text-sm ${selectedDamageType.covered ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                    <Info className={`w-4 h-4 inline mr-2 ${selectedDamageType.covered ? "text-green-500" : "text-red-500"}`} />
                    {selectedDamageType.covered 
                      ? "This type of damage is covered. We'll process your claim."
                      : "This type of damage is not covered under warranty or return policy."
                    }
                  </div>
                )}
              </div>
            )}

            {/* Return Reason (for return/replace) */}
            {(complaintType === "return" || complaintType === "replace") && (
              <div className="space-y-2">
                <Label>Reason for {complaintType === "return" ? "Return" : "Replacement"} *</Label>
                <Select value={returnReason} onValueChange={setReturnReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETURN_REASONS.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Warranty Status (for warranty) */}
            {complaintType === "warranty" && (
              <div className={`p-3 rounded-lg text-sm ${warrantyStatus.isValid ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                <Shield className={`w-4 h-4 inline mr-2 ${warrantyStatus.isValid ? "text-green-500" : "text-red-500"}`} />
                {warrantyStatus.isValid 
                  ? `Product is under warranty until ${warrantyStatus.endDate}`
                  : "Product warranty has expired"
                }
              </div>
            )}

            {/* Description */}
            {complaintType !== "not_received" && (
              <div className="space-y-2">
                <Label>Describe the Issue *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe the problem in detail..."
                  rows={4}
                />
              </div>
            )}

            {/* Image Upload (not for not_received) */}
            {complaintType !== "not_received" && (
              <div className="space-y-2">
                <Label>Upload Photos {(complaintType === "damaged" || complaintType === "warranty") ? "*" : "(Optional)"} (Max 5)</Label>
                <div className="flex gap-2 flex-wrap">
                  {images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50">
                      {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5 text-muted-foreground" />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Warning for not_received */}
            {complaintType === "not_received" && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <p className="text-sm text-orange-400">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  <strong>Note:</strong> False reports may result in account restrictions. Our delivery partners record proof of delivery.
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <p className="font-medium mb-1">What happens next?</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Our team will review your request (24-48 hours)</li>
                {complaintType !== "not_received" && <li>• If approved, we'll schedule a pickup for the product</li>}
                {complaintType === "replace" && <li>• After pickup, we'll ship a replacement (prepaid)</li>}
                {complaintType === "return" && <li>• After pickup, refund will be processed</li>}
                {complaintType === "warranty" && <li>• Product will be repaired or replaced under warranty</li>}
                <li>• You'll receive a 20% discount coupon as an apology</li>
              </ul>
            </div>

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(c) => setTermsAccepted(c as boolean)}
              />
              <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                I accept the terms and conditions. I understand that false claims may result in account restrictions.
              </Label>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Refund Method Step */}
        {step === "refund_method" && (
          <div className="space-y-4">
            {complaintType !== "return" && (
              <p className="text-sm text-muted-foreground">
                If approved, you may also receive a <strong>20% discount coupon</strong> as an apology.
              </p>
            )}
            {complaintType === "return" && (
              <p className="text-sm text-muted-foreground">
                Once your return is approved and item picked up, the refund will be processed.
              </p>
            )}

            <div className="space-y-3">
              {REFUND_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedRefundMethod === method.id;

                return (
                  <motion.button
                    key={method.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedRefundMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{method.label}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* UPI Details Form */}
            {selectedRefundMethod === "upi" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 p-4 bg-muted/50 rounded-lg border"
              >
                <p className="text-sm font-medium flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  UPI Details
                </p>
                <div className="space-y-2">
                  <Label htmlFor="upi-id">UPI ID *</Label>
                  <Input
                    id="upi-id"
                    placeholder="example@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upi-name">Account Holder Name *</Label>
                  <Input
                    id="upi-name"
                    placeholder="Full name as per UPI account"
                    value={upiName}
                    onChange={(e) => setUpiName(e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {/* Bank Transfer Details Form */}
            {selectedRefundMethod === "bank" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3 p-4 bg-muted/50 rounded-lg border"
              >
                <p className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Bank Account Details
                </p>
                <div className="space-y-2">
                  <Label htmlFor="bank-holder">Account Holder Name *</Label>
                  <Input
                    id="bank-holder"
                    placeholder="Full name as per bank account"
                    value={bankAccountHolder}
                    onChange={(e) => setBankAccountHolder(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank Name *</Label>
                  <Input
                    id="bank-name"
                    placeholder="e.g., State Bank of India"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-account">Account Number *</Label>
                  <Input
                    id="bank-account"
                    placeholder="Enter account number"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-account-confirm">Confirm Account Number *</Label>
                  <Input
                    id="bank-account-confirm"
                    placeholder="Re-enter account number"
                    value={bankAccountConfirm}
                    onChange={(e) => setBankAccountConfirm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank-ifsc">IFSC Code *</Label>
                  <Input
                    id="bank-ifsc"
                    placeholder="e.g., SBIN0001234"
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                  />
                </div>
              </motion.div>
            )}

            {/* Store Credit Info */}
            {selectedRefundMethod === "gift_card" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-4 bg-green-500/10 rounded-lg border border-green-500/20"
              >
                <p className="text-sm flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-500" />
                  <span>
                    <strong>Fastest option!</strong> Once approved by admin, you'll receive a store credit coupon code instantly (within 1 minute) that you can use on your next order.
                  </span>
                </p>
              </motion.div>
            )}

            <Button onClick={handleRefundMethodSelect} disabled={!selectedRefundMethod || isLoading} className="w-full">
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</> : "Continue"}
            </Button>
          </div>
        )}

        {/* Success Step */}
        {step === "success" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Request Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    Our team is reviewing your request. Usually takes 24-48 hours.
                  </p>
                </div>
              </div>

              {complaintType === "return" && (
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Return Process</p>
                    <p className="text-sm text-muted-foreground">
                      If approved, we'll schedule a pickup. After successful pickup, your refund will be processed. 
                      <span className="block mt-1 text-xs">Note: Returns are refund-only, no additional coupons.</span>
                    </p>
                  </div>
                </div>
              )}

              {selectedRefundMethod && (
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Refund Method Selected</p>
                    <p className="text-sm text-muted-foreground">
                      Once verified and pickup completed, refund will be processed.
                    </p>
                  </div>
                </div>
              )}

              {(complaintType === "replace" || complaintType === "warranty") && (
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <RotateCcw className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Pickup & Replacement</p>
                    <p className="text-sm text-muted-foreground">
                      If approved, we'll pickup the defective item, then ship replacement (FREE).
                      You'll also receive a 20% apology coupon.
                    </p>
                  </div>
                </div>
              )}

              {complaintType === "damaged" && (
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Damage Claim</p>
                    <p className="text-sm text-muted-foreground">
                      If approved, you'll receive replacement/refund + 20% apology coupon.
                    </p>
                  </div>
                </div>
              )}

              {complaintType === "not_received" && (
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <PackageX className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Not Received Investigation</p>
                    <p className="text-sm text-muted-foreground">
                      We'll verify with delivery partner. If confirmed, you'll receive refund/replacement + 20% coupon.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleContactSupport} className="flex-1">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
