import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { startGame, checkGuess, searchSongs } from "../services/api";
import AppNavbar from "../components/Navbar";
import { Container, Button, Form, Card, ProgressBar, ListGroup } from "react-bootstrap";

export default function GamePage() {
  const { category } = useParams();
  const [game, setGame] = useState(null);
  const [widget, setWidget] = useState(null);
  const [fragmentTime, setFragmentTime] = useState(5);
  const [fragmentIndex, setFragmentIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef(null);

  // 1️⃣ Cargar SDK de SoundCloud
  useEffect(() => {
    if (!window.SC) {
      const script = document.createElement("script");
      script.src = "https://w.soundcloud.com/player/api.js";
      script.async = true;
      script.onload = () => console.log("✅ SoundCloud SDK cargado");
      document.body.appendChild(script);
    }
  }, []);

  // 2️⃣ Inicializar partida
  const initGame = async () => {
    try {
      setLoading(true);
      const data = await startGame(category);
      setGame(data);
      setFragmentTime(5);
      setFragmentIndex(0);
      setGuess("");
      setSuggestions([]);
      setFeedback("");
      setFinished(false);
      setLoading(false);
    } catch (error) {
      console.error("Error al iniciar el juego:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    initGame();
  }, [category]);

  // 3️⃣ Configurar widget
  useEffect(() => {
    if (iframeRef.current && window.SC && game?.permalink_url) {
      const player = window.SC.Widget(iframeRef.current);
      setWidget(player);
    }
  }, [game]);

  const playFragment = () => {
    if (widget) {
      widget.seekTo(0);
      widget.play();
      setFeedback("🎧 Escuchando fragmento...");
      setTimeout(() => widget.pause(), fragmentTime * 1000);
    }
  };

  const playFullTrack = () => {
    if (widget) {
      widget.seekTo(0);
      widget.play();
      setFeedback("🎶 Reproduciendo la canción completa...");
      setTimeout(() => widget.pause(), 30000); // 🔊 30 s
    }
  };

  const skipFragment = () => {
    if (fragmentIndex < 4) {
      setFragmentIndex(fragmentIndex + 1);
      setFragmentTime(fragmentTime + 5);
      setFeedback("⏭ Nuevo fragmento desbloqueado");
    } else {
      setFeedback(`💀 Fin del juego. La canción era: ${game.title}`);
      setFinished(true);
      playFullTrack(); // 🔊 Reproduce 30s al terminar
    }
  };

  const handleGuess = async () => {
    if (!guess.trim()) return;

    const res = await checkGuess(game.game_id, guess);
    if (res.correct) {
      setFeedback(`🎉 ¡Correcto! Era "${res.title}"`);
      setFinished(true);
      playFullTrack(); // 🎶 Reproduce 30s si aciertas
    } else {
      skipFragment();
    }
    setGuess("");
    setSuggestions([]);
  };

  // 🔍 Buscar canciones
  const handleSearch = async (text) => {
    setGuess(text);
    if (text.length > 2) {
      try {
        const results = await searchSongs(text);
        setSuggestions(results.slice(0, 5));
      } catch (error) {
        console.error("Error al buscar canciones:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (title) => {
    setGuess(title);
    setSuggestions([]);
  };

  const restartGame = async () => {
    await initGame();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a1a, #12123a, #0a0a1a)",
        color: "#fff",
        paddingTop: "100px",
      }}
    >
      <AppNavbar />
      <Container className="text-center">
        {loading ? (
          <p className="mt-5 text-muted">Cargando partida...</p>
        ) : (
          game && (
            <Card
              className="bg-dark text-light p-4 shadow-lg mx-auto"
              style={{
                maxWidth: "700px",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "20px",
              }}
            >
              <h3 className="text-info mb-3 fw-bold">
                🎧 Adivina la canción ({category})
              </h3>

              {/* 🎵 Widget oculto */}
              <iframe
                ref={iframeRef}
                width="0"
                height="0"
                style={{ display: "none" }}
                allow="autoplay"
                src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
                  game.permalink_url
                )}&auto_play=false`}
              ></iframe>

              <ProgressBar
                now={(fragmentIndex + 1) * 20}
                label={`Intento ${fragmentIndex + 1}/5`}
                variant="info"
                className="mb-4"
              />

              {!finished ? (
                <>
                  <Button
                    variant="outline-info"
                    className="fw-semibold px-4 py-2"
                    onClick={playFragment}
                  >
                    ▶️ Reproducir fragmento {fragmentIndex + 1} ({fragmentTime}s)
                  </Button>

                  <Form className="mt-4 position-relative">
                    <Form.Control
                      type="text"
                      placeholder="🎵 ¿Lo sabes? Escribe el título..."
                      value={guess}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="bg-dark text-white border-secondary mb-3 text-center"
                      style={{ fontSize: "1.1rem", borderRadius: "10px" }}
                    />

                    {suggestions.length > 0 && (
                      <ListGroup
                        className="position-absolute w-100 text-start"
                        style={{
                          zIndex: 10,
                          maxHeight: "200px",
                          overflowY: "auto",
                        }}
                      >
                        {suggestions.map((s, idx) => (
                          <ListGroup.Item
                            key={idx}
                            action
                            onClick={() => selectSuggestion(s.title)}
                            className="bg-dark text-white border-secondary"
                          >
                            {s.title}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}

                    <div className="d-flex justify-content-between mt-4">
                      <Button
                        variant="secondary"
                        className="fw-bold px-4"
                        onClick={skipFragment}
                      >
                        ⏭ SKIP
                      </Button>

                      <Button
                        variant="success"
                        className="fw-bold px-4"
                        onClick={handleGuess}
                      >
                        SUBMIT ✅
                      </Button>
                    </div>
                  </Form>
                </>
              ) : (
                <>
                  <img
                    src={game.artwork}
                    alt="cover"
                    width="150"
                    height="150"
                    className="rounded mb-3 shadow"
                  />
                  <p className="fs-5 mt-2">
                    🎵 <strong>{game.title}</strong> <br />
                    👤 {game.artist} <br />
                    📅 {game.release_year || "Año desconocido"}
                  </p>

                  <Button
                    variant="info"
                    className="mt-3 fw-bold px-4 py-2"
                    onClick={restartGame}
                  >
                    🔁 Jugar otra vez
                  </Button>
                </>
              )}

              {feedback && (
                <p
                  className={`mt-4 fw-bold ${
                    feedback.includes("Correcto")
                      ? "text-success"
                      : "text-warning"
                  }`}
                  style={{ fontSize: "1.1rem" }}
                >
                  {feedback}
                </p>
              )}
            </Card>
          )
        )}
      </Container>
    </div>
  );
}
