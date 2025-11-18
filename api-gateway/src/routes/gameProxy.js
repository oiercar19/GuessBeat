import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const TARGET = process.env.GAME_SERVICE_URL || "http://localhost:8002";

console.log(`🎯 [Game Proxy] Target: ${TARGET}`);

/**
 * @swagger
 * /game/start:
 *   get:
 *     summary: Iniciar una nueva partida y obtener una canción aleatoria
 *     tags: [Game]
 *     parameters:
 *       - in: query
 *         name: category
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría musical
 *     responses:
 *       200:
 *         description: Canción obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 artist:
 *                   type: string
 *                 release_year:
 *                   type: string
 *                 artwork:
 *                   type: string
 *                 permalink_url:
 *                   type: string
 */

/**
 * @swagger
 * /game/search:
 *   get:
 *     summary: Buscar canciones en SoundCloud
 *     tags: [Game]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *     responses:
 *       200:
 *         description: Lista de canciones encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

/**
 * @swagger
 * /game/check:
 *   post:
 *     summary: Verificar si el título de la canción es correcto
 *     tags: [Game]
 *     parameters:
 *       - in: query
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: guess
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 correct:
 *                   type: boolean
 *                 points:
 *                   type: integer
 *                 title:
 *                   type: string
 */

/**
 * @swagger
 * /game/check-year:
 *   post:
 *     summary: Verificar si el año de lanzamiento es correcto
 *     tags: [Game]
 *     parameters:
 *       - in: query
 *         name: release_year
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: guess
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 correct:
 *                   type: boolean
 *                 year:
 *                   type: string
 *                 points:
 *                   type: integer
 */

/**
 * @swagger
 * /game/songs:
 *   post:
 *     summary: Añadir una nueva canción (Admin)
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - artist
 *               - release_year
 *               - category_id
 *             properties:
 *               title:
 *                 type: string
 *               artist:
 *                 type: string
 *               release_year:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               permalink_url:
 *                 type: string
 *               artwork:
 *                 type: string
 *     responses:
 *       200:
 *         description: Canción añadida correctamente
 */

const gameProxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,

  pathRewrite: (path, req) => {
    // Si la ruta es /categories, la deja como está
    if (path.startsWith('/categories')) {
      console.log(`🔀 [Game Proxy] ${req.method} ${req.originalUrl} → ${TARGET}${path}`);
      return path;
    }
    // Si no, añade /game/ al principio
    const newPath = '/game' + path;
    console.log(`🔀 [Game Proxy] ${req.method} ${req.originalUrl} → ${TARGET}${newPath}`);
    return newPath;
  },

  onProxyRes: (proxyRes, req) => {
    console.log(`✅ [Game Proxy] Response ${proxyRes.statusCode} from ${req.originalUrl}`);
  },

  onError: (err, req, res) => {
    console.error(`❌ [Game Proxy] Error: ${err.message}`);
    if (!res.headersSent) {
      res.status(502).json({
        error: "No se pudo conectar con el servicio de juego",
        message: err.message,
        target: TARGET
      });
    }
  }
});

export default gameProxy;
