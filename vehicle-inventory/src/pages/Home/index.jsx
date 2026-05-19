import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  ShoppingCart,
  Package,
  Tag,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import "./index.css";
import CartModal from "./PartsModal/index.jsx";

//  Helpers

function fmtPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function stockLabel(qty) {
  if (qty === 0) return { text: "Out of Stock", cls: "ch-stock ch-stock--out" };
  if (qty <= 10) return { text: `Low Stock (${qty})`, cls: "ch-stock ch-stock--low" };
  return { text: "In Stock", cls: "ch-stock ch-stock--ok" };
}

const SORT_OPTIONS = [
  { value: "name-asc",   label: "Name (A → Z)" },
  { value: "name-desc",  label: "Name (Z → A)" },
  { value: "price-asc",  label: "Price (Low → High)" },
  { value: "price-desc", label: "Price (High → Low)" },
  { value: "stock-desc", label: "Stock (High → Low)" },
];


export default function CustomerHome() {
  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("All");
  const [sort, setSort]             = useState("name-asc");
  const [view, setView]             = useState("grid"); // "grid" | "list"
  const [cartItems, setCartItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [allParts, setAllParts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

    const loadParts = useCallback(async () => {
        setLoading(true);
        setFetchError("");
        try {
            const res = await fetch("http://localhost:5047/api/Parts");
            if (!res.ok) throw new Error("Failed to fetch parts.");
            const data = await res.json();
            setAllParts(data);
            const cats = ["All", ...new Set(data.map(p => p.category).filter(Boolean))];
            setCategories(cats);
        } catch (err) {
            setFetchError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadParts(); }, [loadParts]);
  
    //  Filter & sort 
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = allParts.filter((p) => {
      const matchCat = category === "All" || p.category === category;
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "name-asc":   return a.name.localeCompare(b.name);
        case "name-desc":  return b.name.localeCompare(a.name);
        case "price-asc":  return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "stock-desc": return b.stockQuantity - a.stockQuantity;
        default:           return 0;
      }
    });

    return list;
  }, [search, category, sort]);

  const addToCart = (part) => {
    setCartItems(prev => [...prev, part]);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => {
      const idx = prev.findLastIndex(p => p.id === id);

      if (idx === -1) return prev;

      return prev.filter((_, i) => i !== idx);
    });
  };

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const cartTotal = cartItems.reduce((sum, p) => sum + p.price, 0);

  const clearCart = () => setCartItems([]);

  const handleCheckout = async (cartItems) => {
    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));

    // ASP.NET Identity's standard claim for user ID
    const customerId = Number(
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
    );

    if (!customerId) throw new Error("Could not determine user ID. Please log in again.");

    const res = await fetch("http://localhost:5047/api/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        customerId,
        items: cartItems.map(p => ({
          partId: p.id,
          quantity: 1,
        })),
      }),
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "Checkout failed.");
    }

    clearCart();
  };

  //  Render 
  return (
    <div className="ch-page">
      {/* ── Top bar ── */}
      <div className="ch-topbar">
        <div className="ch-topbar-left">
          <div>
            <h1 className="ch-page-title">Parts Catalogue</h1>
            <p className="ch-page-subtitle">
              {filtered.length} part{filtered.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        <div className="ch-topbar-right">
          {/* Search */}
          <div className="ch-search-wrap">
            <Search size={14} className="ch-search-icon" />
            <input
              className="ch-search"
              type="text"
              placeholder="Search parts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Cart pill */}
          <button className="ch-cart-btn" type="button" onClick={() => setCartOpen(true)}>
            <ShoppingCart size={15} />
            {cartItems.length > 0 && (
              <span className="ch-cart-count">{cartItems.length}</span>
            )}
          </button>
        </div>
      </div>

        {fetchError && <div className="ch-error-banner">{fetchError}</div>}
        {loading && <div className="ch-loading">Loading parts…</div>}

        {/* ── Toolbar ── */}
        <div className="ch-toolbar">
        {/* Category tabs */}
        <div className="ch-cats">
            {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`ch-cat-tab${category === cat ? " ch-cat-tab--active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="ch-toolbar-right">
          {/* Sort */}
          <div className="ch-select-wrap">
            <select
              className="ch-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className="ch-view-toggle">
            <button
              type="button"
              className={`ch-view-btn${view === "grid" ? " ch-view-btn--active" : ""}`}
              onClick={() => setView("grid")}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              className={`ch-view-btn${view === "list" ? " ch-view-btn--active" : ""}`}
              onClick={() => setView("list")}
              title="List view"
            >
              <LayoutList size={15} />
            </button>
          </div>
        </div>
      </div>

      {/*  Empty state  */}
      {filtered.length === 0 && (
        <div className="ch-empty">
          <Package size={40} className="ch-empty-icon" />
          <p className="ch-empty-text">No parts match your search.</p>
          <button
            className="ch-btn ch-btn--ghost"
            type="button"
            onClick={() => { setSearch(""); setCategory("All"); }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Grid View */}
      {view === "grid" && filtered.length > 0 && (
        <div className="ch-grid">
          {filtered.map((part) => {
            const stock   = stockLabel(part.stockQuantity);
            const inCart = cartItems.some(p => p.id === part.id);
            const isOpen  = expandedId === part.id;

            return (
              <div key={part.id} className={`ch-card${isOpen ? " ch-card--open" : ""}`}>
                {/* Category chip */}
                <div className="ch-card-top">
                  <span className="ch-chip">
                    <Tag size={10} />
                    {part.category}
                  </span>
                  <span className={stock.cls}>{stock.text}</span>
                </div>

                <h3 className="ch-card-name">{part.name}</h3>

                {/* Description expand/collapse */}
                <div className={`ch-card-desc-wrap${isOpen ? " ch-card-desc-wrap--open" : ""}`}>
                  <p className="ch-card-desc">{part.description}</p>
                </div>
                <button
                  type="button"
                  className="ch-expand-btn"
                  onClick={() => toggleExpand(part.id)}
                >
                  {isOpen ? (
                    <><ChevronUp size={12} /> Less</>
                  ) : (
                    <><ChevronDown size={12} /> More</>
                  )}
                </button>

                <div className="ch-card-footer">
                  <span className="ch-price">{fmtPrice(part.price)}</span>
                  <button
                    type="button"
                    className={`ch-btn${inCart ? " ch-btn--remove" : " ch-btn--add"}`}
                    disabled={part.stockQuantity === 0}
                    onClick={() =>
                      inCart ? removeFromCart(part.id) : addToCart(part)
                    }
                  >
                    <ShoppingCart size={13} />
                    {inCart ? "Remove" : "Add"}
                  </button>
                </div>

                {part.stockQuantity <= 10 && part.stockQuantity > 0 && (
                  <div className="ch-low-banner">
                    <AlertCircle size={12} /> Only {part.stockQuantity} left — order soon
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {view === "list" && filtered.length > 0 && (
        <div className="ch-list-card">
          <div className="ch-table-wrap">
            <table className="ch-table">
              <thead>
                <tr>
                  <th>Part Name</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className="ch-th-right">Price</th>
                  <th className="ch-th-center">Stock</th>
                  <th className="ch-th-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((part) => {
                  const stock  = stockLabel(part.stockQuantity);
                  const inCart = cartItems.some(p => p.id === part.id);
                  return (
                    <tr key={part.id} className="ch-row">
                      <td className="ch-td-name">{part.name}</td>
                      <td>
                        <span className="ch-chip">
                          <Tag size={10} />
                          {part.category}
                        </span>
                      </td>
                      <td className="ch-td-desc">{part.description || "—"}</td>
                      <td className="ch-td-right ch-price">{fmtPrice(part.price)}</td>
                      <td className="ch-td-center">
                        <span className={stock.cls}>{stock.text}</span>
                      </td>
                      <td className="ch-td-center">
                        <button
                          type="button"
                          className={`ch-btn ch-btn--sm${inCart ? " ch-btn--remove" : " ch-btn--add"}`}
                          disabled={part.stockQuantity === 0}
                          onClick={() =>
                            inCart ? removeFromCart(part.id) : addToCart(part)
                          }
                        >
                          <ShoppingCart size={12} />
                          {inCart ? "Remove" : "Add"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Cart Drawer */}
      {cartOpen && (
        <CartModal
          cartItems={cartItems}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onAdd={addToCart}
          onCheckout={handleCheckout}
        />
      )}
    </div>
  );
}