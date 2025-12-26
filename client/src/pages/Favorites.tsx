import { Navbar } from "@/components/Navbar";
import { MovieCard } from "@/components/MovieCard";
import { useFavorites } from "@/hooks/use-movies";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, HeartOff } from "lucide-react";
import { Redirect } from "wouter";

export default function Favorites() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: favorites, isLoading: favLoading } = useFavorites();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-background hero-gradient">
      <Navbar />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold text-white">Your Favorites</h1>
          <p className="text-muted-foreground mt-2 text-lg">Collection of your most loved films</p>
        </div>

        {favLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {favorites.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                isFavorite={true} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center border border-dashed border-border rounded-3xl bg-card/30">
            <div className="bg-background p-4 rounded-full mb-4 ring-1 ring-border">
              <HeartOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No favorites yet</h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Start exploring movies and click the heart icon to add them to your collection.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
