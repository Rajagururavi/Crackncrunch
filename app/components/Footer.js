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
        const response = await fetch("/api/admin/settings");
        const data = await response.json();

        if (data.success) {
          setSettings({
            logo: data.settings?.logo || "",
            address: data.settings?.address || "",
            email: data.settings?.email || "",
            phone: data.settings?.phone || "",
          });
        }
      } catch (error) {
        console.error("Footer settings error:", error);
      }
    };

    loadSettings();
  }, []);

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

          {/* LOGO + DESCRIPTION */}
          <div className="footer-col">
            <div className="footer-logo">
              <Link href="/">
                <img
                  src={settings.logo || "/uploads/1.png"}
                  alt="Crack n Crunch"
                />
              </Link>
            </div>

            <p>
              At Crack n crunch, we offer premium-quality nuts, dry fruits,
              and wholesome snacks, carefully sourced and packed to preserve
              freshness, deliver natural goodness.
            </p>
          </div>

          {/* POLICIES */}
          <div className="footer-col">
            <h4>Our Policies</h4>

            <ul>
              <li>
                <Link href="/terms">Terms & Conditions</Link>
              </li>

              <li>
                <Link href="/privacy">Privacy Policy</Link>
              </li>

              <li>
                <Link href="/shipping">Shipping Policy</Link>
              </li>

              <li>
                <Link href="/return-policy">Refunds & Returns</Link>
              </li>

              <li>
                <Link href="/cancellation">Cancellation</Link>
              </li>
            </ul>
          </div>

          {/* QUICK LINKS */}
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

          {/* ADDRESS */}
          <div className="footer-col">
            <h4>Address</h4>

            {settings.address ? (
              settings.address.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))
            ) : (
              <>
                <p>Door No.5, 3, Appu Street,</p>
                <p>Seetha Nagar, Nungambakkam,</p>
                <p>Chennai - 600034</p>
              </>
            )}

            <p>
              Email: {settings.email || "crackxcrunch@gmail.com"}
            </p>

            <p>
              Phone: {settings.phone || "+91 97518 11222"}
            </p>
          </div>
        </div>

        <div className="footer-top"></div>

        <div className="footer-bottom">
          © 2026 Crack n crunch. Designed and Developed with Excellence by
          Digital Devora. All Rights Reserved.
        </div>
      </footer>
    </>
  );
}