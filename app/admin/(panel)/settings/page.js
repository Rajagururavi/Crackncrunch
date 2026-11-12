"use client";
import { useEffect, useState } from "react";
export default function SettingsPage() {
  const [phone, setPhone] = useState("");
  const [gst, setGst] = useState("");
  const [fssai, setFssai] = useState("");
  const [address, setAddress] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings", {
          method: "GET",
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          alert(data.message || "Failed to load settings");
          return;
        }
        const settings = data.settings || {};
        setPhone(settings.phone || "");
        setGst(settings.gst || "");
        setFssai(settings.fssai || "");
        setAddress(settings.address || "");
        setUsername(settings.username || "");
        setEmail(settings.email || "");
        if (settings.logo) {
          if (settings.logo.startsWith("http://") || settings.logo.startsWith("https://") || settings.logo.startsWith("/")) {
            setLogoUrl(settings.logo);
          } else {
            setLogoUrl(`/uploads/${settings.logo}`);
          }
        } else {
          setLogoUrl("");
        }
      } catch (error) {
        console.error("LOAD SETTINGS ERROR:", error);
        alert("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);
  useEffect(() => {
    return () => {
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setLogo(null);
      setLogoPreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      e.target.value = "";
      return;
    }
    setLogo(file);
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("phone", phone);
      formData.append("gst", gst);
      formData.append("fssai", fssai);
      formData.append("address", address);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);
      if (logo) {
        formData.append("logo", logo);
      }
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || "Failed to save settings");
        return;
      }
      alert("Settings saved successfully!");
      if (data.logo) {
        if (data.logo.startsWith("http://") || data.logo.startsWith("https://") || data.logo.startsWith("/")) {
          setLogoUrl(data.logo);
        } else {
          setLogoUrl(`/uploads/${data.logo}`);
        }
      }
      setLogo(null);
      setLogoPreview("");
      setPassword("");
      const fileInput = document.getElementById("business-logo");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("SAVE SETTINGS ERROR:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner" />
        <p>Loading settings...</p>
        <style jsx>{`
          .settings-loading {
            min-height: 300px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            font-size: 14px;
          }
          .loading-spinner {
            width: 35px;
            height: 35px;
            border: 3px solid #e5e7eb;
            border-top-color: #222;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }
  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>
            Manage your admin account and business information.
          </p>
        </div>
      </div>
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-header-icon">
            ⚙
          </div>
          <div>
            <h2>Admin Settings</h2>
            <p>
              Update your business details and account information.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="section-heading">
            <h3>Business Information</h3>
            <p>Contact and registration details</p>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="phone">
                Phone Number
              </label>
              <input id="phone" type="tel" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)}/>
            </div>
            <div className="form-group">
              <label htmlFor="gst">
                GST Number
              </label>
              <input id="gst" type="text" placeholder="Enter GST number" value={gst} onChange={(e) => setGst(e.target.value)}/>
            </div>
            <div className="form-group">
              <label htmlFor="fssai">
                FSSAI Certificate Number
              </label>
              <input id="fssai" type="text" placeholder="Enter FSSAI certificate number" value={fssai} onChange={(e) => setFssai(e.target.value)} />
            </div>
            <div className="form-group full-width">
              <label htmlFor="address">
                Business Address
              </label>
              <textarea id="address" placeholder="Enter complete business address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
          <div className="section-heading account-heading">
            <h3>Admin Account</h3>
            <p>Manage your administrator login details</p>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="username">
                Username
              </label>
              <input id="username" type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="email">
                Email ID
              </label>
              <input id="email" type="email" placeholder="Enter email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group full-width">
              <label htmlFor="password">
                New Password
              </label>
              <input id="password" type="password" name="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} 
                placeholder="Leave blank to keep current password"
              />
              <small>
                Only enter a password if you want to change it.
              </small>
            </div>
          </div>
          <div className="section-heading logo-heading">
            <h3>Business Logo</h3>
            <p>Upload your Crack N Crunch business logo</p>
          </div>
          <div className="logo-upload-section">
            <div className="logo-upload-left">
              <label className="upload-label" htmlFor="business-logo">
                <span className="upload-icon">↑</span>
                <span>
                  <strong>Choose Logo Image</strong>
                  <small>
                    PNG, JPG, WEBP (Maximum 5MB)
                  </small>
                </span>
              </label>
              <input id="business-logo" className="logo-input" type="file" accept="image/*" onChange={handleLogoChange} />
            </div>
            <div className="logo-preview-section">
              <span className="preview-label">
                Logo Preview
              </span>
              <div className="logo-preview">
                {logoPreview ? (
                  <img src={logoPreview} alt="New Logo Preview"/>
                ) : logoUrl ? (
                  <img src={logoUrl} alt="Business Logo" />
                ) : (
                  <div className="logo-placeholder">
                    <span>◎</span>
                    <small>No Logo Uploaded</small>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="button-area">
            <button type="submit" className="save-button" disabled={saving}>
              {saving ? (
                <>
                  <span className="button-spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <span>✓</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        .settings-page {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          color: #222;
        }
        .page-header {
          margin-bottom: 25px;
        }
        .page-header h1 {
          margin: 0 0 8px;
          font-size: 28px;
          font-weight: 700;
          color: #222;
        }
        .page-header p {
          margin: 0;
          color: #777;
          font-size: 14px;
          line-height: 1.6;
        }
        .settings-card {
          width: 100%;
          min-width: 0;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }
        .settings-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 25px;
          margin-bottom: 28px;
          border-bottom: 1px solid #eee;
        }
        .settings-header-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          font-size: 23px;
          flex-shrink: 0;
        }
        .settings-card-header h2 {
          margin: 0 0 5px;
          font-size: 20px;
          font-weight: 650;
        }
        .settings-card-header p {
          margin: 0;
          color: #888;
          font-size: 13px;
          line-height: 1.5;
        }
        .section-heading {
          margin-bottom: 20px;
        }
        .section-heading h3 {
          font-size: 16px;
          font-weight: 650;
          margin: 0 0 5px;
          color: #222;
        }
        .section-heading p {
          font-size: 12px;
          color: #999;
          margin: 0;
        }
        .account-heading, .logo-heading {
          margin-top: 32px;
          padding-top: 25px;
          border-top: 1px solid #eee;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .form-group.full-width {
          grid-column: span 2;
        }
        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #333;
          margin-bottom: 9px;
        }
        .form-group input, .form-group textarea {
          width: 100%;
          min-width: 0;
          padding: 13px 14px;
          border: 1px solid #ddd;
          border-radius: 7px;
          font-size: 14px;
          color: #222;
          background: #fff;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-group input {
          height: 46px;
        }
        .form-group input:focus, .form-group textarea:focus {
          border-color: #222;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
        }
        .form-group input::placeholder, .form-group textarea::placeholder {
          color: #aaa;
        }
        .form-group textarea {
          min-height: 110px;
          resize: vertical;
          font-family: Arial, sans-serif;
          line-height: 1.6;
        }
        .form-group small {
          margin-top: 7px;
          font-size: 11px;
          color: #999;
          line-height: 1.5;
        }
        .logo-upload-section {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 30px;
          flex-wrap: wrap;
        }
        .logo-upload-left {
          flex: 1;
          min-width: 220px;
        }
        .upload-label {
          width: 100%;
          max-width: 420px;
          min-height: 95px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          background: #fafafa;
          border: 1px dashed #ccc;
          border-radius: 9px;
          cursor: pointer;
          transition: 0.2s;
        }
        .upload-label:hover {
          border-color: #222;
          background: #f5f5f5;
        }
        .upload-icon {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eee;
          border-radius: 8px;
          font-size: 25px;
          flex-shrink: 0;
        }
        .upload-label strong, .upload-label small {
          display: block;
        }
        .upload-label strong {
          font-size: 13px;
          margin-bottom: 6px;
        }
        .upload-label small {
          color: #999;
          font-size: 11px;
        }
        .logo-input {
          display: none;
        }
        .logo-preview-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .preview-label {
          font-size: 12px;
          font-weight: 600;
          color: #555;
        }
        .logo-preview {
          width: 170px;
          height: 150px;
          border: 1px solid #e5e5e5;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #fafafa;
        }
        .logo-preview img {
          width: 100%;
          height: 100%;
          padding: 8px;
          object-fit: contain;
          display: block;
        }
        .logo-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          color: #aaa;
        }
        .logo-placeholder span {
          font-size: 35px;
        }
        .logo-placeholder small {
          font-size: 11px;
        }
        .button-area {
          margin-top: 35px;
          padding-top: 23px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
        }
        .save-button {
          min-width: 160px;
          min-height: 46px;
          padding: 12px 25px;
          border: none;
          border-radius: 7px;
          background: #222;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
          transition: 0.2s;
        }
        .save-button:hover {
          background: #333;
        }
        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #aaa;
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @media (max-width: 900px) {
          .settings-card {
            padding: 25px;
          }
          .form-grid {
            gap: 18px;
          }
          .logo-upload-section {
            gap: 20px;
          }
        }
        @media (max-width: 700px) {
          .page-header {
            margin-bottom: 20px;
          }
          .page-header h1 {
            font-size: 24px;
          }
          .page-header p {
            font-size: 13px;
          }
          .settings-card {
            padding: 20px;
          }
          .settings-card-header {
            gap: 11px;
            margin-bottom: 24px;
            padding-bottom: 20px;
          }
          .settings-card-header h2 {
            font-size: 18px;
          }
          .form-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 18px;
          }
          .form-group.full-width {
            grid-column: span 1;
          }
          .form-group input {
            height: 46px;
          }
          .account-heading, .logo-heading {
            margin-top: 27px;
            padding-top: 22px;
          }
          .logo-upload-section {
            flex-direction: column;
            align-items: stretch;
          }
          .logo-upload-left {
            width: 100%;
            min-width: 0;
          }
          .upload-label {
            max-width: 100%;
          }
          .logo-preview-section {
            align-items: flex-start;
          }
          .logo-preview {
            width: min(180px, 100%);
            height: 140px;
          }
          .button-area {
            justify-content: stretch;
          }
          .save-button {
            width: 100%;
          }
        }
        @media (max-width: 430px) {
          .page-header h1 {
            font-size: 22px;
          }
          .settings-card {
            padding: 16px;
            border-radius: 9px;
          }
          .settings-card-header {
            align-items: flex-start;
          }
          .settings-header-icon {
            width: 40px;
            height: 40px;
            font-size: 20px;
          }
          .settings-card-header h2 {
            font-size: 16px;
          }
          .settings-card-header p {
            font-size: 11px;
          }
          .section-heading h3 {
            font-size: 15px;
          }
          .form-group label {
            font-size: 12px;
          }
          .form-group input, .form-group textarea {
            font-size: 13px;
            padding: 12px;
          }
          .upload-label {
            min-height: 85px;
            padding: 13px;
            gap: 10px;
          }
          .upload-icon {
            width: 38px;
            height: 38px;
          }
          .upload-label strong {
            font-size: 12px;
          }
          .upload-label small {
            font-size: 10px;
          }
          .button-area {
            margin-top: 25px;
          }
        }
        @media (max-width: 350px) {
          .settings-card {
            padding: 13px;
          }
          .page-header h1 {
            font-size: 20px;
          }
          .settings-card-header {
            gap: 8px;
          }
          .settings-card-header h2 {
            font-size: 15px;
          }
          .upload-label {
            gap: 8px;
          }
          .upload-label small {
            font-size: 9px;
          }
        }
      `}</style>
    </div>
  );
}