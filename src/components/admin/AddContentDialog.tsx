import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Package, FolderKanban, Calendar, Briefcase, Upload, DollarSign, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ContentType = "product" | "project" | "event" | "job";

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ContentType;
  onAdd: (data: Record<string, string>) => void;
}

const contentConfig = {
  product: {
    title: "Add New Product",
    icon: Package,
    color: "text-blue-500",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
  },
  project: {
    title: "Add New Project",
    icon: FolderKanban,
    color: "text-purple-500",
    buttonColor: "bg-purple-500 hover:bg-purple-600",
  },
  event: {
    title: "Add New Event",
    icon: Calendar,
    color: "text-orange-500",
    buttonColor: "bg-orange-500 hover:bg-orange-600",
  },
  job: {
    title: "Add New Job Posting",
    icon: Briefcase,
    color: "text-green-500",
    buttonColor: "bg-green-500 hover:bg-green-600",
  },
};

const productCategories = ["Robotics", "AI/ML", "Electronics", "Clean Tech", "Accessories", "Gadgets"];
const projectStatuses = ["Planning", "In Development", "Testing", "Launched"];
const jobTypes = ["Full-time", "Part-time", "Internship", "Contract"];
const jobDepartments = ["Technology & Development", "Sales & Marketing", "Production", "HR", "Finance"];

export function AddContentDialog({ open, onOpenChange, contentType, onAdd }: AddContentDialogProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = contentConfig[contentType];
  const Icon = config.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      if (contentType === "product") {
        // Parse features into specs object
        const featuresArray = formData.features?.split('\n').filter(f => f.trim()) || [];
        const specs: Record<string, string> = {};
        featuresArray.forEach((feature, i) => {
          specs[`feature_${i + 1}`] = feature.trim();
        });

        const { error } = await supabase.from('products').insert({
          name: formData.name,
          price: parseFloat(formData.price || '0'),
          category: formData.category || 'General',
          description: formData.description,
          stock_status: formData.stock || 'in_stock',
          image_url: formData.imageUrl,
          badge: formData.badge === 'none' ? null : formData.badge,
          rating: parseFloat(formData.rating || '0'),
          is_featured: formData.is_featured === 'true',
          specs: specs,
        });
        if (error) throw error;
      } else if (contentType === "project") {
        const { error } = await supabase.from('projects').insert({
          title: formData.title,
          tagline: formData.tagline,
          description: formData.description,
          status: formData.status || 'In Development',
          progress_percentage: parseInt(formData.progress || '0'),
          launch_date: formData.launchDate,
        });
        if (error) throw error;
      } else if (contentType === "event") {
        const eventDate = formData.date && formData.time 
          ? `${formData.date}T${formData.time}:00`
          : formData.date 
          ? `${formData.date}T00:00:00`
          : new Date().toISOString();
        
        const { error } = await supabase.from('events').insert({
          name: formData.name,
          description: formData.description,
          event_date: eventDate,
          location: formData.location,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          ticket_price: formData.ticketPrice === 'Free' ? 0 : parseFloat(formData.ticketPrice?.replace(/[₹,]/g, '') || '0'),
        });
        if (error) throw error;
      } else if (contentType === "job") {
        const { error } = await supabase.from('job_postings').insert({
          title: formData.title,
          department: formData.department,
          description: formData.description,
          requirements: formData.requirements ? formData.requirements.split('\n') : [],
          salary_range: formData.salary,
          location: formData.location,
          employment_type: formData.type?.toLowerCase().replace(' ', '-') || 'full-time',
          posted_by: userData?.user?.id || null,
        });
        if (error) throw error;
      }

      onAdd(formData);
      
      const messages = {
        product: "Product added successfully!",
        project: "Project created successfully!",
        event: "Event added successfully!",
        job: "Job posting created successfully!",
      };
      
      toast.success(messages[contentType]);
      setFormData({});
      onOpenChange(false);
    } catch (error: any) {
      console.error(`Error adding ${contentType}:`, error);
      toast.error(error.message || `Failed to add ${contentType}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    switch (contentType) {
      case "product":
        return (
          <>
            <div className="space-y-2">
              <Label>Image URL *</Label>
              <Input
                placeholder="https://example.com/image.png or /src/assets/image.png"
                value={formData.imageUrl || ""}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
              {formData.imageUrl && (
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input
                placeholder="Enter product name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Price (₹) *
                </Label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Badge</Label>
                <Select value={formData.badge} onValueChange={(v) => setFormData({ ...formData, badge: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select badge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="NEW">NEW</SelectItem>
                    <SelectItem value="HOT">HOT</SelectItem>
                    <SelectItem value="SALE">SALE</SelectItem>
                    <SelectItem value="LIMITED STOCK">LIMITED STOCK</SelectItem>
                    <SelectItem value="BESTSELLER">BESTSELLER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rating (0-5)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="4.5"
                  value={formData.rating || ""}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                placeholder="Product description..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Features (one per line)</Label>
              <Textarea
                placeholder="5 hours battery life&#10;Invisible to naked eye&#10;Nano magnet technology"
                value={formData.features || ""}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Stock Status</Label>
              <Select value={formData.stock} onValueChange={(v) => setFormData({ ...formData, stock: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="limited">Limited Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured === "true"}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked ? "true" : "false" })}
                className="rounded"
              />
              <Label htmlFor="is_featured">Show on Homepage (Featured)</Label>
            </div>
          </>
        );

      case "project":
        return (
          <>
            <div className="space-y-2">
              <Label>Project Title *</Label>
              <Input
                placeholder="Enter project title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                placeholder="Short tagline for the project"
                value={formData.tagline || ""}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Detailed project description..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectStatuses.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Progress %</Label>
                <Input
                  type="number"
                  placeholder="0-100"
                  min="0"
                  max="100"
                  value={formData.progress || ""}
                  onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Launch Date</Label>
              <Input
                type="date"
                value={formData.launchDate || ""}
                onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
              />
            </div>
          </>
        );

      case "event":
        return (
          <>
            <div className="space-y-2">
              <Label>Event Name *</Label>
              <Input
                placeholder="Enter event name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Event description..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date *
                </Label>
                <Input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Time
                </Label>
                <Input
                  type="time"
                  value={formData.time || ""}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location
              </Label>
              <Input
                placeholder="Event location"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  placeholder="Max attendees"
                  value={formData.capacity || ""}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ticket Price</Label>
                <Input
                  placeholder="Free or ₹XXX"
                  value={formData.ticketPrice || ""}
                  onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                />
              </div>
            </div>
          </>
        );

      case "job":
        return (
          <>
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input
                placeholder="Enter job title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobDepartments.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Job Type *</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Job description and responsibilities..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Requirements</Label>
              <Textarea
                placeholder="Skills and qualifications required..."
                value={formData.requirements || ""}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Salary Range</Label>
                <Input
                  placeholder="₹XX,XXX - ₹XX,XXX"
                  value={formData.salary || ""}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location
                </Label>
                <Input
                  placeholder="Office location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) setFormData({});
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 text-xl ${config.color}`}>
            <Icon className="w-6 h-6" />
            {config.title}
          </DialogTitle>
          <DialogDescription>
            Fill in the details below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {renderForm()}

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className={config.buttonColor} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : `Add ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
