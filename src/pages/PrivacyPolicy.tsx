import { motion } from "framer-motion";
import { ArrowLeft, Shield, Eye, Database, Lock, UserCheck, Globe, Mail, Clock, Trash2, FileText } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Information We Collect",
      icon: Database,
      content: `We collect information you provide directly to us, including:

**Personal Information:**
• Name and contact details (email, phone number, address)
• Account credentials (username, password)
• Payment information (processed securely through payment providers)
• Order history and preferences

**Automatically Collected Information:**
• Device information (browser type, operating system)
• IP address and location data
• Usage data (pages visited, time spent, interactions)
• Cookies and similar tracking technologies`
    },
    {
      title: "2. Legal Basis for Processing (GDPR)",
      icon: FileText,
      content: `Under the General Data Protection Regulation (GDPR), we process your data based on:

**Contractual Necessity:** Processing required to fulfill orders and provide services you have requested.

**Legitimate Interests:** Processing for fraud prevention, security, and improving our services.

**Consent:** Where you have given explicit consent for marketing communications or cookies.

**Legal Obligation:** Processing required to comply with applicable laws and regulations.

You have the right to withdraw consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.`
    },
    {
      title: "3. How We Use Your Information",
      icon: Eye,
      content: `We use the information we collect to:

• Process and fulfill your orders
• Send order confirmations, shipping updates, and receipts
• Provide customer support and respond to inquiries
• Personalize your shopping experience
• Send promotional communications (with your consent)
• Analyze usage patterns to improve our website
• Detect and prevent fraud or unauthorized access
• Comply with legal obligations

We will never sell your personal information to third parties.`
    },
    {
      title: "4. Data Sharing and Disclosure",
      icon: Globe,
      content: `We may share your information with:

**Service Providers:** Third-party companies that help us operate our business (payment processors, shipping carriers, cloud hosting providers).

**Legal Requirements:** When required by law, court order, or government request.

**Business Transfers:** In connection with a merger, acquisition, or sale of assets.

**With Your Consent:** When you have given explicit permission.

All third-party service providers are contractually obligated to protect your data and use it only for the purposes we specify.`
    },
    {
      title: "5. Your Rights Under GDPR",
      icon: UserCheck,
      content: `If you are located in the European Economic Area (EEA), you have the following rights:

**Right to Access:** Request a copy of the personal data we hold about you.

**Right to Rectification:** Request correction of inaccurate or incomplete data.

**Right to Erasure:** Request deletion of your personal data ("right to be forgotten").

**Right to Restrict Processing:** Request limitation of how we use your data.

**Right to Data Portability:** Receive your data in a structured, machine-readable format.

**Right to Object:** Object to processing based on legitimate interests or for direct marketing.

**Right to Withdraw Consent:** Withdraw previously given consent at any time.

To exercise these rights, contact us at privacy@asirex.com. We will respond within 30 days.`
    },
    {
      title: "6. Data Retention",
      icon: Clock,
      content: `We retain your personal data for as long as necessary to:

• Fulfill the purposes for which it was collected
• Comply with legal, accounting, or reporting requirements
• Resolve disputes and enforce our agreements

**Retention Periods:**
• Account information: Until account deletion + 3 years
• Order history: 7 years (for tax and legal compliance)
• Marketing preferences: Until consent is withdrawn
• Analytics data: 26 months

After the retention period, data is securely deleted or anonymized.`
    },
    {
      title: "7. Data Security",
      icon: Lock,
      content: `We implement appropriate technical and organizational measures to protect your data:

• SSL/TLS encryption for all data transmission
• Secure payment processing through PCI-DSS compliant providers
• Regular security assessments and updates
• Access controls and authentication mechanisms
• Employee training on data protection
• Incident response procedures

While we strive to protect your information, no method of transmission over the Internet is 100% secure. We encourage you to use strong passwords and protect your account credentials.`
    },
    {
      title: "8. Cookies and Tracking",
      icon: Eye,
      content: `We use cookies and similar technologies to:

**Essential Cookies:** Required for website functionality (shopping cart, authentication).

**Analytics Cookies:** Help us understand how visitors use our website.

**Marketing Cookies:** Used to deliver relevant advertisements (with consent).

**Preference Cookies:** Remember your settings and preferences.

You can manage cookie preferences through your browser settings. Note that disabling certain cookies may affect website functionality.

For more details, see our Cookie Policy.`
    },
    {
      title: "9. International Data Transfers",
      icon: Globe,
      content: `Your data may be transferred to and processed in countries outside your country of residence, including countries that may not have the same data protection laws.

When we transfer data internationally, we ensure appropriate safeguards are in place:

• Standard Contractual Clauses approved by the European Commission
• Adequacy decisions by relevant authorities
• Binding Corporate Rules where applicable

By using our services, you consent to the transfer of your information to countries outside your country of residence.`
    },
    {
      title: "10. Children's Privacy",
      icon: Shield,
      content: `Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children.

If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We will take steps to delete such information from our records.`
    },
    {
      title: "11. Data Deletion",
      icon: Trash2,
      content: `You may request deletion of your personal data at any time by:

• Contacting us at privacy@asirex.com
• Using the account deletion option in your settings
• Submitting a written request to our postal address

Upon receiving a valid deletion request, we will:
• Verify your identity
• Delete or anonymize your data within 30 days
• Notify third parties who have received your data
• Confirm completion of the deletion

Note: Some data may be retained for legal compliance purposes.`
    },
    {
      title: "12. Changes to This Policy",
      icon: FileText,
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.

When we make material changes, we will:
• Post the updated policy on this page
• Update the "Last Updated" date
• Notify you via email (for significant changes)

We encourage you to review this policy periodically. Continued use of our services after changes constitutes acceptance of the updated policy.`
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
                <Shield className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="font-display text-3xl lg:text-5xl font-bold mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your privacy is important to us. This policy explains how we collect, use, and protect your personal information in compliance with GDPR and other applicable regulations.
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                Last updated: December 2024
              </p>
            </div>
          </motion.div>

          {/* GDPR Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-primary/5 border border-primary/20 mb-10"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-primary text-lg mb-2">GDPR Compliant</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR) 
                  and other applicable data protection laws. You have full control over your personal data.
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
                transition={{ delay: 0.05 * (index + 3) }}
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
            className="mt-12 p-6 rounded-2xl bg-muted/50 border border-border/50"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Contact Our Data Protection Officer</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For any questions about this Privacy Policy or to exercise your data protection rights, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> privacy@asirex.com</p>
                  <p><strong>Subject Line:</strong> Privacy Inquiry / Data Request</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" onClick={() => navigate("/about")}>
                    Contact Us
                  </Button>
                  <Button variant="ghost" onClick={() => navigate("/terms-and-conditions")}>
                    View Terms & Conditions
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center text-xs text-muted-foreground"
          >
            <p>
              This Privacy Policy is effective as of December 2024 and will remain in effect except with respect to any 
              changes in its provisions in the future, which will be in effect immediately after being posted on this page.
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
