import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Star, X, Package, IndianRupee, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/useSiteData";
import { useToast } from "@/hooks/use-toast";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { supabase } from "@/integrations/supabase/client";

const categories = ["AI Hardware", "Robotics", "Clean Tech", "Developer Tools", "Energy", "IoT", "Accessories", "Gadgets"];
const badges = ["", "NEW", "BEST SELLER", "LIMITED STOCK", "HOT", "SALE", "PREMIUM", "TRENDING"];

interface ProductForm {
  name: string;
  description: string;
  price: number;
  original_price: number;
  category: string;
  image_url: string;
  badge: string;
  rating: number;
  stock_status: string;
  is_featured: boolean;
  features: string[];
  benefits: string[];
  gallery_images: string[];
  gallery_videos: string[];
}

const defaultForm: ProductForm = {
  name: "",
  description: "",
  price: 0,
  original_price: 0,
  category: "Gadgets",
  image_url: "",
  badge: "",
  rating: 0,
  stock_status: "in_stock",
  is_featured: false,
  features: [""],
  benefits: [""],
  gallery_images: [],
  gallery_videos: [],
};

export default function ProductsManager() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);

  const openCreateDialog = () => {
    setForm(defaultForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: any) => {
    const specs = product.specs || {};
    const galleryImages = Array.isArray(product.gallery_images) ? product.gallery_images : [];
    const galleryVideos = Array.isArray(product.gallery_videos) ? product.gallery_videos : [];
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      original_price: specs.original_price || 0,
      category: product.category,
      image_url: product.image_url || "",
      badge: product.badge || "",
      rating: product.rating || 0,
      stock_status: product.stock_status || "in_stock",
      is_featured: product.is_featured || false,
      features: specs.features?.length ? specs.features : [""],
      benefits: specs.benefits?.length ? specs.benefits : [""],
      gallery_images: galleryImages,
      gallery_videos: galleryVideos,
    });
    setEditingId(product.id);
    setIsDialogOpen(true);
  };

  const addFeature = () => setForm({ ...form, features: [...form.features, ""] });
  const removeFeature = (index: number) => setForm({ ...form, features: form.features.filter((_, i) => i !== index) });
  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...form.features];
    newFeatures[index] = value;
    setForm({ ...form, features: newFeatures });
  };

  const addBenefit = () => setForm({ ...form, benefits: [...form.benefits, ""] });
  const removeBenefit = (index: number) => setForm({ ...form, benefits: form.benefits.filter((_, i) => i !== index) });
  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...form.benefits];
    newBenefits[index] = value;
    setForm({ ...form, benefits: newBenefits });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use first gallery image as main image if not set
    const image_url = form.image_url || form.gallery_images[0] || "";
    
    const productData = {
      name: form.name,
      description: form.description,
      price: form.price,
      category: form.category,
      image_url,
      badge: form.badge,
      rating: form.rating,
      stock_status: form.stock_status,
      is_featured: form.is_featured,
      gallery_images: form.gallery_images,
      gallery_videos: form.gallery_videos,
      specs: {
        original_price: form.original_price || null,
        features: form.features.filter(f => f.trim()),
        benefits: form.benefits.filter(b => b.trim()),
      }
    };
    
    try {
      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, ...productData });
        toast({ title: "Product updated successfully" });
      } else {
        await createProduct.mutateAsync(productData);
        
        // Send notification for new product
        try {
          await supabase.functions.invoke("send-unified-notification", {
            body: {
              type: "new_product",
              targetAll: true,
              sendEmail: true,
              sendInApp: true,
              data: {
                productName: form.name,
                description: form.description,
                price: form.price,
                imageUrl: image_url,
                productUrl: `${window.location.origin}/shop`,
              },
            },
          });
        } catch (e) {
          console.error("Notification failed:", e);
        }
        
        toast({ title: "Product created and users notified!" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save product", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await deleteProduct.mutateAsync(id);
      toast({ title: "Product deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button variant="hero" onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products?.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-4"
            >
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground">No image</span>
                )}
              </div>
              
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
                {product.is_featured && (
                  <Star className="w-4 h-4 text-accent fill-accent" />
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <p className="text-lg font-bold">₹{product.price?.toLocaleString()}</p>
                {(product.specs as any)?.original_price && (
                  <p className="text-sm text-muted-foreground line-through">
                    ₹{Number((product.specs as any).original_price).toLocaleString()}
                  </p>
                )}
              </div>
              <Badge variant={
                product.stock_status === 'in_stock' ? 'default' : 
                product.stock_status === 'low_stock' ? 'secondary' : 'destructive'
              } className="mb-4">
                {product.stock_status === 'in_stock' ? 'In Stock' : 
                 product.stock_status === 'low_stock' ? 'Limited Stock' : 'Out of Stock'}
              </Badge>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openEditDialog(product)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={form.category} 
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Pricing Section */}
            <div className="p-4 border border-border rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Pricing</h3>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Selling Price (₹)</Label>
                  <Input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Original Price (₹) - for discount</Label>
                  <Input
                    type="number"
                    value={form.original_price}
                    onChange={(e) => setForm({ ...form, original_price: parseFloat(e.target.value) || 0 })}
                    placeholder="Leave 0 for no discount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Badge</Label>
                  <Select 
                    value={form.badge} 
                    onValueChange={(v) => setForm({ ...form, badge: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select badge (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {badges.map((badge) => (
                        <SelectItem key={badge || "none"} value={badge || "none"}>
                          {badge || "No Badge"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Media Upload Section */}
            <div className="p-4 border border-border rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Product Media</h3>
              </div>
              <MediaUploader
                images={form.gallery_images}
                videos={form.gallery_videos}
                onImagesChange={(images) => setForm({ ...form, gallery_images: images })}
                onVideosChange={(videos) => setForm({ ...form, gallery_videos: videos })}
                maxImages={10}
                maxVideos={2}
                bucket="product-images"
                folder="products"
              />
              <div className="space-y-2">
                <Label>Rating (0-5)</Label>
                <Select 
                  value={form.rating.toString()} 
                  onValueChange={(v) => setForm({ ...form, rating: parseFloat(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 4.5, 5].map((r) => (
                      <SelectItem key={r} value={r.toString()}>
                        {"⭐".repeat(Math.floor(r))} {r} Stars
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stock Status */}
            <div className="p-4 border border-border rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Inventory</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Stock Status</Label>
                  <Select 
                    value={form.stock_status} 
                    onValueChange={(v) => setForm({ ...form, stock_status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Limited Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={form.is_featured}
                    onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                  />
                  <Label className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-accent" />
                    Featured Product
                  </Label>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Key Features</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addFeature}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              {form.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                  />
                  {form.features.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Benefits</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addBenefit}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              {form.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={benefit}
                    onChange={(e) => updateBenefit(index, e.target.value)}
                    placeholder={`Benefit ${index + 1}`}
                  />
                  {form.benefits.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeBenefit(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero">
                {editingId ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}