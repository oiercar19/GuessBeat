import { useNavigate } from "react-router-dom";
import { Container, Navbar, Button, Image, Nav } from "react-bootstrap";
import logo from "../assets/logo2.png";
import "./Navbar.css"; 

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
      className="shadow-sm app-navbar"
    >
      <Container fluid>
        <div className="navbar-header-custom">
          {/* Logo + título */}
          <Navbar.Brand
            href="/home"
            className="navbar-brand-custom"
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

          <div className="navbar-right-section">
            {/* Avatar visible en móvil */}
            <Image
              src={`/avatars/${localStorage.getItem("avatarIndex") || 0}.jpg`}
              width="40"
              height="40"
              roundedCircle
              className="avatar-mobile"
              onClick={() => navigate("/profile")}
            />

            {/* Botón hamburguesa */}
            <Navbar.Toggle aria-controls="navbar-nav" className="border-0" />
          </div>
        </div>

        {/* Menú colapsable */}
        <Navbar.Collapse id="navbar-nav">
          <Nav className="nav-buttons-container">
            <Button variant="outline-info" onClick={() => navigate("/chat")} size="sm" className="nav-btn">
              💬 Chat
            </Button>

            <Button variant="outline-warning" onClick={() => navigate("/ranking")} size="sm" className="nav-btn">
              🏆 Ranking
            </Button>

            {localStorage.getItem("username") === "admin" && (
              <Button
                variant="outline-success"
                onClick={() => navigate("/admin")}
                size="sm"
                className="nav-btn"
              >
                ⚙️ Admin
              </Button>
            )}

            <Button
              variant="outline-danger"
              onClick={handleLogout}
              size="sm"
              className="nav-btn"
            >
              Cerrar sesión
            </Button>

            {/* Avatar desktop */}
            <Image
              src={`/avatars/${localStorage.getItem("avatarIndex") || 0}.jpg`}
              width="40"
              height="40"
              roundedCircle
              className="avatar-desktop"
              onClick={() => navigate("/profile")}
            />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
