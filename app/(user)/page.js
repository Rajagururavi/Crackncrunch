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
  const [selectedOptionsProduct, setSelectedOptionsProduct] = useState(null);
  const [selectedWeights, setSelectedWeights] = useState({});
  const [wishlistIds, setWishlistIds] = useState([]);
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
          setCategories(Array.isArray(data.categories) ? data.categories : []);
          setBrands(Array.isArray(data.brands) ? data.brands : []);
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
    return () => {cancelled = true;};
  }, []);
  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentSlide((prev) => prev >= banners.length - 1 ? 0 : prev + 1);
    }, 5000);
    return () => {
      clearInterval(timer);
    };
  }, [banners.length]);
  const nextSlide = () => {
    setCurrentSlide((prev) => prev >= banners.length - 1 ? 0 : prev + 1);
  };
  const prevSlide = () => {setCurrentSlide((prev) => prev <= 0 ? banners.length - 1 : prev - 1);};
  const getImage = (image, folder = "") => {
    if (!image) {
      return "";
    }
    if (image.startsWith("data:")) {
      return image;
    }
    if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("/")) {
      return image;
    }
    if (folder) {
      return `/uploads/${folder}/${image}`;
    }
    return image;
  };
  const getProductId = (product) => {return product?._id || product?.id || "";};
  const getProductSlug = (product) => {
    const productName = product?.productName || product?.product_name || product?.product_title || product?.name || product?.title || "";
    return String(productName).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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
    const originalPrice = getProductOriginalPrice(product);
    const offerPrice = getProductOfferPrice(product);
    if (offerPrice > 0 && offerPrice < originalPrice) {
      return offerPrice;
    }
    return originalPrice;
  };
  const getProductImage1 = (product) => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return getImage(product.images[0], "products");
    }
    return "";
  };
  const getProductImage2 = (product) => {
    if (Array.isArray(product?.images) && product.images.length > 1) {
      return getImage(product.images[1], "products");
    }
    return "";
  };
  const getProductImage3 = (product) => {
    if (Array.isArray(product?.images) && product.images.length > 2) {
      return getImage(product.images[2], "products");
    }
    return getProductImage1(product);
  };
  const isProductActive = (product) => {
    const status = String(product?.stockStatus || "").trim().toLowerCase();
    return (status === "currently available" || status === "available" || status === "in stock");
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
    const basePrice = getProductPrice(product);
    return basePrice * getWeightMultiplier(weight);
  };
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
  const handleWeightChange = (productId, weight) => {
    setSelectedWeights((prev) => ({
      ...prev,
      [productId]: weight,
    }));
  };
  const addToCart = (product) => {
    const productId = getProductId(product);
    const weight = selectedWeights[productId];
    if (!weight) {
      alert("Please select a weight.");
      return;
    }
    const price = getWeightPrice(product, weight);
    const cartItem = {
      product_id: productId,
      product_title: getProductTitle(product),
      product_image: getProductImage1(product),
      weight,
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
      const existingIndex = cart.findIndex((item) => String(item.product_id) === String(productId) && item.weight === weight);
      if (existingIndex !== -1) {
        cart[existingIndex].quantity = Number(cart[existingIndex].quantity || 0) + 1;
        cart[existingIndex].final_price = Number(price) * Number(cart[existingIndex].quantity);
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
const openQuickView = async (product) => {
  const productId = getProductId(product);

  setQuickViewOpen(true);
  setQuickLoading(true);
  setQuickProduct(null);
  setQuickQuantity(1);
  setQuickWeight("");

  try {
    if (!productId) {
      throw new Error("Product ID is missing");
    }

    const response = await fetch("/api/products", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Products API failed: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data?.success || !Array.isArray(data.products)) {
      throw new Error("Invalid products API response");
    }

    const selectedProduct = data.products.find(
      (item) =>
        String(getProductId(item)) === String(productId)
    );

    if (!selectedProduct) {
      throw new Error(
        `Product not found. ID: ${productId}`
      );
    }

    setQuickProduct(selectedProduct);
  } catch (error) {
    console.error("Quick View Error:", error);
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
  href={`/product/${encodeURIComponent(getProductSlug(product))}`}
  className="product-image-link"
  onClick={(event) => {
    if (!getProductSlug(product)) {
      event.preventDefault();
    }
  }}
>
  {image1 && (
    <img
      src={image1}
      className="premium-image image1"
      alt={title || "Product image"}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  )}

  {image2 && image2 !== image1 && (
    <img
      src={image2}
      className="premium-image image2"
      alt={title || "Product image"}
      onError={(event) => {
        event.currentTarget.style.display = "none";
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
                  <span>{quickQuantity}</span>
                  <button type="button" onClick={() => changeQuickQuantity(1)}>+</button>
                </div>
                <button type="button" className="quick-add-cart" disabled={!isProductActive(quickProduct)}onClick={addQuickViewToCart}>
                  <i className="fa fa-shopping-cart"></i>
                  {isProductActive(quickProduct) ? "ADD TO CART" : "CURRENTLY UNAVAILABLE"}
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
      
<style jsx global>{`
  /* =====================================
     GLOBAL
  ===================================== */

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  body {
    background: #f3f3f3;
    font-family: "Poppins", sans-serif;
  }

  img {
    max-width: 100%;
  }

  /* =====================================
     HERO BANNER
  ===================================== */

  .hero-banner {
    position: relative;
    width: 100%;
    height: 500px;
    margin-top: 145px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }

  .banner-slider {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform 1s ease-in-out;
  }

  .banner-slider img {
    display: block;
    flex: 0 0 100%;
    width: 100%;
    min-width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .slider-btn {
    position: absolute;
    top: 50%;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
    font-size: 22px;
    cursor: pointer;
    transform: translateY(-50%);
    transition: background 0.3s ease;
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

  /* =====================================
     CATEGORY SECTION
  ===================================== */

  .category-section {
    width: 100%;
    padding: 40px 20px;
  }

  .section-title {
    margin: 0 0 40px;
    color: #222;
    font-size: 38px;
    font-weight: 700;
    line-height: 1.3;
    text-align: center;
    overflow-wrap: anywhere;
  }

  .category-row {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 20px;
    width: 100%;
  }

  .category-column {
    width: 100%;
    min-width: 0;
  }

  .category-card {
    width: 100%;
    height: auto;
    overflow: hidden;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 5px 18px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .category-img {
    display: block;
    width: 100%;
    height: 220px;
    object-fit: cover;
  }

  .category-content {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;
    padding: 10px;
    background: #fff;
    text-align: center;
  }

  .category-title {
    margin: 0;
    color: #222;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .no-product-msg {
    width: 100%;
    padding: 50px 20px;
    border-radius: 15px;
    background: #fff;
    color: #777;
    font-size: 22px;
    font-weight: 600;
    text-align: center;
  }

  /* =====================================
     NUTRITION BANNER
  ===================================== */

  .nutrition-banner {
    width: 100%;
    margin: 20px 0;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  }

  .nutrition-banner img {
    display: block;
    width: 100%;
    height: 450px;
    object-fit: cover;
    object-position: center;
    transition: transform 0.5s ease;
  }

  /* =====================================
     PREMIUM PRODUCTS
  ===================================== */

  .premium-section {
    width: 100%;
    padding: 40px 20px;
  }

  .premium-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 25px;
  }

  .premium-main-title {
    min-width: 0;
    margin: 0;
    color: #222;
    font-size: 38px;
    font-weight: 700;
    line-height: 1.3;
    overflow-wrap: anywhere;
  }

  .premium-view-btn {
    flex-shrink: 0;
    padding: 10px 20px;
    border-radius: 6px;
    background: #000;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
  }

  .premium-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 20px;
    width: 100%;
  }

  .premium-column {
    position: relative;
    min-width: 0;
  }

  .premium-card {
    position: relative;
    width: 100%;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 5px 18px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  /* =====================================
     PRODUCT IMAGE
  ===================================== */

  .image-wrapper {
    position: relative;
    isolation: isolate;
    width: 100%;
    aspect-ratio: 4 / 5;
    overflow: hidden;
    background: #fff;
  }

  .image-wrapper > a {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
  }

  .premium-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.3s ease;
  }

  .image1 {
    position: relative;
    z-index: 1;
  }

  .image2 {
    position: absolute;
    inset: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .sale-badge {
    position: absolute;
    top: 12px;
    left: 0;
    z-index: 5;
    padding: 6px 12px;
    background: #000;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
  }

  .sale {
    background: #28a745;
  }

  .unavailable {
    background: #dc3545;
  }

  /* =====================================
     WISHLIST / QUICK VIEW / COMPARE
  ===================================== */

  .product-hover-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 40;
    display: flex;
    flex-direction: column;
    gap: 8px;
    opacity: 0;
    visibility: hidden;
    transform: translateX(15px);
    transition: opacity 0.3s ease, visibility 0.3s ease,
      transform 0.3s ease;
  }

  .hover-action {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: #fff;
    color: #222;
    font-size: 16px;
    text-decoration: none;
    cursor: pointer;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
    transition: background 0.2s ease, color 0.2s ease;
  }

  .hover-action i {
    line-height: 1;
  }

  .wishlist-action {
    background: #fff !important;
    color: #000 !important;
  }

  .wishlist-action i {
    color: #000 !important;
  }

  .wishlist-action.wishlist-selected i {
    color: #e53935 !important;
  }

  .wishlist-action:hover i {
    color: #e53935 !important;
  }

  /* Tooltip for desktop */

  .hover-action::after {
    content: attr(title);
    position: absolute;
    top: 50%;
    right: calc(100% + 10px);
    z-index: 100;
    padding: 7px 10px;
    border-radius: 4px;
    background: #111;
    color: #fff;
    font-size: 11px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(-50%);
    transition: opacity 0.2s ease;
  }

  .hover-action:hover::after {
    opacity: 1;
    visibility: visible;
  }

  /* =====================================
     SELECT OPTION BUTTON
  ===================================== */

  .product-bottom-action {
    position: absolute;
    right: 15px;
    bottom: 5px;
    left: 15px;
    z-index: 40;
    opacity: 0;
    visibility: hidden;
    transform: translateY(15px);
    transition: opacity 0.3s ease, visibility 0.3s ease,
      transform 0.3s ease;
  }

  .select-option-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 44px;
    padding: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.75);
    color: #111;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-decoration: none;
    cursor: pointer;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .option-text {
    position: absolute;
    top: 50%;
    left: 50%;
    white-space: nowrap;
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, -50%);
    transition: opacity 0.2s ease;
  }

  .option-hidden {
    opacity: 0;
    visibility: hidden;
  }

  .option-cart {
    position: absolute;
    top: 50%;
    left: 50%;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 18px;
    opacity: 0;
    visibility: hidden;
    transform: translate(-50%, -50%);
    cursor: pointer;
  }

  .disabled-btn {
    border: none !important;
    background: rgba(120, 120, 120, 0.85) !important;
    color: #fff !important;
    cursor: not-allowed !important;
    pointer-events: none;
  }

  /* =====================================
     MOBILE CART BUTTON
     JSX must include .mobile-cart-action
  ===================================== */

  .mobile-cart-action {
    display: none;
  }

  /* =====================================
     PRODUCT DETAILS / PRICE
  ===================================== */

  .premium-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 90px;
    padding: 10px;
    text-align: center;
  }

  .premium-title {
    margin: 5px 0;
    color: #222;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  .product-price {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px 8px;
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

  /* =====================================
     PRODUCT OPTIONS PANEL
  ===================================== */

  .product-options-panel {
    position: absolute;
    inset: 0;
    z-index: 200;
    width: 100%;
    height: 100%;
    padding: 50px 25px 25px;
    background: #fff;
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease,
      visibility 0.3s ease;
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
    z-index: 10;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: #111;
    color: #fff;
    font-size: 21px;
    cursor: pointer;
  }

  .product-options-inner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    padding: 25px;
    transform: translate(-50%, -50%);
  }

  .product-options-inner label {
    display: block;
    margin-bottom: 8px;
    color: #222;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .product-option-select,
  .quick-view-select {
    width: 100%;
    height: 44px;
    padding: 0 12px;
    border: 1px solid #ddd;
    background: #fff;
    color: #222;
    font-size: 13px;
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    min-height: 42px;
    margin-top: 12px;
    border: none;
    background: #111;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
  }

  /* =====================================
     QUICK VIEW MODAL
  ===================================== */

  .quick-view-modal {
    position: fixed;
    inset: 0;
    z-index: 999999;
    display: none;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 20px;
    background: rgba(0, 0, 0, 0.6);
  }

  .quick-view-modal.active {
    display: flex;
  }

  .quick-view-box {
    position: relative;
    display: flex;
    width: 900px;
    max-width: 95%;
    max-height: 90vh;
    overflow: hidden;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.3);
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
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: #fff;
    color: #222;
    font-size: 25px;
    cursor: pointer;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
  }

  .quick-view-content {
    display: flex;
    width: 100%;
    min-height: 0;
  }

  .quick-view-image,
  .quick-view-details {
    width: 50%;
    min-width: 0;
  }

  .quick-view-image {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 35px;
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
    padding: 45px 40px 35px;
    overflow-y: auto;
  }

  .quick-view-details h2 {
    margin: 0 45px 14px 0;
    color: #171717;
    font-size: 27px;
    font-weight: 700;
    line-height: 1.35;
    overflow-wrap: anywhere;
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
  }

  .quick-view-select {
    height: 48px;
    margin-bottom: 22px;
    border-radius: 7px;
    font-size: 14px;
  }

  .quick-quantity {
    display: flex;
    align-items: center;
    width: fit-content;
    height: 46px;
    margin-bottom: 25px;
    overflow: hidden;
    border: 1px solid #dcdcdc;
    border-radius: 7px;
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
    cursor: pointer;
  }

  .quick-quantity span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 55px;
    height: 46px;
    border-right: 1px solid #dcdcdc;
    border-left: 1px solid #dcdcdc;
    color: #222;
    font-size: 15px;
    font-weight: 600;
  }

  .quick-add-cart {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    width: 100%;
    min-height: 50px;
    padding: 0 20px;
    border: none;
    border-radius: 7px;
    background: #111;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .quick-add-cart:disabled {
    background: #999 !important;
    color: #fff !important;
    cursor: not-allowed !important;
  }

  .quick-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 400px;
    color: #555;
    font-size: 18px;
  }

  /* =====================================
     DESKTOP HOVER
  ===================================== */

  @media (hover: hover) and (pointer: fine) {
    .category-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    .premium-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    .image-wrapper:hover .image2 {
      opacity: 1;
    }

    .image-wrapper:hover .image1 {
      opacity: 0;
    }

    .image-wrapper:hover .product-hover-actions {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
    }

    .image-wrapper:hover .product-bottom-action {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .hover-action:hover {
      background: #000;
      color: #fff;
    }

    .select-option-btn:hover {
      background: rgba(0, 0, 0, 0.65);
      color: #fff;
    }

    .select-option-btn:hover .option-text {
      opacity: 0;
      visibility: hidden;
    }

    .select-option-btn:hover .option-cart {
      opacity: 1;
      visibility: visible;
    }

    .weight-add-cart:hover {
      background: #d32f2f;
    }

    .quick-add-cart:hover {
      background: #333;
    }
  }

  /* =====================================
     LAPTOP
  ===================================== */

  @media (min-width: 1025px) and (max-width: 1399px) {
    .hero-banner {
      height: 400px;
    }

    .category-row {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .premium-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    .category-section,
    .premium-section {
      padding-right: 25px;
      padding-left: 25px;
    }
  }

  /* =====================================
     TABLET
  ===================================== */

  @media (min-width: 769px) and (max-width: 1024px) {
    .hero-banner {
      height: clamp(240px, 35vw, 360px);
      margin-top: 80px;
    }

    .category-row,
    .premium-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .category-img {
      height: clamp(150px, 22vw, 220px);
    }

    .premium-main-title {
      font-size: 30px;
    }

    .product-hover-actions,
    .product-bottom-action {
      opacity: 1;
      visibility: visible;
      transform: none;
    }
  }

  /* =====================================
     MOBILE: 768px AND BELOW
  ===================================== */

  @media (max-width: 768px) {
    .hero-banner {
      height: clamp(170px, 40vw, 280px);
      margin-top: 55px;
    }

    .slider-btn {
      width: 34px;
      height: 34px;
      font-size: 16px;
    }

    .prev-btn {
      left: 8px;
    }

    .next-btn {
      right: 8px;
    }

    .category-section,
    .premium-section {
      padding: 24px 14px;
    }

    .section-title {
      margin-bottom: 22px;
      font-size: clamp(23px, 5vw, 30px);
    }

    .category-row,
    .premium-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .category-img {
      height: clamp(120px, 32vw, 210px);
    }

    .category-content {
      min-height: 54px;
      padding: 8px 5px;
    }

    .category-title {
      font-size: clamp(12px, 3vw, 15px);
    }

    .premium-header {
      align-items: center;
      gap: 10px;
      margin-bottom: 18px;
    }

    .premium-main-title {
      font-size: clamp(21px, 4.5vw, 29px);
    }

    .premium-view-btn {
      padding: 8px 11px;
      font-size: 12px;
    }

    .premium-content {
      min-height: 76px;
      padding: 8px 5px;
    }

    .premium-title {
      font-size: clamp(12px, 3vw, 14px);
    }

    .current-price {
      font-size: 14px;
    }

    /* Always display the action container on mobile */

    .product-hover-actions {
      top: 8px !important;
      right: 8px !important;
      left: auto !important;
      z-index: 50 !important;
      display: flex !important;
      opacity: 1 !important;
      visibility: visible !important;
      transform: none !important;
    }

    /* Hide Quick View and Compare; retain Wishlist */

    .product-hover-actions .hover-action {
      display: none !important;
    }

    .product-hover-actions .wishlist-action {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 36px !important;
      height: 36px !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 50% !important;
      background: #fff !important;
      color: #e53935 !important;
      opacity: 1 !important;
      visibility: visible !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .product-hover-actions .wishlist-action i {
      color: #e53935 !important;
    }

    /* Hide Select Option on mobile */

    .product-bottom-action,
    .product-options-panel {
      display: none !important;
    }

    /* Cart icon at bottom-left.
       Button must exist in product JSX. */

    .image-wrapper .mobile-cart-action {
      position: absolute !important;
      top: auto !important;
      right: auto !important;
      bottom: 8px !important;
      left: 8px !important;
      z-index: 60 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 36px !important;
      height: 36px !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 50% !important;
      background: #fff !important;
      color: #111 !important;
      font-size: 15px !important;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    }

    .image-wrapper .mobile-cart-action i {
      color: #111 !important;
    }

    /* No image hover swap on touch devices */

    .image-wrapper:hover .image1 {
      opacity: 1;
    }

    .image-wrapper:hover .image2 {
      opacity: 0;
    }

    .nutrition-banner img {
      height: clamp(150px, 35vw, 260px);
    }

    /* Responsive quick-view modal */

    .quick-view-modal {
      padding: 10px;
      overflow-y: auto;
    }

    .quick-view-box {
      display: block;
      width: 100%;
      max-width: 500px;
      max-height: calc(100vh - 20px);
      max-height: calc(100dvh - 20px);
      overflow-y: auto;
    }

    .quick-view-content {
      flex-direction: column;
    }

    .quick-view-image,
    .quick-view-details {
      width: 100%;
    }

    .quick-view-image {
      height: clamp(180px, 48vw, 260px);
      padding: 15px;
    }

    .quick-view-image img {
      width: 100%;
      height: 100%;
      max-width: 250px;
    }

    .quick-view-details {
      padding: 22px 18px;
      overflow: visible;
    }

    .quick-view-details h2 {
      font-size: 22px;
    }

    .quick-view-price {
      font-size: 20px;
    }

    .quick-loading {
      min-height: 200px;
    }
  }

  /* =====================================
     SMALL MOBILE
  ===================================== */

  @media (max-width: 480px) {
    .hero-banner {
      height: clamp(145px, 42vw, 200px);
      margin-top: 55px;
    }

    .category-section,
    .premium-section {
      padding: 20px 10px;
    }

    .category-row,
    .premium-grid {
      gap: 9px;
    }

    .category-img {
      height: clamp(105px, 34vw, 160px);
    }

    .category-title {
      font-size: 12px;
    }

    .premium-main-title {
      font-size: 21px;
    }

    .premium-view-btn {
      padding: 7px 9px;
      font-size: 11px;
    }

    .premium-content {
      min-height: 68px;
      padding: 7px 4px;
    }

    .premium-title {
      font-size: 12px;
    }

    .product-hover-actions {
      top: 6px !important;
      right: 6px !important;
    }

    .product-hover-actions .wishlist-action,
    .image-wrapper .mobile-cart-action {
      width: 32px !important;
      height: 32px !important;
      font-size: 13px !important;
    }

    .nutrition-banner img {
      height: 150px;
    }

    .quick-view-modal {
      padding: 6px;
    }

    .quick-view-box {
      max-height: calc(100vh - 12px);
      max-height: calc(100dvh - 12px);
    }

    .quick-view-image {
      height: 175px;
    }

    .quick-view-details {
      padding: 20px 14px;
    }
  }

  /* =====================================
     EXTRA SMALL MOBILE
  ===================================== */

  @media (max-width: 359px) {
    .hero-banner {
      height: 140px;
      margin-top: 50px;
    }

    .category-section,
    .premium-section {
      padding-right: 8px;
      padding-left: 8px;
    }

    .category-row,
    .premium-grid {
      gap: 7px;
    }

    .category-img {
      height: 105px;
    }

    .premium-main-title {
      font-size: 18px;
    }

    .premium-view-btn {
      padding: 6px 7px;
      font-size: 10px;
    }

    .category-title,
    .premium-title {
      font-size: 11px;
    }

    .current-price {
      font-size: 12px;
    }

    .product-hover-actions .wishlist-action,
    .image-wrapper .mobile-cart-action {
      width: 29px !important;
      height: 29px !important;
    }
  }

  /* Hide mobile-only cart on tablet and desktop */

  @media (min-width: 769px) {
    .mobile-cart-action {
      display: none !important;
    }
  }
`}</style>
    </>
  );
}