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
    return ((user.name || "").toLowerCase().includes(searchValue) || (user.email || "").toLowerCase().includes(searchValue) || (user.phone || "").toLowerCase().includes(searchValue));
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
  useEffect(() => {
    if (!selectedUser) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedUser(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedUser]);
  return (
    <div className="users-page">
      <div className="users-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your registered customers</p>
        </div>
        <button className="refresh-btn" onClick={fetchUsers} disabled={loading}>
          <span>↻</span>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
      <div className="users-stats">
        <div className="users-stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <span>Total Customers</span>
            <strong>{users.length}</strong>
          </div>
        </div>
      </div>
      <div className="users-table-card">
        <div className="users-table-header">
          <div>
            <h2>Customer List</h2>
            <p>View and manage registered customers</p>
          </div>
          <div className="search-box">
            <span>⌕</span>
            <input type="text" placeholder="Search name, email or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                ×
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="users-message">
            <div className="loading-spinner" />
            <p>Loading customers...</p>
          </div>
        ) : error ? (
          <div className="users-message users-error">
            <p>{error}</p>
            <button onClick={fetchUsers}>
              Try Again
            </button>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="users-message">
            <div className="empty-icon">👥</div>
            <h3>No customers found</h3>
            <p>Try searching with a different name or email.</p>
          </div>
        ) : (
          <>
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
                        <button className="view-user-btn" title="View customer details" aria-label="View customer details" onClick={() => setSelectedUser(user)}>
                          <svg
                            width="19" height="19" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
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
            <div className="mobile-users-list">
              {filteredUsers.map((user, index) => (
                <div className="mobile-user-card" key={`${user.email}-${index}`}>
                  <div className="mobile-user-top">
                    <div className="customer-name">
                      <div className="customer-avatar">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="mobile-user-name">
                        <strong>{user.name || "N/A"}</strong>
                        <span>Customer #{index + 1}</span>
                      </div>
                    </div>
                    <button className="view-user-btn" onClick={() => setSelectedUser(user)} aria-label="View customer details">
                      <svg
                        width="19" height="19" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </div>
                  <div className="mobile-user-info">
                    <div className="mobile-info-row">
                      <span>Email</span>
                      <strong>{user.email || "N/A"}</strong>
                    </div>
                    <div className="mobile-info-row">
                      <span>Phone</span>
                      <strong>{user.phone || "N/A"}</strong>
                    </div>
                    <div className="mobile-info-row">
                      <span>Registered</span>
                      <strong>{formatDate(user.createdAt)}</strong>
                    </div>
                  </div>
                  <button className="mobile-view-btn" onClick={() => setSelectedUser(user)}>
                    View Customer Details →
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        {!loading && !error && (
          <div className="users-footer">
            Showing <strong>{filteredUsers.length}</strong> of{" "}
            <strong>{users.length}</strong> customers
          </div>
        )}
      </div>
      {selectedUser && (
        <div className="user-modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="user-modal-header">
              <div>
                <h2>Customer Details</h2>
                <p>Complete customer information</p>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedUser(null)} aria-label="Close customer details">
                ×
              </button>
            </div>
            <div className="user-profile">
              <div className="user-profile-avatar">
                {(selectedUser.name || "U").charAt(0).toUpperCase()}
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
                <strong>
                  {formatDate(selectedUser.createdAt)}
                </strong>
              </div>
            </div>
            <button className="modal-done-btn" onClick={() => setSelectedUser(null)}>
              Close
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        .users-page {
          width: 100%;
          max-width: 100%;
          color: #1f2937;
          min-width: 0;
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
        .users-header p {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }
        .refresh-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid #d1d5db;
          background: white;
          padding: 11px 17px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          transition: 0.2s;
        }
        .refresh-btn:hover {
          background: #f3f4f6;
        }
        .refresh-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .refresh-btn span {
          font-size: 19px;
        }
        .users-stats {
          margin-bottom: 22px;
        }
        .users-stat-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 19px 22px;
          max-width: 260px;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .stat-icon {
          width: 46px;
          height: 46px;
          background: #dcfce7;
          color: #15803d;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          flex-shrink: 0;
        }
        .users-stat-card div:last-child {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .users-stat-card span {
          color: #6b7280;
          font-size: 13px;
        }
        .users-stat-card strong {
          font-size: 27px;
        }
        .users-table-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          overflow: hidden;
          width: 100%;
          min-width: 0;
        }
        .users-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 20px;
        }
        .users-table-header h2 {
          font-size: 18px;
          margin: 0 0 5px;
          font-weight: 650;
        }
        .users-table-header p {
          color: #9ca3af;
          font-size: 12px;
          margin: 0;
        }
        .search-box {
          width: 310px;
          max-width: 100%;
          height: 42px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          background: white;
        }
        .search-box:focus-within {
          border-color: #16a34a;
        }
        .search-box > span {
          color: #9ca3af;
          font-size: 22px;
        }
        .search-box input {
          width: 100%;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          font-size: 13px;
          color: #1f2937;
        }
        .search-box button {
          border: none;
          background: transparent;
          color: #777;
          font-size: 20px;
          cursor: pointer;
        }
        .users-table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .users-table {
          width: 100%;
          min-width: 750px;
          border-collapse: collapse;
          text-align: left;
        }
        .users-table th {
          background: #f9fafb;
          color: #6b7280;
          font-size: 11px;
          letter-spacing: 0.5px;
          padding: 15px 18px;
          white-space: nowrap;
        }
        .users-table td {
          padding: 15px 18px;
          border-top: 1px solid #f0f0f0;
          font-size: 13px;
          white-space: nowrap;
        }
        .users-table tbody tr:hover {
          background: #fafafa;
        }
        .customer-name {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .customer-avatar, .user-profile-avatar {
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background: #dcfce7;
          color: #15803d;
          font-weight: 700;
          flex-shrink: 0;
        }
        .customer-avatar {
          width: 36px;
          height: 36px;
        }
        .view-user-btn {
          width: 38px;
          height: 38px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          background: #eff6ff;
          color: #2563eb;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .view-user-btn:hover {
          background: #dbeafe;
        }
        .mobile-users-list {
          display: none;
        }
        .mobile-user-card {
          padding: 17px;
          border-top: 1px solid #eee;
          background: white;
        }
        .mobile-user-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .mobile-user-name {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .mobile-user-name strong {
          font-size: 14px;
          overflow-wrap: anywhere;
        }
        .mobile-user-name span {
          font-size: 11px;
          color: #9ca3af;
        }
        .mobile-user-info {
          margin-top: 16px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mobile-info-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .mobile-info-row span {
          color: #9ca3af;
          font-size: 11px;
        }
        .mobile-info-row strong {
          color: #374151;
          font-size: 13px;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .mobile-view-btn {
          width: 100%;
          margin-top: 13px;
          padding: 11px;
          border: 1px solid #dbeafe;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .users-message {
          padding: 50px 20px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .loading-spinner {
          width: 32px;
          height: 32px;
          margin: 0 auto 12px;
          border: 3px solid #e5e7eb;
          border-top-color: #16a34a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .empty-icon {
          font-size: 35px;
          margin-bottom: 10px;
        }
        .users-message h3 {
          color: #374151;
          margin: 0 0 7px;
          font-size: 16px;
        }
        .users-message p {
          margin: 5px 0;
        }
        .users-error {
          color: #dc2626;
        }
        .users-error button {
          display: block;
          margin: 12px auto 0;
          padding: 9px 17px;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 6px;
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
          padding: 20px;
        }
        .user-modal {
          background: white;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          max-height: 90dvh;
          overflow-y: auto;
          overscroll-behavior: contain;
          border-radius: 13px;
          padding: 25px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }
        .user-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }
        .user-modal-header h2 {
          font-size: 21px;
          margin: 0 0 5px;
        }
        .user-modal-header p {
          color: #6b7280;
          font-size: 13px;
          margin: 0;
        }
        .modal-close-btn {
          border: none;
          background: #f3f4f6;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          font-size: 23px;
          cursor: pointer;
          flex-shrink: 0;
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
          overflow-wrap: anywhere;
        }
        .user-profile p {
          color: #6b7280;
          font-size: 13px;
          margin: 0;
          overflow-wrap: anywhere;
        }
        .user-details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
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
          word-break: break-word;
        }
        .modal-done-btn {
          width: 100%;
          border: none;
          background: #16a34a;
          color: white;
          padding: 13px;
          border-radius: 7px;
          font-weight: 600;
          cursor: pointer;
        }
        .modal-done-btn:hover {
          background: #15803d;
        }
        @media (max-width: 900px) {
          .users-table th, .users-table td {
            padding: 13px 12px;
          }
          .users-table-header {
            gap: 12px;
          }
          .search-box {
            width: 270px;
          }
        }
        @media (max-width: 650px) {
          .users-header {
            align-items: flex-start;
            flex-direction: row;
            margin-bottom: 20px;
          }
          .users-header h1 {
            font-size: 23px;
          }
          .users-header p {
            font-size: 12px;
          }
          .refresh-btn {
            padding: 10px 12px;
            font-size: 12px;
          }
          .users-stat-card {
            max-width: 100%;
            padding: 15px;
          }
          .users-table-header {
            flex-direction: column;
            align-items: stretch;
            padding: 17px;
          }
          .search-box {
            width: 100%;
          }
          .users-table-wrapper {
            display: none;
          }
          .mobile-users-list {
            display: block;
          }
          .user-modal-overlay {
            padding: 12px;
            align-items: center;
          }
          .user-modal {
            padding: 18px;
            border-radius: 11px;
          }
          .user-details-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
        }
        @media (max-width: 380px) {
          .users-header h1 {
            font-size: 21px;
          }
          .users-header p {
            font-size: 11px;
          }
          .refresh-btn {
            padding: 9px 10px;
            font-size: 11px;
          }
          .users-table-header h2 {
            font-size: 16px;
          }
          .mobile-user-card {
            padding: 14px;
          }
          .user-modal {
            padding: 15px;
          }
          .user-modal-header h2 {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}