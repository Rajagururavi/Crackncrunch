"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isProductsSection = pathname.startsWith("/admin/products") || pathname.startsWith("/admin/categories") || pathname.startsWith("/admin/brands");
  const [productsOpen, setProductsOpen] = useState(isProductsSection);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logo, setLogo] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch("/api/admin/settings", {
          method: "GET",
          cache: "no-store",
        });
        const data = await response.json();
        if (data.success && data.settings?.logo) {
          const logoPath = data.settings.logo;
          if (logoPath.startsWith("http://") || logoPath.startsWith("https://") || logoPath.startsWith("/")) {
            setLogo(logoPath);
          } else {
            setLogo(`/uploads/${logoPath}`);
          }
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
  useEffect(() => {
    if (isProductsSection) {
      setProductsOpen(true);
    }
  }, [pathname, isProductsSection]);
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      router.replace("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
    }
  };
  const navigate = (path) => {
    router.push(path);
    setMobileMenuOpen(false);
  };
  const isActive = (path) => pathname === path;
  return (
    <div className="admin-layout">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          font-family: Arial, Helvetica, sans-serif;
          background: #f5f6f8;
        }
        body {
          overflow-x: hidden;
        }
        button {
          font-family: inherit;
          -webkit-tap-highlight-color: transparent;
        }
        .admin-layout {
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
        }
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 250px;
          height: 100vh;
          height: 100dvh;
          background: #222;
          color: white;
          padding: 24px 15px;
          z-index: 1100;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          transition: transform 0.3s ease;
        }
        .logo-container {
          width: 100%;
          min-height: 75px;
          padding: 0 10px 20px;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #444;
          flex-shrink: 0;
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
          text-align: center;
        }
        .menu {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
          flex: 1;
        }
        .menu-item {
          width: 100%;
          min-height: 45px;
          padding: 12px 15px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #ccc;
          text-align: left;
          font-size: 15px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .menu-item:hover {
          background: #333;
          color: white;
        }
        .menu-item.active {
          background: white;
          color: #222;
          font-weight: 600;
        }
        .products-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .products-arrow {
          font-size: 11px;
        }
        .submenu {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 3px;
          padding-left: 12px;
        }
        .submenu-item {
          width: 100%;
          min-height: 40px;
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          background: transparent;
          color: #aaa;
          text-align: left;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
        }
        .submenu-item:hover {
          background: #333;
          color: white;
        }
        .submenu-item.active {
          background: #444;
          color: white;
        }
        .sidebar-bottom {
          width: 100%;
          margin-top: auto;
          padding-top: 25px;
          flex-shrink: 0;
        }
        .logout-button {
          width: 100%;
          min-height: 44px;
          padding: 12px;
          border: 1px solid #555;
          border-radius: 6px;
          background: transparent;
          color: white;
          cursor: pointer;
          font-size: 14px;
          transition: 0.2s;
        }
        .logout-button:hover {
          background: white;
          color: #222;
        }
        .logout-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .main-area {
          margin-left: 250px;
          min-height: 100vh;
          min-height: 100dvh;
          min-width: 0;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
        }
        .topbar {
          min-height: 70px;
          background: white;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 0 30px;
          position: sticky;
          top: 0;
          z-index: 900;
          flex-shrink: 0;
        }
        .topbar-left {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }
        .topbar-title {
          font-size: 19px;
          font-weight: 600;
          color: #222;
          white-space: nowrap;
        }
        .admin-label {
          font-size: 14px;
          color: #777;
          white-space: nowrap;
        }
        .mobile-menu-button {
          display: none;
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 7px;
          background: #f2f2f2;
          color: #222;
          font-size: 23px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .mobile-menu-button:hover {
          background: #e7e7e7;
        }
        .sidebar-close {
          display: none;
          position: absolute;
          top: 20px;
          right: 15px;
          width: 35px;
          height: 35px;
          border: none;
          border-radius: 6px;
          background: #383838;
          color: white;
          font-size: 23px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }
        .content {
          width: 100%;
          min-width: 0;
          flex: 1;
          padding: 30px;
          overflow-x: auto;
        }
        .sidebar-overlay {
          display: none;
        }
        @media (min-width: 1600px) {
          .sidebar {
            width: 270px;
          }
          .main-area {
            margin-left: 270px;
          }
          .content {
            padding: 35px 40px;
          }
        }
        @media (max-width: 1100px) and (min-width: 769px) {
          .sidebar {
            width: 220px;
            padding: 20px 12px;
          }
          .main-area {
            margin-left: 220px;
          }
          .content {
            padding: 24px;
          }
          .topbar {
            padding: 0 22px;
          }
        }
        @media (max-width: 768px) {
          .sidebar {
            width: min(290px, 85vw);
            max-width: 290px;
            padding: 22px 15px;
            padding-top: 65px;
            transform: translateX(-100%);
            box-shadow: none;
          }
          .sidebar.mobile-open {
            transform: translateX(0);
            box-shadow: 5px 0 25px rgba(0, 0, 0, 0.2);
          }
          .sidebar-close {
            display: flex;
          }
          .main-area {
            margin-left: 0;
            width: 100%;
          }
          .mobile-menu-button {
            display: flex;
          }
          .topbar {
            min-height: 64px;
            padding: 0 20px;
            gap: 10px;
          }
          .topbar-title {
            font-size: 17px;
          }
          .admin-label {
            font-size: 12px;
          }
          .content {
            padding: 22px 20px;
          }
          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 1050;
            background: rgba(0, 0, 0, 0.5);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s, visibility 0.3s;
          }
          .sidebar-overlay.visible {
            opacity: 1;
            visibility: visible;
          }
        }
        @media (max-width: 600px) {
          .topbar {
            min-height: 60px;
            padding: 0 15px;
          }
          .content {
            padding: 18px 15px;
          }
          .topbar-title {
            font-size: 16px;
          }
          .admin-label {
            font-size: 11px;
          }
        }
        @media (max-width: 430px) {
          .topbar {
            min-height: 58px;
            padding: 0 12px;
            gap: 8px;
          }
          .topbar-left {
            gap: 10px;
          }
          .mobile-menu-button {
            width: 39px;
            height: 39px;
            font-size: 21px;
          }
          .topbar-title {
            font-size: 15px;
          }
          .admin-label {
            font-size: 10px;
          }
          .content {
            padding: 15px 12px;
          }
          .sidebar {
            width: min(280px, 88vw);
          }
          .logo-image {
            max-width: 155px;
            max-height: 55px;
          }
        }
        @media (max-width: 350px) {
          .topbar {
            padding: 0 9px;
          }
          .topbar-title {
            font-size: 14px;
          }
          .admin-label {
            font-size: 9px;
          }
          .content {
            padding: 12px 9px;
          }
        }
        @media (max-width: 768px) and (orientation: landscape) {
          .sidebar {
            padding-top: 55px;
          }
          .logo-container {
            min-height: 55px;
            margin-bottom: 12px;
            padding-bottom: 12px;
          }
          .logo-image {
            max-height: 42px;
          }
          .sidebar-bottom {
            padding-top: 12px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .sidebar, .main-area, .sidebar-overlay {
            transition: none;
          }
        }
      `}</style>
      <div className={`sidebar-overlay ${mobileMenuOpen ? "visible" : ""}`} onClick={() => setMobileMenuOpen(false)}/>
      <aside className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <button className="sidebar-close" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
          ×
        </button>
        <div className="logo-container">
          {logo ? (
            <img src={logo} alt="Crack N Crunch" className="logo-image" onError={() => setLogo("")}/>
          ) : (
            <div className="logo-text">
              Crack N Crunch
            </div>
          )}
        </div>
        <nav className="menu">
          <button className={`menu-item ${isActive("/admin/dashboard") ? "active" : ""}`} onClick={() => navigate("/admin/dashboard")}>
            Dashboard
          </button>
          <button className={`menu-item products-header ${isProductsSection ? "active" : ""}`} onClick={() => setProductsOpen(!productsOpen)}>
            <span>Products</span>
            <span className="products-arrow">
              {productsOpen ? "▲" : "▼"}
            </span>
          </button>
          {productsOpen && (
            <div className="submenu">
              <button className={`submenu-item ${isActive("/admin/products") ? "active" : ""}`} onClick={() => navigate("/admin/products")}>
                Products
              </button>
              <button className={`submenu-item ${isActive("/admin/categories") ? "active" : ""}`} onClick={() => navigate("/admin/categories")}>
                Categories
              </button>
              <button className={`submenu-item ${isActive("/admin/brands") ? "active" : ""}`} onClick={() => navigate("/admin/brands")}>
                Brands
              </button>
            </div>
          )}
          <button className={`menu-item ${isActive("/admin/orders") ? "active" : ""}`} onClick={() => navigate("/admin/orders")}>
            Orders
          </button>
          <button className={`menu-item ${isActive("/admin/users") ? "active" : ""}`} onClick={() => navigate("/admin/users")}>
            Users
          </button>
          <button className={`menu-item ${isActive("/admin/settings") ? "active" : ""}`} onClick={() => navigate("/admin/settings")}>
            Settings
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button className="logout-button" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-button" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation menu" aria-expanded={mobileMenuOpen}>
              ☰
            </button>
            <span className="topbar-title">
              Admin Panel
            </span>
          </div>
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