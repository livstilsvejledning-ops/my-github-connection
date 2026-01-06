import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Plus, Mail, MailOpen, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';

interface MessageWithProfile {
  id: string;
  subject: string | null;
  body: string;
  is_read: boolean;
  is_automated: boolean;
  created_at: string;
  from_user_id: string | null;
  from_profile: {
    full_name: string;
    email: string;
  } | null;
}

export default function Messages() {
  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .eq('to_user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (messagesData && messagesData.length > 0) {
      const fromUserIds = [...new Set(messagesData.map(m => m.from_user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', fromUserIds);

      const messagesWithProfiles = messagesData.map(message => ({
        ...message,
        from_profile: profiles?.find(p => p.id === message.from_user_id) || null
      }));
      setMessages(messagesWithProfiles as MessageWithProfile[]);
    } else {
      setMessages([]);
    }
    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);
    
    setMessages(messages.map(m => 
      m.id === messageId ? { ...m, is_read: true } : m
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Beskeder</h1>
            <p className="text-muted-foreground">Kommuniker med dine klienter</p>
          </div>
          <Button className="rounded-xl gradient-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Ny Besked
          </Button>
        </div>

        {/* Messages List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : messages.length === 0 ? (
          <Card className="rounded-2xl border-border shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">Ingen beskeder</p>
              <p className="text-muted-foreground">Du har ingen beskeder i din indbakke</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => (
              <Card
                key={message.id}
                className={`rounded-2xl border-border shadow-card transition-all duration-300 hover:shadow-hover cursor-pointer ${
                  !message.is_read ? 'bg-primary/5 border-primary/20' : ''
                }`}
                onClick={() => markAsRead(message.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(message.from_profile?.full_name || 'U')}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground truncate">
                            {message.from_profile?.full_name || 'Ukendt afsender'}
                          </h3>
                          {message.is_automated && (
                            <Badge variant="secondary" className="text-xs">
                              Auto
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {message.is_read ? (
                            <MailOpen className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Mail className="h-4 w-4 text-primary" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.created_at), {
                              addSuffix: true,
                              locale: da,
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {message.subject && (
                        <p className="text-sm font-medium text-foreground mt-1">
                          {message.subject}
                        </p>
                      )}
                      
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {message.body}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
