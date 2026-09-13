import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Upload, CheckCircle, AlertTriangle, Award,
  TrendingUp, Zap, RefreshCw,
  Briefcase, BookOpen, GraduationCap, Code
} from 'lucide-react';
import api from '../utils/api';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const onDrop = useCallback(async (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setAnalyzing(true);
    setError('');
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('resume', uploadedFile);

      // Simulate progress stages
      setProgress(20);
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 85));
      }, 500);

      const response = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.data.success) {
        setAnalysisResults(response.data.data);
        setTimeout(() => {
          setAnalyzing(false);
          setAnalyzed(true);
        }, 500);
      } else {
        throw new Error(response.data.message || 'Analysis failed');
      }
    } catch (err) {
      console.error('Resume analysis error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to analyze resume. Please try again.');
      setAnalyzing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024
  });

  const getSuggestionType = (suggestion) => {
    if (suggestion.priority === 'low') return 'success';
    if (suggestion.priority === 'high') return 'warning';
    return 'improvement';
  };

  const styles = {
    container: { padding: '1rem', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: '1rem' },
    title: { fontSize: '1.4rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.35rem', background: 'linear-gradient(135deg, #2E073F, #2E073F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { color: '#6b7280', fontSize: '0.75rem' },
    uploadSection: { marginBottom: '1rem' },
    dropzone: (isDragActive) => ({
      border: `3px dashed ${isDragActive ? '#2E073F' : '#ede9fe'}`, borderRadius: '14px', padding: '1.5rem 1.25rem',
      textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s',
      background: isDragActive ? 'rgba(139,92,246,0.05)' : '#faf5ff'
    }),
    uploadIcon: { width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', color: 'white', boxShadow: '0 6px 20px rgba(139,92,246,0.35)' },
    uploadTitle: { fontSize: '1rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.35rem' },
    uploadSubtitle: { color: '#6b7280', marginBottom: '0.75rem', fontSize: '0.75rem' },
    uploadButton: { padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 3px 12px rgba(139,92,246,0.3)', fontSize: '0.8rem' },
    fileInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', background: '#f5f3ff', borderRadius: '10px', marginTop: '0.75rem', border: '1px solid #ede9fe' },
    fileIcon: { width: '36px', height: '36px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E073F', boxShadow: '0 2px 6px rgba(139,92,246,0.15)' },
    fileName: { fontWeight: 600, color: '#1f2937', fontSize: '0.85rem' },
    fileSize: { fontSize: '0.72rem', color: '#6b7280' },
    analyzingState: { textAlign: 'center', padding: '2rem' },
    spinner: { width: '50px', height: '50px', border: '3px solid #ede9fe', borderTop: '3px solid #2E073F', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' },
    resultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1rem' },
    scoreCard: { background: 'white', borderRadius: '14px', padding: '0.85rem', boxShadow: '0 3px 15px rgba(139,92,246,0.08)', textAlign: 'center', border: '1px solid #ede9fe' },
    scoreCircle: (score) => ({
      width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: score >= 80 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : score >= 60 ? 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white',
      boxShadow: score >= 80 ? '0 6px 15px rgba(16,185,129,0.3)' : score >= 60 ? '0 6px 15px rgba(139,92,246,0.3)' : '0 6px 15px rgba(245,158,11,0.3)'
    }),
    scoreValue: { fontSize: '1.4rem', fontWeight: 700 },
    scoreLabel: { fontSize: '0.6rem', opacity: 0.9 },
    cardTitle: { fontWeight: 600, color: '#1f2937', marginBottom: '0.15rem', fontSize: '0.85rem' },
    cardSubtitle: { fontSize: '0.72rem', color: '#6b7280' },
    section: { background: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 3px 15px rgba(139,92,246,0.08)', marginBottom: '0.85rem', border: '1px solid #ede9fe' },
    sectionTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' },
    skillsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    skillsColumn: {},
    skillsLabel: { fontWeight: 600, color: '#1f2937', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' },
    skillsList: { display: 'flex', flexWrap: 'wrap', gap: '0.35rem' },
    skillTag: (type) => ({
      padding: '0.25rem 0.65rem', borderRadius: '15px', fontSize: '0.7rem', fontWeight: 500,
      background: type === 'found' ? '#d1fae5' : '#fee2e2', color: type === 'found' ? '#059669' : '#dc2626'
    }),
    suggestionsList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    suggestionItem: (type) => ({
      display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px',
      background: type === 'success' ? '#f0fdf4' : type === 'warning' ? '#fffbeb' : '#faf5ff',
      border: `1px solid ${type === 'success' ? '#bbf7d0' : type === 'warning' ? '#fde68a' : '#ede9fe'}`
    }),
    suggestionIcon: (type) => ({
      width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : 'linear-gradient(135deg, #2E073F, #2E073F)', color: 'white'
    }),
    suggestionTitle: { fontWeight: 600, color: '#1f2937', marginBottom: '0.15rem', fontSize: '0.8rem' },
    suggestionDesc: { fontSize: '0.72rem', color: '#6b7280' },
    actionsRow: { display: 'flex', gap: '0.75rem', justifyContent: 'center' },
    actionButton: (primary) => ({
      padding: '0.5rem 0.85rem', borderRadius: '10px', border: primary ? 'none' : '2px solid #ede9fe',
      background: primary ? 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)' : 'white',
      color: primary ? 'white' : '#374151', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
      boxShadow: primary ? '0 3px 12px rgba(139,92,246,0.3)' : 'none', fontSize: '0.75rem'
    })
  };

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={styles.title}>AI Resume Analyzer</h1>
        <p style={styles.subtitle}>Upload your resume for real-time ATS scoring and skill extraction</p>
      </motion.div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} /> {error}
        </motion.div>
      )}

      {!analyzed ? (
        <motion.div style={styles.uploadSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {!analyzing ? (
            <div {...getRootProps()} style={styles.dropzone(isDragActive)}>
              <input {...getInputProps()} />
              <div style={styles.uploadIcon}><Upload size={36} /></div>
              <h3 style={styles.uploadTitle}>{isDragActive ? 'Drop your resume here' : 'Upload Your Resume'}</h3>
              <p style={styles.uploadSubtitle}>Drag & drop your resume or click to browse. PDF format supported. Max 5MB.</p>
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
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Extracting skills, computing ATS score, and checking formatting</p>
              <div style={{ width: '200px', height: '6px', background: '#ede9fe', borderRadius: '3px', margin: '0 auto', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(135deg, #2E073F, #7c3aed)', borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.5rem' }}>{progress}% complete</p>
            </div>
          )}
        </motion.div>
      ) : analysisResults && (
        <>
          {/* Score Cards */}
          <div style={styles.resultsGrid}>
            {[
              { score: analysisResults.atsScore || 0, label: 'ATS Score', subtitle: 'Overall compatibility' },
              { score: analysisResults.skillMatchScore || 0, label: 'Skill Match', subtitle: `${analysisResults.parsedSkills?.length || 0} skills found` },
              { score: analysisResults.formattingScore || 0, label: 'Formatting', subtitle: 'Layout quality' },
              { score: analysisResults.keywordScore || 0, label: 'Keywords', subtitle: 'Industry terms' }
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

          {/* Skills Found */}
          {analysisResults.parsedSkills && analysisResults.parsedSkills.length > 0 && (
            <motion.div style={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h3 style={styles.sectionTitle}><Code size={22} color="#2E073F" /> Skills Extracted ({analysisResults.parsedSkills.length})</h3>
              <div style={styles.skillsList}>
                {analysisResults.parsedSkills.map(skill => <span key={skill} style={styles.skillTag('found')}>{skill}</span>)}
              </div>
            </motion.div>
          )}

          {/* Education */}
          {analysisResults.parsedEducation && analysisResults.parsedEducation.length > 0 && (
            <motion.div style={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <h3 style={styles.sectionTitle}><GraduationCap size={22} color="#2E073F" /> Education</h3>
              {analysisResults.parsedEducation.map((edu, i) => (
                <div key={i} style={{ padding: '0.5rem 0', borderBottom: i < analysisResults.parsedEducation.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1f2937' }}>{edu.degree || 'Degree'} {edu.field ? `in ${edu.field}` : ''}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{edu.institution} {edu.year ? `(${edu.year})` : ''} {edu.grade ? `• ${edu.grade}` : ''}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Experience */}
          {analysisResults.parsedExperience && analysisResults.parsedExperience.length > 0 && (
            <motion.div style={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h3 style={styles.sectionTitle}><Briefcase size={22} color="#2E073F" /> Experience</h3>
              {analysisResults.parsedExperience.map((exp, i) => (
                <div key={i} style={{ padding: '0.5rem 0', borderBottom: i < analysisResults.parsedExperience.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1f2937' }}>{exp.role || exp.company || 'Role'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{exp.company} {exp.duration ? `• ${exp.duration}` : ''}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Projects */}
          {analysisResults.parsedProjects && analysisResults.parsedProjects.length > 0 && (
            <motion.div style={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <h3 style={styles.sectionTitle}><BookOpen size={22} color="#2E073F" /> Projects ({analysisResults.parsedProjects.length})</h3>
              {analysisResults.parsedProjects.map((proj, i) => (
                <div key={i} style={{ padding: '0.5rem 0', borderBottom: i < analysisResults.parsedProjects.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1f2937' }}>{proj.name}</div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {proj.technologies.map(t => <span key={t} style={{ padding: '0.15rem 0.4rem', background: '#f5f3ff', borderRadius: '10px', fontSize: '0.65rem', color: '#2E073F' }}>{t}</span>)}
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}

          {/* Certifications */}
          {analysisResults.parsedCertifications && analysisResults.parsedCertifications.length > 0 && (
            <motion.div style={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h3 style={styles.sectionTitle}><Award size={22} color="#2E073F" /> Certifications ({analysisResults.parsedCertifications.length})</h3>
              {analysisResults.parsedCertifications.map((cert, i) => (
                <div key={i} style={{ padding: '0.5rem 0' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1f2937' }}>{cert.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{cert.issuer} {cert.date ? `• ${cert.date}` : ''}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Improvement Suggestions */}
          {analysisResults.improvementSuggestions && analysisResults.improvementSuggestions.length > 0 && (
            <motion.div style={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <h3 style={styles.sectionTitle}><Zap size={22} color="#2E073F" /> Improvement Suggestions</h3>
              <div style={styles.suggestionsList}>
                {analysisResults.improvementSuggestions.map((suggestion, index) => {
                  const type = getSuggestionType(suggestion);
                  return (
                    <div key={index} style={styles.suggestionItem(type)}>
                      <div style={styles.suggestionIcon(type)}>
                        {type === 'success' ? <CheckCircle size={18} /> : type === 'warning' ? <AlertTriangle size={18} /> : <TrendingUp size={18} />}
                      </div>
                      <div>
                        <div style={styles.suggestionTitle}>{suggestion.type?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Suggestion'}</div>
                        <div style={styles.suggestionDesc}>{suggestion.message}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Word Count Info */}
          {analysisResults.wordCount && (
            <motion.div style={{ ...styles.section, background: '#faf5ff' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2E073F' }}>{analysisResults.wordCount}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Words</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2E073F' }}>{analysisResults.parsedSkills?.length || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Skills</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2E073F' }}>{analysisResults.parsedProjects?.length || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Projects</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2E073F' }}>{analysisResults.parsedCertifications?.length || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Certifications</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div style={styles.actionsRow}>
            <button style={styles.actionButton(false)} onClick={() => { setAnalyzed(false); setFile(null); setAnalysisResults(null); setError(''); setProgress(0); }}><RefreshCw size={18} /> Upload New Resume</button>
            <button style={styles.actionButton(true)} onClick={() => navigate('/jobs')}><Briefcase size={18} /> View Matched Jobs</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
