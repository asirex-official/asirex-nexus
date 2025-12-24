import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Sparkles, Plus, Calendar, Tag, Trash2, Power, ShoppingBag, 
  Percent, BadgeIndianRupee, Clock, Users, Edit, X, Check, Bell, Mail, Palette,
  Package, Grid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface SalesCampaign {
  id: string;
  name: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_amount: number | null;
  start_date: string;
  end_date: string | null;
  max_orders: number | null;
  current_orders: number;
  banner_message: string | null;
  banner_color: string | null;
  is_active: boolean;
  applies_to: string;
  target_categories: string[];
  target_product_ids: string[];
  festival_theme: string | null;
  notify_users: boolean;
  notify_email: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url: string | null;
}

const festivalPresets = [
  // Indian Festivals
  { name: "Diwali Sale", message: "🪔 Diwali Special! Light up your savings!", color: "#f97316", theme: "diwali" },
  { name: "Holi Sale", message: "🌈 Holi Bonanza! Colors of savings!", color: "#ec4899", theme: "holi" },
  { name: "Independence Day Sale", message: "🇮🇳 Freedom Sale! Celebrate with discounts!", color: "#f97316", theme: "independence_day" },
  { name: "Navratri Sale", message: "💃 Navratri Special! Dance into savings!", color: "#d946ef", theme: "navratri" },
  { name: "Ganesh Chaturthi Sale", message: "🐘 Ganesh Chaturthi Blessings! Special offers!", color: "#eab308", theme: "ganesh_chaturthi" },
  { name: "Onam Sale", message: "🛶 Onam Celebrations! Harvest of deals!", color: "#22c55e", theme: "onam" },
  { name: "Raksha Bandhan Sale", message: "🎀 Rakhi Special! Gifts for siblings!", color: "#f472b6", theme: "raksha_bandhan" },
  { name: "Eid Sale", message: "🌙 Eid Mubarak! Blessed savings!", color: "#14b8a6", theme: "eid" },
  
  // Worldwide Festivals
  { name: "Christmas Sale", message: "🎄 Christmas Joy! Unwrap amazing deals!", color: "#22c55e", theme: "christmas" },
  { name: "New Year Sale", message: "🎉 New Year, New Savings! Start fresh!", color: "#6366f1", theme: "new_year" },
  { name: "Valentine's Day Sale", message: "💕 Valentine's Special! Love & Savings!", color: "#ef4444", theme: "valentines" },
  { name: "Easter Sale", message: "🐰 Easter Egg Hunt! Find amazing deals!", color: "#a855f7", theme: "easter" },
  { name: "Halloween Sale", message: "👻 Spooky Savings! Frighteningly good deals!", color: "#f97316", theme: "halloween" },
  { name: "Thanksgiving Sale", message: "🦃 Thanksgiving Special! Grateful savings!", color: "#ca8a04", theme: "thanksgiving" },
  { name: "Black Friday Sale", message: "🛒 BLACK FRIDAY! Biggest discounts ever!", color: "#000000", theme: "black_friday" },
  { name: "Cyber Monday Sale", message: "💻 Cyber Monday! Online exclusive deals!", color: "#3b82f6", theme: "black_friday" },
  { name: "St. Patrick's Day Sale", message: "☘️ Lucky Day! Find your pot of gold!", color: "#22c55e", theme: "st_patricks" },
  
  // Generic Sales
  { name: "Flash Sale", message: "⚡ Flash Sale! Limited time only!", color: "#ef4444", theme: null },
  { name: "Weekend Special", message: "🎊 Weekend Special! Shop & Save!", color: "#8b5cf6", theme: null },
  { name: "Clearance Sale", message: "📦 Clearance! Everything must go!", color: "#f59e0b", theme: null },
  { name: "Summer Sale", message: "☀️ Summer Sale! Hot deals, cool prices!", color: "#fbbf24", theme: null },
  { name: "Monsoon Sale", message: "🌧️ Monsoon Sale! Shower of savings!", color: "#0ea5e9", theme: null },
  { name: "Winter Sale", message: "❄️ Winter Sale! Warm deals, cold prices!", color: "#64748b", theme: null },
];

