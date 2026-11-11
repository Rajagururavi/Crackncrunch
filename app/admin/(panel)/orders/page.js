"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  useEffect(() => {
    fetchOrders();
  }, []);
  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/admin/orders", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load orders");
      }
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  const filteredOrders = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return orders;
    return orders.filter((order) => {
      return (
        String(order.receipt || "").toLowerCase().includes(value) ||
        String(order.customer?.fullname || "").toLowerCase().includes(value) ||
        String(order.customer?.mobile || "").toLowerCase().includes(value) ||
        String(order.customer?.email || "").toLowerCase().includes(value) ||
        String(order.paymentMethod || "").toLowerCase().includes(value) ||
        String(order.orderStatus || "").toLowerCase().includes(value)
      );
    });
  }, [orders, search]);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const currentOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);
  function handleSearch(value) {
    setSearch(value);
    setCurrentPage(1);
  }
  function formatDate(date, fallback) {
    const value = date || fallback;
    if (!value) return "N/A";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return String(value);
    }
    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  function formatAmount(amount) {
    return Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  }
  function getStatusClass(status) {
    const value = String(status || "Pending").toLowerCase().replace(/\s+/g, "");
    const allowed = [
      "pending",
      "processing",
      "packed",
      "shipping",
      "shipped",
      "delivered",
      "cancelled",
    ];
    return allowed.includes(value) ? value : "pending";
  }
  function openOrderDetails(order) {
    if (!order?.receipt) {
      alert("Order ID is missing");
      return;
    }
    router.push(`/admin/orders/${encodeURIComponent(order.receipt)}`);
  }
  return (
    <div className="orders-page">
      <div className="table-header">
        <div>
          <h2>All Orders</h2>
          <p>Manage and view customer orders</p>
        </div>
        <div className="search-area">
          <form className={`search-form ${searchOpen ? "active" : ""}`} onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Search order, customer, mobile..." value={search} onChange={(e) => handleSearch(e.target.value)} />
          </form>
          <button type="button" className="search-icon" title="Search orders" onClick={() => {
            if (searchOpen) {
              setSearch("");
              setCurrentPage(1);
            }
            setSearchOpen((previous) => !previous);
          }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>
          <button type="button" className="refresh-btn" onClick={fetchOrders} disabled={loading} title="Refresh orders">
            ↻
          </button>
        </div>
      </div>
      <div className="orders-summary">
        <div>
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div>
          <span>Showing Results</span>
          <strong>{filteredOrders.length}</strong>
        </div>
      </div>
      <div className="table-wrapper">
        {loading ? (
          <div className="no-data">Loading orders...</div>
        ) : error ? (
          <div className="no-data error-message">
            {error}
            <button onClick={fetchOrders}>Try Again</button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="order-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.length > 0 ? (
                  currentOrders.map((order, index) => (
                    <tr key={order.receipt || index}>
                      <td>
                        {(currentPage - 1) * ordersPerPage + index + 1}
                      </td>
                      <td>
                        <strong>#{order.receipt || "N/A"}</strong>
                      </td>
                      <td>
                        {order.customer?.fullname || "N/A"}
                      </td>
                      <td>
                        {order.customer?.mobile || "N/A"}
                      </td>
                      <td>
                        <strong>
                          {formatAmount(order.summary?.total)}
                        </strong>
                      </td>
                      <td>
                        {order.paymentMethod || "N/A"}
                      </td>
                      <td>
                        <span className={`status ${getStatusClass(order.orderStatus)}`}>
                          {order.orderStatus || "Pending"}
                        </span>
                      </td>
                      <td>
                        {formatDate(
                          order.createdAt,
                          order.orderDate
                        )}
                      </td>
                      <td>
                        <button type="button" className="view-btn" title="View Order Details" onClick={() => openOrderDetails(order)} disabled={!order.receipt}>
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="no-data">
                      No Orders Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {!loading && !error && totalPages > 0 && (
        <div className="pagination-area">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button disabled={currentPage === 1} onClick={() =>setCurrentPage((page) => page - 1)}>
            Previous
          </button>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>
            Next
          </button>
        </div>
      )}
      <style jsx>{`
        .orders-page {
          width: 100%;
          color: #222;
        }
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin: 30px auto 20px;
          width: 95%;
        }
        .table-header h2 {
          font-size: 28px;
          color: #222;
          margin: 0 0 5px;
        }
        .table-header p {
          color: #777;
          font-size: 13px;
          margin: 0;
        }
        .search-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .search-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          background: #0d6efd;
          color: #fff;
          border: none;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: 0.3s;
        }
        .search-icon:hover {
          background: #0b5ed7;
        }
        .search-form input {
          width: 0;
          opacity: 0;
          padding: 10px 0;
          border: 0;
          border-radius: 6px;
          outline: none;
          transition: 0.4s;
          pointer-events: none;
        }
        .search-form.active input {
          width: 260px;
          opacity: 1;
          padding: 10px;
          border: 1px solid #ddd;
          pointer-events: auto;
        }
        .refresh-btn {
          width: 42px;
          height: 42px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          font-size: 22px;
          transition: 0.3s;
        }
        .refresh-btn:hover {
          background: #f3f4f6;
        }
        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .orders-summary {
          width: 95%;
          margin: 0 auto 18px;
          display: flex;
          gap: 15px;
        }
        .orders-summary div {
          background: white;
          border: 1px solid #eee;
          border-radius: 9px;
          padding: 13px 18px;
          min-width: 145px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .orders-summary span {
          color: #777;
          font-size: 12px;
        }
        .orders-summary strong {
          font-size: 22px;
        }
        .table-wrapper {
          width: 95%;
          margin: 0 auto;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        }
        .table-scroll {
          width: 100%;
          overflow-x: auto;
        }
        .order-table {
          width: 100%;
          border-collapse: collapse;
        }
        .order-table thead {
          background: #f8f9fa;
        }
        .order-table th {
          padding: 18px;
          text-align: left;
          color: #444;
          font-size: 13px;
          border-bottom: 2px solid #eee;
          white-space: nowrap;
        }
        .order-table td {
          padding: 18px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
          white-space: nowrap;
        }
        .order-table tbody tr {
          transition: 0.3s;
        }
        .order-table tbody tr:hover {
          background: #f8fbff;
        }
        .status {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 20px;
          color: #fff;
          font-size: 11px;
          font-weight: bold;
          text-transform: capitalize;
        }
        .pending {
          background: #ffc107;
          color: #222;
        }
        .processing {
          background: #6f42c1;
        }
        .packed {
          background: #17a2b8;
        }
        .shipping, .shipped {
          background: #0d6efd;
        }
        .delivered {
          background: #198754;
        }
        .cancelled {
          background: #dc3545;
        }
        .view-btn {
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0d6efd;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
        }
        .view-btn:hover {
          background: #0b5ed7;
          transform: scale(1.08);
        }
        .view-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }
        .no-data {
          text-align: center;
          padding: 40px;
          color: #777;
        }
        .error-message {
          color: #dc3545;
        }
        .error-message button {
          display: block;
          margin: 12px auto 0;
          padding: 8px 15px;
          cursor: pointer;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
        }
        .pagination-area {
          width: 95%;
          margin: 20px auto;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          color: #666;
          font-size: 13px;
        }
        .pagination-area button {
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          padding: 9px 14px;
          cursor: pointer;
        }
        .pagination-area button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        @media (max-width: 700px) {
          .table-header {
            align-items: flex-start;
            flex-direction: column;
          }
          .search-area {
            width: 100%;
          }
          .search-form {
            flex: 1;
            min-width: 0;
          }
          .search-form.active input {
            width: 100%;
          }
          .orders-summary {
            flex-wrap: wrap;
          }
          .orders-summary div {
            flex: 1;
            min-width: 120px;
          }
          .pagination-area {
            flex-wrap: wrap;
          }
        }
        @media (max-width: 400px) {
          .table-header h2 {
            font-size: 23px;
          }
          .table-wrapper, .table-header, .orders-summary, .pagination-area {
            width: 96%;
          }
          .search-icon, .refresh-btn {
            width: 38px;
            height: 38px;
          }
        }
      `}</style>
    </div>
  );
}