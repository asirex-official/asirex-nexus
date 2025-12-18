import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Rocket, Package, Globe, Heart, Edit2, Plus, Trash2 } from "lucide-react";
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
import { useSiteStats, useUpdateSiteStat } from "@/hooks/useSiteData";
import { useToast } from "@/hooks/use-toast";

const statsPageKeys = ["active-projects", "products-shipped", "countries-impacted", "customer-satisfaction"];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Package,
  Globe,
  Heart,
};

interface PageStat {
  value: string;
  label: string;
}

interface StatsContent {
  stats?: PageStat[];
  description?: string;
  mission?: string;
}

export default function StatsManager() {
  const { data: pages, isLoading: pagesLoading } = useAllPageContent();
  const { data: siteStats, isLoading: statsLoading } = useSiteStats();
  const updatePage = useUpdatePageContent();
  const updateStat = useUpdateSiteStat();
  const { toast } = useToast();
  
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    page_title: "",
    page_subtitle: "",
    hero_icon: "",
    description: "",
    mission: "",
    stats: [] as PageStat[],
    is_active: true,
  });

  const statsPages = pages?.filter(p => statsPageKeys.includes(p.page_key)) || [];

  const handleEditPage = (pageKey: string) => {
    const page = statsPages.find(p => p.page_key === pageKey);
    if (!page) return;
    
    const content = page.content as StatsContent;
    setEditForm({
      page_title: page.page_title,
      page_subtitle: page.page_subtitle || "",
      hero_icon: page.hero_icon || "",
      description: content.description || "",
      mission: content.mission || "",
      stats: content.stats || [],
      is_active: page.is_active,
    });
    setSelectedPage(pageKey);
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    const page = statsPages.find(p => p.page_key === selectedPage);
    if (!page) return;

    try {
      await updatePage.mutateAsync({
        id: page.id,
        page_title: editForm.page_title,
        page_subtitle: editForm.page_subtitle,
        hero_icon: editForm.hero_icon,
        content: {
          stats: editForm.stats,
          description: editForm.description,
          mission: editForm.mission,
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

  const updatePageStat = (index: number, field: keyof PageStat, value: string) => {
    const newStats = [...editForm.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    setEditForm({ ...editForm, stats: newStats });
  };

  // Handle homepage stats
  const [editingStat, setEditingStat] = useState<{ id: string; value: number } | null>(null);

  const handleUpdateHomeStat = async () => {
    if (!editingStat) return;
    try {
      await updateStat.mutateAsync({ id: editingStat.id, value: editingStat.value });
      toast({ title: "Stat updated successfully" });
      setEditingStat(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update stat", variant: "destructive" });
    }
  };

  const isLoading = pagesLoading || statsLoading;

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
        <h1 className="font-display text-3xl font-bold mb-2">Stats & Pages</h1>
        <p className="text-muted-foreground">Manage homepage stats and stats detail pages</p>
      </div>

      {/* Homepage Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold">Homepage Stats</h2>
          <Button variant="outline" size="sm" onClick={() => setStatsDialogOpen(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit All
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {siteStats?.map((stat) => (
            <div key={stat.id} className="p-4 rounded-lg bg-card/50 border border-border/50">
              <div className="text-2xl font-bold gradient-text mb-1">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats Pages */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4">Stats Detail Pages</h2>
        <div className="grid gap-6">
          {statsPages.map((page, index) => {
            const IconComponent = iconMap[page.hero_icon || "Rocket"] || Rocket;
            const content = page.content as StatsContent;
            
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
      </div>

      {/* Edit Page Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Stats Page</DialogTitle>
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
                    placeholder="Rocket, Package, Globe, Heart"
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
              <div className="space-y-2">
                <Label>Description / Mission</Label>
                <Textarea
                  value={editForm.description || editForm.mission}
                  onChange={(e) => setEditForm({ 
                    ...editForm, 
                    description: e.target.value,
                    mission: e.target.value 
                  })}
                  rows={3}
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

            {/* Page Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Page Stats</h3>
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
                        onChange={(e) => updatePageStat(index, "value", e.target.value)}
                        placeholder="10,000+"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Label</Label>
                      <Input
                        value={stat.label}
                        onChange={(e) => updatePageStat(index, "label", e.target.value)}
                        placeholder="Products Shipped"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeStat(index)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
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

      {/* Edit Homepage Stats Dialog */}
      <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Homepage Stats</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {siteStats?.map((stat) => (
              <div key={stat.id} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label>{stat.label}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      defaultValue={stat.value}
                      onChange={(e) => setEditingStat({ id: stat.id, value: parseInt(e.target.value) || 0 })}
                    />
                    <span className="flex items-center text-muted-foreground">{stat.suffix}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setStatsDialogOpen(false)}>
              Close
            </Button>
            {editingStat && (
              <Button variant="hero" onClick={handleUpdateHomeStat} disabled={updateStat.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
