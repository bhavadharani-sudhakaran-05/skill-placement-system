import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Search, Filter, BookOpen, Clock, Users, Star, Play, ChevronDown,
  X, Video, FileText, Map, Code, CheckCircle, Lock, Download,
  CreditCard, Smartphone, ArrowRight, Award, Zap, Target, ExternalLink,
  Circle, ChevronRight, Github, Eye, PlayCircle, ArrowLeft
} from 'lucide-react';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([1, 2]);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(null);
  const [watchedVideos, setWatchedVideos] = useState({ 1: [1, 2, 3], 2: [1, 2] });

  const categories = ['All', 'Web Development', 'Data Science', 'Cloud', 'Programming', 'AI/ML'];

  const courses = [
    {
      id: 1,
      title: 'Data Structures & Algorithms',
      provider: 'LeetCode',
      instructor: 'Tech Lead',
      level: 'Beginner',
      rating: 4.9,
      reviews: 20100,
      duration: 50,
      enrolled: 120000,
      price: 0,
      progress: 45,
      tags: ['DSA', 'Problem Solving', 'Coding'],
      category: 'Programming',
      image: '📊',
      color: '#7c3aed',
      description: 'Master data structures and algorithms from scratch. Learn arrays, linked lists, trees, graphs, and advanced algorithms.',
      videos: [
        { id: 1, title: 'Introduction to DSA', duration: '15:30', completed: true, youtubeId: 'bum_19loj9A' },
        { id: 2, title: 'Arrays and Strings', duration: '25:45', completed: true, youtubeId: 'QJNwK2uJyGs' },
        { id: 3, title: 'Linked Lists Deep Dive', duration: '32:10', completed: true, youtubeId: 'N6dOwBde7-M' },
        { id: 4, title: 'Stacks and Queues', duration: '28:00', completed: false, youtubeId: 'wjI1WNcIntg' },
        { id: 5, title: 'Trees and Binary Search Trees', duration: '45:20', completed: false, youtubeId: 'fAAZixBzIAI' },
        { id: 6, title: 'Graph Algorithms', duration: '50:00', completed: false, youtubeId: 'tWVWeAqZ0WU' },
      ],
      ppts: [
        { id: 1, title: 'DSA Fundamentals.pdf', size: '2.5 MB', content: 'Data Structures & Algorithms Fundamentals\n\n1. Introduction to DSA\n- What are Data Structures?\n- Why learn Algorithms?\n- Time & Space Complexity\n\n2. Arrays\n- Static vs Dynamic Arrays\n- Common Operations: Insert, Delete, Search\n- Time Complexity: O(1) access, O(n) search\n\n3. Linked Lists\n- Singly Linked List\n- Doubly Linked List\n- Circular Linked List\n\n4. Stacks & Queues\n- LIFO vs FIFO\n- Implementation using Arrays/Linked Lists\n- Applications: Expression evaluation, BFS\n\n5. Trees\n- Binary Trees\n- Binary Search Trees\n- AVL Trees, Red-Black Trees\n\n6. Graphs\n- Representation: Adjacency Matrix/List\n- BFS, DFS Traversal\n- Shortest Path Algorithms' },
        { id: 2, title: 'Array Techniques.pdf', size: '1.8 MB', content: 'Array Problem Solving Techniques\n\n1. Two Pointer Technique\n- Start from both ends\n- Example: Two Sum problem\n- Time: O(n), Space: O(1)\n\n2. Sliding Window\n- Fixed size window\n- Variable size window\n- Example: Maximum sum subarray\n\n3. Prefix Sum\n- Precompute cumulative sums\n- Range sum queries in O(1)\n\n4. Binary Search on Arrays\n- Sorted array requirement\n- Time: O(log n)\n- Variations: Lower/Upper bound\n\n5. Common Patterns\n- Kadane\'s Algorithm\n- Dutch National Flag\n- Moore\'s Voting Algorithm' },
        { id: 3, title: 'Tree Structures.pdf', size: '3.2 MB', content: 'Tree Data Structures Guide\n\n1. Binary Tree Basics\n- Node structure: data, left, right\n- Height, Depth, Level\n- Full, Complete, Perfect Trees\n\n2. Tree Traversals\n- Inorder (Left-Root-Right)\n- Preorder (Root-Left-Right)\n- Postorder (Left-Right-Root)\n- Level Order (BFS)\n\n3. Binary Search Tree (BST)\n- Property: left < root < right\n- Operations: Insert, Delete, Search\n- Time: O(log n) average, O(n) worst\n\n4. Balanced Trees\n- AVL Trees: Height balanced\n- Red-Black Trees: Color property\n- B-Trees: Multi-way search trees\n\n5. Tree Problems\n- LCA (Lowest Common Ancestor)\n- Diameter of Tree\n- Path Sum Problems' },
      ],
      roadmap: [
        { week: 1, title: 'Basics & Arrays', topics: ['Time Complexity', 'Arrays', 'Strings'], completed: true, description: 'Learn Big O notation, array operations, and string manipulation' },
        { week: 2, title: 'Linked Lists', topics: ['Singly Linked', 'Doubly Linked', 'Circular'], completed: true, description: 'Master pointer manipulation and linked list operations' },
        { week: 3, title: 'Stacks & Queues', topics: ['Implementation', 'Applications', 'Problems'], completed: false, description: 'Understand LIFO/FIFO principles and solve related problems' },
        { week: 4, title: 'Trees', topics: ['Binary Trees', 'BST', 'AVL Trees'], completed: false, description: 'Learn tree traversals and balanced tree concepts' },
        { week: 5, title: 'Graphs', topics: ['BFS', 'DFS', 'Shortest Path'], completed: false, description: 'Master graph representations and traversal algorithms' },
        { week: 6, title: 'Dynamic Programming', topics: ['Memoization', 'Tabulation', 'Classic Problems'], completed: false, description: 'Solve optimization problems with DP techniques' },
      ],
      projects: [
        { id: 1, title: 'LRU Cache Implementation', difficulty: 'Medium', status: 'completed', description: 'Build a Least Recently Used cache with O(1) operations', techStack: ['JavaScript', 'HashMap', 'Doubly Linked List'], demoUrl: 'https://codepen.io', githubUrl: 'https://github.com', screenshot: '🗃️', code: 'class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const value = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, value);\n    return value;\n  }\n\n  put(key, value) {\n    if (this.cache.has(key)) {\n      this.cache.delete(key);\n    } else if (this.cache.size >= this.capacity) {\n      this.cache.delete(this.cache.keys().next().value);\n    }\n    this.cache.set(key, value);\n  }\n}' },
        { id: 2, title: 'Social Network Graph', difficulty: 'Hard', status: 'in-progress', description: 'Implement friend suggestions using graph algorithms', techStack: ['Python', 'NetworkX', 'BFS'], demoUrl: '', githubUrl: '', screenshot: '🌐', code: '' },
        { id: 3, title: 'Expression Evaluator', difficulty: 'Medium', status: 'locked', description: 'Parse and evaluate mathematical expressions using stacks', techStack: ['Java', 'Stack', 'Recursion'], demoUrl: '', githubUrl: '', screenshot: '🧮', code: '' },
      ]
    },
    {
      id: 2,
      title: 'Machine Learning A-Z',
      provider: 'Coursera',
      instructor: 'Andrew Ng',
      level: 'Intermediate',
      rating: 4.9,
      reviews: 45000,
      duration: 80,
      enrolled: 250000,
      price: 4999,
      progress: 15,
      tags: ['ML', 'Python', 'TensorFlow'],
      category: 'AI/ML',
      image: '🤖',
      color: '#8b5cf6',
      recommended: true,
      description: 'Complete machine learning course covering supervised, unsupervised learning, neural networks, and deep learning.',
      videos: [
        { id: 1, title: 'What is Machine Learning?', duration: '20:00', completed: true, youtubeId: 'ukzFI9rgwfU' },
        { id: 2, title: 'Linear Regression', duration: '35:30', completed: true, youtubeId: 'nk2CQITm_eo' },
        { id: 3, title: 'Logistic Regression', duration: '40:15', completed: false, youtubeId: 'yIYKR4sgzI8' },
        { id: 4, title: 'Neural Networks Basics', duration: '55:00', completed: false, youtubeId: 'aircAruvnKk' },
        { id: 5, title: 'Deep Learning', duration: '60:00', completed: false, youtubeId: 'VyWAvY2CF9c' },
      ],
      ppts: [
        { id: 1, title: 'ML Fundamentals.pdf', size: '4.5 MB', content: 'Machine Learning Fundamentals\n\n1. What is Machine Learning?\n- Learning from data without explicit programming\n- Types: Supervised, Unsupervised, Reinforcement\n\n2. Supervised Learning\n- Classification: Predict categories\n- Regression: Predict continuous values\n- Examples: Spam detection, House prices\n\n3. Unsupervised Learning\n- Clustering: Group similar data\n- Dimensionality Reduction: PCA, t-SNE\n- Examples: Customer segmentation\n\n4. Model Evaluation\n- Train/Test Split\n- Cross-Validation\n- Metrics: Accuracy, Precision, Recall, F1\n\n5. Overfitting vs Underfitting\n- Bias-Variance Tradeoff\n- Regularization: L1, L2\n- Early Stopping' },
        { id: 2, title: 'Neural Networks Guide.pdf', size: '6.2 MB', content: 'Neural Networks Complete Guide\n\n1. Perceptron\n- Single layer neural network\n- Activation: Step function\n- Linear decision boundary\n\n2. Multi-Layer Perceptron\n- Hidden layers\n- Activation: ReLU, Sigmoid, Tanh\n- Non-linear decision boundaries\n\n3. Backpropagation\n- Chain rule for gradients\n- Weight updates\n- Learning rate importance\n\n4. Deep Learning\n- Many hidden layers\n- Feature learning\n- Vanishing gradient problem\n\n5. CNN for Images\n- Convolutional layers\n- Pooling layers\n- Image classification\n\n6. RNN for Sequences\n- Sequential data\n- LSTM, GRU\n- NLP applications' },
      ],
      roadmap: [
        { week: 1, title: 'ML Basics', topics: ['Introduction', 'Types of ML', 'Python Setup'], completed: true, description: 'Setup environment and understand ML fundamentals' },
        { week: 2, title: 'Regression', topics: ['Linear', 'Polynomial', 'Evaluation'], completed: false, description: 'Learn regression algorithms for prediction' },
        { week: 3, title: 'Classification', topics: ['Logistic', 'KNN', 'SVM'], completed: false, description: 'Master classification algorithms' },
        { week: 4, title: 'Neural Networks', topics: ['Perceptron', 'Backpropagation', 'Activation'], completed: false, description: 'Build neural networks from scratch' },
      ],
      projects: [
        { id: 1, title: 'House Price Prediction', difficulty: 'Easy', status: 'completed', description: 'Predict house prices using linear regression', techStack: ['Python', 'Pandas', 'Scikit-learn'], demoUrl: 'https://streamlit.io', githubUrl: 'https://github.com', screenshot: '🏠', code: 'import pandas as pd\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.model_selection import train_test_split\n\n# Load data\ndf = pd.read_csv("housing.csv")\nX = df[["sqft", "bedrooms", "bathrooms"]]\ny = df["price"]\n\n# Split data\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)\n\n# Train model\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)\n\n# Predict\npredictions = model.predict(X_test)\nprint(f"R2 Score: {model.score(X_test, y_test):.2f}")' },
        { id: 2, title: 'Image Classifier', difficulty: 'Hard', status: 'locked', description: 'Build CNN to classify images', techStack: ['Python', 'TensorFlow', 'Keras'], demoUrl: '', githubUrl: '', screenshot: '🖼️', code: '' },
      ]
    },
    {
      id: 3,
      title: 'Complete React Developer',
      provider: 'Udemy',
      instructor: 'John Smith',
      level: 'Beginner',
      rating: 4.8,
      reviews: 32000,
      duration: 45,
      enrolled: 180000,
      price: 2499,
      progress: 0,
      tags: ['React', 'JavaScript', 'Frontend'],
      category: 'Web Development',
      image: '⚛️',
      color: '#06b6d4',
      description: 'Build modern web applications with React. Learn hooks, context, Redux, and build real-world projects.',
      videos: [
        { id: 1, title: 'React Introduction', duration: '18:00', completed: false, youtubeId: 'Tn6-PIqc4UM' },
        { id: 2, title: 'JSX and Components', duration: '30:00', completed: false, youtubeId: 'y6rL9Ye1wHs' },
        { id: 3, title: 'State and Props', duration: '35:00', completed: false, youtubeId: '4ORZ1GmjaMc' },
        { id: 4, title: 'React Hooks', duration: '45:00', completed: false, youtubeId: 'TNhaISOUy6Q' },
        { id: 5, title: 'Context API', duration: '25:00', completed: false, youtubeId: '5LrDIWkK_Bc' },
      ],
      ppts: [
        { id: 1, title: 'React Basics.pdf', size: '3.1 MB', content: 'React.js Fundamentals\n\n1. What is React?\n- JavaScript library for UI\n- Component-based architecture\n- Virtual DOM for performance\n\n2. JSX\n- JavaScript + XML syntax\n- Expressions in curly braces\n- Must return single root element\n\n3. Components\n- Functional Components (preferred)\n- Class Components (legacy)\n- Props for data passing\n\n4. State\n- useState hook\n- Immutable updates\n- Re-rendering on state change\n\n5. Event Handling\n- onClick, onChange, onSubmit\n- Synthetic events\n- Event handlers as functions' },
        { id: 2, title: 'Hooks Cheatsheet.pdf', size: '1.5 MB', content: 'React Hooks Cheatsheet\n\n1. useState\nconst [state, setState] = useState(initialValue);\n- Manage component state\n- Triggers re-render on update\n\n2. useEffect\nuseEffect(() => { }, [dependencies]);\n- Side effects (API calls, subscriptions)\n- Cleanup function for unmount\n\n3. useContext\nconst value = useContext(MyContext);\n- Access context without prop drilling\n\n4. useRef\nconst ref = useRef(initialValue);\n- Persist values across renders\n- Access DOM elements\n\n5. useMemo\nconst memoized = useMemo(() => compute(), [deps]);\n- Memoize expensive calculations\n\n6. useCallback\nconst fn = useCallback(() => {}, [deps]);\n- Memoize functions' },
      ],
      roadmap: [
        { week: 1, title: 'Fundamentals', topics: ['JSX', 'Components', 'Props'], completed: false, description: 'Learn React basics and component creation' },
        { week: 2, title: 'State Management', topics: ['useState', 'useEffect', 'Context'], completed: false, description: 'Master state management with hooks' },
        { week: 3, title: 'Advanced', topics: ['Redux', 'Router', 'Testing'], completed: false, description: 'Build complex applications with routing and state' },
      ],
      projects: [
        { id: 1, title: 'Todo App', difficulty: 'Easy', status: 'locked', description: 'Build a fully functional todo application', techStack: ['React', 'Hooks', 'LocalStorage'], demoUrl: '', githubUrl: '', screenshot: '✅', code: '' },
        { id: 2, title: 'E-commerce Store', difficulty: 'Hard', status: 'locked', description: 'Complete e-commerce with cart functionality', techStack: ['React', 'Redux', 'Stripe'], demoUrl: '', githubUrl: '', screenshot: '🛒', code: '' },
      ]
    },
    {
      id: 4,
      title: 'AWS Solutions Architect',
      provider: 'AWS Training',
      instructor: 'Cloud Expert',
      level: 'Advanced',
      rating: 4.7,
      reviews: 18000,
      duration: 60,
      enrolled: 95000,
      price: 7999,
      progress: 0,
      tags: ['AWS', 'Cloud', 'DevOps'],
      category: 'Cloud',
      image: '☁️',
      color: '#f59e0b',
      description: 'Prepare for AWS Solutions Architect certification. Learn EC2, S3, Lambda, VPC, and more.',
      videos: [
        { id: 1, title: 'AWS Overview', duration: '25:00', completed: false, youtubeId: 'k1RI5locZE4' },
        { id: 2, title: 'EC2 Deep Dive', duration: '50:00', completed: false, youtubeId: 'iHX-jtKIVNA' },
        { id: 3, title: 'S3 and Storage', duration: '40:00', completed: false, youtubeId: 'e6w9LwZJFIA' },
      ],
      ppts: [
        { id: 1, title: 'AWS Architecture.pdf', size: '5.5 MB', content: 'AWS Solutions Architecture\n\n1. AWS Global Infrastructure\n- Regions and Availability Zones\n- Edge Locations\n- High Availability design\n\n2. Compute Services\n- EC2: Virtual servers\n- Lambda: Serverless functions\n- ECS/EKS: Container orchestration\n\n3. Storage Services\n- S3: Object storage\n- EBS: Block storage\n- EFS: File storage\n\n4. Database Services\n- RDS: Relational databases\n- DynamoDB: NoSQL\n- ElastiCache: In-memory\n\n5. Networking\n- VPC: Virtual Private Cloud\n- Route 53: DNS service\n- CloudFront: CDN\n\n6. Security\n- IAM: Identity management\n- Security Groups\n- KMS: Key management' },
      ],
      roadmap: [
        { week: 1, title: 'Cloud Basics', topics: ['Regions', 'AZs', 'Services'], completed: false, description: 'Understand AWS global infrastructure' },
        { week: 2, title: 'Compute', topics: ['EC2', 'Lambda', 'ECS'], completed: false, description: 'Master AWS compute services' },
      ],
      projects: [
        { id: 1, title: 'Deploy Web App', difficulty: 'Medium', status: 'locked', description: 'Deploy scalable web application on AWS', techStack: ['EC2', 'RDS', 'S3'], demoUrl: '', githubUrl: '', screenshot: '🚀', code: '' },
      ]
    },
    {
      id: 5,
      title: 'Python for Data Science',
      provider: 'edX',
      instructor: 'Dr. Analytics',
      level: 'Beginner',
      rating: 4.8,
      reviews: 28000,
      duration: 55,
      enrolled: 200000,
      price: 0,
      progress: 0,
      tags: ['Python', 'Data Science', 'Analytics'],
      category: 'Data Science',
      image: '🐍',
      color: '#10b981',
      description: 'Learn Python programming for data analysis. Master pandas, numpy, matplotlib, and data visualization.',
      videos: [
        { id: 1, title: 'Python Basics', duration: '30:00', completed: false, youtubeId: 'kqtD5dpn9C8' },
        { id: 2, title: 'NumPy Arrays', duration: '35:00', completed: false, youtubeId: 'QUT1VHiLmmI' },
        { id: 3, title: 'Pandas DataFrames', duration: '45:00', completed: false, youtubeId: 'vmEHCJofslg' },
      ],
      ppts: [
        { id: 1, title: 'Python Cheatsheet.pdf', size: '2.0 MB', content: 'Python Quick Reference\n\n1. Variables & Types\nint, float, str, bool, list, dict, tuple\n\n2. Control Flow\nif/elif/else, for, while\nbreak, continue, pass\n\n3. Functions\ndef function_name(params):\n    return value\n\n4. List Comprehensions\n[x**2 for x in range(10) if x % 2 == 0]\n\n5. File Operations\nwith open("file.txt", "r") as f:\n    content = f.read()\n\n6. Exception Handling\ntry:\n    risky_operation()\nexcept Exception as e:\n    handle_error(e)\nfinally:\n    cleanup()' },
        { id: 2, title: 'Data Analysis Guide.pdf', size: '3.8 MB', content: 'Data Analysis with Python\n\n1. NumPy Basics\nimport numpy as np\narr = np.array([1, 2, 3])\narr.shape, arr.mean(), arr.std()\n\n2. Pandas DataFrames\nimport pandas as pd\ndf = pd.read_csv("data.csv")\ndf.head(), df.describe(), df.info()\n\n3. Data Cleaning\ndf.dropna()  # Remove missing\ndf.fillna(0)  # Fill missing\ndf.duplicated()  # Find duplicates\n\n4. Data Manipulation\ndf.groupby("col").mean()\ndf.merge(df2, on="key")\ndf.pivot_table()\n\n5. Visualization\nimport matplotlib.pyplot as plt\nplt.plot(x, y)\nplt.bar(x, y)\nplt.scatter(x, y)\nplt.show()' },
      ],
      roadmap: [
        { week: 1, title: 'Python Basics', topics: ['Variables', 'Loops', 'Functions'], completed: false, description: 'Learn Python programming fundamentals' },
        { week: 2, title: 'Data Libraries', topics: ['NumPy', 'Pandas', 'Matplotlib'], completed: false, description: 'Master data manipulation libraries' },
      ],
      projects: [
        { id: 1, title: 'Sales Data Analysis', difficulty: 'Easy', status: 'locked', description: 'Analyze sales data and create visualizations', techStack: ['Python', 'Pandas', 'Matplotlib'], demoUrl: '', githubUrl: '', screenshot: '📈', code: '' },
      ]
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isEnrolled = (courseId) => enrolledCourses.includes(courseId);

  const isVideoUnlocked = (courseId, videoId) => {
    if (videoId === 1) return true;
    const watched = watchedVideos[courseId] || [];
    return watched.includes(videoId - 1);
  };

  const isVideoWatched = (courseId, videoId) => {
    const watched = watchedVideos[courseId] || [];
    return watched.includes(videoId);
  };

  const markVideoWatched = (courseId, videoId) => {
    setWatchedVideos(prev => ({
      ...prev,
      [courseId]: [...(prev[courseId] || []), videoId].filter((v, i, a) => a.indexOf(v) === i)
    }));
  };

  const handleEnroll = (course) => {
    if (course.price === 0) {
      setEnrolledCourses([...enrolledCourses, course.id]);
      setSelectedCourse({ ...course, justEnrolled: true });
      setActiveTab('videos');
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      setEnrolledCourses([...enrolledCourses, selectedCourse.id]);
      setShowPaymentModal(false);
      setPaymentSuccess(false);
      setActiveTab('videos');
    }, 2000);
  };

  const generateUPILink = (course) => {
    const upiId = 'skillforge@paytm';
    const amount = course.price;
    const name = 'SkillForge';
    const note = `Payment for ${course.title}`;
    return `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  const downloadPDF = (ppt) => {
    // Create a proper HTML document that looks like a PDF
    const pdfHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${ppt.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #f8fafc; padding: 40px; line-height: 1.8; }
    .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: white; padding: 40px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    .content { padding: 40px; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #7c3aed; font-size: 20px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #ede9fe; }
    .section p, .section li { color: #374151; font-size: 15px; margin-bottom: 10px; }
    .section ul { padding-left: 25px; }
    .section li { margin-bottom: 8px; }
    .highlight { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-left: 4px solid #10b981; padding: 15px 20px; border-radius: 8px; margin: 15px 0; }
    .code { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 13px; overflow-x: auto; margin: 15px 0; }
    .footer { background: #faf5ff; padding: 20px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #ede9fe; }
    .badge { display: inline-block; background: #f5f3ff; color: #7c3aed; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 5px; }
    .print-btn { display: block; margin: 20px auto; padding: 15px 40px; background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; }
    @media print { .print-btn { display: none; } body { background: white; padding: 0; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 ${ppt.title}</h1>
      <p>SkillForge Learning Materials</p>
    </div>
    <div class="content">
      ${ppt.content.split('\n\n').map(section => {
        if (section.includes(':')) {
          const [title, ...rest] = section.split('\n');
          return `<div class="section"><h2>${title}</h2>${rest.map(line => 
            line.startsWith('-') ? `<ul><li>${line.substring(1).trim()}</li></ul>` : `<p>${line}</p>`
          ).join('')}</div>`;
        }
        return `<div class="section"><p>${section}</p></div>`;
      }).join('')}
    </div>
    <div class="footer">
      <p>© 2024 SkillForge Academy | Study Material Size: ${ppt.size}</p>
    </div>
  </div>
  <button class="print-btn" onclick="window.print()">📄 Print / Save as PDF</button>
</body>
</html>`;

    // Create blob and download as HTML
    const blob = new Blob([pdfHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = ppt.title.replace('.pdf', '.html');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Also open in new window for viewing
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: '2rem' },
    title: { fontSize: '2rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' },
    subtitle: { color: '#6b7280', fontSize: '1rem', marginBottom: '1.5rem' },
    stats: { display: 'flex', gap: '2rem', marginBottom: '1.5rem' },
    stat: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4b5563' },
    statIcon: { color: '#7c3aed' },
    searchRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    searchBox: { flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1.25rem', background: 'white', borderRadius: '12px', border: '2px solid #ede9fe' },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '1rem', color: '#374151', background: 'transparent' },
    filterBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 1.5rem', background: 'white', borderRadius: '12px', border: '2px solid #ede9fe', cursor: 'pointer', fontWeight: 500, color: '#7c3aed' },
    categories: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' },
    categoryChip: (active) => ({ padding: '0.5rem 1rem', borderRadius: '20px', border: 'none', background: active ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : '#f5f3ff', color: active ? 'white' : '#7c3aed', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' },
    card: { background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.08)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #ede9fe' },
    cardHeader: (color) => ({ background: `linear-gradient(135deg, ${color}20, ${color}40)`, padding: '1.5rem', position: 'relative' }),
    cardBadge: { position: 'absolute', top: '1rem', right: '1rem', padding: '0.35rem 0.75rem', background: 'white', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#7c3aed' },
    recommendedBadge: { position: 'absolute', top: '1rem', left: '1rem', padding: '0.35rem 0.75rem', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.25rem' },
    cardIcon: { fontSize: '3rem', marginBottom: '0.5rem' },
    cardBody: { padding: '1.5rem' },
    cardTitle: { fontSize: '1.15rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' },
    cardInstructor: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.75rem' },
    cardRating: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' },
    starIcon: { color: '#f59e0b' },
    ratingText: { fontWeight: 600, color: '#1f2937' },
    reviewCount: { color: '#6b7280', fontSize: '0.85rem' },
    cardTags: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' },
    tag: (color) => ({ padding: '0.35rem 0.75rem', background: '#f5f3ff', color: '#7c3aed', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500 }),
    cardMeta: { display: 'flex', gap: '1rem', color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '0.35rem' },
    progressSection: { marginBottom: '1rem' },
    progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' },
    progressBar: { height: '8px', background: '#ede9fe', borderRadius: '4px', overflow: 'hidden' },
    progressFill: (percent, color) => ({ height: '100%', width: `${percent}%`, background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', borderRadius: '4px' }),
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    price: (free) => ({ fontSize: '1.25rem', fontWeight: 700, color: free ? '#7c3aed' : '#1f2937' }),
    continueBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'white', border: '2px solid #7c3aed', color: '#7c3aed', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' },
    enrollBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
    // Full Page Course View
    courseFullPage: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)', zIndex: 1000, overflowY: 'auto' },
    coursePageContent: { maxWidth: '1200px', margin: '0 auto', padding: '0' },
    modal: { background: 'white', borderRadius: '24px', width: '100%', maxWidth: '950px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    modalHeader: (color) => ({ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', padding: '2rem', color: 'white', position: 'relative' }),
    closeBtn: { position: 'absolute', top: '1rem', right: '1rem', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalTitle: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' },
    modalMeta: { opacity: 0.9 },
    tabs: { display: 'flex', borderBottom: '2px solid #ede9fe', background: '#faf5ff', overflowX: 'auto' },
    tab: (active) => ({ padding: '1rem 1.25rem', border: 'none', background: 'transparent', borderBottom: active ? '3px solid #7c3aed' : '3px solid transparent', color: active ? '#7c3aed' : '#6b7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }),
    modalContent: { padding: '1.5rem', overflowY: 'auto', flex: 1 },
    videoList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    videoItem: (completed, playing) => ({ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: playing ? '#f5f3ff' : completed ? '#f0fdf4' : '#faf5ff', borderRadius: '12px', cursor: 'pointer', border: playing ? '2px solid #7c3aed' : completed ? '2px solid #10b981' : '2px solid transparent', transition: 'all 0.2s' }),
    videoIcon: (completed, playing) => ({ width: '48px', height: '48px', borderRadius: '12px', background: playing ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : completed ? '#10b981' : 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    videoInfo: { flex: 1 },
    videoTitle: { fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' },
    videoDuration: { fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' },
    videoStatus: (completed) => ({ color: completed ? '#10b981' : '#7c3aed', fontWeight: 500 }),
    videoPlayer: { background: '#000', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem', aspectRatio: '16/9' },
    videoIframe: { width: '100%', height: '100%', border: 'none' },
    pptList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
    pptItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'linear-gradient(135deg, #fef2f2, #fff)', borderRadius: '16px', cursor: 'pointer', border: '2px solid #fecaca', transition: 'all 0.2s' },
    pptIcon: { width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    pptInfo: { flex: 1 },
    pptTitle: { fontWeight: 600, color: '#1f2937', marginBottom: '0.35rem' },
    pptSize: { fontSize: '0.85rem', color: '#6b7280' },
    downloadBtn: { padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' },
    roadmapContainer: { position: 'relative', paddingLeft: '30px' },
    roadmapLine: { position: 'absolute', left: '14px', top: '30px', bottom: '30px', width: '4px', background: 'linear-gradient(180deg, #10b981 0%, #7c3aed 100%)', borderRadius: '2px' },
    roadmapItem: (completed, isLast) => ({ display: 'flex', gap: '1.5rem', marginBottom: isLast ? 0 : '1.5rem', position: 'relative' }),
    roadmapDot: (completed) => ({ width: '32px', height: '32px', borderRadius: '50%', background: completed ? '#10b981' : '#ede9fe', border: completed ? '4px solid #d1fae5' : '4px solid #f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }),
    roadmapCard: (completed) => ({ flex: 1, padding: '1.5rem', background: completed ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' : 'white', borderRadius: '16px', border: completed ? '2px solid #10b981' : '2px solid #ede9fe', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.05)' }),
    roadmapWeek: (completed) => ({ display: 'inline-block', padding: '0.35rem 0.75rem', background: completed ? '#10b981' : 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }),
    roadmapTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    roadmapDesc: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.5 },
    topicsList: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
    topicTag: (completed) => ({ padding: '0.4rem 0.8rem', background: completed ? '#d1fae5' : '#f5f3ff', borderRadius: '8px', fontSize: '0.8rem', color: completed ? '#065f46' : '#7c3aed', fontWeight: 500 }),
    projectList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    projectItem: (status) => ({ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: status === 'completed' ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' : status === 'in-progress' ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : '#faf5ff', borderRadius: '16px', border: '2px solid', borderColor: status === 'completed' ? '#10b981' : status === 'in-progress' ? '#f59e0b' : '#ede9fe' }),
    projectIcon: (status) => ({ width: '60px', height: '60px', borderRadius: '16px', background: status === 'completed' ? 'linear-gradient(135deg, #10b981, #059669)' : status === 'in-progress' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #a78bfa, #c4b5fd)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }),
    projectInfo: { flex: 1 },
    projectTitle: { fontWeight: 700, color: '#1f2937', marginBottom: '0.35rem', fontSize: '1.05rem' },
    projectDesc: { color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' },
    projectTech: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    techTag: { padding: '0.25rem 0.6rem', background: '#f5f3ff', color: '#7c3aed', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500 },
    projectDifficulty: (diff) => ({ display: 'inline-block', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: diff === 'Easy' ? '#d1fae5' : diff === 'Medium' ? '#fef3c7' : '#fee2e2', color: diff === 'Easy' ? '#065f46' : diff === 'Medium' ? '#92400e' : '#991b1b' }),
    projectBtn: (status) => ({ padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', fontWeight: 600, cursor: status === 'locked' ? 'not-allowed' : 'pointer', background: status === 'completed' ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : status === 'in-progress' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#ede9fe', color: status === 'locked' ? '#a78bfa' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }),
    projectModal: { background: 'white', borderRadius: '24px', width: '100%', maxWidth: '800px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    projectModalHeader: { background: 'linear-gradient(135deg, #10b981, #059669)', padding: '2rem', color: 'white', position: 'relative' },
    codeBlock: { background: '#1e1e1e', borderRadius: '12px', padding: '1.5rem', overflow: 'auto', maxHeight: '300px' },
    codeText: { color: '#d4d4d4', fontFamily: "'Fira Code', monospace", fontSize: '0.85rem', whiteSpace: 'pre-wrap', margin: 0 },
    // Fullscreen video player styles
    videoFullscreen: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 2000, display: 'flex', flexDirection: 'column' },
    videoHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.9)' },
    videoBackBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '2px solid white', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
    videoTitleBar: { color: 'white', fontWeight: 600, fontSize: '1.1rem' },
    videoContainer: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    fullscreenIframe: { width: '100%', height: '100%', border: 'none' },
    // Video list with unlock status
    videoItemLocked: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#faf5ff', borderRadius: '12px', cursor: 'not-allowed', border: '2px solid #ede9fe', opacity: 0.6 },
    // Compact payment modal
    paymentModal: { background: 'white', borderRadius: '20px', padding: '1.5rem', width: '100%', maxWidth: '340px', textAlign: 'center' },
    paymentTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' },
    paymentSubtitle: { color: '#6b7280', marginBottom: '1rem', fontSize: '0.9rem' },
    qrContainer: { background: '#faf5ff', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #ede9fe' },
    qrCode: { margin: '0 auto' },
    paymentAmount: { fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed', marginBottom: '0.25rem' },
    paymentNote: { fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' },
    upiApps: { display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' },
    upiApp: { padding: '0.4rem 0.8rem', background: '#f5f3ff', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, color: '#7c3aed' },
    successIcon: { width: '60px', height: '60px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem' },
    verifyBtn: { width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' },
    backBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, marginBottom: '1rem' },
    backBtnGray: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f3f4f6', border: 'none', color: '#374151', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 500, marginBottom: '1rem' }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <motion.h1 style={styles.title} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          Course Catalog
        </motion.h1>
        <p style={styles.subtitle}>Personalized learning paths to bridge your skill gaps</p>
        
        <div style={styles.stats}>
          <div style={styles.stat}><BookOpen size={20} style={styles.statIcon} /> <strong>3</strong> In Progress</div>
          <div style={styles.stat}><CheckCircle size={20} style={styles.statIcon} /> <strong>12</strong> Completed</div>
          <div style={styles.stat}><Award size={20} style={styles.statIcon} /> <strong>8</strong> Certificates</div>
        </div>

        <div style={styles.searchRow}>
          <div style={styles.searchBox}>
            <Search size={20} color="#9ca3af" />
            <input
              style={styles.searchInput}
              placeholder="Search courses, skills, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button style={styles.filterBtn}>
            <Filter size={18} /> Filters <ChevronDown size={16} />
          </button>
        </div>

        <div style={styles.categories}>
          {categories.map(cat => (
            <button
              key={cat}
              style={styles.categoryChip(selectedCategory === cat)}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div style={styles.grid}>
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            style={styles.card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 12px 30px rgba(0,0,0,0.12)' }}
            onClick={() => { setSelectedCourse(course); setActiveTab(isEnrolled(course.id) ? 'videos' : 'overview'); }}
          >
            <div style={styles.cardHeader(course.color)}>
              {course.recommended && (
                <div style={styles.recommendedBadge}><Zap size={12} /> Recommended</div>
              )}
              <div style={styles.cardBadge}>{course.provider}</div>
              <div style={styles.cardIcon}>{course.image}</div>
            </div>

            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{course.title}</h3>
              <div style={styles.cardInstructor}>
                <Users size={14} /> {course.instructor} • {course.level}
              </div>
              
              <div style={styles.cardRating}>
                <Star size={16} fill="#f59e0b" style={styles.starIcon} />
                <span style={styles.ratingText}>{course.rating}</span>
                <span style={styles.reviewCount}>({course.reviews.toLocaleString()} reviews)</span>
              </div>

              <div style={styles.cardTags}>
                {course.tags.map(tag => (
                  <span key={tag} style={styles.tag(course.color)}>{tag}</span>
                ))}
              </div>

              <div style={styles.cardMeta}>
                <span style={styles.metaItem}><Clock size={14} /> {course.duration} hours</span>
                <span style={styles.metaItem}><Users size={14} /> {(course.enrolled / 1000).toFixed(0)}K enrolled</span>
              </div>

              {isEnrolled(course.id) && course.progress > 0 && (
                <div style={styles.progressSection}>
                  <div style={styles.progressLabel}>
                    <span>Progress</span>
                    <span style={{ color: course.color, fontWeight: 600 }}>{course.progress}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={styles.progressFill(course.progress, course.color)} />
                  </div>
                </div>
              )}

              <div style={styles.cardFooter}>
                <span style={styles.price(course.price === 0)}>
                  {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
                </span>
                {isEnrolled(course.id) ? (
                  <button style={styles.continueBtn} onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); setActiveTab('videos'); }}>
                    <Play size={16} /> Continue
                  </button>
                ) : (
                  <button style={styles.enrollBtn} onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); handleEnroll(course); }}>
                    Enroll Now <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fullscreen Video Player */}
      <AnimatePresence>
        {playingVideo && selectedCourse && (
          <motion.div
            style={styles.videoFullscreen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={styles.videoHeader}>
              <button style={styles.videoBackBtn} onClick={() => { markVideoWatched(selectedCourse.id, playingVideo.id); setPlayingVideo(null); }}>
                <ArrowLeft size={18} /> Back to Course
              </button>
              <span style={styles.videoTitleBar}>{playingVideo.title}</span>
              <div />
            </div>
            <div style={styles.videoContainer}>
              <iframe
                style={styles.fullscreenIframe}
                src={`https://www.youtube.com/embed/${playingVideo.youtubeId}?autoplay=1&rel=0`}
                title={playingVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Detail Full Page View */}
      <AnimatePresence>
        {selectedCourse && !showPaymentModal && !playingVideo && (
          <motion.div
            style={styles.courseFullPage}
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Full Page Header */}
            <div style={{ background: `linear-gradient(135deg, ${selectedCourse.color}, ${selectedCourse.color}cc)`, padding: '1.5rem 2rem', color: 'white', position: 'sticky', top: 0, zIndex: 10 }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => setSelectedCourse(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                  <ArrowLeft size={18} /> Back to Courses
                </button>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{selectedCourse.image}</div>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{selectedCourse.title}</h1>
                  <p style={{ opacity: 0.9 }}>{selectedCourse.instructor} • {selectedCourse.provider} • {selectedCourse.duration} hours</p>
                </div>
                <div style={{ width: '140px' }} />
              </div>
            </div>

            {/* Tabs */}
            <div style={{ ...styles.tabs, position: 'sticky', top: '120px', zIndex: 9 }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex' }}>
                <button style={styles.tab(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>
                  <Target size={18} /> Overview
                </button>
                <button style={styles.tab(activeTab === 'videos')} onClick={() => setActiveTab('videos')}>
                  <Video size={18} /> Videos
                </button>
                <button style={styles.tab(activeTab === 'ppts')} onClick={() => setActiveTab('ppts')}>
                  <FileText size={18} /> Materials
                </button>
                <button style={styles.tab(activeTab === 'roadmap')} onClick={() => setActiveTab('roadmap')}>
                  <Map size={18} /> Roadmap
                </button>
                <button style={styles.tab(activeTab === 'projects')} onClick={() => setActiveTab('projects')}>
                  <Code size={18} /> Projects
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

              <div style={styles.modalContent}>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h3 style={{ marginBottom: '1rem', color: '#111827' }}>About this Course</h3>
                    <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '1.5rem' }}>{selectedCourse.description}</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ padding: '1rem', background: '#faf5ff', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>{selectedCourse.videos.length}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Video Lessons</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#faf5ff', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>{selectedCourse.ppts.length}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Study Materials</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#faf5ff', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7c3aed' }}>{selectedCourse.projects.length}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Projects</div>
                      </div>
                    </div>

                    {!isEnrolled(selectedCourse.id) && (
                      <button style={{ ...styles.enrollBtn, width: '100%', justifyContent: 'center', padding: '1rem' }} onClick={() => handleEnroll(selectedCourse)}>
                        {selectedCourse.price === 0 ? 'Enroll for Free' : `Enroll for ₹${selectedCourse.price.toLocaleString()}`} <ArrowRight size={18} />
                      </button>
                    )}
                  </div>
                )}

                {/* Videos Tab with Player */}
                {activeTab === 'videos' && (
                  <div>
                    {!isEnrolled(selectedCourse.id) ? (
                      <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Lock size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#111827', marginBottom: '0.5rem' }}>Enroll to Access Videos</h3>
                        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Get full access to all video lessons</p>
                        <button style={styles.enrollBtn} onClick={() => handleEnroll(selectedCourse)}>
                          {selectedCourse.price === 0 ? 'Enroll for Free' : `Pay ₹${selectedCourse.price.toLocaleString()}`}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 600 }}>
                            <CheckCircle size={20} /> Watch videos in sequence to unlock the next one
                          </div>
                        </div>
                        
                        <h4 style={{ marginBottom: '1rem', color: '#111827', fontWeight: 600 }}>Course Videos</h4>
                        <div style={styles.videoList}>
                          {selectedCourse.videos.map((video, idx) => {
                            const unlocked = isVideoUnlocked(selectedCourse.id, video.id);
                            const watched = isVideoWatched(selectedCourse.id, video.id);
                            return (
                              <motion.div
                                key={video.id}
                                style={unlocked ? styles.videoItem(watched, false) : styles.videoItemLocked}
                                whileHover={unlocked ? { scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } : {}}
                                onClick={() => unlocked && setPlayingVideo(video)}
                              >
                                <div style={styles.videoIcon(watched, false)}>
                                  {watched ? <CheckCircle size={24} /> : unlocked ? <Play size={24} /> : <Lock size={24} />}
                                </div>
                                <div style={styles.videoInfo}>
                                  <div style={styles.videoTitle}>{idx + 1}. {video.title}</div>
                                  <div style={styles.videoDuration}><Clock size={14} /> {video.duration}</div>
                                </div>
                                <div style={{ color: watched ? '#10b981' : unlocked ? '#7c3aed' : '#9ca3af', fontWeight: 500 }}>
                                  {watched ? '✓ Completed' : unlocked ? 'Play ▶' : '🔒 Locked'}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* PPTs/Materials Tab with Download */}
                {activeTab === 'ppts' && (
                  <div>
                    <h4 style={{ marginBottom: '1rem', color: '#111827', fontWeight: 600 }}>Study Materials & Resources</h4>
                    {!isEnrolled(selectedCourse.id) ? (
                      <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Lock size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#111827', marginBottom: '0.5rem' }}>Enroll to Access Materials</h3>
                        <p style={{ color: '#6b7280' }}>Get access to all study materials and PDFs</p>
                      </div>
                    ) : (
                      <div style={styles.pptList}>
                        {selectedCourse.ppts.map(ppt => (
                          <motion.div 
                            key={ppt.id} 
                            style={styles.pptItem} 
                            whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
                          >
                            <div style={styles.pptIcon}><FileText size={28} /></div>
                            <div style={styles.pptInfo}>
                              <div style={styles.pptTitle}>{ppt.title}</div>
                              <div style={styles.pptSize}>{ppt.size}</div>
                            </div>
                            <button style={styles.downloadBtn} onClick={() => downloadPDF(ppt)}>
                              <Download size={16} /> Download
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Roadmap Tab - Visual Timeline */}
                {activeTab === 'roadmap' && (
                  <div>
                    <h4 style={{ marginBottom: '1.5rem', color: '#111827', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Map size={20} color="#7c3aed" /> Learning Roadmap
                    </h4>
                    <div style={styles.roadmapContainer}>
                      <div style={styles.roadmapLine}></div>
                      {selectedCourse.roadmap.map((week, idx) => (
                        <motion.div
                          key={idx}
                          style={styles.roadmapItem(week.completed, idx === selectedCourse.roadmap.length - 1)}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.15 }}
                        >
                          <div style={styles.roadmapDot(week.completed)}>
                            {week.completed ? <CheckCircle size={16} color="#10b981" /> : <Circle size={12} color="#9ca3af" />}
                          </div>
                          <div style={styles.roadmapCard(week.completed)}>
                            <span style={styles.roadmapWeek(week.completed)}>WEEK {week.week}</span>
                            <div style={styles.roadmapTitle}>
                              {week.title}
                              {week.completed && <CheckCircle size={18} color="#10b981" />}
                            </div>
                            <p style={styles.roadmapDesc}>{week.description}</p>
                            <div style={styles.topicsList}>
                              {week.topics.map(topic => (
                                <span key={topic} style={styles.topicTag(week.completed)}>
                                  <ChevronRight size={12} style={{ marginRight: '0.25rem' }} />{topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Tab with View Functionality */}
                {activeTab === 'projects' && (
                  <div>
                    <h4 style={{ marginBottom: '1rem', color: '#111827', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Code size={20} color="#7c3aed" /> Hands-on Projects
                    </h4>
                    <div style={styles.projectList}>
                      {selectedCourse.projects.map(project => (
                        <motion.div
                          key={project.id}
                          style={styles.projectItem(project.status)}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div style={styles.projectIcon(project.status)}>
                            {project.screenshot}
                          </div>
                          <div style={styles.projectInfo}>
                            <div style={styles.projectTitle}>{project.title}</div>
                            <div style={styles.projectDesc}>{project.description}</div>
                            <div style={styles.projectTech}>
                              {project.techStack.map(tech => (
                                <span key={tech} style={styles.techTag}>{tech}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                            <span style={styles.projectDifficulty(project.difficulty)}>{project.difficulty}</span>
                            <button 
                              style={styles.projectBtn(project.status)}
                              onClick={() => project.status === 'completed' && setShowProjectModal(project)}
                            >
                              {project.status === 'completed' ? <><Eye size={16} /> View Project</> : 
                               project.status === 'in-progress' ? <><Code size={16} /> Continue</> : <><Lock size={16} /> Locked</>}
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal with QR Code - Compact */}
      <AnimatePresence>
        {showPaymentModal && selectedCourse && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowPaymentModal(false); setPaymentSuccess(false); }}
          >
            <motion.div
              style={styles.paymentModal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {!paymentSuccess ? (
                <>
                  <button style={styles.backBtnGray} onClick={() => setShowPaymentModal(false)}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <Smartphone size={36} color="#7c3aed" style={{ marginBottom: '0.75rem' }} />
                  <h2 style={styles.paymentTitle}>Scan to Pay</h2>
                  <p style={styles.paymentSubtitle}>Use any UPI app</p>
                  
                  <div style={styles.qrContainer}>
                    <QRCodeSVG
                      value={generateUPILink(selectedCourse)}
                      size={140}
                      level="H"
                      includeMargin={true}
                      style={styles.qrCode}
                    />
                  </div>

                  <div style={styles.paymentAmount}>₹{selectedCourse.price.toLocaleString()}</div>
                  <p style={styles.paymentNote}>{selectedCourse.title}</p>

                  <div style={styles.upiApps}>
                    <span style={styles.upiApp}>GPay</span>
                    <span style={styles.upiApp}>PhonePe</span>
                    <span style={styles.upiApp}>Paytm</span>
                  </div>

                  <button style={styles.verifyBtn} onClick={handlePaymentSuccess}>
                    <CreditCard size={16} style={{ marginRight: '0.5rem' }} />
                    I've Paid
                  </button>
                </>
              ) : (
                <>
                  <motion.div
                    style={styles.successIcon}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    ✓
                  </motion.div>
                  <h2 style={styles.paymentTitle}>Success!</h2>
                  <p style={{ color: '#10b981', fontWeight: 600 }}>Unlocking course...</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Courses;
