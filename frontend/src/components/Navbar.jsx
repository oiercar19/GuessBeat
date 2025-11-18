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
      className="shadow-sm"
      style={{
        background:
          "linear-gradient(90deg, rgba(25,25,40,1) 0%, rgba(60,60,120,1) 100%)",
        minHeight: "65px",
        padding: "0.75rem 0",
      }}
    >
      <Container fluid>
        <div className="d-flex align-items-center justify-content-between w-100">
          {/* Logo + título */}
          <Navbar.Brand
            href="/home"
            className="d-flex align-items-center text-light fw-bold mb-0"
            style={{ cursor: "pointer", fontSize: "1.25rem" }}
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

          <div className="d-flex align-items-center gap-2">
            {/* Avatar visible en móvil */}
            <Image
              src={`/avatars/${localStorage.getItem("avatarIndex") || 0}.jpg`}
              width="40"
              height="40"
              roundedCircle
              className="d-lg-none border border-2 border-info"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/profile")}
            />

            {/* Botón hamburguesa */}
            <Navbar.Toggle aria-controls="navbar-nav" className="border-0" />
          </div>
        </div>

        {/* Menú colapsable */}
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ms-auto d-flex align-items-lg-center gap-2 mt-2 mt-lg-0">
            <Button
              variant="outline-info"
              onClick={() => navigate("/chat")}
              className="fw-semibold"
              size="sm"
              style={{ padding: "0.25rem 0.75rem", whiteSpace: "nowrap" }}
            >
              💬 Chat
            </Button>
            <Button
              variant="outline-warning"
              onClick={() => navigate("/ranking")}
              size="sm"
              style={{ padding: "0.25rem 0.75rem", whiteSpace: "nowrap" }}
            >
              🏆 Ranking
            </Button>
            {localStorage.getItem("username") === "admin" && (
              <Button
                variant="outline-success"
                onClick={() => navigate("/admin")}
                className="fw-semibold"
                size="sm"
                style={{ padding: "0.25rem 0.75rem", whiteSpace: "nowrap" }}
              >
                ⚙️ Admin
              </Button>
            )}
            <Button
              variant="outline-danger"
              onClick={handleLogout}
              className="fw-semibold"
              size="sm"
              style={{ padding: "0.25rem 0.75rem", whiteSpace: "nowrap" }}
            >
              Cerrar sesión
            </Button>
            {/* Avatar en desktop */}
            <Image
              src={`/avatars/${localStorage.getItem("avatarIndex") || 0}.jpg`}
              width="40"
              height="40"
              roundedCircle
              className="d-none d-lg-block border border-2 border-info ms-2"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/profile")}
            />
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
