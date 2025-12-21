import { ArrowLeft, Truck, Clock, MapPin, Package, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";

export default function ShippingInfo() {
  const navigate = useNavigate();

  const shippingZones = [
    {
      zone: "Metro Cities",
      cities: "Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune",
      standard: "3-5 business days",
      express: "1-2 business days",
      standardFee: "FREE above ₹999",
      expressFee: "₹99"
    },
    {
      zone: "Tier 2 Cities",
      cities: "Jaipur, Lucknow, Ahmedabad, Chandigarh, Indore, Bhopal, and more",
      standard: "5-7 business days",
      express: "2-3 business days",
      standardFee: "FREE above ₹999",
      expressFee: "₹149"
    },
    {
      zone: "Other Locations",
      cities: "All other serviceable pin codes across India",
      standard: "7-10 business days",
      express: "3-5 business days",
      standardFee: "₹49 (FREE above ₹1499)",
      expressFee: "₹199"
    }
  ];

  const features = [
    {
      icon: Package,
      title: "Secure Packaging",
      description: "All products are carefully packed with bubble wrap and sturdy boxes to prevent damage during transit."
    },
    {
      icon: Shield,
      title: "Insured Shipments",
      description: "High-value orders above ₹5000 are automatically insured against loss or damage during shipping."
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Track your order at every step with real-time updates via SMS and email notifications."
    },
    {
      icon: Truck,
      title: "Trusted Partners",
      description: "We partner with Delhivery, Blue Dart, and DTDC for reliable and timely deliveries across India."
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
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-display text-4xl font-bold mb-4">Shipping Information</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Fast, reliable delivery across India. We ensure your tech reaches you safely and on time.
              </p>
            </div>

            {/* Free Shipping Banner */}
            <div className="glass-card p-6 mb-8 border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">Free Shipping on Orders Above ₹999!</h3>
                  <p className="text-sm text-muted-foreground">
                    Enjoy free standard shipping on all orders worth ₹999 or more to metro and Tier 2 cities.
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Zones Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 mb-8"
            >
              <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Delivery Zones & Timelines
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-semibold">Zone</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold">Standard Delivery</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold">Express Delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shippingZones.map((zone, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-4 px-2">
                          <p className="font-medium">{zone.zone}</p>
                          <p className="text-xs text-muted-foreground">{zone.cities}</p>
                        </td>
                        <td className="py-4 px-2">
                          <p className="font-medium">{zone.standard}</p>
                          <p className="text-xs text-green-500">{zone.standardFee}</p>
                        </td>
                        <td className="py-4 px-2">
                          <p className="font-medium">{zone.express}</p>
                          <p className="text-xs text-primary">{zone.expressFee}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Shipping Features */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Important Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6 mb-8"
            >
              <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Important Notes
              </h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Delivery timelines are estimates and may vary due to unforeseen circumstances, weather, or courier delays.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Orders placed before 2 PM on business days are usually dispatched the same day.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Remote areas and Northeast regions may experience slightly longer delivery times.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>We currently ship only within India. International shipping coming soon!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>For bulk orders (10+ units), contact us for special shipping arrangements.</span>
                </li>
              </ul>
            </motion.div>

            {/* Track Order CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-8 text-center"
            >
              <h2 className="font-display text-2xl font-bold mb-4">Track Your Order</h2>
              <p className="text-muted-foreground mb-6">
                Already placed an order? Track its status in real-time.
              </p>
              <Button onClick={() => navigate("/track-order")}>
                Track Order
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
