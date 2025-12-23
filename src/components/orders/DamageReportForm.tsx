import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Camera, Loader2, Upload, X, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DamageReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  userId: string;
  onSubmitted: () => void;
}

const DAMAGE_TYPES = [
  { value: "internal", label: "Internal Component Damage", covered: true },
  { value: "manufacturing", label: "Manufacturing Defect", covered: true },
  { value: "transit", label: "Transit Damage", covered: true },
  { value: "water", label: "Water Damage", covered: false },
  { value: "external", label: "External/Accidental Damage", covered: false },
];

export function DamageReportForm({
  open,
  onOpenChange,
  orderId,
  userId,
  onSubmitted,
}: DamageReportFormProps) {
  const [damageType, setDamageType] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const selectedDamageType = DAMAGE_TYPES.find((d) => d.value === damageType);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${orderId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("media-uploads")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("media-uploads")
          .getPublicUrl(fileName);

        setImages((prev) => [...prev, urlData.publicUrl]);
      }
      toast.success("Image(s) uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!damageType || !description || images.length === 0) {
      toast.error("Please fill all required fields and upload at least one image");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("order_issues").insert({
        order_id: orderId,
        user_id: userId,
        issue_type: "damaged",
        damage_type: damageType,
        description,
        images,
        address_confirmed: addressConfirmed,
        terms_accepted: termsAccepted,
        status: "submitted",
      });

      if (error) throw error;

      toast.success("Damage report submitted successfully!");
      onSubmitted();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast.error(error.message || "Failed to submit report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Report Damaged Product
          </DialogTitle>
          <DialogDescription>
            Please provide details about the damage. Photos are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Damage Type Selection */}
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
                      {!type.covered && (
                        <span className="text-xs text-red-500">(Not Covered)</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Coverage Info */}
          {selectedDamageType && (
            <div
              className={`p-3 rounded-lg flex items-start gap-3 ${
                selectedDamageType.covered
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              <Info
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  selectedDamageType.covered ? "text-green-500" : "text-red-500"
                }`}
              />
              <div className="text-sm">
                {selectedDamageType.covered ? (
                  <p>
                    <span className="font-medium text-green-600">Covered under warranty.</span>{" "}
                    Report within 24-48 hours of delivery for transit damage.
                  </p>
                ) : (
                  <p>
                    <span className="font-medium text-red-600">Not covered.</span> Water damage,
                    misuse, and external/accidental damage are not eligible for claims.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label>Describe the Damage *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the damage in detail..."
              rows={4}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Upload Photos * (Max 5)</Label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={img} alt="Damage" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Add Photo</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Address Confirmation */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="address"
              checked={addressConfirmed}
              onCheckedChange={(checked) => setAddressConfirmed(checked as boolean)}
            />
            <Label htmlFor="address" className="text-sm font-normal">
              I confirm the delivery address is correct for pickup
            </Label>
          </div>

          {/* Terms Acceptance */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm font-normal leading-tight">
              I accept the terms and conditions. I understand that false claims may result in
              account restrictions.
            </Label>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isLoading ||
                !damageType ||
                !description ||
                images.length === 0 ||
                !termsAccepted
              }
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
