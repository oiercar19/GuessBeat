import LoginForm from "../components/LoginForm";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";

export default function LoginPage() {
  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center justify-content-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #1a1a40, #2e2e72, #000)",
      }}
    >
      <LoginForm />
      <p className="text-light mt-4">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="text-info fw-semibold">
          Regístrate aquí
        </Link>
      </p>
    </Container>
  );
}
