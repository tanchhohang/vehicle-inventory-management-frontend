const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: "#002B51",
        color: "#fff",
        textAlign: "center",
        padding: "16px 32px",
        fontSize: "0.9rem",
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      © {new Date().getFullYear()} Wheels. All rights reserved.
    </footer>
  );
};

export default Footer;