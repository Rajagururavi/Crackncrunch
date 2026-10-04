"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
export default function Header() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [passwordShow, setPasswordShow] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileNutsOpen, setMobileNutsOpen] = useState(false);
  const [mobileDatesOpen, setMobileDatesOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  useEffect(() => {
  const shouldOpenCart = sessionStorage.getItem("openCartAfterRefresh");
    if (shouldOpenCart === "true") {
      sessionStorage.removeItem("openCartAfterRefresh");
      setTimeout(() => {
        setCartOpen(true);
      }, 300);
    }
  }, []);
  const [cart, setCart] = useState([]);
  const [fullName, setFullName] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settings, setSettings] = useState({
    logo: "",
    phone: "",
    email: "",
    address: "",
  });
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings", {
          cache: "no-store",
        });
        const data = await response.json();
        console.log("Header settings:", data);
        if (data.success && data.settings) {
          setSettings({
            logo: data.settings.logo || "",
            phone: data.settings.phone || "",
            email: data.settings.email || "",
            address: data.settings.address || "",
          });
        }
      } catch (error) {
        console.error("Header settings error:", error);
      }
    };
    loadSettings();
  }, []);
  useEffect(() => {
  const timer = setTimeout(() => {
    try {
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      }

      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        const user = JSON.parse(savedUser);

        if (user?.logged_in) {
          setLoggedIn(true);
          setFullName(user.full_name || "");
        }
      }
    } catch (error) {
      console.error("Header storage error:", error);
    }
  }, 0);

  return () => clearTimeout(timer);
}, []);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMessage("");
    setLoginLoading(true);
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setLoginMessage(
          data.message || "Invalid email or password."
        );
        return;
      }
      localStorage.setItem(
        "user",
        JSON.stringify({
          logged_in: true,
          id: data.user.id,
          full_name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || "",
        })
      );
      setLoggedIn(true);
      setFullName(data.user.name || "User");
      setLoginOpen(false);
      setLoginEmail("");
      setLoginPassword("");
      setLoginMessage("");
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      setLoginMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoginLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem("user");
    setLoggedIn(false);
    setFullName("");
    setUserMenuOpen(false);
    window.location.href = "/";
  };
  const searchProducts = async (value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearchOpen(true);
    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(value)}`
      );
      const data = await response.json();
      console.log("Search products:", data);
      if (data.success) {
        setSearchResults(data.products || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Product search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    setSearchOpen(false);
    window.location.href = `/shop?search=${encodeURIComponent(
      searchQuery.trim()
    )}`;
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-box")) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  const cartCount = cart.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const cartTotal = cart.reduce((total, item) => total + Number(item.final_price || 0), 0);
  const removeCartItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };
  const closeMobileMenu = () => {setMobileMenuOpen(false);};
  const phoneNumber = settings.phone || "+91 97518 11222";
  const whatsappNumber = phoneNumber.replace(/\D/g, "") || "919751811222";
  const getProductImage = (product) => {
    if (!product) {
      return null;
    }
    if (!Array.isArray(product.images) || product.images.length === 0) {
      return null;
    }
    const image = product.images[0];
    if (!image) {
      return null;
    }
    if (image.startsWith("data:")) {
      return image;
    }
    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/")
    ) {
      return image;
    }
    return image;
  };
  const getOriginalPrice = (product) => {return Number(product?.price || product?.mrp || product?.regular_price || product?.original_price || 0);};
  const getOfferPrice = (product) => {
    return Number(product?.offerPrice || product?.offer_price || product?.final_price || product?.sale_price || product?.selling_price || 0);
  };
  return (
    <>
      <div className="top-navbar">
        <div className="scroll-text">
          <marquee>
            Nuts • Dry Fruits • Dates • Seeds • Berries •
            Mixes • Flavoured Nuts • Combos • Premium •
            Powders • Hampers
          </marquee>
        </div>
        <div className="auth-links">
          {loggedIn ? (
            <div className="user-menu">
              <button className="user-btn" type="button" onClick={() => setUserMenuOpen(!userMenuOpen)}>{fullName || "User"}<i className="fa fa-angle-down"></i></button>
              <div className={`user-dropdown ${userMenuOpen ? "show" : "" }`} >
                <Link href="/my_profile" onClick={() => setUserMenuOpen(false)}><i className="fa fa-user"></i>My Profile</Link>
                <button type="button" className="logout-button" onClick={logout}><i className="fa fa-sign-out"></i>Logout</button>
              </div>
            </div>
          ) : (
            <div className="login-wrapper">
              <a href="#" onClick={(e) => {e.preventDefault(); setLoginOpen(!loginOpen); setLoginMessage("");}}>LOGIN / REGISTER</a>
              <div className={`login-dropdown ${loginOpen ? "show" : "" }`} >
                <div className="top-links">
                  <span>Sign In</span>
                  <Link href="/register">Create an Account</Link>
                </div>
                <hr className="divider" />
                <form onSubmit={handleLogin}>
                  <input type="email" name="email" placeholder="Enter your Email ID" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} autoComplete="off" required />
                  <div className="password-box">
                    <input type={passwordShow ? "text" : "password"} name="password" placeholder="Password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value) } autoComplete="off" required />
                    <i className={passwordShow ? "fa fa-eye-slash" : "fa fa-eye" } onClick={() => setPasswordShow(!passwordShow)}></i>
                  </div>
                  {loginMessage && (<div className="login-message">
                    {loginMessage}
                  </div>)}
                  <button type="submit" className="login-btn" disabled={loginLoading} >
                    {loginLoading ? "LOGIN..." : "LOGIN"}
                  </button>
                </form>
                <div className="bottom-links">
                  <label className="remember">
                    <input type="checkbox" name="remember" />
                    <span>Remember me</span>
                  </label>
                  <a href="#">Lost Your Password?</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="main-navbar">
        <div className="nav-container">
          <div className="menu-toggle" onClick={() => setMobileMenuOpen(true) } > 
            <i className="fa fa-bars"></i>
          </div>
          <div className="logo">
            <Link href="/">
              <img src={settings.logo || "/uploads/1.png" } alt="Crack n Crunch" />
            </Link>
          </div>
          <div className="menu">
            <Link href="/">HOME</Link>
            <Link href="/about">ABOUTUS</Link>
            <div className="dropdown-menu-custom">
              <a href="#" className="main-drop-btn" onClick={(e) => e.preventDefault()}>OUR PRODUCTS</a>
              <div className="dropdown-content">
                <div className="sub-dropdown">
                  <a href="#" onClick={(e) => e.preventDefault()}>Nuts<i className="fa fa-angle-right"></i></a>
                  <div className="sub-dropdown-content">
                    <Link href="/shop?category=Almonds">Almonds</Link>
                    <Link href="/shop?category=Cashews">Cashews</Link>
                    <Link href="/shop?category=Pistachios">Pistachios</Link>
                    <Link href="/shop?category=Walnuts">Walnuts</Link>
                  </div>
                </div>
                <div className="sub-dropdown">
                  <a href="#" onClick={(e) => e.preventDefault()}>Dates<i className="fa fa-angle-right"></i></a>
                  <div className="sub-dropdown-content">
                    <Link href="/shop?category=Premium%20Dates">Premium Dates</Link>
                    <Link href="/shop?category=Dry%20Dates">Dry Dates</Link>
                  </div>
                </div>
                <Link href="/shop?category=Dry%20Fruits">Dry Fruits</Link>
                <Link href="/shop?category=Seeds">Seeds</Link>
                <Link href="/shop?category=Berries">Berries</Link>
                <Link href="/shop?category=Mixes%20and%20Snacking">Mixes & Snacking</Link>
                <Link href="/shop?category=Flavoured%20Nuts">Flavoured Nuts</Link>
                <Link href="/shop?category=Combos%20and%20Gift%20Packs">Combos & Gift Packs</Link>
                <Link href="/shop?category=Jumbo%20and%20Premium">Jumbo & Premium</Link>
                <Link href="/shop?category=Powders">Powders</Link>
                <Link href="/shop?category=Bulk%2FWholesale">Bulk / Wholesale</Link>
                <Link href="/shop?category=Hambers">Hambers</Link>
              </div>
            </div>
            <Link href="/shop">SHOP</Link>
            <Link href="/contact">CONTACT US</Link>
            <Link href="#">BLOGS</Link>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">BUY WHOLESALE</a>
          </div>
          <div className="right-section">
            <form className="search-box" onSubmit={handleSearchSubmit}>
              <input type="text" value={searchQuery} placeholder="Search" onChange={(e) => searchProducts(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setSearchOpen(true);
                  }
                }}
              />
              <button type="submit" className="search-submit">
                <i className="fa fa-search"></i>
              </button>
              {searchOpen && searchQuery.trim() && (
                <div className="search-results">
                  {searchLoading && (
                    <div className="search-message">
                      Searching...
                    </div>
                  )}
                  {!searchLoading && searchResults.length === 0 && (
                    <div className="search-message">
                      No products found
                    </div>
                  )}
                  {!searchLoading && searchResults.map((product) => {
                    const originalPrice = getOriginalPrice(product);
                    const offerPrice = getOfferPrice(product);
                    const hasOffer = offerPrice > 0 && originalPrice > 0 && offerPrice < originalPrice;
                    return (
                      <Link key={product._id} href={`/shop?search=${encodeURIComponent(searchQuery)}`} className="search-product" onClick={() => {setSearchOpen(false); setSearchQuery(""); }}>
                        <div className="search-product-image">
                          {getProductImage(product) && (
                            <img src={getProductImage(product)} alt={product.productName || "Product"} onError={(e) => {e.currentTarget.style.display = "none";}} />
                          )}
                        </div>
                        <div className="search-product-info">
                          <div className="search-product-name">
                            {product.productName || "Product"}
                          </div>
                          <div className="search-product-price">
                            {hasOffer ? (
                              <>
                                <span className="old-price">₹{originalPrice.toFixed(2)}</span>
                                <span className="offer-price">₹{offerPrice.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="offer-price">₹{(offerPrice || originalPrice || 0).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                  {!searchLoading && searchResults.length > 0 && (
                    <Link href={`/shop?search=${encodeURIComponent(searchQuery)}`} className="view-all-search" onClick={() => {setSearchOpen(false); setSearchQuery(""); }} >View all results → </Link>
                  )}
                </div>
              )}
            </form>
            <div className="cart">
              <button className="open-cart-btn" onClick={() => setCartOpen(true)}>
                <i className="fa fa-shopping-cart"></i>
                {cartCount > 0 && (<span className="cart-count">{cartCount}</span>)}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className={`mobile-menu ${mobileMenuOpen ? "active" : ""}`}>
        <div className="close-btn" onClick={closeMobileMenu}>
          <i className="fa fa-times"></i>
        </div>
        <div className="mobile-links">
          <Link href="/" onClick={closeMobileMenu}>HOME </Link>
          <Link href="/about" onClick={closeMobileMenu}>ABOUTUS</Link>
          <div className={`mobile-dropdown ${mobileProductsOpen ? "active" : "" }`}>
            <a href="#" className="mobile-drop-btn" onClick={(e) => {e.preventDefault(); setMobileProductsOpen(!mobileProductsOpen);}}>OUR PRODUCTS<i className="fa fa-angle-down"></i></a>
            <div className="mobile-dropdown-content">
              <div className={`mobile-sub-dropdown ${mobileNutsOpen ? "active" : ""}`}>
                <a href="#" className="mobile-sub-btn" onClick={(e) => {e.preventDefault(); setMobileNutsOpen(!mobileNutsOpen);}}>Nuts<i className="fa fa-angle-down"></i></a>
                <div className="mobile-sub-content">
                  <Link href="/shop?category=Almonds" onClick={closeMobileMenu}>Almonds</Link>
                  <Link href="/shop?category=Cashews" onClick={closeMobileMenu}>Cashews</Link>
                  <Link href="/shop?category=Pistachios" onClick={closeMobileMenu}>Pistachios</Link>
                  <Link href="/shop?category=Walnuts" onClick={closeMobileMenu}>Walnuts</Link>
                </div>
              </div>
              <div className={`mobile-sub-dropdown ${mobileDatesOpen ? "active" : "" }`}>
                <a href="#" className="mobile-sub-btn" onClick={(e) => {e.preventDefault(); setMobileDatesOpen(!mobileDatesOpen);}}>Dates<i className="fa fa-angle-down"></i></a>
                <div className="mobile-sub-content">
                  <Link href="/shop?category=Premium%20Dates" onClick={closeMobileMenu}>Premium Dates</Link>
                  <Link href="/shop?category=Dry%20Dates" onClick={closeMobileMenu}>Dry Dates</Link>
                </div>
              </div>
              <Link href="/shop?category=Dry%20Fruits" onClick={closeMobileMenu}>Dry Fruits</Link>
              <Link href="/shop?category=Seeds" onClick={closeMobileMenu}>Seeds</Link>
              <Link href="/shop?category=Berries" onClick={closeMobileMenu}>Berries</Link>
              <Link href="/shop?category=Mixes%20and%20Snacking" onClick={closeMobileMenu}>Mixes & Snacking</Link>
              <Link href="/shop?category=Flavoured%20Nuts" onClick={closeMobileMenu}>Flavoured Nuts</Link>
              <Link href="/shop?category=Combos%20and%20Gift%20Packs" onClick={closeMobileMenu}>Combos & Gift Packs</Link>
              <Link href="/shop?category=Jumbo%20and%20Premium" onClick={closeMobileMenu}>Jumbo & Premium</Link>
              <Link href="/shop?category=Powders" onClick={closeMobileMenu}>Powders</Link>
              <Link href="/shop?category=Bulk%2FWholesale" onClick={closeMobileMenu}>Bulk / Wholesale</Link>
              <Link href="/shop?category=Hambers"onClick={closeMobileMenu}>Hambers</Link>
            </div>
          </div>
          <Link href="/shop" onClick={closeMobileMenu}>SHOP</Link>
          <Link href="/contact" onClick={closeMobileMenu}>CONTACT US</Link>
          <Link href="#">BLOGS</Link>
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">BUY WHOLESALE</a>
        </div>
        <div className="mobile-login">
          {loggedIn ? (
            <button type="button" onClick={logout}><i className="fa fa-sign-out"></i>LOGOUT</button>
          ) : (
            <a href="#" onClick={(e) => {e.preventDefault(); setMobileMenuOpen(false); setLoginOpen(true);}}><i className="fa fa-user"></i>LOGIN / REGISTER</a>
          )}
        </div>
      </div> 
      <div className="floating-contact">
        <div className="contact-text-box">Contact Us</div>
        <div className="main-contact-btn" onClick={() => setContactOpen(!contactOpen)}>
          <i className="fa fa-message"></i>
        </div>
        <div className={`contact-items ${contactOpen ? "active" : "" }`}>
          <a href={`tel:${phoneNumber}`} className="contact-btn phone-btn"><i className="fa fa-phone"></i></a>
          <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="contact-btn whatsapp-btn"><i className="fa-brands fa-whatsapp"></i></a>
          <a href="https://www.instagram.com/crackxcrunch?stkn=aHpydjZlczh0YnNy" target="_blank" rel="noopener noreferrer" className="contact-btn instagram-btn"><i className="fa-brands fa-instagram"></i></a>
        </div>
      </div>
      <div className={`cart-overlay ${cartOpen ? "show" : "" }`} onClick={() => setCartOpen(false)}></div>
      <div className={`cart-popup ${cartOpen ? "show" : "" }`}>
        <div className="cart-header">
          <h3>Shopping Cart</h3>
          <span className="cart-close-btn" onClick={() => setCartOpen(false)}>×</span>
        </div>
        <div className="cart-body">
          {cart.length > 0 ? (
            <>
              {cart.map((item, index) => (
                <div className="cart-item" key={index}>
                  <img src={item.product_image} alt={item.product_title || "Product"} />
                  <div className="cart-info">
                    <h4>{item.product_title}</h4>
                    <p>Weight : {item.weight}</p>
                    <p>Quantity : {item.quantity}</p>
                    <strong>₹{item.final_price}</strong>
                    <button type="button" className="remove-btn" onClick={() => removeCartItem(index)}>Remove</button>
                  </div>
                </div>
              ))}
              <div className="cart-total">
                <h3>
                  <span>Total</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </h3>
                <Link href="/cart" className="view-cart-btn" onClick={() => setCartOpen(false)}>View Cart</Link>
                <Link href="/checkout" className="checkout-btn" onClick={() => setCartOpen(false)}>Checkout</Link>
              </div>
            </>
          ) : (
            <div className="empty-cart">
              <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="Empty Cart" />
              <h2>Your Cart Is Empty</h2>
              <p>Add products to your cart and they will appear here.</p>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: #f5f5f5;
        }
        a {
          text-decoration: none;
        }
        .top-navbar {
          background: #f5deb3;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 9999;
        }
        .scroll-text {
          width: 80%;
          text-align: center;
        }
        .scroll-text marquee {
          color: #fff;
          font-size: 15px;
          font-weight: 600;
        }
        .auth-links {
          position: absolute;
          right: 20px;
        }
        .auth-links > a, .login-wrapper > a {
          color: #000;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }
        .login-wrapper {
          position: relative;
        }
        .login-dropdown {
          position: absolute;
          top: 45px;
          right: 0;
          width: 330px;
          background: #fff;
          padding: 25px;
          border-radius: 10px;
          display: none;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          z-index: 99999;
        }
        .login-dropdown.show {
          display: block;
        }
        .top-links {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
        }
        .top-links span {
          color: #222;
        }
        .top-links a {
          color: #333;
          font-size: 13px;
          text-decoration: none;
        }
        .top-links a:hover {
          text-decoration: underline;
        }
        .divider {
          margin: 10px 0 15px;
        }
        .login-dropdown input {
          width: 100%;
          padding: 10px;
          margin-bottom: 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          outline: none;
        }
        .login-dropdown input[type="email"] {
          width: 100%;
          height: 45px;
          padding: 0 14px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: #fff;
          color: #222;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          margin-bottom: 12px;
        }
        .login-dropdown input[type="email"]::placeholder {
          color: #999;
          opacity: 1;
        }
        .login-dropdown input[type="email"]:focus {
          border-color: #d32f2f;
          box-shadow: 0 0 0 2px rgba(211, 47, 47, 0.08);
        }
        .login-dropdown input[type="email"]:hover {
          border-color: #bbb;
        }
        .password-box {
          position: relative;
          color: #000;
        }
        .password-box i {
          position: absolute;
          right: 10px;
          top: 12px;
          cursor: pointer;
          color: #555;
        }
        .login-btn {
          width: 100%;
          padding: 10px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .login-btn:hover {
          background: #222;
        }
        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .login-message {
          width: 100%;
          margin: 2px 0 12px;
          padding: 9px 10px;
          background: #ffeaea;
          color: #d32f2f;
          border-radius: 5px;
          font-size: 13px;
          text-align: center;
        }
        .bottom-links {
          margin-top: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .remember {
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          font-size: 13px;
          color: #555;
        }
        .remember input {
          width: 14px;
          height: 14px;
          margin: 0;
        }
        .bottom-links a {
          font-size: 13px;
          color: #555;
          text-decoration: none;
        }
        .bottom-links a:hover {
          text-decoration: underline;
        }
        .user-menu {
          position: relative;
          display: inline-block;
        }
        .user-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .user-btn i {
          font-size: 16px;
        }
        .user-dropdown {
          display: none;
          position: absolute;
          top: 42px;
          right: 0;
          width: 200px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          z-index: 9999;
        }
        .user-dropdown.show {
          display: block;
        }
        .user-dropdown a, .logout-button {
          display: block;
          width: 100%;
          padding: 12px 15px;
          color: #333;
          text-decoration: none;
          font-size: 14px;
          text-align: left;
          border: none;
          background: #fff;
          cursor: pointer;
        }
        .user-dropdown a i, .logout-button i {
          width: 20px;
          margin-right: 5px;
        }
        .user-dropdown a:hover, .logout-button:hover {
          background: #f5f5f5;
        }
        .main-navbar {
          background: #000;
          padding: 0;
          position: fixed;
          top: 45px;
          left: 0;
          width: 100%;
          z-index: 9998;
        }
        .nav-container {
          width: 100%;
          max-width: 1200px;
          margin: auto;
          padding: 0 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          min-height: 75px;
        }
        .logo {
          flex-shrink: 0;
        }
        .logo img {
          width: 150px;
          height: 100px;
          object-fit: contain;
          display: block;
          margin-left: -20px;
        }
        .menu {
          display: flex;
          align-items: center;
          flex: 1;
          justify-content: center;
        }
        .menu > a, .main-drop-btn {
          color: #fff;
          margin: 0 10px;
          text-decoration: none;
          font-size: 14px;
          transition: 0.3s;
          white-space: nowrap;
        }
        .menu > a:hover, .main-drop-btn:hover {
          color: #f5deb3;
        }
        .dropdown-menu-custom {
          position: relative;
        }
        .main-drop-btn {
          color: #fff;
          text-decoration: none;
          padding: 10px;
          display: flex;
          align-items: center;
        }
        .dropdown-content {
          position: absolute;
          top: 100%;
          left: 0;
          background: #fff;
          min-width: 240px;
          display: none;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
          border-radius: 8px;
          z-index: 9999;
        }
        .dropdown-menu-custom:hover
          .dropdown-content {
          display: block;
        }
        .dropdown-content a {
          color: #000 !important;
          padding: 12px 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-decoration: none;
          border-bottom: 1px solid #eee;
          margin: 0 !important;
        }
        .dropdown-content a:hover {
          background: #f5f5f5;
          color: #00bcd4 !important;
        }
        .sub-dropdown {
          position: relative;
        }
        .sub-dropdown-content {
          position: absolute;
          top: 0;
          left: 100%;
          background: #fff;
          min-width: 200px;
          display: none;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
          border-radius: 8px;
        }
        .sub-dropdown:hover
          .sub-dropdown-content {
          display: block;
        }
        .sub-dropdown > a {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .right-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .search-box {
          position: relative;
        }
        .search-box input {
          width: 150px;
          padding: 7px 35px 7px 12px;
          border-radius: 25px;
          border: 2px solid white;
          outline: none;
          color: #222;
          background: #fff;
        }
        .search-box input::placeholder {
          color: #777;
        }
        .search-submit {
          position: absolute;
          right: 5px;
          top: 5px;
          width: 30px;
          height: 30px;
          border: none;
          background: transparent;
          padding: 0;
          color: #555;
          cursor: pointer;
          z-index: 2;
        }
        .search-submit i {
          position: static;
          color: #555;
          cursor: pointer;
        }
        .search-results {
          position: absolute;
          top: 42px;
          right: 0;
          width: 320px;
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
          border: 1px solid #eee;
          z-index: 999999;
        }
        .search-message {
          padding: 18px;
          text-align: center;
          color: #777;
          font-size: 14px;
          background: #fff;
        }
        .search-product {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: #fff;
          border-bottom: 1px solid #eee;
          text-decoration: none;
          transition: 0.2s;
        }
        .search-product:hover {
          background: #f8f5ef;
        }
        .search-product-image {
          width: 55px;
          height: 55px;
          flex-shrink: 0;
          border-radius: 6px;
          overflow: hidden;
          background: #f5f5f5;
        }
        .search-product-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .search-product-info {
          flex: 1;
          min-width: 0;
        }
        .search-product-name {
          color: #222;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .search-product-price {
          color: #1a8f3c;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .old-price {
          color: #999;
          text-decoration: line-through;
          font-size: 12px;
          font-weight: 400;
        }
        .offer-price {
          color: #1a8f3c;
          font-size: 14px;
          font-weight: 700;
        }
        .view-all-search {
          display: block;
          padding: 13px;
          text-align: center;
          background: #f5deb3;
          color: #222;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }
        .view-all-search:hover {
          background: #e8cfa0;
        }
        .cart {
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .open-cart-btn {
          position: relative;
          background: transparent;
          color: #fff;
          border: none;
          cursor: pointer;
          padding: 0;
          font-size: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .cart-count {
          position: absolute;
          top: -8px;
          right: -10px;
          min-width: 18px;
          height: 18px;
          padding: 0 4px;
          background: #ff0000;
          color: #fff;
          border-radius: 50%;
          font-size: 11px;
          font-weight: 700;
          line-height: 18px;
          text-align: center;
          border: 2px solid #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .menu-toggle {
          display: none;
          color: #fff;
          font-size: 25px;
          cursor: pointer;
        }
        .mobile-menu {
          position: fixed;
          top: 0;
          left: -100%;
          width: 70%;
          height: 100vh;
          background: #111;
          z-index: 999999;
          padding: 25px;
          transition: 0.4s;
          overflow-y: auto;
        }
        .mobile-menu.active {
          left: 0;
        }
        .mobile-menu .close-btn {
          text-align: right;
          margin-bottom: 25px;
        }
        .mobile-menu .close-btn i {
          color: #fff;
          font-size: 28px;
          cursor: pointer;
        }
        .mobile-links a {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
          text-decoration: none;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 15px;
        }
        .mobile-links a:hover {
          color: #f5deb3;
        }
        .mobile-login {
          margin-top: 25px;
        }
        .mobile-login a, .mobile-login button {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          text-decoration: none;
          font-size: 15px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .mobile-dropdown-content {
          display: none;
          background: #1a1a1a;
        }
        .mobile-dropdown.active
          .mobile-dropdown-content {
          display: block;
        }
        .mobile-dropdown-content a {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #fff;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          text-decoration: none;
          font-size: 14px;
        }
        .mobile-sub-btn {
          display: flex !important;
          justify-content: space-between;
          align-items: center;
        }
        .mobile-sub-content {
          display: none;
          background: #2a2a2a;
        }
        .mobile-sub-dropdown.active
          .mobile-sub-content {
          display: block;
        }
        .mobile-sub-content a {
          padding-left: 35px !important;
          font-size: 13px;
          color: #ddd !important;
        }
        .floating-contact {
          position: fixed;
          right: 20px;
          bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 999999;
        }
        .contact-text-box {
          background: #fff;
          color: #333;
          font-size: 14px;
          font-weight: 600;
          padding: 10px 14px;
          border-radius: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          white-space: nowrap;
        }
        .main-contact-btn {
          width: 50px;
          height: 50px;
          background: #000;
          color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.25);
          transition: 0.3s;
        }
        .main-contact-btn i {
          font-size: 18px;
        }
        .main-contact-btn:hover {
          transform: scale(1.1);
          background: #222;
        }
        .contact-items {
          position: absolute;
          bottom: 65px;
          right: 0;
          display: none;
          flex-direction: column;
          gap: 12px;
        }
        .contact-items.active {
          display: flex;
        }
        .contact-btn {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
          transition: 0.3s;
        }
        .contact-btn i {
          color: #fff;
          font-size: 22px;
        }
        .contact-btn:hover {
          transform: translateY(-5px);
        }
        .phone-btn {
          background: #2196f3;
        }
        .whatsapp-btn {
          background: #25d366;
        }
        .instagram-btn {
          background: #e1306c;
        }
        .cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(4px);
          opacity: 0;
          visibility: hidden;
          transition: 0.3s;
          z-index: 9998;
        }
        .cart-overlay.show {
          opacity: 1;
          visibility: visible;
        }
        .cart-popup {
          position: fixed;
          top: 0;
          right: -430px;
          width: 400px;
          height: 100vh;
          background: #fff;
          z-index: 9999;
          transition: 0.4s ease;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
        }
        .cart-popup.show {
          right: 0;
        }
        .cart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #ececec;
        }
        .cart-header h3 {
          margin: 0;
          font-size: 22px;
          font-weight: 600;
        }
        .cart-close-btn {
          font-size: 30px;
          cursor: pointer;
          transition: 0.3s;
        }
        .cart-close-btn:hover {
          color: red;
        }
        .cart-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        .cart-body::-webkit-scrollbar {
          width: 6px;
        }
        .cart-body::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 20px;
        }
        .cart-item {
          display: flex;
          gap: 15px;
          margin-bottom: 18px;
          padding-bottom: 18px;
          border-bottom: 1px solid #eee;
        }
        .cart-item img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid #eee;
          flex-shrink: 0;
        }
        .cart-info {
          flex: 1;
        }
        .cart-info h4 {
          margin: 0 0 8px;
          font-size: 16px;
          color: #222;
        }
        .cart-info p {
          margin: 4px 0;
          color: #666;
          font-size: 14px;
        }
        .cart-info strong {
          display: block;
          margin-top: 8px;
          color: #1a8f3c;
          font-size: 18px;
        }
        .remove-btn {
          display: inline-block;
          margin-top: 10px;
          color: #ff3b30;
          font-size: 13px;
          text-decoration: none;
          font-weight: 600;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .remove-btn:hover {
          text-decoration: underline;
        }
        .cart-total {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
        }
        .cart-total h3 {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0 0 20px;
          font-size: 20px;
          font-weight: 600;
          color: #222;
        }
        .view-cart-btn, .checkout-btn {
          display: block;
          width: 100%;
          text-align: center;
          text-decoration: none;
          padding: 14px 15px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          transition: 0.3s;
        }
        .view-cart-btn {
          background: #fff;
          color: #222;
          border: 2px solid #222;
          margin-bottom: 12px;
        }
        .view-cart-btn:hover {
          background: #222;
          color: #fff;
        }
        .checkout-btn {
          background: #1a8f3c;
          color: #fff;
          border: 2px solid #1a8f3c;
        }
        .checkout-btn:hover {
          background: #146b2c;
          border-color: #146b2c;
        }
        .empty-cart {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .empty-cart img {
          width: 120px;
          margin-bottom: 20px;
        }
        .empty-cart h2 {
          margin: 0 0 10px;
        }
        .empty-cart p {
          color: #777;
          line-height: 24px;
        }
        @media screen and (max-width: 1100px) {
          .nav-container {
            max-width: 100%;
            padding: 0 20px;
          }
          .logo img {
              width: 125px;
              height: 80px;
              margin-left: 0;
          }
          .menu > a, .main-drop-btn {
              margin: 0 6px;
              font-size: 13px;
          }
          .search-box input {
              width: 120px;
          }
          .right-section {
              gap: 10px;
          }
        }
        @media screen and (max-width: 768px) {
          html, body {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
          }
          .top-navbar {
            height: 42px;
            padding: 0 12px;
          }
          .scroll-text {
            width: calc(100% - 55px);
            margin-right: 45px;
          }
          .scroll-text marquee {
            font-size: 11px;
            line-height: 42px;
          }
          .auth-links {
            right: 10px;
            display: flex;
            align-items: center;
          }
          .auth-links > a {
            width: 31px;
            height: 31px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
            border-radius: 50%;
            font-size: 0;
          }
          .auth-links > a::before {
            content: "\f007";
            font-family: "Font Awesome 6 Free";
            font-weight: 900;
            font-size: 14px;
            color: #111;
          }
          .main-navbar {
            top: 42px;
            height: 68px;
          }
          .nav-container {
            width: 100%;
            height: 68px;
            min-height: 68px;
            padding: 0 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .logo {
            flex: 1;
            min-width: 0;
            display: flex;
            align-items: center;
          }
          .logo img {
            width: 105px;
            height: 60px;
            margin-left: 150px;
            object-fit: contain;
          }
          .menu {
            display: none !important;
          }
          .search-box {
            display: none !important;
          }
          .right-section {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 13px;
            flex-shrink: 0;
          }
          .user-btn {
            width: 34px;
            height: 34px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
            border-radius: 50%;
            font-size: 0;
          }
          .user-btn i {
            font-size: 15px;
            color: #111;
          }
          .cart {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .open-cart-btn {
            font-size: 25px;
            width: 30px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .cart-count {
            top: -5px;
            right: -7px;
            min-width: 17px;
            height: 17px;
            padding: 0 4px;
            font-size: 9px;
            line-height: 17px;
            border-width: 1px;
          }
          .menu-toggle {
            display: flex;
            width: 36px;
            height: 36px;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 25px;
            cursor: pointer;
            flex-shrink: 0;
          }
          .mobile-menu {
            position: fixed;
            top: 0;
            left: 0;
            width: min(360px, 88vw);
            height: 100dvh;
            padding: 20px;
            background: #111;
            transform: translateX(-105%);
            transition: transform 0.35s cubic-bezier(.4,0,.2,1);
            overflow-y: auto;
            overflow-x: hidden;
            z-index: 999999;
          }
          .mobile-menu.active {
            left: 0;
            transform: translateX(0);
          }
          .mobile-menu .close-btn {
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-bottom: 15px;
          }
          .mobile-menu .close-btn i {
            font-size: 25px;
            color: #fff;
          }
          .mobile-links {
            width: 100%;
          }
          .mobile-links a {
            width: 100%;
            min-height: 48px;
            padding: 13px 4px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #fff;
            font-size: 15px;
            line-height: 1.4;
            border-bottom: 1px solid rgba(255,255,255,.10);
          }
          .mobile-links a:active {
            background: rgba(255,255,255,.05);
          }
          .mobile-dropdown-content {
            width: 100%;
          }
          .mobile-dropdown-content a {
            min-height: 44px;
            padding: 12px 14px;
            font-size: 14px;
            background: #181818;
          }
          .mobile-sub-content {
            width: 100%;
          }
          .mobile-sub-content a {
            min-height: 42px;
            padding: 11px 15px 11px 32px !important;
            font-size: 13px;
            color: #ddd !important;
            background: #222;
          }
          .cart-popup {
            width: min(420px, 94vw);
            max-width: 94vw;
          }
          .cart-header {
            padding: 18px;
          }
          .cart-header h3 {
            font-size: 20px;
          }
          .cart-body {
            padding: 18px;
          }
          .floating-contact {
            right: 14px;
            bottom: 14px;
          }
          .contact-text-box {
            font-size: 12px;
            padding: 8px 11px;
          }
          .main-contact-btn {
            width: 48px;
            height: 48px;
          }
          .contact-btn {
            width: 48px;
            height: 48px;
          }
        }
        @media screen and (max-width: 600px) {
          .top-navbar {
            height: 40px;
          }
          .scroll-text {
            width: calc(100% - 50px);
            margin-right: 40px;
          }
          .scroll-text marquee {
            font-size: 10px;
            line-height: 40px;
          }
          .main-navbar {
            top: 40px;
            height: 64px;
          }
          .nav-container {
            height: 64px;
            min-height: 64px;
            padding: 0 12px;
          }
          .logo img {
            width: 95px;
            height: 56px;
          }
          .right-section {
            gap: 10px;
          }
          .user-btn {
            width: 32px;
            height: 32px;
          }
          .open-cart-btn {
            font-size: 23px;
          }
          .menu-toggle {
            width: 34px;
            height: 34px;
            font-size: 23px;
          }
          .cart-count {
            min-width: 16px;
            height: 16px;
            font-size: 8px;
            line-height: 16px;
          }
          .cart-popup {
            width: 100%;
            max-width: 100%;
            right: -100%;
          }
          .cart-popup.show {
            right: 0;
          }
          .cart-header {
            padding: 15px;
          }
          .cart-body {
            padding: 15px;
          }
          .cart-item {
            gap: 10px;
          }
          .cart-item img {
            width: 65px;
            height: 65px;
          }
          .cart-info h4 {
            font-size: 14px;
          }
          .cart-info p {
            font-size: 12px;
          }
          .cart-info strong {
            font-size: 16px;
          }
          .view-cart-btn, .checkout-btn {
            padding: 13px;
            font-size: 14px;
          }
          .contact-text-box {
            display: none;
          }
          .main-contact-btn {
            width: 46px;
            height: 46px;
          }
          .contact-btn {
            width: 46px;
            height: 46px;
          }
        }
        @media screen and (max-width: 480px) {
          .top-navbar {
            height: 38px;
          }
          .scroll-text {
            width: calc(100% - 48px);
          }
          .scroll-text marquee {
            font-size: 9px;
            line-height: 38px;
          }
          .auth-links {
            right: 6px;
          }
          .auth-links > a {
            width: 28px;
            height: 28px;
          }
          .auth-links > a::before {
            font-size: 12px;
          }
          .main-navbar {
            top: 38px;
            height: 60px;
          }
          .nav-container {
            height: 60px;
            min-height: 60px;
            padding: 0 10px;
          }
          .logo img {
            width: 88px;
            height: 53px;
          }
          .right-section {
            gap: 8px;
          }
          .user-btn {
            width: 29px;
            height: 29px;
          }
          .user-btn i {
            font-size: 13px;
          }
          .open-cart-btn {
            width: 28px;
            height: 32px;
            font-size: 21px;
          }
          .menu-toggle {
            width: 32px;
            height: 32px;
            font-size: 21px;
          }
          .mobile-menu {
            width: 300px;
            max-width: 88vw;
            padding: 17px;
          }
          .mobile-links a {
            min-height: 45px;
            padding: 12px 3px;
            font-size: 14px;
          }
          .mobile-dropdown-content a {
            font-size: 13px;
          }
          .floating-contact {
            right: 10px;
            bottom: 10px;
          }
          .main-contact-btn {
            width: 44px;
            height: 44px;
          }
          .contact-btn {
            width: 44px;
            height: 44px;
          }
        }
        @media screen and (max-width: 375px) {
          .top-navbar {
            height: 36px;
          }
          .scroll-text {
            width: calc(100% - 44px);
          }
          .scroll-text marquee {
            font-size: 8px;
            line-height: 36px;
          }
          .main-navbar {
            top: 36px;
            height: 57px;
          }
          .nav-container {
            height: 57px;
            min-height: 57px;
            padding: 0 8px;
          }
          .logo img {
            width: 78px;
            height: 50px;
          }
          .right-section {
            gap: 6px;
          }
          .user-btn {
            width: 27px;
            height: 27px;
          }
          .user-btn i {
            font-size: 12px;
          }
          .open-cart-btn {
            width: 26px;
            height: 30px;
            font-size: 19px;
          }
          .menu-toggle {
            width: 29px;
            height: 30px;
            font-size: 19px;
          }
          .cart-count {
            min-width: 14px;
            height: 14px;
            top: -4px;
            right: -5px;
            font-size: 7px;
            line-height: 14px;
          }
          .mobile-menu {
            width: 285px;
            max-width: 90vw;
            padding: 15px;
          }
          .mobile-links a {
            min-height: 43px;
            padding: 11px 2px;
            font-size: 13px;
          }
          .mobile-dropdown-content a {
            font-size: 12px;
            padding: 11px 12px;
          }
          .mobile-sub-content a {
            font-size: 12px;
            padding-left: 27px !important;
          }
          .cart-header {
            padding: 13px;
          }
          .cart-header h3 {
            font-size: 17px;
          }
          .cart-close-btn {
            font-size: 25px;
          }
          .cart-body {
            padding: 12px;
          }
          .cart-item img {
            width: 55px;
            height: 55px;
          }
          .cart-info h4 {
            font-size: 12px;
          }
          .cart-info p {
            font-size: 11px;
          }
          .cart-info strong {
            font-size: 14px;
          }
        }
        @media screen and (max-width: 320px) {
          .top-navbar {
            height: 34px;
          }
          .scroll-text {
            width: calc(100% - 40px);
          }
          .scroll-text marquee {
            font-size: 7px;
            line-height: 34px;
          }
          .main-navbar {
            top: 34px;
            height: 54px;
          }
          .nav-container {
            height: 54px;
            min-height: 54px;
            padding: 0 6px;
          }
          .logo img {
            width: 70px;
            height: 47px;
          }
          .right-section {
            gap: 5px;
          }
          .user-btn {
            width: 25px;
            height: 25px;
          }
          .user-btn i {
            font-size: 11px;
          }
          .open-cart-btn {
            width: 24px;
            height: 28px;
            font-size: 18px;
          }
          .menu-toggle {
            width: 27px;
            height: 28px;
            font-size: 18px;
          }
          .cart-count {
            min-width: 13px;
            height: 13px;
            font-size: 7px;
            line-height: 13px;
          }
          .mobile-menu {
            width: 270px;
            max-width: 92vw;
            padding: 14px;
          }
          .mobile-links a {
            font-size: 12px;
          }
        }
        @media screen and (max-width: 900px) and (orientation: landscape) {
          .top-navbar {
            height: 36px;
          }
          .scroll-text marquee {
            line-height: 36px;
          }
          .main-navbar {
            top: 36px;
            height: 58px;
          }
          .nav-container {
            height: 58px;
            min-height: 58px;
          }
          .logo img {
            height: 50px;
          }
          .mobile-menu {
            width: 320px;
          }
          .mobile-links a {
            min-height: 40px;
            padding: 9px 0;
          }
        }
      `}</style>
    </>
  );
}