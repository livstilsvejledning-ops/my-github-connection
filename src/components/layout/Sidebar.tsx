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

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col gradient-sidebar transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <span className="text-xl font-bold text-sidebar-foreground">
            KostCRM
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Menu */}
      <div className="border-t border-sidebar-border px-3 py-4">
        {bottomMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
        
        <button
          onClick={signOut}
          className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-sidebar-foreground/80 transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Log ud</span>}
        </button>
      </div>
    </aside>
  );
}
