import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut} from "lucide-react";
import wheelsImg from "../../assets/white-wheels.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  return (
    <nav style={{
      backgroundColor: "#002B51",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 32px",
      fontFamily: "'Manrope', sans-serif"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <img src={wheelsImg} alt="Wheels" style={{ height: "40px" }} />
        <span style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 500, letterSpacing: "2px" }}>
          WHEELS
        </span>
      </div>

      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <Link to="/user-management" style={linkStyle}>User Management</Link>

        {/* Operations Dropdown */}
        <div
          style={{ position: "relative" }}
          onMouseEnter={() => setOpenDropdown("operations")}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <span style={{ ...linkStyle, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            Operations <ChevronDown size={16} />
          </span>
          {openDropdown === "operations" && (
            <div style={dropdownMenu}>
              <Link to="/appointments" style={dropdownLinkStyle}>Appointments</Link>
              <Link to="/reviews" style={dropdownLinkStyle}>Reviews</Link>
              <Link to="/purchase-invoices" style={dropdownLinkStyle}>Purchase Invoices</Link>
              <Link to="/customer-reports" style={dropdownLinkStyle}>Customer Reports</Link>
            </div>
          )}
        </div>

        {/* Sales Dropdown */}
        <div
          style={{ position: "relative" }}
          onMouseEnter={() => setOpenDropdown("sales")}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <span style={{ ...linkStyle, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            Sales <ChevronDown size={16} />
          </span>
          {openDropdown === "sales" && (
            <div style={dropdownMenu}>
              <Link to="/parts" style={dropdownLinkStyle}>Parts</Link>
              <Link to="/sales" style={dropdownLinkStyle}>Sales</Link>
            </div>
          )}
        </div>

        <Link to="/vendor" style={linkStyle}>Vendor</Link>

        <LogOut size={20} color="#fff" style={{ cursor: "pointer" }} onClick={() => navigate("/login")} />
      </div>
    </nav>
  );
};

const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  fontSize: "1rem",
};

const dropdownMenu = {
  position: "absolute",
  top: "100%",
  left: 0,
  backgroundColor: "#002B51",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "4px",
  minWidth: "170px",
  zIndex: 10,
};

const dropdownLinkStyle = {
  display: "block",
  color: "#fff",
  textDecoration: "none",
  fontSize: "0.9rem",
  padding: "8px 14px",
};

export default Navbar;