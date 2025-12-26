import { 
  users, movies, favorites,
  type User, type InsertUser, type Movie, type Favorite
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;
  createMovie(movie: Omit<Movie, "id">): Promise<Movie>;
  
  getFavorites(userId: number): Promise<Movie[]>;
  toggleFavorite(userId: number, movieId: number): Promise<boolean>;
  
  seedMovies(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getMovies(): Promise<Movie[]> {
    return await db.select().from(movies);
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie;
  }

  async createMovie(movie: Omit<Movie, "id">): Promise<Movie> {
    const [newMovie] = await db.insert(movies).values(movie).returning();
    return newMovie;
  }

  async getFavorites(userId: number): Promise<Movie[]> {
    const favs = await db.select({
      movie: movies
    })
    .from(favorites)
    .innerJoin(movies, eq(favorites.movieId, movies.id))
    .where(eq(favorites.userId, userId));
    
    return favs.map(f => f.movie);
  }

  async toggleFavorite(userId: number, movieId: number): Promise<boolean> {
    const [existing] = await db.select()
      .from(favorites)
      .where(
        or(
          eq(favorites.userId, userId),
          eq(favorites.movieId, movieId)
        )
      ); // Fix: Logic error in 'or', should be 'and' but drizzle query builder for multiple conditions is simpler.
    
    // Correct logic:
    const existingFav = await db.query.favorites.findFirst({
      where: (fields, { and, eq }) => and(eq(fields.userId, userId), eq(fields.movieId, movieId))
    });

    if (existingFav) {
      await db.delete(favorites).where(eq(favorites.id, existingFav.id));
      return false;
    } else {
      await db.insert(favorites).values({ userId, movieId });
      return true;
    }
  }

  async seedMovies(): Promise<void> {
    const count = await db.select().from(movies);
    if (count.length > 0) return;

    const seedData = [
      {
        title: "Inception",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        genre: "Action, Adventure, Sci-Fi",
        rating: 88,
        releaseYear: 2010
      },
      {
        title: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        posterUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg",
        genre: "Action, Crime, Drama",
        rating: 90,
        releaseYear: 2008
      },
      {
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        posterUrl: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg",
        genre: "Adventure, Drama, Sci-Fi",
        rating: 86,
        releaseYear: 2014
      },
      {
        title: "The Matrix",
        description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
        posterUrl: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
        genre: "Action, Sci-Fi",
        rating: 87,
        releaseYear: 1999
      },
      {
        title: "Pulp Fiction",
        description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        posterUrl: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
        genre: "Crime, Drama",
        rating: 89,
        releaseYear: 1994
      }
    ];

    for (const movie of seedData) {
      await this.createMovie(movie);
    }
  }
}

export const storage = new DatabaseStorage();
