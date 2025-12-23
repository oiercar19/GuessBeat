import express from "express";
import axios from "axios";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import generateToken from "../utils/generateToken.js";

dotenv.config();
const router = express.Router();

const {
  SOUNDCLOUD_CLIENT_ID,
  SOUNDCLOUD_CLIENT_SECRET,
  SOUNDCLOUD_REDIRECT_URI,
  JWT_SECRET,
} = process.env;

console.log("Configuración SoundCloud:");
console.log("Client ID:", SOUNDCLOUD_CLIENT_ID ? "Definido" : "Falta");
console.log("Client Secret:", SOUNDCLOUD_CLIENT_SECRET ? "Definido" : "Falta");
console.log("Redirect URI:", SOUNDCLOUD_REDIRECT_URI);

router.get("/login", (req, res) => {
  const authUrl = `https://soundcloud.com/connect?client_id=${SOUNDCLOUD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    SOUNDCLOUD_REDIRECT_URI
  )}&response_type=code`;

  console.log("Redirigiendo a:", authUrl);
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  console.log("Callback recibido. Query params:", req.query);

  const { code, error, error_description } = req.query;

  // Manejar errores de SoundCloud
  if (error) {
    console.error("Error de SoundCloud:", error, error_description);
    return res.status(400).json({
      message: "Error de autorización",
      error,
      error_description
    });
  }

  if (!code) {
    return res.status(400).json({ message: "Falta el código de autorización" });
  }

  console.log("Código recibido:", code.substring(0, 10) + "...");

  try {
    const params = new URLSearchParams();
    params.append("client_id", SOUNDCLOUD_CLIENT_ID);
    params.append("client_secret", SOUNDCLOUD_CLIENT_SECRET);
    params.append("redirect_uri", SOUNDCLOUD_REDIRECT_URI);
    params.append("grant_type", "authorization_code");
    params.append("code", code);

    console.log("🔄 Intercambiando code por token...");

    const tokenResponse = await axios.post(
      "https://api.soundcloud.com/oauth2/token",
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    console.log("Token obtenido correctamente");
    const accessToken = tokenResponse.data.access_token;

    // Obtener info del usuario desde SoundCloud
    console.log("Obteniendo información del usuario...");
    const userResponse = await axios.get("https://api.soundcloud.com/me", {
      headers: { Authorization: `OAuth ${accessToken}` },
    });

    const soundcloudUser = userResponse.data;
    console.log("Usuario SoundCloud:", soundcloudUser.username);

    // Buscar o crear usuario en Mongo
    let user = await User.findOne({
      "social_login": {
        $elemMatch: {
          provider: "soundcloud",
          providerId: soundcloudUser.id.toString()
        }
      }
    });

    if (!user) {
      console.log("Creando nuevo usuario en DB...");
      user = new User({
        username: soundcloudUser.username,
        stats: 0,
        social_login: [
          { provider: "soundcloud", providerId: soundcloudUser.id.toString() },
        ],
      });
      await user.save();
      console.log("Usuario creado");
    } else {
      console.log("Usuario existente encontrado");
    }

    // Generar JWT para tu app
    const token = generateToken(user);

    // Redirigir al frontend con el token JWT
    const redirectFrontend = `http://localhost:5173/home?token=${token}`;
    console.log(`Login exitoso: ${user.username}`);
    res.redirect(redirectFrontend);

  } catch (err) {
    console.error("\nERROR EN LOGIN CON SOUNDCLOUD:");

    if (err.response) {
      // Error de respuesta HTTP
      console.error("Status HTTP:", err.response.status);
      console.error("Datos de error:", JSON.stringify(err.response.data, null, 2));
      console.error("Headers:", err.response.headers);

      return res.status(500).json({
        message: "Error al autenticar con SoundCloud",
        status: err.response.status,
        details: err.response.data
      });
    } else if (err.request) {
      // No se recibió respuesta
      console.error("No se recibió respuesta del servidor");
      console.error("Request:", err.request);

      return res.status(500).json({
        message: "No se pudo conectar con SoundCloud"
      });
    } else {
      // Error al configurar la petición
      console.error("Error:", err.message);
      console.error("Stack:", err.stack);

      return res.status(500).json({
        message: "Error interno",
        error: err.message
      });
    }
  }
});

export default router;