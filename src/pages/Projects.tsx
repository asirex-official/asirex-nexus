import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import aquaPurifier1 from "@/assets/aqua-purifier-1.png";
import aquaPurifier2 from "@/assets/aqua-purifier-2.png";
import { Calendar, ArrowRight, Bell, Clock, AlertTriangle, Lock, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { CyclingProjectImage } from "@/components/projects/CyclingProjectImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useSiteData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Helper to get stage status
const getStageStatus = (currentStage: string, stage: string) => {
  const stages = ['Planning', 'Prototype', 'Development', 'Testing', 'Production'];
  const currentIndex = stages.indexOf(currentStage);
  const stageIndex = stages.indexOf(stage);
  if (stageIndex < currentIndex) return 'completed';
  if (stageIndex === currentIndex) return 'active';
  return 'pending';
};

// Map status to stage
const mapStatusToStage = (status: string | null): string => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'Production';
    case 'prototype phase': return 'Prototype';
    case 'in development': return 'Development';
    case 'testing': return 'Testing';
    default: return 'Planning';
  }
};

// Completed Projects Data (static for now)
const completedProjects = [{
  id: 101,
  name: "ASIREX AI Assistant",
  tagline: "Internal AI-Powered Productivity Tool",
  category: "AI",
  icon: "🤖",
  description: "Internal AI-powered assistant for team productivity, document analysis, and automated workflows. Built with cutting-edge natural language processing.",
  completedDate: "March 2024",
  impact: "50% increase in team productivity",
  features: ["Natural Language Processing", "Document Analysis", "Workflow Automation", "Smart Scheduling"],
  techStack: ["Python", "TensorFlow", "FastAPI", "React"],
  highlights: [
    { title: "Documents Processed", value: "10,000+" },
    { title: "Tasks Automated", value: "500+" },
    { title: "Time Saved", value: "200+ hrs/month" }
  ]
}, {
  id: 102,
  name: "RoboCore Control Suite",
  tagline: "Modular Robotics Control System",
  category: "Robotics",
  icon: "⚙️",
  description: "Modular robotics control system for autonomous navigation, sensor fusion, and real-time decision making. Powers all ASIREX robotic systems.",
  completedDate: "January 2024",
  impact: "Powers 15+ robotic systems",
  features: ["Autonomous Navigation", "Sensor Fusion", "Real-time Control", "Modular Architecture"],
  techStack: ["C++", "ROS2", "Python", "CUDA"],
  highlights: [
    { title: "Response Time", value: "<10ms" },
    { title: "Sensor Support", value: "50+ types" },
    { title: "Accuracy", value: "99.7%" }
  ]
}, {
  id: 103,
  name: "EcoSense Monitor",
  tagline: "IoT Environmental Monitoring",
  category: "Environment",
  icon: "🌍",
  description: "IoT-based environmental monitoring system for air quality, temperature, and pollution tracking. Deployed across multiple cities for real-time environmental data.",
  completedDate: "November 2023",
  impact: "Monitoring 25+ locations",
  features: ["Air Quality Index", "Temperature Monitoring", "Pollution Alerts", "Data Analytics"],
  techStack: ["IoT Sensors", "AWS IoT", "Node.js", "React"],
  highlights: [
    { title: "Data Points/Day", value: "1M+" },
    { title: "Locations", value: "25+" },
    { title: "Uptime", value: "99.9%" }
  ]
}, {
  id: 104,
  name: "ASIREX Cloud Platform",
  tagline: "Scalable Cloud Infrastructure",
  category: "Tech",
  icon: "💻",
  description: "Scalable cloud infrastructure powering all ASIREX services, APIs, and data processing pipelines. Built for reliability and performance.",
  completedDate: "August 2023",
  impact: "99.99% uptime achieved",
  features: ["Auto-scaling", "Load Balancing", "Data Pipelines", "API Gateway"],
  techStack: ["Kubernetes", "Docker", "PostgreSQL", "Redis"],
  highlights: [
    { title: "API Requests/Day", value: "5M+" },
    { title: "Uptime", value: "99.99%" },
    { title: "Services", value: "20+" }
  ]
}, {
  id: 105,
  name: "ClimatePredict AI",
  tagline: "Climate Pattern Prediction",
  category: "Climate",
  icon: "🌡️",
  description: "Machine learning model for climate pattern prediction and environmental impact assessment. Helps organizations plan for climate change.",
  completedDate: "February 2024",
  impact: "85% prediction accuracy",
  features: ["Weather Forecasting", "Impact Assessment", "Trend Analysis", "Risk Prediction"],
  techStack: ["Python", "PyTorch", "Scikit-learn", "Pandas"],
  highlights: [
    { title: "Accuracy", value: "85%" },
    { title: "Predictions/Day", value: "10,000+" },
    { title: "Data Sources", value: "50+" }
  ]
}, {
  id: 106,
  name: "AgriBot Vision",
  tagline: "Smart Agriculture Computer Vision",
  category: "AgriTech",
  icon: "🌾",
  description: "Computer vision system for crop health monitoring, pest detection, and yield optimization. Helping farmers increase productivity sustainably.",
  completedDate: "December 2023",
  impact: "30% yield improvement",
  features: ["Crop Health Analysis", "Pest Detection", "Yield Prediction", "Disease Identification"],
  techStack: ["Python", "OpenCV", "YOLO", "TensorFlow"],
  highlights: [
    { title: "Crops Analyzed", value: "500K+" },
    { title: "Pest Detection", value: "95% accuracy" },
    { title: "Farmers Helped", value: "1,000+" }
  ]
}];

