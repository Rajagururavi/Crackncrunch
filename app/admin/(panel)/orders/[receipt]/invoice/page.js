"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();

  const receipt = params?.receipt;

  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!receipt) return;

    const fetchInvoiceData = async () => {
      try {
        setLoading(true);
        setError("");

        const [orderResponse, settingsResponse] = await Promise.all([
          fetch(
            `/api/admin/orders/${encodeURIComponent(receipt)}`,
            { cache: "no-store" }
          ),
          fetch("/api/admin/settings", { cache: "no-store" }),
        ]);

        const orderData = await orderResponse.json();
        const settingsData = await settingsResponse.json();

        if (!orderResponse.ok || !orderData.success || !orderData.order) {
          throw new Error(orderData.message || "Order not found");
        }

        if (!settingsResponse.ok || !settingsData.success) {
          throw new Error("Unable to load company settings");
        }

        setOrder(orderData.order);
        setSettings(settingsData.settings || {});
      } catch (err) {
        console.error("Invoice error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceData();
  }, [receipt]);

  const formatPrice = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="invoice-loading">
        Loading invoice...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="invoice-error">
        <h2>Invoice Not Available</h2>
        <p>{error || "Order details not found."}</p>
        <button onClick={() => router.back()}>
          Go Back
        </button>
      </div>
    );
  }

  const customer = order.customer || {};
  const items = order.items || [];
  const summary = order.summary || {};

  const subtotal =
    Number(summary.subtotal || 0);

  const shipping =
    Number(summary.shipping || 0);

  const grandTotal =
    Number(summary.total || subtotal + shipping);

  const transactionId =
    order.transactionId ||
    order.razorpay_payment_id ||
    "N/A";

  const paymentStatus =
    order.paymentStatus || "Pending";

  return (
    <>
      <div className="invoice-page">

        {/* ACTION BUTTONS - NOT PRINTABLE */}
        <div className="invoice-actions no-print">
          <button
            className="back-btn"
            onClick={() => router.back()}
          >
            Back
          </button>

          <button
            className="print-btn"
            onClick={handlePrint}
          >
            <i className="fa-solid fa-print"></i>
            Print Invoice
          </button>
        </div>

        {/* INVOICE ONLY */}
        <div className="invoice-container">

          {/* COMPANY HEADER */}
          <div className="company-header">

            <div className="company-logo">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt="Crack N Crunch Logo"
                />
              ) : (
                <h2>CRACK N CRUNCH</h2>
              )}
            </div>

            <div className="company-details">
              <h1>CRACK N CRUNCH</h1>

              <p>
                {settings.address || "N/A"}
              </p>

              <p>
                Phone: {settings.phone || "N/A"}
              </p>

              <p>
                Email: {settings.email || "N/A"}
              </p>

              <p>
                GSTIN: {settings.gst || "N/A"}
              </p>
            </div>

          </div>

          <div className="invoice-title">
            <h2>TAX INVOICE</h2>
            <span>Original for Recipient</span>
          </div>

          {/* INVOICE INFORMATION */}
          <div className="invoice-info">

            <div>
              <p>
                <strong>Invoice Number:</strong>
                {" "}INV-{order.receipt}
              </p>

              <p>
                <strong>Order Number:</strong>
                {" "}{order.receipt}
              </p>

              <p>
                <strong>Invoice Date:</strong>
                {" "}{formatDate(order.orderDate || order.createdAt)}
              </p>
            </div>

            <div>
              <p>
                <strong>FSSAI License No:</strong>
                {" "}{settings.fssai || "N/A"}
              </p>

              <p>
                <strong>Payment Method:</strong>
                {" "}{order.paymentMethod || "N/A"}
              </p>
            </div>

          </div>

          {/* CUSTOMER DETAILS */}
          <div className="customer-section">

            <div className="customer-box">
              <h3>Bill To</h3>

              <p>
                <strong>{customer.fullname || "N/A"}</strong>
              </p>

              <p>
                {customer.mobile || "N/A"}
              </p>

              <p>
                {customer.email || "N/A"}
              </p>

              <p>
                {customer.address || "N/A"}
              </p>

              <p>
                {[
                  customer.city,
                  customer.state,
                  customer.pincode,
                  customer.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>

            <div className="customer-box">
              <h3>Ship To</h3>

              <p>
                <strong>{customer.fullname || "N/A"}</strong>
              </p>

              <p>
                {customer.mobile || "N/A"}
              </p>

              <p>
                {customer.address || "N/A"}
              </p>

              <p>
                {[
                  customer.city,
                  customer.state,
                  customer.pincode,
                  customer.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>

          </div>

          {/* PRODUCT TABLE */}
          <div className="product-table-wrapper">
            <table className="product-table">

              <thead>
                <tr>
                  <th style={{ width: "7%" }}>#</th>
                  <th>Product</th>
                  <th style={{ width: "15%" }}>Weight</th>
                  <th style={{ width: "12%" }}>Qty</th>
                  <th style={{ width: "20%" }}>Amount</th>
                </tr>
              </thead>

              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => {
                    const quantity = Number(item.quantity || 1);
                    const price = Number(item.final_price || 0);
                    const total = price * quantity;

                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>

                        <td className="product-name">
                          {item.product_title || "Product"}
                        </td>

                        <td>{item.weight || "N/A"}</td>

                        <td>{quantity}</td>

                        <td>{formatPrice(total)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

          {/* TOTAL */}
          <div className="total-section">

            <div className="total-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="total-row">
              <span>Shipping</span>
              <strong>{formatPrice(shipping)}</strong>
            </div>

            <div className="total-row grand-total">
              <span>Grand Total</span>
              <strong>{formatPrice(grandTotal)}</strong>
            </div>

          </div>

          {/* PAYMENT DETAILS */}
          <div className="payment-section">

            <h3>Payment Details</h3>

            <p>
              <strong>Payment Method:</strong>
              {" "}{order.paymentMethod || "N/A"}
            </p>

            <p>
              <strong>Transaction ID:</strong>
              {" "}{transactionId}
            </p>

            {order.razorpayOrderId && (
              <p>
                <strong>Razorpay Order ID:</strong>
                {" "}{order.razorpayOrderId}
              </p>
            )}

            <p>
              <strong>Payment Status:</strong>
              {" "}
              <span className="payment-status">
                {paymentStatus}
              </span>
            </p>

          </div>

          {/* FOOTER */}
          <div className="invoice-footer">
            <h3>Thank You For Your Order!</h3>

            <p>
              Thank you for shopping with Crack N Crunch.
            </p>

            <p>
              For any queries, please contact us.
            </p>

            <div className="signature">
              <p>For CRACK N CRUNCH</p>
              <strong>Authorized Signatory</strong>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f1f2f4;
          font-family: Arial, Helvetica, sans-serif;
          color: #222;
        }

        .invoice-page {
          width: 100%;
          min-height: 100vh;
          padding: 25px 15px;
        }

        .invoice-actions {
          max-width: 900px;
          margin: 0 auto 18px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .invoice-actions button {
          border: none;
          padding: 11px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .back-btn {
          background: #e5e7eb;
          color: #222;
        }

        .print-btn {
          background: #166534;
          color: #fff;
        }

        .print-btn i {
          margin-right: 8px;
        }

        .invoice-container {
          max-width: 900px;
          width: 100%;
          margin: 0 auto;
          padding: 35px;
          background: #fff;
          border: 1px solid #ddd;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .company-header {
          display: flex;
          align-items: center;
          gap: 25px;
          padding-bottom: 20px;
          border-bottom: 2px solid #222;
        }

        .company-logo {
          width: 130px;
          flex-shrink: 0;
        }

        .company-logo img {
          width: 100%;
          max-height: 100px;
          object-fit: contain;
        }

        .company-details {
          flex: 1;
        }

        .company-details h1 {
          font-size: 25px;
          margin: 0 0 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .company-details p {
          font-size: 12px;
          margin: 5px 0;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .invoice-title {
          text-align: center;
          padding: 18px 0;
          border-bottom: 1px solid #ddd;
        }

        .invoice-title h2 {
          font-size: 23px;
          margin: 0 0 5px;
          letter-spacing: 2px;
        }

        .invoice-title span {
          font-size: 11px;
          color: #666;
        }

        .invoice-info {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 0;
          border-bottom: 1px solid #ddd;
        }

        .invoice-info p {
          font-size: 12px;
          margin: 7px 0;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .customer-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 20px 0;
        }

        .customer-box {
          border: 1px solid #ddd;
          padding: 15px;
          min-width: 0;
        }

        .customer-box h3 {
          font-size: 14px;
          margin: 0 0 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #ddd;
        }

        .customer-box p {
          font-size: 12px;
          line-height: 1.6;
          margin: 4px 0;
          overflow-wrap: anywhere;
        }

        .product-table-wrapper {
          width: 100%;
          overflow-x: auto;
          margin-top: 10px;
        }

        .product-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .product-table th {
          background: #f1f1f1;
          font-weight: 700;
          text-align: left;
        }

        .product-table th,
        .product-table td {
          border: 1px solid #ccc;
          padding: 11px 9px;
        }

        .product-table td:first-child,
        .product-table td:nth-child(3),
        .product-table td:nth-child(4) {
          text-align: center;
        }

        .product-table th:last-child,
        .product-table td:last-child {
          text-align: right;
          white-space: nowrap;
        }

        .product-name {
          font-weight: 600;
        }

        .total-section {
          width: 300px;
          max-width: 100%;
          margin: 20px 0 20px auto;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 9px 0;
          font-size: 13px;
          border-bottom: 1px solid #eee;
        }

        .grand-total {
          border-top: 2px solid #222;
          border-bottom: 2px solid #222;
          font-size: 16px;
          font-weight: 800;
          padding: 13px 0;
        }

        .payment-section {
          border-top: 1px solid #ddd;
          padding: 18px 0;
        }

        .payment-section h3 {
          font-size: 15px;
          margin: 0 0 12px;
        }

        .payment-section p {
          font-size: 12px;
          margin: 7px 0;
          overflow-wrap: anywhere;
        }

        .payment-status {
          color: #166534;
          font-weight: 700;
        }

        .invoice-footer {
          position: relative;
          margin-top: 15px;
          padding: 20px 0 5px;
          text-align: center;
          border-top: 1px solid #ddd;
        }

        .invoice-footer h3 {
          font-size: 17px;
          margin: 0 0 8px;
        }

        .invoice-footer p {
          font-size: 11px;
          margin: 5px 0;
        }

        .signature {
          text-align: right;
          margin-top: 35px;
        }

        .signature p {
          font-size: 12px;
          font-weight: 700;
        }

        .signature strong {
          font-size: 11px;
        }

        .invoice-loading,
        .invoice-error {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 12px;
          font-family: Arial, sans-serif;
        }

        .invoice-error button {
          padding: 10px 20px;
          border: none;
          background: #166534;
          color: white;
          border-radius: 5px;
          cursor: pointer;
        }

        @media (max-width: 600px) {
          .invoice-page {
            padding: 12px 8px;
          }

          .invoice-container {
            padding: 16px 12px;
          }

          .company-header {
            gap: 12px;
          }

          .company-logo {
            width: 85px;
          }

          .company-details h1 {
            font-size: 17px;
          }

          .company-details p {
            font-size: 10px;
          }

          .invoice-info {
            flex-direction: column;
            gap: 5px;
          }

          .customer-section {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .product-table {
            font-size: 10px;
          }

          .product-table th,
          .product-table td {
            padding: 8px 5px;
          }

          .total-section {
            width: 100%;
          }
        }

        /* PRINT: SHOW ONLY INVOICE */
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          html,
          body {
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          body * {
            visibility: hidden !important;
          }

          .invoice-container,
          .invoice-container * {
            visibility: visible !important;
          }

          .invoice-page {
            position: static !important;
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          .invoice-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #fff !important;
          }

          .no-print,
          .invoice-actions {
            display: none !important;
            visibility: hidden !important;
          }

          .product-table-wrapper {
            overflow: visible !important;
          }

          .product-table {
            width: 100% !important;
          }

          .company-header,
          .invoice-title,
          .invoice-info,
          .customer-section,
          .product-table,
          .total-section,
          .payment-section,
          .invoice-footer {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .product-table thead {
            display: table-header-group;
          }

          .product-table tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
}