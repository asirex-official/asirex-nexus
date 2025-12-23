import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, RefreshCw, Loader2, Camera, X, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReturnReplaceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  userId: string;
  orderItems: { id: string; name: string; product_id?: string }[];
  onSubmitted: () => void;
}

const RETURN_REASONS = [
  "Product not as described",
  "Wrong size/fit",
  "Quality not as expected",
  "Received wrong item",
  "Changed my mind",
  "Better price available",
  "Other",
];

export function ReturnReplaceForm({
  open,
  onOpenChange,
  orderId,
  userId,
  orderItems,
  onSubmitted,
}: ReturnReplaceFormProps) {
  const [requestType, setRequestType] = useState<"return" | "replacement">("return");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `returns/${orderId}/${Date.now()}.${fileExt}`;

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
      console.error("Error uploading:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedProduct || !reason) {
      toast.error("Please select a product and reason");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the terms");
      return;
    }

    setIsLoading(true);
    try {
      const item = orderItems.find((i) => i.id === selectedProduct);

      const { error } = await supabase.from("return_requests").insert({
        order_id: orderId,
        user_id: userId,
        product_id: item?.product_id || null,
        request_type: requestType,
        reason,
        description,
        images,
        terms_accepted: termsAccepted,
        status: "pending",
      });

      if (error) throw error;

      toast.success(
        `${requestType === "return" ? "Return" : "Replacement"} request submitted successfully!`
      );
      onSubmitted();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-500" />
            Return or Replace
          </DialogTitle>
          <DialogDescription>
            Request a return for refund or a replacement for your product
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Type */}
          <div className="space-y-2">
            <Label>What would you like to do?</Label>
            <RadioGroup
              value={requestType}
              onValueChange={(v) => setRequestType(v as "return" | "replacement")}
              className="grid grid-cols-2 gap-3"
            >
              <Label
                htmlFor="return"
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  requestType === "return"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <RadioGroupItem value="return" id="return" />
                <div>
                  <p className="font-medium">Return</p>
                  <p className="text-xs text-muted-foreground">Get a refund</p>
                </div>
              </Label>
              <Label
                htmlFor="replacement"
                className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  requestType === "replacement"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <RadioGroupItem value="replacement" id="replacement" />
                <div>
                  <p className="font-medium">Replace</p>
                  <p className="text-xs text-muted-foreground">Get same product</p>
                </div>
              </Label>
            </RadioGroup>
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label>Select Product</Label>
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

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason for {requestType}</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {RETURN_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Additional Details (Optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details..."
              rows={3}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Upload Photos (Optional, Max 3)</Label>
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-muted-foreground" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-600">Return Policy</p>
              <p className="text-muted-foreground">
                {requestType === "return"
                  ? "Refund will be processed within 5-7 business days after pickup."
                  : "Replacement depends on stock availability. We'll notify you if unavailable."}
              </p>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(c) => setTermsAccepted(c as boolean)}
            />
            <Label htmlFor="terms" className="text-sm font-normal leading-tight">
              I accept the return/replacement policy and agree that the product is in original
              condition with tags and packaging intact.
            </Label>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedProduct || !reason || !termsAccepted}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                `Submit ${requestType === "return" ? "Return" : "Replacement"} Request`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
