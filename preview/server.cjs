const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = __dirname, PORT = process.env.PORT || 8080;
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".png": "image/png" };
http.createServer((req, res) => {
  let f = path.join(ROOT, req.url === "/" ? "index.html" : req.url.split("?")[0]);
  if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "text/plain" }); res.end(d); });
}).listen(PORT, () => console.log(`HCR preview live at http://localhost:${PORT}`));
