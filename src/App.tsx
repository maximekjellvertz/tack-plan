import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Horses from "./pages/Horses";
import HorseDetails from "./pages/HorseDetails";
import Competitions from "./pages/Competitions";
import HealthLog from "./pages/HealthLog";
import Reminders from "./pages/Reminders";
import Goals from "./pages/Goals";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Navigation from "./components/Navigation";
import Calendar from "./pages/Calendar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<><Navigation /><Dashboard /></>} />
          <Route path="/horses" element={<><Navigation /><Horses /></>} />
          <Route path="/horses/:id" element={<><Navigation /><HorseDetails /></>} />
          <Route path="/calendar" element={<><Navigation /><Calendar /></>} />
          <Route path="/competitions" element={<><Navigation /><Competitions /></>} />
          <Route path="/health-log" element={<><Navigation /><HealthLog /></>} />
          <Route path="/reminders" element={<><Navigation /><Reminders /></>} />
          <Route path="/goals" element={<><Navigation /><Goals /></>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
