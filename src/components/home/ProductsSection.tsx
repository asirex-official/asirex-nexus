import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ShoppingCart, Eye, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useSiteData";
import spyEarpieceImg from "@/assets/spy-earpiece.png";

// Hardcoded featured products
const staticProducts = [
  {
    id: "spy-earpiece-1",
    name: "Spy Earpiece",
    category: "Nano Tech",
    price: 2000,
    rating: 4.8,
    badge: "LIMITED STOCK",
    image_url: spyEarpieceImg,
    description: "Ultra-invisible nano magnet earbud. Long lasting 5 hours battery. Specially designed so no one can see it. Perfect for covert communication.",
    stock_status: "limited",
    is_featured: true,
    specs: {
      battery: "5 hours",
      visibility: "Invisible to naked eye",
      magnet: "Nano magnet technology",
      design: "Specially designed earbud"
    }
  }
];

interface ProductCardProps {
  product: any;
  index: number;
}

function ProductCard({ product, index }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="group relative perspective-1000"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary/30 via-accent/30 to-secondary/30 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500"
      />
      
      <div className="relative glass-card p-6 overflow-hidden rounded-3xl">
        {/* Badge */}
        {product.badge && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute top-4 left-4 z-20"
          >
            <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-glow-sm">
              {product.badge}
            </span>
          </motion.div>
        )}

        {/* Image Container */}
        <div className="relative aspect-square mb-6 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden">
          <motion.img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full h-full object-cover"
          />
          
          {/* Hover Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center gap-4"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: isHovered ? 1 : 0, rotate: isHovered ? 0 : -180 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <Button variant="glass" size="icon" className="w-12 h-12 rounded-full">
                <Eye className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: isHovered ? 1 : 0, rotate: isHovered ? 0 : 180 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Button variant="hero" size="icon" className="w-12 h-12 rounded-full">
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Shine effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: isHovered ? "100%" : "-100%", opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.6 }}
          />
        </div>

        {/* Category */}
        <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
          {product.category}
        </p>

        {/* Title */}
        <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors duration-300">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'fill-accent text-accent' : 'text-muted'}`} 
              />
            ))}
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            ({product.rating || 0})
          </span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-2xl font-black gradient-text-static">
              ₹{product.price?.toLocaleString()}
            </span>
          </div>
          <Button variant="glow" size="sm" className="group/btn">
            Add to Cart
            <ShoppingCart className="w-4 h-4 ml-1 group-hover/btn:scale-110 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductsSection() {
  const { data: dbProducts, isLoading } = useProducts(true);
  
  // Combine static products with database products
  const allProducts = [...staticProducts, ...(dbProducts || [])];

  return (
    <section className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/20 via-transparent to-card/20" />
      
      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between mb-16"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-4"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-accent">Featured Products</span>
            </motion.div>
            <h2 className="font-display text-4xl lg:text-5xl font-black mb-4">
              Top Selling <span className="gradient-text">Products</span>
            </h2>
            <p className="text-muted-foreground max-w-xl text-lg">
              Discover our most popular innovations loved by developers, 
              engineers, and tech enthusiasts across India.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button asChild variant="outline" size="lg" className="mt-6 lg:mt-0 group">
              <Link to="/shop">
                View All Products
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
