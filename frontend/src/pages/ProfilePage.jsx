import { useEffect, useState } from "react";
import { Container, Card, Form, Button, Image, Row, Col, Alert } from "react-bootstrap";
import { getProfile, updateProfile } from "../services/api";
import AppNavbar from "../components/Navbar";

export default function ProfilePage() {
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
    } catch (err) {
      setError(err.message);
      setMsg("");
    }
  };

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
      <Container className="d-flex flex-column align-items-center">
        <Card
          className="p-4 shadow-lg text-white w-100"
          style={{
            background: "rgba(25,25,40,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            maxWidth: "700px",
          }}
        >
          <h3 className="text-center text-info mb-4">👤 Mi Perfil</h3>

          {msg && <Alert variant="success">{msg}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          {user ? (
            <Form onSubmit={handleSubmit}>
              <div className="text-center mb-4">
                <Image
                  src={`/avatars/${avatarIndex}.png`}
                  width={100}
                  height={100}
                  roundedCircle
                  className="border border-3 border-info shadow-sm mb-3"
                  alt="Avatar"
                />
                <p className="text-muted small">
                  Puntos disponibles: <span className="text-warning">{user.stats}</span>
                </p>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Usuario</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-dark text-white border-secondary"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-dark text-white border-secondary"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nueva contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Dejar vacío para no cambiar"
                  className="bg-dark text-white border-secondary"
                />
              </Form.Group>

              <h5 className="text-info mt-4 mb-3">🎨 Selecciona tu avatar</h5>
              <Row className="text-center">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <Col key={i} xs={4} md={2} className="mb-3">
                    <Image
                      src={`/avatars/${i}.png`}
                      width={70}
                      height={70}
                      roundedCircle
                      className={`border ${
                        avatarIndex === i ? "border-3 border-info" : "border-secondary"
                      } shadow-sm avatar-option`}
                      style={{ cursor: "pointer" }}
                      onClick={() => setAvatarIndex(i)}
                    />
                  </Col>
                ))}
              </Row>

              <Button
                variant="info"
                type="submit"
                className="w-100 mt-3 fw-semibold"
              >
                💾 Guardar cambios
              </Button>
            </Form>
          ) : (
            <p className="text-center text-muted">Cargando perfil...</p>
          )}
        </Card>
      </Container>
    </div>
  );
}
