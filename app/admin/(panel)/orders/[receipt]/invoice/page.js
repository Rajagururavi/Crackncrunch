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
          fetch(`/api/admin/orders/${encodeURIComponent(receipt)}`, {
            cache: "no-store",
          }),
          fetch("/api/admin/settings", {
            cache: "no-store",
          }),
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
        <div className="loading-spinner"></div>
        <p>Loading invoice...</p>
        <style jsx>{`
          .invoice-loading {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 12px;
            color: #666;
            font-family: Arial, sans-serif;
          }
          .loading-spinner {
            width: 38px;
            height: 38px;
            border: 4px solid #e5e7eb;
            border-top-color: #166534;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
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
        <style jsx>{`
          .invoice-error {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 12px;
            padding: 20px;
            text-align: center;
            font-family: Arial, sans-serif;
          }
          .invoice-error h2 {
            margin: 0;
            color: #dc2626;
          }
          .invoice-error p {
            overflow-wrap: anywhere;
          }
          .invoice-error button {
            padding: 11px 22px;
            border: 0;
            border-radius: 6px;
            background: #166534;
            color: white;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }
  const customer = order.customer || {};
  const items = order.items || [];
  const summary = order.summary || {};
  const subtotal = Number(summary.subtotal || 0);
  const shipping = Number(summary.shipping || 0);
  const grandTotal = Number(summary.total || subtotal + shipping);
  const transactionId = order.transactionId || order.razorpay_payment_id || "N/A";
  const paymentStatus = order.paymentStatus || "Pending";
  const addressParts = [
    customer.city,
    customer.state,
    customer.pincode,
    customer.country,
  ].filter(Boolean);
  return (
    <>
      <div className="invoice-page">
        <div className="invoice-actions no-print">
          <button className="back-btn" onClick={() => router.back()}>
            ← Back
          </button>
          <button className="print-btn" onClick={handlePrint}>
            <i className="fa-solid fa-print"></i>
            Print Invoice
          </button>
        </div>
        <div className="invoice-container">
          <div className="company-header">
            <div className="company-logo">
              {settings.logo ? (
                <img src={settings.logo} alt="Crack N Crunch Logo"/>
              ) : (
                <h2>CRACK N CRUNCH</h2>
              )}
            </div>
            <div className="company-details">
              <h1>CRACK N CRUNCH</h1>
              <p>{settings.address || "N/A"}</p>
              <p>Phone: {settings.phone || "N/A"}</p>
              <p>Email: {settings.email || "N/A"}</p>
              <p>GSTIN: {settings.gst || "N/A"}</p>
            </div>
          </div>
          <div className="invoice-title">
            <h2>TAX INVOICE</h2>
            <span>Original for Recipient</span>
          </div>
          <div className="invoice-info">
            <div className="invoice-info-column">
              <p>
                <strong>Invoice Number:</strong>
                <span>INV-{order.receipt}</span>
              </p>
              <p>
                <strong>Order Number:</strong>
                <span>{order.receipt}</span>
              </p>
              <p>
                <strong>Invoice Date:</strong>
                <span>
                  {formatDate(order.orderDate || order.createdAt)}
                </span>
              </p>
            </div>
            <div className="invoice-info-column">
              <p>
                <strong>FSSAI License No:</strong>
                <span>{settings.fssai || "N/A"}</span>
              </p>
              <p>
                <strong>Payment Method:</strong>
                <span>{order.paymentMethod || "N/A"}</span>
              </p>
            </div>
          </div>
          <div className="customer-section">
            <div className="customer-box">
              <h3>Bill To</h3>
              <p>
                <strong>{customer.fullname || "N/A"}</strong>
              </p>
              <p>{customer.mobile || "N/A"}</p>
              <p>{customer.email || "N/A"}</p>
              <p>{customer.address || "N/A"}</p>
              <p>{addressParts.join(", ") || "N/A"}</p>
            </div>
            <div className="customer-box">
              <h3>Ship To</h3>
              <p>
                <strong>{customer.fullname || "N/A"}</strong>
              </p>
              <p>{customer.mobile || "N/A"}</p>
              <p>{customer.address || "N/A"}</p>
              <p>{addressParts.join(", ") || "N/A"}</p>
            </div>
          </div>
          <div className="product-table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th className="serial-column">#</th>
                  <th>Product</th>
                  <th className="weight-column">Weight</th>
                  <th className="qty-column">Qty</th>
                  <th className="amount-column">Amount</th>
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
                        <td data-label="#" className="serial-cell">
                          {index + 1}
                        </td>
                        <td data-label="Product" className="product-name">
                          {item.product_title || "Product"}
                        </td>
                        <td data-label="Weight">
                          {item.weight || "N/A"}
                        </td>
                        <td data-label="Qty">
                          {quantity}
                        </td>
                        <td data-label="Amount" className="amount-cell">
                          {formatPrice(total)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-row">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
          <div className="payment-section">
            <h3>Payment Details</h3>
            <p>
              <strong>Payment Method:</strong>
              <span>{order.paymentMethod || "N/A"}</span>
            </p>
            <p>
              <strong>Transaction ID:</strong>
              <span>{transactionId}</span>
            </p>
            {order.razorpayOrderId && (
              <p>
                <strong>Razorpay Order ID:</strong>
                <span>{order.razorpayOrderId}</span>
              </p>
            )}
            <p>
              <strong>Payment Status:</strong>
              <span className="payment-status">
                {paymentStatus}
              </span>
            </p>
          </div>
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
          overflow-x: hidden;
        }
        .invoice-actions {
          width: 100%;
          max-width: 900px;
          margin: 0 auto 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .invoice-actions button {
          border: none;
          padding: 11px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: 0.2s;
        }
        .back-btn {
          background: #e5e7eb;
          color: #222;
        }
        .back-btn:hover {
          background: #d1d5db;
        }
        .print-btn {
          background: #166534;
          color: #fff;
        }
        .print-btn:hover {
          background: #14532d;
        }
        .print-btn i {
          margin-right: 8px;
        }
        .invoice-container {
          max-width: 900px;
          width: 100%;
          min-width: 0;
          margin: 0 auto;
          padding: 35px;
          background: #fff;
          border: 1px solid #ddd;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }
        .company-header {
          display: flex;
          align-items: center;
          gap: 25px;
          padding-bottom: 20px;
          border-bottom: 2px solid #222;
          min-width: 0;
        }
        .company-logo {
          width: 130px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .company-logo img {
          width: 100%;
          max-height: 100px;
          object-fit: contain;
        }
        .company-logo h2 {
          font-size: 17px;
          text-align: center;
          overflow-wrap: anywhere;
        }
        .company-details {
          flex: 1;
          min-width: 0;
        }
        .company-details h1 {
          font-size: 25px;
          margin: 0 0 10px;
          font-weight: 800;
          letter-spacing: 1px;
          overflow-wrap: anywhere;
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
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          padding: 18px 0;
          border-bottom: 1px solid #ddd;
        }
        .invoice-info-column {
          min-width: 0;
        }
        .invoice-info p {
          display: flex;
          align-items: flex-start;
          gap: 5px;
          font-size: 12px;
          margin: 7px 0;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }
        .invoice-info p strong {
          flex-shrink: 0;
        }
        .invoice-info p span {
          min-width: 0;
          overflow-wrap: anywhere;
        }
        .customer-section {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          padding: 20px 0;
        }
        .customer-box {
          border: 1px solid #ddd;
          padding: 15px;
          min-width: 0;
          overflow-wrap: anywhere;
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
          min-width: 0;
          overflow-x: auto;
          margin-top: 10px;
        }
        .product-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          table-layout: fixed;
        }
        .product-table th {
          background: #f1f1f1;
          font-weight: 700;
          text-align: left;
        }
        .product-table th, .product-table td {
          border: 1px solid #ccc;
          padding: 11px 9px;
          overflow-wrap: anywhere;
        }
        .product-table .serial-column {
          width: 7%;
        }
        .product-table .weight-column {
          width: 15%;
        }
        .product-table .qty-column {
          width: 12%;
        }
        .product-table .amount-column {
          width: 20%;
        }
        .product-table td:first-child, .product-table td:nth-child(3), .product-table td:nth-child(4) {
          text-align: center;
        }
        .product-table th:last-child, .product-table td:last-child {
          text-align: right;
        }
        .product-table .amount-cell {
          font-weight: 600;
        }
        .empty-row {
          text-align: center !important;
          padding: 20px !important;
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
        .total-row strong {
          text-align: right;
          overflow-wrap: anywhere;
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
          display: flex;
          align-items: flex-start;
          gap: 5px;
          font-size: 12px;
          margin: 7px 0;
          overflow-wrap: anywhere;
        }
        .payment-section p strong {
          flex-shrink: 0;
        }
        .payment-section p span {
          min-width: 0;
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
        @media (max-width: 768px) {
          .invoice-page {
            padding: 18px 12px;
          }
          .invoice-container {
            padding: 25px 20px;
          }
          .company-header {
            gap: 18px;
          }
          .company-logo {
            width: 105px;
          }
          .company-details h1 {
            font-size: 21px;
          }
          .invoice-info {
            gap: 12px;
          }
          .customer-section {
            gap: 12px;
          }
          .customer-box {
            padding: 12px;
          }
        }
        @media (max-width: 600px) {
          .invoice-page {
            padding: 12px 8px;
          }
          .invoice-actions {
            gap: 8px;
            margin-bottom: 12px;
          }
          .invoice-actions button {
            padding: 11px 13px;
            font-size: 12px;
          }
          .invoice-container {
            padding: 16px 12px;
            border-radius: 4px;
          }
          .company-header {
            align-items: center;
            gap: 10px;
            padding-bottom: 14px;
          }
          .company-logo {
            width: 75px;
          }
          .company-logo img {
            max-height: 75px;
          }
          .company-logo h2 {
            font-size: 11px;
          }
          .company-details h1 {
            font-size: 16px;
            letter-spacing: 0.3px;
            margin-bottom: 6px;
          }
          .company-details p {
            font-size: 10px;
            margin: 3px 0;
            line-height: 1.4;
          }
          .invoice-title {
            padding: 14px 0;
          }
          .invoice-title h2 {
            font-size: 19px;
          }
          .invoice-title span {
            font-size: 10px;
          }
          .invoice-info {
            grid-template-columns: 1fr;
            gap: 5px;
            padding: 13px 0;
          }
          .invoice-info p {
            font-size: 11px;
            margin: 6px 0;
          }
          .customer-section {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 14px 0;
          }
          .customer-box {
            padding: 12px;
          }
          .customer-box h3 {
            font-size: 13px;
            margin-bottom: 9px;
          }
          .customer-box p {
            font-size: 11px;
            line-height: 1.5;
          }
          .product-table-wrapper {
            overflow-x: hidden;
            margin-top: 5px;
          }
          .product-table {
            width: 100%;
            min-width: 0;
            table-layout: fixed;
            font-size: 11px;
          }
          .product-table thead th {
            font-size: 10px;
            padding: 9px 4px;
            white-space: normal;
            overflow-wrap: anywhere;
          }
          .product-table .serial-column {
            width: 9%;
          }
          .product-table .weight-column {
            width: 19%;
          }
          .product-table .qty-column {
            width: 11%;
          }
          .product-table .amount-column {
            width: 29%;
          }
          .product-table th, .product-table td {
            padding: 9px 5px;
            font-size: 10px;
            overflow-wrap: anywhere;
            word-break: normal;
          }
          .product-table .product-name {
            font-size: 10px;
            line-height: 1.4;
          }
          .product-table .amount-cell {
            font-size: 10px;
          }
          .empty-row {
            padding: 14px 5px !important;
          }
          .total-section {
            width: 100%;
            margin: 16px 0;
          }
          .total-row {
            font-size: 12px;
            padding: 8px 0;
          }
          .grand-total {
            font-size: 15px;
            padding: 11px 0;
          }
          .payment-section {
            padding: 14px 0;
          }
          .payment-section h3 {
            font-size: 14px;
          }
          .payment-section p {
            font-size: 11px;
            line-height: 1.5;
          }
          .invoice-footer {
            margin-top: 10px;
            padding-top: 15px;
          }
          .invoice-footer h3 {
            font-size: 15px;
          }
          .invoice-footer p {
            font-size: 10px;
            line-height: 1.5;
          }
          .signature {
            margin-top: 25px;
          }
          .signature p {
            font-size: 11px;
          }
        }
        @media (max-width: 380px) {
          .invoice-page {
            padding: 8px 5px;
          }
          .invoice-container {
            padding: 13px 9px;
          }
          .company-logo {
            width: 65px;
          }
          .company-details h1 {
            font-size: 14px;
          }
          .company-details p {
            font-size: 9px;
          }
          .product-table th, .product-table td {
            padding: 8px 3px;
            font-size: 9px;
          }
          .product-table .product-name, .product-table .amount-cell {
            font-size: 9px;
          }
          .product-table .amount-column {
            width: 30%;
          }
          .invoice-info p {
            font-size: 10px;
          }
          .customer-box p {
            font-size: 10px;
          }
        }
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          html, body {
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          body * {
            visibility: hidden !important;
          }
          .invoice-page, .invoice-container, .invoice-container * {
            visibility: visible !important;
          }
          .invoice-page {
            position: static !important;
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
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
          .no-print, .invoice-actions {
            display: none !important;
            visibility: hidden !important;
          }
          .company-header {
            display: flex !important;
          }
          .invoice-info {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .customer-section {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .product-table-wrapper {
            overflow: visible !important;
          }
          .product-table {
            width: 100% !important;
            min-width: 0 !important;
            display: table !important;
            table-layout: fixed !important;
          }
          .product-table thead {
            display: table-header-group !important;
          }
          .product-table tbody {
            display: table-row-group !important;
          }
          .product-table tr {
            display: table-row !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .product-table th, .product-table td {
            display: table-cell !important;
          }
          .product-table th, .product-table td {
            font-size: 11px !important;
            padding: 8px !important;
          }
          .company-header, .invoice-title, .invoice-info, .customer-section, .product-table, .total-section, .payment-section, .invoice-footer {
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
          .total-section {
            width: 300px !important;
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