
"use client";

import { useEffect, useRef, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [form, setForm] = useState({
    productName: "",
    productKeyword: "",
    category: "",
    brand: "",
    description: "",
    price: "",
    offerPrice: "",
    stockStatus: "",
  });

  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);

  const [preview1, setPreview1] = useState("");
  const [preview2, setPreview2] = useState("");
  const [preview3, setPreview3] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const image1Ref = useRef(null);
  const image2Ref = useRef(null);
  const image3Ref = useRef(null);
  const closeTimerRef = useRef(null);

  // Safely parse JSON responses and report HTTP errors.
  async function readJson(response) {
    const text = await response.text();

    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        `Invalid API response (${response.status}). Check your API route.`
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  }

  useEffect(() => {
    async function loadInitialData() {
      setPageLoading(true);
      setPageError("");

      try {
        await Promise.all([
          loadProducts(),
          loadCategories(),
          loadBrands(),
        ]);
      } catch (error) {
        console.error("INITIAL LOAD ERROR:", error);
        setPageError(error.message || "Failed to load page data.");
      } finally {
        setPageLoading(false);
      }
    }

    loadInitialData();

    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  async function loadProducts() {
    const response = await fetch("/api/admin/products", {
      cache: "no-store",
    });

    const data = await readJson(response);

    if (!data.success) {
      throw new Error(data.message || "Failed to load products");
    }

    setProducts(
      Array.isArray(data.products) ? data.products : []
    );
  }

  async function loadCategories() {
    const response = await fetch("/api/admin/categories", {
      cache: "no-store",
    });

    const data = await readJson(response);

    if (!data.success) {
      throw new Error(data.message || "Failed to load categories");
    }

    setCategories(
      Array.isArray(data.categories) ? data.categories : []
    );
  }

  async function loadBrands() {
    const response = await fetch("/api/admin/brands", {
      cache: "no-store",
    });

    const data = await readJson(response);

    if (!data.success) {
      throw new Error(data.message || "Failed to load brands");
    }

    setBrands(
      Array.isArray(data.brands) ? data.brands : []
    );
  }

  function clearPreview(preview) {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
  }

  function resetForm() {
    clearPreview(preview1);
    clearPreview(preview2);
    clearPreview(preview3);

    setForm({
      productName: "",
      productKeyword: "",
      category: "",
      brand: "",
      description: "",
      price: "",
      offerPrice: "",
      stockStatus: "",
    });

    setImage1(null);
    setImage2(null);
    setImage3(null);

    setPreview1("");
    setPreview2("");
    setPreview3("");

    if (image1Ref.current) image1Ref.current.value = "";
    if (image2Ref.current) image2Ref.current.value = "";
    if (image3Ref.current) image3Ref.current.value = "";
  }

  function getCategoryValue(value) {
    if (value && typeof value === "object") {
      return value.name || value.categoryName || "";
    }

    return value || "";
  }

  function getBrandValue(value) {
    if (value && typeof value === "object") {
      return value.name || value.brandName || "";
    }

    return value || "";
  }

  function openAddModal() {
    resetForm();
    setEditingProduct(null);
    setMessage("");
    setMessageType("");
    setShowModal(true);
  }

  function openEditModal(product) {
    resetForm();

    setEditingProduct(product);

    setForm({
      productName: product.productName || "",
      productKeyword: product.productKeyword || "",
      category: getCategoryValue(product.category),
      brand: getBrandValue(product.brand),
      description:
        product.description ??
        product.productDescription ??
        "",
      price: product.price ?? "",
      offerPrice: product.offerPrice ?? "",
      stockStatus: product.stockStatus || "",
    });

    const images = Array.isArray(product.images)
      ? product.images
      : [product.image || product.imageUrl || product.image_url].filter(Boolean);

    setPreview1(images[0] || "");
    setPreview2(images[1] || "");
    setPreview3(images[2] || "");

    setMessage("");
    setMessageType("");
    setShowModal(true);
  }

  function closeModal() {
    if (loading) return;

    setShowModal(false);
    setEditingProduct(null);
    resetForm();
    setMessage("");
    setMessageType("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleImageChange(
    event,
    setImage,
    setPreview,
    oldPreview
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    // Optional 5 MB limit.
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image size must be 5 MB or less.");
      setMessageType("error");
      event.target.value = "";
      return;
    }

    clearPreview(oldPreview);

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
    setMessageType("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    if (!form.productName.trim()) {
      setMessage("Please enter a product name.");
      setMessageType("error");
      return;
    }

    if (form.offerPrice !== "" && Number(form.offerPrice) < 0) {
      setMessage("Offer price cannot be negative.");
      setMessageType("error");
      return;
    }

    if (
      form.offerPrice !== "" &&
      Number(form.offerPrice) > 0 &&
      Number(form.offerPrice) > Number(form.price)
    ) {
      setMessage("Offer price should not exceed the regular price.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const formData = new FormData();

      formData.append("productName", form.productName.trim());
      formData.append("productKeyword", form.productKeyword.trim());
      formData.append("category", form.category);
      formData.append("brand", form.brand);
      formData.append("description", form.description);
      formData.append("price", String(form.price));
      formData.append("offerPrice", String(form.offerPrice));
      formData.append("stockStatus", form.stockStatus);

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);

      const isEditing = Boolean(editingProduct);

      if (isEditing) {
        const productId = editingProduct._id || editingProduct.id;

        if (!productId) {
          throw new Error("Product ID is missing.");
        }

        formData.append("productId", String(productId));
      }

      const response = await fetch("/api/admin/products", {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });

      const data = await readJson(response);

      if (!data.success) {
        throw new Error(data.message || "Failed to save product");
      }

      await loadProducts();

      setMessage(
        isEditing
          ? "Product updated successfully!"
          : "Product added successfully!"
      );
      setMessageType("success");

      closeTimerRef.current = window.setTimeout(() => {
        setShowModal(false);
        setEditingProduct(null);
        resetForm();
        setMessage("");
        setMessageType("");
        closeTimerRef.current = null;
      }, 900);
    } catch (error) {
      console.error("PRODUCT SAVE ERROR:", error);
      setMessage(
        error.message || "Something went wrong. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  function openDeleteModal(product) {
    setDeleteProduct(product);
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    if (loading) return;

    setDeleteProduct(null);
    setShowDeleteModal(false);
  }

  async function handleDelete() {
    if (!deleteProduct || loading) return;

    const productId = deleteProduct._id || deleteProduct.id;

    if (!productId) {
      window.alert("Product ID is missing.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      });

      const data = await readJson(response);

      if (!data.success) {
        throw new Error(data.message || "Failed to delete product");
      }

      await loadProducts();

      setDeleteProduct(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("PRODUCT DELETE ERROR:", error);
      window.alert(error.message || "Failed to delete product.");
    } finally {
      setLoading(false);
    }
  }

  function getImage(product) {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0] || "";
    }

    return product.image || product.imageUrl || product.image_url || "";
  }

  function getCategoryName(product) {
    return getCategoryValue(product.category);
  }

  function getBrandName(product) {
    return getBrandValue(product.brand);
  }

  function getStockClass(status) {
    return /available/i.test(status || "") &&
      !/unavailable|out of stock|sold out/i.test(status || "")
      ? "available"
      : "unavailable";
  }

  return (
    <>
      <style jsx>{`
        .page {
          padding: 30px;
          min-height: 100vh;
          background: #f7f7f7;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .page-header h1 {
          margin: 0;
          color: #171717;
          font-size: 28px;
          font-weight: 700;
        }

        .page-header p {
          margin: 7px 0 0;
          color: #777;
          font-size: 14px;
        }

        .add-btn {
          padding: 12px 22px;
          color: #fff;
          background: #111;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .add-btn:hover,
        .save-btn:hover {
          background: #333;
        }

        .table-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.05);
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1100px;
          border-collapse: collapse;
        }

        th {
          padding: 15px 16px;
          text-align: left;
          color: #555;
          background: #fafafa;
          border-bottom: 1px solid #e5e5e5;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        td {
          padding: 14px 16px;
          color: #333;
          border-bottom: 1px solid #eee;
          font-size: 13px;
          vertical-align: middle;
        }

        tr:last-child td {
          border-bottom: none;
        }

        .product-image,
        .no-image {
          width: 58px;
          height: 58px;
          border-radius: 8px;
        }

        .product-image {
          object-fit: cover;
          border: 1px solid #ddd;
          background: #f5f5f5;
        }

        .no-image {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f1f1;
          color: #999;
          font-size: 11px;
        }

        .product-name,
        .price {
          color: #222;
          font-weight: 600;
        }

        .offer-price {
          color: #16803c;
          font-weight: 600;
        }

        .stock {
          display: inline-block;
          padding: 6px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .available {
          color: #147a39;
          background: #eaf8ef;
        }

        .unavailable {
          color: #c62828;
          background: #fff0f0;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .edit-btn,
        .delete-btn {
          padding: 7px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .edit-btn {
          color: #222;
          background: #f1f1f1;
          border: 1px solid #ddd;
        }

        .edit-btn:hover {
          background: #e5e5e5;
        }

        .delete-btn {
          color: #c62828;
          background: #fff0f0;
          border: 1px solid #f2c5c5;
        }

        .delete-btn:hover {
          background: #ffe0e0;
        }

        .empty {
          padding: 60px 20px;
          text-align: center;
          color: #888;
        }

        .page-error {
          margin-bottom: 16px;
          padding: 12px 15px;
          border: 1px solid #f1c0c0;
          border-radius: 8px;
          background: #fff0f0;
          color: #c62828;
          font-size: 13px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.55);
        }

        .modal {
          width: 100%;
          max-width: 1050px;
          max-height: 92vh;
          overflow-y: auto;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 25px;
          border-bottom: 1px solid #eee;
        }

        .modal-header h2 {
          margin: 0;
          color: #222;
          font-size: 20px;
        }

        .close-btn {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 50%;
          background: #f1f1f1;
          color: #333;
          font-size: 20px;
          cursor: pointer;
        }

        .close-btn:hover {
          background: #e5e5e5;
        }

        .modal-body {
          padding: 25px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .full {
          grid-column: 1 / -1;
        }

        .form-group label,
        .image-card label {
          margin-bottom: 8px;
          color: #333;
          font-size: 13px;
          font-weight: 600;
        }

        .required {
          color: #e53935;
        }

        .form-group input,
        .form-group select,
        .form-group textarea,
        .file-input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 13px;
          color: #222;
          background: #fff;
          border: 1px solid #d7d7d7;
          border-radius: 7px;
          outline: none;
          font-size: 13px;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #111;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
          font-family: inherit;
        }

        .price-grid {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .images-title {
          grid-column: 1 / -1;
          margin-top: 5px;
          color: #222;
          font-size: 15px;
          font-weight: 700;
        }

        .images-grid {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
        }

        .image-card {
          min-width: 0;
          padding: 14px;
          background: #fafafa;
          border: 1px solid #ddd;
          border-radius: 9px;
        }

        .file-input {
          padding: 8px;
          background: #fff;
          font-size: 12px;
        }

        .preview {
          width: 100%;
          height: 150px;
          margin-top: 10px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eee;
          border-radius: 7px;
        }

        .preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-empty {
          color: #999;
          font-size: 12px;
        }

        .message {
          margin-bottom: 18px;
          padding: 11px 14px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 500;
        }

        .success {
          color: #147a39;
          background: #eaf8ef;
          border: 1px solid #bde7ca;
        }

        .error {
          color: #c62828;
          background: #fff0f0;
          border: 1px solid #f1c0c0;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 18px 25px;
          border-top: 1px solid #eee;
        }

        .cancel-btn,
        .save-btn {
          padding: 11px 22px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .cancel-btn {
          color: #333;
          background: #f1f1f1;
          border: 1px solid #ddd;
        }

        .save-btn {
          color: #fff;
          background: #111;
          border: 1px solid #111;
        }

        .save-btn:disabled,
        .yes-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .delete-modal {
          width: 100%;
          max-width: 420px;
          padding: 25px;
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        }

        .delete-modal h2 {
          margin: 0 0 10px;
          color: #222;
          font-size: 20px;
        }

        .delete-modal p {
          margin: 0;
          color: #666;
          font-size: 14px;
          line-height: 1.6;
        }

        .delete-product-name {
          color: #222;
          font-weight: 700;
        }

        .delete-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 25px;
        }

        .no-btn,
        .yes-btn {
          padding: 10px 20px;
          border-radius: 7px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .no-btn {
          color: #333;
          background: #f1f1f1;
          border: 1px solid #ddd;
        }

        .yes-btn {
          color: #fff;
          background: #d32f2f;
          border: 1px solid #d32f2f;
        }

        @media (max-width: 800px) {
          .page {
            padding: 18px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .add-btn {
            width: 100%;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .full,
          .price-grid,
          .images-grid,
          .images-title {
            grid-column: auto;
          }

          .price-grid,
          .images-grid {
            grid-template-columns: 1fr;
          }

          .modal-body {
            padding: 18px;
          }
        }
      `}</style>

      <div className="page">
        <div className="page-header">
          <div>
            <h1>Products</h1>
            <p>Manage your store products.</p>
          </div>

          <button
            type="button"
            className="add-btn"
            onClick={openAddModal}
          >
            + Add Product
          </button>
        </div>

        {pageError && (
          <div className="page-error" role="alert">
            {pageError}
          </div>
        )}

        <div className="table-card">
          {pageLoading ? (
            <div className="empty">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="empty">No products found.</div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Keyword</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Offer Price</th>
                    <th>Stock Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product, index) => (
                    <tr key={product._id || product.id || index}>
                      <td>
                        {getImage(product) ? (
                          <img
                            src={getImage(product)}
                            alt={product.productName || "Product"}
                            className="product-image"
                          />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </td>

                      <td>
                        <span className="product-name">
                          {product.productName || product.name || "-"}
                        </span>
                      </td>

                      <td>{product.productKeyword || "-"}</td>
                      <td>{getCategoryName(product) || "-"}</td>
                      <td>{getBrandName(product) || "-"}</td>

                      <td>
                        <span className="price">
                          ₹{Number(product.price || 0).toFixed(2)}
                        </span>
                      </td>

                      <td>
                        {product.offerPrice !== "" &&
                        product.offerPrice != null &&
                        Number(product.offerPrice) > 0 ? (
                          <span className="offer-price">
                            ₹{Number(product.offerPrice).toFixed(2)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td>
                        <span
                          className={`stock ${getStockClass(
                            product.stockStatus
                          )}`}
                        >
                          {product.stockStatus || "Unknown"}
                        </span>
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() => openEditModal(product)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() => openDeleteModal(product)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>

              <button
                type="button"
                className="close-btn"
                onClick={closeModal}
                disabled={loading}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {message && (
                <div
                  className={`message ${
                    messageType === "success" ? "success" : "error"
                  }`}
                  role="status"
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="productName">
                      Product Name <span className="required">*</span>
                    </label>

                    <input
                      id="productName"
                      type="text"
                      name="productName"
                      value={form.productName}
                      onChange={handleChange}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="productKeyword">
                      Product Keyword <span className="required">*</span>
                    </label>

                    <input
                      id="productKeyword"
                      type="text"
                      name="productKeyword"
                      value={form.productKeyword}
                      onChange={handleChange}
                      placeholder="Enter product keyword"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">
                      Category <span className="required">*</span>
                    </label>

                    <select
                      id="category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>

                      {categories.map((category, index) => {
                        const name =
                          category.name || category.categoryName || "";

                        return (
                          <option
                            key={category._id || category.id || index}
                            value={name}
                          >
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="brand">
                      Brand <span className="required">*</span>
                    </label>

                    <select
                      id="brand"
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Brand</option>

                      {brands.map((brand, index) => {
                        const name =
                          brand.name || brand.brandName || "";

                        return (
                          <option
                            key={brand._id || brand.id || index}
                            value={name}
                          >
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="form-group full">
                    <label htmlFor="description">Description</label>

                    <textarea
                      id="description"
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="price-grid">
                    <div className="form-group">
                      <label htmlFor="price">
                        Price <span className="required">*</span>
                      </label>

                      <input
                        id="price"
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        placeholder="₹ 0.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="offerPrice">Offer Price</label>

                      <input
                        id="offerPrice"
                        type="number"
                        name="offerPrice"
                        value={form.offerPrice}
                        onChange={handleChange}
                        placeholder="₹ 0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="stockStatus">
                        Stock Status <span className="required">*</span>
                      </label>

                      <select
                        id="stockStatus"
                        name="stockStatus"
                        value={form.stockStatus}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Stock Status</option>
                        <option value="Currently Available">
                          Currently Available
                        </option>
                        <option value="Currently Unavailable">
                          Currently Unavailable
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="images-title">Product Images</div>

                  <div className="images-grid">
                    <div className="image-card">
                      <label htmlFor="image1">Image 1</label>

                      <input
                        id="image1"
                        ref={image1Ref}
                        className="file-input"
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          handleImageChange(
                            event,
                            setImage1,
                            setPreview1,
                            preview1
                          )
                        }
                      />

                      <div className="preview">
                        {preview1 ? (
                          <img src={preview1} alt="Product image 1" />
                        ) : (
                          <span className="preview-empty">
                            No image selected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="image-card">
                      <label htmlFor="image2">Image 2</label>

                      <input
                        id="image2"
                        ref={image2Ref}
                        className="file-input"
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          handleImageChange(
                            event,
                            setImage2,
                            setPreview2,
                            preview2
                          )
                        }
                      />

                      <div className="preview">
                        {preview2 ? (
                          <img src={preview2} alt="Product image 2" />
                        ) : (
                          <span className="preview-empty">
                            No image selected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="image-card">
                      <label htmlFor="image3">Image 3</label>

                      <input
                        id="image3"
                        ref={image3Ref}
                        className="file-input"
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          handleImageChange(
                            event,
                            setImage3,
                            setPreview3,
                            preview3
                          )
                        }
                      />

                      <div className="preview">
                        {preview3 ? (
                          <img src={preview3} alt="Product image 3" />
                        ) : (
                          <span className="preview-empty">
                            No image selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editingProduct
                        ? "Update Product"
                        : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deleteProduct && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h2>Delete Product?</h2>

            <p>
              Are you sure you want to delete{" "}
              <span className="delete-product-name">
                {deleteProduct.productName || deleteProduct.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="delete-actions">
              <button
                type="button"
                className="no-btn"
                onClick={closeDeleteModal}
                disabled={loading}
              >
                No
              </button>

              <button
                type="button"
                className="yes-btn"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}