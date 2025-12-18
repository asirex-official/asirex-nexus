import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Rocket, Zap, Globe, Droplets, Brain, Sun, ArrowRight, Target, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSiteStats } from "@/hooks/useSiteData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, LucideIcon> = {
  Droplets,
  Brain,
  Sun,
  Rocket,
  Globe,
};

export default function ActiveProjects() {
  const { data: siteStats, isLoading: statsLoading } = useSiteStats();
  const { data: dbProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects-for-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .neq("status", "Completed")
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

  const projectCount = siteStats?.find(s => s.key === "active_projects")?.value || dbProjects?.length || 5;

  const defaultProjects = [
    {
      icon: "Droplets",
      title: "Aqua River Purifier",
      status: "In Development",
      progress: 6,
      description: "AI-powered autonomous water purification system designed to clean India's rivers.",
      impact: "Clean water for 1 billion+ Indians",
      link: "/projects/aqua-river-purifier"
    },
    {
      icon: "Brain",
      title: "Neural Core AI",
      status: "Research Phase",
      progress: 15,
      description: "Next-generation AI processing units for edge computing.",
      impact: "Democratizing AI access"
    },
    {
      icon: "Sun",
      title: "Clean Energy Grid",
      status: "Planning",
      progress: 8,
      description: "Smart solar solutions with AI-optimized energy distribution.",
      impact: "Sustainable power for all"
    },
    {
      icon: "Rocket",
      title: "Smart Agriculture",
      status: "Concept",
      progress: 3,
      description: "IoT and AI-driven farming solutions for Indian farmers.",
      impact: "Transforming Indian agriculture"
    },
    {
      icon: "Globe",
      title: "Digital India Hub",
      status: "Planning",
      progress: 5,
      description: "Technology access centers across rural India.",
      impact: "Connecting 500+ villages"
    }
  ];

  // Use database projects if available, otherwise use defaults
  const projects = dbProjects?.map(p => ({
    icon: "Rocket",
    title: p.title,
    status: p.status || "In Development",
    progress: p.progress_percentage || 0,
    description: p.description || "",
    impact: p.impact || "",
    link: `/projects/${p.id}`
  })) || defaultProjects;

  const isLoading = statsLoading || projectsLoading;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/10 via-background to-background" />
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        
        <div className="container mx-auto px-4 relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary/20 mb-8"
            >
              <Rocket className="w-12 h-12 text-secondary" />
            </motion.div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              {isLoading ? (
                <Skeleton className="h-16 w-48 mx-auto" />
              ) : (
                <>
                  <span className="gradient-text">{projectCount}+</span> Active Projects
                </>
              )}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Building India's Tomorrow, Today
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each project is a bold step towards transforming India into a global technology leader. 
              We're not just building products—we're engineering the future.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision Banner */}
      <section className="py-12 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Target className="w-6 h-6 text-primary" />
            <span className="font-display text-lg font-semibold">Our Mission</span>
          </div>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            To develop game-changing technologies that solve India's biggest challenges—from clean water 
            and sustainable energy to accessible AI and smart agriculture.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Innovation Pipeline</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From concept to reality, these are the projects that will define India's technological future.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-40 w-full rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {projects.map((project, index) => {
                const IconComponent = iconMap[project.icon] || Rocket;
                return (
                  <motion.div
                    key={project.title}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 md:p-8 rounded-2xl bg-card/40 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                          <IconComponent className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="font-display text-xl font-semibold">{project.title}</h3>
                          <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent">
                            {project.status}
                          </span>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{project.description}</p>
                        
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-muted-foreground">{project.impact}</span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{project.progress}%</span>
                            </div>
                            
                            {project.link && (
                              <Link to={project.link}>
                                <Button variant="outline" size="sm" className="gap-2">
                                  Learn More
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-b from-background via-card/30 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Join Us in Building the Future
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              These projects need dreamers, builders, and believers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/support-us">
                <Button size="lg" className="gap-2">
                  <Rocket className="w-5 h-5" />
                  Support Our Mission
                </Button>
              </Link>
              <Link to="/projects">
                <Button variant="outline" size="lg" className="gap-2">
                  View All Projects
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
