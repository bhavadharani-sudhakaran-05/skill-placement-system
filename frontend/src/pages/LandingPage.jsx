import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import CountUp from 'react-countup';
import {
  Sparkles,
  Brain,
  Target,
  FileSearch,
  Route,
  BarChart3,
  RefreshCw,
  ArrowRight,
  Star,
  Zap,
  Play
} from 'lucide-react';

const LandingPage = () => {
  const features = [
    { icon: Brain, title: 'AI Skill Gap Analyzer', description: 'Advanced AI identifies gaps between your current skills and job requirements.', gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' },
    { icon: Target, title: 'Smart Placement Engine', description: 'Personalized job recommendations based on your unique skill profile.', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' },
    { icon: Zap, title: 'Real-Time Readiness Score', description: 'Dynamic 0-100 score showing your preparation level for target roles.', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
    { icon: FileSearch, title: 'AI Resume Optimizer', description: 'Parse and optimize your resume with ATS scoring and suggestions.', gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)' },
    { icon: Route, title: 'Adaptive Learning Paths', description: 'Personalized learning journeys that adapt based on your progress.', gradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' },
    { icon: BarChart3, title: 'Analytics Dashboard', description: 'Comprehensive insights for students, colleges, and recruiters.', gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)' },
    { icon: RefreshCw, title: 'Feedback Loop Learning', description: 'Continuous improvement through placement outcomes and feedback.', gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }
  ];

  const stats = [
    { value: 50000, label: 'Students Placed', suffix: '+' },
    { value: 500, label: 'Partner Companies', suffix: '+' },
    { value: 98, label: 'Success Rate', suffix: '%' },
    { value: 1000, label: 'Courses Available', suffix: '+' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 50%, #ede9fe 100%)', fontFamily: "'Inter', sans-serif" }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 20px rgba(139,92,246,0.1)'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
          <Sparkles size={28} />
          <span>SkillForge</span>
        </Link>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#features" style={{ color: '#374151', textDecoration: 'none', fontWeight: 500 }}>Features</a>
          <a href="#stats" style={{ color: '#374151', textDecoration: 'none', fontWeight: 500 }}>Stats</a>
          <Link to="/login" style={{ color: '#374151', textDecoration: 'none', fontWeight: 500 }}>Login</Link>
          <Link to="/register" style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', color: 'white',
            padding: '0.75rem 1.5rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
          }}>
            Get Started <ArrowRight size={18} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6rem 2rem 4rem', position: 'relative', overflow: 'hidden'
      }}>
        {/* Background Blobs */}
        <div style={{
          position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(139,92,246,0.3) 100%)',
          filter: 'blur(80px)', top: '-150px', right: '-100px', zIndex: 1
        }} />
        <div style={{
          position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(167,139,250,0.2) 0%, rgba(196,181,253,0.2) 100%)',
          filter: 'blur(80px)', bottom: '-100px', left: '-100px', zIndex: 1
        }} />

        <div style={{
          maxWidth: '1200px', margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 10
        }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(139,92,246,0.1) 100%)',
              color: '#7c3aed', padding: '0.5rem 1rem', borderRadius: '50px',
              fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem'
            }}>
              <Sparkles size={16} />
              AI-Powered Career Platform
            </div>

            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: '#1f2937' }}>
              Transform Your Career With{' '}
              <span style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
              }}>
                <TypeAnimation
                  sequence={['AI Guidance', 2000, 'Smart Learning', 2000, 'Perfect Placements', 2000]}
                  repeat={Infinity}
                  speed={50}
                />
              </span>
            </h1>

            <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem', lineHeight: 1.7 }}>
              Intelligent Skill Development & Placement Recommendation System powered by AI.
              Bridge your skill gaps, get personalized learning paths, and land your dream job.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', color: 'white',
                padding: '1rem 2rem', borderRadius: '14px', textDecoration: 'none', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem',
                boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)'
              }}>
                Start Your Journey <ArrowRight size={20} />
              </Link>
              <button style={{
                background: 'white', color: '#7c3aed', padding: '1rem 2rem', borderRadius: '14px',
                fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                border: '2px solid #ede9fe', cursor: 'pointer', fontSize: '1.1rem'
              }}>
                <Play size={20} /> Watch Demo
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div style={{
              background: 'white', borderRadius: '24px', padding: '2rem',
              boxShadow: '0 25px 50px rgba(139,92,246,0.15)', border: '1px solid #ede9fe'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.25rem' }}>Skill Readiness Score</div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>For Software Engineer Role</div>
              </div>

              <div style={{
                width: '140px', height: '140px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'white', margin: '0 auto 2rem', boxShadow: '0 10px 40px rgba(139,92,246,0.4)'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 800 }}>87%</div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Excellent</div>
              </div>

              {[
                { name: 'JavaScript', value: 95 },
                { name: 'React.js', value: 88 },
                { name: 'Node.js', value: 82 },
                { name: 'System Design', value: 75 }
              ].map((skill, index) => (
                <div key={skill.name} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}>
                    <span>{skill.name}</span>
                    <span style={{ color: '#7c3aed' }}>{skill.value}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#f5f3ff', borderRadius: '5px', overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)', borderRadius: '5px' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.value}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" style={{ padding: '5rem 2rem', background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center', color: 'white'
        }}>
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                <CountUp end={stat.value} duration={2.5} separator="," enableScrollSpy scrollSpyOnce />
                {stat.suffix}
              </div>
              <div style={{ fontSize: '1.1rem', opacity: 0.9 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '6rem 2rem', background: 'white' }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(139,92,246,0.1) 100%)',
            color: '#7c3aed', padding: '0.5rem 1rem', borderRadius: '50px',
            fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem'
          }}>
            <Zap size={16} />
            Powerful Features
          </div>
          <h2 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
            7 Unique AI-Powered Features
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Cutting-edge technology designed to accelerate your career growth and maximize placement success.
          </p>
        </div>

        <div style={{
          maxWidth: '1200px', margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem'
        }}>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              style={{
                background: '#f9fafb', borderRadius: '20px', padding: '2rem',
                border: '1px solid #e5e7eb', cursor: 'pointer'
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            >
              <div style={{
                width: '70px', height: '70px', borderRadius: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem', color: 'white', background: feature.gradient,
                boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
              }}>
                <feature.icon size={32} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', marginBottom: '0.75rem' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#6b7280', lineHeight: 1.7, fontSize: '1rem' }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '6rem 2rem', background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)', textAlign: 'center' }}>
        <motion.div
          style={{ maxWidth: '700px', margin: '0 auto' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>
            Ready to Transform Your Career?
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#9ca3af', marginBottom: '2rem' }}>
            Join thousands of students who have already landed their dream jobs with SkillForge.
          </p>
          <Link to="/register" style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', color: 'white',
            padding: '1rem 2.5rem', borderRadius: '14px', textDecoration: 'none', fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem',
            boxShadow: '0 8px 25px rgba(124, 58, 237, 0.4)'
          }}>
            Get Started Free <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 2rem', background: '#111827', textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sparkles size={24} color="#7c3aed" />
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>SkillForge</span>
        </div>
        <p>© 2026 SkillForge. Built for Smart India Hackathon.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <Star size={20} color="#fbbf24" fill="#fbbf24" />
          <Star size={20} color="#fbbf24" fill="#fbbf24" />
          <Star size={20} color="#fbbf24" fill="#fbbf24" />
          <Star size={20} color="#fbbf24" fill="#fbbf24" />
          <Star size={20} color="#fbbf24" fill="#fbbf24" />
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
