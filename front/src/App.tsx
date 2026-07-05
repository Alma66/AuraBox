import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import FloatingButtons from './components/common/FloatingButtons';
import PrivateRoute from './components/common/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import CompleteClubPage from './pages/CompleteClubPage';
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
import ClubDetailPage from './pages/entrepreneur/club/ClubDetailPage';
import HistoryPage from './pages/entrepreneur/club/HistoryPage';
import SubscriptionPlanDetailPage from './pages/SubscriptionPlanDetailPage';
import SubscriptionDetailForEntrepreneurPage from './pages/entrepreneur/club/SubscriptionDetailForEntrepreneurPage';
import TermsAndConditionsPage from './pages/entrepreneur/club/TermsAndConditionsPage';
import PrivacyAndSecurityPolicyPage from './pages/entrepreneur/club/PrivacyAndSecurityPolicyPage';
import EntrepreneurProfilePage from './pages/entrepreneur/EntrepreneurProfilePage';
import EditSubscriptionsPage from './pages/entrepreneur/club/EditSubscriptionsPage';
import ActiveSubscriptionsPage from './pages/entrepreneur/operations/clients/ActiveSubscriptionsPage';
import CustomerHistoryPage from './pages/entrepreneur/operations/clients/CustomerHistoryPage';
import ManageCustomersPage from './pages/entrepreneur/operations/clients/ManageCustomersPage';
import AssignDeliveriesPage from './pages/entrepreneur/operations/logistics/AssignDeliveriesPage';
import ViewDeliveriesPage from './pages/entrepreneur/operations/logistics/ViewDeliveriesPage';
import DeliveryHistoryPage from './pages/entrepreneur/operations/logistics/DeliveryHistoryPage';
import ManageRidersPage from './pages/entrepreneur/operations/logistics/ManageRidersPage';
import ModerateReviewsPage from './pages/entrepreneur/marketing_and_communication/community/ModerateReviewsPage';
import CustomerSupportPage from './pages/entrepreneur/marketing_and_communication/community/CustomerSupportPage';
import ManageClubImagesPage from './pages/entrepreneur/marketing_and_communication/marketing/ManageClubImagesPage';
import ManagePromotionsPage from './pages/entrepreneur/marketing_and_communication/marketing/ManagePromotionsPage';
import SendNewsletterPage from './pages/entrepreneur/marketing_and_communication/marketing/SendNewsletterPage';
import ClubStatsPage from './pages/entrepreneur/administration_tools/analysis_and_reports/ClubStatsPage';
import SalesReportsPage from './pages/entrepreneur/administration_tools/analysis_and_reports/SalesReportsPage';
import FeedbackTrendsPage from './pages/entrepreneur/administration_tools/analysis_and_reports/FeedbackTrendsPage';
import FinancialMovementsPage from './pages/entrepreneur/administration_tools/analysis_and_reports/finance_and_team/FinancialMovementsPage';
import ProfitabilityPage from './pages/entrepreneur/administration_tools/analysis_and_reports/finance_and_team/ProfitabilityPage';
import ManageUsersAndRolesPage from './pages/entrepreneur/administration_tools/analysis_and_reports/finance_and_team/ManageUsersAndRolesPage';
import GeneralSettingsPage from './pages/entrepreneur/administration_tools/analysis_and_reports/finance_and_team/GeneralSettingsPage';
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

