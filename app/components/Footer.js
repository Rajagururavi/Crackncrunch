"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function Footer() {
  const [settings, setSettings] = useState({
    logo: "",
    address: "",
    email: "",
    phone: "",
  });
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/site-settings", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch site settings");
        }
        const data = await response.json();
        setSettings({
          logo: data.logo || "",
          address: data.contact?.address || "",
          email: data.contact?.email || "",
          phone: data.contact?.phone || "",
        });
      } catch (error) {
        console.error("Footer settings error:", error);
      }
    };
    loadSettings();
  }, []);
  const addressLines = typeof settings.address === "string" ? settings.address.split("\n").filter((line) => line.trim()) : settings.address
  ? [
      settings.address.line1,
      settings.address.line2,
      settings.address.city,
      settings.address.state,
      settings.address.pincode,
  ].filter(Boolean) : [];
  return (
    <>
      <style jsx global>{`
        .footer {
          background: black;
          color: #cfcfcf;
          padding: 60px 20px 20px;
          margin-top: 50px;
          font-family: Arial, sans-serif;
        }
        .footer-top {
          border-top: 1px solid #222;
        }
        .footer-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 20px;
          max-width: 1200px;
          margin: auto;
          padding: 20px 0;
          align-items: flex-start;
        }
        .footer-col {
          flex: 1;
          min-width: 220px;
          display: flex;
          flex-direction: column;
        }
        .footer-logo {
          font-size: 24px;
          font-weight: bold;
          color: #f5deb3;
          margin-bottom: 10px;
        }
        .footer-logo img {
          margin-top: -40px;
          width: 100%;
          max-width: 260px;
          height: 100px;
          object-fit: contain;
          display: block;
          margin-left: -20px;
        }
        .footer h4 {
          color: #fff;
          font-size: 15px;
          margin-bottom: 10px;
          position: relative;
          font-weight: 600;
        }
        .footer h4::after {
          content: "";
          width: 45px;
          height: 2px;
          background: #f5deb3;
          position: absolute;
          left: 0;
          bottom: -6px;
        }
        .footer p {
          font-size: 14px;
          line-height: 1.5;
          color: #bdbdbd;
          margin: 5px 0;
          overflow-wrap: anywhere;
        }
        .footer ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .footer ul li {
          margin-bottom: 6px;
        }
        .footer ul li a {
          text-decoration: none;
          color: #bdbdbd;
          font-size: 14px;
          transition: 0.3s;
          display: inline-block;
        }
        .footer ul li a:hover {
          color: #f5deb3;
          transform: translateX(5px);
        }
        .social-icons {
          margin-top: 10px;
        }
        .social-icons a {
          text-decoration: none;
        }
        .social-icons i {
          font-size: 18px;
          margin-right: 10px;
          color: #bdbdbd;
          cursor: pointer;
          transition: 0.3s;
        }
        .social-icons i:hover {
          color: #f5deb3;
          transform: scale(1.2);
        }
        .footer-bottom {
          text-align: center;
          margin-top: 20px;
          padding: 12px;
          font-size: 13px;
          color: #2f2f2f;
          background-color: #f5deb3;
        }
        @media (max-width: 768px) {
          .footer {
            padding: 45px 20px 15px;
          }
          .footer-container {
            flex-direction: column;
            gap: 30px;
          }
          .footer-col {
            width: 100%;
            min-width: 100%;
          }
          .footer-logo img {
            margin-left: -15px;
            margin-top: -25px;
            max-width: 240px;
          }
          .footer h4 {
            font-size: 16px;
          }
          .footer p {
            font-size: 14px;
          }
          .footer-bottom {
            font-size: 12px;
            line-height: 1.5;
          }
        }
        @media (max-width: 480px) {
          .footer {
            padding: 40px 15px 10px;
          }
          .footer-logo img {
            width: 220px;
            height: 90px;
          }
          .footer p {
            font-size: 13px;
          }
          .footer ul li a {
            font-size: 13px;
          }
          .footer-bottom {
            font-size: 11px;
            padding: 10px 5px;
          }
        }
      `}</style>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-col">
            <div className="footer-logo">
              <Link href="/">
                {settings.logo && (
                  <img src={settings.logo} alt="Crack n Crunch" />
                )}
              </Link>
            </div>
            <p>
              At Crack n Crunch, we offer premium-quality nuts, dry fruits,
              and wholesome snacks, carefully sourced and packed to preserve
              freshness and deliver natural goodness.
            </p>
          </div>
          <div className="footer-col">
            <h4>Our Policies</h4>
            <ul>
              <li>
                <Link href="/policies/terms">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link href="/policies/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/policies/shipping">Shipping Policy</Link>
              </li>
              <li>
                <Link href="/policies/return-policy">Refunds &amp; Returns</Link>
              </li>
              <li>
                <Link href="/policies/cancellation">Cancellation</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/shop">Shop</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/blogs">Latest Blogs</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Address</h4>
            {addressLines.map((line, index) => (<p key={`${index}-${line}`}>{line}</p>))}
            {settings.email && (
              <p>
                Email:{" "}
                <a
                  href={`mailto:${settings.email}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {settings.email}
                </a>
              </p>
            )}
            {settings.phone && (
              <p>
                Phone:{" "}
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {settings.phone}
                </a>
              </p>
            )}
          </div>
        </div>
        <div className="footer-top"></div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Crack n Crunch. Bringing Quality Nuts & Dry Fruits to Your Doorstep.
        </div>
      </footer>
    </>
  );
}