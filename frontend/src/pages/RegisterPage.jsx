import RegisterForm from "../components/RegisterForm";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";

export default function RegisterPage() {
  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center justify-content-center min-vh-100"
      style={{
        background: "linear-gradient(135deg, #1a1a40, #2e2e72, #000)",
      }}
    >
      <RegisterForm />
      <p className="text-light mt-4">
        ¿Ya tienes cuenta?{" "}
        <Link to="/" className="text-info fw-semibold">
          Inicia sesión
        </Link>
      </p>
    </Container>
  );
}
