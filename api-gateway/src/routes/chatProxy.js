import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const TARGET = process.env.USER_SERVICE_URL || "http://localhost:5001";

console.log(`🎯 [Users Proxy] Target: ${TARGET}`);

const chatProxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  
  // CRÍTICO: Reescribir el path para incluir /api/chat de nuevo
  pathRewrite: {
    '^/': '/api/chat/' // Añade /api/chat/ al principio
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
