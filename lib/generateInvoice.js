import PDFDocument from "pdfkit";
export async function generateInvoice(order, settings = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        bufferPages: true,
      });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      const customer = order.customer || {};
      const summary = order.summary || {};
      const items = order.items || [];
      const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
      const date = order.orderDate || order.createdAt;
      const formattedDate = date
        ? new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "N/A";
      const pageWidth = doc.page.width - 80;
      const left = 40;
      const right = left + pageWidth;
      doc.font("Helvetica-Bold").fontSize(21).fillColor("#166534").text("CRACK N CRUNCH", left, 40);
      doc.font("Helvetica").fontSize(9).fillColor("#333333").text(settings.address || "N/A", left, 70, {
        width: pageWidth,
      });
      doc.text(`Phone: ${settings.phone || "N/A"}`);
      doc.text(`Email: ${settings.email || "N/A"}`);
      doc.text(`GSTIN: ${settings.gst || "N/A"}`);
      doc.text(`FSSAI License No: ${settings.fssai || "N/A"}`);
      doc.moveDown(1);
      doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor("#222222").lineWidth(1.5).stroke();
      doc.moveDown(1);
      doc.font("Helvetica-Bold").fontSize(18).text("TAX INVOICE", {
        align: "center",
      });
      doc.font("Helvetica").fontSize(9).fillColor("#666666").text("Original for Recipient", {
        align: "center",
      });
      doc.moveDown(1.5);
      const infoY = doc.y;
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#222222").text(`Invoice Number: INV-${order.receipt || "N/A"}`, left, infoY).text(`Order Number: ${order.receipt || "N/A"}`, left, infoY + 16).text(`Invoice Date: ${formattedDate}`, left, infoY + 32);
      doc.font("Helvetica").text(`Payment Method: ${order.paymentMethod || "N/A"}`, 320, infoY).text(`Payment Status: ${order.paymentStatus || "Pending"}`, 320, infoY + 16).text(`Transaction ID: ${order.razorpay_payment_id || order.transactionId || "N/A"}`, 320, infoY + 32, {
        width: 235,
      });
      doc.y = infoY + 60;
      doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor("#cccccc").stroke();
      doc.moveDown(1);
      const customerY = doc.y;
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#166534").text("Bill To", left, customerY);
      doc.text("Ship To", 310, customerY);
      doc.font("Helvetica").fontSize(9).fillColor("#222222");
      const customerDetails = [
        customer.fullname || "N/A",
        customer.mobile || "N/A",
        customer.email || "N/A",
        customer.address || "N/A",
        [
          customer.city,
          customer.state,
          customer.pincode,
          customer.country,
        ].filter(Boolean).join(", "),
      ];
      customerDetails.forEach((value, index) => {
        doc.text(value, left, customerY + 20 + index * 14, {
          width: 245,
        });
      });
      customerDetails.filter((_, index) => index !== 2).forEach((value, index) => {
        doc.text(value, 310, customerY + 20 + index * 14, {
        width: 245,
        });
      });
      doc.y = customerY + 105;
      const drawTableHeader = () => {
        const y = doc.y;
        doc.rect(left, y, pageWidth, 25).fill("#eeeeee");
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#222222");
        doc.text("#", left + 7, y + 8, { width: 20 });
        doc.text("Product", left + 35, y + 8, { width: 210 });
        doc.text("Weight", left + 250, y + 8, { width: 65 });
        doc.text("Qty", left + 325, y + 8, { width: 35 });
        doc.text("Amount", left + 370, y + 8, {
          width: 105,
          align: "right",
        });
        doc.y = y + 25;
      };
      drawTableHeader();
      items.forEach((item, index) => {
        const quantity = Number(item.quantity || 1);
        const price = Number(item.final_price || 0);
        const total = quantity * price;
        const productName = item.product_title || "Product";
        const weight = item.weight || "N/A";
        const productHeight = Math.max(30, doc.heightOfString(productName, { width: 205 }) + 15);
        if (doc.y + productHeight > doc.page.height - 155) {
          doc.addPage();
          drawTableHeader();
        }
        const y = doc.y;
        doc.font("Helvetica").fontSize(9).fillColor("#222222");
        doc.text(String(index + 1), left + 7, y + 9, { width: 20 });
        doc.text(productName, left + 35, y + 8, { width: 205 });
        doc.text(weight, left + 250, y + 9, { width: 65 });
        doc.text(String(quantity), left + 325, y + 9, { width: 35 });
        doc.text(money(total), left + 370, y + 9, {
          width: 105,
          align: "right",
        });
        doc.moveTo(left, y + productHeight).lineTo(right, y + productHeight).strokeColor("#cccccc").stroke();
        doc.y = y + productHeight;
      });
      if (doc.y > doc.page.height - 145) {
        doc.addPage();
      }
      doc.moveDown(1);
      const totalX = 340;
      const totalWidth = 215;
      const drawTotal = (label, value, bold = false) => {
        doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(bold ? 12 : 10).fillColor("#222222").text(label, totalX, doc.y, { 
            width: 100 
        });
        const y = doc.y;
        doc.text(money(value), totalX + 100, y, {
          width: 115,
          align: "right",
        });
        doc.y = y + 20;
      };
      drawTotal("Subtotal", summary.subtotal);
      drawTotal("Shipping", summary.shipping);
      drawTotal("Grand Total", summary.total, true);
      doc.moveDown(1);
      doc.moveTo(left, doc.y).lineTo(right, doc.y).strokeColor("#cccccc").stroke();
      doc.moveDown(2);
      doc.font("Helvetica-Bold").fontSize(13).fillColor("#166534").text("Thank You For Your Order!", {
        align: "center",
      });
      doc.font("Helvetica").fontSize(9).fillColor("#333333").text("Thank you for shopping with Crack N Crunch.", {
        align: "center",
      });
      doc.text("For any queries, please contact us.", {
        align: "center",
      });
      doc.moveDown(2);
      doc.font("Helvetica-Bold").fontSize(10).text("For CRACK N CRUNCH", {
        align: "right",
      });
      doc.font("Helvetica").fontSize(9).text("Authorized Signatory", {
        align: "right",
      });
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}