import { useState, useEffect } from 'react';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ResetPasswordModal } from '@/components/auth/ResetPasswordModal';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UtensilsCrossed, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const { user, loading, isAdmin, isClient } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Check if this is a password reset callback
  useEffect(() => {
    if (searchParams.get('reset') === 'true') {
      // Handle password reset flow if needed
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Role-based redirect
  if (user) {
    if (isClient && !isAdmin) {
      return <Navigate to="/client" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-secondary/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/10 blur-3xl" />
      </div>
      
      {/* Card with gradient border */}
      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-0.5 rounded-3xl gradient-primary opacity-75 blur-sm" />
        <div className="relative rounded-3xl bg-card border border-border/50 shadow-soft overflow-hidden">
          {/* Header */}
          <div className="pt-8 pb-4 px-8 text-center">
            {/* Logo */}
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-lg">
              <UtensilsCrossed className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">KostCRM</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Dit professionelle kostvejledning system
            </p>
          </div>

          {/* Content */}
          <div className="px-8 pb-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1 mb-6">
                <TabsTrigger 
                  value="login" 
                  className="rounded-lg font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  Log ind
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="rounded-lg font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  Opret konto
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-0">
                <LoginForm 
                  isLoading={isLoading} 
                  setIsLoading={setIsLoading}
                  onForgotPassword={() => setIsResetModalOpen(true)}
                />
              </TabsContent>
              
              <TabsContent value="signup" className="mt-0">
                <SignupForm isLoading={isLoading} setIsLoading={setIsLoading} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <ResetPasswordModal 
        isOpen={isResetModalOpen} 
        onClose={() => setIsResetModalOpen(false)} 
      />
    </div>
  );
}

function LoginForm({ 
  isLoading, 
  setIsLoading, 
  onForgotPassword 
}: { 
  isLoading: boolean; 
  setIsLoading: (v: boolean) => void;
  onForgotPassword: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      toast({
        variant: "destructive",
        title: "Manglende oplysninger",
        description: "Udfyld venligst både email og adgangskode",
      });
      return;
    }

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="din@email.dk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 rounded-xl bg-input border-border focus:border-primary focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-foreground">
          Adgangskode
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10 pr-10 rounded-xl bg-input border-border focus:border-primary focus:ring-primary/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Remember me & Forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="remember" 
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label 
            htmlFor="remember" 
            className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          >
            Husk mig
          </Label>
        </div>
        <button
          type="button"
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          onClick={onForgotPassword}
        >
          Glemt password?
        </button>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-lg hover:shadow-hover hover:opacity-95 transition-all duration-300"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Logger ind...
          </>
        ) : (
          'Log ind'
        )}
      </Button>
    </form>
  );
}

function SignupForm({ isLoading, setIsLoading }: { isLoading: boolean; setIsLoading: (v: boolean) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      toast({
        variant: "destructive",
        title: "Manglende oplysninger",
        description: "Udfyld venligst alle felter",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Adgangskode for kort",
        description: "Adgangskoden skal være mindst 6 tegn",
      });
      return;
    }

    setIsLoading(true);

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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
          Fulde navn
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="fullName"
            type="text"
            placeholder="Dit navn"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="pl-10 rounded-xl bg-input border-border focus:border-primary focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="signupEmail" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signupEmail"
            type="email"
            placeholder="din@email.dk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="pl-10 rounded-xl bg-input border-border focus:border-primary focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="signupPassword" className="text-sm font-medium text-foreground">
          Adgangskode
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signupPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mindst 6 tegn"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pl-10 pr-10 rounded-xl bg-input border-border focus:border-primary focus:ring-primary/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Mindst 6 tegn</p>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold shadow-lg hover:shadow-hover hover:opacity-95 transition-all duration-300"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Opretter konto...
          </>
        ) : (
          'Opret konto'
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Ved at oprette en konto accepterer du vores{' '}
        <button type="button" className="text-primary hover:underline">
          vilkår og betingelser
        </button>
      </p>
    </form>
  );
}
