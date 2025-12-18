import { Bot, GraduationCap, Factory, Wrench, Shield } from "lucide-react";
import { DynamicFeaturePage } from "@/components/features/DynamicFeaturePage";

const defaultCapabilities = [
  {
    icon: GraduationCap,
    title: "Educational Robotics",
    description: "STEM learning kits and programmable robots designed to inspire the next generation of engineers and innovators."
  },
  {
    icon: Factory,
    title: "Industrial Automation",
    description: "High-precision robotic systems for manufacturing, assembly, and quality control in industrial environments."
  },
  {
    icon: Wrench,
    title: "Research Platforms",
    description: "Advanced robotic platforms for academic research, prototyping, and experimental development."
  },
  {
    icon: Shield,
    title: "Environmental Robots",
    description: "Autonomous systems designed for environmental monitoring, cleanup, and conservation efforts."
  }
];

const defaultStats = [
  { value: "5+", label: "Robot Types" },
  { value: "99%", label: "Precision Rate" },
  { value: "24/7", label: "Autonomous Operation" },
  { value: "100+", label: "Deployments Planned" }
];

export default function RoboticsPage() {
  return (
    <DynamicFeaturePage
      pageKey="feature-robotics"
      heroIcon={Bot}
      accentColor="accent"
      defaultTitle="Advanced Robotics"
      defaultSubtitle="Professional-grade robotics platforms that push the boundaries of automation, designed for education, research, industry, and environmental protection."
      defaultCapabilities={defaultCapabilities}
      defaultStats={defaultStats}
      defaultVisionTitle="Built for Excellence"
      defaultVisionText="Every ASIREX robot is engineered with precision, reliability, and innovation at its core. Our platforms combine cutting-edge AI with robust mechanical design to deliver exceptional performance in any environment. Our flagship Aqua River Purifier project combines AI, autonomous navigation, and environmental science to create river-cleaning robots."
      ctaTitle="The Future of Robotics is Here"
      ctaText="Partner with ASIREX to bring world-class robotics solutions to your organization."
      primaryLink="/projects"
      primaryLinkText="See Our Robots in Action"
    />
  );
}
