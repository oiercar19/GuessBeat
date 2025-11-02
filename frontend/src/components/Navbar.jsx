import { useNavigate } from "react-router-dom";
import { Container, Navbar, Button, Image } from "react-bootstrap";
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
      className="shadow-sm py-3"
      style={{
        background:
          "linear-gradient(90deg, rgba(25,25,40,1) 0%, rgba(60,60,120,1) 100%)",
      }}
    >
      <Container>
        <Navbar.Brand
          href="/home"
          className="d-flex align-items-center text-light fw-bold fs-4"
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
        <Button variant="outline-light" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </Container>
    </Navbar>
  );
}
