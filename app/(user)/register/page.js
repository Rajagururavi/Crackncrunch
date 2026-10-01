"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    state: "",
    country: "India",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.address ||
      !form.pincode ||
      !form.state ||
      !form.password ||
      !form.confirmPassword
    ) {
      setMessage("Please fill all required fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setMessage("Account created successfully!");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* Decorative background */}
      <div className="bg-circle bg-circle-one"></div>
      <div className="bg-circle bg-circle-two"></div>

      <div className="register-wrapper">

        {/* LEFT SIDE */}
        <div className="register-intro">

          <div className="intro-content">

            <div className="brand-mark">
              C<span>&</span>C
            </div>

            <p className="intro-small">
              WELCOME TO
            </p>

            <h1>
              Crack <span>&</span> Crunch
            </h1>

            <p className="intro-description">
              Create your account and discover delicious
              premium nuts, dry fruits and healthy snacks
              delivered to your doorstep.
            </p>

            <div className="intro-features">

              <div className="feature">
                <div className="feature-icon">✓</div>
                <div>
                  <strong>Fresh Products</strong>
                  <p>Quality you can trust</p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">✓</div>
                <div>
                  <strong>Easy Ordering</strong>
                  <p>Simple & secure shopping</p>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">✓</div>
                <div>
                  <strong>Fast Delivery</strong>
                  <p>Delivered to your doorstep</p>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="register-card">

          <div className="register-header">
            <h2>Create Account</h2>
            <p>
              Join Crack n Crunch today
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* NAME */}
            <div className="form-group">
              <label>
                Full Name <span>*</span>
              </label>

              <div className="input-wrapper">
                <span className="input-icon">👤</span>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label>
                Email Address <span>*</span>
              </label>

              <div className="input-wrapper">
                <span className="input-icon">✉</span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* PHONE */}
            <div className="form-group">
              <label>
                Phone Number <span>*</span>
              </label>

              <div className="input-wrapper">
                <span className="input-icon">☎</span>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* ADDRESS */}
            <div className="form-group">
              <label>
                Address <span>*</span>
              </label>

              <div className="input-wrapper textarea-wrapper">
                <span className="input-icon textarea-icon">⌂</span>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter your complete address"
                  rows="3"
                />
              </div>
            </div>

            {/* PIN + STATE */}
            <div className="two-column">

              <div className="form-group">
                <label>
                  PIN Code <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">⌖</span>

                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="600001"
                    maxLength="6"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  State <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">◈</span>

                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Tamil Nadu"
                  />
                </div>
              </div>

            </div>

            {/* COUNTRY */}
            <div className="form-group">
              <label>Country</label>

              <div className="input-wrapper select-wrapper">
                <span className="input-icon">🌐</span>

                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                >
                  <option value="India">India</option>
                </select>
              </div>
            </div>

            {/* PASSWORD */}
            <div className="two-column">

              <div className="form-group">
                <label>
                  Password <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create password"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Confirm Password <span>*</span>
                </label>

                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

            </div>

            {/* MESSAGE */}
            {message && (
              <div
                className={`register-message ${
                  message.includes("successfully")
                    ? "success"
                    : "error"
                }`}
              >
                <span>
                  {message.includes("successfully")
                    ? "✓"
                    : "!"}
                </span>

                {message}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              className="create-account-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <span className="arrow">→</span>
                </>
              )}
            </button>

          </form>

          {/* LOGIN */}
          <div className="login-section">
            <span>Already have an account?</span>

            <button
              type="button"
              onClick={() => router.push("/login")}
            >
              Login
            </button>
          </div>

        </div>

      </div>

      <style jsx>{`

        /* ==========================================
           PAGE
        ========================================== */

        .register-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(211, 47, 47, 0.06),
              transparent 35%
            ),
            #f7f7f5;

          display: flex;
          justify-content: center;
          align-items: center;

          padding: 55px 25px;

          position: relative;
          overflow: hidden;

          font-family:
            Arial,
            Helvetica,
            sans-serif;
            margin-top: 120px
        }


        /* ==========================================
           BACKGROUND CIRCLES
        ========================================== */

        .bg-circle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .bg-circle-one {
          width: 420px;
          height: 420px;

          top: -230px;
          right: -150px;

          background: rgba(211, 47, 47, 0.06);
        }

        .bg-circle-two {
          width: 300px;
          height: 300px;

          bottom: -170px;
          left: -130px;

          background: rgba(211, 47, 47, 0.045);
        }


        /* ==========================================
           MAIN WRAPPER
        ========================================== */

        .register-wrapper {
          width: 100%;
          max-width: 1120px;

          min-height: 700px;

          display: grid;
          grid-template-columns: 0.85fr 1.15fr;

          background: #ffffff;

          border-radius: 24px;

          overflow: hidden;

          box-shadow:
            0 25px 70px rgba(0, 0, 0, 0.10),
            0 5px 20px rgba(0, 0, 0, 0.04);

          position: relative;
          z-index: 2;
        }


        /* ==========================================
           LEFT INTRO
        ========================================== */

        .register-intro {
          background:
            linear-gradient(
              145deg,
              #9f1818 0%,
              #c62828 48%,
              #e04444 100%
            );

          color: white;

          display: flex;
          align-items: center;

          padding: 55px;

          position: relative;

          overflow: hidden;
        }

        .register-intro::before {
          content: "";

          position: absolute;

          width: 360px;
          height: 360px;

          border-radius: 50%;

          border: 1px solid rgba(255, 255, 255, 0.12);

          right: -190px;
          top: -130px;
        }

        .register-intro::after {
          content: "";

          position: absolute;

          width: 260px;
          height: 260px;

          border-radius: 50%;

          border: 1px solid rgba(255, 255, 255, 0.10);

          left: -150px;
          bottom: -130px;
        }

        .intro-content {
          position: relative;
          z-index: 2;
        }


        /* ==========================================
           BRAND
        ========================================== */

        .brand-mark {
          width: 65px;
          height: 65px;

          border-radius: 18px;

          background: rgba(255, 255, 255, 0.16);

          border: 1px solid rgba(255, 255, 255, 0.25);

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 21px;
          font-weight: 800;

          margin-bottom: 40px;

          letter-spacing: -1px;
        }

        .brand-mark span {
          opacity: 0.75;
          margin: 0 2px;
        }

        .intro-small {
          font-size: 12px;
          letter-spacing: 4px;
          font-weight: 700;

          opacity: 0.75;

          margin: 0 0 10px;
        }

        .register-intro h1 {
          margin: 0;

          font-size: 44px;
          line-height: 1.1;

          font-weight: 800;

          letter-spacing: -1.5px;
        }

        .register-intro h1 span {
          font-style: italic;
        }

        .intro-description {
          max-width: 390px;

          font-size: 15px;
          line-height: 1.8;

          opacity: 0.88;

          margin: 25px 0 40px;
        }


        /* ==========================================
           FEATURES
        ========================================== */

        .intro-features {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .feature {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .feature-icon {
          width: 38px;
          height: 38px;

          flex-shrink: 0;

          border-radius: 50%;

          background: rgba(255, 255, 255, 0.15);

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 14px;
          font-weight: 700;
        }

        .feature strong {
          display: block;

          font-size: 14px;

          margin-bottom: 3px;
        }

        .feature p {
          margin: 0;

          font-size: 12px;

          opacity: 0.68;
        }


        /* ==========================================
           RIGHT CARD
        ========================================== */

        .register-card {
          padding: 48px 55px;

          background: #ffffff;

          overflow-y: auto;
        }


        /* ==========================================
           HEADER
        ========================================== */

        .register-header {
          margin-bottom: 30px;
        }

        .register-header h2 {
          margin: 0;

          color: #1c1c1c;

          font-size: 30px;
          font-weight: 800;

          letter-spacing: -0.8px;
        }

        .register-header p {
          margin: 7px 0 0;

          color: #888;

          font-size: 14px;
        }


        /* ==========================================
           FORM
        ========================================== */

        .form-group {
          margin-bottom: 17px;
        }

        .form-group label {
          display: block;

          margin-bottom: 7px;

          color: #303030;

          font-size: 12px;
          font-weight: 700;

          letter-spacing: 0.2px;
        }

        .form-group label span {
          color: #d32f2f;
        }


        /* ==========================================
           INPUT
        ========================================== */

        .input-wrapper {
          height: 48px;

          display: flex;
          align-items: center;

          border: 1px solid #e2e2e2;

          border-radius: 9px;

          background: #fafafa;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .input-wrapper:focus-within {
          border-color: #d32f2f;

          background: #ffffff;

          box-shadow:
            0 0 0 3px rgba(211, 47, 47, 0.08);
        }

        .input-icon {
          width: 45px;

          flex-shrink: 0;

          text-align: center;

          color: #a2a2a2;

          font-size: 15px;
        }

        .input-wrapper input,
        .input-wrapper textarea,
        .input-wrapper select {
          width: 100%;

          height: 100%;

          border: none;
          outline: none;

          background: transparent;

          color: #222;

          font-size: 13px;

          font-family: inherit;
        }

        .input-wrapper input::placeholder,
        .input-wrapper textarea::placeholder {
          color: #aaa;
        }

        .input-wrapper textarea {
          height: auto;

          resize: none;

          padding: 14px 12px 14px 0;

          line-height: 1.5;
        }

        .textarea-wrapper {
          height: 82px;

          align-items: flex-start;
        }

        .textarea-icon {
          padding-top: 14px;
        }

        .select-wrapper select {
          cursor: pointer;

          appearance: auto;
        }


        /* ==========================================
           TWO COLUMNS
        ========================================== */

        .two-column {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 15px;
        }


        /* ==========================================
           MESSAGE
        ========================================== */

        .register-message {
          display: flex;
          align-items: center;
          gap: 9px;

          padding: 11px 13px;

          border-radius: 8px;

          font-size: 12px;

          margin-bottom: 15px;
        }

        .register-message span {
          width: 20px;
          height: 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          font-weight: 800;
        }

        .register-message.error {
          background: #fff1f1;
          color: #b42323;
        }

        .register-message.error span {
          background: #b42323;
          color: white;
        }

        .register-message.success {
          background: #effaf2;
          color: #21853a;
        }

        .register-message.success span {
          background: #21853a;
          color: white;
        }


        /* ==========================================
           CREATE BUTTON
        ========================================== */

        .create-account-btn {
          width: 100%;

          height: 51px;

          border: none;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #b51f1f,
              #d32f2f
            );

          color: white;

          font-size: 14px;
          font-weight: 700;

          cursor: pointer;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 10px;

          box-shadow:
            0 8px 20px rgba(211, 47, 47, 0.20);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .create-account-btn:hover {
          transform: translateY(-2px);

          box-shadow:
            0 12px 25px rgba(211, 47, 47, 0.28);
        }

        .create-account-btn:active {
          transform: translateY(0);
        }

        .create-account-btn:disabled {
          opacity: 0.65;

          cursor: not-allowed;

          transform: none;
        }

        .arrow {
          font-size: 19px;

          transition: transform 0.2s ease;
        }

        .create-account-btn:hover .arrow {
          transform: translateX(4px);
        }


        /* ==========================================
           SPINNER
        ========================================== */

        .spinner {
          width: 16px;
          height: 16px;

          border: 2px solid rgba(255, 255, 255, 0.35);

          border-top-color: white;

          border-radius: 50%;

          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }


        /* ==========================================
           LOGIN
        ========================================== */

        .login-section {
          text-align: center;

          margin-top: 24px;

          padding-top: 20px;

          border-top: 1px solid #eeeeee;

          font-size: 13px;

          color: #888;
        }

        .login-section button {
          border: none;

          background: transparent;

          color: #d32f2f;

          font-weight: 700;

          cursor: pointer;

          margin-left: 5px;

          font-size: 13px;
        }

        .login-section button:hover {
          text-decoration: underline;
        }


        /* ==========================================
           TABLET
        ========================================== */

        @media (max-width: 950px) {

          .register-wrapper {
            grid-template-columns: 1fr;

            max-width: 650px;
          }

          .register-intro {
            padding: 40px;
          }

          .register-intro h1 {
            font-size: 38px;
          }

          .intro-description {
            max-width: 550px;
          }

          .intro-features {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
          }

          .register-card {
            padding: 40px;
          }
        }


        /* ==========================================
           MOBILE
        ========================================== */

        @media (max-width: 600px) {

          .register-page {
            padding: 20px 12px;
          }

          .register-wrapper {
            border-radius: 18px;
          }

          .register-intro {
            padding: 30px 25px;
          }

          .brand-mark {
            width: 52px;
            height: 52px;

            margin-bottom: 25px;
          }

          .register-intro h1 {
            font-size: 32px;
          }

          .intro-description {
            font-size: 13px;

            margin: 18px 0 25px;
          }

          .intro-features {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .register-card {
            padding: 30px 22px;
          }

          .register-header h2 {
            font-size: 26px;
          }

          .two-column {
            grid-template-columns: 1fr;

            gap: 0;
          }
        }

      `}</style>
    </div>
  );
}