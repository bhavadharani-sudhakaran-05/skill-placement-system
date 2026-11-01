import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from '../lib/motion';
import { 
  Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, User,
  GraduationCap, Building2, Check, ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    department: '',
    graduationYear: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const features = [
    'AI-Powered ATS Resume Parsing & Scoring',
    'Real-Time Skill Gap Benchmark Tests',
    'Personalized Adaptive Learning Paths',
    'Direct Campus & Corporate Placement Matching'
  ];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Please enter your full name and student email');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: 'student',
      institution: formData.institution.trim(),
      department: formData.department.trim(),
      graduationYear: formData.graduationYear.trim()
    });

    if (result.success) {
      toast.success('Welcome! Student account created successfully.');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Registration failed');
    }
    setIsLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'Inter', sans-serif",
      background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Form Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '1.5rem 1rem' : isTablet ? '2rem' : '3rem 2.5rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            width: '100%',
            maxWidth: '460px',
            background: isMobile ? 'transparent' : 'white',
            borderRadius: isMobile ? '0' : '24px',
            padding: isMobile ? '0.5rem 0' : '2.5rem',
            boxShadow: isMobile ? 'none' : '0 20px 45px rgba(139,92,246,0.1)',
            border: isMobile ? 'none' : '1px solid #ede9fe',
            boxSizing: 'border-box'
          }}
        >
          {/* Logo Header */}
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.5rem',
            textDecoration: 'none'
          }}>
            <div style={{
              width: isMobile ? '38px' : '44px',
              height: isMobile ? '38px' : '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2E073F 0%, #4c1d95 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
            }}>
              <Sparkles size={isMobile ? 20 : 24} color="white" />
            </div>
            <span style={{
              fontWeight: 800,
              fontSize: isMobile ? '1.35rem' : '1.55rem',
              color: '#2E073F',
              letterSpacing: '-0.02em'
            }}>
              SkillForge
            </span>
          </Link>

          {/* Student Dedicated Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(124,58,237,0.1)',
            color: '#2E073F',
            padding: '0.35rem 0.85rem',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '0.75rem'
          }}>
            <GraduationCap size={15} /> Student Registration Portal
          </div>

          <h1 style={{
            fontSize: isMobile ? '1.5rem' : '1.85rem',
            fontWeight: 800,
            color: '#1e293b',
            margin: '0 0 0.35rem 0',
            letterSpacing: '-0.02em'
          }}>
            {step === 1 ? 'Create Your Account' : 'Secure Your Password'}
          </h1>
          <p style={{
            color: '#64748b',
            marginBottom: '1.5rem',
            fontSize: isMobile ? '0.85rem' : '0.92rem',
            lineHeight: 1.5
          }}>
            {step === 1
              ? 'Enter your academic details to get started with AI career guidance.'
              : 'Choose a strong password to protect your placement profile.'}
          </p>

          {/* 2-Step Progress Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.82rem',
              background: 'linear-gradient(135deg, #2E073F 0%, #4c1d95 100%)',
              color: 'white',
              boxShadow: '0 4px 10px rgba(139,92,246,0.3)'
            }}>
              {step > 1 ? <Check size={16} /> : 1}
            </div>

            <div style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: step > 1 ? '#2E073F' : '#ede9fe',
              transition: 'background 0.3s ease'
            }} />

            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.82rem',
              background: step === 2 ? 'linear-gradient(135deg, #2E073F 0%, #4c1d95 100%)' : '#ede9fe',
              color: step === 2 ? 'white' : '#a78bfa',
              boxShadow: step === 2 ? '0 4px 10px rgba(139,92,246,0.3)' : 'none',
              transition: 'all 0.3s ease'
            }}>
              2
            </div>
          </div>

          {/* Form with Steps */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                onSubmit={handleNextStep}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
              >
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a78bfa' }} />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Alex Morgan"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem 0.85rem 2.85rem',
                        borderRadius: '12px',
                        border: '1.5px solid #ede9fe',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: 'white'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                    Student Email Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a78bfa' }} />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@college.edu or gmail.com"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem 0.85rem 2.85rem',
                        borderRadius: '12px',
                        border: '1.5px solid #ede9fe',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: 'white'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                    College / University Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a78bfa' }} />
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="e.g. Apex Institute of Technology"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem 0.85rem 2.85rem',
                        borderRadius: '12px',
                        border: '1.5px solid #ede9fe',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: 'white'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1.3fr 0.9fr',
                  gap: '0.85rem'
                }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                      Department / Degree
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. B.Tech IT, B.E CSE"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: '1.5px solid #ede9fe',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: 'white'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      placeholder="2026"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border: '1.5px solid #ede9fe',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: 'white'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '0.95rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #2E073F 0%, #4c1d95 100%)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(139,92,246,0.35)',
                    marginTop: '0.5rem',
                    minHeight: '48px'
                  }}
                >
                  Continue to Password <ArrowRight size={18} />
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
              >
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                    Create Password <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a78bfa' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      style={{
                        width: '100%',
                        padding: '0.85rem 2.85rem 0.85rem 2.85rem',
                        borderRadius: '12px',
                        border: '1.5px solid #ede9fe',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: 'white'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#a78bfa',
                        padding: '0.35rem'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                    Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a78bfa' }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      style={{
                        width: '100%',
                        padding: '0.85rem 2.85rem 0.85rem 2.85rem',
                        borderRadius: '12px',
                        border: '1.5px solid #ede9fe',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: 'white'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password visibility"
                      style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#a78bfa',
                        padding: '0.35rem'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      padding: '0.85rem 1.25rem',
                      borderRadius: '12px',
                      border: '1.5px solid #ede9fe',
                      background: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#475569',
                      minHeight: '48px'
                    }}
                  >
                    <ChevronLeft size={18} /> Back
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '0.85rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #2E073F 0%, #4c1d95 100%)',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 15px rgba(139,92,246,0.35)',
                      minHeight: '48px'
                    }}
                  >
                    {isLoading ? 'Creating Account...' : (<>Complete Registration <ArrowRight size={18} /></>)}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Sign In Footer */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#64748b'
          }}>
            Already have a student account?{' '}
            <Link to="/login" style={{ color: '#2E073F', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative Side Panel - Cleanly Hidden on Mobile & Tablets */}
      {!isTablet && !isMobile && (
        <div style={{
          flex: 1.1,
          background: 'linear-gradient(135deg, #2E073F 0%, #4c1d95 60%, #581c87 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle Glow Blobs */}
          <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: '-100px', right: '-100px', filter: 'blur(50px)' }} />
          <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: '-50px', left: '-50px', filter: 'blur(40px)' }} />

          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '420px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
            }}>
              <GraduationCap size={44} color="#fbbf24" />
            </div>

            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, marginBottom: '0.85rem', letterSpacing: '-0.02em' }}>
              Accelerate Your Placement
            </h2>
            <p style={{ fontSize: '1.05rem', opacity: 0.9, marginBottom: '2.25rem', lineHeight: 1.6 }}>
              Join thousands of students building job-ready skills, optimizing ATS resumes, and getting recruited.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
              {features.map((feature, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check size={13} color="#fbbf24" />
                  </div>
                  <span style={{ opacity: 0.95 }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
