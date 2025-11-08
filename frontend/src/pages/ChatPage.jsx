import { useEffect, useState } from "react";
import { Container, Card, Form, Button, Spinner, Image } from "react-bootstrap";
import { getChatMessages, sendChatMessage } from "../services/api";
import AppNavbar from "../components/Navbar";

export default function ChatPage() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username");

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await getChatMessages();
      // Mostramos los más nuevos primero
      setPosts(
        Array.isArray(data)
          ? data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          : []
      );
    } catch (err) {
      console.error("Error al cargar el tablón:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const post = await sendChatMessage(newPost);
      setPosts([post, ...posts]); // Añadir arriba del todo
      setNewPost("");
    } catch (err) {
      console.error("Error al publicar:", err);
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
    const formattedTime = date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${formattedDate} — ${formattedTime}`;
  };

  const getAvatarSrc = (index) => `/avatars/${index || 0}.jpg`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #111, #1a1a40, #000)",
        color: "#fff",
        margin: 0,
        paddingTop: "90px", // deja espacio para la navbar fija
        paddingBottom: "40px", // evita la franja blanca inferior
        overflowX: "hidden",
      }}
    >
      <AppNavbar />

      <Container className="mt-4" style={{ maxWidth: "800px" }}>
        <h2 className="text-center text-info mb-4 fw-bold">🗨️ Tablón de GuessBeat</h2>

        {/* Formulario para nueva publicación */}
        <Form onSubmit={handleSubmit} className="mb-4">
          <Card
            className="p-3 bg-dark text-white border-secondary shadow-sm"
            style={{ borderRadius: "15px" }}
          >
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Comparte tus ideas, teorías o comentarios sobre el juego..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="mb-3 bg-dark text-white border border-secondary"
              style={{ color: "#fff", "::placeholder": { color: "#bbb" } }}
            />
            <Button type="submit" variant="info" className="w-100 fw-semibold">
              Publicar 💭
            </Button>
          </Card>
        </Form>

        {/* Listado de publicaciones */}
        {loading ? (
          <div className="text-center mt-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted">Aún no hay publicaciones.</p>
        ) : (
          posts.map((post) => (
            <Card
              key={post._id}
              className="p-3 mb-3 shadow-sm border-0"
              style={{
                background: "rgba(35,35,60,0.95)",
                borderRadius: "15px",
              }}
            >
              <div className="d-flex align-items-start gap-3">
                {/* 🧑‍🎤 Avatar del usuario */}
                <Image
                  src={getAvatarSrc(post.user?.avatarIndex)}
                  alt="Avatar"
                  roundedCircle
                  width="55"
                  height="55"
                  className="border border-2 border-info shadow-sm"
                />

                {/* Contenido del mensaje */}
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5
                      className={`fw-bold mb-0 ${
                        post.user?.username === username
                          ? "text-warning"
                          : "text-info"
                      }`}
                    >
                      {post.user?.username || "Anónimo"}
                    </h5>
                    <small className="fst-italic text-light opacity-75">
                      📅 {formatDateTime(post.timestamp || post.createdAt)}
                    </small>
                  </div>

                  <p className="mb-2 text-light fs-5">{post.message}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </Container>
    </div>
  );
}
