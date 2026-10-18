
"use client";

import { useEffect, useState } from "react";

export default function RefundsReturnsPage() {
  const [contact, setContact] = useState({});

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/site-settings", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch site settings");
        }

        const data = await response.json();
        setContact(data.contact || {});
      } catch (error) {
        console.error("Error fetching site settings:", error);
      }
    }

    fetchSettings();
  }, []);

  const address =
    typeof contact.address === "string"
      ? contact.address
      : contact.address
        ? [
            contact.address.line1,
            contact.address.line2,
            contact.address.city,
            contact.address.state,
            contact.address.pincode,
          ]
            .filter(Boolean)
            .join(", ")
        : "";

  const brand = contact.brand || "CRACK N CRUNCH";
  const phone =
    contact.phone ||
    contact.phoneNumber ||
    contact.mobile ||
    "97518 11222";
  const email =
    contact.email ||
    contact.emailAddress ||
    "crackxcrunch@gmail.com";

  const fssaiLicenseNo = contact.fssaiLicenseNo || "";
  const gstRegistrationNo = contact.gstRegistrationNo || "";

  const displayAddress =
    address ||
    "Door No.5, 3, Appu Street, Seetha Nagar, Nungambakkam, Chennai, Tamil Nadu – 600034";

  return (
    <>
      <style jsx>{`
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
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.45);
          z-index: 1;
        }

        .banner-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #fff;
          z-index: 2;
          width: 100%;
        }

        .banner-text h1 {
          font-size: 32px;
          margin-bottom: 12px;
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
        }

        .terms-content h1 {
          font-size: 30px;
          margin-bottom: 20px;
          margin-top: 40px;
          position: relative;
          padding-top: 20px;
          font-weight: 600;
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
          font-size: 30px;
          margin-top: 25px;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .terms-content p {
          font-size: 14px;
          line-height: 1.8;
          color: #555;
        }

        .proof-points {
          margin-left: 40px;
        }

        .contact-details p {
          margin: 4px 0;
        }

        .contact-details a {
          color: inherit;
          text-decoration: none;
        }

        .contact-details a:hover {
          text-decoration: underline;
        }

        .contact-address {
          white-space: pre-line;
        }

        @media (max-width: 768px) {
          .terms-banner {
            height: 180px;
            margin-top: 90px;
          }

          .terms-content {
            margin-left: 0;
            padding: 20px;
          }

          .banner-text {
            font-size: 13px;
          }

          .banner-text h1 {
            font-size: 24px;
          }

          .terms-content h1 {
            font-size: 25px;
          }

          .terms-content h2 {
            font-size: 24px;
          }

          .proof-points {
            margin-left: 20px;
          }
        }
      `}</style>

      <div className="terms-banner">
        <img
          src="/uploads/RR.png"
          alt="Refunds and Returns"
        />

        <div className="banner-text">
          <h1>Refunds &amp; Returns</h1>
          <a href="/">Home</a>
          <span> &gt;&gt; </span>
          <span>Refunds &amp; Returns</span>
        </div>
      </div>

      <div className="terms-content">
        <h1>Refunds &amp; Returns</h1>

        <p>
          <strong>Brand Name:</strong> {brand}
          <br />
          <strong>Business Type:</strong> Online Sale of Dry Fruits
          (Retail, Bulk &amp; B2B)
          <br />
          <strong>Applicable Law:</strong> Laws of India
        </p>

        <p>
          At {brand}, customer satisfaction and product quality are
          our top priorities. Due to the consumable and perishable
          nature of dry fruits and food products, we follow a strict
          and transparent Refunds &amp; Returns Policy.
        </p>

        <p>
          By placing an order on our website, you agree to the terms
          outlined below.
        </p>

        <h1>1. Nature of Products</h1>

        <p>
          All {brand} products are food items. As per hygiene,
          safety, and regulatory standards, returns are limited and
          accepted only under specific conditions.
        </p>

        <h1>2. Eligible Cases for Return or Refund</h1>

        <p>
          We will consider a return, replacement, or refund only in
          the following situations:
        </p>

        <p>
          • <strong>Damaged Products:</strong> Items received in a
          physically damaged condition
          <br />
          <br />
          • <strong>Incorrect Items:</strong> Products different
          from what was ordered
          <br />
          <br />
          • <strong>Expired Products:</strong> Items delivered
          beyond their expiry date
        </p>

        <h2>Conditions:</h2>

        <p>
          • Requests must be raised within{" "}
          <strong>48 hours of delivery.</strong>
          <br />
          <br />
          • Customers must provide:
        </p>

        <div className="proof-points">
          <p>
            <strong>• Unboxing video</strong> (from sealed package
            to product)
            <br />
            <br />
            <strong>• Clear images</strong> of the product and outer
            packaging
          </p>
        </div>

        <p>Requests without proper evidence may not be accepted.</p>

        <h1>3. Non-Eligible Cases (No Refund / No Return)</h1>

        <p>
          We do <strong>not</strong> accept returns or refunds for:
          <br />
          <br />
          • Opened, used, or partially consumed products
          <br />
          <br />
          • Products with damaged packaging due to customer handling
          <br />
          <br />
          • Dissatisfaction based on taste, texture, color, or
          natural variation
          <br />
          <br />
          • Bulk or B2B orders unless a genuine quality issue is
          verified
          <br />
          <br />
          • International orders once dispatched
          <br />
          <br />
          • Delays caused by courier services, customs, or
          regulatory authorities
        </p>

        <h1>4. Refund Process</h1>

        <p>
          4.1 Once your request is received, our quality team will
          review the provided evidence.
          <br />
          <br />
          4.2 If approved, the refund will be processed within{" "}
          <strong>7–10 business days.</strong>
          <br />
          <br />
          4.3 Refunds will be credited to the{" "}
          <strong>original payment method</strong> used during
          purchase.
          <br />
          <br />
          4.4 In cases where replacement is applicable, a new
          shipment may be arranged instead of a refund.
        </p>

        <h1>5. Order Cancellation</h1>

        <h2>5.1 Customer-Initiated Cancellations</h2>

        <p>
          • Orders can be cancelled within 12 hours of placement or
          before dispatch, whichever is earlier.
        </p>

        <h2>5.2 {brand}-Initiated Cancellations</h2>

        <p>
          • Stock unavailability
          <br />
          <br />
          • Pricing or technical errors
          <br />
          <br />
          • Regulatory or compliance issues
        </p>

        <p>
          In such cases, a <strong>full refund</strong> will be
          issued.
        </p>

        <h1>6. Bulk &amp; B2B Orders</h1>

        <p>
          6.1 Bulk and B2B orders may require advance payment and are
          processed as per agreed commercial terms.
          <br />
          <br />
          6.2 Goods are considered{" "}
          <strong>accepted upon delivery.</strong>
          <br />
          <br />
          6.3 Quality complaints must be reported within{" "}
          <strong>24 hours of delivery</strong> with valid proof.
          <br />
          <br />
          6.4 Refunds or returns for B2B orders are allowed{" "}
          <strong>
            only if a genuine quality deviation is confirmed.
          </strong>
        </p>

        <h1>7. International Orders</h1>

        <p>
          • International orders are{" "}
          <strong>
            non-returnable and non-refundable once dispatched.
          </strong>
          <br />
          <br />
          • Customers are responsible for customs duties, import
          taxes, and clearance charges.
          <br />
          <br />
          • {brand} is not liable for delays, rejections, or losses
          caused by customs authorities.
        </p>

        <h1>8. Contact for Refunds &amp; Returns</h1>

        <p>
          For refund or return requests, please contact us with your
          order details and supporting proof:
        </p>

        <div className="contact-details">
          <p>
            <strong>Brand:</strong> {brand}
          </p>

          <p>
            <strong>FSSAI License No:</strong>{" "}
            {fssaiLicenseNo}
          </p>

          <p>
            <strong>GST Registration No:</strong>{" "}
            {gstRegistrationNo}
          </p>

          <br />

          <p>
            <strong>Address:</strong>
          </p>

          <p className="contact-address">{displayAddress}</p>

          <br />

          <p>
            <strong>Phone:</strong>{" "}
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
              {phone}
            </a>
          </p>

          <p>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${email}`}>{email}</a>
          </p>
        </div>

        <h1>9. Policy Updates</h1>

        <p>
          {brand} reserves the right to modify or update this
          Refunds &amp; Returns Policy at any time without prior
          notice. Changes will be effective immediately upon
          posting on the website.
        </p>
      </div>
    </>
  );
}