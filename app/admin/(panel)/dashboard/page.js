"use client";

export default function DashboardPage() {
  return (
    <div className="dashboard-page">
      <style jsx>{`
        .dashboard-page {
          width: 100%;
        }

        .page-header {
          margin-bottom: 25px;
        }

        .page-header h1 {
          margin: 0 0 8px;
          font-size: 28px;
          color: #222;
        }

        .page-header p {
          margin: 0;
          color: #777;
          font-size: 14px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .dashboard-card {
          background: #fff;
          border-radius: 10px;
          padding: 22px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .card-title {
          font-size: 14px;
          color: #777;
          margin-bottom: 12px;
        }

        .card-value {
          font-size: 28px;
          font-weight: 700;
          color: #222;
        }

        .recent-orders {
          background: #fff;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .recent-orders h2 {
          margin: 0 0 20px;
          font-size: 20px;
          color: #222;
        }

        .empty-message {
          padding: 30px 0;
          text-align: center;
          color: #777;
          font-size: 14px;
        }

        @media (max-width: 1000px) {
          .dashboard-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* PAGE HEADER */}
      <div className="page-header">
        <h1>Dashboard</h1>

        <p>
          Welcome to the Crack N Crunch admin panel.
        </p>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-title">
            Total Orders
          </div>

          <div className="card-value">
            0
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-title">
            Total Users
          </div>

          <div className="card-value">
            0
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-title">
            Total Revenue
          </div>

          <div className="card-value">
            ₹0
          </div>
        </div>

      </div>

      {/* RECENT ORDERS */}
      <div className="recent-orders">

        <h2>
          Recent Orders
        </h2>

        <div className="empty-message">
          No orders available.
        </div>

      </div>
    </div>
  );
}