import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Globe, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyInfo, useUpdateCompanyInfo } from "@/hooks/useSiteData";
import { useToast } from "@/hooks/use-toast";

export default function ContentManager() {
  const { data: companyInfo, isLoading } = useCompanyInfo();
  const updateInfo = useUpdateCompanyInfo();
  const { toast } = useToast();
  
  const [form, setForm] = useState({
    about_us: "",
    mission_statement: "",
    contact_email: "",
    contact_phone: "",
    address: "",
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
        social_twitter: companyInfo.social_twitter || "",
        social_linkedin: companyInfo.social_linkedin || "",
        social_instagram: companyInfo.social_instagram || "",
        social_youtube: companyInfo.social_youtube || "",
      });
    }
  }, [companyInfo]);

  const handleSave = async (key: string) => {
    try {
      await updateInfo.mutateAsync({ key, value: form[key as keyof typeof form] });
      toast({ title: "Saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
  };

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
          <p className="text-muted-foreground">Manage your website content and information</p>
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

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="font-display text-xl font-semibold mb-6">Contact Information</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              placeholder="hello@asirex.com"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Phone
            </Label>
            <Input
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              placeholder="+91 1234 567890"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
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
