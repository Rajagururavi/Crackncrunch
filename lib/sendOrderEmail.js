import nodemailer from "nodemailer";
export async function sendOrderEmail({ to, order, invoicePdfBuffer }) {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
  } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new Error("Email SMTP configuration is missing.");
  }
  if (!to || !invoicePdfBuffer) {
    throw new Error("Customer email or invoice PDF is missing.");
  }
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  const orderNumber = order?.receipt || order?.razorpay_order_id;
  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: `Crack n Crunch - Order Confirmation ${orderNumber}`,
    text: `Thank you for your order!\n\nYour payment was successful.\nOrder Number: ${orderNumber}\nPayment ID: ${order?.razorpay_payment_id}\n\nYour invoice is attached.`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#333;">
        <h2>Thank you for your order!</h2>
        <p>Your Crack n Crunch order has been confirmed.</p>
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Payment ID:</strong> ${order?.razorpay_payment_id}</p>
        <p>Your invoice PDF is attached to this email.</p>
      </div>
    `,
    attachments: [
      {
        filename: `Invoice-${orderNumber}.pdf`,
        content: invoicePdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
  return true;
}