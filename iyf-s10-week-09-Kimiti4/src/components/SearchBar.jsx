import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * SearchBar - Search posts by title, content, or category
 */
export default function SearchBar({ onSearch }) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    
    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            // Navigate to search results page with query parameter
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            if (onSearch) {
                onSearch(query.trim());
            }
        }
    };
    
    return (
        <form className="search-bar" onSubmit={handleSearch}>
            <input
                type="text"
                placeholder="Search posts..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search posts"
            />
            <button type="submit" className="btn-search">
                🔍
            </button>
        </form>
    );
}
