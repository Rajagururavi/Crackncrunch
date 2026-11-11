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
export default function AdminDashboard() {
  const router = useRouter();
  const [count, setCount] = useState({
    processing: 0,
    pending: 0,
    shipping: 0,
    delivered: 0,
    cancelled: 0,
    total_orders: 0,
    revenue: 0,
  });
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadDashboard = useCallback(async (status) => {
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
      setCount(data.count);
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [router]);
  useEffect(() => {
    loadDashboard("Pending");
  }, [loadDashboard]);
  const selectStatus = (status) => {
    setSelectedStatus(status);
    loadDashboard(status);
  };
  const total = count.processing + count.pending + count.shipping + count.delivered + count.cancelled;
  const getPercent = (value) => total > 0 ? (value / total) * 100 : 0;
  const pieParts = STATUS_LIST.map((item) => ({...item, value: count[item.key], percent: getPercent(count[item.key]), }));
  let currentPercent = 0;
  const pieGradient = pieParts.map((item) => {
    const start = currentPercent;
    currentPercent += item.percent;
    return `${item.color} ${start}% ${currentPercent}%`;
  }).join(", ");
  const money = (value) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2,
  }).format(value || 0);
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  return (
    <>
      <style jsx>{`
        .dashboard {
          width: 100%;
          color: #252525;
        }
        .welcome {
          margin-bottom: 25px;
        }
        .welcome h1 {
          font-size: 27px;
          font-weight: 700;
          margin-bottom: 7px;
        }
        .welcome p {
          color: #888;
          font-size: 14px;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 25px;
        }
        .stat-card {
          background: white;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
          cursor: pointer;
          transition: .2s;
          box-shadow: 0 3px 12px rgba(0,0,0,.04);
          min-width: 0;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,.08);
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
        .stat-icon {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          font-size: 19px;
          background: #f4f4f4;
        }
        .stat-card h4 {
          font-size: 13px;
          color: #777;
          font-weight: 500;
        }
        .stat-card h2 {
          font-size: 29px;
          margin-bottom: 9px;
          color: #222;
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
        }
        .panel {
          background: white;
          padding: 23px;
          border-radius: 12px;
          border: 1px solid #eee;
          box-shadow: 0 3px 12px rgba(0,0,0,.04);
          min-width: 0;
        }
        .panel h3 {
          font-size: 17px;
          margin-bottom: 20px;
        }
        .chart-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 35px;
          flex-wrap: wrap;
        }
        .pie {
          width: 220px;
          height: 220px;
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
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 13px;
          color: #555;
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
          box-shadow: 0 3px 12px rgba(0,0,0,.04);
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
        }
        .table-heading span {
          font-size: 12px;
          color: #888;
        }
        .table-scroll {
          overflow-x: auto;
          width: 100%;
        }
        table {
          width: 100%;
          min-width: 650px;
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
        }
        .status {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          background: #f2f2f2;
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
        .status.Cancelled { c
          olor: #c0392b; 
          background: #fdedec; 
        }
        .empty {
          text-align: center;
          padding: 35px;
          color: #888;
        }
        .error {
          background: #fff0f0;
          color: #c0392b;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        .refresh {
          padding: 9px 15px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 7px;
          cursor: pointer;
          font-size: 12px;
        }
        @media(max-width: 1200px) {
          .stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media(max-width: 850px) {
          .analytics {
            grid-template-columns: 1fr;
          }
        }
        @media(max-width: 600px) {
          .welcome h1 {
            font-size: 22px;
          }
          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }
          .stat-card {
            padding: 14px;
          }
          .stat-card.active {
            padding: 13px;
          }
          .stat-card h4 {
            font-size: 12px;
          }
          .stat-card h2 {
            font-size: 25px;
          }
          .stat-icon {
            width: 33px;
            height: 33px;
            font-size: 16px;
          }
          .panel, .table-panel {
            padding: 16px;
          }
          .chart-content {
            gap: 22px;
          }
          .pie {
            width: 190px;
            height: 190px;
          }
          .pie::after {
            width: 100px;
            height: 100px;
          }
          .revenue {
            font-size: 28px;
          }
          .table-heading h3 {
            font-size: 15px;
          }
        }
        @media(max-width: 350px) {
          .stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="dashboard">
        <div className="welcome">
          <h1>Welcome Back, Admin 👋</h1>
          <p>Here is what's happening with your store today.</p>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="stats">
          {STATUS_LIST.map((item) => (
            <button key={item.key} className={`stat-card ${selectedStatus === item.name ? "active" : ""}`} onClick={() => selectStatus(item.name)}>
              <div className="stat-top">
                <h4>{item.name} Orders</h4>
                <div className="stat-icon">{item.icon}</div>
              </div>
              <h2>{count[item.key]}</h2>
              <span className="view-details">View Details →</span>
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
            <p className="muted">Total Revenue (Current Year)</p>
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
            <button className="refresh" onClick={() => loadDashboard(selectedStatus)}>
              ↻ Refresh
            </button>
          </div>
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
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNumber || "-"}</td>
                    <td>{order.customer || "-"}</td>
                    <td>₹{Number(order.amount || 0).toLocaleString("en-IN")}</td>
                    <td>{order.status || "-"}</td>
                    <td>{order.date ? new Date(order.date).toLocaleDateString("en-IN", {day: "2-digit", month: "short", year: "numeric", }): "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}