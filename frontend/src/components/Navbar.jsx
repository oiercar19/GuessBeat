import { useNavigate } from "react-router-dom";
import { Container, Navbar, Button, Image, Nav } from "react-bootstrap";
import logo from "../assets/logo2.png";

export default function AppNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      fixed="top"
      className="shadow-sm py-3"
      style={{
        background:
          "linear-gradient(90deg, rgba(25,25,40,1) 0%, rgba(60,60,120,1) 100%)",
      }}
    >
      <Container>
        {/* Logo + título */}
        <Navbar.Brand
          href="/home"
          className="d-flex align-items-center text-light fw-bold fs-4"
          style={{ cursor: "pointer" }}
        >
          <Image
            src={logo}
            alt="GuessBeat Logo"
            width="40"
            height="40"
            roundedCircle
            className="me-2"
          />
          GuessBeat
        </Navbar.Brand>

        {/* Botones a la derecha */}
        <Nav className="ms-auto d-flex align-items-center gap-2">
          <Button
            variant="outline-info"
            onClick={() => navigate("/chat")}
            className="fw-semibold"
          >
            💬 Chat
          </Button>
          <Button
            variant="outline-warning"
            onClick={() => navigate("/ranking")}
          >
            🏆 Ranking
          </Button>
          <Button
            variant="outline-danger"
            onClick={handleLogout}
            className="fw-semibold"
          >
            Cerrar sesión
          </Button>
          <Image
            src={`/avatars/${localStorage.getItem("avatarIndex") || 0}.png`}
            width="40"
            height="40"
            roundedCircle
            className="me-3 border border-2 border-info"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          />
        </Nav>
      </Container>
    </Navbar>
  );
}
