import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { Form, Button, Card, Alert, Image } from "react-bootstrap";
import logo from "../assets/logo2.png";

import "./RegisterForm.css";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser(username, email, password);
      setMsg(data.message || "Usuario registrado correctamente 🎉");
      setError("");
      navigate("/");
    } catch (err) {
      setError(err.message);
      setMsg("");
    }
  };

  return (
    <Card className="register-card p-4 shadow-lg text-white">
      <div className="register-header text-center mb-3">
        <Image
          src={logo}
          width={80}
          height={80}
          className="register-logo mb-3 rounded-circle shadow-sm"
          alt="GuessBeat Logo"
        />
        <h3 className="fw-bold">Crear Cuenta</h3>
        <p className="small">Únete y compite adivinando canciones 🎧</p>
      </div>

      {msg && <Alert variant="success">{msg}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

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

        <Form.Group controlId="email" className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Introduce tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <Button variant="success" type="submit" className="w-100 mt-2 fw-semibold">
          Crear cuenta
        </Button>
      </Form>
    </Card>
  );
}
