import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck, Clock, Award, CheckCircle, Play, Lock,
  Star, TrendingUp, Target, Timer, Trophy,
  Camera, AlertTriangle, X, Eye, ArrowLeft, Video, Ban, Users,
  Smartphone, ShieldAlert, Wifi, UserX, AlertCircle
} from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as blazeface from '@tensorflow-models/blazeface';
import useAssessmentStore from '../store/assessmentStore';

const Assessments = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showProctorSetup, setShowProctorSetup] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showResults, setShowResults] = useState(null);
  const [testTerminated, setTestTerminated] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState({ faces: 0, phone: false, person: 0, books: false, headphones: false });
  const [noFaceTimer, setNoFaceTimer] = useState(0);
  const [setupDetectionStatus, setSetupDetectionStatus] = useState({ faces: 0, phone: false, person: 0, books: false, headphones: false });
  const [testCameraReady, setTestCameraReady] = useState(false);
  const [testStartTime, setTestStartTime] = useState(null);
  const [assessmentsList, setAssessmentsList] = useState([]);
  
  // Assessment store for real-time updates
  const { addCompletedAssessment, addTerminatedAssessment, completedAssessments, fetchAssessments, getStats } = useAssessmentStore();
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const setupDetectionIntervalRef = useRef(null); // For setup preview detection
  const cocoModelRef = useRef(null);
  const faceModelRef = useRef(null);

  // Ref for test video element
  const testVideoRef = useRef(null);
  
  // Fetch completed assessments from store on mount
  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  // Effect to connect camera stream when test starts
  useEffect(() => {
    if (testStarted && !testTerminated && !testCameraReady) {
      console.log('Test started - connecting camera stream...');
      
      const connectCamera = async () => {
        const videoElement = testVideoRef.current;
        if (!videoElement) {
          console.log('Video element not ready, retrying...');
          setTimeout(connectCamera, 100);
          return;
        }
        
        try {
          // Always get a fresh stream for the test
          let stream = streamRef.current;
          
          // Check if we need a new stream
          if (!stream || stream.getTracks().length === 0 || stream.getTracks()[0].readyState !== 'live') {
            console.log('Getting fresh camera stream...');
            stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: 'user', width: 640, height: 480 } 
            });
            streamRef.current = stream;
          }
          
          // Connect stream to video element
          videoElement.srcObject = stream;
          
          // Wait for video to be ready
          videoElement.onloadedmetadata = async () => {
            try {
              await videoElement.play();
              console.log('Test camera connected and playing!');
              setTestCameraReady(true);
              setTimeout(() => startDetection(), 500);
            } catch (err) {
              console.error('Play failed:', err);
              setTimeout(connectCamera, 300);
            }
          };
          
          // Force play if already loaded
          if (videoElement.readyState >= 2) {
            try {
              await videoElement.play();
              console.log('Test camera already loaded, now playing!');
              setTestCameraReady(true);
              setTimeout(() => startDetection(), 500);
            } catch (err) {
              console.error('Direct play failed:', err);
            }
          }
        } catch (err) {
          console.error('Error connecting camera:', err);
          setTimeout(connectCamera, 500);
        }
      };
      
      // Small delay to ensure DOM is ready
      setTimeout(connectCamera, 200);
    }
  }, [testStarted, testTerminated, testCameraReady]);

  const categories = ['all', 'recommended', 'completed', 'in progress', 'technical', 'aptitude'];

  // Base assessments - will be merged with completed ones from store
  const baseAssessments = [
    { id: 1, title: 'JavaScript Proficiency', category: 'technical', duration: '45 mins', questions: 10, difficulty: 'Intermediate', status: 'available', badge: 'JavaScript Expert' },
    { id: 2, title: 'React.js Assessment', category: 'technical', duration: '60 mins', questions: 10, difficulty: 'Advanced', status: 'available', recommended: true, badge: 'React Master' },
    { id: 3, title: 'Data Structures & Algorithms', category: 'technical', duration: '90 mins', questions: 10, difficulty: 'Advanced', status: 'available', recommended: true, badge: 'DSA Expert' },
    { id: 4, title: 'System Design Basics', category: 'technical', duration: '60 mins', questions: 10, difficulty: 'Intermediate', status: 'available', recommended: true, badge: 'System Architect' },
    { id: 5, title: 'Logical Reasoning', category: 'aptitude', duration: '30 mins', questions: 10, difficulty: 'Beginner', status: 'available', badge: 'Logic Master' },
    { id: 6, title: 'Problem Solving', category: 'aptitude', duration: '45 mins', questions: 10, difficulty: 'Intermediate', status: 'available', badge: 'Problem Solver' },
    { id: 7, title: 'Node.js Backend', category: 'technical', duration: '50 mins', questions: 10, difficulty: 'Intermediate', status: 'available', badge: 'Node.js Pro' },
    { id: 8, title: 'AWS Cloud Practitioner', category: 'technical', duration: '90 mins', questions: 10, difficulty: 'Intermediate', status: 'available', badge: 'AWS Certified' }
  ];
  
  // Merge base assessments with completed ones from store
  const assessments = baseAssessments.map(baseAssessment => {
    const completed = completedAssessments.find(c => c.title === baseAssessment.title && c.status === 'completed');
    if (completed) {
      return {
        ...baseAssessment,
        status: 'completed',
        score: completed.score || 0,
        correctAnswers: completed.correctAnswers || 0,
        totalQuestions: completed.totalQuestions || baseAssessment.questions,
        timeTaken: completed.timeTaken || 'N/A',
        completedDate: completed.completedAt ? new Date(completed.completedAt).toLocaleDateString() : 'Recently',
        percentile: Math.min(99, Math.max(50, completed.score || 0))
      };
    }
    return baseAssessment;
  });
  
  // Get real stats from store
  const storeStats = getStats();

  const viewResults = (assessment) => {
    setShowResults(assessment);
  };

  const sampleQuestions = [
    { id: 1, question: 'What is the output of console.log(typeof null)?', options: ['null', 'undefined', 'object', 'string'], correct: 2 },
    { id: 2, question: 'Which method creates a shallow copy of an array?', options: ['slice()', 'splice()', 'split()', 'shift()'], correct: 0 },
    { id: 3, question: 'What is closure in JavaScript?', options: ['A function that returns another function', 'A function with access to outer scope variables', 'A function that closes the program', 'An IIFE'], correct: 1 },
    { id: 4, question: 'Which is NOT a primitive data type in JavaScript?', options: ['string', 'number', 'array', 'boolean'], correct: 2 },
    { id: 5, question: 'What does "use strict" do?', options: ['Enables strict mode for type checking', 'Enforces stricter parsing and error handling', 'Makes variables immutable', 'Enables TypeScript mode'], correct: 1 },
    { id: 6, question: 'What is the purpose of Promise.all()?', options: ['Execute promises sequentially', 'Wait for all promises to resolve', 'Cancel all pending promises', 'Create a new promise'], correct: 1 },
    { id: 7, question: 'Which hook is used for side effects in React?', options: ['useState', 'useEffect', 'useContext', 'useMemo'], correct: 1 },
    { id: 8, question: 'What does CSS Flexbox primarily handle?', options: ['3D animations', 'One-dimensional layouts', 'Database connections', 'Server rendering'], correct: 1 },
    { id: 9, question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2 },
    { id: 10, question: 'Which HTTP method is idempotent?', options: ['POST', 'PATCH', 'GET', 'None of these'], correct: 2 }
  ];

  // Stats using real data from store
  const stats = [
    { icon: Trophy, label: 'Assessments Completed', value: storeStats.completedCount.toString(), color: '#f59e0b' },
    { icon: Star, label: 'Average Score', value: `${storeStats.averageScore}%`, color: '#10b981' },
    { icon: Award, label: 'Badges Earned', value: storeStats.badgesCount.toString(), color: '#7c3aed' },
    { icon: TrendingUp, label: 'Total Attempts', value: storeStats.totalAttempts.toString(), color: '#ec4899' }
  ];

  // Load TensorFlow.js models
  const loadModels = async () => {
    setLoadingModels(true);
    try {
      await tf.ready();
      console.log('TensorFlow.js ready');
      
      // Load COCO-SSD for object detection (phones, multiple persons)
      cocoModelRef.current = await cocoSsd.load({
        base: 'lite_mobilenet_v2'
      });
      console.log('COCO-SSD model loaded');
      
      // Load BlazeFace for fast face detection
      faceModelRef.current = await blazeface.load();
      console.log('BlazeFace model loaded');
      
      setModelsLoaded(true);
      
      // Start setup detection after models are loaded
      startSetupDetection();
    } catch (err) {
      console.error('Error loading models:', err);
      setCameraError('Failed to load AI detection models. Please refresh the page.');
    }
    setLoadingModels(false);
  };

  // Setup preview detection - runs during camera setup to show face detection preview
  const startSetupDetection = () => {
    if (setupDetectionIntervalRef.current) {
      clearInterval(setupDetectionIntervalRef.current);
    }
    
    setupDetectionIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !videoRef.current.videoWidth || !faceModelRef.current) return;
      
      try {
        const video = videoRef.current;
        
        // Run face detection for preview
        if (faceModelRef.current) {
          const faces = await faceModelRef.current.estimateFaces(video, false);
          setSetupDetectionStatus(prev => ({ ...prev, faces: faces.length }));
        }
        
        // Run COCO-SSD for person/phone/books detection preview
        if (cocoModelRef.current) {
          const predictions = await cocoModelRef.current.detect(video);
          const persons = predictions.filter(p => p.class === 'person').length;
          const phones = predictions.filter(p => p.class === 'cell phone' || p.class === 'remote' || p.class === 'mouse').length > 0;
          const books = predictions.filter(p => p.class === 'book' || p.class === 'laptop' || p.class === 'keyboard').length > 0;
          setSetupDetectionStatus(prev => ({ ...prev, person: persons, phone: phones, books: books }));
        }
      } catch (err) {
        console.error('Setup detection error:', err);
      }
    }, 800); // Slower interval for setup
  };

  const stopSetupDetection = () => {
    if (setupDetectionIntervalRef.current) {
      clearInterval(setupDetectionIntervalRef.current);
      setupDetectionIntervalRef.current = null;
    }
  };

  // Camera setup
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }, 
        audio: false 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      
      setCameraEnabled(true);
      setCameraError(null);
      
      // Load models after camera is enabled
      if (!modelsLoaded && !loadingModels) {
        loadModels();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Camera access denied. Please enable camera permissions in your browser settings and try again.');
      setCameraEnabled(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
  };

  // Terminate test with reason and save to store
  const terminateTest = useCallback(async (reason) => {
    setTestTerminated(reason);
    setTestStarted(false);
    stopDetection();
    // Save terminated assessment to store
    if (activeAssessment) {
      await addTerminatedAssessment(activeAssessment.title, reason);
    }
  }, [activeAssessment, addTerminatedAssessment]);

  // Tab switching detection - IMMEDIATE EXIT
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && testStarted && !testTerminated) {
      terminateTest('tab');
    }
  }, [testStarted, testTerminated, terminateTest]);

  // Stop detection
  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  // Advanced AI-powered detection
  const startDetection = useCallback(async () => {
    if (!testVideoRef.current || !modelsLoaded) {
      console.log('Detection not started - video or models not ready');
      return;
    }
    
    const video = testVideoRef.current;
    let consecutiveNoFace = 0;
    
    console.log('Starting AI detection...');
    
    // Detection loop
    detectionIntervalRef.current = setInterval(async () => {
      if (!video.videoWidth || !testStarted || testTerminated) {
        return;
      }
      
      try {
        // Run COCO-SSD detection for objects (phones, persons, books, etc.)
        if (cocoModelRef.current) {
          const predictions = await cocoModelRef.current.detect(video);
          
          console.log('All detections:', predictions.map(p => `${p.class} (${Math.round(p.score * 100)}%)`));
          
          // Count persons
          const persons = predictions.filter(p => p.class === 'person');
          const personCount = persons.length;
          
          // Detect phones/cell phones/remotes/electronic devices
          const phones = predictions.filter(p => 
            p.class === 'cell phone' || 
            p.class === 'remote' ||
            p.class === 'mouse'
          );
          
          // Detect headphones/earbuds (COCO detects as various classes)
          const audioDevices = predictions.filter(p => 
            p.class === 'headphones' ||
            p.class === 'earbuds' ||
            p.class === 'sports ball' // Sometimes earbuds detected as small round objects
          );
          
          // Detect books, papers, notebooks, laptops (suspicious reading materials)
          const suspiciousItems = predictions.filter(p => 
            p.class === 'book' || 
            p.class === 'laptop' ||
            p.class === 'keyboard' ||
            p.class === 'tv' ||
            p.class === 'monitor' ||
            p.class === 'paper' ||
            p.class === 'notebook' ||
            p.class === 'tablet' ||
            p.class === 'scissors' || // Writing tools area
            p.class === 'clock' ||
            p.class === 'watch' ||
            p.class === 'handbag' ||
            p.class === 'backpack' ||
            p.class === 'suitcase'
          );
          
          setDetectionStatus(prev => ({
            ...prev,
            person: personCount,
            phone: phones.length > 0,
            books: suspiciousItems.length > 0,
            headphones: audioDevices.length > 0
          }));
          
          console.log('COCO Detection:', { 
            persons: personCount, 
            phones: phones.length, 
            audioDevices: audioDevices.length,
            suspicious: suspiciousItems.map(s => s.class)
          });
          
          // TERMINATE if multiple persons detected
          if (personCount > 1) {
            console.log('Multiple persons detected:', personCount);
            terminateTest('multiperson');
            return;
          }
          
          // TERMINATE if phone or audio device detected
          if (phones.length > 0) {
            console.log('Phone detected:', phones.map(p => p.class));
            terminateTest('phone');
            return;
          }
          
          // TERMINATE if headphones/earbuds detected
          if (audioDevices.length > 0) {
            console.log('Audio device detected:', audioDevices.map(a => a.class));
            terminateTest('headphones');
            return;
          }
          
          // TERMINATE if books/suspicious items detected
          if (suspiciousItems.length > 0) {
            console.log('Suspicious items detected:', suspiciousItems.map(s => s.class));
            terminateTest('books');
            return;
          }
        }
        
        // Run BlazeFace detection for faces
        if (faceModelRef.current) {
          const faces = await faceModelRef.current.estimateFaces(video, false);
          const faceCountDetected = faces.length;
          
          setDetectionStatus(prev => ({ ...prev, faces: faceCountDetected }));
          
          console.log('Face Detection:', { faces: faceCountDetected });
          
          // TERMINATE if multiple faces detected
          if (faceCountDetected > 1) {
            console.log('Multiple faces detected:', faceCountDetected);
            terminateTest('faces');
            return;
          }
          
          // Track no-face duration
          if (faceCountDetected === 0) {
            consecutiveNoFace++;
            setNoFaceTimer(consecutiveNoFace);
            // TERMINATE if no face for 10 consecutive checks (5 seconds)
            if (consecutiveNoFace >= 10) {
              console.log('No face detected for too long');
              terminateTest('noface');
              return;
            }
          } else {
            consecutiveNoFace = 0;
            setNoFaceTimer(0);
          }
        }
        
      } catch (err) {
        console.error('Detection error:', err);
      }
    }, 500); // Check every 500ms
    
  }, [testStarted, testTerminated, modelsLoaded, terminateTest]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also detect window blur
    const handleBlur = () => {
      if (testStarted && !testTerminated) {
        terminateTest('tab');
      }
    };
    window.addEventListener('blur', handleBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      stopCamera();
      stopDetection();
      stopSetupDetection();
    };
  }, [handleVisibilityChange, testStarted, testTerminated, terminateTest]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (testStarted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testStarted, timeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startAssessment = (assessment) => {
    setActiveAssessment(assessment);
    setShowProctorSetup(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setTimeRemaining(parseInt(assessment.duration) * 60);
    setNoFaceTimer(0);
    setTestStartTime(null);
  };

  const beginTest = () => {
    setShowProctorSetup(false);
    setTestStarted(true);
    setTestTerminated(null);
    setTestCameraReady(false);
    setTestStartTime(Date.now());
    stopSetupDetection(); // Stop setup detection
  };

  // Submit test and calculate results
  const submitTest = async () => {
    if (!activeAssessment) return;
    
    // Calculate score
    let correctCount = 0;
    sampleQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correct) {
        correctCount++;
      }
    });
    
    const totalQuestions = sampleQuestions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const timeTaken = testStartTime 
      ? `${Math.round((Date.now() - testStartTime) / 60000)} mins` 
      : 'N/A';
    
    const result = {
      title: activeAssessment.title,
      score,
      correctAnswers: correctCount,
      totalQuestions,
      timeTaken,
      badge: score >= 70 ? activeAssessment.badge : null,
      status: 'completed',
      percentile: Math.min(99, Math.max(50, score))
    };
    
    // Save to store (this will also try to save to backend)
    await addCompletedAssessment(result);
    
    // Show results
    setShowResults({
      ...result,
      completedDate: 'Just now'
    });
    
    // Clean up test
    stopCamera();
    stopDetection();
    stopSetupDetection();
    if (testVideoRef.current) {
      testVideoRef.current.srcObject = null;
    }
    setActiveAssessment(null);
    setTestStarted(false);
    setShowProctorSetup(false);
    setTestCameraReady(false);
    setDetectionStatus({ faces: 0, phone: false, person: 0, books: false, headphones: false });
    setSetupDetectionStatus({ faces: 0, phone: false, person: 0, books: false, headphones: false });
    setNoFaceTimer(0);
  };

  // Effect to handle test camera when test starts
  const closeTest = () => {
    stopCamera();
    stopDetection();
    stopSetupDetection();
    // Clean up test video ref
    if (testVideoRef.current) {
      testVideoRef.current.srcObject = null;
    }
    setActiveAssessment(null);
    setTestStarted(false);
    setShowProctorSetup(false);
    setTestTerminated(null);
    setTestCameraReady(false);
    setDetectionStatus({ faces: 0, phone: false, person: 0, books: false, headphones: false });
    setSetupDetectionStatus({ faces: 0, phone: false, person: 0, books: false, headphones: false });
    setNoFaceTimer(0);
  };
  
  // Handle test termination with store update
  const handleTestTermination = async (reason) => {
    if (activeAssessment) {
      await addTerminatedAssessment(activeAssessment.title, reason);
    }
  };

  const handleAnswer = (questionId, optionIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const styles = {
    container: { padding: '1rem', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: '1rem' },
    title: { fontSize: '1.4rem', fontWeight: 700, background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.3rem' },
    subtitle: { color: '#6b7280', fontSize: '0.75rem' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' },
    statCard: { background: 'white', borderRadius: '12px', padding: '0.85rem', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #ede9fe' },
    statIcon: (color) => ({ width: '36px', height: '36px', borderRadius: '10px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    statValue: { fontSize: '1.1rem', fontWeight: 700, color: '#1f2937' },
    statLabel: { fontSize: '0.65rem', color: '#6b7280' },
    categoriesRow: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
    categoryChip: (active) => ({ padding: '0.35rem 0.85rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.72rem', transition: 'all 0.2s', background: active ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' : '#f5f3ff', color: active ? 'white' : '#7c3aed', textTransform: 'capitalize' }),
    assessmentsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
    assessmentCard: (status) => ({ background: status === 'locked' ? '#faf5ff' : 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 3px 15px rgba(139, 92, 246, 0.08)', border: '1px solid #ede9fe', transition: 'all 0.3s', opacity: status === 'locked' ? 0.7 : 1 }),
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
    cardIcon: (status) => ({ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: status === 'completed' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : status === 'in-progress' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : status === 'locked' ? '#ede9fe' : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', color: status === 'locked' ? '#a78bfa' : 'white' }),
    statusBadge: (status) => ({ padding: '0.25rem 0.6rem', borderRadius: '15px', fontSize: '0.6rem', fontWeight: 600, background: status === 'completed' ? '#d1fae5' : status === 'in-progress' ? '#fef3c7' : status === 'locked' ? '#f5f3ff' : '#ede9fe', color: status === 'completed' ? '#059669' : status === 'in-progress' ? '#d97706' : status === 'locked' ? '#a78bfa' : '#7c3aed' }),
    recommendedBadge: { padding: '0.15rem 0.45rem', borderRadius: '10px', fontSize: '0.6rem', fontWeight: 600, background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#78350f', marginLeft: '0.35rem' },
    cardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' },
    metaRow: { display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', color: '#6b7280' },
    difficultyBadge: (diff) => ({ padding: '0.15rem 0.45rem', borderRadius: '10px', fontSize: '0.6rem', fontWeight: 600, background: diff === 'Advanced' ? '#fee2e2' : diff === 'Intermediate' ? '#fef3c7' : '#d1fae5', color: diff === 'Advanced' ? '#dc2626' : diff === 'Intermediate' ? '#d97706' : '#059669' }),
    progressSection: { marginBottom: '0.75rem' },
    progressLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.65rem' },
    progressBar: { height: '6px', background: '#ede9fe', borderRadius: '3px', overflow: 'hidden' },
    progressFill: (progress) => ({ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)', borderRadius: '3px' }),
    scoreSection: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', background: '#f0fdf4', borderRadius: '10px', marginBottom: '0.75rem' },
    scoreCircle: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem' },
    badgeInfo: { display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: 600, fontSize: '0.72rem' },
    lockMessage: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem', background: '#f5f3ff', borderRadius: '8px', fontSize: '0.65rem', color: '#7c3aed', marginBottom: '0.75rem' },
    actionButton: (status) => ({ width: '100%', padding: '0.6rem', borderRadius: '10px', fontWeight: 600, cursor: status === 'locked' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', background: status === 'completed' ? 'white' : status === 'in-progress' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : status === 'locked' ? '#ede9fe' : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', color: status === 'completed' ? '#7c3aed' : status === 'locked' ? '#a78bfa' : 'white', border: status === 'completed' ? '2px solid #7c3aed' : 'none', boxShadow: status !== 'locked' && status !== 'completed' ? '0 3px 12px rgba(139, 92, 246, 0.3)' : 'none', fontSize: '0.75rem' }),
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
    setupModal: { background: 'white', borderRadius: '16px', padding: '1.25rem', width: '100%', maxWidth: '450px', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' },
    testModal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)', display: 'flex', flexDirection: 'column', zIndex: 1001, overflow: 'hidden' },
    testHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1rem', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', flexShrink: 0 },
    testBody: { flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0, maxHeight: 'calc(100vh - 50px)' },
    questionPanel: { flex: 1, padding: '1rem', overflowY: 'auto', maxWidth: 'calc(100% - 220px)' },
    sidePanel: { width: '220px', background: 'white', padding: '0.75rem', borderLeft: '1px solid #ede9fe', display: 'flex', flexDirection: 'column', overflowY: 'auto', flexShrink: 0 },
    cameraPreview: { width: '100%', height: '120px', background: '#1f2937', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.75rem', flexShrink: 0, position: 'relative' },
    cameraVideo: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' },
    warningBanner: { position: 'fixed', top: 0, left: 0, right: 0, padding: '0.6rem 1rem', background: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', zIndex: 2000, fontSize: '0.85rem' },
    questionCard: { background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)', marginBottom: '0.75rem', border: '1px solid #ede9fe' },
    questionText: { fontSize: '1rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem', lineHeight: 1.5 },
    optionsList: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
    optionBtn: (selected) => ({ padding: '0.7rem 0.875rem', borderRadius: '8px', border: selected ? '2px solid #7c3aed' : '1px solid #ede9fe', background: selected ? '#f5f3ff' : 'white', textAlign: 'left', cursor: 'pointer', fontWeight: 500, color: '#374151', transition: 'all 0.2s', fontSize: '0.9rem' }),
    navButtons: { display: 'flex', gap: '0.75rem', marginTop: '0.75rem' },
    navBtn: (primary) => ({ flex: 1, padding: '0.7rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', background: primary ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : '#ede9fe', color: primary ? 'white' : '#7c3aed', fontSize: '0.9rem' }),
    proctorCheck: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem', background: '#faf5ff', borderRadius: '8px', marginBottom: '0.4rem', fontSize: '0.85rem' },
    checkIcon: (ok) => ({ color: ok ? '#10b981' : '#dc2626' }),
    statItem: { display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #ede9fe', fontSize: '0.75rem' },
    warningBox: { padding: '0.5rem', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', marginTop: '0.5rem' },
    resultsModal: { background: 'white', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '420px', textAlign: 'center', maxHeight: '85vh', overflowY: 'auto' },
    resultsHeader: { marginBottom: '1rem' },
    resultsScore: { width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' },
    resultsScoreValue: { fontSize: '2rem', fontWeight: 700 },
    resultsScoreLabel: { fontSize: '0.75rem', opacity: 0.9 },
    resultsBadge: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '20px', color: '#78350f', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem' },
    resultsStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' },
    resultsStat: { padding: '0.75rem', background: '#faf5ff', borderRadius: '10px' },
    resultsStatValue: { fontSize: '1.1rem', fontWeight: 700, color: '#1f2937' },
    resultsStatLabel: { fontSize: '0.7rem', color: '#6b7280' },
    resultsBtn: { width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' },
    detectionIndicator: (status) => ({
      display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.6rem', 
      borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600,
      background: status === 'ok' ? '#d1fae5' : status === 'warning' ? '#fef3c7' : '#fee2e2',
      color: status === 'ok' ? '#059669' : status === 'warning' ? '#d97706' : '#dc2626'
    }),
    proctorStatusBox: {
      background: '#f9fafb', borderRadius: '10px', padding: '0.75rem', marginBottom: '0.75rem', border: '1px solid #e5e7eb'
    }
  };

  const filteredAssessments = assessments.filter(a => {
    if (selectedCategory === 'recommended') return a.recommended;
    if (selectedCategory === 'completed') return a.status === 'completed';
    if (selectedCategory === 'in progress') return a.status === 'in-progress';
    if (selectedCategory === 'technical' || selectedCategory === 'aptitude') return a.category === selectedCategory;
    return true;
  });

  return (
    <div style={styles.container}>
      <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={styles.title}>Skill Assessments</h1>
        <p style={styles.subtitle}>Validate your skills and earn verified badges</p>
      </motion.div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <motion.div key={stat.label} style={styles.statCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <div style={styles.statIcon(stat.color)}><stat.icon size={24} /></div>
            <div><div style={styles.statValue}>{stat.value}</div><div style={styles.statLabel}>{stat.label}</div></div>
          </motion.div>
        ))}
      </div>

      {/* Categories */}
      <div style={styles.categoriesRow}>
        {categories.map(cat => (
          <motion.button key={cat} style={styles.categoryChip(selectedCategory === cat)} onClick={() => setSelectedCategory(cat)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Assessments Grid */}
      <div style={styles.assessmentsGrid}>
        {filteredAssessments.map((assessment, index) => (
          <motion.div key={assessment.id} style={styles.assessmentCard(assessment.status)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={assessment.status !== 'locked' ? { transform: 'translateY(-4px)', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' } : {}}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon(assessment.status)}>
                {assessment.status === 'completed' ? <CheckCircle size={24} /> : assessment.status === 'in-progress' ? <Timer size={24} /> : assessment.status === 'locked' ? <Lock size={24} /> : <ClipboardCheck size={24} />}
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={styles.statusBadge(assessment.status)}>{assessment.status === 'in-progress' ? 'In Progress' : assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}</span>
                {assessment.recommended && <span style={styles.recommendedBadge}>★ Recommended</span>}
              </div>
            </div>

            <h3 style={styles.cardTitle}>{assessment.title}</h3>

            <div style={styles.metaRow}>
              <span style={styles.metaItem}><Clock size={14} /> {assessment.duration}</span>
              <span style={styles.metaItem}><Target size={14} /> {assessment.questions} questions</span>
              <span style={styles.difficultyBadge(assessment.difficulty)}>{assessment.difficulty}</span>
            </div>

            {assessment.status === 'in-progress' && (
              <div style={styles.progressSection}>
                <div style={styles.progressLabel}>
                  <span style={{ color: '#6b7280' }}>Progress: {assessment.progress}%</span>
                  <span style={{ color: '#d97706', fontWeight: 600 }}>{assessment.timeLeft} left</span>
                </div>
                <div style={styles.progressBar}><div style={styles.progressFill(assessment.progress)} /></div>
              </div>
            )}

            {assessment.status === 'completed' && (
              <div style={styles.scoreSection}>
                <div style={styles.scoreCircle}>{assessment.score}%</div>
                <div>
                  <div style={styles.badgeInfo}><Award size={16} /> {assessment.badge}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Completed {assessment.completedDate}</div>
                </div>
              </div>
            )}

            {assessment.status === 'locked' && (
              <div style={styles.lockMessage}><Lock size={14} /> {assessment.unlockRequirement}</div>
            )}

            <button style={styles.actionButton(assessment.status)} disabled={assessment.status === 'locked'} onClick={() => {
              if (assessment.status === 'completed') viewResults(assessment);
              else if (assessment.status === 'available') startAssessment(assessment);
              else if (assessment.status === 'in-progress') startAssessment(assessment);
            }}>
              {assessment.status === 'completed' ? <><Eye size={16} /> View Results</> : assessment.status === 'in-progress' ? <><Play size={16} /> Continue</> : assessment.status === 'locked' ? <><Lock size={16} /> Locked</> : <><Play size={16} /> Start Assessment</>}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Proctor Setup Modal */}
      <AnimatePresence>
        {showProctorSetup && activeAssessment && (
          <motion.div style={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={styles.setupModal} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <ShieldAlert size={44} color="#7c3aed" style={{ marginBottom: '0.75rem' }} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem', color: '#1f2937' }}>AI Proctoring Setup</h2>
              <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.85rem' }}>Advanced monitoring for {activeAssessment.title}</p>

              {/* Camera Preview */}
              <div style={{ ...styles.cameraPreview, height: '160px', position: 'relative' }}>
                {cameraEnabled ? (
                  <>
                    <video ref={videoRef} autoPlay muted playsInline style={styles.cameraVideo} />
                    {modelsLoaded && (
                      <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={styles.detectionIndicator(setupDetectionStatus.faces === 1 ? 'ok' : setupDetectionStatus.faces === 0 ? 'warning' : 'error')}>
                          <Eye size={12} /> {setupDetectionStatus.faces === 1 ? 'Face OK' : setupDetectionStatus.faces === 0 ? 'No Face' : 'Multiple!'}
                        </span>
                        <span style={styles.detectionIndicator(setupDetectionStatus.person <= 1 ? 'ok' : 'error')}>
                          <Users size={12} /> {setupDetectionStatus.person <= 1 ? 'BG OK' : `${setupDetectionStatus.person}!`}
                        </span>
                        {setupDetectionStatus.phone && (
                          <span style={styles.detectionIndicator('error')}>
                            <Smartphone size={12} /> Phone!
                          </span>
                        )}
                        {setupDetectionStatus.books && (
                          <span style={styles.detectionIndicator('error')}>
                            📚 Books!
                          </span>
                        )}
                      </div>
                    )}
                    {!modelsLoaded && loadingModels && (
                      <div style={{ position: 'absolute', bottom: '8px', left: '8px', right: '8px', display: 'flex', gap: '0.5rem' }}>
                        <span style={styles.detectionIndicator('warning')}>
                          <Wifi size={12} /> Loading AI...
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                    <Video size={36} style={{ marginBottom: '0.25rem' }} />
                    <span style={{ fontSize: '0.8rem' }}>Camera preview</span>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {cameraError && (
                <div style={{ padding: '0.5rem', background: '#fef2f2', borderRadius: '6px', color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={14} />
                  {cameraError}
                </div>
              )}

              {/* Proctoring Features */}
              <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>AI Detection Features:</h4>
                
                <div style={styles.proctorCheck}>
                  <div style={styles.checkIcon(cameraEnabled)}>{cameraEnabled ? <CheckCircle size={18} /> : <X size={18} />}</div>
                  <span style={{ flex: 1 }}>Camera Access</span>
                  <button onClick={cameraEnabled ? stopCamera : startCamera} style={{ padding: '0.3rem 0.6rem', background: cameraEnabled ? '#fee2e2' : '#f5f3ff', color: cameraEnabled ? '#dc2626' : '#7c3aed', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem' }}>
                    {cameraEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>

                <div style={styles.proctorCheck}>
                  <div style={styles.checkIcon(modelsLoaded)}>{modelsLoaded ? <CheckCircle size={18} /> : loadingModels ? <div style={{ width: 18, height: 18, border: '2px solid #7c3aed', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} /> : <X size={18} />}</div>
                  <span style={{ flex: 1 }}>Face Detection AI</span>
                  <span style={{ color: modelsLoaded ? '#10b981' : '#d97706', fontWeight: 500, fontSize: '0.75rem' }}>
                    {modelsLoaded ? 'Ready' : loadingModels ? 'Loading...' : 'Pending'}
                  </span>
                </div>

                <div style={styles.proctorCheck}>
                  <div style={styles.checkIcon(modelsLoaded)}>{modelsLoaded ? <CheckCircle size={18} /> : <X size={18} />}</div>
                  <span style={{ flex: 1 }}>Multi-Person Detection</span>
                  <Users size={16} color="#7c3aed" />
                </div>

                <div style={styles.proctorCheck}>
                  <div style={styles.checkIcon(modelsLoaded)}>{modelsLoaded ? <CheckCircle size={18} /> : <X size={18} />}</div>
                  <span style={{ flex: 1 }}>Mobile Phone Detection</span>
                  <Smartphone size={16} color="#7c3aed" />
                </div>

                <div style={styles.proctorCheck}>
                  <CheckCircle size={18} color="#10b981" />
                  <span style={{ flex: 1 }}>Tab Switch Detection</span>
                  <span style={{ color: '#10b981', fontWeight: 500, fontSize: '0.75rem' }}>Active</span>
                </div>
              </div>

              {/* Strict Rules */}
              <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '10px', marginBottom: '1rem', border: '2px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#dc2626', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <ShieldAlert size={16} /> STRICT AI PROCTORING - ZERO TOLERANCE
                </div>
                <ul style={{ color: '#991b1b', fontSize: '0.75rem', textAlign: 'left', margin: 0, paddingLeft: '1rem', lineHeight: 1.6 }}>
                  <li><strong>📵 Phone Detected</strong> = IMMEDIATE TERMINATION (Score: 0)</li>
                  <li><strong>👥 Multiple Persons</strong> = IMMEDIATE TERMINATION (Score: 0)</li>
                  <li><strong>� Books/Paper/Laptop</strong> = IMMEDIATE TERMINATION (Score: 0)</li>
                  <li><strong>🙈 Face Not Visible (5 sec)</strong> = IMMEDIATE TERMINATION (Score: 0)</li>
                  <li><strong>🔄 Tab Switch / Window Change</strong> = IMMEDIATE TERMINATION (Score: 0)</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={closeTest} style={{ flex: 1, padding: '0.75rem', background: '#f5f3ff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', color: '#7c3aed' }}>Cancel</button>
                <button onClick={beginTest} disabled={!cameraEnabled || !modelsLoaded} style={{ flex: 2, padding: '0.75rem', background: cameraEnabled && modelsLoaded ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : '#ede9fe', color: cameraEnabled && modelsLoaded ? 'white' : '#a78bfa', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: cameraEnabled && modelsLoaded ? 'pointer' : 'not-allowed', fontSize: '0.9rem', boxShadow: cameraEnabled && modelsLoaded ? '0 4px 15px rgba(139, 92, 246, 0.3)' : 'none' }}>
                  {loadingModels ? 'Loading AI...' : 'Start Secure Test'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Interface */}
      <AnimatePresence>
        {testStarted && activeAssessment && (
          <motion.div style={styles.testModal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* No Face Warning Banner */}
            {noFaceTimer > 5 && (
              <div style={{ ...styles.warningBanner, background: '#f59e0b' }}>
                <UserX size={20} />
                ⚠️ Face not detected! Test will terminate in {10 - noFaceTimer} seconds...
              </div>
            )}

            {/* Test Header */}
            <div style={styles.testHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button onClick={closeTest} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}><ArrowLeft size={18} /></button>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeAssessment.title}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Q{currentQuestion + 1}/{sampleQuestions.length}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* AI Monitoring indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.6rem', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '0.75rem' }}>
                  <ShieldAlert size={14} /> AI Monitoring
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.75rem', background: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                  <Timer size={16} />
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>{formatTime(timeRemaining)}</span>
                </div>
              </div>
            </div>

            {/* Test Body */}
            <div style={styles.testBody}>
              {/* Question Panel */}
              <div style={styles.questionPanel}>
                <div style={styles.questionCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                    <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>Q{currentQuestion + 1}</span>
                  </div>
                  <div style={styles.questionText}>{sampleQuestions[currentQuestion].question}</div>
                  <div style={styles.optionsList}>
                    {sampleQuestions[currentQuestion].options.map((option, idx) => (
                      <button key={idx} style={styles.optionBtn(selectedAnswers[sampleQuestions[currentQuestion].id] === idx)} onClick={() => handleAnswer(sampleQuestions[currentQuestion].id, idx)}>
                        <span style={{ marginRight: '0.5rem', fontWeight: 600 }}>{String.fromCharCode(65 + idx)}.</span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.navButtons}>
                  <button style={styles.navBtn(false)} onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))} disabled={currentQuestion === 0}>Previous</button>
                  {currentQuestion < sampleQuestions.length - 1 ? (
                    <button style={styles.navBtn(true)} onClick={() => setCurrentQuestion(prev => prev + 1)}>Next</button>
                  ) : (
                    <button style={{ ...styles.navBtn(true), background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={submitTest}>Submit Test</button>
                  )}
                </div>
              </div>

              {/* Side Panel */}
              <div style={styles.sidePanel}>
                {/* Camera with detection overlay */}
                <div style={{ ...styles.cameraPreview, position: 'relative', height: '140px' }}>
                  {/* Video element - always present, visibility controlled by opacity */}
                  <video 
                    ref={testVideoRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    style={{ 
                      ...styles.cameraVideo, 
                      opacity: testCameraReady ? 1 : 0,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }} 
                  />
                  
                  {/* Connecting overlay */}
                  {!testCameraReady && (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontSize: '0.75rem', position: 'absolute', top: 0, left: 0 }}>
                      <Video size={24} style={{ marginBottom: '4px' }} />
                      Connecting Camera...
                    </div>
                  )}
                  
                  {/* Detection status overlay - only show when camera ready */}
                  {testCameraReady && (
                    <div style={{ position: 'absolute', bottom: '4px', left: '4px', right: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap', zIndex: 10 }}>
                      <span style={styles.detectionIndicator(detectionStatus.faces === 1 ? 'ok' : detectionStatus.faces === 0 ? 'warning' : 'error')}>
                        {detectionStatus.faces === 1 ? <Eye size={10} /> : <UserX size={10} />}
                        {detectionStatus.faces === 1 ? '✓' : detectionStatus.faces}
                      </span>
                      <span style={styles.detectionIndicator(detectionStatus.phone ? 'error' : 'ok')}>
                        <Smartphone size={10} /> {detectionStatus.phone ? '!' : '✓'}
                      </span>
                      <span style={styles.detectionIndicator(detectionStatus.person > 1 ? 'error' : 'ok')}>
                        <Users size={10} /> {detectionStatus.person > 1 ? '!' : '✓'}
                      </span>
                      {detectionStatus.books && (
                        <span style={styles.detectionIndicator('error')}>
                          📚 !
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* Proctor Status */}
                <div style={styles.proctorStatusBox}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <ShieldAlert size={14} color="#7c3aed" /> AI Proctor Status
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span>Face Detected</span>
                      <span style={{ fontWeight: 600, color: detectionStatus.faces === 1 ? '#10b981' : '#dc2626' }}>
                        {detectionStatus.faces === 1 ? '✓ Yes' : detectionStatus.faces === 0 ? '✗ No' : '✗ Multiple!'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span>Phone Check</span>
                      <span style={{ fontWeight: 600, color: detectionStatus.phone ? '#dc2626' : '#10b981' }}>
                        {detectionStatus.phone ? '✗ Detected!' : '✓ Clear'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span>Books/Paper</span>
                      <span style={{ fontWeight: 600, color: detectionStatus.books ? '#dc2626' : '#10b981' }}>
                        {detectionStatus.books ? '✗ Detected!' : '✓ Clear'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span>Headphones</span>
                      <span style={{ fontWeight: 600, color: detectionStatus.headphones ? '#dc2626' : '#10b981' }}>
                        {detectionStatus.headphones ? '✗ Detected!' : '✓ Clear'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span>Background</span>
                      <span style={{ fontWeight: 600, color: detectionStatus.person <= 1 ? '#10b981' : '#dc2626' }}>
                        {detectionStatus.person === 0 ? '⏳ Scanning' : detectionStatus.person === 1 ? '✓ Clear' : `✗ ${detectionStatus.person} persons!`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span>AI Status</span>
                      <span style={{ fontWeight: 600, color: testCameraReady && modelsLoaded ? '#10b981' : '#d97706' }}>
                        {testCameraReady && modelsLoaded ? '✓ Active' : '⏳ Loading...'}
                      </span>
                    </div>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Progress</h4>
                <div style={styles.statItem}>
                  <span>Answered</span>
                  <span style={{ fontWeight: 600 }}>{Object.keys(selectedAnswers).length}/{sampleQuestions.length}</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
                  {sampleQuestions.map((q, idx) => (
                    <button key={q.id} onClick={() => setCurrentQuestion(idx)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: currentQuestion === idx ? '2px solid #7c3aed' : 'none', background: selectedAnswers[q.id] !== undefined ? '#10b981' : '#e5e7eb', color: selectedAnswers[q.id] !== undefined ? 'white' : '#6b7280', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' }}>
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {noFaceTimer > 0 && (
                  <div style={styles.warningBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#dc2626', fontWeight: 600, marginBottom: '0.2rem', fontSize: '0.75rem' }}>
                      <AlertCircle size={14} /> Face Not Visible!
                    </div>
                    <p style={{ color: '#991b1b', fontSize: '0.7rem', margin: 0 }}>
                      {10 - noFaceTimer} seconds until termination
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Modal */}
      <AnimatePresence>
        {showResults && (
          <motion.div style={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowResults(null)}>
            <motion.div style={styles.resultsModal} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <div style={styles.resultsHeader}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Assessment Results</h2>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{showResults.title}</p>
              </div>

              <div style={styles.resultsScore}>
                <div style={styles.resultsScoreValue}>{showResults.score}%</div>
                <div style={styles.resultsScoreLabel}>Score</div>
              </div>

              <div style={styles.resultsBadge}>
                <Award size={20} />
                {showResults.badge} Earned!
              </div>

              <div style={styles.resultsStats}>
                <div style={styles.resultsStat}>
                  <div style={styles.resultsStatValue}>{showResults.correctAnswers}/{showResults.totalQuestions}</div>
                  <div style={styles.resultsStatLabel}>Correct Answers</div>
                </div>
                <div style={styles.resultsStat}>
                  <div style={styles.resultsStatValue}>{showResults.timeTaken}</div>
                  <div style={styles.resultsStatLabel}>Time Taken</div>
                </div>
                <div style={styles.resultsStat}>
                  <div style={styles.resultsStatValue}>Top {100 - showResults.percentile}%</div>
                  <div style={styles.resultsStatLabel}>Percentile</div>
                </div>
              </div>

              <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <CheckCircle size={18} /> Great Performance!
                </div>
                <p style={{ color: '#047857', fontSize: '0.85rem', margin: 0 }}>
                  You scored better than {showResults.percentile}% of test takers. Keep up the excellent work!
                </p>
              </div>

              <button style={styles.resultsBtn} onClick={() => setShowResults(null)}>
                Close Results
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Terminated Modal */}
      <AnimatePresence>
        {testTerminated && (
          <motion.div style={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div style={{ ...styles.resultsModal, background: '#fef2f2', border: '3px solid #dc2626' }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2.5rem' }}>
                  {testTerminated === 'tab' && <Ban size={40} />}
                  {testTerminated === 'camera' && <Camera size={40} />}
                  {testTerminated === 'faces' && <Users size={40} />}
                  {testTerminated === 'phone' && <Smartphone size={40} />}
                  {testTerminated === 'noface' && <UserX size={40} />}
                  {testTerminated === 'multiperson' && <Users size={40} />}
                  {testTerminated === 'books' && <span style={{ fontSize: '2rem' }}>📚</span>}
                  {testTerminated === 'headphones' && <span style={{ fontSize: '2rem' }}>🎧</span>}
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>TEST TERMINATED</h2>
                <p style={{ color: '#991b1b', fontSize: '1rem', fontWeight: 600 }}>
                  {testTerminated === 'tab' && '⚠️ Tab Switch / Window Change Detected'}
                  {testTerminated === 'camera' && '⚠️ Camera Obstruction Detected'}
                  {testTerminated === 'faces' && '⚠️ Multiple Faces Detected'}
                  {testTerminated === 'phone' && '📵 Mobile Phone Detected'}
                  {testTerminated === 'noface' && '🙈 Face Not Visible For Too Long'}
                  {testTerminated === 'multiperson' && '👥 Multiple Persons Detected'}
                  {testTerminated === 'books' && '📚 Books/Paper/Laptop Detected'}
                  {testTerminated === 'headphones' && '🎧 Headphones/Earbuds Detected'}
                </p>
              </div>

              <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 700 }}>0</span>
                    <span style={{ fontSize: '0.75rem' }}>Score</span>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    {testTerminated === 'tab' && 'You switched tabs or changed windows during the assessment. This is considered cheating.'}
                    {testTerminated === 'camera' && 'Your camera was covered or hidden. Proctoring requires a clear view.'}
                    {testTerminated === 'faces' && 'More than one face was detected by AI. Only the test-taker should be visible.'}
                    {testTerminated === 'phone' && 'A mobile phone was detected by our AI system. Electronic devices are strictly prohibited.'}
                    {testTerminated === 'noface' && 'Your face was not visible to the camera for more than 5 seconds.'}
                    {testTerminated === 'multiperson' && 'Multiple persons were detected in the camera frame. Only the test-taker should be present.'}
                    {testTerminated === 'books' && 'Books, papers, or electronic devices were detected by our AI system. Reference materials are strictly prohibited.'}
                    {testTerminated === 'headphones' && 'Headphones or earbuds were detected. Audio devices are prohibited during the assessment.'}
                  </p>
                  <p style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 600 }}>
                    Your assessment has been marked as failed with a score of 0.
                  </p>
                </div>
              </div>

              <div style={{ background: '#fef3c7', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #fbbf24' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e', fontWeight: 600, marginBottom: '0.5rem' }}>
                  <AlertTriangle size={16} /> AI Proctoring Violation Recorded
                </div>
                <p style={{ color: '#78350f', fontSize: '0.8rem', margin: 0 }}>
                  This incident has been logged with timestamp and detection details. You may retake the assessment after 24 hours with proper proctoring compliance.
                </p>
              </div>

              <button style={{ ...styles.resultsBtn, background: 'linear-gradient(135deg, #dc2626, #b91c1c)' }} onClick={() => { setTestTerminated(null); closeTest(); }}>
                I Understand - Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Assessments;
