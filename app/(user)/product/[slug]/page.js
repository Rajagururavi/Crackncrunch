"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
function createSlug(text) {
  return (text?.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "");
}
function getDescription(product) {
  if (!product) return "";
  const fields = [
    "description",
    "productDescription",
    "product_description",
    "product_description_html",
    "longDescription",
    "fullDescription",
    "details",
  ];
  for (const field of fields) {
    const value = product[field];
    if (typeof value === "string" && value.trim()) return value;
    if (value && typeof value === "object") {
      if (typeof value.html === "string" && value.html.trim()) {
        return value.html;
      }
      if (typeof value.text === "string" && value.text.trim()) {
        return value.text;
      }
    }
  }
  return "";
}
function getImageUrl(image) {
  if (!image || typeof image !== "string") {
    return "/uploads/no-image.png";
  }
  if (image.startsWith("https://") || image.startsWith("http://") || image.startsWith("/")) {
    return image;
  }
  return `/uploads/products/${image}`;
}
export default function ProductPage() {
  const params = useParams();
  const rawSlug = params?.slug;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const productId = String(product?._id || product?.id || product?.productId || product?.product_id || "");
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchProduct() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/products", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Failed to load products (${response.status})`);
        }
        const data = await response.json();
        const products = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
        const productData = products.find((item) => {
          const itemId = String(item._id || item.id || item.productId || item.product_id || "");
          const itemName = item.productName || item.name || item.product_name || "";
          return (itemId === slug || createSlug(itemName) === slug);
        });
        if (!productData) {
          throw new Error("Product not found");
        }
        if (cancelled) return;
        setProduct(productData);
        const productImages = Array.isArray(productData.images) ? productData.images.filter(Boolean) : [
          productData.image1,
          productData.image2,
          productData.image3,
        ].filter(Boolean);
        setSelectedImage(productImages[0] || "");
        setSelectedWeight("");
        setQuantity(1);
        const currentId = String(productData._id || productData.id || productData.productId || productData.product_id || "");
        setRelatedProducts(
          products .filter((item) => {
            const itemId = String(item._id || item.id || item.productId || item.product_id || "");
            return itemId !== currentId;
          }).slice(0, 4)
        );
      } catch (err) {
        console.error("PRODUCT LOAD ERROR:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load product.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [slug]);
  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    async function fetchReviews() {
      try {
        setReviewLoading(true);
        const response = await fetch(`/api/products/reviews?productId=${encodeURIComponent(productId)}`, { cache: "no-store" });
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          throw new Error("Reviews API route not found. Please create the reviews API.");
        }
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Unable to load reviews.");
        }
        if (!cancelled) {
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
        }
      } catch (err) {
        console.error("REVIEW FETCH ERROR:", err);
      } finally {
        if (!cancelled) {
          setReviewLoading(false);
        }
      }
    }
    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [productId]);
  const productName = useMemo(() => product?.productName || product?.name || "Product", [product]);
  const basePrice = Number(product?.price || 0);
  const offerPrice = Number(product?.offerPrice || 0);
  const description = getDescription(product);
  const images = useMemo(() => {
    if (!product) return [];
    const productImages = Array.isArray(product.images) ? product.images : [
      product.image1,
      product.image2,
      product.image3,
    ];
    return [...new Set(productImages.filter(Boolean))];
  }, [product]);
  const weightOptions = [
    { label: "250 Gram", value: "250 Gram", multiplier: 1 },
    { label: "500 Gram", value: "500 Gram", multiplier: 2 },
    { label: "1 Kg", value: "1 Kg", multiplier: 4 },
  ];
  const selectedWeightData = weightOptions.find((item) => item.value === selectedWeight);
  const multiplier = selectedWeightData?.multiplier || 1;
  const actualUnitPrice = offerPrice > 0 ? offerPrice : basePrice;
  const totalPrice = actualUnitPrice * multiplier * quantity;
  const stockStatus = String(product?.stockStatus || "").trim().toLowerCase();
  const isAvailable = [
    "currently available",
    "in stock",
    "available",
    "instock",
  ].includes(stockStatus);
  const averageRating = reviews.length > 0 ? reviews.reduce((total, item) => total + Number(item.rating || 0), 0) / reviews.length: 0;
  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!product) return;
    if (!selectedWeight) {
      alert("Please select a weight.");
      return;
    }
    const productCartId = String(product._id || product.id || product.productId || product.product_id || "");
    if (!productCartId) {
      alert("Product ID not found.");
      return;
    }
    const unitPrice = actualUnitPrice * multiplier;
    const cartItem = {
      product_id: productCartId,
      product_title: productName,
      product_image: getImageUrl(images[0] || product.image1 || ""),
      weight: selectedWeight,
      quantity,
      final_price: unitPrice * quantity,
    };
    try {
      const savedCart = localStorage.getItem("cart");
      let cart = [];
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            cart = parsedCart;
          }
        } catch {
          cart = [];
        }
      }
      const existingIndex = cart.findIndex(
        (item) =>
          String(item.product_id) === productCartId &&
          String(item.weight) === selectedWeight
      );
      if (existingIndex !== -1) {
        const newQuantity = Number(cart[existingIndex].quantity || 0) + quantity;
        cart[existingIndex].quantity = newQuantity;
        cart[existingIndex].final_price = unitPrice * newQuantity;
      } else {
        cart.push(cartItem);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      sessionStorage.setItem("openCartAfterRefresh", "true");
      window.dispatchEvent(new Event("cartUpdated"));
      window.location.reload();
    } catch (err) {
      console.error("Add cart error:", err);
      alert("Unable to add the product to cart. Please try again.");
    }
  };
  const closeReviewPopup = () => {
    if (reviewSubmitting) return;
    setReviewOpen(false);
    setReviewMessage("");
  };
  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!productId) {
      setReviewMessage("Product ID not found.");
      return;
    }
    if (!customerName.trim()) {
      setReviewMessage("Please enter your name.");
      return;
    }
    if (!reviewText.trim()) {
      setReviewMessage("Please write your review.");
      return;
    }
    try {
      setReviewSubmitting(true);
      setReviewMessage("");
      const response = await fetch("/api/products/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            customerName: customerName.trim(),
            rating: Number(reviewRating),
            review: reviewText.trim(),
          }),
        }
      );
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Reviews API route not found. Please create the reviews API.");
      }
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to submit review."
        );
      }
      if (data.review) {
        setReviews((previous) => [
          data.review,
          ...previous,
        ]);
      } else {
        const refresh = await fetch(`/api/products/reviews?productId=${encodeURIComponent(productId)}`, { cache: "no-store" });
        const refreshedData = await refresh.json();
        if (refresh.ok && Array.isArray(refreshedData.reviews)) {
          setReviews(refreshedData.reviews);
        }
      }
      setCustomerName("");
      setReviewRating(5);
      setReviewText("");
      setReviewMessage("");
      setReviewOpen(false);
      alert("Thank you! Your review has been submitted.");
    } catch (err) {
      console.error("REVIEW SUBMIT ERROR:", err);
      setReviewMessage(err.message || "Unable to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="product-loading">
        Loading product...
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="product-error">
        <h2>Product not found</h2>
        <p>{error || "Unable to find this product."}</p>
      </div>
    );
  }
  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          padding: 0;
          background: #fffaf8;
          font-family: "Poppins", Arial, sans-serif;
          color: #333;
        }
        button, input, select, textarea {
          font: inherit;
        }
        .product-loading, .product-error {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 24px;
          color: #755b53;
          text-align: center;
        }
        .product-error h2 {
          color: #b85e48;
        }
        .product-view-wrapper {
          width: calc(100% - 40px);
          max-width: 1240px;
          margin: 130px auto 45px;
          padding: 28px;
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          align-items: start;
          gap: 30px;
          background: #fff;
          border: 1px solid #f4e6df;
          border-radius: 20px;
          box-shadow: 0 8px 35px rgba(106, 66, 44, 0.07);
        }
        .product-gallery {
          display: grid;
          grid-template-columns: 82px minmax(0, 1fr);
          gap: 15px;
          min-width: 0;
        }
        .thumbs {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 470px;
          overflow: auto;
        }
        .thumbs img {
          width: 76px;
          aspect-ratio: 1768 / 2160;
          object-fit: contain;
          padding: 2px;
          border: 2px solid #f0e1d9;
          border-radius: 11px;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }
        .thumbs img.active-thumb {
          border-color: #c97853;
        }
        .main-image {
          width: 100%;
          aspect-ratio: 1768 / 2160;
          overflow: hidden;
          border: 1px solid #f0e4dc;
          border-radius: 15px;
          background: #fff;
        }
        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.35s ease;
        }
        .main-image:hover img {
          transform: scale(1.04);
        }
        .product-details {
          min-width: 0;
          padding: 10px 5px 10px 15px;
        }
        .product-details h1 {
          margin: 0 0 14px;
          color: #34251f;
          font-size: clamp(25px, 2.4vw, 35px);
          line-height: 1.35;
          overflow-wrap: anywhere;
        }
        .price {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
          margin: 20px 0;
          color: #bd6945;
          font-size: 30px;
          font-weight: 700;
        }
        .old-price {
          color: #999;
          font-size: 17px;
          font-weight: 400;
          text-decoration: line-through;
        }
        .description {
          margin-top: 20px;
          color: #6b625d;
          font-size: 15px;
          line-height: 1.85;
          overflow-wrap: anywhere;
        }
        .description img {
          max-width: 100%;
          height: auto;
        }
        .weight-section, .quantity-section {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin: 22px 0;
        }
        .weight-section select {
          width: 210px;
          min-height: 44px;
          padding: 10px;
          border: 1px solid #e8d5ca;
          border-radius: 9px;
          background: white;
        }
        .qty-box {
          display: inline-flex;
          align-items: center;
          overflow: hidden;
          border: 1px solid #e8d5ca;
          border-radius: 9px;
        }
        .qty-box button {
          width: 43px;
          height: 43px;
          border: 0;
          background: #fff5ef;
          color: #75452f;
          font-size: 22px;
          cursor: pointer;
        }
        .qty-box input {
          width: 52px;
          height: 43px;
          border: 0;
          text-align: center;
        }
        .add-cart-btn {
          width: 100%;
          min-height: 48px;
          padding: 13px 20px;
          border: 0;
          border-radius: 9px;
          background: #bd704d;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .add-cart-btn:hover {
          background: #a95e3d;
        }
        .add-cart-btn:disabled {
          background: #b7aaa3;
          cursor: not-allowed;
        }
        .product-divider {
          height: 1px;
          background: #eadfd9;
        }
        .product-tabs, .related-products-section, .reviews-section {
          width: calc(100% - 60px);
          max-width: 1140px;
          margin: 30px auto 50px;
        }
        .tab-header {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 35px;
          margin-bottom: 25px;
          border-bottom: 1px solid #eadfd9;
        }
        .tab-btn {
          padding: 16px 2px;
          border: 0;
          background: transparent;
          color: #776c66;
          font-weight: 600;
          cursor: pointer;
        }
        .tab-btn.active {
          color: #ad613f;
          border-bottom: 3px solid #bd704d;
        }
        .tab-content {
          color: #665d57;
          font-size: 14px;
          line-height: 1.85;
        }
        .tab-content h3 {
          color: #392b24;
        }
        .benefits-list h6, .specification-list h6 {
          margin: 8px 0;
        }
        .nutrition-table {
          width: 100%;
          border-collapse: collapse;
        }
        .nutrition-table th, .nutrition-table td {
          padding: 12px;
          border: 1px solid #eadfd9;
          text-align: left;
        }
        .nutrition-table th {
          background: #fff0e8;
        }
        .reviews-section {
          padding: 25px;
          border: 1px solid #f0e5df;
          border-radius: 14px;
          background: #fff;
        }
        .reviews-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }
        .reviews-title {
          margin: 0;
          color: #34251f;
          font-size: 27px;
        }
        .write-review-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: auto;
          min-width: 165px;
          min-height: 43px;
          padding: 10px 18px;
          border: 0;
          border-radius: 8px;
          background: #bd704d;
          color: white;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .write-review-btn:hover {
          background: #a95e3d;
          transform: translateY(-2px);
        }
        .review-summary {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }
        .review-average {
          color: #bd704d;
          font-size: 28px;
          font-weight: 700;
        }
        .review-stars {
          color: #e6a12d;
          letter-spacing: 2px;
        }
        .review-item {
          padding: 18px 0;
          border-top: 1px solid #eee3dc;
        }
        .review-item strong {
          display: block;
          margin-top: 8px;
          color: #44352e;
        }
        .review-item p {
          color: #665d57;
          line-height: 1.7;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }
        .review-date {
          color: #999;
          font-size: 12px;
        }
        .no-reviews {
          color: #766b65;
          padding: 15px 0;
        }
        .review-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(28, 20, 16, 0.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          animation: reviewOverlayFade 0.25s ease;
        }
        .review-modal {
          position: relative;
          width: 100%;
          max-width: 570px;
          max-height: 92vh;
          overflow-y: auto;
          padding: 38px 42px 25px;
          border: 1px solid #f0e4dc;
          border-radius: 22px;
          background: #fffdfb;
          box-shadow: 0 25px 90px rgba(0, 0, 0, 0.25);
          animation: reviewPopupEnter 0.35s ease;
        }
        .review-close-btn {
          position: absolute;
          top: 17px;
          right: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          border: 1px solid #eee2da;
          border-radius: 50%;
          background: #fff;
          color: #745b4e;
          font-size: 25px;
          line-height: 1;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .review-close-btn:hover {
          border-color: #bd704d;
          background: #bd704d;
          color: #fff;
          transform: rotate(90deg);
        }
        .review-modal-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          margin: 0 auto 15px;
          border-radius: 15px;
          background: #fff0e8;
          color: #bd704d;
          font-size: 27px;
        }
        .review-modal-heading {
          margin-bottom: 25px;
          text-align: center;
        }
        .review-eyebrow {
          display: block;
          margin-bottom: 9px;
          color: #bd704d;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 3px;
        }
        .review-modal-heading h2 {
          margin: 0;
          color: #38251d;
          font-size: 27px;
          font-weight: 800;
          line-height: 1.3;
        }
        .review-modal-heading p {
          margin: 9px 0 0;
          color: #95847a;
          font-size: 13px;
          line-height: 1.6;
        }
        .review-product-name {
          margin: 0 0 20px;
          padding: 10px 12px;
          border: 1px solid #f0e3d9;
          border-radius: 9px;
          background: #fff9f5;
          color: #74513e;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
        }
        .review-rating-box {
          margin-bottom: 23px;
          padding: 17px;
          border: 1px solid #f0e3d9;
          border-radius: 13px;
          background: #fff9f5;
          text-align: center;
        }
        .review-rating-box > label {
          display: block;
          margin: 0 0 10px;
          color: #49372e;
          font-size: 13px;
          font-weight: 700;
        }
        .rating-picker {
          display: flex;
          justify-content: center;
          gap: 9px;
        }
        .rating-picker button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #d9d0c8;
          font-size: 37px;
          line-height: 1;
          cursor: pointer;
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .rating-picker button.selected {
          color: #e5a12d;
        }
        .rating-picker button:hover {
          color: #e5a12d;
          transform: scale(1.18);
        }
        .rating-caption {
          display: block;
          margin-top: 9px;
          color: #a56542;
          font-size: 12px;
          font-weight: 700;
        }
        .review-field {
          min-width: 0;
          margin-bottom: 17px;
        }
        .review-field label {
          display: block;
          margin: 0 0 8px;
          color: #49372e;
          font-size: 13px;
          font-weight: 700;
        }
        .review-field input, .review-field textarea {
          display: block;
          width: 100%;
          min-width: 0;
          padding: 13px 14px;
          border: 1px solid #e9ddd4;
          border-radius: 10px;
          outline: none;
          background: #fff;
          color: #3d3029;
          font-family: inherit;
          font-size: 13px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .review-field input {
          min-height: 46px;
        }
        .review-field textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.6;
        }
        .review-field input::placeholder, .review-field textarea::placeholder {
          color: #b7aaa1;
        }
        .review-field input:focus, .review-field textarea:focus {
          border-color: #bd704d;
          box-shadow: 0 0 0 3px rgba(189, 112, 77, 0.1);
        }
        .review-field small {
          display: block;
          margin-top: 6px;
          color: #a2948b;
          font-size: 10px;
        }
        .review-message {
          margin: 10px 0;
          padding: 12px 14px;
          border: 1px solid #f1d4ce;
          border-radius: 9px;
          background: #fff1ee;
          color: #ae4535;
          font-size: 12px;
          line-height: 1.5;
        }
        .review-modal-actions {
          display: grid;
          grid-template-columns: 0.75fr 1.5fr;
          gap: 12px;
          margin-top: 22px;
        }
        .review-modal-actions button {
          min-height: 49px;
          border-radius: 10px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .review-cancel-btn {
          border: 1px solid #e8dcd4;
          background: #fff;
          color: #725c50;
        }
        .review-cancel-btn:hover:not(:disabled) {
          border-color: #bd704d;
          color: #bd704d;
        }
        .review-submit-btn {
          border: 0;
          background: linear-gradient(135deg, #bd704d, #914b30);
          color: #fff;
          box-shadow: 0 5px 15px rgba(189, 112, 77, 0.2);
        }
        .review-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #a95e3d, #793c27);
          box-shadow: 0 8px 20px rgba(189, 112, 77, 0.28);
          transform: translateY(-2px);
        }
        .review-submit-btn:disabled, .review-cancel-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .review-modal-footer {
          margin-top: 22px;
          padding-top: 17px;
          border-top: 1px solid #f0e6df;
          color: #a18f83;
          font-size: 11px;
          text-align: center;
        }
        @keyframes reviewOverlayFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes reviewPopupEnter {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .related-title {
          color: #34251f;
          font-size: 27px;
        }
        .related-products {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
        }
        .related-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #f0e5df;
          border-radius: 14px;
          background: white;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .related-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(106, 66, 44, 0.1);
        }
        .related-card img {
          width: 100%;
          aspect-ratio: 1768 / 2160;
          object-fit: contain;
          padding: 8px;
        }
        .related-card h4 {
          padding: 0 14px;
          color: #44352e;
        }
        .related-card p {
          padding: 0 14px;
          color: #bd6945;
          font-weight: 700;
        }
        @media (max-width: 1024px) {
          .product-view-wrapper {
            padding: 22px;
            gap: 22px;
          }
          .product-gallery {
            grid-template-columns: 65px minmax(0, 1fr);
          }
          .thumbs img {
            width: 60px;
          }
          .related-products {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 768px) {
          .product-view-wrapper {
            width: calc(100% - 28px);
            margin: 105px auto 30px;
            padding: 18px;
            grid-template-columns: 1fr;
          }
          .product-gallery {
            grid-template-columns: 1fr;
          }
          .main-image {
            grid-row: 1;
          }
          .main-image img {
            height: 350px;
          }
          .thumbs {
            grid-row: 2;
            flex-direction: row;
            max-height: none;
            overflow-x: auto;
          }
          .product-details {
            padding: 0;
          }
          .product-tabs, .related-products-section, .reviews-section {
            width: calc(100% - 32px);
          }
          .tab-header {
            justify-content: flex-start;
            gap: 18px;
            overflow-x: auto;
            flex-wrap: nowrap;
          }
          .tab-btn {
            white-space: nowrap;
          }
          .related-products {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }
        }
        @media (max-width: 600px) {
          .review-modal {
            max-width: 480px;
            padding: 32px 25px 22px;
            border-radius: 19px;
          }
          .review-modal-heading h2 {
            font-size: 24px;
          }
          .rating-picker button {
            font-size: 34px;
          }
        }
        @media (max-width: 480px) {
          .product-view-wrapper {
            width: calc(100% - 20px);
            margin-top: 90px;
            padding: 13px;
          }
          .main-image img {
            height: 280px;
          }
          .weight-section, .quantity-section {
            align-items: flex-start;
            flex-direction: column;
          }
          .weight-section select {
            width: 100%;
          }
          .reviews-section {
            padding: 16px;
          }
          .reviews-header {
            align-items: flex-start;
            flex-direction: column;
          }
          .write-review-btn {
            width: 100%;
          }
          .review-modal-overlay {
            padding: 12px;
          }
          .review-modal {
            max-height: 94vh;
            padding: 28px 18px 20px;
            border-radius: 17px;
          }
          .review-close-btn {
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            font-size: 22px;
          }
          .review-modal-icon {
            width: 42px;
            height: 42px;
            margin-bottom: 12px;
          }
          .review-modal-heading {
            margin-bottom: 20px;
          }
          .review-modal-heading h2 {
            font-size: 21px;
          }
          .review-modal-heading p {
            font-size: 12px;
          }
          .review-rating-box {
            padding: 14px 10px;
          }
          .rating-picker {
            gap: 7px;
          }
          .rating-picker button {
            font-size: 32px;
          }
          .review-field {
            margin-bottom: 14px;
          }
          .review-field input {
            min-height: 44px;
          }
          .review-modal-actions {
            grid-template-columns: 1fr 1.4fr;
            gap: 9px;
          }
          .review-modal-actions button {
            min-height: 46px;
            font-size: 12px;
          }
          .related-products {
            gap: 10px;
          }
        }
        @media (max-width: 350px) {
          .review-modal {
            padding: 25px 14px 18px;
          }
          .review-modal-heading h2 {
            font-size: 19px;
          }
          .rating-picker button {
            font-size: 28px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .review-modal-overlay, .review-modal, .review-close-btn, .rating-picker button, .review-submit-btn {
            animation: none;
            transition: none;
          }
        }
      `}</style>
      <div className="product-view-wrapper">
        <div className="product-gallery">
          <div className="thumbs">
            {images.map((image, index) => (
              <img key={`${image}-${index}`} className={selectedImage === image ? "active-thumb" : ""}
                src={getImageUrl(image)} alt={`${productName} ${index + 1}`} onClick={() => setSelectedImage(image)} onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/uploads/no-image.png";
                }}
              />
            ))}
          </div>
          <div className="main-image">
            <img src={getImageUrl(selectedImage)} alt={productName} onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/uploads/no-image.png";
            }}/>
          </div>
        </div>
        <div className="product-details">
          <h1>{productName}</h1>
          <div className="price">
            ₹{totalPrice.toLocaleString("en-IN")}
            {offerPrice > 0 && offerPrice < basePrice && (
              <span className="old-price">
                ₹{(basePrice * multiplier * quantity).toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <div className="weight-section">
            <label>
              <strong>Weight:</strong>
            </label>
            <select value={selectedWeight} onChange={(event) =>
              setSelectedWeight(event.target.value)
            }>
              <option value="">Choose an option</option>
              {weightOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="quantity-section">
            <label>
              <strong>Quantity:</strong>
            </label>
            <div className="qty-box">
              <button type="button" onClick={() => setQuantity((qty) => Math.max(1, qty - 1))}>
                −
              </button>
              <input type="text" value={quantity} readOnly />
              <button type="button" onClick={() => setQuantity((qty) => qty + 1)}>
                +
              </button>
            </div>
          </div>
          {isAvailable ? (
            <button type="button" className="add-cart-btn" onClick={handleAddToCart}>
              Add To Cart
            </button>
          ) : (
            <button type="button" className="add-cart-btn" disabled>
              Currently Unavailable
            </button>
          )}
          <div className="description">
            {description ? (/<\/?[a-z][\s\S]*?>/i.test(description) ? (
                <div dangerouslySetInnerHTML={{
                  __html: description,
                }}/>
              ) : (
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {description}
                </p>
              )
            ) : (
              <p>Description not available.</p>
            )}
          </div>
        </div>
      </div>
      <div className="product-divider" />
      <div className="product-tabs">
        <div className="tab-header">
          <button className={`tab-btn ${
            activeTab === "description" ? "active" : ""
          }`} onClick={() => setActiveTab("description")}>
            Description
          </button>
          <button className={`tab-btn ${
            activeTab === "additional" ? "active" : ""
          }`} onClick={() => setActiveTab("additional")}>
            Additional Information
          </button>
          <button className={`tab-btn ${
            activeTab === "shipping" ? "active" : ""
          }`} onClick={() => setActiveTab("shipping")}>
            Shipping &amp; Delivery
          </button>
        </div>
        {activeTab === "description" && (
          <div className="tab-content">
            <h3>Health Benefits</h3>
            <div className="benefits-list">
              <h6>Including nuts in your daily diet may help to:</h6>
              <h6>Support heart health</h6>
              <h6>Improve brain function and memory</h6>
              <h6>Strengthen bones and teeth</h6>
              <h6>Help manage healthy cholesterol levels</h6>
              <h6>Support skin and hair health</h6>
              <h6>Promote sustained energy levels</h6>
            </div>
            <hr />
            <h3>Product Specifications</h3>
            <div className="specification-list">
              <h6>
                <strong>Brand Name:</strong>{" "}
                {product.brand || "CRACK N CRUNCH"}
              </h6>
              <h6>
                <strong>Product Name:</strong> {productName}
              </h6>
              <h6>
                <strong>Grade:</strong> Premium
              </h6>
              <h6>
                <strong>Ingredients:</strong> Refer to the product package
              </h6>
              <h6>
                <strong>Country of Origin:</strong> Refer to the product package
              </h6>
              <h6>
                <strong>Shelf Life:</strong> Refer to the product package
              </h6>
              <h6>
                <strong>Storage:</strong> Store in a cool, dry place.
              </h6>
              <h6>
                <strong>Allergen Information:</strong> Check the product package.
              </h6>
            </div>
            <hr />
            <h3>Nutrition Facts</h3>
            <p>
              Approximate values per 100 g. Check your product
              packaging for verified information.
            </p>
            <table className="nutrition-table">
              <tbody>
                <tr>
                  <th>Nutrient</th>
                  <th>Amount</th>
                </tr>
                {[
                  ["Energy (kcal)", "553"],
                  ["Protein (g)", "18.2"],
                  ["Carbohydrates (g)", "30.2"],
                  ["Sugar (g)", "5.9"],
                  ["Total Fat (g)", "43.9"],
                  ["Saturated Fat (g)", "7.8"],
                  ["Trans Fat (g)", "0"],
                ].map(([name, amount]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "additional" && (
          <div className="tab-content">
            <p>
              <strong>Weight:</strong> Available in 250g,
              500g and 1kg.
            </p>
            <p>
              <strong>Brand:</strong> {product.brand || "-"}
            </p>
            <p>
              <strong>Category:</strong>{" "}
              {product.category || "-"}
            </p>
          </div>
        )}
        {activeTab === "shipping" && (
          <div className="tab-content">
            <p>
              Orders are processed according to the store's
              order policy.
            </p>
            <p>
              Delivery time depends on your location and
              shipping service.
            </p>
          </div>
        )}
      </div>
      <section className="reviews-section">
        <div className="reviews-header">
          <h2 className="reviews-title">
            Customer Reviews
          </h2>
          <button type="button" className="write-review-btn" onClick={() => {
            setReviewMessage("");
            setReviewOpen(true);
          }}>
            ✎ Write a Review
          </button>
        </div>
        <div className="review-summary">
          <div className="review-average">
            {reviews.length ? averageRating.toFixed(1) : "0.0"}{" "} / 5
          </div>
          <div>
            <div className="review-stars">
              {"★".repeat(Math.round(averageRating))}
              {"☆".repeat(5 - Math.round(averageRating))}
            </div>
            <div>
              {reviews.length} customer review(s)
            </div>
          </div>
        </div>
        {reviewLoading ? (
          <p className="no-reviews">
            Loading reviews...
          </p>
        ) : reviews.length === 0 ? (
          <p className="no-reviews">
            No reviews yet. Be the first to review this product.
          </p>
        ) : (
          reviews.map((item, index) => {
            const rating = Math.min(5, Math.max(0, Number(item.rating || 0)));
            return (
              <article className="review-item" key={item._id || item.id || index}>
                <div className="review-stars">
                  {"★".repeat(rating)}
                  {"☆".repeat(5 - rating)}
                </div>
                <strong>
                  {item.customerName || "Customer"}
                </strong>
                <p>{item.review}</p>
                <div className="review-date">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-IN") : ""}
                </div>
              </article>
            );
          })
        )}
      </section>
      {reviewOpen && (
        <div className="review-modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            closeReviewPopup();
          }
        }}>
          <div className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
            <button type="button" className="review-close-btn" onClick={closeReviewPopup} aria-label="Close review popup" disabled={reviewSubmitting}>
              ×
            </button>
            <div className="review-modal-icon">
              ✦
            </div>
            <div className="review-modal-heading">
              <span className="review-eyebrow">
                CRACK N CRUNCH
              </span>
              <h2 id="review-modal-title">
                Share Your Experience
              </h2>
              <p>
                Your feedback helps other customers
                make better choices.
              </p>
            </div>
            <div className="review-product-name">
              Product: {productName}
            </div>
            <form onSubmit={handleReviewSubmit}>
              <div className="review-rating-box">
                <label>
                  How would you rate this product?
                </label>
                <div className="rating-picker">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" aria-label={`Rate ${star} stars`} aria-pressed={reviewRating === star} className={
                      star <= reviewRating ? "selected" : ""
                    } onClick={() => setReviewRating(star)}>
                      {star <= reviewRating ? "★" : "☆"}
                    </button>
                  ))}
                </div>
                <span className="rating-caption">
                  {reviewRating === 5
                    ? "Excellent!" : reviewRating === 4
                    ? "Very Good" : reviewRating === 3
                    ? "Good" : reviewRating === 2 
                    ? "Fair" : "Poor"}
                </span>
              </div>
              <div className="review-field">
                <label htmlFor="customerName">
                  Your Name *
                </label>
                <input id="customerName" type="text" value={customerName} onChange={(event) => setCustomerName(event.target.value)} 
                  placeholder="Enter your full name" maxLength={80} autoComplete="name" required
                />
              </div>
              <div className="review-field">
                <label htmlFor="reviewText">
                  Your Review *
                </label>
                <textarea id="reviewText" value={reviewText} onChange={(event) =>
                  setReviewText(event.target.value)
                } placeholder="Tell us what you liked about this product..." maxLength={2000} required/>
                <small>
                  {reviewText.length}/2000 characters
                </small>
              </div>
              {reviewMessage && (
                <div className="review-message" role="alert">
                  {reviewMessage}
                </div>
              )}
              <div className="review-modal-actions">
                <button type="button" className="review-cancel-btn" onClick={closeReviewPopup} disabled={reviewSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="review-submit-btn" disabled={reviewSubmitting}>
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  {!reviewSubmitting && (
                    <span> →</span>
                  )}
                </button>
              </div>
            </form>
            <div className="review-modal-footer">
              Thank you for choosing Crack n Crunch!
            </div>
          </div>
        </div>
      )}
      <div className="related-products-section">
        <h2 className="related-title">
          Related Products
        </h2>
        <div className="related-products">
          {relatedProducts.map((item) => {
            const itemName = item.productName || item.name || "Product";
            const itemImage = Array.isArray(item.images) ? item.images[0] || item.image1 || "" : item.image1 || "";
            const itemSlug = createSlug(itemName);
            const itemPrice = Number(item.offerPrice || item.price || 0);
            return (
              <a key={String(item._id || item.id || itemName)}href={`/product/${itemSlug}`} className="related-card">
                <img src={getImageUrl(itemImage)} alt={itemName} onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/uploads/no-image.png";
                }}/>
                <h4>{itemName}</h4>
                <p>
                  ₹{itemPrice.toLocaleString("en-IN")}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}