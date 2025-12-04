import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useSiteData";

interface ProductCardProps {
  product: any;
  index: number;
}

function ProductCard({ product, index }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div className="relative glass-card p-6 card-hover overflow-hidden">
        {product.badge && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
              {product.badge}
            </span>
          </div>
        )}

        <div className="relative aspect-square mb-6 rounded-xl bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center overflow-hidden">
          <motion.img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover rounded-xl"
          />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-3"
          >
            <Button variant="glass" size="icon">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="hero" size="icon">
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>

        <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
          {product.category}
        </p>

        <h3 className="font-display text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="text-sm font-medium">{product.rating || 0}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-display text-2xl font-bold">
            ₹{product.price?.toLocaleString()}
          </span>
          <Button variant="glow" size="sm">
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductsSection() {
  const { data: products, isLoading } = useProducts(true);

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col lg:flex-row lg:items-end justify-between mb-12"
        >
          <div>
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Top Selling <span className="gradient-text">Products</span>
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Discover our most popular innovations loved by developers, 
              engineers, and tech enthusiasts across India.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-6 lg:mt-0">
            <Link to="/shop">
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="aspect-square bg-muted rounded-xl mb-6" />
                <div className="h-4 bg-muted rounded mb-2 w-1/3" />
                <div className="h-6 bg-muted rounded mb-4" />
                <div className="h-8 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
