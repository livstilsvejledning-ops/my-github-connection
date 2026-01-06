import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Mail, Calendar, Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerCardProps {
  customer: {
    id: string;
    status: string;
    subscription_type: string | null;
    tags: string[] | null;
    profile: {
      full_name: string;
      email: string;
      phone: string | null;
      profile_image_url: string | null;
    } | null;
  };
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onSendMessage: (id: string) => void;
  onBookMeeting: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { 
    label: 'Aktiv', 
    className: 'bg-success/20 text-success border-success/30' 
  },
  inactive: { 
    label: 'Inaktiv', 
    className: 'bg-muted text-muted-foreground border-border' 
  },
  on_hold: { 
    label: 'På pause', 
    className: 'bg-accent/30 text-accent-foreground border-accent/50' 
  },
  completed: { 
    label: 'Afsluttet', 
    className: 'bg-secondary/20 text-secondary-foreground border-secondary/30' 
  },
};

export function CustomerCard({ 
  customer, 
  onView, 
  onEdit, 
  onSendMessage, 
  onBookMeeting, 
  onDelete 
}: CustomerCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const status = statusConfig[customer.status] || statusConfig.inactive;

  return (
    <Card className="group relative overflow-hidden rounded-2xl border-border bg-card shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1 hover:scale-[1.02]">
      {/* Orange top border */}
      <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
      
      <CardContent className="p-5 pt-6">
        {/* Quick Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-3 right-3 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem onClick={() => onEdit(customer.id)} className="rounded-lg cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Rediger
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSendMessage(customer.id)} className="rounded-lg cursor-pointer">
              <Mail className="mr-2 h-4 w-4" />
              Send Besked
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBookMeeting(customer.id)} className="rounded-lg cursor-pointer">
              <Calendar className="mr-2 h-4 w-4" />
              Book Møde
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete(customer.id)} 
              className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Slet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile Section */}
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-16 w-16 ring-4 ring-primary/20">
            <AvatarImage src={customer.profile?.profile_image_url || ''} />
            <AvatarFallback className="gradient-primary text-primary-foreground text-lg font-semibold">
              {getInitials(customer.profile?.full_name || 'U')}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="mt-3 text-lg font-semibold text-foreground line-clamp-1">
            {customer.profile?.full_name || 'Ukendt'}
          </h3>
          
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
            {customer.profile?.email || '-'}
          </p>

          {/* Status Badge */}
          <Badge className={cn("mt-3 border", status.className)}>
            {status.label}
          </Badge>

          {/* Tags */}
          {customer.tags && customer.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {customer.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
              {customer.tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                  +{customer.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Subscription Type */}
          {customer.subscription_type && (
            <p className="mt-2 text-xs text-muted-foreground">
              {customer.subscription_type}
            </p>
          )}
        </div>

        {/* View Details Button */}
        <Button 
          variant="outline" 
          className="mt-4 w-full rounded-xl border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
          onClick={() => onView(customer.id)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Vis Detaljer
        </Button>
      </CardContent>
    </Card>
  );
}
