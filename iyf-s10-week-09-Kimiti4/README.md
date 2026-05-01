# Week 9: React Advanced - JamiiLink

IYF Weekend Academy Season 10 - Week 9

## Overview

This week focuses on advanced React patterns including effects, data fetching, routing, and styling. The JamiiLink application is now a multi-page app with client-side routing.

## Features Completed

✅ React Router implementation with multiple pages  
✅ useEffect hook for data fetching and side effects  
✅ Component composition and reusability  
✅ Responsive CSS design  
✅ Navigation between pages  
✅ Mock data integration  

## Tech Stack

- **React 18** - Modern UI library
- **React Router v6** - Client-side routing
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom responsive styling

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd iyf-s10-week-09-Kimiti4
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
iyf-s10-week-09-Kimiti4/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   │   ├── HomePage.jsx
│   │   ├── PostListPage.jsx
│   │   ├── PostDetailPage.jsx
│   │   └── AboutPage.jsx
│   ├── hooks/          # Custom hooks
│   ├── App.jsx         # Main app with routing
│   ├── App.css         # Application styles
│   ├── index.css       # Global styles
│   └── main.jsx        # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Pages

1. **Home Page** (`/`) - Landing page with features overview
2. **Posts List** (`/posts`) - Display all community posts
3. **Post Detail** (`/posts/:id`) - Individual post view
4. **About** (`/about`) - Information about the project

## Key Concepts Demonstrated

### 1. React Router
```jsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/posts" element={<PostListPage />} />
  <Route path="/posts/:id" element={<PostDetailPage />} />
</Routes>
```

### 2. useEffect Hook
```jsx
useEffect(() => {
  fetchPosts()
}, [])
```

### 3. useParams Hook
```jsx
const { id } = useParams()
```

### 4. Conditional Rendering
```jsx
if (loading) return <div>Loading...</div>
if (error) return <div>Error: {error}</div>
```

## Week 9 Tasks Completed

### Task 17.1: useEffect Hook ✅
- Implemented data fetching on component mount
- Added loading and error states
- Used cleanup patterns where needed

### Task 17.2: Data Fetching in React ✅
- Created mock data for posts
- Implemented async data fetching pattern
- Added proper error handling

### Task 17.3: React Router Setup ✅
- Installed react-router-dom
- Set up BrowserRouter
- Created route configuration
- Added navigation links

### Task 17.4: Multi-Page Application ✅
- Created Home page
- Created Posts List page
- Created Post Detail page
- Created About page
- Implemented navigation between pages

### Task 18.1: Component Patterns ✅
- Created reusable components
- Used props for data passing
- Implemented component composition

### Task 18.2: Styling in React ✅
- Created responsive CSS
- Used CSS Grid and Flexbox
- Implemented mobile-first design
- Added hover effects and transitions

## Running the Application

### Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Next Steps (Week 10-12)

- Week 10: Build Express API backend
- Week 11: Add MongoDB and authentication
- Week 12: Connect React to API and deploy

## Author

Amos Kimiti - IYF Weekend Academy Season 10

## License

MIT

---

Built with ❤️ using React & Vite
