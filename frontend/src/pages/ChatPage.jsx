import { useEffect, useState } from "react";
import { Container, Card, Form, Button, Spinner } from "react-bootstrap";
import { getChatMessages, sendChatMessage } from "../services/api";
import AppNavbar from "../components/Navbar";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await getChatMessages();
      setMessages(data);
    } catch (err) {
      console.error("Error al cargar chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const msg = await sendChatMessage(newMessage);
      setMessages([...messages, msg]);
      setNewMessage("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #111, #1a1a40, #000)",
        color: "#fff",
      }}
    >
      <AppNavbar />
      <Container className="mt-4">
        <Card
          className="p-3 shadow-lg text-white"
          style={{ background: "rgba(25,25,40,0.9)", height: "75vh", overflowY: "auto" }}
        >
          <h3 className="text-info mb-3">💬 Chat General</h3>
          {loading ? (
            <div className="text-center"><Spinner animation="border" variant="info" /></div>
          ) : (
            <div>
              {messages.map((msg) => (
                <div key={msg._id} className="mb-2">
                  <b className={msg.user?.username === username ? "text-warning" : "text-info"}>
                    {msg.user?.username || "Anon"}
                  </b>
                  <span className="text-muted small">
                    {" "}
                    — {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                  <div>{msg.message}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Form onSubmit={handleSubmit} className="mt-3 d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button variant="info" type="submit">Enviar</Button>
        </Form>
      </Container>
    </div>
  );
}
