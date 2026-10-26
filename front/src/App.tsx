import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import FloatingButtons from './components/common/FloatingButtons';
import PrivateRoute from './components/common/PrivateRoute';
import EntrepreneurLayout from './components/entrepreneur/layout/EntrepreneurLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import ExploreClubsPage from './pages/ExploreClubsPage';
import FAQPage from './pages/FAQPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';
import UserProfilePage from './pages/client/UserProfilePage';
import UserSubscriptionsPage from './pages/client/UserSubscriptionsPage';
import OrderHistoryPage from './pages/client/OrderHistoryPage';
import WishlistPage from './pages/client/WishlistPage';
import CartPage from './pages/client/CartPage';
import CheckoutPage from './pages/client/CheckoutPage';
import MisReviewsPage from './pages/client/MisReviewsPage';
import ClubDetailPage from './pages/entrepreneur/club/myClub/ClubDetailPage';
import HistoryPage from './pages/entrepreneur/club/myClub/HistoryPage';
import SubscriptionPlanDetailPage from './pages/SubscriptionPlanDetailPage';
import SubscriptionDetailForEntrepreneurPage from './pages/entrepreneur/club/myClub/SubscriptionDetailForEntrepreneurPage';
import TermsAndConditionsPage from './pages/entrepreneur/club/legal/TermsAndConditionsPage';
import PrivacyAndSecurityPolicyPage from './pages/entrepreneur/club/legal/PrivacyAndSecurityPolicyPage';
import EntrepreneurProfilePage from './pages/entrepreneur/EntrepreneurProfilePage';
import EntrepreneurDashboardPage from './pages/entrepreneur/EntrepreneurDashboardPage';
import MyClubPage from './pages/entrepreneur/club/myClub/MyClubPage';
import PlansAndBoxesPage from './pages/entrepreneur/club/myClub/PlansAndBoxesPage';
import CustomersPage from './pages/entrepreneur/operations/clients/CustomersPage';
import ShipmentsPage from './pages/entrepreneur/operations/logistics/ShipmentsPage';
import MarketingPage from './pages/entrepreneur/marketing_and_communication/MarketingPage';
import CommunityPage from './pages/entrepreneur/marketing_and_communication/CommunityPage';
import AnalyticsPage from './pages/entrepreneur/administration_tools/AnalyticsPage';
import FinancePage from './pages/entrepreneur/management_and_finance/FinancePage';
import InventoryPage from './pages/entrepreneur/management_and_finance/InventoryPage';
import SettingsPage from './pages/entrepreneur/administration_tools/SettingsPage';
import api from './api/config';
import { User, UserRole } from './types/user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = (payload.role?.toLowerCase() || 'customer') as UserRole;
        const baseUser: User = {
          id: payload.sub?.toString() || '',
          firstName: payload.firstName || '',
          lastName: payload.lastName || '',
          email: payload.email || '',
          role,
          registeredDate: payload.registeredDate || new Date().toISOString(),
          lastLogin: payload.lastLogin || new Date().toISOString(),
        };
        if (role === 'entrepreneur') {
          try {
            const response = await api.get('/entrepreneurs/me');
            const data = response.data?.data ?? response.data;
            baseUser.managedClubId = data.managedClubId ? String(data.managedClubId) : undefined;
          } catch {}
        }
        setUser(baseUser);
        setUserRole(role);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('access_token');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (loggedInUser: User) => {
    if (loggedInUser.role === 'entrepreneur' && !loggedInUser.managedClubId) {
      try {
        const response = await api.get('/entrepreneurs/me');
        const data = response.data?.data ?? response.data;
        loggedInUser.managedClubId = data.managedClubId ? String(data.managedClubId) : undefined;
      } catch {}
    }
    setUser(loggedInUser);
    setUserRole(loggedInUser.role);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, userRole, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const Logout: React.FC = () => {
  const { logout } = useAuth();
  useEffect(() => { logout(); }, [logout]);
  return <Navigate to="/" replace />;
};

const ShipmentsRedirect: React.FC<{ search: string }> = ({ search }) => {
  const { clubId } = useParams<{ clubId: string }>();
  return <Navigate to={`/entrepreneur/club/${clubId}/shipments${search}`} replace />;
};

const CustomersRedirect: React.FC<{ tab: 'subscriptions' | 'directory' }> = ({ tab }) => {
  const { clubId, customerId } = useParams<{ clubId: string; customerId?: string }>();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  params.set('tab', tab);
  if (customerId) params.set('customerId', customerId);
  return <Navigate to={`/entrepreneur/club/${clubId}/customers?${params.toString()}`} replace />;
};

const PlansRedirect: React.FC<{ tab: 'plans' | 'boxes' }> = ({ tab }) => {
  const { clubId, subscriptionTypeId } = useParams<{ clubId: string; subscriptionTypeId?: string }>();
  const params = new URLSearchParams({ tab });
  if (subscriptionTypeId) params.set('plan', subscriptionTypeId);
  return <Navigate to={`/entrepreneur/club/${clubId}/plans?${params.toString()}`} replace />;
};

const MyClubRedirect: React.FC<{ tab: 'profile' | 'history' | 'media' }> = ({ tab }) => {
  const { clubId } = useParams<{ clubId: string }>();
  return <Navigate to={`/entrepreneur/club/${clubId}/my-club?tab=${tab}`} replace />;
};

const ClubRedirect: React.FC<{ to: string; search: string }> = ({ to, search }) => {
  const { clubId } = useParams<{ clubId: string }>();
  return <Navigate to={`/entrepreneur/club/${clubId}/${to}${search}`} replace />;
};

const LegalSectionRedirect: React.FC = () => {
  const { clubId, section } = useParams<{ clubId: string; section: string }>();
  return <Navigate to={`/entrepreneur/club/${clubId}/settings?tab=legal&doc=${section ?? 'terms'}`} replace />;
};

const AUTH_PATHS = ['/login', '/register', '/logout'];

const AppContent: React.FC = () => {
  const { userRole, isAuthenticated, logout, login, loading } = useAuth();
  const { pathname } = useLocation();

  const pr = (roles: UserRole[], element: React.ReactNode) => (
    <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={roles} userRole={userRole} loading={loading}>
      {element}
    </PrivateRoute>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aurora-cream">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
      </div>
    );
  }

  const isPanel =
    isAuthenticated &&
    userRole === 'entrepreneur' &&
    !AUTH_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  const routes = (
    <Routes>
      <Route path="/" element={isPanel ? <Navigate to="/entrepreneur/dashboard" replace /> : <HomePage />} />
      <Route path="/explore" element={<ExploreClubsPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/login" element={<LoginPage onLogin={login} />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/complete-profile" element={<CompleteProfilePage />} />
      <Route path="/about-us" element={<AboutUsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/club/:clubId" element={<ClubDetailPage />} />
      <Route path="/club/:clubId/history" element={<HistoryPage />} />
      <Route path="/club/:clubId/terms-and-conditions" element={<TermsAndConditionsPage />} />
      <Route path="/club/:clubId/privacy-and-security" element={<PrivacyAndSecurityPolicyPage />} />
      <Route path="/club/:clubId/plan/:planId" element={<SubscriptionPlanDetailPage />} />
      <Route path="/entrepreneur/club/:clubId/settings" element={pr(['entrepreneur'], <SettingsPage />)} />
      <Route path="/entrepreneur/club/:clubId/general-settings" element={pr(['entrepreneur'], <ClubRedirect to="settings" search="?tab=general" />)} />
      <Route path="/entrepreneur/club/:clubId/edit-legal-info" element={pr(['entrepreneur'], <ClubRedirect to="settings" search="?tab=legal" />)} />
      <Route path="/entrepreneur/club/:clubId/edit-legal-info/:section" element={pr(['entrepreneur'], <LegalSectionRedirect />)} />
      <Route path="/entrepreneur/club/:clubId/legal-compliance" element={pr(['entrepreneur'], <ClubRedirect to="settings" search="?tab=compliance" />)} />
      <Route path="/entrepreneur/club/:clubId/manage-users-roles" element={pr(['entrepreneur'], <ClubRedirect to="settings" search="?tab=team" />)} />
      <Route path="/customer/profile" element={pr(['customer'], <UserProfilePage />)} />
      <Route path="/customer/subscriptions" element={pr(['customer'], <UserSubscriptionsPage />)} />
      <Route path="/customer/orders" element={pr(['customer'], <OrderHistoryPage />)} />
      <Route path="/customer/reviews" element={pr(['customer'], <MisReviewsPage />)} />
      <Route path="/customer/wishlist" element={pr(['customer'], <WishlistPage />)} />
      <Route path="/cart" element={pr(['customer'], <CartPage />)} />
      <Route path="/checkout" element={pr(['customer'], <CheckoutPage />)} />

      <Route path="/entrepreneur/dashboard" element={pr(['entrepreneur'], <EntrepreneurDashboardPage />)} />
      <Route path="/entrepreneur/profile" element={pr(['entrepreneur'], <EntrepreneurProfilePage />)} />
            <Route path="/entrepreneur/club/:clubId/gestionar-imagenes" element={pr(['entrepreneur'], <MyClubRedirect tab="media" />)} />
           <Route path="/entrepreneur/club/:clubId/inventory" element={pr(['entrepreneur'], <InventoryPage />)} />
      <Route path="/entrepreneur/club/:clubId/inventory/stock" element={pr(['entrepreneur'], <ClubRedirect to="inventory" search="?tab=stock" />)} />
      <Route path="/entrepreneur/club/:clubId/inventory/proveedores" element={pr(['entrepreneur'], <ClubRedirect to="inventory" search="?tab=suppliers" />)} />
      <Route path="/entrepreneur/club/:clubId/inventory/pedidos" element={pr(['entrepreneur'], <ClubRedirect to="inventory" search="?tab=orders" />)} />
      <Route path="/entrepreneur/club/:clubId/inventory/categorias" element={pr(['entrepreneur'], <ClubRedirect to="inventory" search="?tab=categories" />)} />
      <Route path="/entrepreneur/club/:clubId/finance" element={pr(['entrepreneur'], <FinancePage />)} />
      <Route path="/entrepreneur/club/:clubId/finance/movimientos" element={pr(['entrepreneur'], <ClubRedirect to="finance" search="?tab=movements" />)} />
      <Route path="/entrepreneur/club/:clubId/finance/rentabilidad" element={pr(['entrepreneur'], <ClubRedirect to="finance" search="?tab=profitability" />)} />
      <Route path="/entrepreneur/club/:clubId/analytics" element={pr(['entrepreneur'], <AnalyticsPage />)} />
      <Route path="/entrepreneur/club/:clubId/stats" element={pr(['entrepreneur'], <ClubRedirect to="analytics" search="?group=stats" />)} />
      <Route path="/entrepreneur/club/:clubId/sales-reports" element={pr(['entrepreneur'], <ClubRedirect to="analytics" search="?group=sales" />)} />
      <Route path="/entrepreneur/club/:clubId/feedback-trends" element={pr(['entrepreneur'], <ClubRedirect to="analytics" search="?group=feedback" />)} />
      <Route path="/entrepreneur/club/:clubId/customers" element={pr(['entrepreneur'], <CustomersPage />)} />
      <Route path="/entrepreneur/club/:clubId/active-subscriptions" element={pr(['entrepreneur'], <CustomersRedirect tab="subscriptions" />)} />
      <Route path="/entrepreneur/club/:clubId/manage-customers" element={pr(['entrepreneur'], <CustomersRedirect tab="directory" />)} />
      <Route path="/entrepreneur/club/:clubId/customer-history" element={pr(['entrepreneur'], <CustomersRedirect tab="directory" />)} />
      <Route path="/entrepreneur/club/:clubId/customer-history/:customerId" element={pr(['entrepreneur'], <CustomersRedirect tab="directory" />)} />
      <Route path="/entrepreneur/club/:clubId/subscription/:subscriptionId" element={pr(['entrepreneur'], <SubscriptionDetailForEntrepreneurPage />)} />
            <Route path="/entrepreneur/club/:clubId/shipments" element={pr(['entrepreneur'], <ShipmentsPage />)} />
      <Route path="/entrepreneur/club/:clubId/assign-deliveries" element={pr(['entrepreneur'], <ShipmentsRedirect search="?tab=assign" />)} />
      <Route path="/entrepreneur/club/:clubId/view-deliveries" element={pr(['entrepreneur'], <ShipmentsRedirect search="?tab=list&view=recent" />)} />
      <Route path="/entrepreneur/club/:clubId/delivery-history" element={pr(['entrepreneur'], <ShipmentsRedirect search="?tab=list&view=history" />)} />
      <Route path="/entrepreneur/club/:clubId/manage-riders" element={pr(['entrepreneur'], <ShipmentsRedirect search="?riders=1" />)} />
            <Route path="/entrepreneur/club/:clubId/marketing" element={pr(['entrepreneur'], <MarketingPage />)} />
      <Route path="/entrepreneur/club/:clubId/community" element={pr(['entrepreneur'], <CommunityPage />)} />
      <Route path="/entrepreneur/club/:clubId/administrar-promociones" element={pr(['entrepreneur'], <ClubRedirect to="marketing" search="?group=promotions" />)} />
      <Route path="/entrepreneur/club/:clubId/enviar-newsletters" element={pr(['entrepreneur'], <ClubRedirect to="marketing" search="?group=newsletters" />)} />
      <Route path="/entrepreneur/club/:clubId/moderate-reviews" element={pr(['entrepreneur'], <ClubRedirect to="community" search="?group=reviews" />)} />
      <Route path="/entrepreneur/club/:clubId/customer-support" element={pr(['entrepreneur'], <ClubRedirect to="community" search="?group=support" />)} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );

  const skipLink = (
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-aurora-terracotta focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
      Saltar al contenido
    </a>
  );

  if (isPanel) {
    return (
      <>
        {skipLink}
        <EntrepreneurLayout onLogout={logout}>{routes}</EntrepreneurLayout>
      </>
    );
  }

  return (
    <>
      {skipLink}
      <Navbar userRole={userRole} isAuthenticated={isAuthenticated} onLogout={logout} />
      <main id="main-content" className="min-h-[calc(100vh-100px)]">
        {routes}
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
};

const App: React.FC = () => (
  <Router>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1B2A4A',
          color: '#FDF8F0',
          fontWeight: 500,
          borderRadius: '12px',
          padding: '12px 16px',
        },
        success: { iconTheme: { primary: '#C9762E', secondary: '#FDF8F0' } },
        error: { iconTheme: { primary: '#DC2626', secondary: '#FDF8F0' } },
      }}
    />
  </Router>
);

export default App;