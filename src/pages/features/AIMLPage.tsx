import { Brain, Cpu, Sparkles, Target, TrendingUp } from "lucide-react";
import { DynamicFeaturePage } from "@/components/features/DynamicFeaturePage";

const defaultCapabilities = [
  {
    icon: Cpu,
    title: "Neural Processing Units",
    description: "Custom-designed AI chips that deliver unprecedented processing power for edge computing and real-time inference."
  },
  {
    icon: Sparkles,
    title: "Intelligent Software Frameworks",
    description: "Comprehensive AI development kits and libraries that accelerate your machine learning projects."
  },
  {
    icon: Target,
    title: "Computer Vision",
    description: "Advanced image recognition and object detection systems for industrial automation and smart surveillance."
  },
  {
    icon: TrendingUp,
    title: "Predictive Analytics",
    description: "AI-powered forecasting and decision support systems for business intelligence and optimization."
  }
];

const defaultStats = [
  { value: "10x", label: "Faster Processing" },
  { value: "99.9%", label: "Accuracy Rate" },
  { value: "50+", label: "AI Models" },
  { value: "24/7", label: "Real-time Analysis" }
];

export default function AIMLPage() {
  return (
    <DynamicFeaturePage
      pageKey="feature-ai-ml"
      heroIcon={Brain}
      accentColor="primary"
      defaultTitle="AI & Machine Learning"
      defaultSubtitle="Pioneering the future of artificial intelligence with cutting-edge neural processors, intelligent software frameworks, and transformative AI solutions that redefine what's possible."
      defaultCapabilities={defaultCapabilities}
      defaultStats={defaultStats}
      defaultVisionTitle="The Future is Intelligent"
      defaultVisionText="At ASIREX, we believe AI is not just a technology—it's the key to solving humanity's greatest challenges. From environmental protection to healthcare, from education to industrial automation, our AI solutions are designed to make a real difference in people's lives. Join us in building a smarter, more efficient, and sustainable future."
      ctaTitle="Ready to Transform Your Business with AI?"
      ctaText="Partner with ASIREX to integrate cutting-edge AI solutions into your operations."
      primaryLink="/projects"
      primaryLinkText="Explore Our Projects"
    />
  );
}
