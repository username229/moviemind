import { motion } from "framer-motion";
import { Star, Heart } from "lucide-react";
import { Link } from "wouter";
import type { Movie } from "@shared/schema";
import { useToggleFavorite } from "@/hooks/use-movies";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  isFavorite?: boolean;
}

export function MovieCard({ movie, isFavorite = false }: MovieCardProps) {
  const toggleFavorite = useToggleFavorite();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate(movie.id);
  };

  return (
    <Link href={`/movie/${movie.id}`} className="group block h-full">
      <motion.div 
        whileHover={{ y: -8 }}
        className="relative h-full overflow-hidden rounded-xl bg-card border border-border/50 shadow-lg transition-colors group-hover:border-primary/50"
      >
        {/* Poster Image */}
        <div className="aspect-[2/3] w-full overflow-hidden relative">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          
          <button
            onClick={handleFavoriteClick}
            disabled={toggleFavorite.isPending}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
          >
            <Heart className={cn("w-5 h-5", isFavorite && "fill-current text-red-500 hover:text-white")} />
          </button>

          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-bold text-white">{movie.rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-display font-bold text-lg leading-tight text-white group-hover:text-primary transition-colors line-clamp-1">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span>{movie.releaseYear}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="truncate max-w-[120px]">{movie.genre.split(',')[0]}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
