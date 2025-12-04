import { useState } from "react";
import { motion } from "framer-motion";
import { Save, TrendingUp, Package, FolderKanban, Mail, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSiteStats, useUpdateSiteStat } from "@/hooks/useSiteData";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: stats, isLoading } = useSiteStats();
  const updateStat = useUpdateSiteStat();
  const { toast } = useToast();
  const [editedStats, setEditedStats] = useState<Record<string, number>>({});

  const handleStatChange = (id: string, value: string) => {
    setEditedStats(prev => ({
      ...prev,
      [id]: parseInt(value) || 0
    }));
  };

  const handleSaveStat = async (id: string) => {
    const value = editedStats[id];
    if (value === undefined) return;

    try {
      await updateStat.mutateAsync({ id, value });
      setEditedStats(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast({
        title: "Stat updated",
        description: "The stat has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stat.",
        variant: "destructive",
      });
    }
  };

  const quickStats = [
    { label: "Total Products", value: "12", icon: Package, color: "text-primary" },
    { label: "Active Projects", value: "4", icon: FolderKanban, color: "text-secondary" },
    { label: "New Messages", value: "8", icon: Mail, color: "text-accent" },
    { label: "Pending Orders", value: "3", icon: ShoppingCart, color: "text-destructive" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your ASIREX admin panel. Manage your site content here.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <TrendingUp className="w-4 h-4 text-accent" />
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Site Stats Editor */}
      <div className="glass-card p-6">
        <h2 className="font-display text-xl font-semibold mb-6">
          Homepage Stats (Quick Stats Strip)
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Edit the counters displayed on the homepage. Changes are reflected immediately.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {stats?.map((stat) => (
              <div key={stat.id} className="space-y-2">
                <Label>{stat.label}</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={editedStats[stat.id] ?? stat.value}
                    onChange={(e) => handleStatChange(stat.id, e.target.value)}
                    className="flex-1"
                  />
                  <span className="flex items-center px-3 bg-muted rounded-lg text-muted-foreground">
                    {stat.suffix}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleSaveStat(stat.id)}
                    disabled={editedStats[stat.id] === undefined}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
