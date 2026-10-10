
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCart([]);
    } finally {
      setLoaded(true);
    }
  }, []);

  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const cartTotal = cart.reduce(
  (total, item) => total + (Number(item.final_price) || 0),
  0
);

const shippingCharge = cart.length > 0 ? 60 : 0;

const grandTotal = cartTotal + shippingCharge;

  const removeCartItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    saveCart(updatedCart);
  };

  

  const getProductImage = (image) => {
    if (!image) return "/uploads/no-image.png";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/")
    ) {
      return image;
    }

    return `/uploads/products/${image}`;
  };

  if (!loaded) {
    return <div className="cart-loading">Loading your cart...</div>;
  }

  return (
    <>
      <div className="terms-banner">
        <img src="/uploads/cart.png" alt="Shopping cart banner" />

        <div className="banner-text">
          <Link href="/cart">
            <span className="active">SHOPPING CART</span>
          </Link>

          <span className="arrows">» »</span>

          <Link href="/checkout">
            <span>CHECKOUT</span>
          </Link>

          <span className="arrows">» »</span>

          <span>ORDER COMPLETE</span>
        </div>
      </div>

      <main className="cart-container">
        <div className="cart-header">
          <h2>My Shopping Cart</h2>
        </div>

        {cart.length > 0 ? (
          cart.map((item, index) => (
            <div className="cart-item" key={`${item.product_id}-${item.weight}-${index}`}>
              <img
                src={getProductImage(item.product_image)}
                alt={item.product_title || "Product"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/uploads/no-image.png";
                }}
              />

              <div className="cart-info">
                <h4>{item.product_title || "No Title"}</h4>

                <p>Weight: {item.weight || "N/A"}</p>

                <p>Quantity: {item.quantity || 1}</p>

                <div className="price">
                  ₹{(Number(item.final_price) || 0).toFixed(2)}
                </div>

                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeCartItem(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty">
            <h2>Your Cart is Currently Empty</h2>

            <p>
              Before proceeding to checkout, you must add some products to
              your shopping cart. You will find a lot of interesting products
              on our Shop page.
            </p>

            <Link href="/shop" className="return-shop-btn">
              Return to Shop
            </Link>
          </div>
        )}
      </main>

      {cart.length > 0 && (
        <section className="cart-summary">
          <div className="coupon-box">
            <h4>Apply Coupon</h4>

            <form onSubmit={(e) => e.preventDefault()}>
              <input
                type="text"
                placeholder="Enter coupon code"
                disabled
              />

              <button type="button" disabled>
                Apply
              </button>
            </form>
          </div>
<div className="summary-box">
  <h3>Cart Totals</h3>

  <div className="line">
    <span>Subtotal</span>
    <span>₹{cartTotal.toFixed(2)}</span>
  </div>

  <div className="line">
    <span>Shipping</span>
    <span>₹{shippingCharge.toFixed(2)}</span>
  </div>

  <p className="shipping-note">
    A flat shipping charge of ₹60 will be added to your total.
  </p>

  <hr />

  <div className="line total">
    <span>Total</span>
    <span>₹{grandTotal.toFixed(2)}</span>
  </div>

  <Link href="/checkout" className="checkout-btn">
    Proceed to Checkout
  </Link>
</div>
        </section>
      )}

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          font-family: Arial, sans-serif;
          background: #f4f6f8;
        }
        .cart-loading {
          min-height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .terms-banner {
          width: 100%;
          height: 300px; /* Banner height reduce */
          margin: 145px auto 0;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;
        }
        .terms-banner img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: fill;
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
          text-align: center;
          color: #fff;
          z-index: 2;
        }

        .banner-text a {
          text-decoration: none;
        }

        .banner-text span {
          color: #fff;
          font-weight: 600;
          display: inline-block;
          margin: 0 5px;
        }

        .banner-text .active {
          text-decoration: underline;
          text-underline-offset: 5px;
        }

        .cart-container {
          width: 92%;
          max-width: 1200px;
          margin: 40px auto 20px;
        }

        .cart-header h2 {
          font-size: 26px;
          margin-bottom: 20px;
          color: #222;
        }

        .cart-item {
          background: #fff;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 18px;
          margin-bottom: 15px;
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
          transition: 0.25s ease;
        }

        .cart-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
        }

        .cart-item > img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid #eee;
          flex-shrink: 0;
        }

        .cart-info {
          flex: 1;
          min-width: 0;
        }

        .cart-info h4 {
          margin: 0 0 8px;
          font-size: 17px;
          color: #222;
          font-weight: 600;
        }

        .cart-info p {
          margin: 6px 0;
          color: #555;
          font-size: 14px;
        }

        .cart-info .price {
          color: #1a8f3c;
          font-weight: 700;
          font-size: 16px;
          margin-top: 8px;
        }

        .remove-btn {
          display: inline-block;
          margin-top: 10px;
          padding: 8px 14px;
          background: #ff3b30;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          transition: 0.2s;
        }

        .remove-btn:hover {
          background: #d70015;
        }

        .empty {
          text-align: center;
          background: #fff;
          padding: 60px 30px;
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }

        .empty h2 {
          margin-bottom: 15px;
          font-size: 28px;
          color: #222;
        }

        .empty p {
          max-width: 600px;
          margin: 0 auto 30px;
          color: #666;
          font-size: 16px;
          line-height: 28px;
        }

        .return-shop-btn {
          display: inline-block;
          padding: 14px 35px;
          background: #1a8f3c;
          color: #fff;
          text-decoration: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          transition: 0.3s;
        }

        .return-shop-btn:hover {
          background: #146b2c;
        }

        .cart-summary {
          width: 92%;
          max-width: 1200px;
          box-sizing: border-box;
          margin: 20px auto 60px;
          background: #fff;
          padding: 20px;
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }

        .coupon-box {
          margin-bottom: 25px;
        }

        .coupon-box h4 {
          margin-bottom: 10px;
        }

        .coupon-box form {
          display: flex;
          gap: 10px;
        }

        .coupon-box input {
          flex: 1;
          min-width: 0;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }

        .coupon-box button {
          padding: 10px 15px;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }

        .coupon-box button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .summary-box h3 {
          margin-bottom: 20px;
          color: #222;
        }

        .line {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 12px;
          font-size: 15px;
          color: #444;
        }

        .line span:last-child {
          text-align: right;
        }

        .line.total {
          font-size: 18px;
          font-weight: bold;
          color: #1a8f3c;
        }

        .summary-box hr {
          border: none;
          border-top: 1px solid #eee;
          margin: 15px 0;
        }

        .checkout-btn {
          display: block;
          text-align: center;
          margin-top: 20px;
          padding: 14px;
          background: #1a8f3c;
          color: #fff;
          border-radius: 10px;
          text-decoration: none;
          font-weight: bold;
          transition: 0.2s;
        }

        .checkout-btn:hover {
          background: #146b2c;
        }

        @media (max-width: 991px) {
          .terms-banner {
            height: 260px;
            margin-top: 90px;
          }

          .banner-text span {
            font-size: 14px;
          }

          .cart-item {
            gap: 15px;
          }

          .cart-item > img {
            width: 90px;
            height: 90px;
          }

          .coupon-box form {
            flex-direction: column;
          }

          .coupon-box button {
            width: 100%;
          }
        }

        @media (max-width: 768px) {
          .terms-banner {
            height: 100%;
            margin-top: 104px;
          }

          .banner-text span {
            margin: 5px;
            font-size: 13px;
          }

          .cart-item {
            flex-direction: column;
            text-align: center;
            padding: 20px;
          }

          .cart-item > img {
            width: 160px;
            height: 160px;
          }

          .cart-info {
            width: 100%;
          }

          .remove-btn {
            min-width: 120px;
            padding: 10px 18px;
          }

          .coupon-box form {
            flex-direction: column;
          }

          .coupon-box input,
          .coupon-box button {
            box-sizing: border-box;
            width: 100%;
          }

          .line {
            font-size: 14px;
          }

          .line.total {
            font-size: 16px;
          }

          .checkout-btn,
          .return-shop-btn {
            box-sizing: border-box;
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .terms-banner {
            height: 180px;
          }

          .banner-text .arrows {
            display: none;
          }

          .banner-text span {
            font-size: 12px;
          }

          .cart-header h2 {
            font-size: 20px;
          }

          .cart-item > img {
            width: 140px;
            height: 140px;
          }

          .empty {
            padding: 40px 20px;
          }

          .empty h2 {
            font-size: 22px;
          }

          .empty p {
            font-size: 14px;
            line-height: 24px;
          }

          .line {
            font-size: 13px;
          }

          .line.total {
            font-size: 15px;
          }

          .cart-summary {
            padding: 16px;
          }
        }
      `}</style>
    </>
  );
}