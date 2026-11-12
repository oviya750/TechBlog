import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '../components/layout/AdminSidebar';
import AdminNavbar from '../components/layout/AdminNavbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SEOHead from '../components/common/SEOHead';

const AdminLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Authenticating editorial session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <div className="admin-shell">
      <a href="#admin-main-content" className="skip-to-content">
        Skip to console content
      </a>
      <SEOHead title="Editorial Staff Console" noindex={true} />
      <AdminSidebar />
      <div className="admin-main-wrap">
        <AdminNavbar />
        <main id="admin-main-content" className="admin-content-body" tabIndex="-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

