import { ArrowLeft, Package, Clock, AlertTriangle, CheckCircle, XCircle, RefreshCcw, CreditCard, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";

export default function RefundPolicy() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Clock,
      title: "Return Window",
      content: [
        "You may request a return within 7 days of receiving your order",
        "The product must be unused, in original packaging, and in resalable condition",
        "Proof of purchase (order ID or receipt) is required for all returns",
        "Custom or personalized items are non-returnable"
      ]
    },
    {
      icon: Package,
      title: "Eligible Products",
      content: [
        "Electronics and hardware with manufacturing defects",
        "Products damaged during shipping (report within 48 hours)",
        "Incorrect items shipped (we'll send the correct item free of charge)",
        "Products that don't match the description on our website"
      ]
    },
    {
      icon: XCircle,
      title: "Non-Returnable Items",
      content: [
        "Products marked as 'Final Sale' or 'Non-Returnable'",
        "Items with broken seals or tampered packaging",
        "Products damaged due to misuse, accidents, or unauthorized modifications",
        "Consumable items (batteries, chemicals) once opened",
        "Educational kits after assembly or use"
      ]
    },
    {
      icon: RefreshCcw,
      title: "Refund Process",
      content: [
        "Initiate a return request via email or our contact form",
        "Our team will review and approve/reject within 2-3 business days",
        "Once approved, ship the product to our return address",
        "Refund will be processed within 7-10 business days after we receive the item",
        "Refunds are credited to the original payment method"
      ]
    },
    {
      icon: CreditCard,
      title: "Refund Methods",
      content: [
        "Credit/Debit Card payments: Refunded to the same card (5-7 banking days)",
        "UPI/Net Banking: Refunded to the source account (3-5 banking days)",
        "Cash on Delivery: Refunded via bank transfer (NEFT/IMPS)",
        "Store credit option available for faster resolution"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Deductions & Fees",
      content: [
        "Original shipping charges are non-refundable unless we made an error",
        "Return shipping cost is borne by the customer (except for defective items)",
        "A 10% restocking fee may apply for opened electronics",
        "Damaged or incomplete returns may receive partial refund"
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
                <RefreshCcw className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-4xl font-bold mb-4">Refund & Return Policy</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We want you to be completely satisfied with your purchase. Please review our refund policy below.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: December 2024
              </p>
            </div>

            {/* Quick Summary */}
            <div className="glass-card p-6 mb-8 border-primary/20">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Quick Summary</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 7-day return window from delivery date</li>
                    <li>• Full refund for defective or incorrect items</li>
                    <li>• Refunds processed within 7-10 business days</li>
                    <li>• Contact us at support@asirex.in for return requests</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Policy Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="font-display text-xl font-bold">{section.title}</h2>
                  </div>
                  <ul className="space-y-2">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 glass-card p-8 text-center"
            >
              <h2 className="font-display text-2xl font-bold mb-4">Need Help with a Return?</h2>
              <p className="text-muted-foreground mb-6">
                Our support team is here to assist you with any return or refund queries.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>support@asirex.in</span>
                </div>
              </div>
              <Button className="mt-6" onClick={() => navigate("/about#contact")}>
                Contact Support
              </Button>
            </motion.div>

            {/* Legal Note */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                By making a purchase on ASIREX, you agree to this Refund Policy. 
                We reserve the right to modify this policy at any time. 
                For disputes, Indian consumer protection laws shall apply.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
