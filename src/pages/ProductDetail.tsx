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
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Track scroll for sticky bar
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <section className="py-6 lg:py-12 pb-24 lg:pb-12">
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
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted group">
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
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* View Photos */}
                {allImages.length > 0 && (
                  <button
                    className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-background/90 hover:bg-background text-sm font-medium transition-all"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <Images className="w-4 h-4" />
                    View {allImages.length} Photos
                  </button>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border/50 hover:border-primary/50"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
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
              {/* Header */}
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
                  {product.category}
                </p>
                <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-3">{product.name}</h1>
                
                {product.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <span className="text-base font-semibold">{product.rating}</span>
                    <span className="text-muted-foreground">rating</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-base text-muted-foreground leading-relaxed">
                {product.description || "No description available"}
              </p>

              {/* Features & Benefits Grid */}
              {(features.length > 0 || benefits.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Features */}
                  {features.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-accent" />
                        <span className="text-sm font-bold uppercase tracking-wide">Features</span>
                      </div>
                      <div className="space-y-2">
                        {features.map((spec, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-2.5 p-3 rounded-lg bg-accent/10 border border-accent/20 hover:border-accent/40 transition-all"
                          >
                            <Sparkles className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-foreground/90 leading-relaxed">{spec}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {benefits.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold uppercase tracking-wide">Benefits</span>
                      </div>
                      <div className="space-y-2">
                        {benefits.map((benefit, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/10 border border-primary/20 hover:border-primary/40 transition-all"
                          >
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-foreground/90 leading-relaxed">{benefit}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Price & Actions - Desktop */}
              <div className="hidden lg:flex items-center gap-6 pt-6 border-t border-border/50">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold">₹{product.price.toLocaleString()}</span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2"
                    disabled={!isInStock(product.stock_status)}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="glow"
                    size="lg"
                    className="gap-2"
                    disabled={!isInStock(product.stock_status)}
                    onClick={handleBuyNow}
                  >
                    <Zap className="w-5 h-5" />
                    Buy Now
                  </Button>
                </div>
              </div>

              {/* Price & Actions - Mobile (inline, above sticky) */}
              <div className="lg:hidden flex flex-col gap-4 pt-4 border-t border-border/50">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold">₹{product.price.toLocaleString()}</span>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    disabled={!isInStock(product.stock_status)}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="glow"
                    className="flex-1 gap-2"
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

      {/* Sticky Mobile Price Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 px-4 py-3 safe-area-inset-bottom"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground line-clamp-1">{product.name}</p>
                <p className="font-display text-xl font-bold">₹{product.price.toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isInStock(product.stock_status)}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
                <Button
                  variant="glow"
                  size="sm"
                  className="gap-1.5"
                  disabled={!isInStock(product.stock_status)}
                  onClick={handleBuyNow}
                >
                  <Zap className="w-4 h-4" />
                  Buy Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
