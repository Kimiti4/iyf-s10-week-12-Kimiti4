import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { postsAPI } from '../services/api';

/**
 * SearchResultsPage - Display search results
 */
export default function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (query) {
            performSearch(query);
        }
    }, [query]);
    
    const performSearch = async (searchQuery) => {
        try {
            setLoading(true);
            setError('');
            
            // Search posts by title or content
            const data = await postsAPI.search(searchQuery);
            setResults(data.posts || []);
        } catch (err) {
            setError(err.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    };
    
    if (!query) {
        return (
            <div className="search-page">
                <div className="container">
                    <h1>Search Posts</h1>
                    <p>Enter a search term to find posts</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="search-results-page">
            <div className="container">
                <h1>Search Results for "{query}"</h1>
                
                {loading && <div className="loading">Searching...</div>}
                
                {error && <div className="error">{error}</div>}
                
                {!loading && !error && (
                    <>
                        <p className="results-count">
                            Found {results.length} result{results.length !== 1 ? 's' : ''}
                        </p>
                        
                        {results.length === 0 ? (
                            <div className="no-results">
                                <p>No posts found matching your search.</p>
                                <p>Try different keywords or browse all posts.</p>
                                <Link to="/posts" className="btn btn-primary">
                                    Browse All Posts
                                </Link>
                            </div>
                        ) : (
                            <div className="results-grid">
                                {results.map(post => (
                                    <Link 
                                        key={post._id} 
                                        to={`/posts/${post._id}`}
                                        className="result-card"
                                    >
                                        <div className="result-header">
                                            <h3>{highlightText(post.title, query)}</h3>
                                            <span className="result-category">
                                                {post.category}
                                            </span>
                                        </div>
                                        
                                        <p className="result-preview">
                                            {highlightText(
                                                post.content.substring(0, 150) + '...',
                                                query
                                            )}
                                        </p>
                                        
                                        <div className="result-meta">
                                            <span className="author">
                                                By {post.author?.name || 'Unknown'}
                                            </span>
                                            <span className="date">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                            {post.verified && (
                                                <span className="verified-badge">✓ Verified</span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

/**
 * Highlight matching text in search results
 */
function highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
        regex.test(part) ? (
            <mark key={index}>{part}</mark>
        ) : (
            part
        )
    );
}
