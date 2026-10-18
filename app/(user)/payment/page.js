"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
const methods = [
  { id: "upi", title: "UPI", icon: "◉", badge: "4 Offers" },
  { id: "card", title: "Cards", icon: "▰", badge: "Up to 10% rewards" },
  { id: "emi", title: "EMI", icon: "◷" },
  { id: "netbanking", title: "Netbanking", icon: "▤" },
  { id: "wallet", title: "Wallet", icon: "▣" },
];
export default function PaymentPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [email, setEmail] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("upi");
  useEffect(() => {
    const now = new Date();
    setOrderNumber(
      "ORD" +
        now.getFullYear() +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        String(now.getHours()).padStart(2, "0") +
        String(now.getMinutes()).padStart(2, "0") +
        String(now.getSeconds()).padStart(2, "0")
    );

    setOrderDate(
      now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
    );

    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      setCartItems(Array.isArray(cart) ? cart : []);

      const subtotal = Array.isArray(cart)
        ? cart.reduce(
            (sum, item) => sum + (Number(item.final_price) || 0),
            0
          )
        : 0;

      const summary = JSON.parse(
        localStorage.getItem("checkoutSummary") || "null"
      );

      const savedTotal = Number(
        summary?.total ?? summary?.totalAmount
      );

      setTotal(
        Number.isFinite(savedTotal) && savedTotal > 0
          ? savedTotal
          : subtotal + (cart.length > 0 ? 60 : 0)
      );

      const checkout = JSON.parse(
        localStorage.getItem("checkoutDetails") || "{}"
      );

      setEmail(
        checkout?.email ||
          checkout?.emailAddress ||
          localStorage.getItem("email") ||
          ""
      );
    } catch (error) {
      console.error("Payment data loading error:", error);
    }
  }, []);

  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const getProductImage = (item) =>
    item?.product_image ||
    item?.productImage ||
    item?.image ||
    item?.image_url ||
    item?.imageUrl ||
    "/uploads/no-image.png";

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.final_price) || 0),
    0
  );

  const shipping = Math.max(0, total - subtotal);

  const handlePayNow = () => {
    if (!orderNumber) {
      alert("Please wait while your order details load.");
      return;
    }

    if (total <= 0) {
      alert("Your cart is empty or the total amount is invalid.");
      return;
    }

    setShowPaymentPopup(true);
  };

  const handleContinueToPay = async () => {
    if (loading) return;

    setLoading(true);

    try {
      if (!window.Razorpay) {
        const scriptLoaded = await new Promise((resolve) => {
          const existingScript = document.querySelector(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
          );

          if (existingScript) {
            existingScript.addEventListener("load", () => resolve(true), {
              once: true,
            });
            existingScript.addEventListener("error", () => resolve(false), {
              once: true,
            });
            return;
          }

          const script = document.createElement("script");
          script.src =
            "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);

          document.body.appendChild(script);
        });

        if (!scriptLoaded || !window.Razorpay) {
          throw new Error("Unable to load Razorpay.");
        }
      }

      const response = await fetch("/api/payment/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to create payment order."
        );
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Crack N Crunch",
        description: `Order ${orderNumber}`,
        order_id: data.orderId,

        prefill: {
          email: email || undefined,
        },

        theme: {
          color: "#17472b",
        },

        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch(
              "/api/payment/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentResponse),
              }
            );

            const result = await verifyResponse.json();

            if (!verifyResponse.ok || !result.success) {
              alert("Payment verification failed.");
              setLoading(false);
              return;
            }

            alert("Payment successful!");
            router.push("/checkout?payment=success");
          } catch (error) {
            console.error("Payment verification error:", error);
            alert(
              "Unable to verify payment. Please contact support."
            );
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (event) => {
        alert(
          event.error?.description ||
            "Payment failed. Please try again."
        );
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.message || "Unable to start payment.");
      setLoading(false);
    }
  };

  return (
    <main className="payment-page">
      {/* EXISTING PAYMENT PAGE — UNCHANGED */}

      <section className="terms-banner">
        <img src="/uploads/Payment.png" alt="Payment banner" />

        <div className="banner-text">
          <a href="/cart">
            <span>SHOPPING CART</span>
          </a>
          <span className="breadcrumb-arrow">» »</span>
          <a href="/checkout">
            <span>CHECKOUT</span>
          </a>
          <span className="breadcrumb-arrow">» »</span>
          <span>PAYMENT</span>
        </div>
      </section>

      <section className="payment-container">
        <div className="payment-box">
          <h2>Complete Your Order</h2>

          <table className="payment-table">
            <tbody>
              <tr>
                <td>Order Number</td>
                <td>{orderNumber || "Loading..."}</td>
              </tr>
              <tr>
                <td>Date</td>
                <td>{orderDate || "Loading..."}</td>
              </tr>
              <tr>
                <td>Total</td>
                <td>
                  <strong>₹{formatPrice(total)}</strong>
                </td>
              </tr>
              <tr>
                <td>Payment Method</td>
                <td>Razorpay</td>
              </tr>
            </tbody>
          </table>

          <div className="payment-message">
            Thank you for placing your order.
            <br />
            <br />
            Click <strong>Pay Now</strong> to view the payment
            options and continue securely.
          </div>

          <div className="btn-group">
            <button
              type="button"
              className="pay-btn"
              onClick={handlePayNow}
            >
              Pay Now
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() => router.push("/checkout")}
            >
              Cancel
            </button>
          </div>
        </div>
      </section>

      {/* NEW POPUP DESIGN */}

      {showPaymentPopup && (
        <div
          className="payment-overlay"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !loading
            ) {
              setShowPaymentPopup(false);
            }
          }}
        >
          <section
            className="payment-popup"
            role="dialog"
            aria-modal="true"
            aria-label="Crack N Crunch payment options"
          >
            <aside className="brand-panel">
              <div className="brand-heading">
                <div className="brand-mark">C</div>
                <div>
                  <h2>CRACK N CRUNCH</h2>
                  <span>DRY FRUITS · SNACKS · SWEETS</span>
                </div>
              </div>

              <div className="price-card">
                <span>Price Summary</span>
                <strong>₹{formatPrice(total)}</strong>

                <div className="price-line" />

                <div className="summary-row">
                  <span>Subtotal</span>
                  <b>₹{formatPrice(subtotal)}</b>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <b>₹{formatPrice(shipping)}</b>
                </div>

                <div className="price-line" />

                <small>
                  Payment status
                  <b className="pending-badge">Pending</b>
                </small>
              </div>

              <div className="contact-strip">
                <span className="contact-icon">♙</span>
                <span className="contact-copy">
                  <small>Paying as</small>
                  <strong>{email || "Customer"}</strong>
                </span>
                <span className="arrow">›</span>
              </div>

              <div className="offer-strip">
                <span>✦</span>
                <strong>Offers on UPI and Cards</strong>
                <span className="arrow">›</span>
              </div>

              <div className="brand-art">
                {cartItems.length > 0 ? (
                  <>
                    <div className="product-image-wrap">
                      <img
                        src={getProductImage(cartItems[0])}
                        alt={
                          cartItems[0].product_title ||
                          cartItems[0].productName ||
                          "Your product"
                        }
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src =
                            "/uploads/no-image.png";
                        }}
                      />
                    </div>

                    <div className="brand-art-copy">
                      <span>Nature's goodness</span>
                      <h3>In every crunch.</h3>
                      <small>FRESH · TASTY · PREMIUM</small>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="art-circle">✦</div>
                    <div className="brand-art-copy">
                      <span>Nature's goodness</span>
                      <h3>In every crunch.</h3>
                      <small>FRESH · TASTY · PREMIUM</small>
                    </div>
                  </>
                )}
              </div>

              <footer className="secure-footer">
                <span className="secure-icon">♧</span>
                <span>Secured payments powered by</span>
                <b>Razorpay</b>
              </footer>
            </aside>

            <section className="payment-content">
              <header className="popup-header">
                <div />

                <div>
                  <h1>Payment Options</h1>
                  <p>Choose your preferred payment method</p>
                </div>

                <button
                  className="close-button"
                  type="button"
                  aria-label="Close payment popup"
                  disabled={loading}
                  onClick={() => setShowPaymentPopup(false)}
                >
                  ×
                </button>
              </header>

              <div className="payment-body">
                <nav className="method-list" aria-label="Payment methods">
                  {methods.map((method) => (
                    <button
                      type="button"
                      key={method.id}
                      className={`method ${
                        selectedMethod === method.id ? "active" : ""
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <span className="method-row">
                        <b>{method.title}</b>
                        <span className="method-icon">
                          {method.icon}
                        </span>
                      </span>

                      {method.badge && (
                        <span className="method-badge">
                          {method.badge}
                        </span>
                      )}
                    </button>
                  ))}

                  <p className="safe-note">
                    ✓ 100% secure payment
                  </p>
                </nav>

                <div className="payment-details">
                  <div className="section-title">
                    <h3>Available Offers</h3>
                    <span>View all</span>
                  </div>

                  <div className="available-offer">
                    <span className="offer-logo">C</span>
                    <div>
                      <b>Special payment offers</b>
                      <p>
                        Check offers available with your bank or
                        payment app.
                      </p>
                    </div>
                  </div>

                  <div className="upi-section">
                    <div className="section-title">
                      <h3>
                        {methods.find(
                          (method) => method.id === selectedMethod
                        )?.title === "UPI"
                          ? "UPI Payment"
                          : methods.find(
                              (method) =>
                                method.id === selectedMethod
                            )?.title}
                      </h3>

                      <span className="fast-badge">
                        Secure checkout
                      </span>
                    </div>

                    <div className="upi-card">
                      {selectedMethod === "upi" ? (
                        <div className="qr-placeholder">
                          <div className="qr-pattern">
                            <span className="qr-corner qr-tl" />
                            <span className="qr-corner qr-tr" />
                            <span className="qr-corner qr-bl" />
                            <span className="qr-center">CNC</span>
                          </div>
                          <small>Illustration only</small>
                        </div>
                      ) : (
                        <div className="selected-icon">
                          {
                            methods.find(
                              (method) =>
                                method.id === selectedMethod
                            )?.icon
                          }
                        </div>
                      )}

                      <div className="upi-copy">
                        <b>
                          {selectedMethod === "upi"
                            ? "Pay with any UPI app"
                            : `Continue with ${
                                methods.find(
                                  (method) =>
                                    method.id === selectedMethod
                                )?.title
                              }`}
                        </b>

                        <p>
                          Continue securely to Razorpay to access
                          available payment options.
                        </p>

                        <div className="app-badges">
                          <span>GPay</span>
                          <span>PhonePe</span>
                          <span>Paytm</span>
                          <span>BHIM</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="payment-bottom">
                    <div>
                      <small>Total payable</small>
                      <strong>₹{formatPrice(total)}</strong>
                    </div>

                    <button
                      type="button"
                      className="continue-pay-button"
                      onClick={handleContinueToPay}
                      disabled={loading}
                    >
                      {loading
                        ? "Opening checkout..."
                        : "Continue to Pay"}
                      {!loading && <span>→</span>}
                    </button>
                  </div>

                  <p className="bottom-note">
                    ♧ Your payment is processed securely by Razorpay.
                  </p>
                </div>
              </div>
            </section>
          </section>
        </div>
      )}

      {/* ALL CSS IN THE SAME FILE */}

      <style jsx>{`
        .payment-page {
          min-height: 100vh;
          background: #f5f5f5;
          color: #222;
          font-family: "Poppins", Arial, sans-serif;
        }

        .terms-banner {
          position: relative;
          width: 100%;
          height: 200px;
          margin-top: 110px;
          overflow: hidden;
        }

        .terms-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .terms-banner::before {
          position: absolute;
          inset: 0;
          content: "";
          background: rgba(0, 0, 0, 0.45);
        }

        .banner-text {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 2;
          width: 95%;
          transform: translate(-50%, -50%);
          color: #fff;
          text-align: center;
          white-space: nowrap;
        }

        .banner-text a {
          text-decoration: none;
        }

        .banner-text span {
          margin: 0 5px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
        }

        .payment-container {
          width: 95%;
          max-width: 900px;
          margin: 40px auto;
          padding-bottom: 20px;
        }

        .payment-box {
          padding: 35px;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }

        .payment-box h2 {
          margin: 0 0 25px;
          color: #222;
          font-size: 26px;
          font-weight: 600;
          text-align: center;
        }

        .payment-table {
          width: 100%;
          margin-bottom: 25px;
          border-collapse: collapse;
        }

        .payment-table tr {
          border-bottom: 1px solid #eee;
        }

        .payment-table td {
          padding: 15px;
          font-size: 16px;
          overflow-wrap: anywhere;
        }

        .payment-table td:first-child {
          width: 40%;
          font-weight: 600;
        }

        .payment-message {
          margin-bottom: 30px;
          padding: 20px;
          border-left: 4px solid #25d366;
          background: #f8f9fa;
          color: #444;
          line-height: 28px;
        }

        .btn-group {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 15px;
        }

        .pay-btn,
        .cancel-btn {
          display: inline-block;
          padding: 14px 35px;
          border: none;
          border-radius: 6px;
          color: #fff;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .pay-btn {
          background: #25d366;
        }

        .pay-btn:hover {
          background: #1ebe5d;
        }

        .cancel-btn {
          background: #dc3545;
        }

        .cancel-btn:hover {
          background: #bb2d3b;
        }

        /* POPUP BACKDROP */

        .payment-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px;
          overflow-y: auto;
          background: rgba(8, 19, 43, 0.72);
          backdrop-filter: blur(7px);
        }

        /* POPUP LAYOUT */

        .payment-popup {
          --green: #17472b;
          --dark: #0b2f1a;
          --cream: #fffdf7;

          display: grid;
          grid-template-columns: 34% 66%;
          width: min(1200px, 100%);
          min-height: 640px;
          margin: auto;
          overflow: hidden;
          border-radius: 16px;
          background: var(--cream);
          box-shadow: 0 30px 100px #0005;
          animation: popupIn 0.25s ease-out;
        }

        @keyframes popupIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* LEFT BRAND PANEL */

        .brand-panel {
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding: 26px 23px 19px;
          color: white;
          background:
            radial-gradient(ellipse at bottom left, #397447, transparent 55%),
            linear-gradient(145deg, #1d6136, #0b2f1a);
        }

        .brand-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }

        .brand-mark {
          display: grid;
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          place-items: center;
          border: 1px solid #d8c58c;
          border-radius: 13px;
          background: #ffffff10;
          color: #f1d99b;
          font-family: Georgia, serif;
          font-size: 28px;
        }

        .brand-heading h2 {
          margin: 0;
          color: #fff8e8;
          font-size: 18px;
          letter-spacing: -0.4px;
        }

        .brand-heading span {
          display: block;
          margin-top: 6px;
          color: #d5e5d1;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .price-card {
          padding: 19px;
          border-radius: 11px;
          background: #fffdf7;
          color: #203327;
        }

        .price-card > span {
          color: #677469;
          font-size: 13px;
        }

        .price-card > strong {
          display: block;
          margin: 10px 0;
          color: #17472b;
          font-size: 32px;
        }

        .price-line {
          height: 1px;
          margin: 14px 0;
          background: #e7e8dd;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin: 9px 0;
          font-size: 11px;
        }

        .summary-row span {
          color: #788078;
        }

        .summary-row b {
          color: #203327;
        }

        .price-card > small {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: #788078;
          font-size: 11px;
        }

        .pending-badge {
          padding: 5px 9px;
          border-radius: 20px;
          background: #fff0d2;
          color: #8d631a;
        }

        .contact-strip,
        .offer-strip {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          min-height: 58px;
          margin-top: 10px;
          padding: 10px 12px;
          border: 1px solid #ffffff35;
          border-radius: 10px;
          background: #fffdf7;
          color: #1c3e26;
          text-align: left;
        }

        .contact-icon {
          display: grid;
          flex-shrink: 0;
          width: 31px;
          height: 31px;
          place-items: center;
          border-radius: 50%;
          background: #e9f1df;
          font-size: 18px;
        }

        .contact-copy {
          flex: 1;
          min-width: 0;
        }

        .contact-copy small,
        .contact-copy strong {
          display: block;
        }

        .contact-copy small {
          margin-bottom: 4px;
          color: #778276;
          font-size: 10px;
        }

        .contact-copy strong {
          overflow-wrap: anywhere;
          font-size: 12px;
        }

        .arrow {
          color: #17472b;
          font-size: 23px;
        }

        .offer-strip {
          background: #e8f4e3;
          font-size: 12px;
        }

        .offer-strip > span:first-child {
          color: #9a7a35;
          font-size: 20px;
        }

        .offer-strip strong {
          flex: 1;
        }

        .brand-art {
          display: flex;
          flex: 1;
          align-items: center;
          justify-content: space-around;
          gap: 12px;
          min-height: 155px;
          padding: 22px 0;
        }

        .art-circle {
          display: grid;
          flex-shrink: 0;
          width: 90px;
          height: 90px;
          place-items: center;
          border: 2px solid #d9c38a;
          border-radius: 50%;
          background: #ffffff12;
          color: #f2d68d;
          font-size: 48px;
        }

        .product-image-wrap {
          display: grid;
          flex-shrink: 0;
          width: 90px;
          height: 90px;
          place-items: center;
          overflow: hidden;
          border: 2px solid #d9c38a;
          border-radius: 16px;
          background: #fffdf7;
        }

        .product-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .brand-art-copy {
          min-width: 0;
        }

        .brand-art-copy > span {
          color: #d7e5d0;
          font-family: Georgia, serif;
          font-size: 12px;
          font-style: italic;
        }

        .brand-art-copy h3 {
          margin: 7px 0;
          color: #f2d58b;
          font-family: Georgia, serif;
          font-size: 25px;
          line-height: 1.1;
        }

        .brand-art-copy small {
          color: #e1e9db;
          font-size: 8px;
          letter-spacing: 0.8px;
        }

        .secure-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
          margin-top: auto;
          padding-top: 13px;
          border-top: 1px solid #ffffff35;
          color: #d7e4d3;
          font-size: 10px;
        }

        .secure-icon {
          font-size: 16px;
        }

        .secure-footer b {
          color: #fff;
          font-size: 12px;
        }

        /* RIGHT PAYMENT PANEL */

        .payment-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #fffdf7;
        }

        .popup-header {
          display: grid;
          grid-template-columns: 32px 1fr 32px;
          align-items: center;
          min-height: 91px;
          padding: 16px 24px;
          border-bottom: 1px solid #e9e9df;
          text-align: center;
        }

        .popup-header h1 {
          margin: 0;
          color: #17472b;
          font-family: Georgia, serif;
          font-size: 26px;
        }

        .popup-header p {
          margin: 6px 0 0;
          color: #7a847c;
          font-size: 11px;
        }

        .close-button {
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #17472b;
          font-size: 28px;
          cursor: pointer;
        }

        .close-button:hover {
          background: #edf3e9;
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .payment-body {
          display: grid;
          flex: 1;
          grid-template-columns: 31% 69%;
          min-height: 0;
        }

        .method-list {
          padding: 17px 12px;
          border-right: 1px solid #e9e9df;
        }

        .method {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 7px;
          width: 100%;
          min-height: 70px;
          margin-bottom: 8px;
          padding: 11px;
          border: 1px solid transparent;
          border-radius: 10px;
          background: transparent;
          color: #26372a;
          text-align: left;
          cursor: pointer;
        }

        .method:hover,
        .method.active {
          border-color: #d8e8d2;
          background: #edf5e8;
        }

        .method-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          font-size: 13px;
        }

        .method-icon {
          color: #17472b;
          font-size: 19px;
        }

        .method-badge,
        .fast-badge {
          display: block;
          width: max-content;
          max-width: 100%;
          padding: 5px 8px;
          border-radius: 20px;
          background: #dcefd6;
          color: #28623b;
          font-size: 10px;
        }

        .safe-note {
          margin: 22px 5px;
          color: #788477;
          font-size: 10px;
        }

        .payment-details {
          min-width: 0;
          padding: 24px;
        }

        .section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 13px;
        }

        .section-title h3 {
          margin: 0;
          color: #26372a;
          font-size: 15px;
        }

        .section-title > span:not(.fast-badge) {
          color: #315d3b;
          font-size: 11px;
        }

        .available-offer {
          display: flex;
          align-items: center;
          gap: 11px;
          min-height: 70px;
          padding: 12px;
          border: 1px solid #dfead9;
          border-radius: 11px;
          background: #f0f6eb;
        }

        .offer-logo {
          display: grid;
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          place-items: center;
          border-radius: 50%;
          background: #17472b;
          color: #fff;
          font-family: Georgia, serif;
          font-size: 19px;
        }

        .available-offer b {
          font-size: 12px;
        }

        .available-offer p {
          margin: 5px 0 0;
          color: #748073;
          font-size: 10px;
          line-height: 1.5;
        }

        .upi-section {
          margin-top: 26px;
        }

        .upi-card {
          display: grid;
          grid-template-columns: minmax(105px, 140px) minmax(0, 1fr);
          align-items: center;
          gap: 18px;
          padding: 15px;
          border: 1px solid #e9e4d5;
          border-radius: 12px;
          background: #fbf8ee;
        }

        .qr-placeholder {
          min-width: 0;
        }

        .qr-pattern {
          position: relative;
          display: grid;
          width: 100%;
          aspect-ratio: 1;
          place-items: center;
          overflow: hidden;
          border: 7px solid #fff;
          outline: 1px solid #e0dac9;
          background-color: #fff;
          background-image: repeating-conic-gradient(
            #263b2c 0% 25%,
            #fff 0% 50%
          );
          background-size: 12px 12px;
        }

        .qr-corner {
          position: absolute;
          width: 27px;
          height: 27px;
          border: 6px solid #20372a;
          background: #fff;
        }

        .qr-corner::after {
          position: absolute;
          inset: 4px;
          background: #20372a;
          content: "";
        }

        .qr-tl {
          top: 3px;
          left: 3px;
        }

        .qr-tr {
          top: 3px;
          right: 3px;
        }

        .qr-bl {
          bottom: 3px;
          left: 3px;
        }

        .qr-center {
          position: relative;
          padding: 4px;
          background: #20372a;
          color: #fff;
          font-size: 10px;
        }

        .qr-placeholder > small {
          display: block;
          margin-top: 9px;
          color: #8b9388;
          font-size: 9px;
          text-align: center;
        }

        .upi-copy b {
          font-size: 13px;
        }

        .upi-copy p {
          margin: 8px 0 13px;
          color: #6e7a6e;
          font-size: 11px;
          line-height: 1.6;
        }

        .app-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .app-badges span {
          padding: 6px 7px;
          border: 1px solid #e7e2d4;
          border-radius: 6px;
          background: #fff;
          color: #35533b;
          font-size: 9px;
          font-weight: bold;
        }

        .selected-icon {
          display: grid;
          width: 65px;
          height: 65px;
          place-items: center;
          border-radius: 12px;
          background: #e4f0dd;
          color: #17472b;
          font-size: 30px;
        }

        .payment-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 22px;
          padding-top: 17px;
          border-top: 1px solid #e9e9df;
        }

        .payment-bottom > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .payment-bottom small {
          color: #7a847c;
          font-size: 10px;
        }

        .payment-bottom strong {
          color: #17472b;
          font-size: 22px;
        }

        .continue-pay-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          min-height: 46px;
          padding: 0 17px;
          border: 1px solid #17472b;
          border-radius: 8px;
          background: #17472b;
          color: #fff;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
        }

        .continue-pay-button:hover {
          background: #0c371e;
        }

        .continue-pay-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .continue-pay-button > span {
          font-size: 18px;
        }

        .bottom-note {
          margin: 17px 0 0;
          color: #8a9388;
          font-size: 10px;
          text-align: center;
        }

        @media (max-width: 850px) {
          .payment-page {
            padding: 14px;
          }

          .payment-popup {
            max-width: 620px;
            grid-template-columns: 1fr;
          }

          .brand-panel {
            padding: 17px 19px;
          }

          .brand-heading {
            margin-bottom: 12px;
          }

          .price-card {
            padding: 13px 16px;
          }

          .price-card > strong {
            font-size: 26px;
          }

          .brand-art {
            min-height: 105px;
            padding: 12px 0;
          }

          .payment-body {
            grid-template-columns: 1fr;
          }

          .method-list {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 7px;
            padding: 10px;
            border-right: 0;
            border-bottom: 1px solid #e9e9df;
          }

          .method {
            min-height: 63px;
            margin: 0;
            padding: 9px;
          }

          .safe-note {
            display: none;
          }

          .payment-details {
            padding: 19px;
          }
        }

        @media (max-width: 480px) {
          .terms-banner {
            height: 160px;
            margin-top: 80px;
          }

          .banner-text span {
            margin: 0 2px;
            font-size: 11px;
          }

          .payment-box {
            padding: 20px;
          }

          .payment-box h2 {
            font-size: 22px;
          }

          .payment-table td {
            padding: 12px 8px;
            font-size: 14px;
          }

          .btn-group {
            flex-direction: column;
          }

          .pay-btn,
          .cancel-btn {
            width: 100%;
          }

          .payment-overlay {
            align-items: flex-start;
            padding: 8px;
          }

          .payment-popup {
            border-radius: 11px;
          }

          .brand-panel {
            padding: 13px;
          }

          .brand-heading h2 {
            font-size: 16px;
          }

          .brand-heading span {
            font-size: 8px;
          }

          .popup-header {
            grid-template-columns: 23px 1fr 30px;
            min-height: 75px;
            padding: 12px;
          }

          .popup-header h1 {
            font-size: 21px;
          }

          .popup-header p {
            font-size: 9px;
          }

          .method-list {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .payment-details {
            padding: 13px;
          }

          .upi-card {
            grid-template-columns: 1fr;
          }

          .qr-placeholder {
            width: 135px;
            margin: auto;
          }

          .upi-copy {
            text-align: center;
          }

          .app-badges {
            justify-content: center;
          }

          .payment-bottom {
            align-items: stretch;
            flex-direction: column;
          }

          .payment-bottom > div {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }

          .continue-pay-button {
            width: 100%;
          }

          .brand-art-copy h3 {
            font-size: 22px;
          }
        }
      `}</style>
    </main>
  );
}