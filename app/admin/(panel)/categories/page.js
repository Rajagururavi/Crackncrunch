"use client";
import { useCallback, useEffect, useState } from "react";
export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const loadCategories = useCallback(async () => {
    try {
      setFetching(true);
      const response = await fetch("/api/admin/categories", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load categories");
      }
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (error) {
      console.error("Load categories error:", error);
    } finally {
      setFetching(false);
    }
  }, []);
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);
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
    setEditingCategory(null);
    setCategoryName("");
    setCategoryImage(null);
    setPreviewImage("");
    setShowModal(true);
  };
  const openEditModal = (category) => {
    clearPreviewUrl();
    setEditingCategory(category);
    setCategoryName(category.name || "");
    setCategoryImage(null);
    setPreviewImage(category.image || "");
    setShowModal(true);
  };
  const closeModal = () => {
    clearPreviewUrl();
    setShowModal(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryImage(null);
    setPreviewImage("");
  };
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearPreviewUrl();
    setCategoryImage(file);
    const imageUrl = URL.createObjectURL(file);
    setImagePreviewUrl(imageUrl);
    setPreviewImage(imageUrl);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert("Please enter category name");
      return;
    }
    if (!editingCategory && !categoryImage) {
      alert("Please select category image");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", categoryName.trim());
      if (categoryImage) {
        formData.append("image", categoryImage);
      }
      let response;
      if (editingCategory) {
        formData.append("id", editingCategory._id);
        response = await fetch("/api/admin/categories", {
          method: "PUT",
          body: formData,
        });
      } else {
        response = await fetch("/api/admin/categories", {
          method: "POST",
          body: formData,
        });
      }
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || "Something went wrong");
        return;
      }
      alert(data.message || "Category saved successfully");
      closeModal();
      await loadCategories();
    } catch (error) {
      console.error("Save category error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const openDeleteModal = (category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };
  const closeDeleteModal = () => {
    if (loading) return;
    setDeletingCategory(null);
    setShowDeleteModal(false);
  };
  const handleDelete = async () => {
    if (!deletingCategory || loading) return;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: deletingCategory._id,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.message || "Delete failed");
        return;
      }
      alert(data.message || "Category deleted successfully");
      setShowDeleteModal(false);
      setDeletingCategory(null);
      await loadCategories();
    } catch (error) {
      console.error("Delete category error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="categories-page">
      <style jsx>{`
        .categories-page {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          color: #252525;
          box-sizing: border-box;
        }
        .categories-page *, .categories-page *::before, .categories-page *::after {
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
        .category-image {
          width: 55px;
          height: 55px;
          object-fit: cover;
          border-radius: 7px;
          border: 1px solid #eee;
          display: block;
        }
        .category-name {
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
        .mobile-categories {
          display: none;
        }
        .category-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 13px;
          border-bottom: 1px solid #eee;
          min-width: 0;
        }
        .category-card:last-child {
          border-bottom: none;
        }
        .category-card-image {
          width: 65px;
          height: 65px;
          flex-shrink: 0;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #eee;
          background: #f8f8f8;
        }
        .category-card-content {
          flex: 1;
          min-width: 0;
        }
        .category-card-number {
          display: block;
          color: #999;
          font-size: 11px;
          margin-bottom: 5px;
        }
        .category-card-name {
          color: #222;
          font-size: 14px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }
        .category-card-actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }
        .category-card-actions button {
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
          color: #333;
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
          .mobile-categories {
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
          .category-card {
            gap: 9px;
            padding: 11px 9px;
          }
          .category-card-image {
            width: 53px;
            height: 53px;
          }
          .category-card-name {
            font-size: 12px;
          }
          .category-card-actions button {
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
        <h1 className="page-title">Categories</h1>
        <button type="button" className="add-button" onClick={openAddModal}>
          + Add Category
        </button>
      </div>
      <div className="table-box">
        {fetching ? (
          <div className="empty">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="empty">
            No categories found
          </div>
        ) : (
          <>
            <div className="desktop-table table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Image</th>
                    <th>Category Name</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category._id}>
                      <td>{index + 1}</td>
                      <td>
                        {category.image && (
                          <img src={category.image} alt={category.name || "Category"} className="category-image" />
                        )}
                      </td>
                      <td>
                        <span className="category-name">
                          {category.name}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button type="button" className="edit-button" onClick={() => openEditModal(category)}>
                            Edit
                          </button>
                          <button type="button" className="delete-button" onClick={() => openDeleteModal(category)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-categories">
              {categories.map((category, index) => (
                <div className="category-card" key={category._id}>
                  {category.image ? (
                    <img src={category.image} alt={category.name || "Category"} className="category-card-image"/>
                  ) : (
                    <div className="category-card-image" />
                  )}
                  <div className="category-card-content">
                    <span className="category-card-number">
                      Category #{index + 1}
                    </span>
                    <div className="category-card-name">
                      {category.name}
                    </div>
                  </div>
                  <div className="category-card-actions">
                    <button type="button" className="edit-button" onClick={() => openEditModal(category)}>
                      Edit
                    </button>
                    <button type="button" className="delete-button" onClick={() => openDeleteModal(category)}>
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
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
            <h2 className="modal-title" id="category-modal-title">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="category-name">
                  Category Name
                </label>
                <input id="category-name" type="text" className="input" placeholder="Enter category name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required disabled={loading}/>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="category-image">
                  Category Image
                </label>
                <input id="category-image" type="file" className="file-input" accept="image/*" onChange={handleImageChange} disabled={loading} required={!editingCategory}/>
                <p className="image-help">
                  {editingCategory ? "Select a new image only if you want to replace the current image." : "Please select an image for this category."}
                </p>
                {previewImage && (
                  <div className="preview">
                    <img src={previewImage} alt="Category preview" />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="save-button" disabled={loading}>
                  {loading ? "Saving..." : editingCategory ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && deletingCategory && (
        <div className="modal-overlay" onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            closeDeleteModal();
          }
        }}>
          <div className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-category-title">
            <div className="delete-icon">
              !
            </div>
            <h3 id="delete-category-title">
              Delete Category?
            </h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deletingCategory.name}</strong>?
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