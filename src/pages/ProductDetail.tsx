import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingCart, Zap, Star, Images, ChevronLeft, ChevronRight, Sparkles, Check } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useSiteData";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ImageLightbox } from "@/components/projects/ImageLightbox";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const product = products?.find((p) => p.id === productId);

  // Get all images (main + gallery)
  const getAllImages = (): string[] => {
    const images: string[] = [];
    if (product?.image_url) images.push(product.image_url);
    if (product?.gallery_images && Array.isArray(product.gallery_images)) {
      images.push(...(product.gallery_images as string[]));
    }
    return images;
  };

  const allImages = getAllImages();

  // Auto-cycle images every 3 seconds
  useEffect(() => {
    if (allImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [allImages.length]);

  const isInStock = (stockStatus: string | null) => {
    return stockStatus !== "out_of_stock";
  };

  const getSpecsData = (specs: unknown): { features: string[]; benefits: string[] } => {
    if (!specs || typeof specs !== "object") return { features: [], benefits: [] };
    const specsObj = specs as Record<string, unknown>;
    
    const features = Array.isArray(specsObj.features) 
      ? (specsObj.features as string[]).filter(v => v && typeof v === "string")
      : [];
    const benefits = Array.isArray(specsObj.benefits)
      ? (specsObj.benefits as string[]).filter(v => v && typeof v === "string")
      : [];
    
    return { features, benefits };
  };

  const handleAddToCart = () => {
    if (!product || !isInStock(product.stock_status)) return;

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      navigate("/auth?redirect=/shop");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
    toast({ title: "Added to Cart", description: `${product.name} added to your cart` });
  };

  const handleBuyNow = () => {
    if (!product || !isInStock(product.stock_status)) return;

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to purchase",
        variant: "destructive",
      });
      navigate("/auth?redirect=/shop");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate("/shop")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </Layout>
    );
  }

  const { features, benefits } = getSpecsData(product.specs);

  return (
    <Layout>
      <section className="py-6 lg:py-10">
        <div className="container mx-auto px-4 lg:px-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4"
          >
            <Button variant="ghost" size="sm" onClick={() => navigate("/shop")} className="gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Image Section - 2 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-3"
            >
              {/* Main Image */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted group">
                {product.badge && (
                  <Badge className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground text-[10px] px-2 py-0.5">
                    {product.badge}
                  </Badge>
                )}
                {!isInStock(product.stock_status) && (
                  <Badge className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground text-[10px]">
                    Out of Stock
                  </Badge>
                )}

                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={allImages[currentImageIndex] || "/placeholder.svg"}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* View Photos */}
                {allImages.length > 0 && (
                  <button
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background/90 hover:bg-background text-xs font-medium transition-all"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <Images className="w-3.5 h-3.5" />
                    {allImages.length}
                  </button>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex
                          ? "border-primary ring-1 ring-primary/30"
                          : "border-border/50 hover:border-primary/50"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info - 3 columns */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3 space-y-5"
            >
              {/* Header */}
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1">
                  {product.category}
                </p>
                <h1 className="font-display text-2xl lg:text-3xl font-bold leading-tight">{product.name}</h1>
                
                {product.rating && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {product.description || "No description available"}
              </p>

              {/* Features & Benefits Grid */}
              {(features.length > 0 || benefits.length > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Features */}
                  {features.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent" />
                        <span className="text-xs font-bold uppercase tracking-wide">Features</span>
                      </div>
                      <div className="space-y-1.5">
                        {features.slice(0, 4).map((spec, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-start gap-1.5 p-1.5 rounded-md bg-accent/5 border border-accent/10"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-foreground/70 leading-tight line-clamp-2">{spec}</p>
                          </motion.div>
                        ))}
                        {features.length > 4 && (
                          <p className="text-[10px] text-muted-foreground pl-4">+{features.length - 4} more</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {benefits.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wide">Benefits</span>
                      </div>
                      <div className="space-y-1.5">
                        {benefits.slice(0, 4).map((benefit, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-start gap-1.5 p-1.5 rounded-md bg-primary/5 border border-primary/10"
                          >
                            <Check className="w-2.5 h-2.5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-foreground/70 leading-tight line-clamp-2">{benefit}</p>
                          </motion.div>
                        ))}
                        {benefits.length > 4 && (
                          <p className="text-[10px] text-muted-foreground pl-4">+{benefits.length - 4} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Price & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-border/50">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold">₹{product.price.toLocaleString()}</span>
                </div>

                <div className="flex gap-2 flex-1 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none gap-1.5"
                    disabled={!isInStock(product.stock_status)}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add
                  </Button>
                  <Button
                    variant="glow"
                    size="sm"
                    className="flex-1 sm:flex-none gap-1.5"
                    disabled={!isInStock(product.stock_status)}
                    onClick={handleBuyNow}
                  >
                    <Zap className="w-4 h-4" />
                    Buy Now
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Image Lightbox */}
      <ImageLightbox
        images={allImages}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        initialIndex={currentImageIndex}
      />
    </Layout>
  );
}
