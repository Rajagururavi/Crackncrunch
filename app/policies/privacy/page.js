
"use client";

import { useEffect, useState } from "react";

export default function PrivacyPolicyPage() {
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

  return (
    <>
      <style jsx>{`
        .privacy-banner {
          width: 100%;
          height: 320px;
          margin-top: 110px;
          position: relative;
          overflow: hidden;
        }

        .privacy-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .privacy-banner::before {
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

        .privacy-content {
          margin-left: 80px;
          padding: 40px 80px;
          color: #333;
        }

        .privacy-content h1 {
          font-size: 30px;
          margin-bottom: 20px;
          margin-top: 40px;
          position: relative;
          padding-top: 20px;
          font-weight: 600;
        }

        .privacy-content h1::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: #ddd;
        }

        .privacy-content h1:first-child::before {
          display: none;
        }

        .privacy-content h1:first-child {
          margin-top: 0;
          padding-top: 0;
        }

        .privacy-content h2 {
          font-size: 24px;
          margin-top: 25px;
          margin-bottom: 10px;
        }

        .privacy-content p,
        .privacy-content li {
          font-size: 14px;
          line-height: 1.8;
          color: #555;
        }

        .privacy-content ul {
          padding-left: 22px;
          margin-top: 8px;
          margin-bottom: 18px;
        }

        .privacy-content li {
          margin-bottom: 8px;
        }

        .contact-details p {
          margin: 4px 0;
        }

        @media (max-width: 768px) {
          .privacy-banner {
            height: 180px;
            margin-top: 90px;
          }

          .banner-text {
            font-size: 13px;
          }

          .banner-text h1 {
            font-size: 24px;
          }

          .privacy-content {
            margin-left: 0;
            padding: 20px;
          }

          .privacy-content h1 {
            font-size: 25px;
          }

          .privacy-content h2 {
            font-size: 20px;
          }
        }
      `}</style>

      <div className="privacy-banner">
        <img src="/uploads/PP.png" alt="Privacy Policy" />

        <div className="banner-text">
          <h1>Privacy Policy</h1>
          <a href="/">Home</a>
          <span> &gt;&gt; </span>
          <span>Privacy Policy</span>
        </div>
      </div>

      <div className="privacy-content">
        <h1>Privacy Policy</h1>

        <p>
          <strong>Brand Name:</strong> CRACK N CRUNCH
          <br />
          <strong>Business Type:</strong> Online Sale of Dry Fruits (Retail,
          Bulk &amp; B2B)
          <br />
          <strong>Applicable Law:</strong> Laws of India
          <br />
          <strong>Established:</strong> September 2026
        </p>

        <p>
          CRACK N CRUNCH (“we”, “our”, “us”) respects your privacy and is
          committed to protecting your personal and business information. This
          Privacy Policy explains how we collect, use, disclose, and safeguard
          your data when you visit our website or place an order with us.
        </p>

        <p>
          By accessing or using our website, you consent to the practices
          described in this policy.
        </p>

        <h1>1. Information We Collect</h1>
        <p>We may collect the following types of information:</p>

        <h2>1.1 Personal Information</h2>
        <ul>
          <li>Full name</li>
          <li>Billing and shipping address</li>
          <li>Email address</li>
          <li>Phone number</li>
        </ul>

        <h2>1.2 Business Information (for B2B Orders)</h2>
        <ul>
          <li>Company name</li>
          <li>GST number</li>
          <li>Business address and contact details</li>
        </ul>

        <h2>1.3 Technical &amp; Usage Data</h2>
        <ul>
          <li>IP address</li>
          <li>Browser type and device information</li>
          <li>Pages visited, time spent, and website usage data</li>
        </ul>

        <h2>1.4 Payment Information</h2>
        <ul>
          <li>Payments are processed via secure third-party gateways.</li>
          <li>
            CRACK N CRUNCH does not store credit card, debit card, UPI, or
            banking details.
          </li>
        </ul>

        <h1>2. Purpose of Data Collection</h1>
        <p>We collect and use your information for the following purposes:</p>
        <ul>
          <li>Processing and fulfilling orders</li>
          <li>Generating GST invoices and regulatory compliance</li>
          <li>FSSAI traceability and food safety compliance</li>
          <li>
            Shipping, logistics, and customs documentation (for international
            orders)
          </li>
          <li>Customer support, dispute resolution, and fraud prevention</li>
          <li>
            Internal analysis to improve our products and website performance
          </li>
        </ul>

        <h1>3. Legal Basis for Processing</h1>
        <p>
          We process your information based on one or more of the following
          grounds:
        </p>
        <ul>
          <li>Your consent</li>
          <li>Performance of a contract (order fulfillment)</li>
          <li>Legal and regulatory obligations (GST, FSSAI, export laws)</li>
          <li>
            Legitimate business interests such as fraud prevention and service
            improvement
          </li>
        </ul>

        <h1>4. Sharing of Information</h1>
        <p>We may share your data only with trusted third parties, including:</p>
        <ul>
          <li>Logistics and courier partners for order delivery</li>
          <li>Payment gateway providers for secure transactions</li>
          <li>Government or regulatory authorities when legally required</li>
          <li>Customs and export agencies for international shipments</li>
        </ul>
        <p>
          We do not sell, rent, or misuse your personal or business data for
          marketing or unauthorized purposes.
        </p>

        <h1>5. Data Security</h1>
        <p>
          We implement reasonable administrative, technical, and physical
          security measures to protect your data against unauthorized access,
          alteration, or disclosure.
        </p>
        <p>
          However, no online platform is completely secure. By using our
          website, you acknowledge and accept this inherent risk.
        </p>

        <h1>6. Cookies &amp; Tracking Technologies</h1>
        <p>Our website may use cookies and similar technologies to:</p>
        <ul>
          <li>Enhance user experience</li>
          <li>Analyze website traffic and performance</li>
          <li>Remember user preferences</li>
        </ul>
        <p>
          You may disable cookies through your browser settings, but doing so
          may affect website functionality.
        </p>

        <h1>7. International Data Transfers</h1>
        <p>
          For international orders, your information may be shared with overseas
          logistics providers and customs authorities. By placing an
          international order, you consent to such data transfers as required
          for order fulfillment and legal compliance.
        </p>

        <h1>8. Data Retention</h1>
        <p>We retain your personal and business information only for as long as necessary to:</p>
        <ul>
          <li>Fulfill orders</li>
          <li>Comply with legal and tax obligations</li>
          <li>Resolve disputes</li>
          <li>Maintain business records</li>
        </ul>
        <p>Once no longer required, data is securely deleted or anonymized.</p>

        <h1>9. Your Rights</h1>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate or incomplete data</li>
          <li>
            Request deletion of your data, subject to legal and regulatory
            requirements
          </li>
          <li>Withdraw consent for marketing communications (if applicable)</li>
        </ul>
        <p>To exercise these rights, please contact us using the details below.</p>

        <h1>10. Third-Party Links</h1>
        <p>
          Our website may contain links to external websites. CRACK N CRUNCH is
          not responsible for the privacy practices or content of such
          third-party sites. We encourage you to review their policies
          separately.
        </p>

        <h1>11. Changes to This Policy</h1>
        <p>
          CRACK N CRUNCH reserves the right to update or modify this Privacy
          Policy at any time without prior notice. Any changes will be posted
          on this page with a revised effective date. Continued use of the
          website constitutes acceptance of the updated policy.
        </p>

        <h1>12. Contact Information</h1>
        <p>
          If you have any questions about this Privacy Policy or how your data
          is handled, you may contact us at:
        </p>

        <div className="contact-details">
          <p>
            <strong>Brand:</strong> CRACK N CRUNCH
          </p>
          <p>
            <strong>FSSAI License No:</strong>{" "}
            {contact.fssaiLicenseNo || ""}
          </p>
          <p>
            <strong>GST Registration No:</strong>{" "}
            {contact.gstRegistrationNo || ""}
          </p>
          <br />

          <p>
            <strong>Address:</strong>
          </p>
          <p>{address}</p>
          <br />

          <p>
            <strong>Phone:</strong> {contact.phone || ""}
          </p>
          <p>
            <strong>Email:</strong> {contact.email || ""}
          </p>
        </div>
      </div>
    </>
  );
}