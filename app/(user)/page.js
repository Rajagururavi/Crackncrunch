"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const banners = [
    "/uploads/2.PNG",
    "/uploads/3.PNG",
    "/uploads/4.PNG",
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickProduct, setQuickProduct] = useState(null);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickQuantity, setQuickQuantity] = useState(1);
  const [quickWeight, setQuickWeight] = useState("");

  const [selectedOptionsProduct, setSelectedOptionsProduct] =
    useState(null);

  const [selectedWeights, setSelectedWeights] = useState({});
  const [wishlistIds, setWishlistIds] = useState([]);

  /* =========================================================
     LOAD HOME DATA
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadHomeData = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/home", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load home data");
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (data?.success) {
          setCategories(
            Array.isArray(data.categories)
              ? data.categories
              : []
          );

          setBrands(
            Array.isArray(data.brands)
              ? data.brands
              : []
          );
        } else {
          setCategories([]);
          setBrands([]);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Home data error:", error);

        setCategories([]);
        setBrands([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHomeData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     BANNER SLIDER
  ========================================================= */

  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev >= banners.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev >= banners.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev <= 0 ? banners.length - 1 : prev - 1
    );
  };

  /* =========================================================
     IMAGE HELPER
  ========================================================= */

  const getImage = (image, folder = "") => {
    if (!image) {
      return "";
    }

    if (image.startsWith("data:")) {
      return image;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/")
    ) {
      return image;
    }

    if (folder) {
      return `/uploads/${folder}/${image}`;
    }

    return image;
  };

  /* =========================================================
     PRODUCT HELPERS
  ========================================================= */

  const getProductId = (product) => {
    return product?._id || product?.id || "";
  };

  const getProductTitle = (product) => {
    return product?.productName || "";
  };

  const getProductOriginalPrice = (product) => {
    return Number(product?.price || 0);
  };

  const getProductOfferPrice = (product) => {
    return Number(product?.offerPrice || 0);
  };

  const getProductPrice = (product) => {
    const originalPrice =
      getProductOriginalPrice(product);

    const offerPrice =
      getProductOfferPrice(product);

    if (
      offerPrice > 0 &&
      offerPrice < originalPrice
    ) {
      return offerPrice;
    }

    return originalPrice;
  };

  const getProductImage1 = (product) => {
    if (
      Array.isArray(product?.images) &&
      product.images.length > 0
    ) {
      return getImage(product.images[0], "products");
    }

    return "";
  };

  const getProductImage2 = (product) => {
    if (
      Array.isArray(product?.images) &&
      product.images.length > 1
    ) {
      return getImage(product.images[1], "products");
    }

    return "";
  };

  const getProductImage3 = (product) => {
    if (
      Array.isArray(product?.images) &&
      product.images.length > 2
    ) {
      return getImage(product.images[2], "products");
    }

    return getProductImage1(product);
  };

  const isProductActive = (product) => {
    const status = String(
      product?.stockStatus || ""
    )
      .trim()
      .toLowerCase();

    return (
      status === "currently available" ||
      status === "available" ||
      status === "in stock"
    );
  };

  /* =========================================================
     WEIGHT / PRICE
  ========================================================= */

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
    const basePrice = getProductPrice(product);

    return basePrice * getWeightMultiplier(weight);
  };

  /* =========================================================
     PRODUCT OPTIONS
  ========================================================= */

  const openProductOptions = (product, event) => {
    event.preventDefault();
    event.stopPropagation();

    const productId = getProductId(product);

    setSelectedOptionsProduct(product);

    setSelectedWeights((prev) => ({
      ...prev,
      [productId]: "",
    }));
  };

  const closeProductOptions = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setSelectedOptionsProduct(null);
  };

  const handleWeightChange = (
    productId,
    weight
  ) => {
    setSelectedWeights((prev) => ({
      ...prev,
      [productId]: weight,
    }));
  };

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart = (product) => {
    const productId = getProductId(product);

    const weight =
      selectedWeights[productId];

    if (!weight) {
      alert("Please select a weight.");
      return;
    }

    const price = getWeightPrice(
      product,
      weight
    );

    const cartItem = {
      product_id: productId,
      product_title: getProductTitle(product),
      product_image: getProductImage1(product),
      weight,
      quantity: 1,
      final_price: price,
    };

    try {
      const savedCart =
        localStorage.getItem("cart");

      let cart = [];

      if (savedCart) {
        try {
          const parsedCart =
            JSON.parse(savedCart);

          if (Array.isArray(parsedCart)) {
            cart = parsedCart;
          }
        } catch {
          cart = [];
        }
      }

      const existingIndex =
        cart.findIndex(
          (item) =>
            String(item.product_id) ===
              String(productId) &&
            item.weight === weight
        );

      if (existingIndex !== -1) {
        cart[existingIndex].quantity =
          Number(
            cart[existingIndex].quantity || 0
          ) + 1;

        cart[existingIndex].final_price =
          Number(price) *
          Number(cart[existingIndex].quantity);
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(cart)
      );

      sessionStorage.setItem(
        "openCartAfterRefresh",
        "true"
      );

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "Add cart error:",
        error
      );
    }
  };

  /* =========================================================
     QUICK VIEW
  ========================================================= */

  const openQuickView = async (product) => {
    const productId =
      getProductId(product);

    setQuickViewOpen(true);
    setQuickLoading(true);
    setQuickProduct(null);
    setQuickQuantity(1);
    setQuickWeight("");

    try {
      const response = await fetch(
        `/api/products/${productId}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Product not found"
        );
      }

      const data =
        await response.json();

      if (
        data?.success &&
        data?.product
      ) {
        setQuickProduct(data.product);
      } else {
        setQuickProduct(product);
      }
    } catch (error) {
      console.error(
        "Quick view error:",
        error
      );

      setQuickProduct(product);
    } finally {
      setQuickLoading(false);
    }
  };

  const closeQuickView = () => {
    setQuickViewOpen(false);
    setQuickProduct(null);
    setQuickQuantity(1);
    setQuickWeight("");
  };

  const changeQuickQuantity = (
    change
  ) => {
    setQuickQuantity((prev) => {
      const next = prev + change;

      if (next < 1) {
        return 1;
      }

      return next;
    });
  };

  const getQuickViewTotal = () => {
    if (
      !quickProduct ||
      !quickWeight
    ) {
      return 0;
    }

    const singlePrice =
      getWeightPrice(
        quickProduct,
        quickWeight
      );

    return (
      singlePrice * quickQuantity
    );
  };

  const addQuickViewToCart = () => {
    if (!quickProduct) {
      return;
    }

    if (!quickWeight) {
      alert("Please select a weight.");
      return;
    }

    const price =
      getWeightPrice(
        quickProduct,
        quickWeight
      );

    const productId =
      getProductId(quickProduct);

    const cartItem = {
      product_id: productId,
      product_title:
        getProductTitle(
          quickProduct
        ),
      product_image:
        getProductImage1(
          quickProduct
        ),
      weight: quickWeight,
      quantity: quickQuantity,
      final_price:
        price * quickQuantity,
    };

    try {
      const savedCart =
        localStorage.getItem("cart");

      let cart = [];

      if (savedCart) {
        try {
          const parsedCart =
            JSON.parse(savedCart);

          if (Array.isArray(parsedCart)) {
            cart = parsedCart;
          }
        } catch {
          cart = [];
        }
      }

      const existingIndex =
        cart.findIndex(
          (item) =>
            String(item.product_id) ===
              String(productId) &&
            item.weight ===
              quickWeight
        );

      if (existingIndex !== -1) {
        cart[existingIndex].quantity =
          Number(
            cart[existingIndex].quantity ||
              0
          ) + quickQuantity;

        cart[existingIndex].final_price =
          price *
          Number(
            cart[existingIndex].quantity
          );
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(cart)
      );

      sessionStorage.setItem(
        "openCartAfterRefresh",
        "true"
      );

      window.dispatchEvent(
        new Event("cartUpdated")
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "Quick cart error:",
        error
      );
    }
  };

  /* =========================================================
     WISHLIST
  ========================================================= */

  const isWishlist = (productId) => {
    return wishlistIds.includes(
      String(productId)
    );
  };

  const wishlistClicked = async (
    product,
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const productId = String(
      getProductId(product)
    );

    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      alert(
        "Please login to add products to wishlist."
      );
      return;
    }

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch {
      alert("Please login again.");
      return;
    }

    if (!user?.logged_in) {
      alert(
        "Please login to add products to wishlist."
      );
      return;
    }

    if (
      wishlistIds.includes(productId)
    ) {
      const updated =
        wishlistIds.filter(
          (id) => id !== productId
        );

      setWishlistIds(updated);

      try {
        await fetch("/api/wishlist", {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            productId,
          }),
        });
      } catch (error) {
        console.error(
          "Wishlist remove error:",
          error
        );
      }

      return;
    }

    setWishlistIds((prev) => [
      ...prev,
      productId,
    ]);

    try {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          productId,
        }),
      });
    } catch (error) {
      console.error(
        "Wishlist add error:",
        error
      );
    }
  };

  /* =========================================================
     COMPARE
  ========================================================= */

  const compareClicked = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const element =
      event.currentTarget;

    if (
      !element.classList.contains(
        "compare-added"
      )
    ) {
      element.classList.add(
        "compare-added"
      );

      const icon =
        element.querySelector("i");

      if (icon) {
        icon.classList.remove(
          "fa-exchange"
        );

        icon.classList.add(
          "fa-check"
        );
      }

      element.setAttribute(
        "title",
        "Product added to compare"
      );
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          HERO BANNER
      ===================================================== */}

      <div className="hero-banner">
        <div
          className="banner-slider"
          style={{
            transform: `translateX(-${
              currentSlide * 100
            }%)`,
          }}
        >
          {banners.map(
            (banner, index) => (
              <img
                key={index}
                src={banner}
                alt={`Banner ${
                  index + 1
                }`}
              />
            )
          )}
        </div>

        <button
          className="slider-btn prev-btn"
          type="button"
          onClick={prevSlide}
        >
          ❮
        </button>

        <button
          className="slider-btn next-btn"
          type="button"
          onClick={nextSlide}
        >
          ❯
        </button>
      </div>

      {/* =====================================================
          CATEGORIES
      ===================================================== */}

      <div className="category-section">
        <h1 className="section-title">
          Our Categories
        </h1>

        {loading ? (
          <div className="no-product-msg">
            Loading Categories...
          </div>
        ) : categories.length > 0 ? (
          <div className="category-row">
            {categories.map(
              (category, index) => {
                const title =
                  category?.name ||
                  category?.cat_title ||
                  category?.title ||
                  "";

                const image =
                  getImage(
                    category?.image ||
                      category?.cat_image ||
                      "",
                    "categories"
                  );

                return (
                  <div
                    className="category-column"
                    key={
                      category?._id ||
                      category?.id ||
                      index
                    }
                  >
                    <div className="category-card">
                      <Link
                        href={`/shop?category=${encodeURIComponent(
                          title
                        )}`}
                      >
                        {image && (
                          <img
                            src={image}
                            className="category-img"
                            alt={title}
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        )}
                      </Link>

                      <div className="category-content">
                        <h3 className="category-title">
                          {title}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <div className="no-product-msg">
            No Categories Found
          </div>
        )}
      </div>

      {/* =====================================================
          BRANDS + PRODUCTS
      ===================================================== */}

      {brands.map(
        (brand, brandIndex) => {
          const brandTitle =
            brand?.brandName ||
            brand?.name ||
            brand?.brand_title ||
            brand?.title ||
            "";

          const brandImage =
            getImage(
              brand?.image ||
                brand?.brand_image ||
                "",
              "brands"
            );

          const products =
            Array.isArray(
              brand?.products
            )
              ? brand.products
              : [];

          return (
            <div
              key={
                brand?._id ||
                brand?.id ||
                brandIndex
              }
            >
              {brandImage && (
                <div className="nutrition-banner">
                  <img
                    src={brandImage}
                    alt={brandTitle}
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              )}

              <div className="premium-section">
                <div className="premium-header">
                  <h2 className="premium-main-title">
                    {brandTitle}
                  </h2>

                  <Link
                    href={`/shop?brand=${encodeURIComponent(
                      brandTitle
                    )}`}
                    className="premium-view-btn"
                  >
                    View All
                  </Link>
                </div>

                {products.length >
                0 ? (
                  <div className="premium-grid">
                    {products.map(
                      (
                        product,
                        productIndex
                      ) => {
                        const productId =
                          getProductId(
                            product
                          );

                        const title =
                          getProductTitle(
                            product
                          );

                        const image1 =
                          getProductImage1(
                            product
                          );

                        const image2 =
                          getProductImage2(
                            product
                          );

                        const active =
                          isProductActive(
                            product
                          );

                        const selectedWeight =
                          selectedWeights[
                            productId
                          ] || "";

                        const originalPrice =
                          getProductOriginalPrice(
                            product
                          );

                        const offerPrice =
                          getProductOfferPrice(
                            product
                          );

                        const optionPrice =
                          selectedWeight
                            ? getWeightPrice(
                                product,
                                selectedWeight
                              )
                            : getProductPrice(
                                product
                              );

                        return (
                          <div
                            className="premium-column"
                            key={
                              productId ||
                              productIndex
                            }
                          >
                            <div className="premium-card">
                              <div className="image-wrapper">
                                {active ? (
                                  <span className="sale-badge sale">
                                    SALE
                                  </span>
                                ) : (
                                  <span className="sale-badge unavailable">
                                    CURRENTLY UNAVAILABLE
                                  </span>
                                )}

                                <Link
                                  href={`/shop?product=${encodeURIComponent(
                                    productId
                                  )}`}
                                  className="product-image-link"
                                >
                                  {image1 && (
                                    <img
                                      src={
                                        image1
                                      }
                                      className="premium-image image1"
                                      alt={title}
                                      onError={(
                                        event
                                      ) => {
                                        event.currentTarget.style.display =
                                          "none";
                                      }}
                                    />
                                  )}

                                  {image2 &&
                                    image2 !==
                                      image1 && (
                                      <img
                                        src={
                                          image2
                                        }
                                        className="premium-image image2"
                                        alt={
                                          title
                                        }
                                        onError={(
                                          event
                                        ) => {
                                          event.currentTarget.style.display =
                                            "none";
                                        }}
                                      />
                                    )}
                                </Link>

                                {/* PRODUCT BOTTOM ACTION */}

                                <div className="product-bottom-action">
                                  {active ? (
                                    <div className="select-option-btn">
                                      <span
                                        className={
                                          selectedOptionsProduct &&
                                          String(
                                            getProductId(
                                              selectedOptionsProduct
                                            )
                                          ) ===
                                            String(
                                              productId
                                            )
                                            ? "option-text option-hidden"
                                            : "option-text"
                                        }
                                      >
                                        SELECT OPTIONS
                                      </span>

                                      <button
                                        type="button"
                                        className="option-cart"
                                        onClick={(
                                          event
                                        ) =>
                                          openProductOptions(
                                            product,
                                            event
                                          )
                                        }
                                      >
                                        <i className="fa fa-shopping-cart"></i>
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      className="select-option-btn disabled-btn"
                                      disabled
                                    >
                                      CURRENTLY
                                      UNAVAILABLE
                                    </button>
                                  )}
                                </div>

                                {/* HOVER ACTIONS */}

                                <div className="product-hover-actions">
                                  <a
                                    href="#"
                                    className="hover-action"
                                    title="Add to Compare"
                                    onClick={
                                      compareClicked
                                    }
                                  >
                                    <i className="fa fa-exchange"></i>
                                  </a>

                                  <button
                                    type="button"
                                    className="hover-action quick-view-btn"
                                    title="Quick View"
                                    onClick={(
                                      event
                                    ) => {
                                      event.preventDefault();
                                      event.stopPropagation();

                                      openQuickView(
                                        product
                                      );
                                    }}
                                  >
                                    <i className="fa fa-eye"></i>
                                  </button>

                                  <button
                                    type="button"
                                    className={`hover-action wishlist-action ${
                                      isWishlist(
                                        productId
                                      )
                                        ? "wishlist-selected"
                                        : ""
                                    }`}
                                    title={
                                      isWishlist(
                                        productId
                                      )
                                        ? "Remove from Wishlist"
                                        : "Add to Wishlist"
                                    }
                                    onClick={(
                                      event
                                    ) =>
                                      wishlistClicked(
                                        product,
                                        event
                                      )
                                    }
                                  >
                                    <i
                                      className={
                                        isWishlist(
                                          productId
                                        )
                                          ? "fa fa-heart"
                                          : "fa fa-heart-o"
                                      }
                                    ></i>
                                  </button>
                                </div>

                                {/* PRODUCT OPTIONS PANEL */}

                                {active &&
                                  selectedOptionsProduct &&
                                  String(
                                    getProductId(
                                      selectedOptionsProduct
                                    )
                                  ) ===
                                    String(
                                      productId
                                    ) && (
                                    <div className="product-options-panel active">
                                      <button
                                        type="button"
                                        className="product-options-close"
                                        onClick={
                                          closeProductOptions
                                        }
                                      >
                                        ×
                                      </button>

                                      <div className="product-options-inner">
                                        <label>
                                          Weight
                                        </label>

                                        <select
                                          className="product-option-select"
                                          value={
                                            selectedWeight
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            handleWeightChange(
                                              productId,
                                              event
                                                .target
                                                .value
                                            )
                                          }
                                        >
                                          <option value="">
                                            Select
                                            Weight
                                          </option>

                                          <option value="250g">
                                            250g
                                          </option>

                                          <option value="500g">
                                            500g
                                          </option>

                                          <option value="1kg">
                                            1kg
                                          </option>
                                        </select>

                                        {selectedWeight && (
                                          <div className="selected-option-price">
                                            ₹
                                            {optionPrice.toLocaleString(
                                              "en-IN",
                                              {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              }
                                            )}
                                          </div>
                                        )}

                                        {!selectedWeight && (
                                          <p className="weight-error">
                                            Please
                                            select
                                            a
                                            weight.
                                          </p>
                                        )}

                                        <button
                                          type="button"
                                          className="weight-add-cart"
                                          onClick={() =>
                                            addToCart(
                                              product
                                            )
                                          }
                                        >
                                          <i className="fa fa-shopping-cart"></i>
                                          ADD TO
                                          CART
                                        </button>
                                      </div>
                                    </div>
                                  )}
                              </div>

                              {/* PRODUCT CONTENT */}

                              <div className="premium-content">
                                <h3 className="premium-title">
                                  {title}
                                </h3>

                                <div className="product-price">
                                  {offerPrice >
                                    0 &&
                                    offerPrice <
                                      originalPrice && (
                                      <span className="old-price">
                                        ₹
                                        {originalPrice.toLocaleString(
                                          "en-IN"
                                        )}
                                      </span>
                                    )}

                                  <span className="current-price">
                                    ₹
                                    {getProductPrice(
                                      product
                                    ).toLocaleString(
                                      "en-IN"
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="no-product-msg">
                    No Products Found
                  </div>
                )}
              </div>
            </div>
          );
        }
      )}

      {/* =====================================================
          QUICK VIEW MODAL
      ===================================================== */}

      <div
        className={`quick-view-modal ${
          quickViewOpen
            ? "active"
            : ""
        }`}
        onClick={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            closeQuickView();
          }
        }}
      >
        <div className="quick-view-box">
          <button
            type="button"
            className="quick-view-close"
            onClick={
              closeQuickView
            }
          >
            ×
          </button>

          {quickLoading ? (
            <div className="quick-loading">
              Loading...
            </div>
          ) : quickProduct ? (
            <div className="quick-view-content">
              <div className="quick-view-image">
                {getProductImage1(
                  quickProduct
                ) && (
                  <img
                    src={getProductImage1(
                      quickProduct
                    )}
                    alt={getProductTitle(
                      quickProduct
                    )}
                  />
                )}
              </div>

              <div className="quick-view-details">
                <h2>
                  {getProductTitle(
                    quickProduct
                  )}
                </h2>

                <div className="quick-view-price">
                  ₹
                  {getQuickViewTotal().toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </div>

                <div className="quick-view-description">
                  {quickProduct.description ||
                    "Premium quality product from Crack n Crunch."}
                </div>

                <label className="quick-view-label">
                  Weight
                </label>

                <select
                  className="quick-view-select"
                  value={
                    quickWeight
                  }
                  onChange={(event) =>
                    setQuickWeight(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select Weight
                  </option>

                  <option value="250g">
                    250g
                  </option>

                  <option value="500g">
                    500g
                  </option>

                  <option value="1kg">
                    1kg
                  </option>
                </select>

                <label className="quick-view-label">
                  Quantity
                </label>

                <div className="quick-quantity">
                  <button
                    type="button"
                    onClick={() =>
                      changeQuickQuantity(
                        -1
                      )
                    }
                  >
                    −
                  </button>

                  <span>
                    {quickQuantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      changeQuickQuantity(
                        1
                      )
                    }
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="quick-add-cart"
                  disabled={
                    !isProductActive(
                      quickProduct
                    )
                  }
                  onClick={
                    addQuickViewToCart
                  }
                >
                  <i className="fa fa-shopping-cart"></i>

                  {isProductActive(
                    quickProduct
                  )
                    ? "ADD TO CART"
                    : "CURRENTLY UNAVAILABLE"}
                </button>
              </div>
            </div>
          ) : (
            <div className="quick-loading">
              Unable to load product
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style jsx global>{`
        body {
          background: #f3f3f3;
          font-family: "Poppins", sans-serif;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        .hero-banner {
          position: relative;
          width: 100%;
          height: 500px;
          overflow: hidden;
          margin-top: 145px;
          box-shadow: 0 10px 30px
            rgba(0, 0, 0, 0.15);
        }

        .banner-slider {
          display: flex;
          width: 100%;
          height: 100%;
          transition: 1s ease-in-out;
        }

        .banner-slider img {
          min-width: 100%;
          width: 100%;
          height: 500px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .slider-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            0.25
          );
          color: #fff;
          font-size: 22px;
          cursor: pointer;
          z-index: 100;
          transition: 0.3s;
        }

        .slider-btn:hover {
          background: #00bcd4;
        }

        .prev-btn {
          left: 20px;
        }

        .next-btn {
          right: 20px;
        }

        .category-section {
          padding: 40px 20px;
        }

        .section-title {
          text-align: center;
          font-size: 38px;
          font-weight: 700;
          color: #222;
          margin-bottom: 40px;
        }

        .category-row {
          display: grid;
          grid-template-columns: repeat(
            6,
            1fr
          );
          gap: 20px;
        }

        .category-column {
          width: 100%;
        }

        .category-card {
          width: 100%;
          height: 280px;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          transition: 0.4s;
          box-shadow: 0 5px 18px
            rgba(0, 0, 0, 0.08);
        }

        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px
            rgba(0, 0, 0, 0.15);
        }

        .category-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }

        .category-content {
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          background: #fff;
          padding: 10px;
          box-sizing: border-box;
        }

        .category-title {
          font-size: 18px;
          font-weight: 700;
          color: #222;
          margin: 0;
        }

        .no-product-msg {
          width: 100%;
          text-align: center;
          padding: 50px;
          background: #fff;
          border-radius: 15px;
          font-size: 22px;
          font-weight: 600;
          color: #777;
          box-sizing: border-box;
        }

        .nutrition-banner {
          width: 100%;
          margin: 20px 0;
          overflow: hidden;
          box-shadow: 0 10px 30px
            rgba(0, 0, 0, 0.12);
        }

        .nutrition-banner img {
          width: 100%;
          height: 450px;
          display: block;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .premium-section {
          width: 100%;
          padding: 40px 20px;
          box-sizing: border-box;
        }

        .premium-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .premium-main-title {
          margin: 0;
          font-size: 38px;
          font-weight: 700;
          color: #222;
          word-break: break-word;
        }

        .premium-view-btn {
          background: #000;
          color: #fff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .premium-view-btn:hover {
          background: #333;
        }

        .premium-grid {
          display: grid;
          grid-template-columns: repeat(
            5,
            1fr
          );
          gap: 20px;
        }

        .premium-column {
          position: relative;
        }

        .premium-card {
          position: relative;
          background: #fff;
          border-radius: 0;
          overflow: hidden;
          box-shadow: 0 5px 18px
            rgba(0, 0, 0, 0.08);
          transition: 0.3s;
        }

        .premium-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px
            rgba(0, 0, 0, 0.15);
        }

        .image-wrapper {
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .image-wrapper > a {
          display: block;
          position: relative;
          width: 100%;
        }

        .premium-image {
          width: 100%;
          height: 300px;
          object-fit: cover;
          display: block;
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

        .image-wrapper:hover
          .image2 {
          opacity: 1;
        }

        .image-wrapper:hover
          .image1 {
          opacity: 0;
        }

        .sale-badge {
          position: absolute;
          top: 12px;
          left: 0;
          background: #000;
          color: #fff;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: bold;
          border-radius: 0;
          z-index: 5;
        }

        .sale {
          background: #28a745;
        }

        .unavailable {
          background: #dc3545;
        }

        .product-hover-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 40;
          opacity: 0;
          visibility: hidden;
          transform: translateX(15px);
          transition:
            opacity 0.3s ease,
            visibility 0.3s ease,
            transform 0.3s ease;
        }

        .image-wrapper:hover
          .product-hover-actions {
          opacity: 1;
          visibility: visible;
          transform: translateX(0);
        }

        .hover-action {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          background: #fff;
          color: #222;
          border: none;
          border-radius: 50%;
          text-decoration: none;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 3px 10px
            rgba(0, 0, 0, 0.15);
          transition:
            background 0.3s ease,
            color 0.3s ease,
            transform 0.3s ease;
        }

        .hover-action:hover {
          background: #000;
          color: #fff;
          transform: scale(1.08);
        }

        .hover-action i {
          line-height: 1;
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
          transition:
            opacity 0.3s ease,
            visibility 0.3s ease,
            transform 0.3s ease;
        }

        .image-wrapper:hover
          .product-bottom-action {
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
          background: rgba(
            255,
            255,
            255,
            0.75
          );
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(
            8px
          );
          color: #111;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.9
            );
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          cursor: pointer;
          box-shadow:
            0 4px 15px
              rgba(
                0,
                0,
                0,
                0.15
              ),
            inset 0 1px 0
              rgba(
                255,
                255,
                255,
                0.8
              );
          transition:
            background 0.3s ease,
            color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .option-text {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(
            -50%,
            -50%
          );
          opacity: 1;
          visibility: visible;
          white-space: nowrap;
          transition: opacity 0.2s ease;
        }

        .option-hidden {
          opacity: 0;
          visibility: hidden;
        }

        .option-cart {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(
            -50%,
            -50%
          );
          opacity: 0;
          visibility: hidden;
          font-size: 18px;
          transition: opacity 0.2s ease;
          border: none;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .select-option-btn:hover {
          background: rgba(
            0,
            0,
            0,
            0.65
          );
          color: #fff;
          box-shadow:
            0 4px 18px
              rgba(
                0,
                0,
                0,
                0.25
              ),
            inset 0 1px 0
              rgba(
                255,
                255,
                255,
                0.15
              );
        }

        .select-option-btn:hover
          .option-text {
          opacity: 0;
          visibility: hidden;
        }

        .select-option-btn:hover
          .option-cart {
          opacity: 1;
          visibility: visible;
        }

        .disabled-btn {
          background: rgba(
            120,
            120,
            120,
            0.85
          ) !important;
          color: #fff !important;
          cursor: not-allowed !important;
          pointer-events: none;
          border: none !important;
        }

        .premium-content {
          min-height: 90px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px;
          text-align: center;
          box-sizing: border-box;
        }

        .premium-title {
          margin: 5px 0 5px;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.4;
          color: #222;
        }

        .product-price {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 2px;
        }

        .old-price {
          color: #888;
          font-size: 13px;
          text-decoration: line-through;
        }

        .current-price {
          color: #111;
          font-size: 15px;
          font-weight: 700;
        }

        .wishlist-action {
          background: #fff !important;
          color: #000 !important;
        }

        .wishlist-action i {
          color: #000 !important;
        }

        .wishlist-action.wishlist-selected {
          background: #fff !important;
        }

        .wishlist-action.wishlist-selected
          i {
          color: #e53935 !important;
        }

        .wishlist-action:hover {
          background: #000 !important;
        }

        .wishlist-action:hover i {
          color: #e53935 !important;
        }

        .hover-action::after {
          content: attr(title);
          position: absolute;
          right: calc(
            100% + 10px
          );
          top: 50%;
          transform: translateY(
            -50%
          );
          background: #111;
          color: #fff;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          border-radius: 4px;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: all 0.25s ease;
          z-index: 100;
        }

        .hover-action::before {
          content: "";
          position: absolute;
          right: calc(
            100% + 4px
          );
          top: 50%;
          transform: translateY(
            -50%
          );
          border-width: 5px 0 5px 6px;
          border-style: solid;
          border-color:
            transparent
            transparent
            transparent
            #111;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: all 0.25s ease;
          z-index: 100;
        }

        .hover-action:hover::after,
        .hover-action:hover::before {
          opacity: 1;
          visibility: visible;
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
          transform: translateY(
            10px
          );
          transition:
            opacity 0.3s ease,
            transform 0.3s ease,
            visibility 0.3s ease;
          box-sizing: border-box;
        }

        .product-options-panel.active {
          opacity: 1;
          visibility: visible;
          transform: translateY(
            0
          );
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
          transform: translate(
            -50%,
            -50%
          );
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

        .selected-option-price {
          margin-top: 10px;
          color: #1a8f3c;
          font-size: 15px;
          font-weight: 700;
          text-align: center;
        }

        .weight-error {
          margin: 7px 0 0;
          color: #d32f2f;
          font-size: 11px;
          font-weight: 600;
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
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.7px;
          box-sizing: border-box;
          transition:
            background 0.3s ease,
            transform 0.2s ease;
        }

        .weight-add-cart:hover {
          background: #d32f2f;
          color: #fff;
          transform: translateY(
            -1px
          );
        }

        /* =====================================================
           QUICK VIEW
        ===================================================== */

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
          background: rgba(
            0,
            0,
            0,
            0.6
          );
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
          box-shadow: 0 25px 70px
            rgba(0, 0, 0, 0.3);
          animation: quickViewOpen
            0.25s ease;
        }

        @keyframes quickViewOpen {
          from {
            opacity: 0;
            transform: scale(
                0.95
              )
              translateY(15px);
          }

          to {
            opacity: 1;
            transform: scale(1)
              translateY(0);
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
          box-shadow: 0 3px 12px
            rgba(0, 0, 0, 0.15);
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
          transition: 0.2s ease;
        }

        .quick-view-select:hover {
          border-color: #999;
        }

        .quick-view-select:focus {
          border-color: #222;
          box-shadow: 0 0 0 3px
            rgba(
              0,
              0,
              0,
              0.06
            );
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
          transition: 0.2s ease;
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
          transition: 0.2s ease;
        }

        .quick-add-cart:hover {
          background: #333;
          transform: translateY(
            -1px
          );
          box-shadow: 0 7px 18px
            rgba(
              0,
              0,
              0,
              0.18
            );
        }

        .quick-add-cart:disabled {
          background: #999 !important;
          color: #fff !important;
          cursor: not-allowed !important;
          opacity: 1 !important;
          transform: none !important;
          box-shadow: none !important;
        }

        .quick-loading {
          width: 100%;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #555;
          font-size: 18px;
        }

        /* =====================================================
           LARGE DESKTOP
        ===================================================== */

        @media (min-width: 1400px) {
          .premium-section {
            padding: 45px 40px;
          }

          .premium-grid {
            grid-template-columns: repeat(
              5,
              minmax(0, 1fr)
            );
            gap: 25px;
          }

          .nutrition-banner img {
            height: 450px;
          }

          .premium-image {
            height: 320px;
          }

          .quick-view-box {
            width: 950px;
          }

          .quick-view-image img {
            max-width: 420px;
            height: 420px;
          }
        }

        /* =====================================================
           LAPTOP
        ===================================================== */

        @media (min-width: 1025px) and (max-width: 1399px) {
          .premium-section {
            padding: 35px 25px;
          }

          .premium-grid {
            grid-template-columns: repeat(
              4,
              minmax(0, 1fr)
            );
            gap: 20px;
          }

          .premium-image {
            height: 280px;
          }

          .nutrition-banner img {
            height: 380px;
          }

          .premium-main-title {
            font-size: 32px;
          }
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1024px) {
          .category-row {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            );
          }

          .premium-grid {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            );
          }

          .hero-banner {
            height: 300px;
            margin-top: 80px;
          }

          .banner-slider img {
            height: 300px;
          }

          .premium-image {
            height: 260px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {
          .hero-banner {
            height: 230px;
            margin-top: 36px;
          }

          .banner-slider img {
            width: 100%;
            height: 300px;
            object-fit: contain;
            object-position: center;
          }

          .slider-btn {
            width: 42px;
            height: 42px;
            font-size: 18px;
            margin-top: 25px;
          }

          .category-section {
            padding: 25px 15px;
          }

          .section-title {
            font-size: 30px;
            margin-bottom: 25px;
          }

          .category-row {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
            gap: 15px;
          }

          .category-card {
            height: 250px;
          }

          .category-img {
            height: 190px;
          }

          .premium-section {
            padding: 25px 15px;
          }

          .premium-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
            gap: 15px;
          }

          .premium-main-title {
            font-size: 28px;
          }

          .premium-image {
            height: 230px;
          }

          .nutrition-banner img {
            width: 100%;
            height: 165px;
            object-fit: contain;
            object-position: center;
          }

          .quick-view-box {
            width: 94%;
            max-width: 620px;
            max-height: 90vh;
            overflow-y: auto;
          }

          .quick-view-content {
            flex-direction: column;
            min-height: auto;
          }

          .quick-view-image {
            width: 100%;
            height: 280px;
            min-height: 280px;
          }

          .quick-view-image img {
            max-width: 280px;
            height: 240px;
          }

          .quick-view-details {
            width: 100%;
            padding: 30px 25px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 480px) {
          .hero-banner {
            height: 150px;
            margin-top: 65px;
          }

          .banner-slider img {
            height: 150px;
          }

          .slider-btn {
            width: 34px;
            height: 34px;
            font-size: 14px;
          }

          .prev-btn {
            left: 7px;
          }

          .next-btn {
            right: 7px;
          }

          .category-section {
            padding: 20px 10px;
          }

          .section-title {
            font-size: 24px;
            margin-bottom: 20px;
          }

          .category-row {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
            gap: 10px;
          }

          .category-card {
            height: 190px;
            border-radius: 8px;
          }

          .category-img {
            height: 140px;
          }

          .category-title {
            font-size: 13px;
          }

          .premium-section {
            padding: 20px 10px;
          }

          .premium-header {
            margin-bottom: 18px;
            gap: 10px;
          }

          .premium-main-title {
            font-size: 21px;
            line-height: 1.3;
          }

          .premium-view-btn {
            padding: 7px 11px;
            font-size: 11px;
            white-space: nowrap;
          }

          .premium-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
            gap: 10px;
          }

          .premium-card {
            border-radius: 7px;
          }

          .premium-image {
            height: 190px;
          }

          .premium-content {
            min-height: 70px;
            height: auto;
            padding: 7px 5px;
          }

          .premium-title {
            font-size: 13px;
            line-height: 1.3;
          }

          .product-price {
            gap: 5px;
          }

          .old-price {
            font-size: 11px;
          }

          .current-price {
            font-size: 13px;
          }

          .nutrition-banner {
            margin: 12px 0;
          }

          .nutrition-banner img {
            height: 170px;
          }

          .sale-badge {
            top: 8px;
            padding: 5px 8px;
            font-size: 9px;
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

          .product-bottom-action {
            left: 8px;
            right: 8px;
            bottom: 5px;
          }

          .select-option-btn {
            height: 38px;
            font-size: 9px;
          }

          .option-cart {
            font-size: 15px;
          }

          .quick-view-modal {
            padding: 8px;
          }

          .quick-view-box {
            width: 100%;
            max-width: 100%;
            max-height: 94vh;
            border-radius: 9px;
            overflow-y: auto;
          }

          .quick-view-image {
            height: 210px;
            min-height: 210px;
            padding: 12px;
          }

          .quick-view-image img {
            max-width: 220px;
            height: 185px;
          }

          .quick-view-details {
            padding: 22px 16px 18px;
          }

          .quick-view-details h2 {
            margin: 0 35px 10px 0;
            font-size: 18px;
          }

          .quick-view-price {
            font-size: 18px;
            margin-bottom: 13px;
          }

          .quick-view-description {
            font-size: 12px;
            line-height: 1.6;
            max-height: 75px;
            overflow-y: auto;
          }

          .quick-view-select {
            height: 42px;
          }

          .quick-quantity {
            height: 42px;
          }

          .quick-quantity button {
            width: 40px;
            height: 42px;
          }

          .quick-quantity span {
            width: 48px;
            height: 42px;
          }

          .quick-add-cart {
            height: 45px;
            font-size: 11px;
          }

          .quick-view-close {
            top: 7px;
            right: 7px;
            width: 32px;
            height: 32px;
            font-size: 21px;
          }
        }

        /* =====================================================
           EXTRA SMALL
        ===================================================== */

        @media (max-width: 359px) {
          .premium-grid,
          .product-row,
          .category-row {
            grid-template-columns: 1fr;
          }

          .premium-image {
            height: 250px;
          }

          .category-card {
            height: auto;
          }

          .category-img {
            height: 200px;
          }
        }

        /* =====================================================
           TOUCH DEVICES
        ===================================================== */

        @media (hover: none) and (pointer: coarse) {
          .premium-card:hover,
          .category-card:hover {
            transform: none;
          }

          .product-hover-actions {
            opacity: 1;
            visibility: visible;
            transform: translateX(0);
          }

          .product-bottom-action {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }

          .hover-action:hover {
            transform: none;
          }

          .select-option-btn:hover {
            background: rgba(
              255,
              255,
              255,
              0.75
            );
            color: #111;
          }

          .select-option-btn:hover
            .option-text {
            opacity: 1;
            visibility: visible;
          }

          .select-option-btn:hover
            .option-cart {
            opacity: 0;
            visibility: hidden;
          }
        }
      `}</style>
    </>
  );
}