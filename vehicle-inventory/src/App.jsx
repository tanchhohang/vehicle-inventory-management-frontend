import { Routes, Route } from "react-router-dom";
import CustomerRegister from "./pages/Authentication/customer-register";
import Login from "./pages/Authentication/customer-login";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<CustomerRegister />} />
    </Routes>
  );
}

export default App;