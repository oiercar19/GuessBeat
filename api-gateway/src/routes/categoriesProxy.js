import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const TARGET = process.env.GAME_SERVICE_URL || "http://localhost:8002";

console.log(`🎯 [Categories Proxy] Target: ${TARGET}`);

const categoriesProxy = createProxyMiddleware({
    target: TARGET,
    changeOrigin: true,

    pathRewrite: {
        '^/': '/categories/' // Reescribe cualquier path a /categories/
    },

    onProxyReq: (proxyReq, req) => {
        const fullPath = req.url.replace(/^\//, '/categories/');
        console.log(`🔀 [Categories Proxy] ${req.method} ${req.originalUrl} → ${TARGET}${fullPath}`);
    },

    onProxyRes: (proxyRes, req) => {
        console.log(`✅ [Categories Proxy] Response ${proxyRes.statusCode} from ${req.originalUrl}`);
    },

    onError: (err, req, res) => {
        console.error(`❌ [Categories Proxy] Error: ${err.message}`);
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
