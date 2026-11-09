"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const getFirstValue = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
};
const getUserProfile = (savedUser) => {
  return (savedUser.user || savedUser.profile || savedUser.data || savedUser);
};
const getProductName = (item) => {
  return getFirstValue(item.productName, item.product_name, item.name, item.title, item.product?.productName, item.product?.name, "Product");
};
const getProductImage = (item) => {
  const images = item.images;
  return getFirstValue(item.product_image, item.productImage, item.image, item.image_url, item.product?.image, item.product?.images?.[0], Array.isArray(images) ? images[0] : "", "/uploads/1.png");
};
const getProductWeight = (item) => {
  return getFirstValue(item.weight, item.productWeight, item.product_weight, item.variant, item.size, item.quantity_type, "-");
};
const getQuantity = (item) => {
  return Number(item.quantity || item.qty || 1);
};
const getItemPrice = (item) => {
  return Number(item.final_price ?? item.offerPrice ?? item.offer_price ?? item.price ?? item.selling_price ?? 0);
};
const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2,
  });
};
const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }
    return date.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
};
const getOrderStatus = (order) => {
  return getFirstValue(order.orderStatus, order.order_status, "Pending");
};
const getStatusClass = (status) => {
  const value = String(status).toLowerCase();
  if (value === "delivered") return "delivered";
  if (value === "cancelled") return "cancelled";
  if (value === "shipping" || value === "shipped") return "shipping";
  if (value === "processing") return "processing";
  return "pending";
};
export default function MyOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const closeMobileMenu = () => {
    setMenuOpen(false);
  };
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (!savedUser) {
          router.replace("/login");
          return;
        }
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.logged_in !== true) {
            router.replace("/login");
            return;
        }
        const profile = getUserProfile(parsedUser);
        const userId = getFirstValue(profile.id, profile._id, profile.userId, profile.user_id, parsedUser.id, parsedUser._id);
        if (!userId) {
          setErrorMessage("User ID not found. Please login again.");
          setLoading(false);
          return;
        }
        const loadedUser = {
          ...profile,
          full_name: getFirstValue(profile.full_name, profile.fullName, profile.name, "User"),
          email: getFirstValue(profile.email, profile.email_address),
          mobile: getFirstValue(profile.mobile, profile.phone, profile.phone_number, profile.phoneNumber, profile.mobile_number, profile.mobileNumber),
          id: String(userId),
        };
        setUser(loadedUser);
        const response = await fetch(`/api/users/orders?userId=${encodeURIComponent(userId)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load your orders.");
        }
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (error) {
          console.error("My Orders loading error:", error);
          setErrorMessage(error.message || "Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [router]);
  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("openCartAfterRefresh");
    window.dispatchEvent(new Event("userUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
    window.dispatchEvent(new Event("compareUpdated"));
    window.dispatchEvent(new Event("cartUpdated"));
    setMenuOpen(false);
    router.replace("/");
  };
  if (!user && loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
        <style jsx>{`
          .orders-loading {
            min-height: 400px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-top: 120px;
            color: #333;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #eee;
            border-top-color: #000;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }
  if (!user) {
    return null;
  }
  return (
    <>
      <main className="profile-section">
        <div className="profile-container">
          <button type="button" className="mobile-menu-toggle" onClick={() =>
            setMenuOpen((previous) => !previous)
          } aria-expanded={menuOpen} aria-controls="profile-navigation">
              <i className={`fa ${menuOpen ? "fa-times" : "fa-bars"}`} aria-hidden="true"/>
              <span>
                {menuOpen ? "Close Menu" : "Menu"}
              </span>
          </button>
          <aside id="profile-navigation" className={`profile-sidebar ${menuOpen ? "menu-open" : "" }`}>
            <div className="profile-top">
              <div className="profile-avatar">
                  <i className="fa fa-user" />
              </div>
              <h3>{user.full_name}</h3>
              <p>{user.email}</p>
              <p>{user.mobile}</p>
            </div>
            <nav className="profile-menu" aria-label="Profile menu">
              <Link href="/my_profile" onClick={closeMobileMenu}>
                  <i className="fa fa-user" />
                  <span>My Profile</span>
              </Link>
              <Link href="/my-orders" className="active" onClick={closeMobileMenu}>
                  <i className="fa fa-shopping-bag" />
                  <span>My Orders</span>
              </Link>
              <Link href="/change_password" onClick={closeMobileMenu}>
                  <i className="fa fa-lock" />
                  <span>Change Password</span>
              </Link>
              <Link href="/wish_list" onClick={closeMobileMenu}>
                  <i className="fa fa-heart" />
                  <span>Wishlist</span>
              </Link>
                <a href="/" onClick={(event) => {
                  event.preventDefault();
                  handleLogout();
                }}>
                    <i className="fa fa-sign-out" />
                    <span>Logout</span>
                </a>
            </nav>
          </aside>
          <section className="profile-content">
            <div className="profile-card">
              <div className="orders-heading">
                <div>
                  <h2>My Orders</h2>
                  <p>
                      View and track your recent orders.
                  </p>
                </div>
                <span className="order-count">
                  {orders.length} Orders
                </span>
              </div>
              {errorMessage && (
                <div className="alert-danger" role="alert">
                  {errorMessage}
                </div>
              )}
              {loading ? (
                <div className="orders-message">
                  Loading your orders...
                </div>
              ) : errorMessage ? (
                <div className="orders-message">
                  Unable to display orders.
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-orders">
                  <div className="empty-icon">
                    <i className="fa fa-shopping-bag" />
                  </div>
                  <h3>No Orders Found</h3>
                  <p>
                    You have not placed any orders yet.
                    Start shopping and your orders will
                    appear here.
                  </p>
                  <Link href="/shop" className="shop-now-btn">
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="orders-table-wrapper">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>Image</th>
                        <th>Product Name</th>
                        <th>Weight</th>
                        <th>Qty</th>
                        <th>Subtotal</th>
                        <th>Payment</th>
                        <th>Order Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.flatMap(
                        (order, orderIndex) => {
                          const items = Array.isArray(order.items) ? order.items : [];
                          if (items.length === 0) {
                            return [{
                              order,
                              item: null,
                              orderIndex,
                              itemIndex: 0,
                            }];
                          }
                          return items.map(
                            (item, itemIndex) => ({
                              order,
                              item,
                              orderIndex,
                              itemIndex,
                            })
                          );
                        }
                      ).map(
                        ({order, item, orderIndex, itemIndex, }, rowIndex) => {
                          const quantity = item ? getQuantity(item) : 0;
                          const subtotal = item ? getItemPrice(item) * quantity : Number(order.summary?.subtotal || order.summary?.total || 0);
                          const status = getOrderStatus(order);
                          const paymentStatus = getFirstValue(order.paymentStatus, order.payment_status, "Pending");
                          const paymentMethod =getFirstValue(order.paymentMethod, order.payment_method, "Razorpay");
                          return (
                            <tr key={`${order._id || orderIndex}-${itemIndex}`}>
                              <td>
                                {rowIndex + 1}
                              </td>
                              <td>
                                <div className="product-image">
                                  {item && (
                                    <img src={getProductImage(item)} alt={getProductName(item)} onError={(event) => {
                                      event.currentTarget.src = "/uploads/1.png";
                                    }} />
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="product-info">
                                  <strong>
                                    {item ? getProductName(item) : "Order"}
                                  </strong>
                                  <small>
                                    Order ID:{" "}
                                    {order.receipt || order._id || "-"}
                                  </small>
                                  <small>
                                    {formatDate(
                                      order.createdAt || order.created_at
                                    )}
                                  </small>
                                </div>
                              </td>
                              <td>
                                {item ? getProductWeight(item) : "-"}
                              </td>
                              <td>
                                {item ? quantity : "-"}
                              </td>
                              <td className="price-cell">
                                {formatPrice(subtotal)}
                              </td>
                              <td>
                                <div className="payment-info">
                                  <strong>
                                    {paymentMethod}
                                  </strong>
                                    <span className={`payment-status ${
                                      String(paymentStatus).toLowerCase() === "paid" ? "paid" : "unpaid"
                                    }`}>
                                      {paymentStatus}
                                    </span>
                                </div>
                              </td>
                              <td>
                                <span className={`order-status ${getStatusClass(status)}`}>
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="orders-footer">
                <Link href="/shop" className="back-home-btn">
                  <i className="fa fa-arrow-left" />Continue Shopping
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <style jsx global>{`
        * {
          box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }
        body {
          background: #f4f6f9;
          color: #333;
        }
        .profile-section {
          width: 100%;
          padding: 40px 0;
          margin-top: 145px;
        }
        .profile-container {
          width: 95%;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: flex-start;
          gap: 30px;
          min-width: 0;
        }
        .profile-sidebar {
          flex: 0 0 300px;
          width: 300px;
          min-width: 0;
          background: #fff;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
        }
        .profile-top {
          background: linear-gradient(135deg, #000, #333);
          padding: 35px 20px;
          text-align: center;
          color: #fff;
          overflow-wrap: anywhere;
        }
        .profile-avatar {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          background: #fff;
          color: #000;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 50px;
          border: 4px solid rgba(255, 255, 255, 0.2);
        }
        .profile-top h3 {
          font-size: 24px;
          line-height: 1.35;
          margin-bottom: 8px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }
        .profile-top p {
          font-size: 14px;
          line-height: 1.5;
          opacity: 0.9;
          margin-top: 4px;
          overflow-wrap: anywhere;
        }
        .profile-menu {
          padding: 20px;
        }
        .profile-menu a {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          text-decoration: none;
          color: #444;
          padding: 15px 18px;
          margin-bottom: 10px;
          border-radius: 10px;
          transition: background 0.2s ease, color 0.2s ease;
          font-size: 15px;
          font-weight: 500;
        }
        .profile-menu a span {
          overflow-wrap: anywhere;
        }
        .profile-menu a i {
          flex: 0 0 22px;
          width: 22px;
          text-align: center;
        }
        .profile-menu a:hover {
          background: #000;
          color: #fff;
        }
        .profile-menu a.active {
          background: #000;
          color: #fff;
          font-weight: 600;
        }
        .profile-content {
          flex: 1 1 0;
          width: 0;
          min-width: 0;
        }
        .profile-card {
          width: 100%;
          min-width: 0;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          padding: 35px;
        }
        .orders-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 25px;
        }
        .orders-heading h2 {
          margin: 0 0 8px;
          font-size: 28px;
          line-height: 1.3;
          color: #222;
        }
        .orders-heading p {
          margin: 0;
          color: #777;
          font-size: 14px;
        }
        .order-count {
          background: #f1f1f1;
          color: #222;
          padding: 9px 16px;
          border-radius: 25px;
          font-size: 13px;
          font-weight: 600;
        }
        .orders-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #eee;
          border-radius: 10px;
        }
        .orders-table {
          width: 100%;
          min-width: 1050px;
          border-collapse: collapse;
          text-align: left;
        }
        .orders-table thead {
          background: #111;
          color: #fff;
        }
        .orders-table th {
          padding: 16px 13px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }
        .orders-table td {
          padding: 15px 13px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
          vertical-align: middle;
        }
        .orders-table tbody tr:last-child td {
          border-bottom: none;
        }
        .orders-table tbody tr:hover {
          background: #fafafa;
        }
        .product-image {
          width: 65px;
          height: 65px;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          background: #f8f8f8;
        }
        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .product-info {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 140px;
        }
        .product-info strong {
          font-size: 13px;
          color: #222;
          line-height: 1.5;
        }
        .product-info small {
          font-size: 11px;
          color: #888;
        }
        .price-cell {
          font-weight: 600;
          color: #222;
          white-space: nowrap;
        }
        .payment-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .payment-info strong {
          font-size: 12px;
          color: #333;
        }
        .payment-status {
          width: fit-content;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .payment-status.paid {
          background: #e0f5e7;
          color: #16813c;
        }
        .payment-status.unpaid {
          background: #fff0d9;
          color: #a56b00;
        }
        .order-status {
          display: inline-block;
          padding: 7px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          text-transform: capitalize;
        }
        .order-status.pending {
          background: #fff0d9;
          color: #a56b00;
        }
        .order-status.processing {
          background: #e5efff;
          color: #2860b0;
        }
        .order-status.shipping {
          background: #e8e2ff;
          color: #6744b4;
        }
        .order-status.delivered {
          background: #dff5e6;
          color: #16813c;
        }
        .order-status.cancelled {
          background: #ffe3e3;
          color: #c62828;
        }
        .empty-orders {
          text-align: center;
          padding: 65px 20px;
          border: 1px dashed #ddd;
          border-radius: 12px;
          background: #fcfcfc;
        }
        .empty-icon {
          width: 85px;
          height: 85px;
          border-radius: 50%;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 35px;
          color: #555;
        }
        .empty-orders h3 {
          font-size: 22px;
          margin-bottom: 10px;
          color: #222;
        }
        .empty-orders p {
          max-width: 420px;
          margin: 0 auto 22px;
          color: #777;
          font-size: 14px;
          line-height: 1.7;
        }
        .shop-now-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 13px 25px;
          background: #000;
          color: #fff;
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }
        .shop-now-btn:hover {
          background: #333;
        }
        .orders-message {
          text-align: center;
          padding: 45px 15px;
          color: #777;
          font-size: 14px;
        }
        .alert-danger {
          padding: 12px 18px;
          border-radius: 6px;
          margin-bottom: 20px;
          line-height: 1.5;
          overflow-wrap: anywhere;
          background: #f8d7da;
          color: #721c24;
        }
        .orders-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 25px;
        }
        .back-home-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 45px;
          padding: 12px 22px;
          background: #000;
          color: #fff;
          border-radius: 8px;
          font-size: 14px;
          text-decoration: none;
          font-weight: 500;
        }
        .back-home-btn:hover {
          background: #333;
        }
        .mobile-menu-toggle {
          display: none;
        }
        @media (max-width: 991px) {
          .profile-section {
            padding: 30px 0;
          }
          .profile-container {
            flex-direction: column;
            align-items: stretch;
            gap: 18px;
          }
          .mobile-menu-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            align-self: flex-start;
            gap: 10px;
            min-height: 46px;
            padding: 11px 18px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #000;
            color: #fff;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
          }
          .profile-sidebar {
            display: none;
            flex: none;
            width: 100%;
            max-width: 100%;
          }
          .profile-sidebar.menu-open {
            display: block;
          }
          .profile-content {
            width: 100%;
            flex: none;
          }
          .profile-top {
            padding: 25px 20px;
          }
          .profile-menu {
            padding: 15px;
          }
          .profile-menu a {
            padding: 14px 16px;
          }
        }
        @media (max-width: 768px) {
          .profile-section {
            padding: 24px 0;
          }
          .profile-container {
            width: calc(100% - 32px);
            gap: 15px;
          }
          .profile-card {
            padding: 24px;
          }
          .orders-heading h2 {
            font-size: 25px;
          }
          .orders-footer {
            justify-content: stretch;
          }
          .back-home-btn {
            width: 100%;
          }
        }
        @media (max-width: 480px) {
          .profile-section {
            padding: 18px 0;
          }
          .profile-container {
            width: calc(100% - 24px);
            gap: 12px;
          }
          .mobile-menu-toggle {
            min-height: 44px;
            padding: 10px 15px;
            font-size: 14px;
          }
          .profile-card {
            padding: 18px 15px;
            border-radius: 10px;
          }
          .orders-heading {
            align-items: flex-start;
            flex-direction: column;
          }
          .orders-heading h2 {
            font-size: 23px;
          }
          .empty-orders {
            padding: 45px 15px;
          }
          .empty-orders h3 {
            font-size: 20px;
          }
          .profile-top {
            padding: 22px 15px;
          }
          .profile-top h3 {
            font-size: 21px;
          }
          .profile-avatar {
            width: 82px;
            height: 82px;
            font-size: 38px;
            margin-bottom: 14px;
          }
          .profile-menu {
            padding: 12px;
          }
          .profile-menu a {
            padding: 13px 12px;
            margin-bottom: 7px;
            font-size: 14px;
          }
        }
        @media (max-width: 360px) {
          .profile-container {
            width: calc(100% - 20px);
          }
          .profile-card {
            padding: 15px 12px;
          }
          .profile-top p {
            font-size: 13px;
          }
          .profile-menu {
            padding: 9px;
          }
          .profile-menu a {
            gap: 9px;
            padding: 12px 9px;
            font-size: 13px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .profile-menu a, .shop-now-btn, .back-home-btn {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}