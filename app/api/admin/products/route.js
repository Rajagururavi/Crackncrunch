"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedWeight, setSelectedWeight] = useState("");
  const [quantity, setQuantity] = useState(1);

  /*
   * Convert productName to URL slug
   *
   * California Almond
   * ->
   * california-almond
   */
  const createSlug = (name) => {
    return (
      name
        ?.toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || ""
    );
  };

  /*
   * Get product name safely
   */
  const getProductName = (item) => {
    return (
      item?.productName ||
      item?.name ||
      ""
    );
  };

  /*
   * Load product
   */
  useEffect(() => {
    if (!slug) {
      return;
    }

    let cancelled = false;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * IMPORTANT:
         * This fetch runs in the browser because this is
         * a client component.
         */
        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        const products = Array.isArray(data?.products)
          ? data.products
          : [];

        const foundProduct = products.find((item) => {
          const productName = getProductName(item);
          const itemSlug = createSlug(productName);

          return itemSlug === slug;
        });

        if (!foundProduct) {
          throw new Error("Product not found");
        }

        if (cancelled) {
          return;
        }

        console.log("FOUND PRODUCT:", foundProduct);
        console.log(
          "DESCRIPTION:",
          foundProduct.description
        );
        console.log(
          "PRODUCT DESCRIPTION:",
          foundProduct.productDescription
        );
        console.log(
          "PRODUCT DESCRIPTION OLD:",
          foundProduct.product_description
        );

        setProduct(foundProduct);

        /*
         * Set first available weight
         */
        const weights = getWeightOptions(foundProduct);

        if (weights.length > 0) {
          setSelectedWeight(weights[0]);
        }
      } catch (err) {
        console.error("PRODUCT LOAD ERROR:", err);

        if (!cancelled) {
          setError(
            err?.message || "Failed to load product"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /*
   * Get weight options
   */
  const getWeightOptions = (item) => {
    if (!item) {
      return [];
    }

    /*
     * If product has an array of weights/options
     */
    if (Array.isArray(item.weights)) {
      return item.weights
        .map((weight) => {
          if (typeof weight === "string") {
            return weight;
          }

          return (
            weight?.label ||
            weight?.weight ||
            weight?.name ||
            ""
          );
        })
        .filter(Boolean);
    }

    if (Array.isArray(item.weightOptions)) {
      return item.weightOptions
        .map((weight) => {
          if (typeof weight === "string") {
            return weight;
          }

          return (
            weight?.label ||
            weight?.weight ||
            weight?.name ||
            ""
          );
        })
        .filter(Boolean);
    }

    if (Array.isArray(item.options)) {
      return item.options
        .map((option) => {
          if (typeof option === "string") {
            return option;
          }

          return (
            option?.label ||
            option?.weight ||
            option?.name ||
            ""
          );
        })
        .filter(Boolean);
    }

    /*
     * Single weight fields
     */
    const singleWeight =
      item.weight ||
      item.productWeight ||
      item.product_weight;

    if (singleWeight) {
      return [String(singleWeight)];
    }

    /*
     * Default
     */
    return ["250g"];
  };

  /*
   * Product description
   */
  const description = useMemo(() => {
    if (!product) {
      return "";
    }

    return (
      product.description ??
      product.productDescription ??
      product.product_description ??
      product.product_description_html ??
      ""
    );
  }, [product]);

  /*
   * Product images
   */
  const images = useMemo(() => {
    if (!product) {
      return [];
    }

    if (Array.isArray(product.images)) {
      return product.images.filter(Boolean);
    }

    if (product.image) {
      return [product.image];
    }

    return [];
  }, [product]);

  /*
   * Main image
   */
  const mainImage = images[0] || "";

  /*
   * Price
   */
  const price = Number(product?.price || 0);

  const offerPrice =
    Number(product?.offerPrice || 0);

  const finalPrice =
    offerPrice > 0
      ? offerPrice
      : price;

  /*
   * Quantity handlers
   */
  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  /*
   * Add to cart
   */
  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    const cartItem = {
      ...product,
      selectedWeight,
      quantity,
      cartPrice: finalPrice,
    };

    try {
      const existingCart =
        JSON.parse(
          localStorage.getItem("cart") || "[]"
        );

      const existingIndex =
        existingCart.findIndex(
          (item) =>
            item._id === product._id &&
            item.selectedWeight ===
              selectedWeight
        );

      if (existingIndex !== -1) {
        existingCart[existingIndex].quantity +=
          quantity;
      } else {
        existingCart.push(cartItem);
      }

      localStorage.setItem(
        "cart",
        JSON.stringify(existingCart)
      );

      alert("Product added to cart!");
    } catch (err) {
      console.error(
        "ADD TO CART ERROR:",
        err
      );
    }
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <>
        <style jsx>{`
          .loading {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            color: #555;
          }
        `}</style>

        <div className="loading">
          Loading product...
        </div>
      </>
    );
  }

  /*
   * Error
   */
  if (error || !product) {
    return (
      <>
        <style jsx>{`
          .error-page {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px;
            text-align: center;
          }

          .error-page h2 {
            margin: 0 0 10px;
            color: #222;
          }

          .error-page p {
            margin: 0;
            color: #777;
          }
        `}</style>

        <div className="error-page">
          <h2>Product Not Found</h2>
          <p>
            {error ||
              "Unable to load this product."}
          </p>
        </div>
      </>
    );
  }

  const productName =
    getProductName(product);

  const stockStatus =
    product.stockStatus ||
    "Currently Available";

  const isAvailable =
    stockStatus
      .toLowerCase()
      .includes("available");

  const weightOptions =
    getWeightOptions(product);

  return (
    <>
      <style jsx>{`
        .product-page {
          width: 100%;
          padding: 50px 20px;
          background: #fff;
        }

        .product-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: start;
        }

        .image-section {
          width: 100%;
        }

        .main-image-wrapper {
          width: 100%;
          height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 10px;
          overflow: hidden;
        }

        .main-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 20px;
        }

        .no-image {
          color: #999;
          font-size: 15px;
        }

        .details-section {
          padding-top: 10px;
        }

        .category {
          margin-bottom: 10px;
          color: #888;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .product-title {
          margin: 0 0 15px;
          font-size: 34px;
          line-height: 1.2;
          font-weight: 700;
          color: #222;
        }

        .brand {
          margin-bottom: 20px;
          font-size: 15px;
          color: #666;
        }

        .price-area {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 25px;
        }

        .offer-price {
          font-size: 28px;
          font-weight: 700;
          color: #222;
        }

        .old-price {
          font-size: 18px;
          color: #999;
          text-decoration: line-through;
        }

        .weight-title {
          margin-bottom: 10px;
          font-size: 15px;
          font-weight: 600;
          color: #222;
        }

        .weight-options {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 25px;
        }

        .weight-button {
          min-width: 80px;
          padding: 11px 18px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: #fff;
          color: #333;
          cursor: pointer;
          font-size: 14px;
          transition: 0.2s;
        }

        .weight-button:hover {
          border-color: #222;
        }

        .weight-button.active {
          background: #222;
          color: #fff;
          border-color: #222;
        }

        .quantity-title {
          margin-bottom: 10px;
          font-size: 15px;
          font-weight: 600;
          color: #222;
        }

        .quantity-box {
          width: 130px;
          height: 44px;
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 25px;
        }

        .quantity-button {
          width: 40px;
          height: 100%;
          border: none;
          background: #f5f5f5;
          color: #222;
          cursor: pointer;
          font-size: 18px;
        }

        .quantity-value {
          flex: 1;
          text-align: center;
          font-size: 15px;
          font-weight: 600;
        }

        .stock {
          margin-bottom: 20px;
          font-size: 14px;
        }

        .stock.available {
          color: #16833b;
        }

        .stock.unavailable {
          color: #d32f2f;
        }

        .add-cart-button {
          width: 100%;
          max-width: 400px;
          height: 50px;
          border: none;
          border-radius: 6px;
          background: #222;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .add-cart-button:hover {
          background: #000;
        }

        .add-cart-button:disabled {
          background: #aaa;
          cursor: not-allowed;
        }

        .description-section {
          margin-top: 60px;
          padding-top: 40px;
          border-top: 1px solid #eee;
        }

        .description-title {
          margin: 0 0 20px;
          font-size: 24px;
          font-weight: 700;
          color: #222;
        }

        .description {
          font-size: 16px;
          line-height: 1.8;
          color: #555;
          margin-top: 25px;
          text-align: justify;
        }

        .description :global(p) {
          margin-top: 0;
          margin-bottom: 10px;
        }

        .description :global(ul),
        .description :global(ol) {
          padding-left: 25px;
        }

        @media (max-width: 800px) {
          .product-layout {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .main-image-wrapper {
            height: 400px;
          }

          .product-title {
            font-size: 28px;
          }
        }

        @media (max-width: 500px) {
          .product-page {
            padding: 30px 15px;
          }

          .main-image-wrapper {
            height: 330px;
          }

          .product-title {
            font-size: 25px;
          }

          .offer-price {
            font-size: 24px;
          }
        }
      `}</style>

      <main className="product-page">
        <div className="product-container">

          <div className="product-layout">

            {/* IMAGE */}
            <div className="image-section">
              <div className="main-image-wrapper">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={productName}
                    className="main-image"
                  />
                ) : (
                  <div className="no-image">
                    No image available
                  </div>
                )}
              </div>
            </div>

            {/* DETAILS */}
            <div className="details-section">

              {product.category && (
                <div className="category">
                  {product.category}
                </div>
              )}

              <h1 className="product-title">
                {productName}
              </h1>

              {product.brand && (
                <div className="brand">
                  Brand: {product.brand}
                </div>
              )}

              <div className="price-area">
                <span className="offer-price">
                  ₹{finalPrice}
                </span>

                {offerPrice > 0 &&
                  price > offerPrice && (
                    <span className="old-price">
                      ₹{price}
                    </span>
                  )}
              </div>

              {/* WEIGHT */}
              {weightOptions.length > 0 && (
                <>
                  <div className="weight-title">
                    Select Weight
                  </div>

                  <div className="weight-options">
                    {weightOptions.map(
                      (weight, index) => (
                        <button
                          key={`${weight}-${index}`}
                          type="button"
                          className={`weight-button ${
                            selectedWeight ===
                            weight
                              ? "active"
                              : ""
                          }`}
                          onClick={() =>
                            setSelectedWeight(weight)
                          }
                        >
                          {weight}
                        </button>
                      )
                    )}
                  </div>
                </>
              )}

              {/* QUANTITY */}
              <div className="quantity-title">
                Quantity
              </div>

              <div className="quantity-box">
                <button
                  type="button"
                  className="quantity-button"
                  onClick={decreaseQuantity}
                >
                  −
                </button>

                <div className="quantity-value">
                  {quantity}
                </div>

                <button
                  type="button"
                  className="quantity-button"
                  onClick={increaseQuantity}
                >
                  +
                </button>
              </div>

              {/* STOCK */}
              <div
                className={`stock ${
                  isAvailable
                    ? "available"
                    : "unavailable"
                }`}
              >
                {stockStatus}
              </div>

              {/* ADD CART */}
              <button
                type="button"
                className="add-cart-button"
                disabled={!isAvailable}
                onClick={handleAddToCart}
              >
                {isAvailable
                  ? "Add to Cart"
                  : "Currently Unavailable"}
              </button>
            </div>
          </div>

          {/* DESCRIPTION */}
          {description && (
            <section className="description-section">
              <h2 className="description-title">
                Description
              </h2>

              <div
                className="description"
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
              />
            </section>
          )}
        </div>
      </main>
    </>
  );
}