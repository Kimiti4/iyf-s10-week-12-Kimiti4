import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import SearchBar from './components/SearchBar'
import HomePage from './pages/HomePage'
import PostListPage from './pages/PostListPage'
import PostDetailPage from './pages/PostDetailPage'
import AboutPage from './pages/AboutPage'
// Original pages (backup for debugging)
import OriginalLoginPage from './pages/LoginPage'
import OriginalRegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import CreatePostPage from './pages/CreatePostPage'
import SearchResultsPage from './pages/SearchResultsPage'
// Enhanced Social Media Pages (now the main pages)
import EnhancedLoginPage from './enhanced/pages/EnhancedLoginPage'
import EnhancedRegisterPage from './enhanced/pages/EnhancedRegisterPage'
import EnhancedFeedPage from './enhanced/pages/EnhancedFeedPage'
import ReelsPage from './enhanced/pages/ReelsPage'
import AdminDashboard from './enhanced/pages/AdminDashboard'
import './App.css'

function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">JamiiLink</Link>
        <SearchBar />
        <div className="nav-links">
          <Link to="/">Feed</Link>
          <Link to="/original/posts">Posts</Link>
          <Link to="/original/about">About</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/admin" className="btn-admin">Admin</Link>
              <Link to="/original/posts/create" className="btn-create">+ Create Post</Link>
              <Link to={`/original/profile/${user._id}`} className="nav-user">
                {user.name}
              </Link>
              <button onClick={logout} className="btn-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavBar />
          <main className="main-content">
            <Routes>
              {/* Main Routes - Now Using Enhanced Pages */}
              <Route path="/" element={<EnhancedFeedPage />} />
              <Route path="/login" element={<EnhancedLoginPage />} />
              <Route path="/register" element={<EnhancedRegisterPage />} />
              <Route path="/reels" element={<ReelsPage />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
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
          </main>
          <footer className="footer">
            <div className="container">
              <p>&copy; 2026 JamiiLink powered by <a href='https://github.com/Kimiti4'>Kimiti4</a></p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
