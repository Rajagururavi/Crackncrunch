
"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/users", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load users");
      }

      setUsers(data.users || []);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter((user) => {
    const searchValue = search.toLowerCase();

    return (
      (user.name || "").toLowerCase().includes(searchValue) ||
      (user.email || "").toLowerCase().includes(searchValue) ||
      (user.phone || "").toLowerCase().includes(searchValue)
    );
  });

  function formatDate(date) {
    if (!date) return "N/A";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) return "N/A";

    return value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your registered customers</p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchUsers}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="users-stats">
        <div className="users-stat-card">
          <span>Total Customers</span>
          <strong>{users.length}</strong>
        </div>
      </div>

      <div className="users-table-card">
        <div className="users-table-header">
          <h2>Customer List</h2>

          <input
            type="text"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="users-message">Loading customers...</div>
        ) : error ? (
          <div className="users-message users-error">
            {error}
            <button onClick={fetchUsers}>Try Again</button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="users-message">
            No customers found.
          </div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>USER NAME</th>
                  <th>EMAIL ID</th>
                  <th>PHONE NUMBER</th>
                  <th>REGISTERED DATE</th>
                  <th>ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={`${user.email}-${index}`}>
                    <td>
                      <div className="customer-name">
                        <div className="customer-avatar">
                          {(user.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <strong>{user.name || "N/A"}</strong>
                      </div>
                    </td>

                    <td>{user.email || "N/A"}</td>

                    <td>{user.phone || "N/A"}</td>

                    <td>{formatDate(user.createdAt)}</td>

                    <td>
                      <button
                        className="view-user-btn"
                        title="View customer details"
                        onClick={() => setSelectedUser(user)}
                      >
                        <svg
                          width="19"
                          height="19"
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="users-footer">
            Showing {filteredUsers.length} of {users.length} customers
          </div>
        )}
      </div>

      {selectedUser && (
        <div
          className="user-modal-overlay"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="user-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="user-modal-header">
              <div>
                <h2>Customer Details</h2>
                <p>Complete customer information</p>
              </div>

              <button
                className="modal-close-btn"
                onClick={() => setSelectedUser(null)}
              >
                ×
              </button>
            </div>

            <div className="user-profile">
              <div className="user-profile-avatar">
                {(selectedUser.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <h3>{selectedUser.name || "N/A"}</h3>
              <p>{selectedUser.email || "N/A"}</p>
            </div>

            <div className="user-details-grid">
              <div className="user-detail-item">
                <span>Full Name</span>
                <strong>{selectedUser.name || "N/A"}</strong>
              </div>

              <div className="user-detail-item">
                <span>Email ID</span>
                <strong>{selectedUser.email || "N/A"}</strong>
              </div>

              <div className="user-detail-item">
                <span>Phone Number</span>
                <strong>{selectedUser.phone || "N/A"}</strong>
              </div>

              <div className="user-detail-item">
                <span>Address</span>
                <strong>{selectedUser.address || "N/A"}</strong>
              </div>

              <div className="user-detail-item">
                <span>Pincode</span>
                <strong>{selectedUser.pincode || "N/A"}</strong>
              </div>

              <div className="user-detail-item">
                <span>State</span>
                <strong>{selectedUser.state || "N/A"}</strong>
              </div>

              <div className="user-detail-item">
                <span>Country</span>
                <strong>{selectedUser.country || "N/A"}</strong>
              </div>

              <div className="user-detail-item">
                <span>Registered Date</span>
                <strong>{formatDate(selectedUser.createdAt)}</strong>
              </div>
            </div>

            <button
              className="modal-done-btn"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .users-page {
          width: 100%;
          color: #1f2937;
        }

        .users-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .users-header h1 {
          font-size: 27px;
          font-weight: 700;
          margin: 0 0 6px;
        }

        .users-header p,
        .user-modal-header p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .refresh-btn {
          border: 1px solid #d1d5db;
          background: white;
          padding: 10px 16px;
          border-radius: 7px;
          cursor: pointer;
        }

        .users-stats {
          margin-bottom: 20px;
        }

        .users-stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 18px 22px;
          max-width: 230px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .users-stat-card span {
          color: #6b7280;
          font-size: 13px;
        }

        .users-stat-card strong {
          font-size: 28px;
        }

        .users-table-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
        }

        .users-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 20px;
        }

        .users-table-header h2 {
          font-size: 18px;
          margin: 0;
          font-weight: 650;
        }

        .users-table-header input {
          width: 290px;
          max-width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          outline: none;
          font-size: 13px;
        }

        .users-table-header input:focus {
          border-color: #16a34a;
        }

        .users-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .users-table th {
          background: #f9fafb;
          color: #6b7280;
          font-size: 11px;
          letter-spacing: 0.5px;
          padding: 14px 18px;
          white-space: nowrap;
        }

        .users-table td {
          padding: 15px 18px;
          border-top: 1px solid #f0f0f0;
          font-size: 13px;
          white-space: nowrap;
        }

        .customer-name {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .customer-avatar,
        .user-profile-avatar {
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background: #dcfce7;
          color: #15803d;
          font-weight: 700;
        }

        .customer-avatar {
          width: 34px;
          height: 34px;
        }

        .view-user-btn {
          width: 35px;
          height: 35px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          background: #eff6ff;
          color: #2563eb;
          border: none;
          border-radius: 7px;
          cursor: pointer;
        }

        .view-user-btn:hover {
          background: #dbeafe;
        }

        .users-message {
          padding: 45px 20px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }

        .users-error {
          color: #dc2626;
        }

        .users-error button {
          display: block;
          margin: 12px auto 0;
          padding: 8px 15px;
          cursor: pointer;
        }

        .users-footer {
          padding: 15px 20px;
          border-top: 1px solid #eee;
          color: #6b7280;
          font-size: 12px;
        }

        .user-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 15px;
        }

        .user-modal {
          background: white;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 13px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .user-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .user-modal-header h2 {
          font-size: 21px;
          margin: 0 0 5px;
        }

        .modal-close-btn {
          border: none;
          background: #f3f4f6;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 23px;
          cursor: pointer;
        }

        .user-profile {
          text-align: center;
          padding: 22px 0;
          border-bottom: 1px solid #eee;
        }

        .user-profile-avatar {
          width: 65px;
          height: 65px;
          font-size: 25px;
          margin: 0 auto 10px;
        }

        .user-profile h3 {
          margin: 0 0 5px;
          font-size: 18px;
        }

        .user-profile p {
          color: #6b7280;
          font-size: 13px;
          margin: 0;
        }

        .user-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          padding: 22px 0;
        }

        .user-detail-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .user-detail-item span {
          color: #6b7280;
          font-size: 12px;
        }

        .user-detail-item strong {
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .modal-done-btn {
          width: 100%;
          border: none;
          background: #16a34a;
          color: white;
          padding: 12px;
          border-radius: 7px;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 650px) {
          .users-header,
          .users-table-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .users-table-header input {
            width: 100%;
          }

          .user-details-grid {
            grid-template-columns: 1fr;
          }

          .user-modal {
            padding: 18px;
          }
        }
      `}</style>
    </div>
  );
}