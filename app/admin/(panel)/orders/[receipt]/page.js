"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const receipt = params.receipt;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (receipt) fetchOrder();
  }, [receipt]);
  async function fetchOrder() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(receipt)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Order not found");
      }
      setOrder(data.order);
    } catch (err) {
      setError(err.message || "Unable to load order");
    } finally {
      setLoading(false);
    }
  }
  async function updateStatus(newStatus) {
    try {
      setUpdating(true);
      setMessage("");
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(receipt)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderStatus: newStatus }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Status update failed");
      }
      setOrder((previous) => ({...previous, orderStatus: data.orderStatus,}));
      setMessage("Order status updated successfully!");
    } catch (err) {
      setMessage(err.message || "Status update failed");
    } finally {
      setUpdating(false);
    }
  }
  function formatDate(value) {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  function formatAmount(value) {
    return Number(value || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  }
  if (loading) {
    return (
      <div className="page-message">
        Loading order details...
        <style jsx>{`
          .page-message {
            padding: 60px 20px;
            text-align: center;
            color: #666;
          }
        `}</style>
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="page-message error">
        <h2>{error || "Order not found"}</h2>
        <button onClick={() => router.push("/admin/orders")}>
          Back to Orders
        </button>
        <style jsx>{`
          .page-message {
            padding: 60px 20px;
            text-align: center;
          }
          .error {
            color: #dc2626;
          }
          button {
            margin-top: 15px;
            padding: 11px 20px;
            border: 0;
            border-radius: 6px;
            background: #2563eb;
            color: white;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }
  const customer = order.customer || {};
  const summary = order.summary || {};
  return (
    <div className="order-view-container">
      <div className="page-header">
        <div>
          <h2>Order Details</h2>
          <p>View customer order information</p>
        </div>
        <button className="back-btn" onClick={() => router.push("/admin/orders")}>
          <span>←</span> Back to Orders
        </button>
      </div>
      {message && (
        <div className="update-message">{message}</div>
      )}
      <div className="order-summary-card">
        <div className="summary-item">
          <span>Order ID</span>
          <h4>#{order.receipt}</h4>
        </div>
        <div className="summary-item">
          <span>Order Date and Time</span>
          <h4>{formatDate(order.createdAt || order.orderDate)}</h4>
        </div>
        <div className="summary-item">
          <span>Payment Method</span>
          <h4>{order.paymentMethod || "N/A"}</h4>
        </div>
        <div className="summary-item">
          <span>Payment Status</span>
          <span className={`status ${(order.paymentStatus || "").toLowerCase() === "paid" ? "success" : "payment-pending"}`}>
            {order.paymentStatus || "Pending"}
          </span>
        </div>
        <div className="summary-item">
          <span>Order Status</span>
          <select value={order.orderStatus || "Pending"} onChange={(e) => updateStatus(e.target.value)} disabled={updating}>
            {[
              "Pending",
              "Processing",
              "Packed",
              "Shipping",
              "Shipped",
              "Delivered",
              "Cancelled",
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {updating && <small>Updating...</small>}
        </div>
      </div>
      <div className="details-grid">
        <div className="info-card">
          <div className="card-header">♙ Customer Details</div>
          <div className="card-body">
            <p><strong>Name:</strong> {customer.fullname || "N/A"}</p>
            <p><strong>Mobile:</strong> {customer.mobile || "N/A"}</p>
            <p><strong>Email:</strong> {customer.email || "N/A"}</p>
          </div>
        </div>
        <div className="info-card">
          <div className="card-header">⌖ Shipping Address</div>
          <div className="card-body">
            <p><strong>Address:</strong> {customer.address || "N/A"}</p>
            <p><strong>City:</strong> {customer.city || "N/A"}</p>
            <p><strong>State:</strong> {customer.state || "N/A"}</p>
            <p><strong>Pincode:</strong> {customer.pincode || "N/A"}</p>
            <p><strong>Country:</strong> {customer.country || "N/A"}</p>
          </div>
        </div>
      </div>
      <div className="product-card">
        <div className="card-header">▣ Ordered Products</div>
        <div className="table-responsive">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Weight</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.length ? (
                order.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="product-info">
                        {item.product_image && (
                          <img src={item.product_image} alt={item.product_title} className="product-img"/>
                        )}
                        <strong>{item.product_title}</strong>
                      </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{item.weight || "N/A"}</td>
                    <td>{formatAmount(item.final_price)}</td>
                    <td>
                      <strong>
                        {formatAmount(item.final_price * item.quantity)}
                      </strong>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="price-summary">
          <div className="summary-right">
            <p>
              <span>Subtotal</span>
              <strong>{formatAmount(summary.subtotal)}</strong>
            </p>
            <p>
              <span>Shipping</span>
              <strong>{formatAmount(summary.shipping)}</strong>
            </p>
            <p className="grand-total">
              <span>Total Amount</span>
              <strong>{formatAmount(summary.total)}</strong>
            </p>
          </div>
        </div>
      </div>
      <div className="info-card payment-card">
        <div className="card-header">▤ Payment Information</div>
        <div className="card-body payment-grid">
          <div>
            <strong>Payment Method</strong>
            <p>{order.paymentMethod || "N/A"}</p>
          </div>
          <div>
            <strong>Transaction ID</strong>
            <p>{order.transactionId || "N/A"}</p>
          </div>
          <div>
            <strong>Razorpay Order ID</strong>
            <p>{order.razorpayOrderId || "N/A"}</p>
          </div>
          <div>
            <strong>Payment Status</strong>
            <p>{order.paymentStatus || "N/A"}</p>
          </div>
          <div>
            <strong>Payment Date</strong>
            <p>{formatDate(order.paymentDate)}</p>
          </div>
        </div>
      </div>
      <div className="info-card notes-card">
        <div className="card-header">☰ Customer Notes</div>
        <div className="card-body">
          <p>{order.customerNote || "No customer notes available."}</p>
        </div>
      </div>
      <div className="action-buttons">
        <button className="btn-back" onClick={() => router.push("/admin/orders")}>
          ← Back
        </button>
        <button className="btn-print" onClick={() => router.push(`/admin/orders/${encodeURIComponent(receipt)}/invoice`)}>
          Print Invoice
        </button>
      </div>
      <style jsx>{`
        .order-view-container {
          width: 95%;
          max-width: 1400px;
          margin: 30px auto;
          color: #333;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }
        .page-header h2 {
          font-size: 30px;
          color: #222;
          margin: 0;
        }
        .page-header p {
          margin-top: 5px;
          color: #777;
        }
        .back-btn {
          border: 0;
          background: #2563eb;
          color: white;
          padding: 12px 22px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .update-message {
          margin-bottom: 18px;
          padding: 12px 15px;
          background: #ecfdf5;
          color: #15803d;
          border-radius: 7px;
          font-size: 13px;
        }
        .order-summary-card {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 18px;
          margin-bottom: 30px;
        }
        .summary-item {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 3px 12px rgba(0,0,0,.07);
          border-left: 5px solid #2563eb;
          min-width: 0;
        }
        .summary-item > span:first-child {
          display: block;
          color: #777;
          margin-bottom: 9px;
          font-size: 13px;
        }
        .summary-item h4 {
          color: #222;
          font-size: 17px;
          overflow-wrap: anywhere;
        }
        .summary-item select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          outline: none;
          background: white;
        }
        .summary-item select:focus {
          border-color: #2563eb;
        }
        .summary-item small {
          display: block;
          margin-top: 6px;
          color: #777;
        }
        .status {
          display: inline-block !important;
          width: fit-content;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          color: white !important;
        }
        .success {
          background: #22c55e;
        }
        .payment-pending {
          background: #f59e0b;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
          margin-bottom: 30px;
        }
        .info-card, .product-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 3px 12px rgba(0,0,0,.07);
          overflow: hidden;
          margin-bottom: 25px;
        }
        .card-header {
          background: #2563eb;
          color: white;
          padding: 15px 20px;
          font-size: 17px;
          font-weight: bold;
        }
        .card-body {
          padding: 20px;
        }
        .card-body p {
          margin-bottom: 12px;
          line-height: 24px;
          overflow-wrap: anywhere;
        }
        .card-body p:last-child {
          margin-bottom: 0;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .product-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 650px;
        }
        .product-table thead {
          background: #f8fafc;
        }
        .product-table th, .product-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        .product-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 180px;
        }
        .product-img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 7px;
          border: 1px solid #ddd;
        }
        .empty-row {
          text-align: center !important;
          padding: 30px !important;
        }
        .price-summary {
          display: flex;
          justify-content: flex-end;
          padding: 20px;
        }
        .summary-right {
          width: 320px;
          max-width: 100%;
        }
        .summary-right p {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 12px;
          font-size: 14px;
        }
        .grand-total {
          border-top: 1px solid #ddd;
          padding-top: 14px;
          font-size: 17px !important;
        }
        .payment-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .payment-grid p {
          margin: 7px 0 0;
          color: #555;
        }
        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin: 25px 0;
        }
        .action-buttons button {
          border: 0;
          padding: 12px 22px;
          border-radius: 6px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-back {
          background: #6c757d;
        }
        .btn-print {
          background: #0d6efd;
        }
        @media (max-width: 1200px) {
          .order-summary-card {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 992px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
          .order-summary-card {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .order-view-container {
            width: 98%;
            margin: 15px auto;
          }
          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }
          .page-header h2 {
            font-size: 24px;
          }
          .back-btn {
            width: 100%;
          }
          .order-summary-card {
            grid-template-columns: 1fr;
            gap: 13px;
          }
          .summary-item {
            padding: 17px;
          }
          .card-header {
            font-size: 15px;
            padding: 14px;
          }
          .card-body {
            padding: 15px;
          }
          .payment-grid {
            grid-template-columns: 1fr;
          }
          .action-buttons {
            flex-direction: column;
          }
          .action-buttons button {
            width: 100%;
          }
        }
        @media print {
          :global(body) {
            background: white !important;
          }
          .order-view-container {
            width: 100%;
            margin: 0;
          }
          .back-btn, .action-buttons, .update-message, .summary-item select {
            display: none !important;
          }
          .order-summary-card {
            grid-template-columns: repeat(3, 1fr);
          }
          .info-card, .product-card, .summary-item {
            box-shadow: none;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}