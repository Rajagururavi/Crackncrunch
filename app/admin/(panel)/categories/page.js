"use client";
import { useEffect, useState } from "react";
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
  const loadCategories = async () => {
    try {
      const response = await fetch(
        "/api/admin/categories"
      );
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Load categories error:", error);
    }
  };
  useEffect(() => {
    loadCategories();
  }, []);
  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryImage(null);
    setPreviewImage("");
    setShowModal(true);
  };
  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryImage(null);
    setPreviewImage(category.image || "");
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setCategoryName("");
    setCategoryImage(null);
    setPreviewImage("");
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCategoryImage(file);
    const imageUrl = URL.createObjectURL(file);
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
        response = await fetch("/api/admin/categories",
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        response = await fetch("/api/admin/categories",
          {
            method: "POST",
            body: formData,
          }
        );
      }
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Something went wrong");
        return;
      }
      alert(data.message);
      closeModal();
      loadCategories();
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
    setDeletingCategory(null);
    setShowDeleteModal(false);
  };
  const handleDelete = async () => {
    if (!deletingCategory) return;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/categories",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: deletingCategory._id,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        alert(data.message || "Delete failed");
        return;
      }
      alert(data.message);
      closeDeleteModal();
      loadCategories();
    } catch (error) {
      console.error("Delete category error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        .page-title {
          margin: 0;
          font-size: 26px;
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
        }
        .add-button:hover {
          background: #444;
        }
        .table-box {
          background: white;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
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
          font-size: 14px;
        }
        td {
          color: #333;
          font-size: 14px;
        }
        .category-image {
          width: 55px;
          height: 55px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #eee;
        }
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        .edit-button, .delete-button {
          border: none;
          padding: 7px 12px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px;
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
          padding: 40px;
          color: #888;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .modal {
          width: 450px;
          max-width: 90%;
          background: white;
          border-radius: 10px;
          padding: 25px;
        }
        .modal-title {
          margin: 0 0 20px;
          font-size: 21px;
          color: #222;
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
          padding: 11px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          color: #000;
        }
        .input:focus {
          border-color: #888;
        }
        .file-input {
          width: 100%;
          font-size: 14px;
          color: #000;
        }
        .preview {
          margin-top: 12px;
        }
        .preview img {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border-radius: 7px;
          border: 1px solid #ddd;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 25px;
        }
        .cancel-button, .save-button {
          padding: 10px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
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
        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .delete-modal {
          width: 400px;
          max-width: 90%;
          background: white;
          border-radius: 10px;
          padding: 25px;
          text-align: center;
        }
        .delete-modal h3 {
          margin-top: 0;
          color: #222;
        }
        .delete-modal p {
          color: #666;
          margin-bottom: 25px;
        }
        .delete-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .no-button, .yes-button {
          padding: 10px 25px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }
        .no-button {
          border: 1px solid #ddd;
          background: white;
        }
        .yes-button {
          border: none;
          background: #e53935;
          color: white;
        }
      `}</style>
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <button className="add-button" onClick={openAddModal} >+ Add Category</button>
      </div>
      <div className="table-box">
        {categories.length === 0 ? (
          <div className="empty">
            No categories found
          </div>
        ) : (
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
                    {
                      category.image && (
                        <img src={category.image} alt={category.name} className="category-image" /> 
                      )
                    }
                  </td>
                  <td>{category.name}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-button" onClick={() => openEditModal(category) } >Edit</button>
                      <button className="delete-button" onClick={() => openDeleteModal(category) } >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">
              {editingCategory
                ? "Edit Category"
                : "Add Category"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input type="text" className="input" placeholder="Enter category name" value={categoryName} onChange={(e) => setCategoryName(e.target.value) } />
              </div>
              <div className="form-group">
                <label className="form-label">Category Image</label>
                <input type="file" className="file-input" accept="image/*" onChange={handleImageChange} />
                {previewImage && (
                  <div className="preview">
                    <img src={previewImage} alt="Preview" />
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal} >Cancel</button>
                <button type="submit" className="save-button" disabled={loading} >
                  {loading
                    ? "Saving..."
                    : editingCategory
                    ? "Update"
                    : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && deletingCategory && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>Delete Category?</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deletingCategory.name}</strong>
              ?
            </p>
            <div className="delete-actions">
              <button className="no-button" onClick={closeDeleteModal} disabled={loading} >No</button>
              <button className="yes-button" onClick={handleDelete} disabled={loading} >{loading ? "Deleting..." : "Yes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}