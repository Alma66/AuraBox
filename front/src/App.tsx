// SECCION DE IMPORTS

// React y hooks
import React, { useState, useEffect, createContext, useContext } from 'react';

// React Router
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Componentes comunes
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import FloatingButtons from './components/common/FloatingButtons';
import PrivateRoute from './components/common/PrivateRoute';

// Páginas públicas y generales
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExploreClubsPage from './pages/ExploreClubsPage';
import FAQPage from './pages/FAQPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';

// Páginas para cliente
import UserProfilePage from './pages/client/UserProfilePage';
import WishlistPage from './pages/client/WishlistPage';
import CartPage from './pages/client/CartPage';
import CheckoutPage from './pages/client/CheckoutPage';
import MisReviewsPage from './pages/client/MisReviewsPage';

// Páginas para emprendedor - club
import ClubDetailPage from './pages/entrepreneur/club/ClubDetailPage';
import HistoryPage from './pages/entrepreneur/club/HistoryPage';
import SubscriptionPlanDetailPage from './pages/entrepreneur/club/SubscriptionPlanDetailPage';
import SubscriptionDetailForEntrepreneurPage from './pages/entrepreneur/club/SubscriptionDetailForEntrepreneurPage';
import TermsAndConditionsPage from './pages/entrepreneur/club/TermsAndConditionsPage';
import PrivacyAndSecurityPolicyPage from './pages/entrepreneur/club/PrivacyAndSecurityPolicyPage';

// Páginas para emprendedor - perfil y gestión
import EntrepreneurProfilePage from './pages/entrepreneur/EntrepreneurProfilePage';
import EditClubLegalInfoPage from './pages/entrepreneur/gestion/EditClubLegalInfoPage';
import EditSubscriptionsPage from './pages/entrepreneur/gestion/EditSubscriptionsPage';
import InventoryManagementPage from './pages/entrepreneur/gestion/InventoryManagementPage';

// Páginas para emprendedor - operaciones clientes
import ActiveSubscriptionsPage from './pages/entrepreneur/operations/clients/ActiveSubscriptionsPage';
import CustomerHistoryPage from './pages/entrepreneur/operations/clients/CustomerHistoryPage';
import ManageCustomersPage from './pages/entrepreneur/operations/clients/ManageCustomersPage';

// Páginas para emprendedor - operaciones logística
import AssignDeliveriesPage from './pages/entrepreneur/operations/logistics/AssignDeliveriesPage';
import ViewDeliveriesPage from './pages/entrepreneur/operations/logistics/ViewDeliveriesPage';
import DeliveryHistoryPage from './pages/entrepreneur/operations/logistics/DeliveryHistoryPage';
import ManageRidersPage from './pages/entrepreneur/operations/logistics/ManageRidersPage';

// Páginas para emprendedor - marketing y comunicación
import ModerateReviewsPage from './pages/entrepreneur/marketing_and_communication/community/ModerateReviewsPage';
import CustomerSupportPage from './pages/entrepreneur/marketing_and_communication/community/CustomerSupportPage';
import ManageClubImagesPage from './pages/entrepreneur/marketing_and_communication/marketing/ManageClubImagesPage';
import ManagePromotionsPage from './pages/entrepreneur/marketing_and_communication/marketing/ManagePromotionsPage';
import SendNewsletterPage from './pages/entrepreneur/marketing_and_communication/marketing/SendNewsletterPage';

// Páginas para emprendedor - herramientas de administración
import ClubStatsPage from './pages/entrepreneur/administration_tools/analysis_and_reports/ClubStatsPage';
import SalesReportsPage from './pages/entrepreneur/administration_tools/analysis_and_reports/SalesReportsPage';
import FeedbackTrendsPage from './pages/entrepreneur/administration_tools/analysis_and_reports/FeedbackTrendsPage';
import FinancialMovementsPage from './pages/entrepreneur/administration_tools/analysis_and_reports/finance_and_team/FinancialMovementsPage';
import ManageUsersAndRolesPage from './pages/entrepreneur/administration_tools/analysis_and_reports/finance_and_team/ManageUsersAndRolesPage';
import GeneralSettingsPage from './pages/entrepreneur/administration_tools/analysis_and_reports/finance_and_team/GeneralSettingsPage';

// Tipos y datos
import { User, UserRole } from './types/user';
import usersData from './data/user.json';

// Interfaz de la Autenticación
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (user: User) => void;
  logout: () => void;
}

