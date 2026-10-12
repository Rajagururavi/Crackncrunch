"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShow, setPasswordShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getValue = (user, keys, fallback = "") => {
    for (const key of keys) {
      const value = user?.[key];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }

    return fallback;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid server response. Please try again.");
      }

      if (!response.ok || !data?.success || !data?.user) {
        setError(data?.message || "Invalid email or password.");
        return;
      }

      const user = data.user;

      const userId = user.id || user._id;

      if (!userId) {
        setError("User ID is missing from the server response.");
        return;
      }

      const userData = {
        logged_in: true,
        id: String(userId),

        full_name: getValue(user, [
          "full_name",
          "fullName",
          "fullname",
          "name",
          "customer_name",
          "customerName",
        ]),

        email: getValue(user, ["email", "email_address"], email.trim()),

        phone: String(
          getValue(user, [
            "phone",
            "mobile",
            "mobile_number",
            "mobileNumber",
            "phone_number",
            "phoneNumber",
          ])
        ),

        address: getValue(user, [
          "address",
          "delivery_address",
          "deliveryAddress",
          "shipping_address",
          "shippingAddress",
          "full_address",
          "fullAddress",
        ]),

        city: getValue(user, [
          "city",
          "delivery_city",
          "deliveryCity",
          "shipping_city",
          "shippingCity",
        ]),

        state: getValue(user, [
          "state",
          "delivery_state",
          "deliveryState",
          "shipping_state",
          "shippingState",
        ]),

        pincode: String(
          getValue(user, [
            "pincode",
            "pin_code",
            "pinCode",
            "postal_code",
            "postalCode",
            "zip",
            "zip_code",
            "zipCode",
          ])
        ),

        country: getValue(
          user,
          ["country", "delivery_country", "deliveryCountry"],
          "India"
        ),
      };

      // Save all user fields returned by the API.
      localStorage.setItem("user", JSON.stringify(userData));

      setMessage("Login successful!");

      // Reload the home page after login.
      window.location.replace("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome Back</h1>

        <p className="login-subtitle">
          Login to your Crack n Crunch account
        </p>

        {message && (
          <div className="success-message" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email ID</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>

            <div className="password-wrapper">
              <input
                id="login-password"
                type={passwordShow ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setPasswordShow((prev) => !prev)}
                aria-label={
                  passwordShow ? "Hide password" : "Show password"
                }
                aria-pressed={passwordShow}
                disabled={loading}
              >
                <i
                  className={
                    passwordShow ? "fa fa-eye-slash" : "fa fa-eye"
                  }
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        <div className="register-text">
          Don&apos;t have an account?{" "}
          <a href="/register">Create an Account</a>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px 15px;
          background: linear-gradient(135deg, #f5deb3, #fff8ed);
          margin-top: 70px;
          box-sizing: border-box;
        }

        .login-card {
          width: 100%;
          max-width: 450px;
          box-sizing: border-box;
          background: #fff;
          padding: 40px;
          border-radius: 18px;
          box-shadow: 0 15px 45px rgba(0, 0, 0, 0.15);
        }

        .login-card h1 {
          margin: 0;
          text-align: center;
          color: #222;
          font-size: 30px;
          font-weight: 700;
        }

        .login-subtitle {
          text-align: center;
          color: #777;
          margin: 10px 0 30px;
          font-size: 14px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #222;
          font-size: 14px;
          font-weight: 600;
        }

        .form-group input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #222;
          font-size: 14px;
          box-sizing: border-box;
        }

        .form-group input:focus {
          border-color: #d32f2f;
          box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.08);
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper input {
          padding-right: 45px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          cursor: pointer;
          color: #555;
          font-size: 16px;
        }

        .login-submit {
          width: 100%;
          height: 48px;
          border: none;
          border-radius: 8px;
          background: #000;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.3s;
        }

        .login-submit:hover {
          background: #222;
        }

        .login-submit:disabled,
        .password-toggle:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-message,
        .error-message {
          padding: 12px;
          border-radius: 7px;
          margin-bottom: 20px;
          text-align: center;
          font-size: 14px;
        }

        .success-message {
          background: #e8f7ed;
          color: #1a8f3c;
          border: 1px solid #b8e5c5;
        }

        .error-message {
          background: #fff0f0;
          color: #d32f2f;
          border: 1px solid #f0bcbc;
        }

        .register-text {
          text-align: center;
          margin-top: 25px;
          color: #777;
          font-size: 14px;
        }

        .register-text a {
          color: #d32f2f;
          font-weight: 600;
          text-decoration: none;
        }

        .register-text a:hover {
          text-decoration: underline;
        }

        @media (max-width: 500px) {
          .login-page {
            padding: 24px 14px;
          }

          .login-card {
            padding: 30px 20px;
          }

          .login-card h1 {
            font-size: 26px;
          }
        }
      `}</style>
    </div>
  );
}