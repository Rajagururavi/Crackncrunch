"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "30");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "2000");
  const [showCount, setShowCount] = useState(searchParams.get("show") || "9");
  const [sortValue, setSortValue] = useState(searchParams.get("sort") || "default");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState({
    Dates: false,
    Nuts: false,
  });
  const [cart, setCart] = useState([]);
  useEffect(() => {
  const updateCart = () => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("cart") || "[]"
      );
      setCart(Array.isArray(savedCart) ? savedCart : []);
    } catch {
      setCart([]);
    }
  };

  updateCart();

  window.addEventListener("cartUpdated", updateCart);

  return () => {
    window.removeEventListener("cartUpdated", updateCart);
  };
}, []);
  const [quantity, setQuantity] = useState(1);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState(null);
  const [cartPopupProduct, setCartPopupProduct] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const categories = [
    { name: "Berries" },
    { name: "Bulk / Wholesale" },
    { name: "Combo Offers" },
    { name: "Combos & Gift Packs" },
    { name: "Dates", children: ["Dry Dates", "Premium Dates"] },
    { name: "Dry Fruits" },
    { name: "Flavoured Nuts" },
    { name: "Hampers" },
    { name: "Jumbo & Premium" },
    { name: "Mixes & Snacking" },
    {
      name: "Nuts",
      children: ["Almonds", "Cashews", "Pistachios", "Walnuts"],
    },
    { name: "Powders" },
    { name: "Seeds" },
    { name: "Uncategorized" },
  ];
  const selectedCategory = searchParams.get("category") || "Shop";
  const selectedSearch = searchParams.get("search") || "";
  const selectedStock = searchParams.get("stock_status") || "";
  const selectedBrand = searchParams.get("brand") || "";
  const getProductId = (product) => product?._id || product?.id || product?.product_id || product?.productId;
  const getProductName = (product) => product?.productName || product?.product_name || product?.product_title || product?.name || product?.title || "Product";
  const getProductCategory = (product) => product?.category_name || product?.category || product?.product_category || product?.categoryName || "";
  const getOriginalPrice = (product) => Number(product?.originalPrice ?? product?.original_price ?? product?.mrp ?? product?.price ?? 0) || 0;
  const getOfferPrice = (product) => Number(product?.offerPrice ?? product?.offer_price ?? product?.salePrice ?? product?.sale_price ?? 0) || 0;
  const hasOffer = (product) => {
    const original = getOriginalPrice(product);
    const offer = getOfferPrice(product);
    return offer > 0 && original > 0 && offer < original;
  };
  const getDisplayPrice = (product) => {
    const original = getOriginalPrice(product);
    const offer = getOfferPrice(product);
    if (offer > 0 && original > 0 && offer < original) return offer;
    if (offer > 0) return offer;
    return original;
  };
  const getProductStatusTag = (product) => {
    const status = String(product?.status ?? product?.stock_status ?? product?.stockStatus ?? "").trim().toLowerCase();
    if (status === "currently available") return "SALE";
    if (status === "uncurrently available") return "UnCurrently Available";
    return "";
  };
  const isInStock = (product) => {
    const status = String(product?.status ?? product?.stock_status ?? product?.stockStatus ?? "").trim().toLowerCase();
    return [
      "currently available",
      "available",
      "in stock",
      "instock",
      "active",
    ].includes(status);
  };
  const getProductImages = (product) => {
    const images = [
      product?.product_image,
      product?.productImage,
      product?.image,
      product?.image_url,
      product?.imageUrl,
      product?.thumbnail,
      product?.thumbnail_url,
      product?.thumbnailUrl,
    ];
    const result = images.filter((image) => typeof image === "string" && image.trim());
    const arrays = [
      product?.images,
      product?.product_images,
      product?.gallery,
      product?.gallery_images,
      product?.productImages,
    ];
    arrays.forEach((array) => {
      if (!Array.isArray(array)) return;
      array.forEach((item) => {
        if (typeof item === "string" && item.trim()) {
          result.push(item.trim());
        } else if (item && typeof item === "object") {
          const image = item.url || item.image || item.image_url || item.src;
          if (typeof image === "string" && image.trim()) {
            result.push(image.trim());
          }
        }
      });
    });
    return [...new Set(result)];
  };
  const getProductImage = (product) => getProductImages(product)[0] || "/uploads/no-image.png";
  const getProductSecondImage = (product) => getProductImages(product)[1] || "";
  const getProductRating = (product) => Number(product?.rating ?? product?.average_rating ?? product?.averageRating ?? 0) || 0;
  const getProductPopularity = (product) => Number(product?.popularity ?? product?.sales_count ?? product?.salesCount ?? product?.views ?? 0) || 0;
  const getProductDate = (product) => product?.createdAt || product?.created_at || product?.date || "";
  const getWeightOptions = (product) => {
    const basePrice = getDisplayPrice(product);
    const possible = product?.weight_options || product?.weightOptions || product?.weights || product?.variants || product?.product_variants;
    if (Array.isArray(possible)) {
      const parsed = [];
      possible.forEach((item) => {
        if (typeof item === "string") {
          const normalized = item.toLowerCase().replace(/\s/g, "");
          if (normalized.includes("250")) {
            parsed.push({ label: "250g", price: basePrice });
          } else if (normalized.includes("500")) {
            parsed.push({ label: "500g", price: basePrice * 2 });
          } else if (
            normalized.includes("1kg") || normalized.includes("1000g")
          ) {
            parsed.push({ label: "1kg", price: basePrice * 4 });
          }
        } else if (item && typeof item === "object") {
          const rawLabel =
            item.weight || item.label || item.name || item.size;
          if (!rawLabel) return;
          const normalized = String(rawLabel).toLowerCase().replace(/\s/g, "");
          const price = Number(item.offerPrice ?? item.offer_price ?? item.salePrice ?? item.sale_price ?? item.price ?? item.amount ?? 0) || 0;
          let label = "";
          if (normalized.includes("250")) label = "250g";
          else if (normalized.includes("500")) label = "500g";
          else if (
            normalized.includes("1kg") || normalized.includes("1000g")
          ) {
            label = "1kg";
          }
          if (label) {
            parsed.push({label, price: price || (label === "250g" ? basePrice : label === "500g" ? basePrice * 2 : basePrice * 4),});
          }
        }
      });
      const unique = [];
      const seen = new Set();
      const order = { "250g": 1, "500g": 2, "1kg": 3 };
      parsed.forEach((item) => {
        if (!seen.has(item.label)) {
          seen.add(item.label);
          unique.push(item);
        }
      });
      unique.sort((a, b) => order[a.label] - order[b.label]);
      if (unique.length) return unique;
    }
    return [
      { label: "250g", price: basePrice },
      { label: "500g", price: basePrice * 2 },
      { label: "1kg", price: basePrice * 4 },
    ];
  };
  const getSelectedWeightPrice = (product, weight) => {
    const option = getWeightOptions(product).find((item) => item.label === weight);
    return option?.price ?? getDisplayPrice(product);
  };
  const showToast = (message) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 2500);
  };
  const openCartPopup = (event, product) => {
    event?.stopPropagation?.();
    setQuickViewOpen(false);
    setQuickProduct(null);
    setCartPopupProduct(product);
    setSelectedWeight("");
  };
  const closeCartPopup = () => {
    setCartPopupProduct(null);
    setSelectedWeight("");
  };
  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!cartPopupProduct) return;
    if (!selectedWeight) {
      showToast("Please select a weight.");
      return;
    }
    const product = cartPopupProduct;
    const productId = getProductId(product);
    if (!productId) {
      showToast("Product ID not found.");
      return;
    }
    const price = Number(getSelectedWeightPrice(product, selectedWeight) || 0);
    const cartItem = {
      product_id: productId,
      product_title: getProductName(product),
      product_image: getProductImage(product),
      weight: selectedWeight,
      quantity: 1,
      final_price: price,
    };
    try {
      let cart = [];
      try {
        const saved = JSON.parse(localStorage.getItem("cart") || "[]");
        if (Array.isArray(saved)) {
          cart = saved;
        }
      } catch {
        cart = [];
      }
      const index = cart.findIndex((item) => String(item.product_id) === String(productId) && String(item.weight) === String(selectedWeight));
      if (index >= 0) {
        const quantity = Number(cart[index].quantity || 0) + 1;
        cart[index] = {...cart[index], quantity, final_price: price * quantity,};
      } else {
        cart.push(cartItem);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      sessionStorage.setItem("openCartAfterRefresh", "true");
      window.location.reload();
    } catch (error) {
      console.error("Add cart error:", error);
      showToast("Could not add this product to cart.");
    }
  };
  const saveWishlist = (ids) => {
    try {
      localStorage.setItem("wishlistIds", JSON.stringify(ids));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (error) {
      console.error("Wishlist save error:", error);
    }
  };
  const handleWishlist = (event, product) => {
    event?.stopPropagation?.();
    const id = getProductId(product);
    if (!id) {
      showToast("Product ID not found.");
      return;
    }
    const stringId = String(id);
    const wasAdded = !wishlistIds.includes(stringId);
    setWishlistIds((previous) => {
      const updated = previous.includes(stringId) ? previous.filter((item) => item !== stringId) : [...previous, stringId];
      saveWishlist(updated);
      return updated;
    });
    showToast(wasAdded ? "Added to wishlist ❤️" : "Removed from wishlist");
  };
  const saveCompare = (ids) => {
    try {
      localStorage.setItem("compareIds", JSON.stringify(ids));
      window.dispatchEvent(new Event("compareUpdated"));
    } catch (error) {
      console.error("Compare save error:", error);
    }
  };
  const handleCompareClick = (event, product) => {
    event?.stopPropagation?.();
    const id = getProductId(product);
    if (!id) {
      showToast("Product ID not found.");
      return;
    }
    const stringId = String(id);
    const wasAdded = !compareIds.includes(stringId);
    setCompareIds((previous) => {
      const updated = previous.includes(stringId) ? previous.filter((item) => item !== stringId) : [...previous, stringId];
      saveCompare(updated);
      return updated;
    });
    showToast(wasAdded ? "Added to compare ⇄" : "Removed from compare");
  };
  const openQuickView = (event, product) => {
    event.stopPropagation();
    setCartPopupProduct(null);
    setQuickProduct(product);
    setQuickViewOpen(true);
  };
  const closeQuickView = () => {
    setQuickViewOpen(false);
    setQuickProduct(null);
  };
  useEffect(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlistIds") || "[]");
      const compare = JSON.parse(localStorage.getItem("compareIds") || "[]");
      setWishlistIds(Array.isArray(wishlist) ? wishlist.map(String) : []);
      setCompareIds(Array.isArray(compare) ? compare.map(String) : []);
    } catch (error) {
      console.error("Saved items loading error:", error);
    }
  }, []);
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      if (quickViewOpen) closeQuickView();
      if (cartPopupProduct) closeCartPopup();
      if (sidebarOpen) setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [quickViewOpen, cartPopupProduct, sidebarOpen]);
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const response = await fetch("/api/home");
        if (!response.ok) throw new Error("Failed to load products");
        const data = await response.json();
        const allProducts = [];
        if (Array.isArray(data?.brands)) {
          data.brands.forEach((brand) => {
            if (Array.isArray(brand?.products)) {
              brand.products.forEach((product) => {allProducts.push({...product, _shopBrandName: brand?.brandName || brand?.brand_name || brand?.name || brand?.brand_title || brand?.title || "",}); });
            }
          });
        }
        const seen = new Set();
        const uniqueProducts = allProducts.filter((product) => {
          const id = getProductId(product);
          if (!id) return true;
          const key = String(id);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setProducts(uniqueProducts);
      } catch (error) {
        console.error("Shop product loading error:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedBrand) {
      const brand = selectedBrand.trim().toLowerCase();
      result = result.filter((product) => String(product?._shopBrandName || "").trim().toLowerCase() === brand);
    }
    if (selectedCategory && selectedCategory !== "Shop") {
      const category = selectedCategory.toLowerCase();
      result = result.filter((product) => {
        const productCategory = getProductCategory(product).toLowerCase();
        return (productCategory === category || productCategory.includes(category) || category.includes(productCategory));
      });
    }
    if (selectedSearch) {
      const search = selectedSearch.toLowerCase();
      result = result.filter((product) => getProductName(product).toLowerCase().includes(search) || getProductCategory(product).toLowerCase().includes(search));
    }
    if (selectedStock === "onsale") {
      result = result.filter((product) => hasOffer(product));
    }
    if (selectedStock === "instock") {
      result = result.filter((product) => isInStock(product));
    }
    const minimum = Number(minPrice) || 0;
    const maximum = Number(maxPrice) || 2000;
    result = result.filter((product) => {
      const price = getDisplayPrice(product);
      return price >= minimum && price <= maximum;
    });
    if (sortValue === "price-low") {
      result.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    } else if (sortValue === "price-high") {
      result.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    } else if (sortValue === "rating") {
      result.sort((a, b) => getProductRating(b) - getProductRating(a));
    } else if (sortValue === "popularity") {
      result.sort((a, b) => getProductPopularity(b) - getProductPopularity(a));
    } else if (sortValue === "latest") {
      result.sort((a, b) => (new Date(getProductDate(b)).getTime() || 0) - (new Date(getProductDate(a)).getTime() || 0));
    }
    return result;
  }, [
    products,
    selectedBrand,
    selectedCategory,
    selectedSearch,
    selectedStock,
    minPrice,
    maxPrice,
    sortValue,
  ]);
  const randomProducts = useMemo(() => {
    const array = [...filteredProducts];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.slice(0, 5);
  }, [filteredProducts]);
  const displayedProducts = useMemo(() => filteredProducts.slice(0, Number(showCount) || 9), [filteredProducts, showCount]);
  const createQuery = (changes = {}) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    return params.toString();
  };
  const handleCategoryClick = (category) => {
    if (category === "Shop") {
      router.push("/shop");
    } else {
      router.push(`/shop?${createQuery({ category })}`);
    }
    setSidebarOpen(false);
  };
  const handlePriceFilter = () => {
    router.push(`/shop?${createQuery({ min_price: minPrice, max_price: maxPrice })}`);
  };
  const handleStockChange = (type) => {
    const current = searchParams.get("stock_status") || "";
    router.push(`/shop?${createQuery({ stock_status: current === type ? "" : type })}`);
  };
  const handleShowChange = (value) => {
    setShowCount(value);
    router.push(`/shop?${createQuery({ show: value })}`);
  };
  const handleSortChange = (value) => {
    setSortValue(value);
    router.push(`/shop?${createQuery({ sort: value })}`);
  };
  const toggleCategory = (category) => {
    setOpenCategories((previous) => ({...previous, [category]: !previous[category], }));
  };
  const handleProductClick = (product) => {
    const name = getProductName(product);
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (slug) router.push(`/product/${slug}`);
  };
  const money = (price) => Number(price || 0).toLocaleString("en-IN");
  const handleQuickViewAddToCart = () => {
    if (!quickProduct) {
      showToast("Please select a product.");
      return;
    }
    if (!selectedWeight) {
      showToast("Please select a weight.");
      return;
    }
    const productId = getProductId(quickProduct);
    if (!productId) {
      showToast("Product ID not found.");
      return;
    }
    const price = Number(getSelectedWeightPrice(quickProduct, selectedWeight) || 0);
    const qty = Math.max(1, Number(quantity) || 1);
    try {
      let cart = [];
      try {
        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        if (Array.isArray(savedCart)) {
          cart = savedCart;
        }
      } catch {
        cart = [];
      }
      const index = cart.findIndex((item) => String(item.product_id) === String(productId) && String(item.weight) === String(selectedWeight));
      if (index >= 0) {
        const newQuantity = Number(cart[index].quantity || 0) + qty;
        cart[index] = {...cart[index], quantity: newQuantity, final_price: price * newQuantity, };
      } else {
        cart.push({
          product_id: productId,
          product_title: getProductName(quickProduct),
          product_image: getProductImage(quickProduct),
          weight: selectedWeight,
          quantity: qty,
          final_price: price * qty,
        });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      window.location.reload();
      sessionStorage.setItem("openCartAfterRefresh", "true");
    } catch (error) {
      console.error("Add to cart error:", error);
      showToast("Could not add this product to cart.");
    }
  };
  return (
    <>
      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        .shopHero {
          position: relative;
          width: 100%;
          height: clamp(230px, 35vw, 500px);
          overflow: hidden;
          margin: 0;
          padding: 0;
          background: #f7a45c;
        }
        .shopHeroImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .shopHeroOverlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(0, 0, 0, 0.08);
        }
        .shopHeroOverlay h1 {
          margin: 0;
          color: #fff;
          font-size: clamp(28px, 5vw, 52px);
          font-weight: 700;
          line-height: 1.15;
          text-align: center;
          overflow-wrap: anywhere;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        .shopBody {
          width: 100%;
          min-height: 700px;
          padding: clamp(24px, 4vw, 50px) clamp(12px, 4vw, 6%);
          background: linear-gradient(135deg, #fff3d6 0%, #ffd9a8 25%, #ffb86b 50%, #f99b4a 75%, #f47c35 100%);
        }
        .shopLayout {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          gap: clamp(20px, 4vw, 50px);
        }
        .shopSidebar {
          width: 100%;
          min-width: 0;
          color: #000;
        }
        .sidebarSection {
          margin-bottom: 30px;
        }
        .sidebarTitle {
          margin: 0 0 16px;
          color: #000;
          font-size: 17px;
          font-weight: 700;
        }
        .rangeSlider {
          position: relative;
          width: 100%;
          height: 25px;
          margin-top: 12px;
        }
        .rangeTrack {
          position: absolute;
          left: 0;
          right: 0;
          top: 10px;
          height: 3px;
          background: #222;
        }
        .rangeDot {
          position: absolute;
          width: 13px;
          height: 13px;
          top: 5px;
          border-radius: 50%;
          background: #000;
          transform: translateX(-50%);
        }
        .priceBottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 4px;
        }
        .priceText {
          color: #000;
          font-size: 12px;
          overflow-wrap: anywhere;
        }
        .filterButton {
          min-height: 34px;
          padding: 0 13px;
          border: 1px solid #222;
          background: #fff;
          color: #000;
          font-size: 12px;
          cursor: pointer;
        }
        .filterButton:hover {
          background: #222;
          color: #fff;
        }
        .stockOption {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 12px;
          color: #000;
          font-size: 14px;
          cursor: pointer;
        }
        .customCheckbox {
          width: 16px;
          height: 16px;
          flex: 0 0 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #222;
          background: #fff;
        }
        .customCheckbox.checked {
          background: #000;
          color: #fff;
        }
        .customCheckbox i {
          font-size: 10px;
        }
        .categoryItem {
          margin-bottom: 10px;
        }
        .categoryRow {
          display: flex;
          align-items: center;
          min-height: 25px;
          color: #000;
          font-size: 14px;
          cursor: pointer;
        }
        .categoryRow:hover, .childCategory:hover {
          text-decoration: underline;
        }
        .categoryRowWithArrow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .categoryArrow {
          width: 26px;
          height: 26px;
          flex: 0 0 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-size: 12px;
          cursor: pointer;
        }
        .categoryChildren {
          padding: 7px 0 0 17px;
        }
        .childCategory {
          margin-bottom: 9px;
          color: #000;
          font-size: 13px;
          cursor: pointer;
        }
        .sidebarProduct {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 18px;
          cursor: pointer;
        }
        .sidebarProductImageBox {
          flex: 0 0 85px;
          width: 85px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }
        .sidebarProductImage {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .sidebarProductInfo {
          min-width: 0;
          padding-top: 3px;
        }
        .sidebarProductName {
          margin: 0;
          color: #000;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }
        .sidebarProductPrice {
          margin-top: 7px;
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }
        .sidebarOriginalPrice {
          color: #777;
          font-size: 11px;
          text-decoration: line-through;
        }
        .sidebarOfferPrice {
          color: #d62828;
          font-size: 13px;
          font-weight: 700;
        }
        .shopMain {
          width: 100%;
          min-width: 0;
        }
        .shopTopBar {
          width: 100%;
          margin-bottom: 24px;
        }
        .shopTopRow {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 7px;
          min-width: 0;
          font-size: 13px;
          color: #222;
          overflow-wrap: anywhere;
        }
        .breadcrumbHome {
          cursor: pointer;
        }
        .shopControls {
          margin-left: auto;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 16px;
          min-width: 0;
        }
        .showControls {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #000;
          font-size: 13px;
          white-space: nowrap;
        }
        .showNumber {
          padding: 3px;
          color: #000;
          cursor: pointer;
        }
        .showNumber.active {
          font-weight: 800;
          text-decoration: underline;
        }
        .sortSelect {
          width: 190px;
          max-width: 100%;
          height: 38px;
          padding: 0 10px;
          border: 1px solid #222;
          background: #fff;
          color: #222;
          font-size: 12px;
          cursor: pointer;
        }
        .productsGrid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px 18px;
        }
        .productCard {
          width: 100%;
          min-width: 0;
          cursor: pointer;
        }
        .productImageBox {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.08);
          isolation: isolate;
        }
        .productImage {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          transition: transform 0.3s ease;
        }
        .productImageSecond {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .productCard:hover .productImage {
          transform: scale(1.025);
        }
        .productCard:hover .productImageSecond {
          opacity: 1;
        }
        .productStatusTag {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 10;
          max-width: calc(100% - 20px);
          padding: 6px 9px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 800;
          line-height: 1.25;
          overflow-wrap: anywhere;
          pointer-events: none;
        }
        .saleTag {
          background: #2e7d32;
          color: #fff;
        }
        .unavailableTag {
          background: #333;
          color: #fff;
        }
        .productHoverActions {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 20;
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          visibility: hidden;
          transform: translateX(8px);
          transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
        }
        .productImageBox:hover .productHoverActions, .productImageBox:focus-within .productHoverActions {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }
        .productHoverAction {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: #fff;
          color: #111;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
          transition: background 0.2s ease, color 0.2s ease;
        }
        .productHoverAction:hover, .productHoverAction.active {
          background: #111;
          color: #fff;
        }
        .productHoverAction i {
          font-size: 14px;
        }
        .productOptionsButton {
          position: absolute;
          left: 12px;
          bottom: 12px;
          z-index: 15;
          min-width: 44px;
          height: 44px;
          padding: 0 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          border-radius: 24px;
          background: #fff;
          color: #111;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          opacity: 0;
          visibility: hidden;
          transform: translateY(8px);
          transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease, background 0.2s ease, color 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
        }
        .productImageBox:hover .productOptionsButton, .productImageBox:focus-within .productOptionsButton {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .productOptionsButton:hover {
          background: #111;
          color: #fff;
        }
        .productOptionsButton i {
          font-size: 16px;
        }
        .productCardName {
          margin: 11px 0 0;
          color: #000;
          font-size: 14px;
          font-weight: 600;
          line-height: 1.4;
          text-align: center;
          overflow-wrap: anywhere;
        }
        .productPrice {
          margin-top: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 7px;
          font-size: 14px;
        }
        .originalPrice {
          color: #777;
          font-size: 12px;
          text-decoration: line-through;
        }
        .offerPrice {
          color: #d62828;
          font-size: 14px;
          font-weight: 700;
        }
        .emptyProducts {
          width: 100%;
          padding: 55px 15px;
          text-align: center;
          color: #000;
          font-size: 15px;
        }
        .mobileShowSidebar, .mobileSidebarClose, .mobileSidebarOverlay {
          display: none;
        }
        .productCartPopup {
          position: absolute;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: rgba(255, 255, 255, 0.97);
        }
        .productCartPopupInner {
          position: relative;
          width: 100%;
          max-width: 320px;
          max-height: 100%;
          overflow-y: auto;
          padding: 22px 20px 18px;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.16);
          text-align: center;
        }
        .productCartPopupClose {
          position: absolute;
          top: 5px;
          right: 7px;
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: #111;
          font-size: 23px;
          cursor: pointer;
        }
        .productCartPopupClose:hover {
          background: #eee;
        }
        .productCartPopupImage {
          display: block;
          width: 85px;
          height: 85px;
          object-fit: contain;
          margin: 0 auto 8px;
        }
        .productCartPopupName {
          margin: 0 0 14px;
          color: #111;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }
        .productCartPopupLabel {
          display: block;
          margin-bottom: 7px;
          color: #555;
          font-size: 12px;
          font-weight: 600;
          text-align: left;
        }
        .productWeightSelect {
          width: 100%;
          height: 42px;
          margin-bottom: 14px;
          padding: 0 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background: #fff;
          color: #111;
          font-size: 13px;
          cursor: pointer;
        }
        .productCartPopupPrice {
          margin-bottom: 14px;
          color: #d62828;
          font-size: 17px;
          font-weight: 700;
        }
        .productAddCartButton {
          width: 100%;
          min-height: 42px;
          border: none;
          border-radius: 4px;
          background: #111;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .productAddCartButton:hover {
          background: #d62828;
        }
        .productAddCartButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .quickViewOverlay {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.65);
        }
        .quickViewModal {
          position: relative;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 30px;
          padding: 30px;
          background: #fff;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        .quickViewClose {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #222;
          border-radius: 50%;
          background: #fff;
          color: #000;
          font-size: 22px;
          cursor: pointer;
          z-index: 5;
        }
        .quickViewClose:hover {
          background: #000;
          color: #fff;
        }
        .quickViewImageBox {
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #f7f7f7;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .quickViewImage {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
        }
        .quickViewInfo {
          min-width: 0;
          padding-top: 12px;
        }
        .quickViewTitle {
          margin: 0 0 14px;
          color: #111;
          font-size: clamp(20px, 3vw, 25px);
          line-height: 1.3;
          overflow-wrap: anywhere;
        }
        .quickViewCategory {
          margin-bottom: 14px;
          color: #777;
          font-size: 13px;
        }
        .quickViewPrice {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 18px;
        }
        .quickViewOriginalPrice {
          color: #888;
          font-size: 14px;
          text-decoration: line-through;
        }
        .quickViewOfferPrice {
          color: #d62828;
          font-size: 21px;
          font-weight: 700;
        }
        .quickViewDescription {
          margin-bottom: 22px;
          color: #555;
          font-size: 14px;
          line-height: 1.7;
          overflow-wrap: anywhere;
        }
        .quickViewButtons {
          display: flex;
          flex-direction: column;
          gap: 18px;
          width: 100%;
          margin-top: 20px;
        }
        .quickViewWeight, .quickViewQuantity {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        .quickViewWeight label, .quickViewQuantity label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        .productWeightSelect {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          border: 1px solid #d6d6d6;
          border-radius: 8px;
          background: #fff;
          color: #333;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }
        .productWeightSelect:focus {
          border-color: #2e7d32;
        }
        .quantityControls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 150px;
          height: 44px;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }
        .quantityControls button {
          width: 44px;
          height: 100%;
          border: none;
          background: #f3f3f3;
          color: #2e7d32;
          font-size: 23px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .quantityControls button:hover {
          background: #e4f2e5;
        }
        .quantityControls span {
          min-width: 35px;
          text-align: center;
          font-size: 16px;
          font-weight: 600;
          color: #222;
        }
        .quickViewAddCartButton {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 48px;
          padding: 12px 18px;
          border: none;
          border-radius: 8px;
          background: #2e7d32;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .quickViewAddCartButton:hover {
          background: #1b5e20;
        }
        .quickViewAddCartButton:active {
          transform: scale(0.98);
        }
        @media (max-width: 480px) {
          .quickViewButtons {
            gap: 14px;
            margin-top: 16px;
          }
          .productWeightSelect {
            height: 44px;
            font-size: 14px;
          }
          .quantityControls {
            width: 140px;
            height: 42px;
          }
          .quickViewAddCartButton {
            min-height: 46px;
            font-size: 14px;
          }
        }
        .quickViewButton, .quickViewSecondaryButton {
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid #111;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .quickViewButton {
          background: #111;
          color: #fff;
        }
        .quickViewButton:hover {
          background: #fff;
          color: #111;
        }
        .quickViewSecondaryButton {
          background: #fff;
          color: #111;
        }
        .quickViewSecondaryButton:hover {
          background: #111;
          color: #fff;
        }
        .shopToast {
          position: fixed;
          left: 50%;
          bottom: 25px;
          z-index: 20000;
          transform: translateX(-50%);
          max-width: calc(100vw - 30px);
          padding: 12px 20px;
          border-radius: 6px;
          background: #111;
          color: #fff;
          font-size: 14px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
        }
        .shopBody, .shopLayout, .shopMain, .shopSidebar, .productsGrid, .productCard {
          box-sizing: border-box;
          min-width: 0;
          max-width: 100%;
        }
        .shopBody {
          width: 100%;
          overflow-x: clip;
        }
        .shopLayout {
          width: 100%;
        }
        .productsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px 18px;
          width: 100%;
        }
        .productCard {
          width: 100%;
          min-width: 0;
        }
        .productImageBox {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
        }
        .productImage {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .productHoverActions {
          display: flex;
        }
        .productOptionsButton {
          display: flex;
        }
        @media (hover: hover) and (pointer: fine) and (min-width: 1025px) {
          .productOptionsButton {
            opacity: 0;
            visibility: hidden;
            transform: translateY(8px);
          }
          .productImageBox:hover .productOptionsButton, .productImageBox:focus-within .productOptionsButton {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }
          .productHoverActions {
            opacity: 0;
            visibility: hidden;
            transform: translateX(8px);
          }
          .productImageBox:hover .productHoverActions, .productImageBox:focus-within .productHoverActions {
            opacity: 1;
            visibility: visible;
            transform: translateX(0);
          }
          .cartButtonText {
            display: inline;
          }
        }
        @media screen and (min-width: 1440px) {
          .shopLayout {
            max-width: 1500px;
            grid-template-columns: 250px minmax(0, 1fr);
            gap: 40px;
          }
          .productsGrid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 28px 20px;
          }
        }
        @media screen and (min-width: 1025px) and (max-width: 1439px) {
          .shopLayout {
            grid-template-columns: 220px minmax(0, 1fr);
            gap: 25px;
          }
          .productsGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 22px 14px;
          }
        }
        @media screen and (max-width: 1024px) {
          .shopLayout {
            display: block;
          }
          .shopMain {
            width: 100%;
          }
          .shopSidebar {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 10001;
            width: min(340px, 88vw);
            height: 100vh;
            height: 100dvh;
            padding: 24px 18px;
            overflow-y: auto;
            overscroll-behavior: contain;
            background: #fff4df;
            box-shadow: 8px 0 30px rgba(0, 0, 0, 0.15);
            transform: translateX(-105%);
            visibility: hidden;
            transition: transform 0.25s ease, visibility 0.25s ease;
          }
          .shopSidebar.mobileSidebarOpen {
            transform: translateX(0);
            visibility: visible;
          }
          .mobileShowSidebar {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 40px;
            margin-top: 14px;
            padding: 0 15px;
            border: 1px solid #222;
            background: #fff;
            color: #111;
            font-size: 13px;
            cursor: pointer;
          }
          .mobileSidebarClose {
            display: block;
            position: sticky;
            top: 0;
            z-index: 3;
            width: 36px;
            height: 36px;
            margin: 0 0 18px auto;
            border: 1px solid #222;
            background: #fff;
            color: #111;
            font-size: 24px;
            cursor: pointer;
          }
          .mobileSidebarOverlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.45);
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: opacity 0.25s ease, visibility 0.25s ease;
          }
          .mobileSidebarOverlay.active {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
          }
          .productHoverActions button:nth-child(1), .productHoverActions button:nth-child(2) {
            display: none !important;
          }
          .productOptionsButton {
            left: 8px;
            bottom: 8px;
            width: 42px;
            min-width: 42px;
            height: 42px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 1;
            visibility: visible;
            transform: none;
            border-radius: 50%;
          }
          .cartButtonText {
            display: none;
          }
          .productOptionsButton i {
            font-size: 17px;
          }
          .productHoverActions {
            top: 8px;
            right: 8px;
            opacity: 1;
            visibility: visible;
            transform: none;
          }
          .productHoverAction {
            width: 34px;
            height: 34px;
          }
          .productImageBox:hover .productOptionsButton, .productImageBox:focus-within .productOptionsButton {
            opacity: 1;
            visibility: visible;
            transform: none;
          }
          .productCard:hover .productImage {
            transform: none;
          }
          .productCard:hover .productImageSecond {
            opacity: 0;
          }
        }
        @media screen and (min-width: 768px) and (max-width: 1024px) {
          .productsGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 20px 14px;
          }
          .shopBody {
            padding: 28px 22px;
          }
          .shopTopRow {
            align-items: flex-start;
          }
          .shopControls {
            gap: 12px;
          }
          .sortSelect {
            width: 180px;
          }
          .productCardName {
            font-size: 13px;
          }
          .quickViewModal {
            max-width: 760px;
            gap: 20px;
            padding: 24px;
          }
        }
        @media screen and (max-width: 767px) {
          .shopBody {
            padding: 22px 12px;
          }
          .productsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 22px 10px;
          }
          .shopTopRow {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
          }
          .breadcrumb {
            width: 100%;
            font-size: 12px;
          }
          .shopControls {
            width: 100%;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .showControls {
            gap: 6px;
            font-size: 12px;
          }
          .sortSelect {
            width: auto;
            flex: 1;
            min-width: 0;
            max-width: 210px;
            height: 36px;
            padding: 0 6px;
            font-size: 11px;
          }
          .productCardName {
            margin-top: 8px;
            font-size: 13px;
            line-height: 1.4;
            overflow-wrap: anywhere;
          }
          .productPrice {
            gap: 5px;
            margin-top: 5px;
            font-size: 12px;
          }
          .originalPrice {
            font-size: 11px;
          }
          .offerPrice {
            font-size: 13px;
          }
          .productStatusTag {
            top: 6px;
            left: 6px;
            padding: 5px 6px;
            font-size: 9px;
          }
          .quickViewOverlay {
            padding: 12px;
            overflow-y: auto;
          }
          .quickViewModal {
            width: 100%;
            max-width: 480px;
            max-height: 92dvh;
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 18px;
          }
          .quickViewImageBox {
            width: 100%;
            max-height: 280px;
            aspect-ratio: 1 / 1;
          }
          .quickViewInfo {
            padding-top: 0;
          }
          .quickViewTitle {
            font-size: 20px;
          }
          .quickViewDescription {
            font-size: 13px;
          }
          .quickViewButtons {
            gap: 8px;
          }
          .quickViewButton, .quickViewSecondaryButton {
            min-height: 40px;
            flex: 1 1 auto;
          }
          .productCartPopup {
            padding: 8px;
          }
          .productCartPopupInner {
            width: 100%;
            max-width: 280px;
            padding: 20px 14px 14px;
          }
        }
        @media screen and (max-width: 480px) {
          .shopHero {
            height: clamp(190px, 55vw, 280px);
          }
          .shopBody {
            padding: 18px 9px;
          }
          .productsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px 8px;
          }
          .shopControls {
            flex-wrap: wrap;
          }
          .showControls {
            flex: 0 0 auto;
          }
          .sortSelect {
            flex: 1 1 140px;
            max-width: 100%;
          }
          .productOptionsButton {
            left: 6px;
            bottom: 6px;
            width: 36px;
            min-width: 36px;
            height: 36px;
          }
          .productHoverActions {
            top: 6px;
            right: 6px;
          }
          .productHoverAction {
            width: 30px;
            height: 30px;
          }
          .productHoverAction i {
            font-size: 12px;
          }
          .productCardName {
            font-size: 12px;
          }
          .productPrice {
            font-size: 12px;
          }
          .emptyProducts {
            padding: 35px 10px;
            font-size: 13px;
          }
          .shopToast {
            bottom: 15px;
            width: max-content;
            max-width: calc(100vw - 24px);
            padding: 11px 14px;
            font-size: 12px;
          }
        }
        @media screen and (max-width: 360px) {
          .shopBody {
            padding: 14px 7px;
          }
          .productsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px 6px;
          }
          .shopControls {
            align-items: stretch;
            gap: 8px;
          }
          .showControls {
            gap: 5px;
            font-size: 11px;
          }
          .sortSelect {
            min-width: 0;
            width: 100%;
            font-size: 10px;
          }
          .productStatusTag {
            top: 4px;
            left: 4px;
            max-width: calc(100% - 8px);
            padding: 4px;
            font-size: 8px;
          }
          .productOptionsButton {
            left: 4px;
            bottom: 4px;
            width: 32px;
            min-width: 32px;
            height: 32px;
          }
          .productOptionsButton i {
            font-size: 14px;
          }
          .productHoverActions {
            top: 4px;
            right: 4px;
          }
          .productHoverAction {
            width: 27px;
            height: 27px;
          }
          .productCardName {
            font-size: 11px;
            line-height: 1.35;
          }
          .originalPrice {
            font-size: 10px;
          }
          .offerPrice {
            font-size: 12px;
          }
          .quickViewModal {
            padding: 14px;
          }
          .quickViewTitle {
            font-size: 18px;
          }
          .quickViewButtons button {
            width: 100%;
          }
        }
        @media screen and (max-width: 320px) {
          .shopBody {
            padding-right: 5px;
            padding-left: 5px;
          }
          .productsGrid {
            gap: 14px 5px;
          }
          .productCardName {
            font-size: 10px;
          }
          .productOptionsButton {
            width: 30px;
            min-width: 30px;
            height: 30px;
          }
          .productHoverAction {
            width: 25px;
            height: 25px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .productImage, .productImageSecond, .productOptionsButton, .productHoverActions, .shopSidebar, .mobileSidebarOverlay {
            transition: none !important;
          }
        }
      `}</style>
      <section className="shopHero">
        <img src="/uploads/shop.png" alt="Shop" className="shopHeroImage" onError={(event) => {
          event.currentTarget.style.display = "none";
        }}/>
        <div className="shopHeroOverlay">
          <h1>{selectedBrand || selectedCategory}</h1>
        </div>
      </section>
      <section className="shopBody">
        <div className="shopLayout">
          <aside className={`shopSidebar ${
            sidebarOpen ? "mobileSidebarOpen" : ""
          }`}>
            <button type="button" className="mobileSidebarClose" onClick={() => setSidebarOpen(false)} aria-label="Close filters">×</button>
            <div className="sidebarSection">
              <h3 className="sidebarTitle">Filter by price</h3>
              <div className="rangeSlider">
                <div className="rangeTrack" />
                <div className="rangeDot"
                  style={{
                    left: `${Math.min(100, Math.max(0, (Number(minPrice) / 2000) * 100))}%`,
                  }}
                />
                <div
                  className="rangeDot"
                  style={{
                    left: `${Math.min(100, Math.max(0, (Number(maxPrice) / 2000) * 100))}%`,
                  }}
                />
              </div>
              <div className="priceBottom">
                <span className="priceText">
                  Price: ₹{money(minPrice)} — ₹{money(maxPrice)}
                </span>
                <button type="button" className="filterButton" onClick={handlePriceFilter}>Filter</button>
              </div>
            </div>
            <div className="sidebarSection">
              <h3 className="sidebarTitle">Stock status</h3>
              <div className="stockOption" onClick={() => handleStockChange("onsale")}>
                <span className={`customCheckbox ${selectedStock === "onsale" ? "checked" : "" }`}>
                  {selectedStock === "onsale" && (<i className="fa fa-check" />)}
                </span>
                <span>On sale</span>
              </div>
              <div className="stockOption" onClick={() => handleStockChange("instock")}>
                <span className={`customCheckbox ${selectedStock === "instock" ? "checked" : ""}`}>
                  {selectedStock === "instock" && (<i className="fa fa-check" />)}
                </span>
                <span>In stock</span>
              </div>
            </div>
            <div className="sidebarSection">
              <h3 className="sidebarTitle">Product categories</h3>
              {categories.map((category) => {
                const hasChildren = Array.isArray(category.children);
                const isOpen = openCategories[category.name];
                return (
                  <div className="categoryItem" key={category.name}>
                    {hasChildren ? (
                      <>
                        <div className="categoryRowWithArrow">
                          <span className="categoryRow" onClick={() => handleCategoryClick(category.name)}>
                            {category.name}
                          </span>
                          <span className="categoryArrow" onClick={() => toggleCategory(category.name)}>
                            <i className={`fa ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`}/>
                          </span>
                        </div>
                        {isOpen && (
                          <div className="categoryChildren">
                            {category.children.map((child) => (
                              <div key={child} className="childCategory" onClick={() => handleCategoryClick(child)}>
                                {child}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="categoryRow" onClick={() => handleCategoryClick(category.name)}>
                        {category.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="sidebarSection">
              <h3 className="sidebarTitle">Products</h3>
              <div className="sidebarProducts">
                {loading ? (<p>Loading...</p>) : randomProducts.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  randomProducts.map((product, index) => (
                    <div className="sidebarProduct" key={getProductId(product) || index} onClick={() => handleProductClick(product)}>
                      <div className="sidebarProductImageBox">
                        <img src={getProductImage(product)} alt={getProductName(product)} className="sidebarProductImage" onError={(event) => {
                            event.currentTarget.src = "/uploads/no-image.png";
                          }}
                        />
                      </div>
                      <div className="sidebarProductInfo">
                        <p className="sidebarProductName">
                          {getProductName(product)}
                        </p>
                        {hasOffer(product) ? (
                          <div className="sidebarProductPrice">
                            <span className="sidebarOriginalPrice">
                              ₹{money(getOriginalPrice(product))}
                            </span>
                            <span className="sidebarOfferPrice">
                              ₹{money(getOfferPrice(product))}
                            </span>
                          </div>
                        ) : (
                          <div className="sidebarProductPrice">
                            <span className="sidebarOfferPrice">
                              ₹{money(getDisplayPrice(product))}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
          <main className="shopMain">
            <div className="shopTopBar">
              <div className="shopTopRow">
                <div className="breadcrumb">
                  <span className="breadcrumbHome" onClick={() => handleCategoryClick("Shop")}>
                    Home
                  </span>
                  <span>»</span>
                  <span>{selectedBrand || selectedCategory}</span>
                </div>
                <div className="shopControls">
                  <div className="showControls">
                    <span>Show</span>
                    {["9", "12", "18", "24"].map((number) => (
                      <span key={number} className={`showNumber ${showCount === number ? "active" : ""}`} onClick={() => handleShowChange(number)}>
                        {number}
                      </span>
                    ))}
                  </div>
                  <select className="sortSelect" value={sortValue} onChange={(event) =>
                    handleSortChange(event.target.value)
                  }aria-label="Sort products">
                    <option value="default">Default sorting</option>
                    <option value="popularity">Sort by popularity</option>
                    <option value="rating">Sort by average rating</option>
                    <option value="latest">Sort by latest</option>
                    <option value="price-low">Sort by price: low to high</option>
                    <option value="price-high">Sort by price: high to low</option>
                  </select>
                </div>
              </div>
              <button type="button" className="mobileShowSidebar" onClick={() => setSidebarOpen(true)}>
                <i className="fa fa-bars" />
                <span>Show filters</span>
              </button>
            </div>
            {loading ? (
              <div className="emptyProducts">Loading products...</div>
            ) : displayedProducts.length === 0 ? (
              <div className="emptyProducts">No products found.</div>
            ) : (
              <div className="productsGrid">
                {displayedProducts.map((product, index) => {
                  const image1 = getProductImage(product);
                  const image2 = getProductSecondImage(product);
                  const originalPrice = getOriginalPrice(product);
                  const offerPrice = getOfferPrice(product);
                  const productId = getProductId(product);
                  const productIdString = productId ? String(productId) : "";
                  const isWishlisted = wishlistIds.includes(productIdString);
                  const isCompared = compareIds.includes(productIdString);
                  const isCartPopupOpen = cartPopupProduct && String(getProductId(cartPopupProduct)) === String(productId);
                  const statusTag = getProductStatusTag(product);
                  return (
                    <div className="productCard" key={productId || index} onClick={() => handleProductClick(product)}>
                      <div className="productImageBox">
                        {statusTag && (
                          <span className={`productStatusTag ${statusTag === "SALE" ? "saleTag" : "unavailableTag"}`}>
                            {statusTag}
                          </span>
                        )}
                        <img src={image1} alt={getProductName(product)} className="productImage" onClick={(event) => {
                            event.stopPropagation();
                            handleProductClick(product);
                          }}
                          onError={(event) => {
                            if (event.currentTarget.dataset.fallback) return;
                            event.currentTarget.dataset.fallback = "true";
                            event.currentTarget.src = "/uploads/no-image.png";
                          }}
                        />
                        {image2 && (
                          <img src={image2} alt={getProductName(product)} className="productImage productImageSecond"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleProductClick(product);
                            }}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        {!isCartPopupOpen && (
                          <div className="productHoverActions">
                            <button type="button" className={`productHoverAction ${isCompared ? "active" : ""}`}
                              onClick={(event) =>
                                handleCompareClick(event, product)
                              } aria-label={isCompared ? "Remove from compare" : "Add to compare"} title="Compare"
                            >
                              <i className="fa fa-exchange" />
                            </button>
                            <button type="button" className="productHoverAction" onClick={(event) =>
                                openQuickView(event, product)
                              } aria-label="Quick view" title="Quick view">
                              <i className="fa fa-eye" />
                            </button>
                            <button type="button" className={`productHoverAction ${
                              isWishlisted ? "active" : ""
                            }`} onClick={(event) => handleWishlist(event, product)} aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"} title="Wishlist">
                              <i className="fa fa-heart" />
                            </button>
                          </div>
                        )}
                        {!isCartPopupOpen && (
                          <button type="button" className="productOptionsButton" onClick={(event) => openCartPopup(event, product)} aria-label="Select weight and add to cart" title="Select options">
                            <i className="fa fa-shopping-cart" />
                            <span className="cartButtonText">
                              SELECT OPTIONS
                            </span>
                          </button>
                        )}
                        {isCartPopupOpen && cartPopupProduct && (
                          <div className="productCartPopup" onClick={(event) => event.stopPropagation()}>
                            <div className="productCartPopupInner">
                              <button type="button" className="productCartPopupClose" onClick={closeCartPopup} aria-label="Close">×</button>
                              <label className="productCartPopupLabel" htmlFor={`weight-${String(getProductId(cartPopupProduct))}`}>
                                Select weight
                              </label>
                              <select id={`weight-${String(getProductId(cartPopupProduct))}`} className="productWeightSelect" value={selectedWeight} onChange={(event) =>
                                setSelectedWeight(event.target.value)
                              }>
                                <option value="">Choose weight</option>
                                {getWeightOptions(cartPopupProduct).map(
                                  (option) => (<option key={option.label} value={option.label} >{option.label}</option>)
                                )}
                              </select>
                              {selectedWeight && (
                                <div className="productCartPopupPrice">
                                  ₹{money(getSelectedWeightPrice(cartPopupProduct, selectedWeight))}
                                </div>
                              )}
                              <button type="button" className="productAddCartButton" onClick={handleAddToCart} disabled={!selectedWeight}>
                                ADD TO CART
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="productCardName">
                        {getProductName(product)}
                      </div>
                      {hasOffer(product) ? (
                        <div className="productPrice">
                          <span className="originalPrice">
                            ₹{money(originalPrice)}
                          </span>
                          <span className="offerPrice">
                            ₹{money(offerPrice)}
                          </span>
                        </div>
                      ) : (
                        <div className="productPrice">
                          <span className="offerPrice">
                            ₹{money(getDisplayPrice(product))}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </section>
      <div className={`mobileSidebarOverlay ${sidebarOpen ? "active" : ""}`} onClick={() => setSidebarOpen(false)}/>
      {quickViewOpen && quickProduct && (
        <div className="quickViewOverlay" onClick={closeQuickView}>
          <div className="quickViewModal" onClick={(event) => event.stopPropagation()} >
            <button type="button" className="quickViewClose" onClick={closeQuickView} aria-label="Close">×</button>
            <div className="quickViewImageBox">
              <img src={getProductImage(quickProduct)} alt={getProductName(quickProduct)} className="quickViewImage" onError={(event) => {
                event.currentTarget.src = "/uploads/no-image.png";
              }}/>
            </div>
            <div className="quickViewInfo">
              <h2 className="quickViewTitle">
                {getProductName(quickProduct)}
              </h2>
              <div className="quickViewCategory">
                {getProductCategory(quickProduct)}
              </div>
              {hasOffer(quickProduct) ? (
                <div className="quickViewPrice">
                  <span className="quickViewOriginalPrice">
                    ₹{money(getOriginalPrice(quickProduct))}
                  </span>
                  <span className="quickViewOfferPrice">
                    ₹{money(getOfferPrice(quickProduct))}
                  </span>
                </div>
              ) : (
                <div className="quickViewPrice">
                  <span className="quickViewOfferPrice">
                    ₹{money(getDisplayPrice(quickProduct))}
                  </span>
                </div>
              )}
              <div className="quickViewDescription">
                {quickProduct?.description || quickProduct?.short_description || quickProduct?.shortDescription || "View this product for more details and available options."}
              </div>
              <div className="quickViewButtons">
                <div className="quickViewWeight">
                  <label htmlFor="quickViewWeight">Select Weight</label>
                  <select id="quickViewWeight" className="productWeightSelect" value={selectedWeight} onChange={(e) => setSelectedWeight(e.target.value)}>
                    <option value="">Select Weight</option>
                    <option value="250g">250g</option>
                    <option value="500g">500g</option>
                    <option value="1kg">1kg</option>
                  </select>
                </div>
                <div className="quickViewQuantity">
                  <label>Quantity</label>
                  <div className="quantityControls">
                    <button type="button" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} aria-label="Decrease quantity">−</button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => setQuantity((prev) => prev + 1)} aria-label="Increase quantity">+</button>
                  </div>
                </div>
                <button type="button" className="quickViewAddCartButton" onClick={handleQuickViewAddToCart}>ADD TO CART</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {toastMessage && (
        <div className="shopToast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </>
  );
}
function isCompareLabel(compareIds, productId) {
  return compareIds.includes(String(productId))
    ? "REMOVE FROM COMPARE"
    : "ADD TO COMPARE";
}
export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ padding: 30 }}>Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}