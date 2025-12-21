import { ArrowLeft, HelpCircle, Package, Truck, CreditCard, Shield, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { useCompanyInfo } from "@/hooks/useSiteData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const navigate = useNavigate();
  const { data: companyInfo } = useCompanyInfo();

  const supportEmail = companyInfo?.email_support_coming_soon === "true" 
    ? "Coming Soon" 
    : (companyInfo?.email_support || "support@asirex.in");
  
  const salesEmail = companyInfo?.email_sales_coming_soon === "true"
    ? "Coming Soon"
    : (companyInfo?.email_sales || "sales@asirex.in");

  const faqCategories = [
    {
      icon: Package,
      title: "Products & Orders",
      faqs: [
        {
          question: "What types of products does ASIREX offer?",
          answer: "ASIREX offers cutting-edge technology products including AI & ML development boards, robotics kits, clean-tech devices like water purifiers, developer tools, and educational hardware. All our products are designed and manufactured in India."
        },
        {
          question: "Are all products tested before shipping?",
          answer: "Yes, every product undergoes rigorous quality control testing before dispatch. Electronics are tested for functionality, safety, and performance to ensure you receive a fully working product."
        },
        {
          question: "Can I modify my order after placing it?",
          answer: "Orders can be modified within 2 hours of placement if they haven't been processed. Contact our support team immediately via email or WhatsApp for order modifications."
        },
        {
          question: "Do you offer bulk/wholesale pricing?",
          answer: `Yes, we offer special pricing for bulk orders, educational institutions, and government organizations. Contact us at ${salesEmail} for custom quotes.`
        }
      ]
    },
    {
      icon: Truck,
      title: "Shipping & Delivery",
      faqs: [
        {
          question: "What are the shipping charges?",
          answer: "Shipping is FREE for orders above ₹999 within India. For orders below ₹999, a flat shipping fee of ₹49-99 applies based on location. Express shipping options are available at additional cost."
        },
        {
          question: "How long does delivery take?",
          answer: "Standard delivery takes 5-7 business days for metro cities and 7-10 days for other locations. Express delivery (1-3 days) is available for select pin codes at an additional charge."
        },
        {
          question: "Do you ship internationally?",
          answer: "Currently, we ship only within India. International shipping for select products is coming soon. Join our newsletter to be notified when international shipping becomes available."
        },
        {
          question: "How can I track my order?",
          answer: "Once shipped, you'll receive a tracking number via email and SMS. You can track your order on our website at /track-order or directly on the courier partner's website."
        }
      ]
    },
    {
      icon: CreditCard,
      title: "Payments",
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major payment methods including Credit/Debit cards (Visa, Mastercard, RuPay), UPI (Google Pay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD) for eligible orders."
        },
        {
          question: "Is Cash on Delivery (COD) available?",
          answer: "Yes, COD is available for orders between ₹500 - ₹10,000 at select pin codes. COD charges of ₹40 apply. High-value or custom orders may not be eligible for COD."
        },
        {
          question: "Are my payment details secure?",
          answer: "Absolutely. We use industry-standard SSL encryption and partner with PCI-DSS compliant payment gateways. We never store your full card details on our servers."
        },
        {
          question: "Can I get an invoice/GST bill?",
          answer: "Yes, GST invoices are automatically generated for all orders. You can download your invoice from your order details page or request it via email."
        }
      ]
    },
    {
      icon: Shield,
      title: "Returns & Warranty",
      faqs: [
        {
          question: "What is your return policy?",
          answer: "We offer a 7-day return window from delivery date. Products must be unused, in original packaging, and with all accessories. See our full Refund Policy for details."
        },
        {
          question: "What warranty do your products have?",
          answer: "Most electronics come with a 6-month to 1-year manufacturer warranty covering manufacturing defects. Warranty details are mentioned on each product page."
        },
        {
          question: "How do I claim warranty?",
          answer: `For warranty claims, email ${supportEmail} with your order ID, product photos, and description of the issue. Our team will guide you through the process.`
        },
        {
          question: "What if I receive a damaged product?",
          answer: "Report damaged products within 48 hours of delivery with unboxing photos. We'll arrange a free replacement or full refund at no extra cost to you."
        }
      ]
    },
    {
      icon: Users,
      title: "Account & Support",
      faqs: [
        {
          question: "Do I need an account to place an order?",
          answer: "Guest checkout is available, but creating an account lets you track orders, save addresses, access exclusive offers, and earn loyalty points on future purchases."
        },
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page and enter your email. You'll receive a password reset link valid for 24 hours."
        },
        {
          question: "How can I contact customer support?",
          answer: `Reach us via email at ${supportEmail} or use the live chat on our website. Support hours: 9 AM - 9 PM IST, Monday to Saturday. You can also visit our Contact page for more options.`
        },
        {
          question: "Can I cancel my newsletter subscription?",
          answer: "Yes, you can unsubscribe anytime by clicking the 'Unsubscribe' link at the bottom of any newsletter email, or by contacting our support team."
        }
      ]
    },
    {
      icon: Wrench,
      title: "Technical & Product Support",
      faqs: [
        {
          question: "Do you provide technical documentation?",
          answer: "Yes, all our products come with detailed documentation, setup guides, and video tutorials. Premium products include access to our developer community and forums."
        },
        {
          question: "Can I get help setting up my product?",
          answer: "We offer free setup support via video call for complex products. For simple issues, our documentation and YouTube tutorials should help. Contact support for personalized assistance."
        },
        {
          question: "Are replacement parts available?",
          answer: "Yes, we stock replacement parts for most products. Contact support with your product model and required part for availability and pricing."
        },
        {
          question: "Do you offer workshops or training?",
          answer: "Yes, we conduct regular workshops on AI, robotics, and IoT. Check our Events page for upcoming sessions. Custom training for organizations is also available."
        }
      ]
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background py-20 lg:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-4xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions about our products, shipping, payments, and more.
              </p>
            </div>

            {/* FAQ Categories */}
            <div className="space-y-8">
              {faqCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <category.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-display text-xl font-bold">{category.title}</h2>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              ))}
            </div>

            {/* Still Have Questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 glass-card p-8 text-center"
            >
              <h2 className="font-display text-2xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Our support team is happy to help.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={() => navigate("/about#contact")}>
                  Contact Support
                </Button>
                <Button variant="outline" onClick={() => navigate("/about")}>
                  Learn More About Us
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
