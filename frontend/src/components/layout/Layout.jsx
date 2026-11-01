import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from '../../lib/motion';
import {
  LayoutDashboard, Briefcase, BookOpen, Route, FileText,
  ClipboardCheck, BarChart3, User, LogOut, Menu, X, Sparkles, Search, ChevronDown, Shield,
  Users, GraduationCap, Settings, ExternalLink, Building2
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Layout = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width < 768) {
        setMobileMenuOpen(false);
      } else if (width < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile drawer upon navigating
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const isAdminPath = location.pathname.startsWith('/admin');
  const isRecruiterPath = location.pathname.startsWith('/recruiter');

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Admin Overview', path: '/admin' },
    { icon: Users, label: 'User Accounts', path: '/admin/users' },
    { icon: Briefcase, label: 'Job Postings', path: '/admin/jobs' },
    { icon: GraduationCap, label: 'Colleges & Cells', path: '/admin/colleges' },
    { icon: ClipboardCheck, label: 'Skills & Tests', path: '/admin/assessments' },
    { icon: Settings, label: 'System Health', path: '/admin/settings' },
  ];

  const recruiterMenuItems = [
    { icon: LayoutDashboard, label: 'Recruiter Hub', path: '/recruiter' },
    { icon: Briefcase, label: 'My Postings', path: '/recruiter/jobs' },
    { icon: Users, label: 'Applicant Pipeline', path: '/recruiter/applicants' },
    { icon: Search, label: 'Talent Pool', path: '/recruiter/candidates' },
    { icon: Building2, label: 'Company Profile', path: '/recruiter/profile' },
  ];

  const studentMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: Route, label: 'Learning Path', path: '/learning-path' },
    { icon: FileText, label: 'Resume Analyzer', path: '/resume' },
    { icon: ClipboardCheck, label: 'Assessments', path: '/assessments' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  let menuItems;
  if (user?.role === 'admin') {
    if (isAdminPath) {
      menuItems = adminMenuItems;
    } else if (isRecruiterPath) {
      menuItems = recruiterMenuItems;
    } else {
      menuItems = [...studentMenuItems, { icon: Shield, label: 'Admin Module', path: '/admin' }];
    }
  } else if (user?.role === 'recruiter') {
    menuItems = recruiterMenuItems;
  } else {
    menuItems = studentMenuItems;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const effectiveSidebarWidth = isMobile
    ? '275px'
    : sidebarOpen
      ? (isTablet ? '230px' : '260px')
      : '80px';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", width: '100%', overflowX: 'hidden' }}>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            zIndex: 45,
            transition: 'opacity 0.25s ease'
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: effectiveSidebarWidth,
          minHeight: '100vh',
          height: '100%',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: isMobile ? 50 : 40,
          background: '#2E073F',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          transition: isMobile ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'width 0.3s ease',
          transform: isMobile ? (mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
          boxShadow: isMobile && mobileMenuOpen ? '8px 0 32px rgba(0,0,0,0.4)' : '4px 0 30px rgba(139, 92, 246, 0.25)'
        }}
      >
        {/* Logo Header in Sidebar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.15rem 1rem',
            borderBottom: '1px solid rgba(255,255,255,0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: isAdminPath ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isAdminPath ? <Shield size={20} color="white" /> : <Sparkles size={20} color="white" />}
            </div>
            {(isMobile || sidebarOpen) && (
              <span style={{ fontWeight: 700, fontSize: '1.15rem', color: 'white', whiteSpace: 'nowrap' }}>
                {isAdminPath ? 'SkillForge Admin' : 'SkillForge'}
              </span>
            )}
          </div>

          {isMobile ? (
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
              style={{
                padding: '0.45rem',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#c4b5fd',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          ) : (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              style={{
                padding: '0.45rem',
                borderRadius: '8px',
                background: 'transparent',
                border: 'none',
                color: '#c4b5fd',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav style={{ flex: 1, padding: '1.25rem 0.65rem', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/resume' && location.pathname === '/resume-analyzer');
              const showLabel = isMobile || sidebarOpen;
              return (
                <li key={item.path} style={{ marginBottom: '0.4rem' }}>
                  <Link
                    to={item.path}
                    onClick={() => { if (isMobile) setMobileMenuOpen(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: showLabel ? '0.75rem 0.9rem' : '0.75rem',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      justifyContent: showLabel ? 'flex-start' : 'center',
                      background: isActive ? '#9C27B0' : 'transparent',
                      color: isActive ? 'white' : '#c4b5fd',
                      boxShadow: isActive ? '0 4px 15px rgba(156, 39, 176, 0.45)' : 'none'
                    }}
                  >
                    <item.icon size={19} style={{ flexShrink: 0 }} />
                    {showLabel && (
                      <span style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* View Switcher & Logout Bottom Section */}
        <div style={{ padding: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          {user?.role === 'admin' && (
            <button
              onClick={() => navigate(isAdminPath ? '/dashboard' : '/admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                width: '100%',
                padding: (isMobile || sidebarOpen) ? '0.7rem 0.9rem' : '0.7rem',
                borderRadius: '10px',
                background: isAdminPath ? 'rgba(251, 191, 36, 0.15)' : 'rgba(167, 139, 250, 0.15)',
                border: 'none',
                color: isAdminPath ? '#fbbf24' : '#c4b5fd',
                cursor: 'pointer',
                transition: 'all 0.2s',
                justifyContent: (isMobile || sidebarOpen) ? 'flex-start' : 'center',
                marginBottom: '0.5rem'
              }}
            >
              {isAdminPath ? <ExternalLink size={17} style={{ flexShrink: 0 }} /> : <Shield size={17} style={{ flexShrink: 0 }} />}
              {(isMobile || sidebarOpen) && (
                <span style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  {isAdminPath ? 'Student Portal' : 'Admin Control'}
                </span>
              )}
            </button>
          )}

          {user?.role === 'recruiter' && (
            <button
              onClick={() => navigate(isRecruiterPath ? '/jobs' : '/recruiter')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                width: '100%',
                padding: (isMobile || sidebarOpen) ? '0.7rem 0.9rem' : '0.7rem',
                borderRadius: '10px',
                background: isRecruiterPath ? 'rgba(56, 189, 248, 0.15)' : 'rgba(167, 139, 250, 0.15)',
                border: 'none',
                color: isRecruiterPath ? '#38bdf8' : '#c4b5fd',
                cursor: 'pointer',
                transition: 'all 0.2s',
                justifyContent: (isMobile || sidebarOpen) ? 'flex-start' : 'center',
                marginBottom: '0.5rem'
              }}
            >
              {isRecruiterPath ? <ExternalLink size={17} style={{ flexShrink: 0 }} /> : <Building2 size={17} style={{ flexShrink: 0 }} />}
              {(isMobile || sidebarOpen) && (
                <span style={{ fontWeight: 600, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  {isRecruiterPath ? 'Student Jobs View' : 'Recruiter Hub'}
                </span>
              )}
            </button>
          )}

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              width: '100%',
              padding: (isMobile || sidebarOpen) ? '0.75rem 0.9rem' : '0.75rem',
              borderRadius: '10px',
              background: 'transparent',
              border: 'none',
              color: '#c4b5fd',
              cursor: 'pointer',
              transition: 'all 0.2s',
              justifyContent: (isMobile || sidebarOpen) ? 'flex-start' : 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#c4b5fd'}
          >
            <LogOut size={19} style={{ flexShrink: 0 }} />
            {(isMobile || sidebarOpen) && (
              <span style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : effectiveSidebarWidth,
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
          width: isMobile ? '100%' : `calc(100% - ${effectiveSidebarWidth})`,
          background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 50%, #ede9fe 100%)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Header */}
        <header
          style={{
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            padding: '0.65rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(139, 92, 246, 0.12)',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            gap: '0.75rem'
          }}
        >
          {/* Header Left: Hamburger menu toggle for mobile and tablet */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            {isMobile ? (
              <button
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  background: '#f5f3ff',
                  border: '1px solid #ede9fe',
                  color: '#2E073F',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Menu size={20} />
              </button>
            ) : (!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Expand sidebar"
                style={{
                  padding: '0.45rem',
                  borderRadius: '8px',
                  background: '#f5f3ff',
                  border: '1px solid #ede9fe',
                  color: '#2E073F',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Menu size={18} />
              </button>
            ))}

            {isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#2E073F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#2E073F' }}>SkillForge</span>
              </div>
            )}
          </div>

          {/* Search Input Bar (Responsive Flex) */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              maxWidth: '360px',
              minWidth: isMobile ? '120px' : '200px'
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }}
            />
            <input
              type="text"
              placeholder={isMobile ? "Search..." : "Search jobs, courses, skills..."}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.1rem',
                borderRadius: '8px',
                border: '1.5px solid #ede9fe',
                fontSize: '0.8rem',
                outline: 'none',
                boxSizing: 'border-box',
                background: 'white',
                color: '#1f2937'
              }}
            />
          </div>

          {/* User Profile & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.55rem',
                  borderRadius: '10px',
                  background: 'white',
                  border: '1px solid #ede9fe',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(139, 92, 246, 0.08)'
                }}
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2E073F 0%, #6d28d9 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    flexShrink: 0
                  }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </div>
                {!isMobile && (
                  <div style={{ textAlign: 'left', maxWidth: '100px', overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, color: '#374151', fontSize: '0.78rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {user?.name || 'User'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#2E073F', textTransform: 'capitalize' }}>
                      {user?.role || 'student'}
                    </div>
                  </div>
                )}
                <ChevronDown size={14} color="#9ca3af" />
              </button>

              {profileMenuOpen && (
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(139, 92, 246, 0.2)',
                    border: '1px solid #ede9fe',
                    overflow: 'hidden',
                    minWidth: '180px',
                    zIndex: 50
                  }}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Link
                    to={user?.role === 'recruiter' ? '/recruiter/profile' : '/profile'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      textDecoration: 'none',
                      color: '#374151',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      borderBottom: '1px solid #f3f4f6'
                    }}
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    <User size={16} color="#2E073F" /> Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/admin"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.65rem 1rem',
                          textDecoration: 'none',
                          color: '#b91c1c',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          borderBottom: '1px solid #f3f4f6'
                        }}
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <Shield size={15} /> Admin Console
                      </Link>
                      <Link
                        to="/recruiter"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.65rem 1rem',
                          textDecoration: 'none',
                          color: '#1d4ed8',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          borderBottom: '1px solid #f3f4f6'
                        }}
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <Building2 size={15} /> Recruiter Hub
                      </Link>
                      <Link
                        to="/dashboard"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.65rem 1rem',
                          textDecoration: 'none',
                          color: '#6d28d9',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          borderBottom: '1px solid #f3f4f6'
                        }}
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <GraduationCap size={15} /> Student View
                      </Link>
                    </>
                  )}
                  {user?.role === 'recruiter' && (
                    <Link
                      to="/jobs"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.65rem 1rem',
                        textDecoration: 'none',
                        color: '#4338ca',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        borderBottom: '1px solid #f3f4f6'
                      }}
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Briefcase size={15} /> Student Job Board
                    </Link>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 500
                    }}
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> Logout
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, width: '100%', boxSizing: 'border-box' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
