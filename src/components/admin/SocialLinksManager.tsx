import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Share2, Instagram, Youtube, MessageCircle, Twitter, Facebook, Linkedin, Plus, Edit, Trash2, Save, ExternalLink, GripVertical } from "lucide-react";

interface SocialLink {
  id: string;
  platform: string;
  name: string;
  handle: string;
  link: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

const iconOptions = [
  { value: "Instagram", label: "Instagram", icon: Instagram },
  { value: "Youtube", label: "YouTube", icon: Youtube },
  { value: "MessageCircle", label: "WhatsApp", icon: MessageCircle },
  { value: "Twitter", label: "Twitter/X", icon: Twitter },
  { value: "Facebook", label: "Facebook", icon: Facebook },
  { value: "Linkedin", label: "LinkedIn", icon: Linkedin },
];

const getIconComponent = (iconName: string) => {
  const found = iconOptions.find(o => o.value === iconName);
  return found?.icon || Share2;
};

export function SocialLinksManager() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [form, setForm] = useState({
    platform: "",
    name: "",
    handle: "",
    link: "",
    icon: "Instagram",
    is_active: true,
  });

  const fetchLinks = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast.error("Failed to fetch social links");
    } else {
      setLinks(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const openAddDialog = () => {
    setEditingLink(null);
    setForm({
      platform: "",
      name: "",
      handle: "",
      link: "",
      icon: "Instagram",
      is_active: true,
    });
    setShowDialog(true);
  };

  const openEditDialog = (link: SocialLink) => {
    setEditingLink(link);
    setForm({
      platform: link.platform,
      name: link.name,
      handle: link.handle,
      link: link.link,
      icon: link.icon,
      is_active: link.is_active,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.platform || !form.name || !form.handle || !form.link) {
      toast.error("Please fill all required fields");
      return;
    }

    if (editingLink) {
      const { error } = await supabase
        .from("social_links")
        .update({
          platform: form.platform,
          name: form.name,
          handle: form.handle,
          link: form.link,
          icon: form.icon,
          is_active: form.is_active,
        })
        .eq("id", editingLink.id);

      if (error) {
        toast.error("Failed to update social link");
      } else {
        toast.success("Social link updated");
        fetchLinks();
        setShowDialog(false);
      }
    } else {
      const { error } = await supabase.from("social_links").insert({
        platform: form.platform,
        name: form.name,
        handle: form.handle,
        link: form.link,
        icon: form.icon,
        is_active: form.is_active,
        display_order: links.length,
      });

      if (error) {
        toast.error("Failed to add social link");
      } else {
        toast.success("Social link added");
        fetchLinks();
        setShowDialog(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("social_links").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete social link");
    } else {
      toast.success("Social link deleted");
      fetchLinks();
    }
  };

  const toggleActive = async (link: SocialLink) => {
    const { error } = await supabase
      .from("social_links")
      .update({ is_active: !link.is_active })
      .eq("id", link.id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      fetchLinks();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Social Media Links
        </CardTitle>
        <Button size="sm" onClick={openAddDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No social links configured
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link) => {
              const IconComponent = getIconComponent(link.icon);
              return (
                <div
                  key={link.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    link.is_active ? "bg-card" : "bg-muted/50 opacity-60"
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{link.name}</div>
                    <div className="text-sm text-muted-foreground">{link.handle}</div>
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      {link.link.slice(0, 40)}...
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={link.is_active}
                      onCheckedChange={() => toggleActive(link)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(link)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLink ? "Edit Social Link" : "Add Social Link"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform ID</Label>
                <Input
                  placeholder="e.g., instagram"
                  value={form.platform}
                  onChange={(e) =>
                    setForm({ ...form, platform: e.target.value.toLowerCase() })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input
                  placeholder="e.g., Instagram"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Handle / Username</Label>
              <Input
                placeholder="e.g., @Asirex.official"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Link URL</Label>
              <Input
                placeholder="https://..."
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={form.icon}
                onValueChange={(value) => setForm({ ...form, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm({ ...form, is_active: checked })
                }
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
