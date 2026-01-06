import { useState, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  body: string;
  subject: string | null;
  from_user_id: string | null;
  to_user_id: string | null;
  is_automated: boolean | null;
  is_read: boolean | null;
  created_at: string | null;
}

export default function ClientMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMessages();
      // Set up realtime subscription
      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `to_user_id=eq.${user.id}`
          },
          () => fetchMessages()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order('created_at', { ascending: true });

    setMessages(data || []);

    // Mark unread messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('to_user_id', user.id)
      .eq('is_read', false);
  };

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    setIsSending(true);
    try {
      await supabase.from('messages').insert({
        from_user_id: user.id,
        body: newMessage.trim(),
        subject: 'Besked fra klient'
      });

      setNewMessage('');
      toast.success('Besked sendt!');
      fetchMessages();
    } catch {
      toast.error('Kunne ikke sende besked');
    } finally {
      setIsSending(false);
    }
  };

  const isMyMessage = (msg: Message) => msg.from_user_id === user?.id;

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">Beskeder</h1>
          <p className="text-muted-foreground">Chat med din coach</p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-card rounded-2xl p-4 shadow-card">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Ingen beskeder endnu</p>
              <p className="text-sm text-muted-foreground mt-1">
                Send en besked til din coach
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  isMyMessage(message) ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    isMyMessage(message)
                      ? "gradient-primary text-white rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  {message.is_automated && (
                    <Badge 
                      variant="secondary" 
                      className="mb-2 text-xs bg-white/20 text-white border-0"
                    >
                      🤖 Automatisk
                    </Badge>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                  <p className={cn(
                    "text-xs mt-2",
                    isMyMessage(message) ? "text-white/70" : "text-muted-foreground"
                  )}>
                    {message.created_at && format(new Date(message.created_at), "d. MMM HH:mm", { locale: da })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="bg-card rounded-2xl p-4 shadow-card">
          <div className="flex gap-3">
            <Textarea
              placeholder="Skriv en besked..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-12 max-h-32 bg-muted/50 border-transparent focus:border-primary resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !newMessage.trim()}
              className="gradient-primary text-white px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
