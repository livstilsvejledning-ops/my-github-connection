import { AlertTriangle, MessageCircle, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface AtRiskCustomer {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  reasons: string[];
  lastActivity: string;
}

interface AtRiskAlertProps {
  customers: AtRiskCustomer[];
  onSendMessage: (customerId: string) => void;
  onBookMeeting: (customerId: string) => void;
}

export function AtRiskAlert({ customers, onSendMessage, onBookMeeting }: AtRiskAlertProps) {
  if (customers.length === 0) return null;

  return (
    <div className="rounded-2xl overflow-hidden">
      {/* Alert Header */}
      <div className="gradient-primary p-4 flex items-center gap-3">
        <div className="p-2 rounded-full bg-white/20 animate-pulse">
          <AlertTriangle className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-white">
            {customers.length} kunde{customers.length !== 1 ? 'r' : ''} kræver opmærksomhed
          </h3>
          <p className="text-sm text-white/80">
            Baseret på aktivitet og engagement
          </p>
        </div>
      </div>

      {/* At-Risk Cards */}
      <div className="bg-card p-4 space-y-3">
        {customers.slice(0, 5).map((customer) => (
          <div
            key={customer.id}
            className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                {customer.avatarUrl ? (
                  <img
                    src={customer.avatarUrl}
                    alt={customer.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive border-2 border-card" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link 
                    to={`/customers/${customer.id}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {customer.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
                  {customer.lastActivity}
                </p>
              </div>

              {/* Reason Badges */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {customer.reasons.map((reason, index) => (
                  <Badge
                    key={index}
                    variant="destructive"
                    className="text-xs py-0.5 px-2"
                  >
                    {reason}
                  </Badge>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-primary/30 hover:bg-primary/10"
                  onClick={() => onSendMessage(customer.id)}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                  Send Besked
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs border-primary/30 hover:bg-primary/10"
                  onClick={() => onBookMeeting(customer.id)}
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Book Møde
                </Button>
              </div>
            </div>
          </div>
        ))}

        {customers.length > 5 && (
          <Link 
            to="/customers?filter=at-risk"
            className="block text-center text-sm text-primary hover:underline py-2"
          >
            Se alle {customers.length} kunder
          </Link>
        )}
      </div>
    </div>
  );
}
