"use client";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "30");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "2000");
  const [showCount, setShowCount] = useState(searchParams.get("show") || "9");
  const [sortValue, setSortValue] = useState(searchParams.get("sort") || "default");
  const [sidebarOpen, setSidebarOpen] = useState(false);  
  const [openCategories, setOpenCategories] = useState({Dates: false, Nuts: false,});
  const [wishlistIds, setWishlistIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState(null);
  const [cartPopupProduct, setCartPopupProduct] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState("");
  const [cartQuantity, setCartQuantity] = useState(1);
  const [wishlistItems, setWishlistItems] = useState([]);
  const categories = [
    {name: "Berries",},
    {name: "Bulk / Wholesale",},
    {name: "Combo Offers",},
    {name: "Combos & Gift Packs",},
    {
      name: "Dates",
      children: ["Dry Dates", "Premium Dates"],
    },
    {name: "Dry Fruits",},
    {name: "Flavoured Nuts",},
    {name: "Hampers",},
    {name: "Jumbo & Premium",},
    {name: "Mixes & Snacking",},
    {
      name: "Nuts",
      children: ["Almonds", "Cashews", "Pistachios", "Walnuts",],
    },
    {name: "Powders",},
    {name: "Seeds",},
    {name: "Uncategorized",},
  ];
  const getProductId = (product) => {return (product?._id || product?.id || product?.product_id || product?.productId);};
  const getProductName = (product) => {return (product?.productName || product?.product_name || product?.product_title || product?.name || product?.title || "Product");};
  const getProductCategory = (product) => {return (product?.category_name || product?.category || product?.product_category || product?.categoryName || "");};
  const getOriginalPrice = (product) => {return (Number(product?.originalPrice ?? product?.original_price ?? product?.mrp ?? product?.price ?? 0) || 0);};
  const getOfferPrice = (product) => {return (Number(product?.offerPrice ?? product?.offer_price ?? product?.salePrice ?? product?.sale_price ?? 0) || 0);};
  const hasOffer = (product) => {
    const originalPrice = getOriginalPrice(product);
    const offerPrice = getOfferPrice(product);
    return (offerPrice > 0 && originalPrice > 0 && offerPrice < originalPrice);
  };
  const getDisplayPrice = (product) => {
    const originalPrice = getOriginalPrice(product);
    const offerPrice = getOfferPrice(product);
    if (offerPrice > 0 && offerPrice < originalPrice) {
      return offerPrice;
    }
    if (offerPrice > 0) {
      return offerPrice;
    }
    return originalPrice;
  };
  const getProductImages = (product) => {
    const images = [];
    const directImages = [product?.product_image, product?.productImage, product?.image, product?.image_url, product?.imageUrl, product?.thumbnail, product?.thumbnail_url, product?.thumbnailUrl,];
    directImages.forEach((image) => {
      if (typeof image === "string" && image.trim()) {
        images.push(image.trim());
      }
    });
    const imageArrays = [product?.images, product?.product_images, product?.gallery, product?.gallery_images, product?.productImages,];
    imageArrays.forEach((imageArray) => {
      if (!Array.isArray(imageArray)) {
        return;
      }
      imageArray.forEach((item) => {
        if (typeof item === "string" && item.trim()) {
          images.push(item.trim());
        }
        if (typeof item === "object" && item !== null) {
          const image = item.url || item.image || item.image_url || item.src;
          if (typeof image === "string" && image.trim()) {
            images.push(image.trim());
          }
        }
      });
    });
    return [...new Set(images)];
  };
  const getProductImage = (product) => {
    const images = getProductImages(product);
    return images[0] || "/uploads/no-image.png";
  };
  const getProductSecondImage = (product) => {
    const images = getProductImages(product);
    return images[1] || "";
  };
  const getProductRating = (product) => {return (Number(product?.rating ?? product?.average_rating ?? product?.averageRating ?? 0) || 0);};
  const getProductPopularity = (product) => {return (Number(product?.popularity ?? product?.sales_count ?? product?.salesCount ?? product?.views ?? 0) || 0);};
  const getProductDate = (product) => {return (product?.createdAt || product?.created_at || product?.date || "");};
  const isInStock = (product) => {
    const status = String(product?.status ?? product?.stock_status ?? product?.stockStatus ?? "").trim().toLowerCase();
    return ["currently available", "available", "in stock", "instock", "active",].includes(status);
  };
  const getWeightOptions = (product) => {
    const basePrice = getDisplayPrice(product);
    const possibleOptions = product?.weight_options || product?.weightOptions || product?.weights || product?.variants || product?.product_variants;
    if (Array.isArray(possibleOptions)) {
      const parsed = [];
      possibleOptions.forEach((item) => {
        if (typeof item === "string") {
          const text = item.trim();
          if (text === "250g" || text === "500g" || text === "1kg") {
            parsed.push({label: text, price: basePrice,});
          }
        }
        if (typeof item === "object" && item !== null) {
          const label = item.weight || item.label || item.name || item.size;
          const price = Number(item.offerPrice ?? item.offer_price ?? item.salePrice ?? item.sale_price ?? item.price ?? item.amount ?? 0) || 0;
          if (label && (String(label).toLowerCase().includes("250") || String(label).toLowerCase().includes("500") || String(label).toLowerCase().includes("1kg") || String(label).toLowerCase().includes("1 kg"))) {
            parsed.push({label: String(label), price: price > 0 ? price : basePrice, });
          }
        }
      });
      const unique = [];
      const seen = new Set();
      parsed.forEach((item) => {
        const normalized = item.label.toLowerCase().replace(/\s/g, "");
        let standardLabel = "";
        if (normalized.includes("250")) {
          standardLabel = "250g";
        } else if (normalized.includes("500")) {
          standardLabel = "500g";
        } else if (
          normalized.includes("1kg") ||
          normalized.includes("1000g")
        ) {
          standardLabel = "1kg";
        }
        if (standardLabel && !seen.has(standardLabel)) {
          seen.add(standardLabel);
          unique.push({label: standardLabel, price: item.price,});
        }
      });
      if (unique.length > 0) {
        const order = {"250g": 1, "500g": 2, "1kg": 3,};
        unique.sort((a, b) => order[a.label] - order[b.label]);
        return unique;
      }
    }
    return [
      {
        label: "250g",
        price: basePrice,
      },
      {
        label: "500g",
        price: basePrice * 2,
      },
      {
        label: "1kg",
        price: basePrice * 4,
      },
    ];
  };
  const getCartPopupPrice = (product) => {
    if (!product) {
      return 0;
    }
    const options = getWeightOptions(product);
    const selected = options.find((item) => item.label === selectedWeight);
    return (
      selected?.price ||
      getDisplayPrice(product)
    );
  };
  const openCartPopup = (event, product) => {
    event.stopPropagation();
    setCartPopupProduct(product);
    setSelectedWeight("");
    setCartQuantity(1);
    document.body.style.overflow = "hidden";
  };
  const closeCartPopup = () => {setCartPopupProduct(null); setSelectedWeight(""); setCartQuantity(1); document.body.style.overflow = "";};
  const decreaseCartQuantity = (event) => {
    event.stopPropagation();
    setCartQuantity((previous) => Math.max(1, previous - 1));
  };
  const increaseCartQuantity = (event) => {
    event.stopPropagation();
    setCartQuantity((previous) => previous + 1);
  };
  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!cartPopupProduct) {
      return;
    }
    const product = cartPopupProduct;
    const productId = getProductId(product);
    const weight = selectedWeight;
    if (!weight) {
      alert("Please select a weight.");
      return;
    }
    const options = getWeightOptions(product);
    const selectedOption = options.find(
      (option) => String(option.label).trim() === String(weight).trim());
      const price = Number(selectedOption?.price ?? getDisplayPrice(product) ?? 0);
      const cartItem = {
        product_id: productId,
        product_title: getProductName(product),
        product_image: getProductImage(product),
        weight: weight,
        quantity: 1,
        final_price: price,
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
      const existingIndex = cart.findIndex((item) => String(item.product_id) === String(productId) && String(item.weight) === String(weight));
      if (existingIndex !== -1) {
        const newQuantity = Number(cart[existingIndex].quantity || 0) + 1;
        cart[existingIndex].quantity = newQuantity;
        cart[existingIndex].final_price = Number(price) * newQuantity;
      } else {
        cart.push(cartItem);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      sessionStorage.setItem("openCartAfterRefresh", "true");
      window.dispatchEvent(new Event("cartUpdated"));
      window.location.reload();
    } catch (error) {
      console.error("Add cart error:", error);
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
  event.stopPropagation();

  const productId = getProductId(product);

  if (!productId) return;

  setWishlistItems((prev) => {
    if (prev.includes(productId)) {
      return prev.filter((id) => id !== productId);
    }

    return [...prev, productId];
  });
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
    event.stopPropagation();
    const id = getProductId(product);
    if (!id) {
      return;
    }
    const stringId = String(id);
    setCompareIds((previous) => {
      let updated;
      if (previous.includes(stringId)) {
        updated = previous.filter((item) => item !== stringId);
      } else {
        updated = [...previous,stringId,];
      }
      saveCompare(updated);
      return updated;
    });
  };
  const openQuickView = (event, product) => {
    event.stopPropagation();
    setQuickProduct(product);
    setQuickViewOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeQuickView = () => {
    setQuickViewOpen(false);
    setQuickProduct(null);
    document.body.style.overflow = "";
  };
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      if (quickViewOpen) {
        closeQuickView();
      }
      if (cartPopupProduct) {
        closeCartPopup();
      }
      if (sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [quickViewOpen,cartPopupProduct,sidebarOpen,]);
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const response = await fetch("/api/home");
        if (!response.ok) {
          throw new Error("Failed to load products");
        }
        const data = await response.json();
        const allProducts = [];
        if (
          Array.isArray(data?.brands)
        ) {
          data.brands.forEach(
            (brand) => {
              if (Array.isArray(brand?.products)) {
                brand.products.forEach((product) => {allProducts.push(product);});
              }
            }
          );
        }
        const uniqueProducts = [];
        const seen = new Set();
        allProducts.forEach(
          (product) => {
            const id = getProductId(product);
            if (!id) {
              uniqueProducts.push(product);
              return;
            }
            const key = String(id);
            if (!seen.has(key)) {
              seen.add(key);
              uniqueProducts.push(product);
            }
          }
        );
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
  const selectedCategory = searchParams.get("category") || "Shop";
  const selectedSearch = searchParams.get("search") || "";
  const selectedStock = searchParams.get("stock_status") || "";
  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedCategory && selectedCategory !== "Shop") {
      const categoryText = selectedCategory.toLowerCase();
      result = result.filter(
        (product) => {
          const productCategory = getProductCategory(product).toLowerCase();
          return (productCategory === categoryText || productCategory.includes(categoryText) || categoryText.includes(productCategory)
          );
        }
      );
    }
    if (selectedSearch) {
      const searchText = selectedSearch.toLowerCase();
      result = result.filter(
        (product) => {
          const name = getProductName(product).toLowerCase();
          const category = getProductCategory(product).toLowerCase();
          return (name.includes(searchText) || category.includes(searchText));
        }
      );
    }
    if (selectedStock === "onsale") {
      result = result.filter((product) => hasOffer(product));
    }
    if (selectedStock === "instock") {
      result = result.filter((product) => isInStock(product));
    }
    const minimum = Number(minPrice) || 0;
    const maximum = Number(maxPrice) || 2000;
    result = result.filter(
      (product) => {
        const price = getDisplayPrice(product);
        return (price >= minimum && price <= maximum);
      }
    );
    if (sortValue === "price-low") {
      result.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    }
    if (sortValue === "price-high") {
      result.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    }
    if (sortValue === "rating") {
      result.sort((a, b) => getProductRating(b) - getProductRating(a));
    }
    if (sortValue === "popularity") {
      result.sort((a, b) => getProductPopularity(b) - getProductPopularity(a));
    }
    if (sortValue === "latest") {
      result.sort(
        (a, b) => {
          const dateA = new Date(getProductDate(a)).getTime() || 0;
          const dateB = new Date(getProductDate(b)).getTime() || 0;
          return dateB - dateA;
        }
      );
    }
    return result;
  }, [products, selectedCategory, selectedSearch, selectedStock, minPrice, maxPrice, sortValue, ]);
  const randomProducts = useMemo(() => {
    const array = [...filteredProducts,];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [
        array[i],
        array[j],
      ] = [
        array[j],
        array[i],
      ];
    }
    return array.slice(0, 5);
  }, [filteredProducts]);
  const displayedProducts = useMemo(() => {
    const count = Number(showCount) || 9;
    return filteredProducts.slice(0, count);
  }, [filteredProducts, showCount,]);
  const createQuery = (changes = {}) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(
      ([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
    );
    return params.toString();
  };
  const handleCategoryClick = (category) => {
    if (category === "Shop") {
      router.push("/shop");
    } else {
      const query = createQuery({category,});
      router.push(`/shop?${query}`);
    }
    setSidebarOpen(false);
  };
  const handlePriceFilter = () => {
    const query = createQuery({min_price: minPrice, max_price: maxPrice,});
    router.push(`/shop?${query}`);
  };
  const handleStockChange = (type) => {
    const current = searchParams.get("stock_status") || "";
    const newValue = current === type ? "" : type;
    const query = createQuery({stock_status: newValue,});
    router.push(`/shop?${query}`);
  };
  const handleShowChange = (value) => {
    setShowCount(value);
    const query = createQuery({show: value, });
    router.push(`/shop?${query}`);
  };
  const handleSortChange = (value) => {
    setSortValue(value);
    const query = createQuery({sort: value,});
    router.push(`/shop?${query}`);
  };
  const toggleCategory = (category) => {
    setOpenCategories((previous) => ({...previous,
      [category]: !previous[category],
    }));
  };
  const handleProductClick = (product) => {
    const productName = getProductName(product);
    if (!productName) {
      return;
    }
    const slug = productName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    router.push(`/product/${slug}`);
  };
  const handleSelectOptions = (event, product) => {
    event.stopPropagation();
    openCartPopup(event, product);
  };
  return (
    <>
      <style jsx>{`
        .shopHero {
          position: relative;
          width: 100%;
          height: 500px;
          overflow: hidden;
        }
        .shopHeroImage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .shopHeroOverlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .shopHeroOverlay h1 {
          margin: 0;
          color: #fff;
          font-size: 52px;
          font-weight: 700;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        .shopBody {
          width: 100%;
          min-height: 700px;
          padding: 50px 6%;
          background: linear-gradient(135deg, #fff0dc 0%, #ffe3c2 30%, #ffd0b0 55%, #f8b0a0 75%, #f28f82 100%);
        }
        .shopLayout {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 270px minmax(0, 1fr);
          column-gap: 70px;
        }
        .shopSidebar {
          width: 100%;
          color: #000;
        }
        .sidebarSection {
          margin-bottom: 35px;
        }
        .sidebarTitle {
          margin: 0 0 18px;
          color: #000;
          font-size: 18px;
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
          gap: 10px;
          margin-top: 4px;
        }
        .priceText {
          color: #000;
          font-size: 13px;
          white-space: nowrap;
        }
        .filterButton {
          height: 34px;
          padding: 0 14px;
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
          margin-bottom: 11px;
        }
        .categoryRow {
          display: flex;
          align-items: center;
          min-height: 25px;
          color: #000;
          font-size: 14px;
          cursor: pointer;
        }
        .categoryRow:hover {
          text-decoration: underline;
        }
        .categoryRowWithArrow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .categoryArrow {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-size: 12px;
          cursor: pointer;
        }
        .categoryChildren {
          padding-left: 17px;
          padding-top: 8px;
        }
        .childCategory {
          margin-bottom: 9px;
          color: #000;
          font-size: 13px;
          cursor: pointer;
        }
        .childCategory:hover {
          text-decoration: underline;
        }
        .sidebarProducts {
          margin-top: 5px;
        }
        .sidebarProduct {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 20px;
          cursor: pointer;
        }
        .sidebarProductImageBox {
          flex: 0 0 105px;
          width: 105px;
          height: 82px;
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
          font-size: 14px;
          font-weight: 600;
          line-height: 1.35;
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
          font-size: 12px;
          text-decoration: line-through;
        }
        .sidebarOfferPrice {
          color: #d62828;
          font-size: 14px;
          font-weight: 700;
        }
        .shopTopBar {
          width: 100%;
          margin-bottom: 25px;
        }
        .shopTopRow {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 7px;
          white-space: nowrap;
          font-size: 14px;
          color: #222;
        }
        .breadcrumbHome {
          cursor: pointer;
        }
        .breadcrumbArrow {
          font-size: 16px;
        }
        .shopControls {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 25px;
          white-space: nowrap;
        }
        .showControls {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 14px;
          white-space: nowrap;
          color: #000;
          margin-left: 55px;
        }
        .showNumber {
          padding: 2px 4px;
          color: #000;
          cursor: pointer;
        }
        .showNumber.active {
          font-weight: 700;
        }
        .sortSelect {
          width: 190px;
          height: 38px;
          padding: 0 12px;
          border: 1px solid #222;
          background: #fff;
          color: #222;
          font-size: 13px;
          cursor: pointer;
        }
        .shopMain {
          width: 100%;
          min-width: 0;
        }
        .productsGrid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 30px 20px;
        }
        .productCard {
          width: 100%;
          cursor: pointer;
        }
        .productImageBox {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .productImage {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          transition: transform 0.35s ease;
        }
        .productImageSecond {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.35s ease,
            transform 0.35s ease;
        }
        .productCard:hover .productImage {
          transform: scale(1.03);
        }
        .productCard:hover .productImageSecond {
          opacity: 1;
        }
        .productHoverActions {
          position: absolute;
          top: 15px;
          right: 15px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          opacity: 0;
          visibility: hidden;
          transform: translateX(10px);
          transition: opacity 0.3s ease,
            visibility 0.3s ease,
            transform 0.3s ease;
          z-index: 30;
        }
        .productImageBox:hover .productHoverActions {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }
        .productHoverAction {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: #fff;
          color: #000;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }
        .productHoverAction:hover {
          background: #000;
          color: #fff;
          transform: scale(1.06);
        }
        .productHoverAction.active {
          background: #000;
          color: #fff;
        }
        .productHoverAction i {
          font-size: 15px;
        }
        .productOptionsButton {
          position: absolute;
          left: 15px;
          right: 15px;
          bottom: 10px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: #fff;
          color: #000;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          opacity: 0;
          visibility: hidden;
          transform: translateY(15px);
          transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease, background 0.2s ease, color 0.2s ease;
          z-index: 50;
        }
        .productImageBox:hover .productOptionsButton {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .productOptionsButton:hover {
          background: #000;
          color: #fff;
        }
        .productOptionsText {
          display: block;
        }
        .productOptionsCartIcon {
          display: none;
          font-size: 18px;
        }
        .productOptionsButton:hover
          .productOptionsText {
          display: none;
        }
        .productOptionsButton:hover .productOptionsCartIcon {
          display: block;
        }
        .productCardName {
          margin: 12px 0 0;
          color: #000;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.4;
          text-align: center;
        }
        .productPrice {
          margin-top: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
        }
        .originalPrice {
          color: #777;
          font-size: 13px;
          text-decoration: line-through;
        }
        .offerPrice {
          color: #d62828;
          font-size: 15px;
          font-weight: 700;
        }
        .noImage {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          background: #eee;
          font-size: 13px;
        }
        .emptyProducts {
          width: 100%;
          padding: 60px 20px;
          text-align: center;
          color: #000;
          font-size: 15px;
        }
        .productCartPopup {
          position: absolute;
          inset: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.96);
          padding: 20px;
        }
        @keyframes productPopupIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .productCartPopupInner {
          width: 100%;
          max-width: 320px;
          background: #fff;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          position: relative;
        }
        .productCartPopupClose {
          position: absolute;
          top: 8px;
          right: 10px;
          width: 30px;
          height: 30px;
          border: none;
          background: transparent;
          font-size: 24px;
          cursor: pointer;
        }
        .cartWeightSelect {
          margin-top: 10px;
          margin-bottom: 20px;
        }
        .cartWeightSelect label {
          display: block;
          font-size: 14px;
          font-weight: 200;
          margin-bottom: 8px;
          color: #000;
        }
        .cartWeightSelect select {
          width: 100%;
          height: 45px;
          padding: 0 12px;
          border: 1px solid #000;
          border-radius: 6px;
          background: #fff;
          font-size: 14px;
          cursor: pointer;
          outline: none;
          color: #000;
        }
        .cartWeightSelect select:focus {
          border-color: #222;
        }
        .cartPopupAddButton {
          width: 100%;
          height: 45px;
          border: none;
          border-radius: 6px;
          background: #111;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .cartPopupAddButton:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .productCartPopupClose:hover {
          background: #d62828;
        }
        .productCartPopupImage {
          width: 34%;
          max-width: 115px;
          aspect-ratio: 1 / 1;
          object-fit: contain;
          margin-bottom: 8px;
        }
        .productCartPopupName {
          width: 100%;
          margin: 0 0 8px;
          color: #111;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.25;
          text-align: center;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .productCartPopupLabel {
          width: 100%;
          margin-bottom: 5px;
          color: #555;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
        }
        .productWeightOptions {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-bottom: 8px;
        }
        .productWeightButton {
          flex: 1;
          min-width: 0;
          height: 30px;
          padding: 0 4px;
          border: 1px solid #222;
          background: #fff;
          color: #111;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .productWeightButton:hover, .productWeightButton.active {
          background: #111;
          color: #fff;
        }
        .productCartPopupPrice {
          margin-bottom: 8px;
          color: #d62828;
          font-size: 17px;
          font-weight: 700;
          text-align: center;
        }
        .productQuantityRow {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 9px;
          border: 1px solid #222;
          height: 30px;
        }
        .productQuantityButton {
          width: 30px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: #fff;
          color: #111;
          font-size: 16px;
          cursor: pointer;
        }
        .productQuantityButton:hover {
          background: #111;
          color: #fff;
        }
        .productQuantityValue {
          min-width: 30px;
          text-align: center;
          color: #111;
          font-size: 12px;
          font-weight: 700;
        }
        .productAddCartButton {
          margin-top: 10px;
          width: 100%;
          height: 35px;
          border: none;
          background: #111;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .productAddCartButton:hover {
          background: #d62828;
        }
        .mobileShowSidebar {
          display: none;
        }
        .mobileSidebarClose {
          display: none;
        }
        .mobileSidebarOverlay {
          display: none;
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
          grid-template-columns: minmax(0, 1fr)minmax(0, 1fr);
          gap: 35px;
          padding: 35px;
          background: #fff;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        .quickViewClose {
          position: absolute;
          top: 12px;
          right: 12px;
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
          padding-top: 15px;
        }
        .quickViewTitle {
          margin: 0 0 15px;
          color: #111;
          font-size: 25px;
          line-height: 1.3;
        }
        .quickViewCategory {
          margin-bottom: 15px;
          color: #777;
          font-size: 13px;
        }
        .quickViewPrice {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .quickViewOriginalPrice {
          color: #888;
          font-size: 15px;
          text-decoration: line-through;
        }
        .quickViewOfferPrice {
          color: #d62828;
          font-size: 22px;
          font-weight: 700;
        }
        .quickViewDescription {
          margin-bottom: 25px;
          color: #555;
          font-size: 14px;
          line-height: 1.7;
        }
        .quickViewButtons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .quickViewButton {
          min-height: 42px;
          padding: 0 20px;
          border: 1px solid #111;
          background: #111;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .quickViewButton:hover {
          background: #fff;
          color: #111;
        }
        .quickViewSecondaryButton {
          min-height: 42px;
          padding: 0 20px;
          border: 1px solid #111;
          background: #fff;
          color: #111;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .quickViewSecondaryButton:hover {
          background: #111;
          color: #fff;
        }
        /* ============================================================
   MOBILE RESPONSIVE ONLY — FULL CODE
   ============================================================ */

@media (max-width: 700px) {

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }

  /* ==========================================================
     HERO
     ========================================================== */

  .shopHero {
    width: 100%;
    height: 250px;
    position: relative;
    overflow: hidden;
  }

  .shopHeroImage {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  .shopHeroOverlay {
    position: absolute;
    inset: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 15px;
  }

  .shopHeroOverlay h1 {
    margin: 0;

    color: #fff;

    font-size: clamp(28px, 8vw, 40px);
    font-weight: 700;

    line-height: 1.1;

    text-align: center;

    text-shadow: 0 2px 8px rgba(0, 0, 0, .4);
  }

  /* ==========================================================
     BODY
     ========================================================== */

  .shopBody {
    width: 100%;
    min-height: 100vh;

    padding: 25px 12px 50px;

    overflow-x: hidden;
  }

  .shopLayout {
    width: 100%;
    max-width: 100%;

    margin: 0;

    display: block;
  }

  .shopMain {
    width: 100%;
    min-width: 0;
  }

  /* ==========================================================
     TOP ROW
     ========================================================== */

  .shopTopRow {
    width: 100%;

    display: flex;
    align-items: center;

    gap: 10px;

    overflow-x: auto;
    overflow-y: hidden;

    padding-bottom: 3px;

    scrollbar-width: none;
  }

  .shopTopRow::-webkit-scrollbar {
    display: none;
  }

  .breadcrumb {
    flex: 0 0 auto;

    display: flex;
    align-items: center;

    gap: 5px;

    font-size: 11px;

    white-space: nowrap;
  }

  .shopControls {
    flex: 0 0 auto;

    display: flex;
    align-items: center;

    gap: 8px;

    margin-left: auto;
  }

  .showControls {
    flex: 0 0 auto;

    display: flex;
    align-items: center;

    gap: 4px;

    font-size: 11px;

    white-space: nowrap;
  }

  .sortSelect {
    width: 150px;
    min-width: 150px;
    height: 34px;

    padding: 0 8px;

    border: 1px solid #222;

    background: #fff;
    color: #222;

    font-size: 11px;
  }

  /* ==========================================================
     MOBILE SIDEBAR
     ========================================================== */

  .shopSidebar {
    position: fixed;

    top: 0;
    left: 0;

    width: min(320px, 88vw);
    height: 100dvh;

    z-index: 99999;

    overflow-x: hidden;
    overflow-y: auto;

    padding: 60px 18px 35px;

    background:
      linear-gradient(
        135deg,
        #fff0dc 0%,
        #ffe3c2 30%,
        #ffd0b0 55%,
        #f8b0a0 75%,
        #f28f82 100%
      );

    transform: translateX(-110%);

    transition: transform .3s ease;

    box-shadow: 5px 0 25px rgba(0,0,0,.25);
  }

  .shopSidebar.mobileSidebarOpen {
    transform: translateX(0);
  }

  .mobileSidebarClose {
    position: absolute;

    top: 14px;
    right: 14px;

    width: 34px;
    height: 34px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid #222;
    border-radius: 50%;

    background: #fff;
    color: #000;

    font-size: 21px;

    cursor: pointer;
  }

  .mobileSidebarOverlay {
    position: fixed;

    inset: 0;

    z-index: 99998;

    background: rgba(0,0,0,.45);

    opacity: 0;
    visibility: hidden;
    pointer-events: none;

    transition:
      opacity .3s ease,
      visibility .3s ease;
  }

  .mobileSidebarOverlay.active {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
  }

  .mobileShowSidebar {
    display: inline-flex;

    align-items: center;
    justify-content: center;

    gap: 6px;

    margin-top: 10px;

    height: 36px;

    padding: 0 13px;

    border: 1px solid #222;

    background: #fff;
    color: #000;

    font-size: 11px;
    font-weight: 600;

    cursor: pointer;
  }

  /* ==========================================================
     PRODUCTS
     ========================================================== */

  .productsGrid {
    width: 100%;

    display: grid;

    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 24px 10px;
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

    border: 1px solid rgba(0,0,0,.08);
  }

  .productImage {
    width: 100%;
    height: 100%;

    display: block;

    object-fit: contain;

    transition:
      filter .25s ease,
      transform .25s ease;
  }

  .productImageSecond {
    position: absolute;

    inset: 0;

    width: 100%;
    height: 100%;

    object-fit: contain;

    opacity: 0;

    transition:
      filter .25s ease,
      transform .25s ease;
  }

  .productCard:hover .productImage {
    transform: none;
  }

  .productCard:hover .productImageSecond {
    opacity: 0;
  }

  /* ==========================================================
     PRODUCT ACTIONS
     ========================================================== */

  .productHoverActions {
    position: absolute;

    inset: 0;

    width: 100%;
    height: 100%;

    display: block;

    opacity: 1;
    visibility: visible;

    transform: none;

    pointer-events: none;

    z-index: 100;
  }

  .productHoverAction {
    position: absolute;

    width: 36px;
    height: 36px;

    display: flex;

    align-items: center;
    justify-content: center;

    border: none;
    border-radius: 50%;

    cursor: pointer;

    pointer-events: auto;

    z-index: 101;

    transition:
      transform .2s ease,
      background .2s ease;
  }

  .productHoverAction i {
    font-size: 15px;
  }

  /* ==========================================================
     WISHLIST — TOP RIGHT
     ========================================================== */

  .productHoverAction:first-child {
    top: 10px;
    right: 10px;

    left: auto;
    bottom: auto;

    width: 36px;
    height: 36px;

    background: #fff !important;

    color: #111 !important;

    border-radius: 50%;

    box-shadow:
      0 2px 8px rgba(0,0,0,.18);

    display: flex !important;
  }

  .productHoverAction:first-child:hover,
  .productHoverAction:first-child.active {
    background: #fff !important;
    color: #111 !important;

    transform: none;
  }

  /* ==========================================================
     COMPARE — HIDDEN
     ========================================================== */

  .productHoverAction:nth-child(2) {
    display: none !important;
  }

  /* ==========================================================
     CART — BOTTOM LEFT
     ========================================================== */

  .productHoverAction:last-child {
    left: 10px;
    bottom: 10px;

    top: auto;
    right: auto;

    width: 36px;
    height: 36px;

    background: transparent !important;

    color: #111 !important;

    border: none;

    box-shadow: none;

    display: flex !important;
  }

  .productHoverAction:last-child:hover,
  .productHoverAction:last-child.active {
    background: transparent !important;

    color: #111 !important;

    transform: none;
  }

  /* ==========================================================
     SELECT OPTIONS — HIDDEN
     ========================================================== */

  .productOptionsButton {
    display: none !important;
  }

  /* ==========================================================
     PRODUCT NAME
     ========================================================== */

  .productCardName {
    width: 100%;

    margin: 9px 0 0;

    color: #000;

    font-size: 12px;
    font-weight: 600;

    line-height: 1.35;

    text-align: center;

    display: -webkit-box;

    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    overflow: hidden;
  }

  .productPrice {
    width: 100%;

    margin-top: 5px;

    display: flex;

    align-items: center;
    justify-content: center;

    gap: 5px;

    flex-wrap: wrap;

    font-size: 12px;
  }

  .originalPrice {
    font-size: 10px;
  }

  .offerPrice {
    font-size: 13px;
  }

  /* ==========================================================
     CART POPUP
     
     EXACT SAME WIDTH + HEIGHT AS PRODUCT IMAGE
     NOT FULL SCREEN
     ========================================================== */

  .productCartPopup {
    position: absolute !important;

    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    left: 0 !important;

    width: 100% !important;
    height: 100% !important;

    min-width: 100% !important;
    max-width: 100% !important;

    min-height: 100% !important;
    max-height: 100% !important;

    margin: 0 !important;
    padding: 0 !important;

    display: flex;

    align-items: center;
    justify-content: center;

    background: transparent !important;

    z-index: 100000;

    overflow: hidden;

    animation: cartPopupImageShow .2s ease;
  }

  /* ==========================================================
     BLUR PRODUCT IMAGE
     ========================================================== */

  .productImageBox.cartPopupActive .productImage {
    filter: blur(6px);

    transform: scale(1.06);
  }

  .productImageBox.cartPopupActive .productImageSecond {
    filter: blur(6px);

    transform: scale(1.06);
  }

  /* ==========================================================
     POPUP OVERLAY
     EXACT IMAGE SIZE
     ========================================================== */

  .productCartPopupOverlay {
    position: absolute !important;

    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    left: 0 !important;

    width: 100% !important;
    height: 100% !important;

    margin: 0 !important;
    padding: 0 !important;

    background: rgba(255,255,255,.30);

    z-index: 1;
  }

  /* ==========================================================
     POPUP INNER CONTENT
     ========================================================== */

  .productCartPopupInner {
    position: relative;

    z-index: 2;

    width: 86%;

    max-width: none;

    padding: 25px 17px 17px;

    background: rgba(255,255,255,.97);

    border-radius: 12px;

    box-shadow:
      0 8px 25px rgba(0,0,0,.24);

    animation: cartPopupShow .22s ease-out;
  }

  /* ==========================================================
     CLOSE BUTTON
     ========================================================== */

  .productCartPopupClose {
    position: absolute;

    top: 7px;
    right: 8px;

    width: 28px;
    height: 28px;

    display: flex;

    align-items: center;
    justify-content: center;

    padding: 0;

    border: none;
    border-radius: 50%;

    background: transparent;

    color: #111;

    font-size: 22px;

    line-height: 1;

    cursor: pointer;

    z-index: 5;
  }

  /* ==========================================================
     WEIGHT SELECT
     ========================================================== */

  .cartWeightSelect {
    width: 100%;

    margin: 5px 0 14px;
  }

  .cartWeightSelect label {
    display: block;

    margin-bottom: 7px;

    color: #111;

    font-size: 12px;
    font-weight: 600;

    text-align: left;
  }

  .cartWeightSelect select {
    width: 100%;

    height: 42px;

    padding: 0 10px;

    border: 1px solid #ccc;

    border-radius: 6px;

    background: #fff;

    color: #111;

    font-size: 12px;

    outline: none;

    cursor: pointer;
  }

  .cartWeightSelect select:focus {
    border-color: #111;
  }

  /* ==========================================================
     ADD TO CART
     ========================================================== */

  .cartPopupAddButton {
    width: 100%;

    height: 43px;

    display: flex;

    align-items: center;
    justify-content: center;

    border: none;

    border-radius: 6px;

    background: #111;

    color: #fff;

    font-size: 11px;

    font-weight: 600;

    letter-spacing: .3px;

    cursor: pointer;
  }

  .cartPopupAddButton:disabled {
    opacity: .5;

    cursor: not-allowed;
  }

  /* ==========================================================
     ANIMATIONS
     ========================================================== */

  @keyframes cartPopupImageShow {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes cartPopupShow {
    from {
      opacity: 0;
      transform: scale(.90);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }
}


/* ============================================================
   MOBILE — 380px AND BELOW
   ============================================================ */

@media (max-width: 380px) {

  .shopBody {
    padding-left: 9px;
    padding-right: 9px;
  }

  .shopHero {
    height: 230px;
  }

  .productsGrid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 20px 8px;
  }

  .productHoverAction:first-child {
    top: 7px;
    right: 7px;

    width: 32px;
    height: 32px;
  }

  .productHoverAction:last-child {
    left: 7px;
    bottom: 7px;

    width: 32px;
    height: 32px;
  }

  .productHoverAction i {
    font-size: 13px;
  }

  .productCardName {
    font-size: 11px;
  }

  .originalPrice {
    font-size: 9px;
  }

  .offerPrice {
    font-size: 12px;
  }

  .productCartPopup {
    width: 100% !important;
    height: 100% !important;

    min-width: 100% !important;
    max-width: 100% !important;

    min-height: 100% !important;
    max-height: 100% !important;

    padding: 0 !important;
  }

  .productCartPopupInner {
    width: 88%;

    max-width: none;

    padding: 23px 14px 15px;
  }

  .productCartPopupClose {
    width: 26px;
    height: 26px;

    top: 6px;
    right: 7px;

    font-size: 20px;
  }

  .cartWeightSelect label {
    font-size: 11px;
  }

  .cartWeightSelect select {
    height: 39px;

    font-size: 11px;
  }

  .cartPopupAddButton {
    height: 40px;

    font-size: 10px;
  }
}


/* ============================================================
   MOBILE — 340px AND BELOW
   ============================================================ */

@media (max-width: 340px) {

  .shopBody {
    padding-left: 7px;
    padding-right: 7px;
  }

  .shopHero {
    height: 215px;
  }

  .productsGrid {
    gap: 18px 7px;
  }

  .productHoverAction:first-child {
    top: 6px;
    right: 6px;

    width: 29px;
    height: 29px;
  }

  .productHoverAction:last-child {
    left: 6px;
    bottom: 6px;

    width: 29px;
    height: 29px;
  }

  .productHoverAction i {
    font-size: 11px;
  }

  .productCardName {
    font-size: 10px;
  }

  .productPrice {
    font-size: 10px;
  }

  .offerPrice {
    font-size: 11px;
  }

  .originalPrice {
    font-size: 8px;
  }

  .productCartPopup {
    width: 100% !important;
    height: 100% !important;

    min-width: 100% !important;
    max-width: 100% !important;

    min-height: 100% !important;
    max-height: 100% !important;

    padding: 0 !important;
  }

  .productCartPopupInner {
    width: 90%;

    max-width: none;

    padding: 21px 12px 13px;
  }

  .productCartPopupClose {
    width: 24px;
    height: 24px;

    top: 5px;
    right: 6px;

    font-size: 19px;
  }

  .cartWeightSelect {
    margin-bottom: 11px;
  }

  .cartWeightSelect label {
    margin-bottom: 5px;

    font-size: 10px;
  }

  .cartWeightSelect select {
    height: 37px;

    font-size: 10px;
  }

  .cartPopupAddButton {
    height: 38px;

    font-size: 10px;
  }
}


/* ============================================================
   MOBILE — 300px AND BELOW
   ============================================================ */

@media (max-width: 300px) {

  .shopBody {
    padding-left: 5px;
    padding-right: 5px;
  }

  .shopHero {
    height: 200px;
  }

  .productsGrid {
    gap: 15px 5px;
  }

  .productHoverAction:first-child {
    top: 5px;
    right: 5px;

    width: 27px;
    height: 27px;
  }

  .productHoverAction:last-child {
    left: 5px;
    bottom: 5px;

    width: 27px;
    height: 27px;
  }

  .productHoverAction i {
    font-size: 10px;
  }

  .productCardName {
    margin-top: 7px;

    font-size: 9px;
  }

  .productPrice {
    margin-top: 4px;

    gap: 3px;

    font-size: 9px;
  }

  .offerPrice {
    font-size: 10px;
  }

  .originalPrice {
    font-size: 7px;
  }

  .productCartPopup {
    width: 100% !important;
    height: 100% !important;

    min-width: 100% !important;
    max-width: 100% !important;

    min-height: 100% !important;
    max-height: 100% !important;

    padding: 0 !important;
  }

  .productCartPopupInner {
    width: 92%;

    max-width: none;

    padding: 19px 9px 10px;

    border-radius: 9px;
  }

  .productCartPopupClose {
    top: 4px;
    right: 5px;

    width: 22px;
    height: 22px;

    font-size: 18px;
  }

  .cartWeightSelect {
    margin-top: 3px;
    margin-bottom: 9px;
  }

  .cartWeightSelect label {
    margin-bottom: 4px;

    font-size: 9px;
  }

  .cartWeightSelect select {
    height: 34px;

    padding: 0 7px;

    font-size: 9px;
  }

  .cartPopupAddButton {
    height: 35px;

    font-size: 8px;
  }
}
      `}</style>
      <section className="shopHero">
        <img src="/uploads/shop.png" alt="Shop" className="shopHeroImage" onError={(event) => {
          event.currentTarget.style.display = "none";
        }}/>
        <div className="shopHeroOverlay">
          <h1>{selectedCategory}</h1>
        </div>
      </section>
      <section className="shopBody">
        <div className="shopLayout">
          <aside className={`shopSidebar ${sidebarOpen ? "mobileSidebarOpen" : "" }`}>
            <button type="button" className="mobileSidebarClose" onClick={() => setSidebarOpen(false)}>×</button>
            <div className="sidebarSection">
              <h3 className="sidebarTitle">
                Filter by price
              </h3>
              <div className="rangeSlider">
                <div className="rangeTrack" />
                <div className="rangeDot" style={{left: `${Math.min(100, Math.max(0, (Number(minPrice) / 2000) * 100))}%`,}} />
                <div className="rangeDot" style={{left: `${Math.min(100, Math.max(0, (Number(maxPrice) / 2000) * 100))}%`,}}/>
              </div>
              <div className="priceBottom">
                <span className="priceText">
                  Price: ₹{Number(minPrice || 0).toLocaleString("en-IN")}{" — "}
                  ₹{Number(maxPrice || 0).toLocaleString("en-IN")}
                </span>
                <button type="button" className="filterButton" onClick={handlePriceFilter}>Filter</button>
              </div>
            </div>
            <div className="sidebarSection">
              <h3 className="sidebarTitle">
                Stock status
              </h3>
              <div className="stockOption" onClick={() => handleStockChange("onsale")}>
                <span className={`customCheckbox ${selectedStock === "onsale" ? "checked" : "" }`}>
                  {selectedStock === "onsale" && (<i className="fa fa-check" />)}
                </span>
                <span>On sale</span>
              </div>
              <div className="stockOption" onClick={() => handleStockChange("instock")}>
                <span className={`customCheckbox ${selectedStock === "instock" ? "checked" : "" }`}>
                  {selectedStock === "instock" && (<i className="fa fa-check" />)}
                </span>
                <span>In stock</span>
              </div>
            </div>
            <div className="sidebarSection">
              <h3 className="sidebarTitle">
                Product categories
              </h3>
              {categories.map(
                (category) => {
                  const hasChildren = Array.isArray(category.children);
                  const isOpen = openCategories[category.name];
                  return (
                    <div className="categoryItem" key={category.name}>
                      {hasChildren ? (
                        <>
                          <div className="categoryRowWithArrow">
                            <span className="categoryRow" onClick={() => handleCategoryClick(category.name)}>
                              {
                                category.name
                              }
                            </span>
                            <span className="categoryArrow" onClick={() => toggleCategory(category.name)}>
                              <i className={`fa ${isOpen ? "fa-chevron-up" : "fa-chevron-down" }`} />
                            </span>
                          </div>
                          {isOpen && (
                            <div className="categoryChildren">
                              {category.children.map(
                                (child) => (
                                  <div key={child} className="childCategory" onClick={() => handleCategoryClick(child)}>
                                    {child}
                                  </div>
                                )
                              )}
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
                }
              )}
            </div>
            <div className="sidebarSection">
              <h3 className="sidebarTitle">
                Products
              </h3>
              <div className="sidebarProducts">
                {loading ? (
                  <p style={{color: "#000", fontSize:"13px",}}>Loading...</p>
                ) : randomProducts.length === 0 ? (
                  <p style={{color: "#000", fontSize:"13px",}}>
                    No products found.
                  </p>
                ) : (
                  randomProducts.map(
                    (product, index) => {
                      const originalPrice = getOriginalPrice(product);
                      const offerPrice = getOfferPrice(product);
                      return (
                        <div className="sidebarProduct" key={getProductId(product) || index} onClick={() => handleProductClick(product)}>
                          <div className="sidebarProductImageBox">
                            <img src={getProductImage(product)} alt={getProductName(product)} className="sidebarProductImage" onError={(event) => {event.currentTarget.src = "/uploads/no-image.png";}}/>
                          </div>
                          <div className="sidebarProductInfo">
                            <p className="sidebarProductName">
                              {getProductName(product)}
                            </p>
                            {hasOffer(product) ? (
                              <div className="sidebarProductPrice">
                                <span className="sidebarOriginalPrice">
                                  ₹{originalPrice.toLocaleString("en-IN")}
                                </span>
                                <span className="sidebarOfferPrice">
                                  ₹{offerPrice.toLocaleString("en-IN")}
                                </span>
                              </div>
                            ) : (
                              <div className="sidebarProductPrice">
                                <span className="sidebarOfferPrice">
                                  ₹{getDisplayPrice(product).toLocaleString("en-IN")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  ) 
                )}
              </div>
            </div>
          </aside>
           <main className="shopMain">
            <div className="shopTopBar">
              <div className="shopTopRow">
                <div className="breadcrumb">
                  <span className="breadcrumbHome" onClick={() => handleCategoryClick("Shop")}>Home</span>
                  <span className="breadcrumbArrow">»</span>
                  <span>{selectedCategory}</span>
                </div>
                <div className="shopControls">
                  <div className="showControls">
                    <span>Show</span>
                    {["9", "12", "18", "24",].map(
                      (number) => (
                        <span key={number} className={`showNumber ${showCount === number ? "active" : ""}`} onClick={() => handleShowChange(number)}>
                          {number}
                        </span>
                      )
                    )}
                  </div>
                  <select className="sortSelect" value={sortValue} onChange={(event) => handleSortChange(event.target.value)}>
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
                <span>Show sidebar</span>
              </button>
            </div>
            {loading ? (
              <div className="emptyProducts">
                Loading products...
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="emptyProducts">
                No products found.
              </div>
            ) : (
              <div className="productsGrid">
                {displayedProducts.map(
                  (product, index) => {
                    const image1 = getProductImage(product);
                    const image2 = getProductSecondImage(product);
                    const originalPrice = getOriginalPrice(product);
                    const offerPrice = getOfferPrice(product);
                    const productId = getProductId(product);
                    const productIdString = productId ? String(productId) : "";
                    const isWishlisted = wishlistIds.includes(productIdString);
                    const isCompared = compareIds.includes(productIdString);
                    const isCartPopupOpen = cartPopupProduct && String(getProductId(cartPopupProduct)) === String(productId);
                    return (
                      <div className="productCard" key={productId || index} onClick={() => handleProductClick(product)}>
                        <div className="productImageBox">
                          <img src={image1} alt={getProductName(product)} className="productImage"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleProductClick(product);
                            }} onError={(event) => {
                              if (event.currentTarget.dataset.fallback) {
                                return;
                              }
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
                              <button type="button" className={`productHoverAction ${wishlistItems.includes(getProductId(product)) ? "active" : ""}`} onClick={(event) => handleWishlist(event, product)} aria-label="Add to wishlist">
                                <i className="fa fa-heart" />
                              </button>
                              <button type="button" className="productHoverAction" title="Quick view" onClick={(event) => openQuickView(event, product)}>
                                <i className="fa fa-eye" />
                              </button>
                              <button type="button" className="productHoverAction" onClick={(event) => handleSelectOptions(event, product)} aria-label="Add to cart">
                                <i className="fa fa-shopping-cart" />
                              </button>
                            </div>
                          )}
                          {!isCartPopupOpen && (
                            <button type="button" className="productOptionsButton" onClick={(event) => handleSelectOptions(event, product)}>
                              <span className="productOptionsText">SELECT OPTIONS</span>
                              <i className="fa fa-shopping-cart productOptionsCartIcon" />
                            </button>
                          )}
                          {isCartPopupOpen && cartPopupProduct && (
                            <div className="productCartPopup" onClick={(event) => event.stopPropagation()}>
                              <div className="productCartPopupInner">
                                <button type="button" className="productCartPopupClose" onClick={closeCartPopup} aria-label="Close">×</button>
                                <div className="cartWeightSelect">
                                  <label htmlFor="weightSelect">Select Weight</label>
                                  <select id="weightSelect" value={selectedWeight} onChange={(event) => {setSelectedWeight(event.target.value);}}>
                                    <option value="">Select Weight</option>
                                    {getWeightOptions(cartPopupProduct).map((option) => (
                                      <option key={option.label} value={option.label}>{option.label}</option>
                                    ))}
                                  </select>
                                </div>
                                <button type="button" className="cartPopupAddButton" onClick={handleAddToCart} disabled={!selectedWeight}>ADD TO CART</button>
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
                              ₹{originalPrice.toLocaleString("en-IN")}
                            </span>
                            <span className="offerPrice">
                              ₹{offerPrice.toLocaleString("en-IN")}
                            </span>
                          </div>
                        ) : (
                          <div className="productPrice">
                            <span className="offerPrice">
                              ₹{getDisplayPrice(product).toLocaleString("en-IN")}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </main> 
        </div>
      </section>
      <div className={`mobileSidebarOverlay ${sidebarOpen ? "active" : ""}`} onClick={() => setSidebarOpen(false)}/>
      {quickViewOpen && quickProduct && (
          <div className="quickViewOverlay" onClick={closeQuickView}>
            <div className="quickViewModal" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="quickViewClose" onClick={closeQuickView}aria-label="Close">×</button>
              <div className="quickViewImageBox">
                <img src={getProductImage(quickProduct)} alt={getProductName(quickProduct)} className="quickViewImage" onError={(event) => {event.currentTarget.src = "/uploads/no-image.png";}}/>
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
                      ₹{getOriginalPrice(quickProduct).toLocaleString("en-IN")}
                    </span>
                    <span className="quickViewOfferPrice">
                      ₹{getOfferPrice(quickProduct).toLocaleString("en-IN")}
                    </span>
                  </div>
                ) : (
                  <div className="quickViewPrice">
                    <span className="quickViewOfferPrice">
                      ₹{getDisplayPrice(quickProduct).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                <div className="quickViewDescription">
                  {quickProduct?.description || quickProduct?.short_description || quickProduct?.shortDescription ? (quickProduct?.description || quickProduct?.short_description || quickProduct?.shortDescription) : (
                    <>
                      View this product for more details and available options.
                    </>
                  )}
                </div>
                <div className="quickViewButtons">
                  <button type="button" className="quickViewButton" onClick={() => handleProductClick(quickProduct)}>VIEW PRODUCT</button>
                  <button type="button" className="quickViewSecondaryButton" onClick={() => handleWishlistClick( {stopPropagation: () => {},}, quickProduct)}>
                    {wishlistIds.includes(String(getProductId(quickProduct))) ? "REMOVE WISHLIST" : "ADD TO WISHLIST"}
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}
    </>
  );
}
export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div style={{minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",}}>
          Loading shop...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}