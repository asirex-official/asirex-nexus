import jsPDF from "jspdf";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

interface Order {
  id: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  items: OrderItem[];
  shipping_address: string;
  tracking_number: string | null;
  customer_phone: string | null;
  customer_name?: string;
  customer_email?: string;
}

// Secret verification pattern - invisible to human eye but detectable
const VERIFICATION_SECRET = "ASX";
const VERIFICATION_PATTERN_KEY = 0x5A5A;

// Generate a unique hash for verification
const generateVerificationHash = (orderId: string, timestamp: number): string => {
  const data = `${VERIFICATION_SECRET}-${orderId}-${timestamp}-${VERIFICATION_PATTERN_KEY}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).toUpperCase();
};

// Generate invisible verification markers
const generateInvisibleMarkers = (orderId: string): { 
  microText: string; 
  colorCode: string;
  positionOffset: number;
  verificationCode: string;
} => {
  const timestamp = Date.now();
  const verificationCode = generateVerificationHash(orderId, timestamp);
  
  // Hidden micro-text pattern
  const microText = `${VERIFICATION_SECRET}${verificationCode}`;
  
  // Subtle color variation (imperceptible to human eye but detectable)
  const colorCode = `rgb(${1 + (timestamp % 3)}, ${1 + ((timestamp >> 2) % 3)}, ${1 + ((timestamp >> 4) % 3)})`;
  
  // Position offset for verification (tiny decimal)
  const positionOffset = 0.001 * (timestamp % 100);
  
  return { microText, colorCode, positionOffset, verificationCode };
};

// Extract verification data from PDF for admin tool
export const extractVerificationData = async (pdfFile: File): Promise<{
  isValid: boolean;
  orderId?: string;
  verificationCode?: string;
  confidence: number;
  message: string;
}> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      
      // Convert to text to search for markers
      const text = new TextDecoder("latin1").decode(bytes);
      
      // Look for our verification patterns
      const asxPattern = /ASX([A-Z0-9]{6,12})/g;
      const orderIdPattern = /Order-ID-([a-f0-9-]{36})/gi;
      const verifyPattern = /ASIREX-VERIFY-([A-Z0-9]+)/g;
      
      const asxMatches = text.match(asxPattern);
      const orderMatches = text.match(orderIdPattern);
      const verifyMatches = text.match(verifyPattern);
      
      // Check for hidden metadata
      const hasHiddenComment = text.includes("/ASIREX_VERIFIED");
      const hasSecretMarker = text.includes("%%ASIREX%%");
      const hasInvisibleText = asxMatches && asxMatches.length > 0;
      const hasOrderId = orderMatches && orderMatches.length > 0;
      const hasVerifyCode = verifyMatches && verifyMatches.length > 0;
      
      // Calculate confidence score
      let confidence = 0;
      if (hasHiddenComment) confidence += 30;
      if (hasSecretMarker) confidence += 25;
      if (hasInvisibleText) confidence += 20;
      if (hasOrderId) confidence += 15;
      if (hasVerifyCode) confidence += 10;
      
      // Extract order ID if found
      let orderId: string | undefined;
      if (orderMatches && orderMatches.length > 0) {
        orderId = orderMatches[0].replace("Order-ID-", "");
      }
      
      // Extract verification code
      let verificationCode: string | undefined;
      if (asxMatches && asxMatches.length > 0) {
        verificationCode = asxMatches[0].replace("ASX", "");
      } else if (verifyMatches && verifyMatches.length > 0) {
        verificationCode = verifyMatches[0].replace("ASIREX-VERIFY-", "");
      }
      
      const isValid = confidence >= 50;
      
      resolve({
        isValid,
        orderId,
        verificationCode,
        confidence,
        message: isValid 
          ? `Invoice verified as AUTHENTIC with ${confidence}% confidence`
          : `Invoice detected as FAKE - Missing official ASIREX verification markers (${confidence}% match)`
      });
    };
    
    reader.onerror = () => {
      resolve({
        isValid: false,
        confidence: 0,
        message: "Error reading file - Unable to verify"
      });
    };
    
    reader.readAsArrayBuffer(pdfFile);
  });
};

export const generateInvoicePDF = (order: Order, userName?: string, userEmail?: string): void => {
  const doc = new jsPDF();
  const markers = generateInvisibleMarkers(order.id);
  
  // ASIREX Brand Colors (matching website theme)
  const primaryColor: [number, number, number] = [0, 212, 255]; // Cyan #00D4FF
  const accentColor: [number, number, number] = [0, 255, 178]; // Green #00FFB2
  const darkBg: [number, number, number] = [10, 12, 16]; // Dark background
  const textColor: [number, number, number] = [230, 235, 240]; // Light text
  const mutedColor: [number, number, number] = [120, 130, 150]; // Muted text
  
  // Hidden verification - Add invisible metadata (imperceptible but detectable)
  // @ts-ignore - Adding custom property for verification
  doc.setProperties({
    title: `ASIREX Invoice - ${order.id.slice(0, 8).toUpperCase()}`,
    subject: `Order Invoice Order-ID-${order.id}`,
    author: "ASIREX Official",
    keywords: `ASIREX-VERIFY-${markers.verificationCode}, ${markers.microText}`,
    creator: `ASIREX Invoice Generator %%ASIREX%% /ASIREX_VERIFIED`
  });
  
  // Background
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, 210, 297, "F");
  
  // Header gradient effect (simulated with rectangles)
  for (let i = 0; i < 15; i++) {
    const colorIntensity = Math.max(0, 212 - (i * 14));
    doc.setFillColor(0, colorIntensity, 255);
    doc.rect(0, i * 2, 210, 2, "F");
  }
  
  // ASIREX Logo/Text
  doc.setFontSize(32);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("ASIREX", 20, 30);
  
  // Hidden verification text (invisible - same color as background)
  doc.setFontSize(1);
  doc.setTextColor(...darkBg);
  doc.text(`ASX${markers.verificationCode}`, 20 + markers.positionOffset, 30.1);
  doc.text(`Order-ID-${order.id}`, 100, 297);
  
  // Tagline
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.setFont("helvetica", "normal");
  doc.text("Premium Tech Solutions", 20, 38);
  
  // Invoice Title
  doc.setFontSize(24);
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 150, 30);
  
  // Invoice details box
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(130, 35, 60, 25, 3, 3, "S");
  
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("Invoice No:", 135, 43);
  doc.text("Date:", 135, 50);
  doc.text("Status:", 135, 57);
  
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "bold");
  doc.text(`#${order.id.slice(0, 8).toUpperCase()}`, 160, 43);
  doc.text(new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }), 160, 50);
  
  // Payment status with color
  if (order.payment_status === "paid") {
    doc.setTextColor(...accentColor);
    doc.text("PAID", 160, 57);
  } else {
    doc.setTextColor(255, 180, 0);
    doc.text("PENDING", 160, 57);
  }
  
  // Divider line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.line(20, 70, 190, 70);
  
  // Hidden micro-pattern in divider (verification)
  doc.setDrawColor(...darkBg);
  doc.setLineWidth(0.01);
  for (let i = 0; i < markers.verificationCode.length; i++) {
    const x = 20 + (i * 2) + markers.positionOffset;
    doc.line(x, 70.01, x + 0.1, 70.01);
  }
  
  // Bill To Section
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", 20, 82);
  
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "normal");
  const customerName = userName || "Valued Customer";
  doc.text(customerName, 20, 90);
  
  if (userEmail) {
    doc.setTextColor(...mutedColor);
    doc.text(userEmail, 20, 96);
  }
  
  if (order.customer_phone) {
    doc.setTextColor(...mutedColor);
    doc.text(`Phone: ${order.customer_phone}`, 20, userEmail ? 102 : 96);
  }
  
  // Ship To Section
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("SHIP TO", 110, 82);
  
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "normal");
  
  // Parse and format address
  const addressLines = order.shipping_address.split(",").map(line => line.trim());
  let addressY = 90;
  addressLines.forEach((line, index) => {
    if (index < 4) {
      doc.text(line, 110, addressY);
      addressY += 6;
    }
  });
  
  // Items Table Header
  const tableTop = 125;
  doc.setFillColor(20, 25, 35);
  doc.roundedRect(20, tableTop, 170, 12, 2, 2, "F");
  
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("ITEM", 25, tableTop + 8);
  doc.text("QTY", 120, tableTop + 8);
  doc.text("PRICE", 140, tableTop + 8);
  doc.text("TOTAL", 165, tableTop + 8);
  
  // Items
  let itemY = tableTop + 20;
  doc.setFont("helvetica", "normal");
  
  order.items.forEach((item, index) => {
    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(15, 18, 25);
      doc.rect(20, itemY - 5, 170, 12, "F");
    }
    
    doc.setTextColor(...textColor);
    const itemName = item.name.length > 35 ? item.name.substring(0, 35) + "..." : item.name;
    doc.text(itemName, 25, itemY + 2);
    
    doc.setTextColor(...mutedColor);
    doc.text(item.quantity.toString(), 120, itemY + 2);
    doc.text(`₹${item.price.toLocaleString()}`, 140, itemY + 2);
    
    doc.setTextColor(...textColor);
    doc.text(`₹${(item.price * item.quantity).toLocaleString()}`, 165, itemY + 2);
    
    itemY += 12;
  });
  
  // Totals Section
  const totalsY = itemY + 15;
  doc.setDrawColor(30, 35, 45);
  doc.line(100, totalsY - 5, 190, totalsY - 5);
  
  // Subtotal
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text("Subtotal:", 120, totalsY + 5);
  doc.setTextColor(...textColor);
  doc.text(`₹${order.total_amount.toLocaleString()}`, 165, totalsY + 5);
  
  // Shipping
  doc.setTextColor(...mutedColor);
  doc.text("Shipping:", 120, totalsY + 13);
  doc.setTextColor(...accentColor);
  doc.text("FREE", 165, totalsY + 13);
  
  // Tax
  doc.setTextColor(...mutedColor);
  doc.text("Tax (Incl.):", 120, totalsY + 21);
  doc.setTextColor(...textColor);
  doc.text("Included", 165, totalsY + 21);
  
  // Total
  doc.setDrawColor(...primaryColor);
  doc.line(115, totalsY + 26, 190, totalsY + 26);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("TOTAL:", 120, totalsY + 36);
  doc.text(`₹${order.total_amount.toLocaleString()}`, 160, totalsY + 36);
  
  // Payment Method Box
  const paymentY = totalsY + 50;
  doc.setFillColor(15, 20, 30);
  doc.roundedRect(20, paymentY, 80, 25, 3, 3, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("Payment Method", 25, paymentY + 10);
  
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  doc.setFont("helvetica", "bold");
  const paymentMethodText = order.payment_method === "cod" 
    ? "Cash on Delivery" 
    : order.payment_method === "upi" 
      ? "UPI Payment"
      : order.payment_method === "razorpay"
        ? "Online Payment"
        : order.payment_method.toUpperCase();
  doc.text(paymentMethodText, 25, paymentY + 19);
  
  // Order Status Box
  doc.setFillColor(15, 20, 30);
  doc.roundedRect(110, paymentY, 80, 25, 3, 3, "F");
  
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.setFont("helvetica", "normal");
  doc.text("Order Status", 115, paymentY + 10);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  const statusColor: [number, number, number] = 
    order.order_status === "delivered" ? accentColor :
    order.order_status === "shipped" ? [0, 150, 255] :
    order.order_status === "processing" ? [255, 180, 0] :
    mutedColor;
  doc.setTextColor(...statusColor);
  doc.text(order.order_status.toUpperCase(), 115, paymentY + 19);
  
  // Footer
  const footerY = 260;
  
  // Decorative line
  doc.setDrawColor(30, 35, 45);
  doc.line(20, footerY, 190, footerY);
  
  // Thank you message
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.text("Thank you for shopping with ASIREX!", 105, footerY + 12, { align: "center" });
  
  // Support info
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.setFont("helvetica", "normal");
  doc.text("For support, contact us at support@asirex.com", 105, footerY + 20, { align: "center" });
  doc.text("www.asirex.com", 105, footerY + 26, { align: "center" });
  
  // Hidden verification footer (invisible)
  doc.setFontSize(0.5);
  doc.setTextColor(...darkBg);
  doc.text(`%%ASIREX%% ASIREX-VERIFY-${markers.verificationCode} Order-ID-${order.id} /ASIREX_VERIFIED`, 105, 296, { align: "center" });
  
  // Tiny verification mark (imperceptible dot)
  doc.setFillColor(11, 13, 17); // Slightly different from bg
  doc.circle(105, 290, 0.3, "F");
  
  // Save the PDF
  doc.save(`ASIREX-Invoice-${order.id.slice(0, 8).toUpperCase()}.pdf`);
};
