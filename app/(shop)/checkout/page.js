"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SHIPPING_CHARGE = 60;

function getEstimatedDelivery() {
  const date = new Date();
  let days = 0;

  while (days < 7) {
    date.setDate(date.getDate() + 1);

    // Monday to Friday
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days++;
    }
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CheckoutPage() {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [form, setForm] = useState({
    fullname: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });

  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!savedUser || savedUser.logged_in !== true) {
        router.replace("/register?redirect=/checkout");
        return;
      }

      const savedCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      if (!Array.isArray(savedCart) || savedCart.length === 0) {
        router.replace("/cart");
        return;
      }

      setUser(savedUser);
      setCart(savedCart);

      setForm((previous) => ({
        ...previous,
        fullname: savedUser.full_name || "",
        mobile: savedUser.phone || "",
        email: savedUser.email || "",
        address: savedUser.address || "",
        city: savedUser.city || "",
        state: savedUser.state || "",
        pincode: savedUser.pincode || "",
      }));

      setLoaded(true);
    } catch (error) {
      console.error("Checkout loading error:", error);
      router.replace("/register?redirect=/checkout");
    }
  }, [router]);

  const subtotal = cart.reduce(
    (total, item) =>
      total + (Number(item.final_price) || 0),
    0
  );

  const shipping = cart.length > 0 ? SHIPPING_CHARGE : 0;
  const total = subtotal + shipping;

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!user || user.logged_in !== true) {
      router.replace("/register?redirect=/checkout");
      return;
    }

    if (cart.length === 0) {
      router.replace("/cart");
      return;
    }

    if (!acceptedTerms) {
      alert("Please accept Terms & Conditions.");
      return;
    }

    // Next step: connect this form to your order/payment API.
    // Do not clear the cart until the order is successfully placed.
    alert(
      "Customer details validated. Connect your order API to place the order."
    );
  };

  if (!loaded) {
    return (
      <div className="checkout-loading">
        Loading checkout...
      </div>
    );
  }

  return (
    <>
      <div className="terms-banner">
        <img src="/uploads/Checkout.png" alt="Checkout banner" />

        <div className="banner-text">
          <Link href="/cart">SHOPPING CART</Link>
          <span>» »</span>
          <span className="active">CHECKOUT</span>
          <span>» »</span>
          <span>ORDER COMPLETE</span>
        </div>
      </div>

      <main className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="checkout-grid">
            <section className="checkout-box">
              <h3>Customer Details</h3>

              <div className="input-group">
                <label htmlFor="fullname">Full Name</label>
                <input
                  id="fullname"
                  name="fullname"
                  value={form.fullname}
                  onChange={updateField}
                  placeholder="Enter Full Name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="mobile">Mobile Number</label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={updateField}
                    placeholder="Enter Mobile Number"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="Enter Email Address"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="address">Delivery Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={updateField}
                  placeholder="Enter Full Address"
                  required
                />
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={updateField}
                    placeholder="Enter City"
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={updateField}
                    placeholder="Enter State"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    name="country"
                    value={form.country}
                    onChange={updateField}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    id="pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={updateField}
                    placeholder="Enter Pincode"
                    inputMode="numeric"
                    required
                  />
                </div>
              </div>
            </section>

            <div className="checkout-right">
              <section className="checkout-box">
                <h3>Order Summary</h3>

                {cart.map((item, index) => (
                  <div
                    className="order-row"
                    key={`${item.product_id}-${item.weight}-${index}`}
                  >
                    <span>
                      {item.product_title || "Product"} ×{" "}
                      {item.quantity || 1}
                      {" "}({item.weight || "N/A"})
                    </span>

                    <strong>
                      ₹{(Number(item.final_price) || 0).toFixed(2)}
                    </strong>
                  </div>
                ))}

                <hr />

                <div className="order-row">
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toFixed(2)}</strong>
                </div>

                <div className="order-row">
                  <span>Shipping Charge</span>
                  <strong>₹{shipping.toFixed(2)}</strong>
                </div>

                <div className="date-box">
                  <strong>Order Date</strong>
                  <p>
                    {new Date().toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="date-box">
                  <strong>Estimated Delivery</strong>
                  <p>{getEstimatedDelivery()}</p>
                </div>

                <hr />

                <div className="total-row">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </section>

              <section className="payment-method-box">
                <div className="terms-box">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(event) =>
                      setAcceptedTerms(event.target.checked)
                    }
                    required
                  />

                  <label htmlFor="terms">
                    I have read and agree to the website{" "}
                    <Link href="/terms" target="_blank">
                      Terms &amp; Conditions
                    </Link>
                    <span className="required"> *</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="place-order-btn"
                >
                  Place Order
                </button>
              </section>
            </div>
          </div>
        </form>
      </main>

      <style jsx global>{`
        .checkout-loading {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .terms-banner {
          position: relative;
          width: 100%;
          height: 200px;
          margin-top: 110px;
          overflow: hidden;
        }

        .terms-banner img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
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
          width: 95%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          color: #fff;
          z-index: 2;
        }

        .banner-text a,
        .banner-text span {
          color: #fff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }

        .banner-text .active {
          text-decoration: underline;
          text-underline-offset: 5px;
        }

        .checkout-container {
          width: 95%;
          max-width: 1200px;
          margin: 40px auto;
          color: #222;
        }

        .checkout-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 25px;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 25px;
          align-items: start;
        }

        .checkout-box {
          min-width: 0;
          background: #fff;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
        }

        .checkout-box h3 {
          margin: 0 0 20px;
          font-size: 22px;
        }

        .input-group {
          min-width: 0;
          margin-bottom: 18px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #444;
        }

        .input-group input,
        .input-group textarea {
          display: block;
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 12px;
          outline: none;
          font-size: 15px;
          background: #fff;
          color: #222;
        }

        .input-group input:focus,
        .input-group textarea:focus {
          border-color: #28a745;
        }

        .input-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .order-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 15px;
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .order-row strong {
          flex-shrink: 0;
          font-weight: 600;
        }

        .checkout-box hr {
          border: 0;
          border-top: 1px solid #e5e5e5;
          margin: 15px 0;
        }

        .date-box {
          background: #fafafa;
          border: 1px solid #eee;
          border-radius: 8px;
          padding: 12px;
          margin: 12px 0;
          font-size: 14px;
        }

        .date-box p {
          margin: 5px 0 0;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          font-size: 22px;
          font-weight: 700;
          margin-top: 15px;
          color: #28a745;
        }

        .payment-method-box {
          padding: 25px;
          background: #fafafa;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .terms-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .terms-box input {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          margin-top: 3px;
          accent-color: #28a745;
        }

        .terms-box label {
          font-size: 14px;
          line-height: 1.7;
          color: #444;
        }

        .terms-box a {
          color: #2e7d32;
          font-weight: 600;
          text-decoration: none;
        }

        .required {
          color: #e53935;
          font-weight: bold;
        }

        .place-order-btn {
          width: 100%;
          padding: 15px;
          border: none;
          border-radius: 8px;
          background: #28a745;
          color: #fff;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .place-order-btn:hover {
          background: #218838;
        }

        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr;
          }

          .checkout-title {
            font-size: 28px;
          }
        }

        @media (max-width: 600px) {
          .terms-banner {
            height: 180px;
            margin-top: 104px;
          }

          .banner-text {
            gap: 7px;
          }

          .banner-text a,
          .banner-text span {
            font-size: 11px;
          }

          .checkout-container {
            width: 94%;
            margin-top: 25px;
          }

          .checkout-title {
            font-size: 25px;
          }

          .checkout-box {
            padding: 18px;
          }

          .checkout-box h3 {
            font-size: 20px;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .payment-method-box {
            padding: 16px;
          }

          .total-row {
            font-size: 19px;
          }

          .place-order-btn {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}