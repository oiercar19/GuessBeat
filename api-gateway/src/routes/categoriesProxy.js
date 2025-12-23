import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const TARGET = process.env.GAME_SERVICE_URL || "http://localhost:8002";

console.log('[Categories Proxy] Target: ${TARGET}');

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Obtener todas las categorías de música disponibles
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lista de categorías musicales
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Rock"
 *                   description:
 *                     type: string
 *                     example: "Música rock clásica y moderna"
 */

const categoriesProxy = createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,

    pathRewrite: {
        '^/': '/categories/' // Reescribe cualquier path a /categories/
    },

    onProxyReq: (proxyReq, req) => {
        const fullPath = req.url.replace(/^\//, '/categories/');
        console.log('[Categories Proxy] ${req.method} ${req.originalUrl} → ${TARGET}${fullPath}');
    },

    onProxyRes: (proxyRes, req) => {
        console.log('[Categories Proxy] Response ${proxyRes.statusCode} from ${req.originalUrl}');
    },

    onError: (err, req, res) => {
        console.error('[Categories Proxy] Error: ${err.message}');
        if (!res.headersSent) {
            res.status(502).json({
                error: "No se pudo conectar con el servicio de categorías",
                message: err.message,
                target: TARGET
            });
        }
    }
});

export default categoriesProxy;
