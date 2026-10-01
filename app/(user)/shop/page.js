"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
export default function ShopPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 6;
  const [nutsOpen, setNutsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState(null);
  const [quickQuantity, setQuickQuantity] = useState(1);
  const [quickWeight, setQuickWeight] = useState("");
  const [selectedWeights, setSelectedWeights] = useState({});
  const [compareIds, setCompareIds] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [cart, setCart] = useState([]);
  const categoryFilter = searchParams.get("category") || "";
  const brandFilter = searchParams.get("brand") || "";
  const searchFilter = searchParams.get("search") || "";
  useEffect(() => {
    loadShopData();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, brandFilter, searchFilter]);
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedWishlist = localStorage.getItem("wishlistIds");
      if (savedWishlist) {
        setWishlistIds(JSON.parse(savedWishlist));
      }
      const savedCompare = localStorage.getItem("compareIds");
      if (savedCompare) {
        setCompareIds(JSON.parse(savedCompare));
      }
    } catch (error) {
      console.error("LocalStorage error:", error);
    }
  }, []);
  const loadShopData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/home", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!data.success) {
        setProducts([]);
        return;
      }
      const allProducts = [];
      if (Array.isArray(data.brands)) {
        data.brands.forEach((brand) => {
          if (Array.isArray(brand.products)) {
            brand.products.forEach((product) => {
              allProducts.push(product);
            });
          }
        });
      }
      const uniqueProducts = allProducts.filter(
        (product, index, self) =>
          index ===
          self.findIndex(
            (item) => String(item._id) === String(product._id)
          )
      );
      setProducts(uniqueProducts);
      setCategories(Array.isArray(data.categories) ? data.categories : []);
      setBrands(
        Array.isArray(data.brands)
          ? data.brands
          : []
      );
    } catch (error) {
      console.error("Shop loading error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  const getProductId = (product) => {
    return product?._id?.toString() || "";
  };
  const getProductTitle = (product) => {
    return product?.productName || "Product";
  };
  const getProductImage1 = (product) => {
    if (
      Array.isArray(product?.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }
    return "";
  };
  const getProductImage2 = (product) => {
    if (
      Array.isArray(product?.images) &&
      product.images.length > 1
    ) {
      return product.images[1];
    }
    return getProductImage1(product);
  };
  const getProductDescription = (product) => {
    return (
      product?.description ||
      "Premium quality product from Crack n Crunch."
    );
  };
  const getOriginalPrice = (product) => {
    return Number(product?.price || 0);
  };
  const getOfferPrice = (product) => {
    return Number(product?.offerPrice || 0);
  };
  const isProductActive = (product) => {
    const status = String(product?.stockStatus || "")
      .trim()
      .toLowerCase();
    return (status === "currently available" || status === "available" || status === "in stock");
  };
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (categoryFilter.trim()) {
      const categoryText = categoryFilter.trim().toLowerCase();
      result = result.filter((product) => {
        const category = String(product.category || "").toLowerCase();
        const productName = String(product.productName || "").toLowerCase();
        const keyword = String(product.productKeyword || "").toLowerCase();
        return (category === categoryText || productName.includes(categoryText) || keyword.includes(categoryText)
        );
      });
    }
    if (brandFilter.trim()) {
      const brandText = brandFilter.trim().toLowerCase();
      result = result.filter((product) => {
        const brand = String(product.brand || "").toLowerCase();
        return brand === brandText;
      });
    }
    if (searchFilter.trim()) {
      const searchText = searchFilter.trim().toLowerCase();
      result = result.filter((product) => {
        const name = String(product.productName || "").toLowerCase();
        const keyword = String(product.productKeyword || "").toLowerCase();
        const category = String(product.category || "").toLowerCase();
        const brand = String(product.brand || "").toLowerCase();
        return ( name.includes(searchText) || keyword.includes(searchText) || category.includes(searchText) || brand.includes(searchText));
      });
    }
    return result;
  }, [
    products,
    categoryFilter,
    brandFilter,
    searchFilter,
  ]);
  const pageTitle = categoryFilter || brandFilter || (searchFilter ? `Search: ${searchFilter}` : "Shop");
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const startIndex =(currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((page) => page + 1);
      window.scrollTo({top: 0, behavior: "smooth",});
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((page) => page - 1);
      window.scrollTo({top: 0, behavior: "smooth",});
    }
  };
  const openProductOptions = (event, product) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedProduct(product);
    setSelectedWeights((previous) => ({
      ...previous,
      [getProductId(product)]: "",
    }));
  };
  const closeProductOptions = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setSelectedProduct(null);
  };
  const getWeightMultiplier = (weight) => {
    if (weight === "250g") {
      return 1;
    }
    if (weight === "500g") {
      return 2;
    }
    if (weight === "1kg") {
      return 4;
    }
    return 1;
  };
  const getWeightPrice = (product, weight) => {
    const basePrice = getOfferPrice(product);
    return (basePrice * getWeightMultiplier(weight));
  };
  const saveCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };
  const addToCart = (event, product) => {
    event.preventDefault();
    event.stopPropagation();
    const productId = getProductId(product);
    const weight = selectedWeights[productId] || "";
    if (!weight) {
      alert("Please select a weight.");
      return;
    }
    const price = getWeightPrice(product, weight);
    const existingIndex = cart.findIndex((item) => String(item.product_id) === String(productId) && item.weight === weight);
    let updatedCart = [...cart];
    if (existingIndex !== -1) {
      const existingItem = updatedCart[existingIndex];
      const newQuantity = Number(existingItem.quantity || 1) + 1;
      updatedCart[existingIndex] = {
        ...existingItem,
        quantity: newQuantity,
        final_price: price * newQuantity,
      };
    } else {
      updatedCart.push({
        product_id: productId,
        product_title: getProductTitle(product),
        product_image: getProductImage1(product),
        weight: weight, quantity: 1, final_price: price,
      });
    }
    saveCart(updatedCart);
    setSelectedProduct(null);
    sessionStorage.setItem(
      "openCartAfterRefresh",
      "true"
    );
    window.location.reload();
  };
  const openQuickView = (product) => {
    setQuickProduct(product);
    setQuickQuantity(1);
    setQuickWeight("");
    setQuickViewOpen(true);
  };
  const closeQuickView = () => {
    setQuickViewOpen(false);
    setQuickProduct(null);
    setQuickQuantity(1);
    setQuickWeight("");
  };
  const quickViewPrice = quickProduct && quickWeight ? getWeightPrice(quickProduct, quickWeight) * quickQuantity : 0;
  const changeQuickQuantity = (change) => {
    const newQuantity = quickQuantity + change;
    if (newQuantity < 1) {
      return;
    }
    setQuickQuantity(newQuantity);
  };
  const addQuickViewToCart = (event) => {
    event.preventDefault();
    if (!quickProduct) {
      return;
    }
    if (!quickWeight) {
      alert("Please select a weight.");
      return;
    }
    const productId = getProductId(quickProduct);
    const price = getWeightPrice(quickProduct, quickWeight);
    const quantity = quickQuantity;
    const existingIndex = cart.findIndex((item) => String(item.product_id) === String(productId) && item.weight === quickWeight);
    let updatedCart = [...cart];
    if (existingIndex !== -1) {
      const existingItem = updatedCart[existingIndex];
      const newQuantity = Number(existingItem.quantity || 0) + quantity;
      updatedCart[existingIndex] = {
        ...existingItem,
        quantity: newQuantity,
        final_price: price * newQuantity,
      };
    } else {
      updatedCart.push({
        product_id: productId,
        product_title: getProductTitle(quickProduct),
        product_image: getProductImage1(quickProduct),
        weight: quickWeight,
        quantity: quantity,
        final_price: price * quantity,
      });
    }
    saveCart(updatedCart);
    closeQuickView();
    sessionStorage.setItem(
      "openCartAfterRefresh",
      "true"
    );
    window.location.reload();
  };
  const compareClicked = (event, product) => {
    event.preventDefault();
    event.stopPropagation();
    const productId = getProductId(product);
    if (compareIds.includes(productId)) {
      const updated = compareIds.filter((id) => id !== productId);
      setCompareIds(updated);
      localStorage.setItem("compareIds", JSON.stringify(updated));
    } else {
      const updated = [...compareIds, productId, ];
      setCompareIds(updated);
      localStorage.setItem("compareIds", JSON.stringify(updated)
      );
    }
  };
  const wishlistClicked = (event, product) => {
    event.preventDefault();
    event.stopPropagation();
    const productId = getProductId(product);
    let updated;
    if (wishlistIds.includes(productId)) {
      updated = wishlistIds.filter(
        (id) => id !== productId
      );
    } else {
      updated = [...wishlistIds, productId, ];
    }
    setWishlistIds(updated);
    localStorage.setItem("wishlistIds", JSON.stringify(updated));
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeQuickView();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background: #f5f5f5;
          overflow-x: hidden;
        }
        .terms-banner {
          width: 100%;
          height: 300px;
          margin-top: 110px;
          position: relative;
          overflow: hidden;
        }
        .terms-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .terms-banner::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.45);
        }
        .banner-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #fff;
          z-index: 2;
          width: 90%;
        }
        .banner-text a {
          color: #fff;
          text-decoration: none;
        }
        .banner-text h2 {
          margin: 0;
          font-size: 32px;
        }
        .shop-container {
          max-width: 1400px;
          margin: 40px auto;
          padding: 0 20px;
          display: flex;
          gap: 25px;
          align-items: flex-start;
          box-sizing: border-box;
        }
        .filter-sidebar {
          width: 280px;
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          height: fit-content;
          flex-shrink: 0;
          box-sizing: border-box;
        }
        .filter-sidebar h3 {
          margin: 0 0 15px;
          font-size: 18px;
          color: #222;
        }
        .sidebar-title {
          margin-top: 25px !important;
          padding-bottom: 12px;
          border-bottom: 1px solid #ddd;
        }
        .filter-sidebar p {
          margin: 0;
        }
        .filter-sidebar p a {
          display: block;
          padding: 11px 0;
          text-decoration: none;
          color: #333;
          border-bottom: 1px solid #eee;
          transition: 0.3s;
        }
        .filter-sidebar p a:hover {
          color: #000;
          padding-left: 8px;
          font-weight: 600;
        }
        .group-title {
          padding: 12px 0;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          font-weight: 700;
          color: #222;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .group-title:hover {
          color: #d35400;
        }
        #nuts-group {
          padding-left: 15px;
        }
        #nuts-group p a {
          font-size: 14px;
          padding: 9px 0;
        }
        .shop-products {
          flex: 1;
          min-width: 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .product-card {
          position: relative;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          transition: 0.3s;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .image-wrapper {
          position: relative;
          width: 100%;
          overflow: hidden;
        }
        .product-image {
          width: 100%;
          height: 300px;
          display: block;
          object-fit: cover;
          transition: opacity 0.4s ease;
        }
        .image1 {
          position: relative;
          z-index: 1;
        }
        .image2 {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          z-index: 2;
          transition: opacity 0.4s ease;
        }
        .image-wrapper:hover .image1 {
          opacity: 0;
        }
        .image-wrapper:hover .image2 {
          opacity: 1;
        }
        .sale-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 6px 12px;
          border-radius: 20px;
          color: #fff;
          font-size: 11px;
          font-weight: bold;
          z-index: 5;
          text-transform: uppercase;
        }
        .sale {
          background: #28a745;
        }
        .unavailable {
          background: #dc3545;
        }
        .product-hover-actions {
          position: absolute;
          top: 15px;
          right: 15px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 100;
          opacity: 0;
          visibility: hidden;
          transform: translateX(15px);
          transition: opacity 0.25s ease, visibility 0.25s ease, transform 0.25s ease;
        }
        .image-wrapper:hover .product-hover-actions {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }
        .hover-action {
          width: 42px;
          height: 42px;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0;
          margin: 0;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: #fff !important;
          color: #000 !important;
          text-decoration: none;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          box-sizing: border-box;
          box-shadow: 0 3px 10px rgba(0,0,0,0.25);
          transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
        }
        .hover-action i {
          display: block !important;
          color: #000 !important;
          font-size: 16px;
          line-height: 1;
        }
        .hover-action:hover {
          background: #000 !important;
          color: #fff !important;
          transform: scale(1.08);
        }
        .hover-action:hover i {
          color: #fff !important;
        }
        .wishlist-action.wishlist-selected {
          background: #000 !important;
          color: #e53935 !important;
        }
        .wishlist-action.wishlist-selected i {
          color: #e53935 !important;
        }
        .wishlist-action:hover {
          background: #000 !important;
        }
        .wishlist-action:hover i {
          color: #e53935 !important;
        }
        .compare-added {
          background: #28a745 !important;
          color: #fff !important;
        }
        .compare-added i {
          color: #fff !important;
        }
        .compare-added:hover {
          background: #218838 !important;
          color: #fff !important;
        }
        .product-bottom-action {
          position: absolute;
          left: 15px;
          right: 15px;
          bottom: 5px;
          z-index: 40;
          opacity: 0;
          visibility: hidden;
          transform: translateY(15px);
          transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
        }
        .image-wrapper:hover .product-bottom-action {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .select-option-btn {
          position: relative;
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #111;
          border: 1px solid rgba(255,255,255,0.9);
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8);
          transition: background 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
        }
        .option-text {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          opacity: 1;
          visibility: visible;
          white-space: nowrap;
          transition: opacity 0.2s ease;
        }
        .option-cart {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          visibility: hidden;
          font-size: 18px;
          transition: opacity 0.2s ease;
          background: transparent;
          border: 0;
          color: inherit;
          cursor: pointer;
        }
        .select-option-btn:hover {
          background: rgba(0,0,0,0.65);
          color: #fff;
          box-shadow: 0 4px 18px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .select-option-btn:hover .option-text {
          opacity: 0;
          visibility: hidden;
        }
        .select-option-btn:hover .option-cart {
          opacity: 1;
          visibility: visible;
        }
        .disabled-btn {
          background: rgba(120,120,120,0.85) !important;
          color: #fff !important;
          cursor: not-allowed !important;
          pointer-events: none;
          border: none !important;
        }
        .product-options-panel {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          background: #fff;
          z-index: 200;
          padding: 50px 25px 25px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease; box-sizing: border-box;
        }
        .product-options-panel.active {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .product-options-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: #111;
          color: #fff;
          font-size: 21px;
          line-height: 32px;
          padding: 0;
          cursor: pointer;
          z-index: 10;
        }
        .product-options-close:hover {
          background: #d32f2f;
        }
        .product-options-inner {
          width: 100%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 25px;
          box-sizing: border-box;
        }
        .product-options-inner label {
          display: block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 700;
          color: #222;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .product-option-select {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border: 1px solid #ddd;
          background: #fff;
          color: #222;
          font-size: 13px;
          outline: none;
          cursor: pointer;
        }
        .product-option-select:focus {
          border-color: #111;
        }
        .weight-add-cart {
          width: 100%;
          height: 42px;
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #111;
          color: #fff;
          border: none;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.7px;
          box-sizing: border-box;
          cursor: pointer;
          transition: background 0.3s ease, color 0.3s ease, transform 0.2s ease;
        }
        .weight-add-cart:hover {
          background: #d32f2f;
          color: #fff;
          transform: translateY(-1px);
        }
        .weight-add-cart i {
          font-size: 14px;
        }
        .product-info {
          padding: 15px;
          text-align: center;
        }
        .product-info h4 {
          margin: 0;
          font-size: 16px;
          color: #333;
          font-weight: 600;
          line-height: 1.4;
        }
        .product-info p {
          margin: 8px 0 0;
          color: #777;
          font-size: 14px;
        }
        .product-price {
          margin-top: 8px;
          font-size: 15px;
          font-weight: 700;
        }
        .old-price {
          color: #999;
          text-decoration: line-through;
          margin-right: 7px;
          font-weight: 400;
        }
        .offer-price {
          color: #111;
        }
        .no-products {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          background: #fff;
          border-radius: 12px;
        }
        .no-products i {
          font-size: 50px;
          color: #999;
          margin-bottom: 15px;
        }
        .no-products h2 {
          margin: 0;
          color: #666;
        }
        .no-products p {
          color: #888;
          margin-top: 10px;
        }
        .pagination-wrapper {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
          margin-top: 30px;
          margin-bottom: 10px;
        }
        .pagination-wrapper button {
          padding: 10px 18px;
          border: none;
          background: #222;
          color: #fff;
          cursor: pointer;
          border-radius: 5px;
          font-size: 14px;
          transition: 0.3s;
        }
        .pagination-wrapper button:hover {
          opacity: 0.8;
        }
        .pagination-wrapper button:disabled {
          background: #aaa;
          cursor: not-allowed;
          opacity: 1;
        }
        .pagination-wrapper span {
          font-size: 16px;
          font-weight: 600;
          min-width: 70px;
          text-align: center;
        }
        .quick-view-modal {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100vh;
          display: none;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
          background: rgba(0,0,0,0.60);
          z-index: 999999;
        }
        .quick-view-modal.active {
          display: flex;
        }
        .quick-view-box {
          position: relative;
          width: 900px;
          max-width: 95%;
          max-height: 90vh;
          display: flex;
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 25px 70px rgba(0,0,0,0.30);
          animation: quickViewOpen 0.25s ease;
        }
        @keyframes quickViewOpen {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(15px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .quick-view-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: #fff;
          color: #222;
          font-size: 25px;
          line-height: 1;
          cursor: pointer;
          z-index: 20;
          box-shadow: 0 3px 12px rgba(0,0,0,0.15);
          transition: 0.2s ease;
        }
        .quick-view-close:hover {
          background: #222;
          color: #fff;
        }
        .quick-view-content {
          width: 100%;
          display: flex;
          min-height: 500px;
        }
        .quick-view-image {
          width: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 35px;
          box-sizing: border-box;
          background: #f7f7f7;
        }
        .quick-view-image img {
          display: block;
          width: 100%;
          max-width: 400px;
          height: 400px;
          object-fit: contain;
        }
        .quick-view-details {
          width: 50%;
          padding: 45px 40px 35px;
          box-sizing: border-box;
          overflow-y: auto;
        }
        .quick-view-details h2 {
          margin: 0 45px 14px 0;
          color: #171717;
          font-size: 27px;
          font-weight: 700;
          line-height: 1.35;
        }
        .quick-view-price {
          margin-bottom: 20px;
          color: #111;
          font-size: 23px;
          font-weight: 700;
        }
        .quick-view-description {
          margin-bottom: 25px;
          color: #666;
          font-size: 14px;
          line-height: 1.7;
        }
        .quick-view-label {
          display: block;
          margin-bottom: 8px;
          color: #222;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .quick-view-select {
          width: 100%;
          height: 48px;
          margin-bottom: 22px;
          padding: 0 14px;
          box-sizing: border-box;
          border: 1px solid #dcdcdc;
          border-radius: 7px;
          background: #fff;
          color: #222;
          font-size: 14px;
          outline: none;
          cursor: pointer;
        }
        .quick-view-select:hover {
          border-color: #999;
        }
        .quick-quantity {
          width: fit-content;
          height: 46px;
          display: flex;
          align-items: center;
          margin-bottom: 25px;
          border: 1px solid #dcdcdc;
          border-radius: 7px;
          overflow: hidden;
          background: #fff;
        }
        .quick-quantity button {
          width: 46px;
          height: 46px;
          padding: 0;
          border: none;
          background: #f5f5f5;
          color: #222;
          font-size: 21px;
          line-height: 1;
          cursor: pointer;
        }
        .quick-quantity button:hover {
          background: #222;
          color: #fff;
        }
        .quick-quantity span {
          width: 55px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-left: 1px solid #dcdcdc;
          border-right: 1px solid #dcdcdc;
          color: #222;
          font-size: 15px;
          font-weight: 600;
          box-sizing: border-box;
        }
        .quick-add-cart {
          width: 100%;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 0 20px;
          border: none;
          border-radius: 7px;
          background: #111;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.7px;
          cursor: pointer;
        }
        .quick-add-cart:hover {
          background: #333;
          transform: translateY(-1px);
        }
        .quick-view-details::-webkit-scrollbar {
          width: 5px;
        }
        .quick-view-details::-webkit-scrollbar-track {
          background: transparent;
        }
        .quick-view-details::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
        }
        .loading-shop {
          grid-column: 1 / -1;
          background: #fff;
          border-radius: 12px;
          padding: 80px 20px;
          text-align: center;
          color: #777;
        }
        @media (min-width: 1400px) {
          .shop-container {
            max-width: 1400px;
          }
          .shop-products {
            grid-template-columns: repeat(3, 1fr);
          }
          .product-image {
            height: 300px;
          }
          .quick-view-box {
            width: 900px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1399px) {
          .shop-container {
            max-width: 1200px;
            padding: 0 20px;
          }
          .filter-sidebar {
            width: 250px;
          }
          .shop-products {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .product-image {
            height: 280px;
          }
          .quick-view-box {
            width: 850px;
            max-width: 92%;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .terms-banner {
            height: 260px;
            margin-top: 90px;
          }
          .banner-text h2 {
            font-size: 28px;
          }
          .shop-container {
            width: 100%;
            max-width: 100%;
            padding: 0 20px;
            margin: 30px auto;
            gap: 18px;
          }
          .filter-sidebar {
            width: 220px;
            padding: 18px;
          }
          .shop-products {
            flex: 1;
            min-width: 0;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }
          .product-image {
            height: 260px;
          }
          .quick-view-box {
            width: 90%;
            max-width: 90%;
          }
          .quick-view-content {
            min-height: 450px;
          }
          .quick-view-image {
            padding: 25px;
          }
          .quick-view-image img {
            height: 350px;
          }
          .quick-view-details {
            padding: 35px 25px;
          }
          .quick-view-details h2 {
            font-size: 24px;
          }
        }
        @media (min-width: 576px) and (max-width: 768px) {
          .terms-banner {
            height: 230px;
            margin-top: 80px;
          }
          .banner-text h2 {
            font-size: 25px;
          }
          .shop-container {
            width: 100%;
            display: block;
            padding: 0 15px;
            margin: 25px auto;
          }
          .filter-sidebar {
            width: 100%;
            margin-bottom: 25px;
          }
          .shop-products {
            width: 100%;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 15px;
          }
          .product-image {
            height: 240px;
          }
          .product-info {
            padding: 12px;
          }
          .product-info h4 {
            font-size: 15px;
          }
          .product-hover-actions {
            top: 10px;
            right: 10px;
            gap: 8px;
          }
          .hover-action {
            width: 38px;
            height: 38px;
            font-size: 14px;
          }
          .quick-view-modal {
            padding: 15px;
          }
          .quick-view-box {
            width: 100%;
            max-width: 100%;
            max-height: 90vh;
            overflow-y: auto;
          }
          .quick-view-content {
            display: block;
            min-height: auto;
          }
          .quick-view-image {
            width: 100%;
            height: 300px;
            padding: 20px;
          }
          .quick-view-image img {
            max-width: 280px;
            height: 260px;
          }
          .quick-view-details {
            width: 100%;
            padding: 25px 22px 30px;
            overflow-y: visible;
          }
          .quick-view-details h2 {
            font-size: 22px;
          }
        }
        @media (max-width: 575px) {
          .terms-banner {
            width: 100%;
            height: 190px;
            margin-top: 70px;
          }
          .banner-text {
            width: 90%;
          }
          .banner-text h2 {
            font-size: 22px;
            line-height: 1.3;
          }
          .shop-container {
            width: 100%;
            display: block;
            padding: 0 12px;
            margin: 20px auto;
          }
          .filter-sidebar {
            width: 100%;
            padding: 15px;
            margin-bottom: 20px;
          }
          .filter-sidebar h3 {
            font-size: 17px;
          }
          .shop-products {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
          .product-card {
            width: 100%;
            min-width: 0;
            border-radius: 8px;
          }
          .product-image {
            width: 100%;
            height: 190px;
          }
          .product-info {
            padding: 10px 7px;
          }
          .product-info h4 {
            font-size: 13px;
            line-height: 1.4;
            word-break: break-word;
          }
          .product-price {
            font-size: 12px;
          }
          .sale-badge {
            top: 7px;
            left: 7px;
            padding: 5px 7px;
            font-size: 9px;
            border-radius: 12px;
          }
          .product-hover-actions {
            top: 8px;
            right: 8px;
            gap: 6px;
          }
          .hover-action {
            width: 34px;
            height: 34px;
            font-size: 13px;
          }
          .hover-action i {
            font-size: 13px;
          }
          .product-bottom-action {
            left: 8px;
            right: 8px;
            bottom: 5px;
          }
          .select-option-btn {
            height: 38px;
            font-size: 10px;
            letter-spacing: 0.5px;
          }
          .option-cart {
            font-size: 16px;
          }
          .quick-view-modal {
            padding: 10px;
          }
          .quick-view-box {
            width: 100%;
            max-width: 100%;
            max-height: 94vh;
            display: block;
            overflow-y: auto;
            border-radius: 10px;
          }
          .quick-view-content {
            width: 100%;
            display: block;
            min-height: auto;
          }
          .quick-view-image {
            width: 100%;
            height: 240px;
            padding: 15px;
          }
          .quick-view-image img {
            width: 100%;
            max-width: 220px;
            height: 210px;
          }
          .quick-view-details {
            width: 100%;
            padding: 22px 18px 25px;
            overflow: visible;
          }
          .quick-view-details h2 {
            margin: 0 35px 10px 0;
            font-size: 20px;
          }
          .quick-view-price {
            font-size: 19px;
          }
          .quick-view-description {
            font-size: 13px;
          }
          .quick-view-select {
            height: 44px;
          }
          .quick-quantity {
            height: 42px;
          }
          .quick-quantity button {
            width: 42px;
            height: 42px;
          }
          .quick-quantity span {
            width: 48px;
            height: 42px;
          }
          .quick-add-cart {
            height: 46px;
          }
          .quick-view-close {
            top: 8px;
            right: 8px;
            width: 34px;
            height: 34px;
            font-size: 21px;
          }
          .product-options-panel {
            padding: 45px 15px 20px;
          }
          .product-options-inner {
            padding: 15px;
          }
          .product-options-close {
            top: 8px;
            right: 8px;
            width: 30px;
            height: 30px;
            font-size: 19px;
            line-height: 30px;
          }
          .product-option-select {
            height: 40px;
            font-size: 12px;
          }
          .weight-add-cart {
            height: 40px;
            font-size: 11px;
          }
          .pagination-wrapper {
            justify-content: center;
            gap: 7px;
            margin-top: 20px;
          }
          .pagination-wrapper button {
            padding: 8px 12px;
            font-size: 12px;
          }
          .pagination-wrapper span {
            font-size: 14px;
          }
        }
        @media (max-width: 380px) {
          .shop-container {
            padding: 0 8px;
          }
          .shop-products {
            gap: 8px;
          }
          .product-image {
            height: 165px;
          }
          .product-info h4 {
            font-size: 12px;
          }
          .product-hover-actions {
            top: 6px;
            right: 6px;
            gap: 5px;
          }
          .hover-action {
            width: 30px;
            height: 30px;
          }
          .hover-action i {
            font-size: 12px;
          }
          .quick-view-details {
            padding: 20px 15px;
          }
          .quick-view-details h2 {
            font-size: 18px;
          }
          .quick-view-image {
            height: 210px;
          }
          .quick-view-image img {
            height: 180px;
          }
        }
      `}</style>
      <div className="terms-banner">
        <img src="/uploads/shop.png" alt="Shop" />
        <div className="banner-text">
          <h2>
            <Link href="/">Home</Link>
            {" >> "}{pageTitle}
          </h2>
        </div>
      </div>
      <div className="shop-container">
        <div className="filter-sidebar">
          <h3 className="sidebar-title">PRODUCT CATEGORIES</h3>
          <p><Link href="/shop?category=Berries">Berries</Link></p>
          <p><Link href="/shop?category=Bulk%2FWholesale">Bulk/Wholesale</Link></p>
          <p><Link href="/shop?category=Combo%20Offers">Combo Offers</Link></p>
          <p><Link href="/shop?category=Combo%20and%20Gift%20Packs">Combo & Gift Packs</Link></p>
          <p><Link href="/shop?category=Dates">Dates</Link></p>
          <p><Link href="/shop?category=Dry%20Fruits">Dry Fruits</Link></p>
          <p><Link href="/shop?category=Flavoured%20Nuts">Flavoured Nuts</Link></p>
          <p><Link href="/shop?category=Hampers">Hampers</Link></p>
          <p><Link href="/shop?category=Jumbo%20and%20Premium">Jumbo & Premium</Link></p>
          <p><Link href="/shop?category=Mixes%20and%20Snacking">Mixes & Snacking</Link></p>
          <div className="group-title" onClick={() => setNutsOpen(!nutsOpen)}>
            <span>NUTS</span>
            <i className={nutsOpen ? "fa fa-chevron-up" : "fa fa-chevron-down"}></i>
          </div>
          {nutsOpen && (
            <div id="nuts-group">
              <p><Link href="/shop?category=Almonds">Almonds</Link></p>
              <p><Link href="/shop?category=Cashews">Cashews</Link></p>
              <p><Link href="/shop?category=Pistachios">Pistachios</Link></p>
              <p><Link href="/shop?category=Walnuts">Walnuts</Link></p>
            </div>
          )}
          <p><Link href="/shop?category=Powders">Powders</Link></p>
          <p><Link href="/shop?category=Seeds">Seeds</Link></p>
          <p><Link href="/shop?category=Uncategorized">Uncategorized</Link></p>
        </div>
        <div className="shop-products">
          {loading ? (
            <div className="loading-shop">
              Loading products...
            </div>
          ) : currentProducts.length > 0 ? (
            <>
              {currentProducts.map(
                (product) => {
                  const productId = getProductId(product);
                  const image1 = getProductImage1(product);
                  const image2 = getProductImage2(product);
                  const originalPrice = getOriginalPrice(product);
                  const offerPrice = getOfferPrice(product);
                  const active = isProductActive(product);
                  const selectedWeight = selectedWeights[productId] || "";
                  const compareSelected = compareIds.includes(productId);
                  const wishlistSelected = wishlistIds.includes(productId);
                  return (
                    <div className="product-card product-item" key={productId}>
                      <div className="image-wrapper">
                        <Link href={`/product/${productId}`} className="product-image-link">
                          {active ? (<span className="sale-badge sale">SALE</span>) : (
                            <span className="sale-badge unavailable">CURRENTLY UNAVAILABLE</span>
                          )}
                          {image1 ? (<img src={image1} className="product-image image1" alt={getProductTitle(product)} />) : (
                            <div className="product-image image1"
                              style={{
                                background: "#eee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#999",
                              }}
                            >
                              No Image
                            </div>
                          )}
                          {image2 && (<img src={image2} className="product-image image2" alt={getProductTitle(product)} /> )}
                        </Link>
                        <div className="product-bottom-action">
                          {active ? (
                            <div className="select-option-btn" onClick={(event) => openProductOptions(event, product)}>
                              <span className="option-text">SELECT OPTIONS</span>
                              <button type="button" className="option-cart" onClick={(event) => openProductOptions(event, product)}>
                                <i className="fa fa-shopping-cart"></i>
                              </button>
                            </div>
                          ) : (
                            <button type="button" className="select-option-btn disabled-btn" disabled>CURRENTLY UNAVAILABLE</button>
                          )}
                        </div>
                        <div className="product-hover-actions">
                          <button type="button" className={`hover-action ${compareSelected ? "compare-added" : "" }`} title="Add to Compare" onClick={(event) => compareClicked(event, product)}>
                            <i className={compareSelected ? "fa fa-check" : "fa fa-exchange" }></i>
                          </button>
                          <button type="button" className="hover-action quick-view-btn" title="Quick View" onClick={(event) => {event.preventDefault(); event.stopPropagation(); openQuickView(product);}}>
                            <i className="fa fa-eye"></i>
                          </button>
                          <button type="button" className={`hover-action wishlist-action ${wishlistSelected ? "wishlist-selected" : ""}`} title="Add to Wishlist" onClick={(event) => wishlistClicked(event, product)}>
                            <i className={wishlistSelected ? "fa fa-heart" : "fa fa-heart-o"}></i></button>
                        </div>
                        {active && selectedProduct && getProductId(selectedProduct) === productId && (
                          <div className="product-options-panel active">
                            <button type="button" className="product-options-close" onClick={closeProductOptions}>&times;</button>
                            <div className="product-options-inner">
                              <label>Weight</label>
                              <select className="product-option-select" value={selectedWeight} onChange={(event) => setSelectedWeights((previous) => ({...previous, [productId]: event.target.value,}))}>
                                <option value="">Select Weight</option>
                                <option value="250g">250g</option>
                                <option value="500g">500g</option>
                                <option value="1kg">1kg</option>
                              </select>
                              <button type="button" className="weight-add-cart" onClick={(event) => addToCart(event, product)}><i className="fa fa-shopping-cart"></i>ADD TO CART</button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <h4>{getProductTitle(product)} </h4>
                        <div className="product-price">
                          {offerPrice > 0 && originalPrice > 0 && offerPrice < originalPrice ? (
                            <>
                              <span className="old-price">₹{originalPrice.toFixed(2)}</span>
                              <span className="offer-price">₹{offerPrice.toFixed(2)}</span>
                            </>
                          ) : (
                            <span className="offer-price">
                              ₹{(offerPrice || originalPrice || 0).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
              <div className="pagination-wrapper">
                <button type="button" onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                <span>{currentPage} / {totalPages}</span>
                <button type="button" onClick={nextPage} disabled={currentPage >= totalPages}>Next</button>
              </div>
            </>
          ) : (
            <div className="no-products">
              <i className="fa fa-cube"></i>
              <h2>No Products Found</h2>
              {categoryFilter && (<p>No products found for category:{" "}<strong>{categoryFilter}</strong></p>)}
              {brandFilter && (<p>No products found for brand: {" "}<strong>{brandFilter}</strong></p>)}
              {searchFilter && (<p>No products found for:{" "}<strong>{searchFilter}</strong></p>)}
              <Link href="/shop"
                style={{
                  display: "inline-block",
                  marginTop: "15px",
                  padding: "10px 20px",
                  background: "#111",
                  color: "#fff",
                  textDecoration: "none",
                  borderRadius: "5px",
                }}
              >
                View All Products
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className={`quick-view-modal ${quickViewOpen ? "active" : "" }`}
        onClick={(event) => { 
          if (event.target === event.currentTarget) {
            closeQuickView();
          }
        }}
      >
        <div className="quick-view-box">
          <button type="button" className="quick-view-close" onClick={closeQuickView}>&times;</button>
          {quickProduct && (
            <div className="quick-view-content">
              <div className="quick-view-image">
                <img src={getProductImage1(quickProduct)} alt={getProductTitle(quickProduct)} />
              </div>
              <div className="quick-view-details">
                <h2>{getProductTitle(quickProduct)}</h2>
                <div className="quick-view-price">
                  {quickWeight ? (
                    <>
                      ₹{quickViewPrice.toLocaleString("en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </>
                  ) : (
                    <>
                      ₹{getOfferPrice(quickProduct).toLocaleString("en-IN",
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </>
                  )}
                </div>
                <div className="quick-view-description">
                  {getProductDescription(quickProduct)}
                </div>
                {isProductActive(quickProduct) ? (
                  <form onSubmit={addQuickViewToCart}>
                    <label className="quick-view-label">Weight</label>
                    <select className="quick-view-select" value={quickWeight} onChange={(event) => setQuickWeight(event.target.value)} required>
                      <option value="">Select Weight</option>
                      <option value="250g">250g</option>
                      <option value="500g">500g</option>
                      <option value="1kg">1kg</option>
                    </select>
                    <label className="quick-view-label">Quantity</label>
                    <div className="quick-quantity">
                      <button type="button" onClick={() => changeQuickQuantity(-1)}>−</button>
                      <span>{quickQuantity}</span>
                      <button type="button" onClick={() => changeQuickQuantity(1)}>+</button>
                    </div>
                    <button type="submit" className="quick-add-cart"><i className="fa fa-shopping-cart"></i>ADD TO CART</button>
                  </form>
                ) : (
                  <button type="button" className="quick-add-cart" disabled style={{background:"#999", cursor: "not-allowed", }}>CURRENTLY UNAVAILABLE</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}