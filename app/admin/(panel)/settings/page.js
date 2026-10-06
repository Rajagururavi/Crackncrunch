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

  /*
   * LOAD SETTINGS
   */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch(
          "/api/admin/settings",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          alert(
            data.message ||
              "Failed to load settings"
          );
          return;
        }

        const settings =
          data.settings || {};

        setPhone(
          settings.phone || ""
        );

        setGst(
          settings.gst || ""
        );

        setFssai(
          settings.fssai || ""
        );

        setAddress(
          settings.address || ""
        );

        setUsername(
          settings.username || ""
        );

        setEmail(
          settings.email || ""
        );

        /*
         * EXISTING LOGO
         */
        if (settings.logo) {
          if (
            settings.logo.startsWith(
              "http://"
            ) ||
            settings.logo.startsWith(
              "https://"
            ) ||
            settings.logo.startsWith("/")
          ) {
            setLogoUrl(
              settings.logo
            );
          } else {
            setLogoUrl(
              `/uploads/${settings.logo}`
            );
          }
        } else {
          setLogoUrl("");
        }
      } catch (error) {
        console.error(
          "LOAD SETTINGS ERROR:",
          error
        );

        alert(
          "Failed to load settings"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  /*
   * LOGO SELECT
   */
  const handleLogoChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      setLogo(null);
      setLogoPreview("");
      return;
    }

    /*
     * Only images
     */
    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Please select an image file."
      );

      e.target.value = "";
      return;
    }

    /*
     * File size limit: 5MB
     */
    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Image size must be less than 5MB."
      );

      e.target.value = "";
      return;
    }

    setLogo(file);

    /*
     * Create preview
     */
    const previewUrl =
      URL.createObjectURL(file);

    setLogoPreview(
      previewUrl
    );
  };

  /*
   * SAVE SETTINGS
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        "phone",
        phone
      );

      formData.append(
        "gst",
        gst
      );

      formData.append(
        "fssai",
        fssai
      );

      formData.append(
        "address",
        address
      );

      formData.append(
        "username",
        username
      );

      formData.append(
        "email",
        email
      );

      formData.append(
        "password",
        password
      );

      if (logo) {
        formData.append(
          "logo",
          logo
        );
      }

      const response =
        await fetch(
          "/api/admin/settings",
          {
            method: "PUT",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        alert(
          data.message ||
            "Failed to save settings"
        );
        return;
      }

      alert(
        "Settings saved successfully!"
      );

      /*
       * Update logo URL
       */
      if (data.logo) {
        if (
          data.logo.startsWith(
            "http://"
          ) ||
          data.logo.startsWith(
            "https://"
          ) ||
          data.logo.startsWith("/")
        ) {
          setLogoUrl(
            data.logo
          );
        } else {
          setLogoUrl(
            `/uploads/${data.logo}`
          );
        }
      }

      /*
       * Clear selected file
       */
      setLogo(null);
      setLogoPreview("");
      setPassword("");
    } catch (error) {
      console.error(
        "SAVE SETTINGS ERROR:",
        error
      );

      alert(
        "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div
        style={{
          padding: "30px",
          fontSize: "14px",
        }}
      >
        Loading settings...
      </div>
    );
  }

  return (
    <div className="settings-page">
      <style jsx>{`
        .settings-page {
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

        .settings-card {
          background: #fff;
          border-radius: 10px;
          padding: 30px;
          box-shadow:
            0 2px 10px
            rgba(0, 0, 0, 0.05);
        }

        .settings-title {
          font-size: 20px;
          font-weight: 600;
          color: #222;
          margin-bottom: 25px;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 22px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          color: #000;
          background: #fff;
          outline: none;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #222;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #888;
        }

        .form-group textarea {
          min-height: 110px;
          resize: vertical;
          font-family: Arial, sans-serif;
        }

        .logo-input {
          width: 100%;
        }

        .logo-preview {
          margin-top: 15px;
          width: 160px;
          height: 160px;
          border: 1px solid #ddd;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #f8f8f8;
        }

        .logo-preview img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .logo-placeholder {
          color: #999;
          font-size: 13px;
          text-align: center;
          padding: 10px;
        }

        .button-area {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
        }

        .save-button {
          padding: 12px 25px;
          border: none;
          border-radius: 6px;
          background: #222;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .save-button:hover {
          background: #333;
        }

        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 700px) {
          .settings-card {
            padding: 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full-width {
            grid-column: span 1;
          }

          .button-area {
            justify-content: stretch;
          }

          .save-button {
            width: 100%;
          }
        }
      `}</style>

      <div className="page-header">
        <h1>Settings</h1>

        <p>
          Manage your admin account
          and business information.
        </p>
      </div>

      <div className="settings-card">
        <div className="settings-title">
          Admin Settings
        </div>

        <form
          onSubmit={handleSubmit}
        >
          <div className="form-grid">

            {/* PHONE */}
            <div className="form-group">
              <label>
                Phone Number
              </label>

              <input
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
              />
            </div>

            {/* GST */}
            <div className="form-group">
              <label>
                GST Number
              </label>

              <input
                type="text"
                placeholder="Enter GST number"
                value={gst}
                onChange={(e) =>
                  setGst(
                    e.target.value
                  )
                }
              />
            </div>

            {/* FSSAI */}
            <div className="form-group">
              <label>
                FSSAI Certificate Number
              </label>

              <input
                type="text"
                placeholder="Enter FSSAI certificate number"
                value={fssai}
                onChange={(e) =>
                  setFssai(
                    e.target.value
                  )
                }
              />
            </div>

            {/* USERNAME */}
            <div className="form-group">
              <label>
                Username
              </label>

              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
              />
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label>
                Email ID
              </label>

              <input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label>
                New Password
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
              />
            </div>

            {/* ADDRESS */}
            <div className="form-group full-width">
              <label>
                Business Address
              </label>

              <textarea
                placeholder="Enter complete business address"
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
              />
            </div>

            {/* LOGO */}
            <div className="form-group full-width">
              <label>
                Business Logo
              </label>

              <input
                className="logo-input"
                type="file"
                accept="image/*"
                onChange={
                  handleLogoChange
                }
              />

              <div className="logo-preview">

                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="New Logo Preview"
                  />
                ) : logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Business Logo"
                  />
                ) : (
                  <div className="logo-placeholder">
                    Logo Preview
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* SAVE */}
          <div className="button-area">
            <button
              type="submit"
              className="save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}