import { Navigate } from "react-router-dom";
import NavBar from "../components/NavBar";

function ProtectedRoute({ children, noLayout = false }) {
  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (noLayout) {
      return children;
  }

  return (
    <>
      <NavBar />
      <div style={{ padding: "20px" }}>
        {children}
      </div>
    </>
  );
}

export default ProtectedRoute;
