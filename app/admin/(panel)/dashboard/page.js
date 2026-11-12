"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
const STATUS_LIST = [
  { name: "Processing", key: "processing", color: "#f39c12", icon: "⚙️" },
  { name: "Pending", key: "pending", color: "#3498db", icon: "⏳" },
  { name: "Shipping", key: "shipping", color: "#8e44ad", icon: "🚚" },
  { name: "Delivered", key: "delivered", color: "#27ae60", icon: "📦" },
  { name: "Cancelled", key: "cancelled", color: "#e74c3c", icon: "✕" },
];
const DEFAULT_COUNT = {
  processing: 0,
  pending: 0,
  shipping: 0,
  delivered: 0,
  cancelled: 0,
  total_orders: 0,
  revenue: 0,
};
export default function AdminDashboard() {
  const router = useRouter();
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadDashboard = useCallback(
    async (status) => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`/api/admin/dashboard?status=${encodeURIComponent(status)}`, { cache: "no-store" });
        const data = await response.json();
        if (response.status === 401) {
          router.replace("/admin/login");
          return;
        }
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load dashboard");
        }
        const dashboardCount = data.count || {};
        setCount({
          processing: Number(dashboardCount.processing || 0),
          pending: Number(dashboardCount.pending || 0),
          shipping: Number(dashboardCount.shipping || 0),
          delivered: Number(dashboardCount.delivered || 0),
          cancelled: Number(dashboardCount.cancelled || 0),
          total_orders: Number(dashboardCount.total_orders || 0),
          revenue: Number(dashboardCount.revenue || 0),
        });
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );
  useEffect(() => {
    loadDashboard("Pending");
  }, [loadDashboard]);
  const selectStatus = (status) => {
    setSelectedStatus(status);
    loadDashboard(status);
  };
  const total = count.processing + count.pending + count.shipping + count.delivered + count.cancelled;
  const getPercent = (value) => {
    return total > 0 ? (value / total) * 100 : 0;
  };
  const pieParts = STATUS_LIST.map((item) => ({
    ...item, value: count[item.key], percent: getPercent(count[item.key]),
  }));
  let currentPercent = 0;
  const pieGradient = pieParts
    .map((item) => {
      const start = currentPercent;
      currentPercent += item.percent;
      return `${item.color} ${start}% ${currentPercent}%`;
    })
    .join(", ");
  const money = (value) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
  const formatDate = (date) => {
    if (!date) return "-";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const getStatusClass = (status) => {
    const normalized = String(status || "").toLowerCase();
    return (STATUS_LIST.find((item) => item.key === normalized)?.name || "Unknown");
  };
  return (
    <>
      <style jsx>{`
        .dashboard {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          color: #252525;
          box-sizing: border-box;
        }
        .dashboard *, .dashboard *::before, .dashboard *::after {
          box-sizing: border-box;
        }
        .welcome {
          margin-bottom: 25px;
        }
        .welcome h1 {
          font-size: 27px;
          font-weight: 700;
          margin: 0 0 7px;
          color: #222;
        }
        .welcome p {
          color: #888;
          font-size: 14px;
          margin: 0;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 25px;
          width: 100%;
        }
        .stat-card {
          width: 100%;
          min-width: 0;
          background: white;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
          cursor: pointer;
          transition: 0.2s ease;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }
        .stat-card.active {
          border: 2px solid #222;
          padding: 19px;
        }
        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 18px;
        }
        .stat-card h4 {
          font-size: 13px;
          color: #777;
          font-weight: 500;
          margin: 0;
          overflow-wrap: anywhere;
        }
        .stat-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 9px;
          font-size: 19px;
          background: #f4f4f4;
        }
        .stat-card h2 {
          font-size: 29px;
          margin: 0 0 9px;
          color: #222;
          font-weight: 700;
        }
        .view-details {
          font-size: 12px;
          color: #777;
        }
        .analytics {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 18px;
          margin-bottom: 25px;
          width: 100%;
        }
        .panel {
          background: white;
          padding: 23px;
          border-radius: 12px;
          border: 1px solid #eee;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
          min-width: 0;
        }
        .panel h3 {
          font-size: 17px;
          margin: 0 0 20px;
          font-weight: 600;
        }
        .chart-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 35px;
          flex-wrap: wrap;
          min-width: 0;
        }
        .pie {
          width: 220px;
          height: 220px;
          max-width: 100%;
          flex-shrink: 0;
          border-radius: 50%;
          position: relative;
        }
        .pie::after {
          content: "";
          position: absolute;
          width: 115px;
          height: 115px;
          background: white;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .pie-center {
          position: absolute;
          inset: 0;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .pie-center strong {
          font-size: 25px;
        }
        .pie-center span {
          font-size: 11px;
          color: #888;
        }
        .legend {
          display: flex;
          flex-direction: column;
          gap: 14px;
          min-width: 0;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 13px;
          color: #555;
        }
        .legend-item strong {
          color: #222;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .revenue {
          font-size: 34px;
          font-weight: 700;
          color: #249b62;
          margin: 25px 0 8px;
          overflow-wrap: anywhere;
        }
        .muted {
          font-size: 13px;
          color: #888;
          margin: 0;
        }
        .summary-list {
          border-top: 1px solid #eee;
          margin-top: 22px;
          padding-top: 15px;
          display: grid;
          gap: 13px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: #666;
        }
        .summary-row strong {
          color: #222;
        }
        .table-panel {
          background: white;
          border-radius: 12px;
          padding: 22px;
          border: 1px solid #eee;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.04);
          min-width: 0;
          width: 100%;
        }
        .table-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .table-heading h3 {
          font-size: 17px;
          margin: 0 0 5px;
        }
        .table-heading span {
          font-size: 12px;
          color: #888;
        }
        .refresh {
          padding: 9px 15px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 7px;
          cursor: pointer;
          font-size: 12px;
          color: #333;
          white-space: nowrap;
          transition: 0.2s;
        }
        .refresh:hover {
          background: #f5f5f5;
          border-color: #aaa;
        }
        .refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .table-scroll {
          width: 100%;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead {
          background: #f5f6f8;
        }
        th {
          color: #666;
          font-size: 12px;
          text-align: left;
          padding: 14px;
          white-space: nowrap;
        }
        td {
          padding: 15px 14px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
          color: #444;
          overflow-wrap: anywhere;
        }
        tbody tr:hover {
          background: #fafafa;
        }
        .status {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          background: #f2f2f2;
          white-space: nowrap;
        }
        .status.Processing {
          color: #b9770e;
          background: #fef5e7;
        }
        .status.Pending {
          color: #2471a3;
          background: #ebf5fb;
        }
        .status.Shipping {
          color: #76448a;
          background: #f4ecf7;
        }
        .status.Delivered {
          color: #1e8449;
          background: #e9f7ef;
        }
        .status.Cancelled {
          color: #c0392b;
          background: #fdedec;
        }
        .status.Unknown {
          color: #666;
          background: #f2f2f2;
        }
        .empty {
          text-align: center;
          padding: 35px;
          color: #888;
          font-size: 13px;
        }
        .error {
          background: #fff0f0;
          color: #c0392b;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          font-size: 13px;
          overflow-wrap: anywhere;
        }
        .loading {
          text-align: center;
          padding: 35px 15px;
          color: #777;
          font-size: 14px;
        }
        .mobile-orders {
          display: none;
        }
        .order-card {
          border: 1px solid #eee;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 12px;
          min-width: 0;
          background: #fff;
        }
        .order-card:last-child {
          margin-bottom: 0;
        }
        .order-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 13px;
        }
        .order-number {
          font-size: 13px;
          font-weight: 700;
          color: #222;
          overflow-wrap: anywhere;
        }
        .order-card-info {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px 10px;
        }
        .order-info-item {
          min-width: 0;
        }
        .order-info-item span {
          display: block;
          font-size: 11px;
          color: #999;
          margin-bottom: 5px;
        }
        .order-info-item strong {
          display: block;
          font-size: 13px;
          color: #333;
          font-weight: 600;
          overflow-wrap: anywhere;
        }
        @media (max-width: 1200px) {
          .stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 900px) {
          .analytics {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 600px) {
          .welcome {
            margin-bottom: 18px;
          }
          .welcome h1 {
            font-size: 22px;
          }
          .welcome p {
            font-size: 12px;
            line-height: 1.5;
          }
          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
            margin-bottom: 18px;
          }
          .stat-card {
            padding: 13px;
            border-radius: 10px;
          }
          .stat-card.active {
            padding: 12px;
          }
          .stat-top {
            margin-bottom: 12px;
            gap: 5px;
          }
          .stat-card h4 {
            font-size: 11px;
            line-height: 1.4;
          }
          .stat-card h2 {
            font-size: 24px;
            margin-bottom: 7px;
          }
          .stat-icon {
            width: 31px;
            height: 31px;
            font-size: 15px;
            border-radius: 7px;
          }
          .view-details {
            font-size: 11px;
          }
          .analytics {
            gap: 13px;
            margin-bottom: 18px;
          }
          .panel, .table-panel {
            padding: 15px;
            border-radius: 10px;
          }
          .panel h3, .table-heading h3 {
            font-size: 15px;
          }
          .chart-content {
            gap: 20px;
          }
          .pie {
            width: 180px;
            height: 180px;
          }
          .pie::after {
            width: 95px;
            height: 95px;
          }
          .pie-center strong {
            font-size: 22px;
          }
          .legend {
            gap: 10px;
          }
          .legend-item {
            font-size: 12px;
          }
          .revenue {
            font-size: 27px;
            margin: 18px 0 7px;
          }
          .summary-list {
            margin-top: 17px;
            gap: 12px;
          }
          .table-heading {
            margin-bottom: 15px;
          }
          .table-heading h3 {
            font-size: 15px;
          }
          .refresh {
            padding: 8px 11px;
            font-size: 11px;
          }
          .table-scroll {
            display: none;
          }
          .mobile-orders {
            display: block;
          }
          .order-card {
            padding: 12px;
          }
        }
        @media (max-width: 380px) {
          .welcome h1 {
            font-size: 20px;
          }
          .stat-card {
            padding: 11px;
          }
          .stat-card.active {
            padding: 10px;
          }
          .stat-card h2 {
            font-size: 22px;
          }
          .stat-icon {
            width: 28px;
            height: 28px;
            font-size: 14px;
          }
          .pie {
            width: 160px;
            height: 160px;
          }
          .pie::after {
            width: 85px;
            height: 85px;
          }
          .revenue {
            font-size: 24px;
          }
        }
        @media (max-width: 320px) {
          .stats {
            grid-template-columns: 1fr;
          }
          .chart-content {
            gap: 15px;
          }
          .order-card-info {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="dashboard">
        <div className="welcome">
          <h1>Welcome Back, Admin 👋</h1>
          <p>Here is what's happening with your store today.</p>
        </div>
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        <div className="stats">
          {STATUS_LIST.map((item) => (
            <button type="button" key={item.key} className={`stat-card ${selectedStatus === item.name ? "active" : ""}`}
              onClick={() => selectStatus(item.name)} aria-pressed={selectedStatus === item.name}
            >
              <div className="stat-top">
                <h4>{item.name} Orders</h4>
                <div className="stat-icon">{item.icon}</div>
              </div>
              <h2>{count[item.key]}</h2>
              <span className="view-details">
                View Details →
              </span>
            </button>
          ))}
        </div>
        <div className="analytics">
          <section className="panel">
            <h3>Order Status</h3>
            <div className="chart-content">
              <div className="pie"
                style={{
                  background: total > 0 ? `conic-gradient(${pieGradient})` : "#e9e9e9",
                }}
              >
                <div className="pie-center">
                  <strong>{total}</strong>
                  <span>Total Orders</span>
                </div>
              </div>
              <div className="legend">
                {pieParts.map((item) => (
                  <div className="legend-item" key={item.key}>
                    <span className="dot" style={{ background: item.color }} />
                    {item.name}: <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="panel">
            <h3>Payment Summary</h3>
            <div className="revenue">
              {money(count.revenue)}
            </div>
            <p className="muted">
              Total Revenue (Current Year)
            </p>
            <div className="summary-list">
              {STATUS_LIST.map((item) => (
                <div className="summary-row" key={item.key}>
                  <span>{item.name}</span>
                  <strong>{count[item.key]}</strong>
                </div>
              ))}
              <div className="summary-row">
                <span>Total Orders</span>
                <strong>{count.total_orders}</strong>
              </div>
            </div>
          </section>
        </div>
        <section className="table-panel">
          <div className="table-heading">
            <div>
              <h3>{selectedStatus} Orders</h3>
              <span>Latest orders</span>
            </div>
            <button type="button" className="refresh" onClick={() => loadDashboard(selectedStatus)} disabled={loading}>
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
          {loading ? (
            <div className="loading">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="empty">
              No {selectedStatus.toLowerCase()} orders found.
            </div>
          ) : (
            <>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Order No</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => {
                      const status = getStatusClass(order.status);
                      return (
                        <tr key={order.id || order._id || order.orderNumber || index}>
                          <td>
                            {order.orderNumber || "-"}
                          </td>
                          <td>
                            {order.customer || "-"}
                          </td>
                          <td>
                            {money(order.amount)}
                          </td>
                          <td>
                            <span className={`status ${status}`}>
                              {order.status || "-"}
                            </span>
                          </td>
                          <td>
                            {formatDate(order.date)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mobile-orders">
                {orders.map((order, index) => {
                  const status = getStatusClass(order.status);
                  return (
                    <div className="order-card" key={order.id || order._id || order.orderNumber || index}>
                      <div className="order-card-top">
                        <div className="order-number">
                          {order.orderNumber || "Order"}
                        </div>
                        <span className={`status ${status}`}>
                          {order.status || "-"}
                        </span>
                      </div>
                      <div className="order-card-info">
                        <div className="order-info-item">
                          <span>Customer</span>
                          <strong>
                            {order.customer || "-"}
                          </strong>
                        </div>
                        <div className="order-info-item">
                          <span>Amount</span>
                          <strong>
                            {money(order.amount)}
                          </strong>
                        </div>
                        <div className="order-info-item">
                          <span>Order Date</span>
                          <strong>
                            {formatDate(order.date)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}