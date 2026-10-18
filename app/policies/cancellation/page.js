
"use client";

import { useEffect, useState } from "react";

export default function CancellationPage() {
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
    "";
  const email =
    contact.email ||
    contact.emailAddress ||
    "";
  const fssaiLicenseNo = contact.fssaiLicenseNo || "";
  const gstRegistrationNo = contact.gstRegistrationNo || "";

  return (
    <>
      <style jsx>{`
        .cancellation-banner {
          width: 100%;
          height: 320px;
          margin-top: 110px;
          position: relative;
          overflow: hidden;
        }

        .cancellation-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .cancellation-banner::before {
          content: "";
          position: absolute;
          inset: 0;
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

        .cancellation-content {
          margin-left: 80px;
          padding: 40px 80px;
          color: #333;
        }

        .cancellation-content h1 {
          font-size: 30px;
          margin-bottom: 20px;
          margin-top: 40px;
          position: relative;
          padding-top: 20px;
          font-weight: 600;
        }

        .cancellation-content h1::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: #ddd;
        }

        .cancellation-content h1:first-child::before {
          display: none;
        }

        .cancellation-content h1:first-child {
          margin-top: 0;
          padding-top: 0;
        }

        .cancellation-content h2 {
          font-size: 24px;
          margin-top: 25px;
          margin-bottom: 10px;
        }

        .cancellation-content p,
        .cancellation-content li {
          font-size: 14px;
          line-height: 1.8;
          color: #555;
        }

        .cancellation-content ul {
          padding-left: 22px;
          margin-top: 8px;
          margin-bottom: 18px;
        }

        .cancellation-content li {
          margin-bottom: 8px;
        }

        .contact-details p {
          margin: 4px 0;
        }

        .contact-address {
          white-space: pre-line;
        }

        .contact-details a {
          color: inherit;
          text-decoration: none;
        }

        .contact-details a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .cancellation-banner {
            height: 180px;
            margin-top: 90px;
          }

          .banner-text {
            font-size: 13px;
          }

          .banner-text h1 {
            font-size: 24px;
          }

          .cancellation-content {
            margin-left: 0;
            padding: 20px;
          }

          .cancellation-content h1 {
            font-size: 25px;
          }

          .cancellation-content h2 {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="cancellation-banner">
        <img
          src="/uploads/Cancel.png"
          alt="Cancellation Policy"
        />

        <div className="banner-text">
          <h1>Cancellation</h1>
          <a href="/">Home</a>
          <span> &gt;&gt; </span>
          <span>Cancellation</span>
        </div>
      </div>

      <div className="cancellation-content">
        <h1>Cancellation Policy</h1>

        <p>
          <strong>Brand Name:</strong> {brand}
          <br />

          <strong>Business Type:</strong> Online Sale of Dry Fruits
          (Retail, Bulk &amp; B2B)
          <br />

          <strong>Applicable Law:</strong> Laws of India
        </p>

        <p>
          At {brand}, we understand that sometimes orders may need
          to be cancelled. This Cancellation Policy explains when
          and how an order can be cancelled and the conditions
          under which refunds may be issued.
        </p>

        <p>
          By placing an order on our website, you agree to the
          terms stated below.
        </p>

        <h1>1. Customer-Initiated Cancellations</h1>

        <p>
          1.1 Orders can be cancelled{" "}
          <strong>
            within 12 hours of placement or before dispatch,
          </strong>{" "}
          whichever is earlier.
        </p>

        <p>
          1.2 Once the order has been dispatched,{" "}
          <strong>cancellation is not permitted,</strong> as our
          products are food items and subject to hygiene, safety,
          and regulatory restrictions.
        </p>

        <p>
          1.3 To request a cancellation, customers must contact us
          immediately using the contact details provided below,
          mentioning the{" "}
          <strong>
            order number and registered contact information.
          </strong>
        </p>

        <h1>2. {brand}-Initiated Cancellations</h1>

        <p>
          We reserve the right to cancel an order in the following
          situations:
        </p>

        <ul>
          <li>Product is out of stock or unavailable</li>
          <li>Errors in pricing, product description, or technical issues</li>
          <li>Payment failure or suspected fraudulent transactions</li>
          <li>Regulatory, compliance, or legal restrictions</li>
          <li>Incomplete or incorrect customer information</li>
        </ul>

        <p>
          In such cases, the customer will be notified and a{" "}
          <strong>full refund</strong> will be processed.
        </p>

        <h1>3. Refunds for Cancelled Orders</h1>

        <p>
          3.1 If a cancellation request is approved before dispatch,
          the refund will be processed within{" "}
          <strong>7–10 business days.</strong>
        </p>

        <p>
          3.2 Refunds will be credited to the{" "}
          <strong>original payment method</strong> used at the time
          of purchase.
        </p>

        <p>
          3.3 {brand} is not responsible for delays caused by banks,
          payment gateways, or third-party financial institutions.
        </p>

        <h1>4. Non-Cancellable Orders</h1>

        <p>The following orders cannot be cancelled:</p>

        <ul>
          <li>Orders that have already been dispatched</li>
          <li>Bulk or B2B orders once processing has begun</li>
          <li>Customized, special-pack, or large-volume orders</li>
          <li>International orders after dispatch</li>
        </ul>

        <h1>5. Bulk &amp; B2B Orders</h1>

        <p>
          5.1 Bulk and B2B orders may require{" "}
          <strong>advance payment</strong> and are processed as
          per mutually agreed commercial terms.
        </p>

        <p>5.2 Cancellation of such orders is subject to:</p>

        <ul>
          <li>Processing stage</li>
          <li>Procurement commitments</li>
          <li>Packaging and logistics arrangements</li>
        </ul>

        <p>
          5.3 Any applicable deductions or non-refundable amounts
          will be communicated before order confirmation.
        </p>

        <h1>6. International Orders</h1>

        <ul>
          <li>
            International orders{" "}
            <strong>cannot be cancelled once dispatched.</strong>
          </li>
          <li>
            Any customs duties, import taxes, or shipping charges
            incurred are <strong>non-refundable.</strong>
          </li>
          <li>
            If an international shipment is refused or returned
            due to customer non-compliance with customs regulations,
            the customer shall bear all associated costs.
          </li>
        </ul>

        <h1>7. How to Request Cancellation</h1>

        <p>
          To request a cancellation, please contact us immediately
          with your order details:
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

          <p className="contact-address">{address}</p>

          <br />

          <p>
            <strong>Phone:</strong>{" "}
            {phone ? (
              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
                {phone}
              </a>
            ) : (
              ""
            )}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {email ? (
              <a href={`mailto:${email}`}>{email}</a>
            ) : (
              ""
            )}
          </p>
        </div>

        <h1>8. Policy Updates</h1>

        <p>
          {brand} reserves the right to amend or update this
          Cancellation Policy at any time without prior notice.
          Any changes will be effective immediately upon
          publication on the website.
        </p>
      </div>
    </>
  );
}