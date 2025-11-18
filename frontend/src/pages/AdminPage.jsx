import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../services/api";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import AdminPanel from "../components/AdminPanel";
import { Container, Spinner, Alert } from "react-bootstrap";

export default function AdminPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const userData = await getProfile(token);
        setProfile(userData);

        // Verificar si es admin
        if (userData.username !== "admin") {
          navigate("/home");
        }
      } catch (error) {
        console.error("❌ Error:", error);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a1a, #111132, #000)",
        color: "#fff",
        paddingTop: "100px",
      }}
    >
      <AppNavbar />
      <Container className="d-flex flex-column align-items-center mt-5">
        {loading ? (
          <div className="d-flex flex-column align-items-center gap-3">
            <Spinner animation="border" variant="info" />
            <p className="text-muted">Verificando permisos...</p>
          </div>
        ) : profile && profile.username === "admin" ? (
          <>
            <div className="text-center mb-4">
              <h1 className="text-info fw-bold">⚙️ Panel de Administración</h1>
              <p className="text-muted">Gestiona las canciones de GuessBeat</p>
            </div>
            <AdminPanel />
          </>
        ) : (
          <Alert variant="danger">
            ❌ No tienes permisos para acceder a esta página
          </Alert>
        )}
      </Container>
      <Footer />
    </div>
  );
}
