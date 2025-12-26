import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Auth routes
  setupAuth(app);

  // Movie routes
  app.get("/api/movies", async (req, res) => {
    const movies = await storage.getMovies();
    res.json(movies);
  });

  app.get("/api/movies/:id", async (req, res) => {
    const movie = await storage.getMovie(Number(req.params.id));
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  });

  app.get("/api/recommendations", async (req, res) => {
    // Simple logic: return random movies or same genre as favorites
    // For now, just return all movies shuffled or limited
    const movies = await storage.getMovies();
    // Return random 3 movies
    const shuffled = movies.sort(() => 0.5 - Math.random());
    res.json(shuffled.slice(0, 3));
  });

  // Favorites
  app.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // @ts-ignore
    const userId = req.user.id;
    const favorites = await storage.getFavorites(userId);
    res.json(favorites);
  });

  app.post("/api/favorites/:movieId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // @ts-ignore
    const userId = req.user.id;
    const movieId = Number(req.params.movieId);
    
    const isFavorite = await storage.toggleFavorite(userId, movieId);
    res.json({ isFavorite });
  });

  // Seed data on startup
  await storage.seedMovies();

  return httpServer;
}
