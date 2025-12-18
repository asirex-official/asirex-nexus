import { Layout } from "@/components/layout/Layout";
import { motion } from "framer-motion";
import { ArrowRight, Zap, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePageContent } from "@/hooks/usePageContent";
import { Skeleton } from "@/components/ui/skeleton";

interface Capability {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface Stat {
  value: string;
  label: string;
}

interface DynamicFeaturePageProps {
  pageKey: string;
  heroIcon: LucideIcon;
  accentColor?: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultCapabilities: Capability[];
  defaultStats: Stat[];
  defaultVisionTitle?: string;
  defaultVisionText?: string;
  ctaTitle?: string;
  ctaText?: string;
  primaryLink?: string;
  primaryLinkText?: string;
}

export function DynamicFeaturePage({
  pageKey,
  heroIcon: HeroIcon,
  accentColor = "primary",
  defaultTitle,
  defaultSubtitle,
  defaultCapabilities,
  defaultStats,
  defaultVisionTitle = "The Future is Here",
  defaultVisionText,
  ctaTitle = "Ready to Learn More?",
  ctaText = "Partner with ASIREX to integrate cutting-edge solutions into your operations.",
  primaryLink = "/projects",
  primaryLinkText = "Explore Our Projects",
}: DynamicFeaturePageProps) {
  const { data: pageData, isLoading } = usePageContent(pageKey);
  
  // pageData can be PageContent | null when pageKey is provided
  const pageContent = pageData && !Array.isArray(pageData) ? pageData : null;

  // Extract content from database or use defaults
  const content = pageContent?.content as Record<string, unknown> | undefined;
  const title = pageContent?.page_title || defaultTitle;
  const subtitle = pageContent?.page_subtitle || defaultSubtitle;
  
  // Parse database capabilities or use defaults
  const capabilities: Capability[] = content?.capabilities 
    ? (content.capabilities as Array<{ title: string; description: string }>).map((cap, i) => ({
        icon: defaultCapabilities[i]?.icon || Zap,
        title: cap.title,
        description: cap.description,
      }))
    : defaultCapabilities;

  // Parse database stats or use defaults
  const stats: Stat[] = content?.stats 
    ? (content.stats as Array<{ value: string; label: string }>)
    : defaultStats;

  const visionTitle = (content?.vision_title as string) || (content?.visionTitle as string) || defaultVisionTitle;
  const visionText = (content?.vision_text as string) || (content?.visionText as string) || defaultVisionText;

  if (isLoading) {
    return (
      <Layout>
        <section className="relative min-h-[70vh] flex items-center justify-center">
          <div className="container mx-auto px-4 lg:px-8 py-20">
            <div className="text-center max-w-4xl mx-auto space-y-6">
              <Skeleton className="w-24 h-24 mx-auto rounded-3xl" />
              <Skeleton className="h-16 w-3/4 mx-auto" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b from-${accentColor}/10 via-background to-background`} />
        <div className="absolute inset-0 dot-grid opacity-20" />
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-${accentColor} to-accent p-1`}
            >
              <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                <HeroIcon className={`w-12 h-12 text-${accentColor}`} />
              </div>
            </motion.div>
            
            <h1 className="font-display text-5xl lg:text-7xl font-black mb-6">
              {title.includes(" ") ? (
                <>
                  {title.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="gradient-text">{title.split(" ").slice(-1)}</span>
                </>
              ) : (
                <span className="gradient-text">{title}</span>
              )}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {subtitle}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button asChild variant="hero" size="lg">
                <Link to={primaryLink}>
                  {primaryLinkText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/support-us">Support Our Vision</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      {stats.length > 0 && (
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-4xl lg:text-5xl font-black gradient-text mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Capabilities Section */}
      {capabilities.length > 0 && (
        <section className="py-28">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl lg:text-5xl font-black mb-4">
                Our <span className="gradient-text">Capabilities</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Innovative solutions designed for real-world impact.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {capabilities.map((cap, index) => {
                const CapIcon = cap.icon;
                return (
                  <motion.div
                    key={cap.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`glass-card p-8 rounded-3xl group hover:border-${accentColor}/50 transition-colors`}
                  >
                    <div className="flex items-start gap-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-${accentColor} to-accent p-0.5 flex-shrink-0`}>
                        <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                          <CapIcon className={`w-6 h-6 text-${accentColor}`} />
                        </div>
                      </div>
                      <div>
                        <h3 className={`font-display text-xl font-bold mb-2 group-hover:text-${accentColor} transition-colors`}>
                          {cap.title}
                        </h3>
                        <p className="text-muted-foreground">{cap.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Vision Section */}
      {visionText && (
        <section className="py-28 bg-card/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh-gradient opacity-20" />
          <div className="container mx-auto px-4 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <Zap className="w-16 h-16 mx-auto mb-8 text-accent" />
              <h2 className="font-display text-4xl lg:text-5xl font-black mb-6">
                {visionTitle.includes(" ") ? (
                  <>
                    {visionTitle.split(" ").slice(0, -1).join(" ")}{" "}
                    <span className="gradient-text">{visionTitle.split(" ").slice(-1)}</span>
                  </>
                ) : (
                  <span className="gradient-text">{visionTitle}</span>
                )}
              </h2>
              <p className="text-xl text-muted-foreground">
                {visionText}
              </p>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-3xl text-center"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-black mb-4">
              {ctaTitle}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              {ctaText}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/about">Learn More About Us</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/support-us">Support Our Mission</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
