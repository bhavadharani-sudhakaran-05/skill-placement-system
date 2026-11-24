import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from '../../lib/motion';
import {
  Plus, Search, X, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminHeaderNav from '../../components/admin/AdminHeaderNav';
import api from '../../utils/api';

const AdminAssessments = () => {
  const [activeTab, setActiveTab] = useState('skills'); // 'skills' | 'assessments'
  const [skills, setSkills] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [search, setSearch] = useState('');
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [newSkillData, setNewSkillData] = useState({
    name: '',
    category: 'technical',
    demandLevel: 'high',
    growthTrend: 'rising',
    description: ''
  });

  const [newAssessmentData, setNewAssessmentData] = useState({
    title: '',
    skillName: 'JavaScript',
    category: 'technical',
    difficulty: 'intermediate',
    duration: 20
  });

  const fetchData = useCallback(async () => {
    try {
      const [skillsRes, assessRes] = await Promise.all([
        api.get('/admin/skills'),
        api.get('/admin/assessments')
      ]);
      if (skillsRes.data?.success) setSkills(skillsRes.data.data || []);
      if (assessRes.data?.success) setAssessments(assessRes.data.data || []);
    } catch (err) {
      console.error('Fetch skills/assessments error:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Taxonomy and tests updated');
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/skills', newSkillData);
      if (res.data?.success) {
        toast.success(`Skill "${newSkillData.name}" added to taxonomy`);
        setShowSkillModal(false);
        setNewSkillData({ name: '', category: 'technical', demandLevel: 'high', growthTrend: 'rising', description: '' });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/assessments', newAssessmentData);
      if (res.data?.success) {
        toast.success(`Assessment "${newAssessmentData.title}" created`);
        setShowAssessmentModal(false);
        setNewAssessmentData({ title: '', skillName: 'JavaScript', category: 'technical', difficulty: 'intermediate', duration: 20 });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create assessment');
    }
  };

  const filteredSkills = skills.filter(s =>
    !search ||
    (s.name && s.name.toLowerCase().includes(search.toLowerCase())) ||
    (s.category && s.category.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredAssessments = assessments.filter(a =>
    !search ||
    (a.title && a.title.toLowerCase().includes(search.toLowerCase())) ||
    (a.skillName && a.skillName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-responsive-container" style={{ padding: '1.5rem', minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      <AdminHeaderNav
        activeKey="assessments"
        onRefresh={handleRefresh}
        refreshing={refreshing}
        subtitle="Skill Taxonomy & Tests: Configure skill demand metrics, verification criteria, and student assessment benchmarks."
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Toggle Bar */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '10px' }}>
            <button
              onClick={() => setActiveTab('skills')}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '8px',
                background: activeTab === 'skills' ? 'white' : 'transparent',
                color: activeTab === 'skills' ? '#2E073F' : '#64748b',
                fontWeight: activeTab === 'skills' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
                boxShadow: activeTab === 'skills' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Skills Taxonomy ({skills.length})
            </button>
            <button
              onClick={() => setActiveTab('assessments')}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '8px',
                background: activeTab === 'assessments' ? 'white' : 'transparent',
                color: activeTab === 'assessments' ? '#2E073F' : '#64748b',
                fontWeight: activeTab === 'assessments' ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
                boxShadow: activeTab === 'assessments' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Assessments ({assessments.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '260px', justifyContent: 'flex-end' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {activeTab === 'skills' ? (
              <button
                onClick={() => setShowSkillModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> Add Skill
              </button>
            ) : (
              <button
                onClick={() => setShowAssessmentModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#2E073F',
                  color: 'white',
                  border: 'none',
                  padding: '0.55rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} /> New Assessment
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Skills Table */}
        {activeTab === 'skills' && (
          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem' }}>Skill Name</th>
                  <th style={{ padding: '0.75rem' }}>Category</th>
                  <th style={{ padding: '0.75rem' }}>Industry Demand</th>
                  <th style={{ padding: '0.75rem' }}>Trend</th>
                  <th style={{ padding: '0.75rem' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkills.map(s => (
                  <tr key={s._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{s.name}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', background: '#f1f5f9', color: '#475569' }}>
                        {s.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: s.demandLevel === 'high' ? '#fee2e2' : '#fef3c7',
                        color: s.demandLevel === 'high' ? '#b91c1c' : '#b45309'
                      }}>
                        {s.demandLevel}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#059669', fontWeight: 600 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <TrendingUp size={14} /> {s.growthTrend || 'rising'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.82rem' }}>
                      {s.description || 'Core technology competency'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Assessments Grid */}
        {activeTab === 'assessments' && (
          <div className="responsive-grid-3" style={{ gap: '1.25rem' }}>
            {filteredAssessments.map(a => (
              <div key={a._id} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2E073F', background: '#ede9fe', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                    {a.skillName || a.skill?.name || 'Skill'}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'capitalize' }}>
                    {a.difficulty}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{a.title}</h4>
                <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5 }}>
                  {a.description || 'Evaluate candidate skills with timed assessment questions.'}
                </p>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b' }}>
                  <span>{a.duration || 20} Minutes</span>
                  <span>{(a.questions || []).length || 5} Questions</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Skill Modal */}
      <AnimatePresence>
        {showSkillModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '440px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Add Skill to Taxonomy</h3>
                <button onClick={() => setShowSkillModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateSkill} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Skill Name</label>
                  <input type="text" required value={newSkillData.name} onChange={e => setNewSkillData({ ...newSkillData, name: e.target.value })} placeholder="e.g. Next.js, Kubernetes" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Category</label>
                  <select value={newSkillData.category} onChange={e => setNewSkillData({ ...newSkillData, category: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                    <option value="technical">Technical</option>
                    <option value="tools">Tools / DevOps</option>
                    <option value="domain">Domain / AI</option>
                    <option value="soft">Soft Skills</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Industry Demand Level</label>
                  <select value={newSkillData.demandLevel} onChange={e => setNewSkillData({ ...newSkillData, demandLevel: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                    <option value="high">High Demand</option>
                    <option value="medium">Medium Demand</option>
                    <option value="low">Low Demand</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowSkillModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#059669', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save Skill</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Assessment Modal */}
      <AnimatePresence>
        {showAssessmentModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '460px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Create Assessment Benchmark</h3>
                <button onClick={() => setShowAssessmentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Assessment Title</label>
                  <input type="text" required value={newAssessmentData.title} onChange={e => setNewAssessmentData({ ...newAssessmentData, title: e.target.value })} placeholder="React Core Architecture Benchmark" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Target Skill</label>
                  <input type="text" required value={newAssessmentData.skillName} onChange={e => setNewAssessmentData({ ...newAssessmentData, skillName: e.target.value })} placeholder="React" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Difficulty</label>
                    <select value={newAssessmentData.difficulty} onChange={e => setNewAssessmentData({ ...newAssessmentData, difficulty: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Duration (Mins)</label>
                    <input type="number" min={5} max={120} value={newAssessmentData.duration} onChange={e => setNewAssessmentData({ ...newAssessmentData, duration: parseInt(e.target.value) })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowAssessmentModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#2E073F', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Publish Test</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAssessments;
