import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UtensilsCrossed } from 'lucide-react';

export default function Auth() {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />
      </div>
      
      <Card className="relative z-10 w-full max-w-md rounded-2xl border-border shadow-soft">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
            <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">KostCRM</CardTitle>
          <CardDescription className="text-muted-foreground">
            Dit professionelle kostvejledning system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-card">
                Log ind
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-card">
                Opret konto
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm isLoading={isLoading} setIsLoading={setIsLoading} />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm isLoading={isLoading} setIsLoading={setIsLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginForm({ isLoading, setIsLoading }: { isLoading: boolean; setIsLoading: (v: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Login fejlede",
        description: error.message === 'Invalid login credentials' 
          ? 'Forkert email eller adgangskode' 
          : error.message,
      });
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="din@email.dk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Adgangskode</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded-xl"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Log ind
      </Button>
    </form>
  );
}

function SignupForm({ isLoading, setIsLoading }: { isLoading: boolean; setIsLoading: (v: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Adgangskode for kort",
        description: "Adgangskoden skal være mindst 6 tegn",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      const message = error.message.includes('already registered')
        ? 'Denne email er allerede registreret'
        : error.message;
      
      toast({
        variant: "destructive",
        title: "Oprettelse fejlede",
        description: message,
      });
    } else {
      toast({
        title: "Konto oprettet!",
        description: "Tjek din email for at bekræfte din konto.",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Fulde navn</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="Dit navn"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signupEmail">Email</Label>
        <Input
          id="signupEmail"
          type="email"
          placeholder="din@email.dk"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signupPassword">Adgangskode</Label>
        <Input
          id="signupPassword"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="rounded-xl"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full rounded-xl gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Opret konto
      </Button>
    </form>
  );
}
