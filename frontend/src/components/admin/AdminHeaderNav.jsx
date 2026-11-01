import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Users, Briefcase,
  ClipboardCheck, Settings, ExternalLink, RefreshCw
} from 'lucide-react';

const AdminHeaderNav = ({ activeKey, onRefresh, refreshing, subtitle }) => {
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/jobs', label: 'Jobs & Placements', icon: Briefcase },
    { to: '/admin/assessments', label: 'Skills & Assessments', icon: ClipboardCheck },
    { to: '/admin/settings', label: 'System & Health', icon: Settings }
  ];

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2E073F 0%, #4c1d95 60%, #581c87 100%)',
        borderRadius: '20px',
        padding: '1.75rem 2rem',
        color: 'white',
        boxShadow: '0 10px 25px -5px rgba(46, 7, 63, 0.3)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(255,255,255,0.15)',
            padding: '0.3rem 0.75rem',
            borderRadius: '50px',
            fontSize: '0.78rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            letterSpacing: '0.02em'
          }}>
            <Shield size={14} color="#fbbf24" /> Platform Administration
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
            SkillForge Admin Module
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem', maxWidth: '650px' }}>
            {subtitle || 'Manage college student profiles, corporate job postings, skill tests, and placement operations.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(255,255,255,0.18)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              Sync Data
            </button>
          )}

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'white',
              color: '#2E073F',
              border: 'none',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            Student View <ExternalLink size={14} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        overflowX: 'auto',
        paddingBottom: '0.15rem'
      }}>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: isActive ? 'white' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #2E073F' : '3px solid transparent',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#2E073F' : '#64748b',
                textDecoration: 'none',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                fontSize: '0.88rem'
              })}
            >
              <Icon size={16} />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHeaderNav;

