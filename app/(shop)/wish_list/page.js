"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const getFirstValue = (...values) => {
    for (const value of values) {
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            return value;
        }
    }
    return "";
};
export default function WishlistPage() {
    const router = useRouter();
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [profileUser, setProfileUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const getUser = () => {
        try {
            const savedUser = localStorage.getItem("user");
            if (!savedUser) return null;
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser.logged_in !== true) return null;
            return (parsedUser.user || parsedUser.profile || parsedUser.data || parsedUser);
        } catch (error) {
            console.error("User error:", error);
            return null;
        }
    };
    const getUserId = () => {
        const user = getUser();
        return String(user?._id || user?.id || user?.userId || user?.user_id || "");
    };
    const getProductId = (product) => {
        return String(product?._id || product?.id || product?.productId || product?.product_id || "");
    };
    const getProductName = (product) => {
        return (product?.productName || product?.product_name || product?.name || product?.title || "Product");
    };
    const getProductImage = (product) => {
        const image = product?.images?.[0] || product?.image1 || product?.image || product?.productImage ||"";
        if (!image) return "/uploads/no-image.png";
        if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/")) {
            return image;
        }
        return `/uploads/products/${image}`;
    };
    const loadWishlist = async () => {
        setLoading(true);
        setError("");
        try {
            const userId = getUserId();
            if (!userId) {
                setWishlistProducts([]);
                setError("Please login to view your wishlist.");
                return;
            }
            const wishlistResponse = await fetch(`/api/wishlist?userId=${encodeURIComponent(userId)}`,
                { cache: "no-store" }
            );
            const wishlistData = await wishlistResponse.json();
            if (!wishlistResponse.ok) {
                throw new Error(wishlistData.message || "Unable to load wishlist.");
            }
            const wishlist = Array.isArray(wishlistData.wishlist) ? wishlistData.wishlist : [];
            if (wishlist.length === 0) {
                setWishlistProducts([]);
                return;
            }
            const productsResponse = await fetch("/api/products", {
                cache: "no-store",
            });
            const productsData = await productsResponse.json();
            if (!productsResponse.ok) {
                throw new Error("Unable to load products.");
            }
            const allProducts = Array.isArray(productsData) ? productsData : Array.isArray(productsData.products) ? productsData.products : [];
            const savedProductIds = wishlist.map((item) =>
                String(item.productId || item.product_id || item._id || "")
            );
            const matchedProducts = allProducts.filter((product) => savedProductIds.includes(getProductId(product)));
            setWishlistProducts(matchedProducts);
        } catch (error) {
            console.error("Wishlist loading error:", error);
            setError(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const user = getUser();
        setProfileUser(user);
        loadWishlist();
        const handleWishlistUpdate = () => {
            loadWishlist();
        };
        const handleUserUpdate = () => {
            setProfileUser(getUser());
            loadWishlist();
        };
        window.addEventListener("wishlistUpdated", handleWishlistUpdate);
        window.addEventListener("userUpdated", handleUserUpdate);
        return () => {
            window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
            window.removeEventListener("userUpdated", handleUserUpdate);
        };
    }, []);
    const removeWishlist = async (product) => {
        try {
            const userId = getUserId();
            const productId = getProductId(product);
            if (!userId || !productId) {
                alert("User or product ID not found.");
                return;
            }
            const response = await fetch("/api/wishlist", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId, productId,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Unable to remove wishlist item.");
            }
            setWishlistProducts((previous) => previous.filter((item) => getProductId(item) !== productId)
            );
            window.dispatchEvent(new Event("wishlistUpdated"));
        } catch (error) {
            console.error("Remove wishlist error:", error);
            alert(error.message || "Unable to remove product.");
        }
    };
    const closeMobileMenu = () => {setMenuOpen(false);};
    const handleLogout = () => {
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("openCartAfterRefresh");
        window.dispatchEvent(new Event("userUpdated"));
        window.dispatchEvent(new Event("wishlistUpdated"));
        window.dispatchEvent(new Event("compareUpdated"));
        window.dispatchEvent(new Event("cartUpdated"));
        setMenuOpen(false);
        router.replace("/");
    };
    const userName = getFirstValue(profileUser?.full_name, profileUser?.fullName, profileUser?.name, "My Account");
    const userEmail = getFirstValue(profileUser?.email, profileUser?.email_address);
    const userMobile = getFirstValue(
        profileUser?.mobile,
        profileUser?.phone,
        profileUser?.phone_number,
        profileUser?.phoneNumber,
        profileUser?.mobile_number,
        profileUser?.mobileNumber,
        profileUser?.contact_number,
        profileUser?.contactNumber,
        profileUser?.contact,
        profileUser?.whatsapp_number
    );
    return (
        <>
            <main className="wishlist-section">
                <div className="wishlist-layout">
                    <button type="button" className="mobile-menu-toggle" onClick={() => setMenuOpen((previous) => !previous)} aria-expanded={menuOpen} aria-controls="wishlist-navigation">
                        <i className={`fa ${menuOpen ? "fa-times" : "fa-bars"}`} aria-hidden="true" />
                        <span>
                            {menuOpen ? "Close Menu" : "Menu"}
                        </span>
                    </button>
                    <aside id="wishlist-navigation" className={`wishlist-sidebar ${menuOpen ? "menu-open" : "" }`}>
                        <div className="wishlist-profile-top">
                            <div className="wishlist-avatar">
                                <i className="fa fa-user" />
                            </div>
                            <h3>{userName}</h3>
                            <p>{userEmail}</p>
                            <p>{userMobile}</p>
                        </div>
                        <nav className="wishlist-profile-menu" aria-label="Profile menu">
                            <Link href="/my_profile" onClick={closeMobileMenu}>
                                <i className="fa fa-user" />
                                <span>My Profile</span>
                            </Link>
                            <Link href="/my-orders" onClick={closeMobileMenu}>
                                <i className="fa fa-shopping-bag" />
                                <span>My Orders</span>
                            </Link>
                            <Link href="/change_password" onClick={closeMobileMenu} >
                                <i className="fa fa-lock" />
                                <span>Change Password</span>
                            </Link>
                            <Link href="/wish_list" className="active" onClick={closeMobileMenu} >
                                <i className="fa fa-heart" />
                                <span>Wishlist</span>
                            </Link>
                            <a href="/" onClick={(event) => {event.preventDefault(); handleLogout(); }}>
                                <i className="fa fa-sign-out" />
                                <span>Logout</span>
                            </a>
                        </nav>
                    </aside>
                    <section className="wishlist-content">
                        <div className="wishlist-card">
                            <div className="wishlist-heading">
                                <div>
                                    <h1>My Wishlist</h1>
                                    <p>
                                        Your favourite products are saved here.
                                    </p>
                                </div>
                                <Link href="/" className="continue-shopping">
                                    Continue Shopping
                                </Link>
                            </div>
                            {loading ? (
                                <div className="wishlist-message">
                                    Loading wishlist...
                                </div>
                            ) : error ? (
                                <div className="wishlist-message">
                                    {error}
                                    <br />
                                    <Link href="/login">Login</Link>
                                </div>
                            ) : wishlistProducts.length === 0 ? (
                                <div className="wishlist-empty">
                                    <div className="empty-heart">
                                        ♡
                                    </div>
                                    <h2>
                                        Your Wishlist is Empty
                                    </h2>
                                    <p>
                                        You haven't added any products to your wishlist yet.
                                    </p>
                                    <Link href="/" className="shop-now-btn">
                                        Shop Now
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <p className="wishlist-count">
                                        {wishlistProducts.length} Saved Product(s)
                                    </p>
                                    <div className="wishlist-grid">
                                        {wishlistProducts.map((product) => {
                                            const productId = getProductId(product);
                                            const productName = getProductName(product);
                                            const image = getProductImage(product);
                                            const price = Number(product.offerPrice > 0 ? product.offerPrice : product.price || 0);
                                            return (
                                                <div className="wishlist-product-card" key={productId}>
                                                    <button type="button" className="remove-wishlist" onClick={() => removeWishlist(product)} aria-label="Remove from wishlist" title="Remove from Wishlist">
                                                        ♥
                                                    </button>
                                                    <Link href={`/product/${product.slug || productId}`} className="wishlist-product-link">
                                                        <div className="wishlist-image">
                                                            <img src={image} alt={productName} />
                                                        </div>
                                                        <div className="wishlist-details">
                                                            <h3>{productName}</h3>
                                                            <p className="wishlist-price">
                                                                ₹{price.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </main>
            <style jsx global>{`
                * {
                    box-sizing: border-box;
                    font-family: "Poppins", sans-serif;
                }
                body {
                    background: #f4f6f9;
                    color: #333;
                }
                .wishlist-section {
                    width: 100%;
                    min-height: 60vh;
                    padding: 40px 0;
                    margin-top: 145px;
                    background: #f4f6f9;
                }
                .wishlist-layout {
                    width: 95%;
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    align-items: flex-start;
                    gap: 30px;
                    min-width: 0;
                }
                .wishlist-sidebar {
                    flex: 0 0 300px;
                    width: 300px;
                    min-width: 0;
                    background: #fff;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
                }
                .wishlist-profile-top {
                    background: linear-gradient(135deg, #000, #333);
                    padding: 35px 20px;
                    text-align: center;
                    color: #fff;
                    overflow-wrap: anywhere;
                }
                .wishlist-avatar {
                    width: 110px;
                    height: 110px;
                    border-radius: 50%;
                    background: #fff;
                    color: #000;
                    margin: 0 auto 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 50px;
                    border: 4px solid rgba(255, 255, 255, 0.2);
                }
                .wishlist-profile-top h3 {
                    font-size: 24px;
                    line-height: 1.35;
                    margin: 0 0 8px;
                    font-weight: 600;
                    overflow-wrap: anywhere;
                }
                .wishlist-profile-top p {
                    font-size: 14px;
                    line-height: 1.5;
                    opacity: 0.9;
                    margin-top: 4px;
                    margin-bottom: 0;
                    overflow-wrap: anywhere;
                }
                .wishlist-profile-menu {
                    padding: 20px;
                }
                .wishlist-profile-menu a {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 0;
                    text-decoration: none;
                    color: #444;
                    padding: 15px 18px;
                    margin-bottom: 10px;
                    border-radius: 10px;
                    transition: background 0.2s ease, color 0.2s ease;
                    font-size: 15px;
                    font-weight: 500;
                }
                .wishlist-profile-menu a span {
                    overflow-wrap: anywhere;
                }
                .wishlist-profile-menu a i {
                    flex: 0 0 22px;
                    width: 22px;
                    text-align: center;
                }
                .wishlist-profile-menu a:hover {
                    background: #000;
                    color: #fff;
                }
                .wishlist-profile-menu a.active {
                    background: #000;
                    color: #fff;
                    font-weight: 600;
                }
                .wishlist-profile-menu a.active i {
                    color: #fff;
                }
                .wishlist-content {
                    flex: 1 1 0;
                    width: 0;
                    min-width: 0;
                }
                .wishlist-card {
                    width: 100%;
                    min-width: 0;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
                    padding: 30px;
                }
                .wishlist-heading {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .wishlist-heading h1 {
                    font-size: 28px;
                    line-height: 1.3;
                    color: #222;
                    margin: 0 0 8px;
                }
                .wishlist-heading p {
                    color: #777;
                    margin: 0;
                    line-height: 1.5;
                }
                .continue-shopping, .shop-now-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 12px 22px;
                    border-radius: 7px;
                    background: #000;
                    color: #fff;
                    text-decoration: none;
                    font-size: 14px;
                    white-space: nowrap;
                    transition: background 0.2s ease;
                }
                .continue-shopping:hover, .shop-now-btn:hover {
                    background: #333;
                }
                .wishlist-count {
                    margin-bottom: 20px;
                    color: #555;
                }
                .wishlist-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 22px;
                }
                .wishlist-product-card {
                    position: relative;
                    min-width: 0;
                    overflow: hidden;
                    background: #fff;
                    border: 1px solid #eee;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
                    transition: transform 0.2s ease;
                }
                .wishlist-product-card:hover {
                    transform: translateY(-4px);
                }
                .wishlist-product-link {
                    display: block;
                    color: inherit;
                    text-decoration: none;
                }
                .wishlist-image {
                    width: 100%;
                    height: 220px;
                    padding: 15px;
                    background: #fff;
                }
                .wishlist-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }
                .wishlist-details {
                    padding: 15px;
                }
                .wishlist-details h3 {
                    font-size: 16px;
                    line-height: 1.5;
                    color: #333;
                    margin: 0 0 10px;
                    overflow-wrap: anywhere;
                }
                .wishlist-price {
                    color: #bd704d;
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0;
                }
                .remove-wishlist {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    z-index: 2;
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 50%;
                    background: #fff;
                    color: #e53935;
                    font-size: 21px;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
                }
                .remove-wishlist:hover {
                    background: #e53935;
                    color: #fff;
                }
                .wishlist-empty, .wishlist-message {
                    padding: 65px 20px;
                    text-align: center;
                    background: #fff;
                    border-radius: 12px;
                    color: #555;
                }
                .empty-heart {
                    font-size: 65px;
                    color: #bd704d;
                    line-height: 1;
                    margin-bottom: 15px;
                }
                .wishlist-empty h2 {
                    color: #222;
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .wishlist-empty p {
                    color: #777;
                    margin-bottom: 22px;
                    line-height: 1.5;
                }
                .wishlist-message a {
                    color: #bd704d;
                }
                .mobile-menu-toggle {
                    display: none;
                }
                @media (max-width: 991px) {
                    .wishlist-section {
                        padding: 30px 0;
                    }
                    .wishlist-layout {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 18px;
                    }
                    .mobile-menu-toggle {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        align-self: flex-start;
                        gap: 10px;
                        min-height: 46px;
                        padding: 11px 18px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        background: #000;
                        color: #fff;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                    }
                    .mobile-menu-toggle:focus-visible {
                        outline: 2px solid #555;
                        outline-offset: 3px;
                    }
                    .wishlist-sidebar {
                        display: none;
                        flex: none;
                        width: 100%;
                        max-width: 100%;
                    }
                    .wishlist-sidebar.menu-open {
                        display: block;
                    }
                    .wishlist-content {
                        width: 100%;
                        flex: none;
                    }
                    .wishlist-profile-top {
                        padding: 25px 20px;
                    }
                    .wishlist-profile-menu {
                        padding: 15px;
                    }
                    .wishlist-profile-menu a {
                        padding: 14px 16px;
                    }
                    .wishlist-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }
                @media (max-width: 768px) {
                    .wishlist-section {
                        padding: 24px 0;
                    }
                    .wishlist-layout {
                        width: calc(100% - 32px);
                        gap: 15px;
                    }
                    .wishlist-card {
                        padding: 24px;
                    }
                    .wishlist-heading {
                        flex-wrap: wrap;
                    }
                    .wishlist-heading h1 {
                        font-size: 25px;
                    }
                    .wishlist-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 15px;
                    }
                    .wishlist-image {
                        height: 190px;
                    }
                }
                @media (max-width: 480px) {
                    .wishlist-section {
                        padding: 18px 0;
                    }
                    .wishlist-layout {
                        width: calc(100% - 24px);
                        gap: 12px;
                    }
                    .mobile-menu-toggle {
                        min-height: 44px;
                        padding: 10px 15px;
                        font-size: 14px;
                    }
                    .wishlist-card {
                        padding: 18px 15px;
                        border-radius: 10px;
                    }
                    .wishlist-heading {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                        margin-bottom: 22px;
                    }
                    .wishlist-heading h1 {
                        font-size: 23px;
                    }
                    .continue-shopping {
                        width: 100%;
                    }
                    .wishlist-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 13px;
                    }
                    .wishlist-image {
                        height: 160px;
                        padding: 10px;
                    }
                    .wishlist-details {
                        padding: 12px;
                    }
                    .wishlist-details h3 {
                        font-size: 14px;
                    }
                    .wishlist-price {
                        font-size: 16px;
                    }
                    .remove-wishlist {
                        top: 8px;
                        right: 8px;
                        width: 32px;
                        height: 32px;
                        font-size: 18px;
                    }
                    .wishlist-profile-top {
                        padding: 22px 15px;
                    }
                    .wishlist-profile-top h3 {
                        font-size: 21px;
                    }
                    .wishlist-avatar {
                        width: 82px;
                        height: 82px;
                        font-size: 38px;
                        margin-bottom: 14px;
                    }
                    .wishlist-profile-menu {
                        padding: 12px;
                    }
                    .wishlist-profile-menu a {
                        padding: 13px 12px;
                        margin-bottom: 7px;
                        font-size: 14px;
                    }
                }
                @media (max-width: 360px) {
                    .wishlist-layout {
                        width: calc(100% - 20px);
                    }
                    .wishlist-card {
                        padding: 15px 12px;
                    }
                    .wishlist-heading h1 {
                        font-size: 21px;
                    }
                    .wishlist-grid {
                        grid-template-columns: 1fr;
                    }
                    .wishlist-image {
                        height: 200px;
                    }
                    .wishlist-profile-top p {
                        font-size: 13px;
                    }
                    .wishlist-profile-menu {
                        padding: 9px;
                    }
                    .wishlist-profile-menu a {
                        gap: 9px;
                        padding: 12px 9px;
                        font-size: 13px;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .wishlist-product-card, .wishlist-profile-menu a, .continue-shopping {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}