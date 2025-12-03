import RegisterForm from "../components/RegisterForm";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import "./RegisterPage.css";

export default function RegisterPage() {
  return (
    <Container fluid className="register-page">
      <RegisterForm />
      <p className="register-page__login-text">
        ¿Ya tienes cuenta?{" "}
        <Link to="/" className="register-page__login-link">
          Inicia sesión
        </Link>
      </p>
    </Container>
  );
}