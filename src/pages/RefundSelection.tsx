import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Wallet, Gift, Loader2, CheckCircle, XCircle, Clock, Building2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RefundDetails {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  payment_method: string;
  order?: {
    customer_name: string;
    customer_email: string;
    items: any[];
  };
}

const REFUND_METHODS = [
  {
    id: "gift_card",
    label: "Gift Card / Store Credit",
    description: "Instant credit to your account",
    icon: Gift,
    instant: true,
  },
  {
    id: "upi",
    label: "UPI Transfer",
    description: "Refund within 24 hours",
    icon: Wallet,
    instant: false,
  },
  {
    id: "bank",
    label: "Bank Account Transfer",
    description: "Refund within 24 hours",
    icon: Building2,
    instant: false,
  },
];

export default function RefundSelection() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refundDetails, setRefundDetails] = useState<RefundDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid refund link. Please use the link from your email.");
      setIsLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase
        .from("refund_requests")
        .select(`
          *,
          orders (
            customer_name,
            customer_email,
            items
          )
        `)
        .eq("link_token", token)
        .single();

      if (error || !data) {
        setError("This refund link is invalid or has expired.");
        setIsLoading(false);
        return;
      }

      // Check if link expired
      if (data.link_expires_at && new Date(data.link_expires_at) < new Date()) {
        setError("This refund link has expired. Please contact support.");
        setIsLoading(false);
        return;
      }

      // Check if already processed
      if (!["pending", "pending_user_selection"].includes(data.status)) {
        setError(`This refund has already been ${data.status}.`);
        setIsLoading(false);
        return;
      }

      setRefundDetails({
        id: data.id,
        order_id: data.order_id,
        amount: data.amount,
        status: data.status,
        payment_method: data.payment_method,
        order: data.orders as any,
      });
    } catch (err) {
      console.error("Error validating token:", err);
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateUPI = (upi: string) => {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(upi);
  };

  const handleSubmit = async () => {
    if (!selectedMethod || !refundDetails) return;

    // Validate based on method
    if (selectedMethod === "upi" && !validateUPI(upiId)) {
      toast.error("Please enter a valid UPI ID");
      return;
    }

    if (selectedMethod === "bank") {
      if (!bankDetails.accountHolder || !bankDetails.accountNumber || !bankDetails.ifsc) {
        toast.error("Please fill all bank details");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (selectedMethod === "gift_card") {
        // Process instant gift card refund
        const { data, error } = await supabase.functions.invoke("process-gift-card-refund", {
          body: {
            refund_id: refundDetails.id,
            user_id: null, // Guest refund
            amount: refundDetails.amount,
          },
        });

        if (error) throw error;

        toast.success("Gift card created! Check your email for the code.");
      } else {
        // Update refund request with bank/UPI details
        const updates: any = {
          refund_method: selectedMethod,
          status: "processing",
        };

        if (selectedMethod === "upi") {
          updates.upi_id = upiId;
        } else if (selectedMethod === "bank") {
          updates.bank_account_holder = bankDetails.accountHolder;
          updates.bank_account_number_encrypted = bankDetails.accountNumber;
          updates.bank_ifsc_encrypted = bankDetails.ifsc;
        }

        const { error } = await supabase
          .from("refund_requests")
          .update(updates)
          .eq("id", refundDetails.id);

        if (error) throw error;

        toast.success("Refund details submitted! You'll receive your refund within 24 hours.");
      }

      setSubmitted(true);
    } catch (error: any) {
      console.error("Refund submission error:", error);
      toast.error("Failed to process refund. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground mt-4">Validating refund link...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-md text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
            >
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold mb-2">Link Invalid</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => navigate("/")}>Go to Homepage</Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  if (submitted) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-md text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8"
            >
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold mb-2">Refund Submitted!</h1>
              <p className="text-muted-foreground mb-6">
                {selectedMethod === "gift_card"
                  ? "Your gift card has been created! Check your email for the code."
                  : "Your refund is being processed. You'll receive it within 24 hours."}
              </p>
              <Button onClick={() => navigate("/")}>Go to Homepage</Button>
            </motion.div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <h1 className="font-display text-3xl font-bold mb-2">
              Select <span className="gradient-text">Refund Method</span>
            </h1>
            <p className="text-muted-foreground">
              Choose how you'd like to receive your refund
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Refund Amount</span>
              <span className="text-2xl font-bold text-primary">
                ₹{refundDetails?.amount.toLocaleString()}
              </span>
            </div>
            {refundDetails?.order && (
              <div className="text-sm text-muted-foreground">
                <p>Order for: {refundDetails.order.customer_name}</p>
                <p>Items: {refundDetails.order.items?.length || 0} product(s)</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
              <div className="space-y-4">
                {REFUND_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={method.id}
                      className={`flex items-center space-x-4 p-4 rounded-lg border transition-all cursor-pointer ${
                        selectedMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor={method.id} className="font-medium cursor-pointer">
                          {method.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      {method.instant && (
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                          Instant
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </RadioGroup>

            {/* UPI Details */}
            {selectedMethod === "upi" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 space-y-4"
              >
                <div>
                  <Label htmlFor="upi">UPI ID</Label>
                  <Input
                    id="upi"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </motion.div>
            )}

            {/* Bank Details */}
            {selectedMethod === "bank" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 space-y-4"
              >
                <div>
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input
                    id="accountHolder"
                    placeholder="Enter name as per bank records"
                    value={bankDetails.accountHolder}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="Enter account number"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    placeholder="Enter IFSC code"
                    value={bankDetails.ifsc}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value.toUpperCase() })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="Enter bank name"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </motion.div>
            )}

            <Button
              className="w-full mt-6"
              size="lg"
              onClick={handleSubmit}
              disabled={!selectedMethod || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Refund Method"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              By proceeding, you confirm the refund details are correct
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
