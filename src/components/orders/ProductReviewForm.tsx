import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Camera, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  userId: string;
  orderItems: { id: string; name: string; product_id?: string }[];
  onSubmitted: () => void;
}

export function ProductReviewForm({
  open,
  onOpenChange,
  orderId,
  userId,
  orderItems,
  onSubmitted,
}: ProductReviewFormProps) {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const currentItem = orderItems[currentItemIndex];

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
        const fileName = `reviews/${orderId}/${Date.now()}.${fileExt}`;

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

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("product_reviews").insert({
        order_id: orderId,
        user_id: userId,
        product_id: currentItem.product_id || currentItem.id,
        rating,
        review_text: reviewText,
        images,
        is_verified_purchase: true,
        status: "published",
      });

      if (error) throw error;

      toast.success(`Review submitted for ${currentItem.name}!`);

      // Move to next item or finish
      if (currentItemIndex < orderItems.length - 1) {
        setCurrentItemIndex((prev) => prev + 1);
        setRating(0);
        setReviewText("");
        setImages([]);
      } else {
        onSubmitted();
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to submit review");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    if (currentItemIndex < orderItems.length - 1) {
      setCurrentItemIndex((prev) => prev + 1);
      setRating(0);
      setReviewText("");
      setImages([]);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Rate Your Purchase
          </DialogTitle>
          <DialogDescription>
            {orderItems.length > 1 && (
              <span className="text-primary">
                Product {currentItemIndex + 1} of {orderItems.length}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Name */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="font-medium">{currentItem?.name}</p>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label>Your Review (Optional)</Label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Add Photos (Optional, Max 3)</Label>
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50">
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

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSkip} className="flex-1">
              {currentItemIndex < orderItems.length - 1 ? "Skip" : "Close"}
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isLoading || rating === 0}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
