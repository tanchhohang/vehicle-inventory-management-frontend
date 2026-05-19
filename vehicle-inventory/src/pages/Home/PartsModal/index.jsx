import { X, Trash2, Package, ShoppingCart, Tag } from "lucide-react";
import { useState } from "react";

function fmtPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

export default function CartModal({ cartItems, onClose, onRemove, onCheckout }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const total = cartItems.reduce((sum, p) => sum + p.price, 0);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      await onCheckout(cartItems);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="cm-backdrop" onClick={handleBackdropClick}>
      <div className="cm-modal">

        {/* Header */}
        <div className="cm-header">
          <div>
            <h2 className="cm-title">Your Cart</h2>
            <p className="cm-subtitle">
              {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <button className="cm-close" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="cm-body">
          {cartItems.length === 0 ? (
            <div className="cm-empty">
              <Package size={38} className="cm-empty-icon" />
              <p className="cm-empty-text">Your cart is empty.</p>
            </div>
          ) : (
            <>
              {cartItems.map((p) => (
                <div key={p.id} className="cm-item">
                  <div className="cm-item-info">
                    <span className="cm-item-name">{p.name}</span>
                    {/* <span className="ch-chip">
                      <Tag size={10} />
                      {p.category}
                    </span> */}
                  </div>
                  <div className="cm-item-right">
                    <span className="cm-item-price">{fmtPrice(p.price)}</span>
                    <button
                      type="button"
                      className="cm-remove-btn"
                      onClick={() => onRemove(p.id)}
                      title="Remove from cart"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              <div className="cm-total-row">
                <span className="cm-total-label">Total</span>
                <span className="cm-total-price">{fmtPrice(total)}</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="cm-footer">
          <button className="cm-btn cm-btn--secondary" type="button" onClick={onClose}>
            Continue Shopping
          </button>
          <button
            className="cm-btn cm-btn--primary"
            type="button"
            disabled={cartItems.length === 0 || loading}
            onClick={handleCheckout}
          >
            <ShoppingCart size={14} />
            {loading ? "Processing…" : "Checkout"}
          </button>

          {/* show error if any, above the footer: */}
          {error && <p style={{ color: "red", fontSize: 13, padding: "0 24px" }}>{error}</p>}
        </div>

      </div>
    </div>
  );
}