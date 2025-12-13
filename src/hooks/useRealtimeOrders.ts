import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OrderPayload {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  order_status: string;
  created_at: string;
  items: any;
}

export function useRealtimeOrders(enabled: boolean = true) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    console.log("[Realtime] Setting up order subscription...");

    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("[Realtime] New order received:", payload);
          const newOrder = payload.new as OrderPayload;

          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(console.error);
          }

          // Show toast notification
          toast.success(
            `New Order Received!`,
            {
              description: `${newOrder.customer_name} placed an order for ₹${newOrder.total_amount?.toLocaleString()}`,
              duration: 10000,
              action: {
                label: "View",
                onClick: () => {
                  window.location.href = "/admin/orders";
                },
              },
            }
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("[Realtime] Order updated:", payload);
          const updatedOrder = payload.new as OrderPayload;
          const oldOrder = payload.old as Partial<OrderPayload>;

          // Notify on status changes
          if (oldOrder.order_status !== updatedOrder.order_status) {
            toast.info(
              `Order Status Updated`,
              {
                description: `Order for ${updatedOrder.customer_name} is now ${updatedOrder.order_status}`,
                duration: 5000,
              }
            );
          }
        }
      )
      .subscribe((status) => {
        console.log("[Realtime] Subscription status:", status);
      });

    // Create audio element for notification sound
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2telekg1NlqEsN/qr2YjF0ydoMrYu4lpMSU/br3g7bJpHyAfgaS14NWvfGVTTFmJttfeyI11Qz1LbJOt0d3PkHdOQkZdfKXFz8yVfVpNTVh6o8TU1pSBY1BQW3+kxdXWkn5gUVBbfqPE1daRfWBRUFt+o8TV1pF9YFFQWn2ixNTVkXxfUVBafaLE1NWRfF9RUFp9osTU1ZF8X1FQWn2ixNTVkXxfUQ==");

    return () => {
      console.log("[Realtime] Cleaning up order subscription");
      supabase.removeChannel(channel);
    };
  }, [enabled]);
}