const festivalThemes = [
  // Indian Festivals
  { value: "diwali", label: "🪔 Diwali - Firecrackers & Diyas", icon: "🪔" },
  { value: "holi", label: "🌈 Holi - Colors Splash", icon: "🌈" },
  { value: "independence_day", label: "🇮🇳 Independence Day - Tricolor & Flags", icon: "🇮🇳" },
  { value: "navratri", label: "💃 Navratri/Durga Puja - Dandiya & Dance", icon: "💃" },
  { value: "ganesh_chaturthi", label: "🐘 Ganesh Chaturthi - Blessings", icon: "🐘" },
  { value: "onam", label: "🛶 Onam - Flowers & Boats", icon: "🛶" },
  { value: "raksha_bandhan", label: "🎀 Raksha Bandhan - Rakhis", icon: "🎀" },
  { value: "eid", label: "🌙 Eid - Moon & Stars", icon: "🌙" },
  
  // Worldwide Festivals
  { value: "christmas", label: "🎄 Christmas - Snow & Santa Walking", icon: "🎄" },
  { value: "new_year", label: "🎆 New Year - Confetti & Fireworks", icon: "🎆" },
  { value: "valentines", label: "💕 Valentine's Day - Floating Hearts", icon: "💕" },
  { value: "easter", label: "🐰 Easter - Bunny & Eggs", icon: "🐰" },
  { value: "halloween", label: "👻 Halloween - Ghosts & Pumpkins", icon: "👻" },
  { value: "thanksgiving", label: "🦃 Thanksgiving - Turkey & Leaves", icon: "🦃" },
  { value: "black_friday", label: "🛒 Black Friday/Cyber Monday - Shopping Frenzy", icon: "🛒" },
  { value: "st_patricks", label: "☘️ St. Patrick's Day - Clovers & Rainbow", icon: "☘️" },
];

const productCategories = ["AI Hardware", "Robotics", "Clean Tech", "Gadgets", "Nano Tech", "Accessories"];

