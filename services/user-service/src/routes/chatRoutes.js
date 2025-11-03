import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getChatMessages, sendChatMessage } from "../controllers/chatController.js";

const router = express.Router();

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Obtener el chat general completo
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de mensajes
 */
router.get("/", protect, getChatMessages);

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Enviar un mensaje al chat general
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Mensaje enviado correctamente
 */
router.post("/", protect, sendChatMessage);

export default router;
