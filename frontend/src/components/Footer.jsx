import React from "react";
import { Container } from "react-bootstrap";

export default function Footer() {
  return (
    <footer
      style={{
        background: "rgba(10,10,30,0.9)",
        color: "#bbb",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        textAlign: "center",
        padding: "15px 0",
        marginTop: "60px",
        fontSize: "0.9rem",
      }}
    >
      <Container>
        <p className="mb-1">
          🎵 <strong>GuessBeat</strong> — ¡Adivina la canción y sube al top!
        </p>
        <p className="mb-0" style={{ fontSize: "0.8rem", color: "#666" }}>
          © {new Date().getFullYear()} Oier Carbón. Todos los derechos reservados.
        </p>
      </Container>
    </footer>
  );
}
