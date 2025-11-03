import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProfile } from "../services/api";
import AppNavbar from "../components/Navbar";
import { Container, Spinner, Card } from "react-bootstrap";

export default function HomePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const initAuth = async () => {
      // 1️⃣ Capturar token de la URL (OAuth)
      const tokenFromUrl = searchParams.get("token");
      if (tokenFromUrl) {
        console.log("✅ Token recibido de OAuth");
        localStorage.setItem("token", tokenFromUrl);
        // Limpiar la URL sin recargar la página
        window.history.replaceState({}, "", "/home");
      }

      // 2️⃣ Esperar un microtick para garantizar que localStorage se actualizó
      await new Promise((res) => setTimeout(res, 50));

      // 3️⃣ Obtener token de localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ No hay token, redirigiendo al login");
        navigate("/login");
        return;
      }

      // 4️⃣ Obtener perfil
      try {
        console.log("📡 Solicitando perfil con token...");
        const userData = await getProfile(token); // ✅ le pasamos el token
        setProfile(userData);
        console.log("✅ Perfil cargado:", userData);
      } catch (error) {
        console.error("❌ Error al obtener perfil:", error);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #111, #1a1a40, #000)",
        color: "#fff",
        paddingTop: "100px",
      }}
    >
      <AppNavbar />
      <Container className="d-flex flex-column align-items-center justify-content-center mt-5">
        <Card
          className="p-4 text-center text-white shadow-lg"
          style={{
            background: "rgba(25,25,40,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            maxWidth: "500px",
          }}
        >
          <h2 className="text-info mb-3">Bienvenido a GuessBeat 🎶</h2>
          {loading ? (
            <div className="d-flex flex-column align-items-center gap-3">
              <Spinner animation="border" variant="info" />
              <p className="text-muted">Cargando perfil...</p>
            </div>
          ) : profile ? (
            <div>
              <p className="fs-5">
                Hola, <b>{profile.username}</b>
              </p>
              <p className="fs-4">
                Tus puntos: <span className="text-warning">{profile.stats}</span>
              </p>
            </div>
          ) : (
            <p className="text-danger">Error al cargar el perfil</p>
          )}
        </Card>
      </Container>
    </div>
  );
}
