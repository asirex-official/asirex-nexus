import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Grid, List, ShoppingCart, Star, Eye, X } from "lucide-react";
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
import spyEarpieceImg from "@/assets/spy-earpiece.png";

const products: Array<{
  id: number | string;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  badge: string | null;
  description: string;
  specs: string[];
  inStock: boolean;
}> = [
  {
    id: "spy-earpiece-1",
    name: "Spy Earpiece",
    category: "Nano Tech",
    price: 2000,
    originalPrice: null,
    rating: 4.8,
    reviews: 127,
    image: spyEarpieceImg,
    badge: "LIMITED STOCK",
    description: "Ultra-invisible nano magnet earbud. Long lasting 5 hours battery. Specially designed so no one can see it. Perfect for covert communication.",
    specs: [
      "5 hours battery life",
      "Invisible to naked eye",
      "Nano magnet technology",
      "Specially designed earbud",
      "Wireless connectivity",
      "Ultra lightweight"
    ],
    inStock: true
  }
];

const categories = ["All", "AI Hardware", "Robotics", "Clean Tech", "Developer Tools"];

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);

  const filteredProducts = products
    .filter((p) => selectedCategory === "All" || p.category === selectedCategory)
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

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
            className="glass-card p-4 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="whitespace-nowrap"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Sort & View */}
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-muted/50">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <div
            className={
              viewMode === "grid"
                ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
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
                    {!product.inStock && (
                      <span className="absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground">
                        Out of Stock
                      </span>
                    )}
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />

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
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1">
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
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviews})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-xl font-bold">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="glow"
                        size="sm"
                        disabled={!product.inStock}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
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
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary uppercase tracking-wider mb-2">
                    {selectedProduct.category}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="font-medium">{selectedProduct.rating}</span>
                    <span className="text-muted-foreground">
                      ({selectedProduct.reviews} reviews)
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {selectedProduct.description}
                  </p>
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Specifications</h4>
                    <ul className="space-y-1">
                      {selectedProduct.specs.map((spec) => (
                        <li key={spec} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="font-display text-3xl font-bold">
                      ₹{selectedProduct.price.toLocaleString()}
                    </span>
                    {selectedProduct.originalPrice && (
                      <span className="text-muted-foreground line-through">
                        ₹{selectedProduct.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="hero"
                      className="flex-1"
                      disabled={!selectedProduct.inStock}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="premium" className="flex-1">
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
