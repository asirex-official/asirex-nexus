import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Star, X, Package, IndianRupee, Percent, Image } from "lucide-react";
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

const categories = ["AI Hardware", "Robotics", "Clean Tech", "Developer Tools", "Energy", "IoT", "Accessories", "Gadgets"];

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
    
    const productData = {
      name: form.name,
      description: form.description,
      price: form.price,
      category: form.category,
      image_url: form.image_url,
      badge: form.badge,
      rating: form.rating,
      stock_status: form.stock_status,
      is_featured: form.is_featured,
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
        toast({ title: "Product created successfully" });
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
                  <Input
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g., LIMITED STOCK, NEW"
                  />
                </div>
              </div>
            </div>

            {/* Image & Rating */}
            <div className="p-4 border border-border rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Image className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Image & Rating</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://... or /src/assets/..."
                  />
                  {form.image_url && (
                    <img src={form.image_url} alt="Preview" className="w-20 h-20 object-cover rounded-lg mt-2" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Rating (0-5)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="p-4 border border-border rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Stock & Visibility</h3>
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
                      <SelectItem value="in_stock">✅ In Stock</SelectItem>
                      <SelectItem value="low_stock">⚠️ Limited Stock</SelectItem>
                      <SelectItem value="out_of_stock">❌ Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <Label>Featured on Homepage</Label>
                  <Switch
                    checked={form.is_featured}
                    onCheckedChange={(v) => setForm({ ...form, is_featured: v })}
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="p-4 border border-border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Features</h3>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="w-3 h-3 mr-1" /> Add Feature
                </Button>
              </div>
              <div className="space-y-2">
                {form.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder={`Feature ${index + 1}: e.g., Nano magnet technology`}
                    />
                    {form.features.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div className="p-4 border border-border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Benefits</h3>
                <Button type="button" variant="outline" size="sm" onClick={addBenefit}>
                  <Plus className="w-3 h-3 mr-1" /> Add Benefit
                </Button>
              </div>
              <div className="space-y-2">
                {form.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder={`Benefit ${index + 1}: e.g., Long lasting 5+ hours battery`}
                    />
                    {form.benefits.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeBenefit(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
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
