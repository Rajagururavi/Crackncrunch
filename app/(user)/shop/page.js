"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [minPrice, setMinPrice] = useState(
    searchParams.get("min_price") || "30"
  );
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("max_price") || "2000"
  );
  const [showCount, setShowCount] = useState(
    searchParams.get("show") || "9"
  );
  const [sortValue, setSortValue] = useState(
    searchParams.get("sort") || "default"
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [openCategories, setOpenCategories] = useState({
    Dates: false,
    Nuts: false,
  });

  const [wishlistIds, setWishlistIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);

  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState(null);

  const [cartPopupProduct, setCartPopupProduct] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState("");
  const [cartQuantity, setCartQuantity] = useState(1);

  const categories = [
    {
      name: "Berries",
    },
    {
      name: "Bulk / Wholesale",
    },
    {
      name: "Combo Offers",
    },
    {
      name: "Combos & Gift Packs",
    },
    {
      name: "Dates",
      children: ["Dry Dates", "Premium Dates"],
    },
    {
      name: "Dry Fruits",
    },
    {
      name: "Flavoured Nuts",
    },
    {
      name: "Hampers",
    },
    {
      name: "Jumbo & Premium",
    },
    {
      name: "Mixes & Snacking",
    },
    {
      name: "Nuts",
      children: [
        "Almonds",
        "Cashews",
        "Pistachios",
        "Walnuts",
      ],
    },
    {
      name: "Powders",
    },
    {
      name: "Seeds",
    },
    {
      name: "Uncategorized",
    },
  ];

  /* =========================================================
     PRODUCT HELPERS
  ========================================================= */

  const getProductId = (product) => {
    return (
      product?._id ||
      product?.id ||
      product?.product_id ||
      product?.productId
    );
  };

  const getProductName = (product) => {
    return (
      product?.productName ||
      product?.product_name ||
      product?.product_title ||
      product?.name ||
      product?.title ||
      "Product"
    );
  };

  const getProductCategory = (product) => {
    return (
      product?.category_name ||
      product?.category ||
      product?.product_category ||
      product?.categoryName ||
      ""
    );
  };

  const getOriginalPrice = (product) => {
    return (
      Number(
        product?.originalPrice ??
          product?.original_price ??
          product?.mrp ??
          product?.price ??
          0
      ) || 0
    );
  };

  const getOfferPrice = (product) => {
    return (
      Number(
        product?.offerPrice ??
          product?.offer_price ??
          product?.salePrice ??
          product?.sale_price ??
          0
      ) || 0
    );
  };

  const hasOffer = (product) => {
    const originalPrice = getOriginalPrice(product);
    const offerPrice = getOfferPrice(product);

    return (
      offerPrice > 0 &&
      originalPrice > 0 &&
      offerPrice < originalPrice
    );
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

  /* =========================================================
     IMAGE HELPERS
  ========================================================= */

  const getProductImages = (product) => {
    const images = [];

    const directImages = [
      product?.product_image,
      product?.productImage,
      product?.image,
      product?.image_url,
      product?.imageUrl,
      product?.thumbnail,
      product?.thumbnail_url,
      product?.thumbnailUrl,
    ];

    directImages.forEach((image) => {
      if (typeof image === "string" && image.trim()) {
        images.push(image.trim());
      }
    });

    const imageArrays = [
      product?.images,
      product?.product_images,
      product?.gallery,
      product?.gallery_images,
      product?.productImages,
    ];

    imageArrays.forEach((imageArray) => {
      if (!Array.isArray(imageArray)) {
        return;
      }

      imageArray.forEach((item) => {
        if (typeof item === "string" && item.trim()) {
          images.push(item.trim());
        }

        if (typeof item === "object" && item !== null) {
          const image =
            item.url ||
            item.image ||
            item.image_url ||
            item.src;

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

  /* =========================================================
     OTHER HELPERS
  ========================================================= */

  const getProductRating = (product) => {
    return (
      Number(
        product?.rating ??
          product?.average_rating ??
          product?.averageRating ??
          0
      ) || 0
    );
  };

  const getProductPopularity = (product) => {
    return (
      Number(
        product?.popularity ??
          product?.sales_count ??
          product?.salesCount ??
          product?.views ??
          0
      ) || 0
    );
  };

  const getProductDate = (product) => {
    return (
      product?.createdAt ||
      product?.created_at ||
      product?.date ||
      ""
    );
  };

  const isInStock = (product) => {
    const status = String(
      product?.status ??
        product?.stock_status ??
        product?.stockStatus ??
        ""
    )
      .trim()
      .toLowerCase();

    return [
      "currently available",
      "available",
      "in stock",
      "instock",
      "active",
    ].includes(status);
  };

  /* =========================================================
     WEIGHT OPTIONS
  ========================================================= */

  const getWeightOptions = (product) => {
    const basePrice = getDisplayPrice(product);

    const possibleOptions =
      product?.weight_options ||
      product?.weightOptions ||
      product?.weights ||
      product?.variants ||
      product?.product_variants;

    if (Array.isArray(possibleOptions)) {
      const parsed = [];

      possibleOptions.forEach((item) => {
        if (typeof item === "string") {
          const text = item.trim();

          if (
            text === "250g" ||
            text === "500g" ||
            text === "1kg"
          ) {
            parsed.push({
              label: text,
              price: basePrice,
            });
          }
        }

        if (
          typeof item === "object" &&
          item !== null
        ) {
          const label =
            item.weight ||
            item.label ||
            item.name ||
            item.size;

          const price =
            Number(
              item.offerPrice ??
                item.offer_price ??
                item.salePrice ??
                item.sale_price ??
                item.price ??
                item.amount ??
                0
            ) || 0;

          if (
            label &&
            (
              String(label)
                .toLowerCase()
                .includes("250") ||
              String(label)
                .toLowerCase()
                .includes("500") ||
              String(label)
                .toLowerCase()
                .includes("1kg") ||
              String(label)
                .toLowerCase()
                .includes("1 kg")
            )
          ) {
            parsed.push({
              label: String(label),
              price: price > 0 ? price : basePrice,
            });
          }
        }
      });

      const unique = [];
      const seen = new Set();

      parsed.forEach((item) => {
        const normalized = item.label
          .toLowerCase()
          .replace(/\s/g, "");

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

        if (
          standardLabel &&
          !seen.has(standardLabel)
        ) {
          seen.add(standardLabel);

          unique.push({
            label: standardLabel,
            price: item.price,
          });
        }
      });

      if (unique.length > 0) {
        const order = {
          "250g": 1,
          "500g": 2,
          "1kg": 3,
        };

        unique.sort(
          (a, b) =>
            order[a.label] - order[b.label]
        );

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

    const selected = options.find(
      (item) => item.label === selectedWeight
    );

    return (
      selected?.price ||
      getDisplayPrice(product)
    );
  };

  /* =========================================================
     CART POPUP
  ========================================================= */

  const openCartPopup = (event, product) => {
    event.stopPropagation();

    setCartPopupProduct(product);

    const options = getWeightOptions(product);

    setSelectedWeight(
      options[0]?.label || "250g"
    );

    setCartQuantity(1);

    document.body.style.overflow = "hidden";
  };

  const closeCartPopup = () => {
    setCartPopupProduct(null);
    setSelectedWeight("");
    setCartQuantity(1);

    document.body.style.overflow = "";
  };

  const decreaseCartQuantity = (event) => {
    event.stopPropagation();

    setCartQuantity((previous) =>
      Math.max(1, previous - 1)
    );
  };

  const increaseCartQuantity = (event) => {
    event.stopPropagation();

    setCartQuantity(
      (previous) => previous + 1
    );
  };

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!cartPopupProduct) {
      return;
    }

    if (!selectedWeight) {
      alert("Please select weight");
      return;
    }

    try {
      const productId =
        getProductId(cartPopupProduct);

      const productName =
        getProductName(cartPopupProduct);

      const productImage =
        getProductImage(cartPopupProduct);

      const options =
        getWeightOptions(cartPopupProduct);

      const selectedOption =
        options.find(
          (option) =>
            String(option.label) ===
            String(selectedWeight)
        );

      const unitPrice =
        Number(
          selectedOption?.price ||
            getDisplayPrice(
              cartPopupProduct
            ) ||
            0
        );

      const quantity =
        Math.max(
          1,
          Number(cartQuantity) || 1
        );

      const cartItem = {
        id: productId
          ? String(productId)
          : String(productName),

        productId: productId
          ? String(productId)
          : null,

        name: productName,

        image: productImage,

        weight: selectedWeight,

        quantity,

        price: unitPrice,

        total: unitPrice * quantity,
      };

      const savedCart =
        localStorage.getItem("cartItems");

      let cart = [];

      if (savedCart) {
        try {
          const parsedCart =
            JSON.parse(savedCart);

          if (Array.isArray(parsedCart)) {
            cart = parsedCart;
          }
        } catch (error) {
          console.error(
            "Cart JSON error:",
            error
          );

          cart = [];
        }
      }

      const existingIndex =
        cart.findIndex(
          (item) =>
            String(
              item.productId ?? item.id
            ) ===
              String(
                cartItem.productId ??
                  cartItem.id
              ) &&
            String(item.weight) ===
              String(cartItem.weight)
        );

      if (existingIndex !== -1) {
        const oldQuantity =
          Number(
            cart[existingIndex].quantity
          ) || 0;

        const newQuantity =
          oldQuantity + quantity;

        cart[existingIndex] = {
          ...cart[existingIndex],
          quantity: newQuantity,
          price: unitPrice,
          total:
            unitPrice * newQuantity,
        };
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem(
        "cartItems",
        JSON.stringify(cart)
      );

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      closeCartPopup();
    } catch (error) {
      console.error(
        "ADD TO CART ERROR:",
        error
      );
    }
  };

  /* =========================================================
     WISHLIST
  ========================================================= */

  const saveWishlist = (ids) => {
    try {
      localStorage.setItem(
        "wishlistIds",
        JSON.stringify(ids)
      );

      window.dispatchEvent(
        new Event("wishlistUpdated")
      );
    } catch (error) {
      console.error(
        "Wishlist save error:",
        error
      );
    }
  };

  const handleWishlistClick = (
    event,
    product
  ) => {
    event.stopPropagation();

    const id = getProductId(product);

    if (!id) {
      return;
    }

    const stringId = String(id);

    setWishlistIds((previous) => {
      let updated;

      if (previous.includes(stringId)) {
        updated = previous.filter(
          (item) => item !== stringId
        );
      } else {
        updated = [
          ...previous,
          stringId,
        ];
      }

      saveWishlist(updated);

      return updated;
    });
  };

  /* =========================================================
     COMPARE
  ========================================================= */

  const saveCompare = (ids) => {
    try {
      localStorage.setItem(
        "compareIds",
        JSON.stringify(ids)
      );

      window.dispatchEvent(
        new Event("compareUpdated")
      );
    } catch (error) {
      console.error(
        "Compare save error:",
        error
      );
    }
  };

  const handleCompareClick = (
    event,
    product
  ) => {
    event.stopPropagation();

    const id = getProductId(product);

    if (!id) {
      return;
    }

    const stringId = String(id);

    setCompareIds((previous) => {
      let updated;

      if (previous.includes(stringId)) {
        updated = previous.filter(
          (item) => item !== stringId
        );
      } else {
        updated = [
          ...previous,
          stringId,
        ];
      }

      saveCompare(updated);

      return updated;
    });
  };

  /* =========================================================
     QUICK VIEW
  ========================================================= */

  const openQuickView = (
    event,
    product
  ) => {
    event.stopPropagation();

    setQuickProduct(product);
    setQuickViewOpen(true);

    document.body.style.overflow =
      "hidden";
  };

  const closeQuickView = () => {
    setQuickViewOpen(false);
    setQuickProduct(null);

    document.body.style.overflow = "";
  };

  /* =========================================================
     ESCAPE KEY
  ========================================================= */

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

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow = "";
    };
  }, [
    quickViewOpen,
    cartPopupProduct,
    sidebarOpen,
  ]);

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        const response =
          await fetch("/api/home");

        if (!response.ok) {
          throw new Error(
            "Failed to load products"
          );
        }

        const data =
          await response.json();

        const allProducts = [];

        if (
          Array.isArray(data?.brands)
        ) {
          data.brands.forEach(
            (brand) => {
              if (
                Array.isArray(
                  brand?.products
                )
              ) {
                brand.products.forEach(
                  (product) => {
                    allProducts.push(
                      product
                    );
                  }
                );
              }
            }
          );
        }

        const uniqueProducts = [];
        const seen = new Set();

        allProducts.forEach(
          (product) => {
            const id =
              getProductId(product);

            if (!id) {
              uniqueProducts.push(
                product
              );
              return;
            }

            const key = String(id);

            if (!seen.has(key)) {
              seen.add(key);

              uniqueProducts.push(
                product
              );
            }
          }
        );

        setProducts(
          uniqueProducts
        );
      } catch (error) {
        console.error(
          "Shop product loading error:",
          error
        );

        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  /* =========================================================
     URL FILTERS
  ========================================================= */

  const selectedCategory =
    searchParams.get("category") ||
    "Shop";

  const selectedSearch =
    searchParams.get("search") || "";

  const selectedStock =
    searchParams.get(
      "stock_status"
    ) || "";

  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (
      selectedCategory &&
      selectedCategory !== "Shop"
    ) {
      const categoryText =
        selectedCategory.toLowerCase();

      result = result.filter(
        (product) => {
          const productCategory =
            getProductCategory(
              product
            ).toLowerCase();

          return (
            productCategory ===
              categoryText ||
            productCategory.includes(
              categoryText
            ) ||
            categoryText.includes(
              productCategory
            )
          );
        }
      );
    }

    if (selectedSearch) {
      const searchText =
        selectedSearch.toLowerCase();

      result = result.filter(
        (product) => {
          const name =
            getProductName(
              product
            ).toLowerCase();

          const category =
            getProductCategory(
              product
            ).toLowerCase();

          return (
            name.includes(
              searchText
            ) ||
            category.includes(
              searchText
            )
          );
        }
      );
    }

    if (
      selectedStock ===
      "onsale"
    ) {
      result = result.filter(
        (product) =>
          hasOffer(product)
      );
    }

    if (
      selectedStock ===
      "instock"
    ) {
      result = result.filter(
        (product) =>
          isInStock(product)
      );
    }

    const minimum =
      Number(minPrice) || 0;

    const maximum =
      Number(maxPrice) || 2000;

    result = result.filter(
      (product) => {
        const price =
          getDisplayPrice(product);

        return (
          price >= minimum &&
          price <= maximum
        );
      }
    );

    if (
      sortValue ===
      "price-low"
    ) {
      result.sort(
        (a, b) =>
          getDisplayPrice(a) -
          getDisplayPrice(b)
      );
    }

    if (
      sortValue ===
      "price-high"
    ) {
      result.sort(
        (a, b) =>
          getDisplayPrice(b) -
          getDisplayPrice(a)
      );
    }

    if (
      sortValue === "rating"
    ) {
      result.sort(
        (a, b) =>
          getProductRating(b) -
          getProductRating(a)
      );
    }

    if (
      sortValue ===
      "popularity"
    ) {
      result.sort(
        (a, b) =>
          getProductPopularity(b) -
          getProductPopularity(a)
      );
    }

    if (
      sortValue === "latest"
    ) {
      result.sort(
        (a, b) => {
          const dateA =
            new Date(
              getProductDate(a)
            ).getTime() || 0;

          const dateB =
            new Date(
              getProductDate(b)
            ).getTime() || 0;

          return dateB - dateA;
        }
      );
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

  /* =========================================================
     RANDOM SIDEBAR PRODUCTS
  ========================================================= */

  const randomProducts = useMemo(() => {
    const array = [
      ...filteredProducts,
    ];

    for (
      let i = array.length - 1;
      i > 0;
      i--
    ) {
      const j =
        Math.floor(
          Math.random() *
            (i + 1)
        );

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

  /* =========================================================
     DISPLAY COUNT
  ========================================================= */

  const displayedProducts =
    useMemo(() => {
      const count =
        Number(showCount) || 9;

      return filteredProducts.slice(
        0,
        count
      );
    }, [
      filteredProducts,
      showCount,
    ]);

  /* =========================================================
     QUERY
  ========================================================= */

  const createQuery = (
    changes = {}
  ) => {
    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    Object.entries(
      changes
    ).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(
            key,
            value
          );
        }
      }
    );

    return params.toString();
  };

  /* =========================================================
     CATEGORY
  ========================================================= */

  const handleCategoryClick = (
    category
  ) => {
    if (category === "Shop") {
      router.push("/shop");
    } else {
      const query =
        createQuery({
          category,
        });

      router.push(
        `/shop?${query}`
      );
    }

    setSidebarOpen(false);
  };

  /* =========================================================
     PRICE
  ========================================================= */

  const handlePriceFilter =
    () => {
      const query =
        createQuery({
          min_price: minPrice,
          max_price: maxPrice,
        });

      router.push(
        `/shop?${query}`
      );
    };

  /* =========================================================
     STOCK
  ========================================================= */

  const handleStockChange = (
    type
  ) => {
    const current =
      searchParams.get(
        "stock_status"
      ) || "";

    const newValue =
      current === type
        ? ""
        : type;

    const query =
      createQuery({
        stock_status:
          newValue,
      });

    router.push(
      `/shop?${query}`
    );
  };

  /* =========================================================
     SHOW COUNT
  ========================================================= */

  const handleShowChange = (
    value
  ) => {
    setShowCount(value);

    const query =
      createQuery({
        show: value,
      });

    router.push(
      `/shop?${query}`
    );
  };

  /* =========================================================
     SORT
  ========================================================= */

  const handleSortChange = (
    value
  ) => {
    setSortValue(value);

    const query =
      createQuery({
        sort: value,
      });

    router.push(
      `/shop?${query}`
    );
  };

  /* =========================================================
     CATEGORY TOGGLE
  ========================================================= */

  const toggleCategory = (
    category
  ) => {
    setOpenCategories(
      (previous) => ({
        ...previous,
        [category]:
          !previous[category],
      })
    );
  };

  /* =========================================================
     PRODUCT PAGE
  ========================================================= */

  const handleProductClick = (
    product
  ) => {
    const id =
      getProductId(product);

    if (!id) {
      return;
    }

    router.push(
      `/product/${id}`
    );
  };

  /* =========================================================
     SELECT OPTIONS
  ========================================================= */

  const handleSelectOptions = (
    event,
    product
  ) => {
    event.stopPropagation();

    openCartPopup(
      event,
      product
    );
  };

  /* =========================================================
     JSX
  ========================================================= */

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
          background: linear-gradient(
            135deg,
            #fff0dc 0%,
            #ffe3c2 30%,
            #ffd0b0 55%,
            #f8b0a0 75%,
            #f28f82 100%
          );
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
          object-fit: cover;
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

        .productImageBox:hover
          .productHoverActions {
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
          box-shadow: 0 2px 8px
            rgba(0, 0, 0, 0.16);
          transition: background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
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
          transition: opacity 0.3s ease,
            visibility 0.3s ease,
            transform 0.3s ease,
            background 0.2s ease,
            color 0.2s ease;
          z-index: 50;
        }

        .productImageBox:hover
          .productOptionsButton {
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

        .productOptionsButton:hover
          .productOptionsCartIcon {
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
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          background: rgba(
            255,
            255,
            255,
            0.97
          );
          animation: productPopupIn
            0.22s ease;
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
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 18px 15px 14px;
          background: #fff;
        }

        .productCartPopupClose {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: #111;
          color: #fff;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          z-index: 10;
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
          transition: background 0.2s ease,
            color 0.2s ease;
        }

        .productWeightButton:hover,
        .productWeightButton.active {
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
          background: rgba(
            0,
            0,
            0,
            0.65
          );
        }

        .quickViewModal {
          position: relative;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          display: grid;
          grid-template-columns: minmax(
              0,
              1fr
            )
            minmax(0, 1fr);
          gap: 35px;
          padding: 35px;
          background: #fff;
          box-shadow: 0 10px 40px
            rgba(0, 0, 0, 0.3);
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
          border: 1px solid
            rgba(0, 0, 0, 0.08);
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

        @media (max-width: 700px) {
          .shopHero {
            height: 250px;
          }

          .shopHeroImage {
            position: relative;
            width: 100%;
            height: 300px;
          }

          .shopHeroOverlay h1 {
            margin-top: 80px;
            font-size: 36px;
          }

          .shopBody {
            padding: 30px 15px 50px;
          }

          .shopLayout {
            display: block;
          }

          .shopTopBar {
            margin-bottom: 25px;
          }

          .shopTopRow {
            justify-content: flex-start;
            gap: 12px;
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            white-space: nowrap;
            scrollbar-width: none;
          }

          .shopTopRow::-webkit-scrollbar {
            display: none;
          }

          .breadcrumb {
            flex: 0 0 auto;
            gap: 5px;
            font-size: 12px;
          }

          .shopControls {
            flex: 0 0 auto;
            margin-left: 0;
            gap: 10px;
          }

          .showControls {
            flex: 0 0 auto;
            gap: 4px;
            font-size: 12px;
            margin-left: 0;
          }

          .sortSelect {
            flex: 0 0 auto;
            width: 180px;
            min-width: 180px;
            height: 34px;
            padding: 0 8px;
            font-size: 12px;
          }

          .mobileShowSidebar {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            margin-top: 12px;
            height: 36px;
            padding: 0 12px;
            border: 1px solid #222;
            background: #fff;
            color: #000;
            font-size: 12px;
            cursor: pointer;
            white-space: nowrap;
          }

          .shopSidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 320px;
            max-width: 88vw;
            height: 100vh;
            overflow-y: auto;
            z-index: 9999;
            padding: 58px 22px 35px;
            background: linear-gradient(
              135deg,
              #fff0dc 0%,
              #ffe3c2 30%,
              #ffd0b0 55%,
              #f8b0a0 75%,
              #f28f82 100%
            );
            transform: translateX(-105%);
            transition: transform 0.3s ease;
            box-shadow: 5px 0 20px
              rgba(0, 0, 0, 0.2);
          }

          .shopSidebar.mobileSidebarOpen {
            transform: translateX(0);
          }

          .mobileSidebarClose {
            display: flex;
            position: absolute;
            top: 15px;
            right: 15px;
            width: 32px;
            height: 32px;
            align-items: center;
            justify-content: center;
            border: 1px solid #222;
            background: #fff;
            color: #000;
            font-size: 24px;
            line-height: 1;
            cursor: pointer;
          }

          .mobileSidebarOverlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 9998;
            background: rgba(
              0,
              0,
              0,
              0.35
            );
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
          }

          .mobileSidebarOverlay.active {
            opacity: 1;
            pointer-events: auto;
          }

          .sidebarProductImageBox {
            width: 95px;
            height: 75px;
            flex-basis: 95px;
          }

          .sidebarProductName {
            font-size: 13px;
          }

          .sidebarProductPrice {
            gap: 5px;
          }

          .sidebarOriginalPrice {
            font-size: 11px;
          }

          .sidebarOfferPrice {
            font-size: 13px;
          }

          .productsGrid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
            gap: 22px 12px;
          }

          .productCardName {
            font-size: 13px;
          }

          .productPrice {
            gap: 6px;
          }

          .originalPrice {
            font-size: 11px;
          }

          .offerPrice {
            font-size: 14px;
          }

          .productHoverActions {
            top: 8px;
            right: 8px;
            gap: 6px;
          }

          .productHoverAction {
            width: 32px;
            height: 32px;
          }

          .productHoverAction i {
            font-size: 13px;
          }

          .productOptionsButton {
            left: 8px;
            right: 8px;
            bottom: 8px;
            height: 38px;
            font-size: 11px;
          }

          .productCartPopup {
            padding: 8px;
          }

          .productCartPopupInner {
            padding: 14px 10px 10px;
          }

          .productCartPopupImage {
            width: 27%;
            max-width: 75px;
            margin-bottom: 5px;
          }

          .productCartPopupName {
            font-size: 11px;
            margin-bottom: 5px;
          }

          .productCartPopupLabel {
            font-size: 9px;
            margin-bottom: 3px;
          }

          .productWeightOptions {
            gap: 3px;
            margin-bottom: 5px;
          }

          .productWeightButton {
            height: 25px;
            font-size: 8px;
          }

          .productCartPopupPrice {
            margin-bottom: 5px;
            font-size: 14px;
          }

          .productQuantityRow {
            height: 26px;
            margin-bottom: 5px;
          }

          .productQuantityButton {
            width: 27px;
            height: 24px;
            font-size: 14px;
          }

          .productQuantityValue {
            min-width: 25px;
            font-size: 10px;
          }

          .productAddCartButton {
            height: 29px;
            font-size: 9px;
          }

          .productCartPopupClose {
            width: 23px;
            height: 23px;
            top: 4px;
            right: 4px;
            font-size: 15px;
          }

          .quickViewOverlay {
            padding: 12px;
          }

          .quickViewModal {
            max-height: 94vh;
            grid-template-columns: 1fr;
            gap: 15px;
            padding: 20px;
          }

          .quickViewInfo {
            padding-top: 0;
          }

          .quickViewTitle {
            font-size: 20px;
          }

          .quickViewOfferPrice {
            font-size: 19px;
          }

          .quickViewDescription {
            font-size: 13px;
          }
        }

        @media (max-width: 380px) {
          .shopBody {
            padding-left: 12px;
            padding-right: 12px;
          }

          .shopTopRow {
            gap: 9px;
          }

          .breadcrumb {
            font-size: 11px;
          }

          .shopControls {
            gap: 7px;
          }

          .showControls {
            font-size: 11px;
            gap: 3px;
          }

          .sortSelect {
            width: 165px;
            min-width: 165px;
          }

          .productsGrid {
            gap: 18px 9px;
          }

          .productCardName {
            font-size: 12px;
          }

          .productHoverActions {
            top: 6px;
            right: 6px;
          }

          .productHoverAction {
            width: 29px;
            height: 29px;
          }

          .productOptionsButton {
            left: 6px;
            right: 6px;
            bottom: 6px;
            height: 35px;
          }
        }
      `}</style>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="shopHero">
        <img
          src="/uploads/shop.png"
          alt="Shop"
          className="shopHeroImage"
          onError={(event) => {
            event.currentTarget.style.display =
              "none";
          }}
        />

        <div className="shopHeroOverlay">
          <h1>{selectedCategory}</h1>
        </div>
      </section>

      {/* =====================================================
          SHOP BODY
      ===================================================== */}

      <section className="shopBody">
        <div className="shopLayout">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside
            className={`shopSidebar ${
              sidebarOpen
                ? "mobileSidebarOpen"
                : ""
            }`}
          >
            <button
              type="button"
              className="mobileSidebarClose"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              ×
            </button>

            {/* PRICE */}

            <div className="sidebarSection">
              <h3 className="sidebarTitle">
                Filter by price
              </h3>

              <div className="rangeSlider">
                <div className="rangeTrack" />

                <div
                  className="rangeDot"
                  style={{
                    left: `${Math.min(
                      100,
                      Math.max(
                        0,
                        (Number(
                          minPrice
                        ) /
                          2000) *
                          100
                      )
                    )}%`,
                  }}
                />

                <div
                  className="rangeDot"
                  style={{
                    left: `${Math.min(
                      100,
                      Math.max(
                        0,
                        (Number(
                          maxPrice
                        ) /
                          2000) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>

              <div className="priceBottom">
                <span className="priceText">
                  Price: ₹
                  {Number(
                    minPrice || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                  {" — "}
                  ₹
                  {Number(
                    maxPrice || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </span>

                <button
                  type="button"
                  className="filterButton"
                  onClick={
                    handlePriceFilter
                  }
                >
                  Filter
                </button>
              </div>
            </div>

            {/* STOCK */}

            <div className="sidebarSection">
              <h3 className="sidebarTitle">
                Stock status
              </h3>

              <div
                className="stockOption"
                onClick={() =>
                  handleStockChange(
                    "onsale"
                  )
                }
              >
                <span
                  className={`customCheckbox ${
                    selectedStock ===
                    "onsale"
                      ? "checked"
                      : ""
                  }`}
                >
                  {selectedStock ===
                    "onsale" && (
                    <i className="fa fa-check" />
                  )}
                </span>

                <span>On sale</span>
              </div>

              <div
                className="stockOption"
                onClick={() =>
                  handleStockChange(
                    "instock"
                  )
                }
              >
                <span
                  className={`customCheckbox ${
                    selectedStock ===
                    "instock"
                      ? "checked"
                      : ""
                  }`}
                >
                  {selectedStock ===
                    "instock" && (
                    <i className="fa fa-check" />
                  )}
                </span>

                <span>In stock</span>
              </div>
            </div>

            {/* CATEGORIES */}

            <div className="sidebarSection">
              <h3 className="sidebarTitle">
                Product categories
              </h3>

              {categories.map(
                (category) => {
                  const hasChildren =
                    Array.isArray(
                      category.children
                    );

                  const isOpen =
                    openCategories[
                      category.name
                    ];

                  return (
                    <div
                      className="categoryItem"
                      key={
                        category.name
                      }
                    >
                      {hasChildren ? (
                        <>
                          <div className="categoryRowWithArrow">
                            <span
                              className="categoryRow"
                              onClick={() =>
                                handleCategoryClick(
                                  category.name
                                )
                              }
                            >
                              {
                                category.name
                              }
                            </span>

                            <span
                              className="categoryArrow"
                              onClick={() =>
                                toggleCategory(
                                  category.name
                                )
                              }
                            >
                              <i
                                className={`fa ${
                                  isOpen
                                    ? "fa-chevron-up"
                                    : "fa-chevron-down"
                                }`}
                              />
                            </span>
                          </div>

                          {isOpen && (
                            <div className="categoryChildren">
                              {category.children.map(
                                (
                                  child
                                ) => (
                                  <div
                                    key={
                                      child
                                    }
                                    className="childCategory"
                                    onClick={() =>
                                      handleCategoryClick(
                                        child
                                      )
                                    }
                                  >
                                    {
                                      child
                                    }
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div
                          className="categoryRow"
                          onClick={() =>
                            handleCategoryClick(
                              category.name
                            )
                          }
                        >
                          {
                            category.name
                          }
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>

            {/* SIDEBAR PRODUCTS */}

            <div className="sidebarSection">
              <h3 className="sidebarTitle">
                Products
              </h3>

              <div className="sidebarProducts">
                {loading ? (
                  <p
                    style={{
                      color: "#000",
                      fontSize:
                        "13px",
                    }}
                  >
                    Loading...
                  </p>
                ) : randomProducts.length ===
                  0 ? (
                  <p
                    style={{
                      color: "#000",
                      fontSize:
                        "13px",
                    }}
                  >
                    No products found.
                  </p>
                ) : (
                  randomProducts.map(
                    (
                      product,
                      index
                    ) => {
                      const originalPrice =
                        getOriginalPrice(
                          product
                        );

                      const offerPrice =
                        getOfferPrice(
                          product
                        );

                      return (
                        <div
                          className="sidebarProduct"
                          key={
                            getProductId(
                              product
                            ) ||
                            index
                          }
                          onClick={() =>
                            handleProductClick(
                              product
                            )
                          }
                        >
                          <div className="sidebarProductImageBox">
                            <img
                              src={getProductImage(
                                product
                              )}
                              alt={getProductName(
                                product
                              )}
                              className="sidebarProductImage"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.src =
                                  "/uploads/no-image.png";
                              }}
                            />
                          </div>

                          <div className="sidebarProductInfo">
                            <p className="sidebarProductName">
                              {getProductName(
                                product
                              )}
                            </p>

                            {hasOffer(
                              product
                            ) ? (
                              <div className="sidebarProductPrice">
                                <span className="sidebarOriginalPrice">
                                  ₹
                                  {originalPrice.toLocaleString(
                                    "en-IN"
                                  )}
                                </span>

                                <span className="sidebarOfferPrice">
                                  ₹
                                  {offerPrice.toLocaleString(
                                    "en-IN"
                                  )}
                                </span>
                              </div>
                            ) : (
                              <div className="sidebarProductPrice">
                                <span className="sidebarOfferPrice">
                                  ₹
                                  {getDisplayPrice(
                                    product
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
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

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <main className="shopMain">

            {/* TOP BAR */}

            <div className="shopTopBar">
              <div className="shopTopRow">

                <div className="breadcrumb">
                  <span
                    className="breadcrumbHome"
                    onClick={() =>
                      handleCategoryClick(
                        "Shop"
                      )
                    }
                  >
                    Home
                  </span>

                  <span className="breadcrumbArrow">
                    »
                  </span>

                  <span>
                    {selectedCategory}
                  </span>
                </div>

                <div className="shopControls">

                  <div className="showControls">
                    <span>
                      Show
                    </span>

                    {[
                      "9",
                      "12",
                      "18",
                      "24",
                    ].map(
                      (number) => (
                        <span
                          key={
                            number
                          }
                          className={`showNumber ${
                            showCount ===
                            number
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            handleShowChange(
                              number
                            )
                          }
                        >
                          {
                            number
                          }
                        </span>
                      )
                    )}
                  </div>

                  <select
                    className="sortSelect"
                    value={
                      sortValue
                    }
                    onChange={(
                      event
                    ) =>
                      handleSortChange(
                        event
                          .target
                          .value
                      )
                    }
                  >
                    <option value="default">
                      Default sorting
                    </option>

                    <option value="popularity">
                      Sort by popularity
                    </option>

                    <option value="rating">
                      Sort by average rating
                    </option>

                    <option value="latest">
                      Sort by latest
                    </option>

                    <option value="price-low">
                      Sort by price: low to high
                    </option>

                    <option value="price-high">
                      Sort by price: high to low
                    </option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="mobileShowSidebar"
                onClick={() =>
                  setSidebarOpen(true)
                }
              >
                <i className="fa fa-bars" />

                <span>
                  Show sidebar
                </span>
              </button>
            </div>

            {/* PRODUCT GRID */}

            {loading ? (
              <div className="emptyProducts">
                Loading products...
              </div>
            ) : displayedProducts.length ===
              0 ? (
              <div className="emptyProducts">
                No products found.
              </div>
            ) : (
              <div className="productsGrid">

                {displayedProducts.map(
                  (
                    product,
                    index
                  ) => {
                    const image1 =
                      getProductImage(
                        product
                      );

                    const image2 =
                      getProductSecondImage(
                        product
                      );

                    const originalPrice =
                      getOriginalPrice(
                        product
                      );

                    const offerPrice =
                      getOfferPrice(
                        product
                      );

                    const productId =
                      getProductId(
                        product
                      );

                    const productIdString =
                      productId
                        ? String(
                            productId
                          )
                        : "";

                    const isWishlisted =
                      wishlistIds.includes(
                        productIdString
                      );

                    const isCompared =
                      compareIds.includes(
                        productIdString
                      );

                    const isCartPopupOpen =
                      cartPopupProduct &&
                      String(
                        getProductId(
                          cartPopupProduct
                        )
                      ) ===
                        String(
                          productId
                        );

                    return (
                      <div
                        className="productCard"
                        key={
                          productId ||
                          index
                        }
                        onClick={() =>
                          handleProductClick(
                            product
                          )
                        }
                      >
                        {/* IMAGE */}

                        <div className="productImageBox">

                          <img
                            src={
                              image1
                            }
                            alt={getProductName(
                              product
                            )}
                            className="productImage"
                            onError={(
                              event
                            ) => {
                              if (
                                event
                                  .currentTarget
                                  .dataset
                                  .fallback
                              ) {
                                return;
                              }

                              event.currentTarget.dataset.fallback =
                                "true";

                              event.currentTarget.src =
                                "/uploads/no-image.png";
                            }}
                          />

                          {image2 && (
                            <img
                              src={
                                image2
                              }
                              alt={getProductName(
                                product
                              )}
                              className="productImage productImageSecond"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          )}

                          {/* HOVER ACTIONS */}

                          {!isCartPopupOpen && (
                            <div className="productHoverActions">

                              {/* COMPARE */}

                              <button
                                type="button"
                                className={`productHoverAction ${
                                  isCompared
                                    ? "active"
                                    : ""
                                }`}
                                title={
                                  isCompared
                                    ? "Remove from compare"
                                    : "Add to compare"
                                }
                                onClick={(
                                  event
                                ) =>
                                  handleCompareClick(
                                    event,
                                    product
                                  )
                                }
                              >
                                <i className="fa fa-exchange" />
                              </button>

                              {/* QUICK VIEW */}

                              <button
                                type="button"
                                className="productHoverAction"
                                title="Quick view"
                                onClick={(
                                  event
                                ) =>
                                  openQuickView(
                                    event,
                                    product
                                  )
                                }
                              >
                                <i className="fa fa-eye" />
                              </button>

                              {/* WISHLIST */}

                              <button
                                type="button"
                                className={`productHoverAction ${
                                  isWishlisted
                                    ? "active"
                                    : ""
                                }`}
                                title={
                                  isWishlisted
                                    ? "Remove from wishlist"
                                    : "Add to wishlist"
                                }
                                onClick={(
                                  event
                                ) =>
                                  handleWishlistClick(
                                    event,
                                    product
                                  )
                                }
                              >
                                <i
                                  className={`fa ${
                                    isWishlisted
                                      ? "fa-heart"
                                      : "fa-heart-o"
                                  }`}
                                />
                              </button>
                            </div>
                          )}

                          {/* SELECT OPTIONS */}

                          {!isCartPopupOpen && (
                            <button
                              type="button"
                              className="productOptionsButton"
                              onClick={(
                                event
                              ) =>
                                handleSelectOptions(
                                  event,
                                  product
                                )
                              }
                            >
                              <span className="productOptionsText">
                                SELECT OPTIONS
                              </span>

                              <i className="fa fa-shopping-cart productOptionsCartIcon" />
                            </button>
                          )}

                          {/* CART POPUP */}

                          {isCartPopupOpen &&
                            cartPopupProduct && (
                              <div
                                className="productCartPopup"
                                onClick={(
                                  event
                                ) =>
                                  event.stopPropagation()
                                }
                              >
                                <div className="productCartPopupInner">

                                  {/* CLOSE */}

                                  <button
                                    type="button"
                                    className="productCartPopupClose"
                                    onClick={
                                      closeCartPopup
                                    }
                                    aria-label="Close"
                                  >
                                    ×
                                  </button>

                                  {/* PRODUCT IMAGE */}

                                  <img
                                    src={getProductImage(
                                      cartPopupProduct
                                    )}
                                    alt={getProductName(
                                      cartPopupProduct
                                    )}
                                    className="productCartPopupImage"
                                    onError={(
                                      event
                                    ) => {
                                      event.currentTarget.src =
                                        "/uploads/no-image.png";
                                    }}
                                  />

                                  {/* PRODUCT NAME */}

                                  <div className="productCartPopupName">
                                    {getProductName(
                                      cartPopupProduct
                                    )}
                                  </div>

                                  {/* WEIGHT */}

                                  <div className="productCartPopupLabel">
                                    Select Weight
                                  </div>

                                  <div className="productWeightOptions">
                                    {getWeightOptions(
                                      cartPopupProduct
                                    ).map(
                                      (
                                        option
                                      ) => (
                                        <button
                                          key={
                                            option.label
                                          }
                                          type="button"
                                          className={`productWeightButton ${
                                            selectedWeight ===
                                            option.label
                                              ? "active"
                                              : ""
                                          }`}
                                          onClick={(
                                            event
                                          ) => {
                                            event.stopPropagation();

                                            setSelectedWeight(
                                              option.label
                                            );
                                          }}
                                        >
                                          {
                                            option.label
                                          }
                                        </button>
                                      )
                                    )}
                                  </div>

                                  {/* PRICE */}

                                  <div className="productCartPopupPrice">
                                    ₹
                                    {getCartPopupPrice(
                                      cartPopupProduct
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </div>

                                  {/* QUANTITY */}

                                  <div
                                    className="productQuantityRow"
                                    onClick={(
                                      event
                                    ) =>
                                      event.stopPropagation()
                                    }
                                  >
                                    <button
                                      type="button"
                                      className="productQuantityButton"
                                      onClick={
                                        decreaseCartQuantity
                                      }
                                    >
                                      −
                                    </button>

                                    <span className="productQuantityValue">
                                      {
                                        cartQuantity
                                      }
                                    </span>

                                    <button
                                      type="button"
                                      className="productQuantityButton"
                                      onClick={
                                        increaseCartQuantity
                                      }
                                    >
                                      +
                                    </button>
                                  </div>

                                  {/* ADD CART */}

                                  <button
                                    type="button"
                                    className="productAddCartButton"
                                    onClick={
                                      handleAddToCart
                                    }
                                  >
                                    ADD TO CART
                                  </button>
                                </div>
                              </div>
                            )}
                        </div>

                        {/* NAME */}

                        <div className="productCardName">
                          {getProductName(
                            product
                          )}
                        </div>

                        {/* PRICE */}

                        {hasOffer(
                          product
                        ) ? (
                          <div className="productPrice">
                            <span className="originalPrice">
                              ₹
                              {originalPrice.toLocaleString(
                                "en-IN"
                              )}
                            </span>

                            <span className="offerPrice">
                              ₹
                              {offerPrice.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="productPrice">
                            <span className="offerPrice">
                              ₹
                              {getDisplayPrice(
                                product
                              ).toLocaleString(
                                "en-IN"
                              )}
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

      {/* MOBILE SIDEBAR OVERLAY */}

      <div
        className={`mobileSidebarOverlay ${
          sidebarOpen
            ? "active"
            : ""
        }`}
        onClick={() =>
          setSidebarOpen(false)
        }
      />

      {/* =====================================================
          QUICK VIEW
      ===================================================== */}

      {quickViewOpen &&
        quickProduct && (
          <div
            className="quickViewOverlay"
            onClick={
              closeQuickView
            }
          >
            <div
              className="quickViewModal"
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                className="quickViewClose"
                onClick={
                  closeQuickView
                }
                aria-label="Close"
              >
                ×
              </button>

              {/* IMAGE */}

              <div className="quickViewImageBox">
                <img
                  src={getProductImage(
                    quickProduct
                  )}
                  alt={getProductName(
                    quickProduct
                  )}
                  className="quickViewImage"
                  onError={(
                    event
                  ) => {
                    event.currentTarget.src =
                      "/uploads/no-image.png";
                  }}
                />
              </div>

              {/* INFO */}

              <div className="quickViewInfo">

                <h2 className="quickViewTitle">
                  {getProductName(
                    quickProduct
                  )}
                </h2>

                <div className="quickViewCategory">
                  {getProductCategory(
                    quickProduct
                  )}
                </div>

                {/* PRICE */}

                {hasOffer(
                  quickProduct
                ) ? (
                  <div className="quickViewPrice">
                    <span className="quickViewOriginalPrice">
                      ₹
                      {getOriginalPrice(
                        quickProduct
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>

                    <span className="quickViewOfferPrice">
                      ₹
                      {getOfferPrice(
                        quickProduct
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                ) : (
                  <div className="quickViewPrice">
                    <span className="quickViewOfferPrice">
                      ₹
                      {getDisplayPrice(
                        quickProduct
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </span>
                  </div>
                )}

                {/* DESCRIPTION */}

                <div className="quickViewDescription">
                  {quickProduct?.description ||
                  quickProduct?.short_description ||
                  quickProduct?.shortDescription ? (
                    quickProduct?.description ||
                    quickProduct?.short_description ||
                    quickProduct?.shortDescription
                  ) : (
                    <>
                      View this product for
                      more details and
                      available options.
                    </>
                  )}
                </div>

                {/* BUTTONS */}

                <div className="quickViewButtons">

                  <button
                    type="button"
                    className="quickViewButton"
                    onClick={() =>
                      handleProductClick(
                        quickProduct
                      )
                    }
                  >
                    VIEW PRODUCT
                  </button>

                  <button
                    type="button"
                    className="quickViewSecondaryButton"
                    onClick={() =>
                      handleWishlistClick(
                        {
                          stopPropagation:
                            () => {},
                        },
                        quickProduct
                      )
                    }
                  >
                    {wishlistIds.includes(
                      String(
                        getProductId(
                          quickProduct
                        )
                      )
                    )
                      ? "REMOVE WISHLIST"
                      : "ADD TO WISHLIST"}
                  </button>

                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}

/* =========================================================
   SUSPENSE WRAPPER
========================================================= */

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
          }}
        >
          Loading shop...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}