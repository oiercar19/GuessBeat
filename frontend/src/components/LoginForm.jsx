import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, Alert, Image } from "react-bootstrap";
import logo from "../assets/logo2.png";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(""); // limpiar errores anteriores

  try {
    const data = await loginUser(username, password);

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      navigate("/home");
    } else {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    }
  } catch (err) {
    console.error("❌ Error al iniciar sesión:", err);
    if (err.message.includes("401") || err.message.includes("incorrecta")) {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } else {
      setError("Error al conectar con el servidor. Inténtalo más tarde.");
    }
  }
};

  return (
    <Card
      className="p-4 shadow-lg text-white"
      style={{
        maxWidth: "420px",
        width: "100%",
        background: "rgba(25,25,40,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div className="text-center mb-3">
        <Image
          src={logo}
          width={80}
          height={80}
          className="mb-3 border border-3 border-primary rounded-circle shadow-sm"
          alt="GuessBeat Logo"
        />
        <h3 className="fw-bold">Iniciar Sesión</h3>
        <p className="small">Accede para adivinar canciones 🎵</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="username" className="mb-3">
          <Form.Label>Usuario</Form.Label>
          <Form.Control
            type="text"
            placeholder="Introduce tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="password" className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Introduce tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="w-100 mt-2 fw-semibold"
        >
          Entrar
        </Button>
              <Button
        variant="warning"
        className="w-100 mt-3 fw-semibold"
        href="http://localhost:5001/api/auth/soundcloud/login"
      >
        🎧 Iniciar sesión con SoundCloud
      </Button>
      </Form>
    </Card>
  );
}
