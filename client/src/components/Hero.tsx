import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import { Link } from "wouter";

export function Hero() {
  return (
    <div className="relative w-full h-[60vh] min-h-[500px] overflow-hidden rounded-3xl my-6 mx-auto max-w-7xl px-4 sm:px-6">
      {/* Background Image - Cinematic */}
      <div 
        className="absolute inset-0 bg-cover bg-center rounded-3xl"
        style={{
          // Using a cinematic placeholder or featured movie
          backgroundImage: `url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop')` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      <div className="relative h-full flex items-center">
        <div className="container px-8 sm:px-12">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
              Featured Selection
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
              Cinema at your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Fingertips</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
              Discover your next favorite movie with our AI-powered recommendation engine. 
              Personalized picks just for you.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button size="lg" className="h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 font-bold text-base shadow-xl shadow-white/10">
                <Play className="mr-2 h-5 w-5 fill-current" />
                Start Watching
              </Button>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-white/20 bg-white/5 hover:bg-white/10 text-white backdrop-blur-md">
                  <Info className="mr-2 h-5 w-5" />
                  More Info
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
