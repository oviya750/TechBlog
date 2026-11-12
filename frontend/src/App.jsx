import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Direct import for instantaneous initial paint on homepage & 404
import HomePage from './pages/public/HomePage';
import NotFoundPage from './pages/public/NotFoundPage';

// Code-split Public Pages
const BlogListingPage = lazy(() => import('./pages/public/BlogListingPage'));
const BlogDetailPage = lazy(() => import('./pages/public/BlogDetailPage'));
const CategoryPage = lazy(() => import('./pages/public/CategoryPage'));
const SearchResultsPage = lazy(() => import('./pages/public/SearchResultsPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));

// Code-split Admin Pages (isolated from public bundle)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminPostsPage = lazy(() => import('./pages/admin/AdminPostsPage'));
const AdminPostEditorPage = lazy(() => import('./pages/admin/AdminPostEditorPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminTagsPage = lazy(() => import('./pages/admin/AdminTagsPage'));
const AdminAuthorsPage = lazy(() => import('./pages/admin/AdminAuthorsPage'));
const AdminMediaPage = lazy(() => import('./pages/admin/AdminMediaPage'));
const AdminScheduledPage = lazy(() => import('./pages/admin/AdminScheduledPage'));
const AdminSeoPage = lazy(() => import('./pages/admin/AdminSeoPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

function App() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner text="Loading publication dispatch..." />
        </div>
      }
    >
      <Routes>
        {/* Public Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogListingPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Console */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="posts" element={<AdminPostsPage />} />
          <Route path="posts/new" element={<AdminPostEditorPage />} />
          <Route path="posts/edit/:id" element={<AdminPostEditorPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="tags" element={<AdminTagsPage />} />
          <Route path="authors" element={<AdminAuthorsPage />} />
          <Route path="media" element={<AdminMediaPage />} />
          <Route path="scheduled" element={<AdminScheduledPage />} />
          <Route path="seo" element={<AdminSeoPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
