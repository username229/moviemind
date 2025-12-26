import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useMovies() {
  return useQuery({
    queryKey: [api.movies.list.path],
    queryFn: async () => {
      const res = await fetch(api.movies.list.path);
      if (!res.ok) throw new Error("Failed to fetch movies");
      return api.movies.list.responses[200].parse(await res.json());
    },
  });
}

export function useRecommendations() {
  return useQuery({
    queryKey: [api.movies.recommendations.path],
    queryFn: async () => {
      const res = await fetch(api.movies.recommendations.path);
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return api.movies.recommendations.responses[200].parse(await res.json());
    },
  });
}

export function useMovie(id: number) {
  return useQuery({
    queryKey: [api.movies.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.movies.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch movie");
      return api.movies.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: [api.favorites.list.path],
    queryFn: async () => {
      const res = await fetch(api.favorites.list.path);
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return api.favorites.list.responses[200].parse(await res.json());
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (movieId: number) => {
      const url = buildUrl(api.favorites.toggle.path, { movieId });
      const res = await fetch(url, {
        method: api.favorites.toggle.method,
      });

      if (!res.ok) throw new Error("Failed to update favorite");
      return api.favorites.toggle.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.favorites.list.path] });
      // We also invalidate movies list/get to potentially update UI there if we show fav status
      queryClient.invalidateQueries({ queryKey: [api.movies.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.movies.recommendations.path] });
      
      toast({
        title: data.isFavorite ? "Added to Favorites" : "Removed from Favorites",
        description: data.isFavorite ? "Movie saved to your list." : "Movie removed from your list.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
