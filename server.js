const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Caminho da pasta pública
const publicDir = path.join(__dirname, "public");

// Garante que a pasta exista
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

// ----------------------
// Middleware: servir arquivos estáticos (.zip, .txt, etc.)
// ----------------------
app.use("/launcher/update", express.static(publicDir, {
  setHeaders: (res) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  }
}));

// ----------------------
// Rota que gera latest.txt dinamicamente
// ----------------------
app.get("/launcher/update/latest.txt", (req, res) => {
  const files = fs.readdirSync(publicDir).filter(f => f.endsWith(".zip"));
  const versions = files
    .map(f => parseInt(f.replace(".zip", "")))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);

  if (versions.length === 0) {
    return res.status(404).send("Nenhuma versão .zip encontrada na pasta public/");
  }

  const latest = versions.at(-1);
  const latestPath = path.join(publicDir, "latest.txt");
  fs.writeFileSync(latestPath, String(latest));
  res.sendFile(latestPath);
});

// ----------------------
// Listagem manual de diretório (http://localhost:3000/launcher/update/)
// ----------------------
app.get("/launcher/update/", (req, res) => {
  const files = fs.readdirSync(publicDir);
  let html = `
    <h2>📦 VoltzMu Update Server</h2>
    <p>Arquivos disponíveis em: <b>${publicDir}</b></p>
    <ul style="font-family:monospace;">`;
  for (const file of files) {
    html += `<li><a href="/launcher/update/${file}">${file}</a></li>`;
  }
  html += "</ul>";
  res.send(html);
});

// ----------------------
// Página raiz de status
// ----------------------
app.get("/", (req, res) => {
  res.send(`
    <h3>Servidor de Update do VoltzMu rodando 🚀</h3>
    <p><a href="/launcher/update/">Ver conteúdo da pasta /launcher/update/</a></p>
  `);
});

// ----------------------
// Inicialização
// ----------------------
app.listen(PORT, () => {
  console.log("=====================================");
  console.log("🚀 Servidor de update do VoltzMu rodando!");
  console.log(`🌐 URL: http://localhost:${PORT}/launcher/update/`);
  console.log(`📂 Servindo arquivos de: ${publicDir}`);
  console.log("=====================================");
});
