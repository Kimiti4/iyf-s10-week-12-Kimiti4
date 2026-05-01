import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';

/**
 * CreatePostPage - Create new post with optional image upload
 */
export default function CreatePostPage() {
    const navigate = useNavigate();
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
            
            // If there's an image, we'll need to handle it differently
            // For now, we'll send without image (backend needs multer setup)
            if (imageFile) {
                // TODO: Implement image upload with FormData
                // const formData = new FormData();
                // formData.append('image', imageFile);
                // formData.append('title', title);
                // etc.
                console.log('Image upload requires backend multer setup');
            }
            
            await postsAPI.create(postData);
            navigate('/posts');
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
