import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const TARGET = process.env.GAME_SERVICE_URL || "http://localhost:8002";

console.log(`🎯 [Game Proxy] Target: ${TARGET}`);

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
