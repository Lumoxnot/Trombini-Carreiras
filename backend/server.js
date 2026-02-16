import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./src/routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de segurança
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://192.168.18.12:5173",
    ];

function isLocalNetworkOrigin(origin) {
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname;
    const isLocalHost = host === "localhost" || host === "127.0.0.1";
    const isPrivateV4 =
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host);

    return isLocalHost || isPrivateV4;
  } catch {
    return false;
  }
}

const corsOptions = {
  origin: (origin, callback) => {
    // In development, allow browser requests from local/LAN hosts to simplify setup.
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    const isAllowedByList = allowedOrigins.includes(origin);
    const isAllowedLan = isLocalNetworkOrigin(origin);

    if (!origin || isAllowedByList || isAllowedLan) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Compressão de respostas
app.use(compression());

// Parse JSON
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use("/api/v1", routes);

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "Trombini Carreiras API - Backend em JavaScript",
    version: "1.0.0",
    endpoints: {
      health: "/api/v1/health",
      profiles: "/api/v1/profiles",
      resumes: "/api/v1/resumes",
      jobs: "/api/v1/jobs",
      applications: "/api/v1/applications",
      notifications: "/api/v1/notifications",
      auth: "/api/v1/auth",
    },
  });
});

// Tratamento de erro 404
app.use((req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.path,
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  res.status(500).json({
    error: "Erro interno do servidor",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log("SERVE2 Rodando");
});

export default app;
