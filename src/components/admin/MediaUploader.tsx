import { useState, useRef } from "react";
import { Upload, X, Loader2, Image, Video, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MediaUploaderProps {
  images: string[];
  videos?: string[];
  onImagesChange: (images: string[]) => void;
  onVideosChange?: (videos: string[]) => void;
  maxImages?: number;
  maxVideos?: number;
  bucket?: string;
  folder?: string;
}

export function MediaUploader({
  images,
  videos = [],
  onImagesChange,
  onVideosChange,
  maxImages = 10,
  maxVideos = 2,
  bucket = "media-uploads",
  folder = "general",
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Too many files",
        description: `You can only upload ${remainingSlots} more image(s). Max ${maxImages} total.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Uploading ${i + 1}/${files.length}...`);

        if (!file.type.startsWith("image/")) {
          toast({ title: `${file.name} is not an image`, variant: "destructive" });
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast({ title: `${file.name} is too large (max 10MB)`, variant: "destructive" });
          continue;
        }

        const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { cacheControl: "3600", upsert: false });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        newUrls.push(publicUrl);
      }

      onImagesChange([...images, ...newUrls]);
      toast({ title: `${newUrls.length} image(s) uploaded successfully` });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onVideosChange) return;
    
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = maxVideos - videos.length;
    if (files.length > remainingSlots) {
      toast({
        title: "Too many files",
        description: `You can only upload ${remainingSlots} more video(s). Max ${maxVideos} total.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Uploading video ${i + 1}/${files.length}...`);

        if (!file.type.startsWith("video/")) {
          toast({ title: `${file.name} is not a video`, variant: "destructive" });
          continue;
        }

        if (file.size > 100 * 1024 * 1024) {
          toast({ title: `${file.name} is too large (max 100MB)`, variant: "destructive" });
          continue;
        }

        const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { cacheControl: "3600", upsert: false });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);

        newUrls.push(publicUrl);
      }

      onVideosChange([...videos, ...newUrls]);
      toast({ title: `${newUrls.length} video(s) uploaded successfully` });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload videos",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    if (onVideosChange) {
      onVideosChange(videos.filter((_, i) => i !== index));
    }
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Buttons */}
      <div className="flex flex-wrap gap-2">
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          multiple
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => imageInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
          className="gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploadProgress}
            </>
          ) : (
            <>
              <Image className="w-4 h-4" />
              Upload Photos ({images.length}/{maxImages})
            </>
          )}
        </Button>

        {onVideosChange && (
          <>
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoUpload}
              accept="video/*"
              multiple
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => videoInputRef.current?.click()}
              disabled={isUploading || videos.length >= maxVideos}
              className="gap-2"
            >
              <Video className="w-4 h-4" />
              Upload Videos ({videos.length}/{maxVideos})
            </Button>
          </>
        )}
      </div>

      {/* Images Preview */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Photos</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {images.map((url, index) => (
              <div
                key={index}
                className="relative group aspect-video rounded-lg overflow-hidden border border-border bg-muted"
              >
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:text-white hover:bg-white/20"
                    onClick={() => moveImage(index, "up")}
                    disabled={index === 0}
                  >
                    ←
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:text-white hover:bg-white/20"
                    onClick={() => moveImage(index, "down")}
                    disabled={index === images.length - 1}
                  >
                    →
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Preview */}
      {videos.length > 0 && onVideosChange && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Videos</p>
          <div className="space-y-2">
            {videos.map((url, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg border border-border bg-muted/50"
              >
                <Video className="w-5 h-5 text-primary flex-shrink-0" />
                <video
                  src={url}
                  className="w-20 h-12 object-cover rounded"
                  muted
                />
                <span className="flex-1 text-sm truncate text-muted-foreground">
                  Video {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeVideo(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Max {maxImages} photos (10MB each){onVideosChange && `, ${maxVideos} videos (100MB each)`}
      </p>
    </div>
  );
}