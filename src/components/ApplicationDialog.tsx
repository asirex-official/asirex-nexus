import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, ArrowLeft, User, Mail, Phone, Briefcase, GraduationCap, Code, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface ApplicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: {
    title: string;
    location: string;
    type: string;
    salary: string;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experience: string;
  skills: string;
  answers: string[];
}

const getQuestionsForPosition = (title: string): { question: string; options?: string[] }[] => {
  const baseQuestions = [
    { question: "Why do you want to join ASIREX?" },
    { question: "What motivates you to work in this field?" },
  ];

  if (title.toLowerCase().includes("ai") || title.toLowerCase().includes("engineer")) {
    return [
      ...baseQuestions,
      { question: "Explain a machine learning model you've built or worked with." },
      { question: "What's your experience with neural networks and deep learning frameworks (TensorFlow, PyTorch)?" },
      { question: "How would you approach building an AI system for real-time decision making?" },
      { question: "Describe your experience with NLP, computer vision, or reinforcement learning." },
    ];
  }

  if (title.toLowerCase().includes("robotics") || title.toLowerCase().includes("software")) {
    return [
      ...baseQuestions,
      { question: "What robotics operating systems (ROS/ROS2) have you worked with?" },
      { question: "Describe your experience with embedded systems and real-time programming." },
      { question: "How would you design a control system for an autonomous robot?" },
      { question: "What sensor integration and SLAM algorithms are you familiar with?" },
    ];
  }

  if (title.toLowerCase().includes("designer") || title.toLowerCase().includes("product")) {
    return [
      ...baseQuestions,
      { question: "Describe your design process from research to final product." },
      { question: "What tools do you use for prototyping and user testing?" },
      { question: "How do you balance user needs with business requirements?" },
      { question: "Share an example of a design challenge you solved creatively." },
    ];
  }

  if (title.toLowerCase().includes("sales") || title.toLowerCase().includes("manager")) {
    return [
      ...baseQuestions,
      { question: "What's your approach to building relationships with potential clients?" },
      { question: "Describe a successful sales strategy you've implemented." },
      { question: "How do you handle objections and negotiate deals?" },
      { question: "What's your experience with B2B sales in the technology sector?" },
    ];
  }

  return [
    ...baseQuestions,
    { question: "What unique skills would you bring to ASIREX?" },
    { question: "Describe a challenging project you've completed." },
  ];
};

export function ApplicationDialog({ open, onOpenChange, position }: ApplicationDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    experience: "",
    skills: "",
    answers: [],
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [passed, setPassed] = useState(false);

  const questions = getQuestionsForPosition(position.title);
  const totalSteps = 3; // Personal Info, Skills, Interview Questions

  const handleNext = () => {
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        toast({
          title: "Required Fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.experience || !formData.skills) {
        toast({
          title: "Required Fields",
          description: "Please fill in your experience and skills.",
          variant: "destructive",
        });
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Answer Required",
        description: "Please provide an answer before continuing.",
        variant: "destructive",
      });
      return;
    }

    const newAnswers = [...formData.answers, currentAnswer];
    setFormData({ ...formData, answers: newAnswers });
    setCurrentAnswer("");

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleFinalSubmit(newAnswers);
    }
  };

  const handleFinalSubmit = async (answers: string[]) => {
    setIsSubmitting(true);
    
    // Simulate evaluation - check if answers are substantial
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simple evaluation: pass if all answers have reasonable length
    const allAnswersValid = answers.every(answer => answer.length >= 20);
    const passedInterview = allAnswersValid && answers.length === questions.length;
    
    setPassed(passedInterview);
    setIsComplete(true);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      experience: "",
      skills: "",
      answers: [],
    });
    setCurrentQuestionIndex(0);
    setCurrentAnswer("");
    setIsComplete(false);
    setPassed(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Apply for {position.title}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        {!isComplete && (
          <div className="w-full bg-muted rounded-full h-2 mb-6">
            <motion.div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: step === 3 
                  ? `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                  : `${(step / totalSteps) * 100}%`
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              {passed ? (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4 text-green-500">
                    Congratulations! You Passed! 🎉
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Your application for <strong>{position.title}</strong> has been reviewed and you've successfully passed the initial screening.
                  </p>
                  <div className="glass-card p-6 mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Send your joining letter to:</p>
                    <a 
                      href="mailto:asirex.official@gmail.com" 
                      className="text-xl font-semibold text-primary hover:underline flex items-center justify-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      asirex.official@gmail.com
                    </a>
                    <p className="text-xs text-muted-foreground mt-3">
                      Include your name, position applied for, and attach your resume.
                    </p>
                  </div>
                  <Button onClick={handleClose} variant="glow">
                    Close
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">📝</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4">
                    Thank You for Applying!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We appreciate your interest in <strong>{position.title}</strong>. Please provide more detailed answers in your responses. We encourage you to apply again with more comprehensive information about your experience.
                  </p>
                  <Button onClick={handleClose} variant="glass">
                    Try Again Later
                  </Button>
                </>
              )}
            </motion.div>
          ) : isSubmitting ? (
            <motion.div
              key="submitting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent mx-auto mb-6"
              />
              <p className="text-muted-foreground">Evaluating your application...</p>
            </motion.div>
          ) : step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleNext} variant="glow" className="gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ) : step === 2 ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Experience & Skills
              </h3>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience *</Label>
                <Input
                  id="experience"
                  placeholder="e.g., 3 years in software development"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Key Skills *</Label>
                <Textarea
                  id="skills"
                  placeholder="List your relevant skills (e.g., Python, Machine Learning, ROS, Product Design...)"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button onClick={handleBack} variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={handleNext} variant="glow" className="gap-2">
                  Start Interview <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  Interview Question
                </h3>
                <span className="text-sm text-muted-foreground">
                  {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>

              <div className="glass-card p-6">
                <p className="text-lg font-medium mb-4">
                  {questions[currentQuestionIndex].question}
                </p>
                <Textarea
                  placeholder="Type your answer here... (minimum 20 characters)"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {currentAnswer.length} characters
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  onClick={() => {
                    if (currentQuestionIndex > 0) {
                      setCurrentQuestionIndex(currentQuestionIndex - 1);
                      setCurrentAnswer(formData.answers[currentQuestionIndex - 1] || "");
                      setFormData({
                        ...formData,
                        answers: formData.answers.slice(0, -1)
                      });
                    } else {
                      setStep(2);
                    }
                  }} 
                  variant="outline" 
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={handleAnswerSubmit} variant="glow" className="gap-2">
                  {currentQuestionIndex === questions.length - 1 ? (
                    <>Submit Application <Send className="w-4 h-4" /></>
                  ) : (
                    <>Next Question <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
