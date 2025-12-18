import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Brain, Bot, Leaf, Globe, Plus, Trash2, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAllPageContent, useUpdatePageContent } from "@/hooks/usePageContent";
import { useToast } from "@/hooks/use-toast";

const featurePageKeys = ["feature-ai-ml", "feature-robotics", "feature-cleantech", "feature-global-delivery"];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  Bot,
  Leaf,
  Globe,
};

interface Capability {
  icon: string;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

interface FeatureContent {
  stats?: Stat[];
  capabilities?: Capability[];
  vision_title?: string;
  vision_text?: string;
}

export default function FeaturesManager() {
  const { data: pages, isLoading } = useAllPageContent();
  const updatePage = useUpdatePageContent();
  const { toast } = useToast();
  
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    page_title: "",
    page_subtitle: "",
    hero_icon: "",
    vision_title: "",
    vision_text: "",
    stats: [] as Stat[],
    capabilities: [] as Capability[],
    is_active: true,
  });

  const featurePages = pages?.filter(p => featurePageKeys.includes(p.page_key)) || [];

  const handleEditPage = (pageKey: string) => {
    const page = featurePages.find(p => p.page_key === pageKey);
    if (!page) return;
    
    const content = page.content as FeatureContent;
    setEditForm({
      page_title: page.page_title,
      page_subtitle: page.page_subtitle || "",
      hero_icon: page.hero_icon || "",
      vision_title: content.vision_title || "",
      vision_text: content.vision_text || "",
      stats: content.stats || [],
      capabilities: content.capabilities || [],
      is_active: page.is_active,
    });
    setSelectedPage(pageKey);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    const page = featurePages.find(p => p.page_key === selectedPage);
    if (!page) return;

    try {
      await updatePage.mutateAsync({
        id: page.id,
        page_title: editForm.page_title,
        page_subtitle: editForm.page_subtitle,
        hero_icon: editForm.hero_icon,
        content: {
          stats: editForm.stats,
          capabilities: editForm.capabilities,
          vision_title: editForm.vision_title,
          vision_text: editForm.vision_text,
        },
        is_active: editForm.is_active,
      });
      toast({ title: "Page content updated successfully" });
      setEditDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update page", variant: "destructive" });
    }
  };

  const addStat = () => {
    setEditForm({
      ...editForm,
      stats: [...editForm.stats, { value: "", label: "" }],
    });
  };

  const removeStat = (index: number) => {
    setEditForm({
      ...editForm,
      stats: editForm.stats.filter((_, i) => i !== index),
    });
  };

  const updateStat = (index: number, field: keyof Stat, value: string) => {
    const newStats = [...editForm.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setEditForm({ ...editForm, stats: newStats });
  };

  const addCapability = () => {
    setEditForm({
      ...editForm,
      capabilities: [...editForm.capabilities, { icon: "Cpu", title: "", description: "" }],
    });
  };

  const removeCapability = (index: number) => {
    setEditForm({
      ...editForm,
      capabilities: editForm.capabilities.filter((_, i) => i !== index),
    });
  };

  const updateCapability = (index: number, field: keyof Capability, value: string) => {
    const newCaps = [...editForm.capabilities];
    newCaps[index] = { ...newCaps[index], [field]: value };
    setEditForm({ ...editForm, capabilities: newCaps });
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
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Feature Pages</h1>
        <p className="text-muted-foreground">Manage content for AI/ML, Robotics, Clean Tech, and Global Delivery pages</p>
      </div>

      <div className="grid gap-6">
        {featurePages.map((page, index) => {
          const IconComponent = iconMap[page.hero_icon || "Brain"] || Brain;
          const content = page.content as FeatureContent;
          
          return (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-lg font-semibold">{page.page_title}</h3>
                      {!page.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{page.page_subtitle}</p>
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{content.stats?.length || 0} stats</span>
                      <span>{content.capabilities?.length || 0} capabilities</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleEditPage(page.page_key)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Feature Page</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Page Title</Label>
                  <Input
                    value={editForm.page_title}
                    onChange={(e) => setEditForm({ ...editForm, page_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hero Icon</Label>
                  <Input
                    value={editForm.hero_icon}
                    onChange={(e) => setEditForm({ ...editForm, hero_icon: e.target.value })}
                    placeholder="Brain, Bot, Leaf, Globe, etc."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Page Subtitle</Label>
                <Textarea
                  value={editForm.page_subtitle}
                  onChange={(e) => setEditForm({ ...editForm, page_subtitle: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.is_active}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                />
                <Label>Page Active</Label>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Stats</h3>
                <Button variant="outline" size="sm" onClick={addStat}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stat
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {editForm.stats.map((stat, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Value</Label>
                      <Input
                        value={stat.value}
                        onChange={(e) => updateStat(index, "value", e.target.value)}
                        placeholder="10x, 99.9%, etc."
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={stat.label}
                        onChange={(e) => updateStat(index, "label", e.target.value)}
                        placeholder="Faster Processing"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeStat(index)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Capabilities</h3>
                <Button variant="outline" size="sm" onClick={addCapability}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Capability
                </Button>
              </div>
              <div className="space-y-4">
                {editForm.capabilities.map((cap, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Capability {index + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeCapability(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <Input
                          value={cap.icon}
                          onChange={(e) => updateCapability(index, "icon", e.target.value)}
                          placeholder="Cpu, Target, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={cap.title}
                          onChange={(e) => updateCapability(index, "title", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={cap.description}
                        onChange={(e) => updateCapability(index, "description", e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vision Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">Vision Section</h3>
              <div className="space-y-2">
                <Label>Vision Title</Label>
                <Input
                  value={editForm.vision_title}
                  onChange={(e) => setEditForm({ ...editForm, vision_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Vision Text</Label>
                <Textarea
                  value={editForm.vision_text}
                  onChange={(e) => setEditForm({ ...editForm, vision_text: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleSave} disabled={updatePage.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
