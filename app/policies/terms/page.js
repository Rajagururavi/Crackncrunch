"use client";
import { useEffect, useState } from "react";
export default function TermsPage() {
  const [contact, setContact] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    async function fetchSettings() {
      try {
        const response = await fetch("/api/site-settings", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Settings API error: ${response.status}`);
        }
        const data = await response.json();
        console.log("Site settings:", data);
        if (!cancelled && data.success) {
          setContact(data.contact || {});
        }
      } catch (error) {
        console.error("Settings fetch error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, []);
  const address = typeof contact.address === "string" ? contact.address : [
        contact.address?.line1,
        contact.address?.line2,
        contact.address?.city,
        contact.address?.state,
        contact.address?.pincode,
    ]
    .filter(Boolean).join(", ");
  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: #fff;
          color: #333;
        }
        .terms-banner {
          width: 100%;
          height: 320px;
          margin-top: 110px;
          position: relative;
          overflow: hidden;
        }
        .terms-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .terms-banner::before {
          content: "";
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.45);
          z-index: 1;
        }
        .banner-text {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 95%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #fff;
          z-index: 2;
        }
        .banner-text h1 {
          margin: 0 0 12px;
          font-size: 32px;
          font-weight: 700;
        }
        .banner-text a {
          color: #fff;
          text-decoration: none;
          font-weight: 600;
        }
        .banner-text a:hover {
          color: #f5deb3;
        }
        .terms-content {
          margin-left: 80px;
          padding: 40px 80px;
          color: #333;
          overflow-wrap: anywhere;
        }
        .terms-content h1 {
          position: relative;
          margin-top: 40px;
          margin-bottom: 20px;
          padding-top: 20px;
          font-size: 30px;
          line-height: 1.4;
        }
        .terms-content h1::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: #ddd;
        }
        .terms-content h1:first-child::before {
          display: none;
        }
        .terms-content h1:first-child {
          margin-top: 0;
          padding-top: 0;
        }
        .terms-content h2 {
          margin-top: 25px;
          font-size: 18px;
        }
        .terms-content p {
          margin: 0;
          font-size: 14px;
          line-height: 1.8;
          color: #555;
        }
        .terms-content .terms-intro {
          margin-bottom: 20px;
        }
        .terms-contact {
          line-height: 1.8;
          overflow-wrap: anywhere;
        }
        .terms-contact strong {
          color: #333;
        }
        .terms-loading {
          color: #777;
          font-size: 12px;
        }
        @media (max-width: 768px) {
          .terms-banner {
            height: 180px;
            margin-top: 90px;
          }
          .banner-text {
            font-size: 13px;
          }
          .banner-text h1 {
            font-size: 24px;
          }
          .terms-content {
            margin-left: 0;
            padding: 25px 20px;
          }
          .terms-content h1 {
            font-size: 25px;
            margin-top: 30px;
          }
          .terms-content h2 {
            font-size: 17px;
          }
        }
        @media (max-width: 480px) {
          .terms-banner {
            height: 160px;
            margin-top: 80px;
          }
          .banner-text h1 {
            font-size: 21px;
          }
          .terms-content {
            padding: 20px 16px;
          }
          .terms-content h1 {
            font-size: 22px;
          }
          .terms-content p {
            font-size: 13px;
            line-height: 1.8;
          }
        }
      `}</style>
      <div className="terms-banner">
        <img src="/uploads/TNC.png" alt="Terms and Conditions" />

        <div className="banner-text">
          <h1>Terms &amp; Conditions</h1>
          <a href="/">Home</a>
          <span> &gt;&gt; </span>
          <span>Terms &amp; Conditions</span>
        </div>
      </div>
      <div className="terms-content">
        <h1>Terms &amp; Conditions</h1>
        <div className="terms-intro">
          <p>
            <strong>Brand Name:</strong>{" "}
            {contact.brand || "CRACK N CRUNCH"}
            <br />
            <strong>Business Type:</strong> Online Sale of Dry Fruits
            (Retail, Bulk &amp; B2B)
            <br />
            <strong>Established:</strong> September 2026
            <br />
            <strong>Applicable Law:</strong> Laws of India
            <br />
            <br />
            These Terms and Conditions (&ldquo;Terms&rdquo;) govern your
            access to and use of the CRACK N CRUNCH website, products, and
            services. By accessing, browsing, or making a purchase on our
            website, you agree to be bound by these Terms.
            <br />
            <br />
            If you do not agree with any part of these Terms, please do not
            use our website or services.
          </p>
        </div>
        <h1>1. General</h1>
        <p>
          1.1 CRACK N CRUNCH operates an e-commerce platform for the sale
          of dry fruits, nuts, seeds, berries, dates, and related products
          through retail, bulk, and B2B channels.
          <br />
          <br />
          1.2 These Terms apply to all customers, including domestic
          (India) and international buyers, as well as retail and business
          (B2B) customers.
          <br />
          <br />
          1.3 We reserve the right to modify, update, or replace these
          Terms at any time without prior notice. Continued use of the
          website after changes constitutes acceptance of the revised
          Terms.
        </p>
        <h1>2. Eligibility</h1>
        <p>
          2.1 You must be at least 18 years of age to use this website or
          place an order. If you are under 18, you may use the website
          only under the supervision of a parent or legal guardian.
          <br />
          <br />
          2.2 By placing an order, you confirm that all information
          provided by you is accurate, complete, and current.
        </p>
        <h1>3. Product Information &amp; Disclaimer</h1>
        <p>
          3.1 CRACK N CRUNCH products are natural agricultural goods.
          Variations in size, color, texture, taste, and appearance are
          inherent and do not constitute defects.
          <br />
          <br />
          3.2 Product images displayed on the website are for reference
          purposes only and may differ slightly from the actual product.
          <br />
          <br />
          3.3 While we make every effort to ensure product quality and
          accuracy of descriptions, CRACK N CRUNCH does not guarantee
          that product information is error-free or uninterrupted.
        </p>
        <h1>4. Pricing, Taxes &amp; Payments</h1>
        <p>
          4.1 All prices are displayed in Indian Rupees (INR) unless
          stated otherwise and may be inclusive or exclusive of applicable
          taxes.
          <br />
          <br />
          4.2 <strong>Domestic Orders (India):</strong>
          <br />
          Goods and Services Tax (GST) shall be charged as per prevailing
          government regulations.
          <br />
          <br />
          4.3 <strong>International Orders:</strong>
          <br />
          Customers are solely responsible for any customs duties, import
          taxes, clearance charges, or local levies imposed by the
          destination country.
          <br />
          <br />
          4.4 CRACK N CRUNCH reserves the right to correct any pricing
          errors, inaccuracies, or omissions and to cancel orders placed
          at incorrect prices.
        </p>
        <h1>5. Intellectual Property</h1>
        <p>
          5.1 All content on this website, including but not limited to
          text, images, logos, trademarks, graphics, and design elements,
          is the exclusive property of CRACK N CRUNCH.
          <br />
          <br />
          5.2 No content may be copied, reproduced, republished,
          distributed, or used in any form without prior written
          permission from CRACK N CRUNCH.
        </p>
        <h1>6. Limitation of Liability</h1>
        <p>
          6.1 CRACK N CRUNCH shall not be liable for any indirect,
          incidental, consequential, or special damages arising from the
          use of, or inability to use, our products or services.
          <br />
          <br />
          6.2 Our maximum liability, in any case, shall be limited to the
          amount paid by the customer for the product in question, to the
          extent permitted by applicable law.
        </p>
        <h1>7. Shipping Policy</h1>
        <p>
          7.1 <strong>Shipping Coverage:</strong>
          <br />
          We deliver across India and to selected international
          destinations. Bulk and B2B shipments may be subject to separate
          logistics arrangements.
          <br />
          <br />
          7.2 <strong>Dispatch Timeline:</strong>
          <br />
          Orders are typically dispatched within 2–5 business days after
          confirmation. Bulk/B2B orders may require additional processing
          time.
          <br />
          <br />
          7.3 <strong>Delivery Time:</strong>
          <br />
          <br />
          • Domestic: Approximately 3–7 business days
          <br />
          <br />
          • International: Approximately 7–21 business days, depending on
          destination, customs clearance, and courier partner
          <br />
          <br />
          7.4 <strong>Customs &amp; International Duties:</strong>
          <br />
          CRACK N CRUNCH is not responsible for customs delays, duties,
          or taxes. Any such charges must be borne entirely by the
          customer.
        </p>
        <h1>8. Returns, Refunds &amp; Replacements</h1>
        <p>
          8.1 Due to the consumable and perishable nature of food
          products, returns are limited.
          <br />
          <br />
          8.2 <strong>Eligible Cases:</strong>
          <br />
          <br />
          • Damaged products
          <br />
          <br />
          • Incorrect items delivered
          <br />
          <br />
          • Expired products
          <br />
          <br />
          Requests must be submitted within 48 hours of delivery,
          supported by an unboxing video and clear images.
          <br />
          <br />
          8.3 <strong>Refund Processing:</strong>
          <br />
          <br />
          Approved refunds will be processed within 7–10 business days
          and credited to the original payment method.
          <br />
          <br />
          8.4 <strong>Non-Refundable Items:</strong>
          <br />
          <br />
          • Opened or consumed products
          <br />
          <br />
          • Bulk/B2B orders unless quality deviation is proven
          <br />
          <br />
          • International orders once dispatched
        </p>
        <h1>9. Order Cancellation</h1>
        <p>
          9.1 <strong>Customer-Initiated Cancellations:</strong>
          <br />
          Orders may be cancelled within 12 hours of placement or before
          dispatch, whichever is earlier, subject to applicable law.
          <br />
          <br />
          9.2 <strong>CRACK N CRUNCH-Initiated Cancellations:</strong>
          <br />
          We reserve the right to cancel orders due to:
          <br />
          <br />
          • Stock unavailability
          <br />
          <br />
          • Pricing or technical errors
          <br />
          <br />
          • Regulatory or compliance requirements
          <br />
          <br />
          In such cases, any applicable refund will be issued.
        </p>
        <h1>10. Bulk &amp; B2B Orders</h1>
        <p>
          10.1 <strong>Advance Payment:</strong>
          <br />
          Bulk and B2B orders require partial or full advance payment as
          agreed at the time of order.
          <br />
          <br />
          10.2 <strong>Quality &amp; Acceptance:</strong>
          <br />
          Products are deemed accepted upon delivery. Any quality
          concerns must be reported within 24 hours of receipt, subject
          to applicable consumer rights.
          <br />
          <br />
          10.3 <strong>Resale Disclaimer:</strong>
          <br />
          CRACK N CRUNCH shall not be liable for consequences arising
          from resale, repackaging, relabeling, or redistribution by
          B2B buyers, except where liability cannot legally be excluded.
        </p>
        <h1>11. Regulatory Compliance</h1>
        <p>
          CRACK N CRUNCH operates in accordance with applicable Indian
          laws and regulations, including:
          <br />
          <br />
          <strong>• GST Regulations</strong> for domestic transactions
          <br />
          <br />
          <strong>• FSSAI Guidelines</strong> for food safety, packaging,
          and labeling
          <br />
          <br />
          <strong>• Export Compliance</strong> for international
          shipments under applicable Indian export laws
        </p>
        <h1>12. Governing Law &amp; Jurisdiction</h1>
        <p>
          These Terms shall be governed by and construed in accordance
          with the laws of India. Any disputes shall be subject to the
          jurisdiction of competent courts in India.
        </p>
        <h1>13. Contact Information</h1>
        <div className="terms-contact">
          <p>
            <strong>Brand:</strong>{" "}
            {contact.brand || "CRACK N CRUNCH"}
            <br />
            <strong>FSSAI License No:</strong>{" "}
            {contact.fssaiLicenseNo || ""}
            <br />
            <strong>GST Registration No:</strong>{" "}
            {contact.gstRegistrationNo || ""}
            <br />
            <br />
            <strong>Address:</strong>
            <br />
            {address || ""}
            <br />
            <br />

            <strong>Phone:</strong>{" "}
            {contact.phone || ""}
            <br />

            <strong>Email:</strong>{" "}
            {contact.email || ""}
          </p>
          {loading && (
            <p className="terms-loading">
              Loading latest contact details...
            </p>
          )}
        </div>
      </div>
    </>
  );
}