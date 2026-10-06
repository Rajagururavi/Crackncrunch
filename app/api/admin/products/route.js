const response = await fetch("/api/products", {
  cache: "no-store",
});

if (!response.ok) {
  throw new Error("Failed to load products");
}

const data = await response.json();

const products = data.products || [];

const foundProduct = products.find((item) => {
  const itemSlug = item.productName
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return itemSlug === slug;
});

if (!foundProduct) {
  throw new Error("Product not found");
}

console.log("FOUND PRODUCT:", foundProduct);
console.log("DESCRIPTION:", foundProduct.description);
console.log(
  "PRODUCT DESCRIPTION:",
  foundProduct.productDescription
);
console.log(
  "PRODUCT DESCRIPTION OLD:",
  foundProduct.product_description
);

setProduct(foundProduct);