// Creación del AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Proveedor de autenticación principal
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser  ] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser   = localStorage.getItem('loggedInUser  ');
    if (storedUser ) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        if (['customer', 'entrepreneur', 'admin'].includes(parsedUser.role)) {
          const fullUser = (usersData as User[]).find(u => u.id === parsedUser.id);
          if (fullUser ) {
            setUser  (fullUser  );
            setUserRole(fullUser  .role as UserRole);
            setIsAuthenticated(true);
          } else {
            console.warn("Stored user ID not found in usersData. Clearing session.");
            localStorage.removeItem('loggedInUser  ');
          }
        } else {
          console.warn("Invalid user role stored. Clearing session.");
          localStorage.removeItem('loggedInUser  ');
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem('loggedInUser  ');
      }
    }
    setLoading(false);
  }, []);

  // Función para manejar login
  const login = (loggedInUser: User) => {
    setUser(loggedInUser);
    setUserRole(loggedInUser.role);
    setIsAuthenticated(true);
    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
  };

  // Función para manejar logout
  const logout = () => {
    setUser  (null);
    setUserRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem('loggedInUser  ');
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  const value = { user, isAuthenticated, userRole, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Componente para manejar logout
const Logout: React.FC = () => {
  const { logout } = useAuth();
  useEffect(() => {
    logout();
  }, [logout]);
  return <Navigate to="/" replace />;
};

// Contenido principal de la app con navbar y rutas
const AppContent: React.FC = () => {
  const { userRole, isAuthenticated, logout } = useAuth();

  return (
    <>
      <Navbar userRole={userRole} isAuthenticated={isAuthenticated} onLogout={logout} />
      <main className="min-h-[calc(100vh-100px)]">
        {/* Rutas */}
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExploreClubsPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/login" element={<LoginPage onLogin={useAuth().login} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Logout */}
          <Route path="/logout" element={<Logout />} />

          {/* Visualización de políticas para clientes y visitantes */}
          <Route path="/club/:clubId/terms-and-conditions" element={<TermsAndConditionsPage />} />
          <Route path="/club/:clubId/privacy-and-security" element={<PrivacyAndSecurityPolicyPage />} />

          {/* Protegidas para cliente */}
          <Route
            path="/customer/profile"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['customer']} userRole={userRole}>
                <UserProfilePage />
              </PrivateRoute>
            }
          />
          
          {/* Mis Reseñas */}
          <Route
            path="/customer/reviews"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['customer']} userRole={userRole}>
                <MisReviewsPage />
              </PrivateRoute>
            }
          />
          {/* Wishlist, Carrito y Checkout */}
          <Route
            path="/customer/wishlist"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['customer']} userRole={userRole}>
                <WishlistPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['customer']} userRole={userRole}>
                <CartPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['customer']} userRole={userRole}>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/club/:clubId"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['customer', 'entrepreneur', 'admin']} userRole={userRole}>
                <ClubDetailPage userRole={userRole} />
              </PrivateRoute>
            }
          />
          <Route
            path="/club/:clubId/history"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['customer', 'entrepreneur']} userRole={userRole}>
                <HistoryPage />
              </PrivateRoute>
            }
          />
          {/* Perfil del emprendedor */}
          <Route
            path="/entrepreneur/profile"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <EntrepreneurProfilePage />
              </PrivateRoute>
            }
          />

          {/* Edición de políticas para emprendedores */}
          <Route
            path="/entrepreneur/club/:clubId/edit-terms"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <EditClubLegalInfoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/edit-policies"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <EditClubLegalInfoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/edit-subscriptions"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <EditSubscriptionsPage />
              </PrivateRoute>
            }
          />
          {/* Finanzas y equipo */}
          <Route
            path="/entrepreneur/club/:clubId/financial-management"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <FinancialMovementsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/manage-users-roles"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <ManageUsersAndRolesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/general-settings"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <GeneralSettingsPage />
              </PrivateRoute>
            }
          />
          {/* Gestión de inventario */}
          <Route
            path="/entrepreneur/inventory-management"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <InventoryManagementPage />
              </PrivateRoute>
            }
          />

          {/* Gestión de clientes */}
          <Route
            path="/entrepreneur/club/:clubId/active-subscriptions"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <ActiveSubscriptionsPage />
              </PrivateRoute>
            }
          />

          {/* Análisis y reportes */}
          <Route
            path="/entrepreneur/club/:clubId/stats"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <ClubStatsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/sales-reports"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <SalesReportsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/feedback-trends"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <FeedbackTrendsPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/entrepreneur/club/:clubId/subscription/:subscriptionId"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <SubscriptionDetailForEntrepreneurPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/customer-history"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <CustomerHistoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/manage-customers"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <ManageCustomersPage />
              </PrivateRoute>
            }
          />
          {/* Logística */}
          <Route
            path="/entrepreneur/club/:clubId/assign-deliveries"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <AssignDeliveriesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/view-deliveries"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <ViewDeliveriesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/delivery-history"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <DeliveryHistoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/manage-riders"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <ManageRidersPage />
              </PrivateRoute>
            }
          />

          {/* Para administrador */}
          <Route
            path="/club/:clubId/plan/:planId"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['customer', 'entrepreneur', 'admin']} userRole={userRole}>
                <SubscriptionPlanDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/gestionar-imagenes"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <ManageClubImagesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/administrar-promociones"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <ManagePromotionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/enviar-newsletters"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <SendNewsletterPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/moderate-reviews"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']} userRole={userRole}>
                <ModerateReviewsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/entrepreneur/club/:clubId/customer-support"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['entrepreneur']}
                          userRole={userRole}>
              <CustomerSupportPage />
            </PrivateRoute>
          }
        />
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <Footer />
    <FloatingButtons />
  </>
);
};

// Componente principal de la aplicación
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;