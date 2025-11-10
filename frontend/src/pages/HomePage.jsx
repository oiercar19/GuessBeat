import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProfile, getCategories } from "../services/api";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Container, Spinner, Card } from "react-bootstrap";

export default function HomePage() {
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const initAuth = async () => {
      const tokenFromUrl = searchParams.get("token");
      if (tokenFromUrl) {
        localStorage.setItem("token", tokenFromUrl);
        window.history.replaceState({}, "", "/home");
      }

      await new Promise((res) => setTimeout(res, 50));

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const userData = await getProfile(token);
        setProfile(userData);
        localStorage.setItem("username", userData.username);
        localStorage.setItem("avatarIndex", userData.avatarIndex ?? 0);

        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("❌ Error:", error);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [searchParams, navigate]);

  // 🖼️ Imagenes para cada categoría (usa las tuyas o links de stock)
  const categoryImages = {
    1: "julio.webp", // Música en español
    2: "rock.jpg",    // Rock
    3: "70s80s.jpg",   // Años 70 y 80
  };

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
        <Card
          className="p-4 text-center text-white shadow-lg mb-5"
          style={{
            background: "rgba(25,25,40,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            maxWidth: "500px",
            borderRadius: "20px",
          }}
        >
          {loading ? (
            <div className="d-flex flex-column align-items-center gap-3">
              <Spinner animation="border" variant="info" />
              <p className="text-muted">Cargando perfil...</p>
            </div>
          ) : profile ? (
            <>
              <h2 className="text-info mb-3 fw-bold">Bienvenido a GuessBeat 🎶</h2>
              <p className="fs-5">
                Hola, <b>{profile.username}</b>
              </p>
              <p className="fs-4 mb-0">
                Puntos: <span className="text-warning">{profile.stats}</span>
              </p>
            </>
          ) : (
            <p className="text-danger">Error al cargar el perfil</p>
          )}
        </Card>

        {!loading && categories.length > 0 && (
          <>
            <h3 className="text-info mb-4 fw-bold text-uppercase">
              🎮 Modos de Juego
            </h3>

            <div
              className="d-grid gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                width: "100%",
                maxWidth: "1000px",
              }}
            >
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="game-card"
                  onClick={() => navigate(`/game/${cat.id}`)}
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    overflow: "hidden",
                    borderRadius: "12px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.6)",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow =
                      "0 0 25px rgba(13,202,240,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 0 10px rgba(0,0,0,0.6)";
                  }}
                >
                  {/* Imagen de fondo */}
                  <img
                    src={categoryImages[cat.id] || "https://upload.wikimedia.org/wikipedia/commons/c/c9/Moon.jpg"}
                    alt={cat.name}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      filter: "brightness(0.6)",
                      transition: "filter 0.3s ease",
                    }}
                    className="game-card-img"
                  />

                  {/* Filtro y texto */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.7))",
                    }}
                  >
                    <h4
                      className="fw-bold mb-1"
                      style={{
                        color: "#0dcaf0",
                        textShadow: "0 0 10px rgba(13,202,240,0.8)",
                        fontSize: "1.4rem",
                      }}
                    >
                      {cat.name}
                    </h4>
                    <p
                      className="small"
                      style={{
                        color: "#e0e0e0",
                        textShadow: "0 0 5px rgba(0,0,0,0.8)",
                        fontStyle: "italic",
                      }}
                    >
                      {cat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Container>
      <Footer />
    </div>
  );
}
