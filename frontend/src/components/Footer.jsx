import React from "react";
import { Container } from "react-bootstrap";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      <Container>
        <p className="mb-1">
          🎵 <strong>GuessBeat</strong> — ¡Adivina la canción y sube al top!
        </p>
        <p className="mb-0 copyright-text">
          © {new Date().getFullYear()} Oier Carbón. Todos los derechos reservados.
        </p>
      </Container>
    </footer>
  );
}