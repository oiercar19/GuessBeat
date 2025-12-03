import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { startGame, searchSongs } from "../services/api";
import AppNavbar from "../components/Navbar";
import { Container, Button, Form, Card, ProgressBar, ListGroup } from "react-bootstrap";
import "./GamePage.css";

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
  const [isYearMode, setIsYearMode] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!window.SC) {
      const script = document.createElement("script");
      script.src = "https://w.soundcloud.com/player/api.js";
      script.async = true;
      script.onload = () => console.log("✅ SoundCloud SDK cargado");
      document.body.appendChild(script);
    }
  }, []);

  const initGame = async () => {
    try {
      setLoading(true);
      const data = await startGame(category);
      setGame(data);
      
      const yearMode = category === "2";
      setIsYearMode(yearMode);
      
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
      
      if (isYearMode) {
        setFeedback("🎧 Escuchando 30 segundos...");
        setTimeout(() => widget.pause(), 30000);
      } else {
        setFeedback("🎧 Escuchando fragmento...");
        setTimeout(() => widget.pause(), fragmentTime * 1000);
      }
    }
  };

  const playFullTrack = (keepFeedback = false) => {
    if (widget) {
      widget.seekTo(0);
      widget.play();
      if (!keepFeedback) {
        setFeedback("🎶 Reproduciendo la canción completa...");
      }
      setTimeout(() => widget.pause(), 30000);
    }
  };

  const skipFragment = async () => {
    if (fragmentIndex < 4) {
      setFragmentIndex(fragmentIndex + 1);
      
      if (!isYearMode) {
        setFragmentTime(fragmentTime + 5);
        setFeedback("⏭ Nuevo fragmento desbloqueado");
      } else {
        setFeedback(`⏭ Intento ${fragmentIndex + 2}/5`);
      }
    } else {
      setFinished(true);
      playFullTrack();

      const username = localStorage.getItem("username");
      try {
        const res = await fetch("http://localhost:5001/api/users/update-stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, points: -8 }),
        });
        
        if (res.ok) {
          if (isYearMode) {
            setFeedback(`💀 Fin del juego. El año era: ${game.release_year} (-8 pts)`);
          } else {
            setFeedback(`💀 Fin del juego. La canción era: ${game.title} (-8 pts)`);
          }
        } else {
          if (isYearMode) {
            setFeedback(`💀 Fin del juego. El año era: ${game.release_year}`);
          } else {
            setFeedback(`💀 Fin del juego. La canción era: ${game.title}`);
          }
        }
      } catch (error) {
        console.error("⚠️ Error al restar puntos:", error);
        if (isYearMode) {
          setFeedback(`💀 Fin del juego. El año era: ${game.release_year}`);
        } else {
          setFeedback(`💀 Fin del juego. La canción era: ${game.title}`);
        }
      }
    }
  };

  const handleGuess = async () => {
    if (!guess.trim()) return;

    const username = localStorage.getItem("username");
    const attempt = fragmentIndex + 1;

    if (isYearMode) {
      const res = await fetch(
        `http://localhost:8002/game/check-year?release_year=${encodeURIComponent(game.release_year)}&guess=${encodeURIComponent(guess)}`,
        {
          method: "POST",
          headers: {
            "X-Username": username,
            "X-Attempt": attempt
          }
        }
      );
      const data = await res.json();

      if (data.correct) {
        const feedbackMsg = `🎉 ¡Correcto! Era ${data.year} (+${data.points} pts)`;
        setFeedback(feedbackMsg);
        setFinished(true);
        playFullTrack(true);
      } else {
        if (attempt >= 5) {
          setFeedback(`❌ Incorrecto. El año era: ${data.year} (-8 pts)`);
          setFinished(true);
          playFullTrack();
        } else {
          setFragmentIndex(fragmentIndex + 1);
          setFeedback(`❌ Incorrecto, intenta de nuevo (${attempt}/5)`);
        }
      }
    } else {
      const res = await fetch(
        `http://localhost:8002/game/check?title=${encodeURIComponent(game.title)}&guess=${encodeURIComponent(guess)}`,
        {
          method: "POST",
          headers: {
            "X-Username": username,
            "X-Attempt": attempt
          }
        }
      );
      const data = await res.json();

      if (data.correct) {
        const feedbackMsg = `🎉 ¡Correcto! Era "${data.title}" (+${data.points} pts)`;
        console.log("📢 Estableciendo feedback:", feedbackMsg);
        setFeedback(feedbackMsg);
        setFinished(true);
        playFullTrack(true);
      } else {
        if (attempt >= 5) {
          setFeedback(`❌ Incorrecto. La canción era: ${game.title} (-8 pts)`);
          setFinished(true);
          playFullTrack();
        } else {
          setFeedback(`❌ Incorrecto, intenta de nuevo`);
          skipFragment();
        }
      }
    }
    setGuess("");
    setSuggestions([]);
  };

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
    <div className="game-page">
      <AppNavbar />
      <Container className="text-center">
        {loading ? (
          <p className="game-page__loading">Cargando partida...</p>
        ) : (
          game && (
            <Card className="game-card bg-dark text-light p-4 shadow-lg mx-auto">
              <h3 className="game-card__title">
                {isYearMode ? "📅 Adivina el Año" : `🎧 Adivina la canción (${category})`}
              </h3>

              <iframe
                ref={iframeRef}
                width="0"
                height="0"
                className="game-card__iframe"
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
                    className="game-card__play-button"
                    onClick={playFragment}
                  >
                    {isYearMode 
                      ? "▶️ Reproducir canción (30s)" 
                      : `▶️ Reproducir fragmento ${fragmentIndex + 1} (${fragmentTime}s)`}
                  </Button>

                  <Form className="game-form">
                    <Form.Control
                      type="text"
                      placeholder={isYearMode ? "📅 ¿En qué año salió? (ej: 1991)" : "🎵 ¿Lo sabes? Escribe el título..."}
                      value={guess}
                      onChange={(e) => isYearMode ? setGuess(e.target.value) : handleSearch(e.target.value)}
                      className="game-form__input bg-dark text-white border-secondary mb-3 text-center"
                    />

                    {!isYearMode && suggestions.length > 0 && (
                      <ListGroup className="game-form__suggestions text-start">
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

                    <div className="game-form__buttons">
                      <Button
                        variant="secondary"
                        className="game-form__skip-button"
                        onClick={skipFragment}
                      >
                        ⏭ SKIP
                      </Button>

                      <Button
                        variant="success"
                        className="game-form__submit-button"
                        onClick={handleGuess}
                      >
                        SUBMIT ✅
                      </Button>
                    </div>
                  </Form>
                </>
              ) : (
                <>
                  <div className="game-result">
                    <img
                      src={game.artwork}
                      alt="cover"
                      className="game-result__artwork shadow"
                      onError={(e) => {
                        e.target.src = "/musica.webp";
                      }}
                    />
                    <p className="game-result__info">
                      🎵 <strong>{game.title}</strong>
                      <br />
                      👤 {game.artist}
                      <br />
                      📅 {game.release_year}
                    </p>
                  </div>

                  <Button
                    variant="info"
                    className="game-result__restart-button"
                    onClick={restartGame}
                  >
                    🔁 Jugar otra vez
                  </Button>
                </>
              )}

              {feedback && (
                <p
                  className={`game-feedback ${
                    feedback.includes("Correcto")
                      ? "game-feedback--success"
                      : "game-feedback--warning"
                  }`}
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