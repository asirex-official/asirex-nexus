import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Grid, List, ShoppingCart, Star, Eye, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
const products = [{
  id: 1,
  name: "ASIREX Neural Core X1",
  category: "AI Hardware",
  price: 49999,
  originalPrice: 59999,
  rating: 4.9,
  reviews: 128,
  image: "🧠",
  badge: "Best Seller",
  description: "Next-gen AI processing unit for edge computing with 8 TOPS of computing power.",
  specs: ["8 TOPS AI Performance", "16GB LPDDR5 Memory", "USB-C & HDMI Ports", "Linux/Windows Support"],
  inStock: true
}, {
  id: 2,
  name: "RoboKit Pro 2024",
  category: "Robotics",
  price: 34999,
  originalPrice: null,
  rating: 4.8,
  reviews: 89,
  image: "🤖",
  badge: "New",
  description: "Complete robotics development platform with 6-axis arm and AI vision system.",
  specs: ["6-Axis Robotic Arm", "AI Vision Camera", "Python SDK", "Mobile App Control"],
  inStock: true
}, {
  id: 3,
  name: "CleanTech Solar Module",
  category: "Clean Tech",
  price: 24999,
  originalPrice: 29999,
  rating: 4.7,
  reviews: 156,
  image: "☀️",
  badge: null,
  description: "High-efficiency 400W solar panel with smart monitoring and battery integration.",
  specs: ["400W Output", "Smart Monitoring", "25 Year Warranty", "Weather Resistant"],
  inStock: true
}, {
  id: 4,
  name: "Dev Board Elite",
  category: "Developer Tools",
  price: 12999,
  originalPrice: null,
  rating: 4.9,
  reviews: 234,
  image: "⚡",
  badge: "Popular",
  description: "Professional development board with AI acceleration and extensive I/O options.",
  specs: ["ARM Cortex-A72", "4GB RAM", "32GB eMMC", "40-pin GPIO"],
  inStock: true
}, {
  id: 5,
  name: "Smart Drone Kit S1",
  category: "Robotics",
  price: 45999,
  originalPrice: 54999,
  rating: 4.6,
  reviews: 67,
  image: "🚁",
  badge: null,
  description: "Autonomous drone platform with GPS, obstacle avoidance and custom programming.",
  specs: ["30 Min Flight Time", "4K Camera", "GPS Navigation", "SDK Access"],
  inStock: false
}, {
  id: 6,
  name: "AI Sensor Array",
  category: "AI Hardware",
  price: 18999,
  originalPrice: null,
  rating: 4.8,
  reviews: 91,
  image: "📡",
  badge: null,
  description: "Multi-sensor array with LIDAR, thermal and ultrasonic sensing capabilities.",
  specs: ["LIDAR 360°", "Thermal Imaging", "Ultrasonic", "I2C/SPI Interface"],
  inStock: true
}];
const categories = ["All", "AI Hardware", "Robotics", "Clean Tech", "Developer Tools"];
export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const filteredProducts = products.filter(p => selectedCategory === "All" || p.category === selectedCategory).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });
  return <Layout>
      <section className="py-12 lg:py-20">
        
      </section>

      {/* Product Modal */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl glass-card border-border">
          {selectedProduct && <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {selectedProduct.name}
                </DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                  <span className="text-8xl">{selectedProduct.image}</span>
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
                      {selectedProduct.specs.map(spec => <li key={spec} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                          {spec}
                        </li>)}
                    </ul>
                  </div>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="font-display text-3xl font-bold">
                      ₹{selectedProduct.price.toLocaleString()}
                    </span>
                    {selectedProduct.originalPrice && <span className="text-muted-foreground line-through">
                        ₹{selectedProduct.originalPrice.toLocaleString()}
                      </span>}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="hero" className="flex-1" disabled={!selectedProduct.inStock}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="premium" className="flex-1">
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            </>}
        </DialogContent>
      </Dialog>
    </Layout>;
}