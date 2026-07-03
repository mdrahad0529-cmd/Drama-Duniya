import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Serve API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // GDrive direct download bypass helper
  app.get("/api/bypass-gdrive", async (req, res) => {
    const fileId = req.query.id as string;
    if (!fileId) {
      return res.status(400).json({ error: "Missing file ID" });
    }

    try {
      const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        }
      });

      const text = await response.text();

      // Attempt to extract the confirmation token from different HTML patterns
      let confirmToken = "";

      // Pattern 1: Any substring matches of type confirm=XXXX
      // (Google Drive large files warning page usually contains confirm=XXXX in links/forms)
      const hrefMatch = text.match(/confirm=([0-9a-zA-Z_-]+)/);
      if (hrefMatch && hrefMatch[1]) {
        confirmToken = hrefMatch[1];
      } else {
        // Pattern 2: Hidden input with name="confirm"
        const inputMatch = text.match(/name="confirm"\s+value="([0-9a-zA-Z_-]+)"/) || 
                           text.match(/value="([0-9a-zA-Z_-]+)"\s+name="confirm"/);
        if (inputMatch && inputMatch[1]) {
          confirmToken = inputMatch[1];
        } else {
          // Pattern 3: Look inside scripts/javascript blocks or download warning button hrefs
          const genericMatch = text.match(/confirm=([a-zA-Z0-9_-]{4,16})/);
          if (genericMatch && genericMatch[1] && genericMatch[1] !== "download") {
            confirmToken = genericMatch[1];
          }
        }
      }

      if (confirmToken) {
        const directUrl = `https://drive.google.com/uc?export=download&confirm=${confirmToken}&id=${fileId}`;
        return res.json({ success: true, url: directUrl, bypassed: true, token: confirmToken });
      } else {
        // No token found (e.g. if the file is smaller than 100MB and Google doesn't present a scan warning)
        return res.json({ success: true, url, bypassed: false });
      }
    } catch (error: any) {
      console.error("GDrive bypass error:", error);
      return res.status(500).json({ error: error.message || "Failed to bypass Google Drive scan" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
