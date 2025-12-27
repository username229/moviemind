import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  /* ===========================
     AUTH
  ============================ */
  setupAuth(app);

  /* ===========================
     MOVIES
  ============================ */
  app.get("/api/movies", async (_req, res) => {
    const movies = await storage.getMovies();
    res.json(movies);
  });

  app.get("/api/movies/:id", async (req, res) => {
    const movieId = Number(req.params.id);
    const movie = await storage.getMovie(movieId);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(movie);
  });

  /* ===========================
     RECOMMENDATIONS
  ============================ */
  app.get("/api/recommendations", async (_req, res) => {
    const movies = await storage.getMovies();

    const shuffled = [...movies].sort(() => 0.5 - Math.random());
    res.json(shuffled.slice(0, 3));
  });

  /* ===========================
     FAVORITES
  ============================ */
  app.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    // @ts-ignore
    const userId = req.user.id;
    const favorites = await storage.getFavorites(userId);
    res.json(favorites);
  });

  app.post("/api/favorites/:movieId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    // @ts-ignore
    const userId = req.user.id;
    const movieId = Number(req.params.movieId);

    const isFavorite = await storage.toggleFavorite(userId, movieId);
    res.json({ isFavorite });
  });

  /* ===========================
     SEED (executa uma vez)
  ============================ */
  await storage.seedMovies();

  return httpServer;
}
