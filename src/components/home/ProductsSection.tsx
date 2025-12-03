import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import productNeuralCore from "@/assets/product-neural-core.png";
import productRobokit from "@/assets/product-robokit.png";
import productSolar from "@/assets/product-solar.png";
import productDevboard from "@/assets/product-devboard.png";

const products = [
  {
    id: 1,
    name: "ASIREX Neural Core X1",
    category: "AI Hardware",
    price: 49999,
    rating: 4.9,
    reviews: 128,
    image: productNeuralCore,
    badge: "Best Seller",
    description: "Next-gen AI processing unit for edge computing",
  },
  {
    id: 2,
    name: "RoboKit Pro 2024",
    category: "Robotics",
    price: 34999,
    rating: 4.8,
    reviews: 89,
    image: productRobokit,
    badge: "New",
    description: "Complete robotics development platform",
  },
  {
    id: 3,
    name: "CleanTech Solar Module",
    category: "Clean Tech",
    price: 24999,
    rating: 4.7,
    reviews: 156,
    image: productSolar,
    badge: null,
    description: "High-efficiency solar energy harvesting system",
  },
  {
    id: 4,
    name: "Dev Board Elite",
    category: "Developer Tools",
    price: 12999,
    rating: 4.9,
    reviews: 234,
    image: productDevboard,
    badge: "Popular",
    description: "Professional development board with AI acceleration",
  },
];

interface ProductCardProps {
  product: typeof products[0];
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
            src={product.image}
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
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            ({product.reviews} reviews)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-display text-2xl font-bold">
            ₹{product.price.toLocaleString()}
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
