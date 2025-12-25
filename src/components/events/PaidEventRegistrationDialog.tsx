import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Mail, Phone, CheckCircle, ArrowRight, Info, Shield, Clock, AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface PaidEventRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: {
    id: string;
    name: string;
    ticket_price: number;
    event_date: string;
    location?: string;
  };
  onSuccess?: () => void;
}

type Step = "info" | "email" | "otp" | "payment";

export function PaidEventRegistrationDialog({
  open,
  onOpenChange,
  event,
  onSuccess,
}: PaidEventRegistrationDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("info");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [payuData, setPayuData] = useState<any>(null);
  const payuFormRef = useRef<HTMLFormElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep("info");
      setEmail("");
      setPhone("");
      setName("");
      setOtp("");
      setRegistrationId(null);
      setPayuData(null);
    }
  }, [open]);

  // Submit PayU form when data is ready
  useEffect(() => {
    if (payuData && payuFormRef.current) {
      payuFormRef.current.submit();
    }
  }, [payuData]);

  const handleInfoNext = () => {
    setStep("email");
  };

  const handleEmailSubmit = async () => {
    if (!email || !phone || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!user) {
      toast.error("Please login first");
      return;
    }

    setLoading(true);
    try {
      // Create pending registration
      const { data: registration, error: regError } = await supabase
        .from("event_registrations")
        .insert({
          event_id: event.id,
          user_id: user.id,
          status: "pending_payment",
          payment_status: "pending",
          email: email,
        })
        .select()
        .single();

      if (regError) {
        if (regError.code === "23505") {
          toast.error("You are already registered for this event");
          onOpenChange(false);
          return;
        }
        throw regError;
      }

      setRegistrationId(registration.id);

      // Send OTP
      const { error: otpError } = await supabase.functions.invoke("send-event-otp", {
        body: {
          email,
          registration_id: registration.id,
          event_name: event.name,
        },
      });

      if (otpError) throw otpError;

      toast.success("OTP sent to your email!");
      setStep("otp");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (otp.length !== 6 || !registrationId) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-event-otp", {
        body: {
          registration_id: registrationId,
          otp,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Email verified!");
      setStep("payment");
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!registrationId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("initiate-event-payment", {
        body: {
          registration_id: registrationId,
          event_id: event.id,
          event_name: event.name,
          amount: event.ticket_price,
          email,
          phone,
          user_name: name,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setPayuData(data);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!registrationId) return;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-event-otp", {
        body: {
          email,
          registration_id: registrationId,
          event_name: event.name,
        },
      });

      if (error) throw error;
      toast.success("OTP resent!");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg glass-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Register for Event
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {step === "info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Event Details */}
                <div className="glass-card p-4 bg-muted/30">
                  <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.event_date), "MMM d, yyyy")}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-2xl font-bold">
                    ₹{event.ticket_price.toLocaleString()}
                  </div>
                </div>

                {/* Info Cards */}
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                    <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Before the Event</p>
                      <p className="text-xs text-muted-foreground">
                        You'll receive a call and email with the event location and details one day before the event.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
                    <Shield className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">At the Event</p>
                      <p className="text-xs text-muted-foreground">
                        When you arrive, you'll be asked to provide the email you registered with. If verified, you'll receive an OTP to enter.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Important</p>
                      <p className="text-xs text-muted-foreground">
                        Only registered emails can enter. Non-registered emails will be rejected at entry.
                      </p>
                    </div>
                  </div>
                </div>

                <Button variant="hero" className="w-full" onClick={handleInfoNext}>
                  Continue to Registration
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === "email" && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Enter your details. We'll send an OTP to verify your email.
                </p>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("info")} className="flex-1">
                    Back
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={handleEmailSubmit}
                    disabled={loading || !email || !phone || !name}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Send OTP
                        <Mail className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <Mail className="w-12 h-12 mx-auto text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit OTP sent to <strong>{email}</strong>
                  </p>
                </div>

                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <Button
                  variant="link"
                  className="w-full text-sm"
                  onClick={resendOtp}
                  disabled={loading}
                >
                  Didn't receive OTP? Resend
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep("email")} className="flex-1">
                    Back
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={handleOtpVerify}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Verify OTP
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-accent mb-2" />
                  <h3 className="font-semibold text-lg">Email Verified!</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete your payment to confirm registration
                  </p>
                </div>

                <div className="glass-card p-4 bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Event</span>
                    <span className="font-medium">{event.name}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="text-2xl font-bold">₹{event.ticket_price.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Pay ₹{event.ticket_price.toLocaleString()} to Register
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Hidden PayU Form */}
      {payuData && (
        <form
          ref={payuFormRef}
          action="https://test.payu.in/_payment"
          method="POST"
          style={{ display: "none" }}
        >
          <input type="hidden" name="key" value={payuData.key} />
          <input type="hidden" name="txnid" value={payuData.txnid} />
          <input type="hidden" name="amount" value={payuData.amount} />
          <input type="hidden" name="productinfo" value={payuData.productinfo} />
          <input type="hidden" name="firstname" value={payuData.firstname} />
          <input type="hidden" name="email" value={payuData.email} />
          <input type="hidden" name="phone" value={payuData.phone} />
          <input type="hidden" name="surl" value={payuData.surl} />
          <input type="hidden" name="furl" value={payuData.furl} />
          <input type="hidden" name="hash" value={payuData.hash} />
        </form>
      )}
    </>
  );
}