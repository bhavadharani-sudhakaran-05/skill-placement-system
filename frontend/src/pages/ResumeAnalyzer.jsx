import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  FileText, Upload, CheckCircle, AlertTriangle, Target, Award,
  TrendingUp, Zap, Download, RefreshCw, Eye, Star, ChevronRight
} from 'lucide-react';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0]);
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 2500);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc', '.docx'] }, maxFiles: 1 });

  const analysisResults = {
    atsScore: 78, skillMatch: 85, formatting: 92, keywords: 68,
    skills: { found: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'], missing: ['TypeScript', 'AWS', 'Docker', 'System Design'] },
    suggestions: [
      { type: 'improvement', title: 'Add quantifiable achievements', description: 'Include metrics like "increased performance by 40%"' },
      { type: 'improvement', title: 'Include TypeScript experience', description: 'Top-demanded skill for your target roles' },
      { type: 'warning', title: 'Resume length', description: 'Consider condensing to 1 page for better ATS parsing' },
      { type: 'success', title: 'Strong action verbs', description: 'Good use of action verbs in experience section' }
    ]
  };

  const styles = {
    container: { padding: '1.5rem', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: '1.5rem' },
    title: { fontSize: '1.75rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { color: '#6b7280', fontSize: '0.95rem' },
    uploadSection: { marginBottom: '1.5rem' },
    dropzone: (isDragActive) => ({
      border: `3px dashed ${isDragActive ? '#7c3aed' : '#ede9fe'}`, borderRadius: '18px', padding: '2.5rem 2rem',
      textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s',
      background: isDragActive ? 'rgba(139,92,246,0.05)' : '#faf5ff'
    }),
    uploadIcon: { width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'white', boxShadow: '0 8px 25px rgba(139,92,246,0.35)' },
    uploadTitle: { fontSize: '1.3rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem' },
    uploadSubtitle: { color: '#6b7280', marginBottom: '1rem' },
    uploadButton: { padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(139,92,246,0.3)', fontSize: '0.95rem' },
    fileInfo: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem', background: '#f5f3ff', borderRadius: '12px', marginTop: '1rem', border: '1px solid #ede9fe' },
    fileIcon: { width: '48px', height: '48px', borderRadius: '12px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', boxShadow: '0 2px 8px rgba(139,92,246,0.15)' },
    fileName: { fontWeight: 600, color: '#1f2937' },
    fileSize: { fontSize: '0.875rem', color: '#6b7280' },
    analyzingState: { textAlign: 'center', padding: '3rem' },
    spinner: { width: '60px', height: '60px', border: '4px solid #ede9fe', borderTop: '4px solid #7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' },
    resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
    scoreCard: { background: 'white', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(139,92,246,0.08)', textAlign: 'center', border: '1px solid #ede9fe' },
    scoreCircle: (score) => ({
      width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: score >= 80 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : score >= 60 ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white',
      boxShadow: score >= 80 ? '0 8px 20px rgba(16,185,129,0.3)' : score >= 60 ? '0 8px 20px rgba(139,92,246,0.3)' : '0 8px 20px rgba(245,158,11,0.3)'
    }),
    scoreValue: { fontSize: '1.75rem', fontWeight: 700 },
    scoreLabel: { fontSize: '0.7rem', opacity: 0.9 },
    cardTitle: { fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' },
    cardSubtitle: { fontSize: '0.875rem', color: '#6b7280' },
    section: { background: 'white', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 4px 20px rgba(139,92,246,0.08)', marginBottom: '1.25rem', border: '1px solid #ede9fe' },
    sectionTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    skillsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
    skillsColumn: {},
    skillsLabel: { fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
    skillTag: (type) => ({
      padding: '0.375rem 0.875rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500,
      background: type === 'found' ? '#d1fae5' : '#fee2e2', color: type === 'found' ? '#059669' : '#dc2626'
    }),
    suggestionsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    suggestionItem: (type) => ({
      display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', borderRadius: '12px',
      background: type === 'success' ? '#f0fdf4' : type === 'warning' ? '#fffbeb' : '#faf5ff',
      border: `1px solid ${type === 'success' ? '#bbf7d0' : type === 'warning' ? '#fde68a' : '#ede9fe'}`
    }),
    suggestionIcon: (type) => ({
      width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white'
    }),
    suggestionTitle: { fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' },
    suggestionDesc: { fontSize: '0.875rem', color: '#6b7280' },
    actionsRow: { display: 'flex', gap: '1rem', justifyContent: 'center' },
    actionButton: (primary) => ({
      padding: '0.75rem 1.25rem', borderRadius: '12px', border: primary ? 'none' : '2px solid #ede9fe',
      background: primary ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' : 'white',
      color: primary ? 'white' : '#374151', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
      boxShadow: primary ? '0 4px 15px rgba(139,92,246,0.3)' : 'none', fontSize: '0.9rem'
    })
  };

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={styles.title}>AI Resume Analyzer</h1>
        <p style={styles.subtitle}>Get instant feedback and optimize your resume for ATS systems</p>
      </motion.div>

      {!analyzed ? (
        <motion.div style={styles.uploadSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {!analyzing ? (
            <div {...getRootProps()} style={styles.dropzone(isDragActive)}>
              <input {...getInputProps()} />
              <div style={styles.uploadIcon}><Upload size={36} /></div>
              <h3 style={styles.uploadTitle}>{isDragActive ? 'Drop your resume here' : 'Upload Your Resume'}</h3>
              <p style={styles.uploadSubtitle}>Drag & drop your resume or click to browse. PDF or Word format.</p>
              <button style={styles.uploadButton}><Upload size={18} /> Select File</button>
              {file && (
                <div style={styles.fileInfo}>
                  <div style={styles.fileIcon}><FileText size={24} /></div>
                  <div><div style={styles.fileName}>{file.name}</div><div style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div></div>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.analyzingState}>
              <div style={styles.spinner} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Analyzing your resume...</h3>
              <p style={{ color: '#6b7280' }}>Our AI is extracting skills and checking ATS compatibility</p>
            </div>
          )}
        </motion.div>
      ) : (
        <>
          {/* Score Cards */}
          <div style={styles.resultsGrid}>
            {[
              { score: analysisResults.atsScore, label: 'ATS Score', subtitle: 'Overall compatibility' },
              { score: analysisResults.skillMatch, label: 'Skill Match', subtitle: 'For target roles' },
              { score: analysisResults.formatting, label: 'Formatting', subtitle: 'Layout quality' },
              { score: analysisResults.keywords, label: 'Keywords', subtitle: 'Industry terms' }
            ].map((item, index) => (
              <motion.div key={item.label} style={styles.scoreCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <div style={styles.scoreCircle(item.score)}>
                  <span style={styles.scoreValue}>{item.score}</span>
                  <span style={styles.scoreLabel}>/ 100</span>
                </div>
                <h4 style={styles.cardTitle}>{item.label}</h4>
                <p style={styles.cardSubtitle}>{item.subtitle}</p>
              </motion.div>
            ))}
          </div>

          {/* Skills Analysis */}
          <motion.div style={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 style={styles.sectionTitle}><Target size={22} color="#7c3aed" /> Skills Analysis</h3>
            <div style={styles.skillsGrid}>
              <div style={styles.skillsColumn}>
                <div style={styles.skillsLabel}><CheckCircle size={18} color="#10b981" /> Skills Found ({analysisResults.skills.found.length})</div>
                <div style={styles.skillsList}>
                  {analysisResults.skills.found.map(skill => <span key={skill} style={styles.skillTag('found')}>{skill}</span>)}
                </div>
              </div>
              <div style={styles.skillsColumn}>
                <div style={styles.skillsLabel}><AlertTriangle size={18} color="#dc2626" /> Missing Skills ({analysisResults.skills.missing.length})</div>
                <div style={styles.skillsList}>
                  {analysisResults.skills.missing.map(skill => <span key={skill} style={styles.skillTag('missing')}>{skill}</span>)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Suggestions */}
          <motion.div style={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h3 style={styles.sectionTitle}><Zap size={22} color="#7c3aed" /> Improvement Suggestions</h3>
            <div style={styles.suggestionsList}>
              {analysisResults.suggestions.map((suggestion, index) => (
                <div key={index} style={styles.suggestionItem(suggestion.type)}>
                  <div style={styles.suggestionIcon(suggestion.type)}>
                    {suggestion.type === 'success' ? <CheckCircle size={18} /> : suggestion.type === 'warning' ? <AlertTriangle size={18} /> : <TrendingUp size={18} />}
                  </div>
                  <div><div style={styles.suggestionTitle}>{suggestion.title}</div><div style={styles.suggestionDesc}>{suggestion.description}</div></div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Actions */}
          <div style={styles.actionsRow}>
            <button style={styles.actionButton(false)} onClick={() => { setAnalyzed(false); setFile(null); }}><RefreshCw size={18} /> Upload New Resume</button>
            <button style={styles.actionButton(true)}><Download size={18} /> Download Report</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
