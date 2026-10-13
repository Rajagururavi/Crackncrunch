"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const getFirstValue = (...values) => {
    for (const value of values) {
        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {
            return value;
        }
    }
    return "";
};

const getJoinedDate = (data) => {
    const value = getFirstValue(
        data.created_at,
        data.createdAt,
        data.date_joined,
        data.dateJoined,
        data.created_date,
        data.createdDate,
        data.registered_at,
        data.registeredAt,
        data.registration_date,
        data.registered_on,
        data.joined_at,
        data.joinedAt
    );

    if (value) {
        const date = new Date(value);

        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }

        return String(value);
    }

    const id = data._id || data.id || data.userId || data.user_id;

    if (typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)) {
        const timestamp = parseInt(id.substring(0, 8), 16);
        const date = new Date(timestamp * 1000);

        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        }
    }

    return "";
};

export default function MyProfilePage() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        mobile: "",
        created_at: "",
        address: "",
        state: "",
        country: "India",
        pincode: "",
        gender: "",
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem("user");

            if (!savedUser) {
                router.replace("/login");
                return;
            }

            const parsedUser = JSON.parse(savedUser);

            if (parsedUser.logged_in !== true) {
                router.replace("/login");
                return;
            }

            const profile =
                parsedUser.user ||
                parsedUser.profile ||
                parsedUser.data ||
                parsedUser;

            const mobile = getFirstValue(
                profile.mobile,
                profile.phone,
                profile.phone_number,
                profile.phoneNumber,
                profile.mobile_number,
                profile.mobileNumber,
                profile.contact_number,
                profile.contactNumber,
                profile.contact,
                profile.whatsapp_number
            );

            const joinedDate = getJoinedDate(profile);

            const loadedUser = {
                ...profile,
                logged_in: true,
                full_name: getFirstValue(
                    profile.full_name,
                    profile.fullName,
                    profile.name
                ),
                email: getFirstValue(
                    profile.email,
                    profile.email_address
                ),
                mobile,
                created_at: joinedDate,
            };

            setUser(loadedUser);

            setFormData({
                full_name: loadedUser.full_name,
                email: loadedUser.email,
                mobile: String(mobile),
                created_at: joinedDate,
                address: getFirstValue(profile.address),
                state: getFirstValue(profile.state),
                country: getFirstValue(profile.country, "India"),
                pincode: getFirstValue(
                    profile.pincode,
                    profile.pin_code
                ),
                gender: getFirstValue(profile.gender),
            });
        } catch (error) {
            console.error("Profile loading error:", error);
            setErrorMessage("Unable to load your profile.");
        }
    }, [router]);

    const closeMobileMenu = () => {
        setMenuOpen(false);
    };

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

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const fullName = formData.full_name.trim();
        const mobile = formData.mobile.trim();

        setSuccessMessage("");
        setErrorMessage("");

        if (!fullName) {
            alert("Please enter Full Name");
            return;
        }

        if (!mobile) {
            alert("Please enter Mobile Number");
            return;
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            alert("Please enter a valid 10-digit Mobile Number");
            return;
        }

        if (
            formData.pincode.trim() !== "" &&
            !/^[0-9]{6}$/.test(formData.pincode.trim())
        ) {
            alert("Please enter a valid 6-digit Pincode");
            return;
        }

        if (!window.confirm("Do you want to save your profile changes?")) {
            return;
        }

        try {
            const updatedUser = {
                ...user,
                ...formData,
                full_name: fullName,
                mobile,
                created_at: formData.created_at,
                country: formData.country || "India",
                logged_in: true,
            };

            localStorage.setItem("user", JSON.stringify(updatedUser));

            window.dispatchEvent(new Event("userUpdated"));

            setUser(updatedUser);
            setSuccessMessage("Profile updated successfully.");
        } catch (error) {
            console.error("Profile saving error:", error);
            setErrorMessage("Unable to save your profile.");
        }
    };

    if (!user) {
        return null;
    }

    return (
        <>
            <main className="profile-section">
                <div className="profile-container">

                    {/* Mobile and tablet menu toggle */}
                    <button
                        type="button"
                        className="mobile-menu-toggle"
                        onClick={() => setMenuOpen((previous) => !previous)}
                        aria-expanded={menuOpen}
                        aria-controls="profile-navigation"
                    >
                        <i
                            className={`fa ${
                                menuOpen ? "fa-times" : "fa-bars"
                            }`}
                            aria-hidden="true"
                        />
                        <span>
                            {menuOpen ? "Close Menu" : "Menu"}
                        </span>
                    </button>

                    {/* Profile sidebar */}
                    <aside
                        id="profile-navigation"
                        className={`profile-sidebar ${
                            menuOpen ? "menu-open" : ""
                        }`}
                    >
                        <div className="profile-top">
                            <div className="profile-avatar">
                                <i className="fa fa-user" />
                            </div>

                            <h3>{formData.full_name}</h3>
                            <p>{formData.email}</p>
                            <p>{formData.mobile}</p>
                        </div>

                        <nav className="profile-menu" aria-label="Profile menu">
                            <Link
                                href="/my_profile"
                                className="active"
                                onClick={closeMobileMenu}
                            >
                                <i className="fa fa-user" />
                                <span>My Profile</span>
                            </Link>

                            <Link
                                href="/my_orders"
                                onClick={closeMobileMenu}
                            >
                                <i className="fa fa-shopping-bag" />
                                <span>My Orders</span>
                            </Link>

                            <Link
                                href="/change_password"
                                onClick={closeMobileMenu}
                            >
                                <i className="fa fa-lock" />
                                <span>Change Password</span>
                            </Link>

                            <Link
                                href="/wish_list"
                                onClick={closeMobileMenu}
                            >
                                <i className="fa fa-heart" />
                                <span>Wishlist</span>
                            </Link>

                            <a
                                href="/"
                                onClick={(event) => {
                                    event.preventDefault();
                                    handleLogout();
                                }}
                            >
                                <i className="fa fa-sign-out" />
                                <span>Logout</span>
                            </a>
                        </nav>
                    </aside>

                    {/* Profile form */}
                    <section className="profile-content">
                        <div className="profile-card">
                            <h2>My Profile</h2>

                            {successMessage && (
                                <div
                                    className="alert-success"
                                    role="status"
                                >
                                    {successMessage}
                                </div>
                            )}

                            {errorMessage && (
                                <div
                                    className="alert-danger"
                                    role="alert"
                                >
                                    {errorMessage}
                                </div>
                            )}

                            <form
                                id="profileForm"
                                onSubmit={handleSubmit}
                            >
                                <div className="form-row">
                                    <div className="input-group">
                                        <label htmlFor="full_name">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="full_name"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            autoComplete="name"
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="email">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            autoComplete="email"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label htmlFor="mobile">
                                            Mobile Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="mobile"
                                            name="mobile"
                                            maxLength={10}
                                            inputMode="numeric"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            autoComplete="tel"
                                            required
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="created_at">
                                            Date Joined
                                        </label>
                                        <input
                                            type="text"
                                            id="created_at"
                                            name="created_at"
                                            value={formData.created_at}
                                            className="readonly"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="input-group address-group">
                                    <label htmlFor="address">Address</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        placeholder="Enter your Address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        autoComplete="street-address"
                                    />
                                </div>

                                <div className="form-row state-row">
                                    <div className="input-group">
                                        <label htmlFor="state">State</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder="Enter State"
                                            autoComplete="address-level1"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label htmlFor="country">
                                            Country
                                        </label>
                                        <input
                                            type="text"
                                            id="country"
                                            name="country"
                                            value={formData.country}
                                            className="readonly"
                                            readOnly
                                            autoComplete="country-name"
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label htmlFor="pincode">
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            id="pincode"
                                            name="pincode"
                                            maxLength={6}
                                            inputMode="numeric"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            placeholder="Enter Pincode"
                                            autoComplete="postal-code"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="input-group">
                                        <label htmlFor="account_status">
                                            Account Status
                                        </label>
                                        <input
                                            type="text"
                                            id="account_status"
                                            value="Active"
                                            className="readonly"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                <div className="profile-actions">
                                    <button
                                        type="submit"
                                        className="save-btn"
                                    >
                                        Save Changes
                                    </button>

                                    <Link
                                        href="/"
                                        className="back-home-btn"
                                    >
                                        Back Home
                                    </Link>
                                </div>
                            </form>
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

                .profile-section {
                    width: 100%;
                    padding: 40px 0;
                    margin-top: 145px;
                }

                .profile-container {
                    width: 95%;
                    max-width: 1400px;
                    margin: 0 auto;
                    display: flex;
                    align-items: flex-start;
                    gap: 30px;
                    min-width: 0;
                }

                .profile-sidebar {
                    flex: 0 0 300px;
                    width: 300px;
                    min-width: 0;
                    background: #fff;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
                }

                .profile-top {
                    background: linear-gradient(135deg, #000, #333);
                    padding: 35px 20px;
                    text-align: center;
                    color: #fff;
                    overflow-wrap: anywhere;
                }

                .profile-avatar {
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

                .profile-top h3 {
                    font-size: 24px;
                    line-height: 1.35;
                    margin-bottom: 8px;
                    font-weight: 600;
                    overflow-wrap: anywhere;
                }

                .profile-top p {
                    font-size: 14px;
                    line-height: 1.5;
                    opacity: 0.9;
                    margin-top: 4px;
                    overflow-wrap: anywhere;
                }

                .profile-menu {
                    padding: 20px;
                }

                .profile-menu a {
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

                .profile-menu a span {
                    overflow-wrap: anywhere;
                }

                .profile-menu a i {
                    flex: 0 0 22px;
                    width: 22px;
                    text-align: center;
                }

                .profile-menu a:hover {
                    background: #000;
                    color: #fff;
                }

                .profile-menu a.active {
                    background: #000;
                    color: #fff;
                    font-weight: 600;
                }

                .profile-menu a.active i {
                    color: #fff;
                }

                .profile-content {
                    flex: 1 1 0;
                    width: 0;
                    min-width: 0;
                }

                .profile-card {
                    width: 100%;
                    min-width: 0;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
                    padding: 35px;
                }

                .profile-card h2 {
                    margin-bottom: 25px;
                    font-size: 28px;
                    line-height: 1.3;
                    color: #222;
                }

                .form-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 20px;
                    margin-bottom: 20px;
                    min-width: 0;
                }

                .input-group {
                    flex: 1 1 0;
                    width: 0;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                }

                .input-group label {
                    font-size: 15px;
                    line-height: 1.4;
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #333;
                }

                .input-group input,
                .input-group textarea {
                    display: block;
                    width: 100%;
                    min-width: 0;
                    max-width: 100%;
                    padding: 13px 15px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    outline: none;
                    font-size: 15px;
                    line-height: 1.5;
                    transition: border-color 0.2s ease;
                    background: #fff;
                    color: #333;
                }

                .input-group input {
                    min-height: 49px;
                }

                .input-group textarea {
                    resize: none;
                    min-height: 120px;
                }

                .input-group input:focus,
                .input-group textarea:focus {
                    border-color: #000;
                }

                .input-group input.readonly {
                    background: #f3f3f3;
                    color: #555;
                }

                .address-group {
                    margin-bottom: 20px;
                }

                .state-row {
                    margin-top: 20px;
                }

                .profile-actions {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                    margin-top: 30px;
                }

                .save-btn,
                .back-home-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 49px;
                    padding: 13px 30px;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    line-height: 1.4;
                    text-align: center;
                    text-decoration: none;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .save-btn {
                    background: #000;
                    color: #fff;
                }

                .save-btn:hover {
                    background: #333;
                }

                .back-home-btn {
                    background: #6c757d;
                    color: #fff;
                }

                .back-home-btn:hover {
                    background: #565e64;
                }

                .mobile-menu-toggle {
                    display: none;
                }

                .alert-success,
                .alert-danger {
                    padding: 12px 18px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    line-height: 1.5;
                    overflow-wrap: anywhere;
                }

                .alert-success {
                    background: #d4edda;
                    color: #155724;
                }

                .alert-danger {
                    background: #f8d7da;
                    color: #721c24;
                }

                /* Tablets and all mobile screens */
                @media (max-width: 991px) {
                    .profile-section {
                        padding: 30px 0;
                    }

                    .profile-container {
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

                    .profile-sidebar {
                        display: none;
                        flex: none;
                        width: 100%;
                        max-width: 100%;
                    }

                    .profile-sidebar.menu-open {
                        display: block;
                    }

                    .profile-content {
                        width: 100%;
                        flex: none;
                    }

                    .profile-top {
                        padding: 25px 20px;
                    }

                    .profile-menu {
                        padding: 15px;
                    }

                    .profile-menu a {
                        padding: 14px 16px;
                    }
                }

                /* Smaller tablets and larger phones */
                @media (max-width: 768px) {
                    .profile-section {
                        padding: 24px 0;
                    }

                    .profile-container {
                        width: calc(100% - 32px);
                        gap: 15px;
                    }

                    .profile-card {
                        padding: 24px;
                    }

                    .profile-card h2 {
                        font-size: 25px;
                        margin-bottom: 22px;
                    }

                    .form-row {
                        gap: 16px;
                        margin-bottom: 16px;
                    }

                    .input-group input,
                    .input-group textarea {
                        font-size: 16px;
                    }

                    .profile-actions {
                        gap: 10px;
                    }
                }

                /* Standard mobile phones */
                @media (max-width: 480px) {
                    .profile-section {
                        padding: 18px 0;
                    }

                    .profile-container {
                        width: calc(100% - 24px);
                        gap: 12px;
                    }

                    .mobile-menu-toggle {
                        min-height: 44px;
                        padding: 10px 15px;
                        font-size: 14px;
                    }

                    .profile-card {
                        padding: 18px 15px;
                        border-radius: 10px;
                    }

                    .profile-card h2 {
                        font-size: 23px;
                        margin-bottom: 20px;
                    }

                    .form-row {
                        flex-direction: column;
                        gap: 16px;
                        margin-bottom: 16px;
                    }

                    .input-group {
                        width: 100%;
                        flex: none;
                    }

                    .input-group label {
                        font-size: 14px;
                        margin-bottom: 7px;
                    }

                    .input-group input,
                    .input-group textarea {
                        padding: 12px;
                        border-radius: 7px;
                    }

                    .input-group textarea {
                        min-height: 100px;
                    }

                    .profile-top {
                        padding: 22px 15px;
                    }

                    .profile-top h3 {
                        font-size: 21px;
                    }

                    .profile-avatar {
                        width: 82px;
                        height: 82px;
                        font-size: 38px;
                        margin-bottom: 14px;
                    }

                    .profile-menu {
                        padding: 12px;
                    }

                    .profile-menu a {
                        padding: 13px 12px;
                        margin-bottom: 7px;
                        font-size: 14px;
                    }

                    .profile-actions {
                        flex-direction: column;
                        align-items: stretch;
                        width: 100%;
                        margin-top: 22px;
                    }

                    .save-btn,
                    .back-home-btn {
                        width: 100%;
                        min-height: 46px;
                        padding: 12px 15px;
                        margin: 0;
                        font-size: 15px;
                    }
                }

                /* Very narrow phones (320px and similar) */
                @media (max-width: 360px) {
                    .profile-container {
                        width: calc(100% - 20px);
                    }

                    .profile-card {
                        padding: 15px 12px;
                    }

                    .profile-card h2 {
                        font-size: 21px;
                    }

                    .profile-top p {
                        font-size: 13px;
                    }

                    .profile-menu {
                        padding: 9px;
                    }

                    .profile-menu a {
                        gap: 9px;
                        padding: 12px 9px;
                        font-size: 13px;
                    }

                    .input-group input,
                    .input-group textarea {
                        padding: 11px 10px;
                    }
                }

                /* Respect reduced motion preferences */
                @media (prefers-reduced-motion: reduce) {
                    .profile-menu a,
                    .save-btn,
                    .back-home-btn,
                    .input-group input,
                    .input-group textarea {
                        transition: none;
                    }
                }
            `}</style>
        </>
    );
}