import { X, Trash2, Package, ShoppingCart, Plus, Minus } from "lucide-react";
import { useState, useMemo } from "react";

function fmtPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

export default function CartModal({ cartItems, onClose, onRemove, onAdd, onCheckout }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const grouped = useMemo(() => {
    const map = {};
    for (const item of cartItems) {
      if (map[item.id]) {
        map[item.id].qty += 1;
      } else {
        map[item.id] = { item, qty: 1 };
      }
    }
    return Object.values(map);
  }, [cartItems]);

  const total = cartItems.reduce((sum, p) => sum + p.price, 0);
  const totalItems = cartItems.length;

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
              {totalItems} item{totalItems !== 1 ? "s" : ""} in your cart
            </p>
          </div>
          <button className="cm-close" onClick={onClose} type="button" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="cm-body">
          {grouped.length === 0 ? (
            <div className="cm-empty">
              <Package size={38} className="cm-empty-icon" />
              <p className="cm-empty-text">Your cart is empty.</p>
            </div>
          ) : (
            <>
              {grouped.map(({ item, qty }) => (
                <div key={item.id} className="cm-item">
                  <div className="cm-item-info">
                    <span className="cm-item-name">{item.name}</span>
                    <span className="cm-item-unit-price">{fmtPrice(item.price)} each</span>
                  </div>
                  <div className="cm-item-right">
                    <div className="cm-qty-control">
                      <button
                        type="button"
                        className="cm-qty-btn"
                        onClick={() => onRemove(item.id)}
                        aria-label="Decrease quantity"
                      >
                        {qty === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                      </button>
                      <span className="cm-qty-value">{qty}</span>
                      <button
                        type="button"
                        className="cm-qty-btn"
                        onClick={() => onAdd(item)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="cm-item-price">{fmtPrice(item.price * qty)}</span>
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
        {error && <p className="cm-error">{error}</p>}
        <div className="cm-footer">
          <button className="cm-btn cm-btn--secondary" type="button" onClick={onClose}>
            Continue Shopping
          </button>
          <button
            className="cm-btn cm-btn--primary"
            type="button"
            disabled={grouped.length === 0 || loading}
            onClick={handleCheckout}
          >
            <ShoppingCart size={14} />
            {loading ? "Processing…" : "Checkout"}
          </button>
        </div>

      </div>
    </div>
  );
}