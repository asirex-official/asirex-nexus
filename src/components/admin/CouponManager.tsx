import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Ticket, Plus, Trash2, Copy, Check, Percent, IndianRupee, Users, Calendar, Clock, Eye, EyeOff, Filter, Gift, AlertCircle, Tag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  per_user_limit: number;
  new_users_only: boolean;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  category: string;
}

interface CouponForm {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  min_order_amount: string;
  max_discount_amount: string;
  usage_limit: string;
  per_user_limit: string;
  new_users_only: boolean;
  valid_until: string;
  category: string;
}

const couponCategories = [
  { value: "general", label: "General", icon: Ticket, color: "bg-blue-500" },
  { value: "apology", label: "Apology", icon: AlertCircle, color: "bg-orange-500" },
  { value: "sale", label: "Sale", icon: Tag, color: "bg-green-500" },
  { value: "giftcard", label: "Gift Card", icon: Gift, color: "bg-purple-500" },
  { value: "refund", label: "Refund", icon: IndianRupee, color: "bg-red-500" },
  { value: "festival", label: "Festival", icon: Sparkles, color: "bg-pink-500" },
];

const defaultForm: CouponForm = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  min_order_amount: "",
  max_discount_amount: "",
  usage_limit: "",
  per_user_limit: "1",
  new_users_only: false,
  valid_until: "",
  category: "general",
};

export function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [form, setForm] = useState<CouponForm>(defaultForm);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = activeCategory === "all" 
    ? coupons 
    : coupons.filter(c => c.category === activeCategory);

  const getCategoryStats = () => {
    const stats: Record<string, number> = { all: coupons.length };
    couponCategories.forEach(cat => {
      stats[cat.value] = coupons.filter(c => c.category === cat.value).length;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, code });
  };

  const handleCreate = async () => {
    if (!form.code || !form.discount_value) {
      toast.error("Please fill in required fields");
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from("coupons").insert({
        code: form.code.toUpperCase().trim(),
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null,
        max_discount_amount: form.max_discount_amount ? parseFloat(form.max_discount_amount) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        per_user_limit: parseInt(form.per_user_limit) || 1,
        new_users_only: form.new_users_only,
        valid_until: form.valid_until || null,
        is_active: true,
        category: form.category,
      });

      if (error) throw error;

      toast.success("Coupon created!");
      setShowCreateDialog(false);
      setForm(defaultForm);
      fetchCoupons();
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      toast.error(error.message || "Failed to create coupon");
    } finally {
      setCreating(false);
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      setCoupons(coupons.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
      toast.success(currentStatus ? "Coupon deactivated" : "Coupon activated");
    } catch (error) {
      toast.error("Failed to update coupon");
    }
  };

  const deleteCoupon = async (id: string) => {
    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
      setCoupons(coupons.filter(c => c.id !== id));
      toast.success("Coupon deleted");
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Code copied!");
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            Coupon Management
          </h2>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Category Filter Tabs */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory("all")}
            className="gap-2"
          >
            <Ticket className="w-4 h-4" />
            All ({categoryStats.all})
          </Button>
          {couponCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
                className="gap-2"
              >
                <Icon className="w-4 h-4" />
                {cat.label} ({categoryStats[cat.value] || 0})
              </Button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="py-12 text-center">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {activeCategory === "all" ? "No coupons created yet" : `No ${activeCategory} coupons found`}
            </p>
            <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
              Create Your First Coupon
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCoupons.map((coupon, index) => {
            const categoryInfo = couponCategories.find(c => c.value === coupon.category) || couponCategories[0];
            const CategoryIcon = categoryInfo.icon;
            return (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`relative overflow-hidden ${!coupon.is_active || isExpired(coupon.valid_until) ? 'opacity-60' : ''}`}>
                  {/* Category Badge */}
                  <div className={`absolute top-0 left-0 ${categoryInfo.color} text-white text-xs px-2 py-1 rounded-br flex items-center gap-1`}>
                    <CategoryIcon className="w-3 h-3" />
                    {categoryInfo.label}
                  </div>
                  {coupon.new_users_only && (
                    <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-bl">
                      New Users Only
                    </div>
                  )}
                  <CardHeader className="pb-2 pt-8">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-mono flex items-center gap-2">
                        {coupon.code}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(coupon.code, coupon.id)}
                        >
                          {copiedId === coupon.id ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleCouponStatus(coupon.id, coupon.is_active)}
                        >
                          {coupon.is_active ? (
                            <Eye className="w-4 h-4 text-green-500" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => deleteCoupon(coupon.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {coupon.description && (
                      <p className="text-sm text-muted-foreground">{coupon.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2">
                      {coupon.discount_type === "percentage" ? (
                        <Badge variant="secondary" className="gap-1">
                          <Percent className="w-3 h-3" />
                          {coupon.discount_value}% OFF
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <IndianRupee className="w-3 h-3" />
                          ₹{coupon.discount_value} OFF
                        </Badge>
                      )}
                      {isExpired(coupon.valid_until) && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      {coupon.min_order_amount && (
                        <p>Min order: ₹{coupon.min_order_amount}</p>
                      )}
                      {coupon.max_discount_amount && coupon.discount_type === "percentage" && (
                        <p>Max discount: ₹{coupon.max_discount_amount}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {coupon.usage_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ''} used
                        </span>
                        {coupon.valid_until && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(coupon.valid_until), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Create New Coupon
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {couponCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Coupon Code *</Label>
              <div className="flex gap-2">
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="SAVE20"
                  className="font-mono uppercase"
                />
                <Button variant="outline" onClick={generateCode}>
                  Generate
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="20% off on first order"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Type *</Label>
                <Select
                  value={form.discount_type}
                  onValueChange={(v: "percentage" | "fixed") => setForm({ ...form, discount_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Discount Value *</Label>
                <Input
                  type="number"
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  placeholder={form.discount_type === "percentage" ? "20" : "500"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Order Amount</Label>
                <Input
                  type="number"
                  value={form.min_order_amount}
                  onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })}
                  placeholder="₹1000"
                />
              </div>

              {form.discount_type === "percentage" && (
                <div className="space-y-2">
                  <Label>Max Discount</Label>
                  <Input
                    type="number"
                    value={form.max_discount_amount}
                    onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value })}
                    placeholder="₹500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Usage Limit</Label>
                <Input
                  type="number"
                  value={form.usage_limit}
                  onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                  placeholder="100 (unlimited if empty)"
                />
              </div>

              <div className="space-y-2">
                <Label>Per User Limit</Label>
                <Input
                  type="number"
                  value={form.per_user_limit}
                  onChange={(e) => setForm({ ...form, per_user_limit: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Valid Until</Label>
              <Input
                type="datetime-local"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div>
                <Label className="text-sm font-medium">New Users Only</Label>
                <p className="text-xs text-muted-foreground">Only users with no previous orders</p>
              </div>
              <Switch
                checked={form.new_users_only}
                onCheckedChange={(v) => setForm({ ...form, new_users_only: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}