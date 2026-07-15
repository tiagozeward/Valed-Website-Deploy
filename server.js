const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT) || 3000;
const rootDir = __dirname;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function sendFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = contentTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }

    res.writeHead(statusCode, {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600"
    });
    res.end(data);
  });
}

// Serve a real 404 for unknown paths so search engines don't index infinite
// duplicate URLs (previously every unknown path returned index.html with a 200,
// creating soft-404s). Falls back to a plain body if 404.html is absent.
function send404(res) {
  const notFoundPage = path.join(rootDir, "404.html");
  fs.stat(notFoundPage, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(res, notFoundPage, 404);
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  });
}

const server = http.createServer((req, res) => {
  const reqPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const normalizedPath = reqPath === "/" ? "/index.html" : reqPath;
  const safePath = path.normalize(normalizedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(rootDir, safePath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(res, filePath);
      return;
    }

    // Directory request (e.g. "/") → serve its index.html.
    if (!error && stats.isDirectory()) {
      sendFile(res, path.join(filePath, "index.html"));
      return;
    }

    // Extensionless path that maps to a real .html file (e.g. /para-tutores).
    if (!path.extname(safePath)) {
      const htmlPath = path.join(rootDir, safePath.replace(/\/$/, "") + ".html");
      fs.stat(htmlPath, (htmlError, htmlStats) => {
        if (!htmlError && htmlStats.isFile()) {
          sendFile(res, htmlPath);
          return;
        }
        send404(res);
      });
      return;
    }

    send404(res);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Valed website running on port ${port}`);
});
