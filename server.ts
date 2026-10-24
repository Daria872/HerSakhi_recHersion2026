import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { authRouter } from "./server/routes/auth.ts";
import { symptomsRouter } from "./server/routes/symptoms.ts";
import { wellnessRouter } from "./server/routes/wellness.ts";
import { placesRouter } from "./server/routes/places.ts";
import { consultationsRouter } from "./server/routes/consultations.ts";
import { aiRouter } from "./server/routes/ai.ts";
import { ruralRouter } from "./server/routes/rural.ts";
import { sosRouter } from "./server/routes/sos.ts";
import { remindersRouter } from "./server/routes/reminders.ts";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // Security headers & JSON parsing
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));

  // API Router Registration
  app.use("/api/auth", authRouter);
  app.use("/api/symptoms", symptomsRouter);
  app.use("/api/wellness", wellnessRouter);
  app.use("/api/places", placesRouter);
  app.use("/api/consultations", consultationsRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/rural", ruralRouter);
  app.use("/api/sos", sosRouter);
  app.use("/api/reminders", remindersRouter);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      platform: "HerSakhi • SheShines Healthcare Engine",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  // Serve static assets from public/ (including images and guides)
  app.use(express.static(path.resolve("public")));

  // Vite development middleware or production static build
  if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve("dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌸 HerSakhi SheShines server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start HerSakhi server:", err);
  process.exit(1);
});
