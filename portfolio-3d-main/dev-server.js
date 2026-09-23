const http = require("http");
const fs = require("fs");
const path = require("path");

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".mp3": "audio/mpeg",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml",
};

const STATIC_DIR = __dirname;

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith("/api/contact")) {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const data = JSON.parse(body || "{}");
      const { name, email, message } = data;

      if (!name || !email || !message) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing required fields" }));
        return;
      }

      console.log("Contact form submission received:", { name, email, message });
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  let url = req.url;
  if (url === "/") url = "/index.html";

  const filePath = path.join(STATIC_DIR, url);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath);
  const mimeType = MIME_TYPES[ext] || "application/octet-stream";

  res.writeHead(200, { "Content-Type": mimeType });
  fs.createReadStream(filePath).pipe(res);
});

const PORT = process.env.PORT || 8002;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
