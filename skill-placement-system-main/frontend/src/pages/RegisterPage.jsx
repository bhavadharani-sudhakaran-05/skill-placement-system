import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, User,
  GraduationCap, Briefcase, Building2, Check, ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', institution: '', department: '', graduationYear: '',
    company: '', designation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const roles = [
    { id: 'student', icon: GraduationCap, title: 'Student', description: 'Looking for skill development and job opportunities' },
    { id: 'recruiter', icon: Briefcase, title: 'Recruiter', description: 'Hiring talent for your organization' },
    { id: 'college', icon: Building2, title: 'College Admin', description: 'Managing placement activities for your institution' }
  ];

  const features = [
    'AI-Powered Skill Gap Analysis',
    'Personalized Learning Paths',
    'Real-Time Readiness Score',
    'Smart Job Recommendations'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) { setStep(step + 1); return; }
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    setIsLoading(true);
    const result = await register(formData);
    if (result.success) { toast.success('Account created successfully!'); navigate('/dashboard'); }
    else { toast.error(result.error); }
    setIsLoading(false);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const styles = {
    container: { minHeight: '100vh', display: 'flex', fontFamily: "'Inter', sans-serif" },
    leftPanel: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)' },
    formContainer: { width: '100%', maxWidth: '480px' },
    logo: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', textDecoration: 'none' },
    logoIcon: { width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' },
    logoText: { fontWeight: 700, fontSize: '1.5rem', background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    progressContainer: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' },
    progressStep: (active, completed) => ({
      width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.3s',
      background: active || completed ? 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)' : '#ede9fe',
      color: active || completed ? 'white' : '#a78bfa', boxShadow: active || completed ? '0 4px 12px rgba(139,92,246,0.3)' : 'none'
    }),
    progressLine: (completed) => ({ width: '40px', height: '4px', borderRadius: '2px', background: completed ? '#2E073F' : '#ede9fe' }),
    title: { fontSize: '2rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' },
    subtitle: { color: '#6b7280', marginBottom: '2rem', fontSize: '1rem' },
    roleCard: (selected) => ({
      width: '100%', padding: '1.25rem', borderRadius: '16px', border: `2px solid ${selected ? '#2E073F' : '#ede9fe'}`,
      background: selected ? 'rgba(139, 92, 246, 0.05)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center',
      gap: '1rem', marginBottom: '1rem', transition: 'all 0.2s', textAlign: 'left', boxShadow: selected ? '0 4px 15px rgba(139,92,246,0.15)' : 'none'
    }),
    roleIcon: (selected) => ({
      width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: selected ? 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)' : '#f5f3ff',
      color: selected ? 'white' : '#a78bfa'
    }),
    roleTitle: { fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' },
    roleDesc: { fontSize: '0.875rem', color: '#6b7280' },
    checkCircle: { width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #2E073F, #2E073F)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    inputGroup: { marginBottom: '1.25rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#374151', fontSize: '0.875rem' },
    inputWrapper: { position: 'relative' },
    input: {
      width: '100%', padding: '0.875rem 1rem 0.875rem 3rem', borderRadius: '12px', border: '2px solid #ede9fe',
      fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
    },
    inputIcon: { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#a78bfa' },
    eyeButton: { position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa' },
    buttonRow: { display: 'flex', gap: '1rem', marginTop: '1.5rem' },
    backButton: {
      padding: '0.875rem 1.5rem', borderRadius: '12px', border: '2px solid #ede9fe', background: 'white',
      fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#374151'
    },
    nextButton: {
      flex: 1, padding: '0.875rem', borderRadius: '12px', border: 'none',
      background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', color: 'white', fontWeight: 600,
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '1rem',
      boxShadow: '0 4px 15px rgba(139,92,246,0.3)'
    },
    signInText: { textAlign: 'center', marginTop: '2rem', color: '#6b7280' },
    signInLink: { color: '#2E073F', textDecoration: 'none', fontWeight: 600 },
    rightPanel: {
      flex: 1, background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'white', position: 'relative', overflow: 'hidden'
    },
    blob1: { position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', top: '-100px', right: '-100px' },
    blob2: { position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', bottom: '-50px', left: '-50px' },
    rightContent: { position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '400px' },
    rightIcon: { width: '80px', height: '80px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' },
    rightTitle: { fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' },
    rightSubtitle: { fontSize: '1.125rem', opacity: 0.9, marginBottom: '2rem', lineHeight: 1.6 },
    featureList: { textAlign: 'left' },
    featureItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', fontSize: '1rem' },
    featureCheck: { width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
  };

  return (
    <div style={styles.container}>
      {/* Left Panel - Form */}
      <div style={styles.leftPanel}>
        <motion.div style={styles.formContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIcon}><Sparkles size={28} color="white" /></div>
            <span style={styles.logoText}>SkillForge</span>
          </Link>

          {/* Progress Steps */}
          <div style={styles.progressContainer}>
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div style={styles.progressStep(step === s, step > s)}>
                  {step > s ? <Check size={18} /> : s}
                </div>
                {s < 3 && <div style={styles.progressLine(step > s)} />}
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1 - Role Selection */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h1 style={styles.title}>Join SkillForge</h1>
                  <p style={styles.subtitle}>Select your role to get started</p>
                  
                  {roles.map((role) => (
                    <motion.button
                      key={role.id} type="button" style={styles.roleCard(formData.role === role.id)}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData({ ...formData, role: role.id })}
                    >
                      <div style={styles.roleIcon(formData.role === role.id)}>
                        <role.icon size={28} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={styles.roleTitle}>{role.title}</div>
                        <div style={styles.roleDesc}>{role.description}</div>
                      </div>
                      {formData.role === role.id && (
                        <motion.div style={styles.checkCircle} initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <Check size={14} color="white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}

                  <button type="submit" style={{ ...styles.nextButton, marginTop: '1.5rem' }}>
                    Continue <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

              {/* Step 2 - Personal Info */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h1 style={styles.title}>Personal Information</h1>
                  <p style={styles.subtitle}>Tell us about yourself</p>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Full Name</label>
                    <div style={styles.inputWrapper}>
                      <User size={20} style={styles.inputIcon} />
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" style={styles.input} required />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email Address</label>
                    <div style={styles.inputWrapper}>
                      <Mail size={20} style={styles.inputIcon} />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" style={styles.input} required />
                    </div>
                  </div>

                  {formData.role === 'student' && (
                    <>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Institution</label>
                        <div style={styles.inputWrapper}>
                          <Building2 size={20} style={styles.inputIcon} />
                          <input type="text" name="institution" value={formData.institution} onChange={handleChange} placeholder="Your University" style={styles.input} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Department</label>
                          <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="Computer Science" style={{ ...styles.input, paddingLeft: '1rem' }} />
                        </div>
                        <div style={styles.inputGroup}>
                          <label style={styles.label}>Graduation Year</label>
                          <input type="text" name="graduationYear" value={formData.graduationYear} onChange={handleChange} placeholder="2025" style={{ ...styles.input, paddingLeft: '1rem' }} />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.role === 'recruiter' && (
                    <>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Company</label>
                        <div style={styles.inputWrapper}>
                          <Briefcase size={20} style={styles.inputIcon} />
                          <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Your Company" style={styles.input} />
                        </div>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Designation</label>
                        <div style={styles.inputWrapper}>
                          <User size={20} style={styles.inputIcon} />
                          <input type="text" name="designation" value={formData.designation} onChange={handleChange} placeholder="HR Manager" style={styles.input} />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.role === 'college' && (
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Institution Name</label>
                      <div style={styles.inputWrapper}>
                        <Building2 size={20} style={styles.inputIcon} />
                        <input type="text" name="institution" value={formData.institution} onChange={handleChange} placeholder="College/University Name" style={styles.input} />
                      </div>
                    </div>
                  )}

                  <div style={styles.buttonRow}>
                    <button type="button" onClick={() => setStep(1)} style={styles.backButton}>
                      <ChevronLeft size={18} /> Back
                    </button>
                    <button type="submit" style={styles.nextButton}>
                      Continue <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3 - Password */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h1 style={styles.title}>Create Password</h1>
                  <p style={styles.subtitle}>Secure your account with a strong password</p>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Password</label>
                    <div style={styles.inputWrapper}>
                      <Lock size={20} style={styles.inputIcon} />
                      <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" style={styles.input} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Confirm Password</label>
                    <div style={styles.inputWrapper}>
                      <Lock size={20} style={styles.inputIcon} />
                      <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" style={styles.input} required />
                    </div>
                  </div>

                  <div style={styles.buttonRow}>
                    <button type="button" onClick={() => setStep(2)} style={styles.backButton}>
                      <ChevronLeft size={18} /> Back
                    </button>
                    <button type="submit" style={styles.nextButton} disabled={isLoading}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p style={styles.signInText}>
            Already have an account? <Link to="/login" style={styles.signInLink}>Sign in</Link>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Info */}
      <div style={styles.rightPanel}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.rightContent}>
          <div style={styles.rightIcon}><GraduationCap size={40} /></div>
          <h2 style={styles.rightTitle}>Start Your Journey Today</h2>
          <p style={styles.rightSubtitle}>Join 50,000+ professionals who have transformed their careers with SkillForge</p>
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
    </div>
  );
};

export default RegisterPage;
