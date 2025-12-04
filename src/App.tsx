import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Projects from "./pages/Projects";
import Events from "./pages/Events";
import About from "./pages/About";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductsManager from "./pages/admin/ProductsManager";
import ProjectsManager from "./pages/admin/ProjectsManager";
import EventsManager from "./pages/admin/EventsManager";
import ContentManager from "./pages/admin/ContentManager";
import MessagesManager from "./pages/admin/MessagesManager";
import OrdersManager from "./pages/admin/OrdersManager";
import SettingsManager from "./pages/admin/SettingsManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/events" element={<Events />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsManager />} />
              <Route path="projects" element={<ProjectsManager />} />
              <Route path="events" element={<EventsManager />} />
              <Route path="content" element={<ContentManager />} />
              <Route path="messages" element={<MessagesManager />} />
              <Route path="orders" element={<OrdersManager />} />
              <Route path="settings" element={<SettingsManager />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
