import { Globe, Truck, Headphones, Clock, Shield } from "lucide-react";
import { DynamicFeaturePage } from "@/components/features/DynamicFeaturePage";

const defaultCapabilities = [
  {
    icon: Truck,
    title: "Nationwide Shipping",
    description: "Fast and reliable delivery across all states and union territories of India."
  },
  {
    icon: Headphones,
    title: "Local Support Centers",
    description: "Dedicated customer support teams in major cities for quick assistance."
  },
  {
    icon: Clock,
    title: "Express Delivery",
    description: "Priority shipping options for urgent orders with real-time tracking."
  },
  {
    icon: Shield,
    title: "Secure Packaging",
    description: "Premium packaging to ensure your products arrive in perfect condition."
  }
];

const defaultStats = [
  { value: "28+", label: "States Covered" },
  { value: "500+", label: "Cities Reached" },
  { value: "99%", label: "On-time Delivery" },
  { value: "24/7", label: "Tracking Available" }
];

export default function GlobalDeliveryPage() {
  return (
    <DynamicFeaturePage
      pageKey="feature-global-delivery"
      heroIcon={Globe}
      accentColor="secondary"
      defaultTitle="Global Delivery"
      defaultSubtitle="Worldwide shipping with local support centers across India. We bring cutting-edge technology to your doorstep, no matter where you are."
      defaultCapabilities={defaultCapabilities}
      defaultStats={defaultStats}
      defaultVisionTitle="Our Promise"
      defaultVisionText="We understand that receiving your order is just the beginning. Our commitment extends beyond delivery—we provide ongoing support, warranty services, and expert guidance to ensure you get the most out of your ASIREX products. From Delhi NCR to Mumbai, Bangalore to Chennai, Hyderabad to Kolkata—our network of support centers ensures you're never far from expert assistance."
      ctaTitle="Experience Seamless Delivery"
      ctaText="Shop with confidence knowing your order is in safe hands."
      primaryLink="/shop"
      primaryLinkText="Browse Products"
    />
  );
}
