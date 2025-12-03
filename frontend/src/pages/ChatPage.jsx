import { useEffect, useState } from "react";
import { Container, Card, Form, Button, Spinner, Image } from "react-bootstrap";
import { getChatMessages, sendChatMessage } from "../services/api";
import AppNavbar from "../components/Navbar";

import "./ChatPage.css";

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
      setPosts(
        Array.isArray(data)
          ? data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          : []
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const post = await sendChatMessage(newPost);
      setPosts([post, ...posts]);
      setNewPost("");
    } catch {}
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
    <div className="chat-page">
      <AppNavbar />

      <Container className="chat-container mt-4">
        <h2 className="text-center text-info mb-4 fw-bold">🗨️ Tablón de GuessBeat</h2>

        <Form onSubmit={handleSubmit} className="mb-4">
          <Card className="chat-form-card p-3 bg-dark text-white border-secondary shadow-sm">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Comparte tus ideas, teorías o comentarios sobre el juego..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="chat-textarea mb-3"
            />
            <Button type="submit" variant="info" className="w-100 fw-semibold">
              Publicar 💭
            </Button>
          </Card>
        </Form>

        {loading ? (
          <div className="text-center mt-5">
            <Spinner animation="border" variant="info" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted">Aún no hay publicaciones.</p>
        ) : (
          posts.map((post) => (
            <Card key={post._id} className="chat-post-card p-3 mb-3 shadow-sm border-0">
              <div className="d-flex align-items-start gap-3">
                <Image
                  src={getAvatarSrc(post.user?.avatarIndex)}
                  alt="Avatar"
                  roundedCircle
                  width="55"
                  height="55"
                  className="chat-avatar"
                />

                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h5
                      className={`fw-bold mb-0 ${
                        post.user?.username === username ? "text-warning" : "text-info"
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
