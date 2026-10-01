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
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadBrands();
  }, []);
  async function loadProducts() {
    try {
      const response = await fetch("/api/admin/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error("PRODUCT LOAD ERROR:", error);
    }
  }
  async function loadCategories() {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("CATEGORY LOAD ERROR:", error);
    }
  }
  async function loadBrands() {
    try {
      const response = await fetch("/api/admin/brands");
      const data = await response.json();
      if (data.success) {
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error("BRAND LOAD ERROR:", error);
    }
  }
  function resetForm() {
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
    if (image1Ref.current) {
      image1Ref.current.value = "";
    }
    if (image2Ref.current) {
      image2Ref.current.value = "";
    }
    if (image3Ref.current) {
      image3Ref.current.value = "";
    }
  }
  function openAddModal() {
    resetForm();
    setEditingProduct(null);
    setMessage("");
    setMessageType("");
    setShowModal(true);
  }
  function openEditModal(product) {
    setEditingProduct(product);
    setForm({
      productName: product.productName || "",
      productKeyword: product.productKeyword || "",
      category: product.category || "",
      brand: product.brand || "",
      description: product.description || "",
      price: product.price ?? "",
      offerPrice: product.offerPrice ?? "",
      stockStatus: product.stockStatus || "",
    });
    setImage1(null);
    setImage2(null);
    setImage3(null);
    setPreview1(product.images?.[0] || "");
    setPreview2(product.images?.[1] || "");
    setPreview3(product.images?.[2] || "");
    if (image1Ref.current) {
      image1Ref.current.value = "";
    }
    if (image2Ref.current) {
      image2Ref.current.value = "";
    }
    if (image3Ref.current) {
      image3Ref.current.value = "";
    }
    setMessage("");
    setMessageType("");
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditingProduct(null);
    resetForm();
  }
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  function handleImageChange(e, setImage, setPreview) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");
    const formData = new FormData();
    formData.append("productName", form.productName);
    formData.append("productKeyword", form.productKeyword);
    formData.append("category", form.category);
    formData.append("brand", form.brand);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("offerPrice", form.offerPrice);
    formData.append("stockStatus", form.stockStatus);
    if (image1) {
      formData.append("image1", image1);
    }
    if (image2) {
      formData.append("image2", image2);
    }
    if (image3) {
      formData.append("image3", image3);
    }
    try {
      let response;
      if (editingProduct) {
        formData.append("productId", editingProduct._id);
        response = await fetch("/api/admin/products", {
          method: "PUT",
          body: formData,
        });
      } else {
        response = await fetch("/api/admin/products", {
          method: "POST",
          body: formData,
        });
      }
      const data = await response.json();
      if (data.success) {
        setMessage(editingProduct ? "Product updated successfully!" : "Product added successfully!");
        setMessageType("success");
        await loadProducts();
        setTimeout(() => {
          closeModal();
        }, 700);
      } else {
        setMessage(
          data.message || "Something went wrong"
        );
        setMessageType("error");
      }
    } catch (error) {
      console.error("PRODUCT SAVE ERROR:", error);
      setMessage("Something went wrong. Please try again.");
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
    setDeleteProduct(null);
    setShowDeleteModal(false);
  }
  async function handleDelete() {
    if (!deleteProduct) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/admin/products",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: deleteProduct._id,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        await loadProducts();
        closeDeleteModal();
      } else {
        alert(
          data.message || "Failed to delete product"
        );
      }
    } catch (error) {
      console.error("PRODUCT DELETE ERROR:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  function getImage(product) {
    if (product.images?.length > 0) {
      return product.images[0];
    }
    return "";
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
          margin-bottom: 25px;
          gap: 20px;
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
        .add-btn:hover {
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
          border-bottom: 1px solid #eeeeee;
          font-size: 13px;
          vertical-align: middle;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .product-image {
          width: 58px;
          height: 58px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #ddd;
          background: #f5f5f5;
        }
        .no-image {
          width: 58px;
          height: 58px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #f1f1f1;
          color: #999;
          font-size: 11px;
        }
        .product-name {
          font-weight: 600;
          color: #222;
        }
        .price {
          font-weight: 600;
          color: #222;
        }
        .offer-price {
          font-weight: 600;
          color: #16803c;
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
        .edit-btn, .delete-btn {
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
        }
        .full {
          grid-column: 1 / -1;
        }
        label {
          margin-bottom: 8px;
          color: #333;
          font-size: 13px;
          font-weight: 600;
        }
        .required {
          color: #e53935;
        }
        input, select, textarea {
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
        input:focus, select:focus, textarea:focus {
          border-color: #111;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
        }
        textarea {
          min-height: 100px;
          resize: vertical;
          font-family: inherit;
        }
        .price-grid {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 20px;
        }
        .images-title {
          grid-column: 1 / -1;
          color: #222;
          font-size: 15px;
          font-weight: 700;
          margin-top: 5px;
        }
        .images-grid {
          grid-column: 1 / -1;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        .image-card {
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
        .cancel-btn, .save-btn {
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
        .save-btn:hover {
          background: #333;
        }
        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .delete-modal {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 14px;
          padding: 25px;
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
        .no-btn, .yes-btn {
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
          .full {
            grid-column: auto;
          }
          .price-grid {
            grid-column: auto;
            grid-template-columns: 1fr;
          }
          .images-grid {
            grid-column: auto;
            grid-template-columns: 1fr;
          }
          .images-title {
            grid-column: auto;
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
          <button className="add-btn" onClick={openAddModal} >+ Add Product</button>
        </div>
        <div className="table-card">
          {products.length === 0 ? (<div className="empty">No products found.</div>) : (
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
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        {getImage(product) ? (<img src={getImage(product)} alt={product.productName} className="product-image" />) : (
                          <div className="no-image">No Image</div>
                        )}
                      </td>
                      <td><span className="product-name">{product.productName}</span></td>
                      <td>{product.productKeyword}</td>
                      <td>{product.category}</td>
                      <td>{product.brand}</td>
                      <td><span className="price">₹{Number(product.price || 0).toFixed(2)}</span></td>
                      <td>
                        {product.offerPrice ? (<span className="offer-price">₹{Number(product.offerPrice).toFixed(2)}</span>) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <span className={`stock ${ product.stockStatus === "Currently Available" ? "available" : "unavailable"}`} >{product.stockStatus}</span>
                      </td>
                      <td>
                        <div className="actions">
                          <button className="edit-btn" onClick={() => openEditModal(product)} >Edit</button>
                          <button className="delete-btn" onClick={() => openDeleteModal(product)} >Delete</button>
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
              <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button className="close-btn" onClick={closeModal} >× </button>
            </div>
            <div className="modal-body">
              {message && (
                <div className={`message ${messageType === "success" ? "success" : "error"}`} >
                  {message}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Product Name{" "}<span className="required">*</span> </label>
                    <input type="text" name="productName" value={form.productName} onChange={handleChange} placeholder="Enter product name" required />
                  </div>
                  <div className="form-group">
                    <label>Product Keyword{" "}<span className="required">*</span></label>
                    <input type="text" name="productKeyword" value={form.productKeyword} onChange={handleChange} placeholder="Enter product keyword" required />
                  </div>
                  <div className="form-group">
                    <label>Category{" "}<span className="required">*</span></label>
                    <select name="category" value={form.category} onChange={handleChange} required >
                      <option value="">Select Category</option>
                      {categories.map((category) => {
                        const name = category.name || category.categoryName;
                        return (<option key={category._id} value={name} >{name}</option>);
                      })}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Brand{" "}<span className="required">*</span></label>
                    <select name="brand" value={form.brand} onChange={handleChange} required >
                      <option value="">Select Brand</option>
                      {brands.map((brand) => {
                        const name = brand.name || brand.brandName;
                        return (<option key={brand._id} value={name} >{name}</option>);
                      })}
                    </select>
                  </div>
                  <div className="form-group full">
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Enter product description" />
                  </div>
                  <div className="price-grid">
                    <div className="form-group">
                      <label>Price{" "}<span className="required">*</span></label>
                      <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="₹ 0.00" min="0" step="0.01" required />
                    </div>
                    <div className="form-group">
                      <label>Offer Price</label>
                      <input type="number" name="offerPrice" value={form.offerPrice} onChange={handleChange} placeholder="₹ 0.00" min="0" step="0.01" />
                    </div>
                    <div className="form-group">
                      <label>Stock Status{" "}<span className="required">*</span></label>
                      <select name="stockStatus" value={form.stockStatus} onChange={handleChange} required >
                        <option value="">Select Stock Status</option>
                        <option value="Currently Available">Currently Available</option>
                        <option value="Currently Unavailable">Currently Unavailable</option>
                      </select>
                    </div>
                  </div>
                  <div className="images-title">
                    Product Images
                  </div>
                  <div className="images-grid">
                    <div className="image-card">
                      <label>Image 1</label>
                      <input ref={image1Ref} className="file-input" type="file" accept="image/*" onChange={(e) => handleImageChange(e, setImage1, setPreview1)} />
                      <div className="preview">
                        {preview1 ? (<img src={preview1} alt="Product Image 1" />) : (
                          <span className="preview-empty">No image selected</span>
                        )}
                      </div>
                    </div>
                    <div className="image-card">
                      <label>Image 2</label>
                      <input ref={image2Ref} className="file-input" type="file" accept="image/*" onChange={(e) => handleImageChange(e, setImage2, setPreview2)} />
                      <div className="preview">
                        {preview2 ? (<img src={preview2} alt="Product Image 2" />) : (
                          <span className="preview-empty">No image selected</span>
                        )}
                      </div>
                    </div>
                    <div className="image-card">
                      <label>Image 3</label>
                      <input ref={image3Ref} className="file-input" type="file" accept="image/*" onChange={(e) => handleImageChange(e, setImage3, setPreview3) } />
                      <div className="preview">
                        {preview3 ? (
                          <img src={preview3} alt="Product Image 3" /> ) : (
                          <span className="preview-empty">No image selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="cancel-btn" onClick={closeModal} >Cancel</button>
                  <button type="submit" className="save-btn" disabled={loading} >
                    {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
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
              <span className="delete-product-name">{deleteProduct.productName}</span>
              ?<br />This action cannot be undone.
            </p>
            <div className="delete-actions">
              <button className="no-btn" onClick={closeDeleteModal} >No</button>
              <button className="yes-btn" onClick={handleDelete} disabled={loading} >{loading ? "Deleting..." : "Yes, Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}