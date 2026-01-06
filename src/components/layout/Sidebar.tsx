import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  UtensilsCrossed, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  ClipboardCheck,
  Droplets
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Klienter', path: '/customers' },
  { icon: Calendar, label: 'Bookinger', path: '/bookings' },
  { icon: UtensilsCrossed, label: 'Kostplaner', path: '/meal-plans' },
  { icon: ClipboardCheck, label: 'Check-ins', path: '/check-ins' },
  { icon: Droplets, label: 'Vaner', path: '/habits' },
  { icon: MessageSquare, label: 'Beskeder', path: '/messages' },
  { icon: BarChart3, label: 'Statistik', path: '/analytics' },
];

const bottomMenuItems = [
  { icon: Settings, label: 'Indstillinger', path: '/settings' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  const NavItem = ({ item, isActive }: { item: typeof menuItems[0]; isActive: boolean }) => {
    const content = (
      <Link
        to={item.path}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-white/20 text-white shadow-sm backdrop-blur-sm"
            : "text-white/80 hover:bg-white/10 hover:text-white"
        )}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
      style={{
        background: 'linear-gradient(180deg, #FF6B35 0%, #C9753D 100%)'
      }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">KostCRM</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <UtensilsCrossed className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full justify-center text-white/80 hover:bg-white/10 hover:text-white",
            !collapsed && "justify-end"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavItem 
            key={item.path} 
            item={item} 
            isActive={location.pathname === item.path} 
          />
        ))}
      </nav>

      {/* Bottom Menu */}
      <div className="border-t border-white/10 px-3 py-4 space-y-1">
        {bottomMenuItems.map((item) => (
          <NavItem 
            key={item.path} 
            item={item} 
            isActive={location.pathname === item.path} 
          />
        ))}
        
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
              >
                <LogOut className="h-5 w-5 shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Log ud
            </TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Log ud</span>
          </button>
        )}
      </div>
    </aside>
  );
}