export function SalesCampaignManager() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<SalesCampaign | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxOrders, setMaxOrders] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");
  const [bannerColor, setBannerColor] = useState("#6366f1");
  const [appliesTo, setAppliesTo] = useState("all");
  const [festivalTheme, setFestivalTheme] = useState<string | null>(null);
  const [notifyUsers, setNotifyUsers] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Fetch products for selection
  const { data: products } = useQuery({
    queryKey: ["products-for-campaign"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category, price, image_url")
        .order("name");
      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["sales-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as SalesCampaign[];
    },
  });

  const createCampaign = useMutation({
    mutationFn: async (campaign: {
      name: string;
      discount_value: number;
      discount_type: string;
      description?: string | null;
      max_discount_amount?: number | null;
      min_order_amount?: number;
      start_date?: string;
      end_date?: string | null;
      max_orders?: number | null;
      banner_message?: string | null;
      banner_color?: string;
      applies_to?: string;
    }) => {
      const { error } = await supabase.from("sales_campaigns").insert([campaign]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-campaigns"] });
      toast.success("Sales campaign created!");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create campaign");
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SalesCampaign> }) => {
      const { error } = await supabase
        .from("sales_campaigns")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-campaigns"] });
      toast.success("Campaign updated!");
      resetForm();
      setIsDialogOpen(false);
      setEditingCampaign(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update campaign");
    },
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sales_campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-campaigns"] });
      toast.success("Campaign deleted!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete campaign");
    },
  });

  const toggleCampaign = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("sales_campaigns")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales-campaigns"] });
      toast.success("Campaign status updated!");
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setDiscountType("percentage");
    setDiscountValue("");
    setMaxDiscountAmount("");
    setMinOrderAmount("");
    setStartDate("");
    setEndDate("");
    setMaxOrders("");
    setBannerMessage("");
    setBannerColor("#6366f1");
    setAppliesTo("all");
    setFestivalTheme(null);
    setNotifyUsers(false);
    setNotifyEmail(false);
    setSelectedCategories([]);
    setSelectedProductIds([]);
  };

  const applyPreset = (preset: typeof festivalPresets[0]) => {
    setName(preset.name);
    setBannerMessage(preset.message);
    setBannerColor(preset.color);
    setFestivalTheme(preset.theme);
  };

  const openEditDialog = (campaign: SalesCampaign) => {
    setEditingCampaign(campaign);
    setName(campaign.name);
    setDescription(campaign.description || "");
    setDiscountType(campaign.discount_type);
    setDiscountValue(campaign.discount_value.toString());
    setMaxDiscountAmount(campaign.max_discount_amount?.toString() || "");
    setMinOrderAmount(campaign.min_order_amount?.toString() || "");
    setStartDate(campaign.start_date ? format(new Date(campaign.start_date), "yyyy-MM-dd'T'HH:mm") : "");
    setEndDate(campaign.end_date ? format(new Date(campaign.end_date), "yyyy-MM-dd'T'HH:mm") : "");
    setMaxOrders(campaign.max_orders?.toString() || "");
    setBannerMessage(campaign.banner_message || "");
    setBannerColor(campaign.banner_color || "#6366f1");
    setAppliesTo(campaign.applies_to);
    setFestivalTheme(campaign.festival_theme);
    setNotifyUsers(campaign.notify_users || false);
    setNotifyEmail(campaign.notify_email || false);
    setSelectedCategories(campaign.target_categories || []);
    setSelectedProductIds(campaign.target_product_ids || []);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!name || !discountValue) {
      toast.error("Please fill in required fields");
      return;
    }

    const campaignData = {
      name,
      description: description || null,
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      max_discount_amount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
      start_date: startDate || new Date().toISOString(),
      end_date: endDate || null,
      max_orders: maxOrders ? parseInt(maxOrders) : null,
      banner_message: bannerMessage || null,
      banner_color: bannerColor,
      applies_to: appliesTo,
      target_categories: selectedCategories,
      target_product_ids: selectedProductIds,
      festival_theme: festivalTheme,
      notify_users: notifyUsers,
      notify_email: notifyEmail,
    };

    if (editingCampaign) {
      updateCampaign.mutate({ id: editingCampaign.id, updates: campaignData });
    } else {
      createCampaign.mutate(campaignData);
      
      // Send notifications if enabled
      if (notifyUsers || notifyEmail) {
        sendCampaignNotifications(campaignData);
      }
    }
  };

  const sendCampaignNotifications = async (campaignData: any) => {
    try {
      const discountText = `${campaignData.discount_value}${campaignData.discount_type === 'percentage' ? '%' : '₹'} off`;
      
      // Use the unified notification edge function for both in-app and email
      const { error } = await supabase.functions.invoke("send-unified-notification", {
        body: {
          type: "new_coupon",
          targetAll: true,
          sendEmail: notifyEmail,
          sendInApp: notifyUsers,
          title: `🎉 ${campaignData.name}`,
          message: campaignData.banner_message || `Get ${discountText}! Don't miss this amazing offer.`,
          link: "/shop",
          data: {
            code: campaignData.name.toUpperCase().replace(/\s+/g, ''),
            discount: campaignData.discount_value,
            shopUrl: `${window.location.origin}/shop`,
            validUntil: campaignData.end_date ? new Date(campaignData.end_date).toLocaleDateString() : null,
          },
        },
      });

      if (error) throw error;
      
      if (notifyUsers) {
        toast.success("In-app notifications sent to all users!");
      }
      if (notifyEmail) {
        toast.success("Email notifications sent to all users!");
      }
    } catch (error) {
      console.error("Error sending notifications:", error);
      toast.error("Failed to send some notifications");
    }
  };

  const getCampaignStatus = (campaign: SalesCampaign) => {
    if (!campaign.is_active) return { label: "Inactive", color: "bg-gray-500" };
    
    const now = new Date();
    const start = new Date(campaign.start_date);
    const end = campaign.end_date ? new Date(campaign.end_date) : null;
    
    if (now < start) return { label: "Scheduled", color: "bg-blue-500" };
    if (end && now > end) return { label: "Ended", color: "bg-gray-500" };
    if (campaign.max_orders && campaign.current_orders >= campaign.max_orders) {
      return { label: "Sold Out", color: "bg-red-500" };
    }
    return { label: "Live", color: "bg-green-500" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Sales & Festival Campaigns
          </h2>
          <p className="text-muted-foreground">Create and manage promotional sales events</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingCampaign(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCampaign ? "Edit Campaign" : "Create Sales Campaign"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Festival Presets */}
              {!editingCampaign && (
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Quick Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    {festivalPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset(preset)}
                        style={{ borderColor: preset.color, color: preset.color }}
                        className="text-xs"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Campaign Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Diwali Mega Sale"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Applies To</Label>
                  <Select value={appliesTo} onValueChange={(v) => {
                    setAppliesTo(v);
                    if (v === "all") {
                      setSelectedCategories([]);
                      setSelectedProductIds([]);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="category">Specific Categories</SelectItem>
                      <SelectItem value="products">Specific Products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category Selector */}
              {appliesTo === "category" && (
                <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Grid className="w-4 h-4" />
                    Select Categories
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {productCategories.map((cat) => (
                      <div 
                        key={cat}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          selectedCategories.includes(cat) 
                            ? "bg-primary/10 border-primary" 
                            : "bg-background hover:bg-muted/50"
                        }`}
                        onClick={() => {
                          setSelectedCategories(prev => 
                            prev.includes(cat) 
                              ? prev.filter(c => c !== cat)
                              : [...prev, cat]
                          );
                        }}
                      >
                        <Checkbox 
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => {}}
                        />
                        <span className="text-sm">{cat}</span>
                      </div>
                    ))}
                  </div>
                  {selectedCategories.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {selectedCategories.join(", ")}
                    </p>
                  )}
                </div>
              )}

              {/* Product Selector */}
              {appliesTo === "products" && (
                <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Select Products ({selectedProductIds.length} selected)
                  </h4>
                  <ScrollArea className="h-[200px] border rounded-lg">
                    <div className="p-2 space-y-1">
                      {products?.map((product) => (
                        <div 
                          key={product.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            selectedProductIds.includes(product.id) 
                              ? "bg-primary/10 border border-primary" 
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() => {
                            setSelectedProductIds(prev => 
                              prev.includes(product.id) 
                                ? prev.filter(id => id !== product.id)
                                : [...prev, product.id]
                            );
                          }}
                        >
                          <Checkbox 
                            checked={selectedProductIds.includes(product.id)}
                            onCheckedChange={() => {}}
                          />
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.category} • ₹{product.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the sale..."
                  rows={2}
                />
              </div>

              {/* Discount Settings */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Discount Settings
                </h4>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select value={discountType} onValueChange={setDiscountType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          <div className="flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            Percentage Off
                          </div>
                        </SelectItem>
                        <SelectItem value="fixed">
                          <div className="flex items-center gap-2">
                            <BadgeIndianRupee className="w-4 h-4" />
                            Fixed Amount
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Discount Value *</Label>
                    <Input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 500"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Discount (₹)</Label>
                    <Input
                      type="number"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(e.target.value)}
                      placeholder="e.g. 1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Min Order Amount (₹)</Label>
                    <Input
                      type="number"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value)}
                      placeholder="e.g. 499"
                    />
                  </div>
                </div>
              </div>

              {/* Time & Limits */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time & Limits
                </h4>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Max Orders (Limited Sale)</Label>
                    <Input
                      type="number"
                      value={maxOrders}
                      onChange={(e) => setMaxOrders(e.target.value)}
                      placeholder="Leave empty for unlimited"
                    />
                    <p className="text-xs text-muted-foreground">Set a limit to create urgency (e.g. First 100 orders only)</p>
                  </div>
                </div>
              </div>

              {/* Festival Theme Settings */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Festival Theme & Effects
                </h4>

                <div className="space-y-2">
                  <Label>Select Festival Theme</Label>
                  <Select value={festivalTheme || "none"} onValueChange={(v) => setFestivalTheme(v === "none" ? null : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="No theme (plain sale)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No theme (plain sale)</SelectItem>
                      {festivalThemes.map((theme) => (
                        <SelectItem key={theme.value} value={theme.value}>
                          {theme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {festivalTheme ? "🎉 Visual effects will appear on the website!" : "Choose a theme to add festive effects"}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-muted-foreground" />
                      <Label>Notify Users (In-App)</Label>
                    </div>
                    <Switch checked={notifyUsers} onCheckedChange={setNotifyUsers} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <Label>Send Email Notification</Label>
                    </div>
                    <Switch checked={notifyEmail} onCheckedChange={setNotifyEmail} />
                  </div>
                </div>
              </div>

              {/* Banner Settings */}
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Banner Display
                </h4>

                <div className="space-y-2">
                  <Label>Banner Message</Label>
                  <Input
                    value={bannerMessage}
                    onChange={(e) => setBannerMessage(e.target.value)}
                    placeholder="e.g. 🎉 Festival Sale! Up to 50% OFF!"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Banner Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={bannerColor}
                      onChange={(e) => setBannerColor(e.target.value)}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <div 
                      className="flex-1 p-3 rounded-lg text-white text-center font-medium text-sm"
                      style={{ backgroundColor: bannerColor }}
                    >
                      {bannerMessage || "Preview Banner"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingCampaign(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={createCampaign.isPending || updateCampaign.isPending}
                >
                  {createCampaign.isPending || updateCampaign.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                  ) : editingCampaign ? (
                    "Update Campaign"
                  ) : (
                    "Create Campaign"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      ) : campaigns?.length === 0 ? (
        <Card className="text-center py-12">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No sales campaigns yet</p>
          <p className="text-sm text-muted-foreground">Create your first festival or promotional sale!</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {campaigns?.map((campaign) => {
            const status = getCampaignStatus(campaign);
            return (
              <Card key={campaign.id} className="relative overflow-hidden">
                {campaign.banner_color && (
                  <div 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: campaign.banner_color }}
                  />
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {campaign.name}
                        <Badge className={`${status.color} text-white text-xs`}>
                          {status.label}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {campaign.description || "No description"}
                      </CardDescription>
                    </div>
                    <Switch
                      checked={campaign.is_active}
                      onCheckedChange={(checked) => 
                        toggleCampaign.mutate({ id: campaign.id, is_active: checked })
                      }
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Discount Info */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 font-bold text-primary">
                      {campaign.discount_type === 'percentage' ? (
                        <>
                          <Percent className="w-4 h-4" />
                          {campaign.discount_value}% OFF
                        </>
                      ) : (
                        <>
                          <BadgeIndianRupee className="w-4 h-4" />
                          ₹{campaign.discount_value} OFF
                        </>
                      )}
                    </div>
                    {campaign.min_order_amount && campaign.min_order_amount > 0 && (
                      <span className="text-muted-foreground">
                        Min: ₹{campaign.min_order_amount}
                      </span>
                    )}
                    {campaign.max_discount_amount && (
                      <span className="text-muted-foreground">
                        Max: ₹{campaign.max_discount_amount}
                      </span>
                    )}
                  </div>

                  {/* Time Info */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(campaign.start_date), "MMM d, yyyy")}
                    {campaign.end_date && (
                      <> — {format(new Date(campaign.end_date), "MMM d, yyyy")}</>
                    )}
                  </div>

                  {/* Order Limit */}
                  {campaign.max_orders && (
                    <div className="flex items-center gap-2 text-xs">
                      <Users className="w-3 h-3" />
                      <span className={campaign.current_orders >= campaign.max_orders ? "text-red-500" : "text-muted-foreground"}>
                        {campaign.current_orders} / {campaign.max_orders} orders used
                      </span>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min((campaign.current_orders / campaign.max_orders) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Banner Preview */}
                  {campaign.banner_message && (
                    <div 
                      className="p-2 rounded text-white text-xs text-center font-medium"
                      style={{ backgroundColor: campaign.banner_color || '#6366f1' }}
                    >
                      {campaign.banner_message}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openEditDialog(campaign)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm("Delete this campaign?")) {
                          deleteCampaign.mutate(campaign.id);
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}