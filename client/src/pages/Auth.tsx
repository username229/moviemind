import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { loginMutation, registerMutation, user } = useAuth();
  
  // URL param handling manually since wouter doesn't parse query params easily
  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";

  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2670&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2.5 rounded-xl">
              <Film className="h-6 w-6 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-white">MovieMind</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <blockquote className="space-y-2">
            <p className="text-2xl font-medium leading-relaxed text-white">
              "The personalized recommendations are spot on. I've discovered so many hidden gems I wouldn't have found otherwise."
            </p>
            <footer className="text-lg text-white/60 font-display">
              — Sofia Davis, Film Critic
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2 lg:hidden">
            <div className="flex justify-center mb-4">
              <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/20">
                <Film className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-display font-bold">MovieMind</h1>
          </div>

          <Card className="p-8 border-border/50 shadow-2xl bg-card/50 backdrop-blur-sm">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <div className="space-y-6">
                  <div className="space-y-1 text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
                    <p className="text-muted-foreground text-sm">Enter your credentials to access your account</p>
                  </div>
                  <LoginForm onSubmit={(data) => loginMutation.mutate(data)} isLoading={loginMutation.isPending} />
                </div>
              </TabsContent>
              
              <TabsContent value="register">
                <div className="space-y-6">
                  <div className="space-y-1 text-center">
                    <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
                    <p className="text-muted-foreground text-sm">Join us to start curating your watchlist</p>
                  </div>
                  <RegisterForm onSubmit={(data) => registerMutation.mutate(data)} isLoading={registerMutation.isPending} />
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, isLoading }: { onSubmit: (data: InsertUser) => void, isLoading: boolean }) {
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} className="h-11 bg-background/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} className="h-11 bg-background/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}

function RegisterForm({ onSubmit, isLoading }: { onSubmit: (data: InsertUser) => void, isLoading: boolean }) {
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Choose a username" {...field} className="h-11 bg-background/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Choose a password" {...field} className="h-11 bg-background/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
        </Button>
      </form>
    </Form>
  );
}
