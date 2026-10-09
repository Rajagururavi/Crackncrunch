"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
function createSlug(text) {
  return (text ?.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "");
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
    if (typeof value === "string" && value.trim()) {
      return value;
    }
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
        const response = await fetch("/api/products", {cache: "no-store",});
        if (!response.ok) {
          throw new Error(`Failed to load products (${response.status})`);
        }
        const data = await response.json();
        const products = Array.isArray(data) ? data : Array.isArray(data.products) ? data.products : [];
        const productData = products.find((item) => createSlug(item.productName) === slug);
        if (!productData) {
          throw new Error("Product not found");
        }
        if (cancelled) return;
        setProduct(productData);
        const productImages = Array.isArray(productData.images) ? productData.images.filter(Boolean) : [productData.image1, productData.image2, productData.image3,].filter(Boolean);
        setSelectedImage(productImages[0] || "");
        setSelectedWeight("");
        setQuantity(1);
        const currentId = String(productData._id || "");
        setRelatedProducts(products.filter((item) => String(item._id || "") !== currentId).slice(0, 4));
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
    return () => {cancelled = true;};
  }, [slug]);
  const productName = useMemo(() => product?.productName || "Product", [product]);
  const basePrice = useMemo(() => Number(product?.price || 0), [product]);
  const offerPrice = useMemo(() => Number(product?.offerPrice || 0), [product]);
  const description = useMemo(() => getDescription(product), [product]);
  const images = useMemo(() => {
    if (!product) return [];
    const productImages = Array.isArray(product.images) ? product.images : [product.image1, product.image2, product.image3];
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
  const changeImg = (image) => {setSelectedImage(image);};
  const handleImageMove = (event) => {
    if (window.matchMedia("(hover: none)").matches) return;
    const image = event.currentTarget;
    const rect = image.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    image.style.transformOrigin = `${x}% ${y}%`;
    image.style.transform = "scale(2)";
  };
  const handleImageLeave = (event) => {
    event.currentTarget.style.transform = "scale(1)";
    event.currentTarget.style.transformOrigin = "center center";
  };
  const increaseQuantity = () => {setQuantity((qty) => qty + 1);};
  const decreaseQuantity = () => {setQuantity((qty) => Math.max(1, qty - 1));};
  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!product) return;
    if (!selectedWeight) {
      alert("Please select a weight.");
      return;
    }
    const selectedOption = weightOptions.find((option) => option.value === selectedWeight);
    const productId = String(product._id || product.id || "");
    if (!productId) {
      alert("Product ID not found.");
      return;
    }
    const unitPrice = actualUnitPrice * (selectedOption?.multiplier || 1);
    const cartItem = {product_id: productId, product_title: productName, product_image: getImageUrl(images[0] || product.image1 || ""),
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
      const existingIndex = cart.findIndex((item) => String(item.product_id) === productId && String(item.weight) === selectedWeight);
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
        button, input, select {
          font: inherit;
        }
        .product-loading {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          color: #755b53;
          font-size: 17px;
          text-align: center;
        }
        .product-error {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 30px 20px;
          color: #755b53;
          text-align: center;
        }
        .product-error h2 {
          margin: 0 0 10px;
          color: #b85e48;
          font-size: 28px;
        }
        .product-error p {
          max-width: 550px;
          line-height: 1.7;
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
          width: 100%;
          min-width: 0;
          display: grid;
          grid-template-columns: 82px minmax(0, 1fr);
          align-items: start;
          gap: 15px;
          padding: 0;
          background: transparent;
        }
        .thumbs {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 470px;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 2px 4px 2px 2px;
          scrollbar-width: thin;
          scrollbar-color: #e6b9a6 #fff3ed;
        }
        .thumbs img {
          width: 76px;
          height: 76px;
          flex: 0 0 auto;
          object-fit: cover;
          border: 2px solid #f0e1d9;
          border-radius: 11px;
          background: #fff;
          cursor: pointer;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }
        .thumbs img:hover {
          border-color: #d99a78;
          transform: translateY(-2px);
        }
        .thumbs img.active-thumb {
          border-color: #c97853;
          box-shadow: 0 0 0 2px rgba(201, 120, 83, 0.14);
        }
        .main-image {
          position: relative;
          min-width: 0;
          overflow: hidden;
          border: 1px solid #f0e4dc;
          border-radius: 15px;
          background: #fffdfb;
          cursor: zoom-in;
        }
        .main-image img {
          display: block;
          width: 100%;
          height: 460px;
          object-fit: contain;
          border: 0;
          border-radius: 14px;
          transition: transform 0.35s ease;
          transform-origin: center center;
        }
        .product-details {
          min-width: 0;
          padding: 10px 5px 10px 15px;
          background: transparent;
        }
        .product-details h1 {
          margin: 0 0 14px;
          color: #34251f;
          font-size: clamp(25px, 2.4vw, 35px);
          font-weight: 700;
          line-height: 1.35;
          letter-spacing: -0.5px;
          overflow-wrap: anywhere;
        }
        .price {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
          margin: 20px 0;
          color: #bd6945;
          font-size: clamp(25px, 2.4vw, 32px);
          font-weight: 700;
          line-height: 1.3;
        }
        .old-price {
          margin-left: 4px;
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
          text-align: left;
          overflow-wrap: anywhere;
          word-break: normal;
        }
        .description p {
          margin: 0 0 12px;
          white-space: pre-wrap;
        }
        .description h1, .description h2, .description h3, .description h4 {
          margin: 18px 0 10px;
          color: #443128;
          line-height: 1.45;
        }
        .description ul, .description ol {
          padding-left: 24px;
          margin: 10px 0 16px;
        }
        .description li {
          margin-bottom: 5px;
        }
        .description a {
          color: #b85e3c;
          text-decoration: underline;
          overflow-wrap: anywhere;
        }
        .description img {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 12px 0;
          border-radius: 8px;
        }
        .description table {
          display: block;
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          border-collapse: collapse;
        }
        .description th, .description td {
          padding: 9px 12px;
          border: 1px solid #eadbd2;
          text-align: left;
        }
        .weight-section {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin: 25px 0 20px;
        }
        .weight-section label, .quantity-section label {
          color: #44352e;
          font-size: 15px;
          font-weight: 600;
        }
        .weight-section select {
          width: 210px;
          max-width: 100%;
          min-height: 44px;
          padding: 10px 36px 10px 13px;
          border: 1px solid #e8d5ca;
          border-radius: 9px;
          outline: none;
          background-color: #fff;
          color: #44352e;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .weight-section select:focus {
          border-color: #c97853;
          box-shadow: 0 0 0 3px rgba(201, 120, 83, 0.13);
        }
        .quantity-section {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin: 20px 0;
        }
        .qty-box {
          display: inline-flex;
          align-items: center;
          overflow: hidden;
          border: 1px solid #e8d5ca;
          border-radius: 9px;
          background: #fff;
        }
        .qty-box button {
          width: 43px;
          height: 43px;
          padding: 0;
          border: 0;
          background: #fff5ef;
          color: #75452f;
          font-size: 22px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .qty-box button:hover {
          background: #f9e4d8;
        }
        .qty-box button:focus-visible {
          outline: 2px solid #c97853;
          outline-offset: -3px;
        }
        .qty-box input {
          width: 52px;
          height: 43px;
          padding: 0;
          border: 0;
          outline: none;
          background: #fff;
          color: #44352e;
          text-align: center;
          font-size: 15px;
          font-weight: 600;
        }
        .cart-buttons {
          margin-top: 25px;
        }
        .add-cart-btn {
          display: block;
          width: 100%;
          min-height: 50px;
          padding: 14px 20px;
          border: 0;
          border-radius: 10px;
          background: #bd704d;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.2px;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 5px 14px rgba(189, 112, 77, 0.16);
          transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
        }
        .add-cart-btn:hover:not(:disabled) {
          background: #a95e3d;
          box-shadow: 0 7px 18px rgba(169, 94, 61, 0.22);
          transform: translateY(-1px);
        }
        .add-cart-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .add-cart-btn.not-selected {
          background: #bd704d;
        }
        .add-cart-btn.disabled, .add-cart-btn:disabled {
          background: #b7aaa3;
          box-shadow: none;
          cursor: not-allowed;
          opacity: 0.8;
        }
        .product-divider {
          width: auto;
          height: 1px;
          margin: 0 auto;
          background: #eadfd9;
        }
        .product-tabs {
          width: calc(100% - 60px);
          max-width: 1140px;
          margin: 25px auto 50px;
        }
        .tab-header {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 35px;
          margin-bottom: 25px;
          border-bottom: 1px solid #eadfd9;
        }
        .tab-btn {
          position: relative;
          padding: 16px 2px;
          border: 0;
          background: transparent;
          color: #776c66;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .tab-btn::after {
          position: absolute;
          right: 0;
          bottom: -1px;
          left: 0;
          height: 3px;
          border-radius: 3px 3px 0 0;
          background: #bd704d;
          content: "";
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.25s ease;
        }
        .tab-btn:hover, .tab-btn.active {
          color: #ad613f;
        }
        .tab-btn.active::after {
          transform: scaleX(1);
        }
        .tab-btn:focus-visible {
          outline: 2px solid #c97853;
          outline-offset: 3px;
        }
        .tab-content {
          color: #665d57;
          font-size: 14px;
          line-height: 1.85;
        }
        .tab-content h3 {
          margin: 0 0 18px;
          color: #392b24;
          font-size: 21px;
          font-weight: 700;
        }
        .tab-content p {
          margin: 10px 0;
        }
        .benefits-list {
          margin-top: 12px;
          padding-left: 22px;
        }
        .benefits-list h6, .specification-list h6 {
          margin: 0 0 10px;
          color: #665d57;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }
        .benefits-list h6:not(:first-child)::before {
          content: "✓ ";
          color: #b96c48;
          font-weight: 700;
        }
        .specification-list {
          margin-top: 10px;
        }
        .specification-list strong, .tab-content strong {
          color: #44352e;
        }
        #additional, #shipping {
          padding: 5px 0;
        }
        #additional p, #shipping p {
          margin: 0;
          padding: 13px 15px;
          border-bottom: 1px solid #f0e5df;
        }
        #additional p:last-child, #shipping p:last-child {
          border-bottom: 0;
        }
        .nutrition-table {
          width: 100%;
          max-width: 850px;
          margin: 18px auto;
          border-collapse: collapse;
          background: #fff;
          font-size: 14px;
        }
        .nutrition-table th, .nutrition-table td {
          padding: 12px 16px;
          border: 1px solid #eadfd9;
          text-align: left;
        }
        .nutrition-table th {
          background: #fff0e8;
          color: #533b2e;
          font-weight: 700;
        }
        .nutrition-table tbody tr:nth-child(even) {
          background: #fffbf8;
        }
        .nutrition-table tbody tr:hover {
          background: #fff2e9;
        }
        .related-products-section {
          width: calc(100% - 60px);
          max-width: 1140px;
          margin: 45px auto 70px;
        }
        .related-title {
          margin: 0 0 28px;
          color: #34251f;
          font-size: clamp(23px, 2.5vw, 30px);
          font-weight: 700;
          line-height: 1.35;
        }
        .related-products {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          margin: 0;
        }
        .related-card {
          display: flex;
          min-width: 0;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #f0e5df;
          border-radius: 14px;
          background: #fff;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(106, 66, 44, 0.045);
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .related-card:hover {
          border-color: #e2c1af;
          box-shadow: 0 10px 25px rgba(106, 66, 44, 0.1);
          transform: translateY(-4px);
        }
        .related-card img {
          display: block;
          width: 100%;
          height: 230px;
          padding: 8px;
          object-fit: contain;
          background: #fffdfb;
        }
        .related-card h4 {
          margin: 0;
          padding: 15px 15px 7px;
          color: #44352e;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.55;
          overflow-wrap: anywhere;
        }
        .related-card p {
          margin: auto 0 0;
          padding: 0 15px 16px;
          color: #bd6945;
          font-size: 17px;
          font-weight: 700;
        }
        @media (max-width: 1024px) {
          .product-view-wrapper {
            width: calc(100% - 32px);
            padding: 22px;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 22px;
          }
          .product-gallery {
            grid-template-columns: 65px minmax(0, 1fr);
            gap: 10px;
          }
          .thumbs {
            gap: 10px;
          }
          .thumbs img {
            width: 60px;
            height: 60px;
          }
          .main-image img {
            height: 390px;
          }
          .product-details {
            padding: 5px 0 5px 5px;
          }
          .product-details h1 {
            font-size: 27px;
          }
          .price {
            font-size: 27px;
          }
          .related-products {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
          }
          .related-card img {
            height: 210px;
          }
        }
        @media (max-width: 768px) {
          .product-view-wrapper {
            width: calc(100% - 28px);
            margin: 105px auto 30px;
            padding: 18px;
            grid-template-columns: minmax(0, 1fr);
            gap: 24px;
            border-radius: 15px;
          }
          .product-gallery {
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
          }
          .main-image {
            grid-row: 1;
          }
          .main-image img {
            width: 100%;
            height: clamp(260px, 65vw, 430px);
            max-height: 430px;
            object-fit: contain;
          }
          .thumbs {
            grid-row: 2;
            flex-direction: row;
            justify-content: flex-start;
            gap: 10px;
            max-height: none;
            overflow-x: auto;
            overflow-y: hidden;
            padding: 3px 2px 8px;
          }
          .thumbs img {
            width: 68px;
            height: 68px;
          }
          .product-details {
            padding: 0;
          }
          .product-details h1 {
            font-size: clamp(23px, 5vw, 29px);
          }
          .price {
            margin: 15px 0;
            font-size: 27px;
          }
          .description {
            margin-top: 15px;
            font-size: 14px;
            line-height: 1.8;
          }
          .weight-section {
            gap: 10px;
            margin-top: 22px;
          }
          .weight-section select {
            flex: 1;
            width: auto;
            min-width: 0;
          }
          .quantity-section {
            gap: 12px;
          }
          .cart-buttons {
            margin-top: 20px;
          }
          .product-tabs {
            width: calc(100% - 32px);
            margin: 22px auto 35px;
          }
          .tab-header {
            justify-content: flex-start;
            gap: 20px;
            margin-bottom: 20px;
            overflow-x: auto;
            flex-wrap: nowrap;
            scrollbar-width: thin;
          }
          .tab-btn {
            flex: 0 0 auto;
            padding: 14px 0;
            font-size: 14px;
            white-space: nowrap;
          }
          .tab-content h3 {
            font-size: 19px;
          }
          .benefits-list {
            padding-left: 12px;
          }
          .benefits-list h6, .specification-list h6 {
            font-size: 13px;
          }
          .nutrition-table {
            font-size: 13px;
          }
          .nutrition-table th, .nutrition-table td {
            padding: 10px;
          }
          .related-products-section {
            width: calc(100% - 32px);
            margin: 35px auto 45px;
          }
          .related-title {
            margin-bottom: 20px;
            font-size: 25px;
          }
          .related-products {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }
          .related-card img {
            height: clamp(145px, 34vw, 220px);
          }
          .related-card h4 {
            padding: 12px 12px 6px;
            font-size: 14px;
          }
          .related-card p {
            padding: 0 12px 13px;
            font-size: 16px;
          }
        }
        @media (max-width: 480px) {
          .product-view-wrapper {
            width: calc(100% - 20px);
            margin: 90px auto 24px;
            padding: 13px;
            gap: 20px;
          }
          .main-image img {
            height: 280px;
          }
          .thumbs img {
            width: 58px;
            height: 58px;
          }
          .product-details h1 {
            margin-bottom: 10px;
            font-size: 22px;
          }
          .price {
            gap: 6px;
            font-size: 24px;
          }
          .old-price {
            font-size: 15px;
          }
          .weight-section, .quantity-section {
            align-items: flex-start;
            flex-direction: column;
            gap: 9px;
            margin: 18px 0;
          }
          .weight-section select {
            width: 100%;
            min-height: 45px;
          }
          .qty-box {
            width: fit-content;
          }
          .add-cart-btn {
            min-height: 47px;
            padding: 13px 16px;
            font-size: 14px;
          }
          .product-tabs {
            width: calc(100% - 24px);
            margin-top: 18px;
          }
          .tab-header {
            gap: 18px;
          }
          .tab-btn {
            font-size: 13px;
          }
          .tab-content {
            font-size: 13px;
          }
          .tab-content h3 {
            font-size: 18px;
          }
          .nutrition-table {
            font-size: 12px;
          }
          .nutrition-table th, .nutrition-table td {
            padding: 8px 7px;
          }
          .related-products-section {
            width: calc(100% - 24px);
            margin-top: 28px;
          }
          .related-title {
            font-size: 22px;
          }
          .related-products {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }
          .related-card {
            border-radius: 10px;
          }
          .related-card img {
            height: 150px;
            padding: 5px;
          }
          .related-card h4 {
            padding: 10px 9px 5px;
            font-size: 13px;
          }
          .related-card p {
            padding: 0 9px 11px;
            font-size: 15px;
          }
        }
        @media (max-width: 350px) {
          .product-view-wrapper {
            width: calc(100% - 14px);
            padding: 10px;
          }
          .main-image img {
            height: 235px;
          }
          .thumbs img {
            width: 50px;
            height: 50px;
          }
          .product-details h1 {
            font-size: 20px;
          }
          .price {
            font-size: 22px;
          }
          .related-products-section {
            width: calc(100% - 20px);
          }
          .related-products {
            grid-template-columns: minmax(0, 1fr);
          }
          .related-card img {
            height: 210px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .thumbs img,
          .main-image img,
          .qty-box button,
          .add-cart-btn,
          .tab-btn,
          .tab-btn::after,
          .related-card {
            transition: none;
          }
        }
      `}</style>
      <div className="product-view-wrapper">
        <div className="product-gallery">
          <div className="thumbs">
            {images.map((image, index) => (
              <img key={`${image}-${index}`} className={selectedImage === image ? "active-thumb" : ""} src={getImageUrl(image)} alt={`${productName} ${index + 1}`} onClick={() => changeImg(image)} onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/uploads/no-image.png";
              }} />
            ))}
          </div>
          <div className="main-image">
            <img src={getImageUrl(selectedImage)} alt={productName} onMouseMove={handleImageMove} onMouseLeave={handleImageLeave} onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/uploads/no-image.png";
            }} />
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
          <div className="description">
            {description ? (
              /<\/?[a-z][\s\S]*?>/i.test(description) ? (
                <div dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {description}
                </p>
              )
            ) : (
              <p>
                Description not available. Check the product data
                returned by /api/products.
              </p>
            )}
          </div>
          <div className="weight-section">
            <label>
              <strong>Weight:</strong>
            </label>
            <select value={selectedWeight} onChange={(event) => setSelectedWeight(event.target.value)}>
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
              <button type="button" onClick={decreaseQuantity} aria-label="Decrease quantity">−</button>
              <input type="text" value={quantity} readOnly aria-label="Quantity" />
              <button type="button" onClick={increaseQuantity} aria-label="Increase quantity">+</button>
            </div>
          </div>
          {isAvailable ? (
            <div className="cart-buttons">
              <button type="button" className={`add-cart-btn ${!selectedWeight ? "not-selected" : ""}`} onClick={handleAddToCart}>
                Add To Cart
              </button>
            </div>
          ) : (
            <button type="button" className="add-cart-btn disabled" disabled>Currently Unavailable</button>
          )}
        </div>
      </div>
      <div className="product-divider" />
      <div className="product-tabs">
        <div className="tab-header">
          <button type="button" className={`tab-btn ${activeTab === "description" ? "active" : ""}`} onClick={() => setActiveTab("description")}>
            Description
          </button>
          <button type="button" className={`tab-btn ${activeTab === "additional" ? "active" : ""}`} onClick={() => setActiveTab("additional")}>
            Additional Information
          </button>
          <button type="button" className={`tab-btn ${activeTab === "shipping" ? "active" : "" }`} onClick={() => setActiveTab("shipping")}>
            Shipping &amp; Delivery
          </button>
        </div>
        {activeTab === "description" && (
          <div id="description" className="tab-content active-tab">
            <h3 style={{ fontWeight: 800 }}>Health Benefits</h3>
            <div className="benefits-list">
              <h6>Including almonds in your daily diet may help to:</h6>
              <h6>Support heart health</h6>
              <h6>Improve brain function and memory</h6>
              <h6>Strengthen bones and teeth</h6>
              <h6>Help manage healthy cholesterol levels</h6>
              <h6>Support skin and hair health</h6>
              <h6>Promote sustained energy levels</h6>
            </div>
            <br />
            <div className="product-divider" />
            <br />
            <h3 style={{ fontWeight: 800 }}>Product Specifications</h3>
            <div className="specification-list">
              <h6>
                <strong>Brand Name:</strong>{" "}
                {product.brand || "CRACK N CRUNCH"}
              </h6>
              <h6>
                <strong>Product Name:</strong> CRACK N CRUNCH Premium{" "}
                {productName}
              </h6>
              <h6><strong>Grade:</strong> Premium</h6>
              <h6>
                <strong>Ingredients:</strong> Refer to the product package
              </h6>
              <h6>
                <strong>Country of Origin:</strong> Refer to the product package
              </h6>
              <h6><strong>Number of Items:</strong> 1</h6>
              <h6>
                <strong>Shelf Life:</strong> Refer to the product package
              </h6>
              <h6><strong>Dimensions:</strong> As per pack size</h6>
              <h6>
                <strong>Vegetarian:</strong> As indicated on the package
              </h6>
              <h6>
                <strong>Manufacturer / Marketed by:</strong> CRACK N CRUNCH
              </h6>
              <h6><strong>Address:</strong> As per package</h6>
              <h6>
                <strong>FSSAI License No.:</strong> As mentioned on the package
              </h6>
              <h6>
                <strong>Storage Instructions:</strong> Store in a cool, dry
                place. Keep away from direct sunlight. Reseal after opening.
              </h6>
              <h6>
                <strong>Allergen Information:</strong> Check the product
                package for allergen details.
              </h6>
              <h6>
                <strong>Delivery and Shipment:</strong> Shipped in secure
                packaging.
              </h6>
              <h6>
                <strong>Returns &amp; Refund Policy:</strong> As per company
                policy.
              </h6>
            </div>
            <br />
            <div className="product-divider" />
            <br />
            <h3 style={{ fontWeight: 800 }}>Nutrition Facts</h3>
            <h6 style={{ marginLeft: "145px" }}>
              (Approximate values per 100 g; check your product packaging
              for product-specific nutrition information.)
            </h6>
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
                  ["Saturated Fatty Acids (g)", "7.8"],
                  ["Trans Fatty Acids (g)", "0"],
                  ["Monounsaturated Fatty Acids (g)", "23.8"],
                  ["Polyunsaturated Fatty Acids (g)", "7.8"],
                  ["Cholesterol (mg)", "0"],
                ].map(([name, amount]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br />
            <p>
              Nutrition values are indicative only. Refer to the product
              label for verified information.
            </p>
          </div>
        )}
        {activeTab === "additional" && (
          <div id="additional" className="tab-content active-tab">
            <p>
              <strong>Weight:</strong> Available in 250g, 500g and 1kg.
            </p>
            <p>
              <strong>Brand:</strong> {product.brand || "-"}
            </p>
            <p>
              <strong>Category:</strong> {product.category || "-"}
            </p>
          </div>
        )}
        {activeTab === "shipping" && (
          <div id="shipping" className="tab-content active-tab">
            <p>
              Orders are processed according to the store's order policy.
            </p>
            <p>
              Delivery time depends on your location and the shipping service.
            </p>
          </div>
        )}
        <div className="product-divider" />
      </div>
      <div className="related-products-section">
        <h2 className="related-title">Related Products</h2>
        <div className="related-products">
          {relatedProducts.map((item) => {
            const itemName = item.productName || "Product";
            const itemImage = Array.isArray(item.images) ? item.images[0] || item.image1 || "" : item.image1 || "";
            const itemSlug = createSlug(itemName);
            const itemPrice = Number(item.offerPrice || item.price || 0);
            return (
              <a key={String(item._id || itemName)} href={`/product/${itemSlug}`} className="related-card">
                <img src={getImageUrl(itemImage)} alt={itemName} onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/uploads/no-image.png";
                  }}/>
                <h4>{itemName}</h4>
                <p>₹{itemPrice.toLocaleString("en-IN")}</p>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}