# 🚀 Quick Start - Next Steps

## Today's Accomplishments ✅

1. **Fixed CRITICAL BUG**: Posts controller now uses MongoDB (not in-memory)
2. **Fixed README**: Removed merge conflict markers
3. **Cleaned Code**: Removed production console.log statements
4. **Upgraded Auth**: JWT verification on all protected routes
5. **Committed**: All changes pushed to Git

---

## Immediate Next Steps (Next 48 Hours)

### Step 1: Test Locally (15 minutes)

```bash
# Terminal 1 - Backend
cd iyf-s10-week-11-Kimiti4
npm start

# Terminal 2 - Frontend  
cd iyf-s10-week-09-Kimiti4
npm run dev
```

**Test These Endpoints:**

```bash
# 1. Health check
curl https://iyf-s10-week-12-kimiti4.up.railway.app/api/health

# 2. Get posts (should return empty array or existing posts)
curl https://iyf-s10-week-12-kimiti4.up.railway.app/api/posts

# 3. Register a user (if not already done)
curl -X POST https://iyf-s10-week-12-kimiti4.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# 4. Login to get JWT token
curl -X POST https://iyf-s10-week-12-kimiti4.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 5. Create a post (replace TOKEN with actual JWT)
curl -X POST https://iyf-s10-week-12-kimiti4.up.railway.app/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Test Post","content":"This is a test","category":"mtaani"}'
```

**Expected Results:**
- ✅ Posts persist after server restart
- ✅ JWT required for POST/PUT/DELETE
- ✅ Author field automatically set from authenticated user
- ✅ No console.log in browser console

---

### Step 2: Deploy to Railway (5 minutes)

```bash
git push origin main
```

Railway will auto-deploy. Monitor at:
- Dashboard: https://railway.app/project/[your-project]
- Logs: Check for any startup errors

**Verify Deployment:**
```bash
# Should return updated backend
curl https://iyf-s10-week-12-kimiti4.up.railway.app/api/health
```

---

### Step 3: Start Week 2 - Organization Context (3-5 days)

#### Day 1: Create Organization Context

