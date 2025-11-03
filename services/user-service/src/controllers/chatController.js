import ChatMessage from "../models/ChatMessage.js";

/**
 * Obtener todos los mensajes del chat general
 */
export const getChatMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find()
      .populate("user", "username")
      .sort({ timestamp: -1 }); // más nuevos primero

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error al recuperar el chat:", error);
    res.status(500).json({ message: "Error al recuperar el chat" });
  }
};

/**
 * Enviar un nuevo mensaje al chat
 */
export const sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "El mensaje no puede estar vacío" });
    }

    const newMessage = new ChatMessage({
      user: req.user._id,
      message,
    });

    await newMessage.save();

    const populatedMessage = await newMessage.populate("user", "username");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("❌ Error al enviar el mensaje:", error);
    res.status(500).json({ message: "Error al enviar el mensaje" });
  }
};
