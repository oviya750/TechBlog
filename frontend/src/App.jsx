import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import BlogListingPage from './pages/public/BlogListingPage';
import BlogDetailPage from './pages/public/BlogDetailPage';
import CategoryPage from './pages/public/CategoryPage';
import SearchResultsPage from './pages/public/SearchResultsPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPostsPage from './pages/admin/AdminPostsPage';
import AdminPostEditorPage from './pages/admin/AdminPostEditorPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminTagsPage from './pages/admin/AdminTagsPage';
import AdminAuthorsPage from './pages/admin/AdminAuthorsPage';
import AdminMediaPage from './pages/admin/AdminMediaPage';
import AdminScheduledPage from './pages/admin/AdminScheduledPage';
import AdminSeoPage from './pages/admin/AdminSeoPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  return (
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
  );
}

export default App;
