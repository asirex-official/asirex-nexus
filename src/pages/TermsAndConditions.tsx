import { motion } from "framer-motion";
import { ArrowLeft, Shield, AlertTriangle, Scale, FileText, CheckCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      icon: CheckCircle,
      content: `By accessing and using our website and purchasing products from ASIREX, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services or purchase our products.`
    },
    {
      title: "2. Product Disclaimer",
      icon: AlertTriangle,
      content: `All products sold on this platform, particularly those in the "Gadgets" and "Electronics" categories, are intended for educational, experimental, and assistive purposes only. The buyer acknowledges that:
      
• Products are sold "as-is" without any warranties regarding fitness for a particular purpose
• The seller is not responsible for any misuse, illegal use, or unintended consequences arising from the use of these products
• Buyers must comply with all applicable local, state, and national laws when using these products
• Some products may require technical knowledge for proper operation`
    },
    {
      title: "3. Purchase at Your Own Risk",
      icon: Shield,
      content: `By completing a purchase, you acknowledge and accept the following:

• You are purchasing products at your own risk and discretion
• You have reviewed all product descriptions, specifications, and warnings before purchase
• You understand the intended use and limitations of the product
• You accept full responsibility for any consequences arising from the use of the product
• You will not hold ASIREX liable for any damages, injuries, or legal issues arising from product use`
    },
    {
      title: "4. Tax Responsibility",
      icon: Scale,
      content: `All applicable taxes, duties, and customs charges are the sole responsibility of the buyer:

• Prices displayed are inclusive of GST/VAT where applicable within India
• International buyers are responsible for all import duties, customs fees, and local taxes
• Any tax obligations arising from the resale or commercial use of products are the buyer's responsibility
• ASIREX will provide necessary documentation for tax purposes upon request`
    },
    {
      title: "5. Refund and Return Policy",
      icon: FileText,
      content: `Due to the nature of our products:

• Refunds are only available for defective products received in damaged condition
• Refund requests must be made within 7 days of delivery with photographic evidence
• Products that have been opened, used, or tampered with are not eligible for refunds
• Shipping costs for returns are the responsibility of the buyer
• High-risk products (as marked with warning labels) are non-refundable once shipped`
    },
    {
      title: "6. Prohibited Uses",
      icon: AlertTriangle,
      content: `Buyers agree NOT to use any products purchased from ASIREX for:

• Any illegal activities or purposes prohibited by law
• Invasion of privacy or unauthorized surveillance
• Harassment, stalking, or intimidation of any person
• Cheating in examinations or assessments
• Any activity that may cause harm to individuals or property
• Circumventing security systems without authorization

Violation of these terms may result in legal action and cooperation with law enforcement authorities.`
    },
    {
      title: "7. Limitation of Liability",
      icon: Shield,
      content: `To the fullest extent permitted by law:

• ASIREX shall not be liable for any indirect, incidental, special, consequential, or punitive damages
• Our total liability shall not exceed the purchase price of the product
• We are not liable for any damages arising from misuse, modification, or improper handling of products
• We disclaim all liability for third-party actions involving our products`
    },
    {
      title: "8. Intellectual Property",
      icon: FileText,
      content: `All content on this website, including but not limited to text, graphics, logos, images, and software, is the property of ASIREX and is protected by intellectual property laws. Unauthorized reproduction, distribution, or modification of any content is strictly prohibited.`
    },
    {
      title: "9. Privacy Policy",
      icon: Shield,
      content: `We collect and process personal information in accordance with our Privacy Policy. By using our services, you consent to:

• Collection of necessary personal and payment information
• Use of data for order processing and customer service
• Secure storage of your information
• Communication regarding your orders and important updates`
    },
    {
      title: "10. Governing Law",
      icon: Scale,
      content: `These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in [Your City], India.`
    }
  ];

  return (
    <Layout>
      <section className="min-h-screen py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)} 
              className="gap-2 hover:bg-primary/10 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6"
              >
                <FileText className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="font-display text-3xl lg:text-5xl font-bold mb-4">
                Terms & Conditions
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Please read these terms carefully before making a purchase. By using our services, you agree to be bound by these terms.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Last updated: December 2024
              </p>
            </div>
          </motion.div>

          {/* Warning Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-destructive/10 border-2 border-destructive/30 mb-10"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-destructive/20 flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-destructive text-lg mb-2">Important Notice</h3>
                <p className="text-sm text-destructive/90 leading-relaxed">
                  Certain products sold on this platform are intended for educational and experimental purposes only. 
                  Buyers assume full responsibility for the use of these products. Misuse may result in legal consequences. 
                  By purchasing, you confirm that you will use products in compliance with all applicable laws.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 3) }}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
                    <section.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-lg mb-3">{section.title}</h2>
                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border/50 text-center"
          >
            <h3 className="font-bold text-lg mb-2">Questions About Our Terms?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions regarding these Terms and Conditions, please contact us.
            </p>
            <Button variant="outline" onClick={() => navigate("/about")}>
              Contact Us
            </Button>
          </motion.div>

          {/* Agreement Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center text-xs text-muted-foreground"
          >
            <p>
              By using our website and purchasing our products, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms and Conditions.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
