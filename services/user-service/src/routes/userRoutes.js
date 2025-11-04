import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  getUserProfile,
  updateUserProfile,
  getRanking,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Usuarios
 *     description: Operaciones relacionadas con los usuarios
 */

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
router.post("/register", registerUser);

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
 *       401:
 *         description: Credenciales incorrectas
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Obtener el perfil del usuario autenticado (versión básica)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario autenticado
 *       401:
 *         description: Token inválido o ausente
 */
router.get("/profile", protect, getProfile);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener el perfil completo del usuario autenticado
 *     tags: [Usuarios]
 *     description: Devuelve los datos del usuario actual, incluyendo nombre, email, puntos y avatar.
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
router.get("/me", protect, getUserProfile);

/**
 * @swagger
 * /users/update:
 *   put:
 *     summary: Actualizar los datos del usuario autenticado
 *     tags: [Usuarios]
 *     description: Permite modificar el nombre de usuario, email, contraseña o avatar. Cambiar avatar cuesta 500 puntos.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Perfil actualizado correctamente"
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       example: "nuevoNombre"
 *                     email:
 *                       type: string
 *                       example: "nuevo@email.com"
 *                     avatarIndex:
 *                       type: number
 *                       example: 3
 *                     stats:
 *                       type: number
 *                       example: 1200
 *       400:
 *         description: No hay puntos suficientes para cambiar de avatar
 *       401:
 *         description: Token inválido o no autorizado
 */
router.put("/update", protect, updateUserProfile);

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
 */
router.get("/ranking", protect, getRanking);

export default router;
