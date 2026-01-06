import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResetPasswordModal({ isOpen, onClose }: ResetPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Manglende email",
        description: "Indtast din email adresse",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await resetPassword(email);
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Fejl",
        description: error.message,
      });
    } else {
      setIsSuccess(true);
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setEmail('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {isSuccess ? (
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl">Email sendt!</DialogTitle>
              <DialogDescription className="mt-2">
                Vi har sendt en email til <strong>{email}</strong> med et link til at nulstille din adgangskode.
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mt-4">
              Tjek din indbakke (og spam mappe) for emailen.
            </p>
            <Button onClick={handleClose} className="mt-6 gradient-primary text-white">
              Tilbage til login
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Nulstil adgangskode</DialogTitle>
              <DialogDescription>
                Indtast din email, så sender vi dig et link til at nulstille din adgangskode.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="din@email.dk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl bg-input border-border focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Tilbage
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 gradient-primary text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sender...
                    </>
                  ) : (
                    'Send link'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
