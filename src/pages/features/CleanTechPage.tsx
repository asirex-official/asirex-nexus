import { Leaf, Sun, Droplets, Wind, Recycle } from "lucide-react";
import { DynamicFeaturePage } from "@/components/features/DynamicFeaturePage";

const defaultCapabilities = [
  {
    icon: Sun,
    title: "Solar Energy Systems",
    description: "AI-optimized solar tracking and management systems that maximize energy capture and efficiency."
  },
  {
    icon: Droplets,
    title: "Water Purification",
    description: "Autonomous water treatment robots that clean rivers, lakes, and industrial wastewater."
  },
  {
    icon: Wind,
    title: "Smart Grid Integration",
    description: "Intelligent power management systems for renewable energy distribution and storage."
  },
  {
    icon: Recycle,
    title: "Waste Management",
    description: "AI-powered waste sorting and recycling systems for efficient resource recovery."
  }
];

const defaultStats = [
  { value: "100%", label: "Renewable Focus" },
  { value: "50+", label: "Green Solutions" },
  { value: "5+", label: "Rivers Targeted" },
  { value: "Zero", label: "Emissions Goal" }
];

export default function CleanTechPage() {
  return (
    <DynamicFeaturePage
      pageKey="feature-cleantech"
      heroIcon={Leaf}
      accentColor="primary"
      defaultTitle="Clean Technology"
      defaultSubtitle="Sustainable energy solutions and eco-friendly technologies for a greener, cleaner future. We're committed to protecting our planet while driving innovation."
      defaultCapabilities={defaultCapabilities}
      defaultStats={defaultStats}
      defaultVisionTitle="Making a Real Impact"
      defaultVisionText="India faces unprecedented environmental challenges—polluted rivers, air quality crises, and mounting waste. At ASIREX, we don't just talk about solutions; we build them. Our clean technology division combines AI, robotics, and renewable energy to create tangible impact for our planet. Our flagship Aqua River Purifier project aims to restore India's major rivers to their pristine state."
      ctaTitle="Join the Green Revolution"
      ctaText="Together, we can build a sustainable future for India and the world."
      primaryLink="/projects"
      primaryLinkText="View Green Projects"
    />
  );
}
