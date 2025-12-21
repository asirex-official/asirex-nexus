import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Globe, Mail, Phone, MapPin, MessageCircle, Building2, Shield, HelpCircle, Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCompanyInfo, useUpdateCompanyInfo } from "@/hooks/useSiteData";
import { useToast } from "@/hooks/use-toast";

export default function ContentManager() {
  const { data: companyInfo, isLoading } = useCompanyInfo();
  const updateInfo = useUpdateCompanyInfo();
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    // About
    about_us: "",
    mission_statement: "",
    
    // Main Contact
    contact_email: "",
    contact_phone: "",
    address: "",
    whatsapp_number: "",
    
    // Department Emails
    email_support: "",
    email_sales: "",
    email_privacy: "",
    email_careers: "",
    email_partnerships: "",
    email_press: "",
    
    // Coming Soon Toggles (stored as "true"/"false" strings)
    phone_coming_soon: "false",
    whatsapp_coming_soon: "false",
    email_support_coming_soon: "false",
    email_sales_coming_soon: "false",
    email_privacy_coming_soon: "false",
    email_careers_coming_soon: "false",
    email_partnerships_coming_soon: "false",
    email_press_coming_soon: "false",
    
    // Social Links
    social_twitter: "",
    social_linkedin: "",
    social_instagram: "",
    social_youtube: "",
  });

  useEffect(() => {
    if (companyInfo) {
      setForm({
        about_us: companyInfo.about_us || "",
        mission_statement: companyInfo.mission_statement || "",
        contact_email: companyInfo.contact_email || "",
        contact_phone: companyInfo.contact_phone || "",
        address: companyInfo.address || "",
        whatsapp_number: companyInfo.whatsapp_number || "",
        email_support: companyInfo.email_support || "",
        email_sales: companyInfo.email_sales || "",
        email_privacy: companyInfo.email_privacy || "",
        email_careers: companyInfo.email_careers || "",
        email_partnerships: companyInfo.email_partnerships || "",
        email_press: companyInfo.email_press || "",
        phone_coming_soon: companyInfo.phone_coming_soon || "false",
        whatsapp_coming_soon: companyInfo.whatsapp_coming_soon || "false",
        email_support_coming_soon: companyInfo.email_support_coming_soon || "false",
        email_sales_coming_soon: companyInfo.email_sales_coming_soon || "false",
        email_privacy_coming_soon: companyInfo.email_privacy_coming_soon || "false",
        email_careers_coming_soon: companyInfo.email_careers_coming_soon || "false",
        email_partnerships_coming_soon: companyInfo.email_partnerships_coming_soon || "false",
        email_press_coming_soon: companyInfo.email_press_coming_soon || "false",
        social_twitter: companyInfo.social_twitter || "",
        social_linkedin: companyInfo.social_linkedin || "",
        social_instagram: companyInfo.social_instagram || "",
        social_youtube: companyInfo.social_youtube || "",
      });
    }
  }, [companyInfo]);

  const handleSaveAll = async () => {
    try {
      for (const [key, value] of Object.entries(form)) {
        await updateInfo.mutateAsync({ key, value });
      }
      toast({ title: "All changes saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save some changes", variant: "destructive" });
    }
  };

  const toggleComingSoon = (field: string) => {
    const key = `${field}_coming_soon` as keyof typeof form;
    setForm({ ...form, [key]: form[key] === "true" ? "false" : "true" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold mb-2">Site Content</h1>
          <p className="text-muted-foreground">Manage your website content and contact information</p>
        </div>
        <Button variant="hero" onClick={handleSaveAll}>
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          About Section
        </h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>About Us Text</Label>
            <Textarea
              value={form.about_us}
              onChange={(e) => setForm({ ...form, about_us: e.target.value })}
              rows={4}
              placeholder="Describe your company..."
            />
          </div>

          <div className="space-y-2">
            <Label>Mission Statement</Label>
            <Textarea
              value={form.mission_statement}
              onChange={(e) => setForm({ ...form, mission_statement: e.target.value })}
              rows={2}
              placeholder="Your company's mission..."
            />
          </div>
        </div>
      </motion.div>

      {/* Main Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          Main Contact Information
        </h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Primary Email
            </Label>
            <Input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              placeholder="hello@asirex.in"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Coming Soon</span>
                <Switch
                  checked={form.phone_coming_soon === "true"}
                  onCheckedChange={() => toggleComingSoon("phone")}
                />
              </div>
            </div>
            <Input
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              placeholder="+91 1234 567890"
              disabled={form.phone_coming_soon === "true"}
              className={form.phone_coming_soon === "true" ? "opacity-50" : ""}
            />
            {form.phone_coming_soon === "true" && (
              <p className="text-xs text-amber-500">Will show as "Coming Soon" on the website</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp Number
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Coming Soon</span>
                <Switch
                  checked={form.whatsapp_coming_soon === "true"}
                  onCheckedChange={() => toggleComingSoon("whatsapp")}
                />
              </div>
            </div>
            <Input
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
              placeholder="919876543210 (without + symbol)"
              disabled={form.whatsapp_coming_soon === "true"}
              className={form.whatsapp_coming_soon === "true" ? "opacity-50" : ""}
            />
            {form.whatsapp_coming_soon === "true" && (
              <p className="text-xs text-amber-500">Will show as "Coming Soon" on the website</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Address
            </Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Your office address"
            />
          </div>
        </div>
      </motion.div>

      {/* Department Emails */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-6"
      >
        <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Department Emails
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure email addresses for different departments. Toggle "Coming Soon" if a department email isn't ready yet.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Support Email */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Support Email
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Coming Soon</span>
                <Switch
                  checked={form.email_support_coming_soon === "true"}
                  onCheckedChange={() => toggleComingSoon("email_support")}
                />
              </div>
            </div>
            <Input
              type="email"
              value={form.email_support}
              onChange={(e) => setForm({ ...form, email_support: e.target.value })}
              placeholder="support@asirex.in"
              disabled={form.email_support_coming_soon === "true"}
              className={form.email_support_coming_soon === "true" ? "opacity-50" : ""}
            />
          </div>

          {/* Sales Email */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Sales Email
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Coming Soon</span>
                <Switch
                  checked={form.email_sales_coming_soon === "true"}
                  onCheckedChange={() => toggleComingSoon("email_sales")}
                />
              </div>
            </div>
            <Input
              type="email"
              value={form.email_sales}
              onChange={(e) => setForm({ ...form, email_sales: e.target.value })}
              placeholder="sales@asirex.in"
              disabled={form.email_sales_coming_soon === "true"}
              className={form.email_sales_coming_soon === "true" ? "opacity-50" : ""}
            />
          </div>

          {/* Privacy Email */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy Email
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Coming Soon</span>
                <Switch
                  checked={form.email_privacy_coming_soon === "true"}
                  onCheckedChange={() => toggleComingSoon("email_privacy")}
                />
              </div>
            </div>
            <Input
              type="email"
              value={form.email_privacy}
              onChange={(e) => setForm({ ...form, email_privacy: e.target.value })}
              placeholder="privacy@asirex.in"
              disabled={form.email_privacy_coming_soon === "true"}
              className={form.email_privacy_coming_soon === "true" ? "opacity-50" : ""}
            />
          </div>

          {/* Careers Email */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Careers Email
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Coming Soon</span>
                <Switch
                  checked={form.email_careers_coming_soon === "true"}
                  onCheckedChange={() => toggleComingSoon("email_careers")}
                />
              </div>
            </div>
            <Input
              type="email"
              value={form.email_careers}
              onChange={(e) => setForm({ ...form, email_careers: e.target.value })}
              placeholder="careers@asirex.in"
              disabled={form.email_careers_coming_soon === "true"}
              className={form.email_careers_coming_soon === "true" ? "opacity-50" : ""}
            />
          </div>

          {/* Partnerships Email */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Partnerships Email
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Coming Soon</span>
                <Switch
                  checked={form.email_partnerships_coming_soon === "true"}
                  onCheckedChange={() => toggleComingSoon("email_partnerships")}
                />
              </div>
            </div>
            <Input
              type="email"
              value={form.email_partnerships}
              onChange={(e) => setForm({ ...form, email_partnerships: e.target.value })}
              placeholder="partnerships@asirex.in"
              disabled={form.email_partnerships_coming_soon === "true"}
              className={form.email_partnerships_coming_soon === "true" ? "opacity-50" : ""}
            />
          </div>

          {/* Press Email */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Press / Media Email
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Coming Soon</span>
                <Switch
                  checked={form.email_press_coming_soon === "true"}
                  onCheckedChange={() => toggleComingSoon("email_press")}
                />
              </div>
            </div>
            <Input
              type="email"
              value={form.email_press}
              onChange={(e) => setForm({ ...form, email_press: e.target.value })}
              placeholder="press@asirex.in"
              disabled={form.email_press_coming_soon === "true"}
              className={form.email_press_coming_soon === "true" ? "opacity-50" : ""}
            />
          </div>
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="font-display text-xl font-semibold mb-6">Social Media Links</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Twitter / X</Label>
            <Input
              value={form.social_twitter}
              onChange={(e) => setForm({ ...form, social_twitter: e.target.value })}
              placeholder="https://twitter.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label>LinkedIn</Label>
            <Input
              value={form.social_linkedin}
              onChange={(e) => setForm({ ...form, social_linkedin: e.target.value })}
              placeholder="https://linkedin.com/company/..."
            />
          </div>

          <div className="space-y-2">
            <Label>Instagram</Label>
            <Input
              value={form.social_instagram}
              onChange={(e) => setForm({ ...form, social_instagram: e.target.value })}
              placeholder="https://instagram.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label>YouTube</Label>
            <Input
              value={form.social_youtube}
              onChange={(e) => setForm({ ...form, social_youtube: e.target.value })}
              placeholder="https://youtube.com/@..."
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
