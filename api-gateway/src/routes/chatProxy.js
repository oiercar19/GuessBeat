import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const TARGET = process.env.USER_SERVICE_URL || "http://localhost:5001";

console.log(`🎯 [Chat Proxy] Target: ${TARGET}`);

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
 *         description: Lista de mensajes del chat
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   message:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *       401:
 *         description: No autorizado
 */

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
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Hola a todos!"
 *     responses:
 *       201:
 *         description: Mensaje enviado correctamente
 *       401:
 *         description: No autorizado
 */

const chatProxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,

  pathRewrite: {
    '^/': '/api/chat/'
  },

  onProxyReq: (proxyReq, req) => {
    const fullPath = req.url.replace(/^\//, '/api/chat/');
    console.log(`🔀 [Proxy] ${req.method} ${req.originalUrl} → ${TARGET}${fullPath}`);
  },

  onProxyRes: (proxyRes, req) => {
    console.log(`✅ [Proxy] Response ${proxyRes.statusCode} from ${req.originalUrl}`);
  },

  onError: (err, req, res) => {
    console.error(`❌ [Proxy] Error: ${err.message}`);
    if (!res.headersSent) {
      res.status(502).json({
        error: "No se pudo conectar con el servicio de usuarios",
        message: err.message,
        target: TARGET
      });
    }
  }
});

export default chatProxy;
