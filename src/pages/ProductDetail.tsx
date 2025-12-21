import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ShoppingCart, Zap, Star, Images, ChevronLeft, ChevronRight, Sparkles, Check, Shield, Truck, Award, Package } from "lucide-react";
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

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const product = products?.find((p) => p.id === productId);

  const getAllImages = (): string[] => {
    const images: string[] = [];
    if (product?.image_url) images.push(product.image_url);
    if (product?.gallery_images && Array.isArray(product.gallery_images)) {
      images.push(...(product.gallery_images as string[]));
    }
    return images;
  };

  const allImages = getAllImages();

  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [allImages.length]);

  const isInStock = (stockStatus: string | null) => stockStatus !== "out_of_stock";

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
      toast({ title: "Login Required", description: "Please sign in to add items to cart", variant: "destructive" });
      navigate("/auth?redirect=/shop");
      return;
    }
    addToCart({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
    toast({ title: "Added to Cart", description: `${product.name} added to your cart` });
  };

  const handleBuyNow = () => {
    if (!product || !isInStock(product.stock_status)) return;
    if (!user) {
      toast({ title: "Login Required", description: "Please sign in to purchase", variant: "destructive" });
      navigate("/auth?redirect=/shop");
      return;
    }
    addToCart({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-6">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <Button onClick={() => navigate("/shop")} variant="glow">
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
      <section className="min-h-screen pb-32 lg:pb-16">
        {/* Hero Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-10 relative">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" onClick={() => navigate("/shop")} className="gap-2 hover:bg-primary/10">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Shop</span>
            </Button>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Image Gallery Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Main Image with Glow Effect */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-card to-muted border border-border/50">
                  {product.badge && (
                    <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-accent to-primary text-white shadow-lg">
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
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                      onClick={() => setIsLightboxOpen(true)}
                    />
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Image Counter & View Button */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2">
                    {allImages.length > 1 && (
                      <div className="px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium">
                        {currentImageIndex + 1} / {allImages.length}
                      </div>
                    )}
                    <button
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium hover:bg-background transition-all"
                      onClick={() => setIsLightboxOpen(true)}
                    >
                      <Images className="w-3.5 h-3.5" />
                      View
                    </button>
                  </div>
                </div>
              </div>

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {allImages.map((img, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        idx === currentImageIndex
                          ? "border-primary shadow-lg shadow-primary/25"
                          : "border-border/50 hover:border-primary/50 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-6"
            >
              {/* Category & Title */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3"
                >
                  <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                    {product.category}
                  </span>
                </motion.div>
                
                <h1 className="font-display text-3xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {product.name}
                </h1>
                
                {product.rating && (
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="text-sm font-bold text-accent">{product.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Excellent Rating</span>
                  </div>
                )}
              </div>

              {/* Price Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="relative p-6 rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border/50 shadow-xl"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full pointer-events-none" />
                <div className="flex items-end gap-3 mb-4">
                  <span className="font-display text-4xl lg:text-5xl font-bold text-primary">
                    ₹{product.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-sm mb-2">Inclusive of all taxes</span>
                </div>
                
                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 gap-2 h-12 text-base border-2 hover:bg-primary/10 hover:border-primary"
                    disabled={!isInStock(product.stock_status)}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="glow"
                    size="lg"
                    className="flex-1 gap-2 h-12 text-base shadow-lg shadow-primary/25"
                    disabled={!isInStock(product.stock_status)}
                    onClick={handleBuyNow}
                  >
                    <Zap className="w-5 h-5" />
                    Buy Now
                  </Button>
                </div>
              </motion.div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Shield, label: "Secure Payment" },
                  { icon: Truck, label: "Fast Delivery" },
                  { icon: Award, label: "Quality Assured" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/30"
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    <span className="text-xs text-center text-muted-foreground font-medium">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Description Card */}
              {product.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-5 rounded-2xl bg-muted/30 border border-border/30"
                >
                  <h3 className="text-sm font-bold uppercase tracking-wide text-foreground mb-3">About this product</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {product.description}
                  </p>
                </motion.div>
              )}

              {/* Features & Benefits */}
              {(features.length > 0 || benefits.length > 0) && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {features.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                      className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-accent/20">
                          <Sparkles className="w-4 h-4 text-accent" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wide">Features</span>
                      </div>
                      <ul className="space-y-2">
                        {features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-foreground/80 line-clamp-1">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {benefits.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 rounded-lg bg-primary/20">
                          <Award className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-bold uppercase tracking-wide">Benefits</span>
                      </div>
                      <ul className="space-y-2">
                        {benefits.slice(0, 4).map((b, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-foreground/80 line-clamp-1">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl shadow-background/50"
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 safe-area-inset-bottom">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{product.name}</p>
                <p className="font-display text-xl font-bold text-primary">₹{product.price.toLocaleString()}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  disabled={!isInStock(product.stock_status)}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4" />
                </Button>
                <Button
                  variant="glow"
                  className="gap-2 h-10 px-4"
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

      <ImageLightbox
        images={allImages}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        initialIndex={currentImageIndex}
      />
    </Layout>
  );
}
