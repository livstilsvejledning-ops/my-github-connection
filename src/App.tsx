import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Bookings from "./pages/Bookings";
import MealPlans from "./pages/MealPlans";
import CheckIns from "./pages/CheckIns";
import Habits from "./pages/Habits";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
// Client pages
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientHabits from "./pages/client/ClientHabits";
import ClientFoodLog from "./pages/client/ClientFoodLog";
import ClientMealPlan from "./pages/client/ClientMealPlan";
import ClientProgress from "./pages/client/ClientProgress";
import ClientMessages from "./pages/client/ClientMessages";
import ClientSettings from "./pages/client/ClientSettings";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {/* Admin routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/customers/:customerId" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/meal-plans" element={<ProtectedRoute><MealPlans /></ProtectedRoute>} />
      <Route path="/check-ins" element={<ProtectedRoute><CheckIns /></ProtectedRoute>} />
      <Route path="/habits" element={<ProtectedRoute><Habits /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      {/* Client routes */}
      <Route path="/client" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
      <Route path="/client/habits" element={<ProtectedRoute><ClientHabits /></ProtectedRoute>} />
      <Route path="/client/food-log" element={<ProtectedRoute><ClientFoodLog /></ProtectedRoute>} />
      <Route path="/client/meal-plan" element={<ProtectedRoute><ClientMealPlan /></ProtectedRoute>} />
      <Route path="/client/progress" element={<ProtectedRoute><ClientProgress /></ProtectedRoute>} />
      <Route path="/client/messages" element={<ProtectedRoute><ClientMessages /></ProtectedRoute>} />
      <Route path="/client/settings" element={<ProtectedRoute><ClientSettings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
