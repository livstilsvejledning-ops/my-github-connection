import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { X, Send, FileText, Loader2, ChevronDown } from 'lucide-react';

interface Customer {
  id: string;
  user_id: string;
  profile: {
    full_name: string;
    email: string;
    profile_image_url: string | null;
  } | null;
}

interface NewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (data: { to_user_id: string; subject: string; body: string }) => Promise<void>;
  customers: Customer[];
}

const messageTemplates = [
  {
    id: 'welcome',
    name: 'Velkomst besked',
    subject: 'Velkommen til kostvejledning!',
    body: 'Hej {{navn}},\n\nVelkommen til vores kostvejledning program! Jeg glæder mig til at hjælpe dig med at nå dine mål.\n\nDu kan altid kontakte mig her, hvis du har spørgsmål.\n\nVenlig hilsen'
  },
  {
    id: 'checkin',
    name: 'Ugentlig check-in',
    subject: 'Tid til ugentlig check-in',
    body: 'Hej {{navn}},\n\nDet er tid til din ugentlige check-in! Husk at registrere din vægt, humør og energiniveau.\n\nHvordan går det med kostplanen denne uge?'
  },
  {
    id: 'mealplan',
    name: 'Måltidsplan klar',
    subject: 'Din nye måltidsplan er klar!',
    body: 'Hej {{navn}},\n\nDin måltidsplan for uge {{uge}} er nu klar! Du kan se den i appen under "Måltidsplaner".\n\nHar du spørgsmål, så skriv endelig.'
  },
  {
    id: 'motivation',
    name: 'Motivation',
    subject: 'Du klarer det fantastisk!',
    body: 'Hej {{navn}},\n\nJeg ville bare lige skrive og sige, at du gør det rigtig godt! Bliv ved med det gode arbejde.\n\nHusk: Små skridt fører til store resultater!'
  },
  {
    id: 'reminder',
    name: 'Påmindelse om booking',
    subject: 'Påmindelse: Vores møde i morgen',
    body: 'Hej {{navn}},\n\nDette er en venlig påmindelse om vores møde i morgen.\n\nHar du brug for at ændre tiden, så lad mig vide det.\n\nVi ses!'
  },
];

export function NewMessageModal({
  open,
  onOpenChange,
  onSend,
  customers,
}: NewMessageModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedCustomer = customers.find(c => c.user_id === selectedCustomerId);

  const handleTemplateSelect = (templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId);
    if (template) {
      const customerName = selectedCustomer?.profile?.full_name || '{{navn}}';
      setSubject(template.subject.replace('{{navn}}', customerName));
      setBody(template.body.replace(/\{\{navn\}\}/g, customerName));
    }
  };

  const handleSend = async () => {
    if (!selectedCustomerId || !subject || !body) return;

    setIsLoading(true);
    try {
      await onSend({
        to_user_id: selectedCustomerId,
        subject,
        body,
      });
      setSelectedCustomerId('');
      setSubject('');
      setBody('');
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 rounded-2xl overflow-hidden border-0">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 gradient-primary">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-white">
              Ny Besked
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="p-5 bg-card space-y-4 max-h-[60vh] overflow-y-auto">
          {/* To */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Til <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
              <SelectTrigger className="rounded-xl bg-input border-border focus:border-primary">
                <SelectValue placeholder="Vælg modtager">
                  {selectedCustomer && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={selectedCustomer.profile?.profile_image_url || ''} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getInitials(selectedCustomer.profile?.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedCustomer.profile?.full_name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-60">
                {customers.map((customer) => (
                  <SelectItem key={customer.user_id} value={customer.user_id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={customer.profile?.profile_image_url || ''} />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getInitials(customer.profile?.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{customer.profile?.full_name || 'Ukendt'}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Emne <span className="text-destructive">*</span>
            </Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Skriv emne..."
              className="rounded-xl bg-input border-border focus:border-primary"
            />
          </div>

          {/* Template Selector */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg">
                  <FileText className="mr-2 h-4 w-4" />
                  Brug template
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-xl w-56">
                {messageTemplates.map((template) => (
                  <DropdownMenuItem
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className="cursor-pointer"
                  >
                    {template.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Besked <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Skriv din besked..."
              className="rounded-xl bg-input border-border focus:border-primary min-h-[200px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-4 border-t border-border bg-card flex justify-between">
          <Button variant="outline" className="rounded-xl">
            Gem som kladde
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Annuller
            </Button>
            <Button
              onClick={handleSend}
              disabled={isLoading || !selectedCustomerId || !subject || !body}
              className="rounded-xl gradient-primary text-white"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Nu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
