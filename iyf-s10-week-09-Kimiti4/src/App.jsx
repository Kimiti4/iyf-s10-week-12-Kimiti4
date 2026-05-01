import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import SearchBar from './components/SearchBar'
import HomePage from './pages/HomePage'
import PostListPage from './pages/PostListPage'
import PostDetailPage from './pages/PostDetailPage'
import AboutPage from './pages/AboutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import CreatePostPage from './pages/CreatePostPage'
import SearchResultsPage from './pages/SearchResultsPage'
// Enhanced Social Media Pages
import EnhancedLoginPage from './enhanced/pages/EnhancedLoginPage'
import EnhancedRegisterPage from './enhanced/pages/EnhancedRegisterPage'
import EnhancedFeedPage from './enhanced/pages/EnhancedFeedPage'
import './App.css'

function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">JamiiLink</Link>
        <SearchBar />
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/posts">Posts</Link>
          <Link to="/about">About</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/posts/create" className="btn-create">+ Create Post</Link>
              <Link to={`/profile/${user._id}`} className="nav-user">
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
              {/* Original Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/posts" element={<PostListPage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/profile/:id?" element={<ProfilePage />} />
              <Route 
                path="/posts/create" 
                element={
                  <ProtectedRoute>
                    <CreatePostPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Enhanced Social Media Routes */}
              <Route path="/enhanced/login" element={<EnhancedLoginPage />} />
              <Route path="/enhanced/register" element={<EnhancedRegisterPage />} />
              <Route path="/enhanced/feed" element={<EnhancedFeedPage />} />
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
