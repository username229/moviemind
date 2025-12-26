import { Hero } from "@/components/Hero";
import { MovieCard } from "@/components/MovieCard";
import { Navbar } from "@/components/Navbar";
import { useMovies, useRecommendations, useFavorites } from "@/hooks/use-movies";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const { data: movies, isLoading: moviesLoading } = useMovies();
  const { data: recommendations, isLoading: recsLoading } = useRecommendations();
  const { data: favorites } = useFavorites();

  const favoriteIds = new Set(favorites?.map(m => m.id));

  const isLoading = moviesLoading || (user && recsLoading);

  return (
    <div className="min-h-screen bg-background hero-gradient pb-20">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Hero />

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-16 mt-12">
            {/* Recommendations Section (Only if logged in) */}
            {user && recommendations && recommendations.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-white">Recommended for You</h2>
                    <p className="text-muted-foreground mt-1">Based on your favorites and watch history</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {recommendations.map((movie) => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      isFavorite={favoriteIds.has(movie.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Trending/All Movies Section */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-display font-bold text-white">Trending Now</h2>
                  <p className="text-muted-foreground mt-1">Top rated movies this week</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies?.map((movie) => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    isFavorite={favoriteIds.has(movie.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
