import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const TARGET = process.env.USER_SERVICE_URL || "http://localhost:5001";

console.log(`🎯 [Ranking Proxy] Target: ${TARGET}`);

/**
 * @swagger
 * /users/ranking:
 *   get:
 *     summary: Obtener el ranking de jugadores
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de jugadores ordenada por puntos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   stats:
 *                     type: number
 *                   avatarIndex:
 *                     type: number
 *       401:
 *         description: No autorizado
 */

const rankingProxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,

  pathRewrite: {
    '^/': '/api/users/ranking/'
  },

  onProxyReq: (proxyReq, req) => {
    const fullPath = req.url.replace(/^\//, '/api/users/ranking/');
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

export default rankingProxy;
