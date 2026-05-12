import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { useOrganization } from '../context/OrganizationContext';

/**
 * CreatePostPage - Create new post with optional image upload
 */
export default function CreatePostPage() {
    const navigate = useNavigate();
    const { currentOrg } = useOrganization();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'all',
        location: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const categories = [
        { value: 'all', label: '🏠 For You (General)' },
        { value: 'mtaani', label: '🔔 Mtaani Alerts' },
        { value: 'skills', label: '🤝 Skill Swaps' },
        { value: 'farm', label: '🌱 Farm Market' },
        { value: 'gigs', label: '💼 Gig Economy' }
    ];
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
                return;
            }
            
            setImageFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            let postData = { ...formData };
            
            // Add organization if selected
            if (currentOrg) {
                postData.organization = currentOrg._id;
            }
            
            // If there's an image, we'll need to handle it differently
            // For now, we'll send without image (backend needs multer setup)
            if (imageFile) {
                // TODO: Implement image upload with FormData
                // const formData = new FormData();
                // formData.append('image', imageFile);
                // formData.append('title', title);
                // etc.
                // Image upload feature pending backend multer configuration
            }
            
            await postsAPI.create(postData);
            
            // Navigate to organization page if posting to an org, otherwise to posts list
            if (currentOrg) {
                navigate(`/org/${currentOrg.slug}`);
            } else {
                navigate('/posts');
            }
        } catch (err) {
            setError(err.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="create-post-page">
            <div className="container">
                <h1>Create New Post</h1>
                
                {/* Organization Badge */}
                {currentOrg && (
                    <div className="org-badge-banner">
                        <span className="org-badge-icon">
                            {currentOrg.type === 'school' && '🏫'}
                            {currentOrg.type === 'university' && '🎓'}
                            {currentOrg.type === 'estate' && '🏘️'}
                            {currentOrg.type === 'church' && '⛪'}
                            {currentOrg.type === 'ngo' && '🤝'}
                            {currentOrg.type === 'sme' && '💼'}
                            {currentOrg.type === 'coworking' && '🏢'}
                            {currentOrg.type === 'community' && '👥'}
                            {currentOrg.type === 'youth_group' && '🌟'}
                            {currentOrg.type === 'professional' && '💼'}
                        </span>
                        <div className="org-badge-info">
                            <span className="org-badge-label">Posting to:</span>
                            <span className="org-badge-name">{currentOrg.name}</span>
                        </div>
                    </div>
                )}
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="create-post-form">
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="What's on your mind?"
                            maxLength="100"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="location">Location (Optional)</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Where is this happening?"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows="8"
                            placeholder="Share details with your community..."
                            maxLength="2000"
                        />
                        <small>{formData.content.length}/2000 characters</small>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="image">Upload Image (Optional)</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <small>Max size: 5MB. Formats: JPG, PNG, GIF</small>
                        
                        {imagePreview && (
                            <div className="image-preview">
                                <img src={imagePreview} alt="Preview" />
                                <button 
                                    type="button"
                                    className="btn-remove-image"
                                    onClick={() => {
                                        setImageFile(null);
                                        setImagePreview('');
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
