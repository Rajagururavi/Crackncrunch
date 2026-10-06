"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [productsOpen, setProductsOpen] = useState(
    pathname.startsWith("/admin/products") ||
      pathname.startsWith("/admin/categories") ||
      pathname.startsWith("/admin/brands")
  );

  const [logo, setLogo] = useState("");

  // ==============================
  // LOAD ADMIN LOGO
  // ==============================
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch("/api/admin/settings", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (data.success && data.settings?.logo) {
          let logoPath = data.settings.logo;

          // Full URL
          if (
            logoPath.startsWith("http://") ||
            logoPath.startsWith("https://")
          ) {
            setLogo(logoPath);
            return;
          }

          // Already starts with /
          if (logoPath.startsWith("/")) {
            setLogo(logoPath);
            return;
          }

          // Only filename stored in DB
          setLogo(`/uploads/${logoPath}`);
        } else {
          setLogo("");
        }
      } catch (error) {
        console.error("Failed to load admin logo:", error);
        setLogo("");
      }
    };

    loadLogo();
  }, []);

  // ==============================
  // LOGOUT
  // ==============================
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
      });

      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isProductsSection =
    pathname.startsWith("/admin/products") ||
    pathname.startsWith("/admin/categories") ||
    pathname.startsWith("/admin/brands");

  return (
    <div className="admin-layout">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f5f5f5;
        }

        .admin-layout {
          min-height: 100vh;
        }

        /* =========================
           SIDEBAR
        ========================= */

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          width: 240px;
          height: 100vh;
          background: #222;
          color: white;
          padding: 25px 15px;
          z-index: 1000;
        }

        /* =========================
           LOGO
        ========================= */

        .logo-container {
          width: 100%;
          min-height: 70px;
          padding: 0 15px 20px;
          margin-bottom: 20px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-bottom: 1px solid #444;
        }

        .logo-image {
          display: block;
          max-width: 180px;
          max-height: 65px;
          width: auto;
          height: auto;
          object-fit: contain;
        }

        .logo-text {
          font-size: 21px;
          font-weight: 700;
          color: white;
        }

        /* =========================
           MENU
        ========================= */

        .menu {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .menu-item {
          width: 100%;
          padding: 13px 15px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #ccc;
          text-align: left;
          font-size: 15px;
          cursor: pointer;
          transition: 0.2s;
        }

        .menu-item:hover {
          background: #333;
          color: white;
        }

        .menu-item.active {
          background: white;
          color: #222;
        }

        .products-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .products-arrow {
          font-size: 12px;
        }

        .submenu {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 4px;
          padding-left: 12px;
        }

        .submenu-item {
          width: 100%;
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #aaa;
          text-align: left;
          font-size: 14px;
          cursor: pointer;
        }

        .submenu-item:hover {
          background: #333;
          color: white;
        }

        .submenu-item.active {
          background: #444;
          color: white;
        }

        /* =========================
           SIDEBAR BOTTOM
        ========================= */

        .sidebar-bottom {
          position: absolute;
          bottom: 25px;
          left: 15px;
          right: 15px;
        }

        .logout-button {
          width: 100%;
          padding: 12px;
          border: 1px solid #555;
          border-radius: 6px;
          background: transparent;
          color: white;
          cursor: pointer;
          font-size: 14px;
        }

        .logout-button:hover {
          background: white;
          color: #222;
        }

        /* =========================
           MAIN AREA
        ========================= */

        .main-area {
          margin-left: 240px;
          min-height: 100vh;
        }

        .topbar {
          height: 70px;
          background: white;
          border-bottom: 1px solid #eee;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 30px;
        }

        .topbar-title {
          font-size: 18px;
          font-weight: 600;
          color: #222;
        }

        .admin-label {
          font-size: 14px;
          color: #777;
        }

        .content {
          padding: 30px;
        }

        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 700px) {
          .sidebar {
            width: 200px;
          }

          .main-area {
            margin-left: 200px;
          }

          .content {
            padding: 20px;
          }

          .topbar {
            padding: 0 20px;
          }

          .logo-image {
            max-width: 150px;
            max-height: 55px;
          }
        }
      `}</style>

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        {/* LOGO */}
        <div className="logo-container">
          {logo ? (
            <img
              src={logo}
              alt="Crack N Crunch"
              className="logo-image"
              onError={(e) => {
                console.error("Logo image failed:", logo);
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="logo-text">
              Crack N Crunch
            </div>
          )}
        </div>

        {/* MENU */}
        <nav className="menu">

          {/* DASHBOARD */}
          <button
            className={`menu-item ${
              pathname === "/admin/dashboard" ? "active" : ""
            }`}
            onClick={() => router.push("/admin/dashboard")}
          >
            Dashboard
          </button>

          {/* PRODUCTS */}
          <button
            className={`menu-item products-header ${
              isProductsSection ? "active" : ""
            }`}
            onClick={() => setProductsOpen(!productsOpen)}
          >
            <span>Products</span>

            <span className="products-arrow">
              {productsOpen ? "▲" : "▼"}
            </span>
          </button>

          {/* SUBMENU */}
          {productsOpen && (
            <div className="submenu">

              <button
                className={`submenu-item ${
                  pathname === "/admin/products" ? "active" : ""
                }`}
                onClick={() => router.push("/admin/products")}
              >
                Products
              </button>

              <button
                className={`submenu-item ${
                  pathname === "/admin/categories" ? "active" : ""
                }`}
                onClick={() => router.push("/admin/categories")}
              >
                Categories
              </button>

              <button
                className={`submenu-item ${
                  pathname === "/admin/brands" ? "active" : ""
                }`}
                onClick={() => router.push("/admin/brands")}
              >
                Brands
              </button>

            </div>
          )}

          {/* ORDERS */}
          <button
            className={`menu-item ${
              pathname === "/admin/orders" ? "active" : ""
            }`}
            onClick={() => router.push("/admin/orders")}
          >
            Orders
          </button>

          {/* USERS */}
          <button
            className={`menu-item ${
              pathname === "/admin/users" ? "active" : ""
            }`}
            onClick={() => router.push("/admin/users")}
          >
            Users
          </button>

          {/* SETTINGS */}
          <button
            className={`menu-item ${
              pathname === "/admin/settings" ? "active" : ""
            }`}
            onClick={() => router.push("/admin/settings")}
          >
            Settings
          </button>

        </nav>

        {/* LOGOUT */}
        <div className="sidebar-bottom">
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </aside>

      {/* =========================
          MAIN AREA
      ========================= */}

      <div className="main-area">

        <header className="topbar">
          <span className="topbar-title">
            Admin Panel
          </span>

          <span className="admin-label">
            Administrator
          </span>
        </header>

        <main className="content">
          {children}
        </main>

      </div>
    </div>
  );
}