"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
let razorpayScriptPromise;
function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }
  if (window.Razorpay) {
    return Promise.resolve(true);
  }
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        resolve(Boolean(window.Razorpay));
      };
      script.onerror = () => {
        razorpayScriptPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}
function getItemPrice(item) {
  return Number(item.final_price ?? item.finalPrice ?? item.offerPrice ?? item.offer_price ?? item.price ?? 0);
}
export default function PaymentPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [checkoutAddress, setCheckoutAddress] = useState({});
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");
  useEffect(() => {
    try {
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
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      );
      const parsedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const cart = Array.isArray(parsedCart) ? parsedCart : [];
      setCartItems(cart);
      const calculatedSubtotal = cart.reduce((sum, item) => {
        const price = getItemPrice(item);
        const quantity = Number(item.quantity || 1);
        return sum + price * quantity;
      }, 0);
      const summary = JSON.parse(localStorage.getItem("checkoutSummary") || "null");
      const savedSubtotal = Number(summary?.subtotal);
      const finalSubtotal = Number.isFinite(savedSubtotal) && savedSubtotal >= 0 ? savedSubtotal : calculatedSubtotal;
      const savedShipping = Number(summary?.shipping);
      const finalShipping = Number.isFinite(savedShipping) && savedShipping >= 0 ? savedShipping : cart.length > 0 ? 60 : 0;
      const savedTotal = Number(summary?.total ?? summary?.totalAmount);
      const finalTotal = Number.isFinite(savedTotal) && savedTotal > 0 ? savedTotal : finalSubtotal + finalShipping;
      setSubtotal(finalSubtotal);
      setShipping(finalShipping);
      setTotal(finalTotal);
      const checkout = JSON.parse(localStorage.getItem("checkoutAddress") || "{}");
      setCheckoutAddress(checkout);
      const user = JSON.parse(localStorage.getItem("user") || "null");
      setUserId(String(user?.id || user?._id || user?.userId || user?.user_id || ""));
      setEmail(checkout?.email || checkout?.emailAddress || user?.email || localStorage.getItem("email") || "");
    } catch (error) {
      console.error("Payment data loading error:", error);
      alert("Unable to load checkout details. Please try again.");
    } finally {
      setPageReady(true);
    }
  }, []);
  const formatPrice = (price) =>
    Number(price || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  const handlePayNow = async () => {
    if (loading) return;
    if (!pageReady) {
      alert("Please wait. Your order details are loading.");
      return;
    }
    if (!cartItems.length || total <= 0) {
      alert("Your cart is empty or the total amount is invalid.");
      return;
    }
    if (!checkoutAddress?.fullname || !checkoutAddress?.mobile || !checkoutAddress?.address) {
      alert("Delivery details are missing. Please return to checkout.");
      router.push("/checkout");
      return;
    }
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("Razorpay could not be loaded. Please try again.");
      }
      const orderResponse = await fetch("/api/payment/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          receipt: orderNumber,
        }),
      });
      const orderData = await orderResponse.json();
      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || "Unable to create Razorpay order.");
      }
      if (!orderData.orderId || !orderData.keyId) {
        throw new Error("Razorpay order details are missing.");
      }
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Crack N Crunch",
        description: `Order ${orderNumber}`,
        order_id: orderData.orderId,
        prefill: {
          name: checkoutAddress.fullname || undefined,
          email: email || undefined,
          contact: checkoutAddress.mobile || undefined,
        },
        notes: {
          order_number: orderNumber,
        },
        theme: {
          color: "#17472b",
        },
        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch("/api/payment/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  receipt: orderNumber,
                  orderDate,
                  customer: {
                    ...checkoutAddress,
                    id: userId,
                    userId: userId,
                  },
                  items: cartItems,
                  summary: {
                    subtotal,
                    shipping,
                    total,
                  },
                  currency: "INR",
                }),
              }
            );
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }
            setPaymentId(paymentResponse.razorpay_payment_id);
            setPaymentSuccess(true);
            setLoading(false);
            localStorage.removeItem("cart");
            window.dispatchEvent(new Event("cartUpdated"));
          } catch (error) {
            console.error("Payment verification error:", error);
            alert(error.message || "Payment verification failed. Please contact support.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response.error);
        alert(response.error?.description || "Payment failed. Please try again.");
        setLoading(false);
      });
      razorpay.open();
    } catch (error) {
      console.error("Payment start error:", error);
      alert(error.message || "Unable to start payment.");
      setLoading(false);
    }
  };
  return (
    <main className="payment-page">
      <section className="terms-banner">
        <img
          src="/uploads/Payment.png"
          alt="Payment banner"
        />
        <div className="banner-text">
          <a href="/cart">SHOPPING CART</a>
          <span> » » </span>
          <a href="/checkout">CHECKOUT</a>
          <span> » » </span>
          <b>PAYMENT</b>
        </div>
      </section>
      <section className="payment-container">
        <div className="payment-box">
          {paymentSuccess ? (
            <div className="success-container">
              <div className="success-icon">
                <span>✓</span>
              </div>
              <h2>Payment Successful!</h2>
              <p className="success-subtitle">
                Thank you for shopping with Crack N Crunch.
              </p>
              <p className="success-description">
                Your payment has been received successfully.
                Your order is being processed.
              </p>
              <div className="success-details">
                <div className="success-detail-row">
                  <span>Order Number</span>
                  <strong>{orderNumber}</strong>
                </div>
                <div className="success-detail-row">
                  <span>Payment ID</span>
                  <strong>{paymentId}</strong>
                </div>
                <div className="success-detail-row">
                  <span>Payment Amount</span>
                  <strong>₹{formatPrice(total)}</strong>
                </div>
                <div className="success-detail-row">
                  <span>Payment Status</span>
                  <strong className="paid-status">
                    PAID
                  </strong>
                </div>
              </div>
              <div className="success-thankyou">
                <p>
                  Thank you for choosing Crack N Crunch!
                </p>
                <p>
                  We appreciate your order.
                </p>
              </div>
              <button type="button" className="continue-btn" onClick={() => router.push("/")}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
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
                    <td>Subtotal</td>
                    <td>₹{formatPrice(subtotal)}</td>
                  </tr>
                  <tr>
                    <td>Shipping</td>
                    <td>₹{formatPrice(shipping)}</td>
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
                Click <strong>Pay Now</strong> to open Razorpay
                and complete your payment securely.
              </div>
              <div className="btn-group">
                <button type="button" className="pay-btn" onClick={handlePayNow} disabled={loading || !pageReady}>
                  {loading ? "Opening Razorpay..." : "Pay Now"}
                </button>
                <button type="button" className="cancel-btn" onClick={() => router.push("/checkout")} disabled={loading}>
                  Cancel
                </button>
              </div>
              <p className="secure-note">
                Secure payments powered by Razorpay
              </p>
            </>
          )}
        </div>
      </section>
      <style jsx>{`
        .payment-page {
          min-height: 100vh;
          background: #f5f5f5;
          color: #222;
          font-family: Poppins, Arial, sans-serif;
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
        }
        .banner-text a, .banner-text b, .banner-text span {
          margin: 0 5px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }
        .payment-container {
          width: 95%;
          max-width: 900px;
          margin: 40px auto;
          padding-bottom: 30px;
        }
        .payment-box {
          padding: 35px;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }
        .payment-box h2 {
          margin: 0 0 25px;
          color: #17472b;
          font-size: 26px;
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
          margin-bottom: 25px;
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
        .pay-btn, .cancel-btn {
          min-width: 160px;
          padding: 14px 35px;
          border: none;
          border-radius: 6px;
          color: #fff;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }
        .pay-btn {
          background: #17472b;
        }
        .pay-btn:hover {
          background: #0d351e;
        }
        .cancel-btn {
          background: #dc3545;
        }
        .cancel-btn:hover {
          background: #bb2d3b;
        }
        .pay-btn:disabled, .cancel-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .secure-note {
          margin-top: 22px;
          color: #68766b;
          font-size: 12px;
          text-align: center;
        }
        .success-container {
          padding: 20px 10px;
          text-align: center;
        }
        .success-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 85px;
          height: 85px;
          margin: 0 auto 20px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 5px 20px rgba(34, 197, 94, 0.25);
          animation: successPop 0.5s ease;
        }
        .success-icon span {
          color: white;
          font-size: 55px;
          font-weight: bold;
          line-height: 1;
        }
        .success-container h2 {
          margin-bottom: 12px;
          color: #15803d;
          font-size: 30px;
        }
        .success-subtitle {
          color: #333;
          font-size: 18px;
          font-weight: 600;
        }
        .success-description {
          margin: 12px 0 25px;
          color: #666;
          font-size: 15px;
          line-height: 25px;
        }
        .success-details {
          max-width: 550px;
          margin: 0 auto 25px;
          padding: 20px;
          border: 1px solid #dcfce7;
          border-radius: 10px;
          background: #f0fdf4;
          text-align: left;
        }
        .success-detail-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 13px 5px;
          border-bottom: 1px solid #dcfce7;
          font-size: 14px;
        }
        .success-detail-row:last-child {
          border-bottom: none;
        }
        .success-detail-row span {
          color: #555;
        }
        .success-detail-row strong {
          color: #17472b;
          text-align: right;
          overflow-wrap: anywhere;
        }
        .paid-status {
          color: #16a34a !important;
        }
        .success-thankyou {
          margin: 20px 0;
          color: #555;
          line-height: 25px;
        }
        .success-thankyou p:first-child {
          font-weight: 600;
          color: #17472b;
        }
        .continue-btn {
          margin-top: 15px;
          padding: 14px 35px;
          border: none;
          border-radius: 6px;
          background: #17472b;
          color: white;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }
        .continue-btn:hover {
          background: #0d351e;
          transform: translateY(-2px);
        }
        @keyframes successPop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          70% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @media (max-width: 600px) {
          .terms-banner {
            height: 160px;
            margin-top: 80px;
          }
          .banner-text a, .banner-text b, .banner-text span {
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
          .pay-btn, .cancel-btn {
            width: 100%;
          }
          .success-container h2 {
            font-size: 24px;
          }
          .success-subtitle {
            font-size: 16px;
          }
          .success-description {
            font-size: 14px;
          }
          .success-details {
            padding: 12px;
          }
          .success-detail-row {
            flex-direction: column;
            gap: 5px;
            font-size: 13px;
          }
          .success-detail-row strong {
            text-align: left;
          }
          .continue-btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}