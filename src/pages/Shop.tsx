import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Grid, List, ShoppingCart, Star, Eye, Zap } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProducts } from "@/hooks/useSiteData";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const categories = ["All", "AI Hardware", "Robotics", "Clean Tech", "Gadgets", "Nano Tech", "Accessories"];

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number | null;
  image_url: string | null;
  badge: string | null;
  description: string | null;
  stock_status: string | null;
  specs: unknown;
}

export default function Shop() {
  const { data: products, isLoading } = useProducts();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleAddToCart = (product: Product) => {
    if (!isInStock(product.stock_status)) return;
    
    // Check if user is logged in
    if (!user) {
      toast({ 
        title: "Login Required", 
        description: "Please sign in to add items to cart",
        variant: "destructive" 
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

  const handleBuyNow = (product: Product) => {
    if (!isInStock(product.stock_status)) return;
    
    // Check if user is logged in
    if (!user) {
      toast({ 
        title: "Login Required", 
        description: "Please sign in to purchase",
        variant: "destructive" 
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

  const filteredProducts = (products || [])
    .filter((p) => selectedCategory === "All" || p.category === selectedCategory)
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const getSpecsArray = (specs: unknown): string[] => {
    if (!specs || typeof specs !== 'object') return [];
    return Object.values(specs as Record<string, string>).filter(v => v && typeof v === 'string' && v.trim());
  };

  const isInStock = (stockStatus: string | null) => {
    return stockStatus !== 'out_of_stock';
  };

  return (
    <Layout>
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Shop <span className="gradient-text">Products</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover cutting-edge technology built for the future. 
              All products come with free shipping and 30-day returns.
            </p>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-3 sm:p-4 mb-6 sm:mb-8"
          >
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border w-full"
                />
              </div>

              {/* Category Filter - Scrollable on mobile */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="whitespace-nowrap flex-shrink-0 text-xs sm:text-sm px-2 sm:px-3"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Sort & View - Stack on mobile */}
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40 bg-muted/50 text-sm">
                    <SlidersHorizontal className="w-4 h-4 mr-2 flex-shrink-0" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-border z-50">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-1 p-1 bg-muted/50 rounded-lg ml-auto">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  : "flex flex-col gap-3 sm:gap-4"
              }
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/shop/${product.id}`)}
                >
                  <div
                    className={`glass-card card-hover overflow-hidden ${
                      viewMode === "list" ? "flex" : ""
                    }`}
                  >
                    {/* Image */}
                    <div
                      className={`relative bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center ${
                        viewMode === "list"
                          ? "w-40 h-40 flex-shrink-0"
                          : "aspect-square"
                      }`}
                    >
                      {product.badge && (
                        <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full bg-accent text-accent-foreground">
                          {product.badge}
                        </span>
                      )}
                      {!isInStock(product.stock_status) && (
                        <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">
                          Out of Stock
                        </span>
                      )}
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-6xl text-muted-foreground">📦</div>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button
                          variant="glass"
                          size="icon"
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="hero"
                          size="icon"
                          disabled={!isInStock(product.stock_status)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 flex-1">
                      <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1 sm:mb-2">
                        {product.category}
                      </p>
                      <h3 className="font-display text-base sm:text-lg font-semibold mb-1 sm:mb-2 group-hover:text-accent transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                        {product.description || "No description available"}
                      </p>

                      {product.rating && (
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-accent text-accent" />
                          <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-3">
                        <span className="font-display text-lg sm:text-xl font-bold">
                          ₹{product.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Action Buttons - Stack on mobile */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="glow"
                          size="sm"
                          className="flex-1 text-xs sm:text-sm"
                          disabled={!isInStock(product.stock_status)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                        >
                          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="premium"
                          size="sm"
                          className="flex-1 text-xs sm:text-sm"
                          disabled={!isInStock(product.stock_status)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBuyNow(product);
                          }}
                        >
                          <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-muted-foreground text-lg">
                No products found. Try adjusting your filters.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Product Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl glass-card border-border">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {selectedProduct.name}
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center overflow-hidden">
                  {selectedProduct.image_url ? (
                    <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-8xl text-muted-foreground">📦</div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
                    {selectedProduct.category}
                  </p>
                  {selectedProduct.rating && (
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="font-medium">{selectedProduct.rating}</span>
                    </div>
                  )}
                  <p className="text-muted-foreground mb-6">
                    {selectedProduct.description || "No description available"}
                  </p>
                  {getSpecsArray(selectedProduct.specs).length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Features</h4>
                      <ul className="space-y-1">
                        {getSpecsArray(selectedProduct.specs).map((spec, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                            {spec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="font-display text-3xl font-bold">
                      ₹{selectedProduct.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="hero"
                      className="flex-1"
                      disabled={!isInStock(selectedProduct.stock_status)}
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button 
                      variant="premium" 
                      className="flex-1"
                      onClick={() => {
                        handleBuyNow(selectedProduct);
                        setSelectedProduct(null);
                      }}
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
