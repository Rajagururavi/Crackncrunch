"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function ShopPage() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("Shop");
  const [selectedSearch, setSelectedSearch] = useState("");
  const [selectedStock, setSelectedStock] = useState("");

  const [minPrice, setMinPrice] = useState("30");
  const [maxPrice, setMaxPrice] = useState("2000");
  const [showCount, setShowCount] = useState("9");
  const [sortValue, setSortValue] = useState("default");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState(true);

  const [compareIds, setCompareIds] = useState([]);

  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState(null);

  const [cartPopupProduct, setCartPopupProduct] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState("");
  const [cartQuantity, setCartQuantity] = useState(1);

  /* -------------------------------------------------------
     PRODUCT HELPERS
  ------------------------------------------------------- */

  const getProductId = (product) =>
    product?.id ??
    product?._id ??
    product?.product_id ??
    product?.productId ??
    "";

  const getProductName = (product) =>
    product?.name ||
    product?.product_name ||
    product?.title ||
    "Product";

  const getProductCategory = (product) =>
    product?.category_name ||
    product?.categoryName ||
    product?.category ||
    product?.category_title ||
    "";

  const getOriginalPrice = (product) => {
    const price =
      product?.original_price ??
      product?.regular_price ??
      product?.mrp ??
      product?.price ??
      0;

    return Number(price) || 0;
  };

  const getOfferPrice = (product) => {
    const price =
      product?.offer_price ??
      product?.sale_price ??
      product?.discount_price ??
      product?.selling_price ??
      product?.price ??
      0;

    return Number(price) || 0;
  };

  const hasOffer = (product) => {
    const original = getOriginalPrice(product);
    const offer = getOfferPrice(product);

    return original > 0 && offer > 0 && offer < original;
  };

  const getDisplayPrice = (product) => {
    return hasOffer(product)
      ? getOfferPrice(product)
      : getOriginalPrice(product);
  };

  const getProductImages = (product) => {
    const images = [];

    const possibleImages = [
      product?.image,
      product?.image_url,
      product?.imageUrl,
      product?.product_image,
      product?.productImage,
      product?.thumbnail,
      product?.thumbnail_url,
      product?.featured_image,
      product?.featuredImage,
      product?.photo,
      product?.images?.[0],
      product?.images?.[1],
    ];

    possibleImages.forEach((image) => {
      if (typeof image === "string" && image.trim()) {
        if (!images.includes(image)) {
          images.push(image);
        }
      }
    });

    return images;
  };

  const getProductImage = (product) => {
    const images = getProductImages(product);

    return images[0] || "/images/product-placeholder.png";
  };

  const getProductSecondImage = (product) => {
    const images = getProductImages(product);

    return images[1] || images[0] || "/images/product-placeholder.png";
  };

  const getProductRating = (product) => {
    const rating =
      product?.rating ??
      product?.average_rating ??
      product?.avg_rating ??
      0;

    return Number(rating) || 0;
  };

  const getProductPopularity = (product) => {
    return Number(
      product?.popularity ??
        product?.sales_count ??
        product?.sold_count ??
        product?.views ??
        0
    );
  };

  const getProductDate = (product) => {
    return (
      product?.created_at ||
      product?.createdAt ||
      product?.date ||
      ""
    );
  };

  const isInStock = (product) => {
    if (typeof product?.in_stock === "boolean") {
      return product.in_stock;
    }

    if (typeof product?.is_available === "boolean") {
      return product.is_available;
    }

    if (typeof product?.available === "boolean") {
      return product.available;
    }

    if (product?.stock_status) {
      return String(product.stock_status).toLowerCase() === "in_stock";
    }

    if (product?.stock !== undefined && product?.stock !== null) {
      return Number(product.stock) > 0;
    }

    return true;
  };

  const getWeightOptions = (product) => {
    const possibleWeights =
      product?.weights ||
      product?.weight_options ||
      product?.weightOptions ||
      product?.variants ||
      [];

    if (Array.isArray(possibleWeights) && possibleWeights.length > 0) {
      return possibleWeights
        .map((item) => {
          if (typeof item === "string" || typeof item === "number") {
            return String(item);
          }

          return (
            item?.weight ||
            item?.name ||
            item?.label ||
            item?.size ||
            ""
          );
        })
        .filter(Boolean);
    }

    const singleWeight =
      product?.weight ||
      product?.product_weight ||
      product?.size ||
      "";

    if (singleWeight) {
      return [String(singleWeight)];
    }

    return ["250g", "500g", "1kg"];
  };

  /* -------------------------------------------------------
     FETCH PRODUCTS
  ------------------------------------------------------- */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/home", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        if (!mounted) return;

        const allProducts = [];

        if (Array.isArray(data?.products)) {
          allProducts.push(...data.products);
        }

        if (Array.isArray(data?.brands)) {
          data.brands.forEach((brand) => {
            if (Array.isArray(brand?.products)) {
              allProducts.push(...brand.products);
            }
          });
        }

        const uniqueProducts = [];
        const seenIds = new Set();

        allProducts.forEach((product, index) => {
          const id = getProductId(product);

          const uniqueKey = id
            ? String(id)
            : `${getProductName(product)}-${index}`;

          if (!seenIds.has(uniqueKey)) {
            seenIds.add(uniqueKey);
            uniqueProducts.push(product);
          }
        });

        setProducts(uniqueProducts);
      } catch (error) {
        console.error("Shop products error:", error);

        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* -------------------------------------------------------
     ESCAPE + BODY SCROLL
  ------------------------------------------------------- */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setQuickViewOpen(false);
        setQuickProduct(null);
        setCartPopupProduct(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    const modalOpen =
      quickViewOpen ||
      Boolean(cartPopupProduct) ||
      sidebarOpen;

    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [quickViewOpen, cartPopupProduct, sidebarOpen]);

  /* -------------------------------------------------------
     CATEGORIES
  ------------------------------------------------------- */

  const categories = useMemo(() => {
    const categoryMap = new Map();

    products.forEach((product) => {
      const category = getProductCategory(product);

      if (category && !categoryMap.has(category)) {
        categoryMap.set(category, category);
      }
    });

    return Array.from(categoryMap.values());
  }, [products]);

  /* -------------------------------------------------------
     FILTER + SORT
  ------------------------------------------------------- */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    /* CATEGORY */

    if (
      selectedCategory &&
      selectedCategory !== "Shop" &&
      selectedCategory !== "All"
    ) {
      result = result.filter((product) => {
        const category = getProductCategory(product)
          .toString()
          .toLowerCase();

        return (
          category === selectedCategory.toString().toLowerCase()
        );
      });
    }

    /* SEARCH */

    if (selectedSearch.trim()) {
      const search = selectedSearch.trim().toLowerCase();

      result = result.filter((product) => {
        const name = getProductName(product)
          .toString()
          .toLowerCase();

        const category = getProductCategory(product)
          .toString()
          .toLowerCase();

        return (
          name.includes(search) ||
          category.includes(search)
        );
      });
    }

    /* STOCK */

    if (selectedStock === "in_stock") {
      result = result.filter((product) => isInStock(product));
    }

    if (selectedStock === "out_of_stock") {
      result = result.filter((product) => !isInStock(product));
    }

    /* PRICE */

    const minimum = Number(minPrice);
    const maximum = Number(maxPrice);

    if (!Number.isNaN(minimum)) {
      result = result.filter(
        (product) => getDisplayPrice(product) >= minimum
      );
    }

    if (!Number.isNaN(maximum)) {
      result = result.filter(
        (product) => getDisplayPrice(product) <= maximum
      );
    }

    /* SORT */

    if (sortValue === "price_low") {
      result.sort(
        (a, b) => getDisplayPrice(a) - getDisplayPrice(b)
      );
    }

    if (sortValue === "price_high") {
      result.sort(
        (a, b) => getDisplayPrice(b) - getDisplayPrice(a)
      );
    }

    if (sortValue === "rating") {
      result.sort(
        (a, b) => getProductRating(b) - getProductRating(a)
      );
    }

    if (sortValue === "popularity") {
      result.sort(
        (a, b) =>
          getProductPopularity(b) -
          getProductPopularity(a)
      );
    }

    if (sortValue === "newest") {
      result.sort((a, b) => {
        const dateA = new Date(getProductDate(a)).getTime() || 0;
        const dateB = new Date(getProductDate(b)).getTime() || 0;

        return dateB - dateA;
      });
    }

    return result;
  }, [
    products,
    selectedCategory,
    selectedSearch,
    selectedStock,
    minPrice,
    maxPrice,
    sortValue,
  ]);

  const displayedProducts = useMemo(() => {
    const count = Number(showCount);

    if (!count || count <= 0) {
      return filteredProducts;
    }

    return filteredProducts.slice(0, count);
  }, [filteredProducts, showCount]);

  /* -------------------------------------------------------
     RANDOM SIDEBAR PRODUCTS
  ------------------------------------------------------- */

  const randomProducts = useMemo(() => {
    const array = [...products];

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [array[i], array[j]] = [array[j], array[i]];
    }

    return array.slice(0, 5);
  }, [products]);

  /* -------------------------------------------------------
     FILTER HANDLERS
  ------------------------------------------------------- */

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSidebarOpen(false);
  };

  const handlePriceFilter = () => {
    /*
      Price values are already stored in state.
      This button simply closes the mobile sidebar.
    */
    setSidebarOpen(false);
  };

  const handleStockChange = (value) => {
    setSelectedStock((current) =>
      current === value ? "" : value
    );
  };

  const handleShowChange = (event) => {
    setShowCount(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortValue(event.target.value);
  };

  /* -------------------------------------------------------
     COMPARE
  ------------------------------------------------------- */

  const handleCompareClick = (product) => {
    const id = getProductId(product);

    if (!id) return;

    const exists = compareIds.includes(String(id));

    if (exists) {
      setCompareIds((current) =>
        current.filter((item) => item !== String(id))
      );
      return;
    }

    if (compareIds.length >= 4) {
      alert("You can compare maximum 4 products.");
      return;
    }

    setCompareIds((current) => [
      ...current,
      String(id),
    ]);
  };

  /* -------------------------------------------------------
     QUICK VIEW
  ------------------------------------------------------- */

  const openQuickView = (product) => {
    setQuickProduct(product);
    setQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setQuickViewOpen(false);
    setQuickProduct(null);
  };

  /* -------------------------------------------------------
     CART POPUP
  ------------------------------------------------------- */

  const openCartPopup = (product) => {
    const weights = getWeightOptions(product);

    setCartPopupProduct(product);
    setSelectedWeight(weights[0] || "");
    setCartQuantity(1);
  };

  const closeCartPopup = () => {
    setCartPopupProduct(null);
    setSelectedWeight("");
    setCartQuantity(1);
  };

  const increaseQuantity = () => {
    setCartQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setCartQuantity((current) =>
      current > 1 ? current - 1 : 1
    );
  };

  const handleAddToCart = () => {
    if (!cartPopupProduct) return;

    const productId = getProductId(cartPopupProduct);

    const cartItem = {
      id: productId,
      productId,
      name: getProductName(cartPopupProduct),
      image: getProductImage(cartPopupProduct),
      price: getDisplayPrice(cartPopupProduct),
      originalPrice: getOriginalPrice(cartPopupProduct),
      offerPrice: getOfferPrice(cartPopupProduct),
      weight: selectedWeight,
      quantity: cartQuantity,
    };

    try {
      const existingCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );

      const existingIndex = existingCart.findIndex(
        (item) =>
          String(item.id) === String(cartItem.id) &&
          String(item.weight || "") ===
            String(cartItem.weight || "")
      );

      if (existingIndex >= 0) {
        existingCart[existingIndex].quantity =
          Number(existingCart[existingIndex].quantity || 0) +
          cartQuantity;
      } else {
        existingCart.push(cartItem);
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(existingCart)
      );

      window.dispatchEvent(new Event("cartUpdated"));

      closeCartPopup();
    } catch (error) {
      console.error("Cart error:", error);
    }
  };

  /* -------------------------------------------------------
     PRODUCT DETAILS
  ------------------------------------------------------- */

  const handleProductClick = (product) => {
    const id = getProductId(product);

    if (!id) return;

    router.push(`/product/${id}`);
  };

  /* -------------------------------------------------------
     UI
  ------------------------------------------------------- */

  return (
    <>
      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .shopPage {
          min-height: 100vh;
          background: #fff;
          color: #222;
        }

        .hero {
          height: 500px;
          margin-top: 145px;
          position: relative;
          overflow: hidden;
          background: #f5f5f5;
        }

        .heroImage {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .heroOverlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: rgba(0, 0, 0, 0.18);
        }

        .heroTitle {
          color: #fff;
          font-size: 48px;
          font-weight: 700;
          margin: 0;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }

        .shopContainer {
          width: 92%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 50px 0 80px;
        }

        .mobileFilterButton {
          display: none;
        }

        .shopLayout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 35px;
        }

        .sidebar {
          width: 100%;
        }

        .sidebarSection {
          border-bottom: 1px solid #e5e5e5;
          padding-bottom: 25px;
          margin-bottom: 25px;
        }

        .sidebarTitle {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 18px;
        }

        .categoryList {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .categoryButton {
          border: 0;
          background: transparent;
          padding: 0;
          text-align: left;
          cursor: pointer;
          font-size: 14px;
          color: #555;
          transition: 0.2s;
        }

        .categoryButton:hover,
        .categoryButton.active {
          color: #111;
          font-weight: 600;
        }

        .priceInputs {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .priceInput {
          width: 100%;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 9px;
          font-size: 13px;
          outline: none;
        }

        .priceInput:focus {
          border-color: #222;
        }

        .filterButton {
          width: 100%;
          border: 1px solid #222;
          background: #222;
          color: #fff;
          padding: 10px;
          cursor: pointer;
          border-radius: 3px;
          font-size: 13px;
        }

        .stockOptions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .stockLabel {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 14px;
          cursor: pointer;
          color: #555;
        }

        .sidebarProducts {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .sidebarProduct {
          display: flex;
          gap: 12px;
          cursor: pointer;
        }

        .sidebarProductImage {
          width: 65px;
          height: 65px;
          object-fit: cover;
          border: 1px solid #eee;
        }

        .sidebarProductInfo {
          flex: 1;
        }

        .sidebarProductName {
          font-size: 13px;
          font-weight: 600;
          line-height: 1.4;
          margin-bottom: 5px;
        }

        .sidebarProductPrice {
          font-size: 13px;
          font-weight: 600;
        }

        .shopMain {
          min-width: 0;
        }

        .shopTopBar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
          padding-bottom: 18px;
          border-bottom: 1px solid #e5e5e5;
        }

        .resultText {
          font-size: 14px;
          color: #666;
        }

        .sortArea {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sortLabel {
          font-size: 14px;
          color: #555;
        }

        .sortSelect {
          min-width: 180px;
          border: 1px solid #ddd;
          padding: 10px 12px;
          background: #fff;
          outline: none;
          font-size: 13px;
        }

        .productGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 30px 20px;
        }

        .productCard {
          min-width: 0;
          cursor: pointer;
        }

        .productImageBox {
          height: 320px;
          position: relative;
          overflow: hidden;
          background: #f7f7f7;
          margin-bottom: 15px;
        }

        .productImage {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 0.35s ease,
            transform 0.35s ease;
        }

        .productSecondImage {
          position: absolute;
          inset: 0;
          opacity: 0;
        }

        .productCard:hover .productSecondImage {
          opacity: 1;
        }

        .productCard:hover .productMainImage {
          opacity: 0;
        }

        .productCard:hover .productImage {
          transform: scale(1.03);
        }

        .saleBadge {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 5;
          background: #111;
          color: #fff;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 600;
        }

        .unavailableBadge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 5;
          background: #fff;
          color: #555;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 600;
          border: 1px solid #ddd;
        }

        .productActions {
          position: absolute;
          right: 12px;
          top: 55px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          transform: translateX(10px);
          transition: 0.25s;
        }

        .productCard:hover .productActions {
          opacity: 1;
          transform: translateX(0);
        }

        .actionButton {
          width: 38px;
          height: 38px;
          border: 0;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
        }

        .actionButton:hover {
          background: #111;
          color: #fff;
        }

        .selectOptionsButton {
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 12px;
          z-index: 8;
          border: 0;
          background: #fff;
          color: #111;
          padding: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          opacity: 0;
          transform: translateY(10px);
          transition: 0.25s;
        }

        .productCard:hover .selectOptionsButton {
          opacity: 1;
          transform: translateY(0);
        }

        .productCategory {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #999;
          margin-bottom: 7px;
        }

        .productName {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 8px;
          line-height: 1.4;
        }

        .productBottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .productPrice {
          font-size: 15px;
          font-weight: 700;
        }

        .oldPrice {
          font-size: 13px;
          color: #999;
          text-decoration: line-through;
          margin-left: 7px;
          font-weight: 400;
        }

        .rating {
          font-size: 12px;
          color: #666;
        }

        .emptyProducts {
          padding: 80px 20px;
          text-align: center;
          color: #777;
          border: 1px solid #eee;
        }

        .loading {
          padding: 100px 20px;
          text-align: center;
          color: #777;
        }

        /* CART POPUP */

        .popupBackdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          z-index: 9998;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .cartPopup {
          width: 100%;
          max-width: 520px;
          background: #fff;
          border-radius: 8px;
          padding: 25px;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        }

        .popupClose {
          position: absolute;
          right: 15px;
          top: 12px;
          width: 35px;
          height: 35px;
          border: 0;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
          color: #555;
        }

        .cartPopupContent {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 25px;
          align-items: start;
        }

        .cartPopupImage {
          width: 150px;
          height: 170px;
          object-fit: cover;
          background: #f5f5f5;
        }

        .cartPopupInfo {
          padding-top: 10px;
        }

        .cartPopupCategory {
          color: #999;
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .cartPopupTitle {
          font-size: 20px;
          line-height: 1.35;
          margin: 0 0 12px;
        }

        .cartPopupPrice {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .weightTitle {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 9px;
        }

        .weightOptions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .weightButton {
          border: 1px solid #ddd;
          background: #fff;
          padding: 8px 14px;
          cursor: pointer;
          font-size: 13px;
          border-radius: 3px;
        }

        .weightButton.active {
          background: #111;
          color: #fff;
          border-color: #111;
        }

        .quantityRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .quantityTitle {
          font-size: 13px;
          font-weight: 600;
        }

        .quantityControls {
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
        }

        .quantityButton {
          width: 35px;
          height: 35px;
          border: 0;
          background: #fff;
          cursor: pointer;
          font-size: 17px;
        }

        .quantityValue {
          width: 35px;
          text-align: center;
          font-size: 14px;
        }

        .addCartButton {
          width: 100%;
          border: 0;
          background: #111;
          color: #fff;
          padding: 14px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .addCartButton:hover {
          background: #333;
        }

        /* QUICK VIEW */

        .quickView {
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          background: #fff;
          border-radius: 8px;
          padding: 30px;
          position: relative;
        }

        .quickViewContent {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 35px;
        }

        .quickViewImage {
          width: 100%;
          height: 500px;
          object-fit: cover;
          background: #f5f5f5;
        }

        .quickViewInfo {
          padding: 20px 0;
        }

        .quickViewCategory {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 10px;
        }

        .quickViewTitle {
          font-size: 28px;
          line-height: 1.3;
          margin: 0 0 15px;
        }

        .quickViewPrice {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .quickViewDescription {
          color: #666;
          line-height: 1.7;
          font-size: 14px;
          margin-bottom: 25px;
        }

        .quickViewCartButton {
          width: 100%;
          background: #111;
          color: #fff;
          border: 0;
          padding: 14px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .quickViewDetailButton {
          width: 100%;
          background: #fff;
          color: #111;
          border: 1px solid #111;
          padding: 14px;
          cursor: pointer;
          font-weight: 600;
        }

        @media (max-width: 1100px) {
          .productGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .shopLayout {
            grid-template-columns: 230px 1fr;
          }
        }

        @media (max-width: 768px) {
          .hero {
            height: 300px;
            margin-top: 100px;
          }

          .heroTitle {
            font-size: 34px;
          }

          .shopContainer {
            width: 94%;
            padding: 30px 0 60px;
          }

          .mobileFilterButton {
            display: block;
            width: 100%;
            border: 1px solid #222;
            background: #fff;
            padding: 12px;
            margin-bottom: 25px;
            cursor: pointer;
            font-weight: 600;
          }

          .shopLayout {
            display: block;
          }

          .sidebar {
            position: fixed;
            top: 0;
            left: -100%;
            width: 310px;
            max-width: 85%;
            height: 100vh;
            background: #fff;
            z-index: 9997;
            padding: 70px 25px 30px;
            overflow-y: auto;
            transition: left 0.3s ease;
            box-shadow: 5px 0 30px rgba(0, 0, 0, 0.15);
          }

          .sidebar.open {
            left: 0;
          }

          .sidebarClose {
            display: block !important;
          }

          .shopTopBar {
            align-items: flex-start;
            flex-direction: column;
          }

          .sortArea {
            width: 100%;
          }

          .sortSelect {
            flex: 1;
          }

          .productGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 25px 12px;
          }

          .productImageBox {
            height: 240px;
          }

          .productActions {
            opacity: 1;
            transform: none;
            right: 8px;
            top: 45px;
          }

          .actionButton {
            width: 34px;
            height: 34px;
          }

          .selectOptionsButton {
            opacity: 1;
            transform: none;
            left: 8px;
            right: 8px;
            bottom: 8px;
            padding: 10px;
          }

          .cartPopupContent {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .cartPopupImage {
            width: 100%;
            height: 250px;
          }

          .quickView {
            padding: 20px;
          }

          .quickViewContent {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .quickViewImage {
            height: 350px;
          }

          .quickViewTitle {
            font-size: 22px;
          }
        }

        @media (max-width: 480px) {
          .productGrid {
            grid-template-columns: 1fr 1fr;
          }

          .productImageBox {
            height: 190px;
          }

          .productName {
            font-size: 13px;
          }

          .productPrice {
            font-size: 13px;
          }

          .oldPrice {
            font-size: 11px;
          }

          .hero {
            height: 240px;
          }

          .heroTitle {
            font-size: 28px;
          }
        }

        .sidebarClose {
          display: none;
          position: absolute;
          right: 15px;
          top: 15px;
          border: 0;
          background: transparent;
          font-size: 25px;
          cursor: pointer;
        }
      `}</style>

      <div className="shopPage">
        {/* HERO */}

        <section className="hero">
          <img
            src="/images/shop-banner.jpg"
            alt="Shop"
            className="heroImage"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />

          <div className="heroOverlay">
            <h1 className="heroTitle">Shop</h1>
          </div>
        </section>

        <div className="shopContainer">
          {/* MOBILE FILTER */}

          <button
            className="mobileFilterButton"
            onClick={() => setSidebarOpen(true)}
          >
            ☰ Filters
          </button>

          <div className="shopLayout">
            {/* SIDEBAR */}

            <aside
              className={`sidebar ${
                sidebarOpen ? "open" : ""
              }`}
            >
              <button
                className="sidebarClose"
                onClick={() => setSidebarOpen(false)}
              >
                ×
              </button>

              {/* CATEGORIES */}

              <div className="sidebarSection">
                <h3 className="sidebarTitle">
                  Categories
                </h3>

                <div className="categoryList">
                  <button
                    className={`categoryButton ${
                      selectedCategory === "Shop"
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleCategoryClick("Shop")
                    }
                  >
                    Shop
                  </button>

                  {categories.map((category) => (
                    <button
                      key={category}
                      className={`categoryButton ${
                        selectedCategory === category
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        handleCategoryClick(category)
                      }
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* PRICE */}

              <div className="sidebarSection">
                <h3 className="sidebarTitle">
                  Filter by Price
                </h3>

                <div className="priceInputs">
                  <input
                    type="number"
                    className="priceInput"
                    value={minPrice}
                    min="0"
                    onChange={(event) =>
                      setMinPrice(event.target.value)
                    }
                    placeholder="Min"
                  />

                  <input
                    type="number"
                    className="priceInput"
                    value={maxPrice}
                    min="0"
                    onChange={(event) =>
                      setMaxPrice(event.target.value)
                    }
                    placeholder="Max"
                  />
                </div>

                <button
                  className="filterButton"
                  onClick={handlePriceFilter}
                >
                  Filter
                </button>
              </div>

              {/* STOCK */}

              <div className="sidebarSection">
                <h3 className="sidebarTitle">
                  Stock Status
                </h3>

                <div className="stockOptions">
                  <label className="stockLabel">
                    <input
                      type="checkbox"
                      checked={
                        selectedStock === "in_stock"
                      }
                      onChange={() =>
                        handleStockChange("in_stock")
                      }
                    />
                    In Stock
                  </label>

                  <label className="stockLabel">
                    <input
                      type="checkbox"
                      checked={
                        selectedStock === "out_of_stock"
                      }
                      onChange={() =>
                        handleStockChange("out_of_stock")
                      }
                    />
                    Out of Stock
                  </label>
                </div>
              </div>

              {/* RANDOM PRODUCTS */}

              <div className="sidebarSection">
                <h3 className="sidebarTitle">
                  Popular Products
                </h3>

                <div className="sidebarProducts">
                  {randomProducts.map((product, index) => (
                    <div
                      className="sidebarProduct"
                      key={`${getProductId(product)}-${index}`}
                      onClick={() =>
                        handleProductClick(product)
                      }
                    >
                      <img
                        src={getProductImage(product)}
                        alt={getProductName(product)}
                        className="sidebarProductImage"
                      />

                      <div className="sidebarProductInfo">
                        <div className="sidebarProductName">
                          {getProductName(product)}
                        </div>

                        <div className="sidebarProductPrice">
                          ₹
                          {getDisplayPrice(product).toFixed(
                            0
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* MAIN */}

            <main className="shopMain">
              <div className="shopTopBar">
                <div className="resultText">
                  {loading
                    ? "Loading products..."
                    : `Showing ${displayedProducts.length} of ${filteredProducts.length} products`}
                </div>

                <div className="sortArea">
                  <span className="sortLabel">
                    Sort by:
                  </span>

                  <select
                    className="sortSelect"
                    value={sortValue}
                    onChange={handleSortChange}
                  >
                    <option value="default">
                      Default
                    </option>

                    <option value="popularity">
                      Popularity
                    </option>

                    <option value="rating">
                      Average Rating
                    </option>

                    <option value="newest">
                      Latest
                    </option>

                    <option value="price_low">
                      Price: Low to High
                    </option>

                    <option value="price_high">
                      Price: High to Low
                    </option>
                  </select>

                  <select
                    className="sortSelect"
                    value={showCount}
                    onChange={handleShowChange}
                  >
                    <option value="9">9</option>
                    <option value="18">18</option>
                    <option value="27">27</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="loading">
                  Loading products...
                </div>
              ) : displayedProducts.length === 0 ? (
                <div className="emptyProducts">
                  No products found.
                </div>
              ) : (
                <div className="productGrid">
                  {displayedProducts.map(
                    (product, index) => {
                      const productId =
                        getProductId(product);

                      const originalPrice =
                        getOriginalPrice(product);

                      const offerPrice =
                        getOfferPrice(product);

                      const displayPrice =
                        getDisplayPrice(product);

                      const offer = hasOffer(product);

                      const rating =
                        getProductRating(product);

                      const inStock =
                        isInStock(product);

                      return (
                        <div
                          className="productCard"
                          key={`${productId || "product"}-${index}`}
                        >
                          <div className="productImageBox">
                            {/* SALE */}

                            {offer && (
                              <span className="saleBadge">
                                Sale
                              </span>
                            )}

                            {/* STOCK */}

                            {!inStock && (
                              <span className="unavailableBadge">
                                Out of stock
                              </span>
                            )}

                            {/* MAIN IMAGE */}

                            <img
                              src={getProductImage(product)}
                              alt={getProductName(product)}
                              className="productImage productMainImage"
                              onClick={() =>
                                handleProductClick(product)
                              }
                            />

                            {/* SECOND IMAGE */}

                            <img
                              src={getProductSecondImage(
                                product
                              )}
                              alt={getProductName(product)}
                              className="productImage productSecondImage"
                              onClick={() =>
                                handleProductClick(product)
                              }
                            />

                            {/* ACTIONS */}

                            <div className="productActions">
                              <button
                                className="actionButton"
                                title={
                                  compareIds.includes(
                                    String(productId)
                                  )
                                    ? "Remove from Compare"
                                    : "Compare"
                                }
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleCompareClick(product);
                                }}
                              >
                                ⇄
                              </button>

                              <button
                                className="actionButton"
                                title="Quick View"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  openQuickView(product);
                                }}
                              >
                                👁
                              </button>
                            </div>

                            {/* SELECT OPTIONS */}

                            <button
                              className="selectOptionsButton"
                              disabled={!inStock}
                              onClick={(event) => {
                                event.stopPropagation();

                                if (!inStock) return;

                                openCartPopup(product);
                              }}
                            >
                              {inStock
                                ? "Select Options"
                                : "Unavailable"}
                            </button>
                          </div>

                          {/* PRODUCT DETAILS */}

                          <div
                            onClick={() =>
                              handleProductClick(product)
                            }
                          >
                            <div className="productCategory">
                              {getProductCategory(product)}
                            </div>

                            <h3 className="productName">
                              {getProductName(product)}
                            </h3>

                            <div className="productBottom">
                              <div className="productPrice">
                                ₹{displayPrice.toFixed(0)}

                                {offer && (
                                  <span className="oldPrice">
                                    ₹
                                    {originalPrice.toFixed(
                                      0
                                    )}
                                  </span>
                                )}
                              </div>

                              {rating > 0 && (
                                <div className="rating">
                                  ★ {rating.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------
          CART POPUP
      --------------------------------------------------- */}

      {cartPopupProduct && (
        <div
          className="popupBackdrop"
          onClick={closeCartPopup}
        >
          <div
            className="cartPopup"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="popupClose"
              onClick={closeCartPopup}
            >
              ×
            </button>

            <div className="cartPopupContent">
              <img
                src={getProductImage(cartPopupProduct)}
                alt={getProductName(cartPopupProduct)}
                className="cartPopupImage"
              />

              <div className="cartPopupInfo">
                <div className="cartPopupCategory">
                  {getProductCategory(cartPopupProduct)}
                </div>

                <h2 className="cartPopupTitle">
                  {getProductName(cartPopupProduct)}
                </h2>

                <div className="cartPopupPrice">
                  ₹
                  {getDisplayPrice(
                    cartPopupProduct
                  ).toFixed(0)}
                </div>

                <div className="weightTitle">
                  Choose Weight
                </div>

                <div className="weightOptions">
                  {getWeightOptions(
                    cartPopupProduct
                  ).map((weight) => (
                    <button
                      key={weight}
                      className={`weightButton ${
                        selectedWeight === weight
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedWeight(weight)
                      }
                    >
                      {weight}
                    </button>
                  ))}
                </div>

                <div className="quantityRow">
                  <span className="quantityTitle">
                    Quantity
                  </span>

                  <div className="quantityControls">
                    <button
                      className="quantityButton"
                      onClick={decreaseQuantity}
                    >
                      −
                    </button>

                    <span className="quantityValue">
                      {cartQuantity}
                    </span>

                    <button
                      className="quantityButton"
                      onClick={increaseQuantity}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="addCartButton"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------
          QUICK VIEW POPUP
      --------------------------------------------------- */}

      {quickViewOpen && quickProduct && (
        <div
          className="popupBackdrop"
          onClick={closeQuickView}
        >
          <div
            className="quickView"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="popupClose"
              onClick={closeQuickView}
            >
              ×
            </button>

            <div className="quickViewContent">
              <img
                src={getProductImage(quickProduct)}
                alt={getProductName(quickProduct)}
                className="quickViewImage"
              />

              <div className="quickViewInfo">
                <div className="quickViewCategory">
                  {getProductCategory(quickProduct)}
                </div>

                <h2 className="quickViewTitle">
                  {getProductName(quickProduct)}
                </h2>

                <div className="quickViewPrice">
                  ₹
                  {getDisplayPrice(
                    quickProduct
                  ).toFixed(0)}

                  {hasOffer(quickProduct) && (
                    <span className="oldPrice">
                      ₹
                      {getOriginalPrice(
                        quickProduct
                      ).toFixed(0)}
                    </span>
                  )}
                </div>

                {getProductRating(quickProduct) > 0 && (
                  <div className="rating">
                    ★{" "}
                    {getProductRating(
                      quickProduct
                    ).toFixed(1)}
                  </div>
                )}

                <p className="quickViewDescription">
                  {quickProduct?.description ||
                    quickProduct?.short_description ||
                    "Premium quality product. Choose your preferred option and add it to your cart."}
                </p>

                {isInStock(quickProduct) ? (
                  <button
                    className="quickViewCartButton"
                    onClick={() => {
                      closeQuickView();
                      openCartPopup(quickProduct);
                    }}
                  >
                    Select Options
                  </button>
                ) : (
                  <button
                    className="quickViewCartButton"
                    disabled
                  >
                    Out of Stock
                  </button>
                )}

                <button
                  className="quickViewDetailButton"
                  onClick={() =>
                    handleProductClick(quickProduct)
                  }
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}