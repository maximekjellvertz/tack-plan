import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Ogiltig e-postadress" }),
  password: z.string().min(6, { message: "Lösenordet måste vara minst 6 tecken" }),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validation = authSchema.safeParse({ email, password });
      if (!validation.success) {
        toast({
          title: "Ogiltiga uppgifter",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      setLoading(true);

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "Inloggning misslyckades",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Inloggad!",
          description: "Välkommen tillbaka!",
        });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "E-postadressen används redan",
              description: "Försök logga in istället eller använd en annan e-postadress.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Registrering misslyckades",
              description: error.message,
              variant: "destructive",
            });
          }
          return;
        }

        toast({
          title: "Konto skapat!",
          description: "Välkommen till Hoofprints!",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Ett fel uppstod",
        description: "Försök igen senare",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Heart className="w-10 h-10 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Tävlingsplaneraren</h1>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? "Logga in" : "Skapa konto"}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              placeholder="din@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Lösenord</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minst 6 tecken"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Laddar..." : isLogin ? "Logga in" : "Skapa konto"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-primary hover:underline"
          >
            {isLogin
              ? "Har du inget konto? Skapa ett här"
              : "Har du redan ett konto? Logga in här"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
