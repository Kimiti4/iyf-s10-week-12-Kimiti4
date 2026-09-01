import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback, lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { OrganizationProvider } from './context/OrganizationContext'
import { SidebarProvider, useSidebar } from './context/SidebarContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import FeedbackForm from './components/FeedbackForm'
import TrendingChip from './components/TrendingChip'
import JamiiModeToggle from './components/JamiiModeToggle'
import PullToRefreshIndicator from './components/PullToRefresh'
import ConstellationBackground from './enhanced/components/ConstellationBackground'
import { usePullToRefresh } from './hooks/usePullToRefresh'
import { useSwipeGestures } from './hooks/useSwipeGestures'
import './index.css' // Unified whimsical design system
import Sidebar from './components/Sidebar'
import NavBar from './components/NavBar'
import MobileBottomNav from './components/MobileBottomNav'
const EnhancedLoginPage = lazy(() => import('./enhanced/pages/EnhancedLoginPage'))
const EnhancedRegisterPage = lazy(() => import('./enhanced/pages/EnhancedRegisterPage'))
const ReelsPage = lazy(() => import('./enhanced/pages/ReelsPage'))
const MtaaniPage = lazy(() => import('./enhanced/pages/MtaaniPage'))
const SkillsPage = lazy(() => import('./enhanced/pages/SkillsPage'))
const FarmPage = lazy(() => import('./enhanced/pages/FarmPage'))
const GigsPage = lazy(() => import('./enhanced/pages/GigsPage'))
const AdminDashboard = lazy(() => import('./enhanced/pages/AdminDashboard'))
const FounderDashboard = lazy(() => import('./pages/FounderDashboard'))
const OrganizationPage = lazy(() => import('./pages/OrganizationPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const ActivityHistory = lazy(() => import('./pages/ActivityHistory'))
const ReputationSystem = lazy(() => import('./pages/ReputationSystem'))
const CommunityGovernance = lazy(() => import('./pages/CommunityGovernance'))
const CollaborativeQuests = lazy(() => import('./pages/CollaborativeQuests'))
const TiannaraAssistant = lazy(() => import('./components/TiannaraAssistant'))
const CommunityEvents = lazy(() => import('./components/CommunityEvents'))
const EnhancedEmergencyAlerts = lazy(() => import('./components/EnhancedEmergencyAlerts'))
const AlertFeedPage = lazy(() => import('./pages/AlertFeedPage'))
const DraftsPage = lazy(() => import('./pages/DraftsPage'))
const JamCreationPage = lazy(() => import('./pages/JamCreationPage'))
const JamFeedPage = lazy(() => import('./pages/JamFeedPage'))
const JamDetailPage = lazy(() => import('./pages/JamDetailPage'))
const PostPage = lazy(() => import('./pages/PostPage'))
const FollowingPage = lazy(() => import('./pages/FollowingPage'))
const ReelDetailPage = lazy(() => import('./pages/ReelDetailPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const CreatorStudioPage = lazy(() => import('./pages/CreatorStudioPage'))
const DiscoveryPage = lazy(() => import('./pages/DiscoveryPage'))
const UnifiedFeed = lazy(() => import('./components/feed/UnifiedFeed'))

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
      <Route 
        path="/" 
        element={
          <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
            <UnifiedFeed />
          </Suspense>
        } 
      />
      <Route path="/login" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <EnhancedLoginPage />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <EnhancedRegisterPage />
        </Suspense>
      } />
      <Route path="/reels" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <ReelsPage />
        </Suspense>
      } />
      <Route path="/notifications" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <NotificationsPage />
        </Suspense>
      } />
      <Route path="/creator/studio" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <CreatorStudioPage />
        </Suspense>
      } />
      <Route path="/discover" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <DiscoveryPage />
        </Suspense>
      } />
      <Route path="/mtaani" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <MtaaniPage />
        </Suspense>
      } />
      <Route path="/skills" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <SkillsPage />
        </Suspense>
      } />
      <Route path="/farm" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <FarmPage />
        </Suspense>
      } />
      <Route path="/gigs" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <GigsPage />
        </Suspense>
      } />
      <Route path="/org/:slug" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <OrganizationPage />
        </Suspense>
      } />
      
      {/* New Unique Feature Routes */}
      <Route path="/tiannara" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <TiannaraAssistant currentUser={user} />
        </Suspense>
      } />
      <Route path="/events" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <CommunityEvents currentUser={user} />
        </Suspense>
      } />
      <Route path="/alerts" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <AlertFeedPage />
        </Suspense>
      } />
      <Route path="/emergency-alerts" element={
        <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
          <EnhancedEmergencyAlerts currentUser={user} />
        </Suspense>
      } />
      
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

      {/* Offline Drafts */}
      <Route 
        path="/drafts" 
        element={
          <ProtectedRoute>
            <DraftsPage />
          </ProtectedRoute>
        } 
      />

      {/* Jam Creation Route */}
      <Route 
        path="/create/jam" 
        element={
          <ProtectedRoute>
            <JamCreationPage />
          </ProtectedRoute>
        } 
      />

      {/* Jam Feed Route */}
      <Route 
        path="/jams" 
        element={
          <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
            <JamFeedPage />
          </Suspense>
        } 
      />

      {/* Jam Detail Route */}
      <Route 
        path="/jams/:id" 
        element={
          <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
            <JamDetailPage />
          </Suspense>
        } 
      />

      {/* Post Detail Route */}
      <Route 
        path="/posts/:id" 
        element={
          <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
            <PostPage />
          </Suspense>
        } 
      />

      {/* Following Feed Route */}
      <Route 
        path="/following" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
              <FollowingPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />

      {/* Reel Detail Route */}
      <Route 
        path="/reels/:id" 
        element={
          <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
            <ReelDetailPage />
          </Suspense>
        } 
      />
      
      {/* Activity History Route */}
      <Route 
        path="/activity" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
              <ActivityHistory />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* Reputation System Route */}
      <Route 
        path="/reputation" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
              <ReputationSystem />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* Community Governance Route */}
      <Route 
        path="/governance" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
              <CommunityGovernance />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* Collaborative Quests Route */}
      <Route 
        path="/quests" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
              <CollaborativeQuests />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* Marketplace Route */}
      <Route 
        path="/marketplace" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
              <MarketplacePage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      {/* Settings Route */}
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
              <SettingsPage />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/founder" 
        element={
          <ProtectedRoute>
            <Suspense fallback={<div className="page-loading"><div className="loading-spinner" /></div>}>
              <FounderDashboard />
            </Suspense>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function MainLayout() {
  const { isCollapsed } = useSidebar();
  
  return (
    <main className={`app-main main-content with-sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="app-content">
        <Suspense fallback={<div className="route-loading" aria-label="Loading page">Loading&hellip;</div>}>
          <AppRoutes />
        </Suspense>
      </div>
    </main>
  );
}

function App() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Close sidebar when clicking overlay
  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);
  
  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    // Trigger a page reload or data refetch
    window.location.reload();
  }, []);
  
  const { isRefreshing, progress } = usePullToRefresh(handleRefresh, 100);
  
  // Swipe gestures for sidebar
  useSwipeGestures(openSidebar, closeSidebar, 100);
  
  return (
    <Router>
      <AuthProvider>
        <OrganizationProvider>
          <SidebarProvider>
            <ToastProvider>
            <div className="App app-shell">
              {/* 🔹 Constellation Background */}
              <ConstellationBackground />
              
              {/* Pull to Refresh Indicator */}
              <PullToRefreshIndicator isRefreshing={isRefreshing} progress={progress} />
              
              {/* Sidebar Overlay Backdrop */}
              <div 
                className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
                onClick={closeSidebar}
              />
              
              <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
              <NavBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
              <MainLayout />
              <MobileBottomNav />
              
              {/* 🌙 Jamii Mode Toggle - Add to sidebar or as floating widget */}
              <div className="jamii-mode-widget">
                <JamiiModeToggle />
              </div>
              
              {/* 🔥 Trending Floating Chip */}
              <TrendingChip topic="#JamiiLink" count={42} />
              
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
