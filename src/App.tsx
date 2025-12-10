import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Projects from "./pages/Projects";
import AquaRiverPurifier from "./pages/AquaRiverPurifier";
import Events from "./pages/Events";
import About from "./pages/About";
import Auth from "./pages/Auth";
import AuthorityLogin from "./pages/AuthorityLogin";
import CardLogin from "./pages/CardLogin";
import NotFound from "./pages/NotFound";
import SupportUs from "./pages/SupportUs";
import PublicCustomers from "./pages/customers/PublicCustomers";
import PrivateCompanies from "./pages/customers/PrivateCompanies";
import GovernmentCustomers from "./pages/customers/GovernmentCustomers";
import Mission from "./pages/values/Mission";
import Vision from "./pages/values/Vision";
import CoreValue from "./pages/values/CoreValue";
import TeamMember from "./pages/team/TeamMember";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductsManager from "./pages/admin/ProductsManager";
import ProjectsManager from "./pages/admin/ProjectsManager";
import EventsManager from "./pages/admin/EventsManager";
import ContentManager from "./pages/admin/ContentManager";
import MessagesManager from "./pages/admin/MessagesManager";
import OrdersManager from "./pages/admin/OrdersManager";
import SettingsManager from "./pages/admin/SettingsManager";
import ProductsShipped from "./pages/stats/ProductsShipped";
import CustomerSatisfaction from "./pages/stats/CustomerSatisfaction";
import ActiveProjects from "./pages/stats/ActiveProjects";
import CountriesImpacted from "./pages/stats/CountriesImpacted";
import AIMLPage from "./pages/features/AIMLPage";
import RoboticsPage from "./pages/features/RoboticsPage";
import CleanTechPage from "./pages/features/CleanTechPage";
import GlobalDeliveryPage from "./pages/features/GlobalDeliveryPage";
import CEODashboard from "./pages/dashboards/CEODashboard";
import DeveloperDashboard from "./pages/dashboards/DeveloperDashboard";
import CorePillarDashboard from "./pages/dashboards/CorePillarDashboard";
import VisualEditor from "./pages/admin/VisualEditor";

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
            <Route path="/projects/aqua-river-purifier" element={<AquaRiverPurifier />} />
            <Route path="/events" element={<Events />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/authority-login" element={<AuthorityLogin />} />
            <Route path="/card-login" element={<CardLogin />} />
            <Route path="/support-us" element={<SupportUs />} />
            <Route path="/customers/public" element={<PublicCustomers />} />
            <Route path="/customers/private" element={<PrivateCompanies />} />
            <Route path="/customers/government" element={<GovernmentCustomers />} />
            <Route path="/values/mission" element={<Mission />} />
            <Route path="/values/vision" element={<Vision />} />
            <Route path="/values/:valueId" element={<CoreValue />} />
            <Route path="/team/:memberId" element={<TeamMember />} />
            
            {/* Stats Pages */}
            <Route path="/stats/products-shipped" element={<ProductsShipped />} />
            <Route path="/stats/customer-satisfaction" element={<CustomerSatisfaction />} />
            <Route path="/stats/active-projects" element={<ActiveProjects />} />
            <Route path="/stats/countries-impacted" element={<CountriesImpacted />} />
            
            {/* Feature Pages */}
            <Route path="/features/ai-ml" element={<AIMLPage />} />
            <Route path="/features/robotics" element={<RoboticsPage />} />
            <Route path="/features/clean-tech" element={<CleanTechPage />} />
            <Route path="/features/global-delivery" element={<GlobalDeliveryPage />} />
            
            {/* Role-Based Dashboards */}
            <Route path="/dashboard/ceo" element={<CEODashboard />} />
            <Route path="/dashboard/developer" element={<DeveloperDashboard />} />
            <Route path="/dashboard/core-pillar" element={<CorePillarDashboard />} />
            <Route path="/admin/visual-editor" element={<VisualEditor />} />
            
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