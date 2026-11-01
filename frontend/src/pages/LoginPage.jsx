import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from '../lib/motion';
import {
  Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Check,
  GraduationCap, Building2, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
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
    'AI-Powered Skill Gap Analysis',
    'Personalized Adaptive Learning Paths',
    'Real-Time Job Placement Matching',
    'AI-Proctored Skill Assessments & Badges'
  ];

  const handleDemoFill = () => {
    setEmail('student@skillforge.com');
    setPassword('student123');
    toast.success('Filled with Student demo credentials');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else if (result.user?.role === 'recruiter') {
        navigate('/recruiter');
      } else if (result.user?.role === 'college_admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
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
      background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)',
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
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
      top: '-100px',
      left: '-100px'
    },
    blob2: {
      position: 'absolute',
      width: '300px',
      height: '300px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
      bottom: '-50px',
      right: '-50px'
    },
    leftContent: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      maxWidth: '400px'
    },
    leftIcon: {
      width: '80px',
      height: '80px',
      borderRadius: '20px',
      background: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem'
    },
    leftBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.35rem 0.85rem',
      borderRadius: '50px',
      background: 'rgba(255,255,255,0.18)',
      fontSize: '0.78rem',
      fontWeight: 600,
      marginBottom: '1rem',
      letterSpacing: '0.03em'
    },
    leftTitle: {
      fontSize: '2.25rem',
      fontWeight: 700,
      marginBottom: '1rem'
    },
    leftSubtitle: {
      fontSize: '1.125rem',
      opacity: 0.9,
      marginBottom: '2.5rem',
      lineHeight: 1.6
    },
    featureList: {
      textAlign: 'left'
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
      fontSize: '1rem'
    },
    featureCheck: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '1.25rem' : '2rem',
      background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)'
    },
    formContainer: {
      width: '100%',
      maxWidth: '460px',
      background: 'white',
      padding: isMobile ? '1.75rem 1.25rem' : '3rem',
      borderRadius: isMobile ? '18px' : '24px',
      boxShadow: '0 25px 50px rgba(139,92,246,0.15)',
      border: '1px solid #ede9fe'
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      marginBottom: '1.75rem',
      textDecoration: 'none'
    },
    logoIcon: {
      width: '46px',
      height: '46px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
    },
    logoText: {
      fontWeight: 700,
      fontSize: '1.5rem',
      background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
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
      fontWeight: 700,
      color: '#1f2937',
      textAlign: 'center',
      marginBottom: '0.35rem'
    },
    subtitle: {
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: '1.5rem',
      fontSize: isMobile ? '0.875rem' : '1rem'
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
      marginBottom: '0.5rem',
      fontWeight: 500,
      color: '#374151',
      fontSize: '0.875rem'
    },
    inputWrapper: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem 0.875rem 3rem',
      borderRadius: '12px',
      border: '2px solid #ede9fe',
      fontSize: '1rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
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
      padding: '1rem',
      borderRadius: '12px',
      border: 'none',
      background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)',
      color: 'white',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontSize: '1rem',
      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
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
      background: '#ede9fe'
    },
    dividerText: {
      color: '#a78bfa',
      fontSize: '0.78rem',
      fontWeight: 600,
      textTransform: 'uppercase'
    },
    signUpText: {
      textAlign: 'center',
      margin: '0.5rem 0 1.25rem',
      color: '#6b7280',
      fontSize: '0.9rem'
    },
    signUpLink: {
      color: '#2E073F',
      textDecoration: 'none',
      fontWeight: 600
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
      border: '1px solid #ede9fe',
      background: '#faf5ff',
      textDecoration: 'none',
      color: '#374151',
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
            <GraduationCap size={44} color="white" />
          </div>
          <div style={styles.leftBadge}>
            <Sparkles size={14} color="#fef08a" /> Student Career Portal
          </div>
          <h1 style={styles.leftTitle}>Welcome Students!</h1>
          <p style={styles.leftSubtitle}>
            Unlock personalized learning paths, AI resume optimization, and high-match corporate placement recommendations.
          </p>
          <div style={styles.featureList}>
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                style={styles.featureItem}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
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
          transition={{ duration: 0.5 }}
        >
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIcon}>
              <Sparkles size={24} color="white" />
            </div>
            <span style={styles.logoText}>
              SkillForge <span style={styles.portalTag}>Student</span>
            </span>
          </Link>

          <h2 style={styles.title}>Student Sign In</h2>
          <p style={styles.subtitle}>Enter your student credentials to access your dashboard</p>

          {/* Quick Demo Fill Banner */}
          <div style={styles.demoPill}>
            <div>
              <div style={{ fontWeight: 600, color: '#2E073F' }}>Demo Student Access</div>
              <div style={{ color: '#6b7280' }}>student@skillforge.com</div>
            </div>
            <button type="button" onClick={handleDemoFill} style={styles.demoButton}>
              Auto-Fill
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Student Email</label>
              <div style={styles.inputWrapper}>
                <Mail size={20} style={styles.inputIcon} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={20} style={styles.inputIcon} />
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
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              style={styles.submitButton}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? 'Signing in...' : (
                <>Sign In to Student Portal <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <p style={styles.signUpText}>
            New Student? <Link to="/register" style={styles.signUpLink}>Register your account</Link>
          </p>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>Other Portals</span>
            <div style={styles.dividerLine} />
          </div>

          <div style={styles.portalSwitchers}>
            <Link to="/recruiter/login" style={styles.switcherBtn}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Building2 size={15} color="#0284c7" />
                Corporate Recruiter? Recruiter Portal
              </span>
              <ArrowRight size={14} color="#94a3b8" />
            </Link>

            <Link to="/admin/login" style={styles.switcherBtn}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Shield size={15} color="#b91c1c" />
                Placement Officer / Admin? Admin Portal
              </span>
              <ArrowRight size={14} color="#94a3b8" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
