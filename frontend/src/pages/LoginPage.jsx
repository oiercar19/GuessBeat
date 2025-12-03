import LoginForm from "../components/LoginForm";
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import "./LoginPage.css";

export default function LoginPage() {
  return (
    <Container fluid className="login-page">
      <LoginForm />
      <p className="login-page__register-text">
        ¿No tienes cuenta?{" "}
        <Link to="/register" className="login-page__register-link">
          Regístrate aquí
        </Link>
      </p>
    </Container>
  );
}