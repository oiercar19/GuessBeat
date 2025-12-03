import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProfile, getCategories } from "../services/api";
import AppNavbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Container, Spinner, Card } from "react-bootstrap";
import "./HomePage.css";

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
        console.log("📋 Categorías cargadas:", cats);
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

  const categoryImages = {
    1: "julio.webp",
    2: "calendario.webp",
    3: "70s80s.jpg",
  };

  return (
    <div className="home-page">
      <AppNavbar />
      <Container className="home-page__container">
        <Card className="profile-card p-4 text-center text-white shadow-lg mb-5">
          {loading ? (
            <div className="profile-card__loading">
              <Spinner animation="border" variant="info" />
              <p className="profile-card__loading-text">Cargando perfil...</p>
            </div>
          ) : profile ? (
            <>
              <h2 className="profile-card__title">Bienvenido a GuessBeat 🎶</h2>
              <p className="profile-card__username">
                Hola, <b>{profile.username}</b>
              </p>
              <p className="profile-card__points">
                Puntos: <span className="profile-card__points-value">{profile.stats}</span>
              </p>
            </>
          ) : (
            <p className="profile-card__error">Error al cargar el perfil</p>
          )}
        </Card>

        {!loading && categories.length > 0 && (
          <>
            <h3 className="game-modes-title">🎮 Modos de Juego</h3>

            <div className="game-modes-grid">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="game-card"
                  onClick={() => navigate(`/game/${cat.id}`)}
                >
                  <img
                    src={categoryImages[cat.id] || "https://upload.wikimedia.org/wikipedia/commons/c/c9/Moon.jpg"}
                    alt={cat.name}
                    className="game-card__image"
                  />

                  <div className="game-card__overlay">
                    <h4 className="game-card__title">{cat.name}</h4>
                    <p className="game-card__description">{cat.description}</p>
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