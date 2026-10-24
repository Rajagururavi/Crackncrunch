"use client";
import { useEffect, useState } from "react";
export default function ContactPage() {
  const [contact, setContact] = useState({});
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function fetchSettings() {
      try {
        const response = await fetch("/api/site-settings", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch site settings");
        }
        const data = await response.json();
        if (active) {
          setContact(data.contact || {});
        }
      } catch (error) {
        console.error("Error fetching site settings:", error);
      } finally {
        if (active) {
          setSettingsLoading(false);
        }
      }
    }
    fetchSettings();
    return () => {
      active = false;
    };
  }, []);
  const email = contact.email || contact.emailAddress || "";
  const phone = contact.phone || contact.phoneNumber || contact.mobile || "";
  function getWhatsAppNumber(value) {
    let digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("00")) {
      digits = digits.slice(2);
    }
    if (digits.length === 10) {
      digits = `91${digits}`;
    } else if (digits.length === 11 && digits.startsWith("0")) {
      digits = `91${digits.slice(1)}`;
    }
    return digits;
  }
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }
  function handleSubmit(event) {
    event.preventDefault();
    const whatsappNumber = getWhatsAppNumber(phone);
    if (!whatsappNumber) {
      window.alert("WhatsApp phone number is not configured in site settings.");
      return;
    }
    const whatsappMessage = [
      "Hello CRACK N CRUNCH!",
      "",
      "I would like to contact you through your website.",
      "",
      `Name: ${form.name.trim()}`,
      `Email: ${form.email.trim()}`,
      `Phone: ${form.phone.trim() || "Not provided"}`,
      `Subject: ${form.subject.trim()}`,
      "",
      "Message:",
      form.message.trim(),
    ].join("\n");
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=` + encodeURIComponent(whatsappMessage);
    window.location.href = whatsappURL;
  }
  const address = typeof contact.address === "string" ? contact.address : contact.address ? [
    contact.address.line1,
    contact.address.line2,
    contact.address.city,
    contact.address.state,
    contact.address.pincode,
  ].filter(Boolean).join(", ") : "";
  return (
    <div className="contact-page">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"/>
      <style jsx>{`
        .contact-page {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          font-family: Arial, sans-serif;
          background: #fff;
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
        .about-section {
          width: 100%;
          padding: 90px 8%;
          background: #fff;
          box-sizing: border-box;
        }
        .about-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 70px;
          flex-wrap: wrap;
        }
        .about-content {
          flex: 1;
          min-width: 320px;
        }
        .about-tag {
          color: #c89b3c;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 18px;
          display: block;
        }
        .about-container > .about-content h2, .about-container > .about-content p {
          color: #000 !important;
        }
        .dryfruit-banner {
          width: 80vw;
          height: 320px;
          position: relative;
          overflow: hidden;
          margin-top: 25px;
          margin-left: 10px;
          border-radius: 20px;
        }
        .dryfruit-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .dryfruit-banner::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
        }
        .dryfruit-banner-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          text-align: center;
          max-width: 700px;
          width: 90%;
        }
        .dryfruit-banner-content h1 {
          color: #fff;
          font-size: 55px;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 18px;
        }
        .dryfruit-banner-content span {
          color: #fff;
          font-size: 18px;
          line-height: 1.7;
          display: block;
          white-space: nowrap;
          margin-left: -190px;
        }
        .order-btn {
          display: inline-block;
          margin-top: 25px;
          padding: 14px 35px;
          background: #d4a017;
          color: #fff;
          text-decoration: none;
          font-size: 17px;
          font-weight: 600;
          border-radius: 50px;
          transition: 0.3s;
        }
        .order-btn:hover {
          background: #b8860b;
        }
        .contact-info-section {
          flex: 1.5;
          min-width: 320px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .contact-box {
          background: #fafafa;
          border: 1px solid #e8e8e8;
          border-radius: 15px;
          padding: 30px 25px;
          display: flex;
          align-items: center;
          gap: 18px;
          transition: 0.3s ease;
          box-sizing: border-box;
          min-width: 0;
        }
        .contact-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-wrap: anywhere;
        }
        .contact-content h3 {
          margin: 0 0 5px;
        }
        .contact-content p {
          margin: 0;
        }
        .contact-content a {
          color: inherit;
          text-decoration: none;
        }
        .contact-content a:hover {
          color: #c89b3c;
        }
        .contact-box:hover {
          border-color: #c89b3c;
          transform: translateY(-3px);
        }
        .contact-icon {
          width: 60px;
          height: 60px;
          min-width: 60px;
          border-radius: 50%;
          background: #c89b3c;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .contact-box h3 {
          margin: 0 0 6px;
          font-size: 15px;
          color: #222;
          font-weight: 700;
        }
        .contact-box p {
          margin: 0;
          color: #777;
          font-size: 14px;
          line-height: 1.6;
        }
        .contact-form-section {
          margin-top: 60px;
          display: flex;
          gap: 50px;
          align-items: center;
          background: #fff;
        }
        .contact-form-left {
          flex: 1;
          min-width: 0;
        }
        .form-tag {
          color: #c89b3c;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .contact-form-left h2 {
          font-size: 40px;
          color: #222;
          margin: 15px 0;
        }
        .contact-form-left p {
          color: #666;
          line-height: 1.8;
          margin-bottom: 25px;
        }
        .contact-form-left ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .contact-form-left ul li {
          margin-bottom: 12px;
          color: #444;
        }
        .contact-form-right {
          flex: 1;
          min-width: 0;
          background: #000;
          padding: 35px;
          border-radius: 20px;
          border: 1px solid #eee;
          box-sizing: border-box;
        }
        .form-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }
        .contact-form-right input, .contact-form-right textarea {
          width: 100%;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 10px;
          font-size: 14px;
          box-sizing: border-box;
          background: #fff;
          color: #222;
          font-family: Arial, sans-serif;
        }
        .contact-form-right input:focus, .contact-form-right textarea:focus {
          outline: 2px solid #c89b3c;
          border-color: #c89b3c;
        }
        .contact-form-right textarea {
          height: 160px;
          resize: vertical;
          margin-bottom: 15px;
        }
        .contact-form-right button {
          background: #c89b3c;
          color: #fff;
          border: none;
          padding: 14px 30px;
          border-radius: 50px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        }
        .contact-form-right button:hover {
          background: #b8860b;
        }
        .contact-page p {
          text-align: justify;
          text-justify: inter-word;
          line-height: 1.8;
          margin-bottom: 20px;
        }
        .contact-content p {
          margin: 0;
        }
        @media (max-width: 1024px) {
          .about-section {
            padding: 70px 5%;
          }
          .about-container {
            gap: 50px;
            align-items: flex-start;
          }
          .about-content {
            flex: 1;
          }
          .dryfruit-banner-content h1 {
            font-size: 48px;
          }
          .dryfruit-banner-content span {
            font-size: 16px;
            margin-left: 0;
            white-space: normal;
          }
          .contact-form-left h2 {
            font-size: 34px;
          }
        }
        @media (max-width: 768px) {
          .contact-info-section {
            grid-template-columns: 1fr;
            gap: 15px;
            width: 100%;
          }
          .contact-box {
            width: 100%;
          }
          .contact-icon {
            width: 55px;
            height: 55px;
            min-width: 55px;
            font-size: 20px;
          }
          .contact-content h3 {
            font-size: 15px;
          }
          .contact-content p {
            font-size: 13px;
          }
          .terms-banner {
            height: 220px;
            margin-top: 85px;
          }
          .banner-text {
            width: 92%;
          }
          .banner-text h1 {
            font-size: 28px;
          }
          .banner-text span, .banner-text a {
            font-size: 13px;
          }
          .about-section {
            padding: 55px 5%;
          }
          .about-container {
            flex-direction: column;
            gap: 35px;
          }
          .about-content {
            width: 100%;
          }
          .dryfruit-banner {
            height: 250px;
            width: 100%;
            margin-left: 0;
          }
          .dryfruit-banner-content {
            width: 95%;
          }
          .dryfruit-banner-content h1 {
            font-size: 32px;
          }
          .dryfruit-banner-content span {
            font-size: 14px;
          }
          .order-btn {
            margin-top: 18px;
            padding: 10px 24px;
            font-size: 15px;
          }
          .contact-form-section {
            flex-direction: column;
            gap: 30px;
          }
          .contact-form-left, .contact-form-right {
            width: 100%;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .contact-form-right {
            padding: 20px;
          }
          .contact-form-left h2 {
            font-size: 28px;
          }
        }
        @media (max-width: 480px) {
          .contact-box {
            padding: 15px;
            gap: 12px;
          }
          .contact-icon {
            width: 50px;
            height: 50px;
            min-width: 50px;
            font-size: 18px;
          }
          .contact-content h3 {
            font-size: 14px;
            margin-bottom: 4px;
          }
          .contact-content p {
            font-size: 12px;
            line-height: 1.5;
          }
          .terms-banner {
            height: 180px;
          }
          .banner-text h1 {
            font-size: 22px;
          }
          .about-section {
            padding: 45px 4%;
          }
          .about-container {
            gap: 28px;
          }
          .dryfruit-banner {
            height: 220px;
          }
          .dryfruit-banner-content h1 {
            font-size: 26px;
          }
          .dryfruit-banner-content span {
            font-size: 13px;
          }
          .order-btn {
            padding: 9px 20px;
            font-size: 14px;
          }
        }
      `}</style>
      <div className="terms-banner">
        <img src="/uploads/contact1.png" alt="Contact Us" />
        <div className="banner-text">
          <h1>CONTACT US</h1>
          <a href="/">Home</a>
          <span> &gt;&gt; </span>
          <span>Contact Us</span>
        </div>
      </div>
      <section className="about-section">
        <div className="about-container">
          <div className="about-content">
            <span className="about-tag">Get In Touch Now</span>
            <h2>Contact Us Anytime</h2>
            <p>
              Have a question about our products or bulk orders?
              We’re here to help with premium nuts, dry fruits,
              dates, seeds, gift packs, and wholesale inquiries.
              Reach out to us anytime—we’ll be happy to assist you.
              <br />
              <br />
            </p>
          </div>
          <div className="contact-info-section">
            <div className="contact-box">
              <div className="contact-icon">
                <i className="fas fa-envelope" aria-hidden="true" />
              </div>
              <div className="contact-content">
                <h3>Email</h3>
                <p>
                  {email ? (<a href={`mailto:${email}`}>{email}</a>) : (
                    settingsLoading ? "Loading..." : "Email not configured"
                  )}
                </p>
              </div>
            </div>
            <div className="contact-box">
              <div className="contact-icon">
                <i className="fas fa-comments" aria-hidden="true" />
              </div>
              <div className="contact-content">
                <h3>Chat With Agent</h3>
                <p>Chat with us on WhatsApp</p>
              </div>
            </div>
            <div className="contact-box">
              <div className="contact-icon">
                <i className="fas fa-phone-alt" aria-hidden="true" />
              </div>
              <div className="contact-content">
                <h3>Make Phone Call</h3>
                <p>
                  {phone ? (<a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone} </a>) : (settingsLoading ? "Loading..." : "Phone not configured")}
                </p>
              </div>
            </div>
            <div className="contact-box">
              <div className="contact-icon">
                <i className="fas fa-question-circle" aria-hidden="true" />
              </div>
              <div className="contact-content">
                <h3>FAQ</h3>
                <p>Read FAQ to clear confusion</p>
              </div>
            </div>
          </div>
        </div>
        <div className="contact-form-section">
          <div className="contact-form-left">
            <span className="form-tag">SEND US A MESSAGE</span>
            <h2>Get In Touch With Us</h2>
            <p>
              Have questions about our products, wholesale orders,
              gifting solutions, or bulk requirements? Fill out the
              form and our team will contact you shortly.
            </p>
            <ul>
              <li>✔ Premium Quality Products</li>
              <li>✔ Bulk &amp; Wholesale Orders</li>
              <li>✔ Fast Customer Support</li>
              <li>✔ Corporate Gift Solutions</li>
            </ul>
          </div>
          <div className="contact-form-right">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} autoComplete="name" required />
                <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} autoComplete="email" required />
              </div>
              <div className="form-row">
                <input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} autoComplete="tel" />
                <input type="text" name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} required />
              </div>
              <textarea name="message" placeholder="Write Your Message" value={form.message} onChange={handleChange} required />
              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
        <div className="dryfruit-banner">
          <img src="/uploads/contact2.png" alt="Premium nuts and dry fruits" />
          <div className="dryfruit-banner-content">
            <h1>Premium Nuts &amp; <br />Dry Fruits Store</h1>
            <span>
              Fresh, natural, and high-quality nuts, dry fruits,
              dates, seeds, and healthy snack mixes—carefully sourced
              for taste, purity, and nutrition.
            </span>
            <a href="/" className="order-btn">Order Now</a>
          </div>
        </div>
      </section>
    </div>
  );
}