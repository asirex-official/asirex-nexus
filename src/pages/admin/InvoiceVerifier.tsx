import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, Shield, ShieldCheck, ShieldX, Loader2, AlertTriangle, CheckCircle, XCircle, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { extractVerificationData } from "@/utils/invoiceGenerator";
import { supabase } from "@/integrations/supabase/client";

interface VerificationResult {
  isValid: boolean;
  orderId?: string;
  verificationCode?: string;
  confidence: number;
  message: string;
  orderDetails?: {
    id: string;
    created_at: string;
    total_amount: number;
    customer_name: string;
    order_status: string;
  };
}

export default function InvoiceVerifier() {
  const [isDragging, setIsDragging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await verifyFile(files[0]);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await verifyFile(files[0]);
    }
  };

  const verifyFile = async (file: File) => {
    if (!file.type.includes("pdf")) {
      setResult({
        isValid: false,
        confidence: 0,
        message: "Invalid file type. Please upload a PDF invoice."
      });
      return;
    }

    setIsVerifying(true);
    setFileName(file.name);
    setResult(null);

    try {
      // Extract verification data from PDF
      const verificationResult = await extractVerificationData(file);
      
      // If we found an order ID, verify it exists in database
      if (verificationResult.orderId) {
        const { data: orderData } = await supabase
          .from("orders")
          .select("id, created_at, total_amount, customer_name, order_status")
          .eq("id", verificationResult.orderId)
          .single();

        if (orderData) {
          setResult({
            ...verificationResult,
            orderDetails: orderData
          });
        } else {
          setResult({
            ...verificationResult,
            isValid: false,
            confidence: Math.min(verificationResult.confidence, 30),
            message: "Order ID found in invoice but does not exist in our database - SUSPICIOUS"
          });
        }
      } else {
        setResult(verificationResult);
      }
    } catch (error) {
      setResult({
        isValid: false,
        confidence: 0,
        message: "Error verifying invoice. Please try again."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setResult(null);
    setFileName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoice Verification Tool</h1>
          <p className="text-muted-foreground">
            Detect fake invoices by analyzing hidden ASIREX verification markers
          </p>
        </div>
      </div>

      {/* How it works */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            How Verification Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Every invoice generated from our official website contains hidden verification markers that are:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Invisible to the human eye</li>
            <li>Embedded in PDF metadata and structure</li>
            <li>Unique to each order with cryptographic signatures</li>
            <li>Impossible to replicate without access to our system</li>
          </ul>
          <p className="text-primary/80 font-medium mt-3">
            Simply upload any invoice claiming to be from ASIREX - we'll tell you if it's real or fake.
          </p>
        </CardContent>
      </Card>

      {/* Upload Zone */}
      <Card className="bg-card/50 border-border/50">
        <CardContent className="pt-6">
          <motion.div
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300
              ${isDragging 
                ? "border-primary bg-primary/10" 
                : result 
                  ? result.isValid 
                    ? "border-green-500/50 bg-green-500/5" 
                    : "border-red-500/50 bg-red-500/5"
                  : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isVerifying}
            />

            <AnimatePresence mode="wait">
              {isVerifying ? (
                <motion.div
                  key="verifying"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-4"
                >
                  <div className="relative w-20 h-20 mx-auto">
                    <Loader2 className="w-20 h-20 text-primary animate-spin" />
                    <Shield className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">Analyzing Invoice...</p>
                    <p className="text-sm text-muted-foreground">Scanning for hidden verification markers</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-4"
                >
                  {result.isValid ? (
                    <ShieldCheck className="w-20 h-20 text-green-500 mx-auto" />
                  ) : (
                    <ShieldX className="w-20 h-20 text-red-500 mx-auto" />
                  )}
                  <div>
                    <p className={`text-lg font-bold ${result.isValid ? "text-green-500" : "text-red-500"}`}>
                      {result.isValid ? "AUTHENTIC INVOICE" : "FAKE INVOICE DETECTED"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-4"
                >
                  <FileUp className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-foreground">
                      {isDragging ? "Drop invoice here" : "Upload Invoice to Verify"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Drag & drop a PDF or click to browse
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>

      {/* Verification Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`border-2 ${result.isValid ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3">
                  {result.isValid ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  Verification Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Message */}
                <div className={`p-4 rounded-lg ${result.isValid ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  <p className={`font-medium ${result.isValid ? "text-green-400" : "text-red-400"}`}>
                    {result.message}
                  </p>
                </div>

                {/* Confidence Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Authenticity Confidence</span>
                    <span className={result.isValid ? "text-green-400" : "text-red-400"}>
                      {result.confidence}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        result.confidence >= 70 ? "bg-green-500" :
                        result.confidence >= 40 ? "bg-yellow-500" :
                        "bg-red-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Verification Details */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.verificationCode && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Verification Code</p>
                      <p className="font-mono text-sm text-foreground">{result.verificationCode}</p>
                    </div>
                  )}
                  {result.orderId && (
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Order ID</p>
                      <p className="font-mono text-sm text-foreground">{result.orderId.slice(0, 8).toUpperCase()}</p>
                    </div>
                  )}
                </div>

                {/* Order Details from Database */}
                {result.orderDetails && (
                  <div className="p-4 bg-muted/20 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <p className="font-medium text-foreground">Order Found in Database</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Customer: </span>
                        <span className="text-foreground">{result.orderDetails.customer_name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Amount: </span>
                        <span className="text-foreground">₹{result.orderDetails.total_amount.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date: </span>
                        <span className="text-foreground">
                          {new Date(result.orderDetails.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status: </span>
                        <span className="text-foreground capitalize">{result.orderDetails.order_status}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warning for fake invoices */}
                {!result.isValid && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-400">Warning: Fraudulent Document</p>
                      <p className="text-red-400/80 mt-1">
                        This invoice does not contain official ASIREX verification markers. 
                        It may be a forged or manipulated document. Do not accept this as proof of purchase.
                      </p>
                    </div>
                  </div>
                )}

                {/* Reset Button */}
                <Button onClick={resetVerification} variant="outline" className="w-full">
                  Verify Another Invoice
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
