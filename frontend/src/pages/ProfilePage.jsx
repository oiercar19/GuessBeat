import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Image, Row, Col, Alert } from "react-bootstrap";
import { getProfile, updateProfile } from "../services/api";
import AppNavbar from "../components/Navbar";
import "./ProfilePage.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getProfile();
        setUser(data);
        setUsername(data.username);
        setEmail(data.email || "");
        setAvatarIndex(data.avatarIndex || 0);
      } catch (err) {
        console.error("Error al cargar perfil:", err);
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateProfile({ username, email, password, avatarIndex });
      setMsg(updated.message);
      setError("");
      setPassword("");
      localStorage.setItem("avatarIndex", avatarIndex);
      navigate("/home");
    } catch (err) {
      setError(err.message);
      setMsg("");
    }
  };

  return (
    <div className="profile-page">
      <AppNavbar />
      <Container className="profile-page__container">
        <Card className="profile-card p-4 shadow-lg text-white w-100">
          <h3 className="profile-card__title">👤 Mi Perfil</h3>

          {msg && <Alert variant="success">{msg}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          {user ? (
            <Form onSubmit={handleSubmit}>
              <div className="profile-card__avatar-section">
                <Image
                  src={`/avatars/${avatarIndex}.jpg`}
                  width={100}
                  height={100}
                  roundedCircle
                  className="profile-card__avatar shadow-sm"
                  alt="Avatar"
                />
                <p className="profile-card__points">
                  Puntos: <span className="profile-card__points-value">{user.stats}</span>
                </p>
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="profile-card__form-label">Usuario</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="profile-card__input"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="profile-card__form-label">Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="profile-card__input"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="profile-card__form-label">Nueva contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Dejar vacío para no cambiar"
                  className="profile-card__input"
                />
              </Form.Group>

              <h5 className="profile-card__avatar-title">🎨 Selecciona tu avatar (-500 puntos)</h5>
              <Row className="profile-card__avatar-grid">
                {Array.from({ length: 18 }, (_, idx) => idx + 1).map((i) => (
                  <Col key={i} xs={4} md={2} className="mb-3">
                    <Image
                      src={`/avatars/${i}.jpg`}
                      width={70}
                      height={70}
                      roundedCircle
                      className={`avatar-option shadow-sm ${
                        avatarIndex === i 
                          ? "avatar-option--selected" 
                          : "avatar-option--unselected"
                      }`}
                      onClick={() => setAvatarIndex(i)}
                      alt={`Avatar ${i}`}
                    />
                  </Col>
                ))}
              </Row>

              <Button
                variant="info"
                type="submit"
                className="profile-card__submit-button"
              >
                💾 Guardar cambios
              </Button>
            </Form>
          ) : (
            <p className="profile-card__loading">Cargando perfil...</p>
          )}
        </Card>
      </Container>
    </div>
  );
}