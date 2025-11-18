import { useState, useEffect } from "react";
import { Card, Form, Button, Alert, Spinner } from "react-bootstrap";
import { getCategories, createSong } from "../services/api";

export default function AdminPanel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    release_year: "",
    category_id: "",
    permalink_url: "",
    artwork: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await createSong(formData);
      setMessage({ type: "success", text: "✅ Canción añadida correctamente" });
      setFormData({
        title: "",
        artist: "",
        release_year: "",
        category_id: "",
        permalink_url: "",
        artwork: "",
      });
    } catch (error) {
      setMessage({ type: "danger", text: `❌ Error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className="p-4 shadow-lg mb-5"
      style={{
        background: "rgba(25,25,40,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      <h3 className="text-info mb-4 fw-bold text-center">🎵 Panel de Administración</h3>

      {message && (
        <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
          {message.text}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label className="text-white">Título de la canción *</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Ej: Bohemian Rhapsody"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-white">Artista *</Form.Label>
          <Form.Control
            type="text"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            required
            placeholder="Ej: Queen"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-white">Año de lanzamiento *</Form.Label>
          <Form.Control
            type="text"
            name="release_year"
            value={formData.release_year}
            onChange={handleChange}
            required
            placeholder="Ej: 1975"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-white">Categoría *</Form.Label>
          <Form.Select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id} style={{ background: "#1a1a2e" }}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className="text-white">URL de SoundCloud (opcional)</Form.Label>
          <Form.Control
            type="text"
            name="permalink_url"
            value={formData.permalink_url}
            onChange={handleChange}
            placeholder="https://soundcloud.com/..."
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label className="text-white">URL de la imagen (opcional)</Form.Label>
          <Form.Control
            type="text"
            name="artwork"
            value={formData.artwork}
            onChange={handleChange}
            placeholder="https://..."
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          />
        </Form.Group>

        <Button
          type="submit"
          variant="info"
          className="w-100 fw-bold"
          disabled={loading}
          style={{ borderRadius: "10px" }}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Añadiendo...
            </>
          ) : (
            "➕ Añadir Canción"
          )}
        </Button>
      </Form>
    </Card>
  );
}
