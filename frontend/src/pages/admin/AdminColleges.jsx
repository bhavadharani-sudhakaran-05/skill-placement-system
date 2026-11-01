import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from '../../lib/motion';
import {
  GraduationCap, Plus, Search, X, MapPin, Globe, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminHeaderNav from '../../components/admin/AdminHeaderNav';
import api from '../../utils/api';

const AdminColleges = () => {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [newCollegeData, setNewCollegeData] = useState({
    name: '',
    email: '',
    password: '',
    location: 'Tamil Nadu, India',
    website: 'https://',
    placementCell: 'Directorate of Corporate Relations & Placements'
  });

  const fetchColleges = useCallback(async () => {
    try {
      const res = await api.get('/admin/colleges');
      if (res.data?.success) {
        setColleges(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch colleges error:', err);
    }
  }, []);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchColleges();
    setRefreshing(false);
    toast.success('College directory synchronized');
  };

  const handleCreateCollege = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/colleges', newCollegeData);
      if (res.data?.success) {
        toast.success('College registered successfully');
        setShowCreateModal(false);
        setNewCollegeData({
          name: '',
          email: '',
          password: '',
          location: 'Tamil Nadu, India',
          website: 'https://',
          placementCell: 'Directorate of Corporate Relations & Placements'
        });
        fetchColleges();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register college');
    }
  };

  const filteredColleges = colleges.filter(c =>
    !search ||
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    (c.adminEmail && c.adminEmail.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-responsive-container" style={{ padding: '1.5rem', minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      <AdminHeaderNav
        activeKey="colleges"
        onRefresh={handleRefresh}
        refreshing={refreshing}
        subtitle="Institutions & Placement Cells: Track affiliated colleges, student enrollment counts, and institutional placement performance."
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Controls Bar */}
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
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search colleges or universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#d97706',
              color: 'white',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Register College
          </button>
        </div>

        {/* Colleges Grid */}
        <div className="responsive-grid-2" style={{ gap: '1.25rem' }}>
          {filteredColleges.map((c, idx) => (
            <div
              key={c._id || idx}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
                    <GraduationCap size={22} />
                  </div>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '50px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: '#dbeafe',
                    color: '#1d4ed8'
                  }}>
                    {c.placementRate || 80}% Placement Rate
                  </span>
                </div>

                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                  {c.name}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} color="#94a3b8" /> {c.location || 'India'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={14} color="#94a3b8" /> {c.adminEmail}
                  </div>
                  {c.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Globe size={14} color="#94a3b8" />
                      <a href={c.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>
                        {c.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics Chips */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Enrolled Students</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{c.enrolledStudents}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Avg Skill Score</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>{c.avgSkillScore || 75}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredColleges.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: 'white', borderRadius: '16px' }}>
            No colleges found. Register an institution to get started.
          </div>
        )}
      </motion.div>

      {/* Register College Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Register Affiliated Institution</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateCollege} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>College / University Name</label>
                  <input type="text" required value={newCollegeData.name} onChange={e => setNewCollegeData({ ...newCollegeData, name: e.target.value })} placeholder="Sri Shakthi Institute of Engineering and Technology" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Placement Cell Officer Email</label>
                  <input type="email" required value={newCollegeData.email} onChange={e => setNewCollegeData({ ...newCollegeData, email: e.target.value })} placeholder="placement@srishakthi.ac.in" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Login Password</label>
                  <input type="password" required value={newCollegeData.password} onChange={e => setNewCollegeData({ ...newCollegeData, password: e.target.value })} placeholder="••••••••" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Campus Location</label>
                  <input type="text" value={newCollegeData.location} onChange={e => setNewCollegeData({ ...newCollegeData, location: e.target.value })} placeholder="Coimbatore, Tamil Nadu" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Official Website</label>
                  <input type="url" value={newCollegeData.website} onChange={e => setNewCollegeData({ ...newCollegeData, website: e.target.value })} placeholder="https://srishakthi.ac.in" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#d97706', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Register Institute</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminColleges;
