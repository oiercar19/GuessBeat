import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const TARGET = process.env.USER_SERVICE_URL || "http://localhost:5001";

console.log(`🎯 [Users Proxy] Target: ${TARGET}`);

const usersProxy = createProxyMiddleware({
  target: TARGET,
  changeOrigin: true,
  
  // CRÍTICO: Reescribir el path para incluir /api/users de nuevo
  pathRewrite: {
    '^/': '/api/users/' // Añade /api/users/ al principio
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