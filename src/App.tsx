import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { LiveChatProvider } from "@/hooks/useLiveChat";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import TrackOrder from "./pages/TrackOrder";
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
import ProductsManager from "./pages/admin/ProductsManager";
import ProjectsManager from "./pages/admin/ProjectsManager";
import EventsManager from "./pages/admin/EventsManager";
import ContentManager from "./pages/admin/ContentManager";
import MessagesManager from "./pages/admin/MessagesManager";
import ChatManager from "./pages/admin/ChatManager";
import OrdersManager from "./pages/admin/OrdersManager";
import SettingsManager from "./pages/admin/SettingsManager";
import UsersManager from "./pages/admin/UsersManager";
import SubscribersManager from "./pages/admin/SubscribersManager";
import ApplicationsManager from "./pages/admin/ApplicationsManager";
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
import ProductionDashboard from "./pages/dashboards/ProductionDashboard";
import SalesDashboard from "./pages/dashboards/SalesDashboard";
import ManagerDashboard from "./pages/dashboards/ManagerDashboard";
import EmployeeDashboard from "./pages/dashboards/EmployeeDashboard";
import VisualEditor from "./pages/admin/VisualEditor";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import TeamDirectory from "./pages/TeamDirectory";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <LiveChatProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/aqua-river-purifier" element={<AquaRiverPurifier />} />
            <Route path="/events" element={<Events />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
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
            <Route path="/team-directory" element={<TeamDirectory />} />
            
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
            <Route path="/dashboard/production" element={<ProductionDashboard />} />
            <Route path="/dashboard/sales" element={<SalesDashboard />} />
            <Route path="/dashboard/manager" element={<ManagerDashboard />} />
            <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
            <Route path="/admin/visual-editor" element={<VisualEditor />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/products" replace />} />
              <Route path="users" element={<UsersManager />} />
              <Route path="products" element={<ProductsManager />} />
              <Route path="projects" element={<ProjectsManager />} />
              <Route path="events" element={<EventsManager />} />
              <Route path="content" element={<ContentManager />} />
              <Route path="messages" element={<MessagesManager />} />
              <Route path="chats" element={<ChatManager />} />
              <Route path="orders" element={<OrdersManager />} />
              <Route path="subscribers" element={<SubscribersManager />} />
              <Route path="applications" element={<ApplicationsManager />} />
              <Route path="settings" element={<SettingsManager />} />
            </Route>
            
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LiveChatProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;