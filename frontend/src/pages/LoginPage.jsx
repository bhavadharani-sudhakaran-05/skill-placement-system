import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const features = [
    'AI-Powered Skill Analysis',
    'Personalized Learning Paths',
    'Real-Time Job Matching',
    'Career Growth Tracking'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  const styles = {
    container: { minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" },
    leftPanel: {
      flex: 1, background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '3rem', color: 'white', position: 'relative', overflow: 'hidden'
    },
    blob1: { position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', top: '-100px', left: '-100px' },
    blob2: { position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', bottom: '-50px', right: '-50px' },
    leftContent: { position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '400px' },
    leftIcon: { width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' },
    leftTitle: { fontSize: '2.25rem', fontWeight: 700, marginBottom: '1rem' },
    leftSubtitle: { fontSize: '1.125rem', opacity: 0.9, marginBottom: '2.5rem', lineHeight: 1.6 },
    featureList: { textAlign: 'left' },
    featureItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', fontSize: '1rem' },
    featureCheck: { width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    rightPanel: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)' },
    formContainer: { width: '100%', maxWidth: '440px', background: 'white', padding: '3rem', borderRadius: '24px', boxShadow: '0 25px 50px rgba(139,92,246,0.15)', border: '1px solid #ede9fe' },
    logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem', textDecoration: 'none' },
    logoIcon: { width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' },
    logoText: { fontWeight: 700, fontSize: '1.5rem', background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    title: { fontSize: '1.75rem', fontWeight: 700, color: '#1f2937', textAlign: 'center', marginBottom: '0.5rem' },
    subtitle: { color: '#6b7280', textAlign: 'center', marginBottom: '2rem' },
    inputGroup: { marginBottom: '1.25rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151', fontSize: '0.875rem' },
    inputWrapper: { position: 'relative' },
    input: {
      width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '12px', border: '2px solid #ede9fe',
      fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
    },
    inputIcon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a78bfa' },
    eyeButton: { position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa' },
    forgotLink: { display: 'block', textAlign: 'right', color: '#7c3aed', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '1.5rem', fontWeight: 500 },
    submitButton: {
      width: '100%', padding: '1rem', borderRadius: '12px', border: 'none',
      background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', color: 'white', fontWeight: 600,
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem',
      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
    },
    divider: { display: 'flex', alignItems: 'center', margin: '1.5rem 0', gap: '1rem' },
    dividerLine: { flex: 1, height: '1px', background: '#ede9fe' },
    dividerText: { color: '#a78bfa', fontSize: '0.875rem' },
    signUpText: { textAlign: 'center', marginTop: '1.5rem', color: '#6b7280' },
    signUpLink: { color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }
  };

  return (
    <div style={styles.container}>
      {/* Left Panel - Branding */}
      <div style={styles.leftPanel}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.leftContent}>
          <div style={styles.leftIcon}><Sparkles size={40} /></div>
          <h1 style={styles.leftTitle}>Welcome Back!</h1>
          <p style={styles.leftSubtitle}>Continue your journey towards career excellence with AI-powered guidance.</p>
          <div style={styles.featureList}>
            {features.map((feature, index) => (
              <motion.div key={feature} style={styles.featureItem}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }}>
                <div style={styles.featureCheck}><Check size={14} /></div>
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={styles.rightPanel}>
        <motion.div style={styles.formContainer} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIcon}><Sparkles size={24} color="white" /></div>
            <span style={styles.logoText}>SkillForge</span>
          </Link>

          <h2 style={styles.title}>Sign In</h2>
          <p style={styles.subtitle}>Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={20} style={styles.inputIcon} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={styles.input} required />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={20} style={styles.inputIcon} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={styles.input} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>

            <motion.button type="submit" style={styles.submitButton} disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {isLoading ? 'Signing in...' : (<>Sign In <ArrowRight size={18} /></>)}
            </motion.button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </div>

          <p style={styles.signUpText}>
            Don't have an account? <Link to="/register" style={styles.signUpLink}>Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