// Type for database project
interface DatabaseProject {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  status: string | null;
  launch_date: string | null;
  image_url: string | null;
  gallery_images: string[] | null;
  impact: string | null;
  features: string[] | null;
  progress_percentage: number | null;
  video_url: string | null;
}

export default function Projects() {
  type CompletedProject = typeof completedProjects[0];
  const navigate = useNavigate();
  const { user, isStaff, loading: authLoading } = useAuth();
  const { data: dbProjects, isLoading: projectsLoading } = useProjects();
  const [selectedProject, setSelectedProject] = useState<DatabaseProject | null>(null);
  const [selectedCompletedProject, setSelectedCompletedProject] = useState<CompletedProject | null>(null);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  const handleNotify = async () => {
    if (!notifyEmail) return;
    
    setIsSubscribing(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: notifyEmail });
      
      if (error) {
        if (error.code === '23505') {
          toast.info("You're already subscribed for updates!");
        } else {
          throw error;
        }
      } else {
        toast.success("You'll be notified when this project launches!");
      }
      setNotifyEmail("");
    } catch (error: any) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubscribing(false);
    }
  };

  // Transform database projects to displayable format
  const projects: DatabaseProject[] = (dbProjects || [])
    .filter((p: any) => p.status?.toLowerCase() !== 'completed')
    .map((p: any) => ({
      id: p.id,
      title: p.title,
      tagline: p.tagline,
      description: p.description,
      status: p.status,
      launch_date: p.launch_date,
      image_url: p.image_url,
      gallery_images: Array.isArray(p.gallery_images) ? p.gallery_images : [],
      impact: p.impact,
      features: Array.isArray(p.features) ? p.features : [],
      progress_percentage: p.progress_percentage,
      video_url: p.video_url,
    }));

  // Show loading
  if (authLoading || projectsLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return <Layout>
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center mb-16">
            <motion.div initial={{
            opacity: 0,
            scale: 0.9
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.2
          }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
              <Clock className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">
                Building Tomorrow
              </span>
            </motion.div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4">
              Future <span className="gradient-text">Projects</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the innovations we're building to transform India and beyond. 
              Sign up to get notified when these projects launch.
            </p>
          </motion.div>

          {/* Projects Grid - Database Driven */}
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No upcoming projects at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {projects.map((project, index) => {
                const stage = mapStatusToStage(project.status);
                return (
                  <motion.div 
                    key={project.id} 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="glass-card p-8 lg:p-10 border border-border/50 hover:border-primary/30 transition-colors relative overflow-hidden">
                      {/* Animated Background Glow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative">
                        <div className="flex flex-col lg:flex-row items-start gap-8">
                          {/* Project Image */}
                          <div className="flex-shrink-0">
                            {project.gallery_images && project.gallery_images.length > 0 ? (
                              <div className="w-full lg:w-64 h-48 rounded-2xl overflow-hidden">
                                <CyclingProjectImage images={project.gallery_images} interval={4000} className="w-full h-full" />
                              </div>
                            ) : project.image_url ? (
                              <div className="w-full lg:w-64 h-48 rounded-2xl overflow-hidden">
                                <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-full lg:w-64 h-48 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-7xl">
                                🚀
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            {/* Status Badge */}
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-primary/20 text-primary border border-primary/30">
                                🔧 {project.status || 'Planning'}
                              </span>
                              {project.launch_date && (
                                <span className="px-3 py-1.5 text-xs font-medium rounded-full bg-muted/50 text-muted-foreground flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3" />
                                  {project.launch_date}
                                </span>
                              )}
                            </div>

                            <h3 className="font-display text-2xl lg:text-3xl font-bold mb-2 group-hover:text-accent transition-colors">
                              {project.title}
                            </h3>
                            {project.tagline && (
                              <p className="text-accent font-medium mb-4">
                                {project.tagline}
                              </p>
                            )}
                            {project.description && (
                              <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-2">
                                {project.description}
                              </p>
                            )}

                            {/* Development Stage Buttons */}
                            <div className="flex flex-wrap gap-2 mb-6">
                              {['Planning', 'Prototype', 'Development', 'Testing', 'Production'].map((stageItem) => {
                                const status = getStageStatus(stage, stageItem);
                                return (
                                  <span 
                                    key={stageItem}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full border ${
                                      status === 'completed' 
                                        ? 'bg-green-500/20 text-green-500 border-green-500/30' 
                                        : status === 'active'
                                        ? 'bg-primary/20 text-primary border-primary/30 animate-pulse'
                                        : 'bg-muted/30 text-muted-foreground border-border'
                                    }`}
                                  >
                                    {status === 'completed' ? '✓' : status === 'active' ? '◉' : '○'} {stageItem}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Progress */}
                            <div className="mb-6">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Overall Progress</span>
                                <span className="font-bold text-yellow-500">{project.progress_percentage || 0}%</span>
                              </div>
                              <div className="h-3 bg-yellow-500/20 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${project.progress_percentage || 0}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"
                                />
                              </div>
                            </div>

                            {/* Impact & Features */}
                            <div className="flex flex-wrap items-center gap-4">
                              {project.impact && (
                                <span className="text-sm font-semibold text-green-500">
                                  🎯 {project.impact}
                                </span>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {project.features?.slice(0, 4).map((feature, i) => (
                                  <span key={i} className="px-2 py-1 text-xs bg-muted/50 rounded-md text-muted-foreground">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Arrow */}
                          <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 hidden lg:block" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Completed Projects Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-24"
          >
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                Completed <span className="gradient-text">Projects</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Our portfolio of successfully delivered solutions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="glass-card p-6 border border-border/50 hover:border-green-500/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedCompletedProject(project)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{project.icon}</span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-500 border border-green-500/30">
                      ✓ Completed
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2 group-hover:text-green-400 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {project.tagline}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{project.completedDate}</span>
                    <span className="text-green-500 font-medium">{project.impact}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Future Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedProject.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Image */}
                {(selectedProject.gallery_images && selectedProject.gallery_images.length > 0) || selectedProject.image_url ? (
                  <div className="w-full h-64 rounded-xl overflow-hidden">
                    {selectedProject.gallery_images && selectedProject.gallery_images.length > 0 ? (
                      <CyclingProjectImage images={selectedProject.gallery_images} interval={3000} className="w-full h-full" />
                    ) : (
                      <img src={selectedProject.image_url!} alt={selectedProject.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                ) : null}

                {/* Status & Launch */}
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 text-sm font-semibold rounded-full bg-primary/20 text-primary border border-primary/30">
                    🔧 {selectedProject.status || 'Planning'}
                  </span>
                  {selectedProject.launch_date && (
                    <span className="px-4 py-2 text-sm font-medium rounded-full bg-muted/50 text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {selectedProject.launch_date}
                    </span>
                  )}
                </div>

                {/* Tagline & Description */}
                {selectedProject.tagline && (
                  <p className="text-lg font-medium text-accent">{selectedProject.tagline}</p>
                )}
                {selectedProject.description && (
                  <p className="text-muted-foreground leading-relaxed">{selectedProject.description}</p>
                )}

                {/* Impact */}
                {selectedProject.impact && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <p className="text-green-500 font-semibold">🎯 {selectedProject.impact}</p>
                  </div>
                )}

                {/* Features */}
                {selectedProject.features && selectedProject.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Key Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.features.map((feature, i) => (
                        <span key={i} className="px-3 py-1.5 text-sm bg-muted/50 rounded-lg text-foreground">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Development Progress</span>
                    <span className="font-bold text-primary">{selectedProject.progress_percentage || 0}%</span>
                  </div>
                  <div className="h-4 bg-primary/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                      style={{ width: `${selectedProject.progress_percentage || 0}%` }}
                    />
                  </div>
                </div>

                {/* Notify Form */}
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Get Launch Updates</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleNotify} disabled={isSubscribing}>
                      {isSubscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Notify Me"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Completed Project Modal */}
      <AnimatePresence>
        {selectedCompletedProject && (
          <Dialog open={!!selectedCompletedProject} onOpenChange={() => setSelectedCompletedProject(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                  <span className="text-4xl">{selectedCompletedProject.icon}</span>
                  {selectedCompletedProject.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-green-500/20 text-green-500 border border-green-500/30">
                    ✓ Completed {selectedCompletedProject.completedDate}
                  </span>
                  <span className="px-3 py-1.5 text-sm font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
                    {selectedCompletedProject.category}
                  </span>
                </div>

                <p className="text-lg font-medium text-accent">{selectedCompletedProject.tagline}</p>
                <p className="text-muted-foreground leading-relaxed">{selectedCompletedProject.description}</p>

                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-green-500 font-semibold">🎯 {selectedCompletedProject.impact}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Key Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompletedProject.features.map((feature, i) => (
                      <span key={i} className="px-3 py-1.5 text-sm bg-muted/50 rounded-lg text-foreground">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompletedProject.techStack.map((tech, i) => (
                      <span key={i} className="px-3 py-1.5 text-sm bg-primary/10 border border-primary/20 rounded-lg text-primary">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {selectedCompletedProject.highlights.map((highlight, i) => (
                    <div key={i} className="p-4 rounded-xl bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-primary">{highlight.value}</p>
                      <p className="text-xs text-muted-foreground">{highlight.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </Layout>;
}