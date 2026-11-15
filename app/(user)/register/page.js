"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
export default function RegisterPage() {
  const router = useRouter();
  const otpRefs = useRef([]);
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
  const [popupMessage, setPopupMessage] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev, [name]: value,
    }));
    if (name === "email") {
      setOtpVerified(false);
      setVerificationToken("");
      setOtpOpen(false);
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(0);
    }
    setMessage("");
  };
  const handleSendOtp = async () => {
    const email = form.email.trim().toLowerCase();
    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }
    if (otpVerified) {
      setMessage("Email already verified.");
      return;
    }
    if (resendTimer > 0 || sendingOtp) return;
    try {
      setSendingOtp(true);
      setMessage("");
      setOtpError("");
      const response = await fetch("/api/users/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (data.message === "Email already registered.") {
          setPopupMessage("Email ID already exists!");
        } else {
          setPopupMessage(data.message || "Unable to send OTP.");
        }
        return;
      }
      setOtp(["", "", "", "", "", ""]);
      setOtpOpen(true);
      setResendTimer(60);
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      console.error("Send OTP error:", error);
      setMessage("Something went wrong while sending OTP.");
    } finally {
      setSendingOtp(false);
    }
  };
  const handleOtpChange = (value, index) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updatedOtp = [...otp];
    updatedOtp[index] = digit;
    setOtp(updatedOtp);
    setOtpError("");
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updatedOtp = ["", "", "", "", "", ""];
    pasted.split("").forEach((digit, index) => {
      updatedOtp[index] = digit;
    });
    setOtp(updatedOtp);
    setOtpError("");
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP.");
      return;
    }
    try {
      setOtpLoading(true);
      setOtpError("");
      const response = await fetch("/api/users/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          otp: enteredOtp,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setOtpError(data.message || "Invalid or expired OTP.");
        return;
      }
      if (!data.verificationToken) {
        setOtpError("Verification token missing from server.");
        return;
      }
      setVerificationToken(data.verificationToken);
      setOtpVerified(true);
      setOtpOpen(false);
      setOtpError("");
      setMessage("Email verified successfully!");
    } catch (error) {
      console.error("Verify OTP error:", error);
      setOtpError("OTP verification failed. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (loading) return;
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim() || !form.pincode.trim() || !form.state.trim() || !form.password || !form.confirmPassword) {
      setMessage("Please fill all required fields.");
      return;
    }
    if (!otpVerified || !verificationToken) {
      setMessage("Please verify your email before registering.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      setMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!/^[1-9]\d{5}$/.test(form.pincode.trim())) {
      setMessage("Please enter a valid 6-digit PIN code.");
      return;
    }
    if (form.password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
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
        body: JSON.stringify({
          ...form, verificationToken,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (data.message === "Phone number already exists!") {
          setPopupMessage("Phone number already exists!");
        } else if (data.message === "Email already registered.") {
          setPopupMessage("Email ID already exists!");
        } else {
          setPopupMessage(data.message || "Registration failed.");
        }
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
      <div className="bg-circle bg-circle-one"></div>
      <div className="bg-circle bg-circle-two"></div>
      {popupMessage && (
        <div className="register-popup-overlay" onClick={() => setPopupMessage("")} role="presentation">
          <div className="register-popup-modal" role="dialog" aria-modal="true" aria-labelledby="register-popup-title" onClick={(event) => event.stopPropagation()}>
            <div className="register-popup-icon">!</div>
            <h3 id="register-popup-title">Please check</h3>
            <p>{popupMessage}</p>
            <button type="button" className="register-popup-button" onClick={() => setPopupMessage("")} >
              OK
            </button>
          </div>
        </div>
      )}
      <div className="register-wrapper">
        <div className="register-intro">
          <div className="intro-content">
            <div className="brand-mark">
              C<span>&</span>C
            </div>
            <p className="intro-small">WELCOME TO</p>
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
        <div className="register-card">
          <div className="register-header">
            <h2>Create Account</h2>
            <p>Join Crack n Crunch today</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Full Name <span>*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" autoComplete="name" />
              </div>
            </div>
            <div className="form-group">
              <label>
                Email Address <span>*</span>
              </label>
              <div className="email-otp-row">
                <div className="input-wrapper email-input-wrapper">
                  <span className="input-icon">✉</span>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email address" autoComplete="email" disabled={otpVerified} />
                </div>
                <button type="button" className={`send-otp-btn ${
                  otpVerified ? "otp-verified" : ""
                }`} onClick={handleSendOtp} disabled={
                  sendingOtp || otpVerified || resendTimer > 0
                }>
                  {otpVerified ? "Verified ✓" : sendingOtp ? "Sending..." : resendTimer > 0 ? `${resendTimer}s` : "Send OTP"}
                </button>
              </div>
              {otpVerified && (
                <p className="email-verified-text">
                  ✓ Email address verified successfully
                </p>
              )}
            </div>
            <div className="form-group">
              <label>
                Phone Number <span>*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon">☎</span>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter your phone number" maxLength={10} autoComplete="tel" />
              </div>
            </div>
            <div className="form-group">
              <label>
                Address <span>*</span>
              </label>
              <div className="input-wrapper textarea-wrapper">
                <span className="input-icon textarea-icon">⌂</span>
                <textarea name="address" value={form.address} onChange={handleChange} placeholder="Enter your complete address" rows="3" autoComplete="street-address" />
              </div>
            </div>
            <div className="two-column">
              <div className="form-group">
                <label>
                  PIN Code <span>*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">⌖</span>
                  <input type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="600001" maxLength={6} autoComplete="postal-code" />
                </div>
              </div>
              <div className="form-group">
                <label>
                  State <span>*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">◈</span>
                  <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="Tamil Nadu" autoComplete="address-level1" />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Country</label>
              <div className="input-wrapper select-wrapper">
                <span className="input-icon">🌐</span>
                <select name="country" value={form.country} onChange={handleChange}>
                  <option value="India">India</option>
                </select>
              </div>
            </div>
            <div className="two-column">
              <div className="form-group">
                <label>
                  Password <span>*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Create password" autoComplete="new-password" />
                </div>
              </div>
              <div className="form-group">
                <label>
                  Confirm Password <span>*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" autoComplete="new-password"/>
                </div>
              </div>
            </div>
            {message && (
              <div className={`register-message ${
                message.includes("successfully") ? "success" : "error"
              }`}>
                <span>
                  {message.includes("successfully") ? "✓" : "!"}
                </span>
                {message}
              </div>
            )}
            <button type="submit" className="create-account-btn" disabled={loading}>
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
          <div className="login-section">
            <span>Already have an account?</span>
            <button type="button" onClick={() => router.push("/login")}>
              Login
            </button>
          </div>
        </div>
      </div>
      {otpOpen && (
        <div className="otp-overlay">
          <div className="otp-modal">
            <button type="button" className="otp-close" onClick={() => setOtpOpen(false)}>
              ×
            </button>
            <div className="otp-mail-icon">✉</div>
            <h2>Verify Your Email</h2>
            <p>
              We have sent a 6-digit OTP to
              <strong> {form.email}</strong>
            </p>
            <div className="otp-inputs">
              {otp.map((digit, index) => (
                <input key={index} ref={(el) => {
                  otpRefs.current[index] = el;
                }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) =>
                  handleOtpChange(e.target.value, index)
                } onKeyDown={(e) =>
                  handleOtpKeyDown(e, index)
                } onPaste={
                  index === 0 ? handleOtpPaste : undefined
                }/>
              ))}
            </div>
            {otpError && (
              <div className="otp-error">
                {otpError}
              </div>
            )}
            <button type="button" className="verify-otp-btn" onClick={handleVerifyOtp} disabled={otpLoading}>
              {otpLoading ? "Verifying..." : "VERIFY OTP"}
            </button>
            <div className="otp-resend">
              Didn't receive OTP?{" "}
              <button type="button" onClick={handleSendOtp} disabled={resendTimer > 0 || sendingOtp}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : sendingOtp ? "Sending..." : "Resend OTP"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .register-page {
          min-height: 100vh;
          background: radial-gradient(circle at 10% 20%, rgba(211, 47, 47, 0.06), transparent 35%), #f7f7f5;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 55px 25px;
          position: relative;
          overflow: hidden;
          font-family: Arial, Helvetica, sans-serif;
          margin-top: 120px;
        }
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
        .register-wrapper {
          width: 100%;
          max-width: 1120px;
          min-height: 700px;
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          background: #ffffff;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.10), 0 5px 20px rgba(0, 0, 0, 0.04);
          position: relative;
          z-index: 2;
        }
        .register-intro {
          background: linear-gradient(145deg, #9f1818 0%, #c62828 48%, #e04444 100%);
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
        .register-card {
          padding: 48px 55px;
          background: #ffffff;
          overflow-y: auto;
        }
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
        .input-wrapper {
          height: 48px;
          display: flex;
          align-items: center;
          border: 1px solid #e2e2e2;
          border-radius: 9px;
          background: #fafafa;
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }
        .input-wrapper:focus-within {
          border-color: #d32f2f;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.08);
        }
        .input-icon {
          width: 45px;
          flex-shrink: 0;
          text-align: center;
          color: #a2a2a2;
          font-size: 15px;
        }
        .input-wrapper input, .input-wrapper textarea, .input-wrapper select {
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #222;
          font-size: 13px;
          font-family: inherit;
        }
        .input-wrapper input::placeholder, .input-wrapper textarea::placeholder {
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
        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .email-otp-row {
          display: flex;
          align-items: stretch;
          gap: 8px;
        }
        .email-input-wrapper {
          flex: 1;
          min-width: 0;
        }
        .send-otp-btn {
          flex-shrink: 0;
          min-width: 92px;
          padding: 0 13px;
          border: none;
          border-radius: 9px;
          background: linear-gradient(135deg, #b51f1f, #d32f2f);
          color: white;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }
        .send-otp-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 5px 12px rgba(211, 47, 47, 0.2);
        }
        .send-otp-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .send-otp-btn.otp-verified {
          background: #21853a;
        }
        .email-verified-text {
          color: #21853a;
          font-size: 11px;
          margin: 7px 0 0;
          font-weight: 600;
        }
        .register-popup-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.58);
          backdrop-filter: blur(3px);
        }
        .register-popup-modal {
          width: 100%;
          max-width: 390px;
          padding: 30px 26px 25px;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.25);
          text-align: center;
          animation: registerPopupIn 0.2s ease-out;
        }
        .register-popup-icon {
          width: 52px;
          height: 52px;
          margin: 0 auto 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #d32f2f;
          border-radius: 50%;
          color: #d32f2f;
          font-size: 30px;
          font-weight: 700;
        }
        .register-popup-modal h3 {
          margin: 0 0 9px;
          color: #222;
          font-size: 21px;
        }
        .register-popup-modal p {
          margin: 0 0 23px;
          color: #555;
          font-size: 15px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }
        .register-popup-button {
          min-width: 105px;
          padding: 11px 25px;
          border: 0;
          border-radius: 8px;
          background: linear-gradient(135deg, #b51f1f, #d32f2f);
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .register-popup-button:hover {
          opacity: 0.92;
        }
        @keyframes registerPopupIn {
          from { 
            opacity: 0; 
            transform: translateY(8px) scale(0.97); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
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
        .create-account-btn {
          width: 100%;
          height: 51px;
          border: none;
          border-radius: 9px;
          background: linear-gradient(135deg, #b51f1f, #d32f2f);
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 8px 20px rgba(211, 47, 47, 0.20);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .create-account-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(211, 47, 47, 0.28);
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
        .otp-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          background: rgba(0, 0, 0, 0.60);
        }
        .otp-modal {
          position: relative;
          width: 100%;
          max-width: 410px;
          padding: 38px 28px;
          border-radius: 18px;
          background: #ffffff;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          animation: otpAppear 0.25s ease;
        }
        @keyframes otpAppear {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .otp-close {
          position: absolute;
          top: 12px;
          right: 17px;
          border: none;
          background: transparent;
          color: #888;
          font-size: 27px;
          cursor: pointer;
        }
        .otp-mail-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fff0f0;
          color: #c62828;
          font-size: 27px;
        }
        .otp-modal h2 {
          margin: 0 0 12px;
          color: #222;
          font-size: 23px;
          font-weight: 800;
        }
        .otp-modal p {
          margin: 0;
          color: #777;
          font-size: 13px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }
        .otp-modal p strong {
          color: #333;
        }
        .otp-inputs {
          display: flex;
          justify-content: center;
          gap: 9px;
          margin: 28px 0 20px;
        }
        .otp-inputs input {
          width: 43px;
          height: 49px;
          border: 1px solid #ddd;
          border-radius: 8px;
          outline: none;
          background: #fafafa;
          text-align: center;
          font-size: 20px;
          font-weight: 700;
          color: #222;
        }
        .otp-inputs input:focus {
          border-color: #d32f2f;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.08);
        }
        .otp-error {
          color: #c62828;
          background: #fff0f0;
          padding: 10px;
          border-radius: 7px;
          font-size: 12px;
          margin-bottom: 14px;
        }
        .verify-otp-btn {
          width: 100%;
          height: 49px;
          border: none;
          border-radius: 9px;
          background: linear-gradient(135deg, #b51f1f, #d32f2f);
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .verify-otp-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .otp-resend {
          margin-top: 20px;
          color: #888;
          font-size: 12px;
        }
        .otp-resend button {
          border: none;
          background: transparent;
          color: #d32f2f;
          font-weight: 700;
          cursor: pointer;
          font-size: 12px;
        }
        .otp-resend button:disabled {
          color: #999;
          cursor: not-allowed;
        }
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
          .email-otp-row {
            gap: 6px;
          }
          .send-otp-btn {
            min-width: 80px;
            padding: 0 8px;
            font-size: 11px;
          }
          .otp-modal {
            padding: 35px 18px;
          }
          .otp-inputs {
            gap: 6px;
          }
          .otp-inputs input {
            width: 39px;
            height: 45px;
          }
        }
      `}</style>
    </div>
  );
}