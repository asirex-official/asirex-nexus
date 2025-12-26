import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import whatsappLogo from "@/assets/whatsapp-logo.png";
import instagramLogo from "@/assets/instagram-logo.png";
import gmailLogo from "@/assets/gmail-logo.png";
import twitterLogo from "@/assets/twitter-logo.png";
import { useCompanyInfo } from "@/hooks/useSiteData";

const footerLinks = {
  Products: [
    { name: "AI Hardware", href: "/shop" },
    { name: "Robotics Kits", href: "/shop" },
    { name: "Clean Tech", href: "/shop" },
    { name: "Developer Tools", href: "/shop" },
  ],
  Company: [
    { name: "About Us", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Events", href: "/events" },
    { name: "Careers", href: "/about#careers" },
  ],
  Support: [
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/about#contact" },
    { name: "Track Order", href: "/track-order" },
    { name: "Shipping Info", href: "/shipping-info" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-and-conditions" },
    { name: "Refund Policy", href: "/refund-policy" },
  ],
};

type SocialLink = {
  icon?: React.ComponentType<{ className?: string }>;
  image?: string;
  href: string;
  label: string;
};

export function Footer() {
  const { data: companyInfo } = useCompanyInfo();

  const whatsappNumber = companyInfo?.whatsapp_number || "919876543210";
  const whatsappComingSoon = companyInfo?.whatsapp_coming_soon === "true";

  const legalName = companyInfo?.legal_name || "SHIVRAM";
  const contactEmail = companyInfo?.contact_email || "asirex.official@gmail.com";
  const contactPhone = companyInfo?.phone_coming_soon === "true"
    ? "Coming Soon"
    : (companyInfo?.contact_phone || "+91 9792944295");
  const address = companyInfo?.address || "Rangmahal Flats 7,8, Camp Colony, Faridabad, Haryana - 121102, India";

  const socialLinks: SocialLink[] = [
    { 
      image: whatsappLogo, 
      href: whatsappComingSoon ? "#" : `https://wa.me/${whatsappNumber}`, 
      label: whatsappComingSoon ? "WhatsApp (Coming Soon)" : "WhatsApp" 
    },
    { image: instagramLogo, href: companyInfo?.social_instagram || "https://instagram.com/asirex", label: "Instagram" },
    { image: twitterLogo, href: companyInfo?.social_twitter || "https://twitter.com/asirex", label: "Twitter" },
    { image: gmailLogo, href: companyInfo?.contact_email ? `mailto:${companyInfo.contact_email}` : "mailto:support@asirex.in", label: "Email" },
  ];

  return (
    <footer className="relative bg-card border-t border-border">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">
                ASIREX
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-xs">
              Future Tech. India's future depends on ASIREX. Pioneering AI, robotics, and clean-tech solutions for tomorrow.
            </p>
            <div className="text-muted-foreground text-xs space-y-1 mb-6">
              <p><strong>Legal Name:</strong> {legalName}</p>
              <p><strong>Email:</strong> {contactEmail}</p>
              <p><strong>Phone:</strong> {contactPhone}</p>
              <p><strong>Address:</strong> {address}</p>
            </div>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-300 hover:-translate-y-0.5"
                >
                  {social.image ? (
                    <img src={social.image} alt={social.label} className="w-5 h-5 object-contain" />
                  ) : social.icon ? (
                    <social.icon className="w-4 h-4" />
                  ) : null}
                </a>
              ))}
          </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-sm mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ASIREX Technologies. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Crafted with precision in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
