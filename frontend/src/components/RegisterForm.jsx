import { useState } from "react";
import { registerUser } from "../services/api";
import { Form, Button, Card, Alert, Image } from "react-bootstrap";
import logo from "../assets/logo2.png";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await registerUser(username, password);
    setMsg(data.message || "Usuario registrado correctamente");
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
        <h3 className="fw-bold">Crear Cuenta</h3>
        <p className="small">Únete y compite adivinando canciones 🎧</p>
      </div>

      {msg && <Alert variant="info">{msg}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="username" className="mb-3">
          <Form.Label>Usuario</Form.Label>
          <Form.Control
            type="text"
            placeholder="Elige un nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="password" className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            placeholder="Crea una contraseña segura"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button
          variant="success"
          type="submit"
          className="w-100 mt-2 fw-semibold"
        >
          Crear cuenta
        </Button>
      </Form>
    </Card>
  );
}
