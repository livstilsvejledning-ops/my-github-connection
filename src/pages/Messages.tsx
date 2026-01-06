import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { NewMessageModal } from '@/components/messages/NewMessageModal';
import { 
  Mail, 
  Plus, 
  Search, 
  Send, 
  Bot, 
  Calendar, 
  User,
  Phone,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface MessageWithProfile {
  id: string;
  from_user_id: string;
  to_user_id: string;
  subject: string | null;
  body: string;
  is_read: boolean;
  is_automated: boolean;
  trigger_type: string | null;
  created_at: string;
  from_profile?: {
    id: string;
    full_name: string;
    email: string;
    profile_image_url: string | null;
  } | null;
  to_profile?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    profile_image_url: string | null;
  } | null;
}

interface Customer {
  id: string;
  user_id: string;
  profile: {
    full_name: string;
    email: string;
    profile_image_url: string | null;
  } | null;
}

type FilterType = 'all' | 'unread' | 'sent' | 'automated';

export default function Messages() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<MessageWithProfile[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchCustomers();

    // Set up real-time subscription
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, messages]);

  const fetchMessages = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data: messagesData } = await supabase
      .from('messages')
      .select('*')
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (messagesData && messagesData.length > 0) {
      const userIds = [...new Set([
        ...messagesData.map(m => m.from_user_id),
        ...messagesData.map(m => m.to_user_id)
      ].filter(Boolean))];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, profile_image_url')
        .in('id', userIds);

      const messagesWithProfiles = messagesData.map(message => ({
        ...message,
        from_profile: profiles?.find(p => p.id === message.from_user_id) || null,
        to_profile: profiles?.find(p => p.id === message.to_user_id) || null,
      }));

      setMessages(messagesWithProfiles as MessageWithProfile[]);
    } else {
      setMessages([]);
    }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('id, user_id');

    if (data && data.length > 0) {
      const userIds = data.map(c => c.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, profile_image_url')
        .in('id', userIds);

      const customersWithProfiles = data.map(customer => ({
        ...customer,
        profile: profiles?.find(p => p.id === customer.user_id) || null
      }));
      setCustomers(customersWithProfiles as Customer[]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group messages by conversation partner
  const getConversations = () => {
    if (!user) return [];

    const conversationMap = new Map<string, {
      partnerId: string;
      partnerProfile: MessageWithProfile['from_profile'] | MessageWithProfile['to_profile'];
      lastMessage: MessageWithProfile;
      unreadCount: number;
    }>();

    messages.forEach(message => {
      const partnerId = message.from_user_id === user.id 
        ? message.to_user_id 
        : message.from_user_id;
      
      const partnerProfile = message.from_user_id === user.id
        ? message.to_profile
        : message.from_profile;

      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partnerId,
          partnerProfile,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      const conv = conversationMap.get(partnerId)!;
      if (!message.is_read && message.to_user_id === user.id) {
        conv.unreadCount++;
      }
    });

    return Array.from(conversationMap.values());
  };

  const getConversationMessages = () => {
    if (!selectedConversation || !user) return [];
    
    return messages
      .filter(m => 
        (m.from_user_id === selectedConversation && m.to_user_id === user.id) ||
        (m.from_user_id === user.id && m.to_user_id === selectedConversation)
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const filterConversations = (conversations: ReturnType<typeof getConversations>) => {
    let filtered = conversations;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(conv => 
        conv.partnerProfile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;
      case 'sent':
        filtered = filtered.filter(conv => 
          conv.lastMessage.from_user_id === user?.id
        );
        break;
      case 'automated':
        filtered = filtered.filter(conv => conv.lastMessage.is_automated);
        break;
    }

    return filtered;
  };

  const handleSelectConversation = async (partnerId: string) => {
    setSelectedConversation(partnerId);

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('from_user_id', partnerId)
      .eq('to_user_id', user?.id);

    fetchMessages();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setIsSending(true);
    const { error } = await supabase
      .from('messages')
      .insert({
        from_user_id: user.id,
        to_user_id: selectedConversation,
        body: newMessage,
        is_read: false,
        is_automated: false,
      });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Fejl',
        description: 'Kunne ikke sende besked',
      });
    } else {
      setNewMessage('');
      fetchMessages();
    }
    setIsSending(false);
  };

  const handleNewMessage = async (data: { to_user_id: string; subject: string; body: string }) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        from_user_id: user?.id,
        to_user_id: data.to_user_id,
        subject: data.subject,
        body: data.body,
        is_read: false,
        is_automated: false,
      });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Fejl',
        description: 'Kunne ikke sende besked',
      });
    } else {
      toast({
        title: 'Besked sendt',
        description: 'Din besked er blevet sendt',
      });
      fetchMessages();
      setSelectedConversation(data.to_user_id);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const conversations = filterConversations(getConversations());
  const conversationMessages = getConversationMessages();
  const selectedPartner = conversations.find(c => c.partnerId === selectedConversation);

  const filterTabs: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Alle' },
    { value: 'unread', label: 'Ulæste' },
    { value: 'sent', label: 'Sendte' },
    { value: 'automated', label: 'Automatiske' },
  ];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden border border-border bg-card shadow-card">
        {/* Left Panel - Inbox */}
        <div className="w-[360px] border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Beskeder</h2>
              </div>
              <Button 
                onClick={() => setIsNewMessageOpen(true)}
                size="sm" 
                className="rounded-xl gradient-primary text-white"
              >
                <Plus className="mr-1 h-4 w-4" />
                Ny Besked
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søg i beskeder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl bg-input border-border"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1">
              {filterTabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all",
                    activeFilter === tab.value
                      ? "gradient-primary text-white"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Mail className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">Ingen beskeder endnu</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.partnerId}
                  onClick={() => handleSelectConversation(conv.partnerId)}
                  className={cn(
                    "w-full p-4 text-left transition-all border-l-4",
                    selectedConversation === conv.partnerId
                      ? "border-l-primary bg-muted/50"
                      : "border-l-transparent hover:bg-muted/30"
                  )}
                >
                  <div className="flex gap-3">
                    <div className="relative">
                      <Avatar className={cn(
                        "h-10 w-10",
                        conv.unreadCount > 0 && "ring-2 ring-primary"
                      )}>
                        <AvatarImage src={conv.partnerProfile?.profile_image_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(conv.partnerProfile?.full_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      {conv.lastMessage.is_automated && (
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-card flex items-center justify-center">
                          <Bot className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground truncate">
                          {conv.partnerProfile?.full_name || 'Ukendt'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conv.lastMessage.created_at), { 
                            addSuffix: false, 
                            locale: da 
                          })}
                        </span>
                      </div>
                      {conv.lastMessage.subject && (
                        <p className="text-sm font-medium text-foreground truncate">
                          {conv.lastMessage.subject}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {conv.lastMessage.body}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge className="h-5 w-5 p-0 flex items-center justify-center gradient-primary text-white text-xs">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Conversation */}
        <div className="flex-1 flex flex-col">
          {selectedConversation && selectedPartner ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedPartner.partnerProfile?.profile_image_url || ''} />
                    <AvatarFallback className="gradient-primary text-white">
                      {getInitials(selectedPartner.partnerProfile?.full_name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {selectedPartner.partnerProfile?.full_name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedPartner.partnerProfile?.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Møde
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <User className="mr-2 h-4 w-4" />
                    Se Profil
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: '#FFF8F0' }}>
                {conversationMessages.map(message => {
                  const isSent = message.from_user_id === user?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        isSent ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[70%] space-y-1",
                        isSent ? "items-end" : "items-start"
                      )}>
                        {message.is_automated && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Bot className="h-3 w-3" />
                            Automatisk sendt
                          </div>
                        )}
                        <div
                          className={cn(
                            "px-4 py-3 rounded-2xl",
                            isSent
                              ? "gradient-primary text-white rounded-br-md"
                              : "bg-card border border-border text-foreground rounded-bl-md"
                          )}
                        >
                          {message.subject && (
                            <p className={cn(
                              "font-medium text-sm mb-1",
                              isSent ? "text-white/90" : "text-foreground"
                            )}>
                              {message.subject}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                        </div>
                        <span className="text-xs text-muted-foreground px-2">
                          {format(new Date(message.created_at), 'HH:mm', { locale: da })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-3">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Skriv en besked..."
                    className="rounded-xl bg-input border-border focus:border-primary resize-none min-h-[48px] max-h-32"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="rounded-xl gradient-primary text-white px-6"
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Mail className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium">Vælg en samtale</p>
              <p className="text-sm">Eller start en ny besked</p>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        open={isNewMessageOpen}
        onOpenChange={setIsNewMessageOpen}
        onSend={handleNewMessage}
        customers={customers}
      />
    </DashboardLayout>
  );
}
