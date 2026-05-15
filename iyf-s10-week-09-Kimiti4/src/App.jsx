import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { OrganizationProvider } from './context/OrganizationContext'
import { SidebarProvider, useSidebar } from './context/SidebarContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import FeedbackForm from './components/FeedbackForm'
import './App.css'
import './styles/DesignSystem.css'
import './styles/InstagramUI.css'
import './styles/PageBackgrounds.css'
import Sidebar from './components/Sidebar'
import NavBar from './components/NavBar'
import MobileBottomNav from './components/MobileBottomNav'
import HomePage from './pages/HomePage'
import PostListPage from './pages/PostListPage'
import PostDetailPage from './pages/PostDetailPage'
import AboutPage from './pages/AboutPage'
import OriginalLoginPage from './pages/LoginPage'
import OriginalRegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import CreatePostPage from './pages/CreatePostPage'
import SearchResultsPage from './pages/SearchResultsPage'
import EnhancedLoginPage from './enhanced/pages/EnhancedLoginPage'
import EnhancedRegisterPage from './enhanced/pages/EnhancedRegisterPage'
import EnhancedFeedPage from './enhanced/pages/EnhancedFeedPage'
import ReelsPage from './enhanced/pages/ReelsPage'
import AdminDashboard from './enhanced/pages/AdminDashboard'
import FounderDashboard from './pages/FounderDashboard'
import OrganizationPage from './pages/OrganizationPage'
import SettingsPage from './pages/SettingsPage'
import MarketplacePage from './pages/MarketplacePage'
import UserProfilePage from './pages/UserProfilePage'
import ChatPage from './pages/ChatPage'
import ActivityHistory from './pages/ActivityHistory'
import CreatorDashboard from './pages/CreatorDashboard'
import ReputationSystem from './pages/ReputationSystem'
import CommunityGovernance from './pages/CommunityGovernance'
import CollaborativeQuests from './pages/CollaborativeQuests'
import TiannaraAssistant from './components/TiannaraAssistant'
import CommunityEvents from './components/CommunityEvents'
import EnhancedEmergencyAlerts from './components/EnhancedEmergencyAlerts'
import AlertFeedPage from './pages/AlertFeedPage'

function AppRoutes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Listen for auth events
  useEffect(() => {
    const handleAuthExpired = () => navigate('/login');
    const handleLogout = () => navigate('/login');
    
    window.addEventListener('auth:expired', handleAuthExpired);
    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [navigate]);
  
  return (
    <Routes>
      {/* Main Routes - Now Using Enhanced Pages */}
      <Route path="/" element={<EnhancedFeedPage />} />
      <Route path="/login" element={<EnhancedLoginPage />} />
      <Route path="/register" element={<EnhancedRegisterPage />} />
      <Route path="/reels" element={<ReelsPage />} />
      <Route path="/org/:slug" element={<OrganizationPage />} />
      
      {/* New Unique Feature Routes */}
      <Route path="/tiannara" element={<TiannaraAssistant currentUser={user} />} />
      <Route path="/events" element={<CommunityEvents currentUser={user} />} />
      <Route path="/alerts" element={<AlertFeedPage />} />
      <Route path="/emergency-alerts" element={<EnhancedEmergencyAlerts currentUser={user} />} />
      
      {/* User Profile Route */}
      <Route path="/profile/:userId?" element={<UserProfilePage />} />
      
      {/* Chat Route */}
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Activity History Route */}
      <Route 
        path="/activity" 
        element={
          <ProtectedRoute>
            <ActivityHistory />
          </ProtectedRoute>
        } 
      />
      
      {/* Creator Dashboard Route */}
      <Route 
        path="/creator" 
        element={
          <ProtectedRoute>
            <CreatorDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Reputation System Route */}
      <Route 
        path="/reputation" 
        element={
          <ProtectedRoute>
            <ReputationSystem />
          </ProtectedRoute>
        } 
      />
      
      {/* Community Governance Route */}
      <Route 
        path="/governance" 
        element={
          <ProtectedRoute>
            <CommunityGovernance />
          </ProtectedRoute>
        } 
      />
      
      {/* Collaborative Quests Route */}
      <Route 
        path="/quests" 
        element={
          <ProtectedRoute>
            <CollaborativeQuests />
          </ProtectedRoute>
        } 
      />
      
      {/* Marketplace Route */}
      <Route 
        path="/marketplace" 
        element={
          <ProtectedRoute>
            <MarketplacePage />
          </ProtectedRoute>
        } 
      />
      
      {/* Settings Route */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/founder" 
        element={
          <ProtectedRoute>
            <FounderDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Original Pages (Backup for Debugging) */}
      <Route path="/original/home" element={<HomePage />} />
      <Route path="/original/login" element={<OriginalLoginPage />} />
      <Route path="/original/register" element={<OriginalRegisterPage />} />
      <Route path="/original/posts" element={<PostListPage />} />
      <Route path="/original/posts/:id" element={<PostDetailPage />} />
      <Route path="/original/search" element={<SearchResultsPage />} />
      <Route path="/original/profile/:id?" element={<ProfilePage />} />
      <Route 
        path="/original/posts/create" 
        element={
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/original/about" element={<AboutPage />} />
    </Routes>
  );
}

function MainLayout() {
  const { isCollapsed } = useSidebar();
  
  return (
    <main className={`main-content with-sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <AppRoutes />
    </main>
  );
}

function App() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  
  return (
    <Router>
      <AuthProvider>
        <OrganizationProvider>
          <SidebarProvider>
            <ToastProvider>
            <div className="App">
              <Sidebar />
              <NavBar />
              <MainLayout />
              <MobileBottomNav />
              <footer className="footer">
                <div className="container">
                  <p>&copy; 2026 JamiiLink powered by <a href='https://github.com/Kimiti4'>Kimiti4</a></p>
                </div>
              </footer>
              
              {/* Floating Feedback Button */}
              <button 
                className="floating-feedback-btn"
                onClick={() => setFeedbackOpen(true)}
                title="Share Feedback"
              >
                💬
              </button>
              
              {/* Feedback Form Modal */}
              <FeedbackForm 
                isOpen={feedbackOpen} 
                onClose={() => setFeedbackOpen(false)} 
              />
            </div>
            </ToastProvider>
          </SidebarProvider>
        </OrganizationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