Create file: `iyf-s10-week-09-Kimiti4/src/context/OrganizationContext.jsx`

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const OrganizationContext = createContext();

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider = ({ children }) => {
  const [currentOrg, setCurrentOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load organization from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('currentOrganization');
    if (saved) {
      setCurrentOrg(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  // Save to localStorage when changed
  const selectOrganization = (org) => {
    setCurrentOrg(org);
    localStorage.setItem('currentOrganization', JSON.stringify(org));
  };

  const clearOrganization = () => {
    setCurrentOrg(null);
    localStorage.removeItem('currentOrganization');
  };

  return (
    <OrganizationContext.Provider value={{ 
      currentOrg, 
      selectOrganization, 
      clearOrganization,
      loading 
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};
```

Update `App.jsx`:
```jsx
import { OrganizationProvider } from './context/OrganizationContext';

function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>  {/* Add this */}
        <Router>
          {/* ... rest of app */}
        </Router>
      </OrganizationProvider>
    </AuthProvider>
  );
}
```

---

#### Day 2: Add Organization Selector to Navbar

Create component: `iyf-s10-week-09-Kimiti4/src/components/OrganizationSelector.jsx`

```jsx
import { useOrganization } from '../context/OrganizationContext';
import { useAuth } from '../context/AuthContext';
import { organizationsAPI } from '../services/api';
import { useState, useEffect } from 'react';

const OrganizationSelector = () => {
  const { currentOrg, selectOrganization } = useOrganization();
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrganizations();
    }
  }, [user]);

  const fetchOrganizations = async () => {
    try {
      const response = await organizationsAPI.getMyOrganizations();
      setOrganizations(response.data);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    }
  };

  const handleSelect = (org) => {
    selectOrganization(org);
    setShowDropdown(false);
    // Navigate to org page
    window.location.href = `/org/${org.slug}`;
  };

  if (!user || organizations.length === 0) return null;

  return (
    <div className="org-selector">
      <button onClick={() => setShowDropdown(!showDropdown)}>
        {currentOrg ? currentOrg.name : 'Select Organization'} ▼
      </button>
      
      {showDropdown && (
        <div className="org-dropdown">
          {organizations.map(org => (
            <button key={org._id} onClick={() => handleSelect(org)}>
              {org.name} ({org.type})
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizationSelector;
```

Add to `NavBar.jsx`:
```jsx
import OrganizationSelector from './OrganizationSelector';

// In navbar JSX:
<nav>
  {/* ... existing nav items */}
  <OrganizationSelector />
</nav>
```

---

#### Day 3: Implement `/org/[slug]` Route

Create page: `iyf-s10-week-09-Kimiti4/src/pages/OrganizationPage.jsx`

```jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { organizationsAPI, postsAPI } from '../services/api';
import PostCard from '../components/PostCard';

const OrganizationPage = () => {
  const { slug } = useParams();
  const [organization, setOrganization] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizationData();
  }, [slug]);

  const fetchOrganizationData = async () => {
    try {
      setLoading(true);
      
      // Fetch organization details
      const orgResponse = await organizationsAPI.getBySlug(slug);
      setOrganization(orgResponse.data);
      
      // Fetch posts scoped to this organization
      const postsResponse = await postsAPI.getAll({ organization: orgResponse.data._id });
      setPosts(postsResponse.data);
      
    } catch (err) {
      console.error('Failed to fetch organization data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!organization) return <div>Organization not found</div>;

  return (
    <div className="organization-page">
      <header className="org-header">
        <h1>{organization.name}</h1>
        <p>{organization.description}</p>
        <span className="org-type">{organization.type}</span>
        <span className="member-count">{organization.stats?.memberCount} members</span>
      </header>

      <section className="org-posts">
        <h2>Community Feed</h2>
        {posts.length === 0 ? (
          <p>No posts yet. Be the first to post!</p>
        ) : (
          posts.map(post => <PostCard key={post._id} post={post} />)
        )}
      </section>
    </div>
  );
};

export default OrganizationPage;
```

Add route to `App.jsx`:
```jsx
import OrganizationPage from './pages/OrganizationPage';

<Routes>
  {/* Existing routes */}
  <Route path="/org/:slug" element={<OrganizationPage />} />
</Routes>
```

---

#### Day 4-5: Scope Posts to Organization

Update `CreatePostPage.jsx`:
```jsx
import { useOrganization } from '../context/OrganizationContext';

const CreatePostPage = () => {
  const { currentOrg } = useOrganization();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postData = {
      title,
      content,
      category,
      // Add organization if selected
      ...(currentOrg && { organization: currentOrg._id }),
      location,
      tags,
      metadata
    };
    
    await postsAPI.create(postData);
    // ... rest of submit logic
  };
  
  // Show organization badge in form
  return (
    <form onSubmit={handleSubmit}>
      {currentOrg && (
        <div className="org-badge">
          Posting to: {currentOrg.name}
        </div>
      )}
      {/* ... rest of form */}
    </form>
  );
};
```

Update `FeedPage.jsx` to filter by organization:
```jsx
import { useOrganization } from '../context/OrganizationContext';

const FeedPage = () => {
  const { currentOrg } = useOrganization();
  
  useEffect(() => {
    fetchPosts();
  }, [currentOrg]); // Re-fetch when org changes
  
  const fetchPosts = async () => {
    const params = {};
    
    // If organization selected, scope to it
    if (currentOrg) {
      params.organization = currentOrg._id;
    }
    
    const response = await postsAPI.getAll(params);
    setPosts(response.data);
  };
  
  return (
    <div>
      {currentOrg ? (
        <h2>{currentOrg.name} Feed</h2>
      ) : (
        <h2>All Communities</h2>
      )}
      {/* ... rest of feed */}
    </div>
  );
};
```

---

## Testing Checklist

After implementing Week 2 features:

- [ ] User can see their organizations in dropdown
- [ ] Selecting an organization navigates to `/org/[slug]`
- [ ] Organization page shows correct name, type, member count
- [ ] Posts are filtered by selected organization
- [ ] Creating a post includes organization field
- [ ] Switching organizations updates feed immediately
- [ ] Organization selection persists after page refresh
- [ ] Unauthenticated users see "All Communities" feed

---

## Resources

### API Endpoints (Backend)
- `GET /api/organizations/my` - Get user's organizations
- `GET /api/organizations/slug/:slug` - Get org by slug
- `GET /api/posts?organization=ORG_ID` - Filter posts by org
- `POST /api/posts` - Create post (include organization field)

### Documentation
- **PROJECT_ANALYSIS_AND_PLAN.md** - Full project audit
- **BUG_FIXES_SUMMARY.md** - Bug fix details
- **PROGRESS_REPORT.md** - Strategic overview
- **feedback.md** - Original recommendations

### Live URLs
- Frontend: https://jamii-link-ke.vercel.app
- Backend: https://iyf-s10-week-12-kimiti4.up.railway.app
- Health: https://iyf-s10-week-12-kimiti4.up.railway.app/api/health

---

## Need Help?

Common issues and solutions:

**Problem**: Posts not showing after selecting organization  
**Solution**: Check that posts have `organization` field set, verify API call includes query param

**Problem**: Organization dropdown empty  
**Solution**: Ensure user has memberships created, check API endpoint returns data

**Problem**: Navigation to `/org/[slug]` shows 404  
**Solution**: Verify route added to App.jsx, check slug matches organization in database

---

**Last Updated**: May 1, 2026  
**Status**: Ready to start Week 2 implementation
