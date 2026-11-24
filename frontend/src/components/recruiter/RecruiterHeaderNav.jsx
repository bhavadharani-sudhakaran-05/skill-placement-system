import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Briefcase, LayoutDashboard, Users, Search, Building2,
  ExternalLink, RefreshCw, PlusCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const RecruiterHeaderNav = ({ activeKey, onRefresh, refreshing, subtitle, onPostJob }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const companyName = user?.company?.name || 'TechCorp Solutions';

  const navItems = [
    { to: '/recruiter', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recruiter/jobs', label: 'My Postings', icon: Briefcase },
    { to: '/recruiter/applicants', label: 'Applicant Pipeline', icon: Users },
    { to: '/recruiter/candidates', label: 'Talent Pool', icon: Search },
    { to: '/recruiter/profile', label: 'Company Profile', icon: Building2 }
  ];

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
        borderRadius: '20px',
        padding: 'clamp(1rem, 3vw, 1.75rem)',
        color: 'white',
        boxShadow: '0 10px 25px -5px rgba(30, 27, 75, 0.35)',
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
            <Building2 size={14} color="#38bdf8" /> {companyName} • Talent & Hiring Portal
          </div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 3.5vw, 1.75rem)', fontWeight: 800, margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
            Recruiter Talent Center
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem', maxWidth: '650px' }}>
            {subtitle || 'Manage corporate job openings, evaluate student applicants with AI match scores, and discover campus talent.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {onPostJob && (
            <button
              onClick={onPostJob}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: 'white',
                border: 'none',
                padding: '0.65rem 1.15rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
              }}
            >
              <PlusCircle size={15} />
              Post New Role
            </button>
          )}

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
            onClick={() => navigate('/jobs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'white',
              color: '#1e1b4b',
              border: 'none',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <span>Student Jobs View</span>
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="touch-tabs-bar" style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '0.5rem',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeKey ? activeKey === item.label.toLowerCase() : false;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/recruiter'}
              style={({ isActive: navActive }) => {
                const active = isActive || navActive;
                return {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.1rem',
                  borderRadius: '10px',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.88rem',
                  textDecoration: 'none',
                  color: active ? '#4338ca' : '#64748b',
                  background: active ? '#eef2ff' : 'transparent',
                  border: active ? '1px solid #c7d2fe' : '1px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                };
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default RecruiterHeaderNav;

