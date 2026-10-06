"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

function createSlug(text) {
  return text
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductPage() {
  const params = useParams();

  const slug = params?.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      return;
    }

    const loadProduct = async () => {
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

        const products = data.products || [];

        const foundProduct = products.find(
          (item) => createSlug(item.productName) === slug
        );

        if (!foundProduct) {
          throw new Error("Product not found");
        }

        setProduct(foundProduct);
      } catch (err) {
        console.error("PRODUCT LOAD ERROR:", err);
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <h1>{product.productName}</h1>

      <p>{product.description}</p>

      <p>Price: ₹{product.price}</p>

      {product.offerPrice && (
        <p>Offer Price: ₹{product.offerPrice}</p>
      )}

      <div>
        {product.images?.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={product.productName}
            style={{
              width: "300px",
              height: "300px",
              objectFit: "contain",
            }}
          />
        ))}
      </div>
    </div>
  );
}