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
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(receipt)}`,
        { cache: "no-store" }
      );
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
      setOrder((previous) => ({
        ...previous,
        orderStatus: data.orderStatus,
      }));
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
        <div className="loader"></div>
        <p>Loading order details...</p>
        <style jsx>{`
          .page-message {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 14px;
            color: #666;
            padding: 30px 15px;
          }
          .loader {
            width: 38px;
            height: 38px;
            border: 4px solid #e5e7eb;
            border-top-color: #2563eb;
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
  if (error || !order) {
    return (
      <div className="page-message error">
        <h2>{error || "Order not found"}</h2>
        <button onClick={() => router.push("/admin/orders")}>
          Back to Orders
        </button>
        <style jsx>{`
          .page-message {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 30px 15px;
            text-align: center;
          }
          .error {
            color: #dc2626;
          }
          button {
            margin-top: 15px;
            padding: 12px 22px;
            border: 0;
            border-radius: 7px;
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
        <div className="header-content">
          <h2>Order Details</h2>
          <p>View customer order information</p>
        </div>
        <button className="back-btn" onClick={() => router.push("/admin/orders")}>
          <span>←</span> Back to Orders
        </button>
      </div>
      {message && (
        <div className={`update-message ${message.includes("successfully") ? "success-message" : "error-message"}`}>
          {message}
        </div>
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
            <p>
              <strong>Name:</strong>
              <span>{customer.fullname || "N/A"}</span>
            </p>
            <p>
              <strong>Mobile:</strong>
              <span>{customer.mobile || "N/A"}</span>
            </p>
            <p>
              <strong>Email:</strong>
              <span>{customer.email || "N/A"}</span>
            </p>
          </div>
        </div>
        <div className="info-card">
          <div className="card-header">⌖ Shipping Address</div>
          <div className="card-body">
            <p>
              <strong>Address:</strong>
              <span>{customer.address || "N/A"}</span>
            </p>
            <p>
              <strong>City:</strong>
              <span>{customer.city || "N/A"}</span>
            </p>
            <p>
              <strong>State:</strong>
              <span>{customer.state || "N/A"}</span>
            </p>
            <p>
              <strong>Pincode:</strong>
              <span>{customer.pincode || "N/A"}</span>
            </p>
            <p>
              <strong>Country:</strong>
              <span>{customer.country || "N/A"}</span>
            </p>
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
                    <td data-label="Product" className="product-cell">
                      <div className="product-info">
                        {item.product_image && (
                          <img src={item.product_image} alt={item.product_title} className="product-img" />
                        )}
                        <strong>{item.product_title}</strong>
                      </div>
                    </td>
                    <td data-label="Quantity">{item.quantity}</td>
                    <td data-label="Weight">{item.weight || "N/A"}</td>
                    <td data-label="Unit Price">
                      {formatAmount(item.final_price)}
                    </td>
                    <td data-label="Total">
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
          <div className="payment-item">
            <strong>Payment Method</strong>
            <p>{order.paymentMethod || "N/A"}</p>
          </div>
          <div className="payment-item">
            <strong>Transaction ID</strong>
            <p>{order.transactionId || "N/A"}</p>
          </div>
          <div className="payment-item">
            <strong>Razorpay Order ID</strong>
            <p>{order.razorpayOrderId || "N/A"}</p>
          </div>
          <div className="payment-item">
            <strong>Payment Status</strong>
            <p>{order.paymentStatus || "N/A"}</p>
          </div>
          <div className="payment-item">
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
        * {
          box-sizing: border-box;
        }
        .order-view-container {
          width: 95%;
          max-width: 1400px;
          min-width: 0;
          margin: 30px auto;
          color: #333;
          padding-bottom: 25px;
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
          font-weight: 700;
        }
        .page-header p {
          margin: 6px 0 0;
          color: #777;
          font-size: 14px;
        }
        .back-btn {
          flex-shrink: 0;
          border: 0;
          background: #2563eb;
          color: white;
          padding: 12px 22px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: 0.2s;
        }
        .back-btn:hover {
          background: #1d4ed8;
        }
        .update-message {
          margin-bottom: 18px;
          padding: 13px 16px;
          border-radius: 7px;
          font-size: 13px;
          overflow-wrap: anywhere;
        }
        .success-message {
          background: #ecfdf5;
          color: #15803d;
        }
        .error-message {
          background: #fef2f2;
          color: #dc2626;
        }
        .order-summary-card {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 30px;
        }
        .summary-item {
          background: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.07);
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
          font-size: 16px;
          margin: 0;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }
        .summary-item select {
          width: 100%;
          max-width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          outline: none;
          background: white;
          color: #333;
        }
        .summary-item select:focus {
          border-color: #2563eb;
        }
        .summary-item select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .summary-item small {
          display: block;
          margin-top: 6px;
          color: #777;
        }
        .status {
          display: inline-block !important;
          width: fit-content;
          max-width: 100%;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          color: white !important;
          overflow-wrap: anywhere;
        }
        .success {
          background: #22c55e;
        }
        .payment-pending {
          background: #f59e0b;
        }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 25px;
          margin-bottom: 30px;
        }
        .info-card, .product-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.07);
          overflow: hidden;
          margin-bottom: 25px;
          min-width: 0;
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
          min-width: 0;
        }
        .card-body p {
          margin: 0 0 12px;
          line-height: 24px;
          overflow-wrap: anywhere;
        }
        .card-body p:last-child {
          margin-bottom: 0;
        }
        .table-responsive {
          width: 100%;
          min-width: 0;
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
          vertical-align: middle;
        }
        .product-table th {
          color: #444;
          font-weight: 700;
          white-space: nowrap;
        }
        .product-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 180px;
        }
        .product-info strong {
          overflow-wrap: anywhere;
          line-height: 1.5;
        }
        .product-img {
          width: 60px;
          height: 60px;
          flex-shrink: 0;
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
          align-items: center;
          gap: 15px;
          margin: 0 0 12px;
          font-size: 14px;
        }
        .summary-right strong {
          text-align: right;
          overflow-wrap: anywhere;
        }
        .grand-total {
          border-top: 1px solid #ddd;
          padding-top: 14px;
          font-size: 17px !important;
          font-weight: 700;
        }
        .payment-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }
        .payment-item {
          min-width: 0;
          overflow-wrap: anywhere;
        }
        .payment-item strong {
          display: block;
          font-size: 14px;
          color: #333;
        }
        .payment-grid p {
          margin: 7px 0 0;
          color: #555;
          font-size: 14px;
          overflow-wrap: anywhere;
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
          font-size: 14px;
          transition: 0.2s;
        }
        .btn-back {
          background: #6c757d;
        }
        .btn-back:hover {
          background: #565e64;
        }
        .btn-print {
          background: #0d6efd;
        }
        .btn-print:hover {
          background: #0b5ed7;
        }
        @media (max-width: 1200px) {
          .order-summary-card {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .order-view-container {
            width: 96%;
          }
        }
        @media (max-width: 992px) {
          .details-grid {
            grid-template-columns: 1fr;
            gap: 5px;
          }
          .order-summary-card {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .page-header h2 {
            font-size: 27px;
          }
        }
        @media (max-width: 768px) {
          .order-view-container {
            width: 100%;
            max-width: 100%;
            margin: 15px auto;
            padding: 0 12px 20px;
            overflow-x: hidden;
          }
          .page-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 14px;
            margin-bottom: 20px;
          }
          .page-header h2 {
            font-size: 24px;
          }
          .page-header p {
            font-size: 13px;
          }
          .back-btn {
            width: 100%;
            padding: 12px;
          }
          .order-summary-card {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 22px;
          }
          .summary-item {
            padding: 14px;
            border-left-width: 4px;
            border-radius: 8px;
          }
          .summary-item > span:first-child {
            font-size: 11px;
            margin-bottom: 7px;
          }
          .summary-item h4 {
            font-size: 14px;
          }
          .summary-item select {
            padding: 9px 7px;
            font-size: 12px;
          }
          .status {
            padding: 7px 10px;
            font-size: 11px;
          }
          .details-grid {
            grid-template-columns: 1fr;
            gap: 0;
            margin-bottom: 20px;
          }
          .info-card, .product-card {
            margin-bottom: 16px;
            border-radius: 9px;
          }
          .card-header {
            font-size: 15px;
            padding: 13px 14px;
          }
          .card-body {
            padding: 15px;
          }
          .card-body p {
            font-size: 13px;
            line-height: 22px;
          }
          .table-responsive {
            overflow-x: hidden;
            width: 100%;
          }
          .product-table {
            display: block;
            width: 100%;
            min-width: 0;
            border-collapse: separate;
          }
          .product-table thead {
            display: none;
          }
          .product-table tbody {
            display: block;
            width: 100%;
            padding: 10px;
          }
          .product-table tbody tr {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0 12px;
            width: 100%;
            margin-bottom: 12px;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 9px;
            background: #fff;
          }
          .product-table tbody tr:last-child {
            margin-bottom: 0;
          }
          .product-table td {
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-width: 0;
            padding: 10px 2px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 12px;
            text-align: left;
            overflow-wrap: anywhere;
          }
          .product-table td::before {
            content: attr(data-label);
            display: block;
            margin-bottom: 6px;
            color: #777;
            font-size: 11px;
            font-weight: 600;
          }
          .product-table td.product-cell {
            grid-column: 1 / -1;
            display: block;
            padding: 4px 0 12px;
          }
          .product-table td.product-cell::before {
            margin-bottom: 9px;
          }
          .product-info {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
          }
          .product-info strong {
            font-size: 13px;
            line-height: 1.5;
          }
          .product-img {
            width: 52px;
            height: 52px;
            border-radius: 6px;
          }
          .product-table td:last-child {
            border-bottom: 0;
          }
          .product-table td.empty-row {
            display: block;
            grid-column: 1 / -1;
            text-align: center !important;
            padding: 20px 5px !important;
            border: 0;
          }
          .product-table td.empty-row::before {
            display: none;
          }
          .price-summary {
            padding: 15px;
          }
          .summary-right {
            width: 100%;
          }
          .summary-right p {
            font-size: 13px;
          }
          .grand-total {
            font-size: 16px !important;
          }
          .payment-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px 12px;
          }
          .payment-item strong {
            font-size: 12px;
          }
          .payment-grid p {
            font-size: 12px;
            line-height: 1.5;
          }
          .action-buttons {
            flex-direction: column;
            gap: 10px;
            margin: 20px 0;
          }
          .action-buttons button {
            width: 100%;
            padding: 13px;
          }
        }
        @media (max-width: 420px) {
          .order-view-container {
            padding-left: 9px;
            padding-right: 9px;
          }
          .page-header h2 {
            font-size: 21px;
          }
          .order-summary-card {
            gap: 9px;
          }
          .summary-item {
            padding: 11px;
          }
          .summary-item h4 {
            font-size: 12px;
          }
          .summary-item > span:first-child {
            font-size: 10px;
          }
          .summary-item select {
            font-size: 11px;
            padding: 8px 5px;
          }
          .payment-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .product-table tbody {
            padding: 8px;
          }
          .product-table tbody tr {
            padding: 10px;
            gap: 0 8px;
          }
          .product-table td {
            font-size: 11px;
          }
          .product-table td::before {
            font-size: 10px;
          }
          .product-info strong {
            font-size: 12px;
          }
          .product-img {
            width: 46px;
            height: 46px;
          }
          .card-header {
            font-size: 14px;
          }
        }
        @media (max-width: 340px) {
          .order-summary-card {
            grid-template-columns: 1fr;
          }
          .product-table tbody tr {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media print {
          :global(body) {
            background: white !important;
          }
          .order-view-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            overflow: visible;
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
          .table-responsive {
            overflow: visible;
          }
          .product-table {
            display: table;
            min-width: 0;
          }
          .product-table thead {
            display: table-header-group;
          }
          .product-table tbody {
            display: table-row-group;
          }
          .product-table tbody tr {
            display: table-row;
            border: 0;
            padding: 0;
          }
          .product-table td {
            display: table-cell;
            border-bottom: 1px solid #ddd;
          }
          .product-table td::before {
            display: none;
          }
          .product-table td.product-cell {
            display: table-cell;
          }
          .product-table td.empty-row {
            display: table-cell;
          }
          .product-table td:last-child {
            border-bottom: 1px solid #ddd;
          }
          .product-img {
            width: 45px;
            height: 45px;
          }
        }
      `}</style>
    </div>
  );
}