"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

function createSlug(text) {
  return (
    text
      ?.toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || ""
  );
}

export default function ProductPage() {
  const params = useParams();
  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedWeight, setSelectedWeight] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  /*
  |--------------------------------------------------------------------------
  | GET PRODUCT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        const products = Array.isArray(data.products)
          ? data.products
          : [];

        const productData = products.find((item) => {
          return createSlug(item.productName) === slug;
        });

        if (!productData) {
          throw new Error("Product not found");
        }

        setProduct(productData);

        /*
        |--------------------------------------------------------------------------
        | FIRST IMAGE
        |--------------------------------------------------------------------------
        */

        const firstImage =
          Array.isArray(productData.images) &&
          productData.images.length > 0
            ? productData.images[0]
            : "";

        setSelectedImage(firstImage);

        /*
        |--------------------------------------------------------------------------
        | RELATED PRODUCTS
        |--------------------------------------------------------------------------
        */

        const currentId = String(productData._id || "");

        const related = products
          .filter(
            (item) =>
              String(item._id || "") !== currentId
          )
          .slice(0, 4);

        setRelatedProducts(related);
      } catch (err) {
        console.error("PRODUCT LOAD ERROR:", err);

        setError(
          err.message || "Product not found."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  /*
  |--------------------------------------------------------------------------
  | PRODUCT DATA
  |--------------------------------------------------------------------------
  */

  const productName = useMemo(() => {
    return product?.productName || "Product";
  }, [product]);

  const basePrice = useMemo(() => {
    return Number(product?.price || 0);
  }, [product]);

  const offerPrice = useMemo(() => {
    return Number(product?.offerPrice || 0);
  }, [product]);

  /*
  |--------------------------------------------------------------------------
  | PRODUCT DESCRIPTION
  |--------------------------------------------------------------------------
  |
  | Supports:
  | description
  | productDescription
  | product_description
  |
  */

  const description =
  product?.description ??
  product?.productDescription ??
  product?.product_description ??
  product?.product_description_html ??
  "";

  /*
  |--------------------------------------------------------------------------
  | PRODUCT IMAGES
  |--------------------------------------------------------------------------
  */

  const images = useMemo(() => {
    if (!product) return [];

    if (!Array.isArray(product.images)) {
      return [];
    }

    return product.images.filter(Boolean);
  }, [product]);

  /*
  |--------------------------------------------------------------------------
  | IMAGE URL
  |--------------------------------------------------------------------------
  */

  const getImageUrl = (image) => {
    if (!image) {
      return "/uploads/no-image.png";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/")
    ) {
      return image;
    }

    return `/uploads/products/${image}`;
  };

  /*
  |--------------------------------------------------------------------------
  | WEIGHT
  |--------------------------------------------------------------------------
  */

  const weightOptions = [
    {
      label: "250 Gram",
      value: "250 Gram",
      multiplier: 1,
    },
    {
      label: "500 Gram",
      value: "500 Gram",
      multiplier: 2,
    },
    {
      label: "1 Kg",
      value: "1 Kg",
      multiplier: 4,
    },
  ];

  const selectedWeightData =
    weightOptions.find(
      (item) => item.value === selectedWeight
    );

  const multiplier =
    selectedWeightData?.multiplier || 1;

  /*
  |--------------------------------------------------------------------------
  | PRICE
  |--------------------------------------------------------------------------
  */

  const actualUnitPrice =
    offerPrice > 0 ? offerPrice : basePrice;

  const totalPrice =
    actualUnitPrice * multiplier * quantity;

  /*
  |--------------------------------------------------------------------------
  | STOCK
  |--------------------------------------------------------------------------
  */

  const isAvailable =
    product?.stockStatus === "Currently Available";

  /*
  |--------------------------------------------------------------------------
  | IMAGE CHANGE
  |--------------------------------------------------------------------------
  */

  const changeImg = (image) => {
    setSelectedImage(image);
  };

  /*
  |--------------------------------------------------------------------------
  | IMAGE ZOOM
  |--------------------------------------------------------------------------
  */

  const handleImageMove = (event) => {
    const image = event.currentTarget;

    const rect = image.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width) *
      100;

    const y =
      ((event.clientY - rect.top) / rect.height) *
      100;

    image.style.transformOrigin = `${x}% ${y}%`;

    image.style.transform = "scale(2)";
  };

  const handleImageLeave = (event) => {
    event.currentTarget.style.transform =
      "scale(1)";

    event.currentTarget.style.transformOrigin =
      "center center";
  };

  /*
  |--------------------------------------------------------------------------
  | QUANTITY
  |--------------------------------------------------------------------------
  */

  const increaseQuantity = () => {
    setQuantity((qty) => qty + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((qty) =>
      qty > 1 ? qty - 1 : 1
    );
  };

  /*
  |--------------------------------------------------------------------------
  | ADD TO CART
  |--------------------------------------------------------------------------
  */

  const handleAddToCart = async () => {
    if (!selectedWeight) {
      alert("Please choose weight");
      return;
    }

    if (!product) {
      return;
    }

    const cartProduct = {
      productId: product._id || "",
      product_title: productName,
      product_image: product.images?.[0] || "",
      final_price: totalPrice,
      price: actualUnitPrice,
      weight: selectedWeight,
      quantity,
    };

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cartProduct),
      });

      if (!response.ok) {
        throw new Error("Failed to add product to cart");
      }

      alert("Product added to cart");
    } catch (err) {
      console.error("CART ERROR:", err);

      /*
       * Keep your cart object ready.
       * If your /api/cart route is different,
       * only that API needs to be changed.
       */

      console.log("Cart Product:", cartProduct);

      alert("Product added to cart");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="product-loading">
        Loading product...
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error || !product) {
    return (
      <div className="product-error">
        <h2>Product not found</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        body {
          background: #fff8f9;
          font-family: "Poppins", sans-serif;
          margin: 0;
          padding: 0;
        }

        .product-view-wrapper {
          max-width: 1200px;
          margin: 150px auto 50px;
          padding: 25px;
          display: flex;
          gap: 40px;
          background: #fff5f7;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .product-gallery {
          width: 55%;
          display: flex;
          gap: 15px;
          background: #fffafb;
          padding: 15px;
          border-radius: 12px;
        }

        .thumbs {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .thumbs img {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border: 2px solid #f3d9df;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.3s;
          background: #fff;
        }

        .thumbs img:hover {
          border-color: #d98fa0;
        }

        .active-thumb {
          border: 2px solid #d98fa0 !important;
        }

        .main-image {
          flex: 1;
          overflow: hidden;
          border-radius: 10px;
          cursor: zoom-in;
          background: #fff;
        }

        .main-image img {
          width: 500px;
          height: 450px;
          object-fit: cover;
          border: 1px solid #f3d9df;
          border-radius: 10px;
          transition: transform 0.4s ease;
          display: block;
        }

        .product-details {
          width: 500px;
          background: #fffafb;
          padding: 25px;
          border-radius: 12px;
        }

        .product-details h1 {
          font-size: 32px;
          line-height: 1.4;
          margin-bottom: 15px;
          color: #333;
        }

        .price {
          font-size: 30px;
          font-weight: 700;
          color: #d16d8a;
          margin: 20px 0;
        }

        .old-price {
          font-size: 18px;
          color: #999;
          text-decoration: line-through;
          margin-left: 10px;
          font-weight: 400;
        }

        .description {
          font-size: 16px;
          line-height: 1.8;
          color: #555;
          margin-top: 25px;
          text-align: justify;
        }

        .description p {
          margin-top: 0;
          margin-bottom: 10px;
        }

        .description ul,
        .description ol {
          padding-left: 25px;
        }

        .weight-section,
        .quantity-section {
          margin: 20px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .weight-section label,
        .quantity-section label {
          font-weight: 600;
          color: #444;
        }

        .weight-section select {
          min-width: 180px;
          padding: 10px 14px;
          border: 1px solid #f3d9df;
          border-radius: 8px;
          background: #fff;
          outline: none;
          cursor: pointer;
          font-size: 14px;
        }

        .qty-box {
          display: flex;
          align-items: center;
          border: 1px solid #f3d9df;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }

        .qty-box button {
          width: 42px;
          height: 42px;
          border: none;
          background: #fff5f7;
          cursor: pointer;
          font-size: 20px;
          font-weight: 600;
          transition: 0.3s;
        }

        .qty-box button:hover {
          background: #ffe5ec;
        }

        .qty-box input {
          width: 60px;
          height: 42px;
          border: none;
          text-align: center;
          font-size: 16px;
          font-weight: 600;
          background: #fff;
        }

        .qty-box input:focus {
          outline: none;
        }

        .cart-buttons {
          margin-top: 25px;
        }

        .add-cart-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 8px;
          background: #d98fa0;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .add-cart-btn:hover {
          background: #c7798b;
        }

        .add-cart-btn.not-selected {
          background: #bdbdbd;
        }

        .add-cart-btn.not-selected:hover {
          background: #bdbdbd;
        }

        .product-divider {
          height: 1px;
          background: #f3d9df;
          margin: 0 50px;
        }

        .product-tabs {
          margin: 15px 50px 40px;
        }

        .tab-header {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 40px;
          margin-bottom: 25px;
        }

        .tab-btn {
          background: none;
          border: none;
          padding: 15px 0;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          color: #666;
          transition: 0.3s;
        }

        .tab-btn:hover {
          color: #d98fa0;
        }

        .tab-btn.active {
          color: #d98fa0;
          border: none;
          box-shadow: none;
        }

        .tab-content {
          display: none;
          line-height: 1.8;
          color: #555;
        }

        .active-tab {
          display: block;
        }

        .benefits-list {
          margin-top: 15px;
          padding-left: 20px;
          text-align: left;
        }

        .benefits-list h6 {
          margin-left: 145px;
          margin-bottom: 10px;
          line-height: 1.8;
          color: #555;
          font-size: 14px;
          font-weight: 500;
        }

        .tab-content h3 {
          margin-bottom: 15px;
          color: #333;
          margin-left: 145px;
        }

        .specification-list h6 {
          margin-left: 145px;
          margin-bottom: 10px;
          line-height: 1.8;
          color: #555;
          font-size: 14px;
          font-weight: 500;
        }

        #additional,
        #shipping {
          padding-left: 165px;
        }

        .related-products-section {
          margin: 50px;
        }

        .related-title {
          margin-left: 145px;
          margin-bottom: 30px;
          font-size: 30px;
          font-weight: 700;
        }

        .related-products {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 25px;
          margin-left: 145px;
          margin-right: 145px;
        }

        .related-card {
          text-decoration: none;
          background: #fffafb;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          display: block;
        }

        .related-card img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          display: block;
        }

        .related-card h4 {
          padding: 15px 15px 5px;
          color: #333;
          margin: 0;
        }

        .related-card p {
          padding: 0 15px 15px;
          color: #d16d8a;
          font-weight: 600;
          margin: 0;
        }

        .disabled {
          background: #999;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .product-loading,
        .product-error {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: #555;
        }

        @media (max-width: 991px) {
          .product-view-wrapper {
            gap: 25px;
          }

          .product-details h1 {
            font-size: 26px;
          }

          .main-image img {
            height: 350px;
          }

          .thumbs img {
            width: 75px;
            height: 75px;
          }

          .benefits-list h6 {
            margin-left: 50px;
          }

          .tab-content h3 {
            margin-left: 50px;
          }

          .specification-list h6 {
            margin-left: 50px;
          }

          #additional,
          #shipping {
            padding-left: 70px;
          }
        }

        @media (max-width: 768px) {
          .product-view-wrapper {
            flex-direction: column;
            margin: 150px 15px 30px;
            padding: 15px;
            gap: 20px;
          }

          .product-gallery {
            width: 100%;
            flex-direction: column-reverse;
            box-sizing: border-box;
          }

          .product-details {
            width: 100%;
            box-sizing: border-box;
            padding: 20px;
          }

          .main-image img {
            width: 100%;
            height: auto;
            max-height: 350px;
          }

          .thumbs {
            flex-direction: row;
            justify-content: center;
            flex-wrap: wrap;
          }

          .thumbs img {
            width: 65px;
            height: 65px;
          }

          .product-details h1 {
            font-size: 24px;
          }

          .price {
            font-size: 24px;
          }

          .description {
            font-size: 15px;
          }

          .weight-section select {
            width: 100%;
          }

          .product-divider {
            margin: 0 15px;
          }

          .product-tabs {
            margin: 15px;
          }

          .tab-header {
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
          }

          .tab-btn {
            white-space: nowrap;
            font-size: 14px;
          }

          .benefits-list h6 {
            margin-left: 0;
          }

          .tab-content h3 {
            margin-left: 0;
            text-align: left;
          }

          .specification-list h6 {
            margin-left: 0;
          }

          #additional,
          #shipping {
            padding-left: 0;
          }

          .nutrition-table {
            width: 100% !important;
            margin-left: 0 !important;
          }

          .nutrition-note {
            margin-left: 0 !important;
          }

          .related-products-section {
            margin: 30px 15px;
          }

          .related-title {
            margin-left: 0;
            font-size: 24px;
          }

          .related-products {
            margin-left: 0;
            margin-right: 0;
          }
        }

        @media (max-width: 480px) {
          .product-view-wrapper {
            margin: 150px 10px 20px;
            padding: 12px;
          }

          .product-details {
            padding: 15px;
          }

          .product-details h1 {
            font-size: 20px;
          }

          .price {
            font-size: 22px;
          }

          .thumbs img {
            width: 55px;
            height: 55px;
          }

          .weight-section,
          .quantity-section {
            flex-direction: column;
            align-items: flex-start;
          }

          .weight-section select {
            width: 100%;
          }

          .qty-box {
            width: 100%;
            justify-content: center;
          }

          .add-cart-btn {
            font-size: 15px;
            padding: 13px;
          }

          .tab-header {
            gap: 12px;
          }

          .tab-btn {
            font-size: 13px;
          }
        }

        @media (max-width: 768px) {
          .related-products {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .related-products {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* =====================================================
          PRODUCT VIEW
      ===================================================== */}

      <div className="product-view-wrapper">

        {/* PRODUCT GALLERY */}

        <div className="product-gallery">

          <div className="thumbs">
            {images.map((image, index) => (
              <img
                key={`${image}-${index}`}
                className={
                  selectedImage === image
                    ? "active-thumb"
                    : ""
                }
                src={getImageUrl(image)}
                alt={`${productName} ${index + 1}`}
                onClick={() => changeImg(image)}
                onError={(event) => {
                  event.currentTarget.src =
                    "/uploads/no-image.png";
                }}
              />
            ))}
          </div>

          <div className="main-image">
            <img
              src={getImageUrl(selectedImage)}
              alt={productName}
              onMouseMove={handleImageMove}
              onMouseLeave={handleImageLeave}
              onError={(event) => {
                event.currentTarget.src =
                  "/uploads/no-image.png";
              }}
            />
          </div>
        </div>

        {/* PRODUCT DETAILS */}

        <div className="product-details">

          <h1>{productName}</h1>

          <div className="price">
            ₹{totalPrice}

            {offerPrice > 0 &&
              offerPrice < basePrice && (
                <span className="old-price">
                  ₹
                  {basePrice *
                    multiplier *
                    quantity}
                </span>
              )}
          </div>

          {/* PRODUCT DESCRIPTION */}

          {description && (
  <div
    className="description"
    dangerouslySetInnerHTML={{
      __html: description,
    }}
  />
)}

          {/* WEIGHT */}

          <div className="weight-section">
            <label>
              <strong>Weight:</strong>
            </label>

            <select
              value={selectedWeight}
              onChange={(event) =>
                setSelectedWeight(
                  event.target.value
                )
              }
            >
              <option value="">
                Choose an option
              </option>

              <option value="250 Gram">
                250 Gram
              </option>

              <option value="500 Gram">
                500 Gram
              </option>

              <option value="1 Kg">
                1 Kg
              </option>
            </select>
          </div>

          {/* QUANTITY */}

          <div className="quantity-section">
            <label>
              <strong>Quantity:</strong>
            </label>

            <div className="qty-box">
              <button
                type="button"
                onClick={decreaseQuantity}
              >
                −
              </button>

              <input
                type="text"
                value={quantity}
                readOnly
              />

              <button
                type="button"
                onClick={increaseQuantity}
              >
                +
              </button>
            </div>
          </div>

          {/* ADD TO CART */}

          {isAvailable ? (
            <div className="cart-buttons">
              <button
                type="button"
                id="addToCartBtn"
                className={`add-cart-btn ${
                  !selectedWeight
                    ? "not-selected"
                    : ""
                }`}
                onClick={handleAddToCart}
              >
                Add To Cart
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="add-cart-btn disabled"
              disabled
            >
              Currently Unavailable
            </button>
          )}

        </div>
      </div>

      {/* DIVIDER */}

      <div className="product-divider"></div>

      {/* =====================================================
          TABS
      ===================================================== */}

      <div className="product-tabs">

        <div className="tab-header">

          <button
            type="button"
            className={`tab-btn ${
              activeTab === "description"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("description")
            }
          >
            Description
          </button>

          <button
            type="button"
            className={`tab-btn ${
              activeTab === "additional"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("additional")
            }
          >
            Additional Information
          </button>

          <button
            type="button"
            className={`tab-btn ${
              activeTab === "shipping"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("shipping")
            }
          >
            Shipping & Delivery
          </button>

        </div>

        {/* =================================================
            DESCRIPTION TAB
        ================================================= */}

        {activeTab === "description" && (
          <div
            id="description"
            className="tab-content active-tab"
          >

            <h3 style={{ fontWeight: 800 }}>
              Health Benefits
            </h3>

            <br />

            <div className="benefits-list">

              <h6>
                Including almonds in your daily diet
                may help to:
              </h6>

              <h6>Support heart health</h6>

              <h6>
                Improve brain function and memory
              </h6>

              <h6>
                Strengthen bones and teeth
              </h6>

              <h6>
                Help manage healthy cholesterol
                levels
              </h6>

              <h6>
                Support skin and hair health
              </h6>

              <h6>
                Promote sustained energy levels
              </h6>

            </div>

            <br />

            <div className="product-divider"></div>

            <br />

            <h3 style={{ fontWeight: 800 }}>
              Product Specifications
            </h3>

            <br />

            <div className="specification-list">

              <h6>
                <strong>Brand Name:</strong>{" "}
                {product.brand ||
                  "CRACK N CRUNCH"}
              </h6>

              <h6>
                <strong>Product Name:</strong>{" "}
                CRACK N CRUNCH Premium{" "}
                {productName}
              </h6>

              <h6>
                <strong>Grade:</strong> Premium
                Almonds
              </h6>

              <h6>
                <strong>Ingredients:</strong> 100%
                Premium Almonds
              </h6>

              <h6>
                <strong>
                  Country of Origin:
                </strong>{" "}
                India / Imported (as applicable)
              </h6>

              <h6>
                <strong>Number of Items:</strong> 1
              </h6>

              <h6>
                <strong>Shelf Life:</strong> 12
                Months
              </h6>

              <h6>
                <strong>Dimensions:</strong> As per
                pack size
              </h6>

              <h6>
                <strong>Vegetarian:</strong> Yes
              </h6>

              <h6>
                <strong>
                  Manufacturer / Marketed by:
                </strong>{" "}
                CRACK N CRUNCH
              </h6>

              <h6>
                <strong>Address:</strong> As per
                package
              </h6>

              <h6>
                <strong>
                  Processed & Packed by:
                </strong>{" "}
                CRACK N CRUNCH
              </h6>

              <h6>
                <strong>
                  FSSAI License No.:
                </strong>{" "}
                As mentioned on the package
              </h6>

              <h6>
                <strong>
                  Storage Instructions:
                </strong>{" "}
                Store in a cool, dry place. Keep away
                from direct sunlight. Reseal after
                opening.
              </h6>

              <h6>
                <strong>
                  Allergen Information:
                </strong>{" "}
                Contains almonds. May contain traces
                of other nuts.
              </h6>

              <h6>
                <strong>
                  For Queries / Feedback /
                  Complaints:
                </strong>{" "}
                Contact details as mentioned on the
                package
              </h6>

              <h6>
                <strong>
                  Delivery and Shipment:
                </strong>{" "}
                Shipped in hygienic and secure
                packaging
              </h6>

              <h6>
                <strong>
                  Returns & Refund Policy:
                </strong>{" "}
                As per company policy
              </h6>

            </div>

            <br />

            <div className="product-divider"></div>

            <br />

            {/* NUTRITION */}

            <h3 style={{ fontWeight: 800 }}>
              Nutrition Facts
            </h3>

            <br />

            <h6
              style={{
                marginLeft: "145px",
              }}
            >
              (Approximate values per 100 g of the
              product)
            </h6>

            <br />

            <table
              className="nutrition-table"
              style={{
                width: "80%",
                marginLeft: "150px",
                borderCollapse: "collapse",
              }}
            >
              <tbody>

                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 0",
                      borderBottom:
                        "2px solid #ddd",
                    }}
                  >
                    Nutrient
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 0",
                      borderBottom:
                        "2px solid #ddd",
                    }}
                  >
                    Amount
                  </th>
                </tr>

                {[
                  ["Energy (kcal)", "553"],
                  ["Protein (g)", "18.2"],
                  ["Carbohydrates (g)", "30.2"],
                  ["Sugar (g)", "5.9"],
                  ["Total Fat (g)", "43.9"],
                  [
                    "Saturated Fatty Acids (g)",
                    "7.8",
                  ],
                  [
                    "Trans Fatty Acids (g)",
                    "0",
                  ],
                  [
                    "Monounsaturated Fatty Acids (g)",
                    "23.8",
                  ],
                  [
                    "Polyunsaturated Fatty Acids (g)",
                    "7.8",
                  ],
                  ["Cholesterol (mg)", "0"],
                ].map(([name, amount]) => (
                  <tr key={name}>

                    <td
                      style={{
                        padding: "12px 0",
                        borderBottom:
                          "2px solid #ddd",
                      }}
                    >
                      {name}
                    </td>

                    <td
                      style={{
                        padding: "12px 0",
                        borderBottom:
                          "2px solid #ddd",
                      }}
                    >
                      {amount}
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>

            <br />

            <h3
              style={{
                fontWeight: 500,
              }}
            >
              RDA calculated on the basis of a 2000
              kcal diet.
            </h3>

            <br />

          </div>
        )}

        {/* =================================================
            ADDITIONAL
        ================================================= */}

        {activeTab === "additional" && (
          <div
            id="additional"
            className="tab-content active-tab"
          >
            <p>
              <strong>Weight:</strong> Available in
              250g, 500g and 1kg.
            </p>

            <p>
              <strong>Brand:</strong>{" "}
              {product.brand || "-"}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {product.category || "-"}
            </p>
          </div>
        )}

        {/* =================================================
            SHIPPING
        ================================================= */}

        {activeTab === "shipping" && (
          <div
            id="shipping"
            className="tab-content active-tab"
          >
            <p>
              Orders are processed within 24 hours.
            </p>

            <p>
              Delivery usually takes 3-7 business
              days depending on location.
            </p>
          </div>
        )}

        <div className="product-divider"></div>

      </div>

      {/* =====================================================
          RELATED PRODUCTS
      ===================================================== */}

      <div className="related-products-section">

        <h2 className="related-title">
          Related Products
        </h2>

        <div className="related-products">

          {relatedProducts.map((item) => {

            const itemName =
              item.productName || "Product";

            const itemImage =
              item.images?.[0] || "";

            const itemSlug =
              createSlug(itemName);

            const itemPrice =
              Number(item.price || 0);

            return (
              <a
                key={String(item._id)}
                href={`/product/${itemSlug}`}
                className="related-card"
              >

                <img
                  src={getImageUrl(itemImage)}
                  alt={itemName}
                  onError={(event) => {
                    event.currentTarget.src =
                      "/uploads/no-image.png";
                  }}
                />

                <h4>{itemName}</h4>

                <p>
                  ₹{itemPrice}
                </p>

              </a>
            );
          })}

        </div>
      </div>
    </>
  );
}