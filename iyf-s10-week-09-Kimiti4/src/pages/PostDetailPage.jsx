import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function PostDetailPage() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Mock data - in Week 12 this will fetch from API
    const mockPost = {
      id: parseInt(id),
      title: 'Fresh Tomatoes Available',
      content: 'I have fresh organic tomatoes from my farm in Kiambu. Available in bulk quantities at affordable prices. The tomatoes are freshly harvested and ready for market. I can deliver to Nairobi CBD area for orders above 50kg.',
      category: 'farm',
      likes: 12,
      author: 'John Kamau',
      location: 'Kiambu',
      createdAt: new Date().toLocaleDateString()
    }
    
    setTimeout(() => {
      setPost(mockPost)
      setLoading(false)
    }, 500)
  }, [id])
  
  if (loading) return <div className="loading">Loading post...</div>
  if (!post) return <div className="error">Post not found</div>
  
  return (
    <div className="post-detail-page">
      <Link to="/posts" className="back-link">← Back to Posts</Link>
      
      <article className="post-detail">
        <header className="post-header">
          <span className="category">{post.category}</span>
          <h1>{post.title}</h1>
          <div className="post-info">
            <span>By {post.author}</span>
            <span>•</span>
            <span>{post.location}</span>
            <span>•</span>
            <span>{post.createdAt}</span>
          </div>
        </header>
        
        <div className="post-content">
          <p>{post.content}</p>
        </div>
        
        <div className="post-actions">
          <button className="btn btn-primary">❤️ Like ({post.likes})</button>
          <button className="btn btn-secondary">💬 Comment</button>
        </div>
      </article>
    </div>
  )
}
