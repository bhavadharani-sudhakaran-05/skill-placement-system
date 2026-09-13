import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, BookOpen, Route, FileText,
  ClipboardCheck, BarChart3, User, LogOut, Menu, Sparkles, Search, ChevronDown
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Route, label: 'Learning Path', path: '/learning-path' },
    { icon: FileText, label: 'Resume Analyzer', path: '/resume' },
    { icon: ClipboardCheck, label: 'Assessments', path: '/assessments' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const styles = {
    container: { display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
    sidebar: {
      width: sidebarOpen ? '260px' : '80px', minHeight: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 40,
      background: '#2E073F', color: 'white',
      display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', boxShadow: '4px 0 30px rgba(139, 92, 246, 0.3)'
    },
    logoSection: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.15)'
    },
    logoWrapper: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    logoIcon: {
      width: '42px', height: '42px', borderRadius: '12px',
      background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    },
    logoText: { fontWeight: 700, fontSize: '1.25rem', display: sidebarOpen ? 'block' : 'none' },
    menuButton: {
      padding: '0.5rem', borderRadius: '8px', background: 'transparent', border: 'none',
      color: '#c4b5fd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    nav: { flex: 1, padding: '1.5rem 0.75rem', overflowY: 'auto' },
    navList: { listStyle: 'none', margin: 0, padding: 0 },
    navItem: { marginBottom: '0.5rem' },
    navLink: (isActive) => ({
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      padding: sidebarOpen ? '0.875rem 1rem' : '0.875rem', borderRadius: '12px',
      textDecoration: 'none', transition: 'all 0.2s', justifyContent: sidebarOpen ? 'flex-start' : 'center',
      background: isActive ? '#9C27B0' : 'transparent',
      color: isActive ? 'white' : '#c4b5fd',
      boxShadow: isActive ? '0 4px 15px rgba(156, 39, 176, 0.5)' : 'none'
    }),
    navIcon: { flexShrink: 0 },
    navLabel: { fontWeight: 500, fontSize: '0.925rem', display: sidebarOpen ? 'block' : 'none', whiteSpace: 'nowrap' },
    userSection: { padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)' },
    logoutButton: {
      display: 'flex', alignItems: 'center', gap: '0.875rem', width: '100%',
      padding: sidebarOpen ? '0.875rem 1rem' : '0.875rem', borderRadius: '12px',
      background: 'transparent', border: 'none', color: '#c4b5fd', cursor: 'pointer',
      transition: 'all 0.2s', justifyContent: sidebarOpen ? 'flex-start' : 'center'
    },
    main: { flex: 1, marginLeft: sidebarOpen ? '260px' : '80px', transition: 'margin-left 0.3s ease', minHeight: '100vh', background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 50%, #ede9fe 100%)' },
    header: {
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid rgba(139, 92, 246, 0.1)', position: 'sticky', top: 0, zIndex: 30
    },
    searchWrapper: { position: 'relative', width: '220px' },
    searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#2E073F' },
    searchInput: {
      width: '100%', padding: '0.5rem 0.75rem 0.5rem 2.25rem', borderRadius: '10px',
      border: '2px solid #ede9fe', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', background: 'white'
    },
    headerRight: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    userButton: {
      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.6rem',
      borderRadius: '10px', background: 'white', border: '1px solid #ede9fe', cursor: 'pointer', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)'
    },
    avatar: {
      width: '30px', height: '30px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.75rem'
    },
    userName: { fontWeight: 500, color: '#374151', fontSize: '0.8rem' },
    userRole: { fontSize: '0.65rem', color: '#2E073F' },
    profileDropdown: {
      position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem',
      background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(139, 92, 246, 0.2)',
      border: '1px solid #ede9fe', overflow: 'hidden', minWidth: '200px', zIndex: 50
    },
    dropdownItem: {
      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem',
      textDecoration: 'none', color: '#374151', cursor: 'pointer', transition: 'background 0.2s'
    },
    content: { padding: 0 }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logoWrapper}>
            <div style={styles.logoIcon}><Sparkles size={22} color="white" /></div>
            <span style={styles.logoText}>SkillForge</span>
          </div>
          <button style={styles.menuButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          <ul style={styles.navList}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} style={styles.navItem}>
                  <Link to={item.path} style={styles.navLink(isActive)}>
                    <item.icon size={20} style={styles.navIcon} />
                    <span style={styles.navLabel}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div style={styles.userSection}>
          <button style={styles.logoutButton} onClick={handleLogout} onMouseEnter={(e) => e.target.style.color = '#f87171'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
            <LogOut size={20} />
            <span style={{ ...styles.navLabel, display: sidebarOpen ? 'block' : 'none' }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input type="text" placeholder="Search jobs, courses, skills..." style={styles.searchInput} />
          </div>

          <div style={styles.headerRight}>
            <div style={{ position: 'relative' }}>
              <button style={styles.userButton} onClick={() => setProfileMenuOpen(!profileMenuOpen)}>
                <div style={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
                <div>
                  <div style={styles.userName}>{user?.name || 'User'}</div>
                  <div style={styles.userRole}>{user?.role || 'student'}</div>
                </div>
                <ChevronDown size={16} color="#9ca3af" />
              </button>

              {profileMenuOpen && (
                <motion.div style={styles.profileDropdown} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <Link to="/profile" style={styles.dropdownItem} onClick={() => setProfileMenuOpen(false)}>
                    <User size={18} /> Profile
                  </Link>
                  <div style={styles.dropdownItem} onClick={handleLogout}>
                    <LogOut size={18} /> Logout
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
