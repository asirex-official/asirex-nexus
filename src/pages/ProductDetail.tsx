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

  return (
    <Layout>
      <section className="py-8 lg:py-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Button variant="ghost" onClick={() => navigate("/shop")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Main Image with Cycling */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
                {product.badge && (
                  <Badge className="absolute top-4 left-4 z-10 bg-accent text-accent-foreground">
                    {product.badge}
                  </Badge>
                )}
                {!isInStock(product.stock_status) && (
                  <Badge className="absolute top-4 right-4 z-10 bg-destructive text-destructive-foreground">
                    Out of Stock
                  </Badge>
                )}

                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={allImages[currentImageIndex] || "/placeholder.svg"}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Image Navigation */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* View Photos Button */}
                {allImages.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-4 right-4 gap-2"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <Images className="w-4 h-4" />
                    View Photos ({allImages.length})
                  </Button>
                )}
              </div>

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Image Counter */}
              {allImages.length > 1 && (
                <div className="flex justify-center gap-2">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? "bg-primary w-6" : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
                  {product.category}
                </p>
                <h1 className="font-display text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>

                {product.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <span className="font-medium">{product.rating}</span>
                    <span className="text-muted-foreground">rating</span>
                  </div>
                )}

                <p className="text-muted-foreground text-lg leading-relaxed">
                  {product.description || "No description available"}
                </p>
              </div>

              {/* Features & Benefits - Compact Side by Side */}
              {(() => {
                const { features, benefits } = getSpecsData(product.specs);
                return (features.length > 0 || benefits.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Features */}
                    {features.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-accent" />
                          <h3 className="font-display text-base font-bold">Features</h3>
                        </div>
                        <div className="space-y-2">
                          {features.map((spec, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="group flex items-center gap-2 p-2 rounded-lg bg-accent/5 hover:bg-accent/10 border border-accent/20 hover:border-accent/40 transition-all"
                            >
                              <Sparkles className="w-3 h-3 text-accent flex-shrink-0" />
                              <p className="text-xs text-foreground/80 line-clamp-2">{spec}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    {benefits.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          <h3 className="font-display text-base font-bold">Benefits</h3>
                        </div>
                        <div className="space-y-2">
                          {benefits.map((benefit, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="group flex items-center gap-2 p-2 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 hover:border-primary/40 transition-all"
                            >
                              <Check className="w-3 h-3 text-primary flex-shrink-0" />
                              <p className="text-xs text-foreground/80 line-clamp-2">{benefit}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Price & Actions */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold">
                    ₹{product.price.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="glow"
                    size="lg"
                    className="flex-1"
                    disabled={!isInStock(product.stock_status)}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="premium"
                    size="lg"
                    className="flex-1"
                    disabled={!isInStock(product.stock_status)}
                    onClick={handleBuyNow}
                  >
                    <Zap className="w-5 h-5 mr-2" />
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
