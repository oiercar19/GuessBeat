import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const TARGET = process.env.USER_SERVICE_URL || "http://localhost:5001";

console.log(`🎯 [Users Proxy] Target: ${TARGET}`);

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "player123"
 *               email:
 *                 type: string
 *                 example: "user@email.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: El usuario ya existe
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "player123"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Inicio de sesión correcto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Credenciales incorrectas
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado
 *     tags: [Usuarios]
 *     description: Devuelve los datos del usuario actual, incluyendo nombre, email, puntos y avatar
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "64dabc123ef456"
 *                 username:
 *                   type: string
 *                   example: "player123"
 *                 email:
 *                   type: string
 *                   example: "player@email.com"
 *                 stats:
 *                   type: number
 *                   example: 1500
 *                 avatarIndex:
 *                   type: number
 *                   example: 2
 *       401:
 *         description: Token inválido o expirado
 */

/**
 * @swagger
 * /users/update:
 *   put:
 *     summary: Actualizar los datos del usuario autenticado
 *     tags: [Usuarios]
 *     description: Permite modificar el nombre de usuario, email, contraseña o avatar. Cambiar avatar cuesta 500 puntos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "nuevoNombre"
 *               email:
 *                 type: string
 *                 example: "nuevo@email.com"
 *               password:
 *                 type: string
 *                 example: "nuevaPass123"
 *               avatarIndex:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 *       400:
 *         description: No hay puntos suficientes para cambiar de avatar
 *       401:
 *         description: Token inválido o no autorizado
 */

/**
 * @swagger
 * /users/update-stats:
 *   post:
 *     summary: Actualizar estadísticas del usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               points:
 *                 type: number
 *     responses:
 *       200:
 *         description: Puntos actualizados
 *       404:
 *         description: Usuario no encontrado
 */

const usersProxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,

  pathRewrite: {
    '^/': '/api/users/'
  },

  onProxyReq: (proxyReq, req) => {
    const fullPath = req.url.replace(/^\//, '/api/users/');
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

export default usersProxy;