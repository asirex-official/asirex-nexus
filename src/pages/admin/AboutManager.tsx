import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Heart, Target, Users, Briefcase, Plus, Trash2, Edit2 } from "lucide-react";
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
import { useAllPageContent, useUpdatePageContent, useCreatePageContent } from "@/hooks/usePageContent";
import { useToast } from "@/hooks/use-toast";

interface CoreValue {
  icon: string;
  title: string;
  description: string;
  link: string;
}

interface WhyJoinReason {
  icon: string;
  text: string;
}

export default function AboutManager() {
  const { data: pages, isLoading } = useAllPageContent();
  const updatePage = useUpdatePageContent();
  const createPage = useCreatePageContent();
  const { toast } = useToast();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<"core-values" | "why-join" | null>(null);
  
  // Core Values form
  const [coreValuesForm, setCoreValuesForm] = useState({
    page_title: "Our Core Values",
    page_subtitle: "The principles that guide everything we do",
    values: [] as CoreValue[],
    is_active: true,
  });
  
  // Why Join form
  const [whyJoinForm, setWhyJoinForm] = useState({
    page_title: "Why Join ASIREX",
    page_subtitle: "Be part of something extraordinary",
    reasons: [] as WhyJoinReason[],
    is_active: true,
  });

  const coreValuesPage = pages?.find(p => p.page_key === "core-values");
  const whyJoinPage = pages?.find(p => p.page_key === "why-join");

  const handleEditCoreValues = () => {
    if (coreValuesPage) {
      const content = coreValuesPage.content as { values?: CoreValue[] };
      setCoreValuesForm({
        page_title: coreValuesPage.page_title,
        page_subtitle: coreValuesPage.page_subtitle || "",
        values: content.values || [],
        is_active: coreValuesPage.is_active,
      });
    }
    setEditingSection("core-values");
    setEditDialogOpen(true);
  };

  const handleEditWhyJoin = () => {
    if (whyJoinPage) {
      const content = whyJoinPage.content as { reasons?: WhyJoinReason[] };
      setWhyJoinForm({
        page_title: whyJoinPage.page_title,
        page_subtitle: whyJoinPage.page_subtitle || "",
        reasons: content.reasons || [],
        is_active: whyJoinPage.is_active,
      });
    }
    setEditingSection("why-join");
    setEditDialogOpen(true);
  };

  const handleSaveCoreValues = async () => {
    try {
      const contentData = { values: coreValuesForm.values.map(v => ({ ...v })) };
      if (coreValuesPage) {
        await updatePage.mutateAsync({
          id: coreValuesPage.id,
          page_title: coreValuesForm.page_title,
          page_subtitle: coreValuesForm.page_subtitle,
          content: contentData,
          is_active: coreValuesForm.is_active,
        });
      } else {
        await createPage.mutateAsync({
          page_key: "core-values",
          page_title: coreValuesForm.page_title,
          page_subtitle: coreValuesForm.page_subtitle,
          hero_icon: "Target",
          content: contentData,
        });
      }
      toast({ title: "Core values updated successfully" });
      setEditDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const handleSaveWhyJoin = async () => {
    try {
      const contentData = { reasons: whyJoinForm.reasons.map(r => ({ ...r })) };
      if (whyJoinPage) {
        await updatePage.mutateAsync({
          id: whyJoinPage.id,
          page_title: whyJoinForm.page_title,
          page_subtitle: whyJoinForm.page_subtitle,
          content: contentData,
          is_active: whyJoinForm.is_active,
        });
      } else {
        await createPage.mutateAsync({
          page_key: "why-join",
          page_title: whyJoinForm.page_title,
          page_subtitle: whyJoinForm.page_subtitle,
          hero_icon: "Users",
          content: contentData,
        });
      }
      toast({ title: "Why Join section updated successfully" });
      setEditDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  // Core Values CRUD
  const addCoreValue = () => {
    setCoreValuesForm({
      ...coreValuesForm,
      values: [...coreValuesForm.values, { icon: "Target", title: "", description: "", link: "" }],
    });
  };

  const removeCoreValue = (index: number) => {
    setCoreValuesForm({
      ...coreValuesForm,
      values: coreValuesForm.values.filter((_, i) => i !== index),
    });
  };

  const updateCoreValue = (index: number, field: keyof CoreValue, value: string) => {
    const newValues = [...coreValuesForm.values];
    newValues[index] = { ...newValues[index], [field]: value };
    setCoreValuesForm({ ...coreValuesForm, values: newValues });
  };

  // Why Join CRUD
  const addReason = () => {
    setWhyJoinForm({
      ...whyJoinForm,
      reasons: [...whyJoinForm.reasons, { icon: "Rocket", text: "" }],
    });
  };

  const removeReason = (index: number) => {
    setWhyJoinForm({
      ...whyJoinForm,
      reasons: whyJoinForm.reasons.filter((_, i) => i !== index),
    });
  };

  const updateReason = (index: number, field: keyof WhyJoinReason, value: string) => {
    const newReasons = [...whyJoinForm.reasons];
    newReasons[index] = { ...newReasons[index], [field]: value };
    setWhyJoinForm({ ...whyJoinForm, reasons: newReasons });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const coreValuesContent = coreValuesPage?.content as { values?: CoreValue[] } | undefined;
  const whyJoinContent = whyJoinPage?.content as { reasons?: WhyJoinReason[] } | undefined;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">About Page</h1>
        <p className="text-muted-foreground">Manage core values, why join section, and other about page content</p>
      </div>

      {/* Core Values Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold mb-1">
                {coreValuesPage?.page_title || "Core Values"}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {coreValuesPage?.page_subtitle || "Define the principles that guide your company"}
              </p>
              <div className="text-xs text-muted-foreground">
                {coreValuesContent?.values?.length || 0} values defined
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleEditCoreValues}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
        
        {/* Preview values */}
        {coreValuesContent?.values && coreValuesContent.values.length > 0 && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {coreValuesContent.values.map((value, i) => (
              <div key={i} className="p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="font-medium text-sm">{value.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{value.description}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Why Join Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold mb-1">
                {whyJoinPage?.page_title || "Why Join Us"}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                {whyJoinPage?.page_subtitle || "Reasons to join your team"}
              </p>
              <div className="text-xs text-muted-foreground">
                {whyJoinContent?.reasons?.length || 0} reasons defined
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleEditWhyJoin}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
        
        {/* Preview reasons */}
        {whyJoinContent?.reasons && whyJoinContent.reasons.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {whyJoinContent.reasons.map((reason, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-card/50 border border-border/50 text-xs">
                {reason.text}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Team & Jobs Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold mb-1">Team & Job Postings</h3>
            <p className="text-sm text-muted-foreground">
              Team members are managed in the <strong>Team Members</strong> section. 
              Job postings are managed in the <strong>Applications Manager</strong>.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection === "core-values" ? "Edit Core Values" : "Edit Why Join Section"}
            </DialogTitle>
          </DialogHeader>

          {editingSection === "core-values" && (
            <div className="space-y-6 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={coreValuesForm.page_title}
                    onChange={(e) => setCoreValuesForm({ ...coreValuesForm, page_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={coreValuesForm.page_subtitle}
                    onChange={(e) => setCoreValuesForm({ ...coreValuesForm, page_subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Values</h3>
                  <Button variant="outline" size="sm" onClick={addCoreValue}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Value
                  </Button>
                </div>

                {coreValuesForm.values.map((value, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Value {index + 1}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeCoreValue(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <Input
                          value={value.icon}
                          onChange={(e) => updateCoreValue(index, "icon", e.target.value)}
                          placeholder="Target, Heart, Eye, TrendingUp"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={value.title}
                          onChange={(e) => updateCoreValue(index, "title", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={value.description}
                        onChange={(e) => updateCoreValue(index, "description", e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Link (optional)</Label>
                      <Input
                        value={value.link}
                        onChange={(e) => updateCoreValue(index, "link", e.target.value)}
                        placeholder="/values/innovation-first"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleSaveCoreValues} disabled={updatePage.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {editingSection === "why-join" && (
            <div className="space-y-6 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Title</Label>
                  <Input
                    value={whyJoinForm.page_title}
                    onChange={(e) => setWhyJoinForm({ ...whyJoinForm, page_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={whyJoinForm.page_subtitle}
                    onChange={(e) => setWhyJoinForm({ ...whyJoinForm, page_subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Reasons</h3>
                  <Button variant="outline" size="sm" onClick={addReason}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reason
                  </Button>
                </div>

                {whyJoinForm.reasons.map((reason, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="w-24 space-y-2">
                      <Label>Icon</Label>
                      <Input
                        value={reason.icon}
                        onChange={(e) => updateReason(index, "icon", e.target.value)}
                        placeholder="Rocket"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Text</Label>
                      <Input
                        value={reason.text}
                        onChange={(e) => updateReason(index, "text", e.target.value)}
                        placeholder="Work on cutting-edge technology"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeReason(index)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleSaveWhyJoin} disabled={updatePage.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
