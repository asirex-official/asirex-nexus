import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, PackageX, AlertTriangle, RotateCcw, Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostDeliveryActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  userId: string;
  orderPaymentMethod?: string;
  onActionSelected: (action: string) => void;
}

const ACTIONS = [
  {
    id: "review",
    label: "Rate & Review",
    description: "Share your experience with this order",
    icon: Star,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10 hover:bg-yellow-500/20",
  },
  {
    id: "not_received",
    label: "Order Not Received",
    description: "I haven't received my order yet",
    icon: PackageX,
    color: "text-red-500",
    bgColor: "bg-red-500/10 hover:bg-red-500/20",
  },
  {
    id: "damaged",
    label: "Product Broken/Damaged",
    description: "Report damaged or defective items",
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
  },
  {
    id: "return",
    label: "Return/Replace",
    description: "Request a return or replacement",
    icon: RotateCcw,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
  },
  {
    id: "warranty",
    label: "Warranty Claim",
    description: "File a warranty claim for this product",
    icon: Shield,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10 hover:bg-purple-500/20",
  },
];

export function PostDeliveryActionModal({
  open,
  onOpenChange,
  orderId,
  userId,
  onActionSelected,
}: PostDeliveryActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedAction) return;

    setIsLoading(true);
    try {
      // Record the action
      const { error } = await supabase.from("order_post_delivery_actions").insert({
        order_id: orderId,
        user_id: userId,
        action_type: selectedAction,
      });

      if (error) throw error;

      onActionSelected(selectedAction);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error recording action:", error);
      toast.error("Failed to process your selection");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">How was your order?</DialogTitle>
          <DialogDescription>
            Please select an option to proceed. This helps us serve you better.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {ACTIONS.map((action, index) => {
            const Icon = action.icon;
            const isSelected = selectedAction === action.id;

            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedAction(action.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground/30"
                } ${action.bgColor}`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${action.bgColor}`}
                >
                  <Icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">{action.label}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 ${
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={!selectedAction || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
