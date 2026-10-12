"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const SHIPPING_CHARGE = 60;
const BANNER_IMAGE = "/images/checkout-banner.jpg";
const EMPTY_FORM = {
  fullname: "",
  mobile: "",
  email: "",
  address: "",
  state: "",
  country: "India",
  pincode: "",
};
function getUserValue(user, keys) {
  for (const key of keys) {
    const value = user?.[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return "";
}
function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
function getItemPrice(item) {
  return Number(
    item.final_price ??
      item.finalPrice ??
      item.offerPrice ??
      item.offer_price ??
      item.price ??
      0
  );
}
function getItemTotal(item) {
  return getItemPrice(item) * Math.max(1, Number(item.quantity) || 1);
}
export default function CheckoutPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY_FORM);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showAddressConfirm, setShowAddressConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const loggedIn = localStorage.getItem("logged_in");
      if (loggedIn !== "true" && !savedUser.id && !savedUser._id) {
        router.replace("/register?redirect=/checkout");
        return;
      }
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const savedCheckout = JSON.parse(localStorage.getItem("checkoutAddress") || "{}");
      setCart(Array.isArray(savedCart) ? savedCart : []);
      setForm({
        fullname: getUserValue(savedUser, [
          "fullname",
          "full_name",
          "name",
          "username",
        ]),
        mobile: getUserValue(savedUser, [
          "mobile",
          "phone",
          "phoneNumber",
          "mobileNumber",
        ]),
        email: getUserValue(savedUser, ["email"]),
        address:
          savedCheckout.address ||
          getUserValue(savedUser, [
            "address",
            "fullAddress",
            "deliveryAddress",
          ]),
        state: savedCheckout.state || getUserValue(savedUser, ["state", "userState"]),
        country: savedCheckout.country || getUserValue(savedUser, ["country"]) || "India",
        pincode: savedCheckout.pincode ||
          getUserValue(savedUser, [
            "pincode",
            "pinCode",
            "postalCode",
            "zipCode",
          ]),
      });
    } catch (err) {
      console.error("Checkout loading error:", err);
      setError("Unable to load checkout details.");
    } finally {
      setLoading(false);
    }
  }, [router]);
  const subtotal = cart.reduce((sum, item) => sum + getItemTotal(item), 0);
  const total = subtotal + SHIPPING_CHARGE;
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setError("");
  }
  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!cart.length) {
      setError("Your cart is empty. Please add products first.");
      return;
    }
    if (!termsAccepted) {
      setError("Please accept the Terms and Conditions.");
      return;
    }
    if (!form.address.trim() || !form.state.trim() || !form.pincode.trim()) {
      setError("Please enter your address, state and pincode.");
      return;
    }
    if (!/^[0-9]{6}$/.test(form.pincode.trim())) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }
    setShowAddressConfirm(true);
  }
  function confirmAddressAndContinue() {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const deliveryDetails = {
        address: form.address.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: form.country.trim() || "India",
      };
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...savedUser,
          ...deliveryDetails,
        })
      );
      localStorage.setItem(
        "checkoutAddress",
        JSON.stringify({
          ...deliveryDetails,
          fullname: form.fullname,
          mobile: form.mobile,
          email: form.email,
        })
      );

      localStorage.setItem(
        "checkoutSummary",
        JSON.stringify({
          subtotal,
          shipping: SHIPPING_CHARGE,
          total,
        })
      );

      router.push("/payment");
    } catch (err) {
      console.error("Unable to save checkout details:", err);
      setError("Unable to save your details. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="checkout-loading">
        <span className="checkout-loader" />
        <p>Loading checkout...</p>

        <style jsx>{`
          .checkout-loading {
            min-height: 55vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 12px;
            color: #555;
          }

          .checkout-loader {
            width: 36px;
            height: 36px;
            border: 4px solid #eee;
            border-top-color: #e87922;
            border-radius: 50%;
            animation: checkoutSpin 0.8s linear infinite;
          }

          @keyframes checkoutSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main className="checkout-page">
      {/* Banner */}
      <section className="checkout-banner">
        <img
          className="checkout-banner-image"
          src="/uploads/Checkout.png"
          alt="Checkout banner"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />

        <div className="checkout-banner-overlay">
          <div className="checkout-banner-content">
            <h1>Checkout</h1>
            <p>Complete your order securely</p>
          </div>
        </div>
      </section>

      <div className="checkout-container">
        <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/cart">Cart</Link>
          <span>/</span>
          <strong>Checkout</strong>
        </nav>

        <header className="checkout-title">
          <div>
            <h2>Delivery &amp; Payment</h2>
            <p>Confirm your delivery details before placing your order.</p>
          </div>

          <div className="checkout-secure-badge">
            <span>🔒</span> Secure Checkout
          </div>
        </header>

        {!cart.length ? (
          <section className="checkout-empty">
            <div className="checkout-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add products to your cart to continue.</p>
            <Link href="/shop" className="checkout-primary-button">
              Continue Shopping
            </Link>
          </section>
        ) : (
          <form className="checkout-layout" onSubmit={handleSubmit}>
            <div className="checkout-main">
              {/* Delivery details */}
              <section className="checkout-card">
                <div className="checkout-card-heading">
                  <span className="checkout-step">01</span>
                  <div>
                    <h3>Delivery Information</h3>
                    <p>Edit your address, state and pincode below.</p>
                  </div>
                </div>

                <div className="checkout-form-grid">
                  <div className="checkout-field">
                    <label htmlFor="fullname">Full Name</label>
                    <input
                      id="fullname"
                      value={form.fullname}
                      readOnly
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="mobile">Mobile Number</label>
                    <input
                      id="mobile"
                      value={form.mobile}
                      readOnly
                    />
                  </div>

                  <div className="checkout-field full-width">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      readOnly
                    />
                  </div>

                  <div className="checkout-field full-width">
                    <label htmlFor="address">
                      Delivery Address <span>*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter your complete delivery address"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="state">
                      State <span>*</span>
                    </label>
                    <input
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="Enter your state"
                      required
                    />
                  </div>

                  <div className="checkout-field">
                    <label htmlFor="pincode">
                      Pincode <span>*</span>
                    </label>
                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={form.pincode}
                      onChange={(event) => {
                        const value = event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);

                        setForm((previous) => ({
                          ...previous,
                          pincode: value,
                        }));

                        setError("");
                      }}
                      maxLength={6}
                      placeholder="6-digit pincode"
                      required
                    />
                  </div>

                  <div className="checkout-field full-width">
                    <label htmlFor="country">Country</label>
                    <input
                      id="country"
                      value={form.country}
                      readOnly
                    />
                  </div>
                </div>

                <div className="checkout-info">
                  <span>ⓘ</span>
                  <p>
                    Please verify your address carefully. Your changes
                    will be saved when you confirm the address.
                  </p>
                </div>
              </section>

              {/* Cart items */}
              <section className="checkout-card">
                <div className="checkout-card-heading">
                  <span className="checkout-step">02</span>
                  <div>
                    <h3>Order Items</h3>
                    <p>{cart.length} item(s) in your cart</p>
                  </div>
                </div>

                <div className="checkout-items">
                  {cart.map((item, index) => {
                    const name =
                      item.product_title ||
                      item.productName ||
                      item.product_name ||
                      item.name ||
                      "Product";

                    const image =
                      item.product_image ||
                      item.productImage ||
                      item.image ||
                      "/uploads/no-image.png";

                    return (
                      <div
                        className="checkout-item"
                        key={`${item.product_id || item._id || item.id || name}-${item.weight || ""}-${index}`}
                      >
                        <div className="checkout-item-image">
                          <img
                            src={image}
                            alt={name}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src =
                                "/uploads/no-image.png";
                            }}
                          />
                        </div>

                        <div className="checkout-item-details">
                          <h4>{name}</h4>
                          {item.weight && <p>Weight: {item.weight}</p>}
                          <p>Quantity: {Math.max(1, Number(item.quantity) || 1)}</p>
                        </div>

                        <strong className="checkout-item-price">
                          {formatPrice(getItemTotal(item))}
                        </strong>
                      </div>
                    );
                  })}
                </div>

                <Link href="/cart" className="checkout-edit-cart">
                  ← Edit Cart
                </Link>
              </section>
            </div>

            {/* Order summary */}
            <aside className="checkout-sidebar">
              <section className="checkout-card checkout-summary">
                <div className="checkout-card-heading">
                  <span className="checkout-step">03</span>
                  <div>
                    <h3>Order Summary</h3>
                    <p>Review your order total</p>
                  </div>
                </div>

                <div className="checkout-summary-row">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>

                <div className="checkout-summary-row">
                  <span>Shipping</span>
                  <strong>{formatPrice(SHIPPING_CHARGE)}</strong>
                </div>

                <div className="checkout-summary-total">
                  <span>Total</span>
                  <strong>{formatPrice(total)}</strong>
                </div>

                <label className="checkout-terms">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(event) =>
                      setTermsAccepted(event.target.checked)
                    }
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms">Terms and Conditions</Link>.
                  </span>
                </label>

                {error && (
                  <div className="checkout-error" role="alert">
                    {error}
                  </div>
                )}

                <button className="checkout-place-order" type="submit">
                  Place Order <span>→</span>
                </button>

                <p className="checkout-payment-note">
                  Your delivery address will be confirmed before payment.
                </p>
              </section>
            </aside>
          </form>
        )}
      </div>

      {/* Address confirmation popup */}
      {showAddressConfirm && (
        <div
          className="checkout-modal-overlay"
          onClick={() => {
            if (!submitting) setShowAddressConfirm(false);
          }}
        >
          <section
            className="checkout-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="checkout-confirm-icon">📍</div>

            <h2 id="checkout-confirm-title">Confirm Delivery Address</h2>

            <p className="checkout-confirm-description">
              Is this address correct? Confirm it to continue to payment.
            </p>

            <div className="checkout-address-preview">
              <div>
                <span>Name</span>
                <strong>{form.fullname || "Not provided"}</strong>
              </div>
              <div>
                <span>Address</span>
                <strong>{form.address}</strong>
              </div>
              <div>
                <span>State</span>
                <strong>{form.state}</strong>
              </div>
              <div>
                <span>Pincode</span>
                <strong>{form.pincode}</strong>
              </div>
              <div>
                <span>Country</span>
                <strong>{form.country || "India"}</strong>
              </div>
            </div>

            <div className="checkout-modal-actions">
              <button
                type="button"
                className="checkout-edit-address"
                disabled={submitting}
                onClick={() => setShowAddressConfirm(false)}
              >
                Go Back &amp; Edit
              </button>

              <button
                type="button"
                className="checkout-confirm-address"
                disabled={submitting}
                onClick={confirmAddressAndContinue}
              >
                {submitting ? "Please wait..." : "OK, Continue"}
              </button>
            </div>
          </section>
        </div>
      )}
      <style jsx>{`
        .checkout-page {
          width: 100%;
          min-height: 60vh;
          padding: 0 0 60px;
          background: #f8f8f8;
          color: #242424;
          font-family: inherit;
          margin-top: 145px;
        }
        .checkout-page *, .checkout-page *::before, .checkout-page *::after {
          box-sizing: border-box;
        }
        .checkout-banner {
          position: relative;
          width: 100%;
          height: 250px;
          overflow: hidden;
          background: #5b3825;
        }
        .checkout-banner-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .checkout-banner-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: linear-gradient(90deg, rgb(31 20 13 / 65%), rgb(31 20 13 / 25%));
        }
        .checkout-banner-content {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          color: #fff;
          text-align: center;
        }
        .checkout-banner-content h1 {
          margin: 0 0 10px;
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 800;
          line-height: 1.2;
          text-shadow: 0 2px 8px rgb(0 0 0 / 25%);
        }
        .checkout-banner-content p {
          margin: 0;
          font-size: clamp(13px, 1.5vw, 16px);
          line-height: 1.6;
        }
        .checkout-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 28px 20px 0;
        }
        .checkout-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          margin-bottom: 26px;
          color: #777;
          font-size: 13px;
        }
        .checkout-breadcrumb a {
          color: #666;
          text-decoration: none;
        }
        .checkout-breadcrumb a:hover {
          color: #e87922;
        }
        .checkout-breadcrumb strong {
          color: #222;
        }
        .checkout-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }
        .checkout-title h2 {
          margin: 0 0 7px;
          font-size: clamp(23px, 3vw, 30px);
          font-weight: 800;
          line-height: 1.3;
        }
        .checkout-title p {
          margin: 0;
          color: #777;
          font-size: 14px;
          line-height: 1.6;
        }
        .checkout-secure-badge {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 7px;
          padding: 10px 13px;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          background: #fff;
          color: #555;
          font-size: 12px;
          font-weight: 650;
        }
        .checkout-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          align-items: start;
          gap: 24px;
        }
        .checkout-main {
          display: flex;
          flex-direction: column;
          gap: 22px;
          min-width: 0;
        }
        .checkout-card {
          min-width: 0;
          padding: 24px;
          border: 1px solid #eaeaea;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 3px 15px rgb(0 0 0 / 3%);
        }
        .checkout-card-heading {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 24px;
        }
        .checkout-step {
          display: flex;
          flex: 0 0 38px;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #fff0e4;
          color: #d96815;
          font-size: 13px;
          font-weight: 800;
        }
        .checkout-card-heading h3 {
          margin: 0 0 5px;
          font-size: 17px;
          font-weight: 750;
          line-height: 1.4;
        }
        .checkout-card-heading p {
          margin: 0;
          color: #888;
          font-size: 12px;
          line-height: 1.5;
        }
        .checkout-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px 16px;
        }
        .checkout-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }
        .checkout-field.full-width {
          grid-column: 1 / -1;
        }
        .checkout-field label {
          color: #383838;
          font-size: 13px;
          font-weight: 650;
        }
        .checkout-field label span {
          color: #d94b38;
        }
        .checkout-field input, .checkout-field textarea {
          display: block;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          padding: 12px 13px;
          border: 1px solid #dedede;
          border-radius: 7px;
          outline: none;
          background: #fff;
          color: #222;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .checkout-field input {
          min-height: 45px;
        }
        .checkout-field textarea {
          min-height: 105px;
          resize: vertical;
        }
        .checkout-field input:focus, .checkout-field textarea:focus {
          border-color: #e87922;
          box-shadow: 0 0 0 3px rgb(232 121 34 / 10%);
        }
        .checkout-field input[readonly] {
          border-color: #e9e9e9;
          background: #f5f5f5;
          color: #777;
          cursor: not-allowed;
        }
        .checkout-info {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 20px;
          padding: 12px;
          border-radius: 7px;
          background: #fff8f0;
          color: #875126;
          font-size: 12px;
          line-height: 1.6;
        }
        .checkout-info p {
          margin: 0;
        }
        .checkout-items {
          display: flex;
          flex-direction: column;
        }
        .checkout-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 0;
          border-bottom: 1px solid #eee;
        }
        .checkout-item:first-child {
          padding-top: 0;
        }
        .checkout-item:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }
        .checkout-item-image {
          flex: 0 0 70px;
          width: 70px;
          height: 70px;
          overflow: hidden;
          border-radius: 8px;
          background: #f7f7f7;
        }
        .checkout-item-image img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .checkout-item-details {
          flex: 1;
          min-width: 0;
        }
        .checkout-item-details h4 {
          margin: 0 0 6px;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }
        .checkout-item-details p {
          margin: 3px 0;
          color: #777;
          font-size: 12px;
        }
        .checkout-item-price {
          flex-shrink: 0;
          color: #222;
          font-size: 14px;
          white-space: nowrap;
        }
        .checkout-edit-cart {
          display: inline-block;
          margin-top: 20px;
          color: #d96815;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }
        .checkout-sidebar {
          position: sticky;
          top: 20px;
          min-width: 0;
        }
        .checkout-summary {
          padding: 23px;
        }
        .checkout-summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid #eee;
          color: #666;
          font-size: 14px;
        }
        .checkout-summary-row strong {
          color: #222;
          font-weight: 700;
          white-space: nowrap;
        }
        .checkout-summary-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 21px 0;
          color: #222;
          font-size: 16px;
          font-weight: 750;
        }
        .checkout-summary-total strong {
          color: #d96815;
          font-size: 21px;
          white-space: nowrap;
        }
        .checkout-terms {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin: 10px 0 18px;
          color: #666;
          font-size: 12px;
          line-height: 1.7;
          cursor: pointer;
        }
        .checkout-terms input {
          flex: 0 0 auto;
          margin-top: 4px;
          accent-color: #e87922;
        }
        .checkout-terms a {
          color: #d96815;
          font-weight: 700;
          text-decoration: none;
        }
        .checkout-place-order, .checkout-primary-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          min-height: 49px;
          padding: 12px 16px;
          border: none;
          border-radius: 7px;
          background: #e87922;
          color: #fff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 750;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .checkout-place-order:hover, .checkout-primary-button:hover {
          background: #cf6515;
        }
        .checkout-place-order span {
          font-size: 20px;
        }
        .checkout-payment-note {
          margin: 15px 0 0;
          color: #888;
          font-size: 11px;
          line-height: 1.7;
          text-align: center;
        }
        .checkout-error {
          margin: 0 0 15px;
          padding: 11px 12px;
          border: 1px solid #ffd5d1;
          border-radius: 7px;
          background: #fff0ef;
          color: #b42318;
          font-size: 12px;
          line-height: 1.6;
        }
        .checkout-empty {
          max-width: 500px;
          margin: 45px auto;
          padding: 45px 25px;
          border: 1px solid #eee;
          border-radius: 12px;
          background: #fff;
          text-align: center;
        }
        .checkout-empty-icon {
          margin-bottom: 15px;
          font-size: 45px;
        }
        .checkout-empty h2 {
          margin: 0 0 10px;
          font-size: 23px;
        }
        .checkout-empty p {
          margin: 0 0 25px;
          color: #777;
          font-size: 14px;
        }
        .checkout-empty .checkout-primary-button {
          max-width: 220px;
          margin: 0 auto;
        }
        .checkout-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 20px;
          background: rgb(0 0 0 / 58%);
          backdrop-filter: blur(3px);
        }
        .checkout-confirm-modal {
          width: 100%;
          max-width: 470px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 28px;
          border-radius: 15px;
          background: #fff;
          box-shadow: 0 20px 70px rgb(0 0 0 / 20%);
          animation: checkoutModalEnter 0.2s ease-out;
        }
        .checkout-confirm-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          margin: 0 auto 15px;
          border-radius: 50%;
          background: #fff0e4;
          font-size: 25px;
        }
        .checkout-confirm-modal h2 {
          margin: 0 0 10px;
          font-size: 22px;
          font-weight: 800;
          text-align: center;
        }
        .checkout-confirm-description {
          max-width: 350px;
          margin: 0 auto 22px;
          color: #777;
          font-size: 13px;
          line-height: 1.7;
          text-align: center;
        }
        .checkout-address-preview {
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 9px;
          background: #fafafa;
        }
        .checkout-address-preview > div {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          padding: 9px 0;
          border-bottom: 1px solid #ededed;
          font-size: 13px;
        }
        .checkout-address-preview > div:first-child {
          padding-top: 0;
        }
        .checkout-address-preview > div:last-child {
          padding-bottom: 0;
          border-bottom: none;
        }
        .checkout-address-preview span {
          flex: 0 0 85px;
          color: #777;
        }
        .checkout-address-preview strong {
          color: #222;
          line-height: 1.6;
          text-align: right;
          overflow-wrap: anywhere;
        }
        .checkout-modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 22px;
        }
        .checkout-edit-address, .checkout-confirm-address {
          min-height: 46px;
          padding: 10px 12px;
          border-radius: 7px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: background 0.2s;
        }
        .checkout-edit-address {
          border: 1px solid #ddd;
          background: #fff;
          color: #444;
        }
        .checkout-edit-address:hover {
          background: #f5f5f5;
        }
        .checkout-confirm-address {
          border: 1px solid #e87922;
          background: #e87922;
          color: #fff;
        }
        .checkout-confirm-address:hover {
          background: #cf6515;
        }
        .checkout-edit-address:disabled, .checkout-confirm-address:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        @keyframes checkoutModalEnter {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (max-width: 1000px) {
          .checkout-layout {
            grid-template-columns: minmax(0, 1fr) 300px;
            gap: 18px;
          }
          .checkout-card {
            padding: 20px;
          }
          .checkout-summary {
            padding: 19px;
          }
          .checkout-banner {
            height: 220px;
          }
        }
        @media (max-width: 760px) {
          .checkout-layout {
            grid-template-columns: minmax(0, 1fr);
          }
          .checkout-sidebar {
            position: static;
          }
          .checkout-banner {
            height: 185px;
          }
          .checkout-container {
            padding: 23px 16px 0;
          }
          .checkout-title {
            align-items: flex-start;
          }
        }
        @media (max-width: 520px) {
          .checkout-page {
            padding-bottom: 40px;
          }
          .checkout-banner {
            height: 150px;
          }
          .checkout-banner-overlay {
            padding: 14px;
          }
          .checkout-container {
            padding: 20px 13px 0;
          }
          .checkout-breadcrumb {
            gap: 7px;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .checkout-title {
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
          }
          .checkout-title h2 {
            font-size: 24px;
          }
          .checkout-title p {
            font-size: 13px;
          }
          .checkout-secure-badge {
            padding: 8px 11px;
          }
          .checkout-main {
            gap: 16px;
          }
          .checkout-card, .checkout-summary {
            padding: 17px;
            border-radius: 10px;
          }
          .checkout-card-heading {
            gap: 10px;
            margin-bottom: 20px;
          }
          .checkout-card-heading h3 {
            font-size: 16px;
          }
          .checkout-form-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 16px;
          }
          .checkout-field.full-width {
            grid-column: auto;
          }
          .checkout-item {
            gap: 10px;
          }
          .checkout-item-image {
            flex-basis: 58px;
            width: 58px;
            height: 58px;
          }
          .checkout-item-details h4 {
            font-size: 13px;
          }
          .checkout-item-price {
            font-size: 12px;
          }
          .checkout-modal-overlay {
            align-items: center;
            padding: 12px;
          }
          .checkout-confirm-modal {
            max-height: calc(100dvh - 24px);
            padding: 22px 16px;
          }
          .checkout-confirm-modal h2 {
            font-size: 19px;
          }
          .checkout-modal-actions {
            grid-template-columns: minmax(0, 1fr);
          }
        }
        @media (max-width: 350px) {
          .checkout-container {
            padding-right: 10px;
            padding-left: 10px;
          }
          .checkout-card, .checkout-summary {
            padding: 13px;
          }
          .checkout-item {
            flex-wrap: wrap;
          }
          .checkout-item-price {
            margin-left: 68px;
          }
        }
      `}</style>
    </main>
  );
}