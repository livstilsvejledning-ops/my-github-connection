import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, User, Calendar, MessageCircle, UtensilsCrossed, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'customer' | 'booking' | 'message' | 'meal_plan';
  title: string;
  subtitle: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchResults: SearchResult[] = [];

    // Search customers
    const { data: customers } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      .limit(5);

    if (customers) {
      searchResults.push(...customers.map(c => ({
        id: c.id,
        type: 'customer' as const,
        title: c.full_name,
        subtitle: c.email
      })));
    }

    // Search bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        id, 
        booking_type, 
        scheduled_at,
        customer:customers(profile:profiles(full_name))
      `)
      .ilike('booking_type', `%${searchQuery}%`)
      .limit(3);

    if (bookings) {
      searchResults.push(...bookings.map(b => ({
        id: b.id,
        type: 'booking' as const,
        title: b.booking_type,
        subtitle: (b.customer as any)?.profile?.full_name || 'Booking'
      })));
    }

    // Search meal plans
    const { data: mealPlans } = await supabase
      .from('meal_plans')
      .select(`
        id,
        name,
        customer:customers(profile:profiles(full_name))
      `)
      .ilike('name', `%${searchQuery}%`)
      .limit(3);

    if (mealPlans) {
      searchResults.push(...mealPlans.map(m => ({
        id: m.id,
        type: 'meal_plan' as const,
        title: m.name,
        subtitle: (m.customer as any)?.profile?.full_name || 'Måltidsplan'
      })));
    }

    setResults(searchResults);
    setSelectedIndex(0);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  const handleSelect = (result: SearchResult) => {
    switch (result.type) {
      case 'customer':
        navigate(`/customers/${result.id}`);
        break;
      case 'booking':
        navigate('/bookings');
        break;
      case 'meal_plan':
        navigate('/meal-plans');
        break;
      case 'message':
        navigate('/messages');
        break;
    }
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'customer': return <User className="h-4 w-4" />;
      case 'booking': return <Calendar className="h-4 w-4" />;
      case 'message': return <MessageCircle className="h-4 w-4" />;
      case 'meal_plan': return <UtensilsCrossed className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'customer': return 'Kunde';
      case 'booking': return 'Booking';
      case 'message': return 'Besked';
      case 'meal_plan': return 'Måltidsplan';
      default: return type;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            type="text"
            placeholder="Søg efter kunder, bookings, måltidsplaner..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 bg-transparent focus-visible:ring-0 text-base py-4 px-0"
            autoFocus
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query && results.length === 0 && !isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Ingen resultater fundet</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                    selectedIndex === index
                      ? "bg-primary/10"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedIndex === index ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{result.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {getTypeLabel(result.type)}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">↓</kbd>
              Naviger
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd>
              Åbn
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd>
            Luk
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
