import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from '../../lib/motion';
import {
  Shield, Mail, Lock, Eye, EyeOff, ArrowRight,
  Check, GraduationCap, KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const features = [
    'Centralized User Account Governance & Role Allocation',
    'Enterprise Job Posting & Requisition Moderation',
    'College Placement Cell & Institutional Analytics',
    'Infrastructure Health & Real-Time System Monitoring'
  ];

  const handleDemoFill = () => {
    setEmail('admin@skillforge.com');
    setPassword('admin123');
    toast.success('Filled with Administrator demo credentials');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        const userRole = result.user?.role;
        if (userRole === 'admin' || userRole === 'college_admin') {
          toast.success(`Authenticated: Welcome Administrator ${result.user?.name || ''}`);
          navigate('/admin');
        } else {
          toast((t) => (
            <div>
              <b>Student Account Detected</b>
              <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Redirecting you to the Student Learning Dashboard...
              </div>
            </div>
          ), { icon: '🎓', duration: 4000 });
          navigate('/dashboard');
        }
      } else {
        toast.error(result.error || 'Invalid administrator credentials');
      }
    } catch (err) {
      toast.error('Network error during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      fontFamily: "'Inter', sans-serif"
    },
    leftPanel: {
      flex: 1,
      background: 'linear-gradient(135deg, #2E073F 0%, #4a1259 50%, #2E073F 100%)',
      display: (isMobile || isTablet) ? 'none' : 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    },
    blob1: {
      position: 'absolute',
      width: '450px',
      height: '450px',
      borderRadius: '50%',
      background: 'rgba(239, 68, 68, 0.08)',
      top: '-120px',
      left: '-100px'
    },
    blob2: {
      position: 'absolute',
      width: '350px',
      height: '350px',
      borderRadius: '50%',
      background: 'rgba(147, 51, 234, 0.12)',
      bottom: '-80px',
      right: '-80px'
    },
    leftContent: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      maxWidth: '440px'
    },
    leftIcon: {
      width: '84px',
      height: '84px',
      borderRadius: '24px',
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
      boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
    },
    leftBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.45rem',
      padding: '0.35rem 0.85rem',
      borderRadius: '50px',
      background: 'rgba(239, 68, 68, 0.2)',
      color: '#fca5a5',
      fontSize: '0.78rem',
      fontWeight: 600,
      marginBottom: '1rem',
      border: '1px solid rgba(239, 68, 68, 0.35)',
      letterSpacing: '0.04em'
    },
    leftTitle: {
      fontSize: '2.3rem',
      fontWeight: 800,
      marginBottom: '1rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    },
    leftSubtitle: {
      fontSize: '1.05rem',
      opacity: 0.85,
      marginBottom: '2.5rem',
      lineHeight: 1.65,
      color: '#d4d4d8'
    },
    featureList: {
      textAlign: 'left'
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1.1rem',
      fontSize: '0.92rem',
      color: '#e4e4e7'
    },
    featureCheck: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: 'rgba(239, 68, 68, 0.2)',
      color: '#f87171',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '1.25rem' : '2rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
    },
    formContainer: {
      width: '100%',
      maxWidth: '460px',
      background: 'white',
      padding: isMobile ? '1.75rem 1.25rem' : '3rem',
      borderRadius: isMobile ? '18px' : '24px',
      boxShadow: '0 25px 50px rgba(15, 23, 42, 0.12)',
      border: '1px solid #e2e8f0'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.65rem',
      marginBottom: '1.75rem',
      textDecoration: 'none'
    },
    logoIcon: {
      width: '46px',
      height: '46px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #2E073F 0%, #4a1259 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      boxShadow: '0 4px 14px rgba(46,7,63,0.35)'
    },
    logoText: {
      fontWeight: 800,
      fontSize: '1.45rem',
      color: '#2E073F',
      letterSpacing: '-0.02em'
    },
    portalTag: {
      display: 'inline-block',
      padding: '0.2rem 0.55rem',
      borderRadius: '6px',
      background: '#f3e8ff',
      color: '#2E073F',
      fontSize: '0.72rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      marginLeft: '0.4rem'
    },
    title: {
      fontSize: isMobile ? '1.5rem' : '1.75rem',
      fontWeight: 800,
      color: '#0f172a',
      textAlign: 'center',
      marginBottom: '0.35rem',
      letterSpacing: '-0.02em'
    },
    subtitle: {
      color: '#64748b',
      textAlign: 'center',
      marginBottom: '1.5rem',
      fontSize: isMobile ? '0.85rem' : '0.92rem'
    },
    demoPill: {
      background: '#faf5ff',
      border: '1px dashed #d8b4fe',
      borderRadius: '12px',
      padding: '0.65rem 0.85rem',
      marginBottom: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.78rem'
    },
    demoButton: {
      background: '#2E073F',
      color: 'white',
      border: 'none',
      padding: '0.35rem 0.75rem',
      borderRadius: '8px',
      fontWeight: 600,
      fontSize: '0.74rem',
      cursor: 'pointer'
    },
    inputGroup: {
      marginBottom: '1.25rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.45rem',
      fontWeight: 600,
      color: '#334155',
      fontSize: '0.85rem'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '0.85rem 1rem 0.85rem 3rem',
      borderRadius: '12px',
      border: '2px solid #ede9fe',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box',
      background: '#ffffff',
      color: '#1f2937'
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#a78bfa'
    },
    eyeButton: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#a78bfa'
    },
    submitButton: {
      width: '100%',
      padding: '0.95rem',
      borderRadius: '12px',
      border: 'none',
      background: 'linear-gradient(135deg, #2E073F 0%, #4a1259 100%)',
      color: 'white',
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontSize: '0.95rem',
      boxShadow: '0 4px 15px rgba(46,7,63,0.35)'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '1.5rem 0',
      gap: '1rem'
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: '#e2e8f0'
    },
    dividerText: {
      color: '#94a3b8',
      fontSize: '0.78rem',
      fontWeight: 600,
      textTransform: 'uppercase'
    },
    portalSwitchers: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.65rem'
    },
    switcherBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      background: 'white',
      textDecoration: 'none',
      color: '#334155',
      fontSize: '0.82rem',
      fontWeight: 500,
      transition: 'all 0.15s'
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Panel - Branding */}
      <div style={styles.leftPanel}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.leftContent}>
          <div style={styles.leftIcon}>
            <Shield size={44} color="#f87171" />
          </div>
          <div style={styles.leftBadge}>
            <KeyRound size={14} color="#fca5a5" /> Institutional Administration
          </div>
          <h1 style={styles.leftTitle}>Platform Governance</h1>
          <p style={styles.leftSubtitle}>
            Administrative console for multi-role security, placement cell governance, and platform-wide telemetry.
          </p>
          <div style={styles.featureList}>
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                style={styles.featureItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div style={styles.featureCheck}>
                  <Check size={14} />
                </div>
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={styles.rightPanel}>
        <motion.div
          style={styles.formContainer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIcon}>
              <Shield size={24} />
            </div>
            <span style={styles.logoText}>
              SkillForge <span style={styles.portalTag}>Admin</span>
            </span>
          </Link>

          <h2 style={styles.title}>Administrator Sign In</h2>
          <p style={styles.subtitle}>Enter authorized administrative credentials to manage platform operations</p>

          {/* Quick Demo Fill Banner */}
          <div style={styles.demoPill}>
            <div>
              <div style={{ fontWeight: 600, color: '#991b1b' }}>Admin Demo Credentials</div>
              <div style={{ color: '#64748b' }}>admin@skillforge.com</div>
            </div>
            <button type="button" onClick={handleDemoFill} style={styles.demoButton}>
              Auto-Fill
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Admin Email</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@skillforge.com"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={styles.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              style={styles.submitButton}
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? 'Verifying Credentials...' : (
                <>Sign In to Admin Console <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>Switch Portals</span>
            <div style={styles.dividerLine} />
          </div>

          <div style={styles.portalSwitchers}>
            <Link to="/login" style={styles.switcherBtn}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <GraduationCap size={15} color="#2E073F" />
                Student Learning Portal
              </span>
              <ArrowRight size={14} color="#94a3b8" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
