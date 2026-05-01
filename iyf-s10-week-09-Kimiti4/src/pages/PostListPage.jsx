import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function PostListPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    fetchPosts()
  }, [])
  
  const fetchPosts = async () => {
    try {
      setLoading(true)
      // Using mock data for Week 9 (before API integration in Week 12)
      const mockPosts = [
        {
          id: 1,
          title: 'Fresh Tomatoes Available',
          content: 'I have fresh organic tomatoes from my farm in Kiambu. Available in bulk quantities at affordable prices.',
          category: 'farm',
          likes: 12,
          author: 'John Kamau'
        },
        {
          id: 2,
          title: 'Looking for Web Developer',
          content: 'Need a web developer to build a small business website. Can offer carpentry skills in exchange.',
          category: 'skill',
          likes: 8,
          author: 'Mary Wanjiku'
        },
        {
          id: 3,
          title: 'Water Interruption Alert',
          content: 'Expected water interruption in Kibera Zone 2 tomorrow from 8am to 4pm for maintenance.',
          category: 'mtaani',
          likes: 25,
          author: 'Community Admin'
        },
        {
          id: 4,
          title: 'Part-time Teaching Gig',
          content: 'Looking for mathematics tutor for high school students. Weekend classes, good pay.',
          category: 'gig',
          likes: 15,
          author: 'Jane Akinyi'
        }
      ]
      
      setPosts(mockPosts)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) return <div className="loading">Loading posts...</div>
  if (error) return <div className="error">Error: {error}</div>
  
  return (
    <div className="post-list-page">
      <div className="page-header">
        <h2>Community Posts</h2>
      </div>
      
      <div className="posts-grid">
        {posts.map(post => (
          <Link to={`/posts/${post.id}`} key={post.id} className="post-card">
            <h3>{post.title}</h3>
            <p>{post.content.substring(0, 150)}...</p>
            <div className="post-meta">
              <span className="category">{post.category}</span>
              <span className="author">by {post.author}</span>
              <span className="likes">❤️ {post.likes}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