const AppContent: React.FC = () => {
  const { userRole, isAuthenticated, logout, login, loading } = useAuth();

  const pr = (roles: UserRole[], element: React.ReactNode) => (
    <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={roles} userRole={userRole} loading={loading}>
      {element}
    </PrivateRoute>
  );

  return (
    <>
      <Navbar userRole={userRole} isAuthenticated={isAuthenticated} onLogout={logout} />
      <main className="min-h-[calc(100vh-100px)]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExploreClubsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/login" element={<LoginPage onLogin={login} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/complete-profile" element={<CompleteProfilePage />} />
          <Route path="/register/complete-club" element={<CompleteClubPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/club/:clubId" element={<ClubDetailPage />} />
          <Route path="/club/:clubId/history" element={<HistoryPage />} />
          <Route path="/club/:clubId/terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="/club/:clubId/privacy-and-security" element={<PrivacyAndSecurityPolicyPage />} />
          <Route path="/club/:clubId/plan/:planId" element={<SubscriptionPlanDetailPage />} />

          <Route path="/customer/profile" element={pr(['customer'], <UserProfilePage />)} />
          <Route path="/customer/subscriptions" element={pr(['customer'], <UserSubscriptionsPage />)} />
          <Route path="/customer/orders" element={pr(['customer'], <OrderHistoryPage />)} />
          <Route path="/customer/reviews" element={pr(['customer'], <MisReviewsPage />)} />
          <Route path="/customer/wishlist" element={pr(['customer'], <WishlistPage />)} />
          <Route path="/cart" element={pr(['customer'], <CartPage />)} />
          <Route path="/checkout" element={pr(['customer'], <CheckoutPage />)} />

          <Route path="/entrepreneur/profile" element={pr(['entrepreneur'], <EntrepreneurProfilePage />)} />
          <Route path="/entrepreneur/club/:clubId/edit-subscriptions" element={pr(['entrepreneur'], <EditSubscriptionsPage />)} />
          <Route path="/entrepreneur/club/:clubId/finance/movimientos" element={pr(['entrepreneur'], <FinancialMovementsPage />)} />
          <Route path="/entrepreneur/club/:clubId/finance/rentabilidad" element={pr(['entrepreneur'], <ProfitabilityPage />)} />
          <Route path="/entrepreneur/club/:clubId/manage-users-roles" element={pr(['entrepreneur'], <ManageUsersAndRolesPage />)} />
          <Route path="/entrepreneur/club/:clubId/general-settings" element={pr(['entrepreneur'], <GeneralSettingsPage />)} />
          <Route path="/entrepreneur/club/:clubId/active-subscriptions" element={pr(['entrepreneur'], <ActiveSubscriptionsPage />)} />
          <Route path="/entrepreneur/club/:clubId/customer-history" element={pr(['entrepreneur'], <CustomerHistoryPage />)} />
          <Route path="/entrepreneur/club/:clubId/customer-history/:customerId" element={pr(['entrepreneur'], <CustomerHistoryPage />)} />
          <Route path="/entrepreneur/club/:clubId/manage-customers" element={pr(['entrepreneur'], <ManageCustomersPage />)} />
          <Route path="/entrepreneur/club/:clubId/stats" element={pr(['entrepreneur'], <ClubStatsPage />)} />
          <Route path="/entrepreneur/club/:clubId/sales-reports" element={pr(['entrepreneur'], <SalesReportsPage />)} />
          <Route path="/entrepreneur/club/:clubId/feedback-trends" element={pr(['entrepreneur'], <FeedbackTrendsPage />)} />
          <Route path="/entrepreneur/club/:clubId/subscription/:subscriptionId" element={pr(['entrepreneur'], <SubscriptionDetailForEntrepreneurPage />)} />
          <Route path="/entrepreneur/club/:clubId/assign-deliveries" element={pr(['entrepreneur'], <AssignDeliveriesPage />)} />
          <Route path="/entrepreneur/club/:clubId/view-deliveries" element={pr(['entrepreneur'], <ViewDeliveriesPage />)} />
          <Route path="/entrepreneur/club/:clubId/delivery-history" element={pr(['entrepreneur'], <DeliveryHistoryPage />)} />
          <Route path="/entrepreneur/club/:clubId/manage-riders" element={pr(['entrepreneur'], <ManageRidersPage />)} />
          <Route path="/entrepreneur/club/:clubId/gestionar-imagenes" element={pr(['entrepreneur'], <ManageClubImagesPage />)} />
          <Route path="/entrepreneur/club/:clubId/administrar-promociones" element={pr(['entrepreneur'], <ManagePromotionsPage />)} />
          <Route path="/entrepreneur/club/:clubId/enviar-newsletters" element={pr(['entrepreneur'], <SendNewsletterPage />)} />
          <Route path="/entrepreneur/club/:clubId/moderate-reviews" element={pr(['entrepreneur'], <ModerateReviewsPage />)} />
          <Route path="/entrepreneur/club/:clubId/customer-support" element={pr(['entrepreneur'], <CustomerSupportPage />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
  </Router>
);

export default App;