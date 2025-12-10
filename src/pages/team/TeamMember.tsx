import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { User, Briefcase, Award, Star, Mail, Linkedin, ArrowLeft, Zap, Target, Heart, Code, Cpu, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const teamData: Record<string, {
  name: string;
  role: string;
  emoji: string;
  title: string;
  bio: string;
  skills: string[];
  experience: { company: string; role: string; years: string }[];
  achievements: string[];
  salary?: string;
  education?: string;
  quote: string;
  email?: string;
  linkedin?: string;
}> = {
  "kapeesh-sorout": {
    name: "Kapeesh Sorout",
    role: "CEO & Founder",
    emoji: "👨‍💼",
    title: "Visionary Leader",
    bio: "Kapeesh Sorout is the visionary founder of ASIREX, building advanced technology that will position India as a global leader in innovation. He focuses on robotics, automation, industrial systems, and intelligent tech that solves real-world problems at scale. He believes success is earned through discipline, consistency, vision, smart work, hard work, and leadership — not by chasing a title or a degree. Under his leadership, ASIREX is shaping the future with technology that empowers industries, strengthens India, and inspires the next generation of creators.",
    skills: ["Business Management", "Product Development", "AI Model Training", "Critical Thinking", "Sales Strategy", "Team Building", "Leadership", "Financial Management", "Branding & Marketing", "Problem Solving", "Strategic Planning", "Innovation & Research"],
    experience: [
      { company: "ASIREX", role: "Founder & CEO", years: "2025 - Present" },
      { company: "Self-taught", role: "AI & Robotics Research", years: "2024 - 2025" }
    ],
    achievements: [
      "Founded ASIREX with zero external funding",
      "Designed the Aqua River Purifier concept",
      "Built a team of passionate innovators",
      "Developing multiple product lines simultaneously"
    ],
    education: "Self-taught in AI, Robotics, and Business",
    quote: "Becoming an IITian is an illusion. Real power comes from building, not memorizing. I won't be a part of the matrix. I will break it — and help others escape too.",
    email: "Ceo@asirex.in"
  },
  "ayush-soni": {
    name: "Ayush Soni",
    role: "Website Admin and SWE",
    emoji: "👩‍💻",
    title: "Tech Architect",
    bio: "Ayush Soni leads the technical development of ASIREX's digital presence and software products. With expertise in modern web technologies and a passion for clean, efficient code, Ayush ensures that every ASIREX product meets the highest technical standards.",
    skills: ["React/Next.js", "TypeScript", "Node.js", "Database Design", "UI/UX", "DevOps"],
    experience: [
      { company: "ASIREX", role: "Website Admin & SWE", years: "2024 - Present" }
    ],
    achievements: [
      "Built the ASIREX website from scratch",
      "Implemented the admin dashboard",
      "Set up the e-commerce platform",
      "Optimized site performance and SEO"
    ],
    quote: "Code is poetry — and we write epics.",
    email: "ayush@asirex.in"
  },
  "vaibhav-ghatwal": {
    name: "Vaibhav Ghatwal",
    role: "Production Head and Manager",
    emoji: "🌱",
    title: "Production Expert",
    bio: "Vaibhav Ghatwal manages the production team as the Head of Product Managing. He and his team create every product with premium packaging — each item is handmade with no machines involved. Vaibhav personally checks and tests every product before it is sent to our customers.",
    skills: ["Product Management", "Operations", "Quality Control", "Supply Chain", "Process Optimization"],
    experience: [
      { company: "ASIREX", role: "Production Head and Manager", years: "2025 - Present" }
    ],
    achievements: [
      "Established production workflows",
      "Managed product launches",
      "Built supplier relationships",
      "Implemented quality control processes"
    ],
    quote: "Excellence is not an act, but a habit. Every product we ship carries our reputation.",
    email: "Vaibhav.Phm@asirex.in"
  },
  "open-position-sales": {
    name: "Your Name Here",
    role: "Sales Manager and Head",
    emoji: "🧠+",
    title: "Join Our Team",
    bio: "We're looking for a dynamic Sales Manager to lead our commercial efforts. This is a unique opportunity to join ASIREX at the ground level and help shape India's technological future while building a rewarding career.",
    skills: ["Sales Strategy", "Team Leadership", "Client Relations", "Negotiation", "Market Analysis", "Revenue Growth"],
    experience: [],
    achievements: [],
    salary: "Competitive + Commission",
    quote: "This could be your story. Write it with us.",
    education: "Bachelor's degree preferred, but skills matter most"
  },
  "open-position-rd": {
    name: "Your Name Here",
    role: "Engineering and R&D Lead",
    emoji: "+",
    title: "Join Our Team",
    bio: "We're seeking an Engineering and R&D Lead to spearhead our technical innovation. If you're passionate about robotics, AI, and building technology that matters, this role is for you.",
    skills: ["Hardware Design", "Embedded Systems", "AI/ML", "Robotics", "Research", "Innovation"],
    experience: [],
    achievements: [],
    salary: "Competitive + Equity Options",
    quote: "The next breakthrough is waiting for you to discover it.",
    education: "Engineering background preferred"
  }
};

export default function TeamMember() {
  const { memberId } = useParams<{ memberId: string }>();
  const member = teamData[memberId || "kapeesh-sorout"];

  if (!member) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Team Member Not Found</h1>
            <Button asChild>
              <Link to="/about">Back to About</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isOpenPosition = member.name === "Your Name Here";

  return (
    <Layout>
      {/* Back Button */}
      <div className="container mx-auto px-4 lg:px-8 pt-8">
        <Button variant="ghost" asChild>
          <Link to="/about" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to About
          </Link>
        </Button>
      </div>

      {/* Hero */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent" />
        <motion.div 
          className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto"
          >
            <div className="flex flex-col lg:flex-row items-center gap-10">
              <motion.div 
                variants={itemVariants}
                className="flex-shrink-0"
              >
                <motion.div 
                  className="w-40 h-40 lg:w-56 lg:h-56 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-7xl lg:text-8xl"
                  whileHover={{ scale: 1.05 }}
                  animate={isOpenPosition ? { rotate: [0, 360] } : undefined}
                  transition={isOpenPosition ? { duration: 20, repeat: Infinity, ease: "linear" } : { duration: 0.3 }}
                >
                  {member.emoji}
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center lg:text-left">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
                  <User className="w-4 h-4" />
                  {member.title}
                </span>
                <h1 className="font-display text-4xl lg:text-5xl font-bold mb-3">
                  {isOpenPosition ? <span className="gradient-text">{member.name}</span> : member.name}
                </h1>
                <p className="text-xl text-muted-foreground mb-4">{member.role}</p>
                
                {member.email && (
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="w-4 h-4" /> {member.email}
                    </a>
                  </div>
                )}

                {member.salary && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
                    <Briefcase className="w-4 h-4" />
                    {member.salary}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bio */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass-card p-8">
              <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                {isOpenPosition ? "About This Role" : "About"}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">{member.bio}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <Code className="w-6 h-6 text-primary" />
              {isOpenPosition ? "Required Skills" : "Skills & Expertise"}
            </h2>
            <div className="flex flex-wrap gap-3">
              {member.skills.map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium"
                >
                  {skill}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Experience */}
      {member.experience.length > 0 && (
        <section className="py-12 bg-card/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-primary" />
                Experience
              </h2>
              <div className="space-y-4">
                {member.experience.map((exp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-6"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{exp.role}</h3>
                        <p className="text-muted-foreground">{exp.company}</p>
                      </div>
                      <span className="text-sm text-primary font-medium">{exp.years}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Achievements */}
      {member.achievements.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-primary" />
                Key Achievements
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {member.achievements.map((achievement, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 glass-card p-4"
                  >
                    <Star className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p>{achievement}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Quote */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Target className="w-12 h-12 text-primary mx-auto mb-6" />
            <p className="text-2xl font-display font-semibold italic">
              "{member.quote}"
            </p>
            {!isOpenPosition && <p className="text-muted-foreground mt-4">— {member.name}</p>}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      {isOpenPosition && (
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <Zap className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="font-display text-3xl font-bold mb-6">
                Ready to <span className="gradient-text">Apply</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join ASIREX and be part of building India's technological future.
              </p>
              <Button size="lg" asChild>
                <Link to="/about#careers">
                  View All Positions
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      )}
    </Layout>
  );
}