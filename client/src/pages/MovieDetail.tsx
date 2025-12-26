import { useParams, useLocation } from "wouter";
import { useMovie, useToggleFavorite, useFavorites } from "@/hooks/use-movies";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Loader2, Star, Calendar, Clock, Heart, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [_, setLocation] = useLocation();
  const movieId = parseInt(id || "0");
  
  const { data: movie, isLoading } = useMovie(movieId);
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  const isFavorite = favorites?.some(f => f.id === movieId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Movie not found</h1>
        <Button onClick={() => setLocation("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Backdrop */}
      <div className="relative w-full h-[50vh] lg:h-[60vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-sm scale-105 opacity-40"
          style={{ backgroundImage: `url(${movie.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

        <div className="absolute top-8 left-8 z-10">
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 w-4 h-4" /> Back
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Poster Card */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="w-64 md:w-80 rounded-xl overflow-hidden shadow-2xl shadow-black/50 border-4 border-background">
              <img 
                src={movie.posterUrl} 
                alt={movie.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 pt-4 md:pt-32 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white drop-shadow-lg leading-tight">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm md:text-base font-medium text-muted-foreground">
                <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{movie.rating}% Rating</span>
                </div>
                <div className="flex items-center gap-1.5 bg-card/50 px-3 py-1 rounded-full border border-white/5">
                  <Calendar className="w-4 h-4" />
                  <span>{movie.releaseYear}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {movie.genre}
                </div>
              </div>
            </div>

            <div className="max-w-3xl">
              <h3 className="text-lg font-bold text-white mb-2">Overview</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {movie.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button 
                onClick={() => toggleFavorite.mutate(movie.id)}
                disabled={toggleFavorite.isPending}
                size="lg" 
                variant={isFavorite ? "secondary" : "default"}
                className={cn(
                  "h-14 px-8 rounded-xl font-bold text-base transition-all",
                  isFavorite 
                    ? "bg-card hover:bg-card/80 text-foreground border border-border" 
                    : "bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/25"
                )}
              >
                <Heart className={cn("mr-2 w-5 h-5", isFavorite && "fill-red-500 text-red-500")} />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
