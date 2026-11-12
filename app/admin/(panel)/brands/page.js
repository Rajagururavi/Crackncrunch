"use client";
import { useCallback, useEffect, useState } from "react";
export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deletingBrand, setDeletingBrand] = useState(null);
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const loadBrands = useCallback(async () => {
    try {
      setFetching(true);
      const response = await fetch("/api/admin/brands", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load brands");
      }
      setBrands(Array.isArray(data.brands) ? data.brands : []);
    } catch (error) {
      console.error("Load brands error:", error);
    } finally {
      setFetching(false);
    }
  }, []);
  useEffect(() => {
    loadBrands();
  }, [loadBrands]);
  useEffect(() => {
    if (showModal || showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal, showDeleteModal]);
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);
  const clearPreviewUrl = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl("");
    }
  };
  const openAddModal = () => {
    clearPreviewUrl();
    setEditingBrand(null);
    setBrandName("");
    setBrandImage(null);
    setPreviewImage("");
    setShowModal(true);
  };
  const openEditModal = (brand) => {
    clearPreviewUrl();
    setEditingBrand(brand);
    setBrandName(brand.name || "");
    setBrandImage(null);
    setPreviewImage(brand.image || "");
    setShowModal(true);
  };
  const closeModal = () => {
    if (loading) return;
    clearPreviewUrl();
    setShowModal(false);
    setEditingBrand(null);
    setBrandName("");
    setBrandImage(null);
    setPreviewImage("");
  };
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearPreviewUrl();
    setBrandImage(file);
    const imageUrl = URL.createObjectURL(file);
    setImagePreviewUrl(imageUrl);
    setPreviewImage(imageUrl);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!brandName.trim()) {
      alert("Please enter brand name");
      return;
    }
    if (!editingBrand && !brandImage) {
      alert("Please select brand image");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", brandName.trim());
      if (brandImage) {
        formData.append("image", brandImage);
      }
      let response;
      if (editingBrand) {
        formData.append("id", editingBrand._id);
        response = await fetch("/api/admin/brands", {
          method: "PUT",
          body: formData,
        });
      } else {
        response = await fetch("/api/admin/brands", {
          method: "POST",
          body: formData,
        });
      }
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || "Something went wrong");
        return;
      }
      alert(data.message || "Brand saved successfully");
      clearPreviewUrl();
      setShowModal(false);
      setEditingBrand(null);
      setBrandName("");
      setBrandImage(null);
      setPreviewImage("");
      await loadBrands();
    } catch (error) {
      console.error("Save brand error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const openDeleteModal = (brand) => {
    setDeletingBrand(brand);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    if (loading) return;
    setDeletingBrand(null);
    setShowDeleteModal(false);
  };
  const handleDelete = async () => {
    if (!deletingBrand || loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/brands", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: deletingBrand._id,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || "Delete failed");
        return;
      }
      alert(data.message || "Brand deleted successfully");
      setDeletingBrand(null);
      setShowDeleteModal(false);
      await loadBrands();
    } catch (error) {
      console.error("Delete brand error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="brands-page">
      <style jsx>{`
        .brands-page {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          color: #252525;
          box-sizing: border-box;
        }
        .brands-page *, .brands-page *::before, .brands-page *::after {
          box-sizing: border-box;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }
        .page-title {
          margin: 0;
          font-size: 26px;
          font-weight: 700;
          color: #222;
        }
        .add-button {
          border: none;
          background: #222;
          color: white;
          padding: 11px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          transition: 0.2s;
        }
        .add-button:hover {
          background: #444;
        }
        .table-box {
          background: white;
          border: 1px solid #eee;
          border-radius: 10px;
          overflow: hidden;
          width: 100%;
          min-width: 0;
        }
        .table-scroll {
          width: 100%;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 15px 18px;
          border-bottom: 1px solid #eee;
          text-align: left;
        }
        th {
          background: #f8f8f8;
          color: #555;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
        }
        td {
          color: #333;
          font-size: 14px;
          overflow-wrap: anywhere;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        tbody tr:hover {
          background: #fafafa;
        }
        .brand-image {
          width: 55px;
          height: 55px;
          object-fit: cover;
          border-radius: 7px;
          border: 1px solid #eee;
          display: block;
        }
        .brand-name {
          font-weight: 600;
          color: #333;
        }
        .action-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .edit-button, .delete-button {
          border: none;
          padding: 8px 13px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: 0.2s;
        }
        .edit-button {
          background: #222;
          color: white;
        }
        .delete-button {
          background: #e53935;
          color: white;
        }
        .edit-button:hover {
          background: #444;
        }
        .delete-button:hover {
          background: #c62828;
        }
        .empty {
          text-align: center;
          padding: 45px 20px;
          color: #888;
          font-size: 14px;
        }
        .mobile-brands {
          display: none;
        }
        .brand-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 13px;
          border-bottom: 1px solid #eee;
          min-width: 0;
        }
        .brand-card:last-child {
          border-bottom: none;
        }
        .brand-card-image {
          width: 65px;
          height: 65px;
          flex-shrink: 0;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #eee;
          background: #f8f8f8;
        }
        .brand-card-content {
          flex: 1;
          min-width: 0;
        }
        .brand-card-number {
          display: block;
          color: #999;
          font-size: 11px;
          margin-bottom: 5px;
        }
        .brand-card-name {
          color: #222;
          font-size: 14px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }
        .brand-card-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }
        .brand-card-actions button {
          min-width: 62px;
          padding: 7px 9px;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.58);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
          overflow-y: auto;
        }
        .modal {
          width: 450px;
          max-width: 100%;
          max-height: calc(100dvh - 40px);
          overflow-y: auto;
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
          margin: auto;
        }
        .modal-title {
          margin: 0 0 22px;
          font-size: 21px;
          color: #222;
          font-weight: 700;
        }
        .form-group {
          margin-bottom: 18px;
        }
        .form-label {
          display: block;
          margin-bottom: 7px;
          font-size: 14px;
          color: #444;
          font-weight: 500;
        }
        .input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          color: #000;
          background: white;
        }
        .input::placeholder {
          color: #777;
          opacity: 1;
        }
        .input:focus {
          border-color: #888;
        }
        .file-input {
          width: 100%;
          max-width: 100%;
          font-size: 13px;
          color: #000;
        }
        .preview {
          margin-top: 12px;
        }
        .preview img {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #ddd;
          display: block;
        }
        .image-help {
          font-size: 12px;
          color: #888;
          margin-top: 7px;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 25px;
        }
        .cancel-button, .save-button {
          min-width: 90px;
          padding: 11px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .cancel-button {
          border: 1px solid #ddd;
          background: white;
          color: #333;
        }
        .save-button {
          border: none;
          background: #222;
          color: white;
        }
        .save-button:hover {
          background: #444;
        }
        .save-button:disabled, .cancel-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .delete-modal {
          width: 400px;
          max-width: 100%;
          background: white;
          border-radius: 12px;
          padding: 28px 25px;
          text-align: center;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
          margin: auto;
        }
        .delete-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #fff0f0;
          color: #e53935;
          font-size: 23px;
          margin: 0 auto 15px;
        }
        .delete-modal h3 {
          margin: 0 0 10px;
          color: #222;
          font-size: 19px;
        }
        .delete-modal p {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 25px;
          overflow-wrap: anywhere;
        }
        .delete-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .no-button, .yes-button {
          min-width: 100px;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }
        .no-button {
          border: 1px solid #ddd;
          background: white;
          color: #222;
        }
        .yes-button {
          border: none;
          background: #e53935;
          color: white;
        }
        .yes-button:hover {
          background: #c62828;
        }
        .no-button:disabled, .yes-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 900px) {
          .page-title {
            font-size: 24px;
          }
          th, td {
            padding: 13px;
          }
        }
        @media (max-width: 600px) {
          .page-header {
            margin-bottom: 18px;
            gap: 12px;
          }
          .page-title {
            font-size: 22px;
          }
          .add-button {
            padding: 10px 13px;
            font-size: 12px;
          }
          .table-box {
            border-radius: 9px;
          }
          .desktop-table {
            display: none;
          }
          .mobile-brands {
            display: block;
          }
          .modal-overlay {
            padding: 12px;
            align-items: center;
          }
          .modal {
            padding: 20px;
            border-radius: 10px;
            max-height: calc(100dvh - 24px);
          }
          .modal-title {
            font-size: 19px;
            margin-bottom: 18px;
          }
          .form-label {
            font-size: 13px;
          }
          .input {
            padding: 11px;
            font-size: 14px;
          }
          .modal-actions {
            margin-top: 20px;
          }
          .cancel-button, .save-button {
            flex: 1;
            min-width: 0;
          }
          .delete-modal {
            padding: 23px 18px;
          }
        }
        @media (max-width: 380px) {
          .page-title {
            font-size: 20px;
          }
          .add-button {
            padding: 9px 11px;
            font-size: 11px;
          }
          .brand-card {
            gap: 9px;
            padding: 11px 9px;
          }
          .brand-card-image {
            width: 53px;
            height: 53px;
          }
          .brand-card-name {
            font-size: 12px;
          }
          .brand-card-actions button {
            min-width: 53px;
            padding: 6px 7px;
            font-size: 11px;
          }
          .modal {
            padding: 17px;
          }
          .delete-actions {
            gap: 8px;
          }
          .no-button, .yes-button {
            min-width: 0;
            flex: 1;
            padding: 10px;
          }
        }
      `}</style>
      <div className="page-header">
        <h1 className="page-title">Brands</h1>
        <button type="button" className="add-button" onClick={openAddModal}>
          + Add Brand
        </button>
      </div>
      <div className="table-box">
        {fetching ? (
          <div className="empty">
            Loading brands...
          </div>
        ) : brands.length === 0 ? (
          <div className="empty">
            No brands found
          </div>
        ) : (
          <>
            <div className="desktop-table table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Image</th>
                    <th>Brand Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand, index) => (
                    <tr key={brand._id}>
                      <td>{index + 1}</td>
                      <td>
                        {brand.image && (
                          <img src={brand.image} alt={brand.name || "Brand"} className="brand-image"/>
                        )}
                      </td>
                      <td>
                        <span className="brand-name">
                          {brand.name}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button type="button" className="edit-button" onClick={() => openEditModal(brand)}>
                            Edit
                          </button>
                          <button type="button" className="delete-button" onClick={() => openDeleteModal(brand)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-brands">
              {brands.map((brand, index) => (
                <div className="brand-card" key={brand._id}>
                  {brand.image ? (
                    <img src={brand.image} alt={brand.name || "Brand"} className="brand-card-image" />
                  ) : (
                    <div className="brand-card-image" />
                  )}
                  <div className="brand-card-content">
                    <span className="brand-card-number">
                      Brand #{index + 1}
                    </span>
                    <div className="brand-card-name">
                      {brand.name}
                    </div>
                  </div>
                  <div className="brand-card-actions">
                    <button type="button" className="edit-button" onClick={() => openEditModal(brand)}>
                      Edit
                    </button>
                    <button type="button" className="delete-button" onClick={() => openDeleteModal(brand)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget && !loading) {
            closeModal();
          }
        }}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="brand-modal-title">
            <h2 className="modal-title" id="brand-modal-title">
              {editingBrand ? "Edit Brand" : "Add Brand"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="brand-name">
                  Brand Name
                </label>
                <input id="brand-name" type="text" className="input" placeholder="Enter brand name" value={brandName}
                  onChange={(e) => setBrandName(e.target.value)} required disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="brand-image">
                  Brand Image
                </label>
                <input id="brand-image" type="file" className="file-input" accept="image/*" onChange={handleImageChange} disabled={loading} required={!editingBrand} />
                <p className="image-help">
                  {editingBrand ? "Select a new image only if you want to replace the current image." : "Please select an image for this brand."}
                </p>
                {previewImage && (
                  <div className="preview">
                    <img src={previewImage} alt="Brand preview" />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal} disabled={loading} >
                  Cancel
                </button>
                <button type="submit" className="save-button" disabled={loading} >
                  {loading ? "Saving..." : editingBrand ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && deletingBrand && (
        <div className="modal-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            closeDeleteModal();
          }
        }}>
          <div className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-brand-title">
            <div className="delete-icon">
              !
            </div>
            <h3 id="delete-brand-title">
              Delete Brand?
            </h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deletingBrand.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="delete-actions">
              <button type="button" className="no-button" onClick={closeDeleteModal} disabled={loading}>
                No, Cancel
              </button>
              <button type="button" className="yes-button" onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}