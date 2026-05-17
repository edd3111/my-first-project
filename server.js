import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const DIST = join(__dirname, "dist");
const isDev = !existsSync(DIST);

if (!isDev) {
  app.use(express.static(DIST));
}

app.post("/api/messages", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY не задан на сервере." });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Ошибка соединения с Anthropic API." });
  }
});

if (!isDev) {
  app.get("*", (req, res) => res.sendFile(join(DIST, "index.html")));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));
