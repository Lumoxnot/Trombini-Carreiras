/* importações
import path from 'path';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// variáveis
const app = express();
const PORT = 5001; // Mudando para 5001 para não conflitar com o Vite no dev

app.use(cors());
app.use(express.json()); // para receber JSON

// API Ping
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Backend funcionando 🚀' });
});

// Proxy para o backend original - Usando string literal simples para evitar erro de regex
app.get('/api/v1/*', (req, res) => {
    res.json({ message: "Trombini Carreiras API Mock - Direcionado para server.js" });
});

// Servir arquivos estáticos do frontend (após o build)
const distPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(distPath));

// SPA support
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send("Frontend não encontrado. Execute 'cd frontend && npm run build' primeiro.");
    }
  });
});

// iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de API rodando em http://0.0.0.0:${PORT}`);
});
*/