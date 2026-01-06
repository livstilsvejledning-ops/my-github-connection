import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Utensils, CheckSquare, TrendingUp, MessageCircle, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface ClientLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: 'Hjem', path: '/client' },
  { icon: Calendar, label: 'Måltidsplan', path: '/client/meal-plan' },
  { icon: Utensils, label: 'Madlog', path: '/client/food-log' },
  { icon: CheckSquare, label: 'Vaner', path: '/client/habits' },
  { icon: TrendingUp, label: 'Fremskridt', path: '/client/progress' },
  { icon: MessageCircle, label: 'Beskeder', path: '/client/messages' },
];

export function ClientLayout({ children }: ClientLayoutProps) {
  const location = useLocation();
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 lg:pl-64">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col gradient-primary">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-white">Min Sundhed</h1>
          <p className="text-sm text-white/70 mt-1">{user?.email}</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  isActive
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/20">
          <Link
            to="/client/settings"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2",
              location.pathname === '/client/settings'
                ? "bg-white/20 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Indstillinger</span>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Log ud</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main 
        className="min-h-screen p-4 lg:p-6"
        style={{ backgroundColor: '#FFF8F0' }}
      >
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg">
        <div className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
