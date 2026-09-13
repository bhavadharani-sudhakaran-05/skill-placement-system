import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Search, Filter, BookOpen, Clock, Users, Star, Play, ChevronDown,
  Video, FileText, Map, Code, CheckCircle, Lock, Download,
  CreditCard, Smartphone, ArrowRight, Award, Target,
  Circle, ChevronRight, Eye, ArrowLeft
} from 'lucide-react';
import useCourseStore from '../store/courseStore';

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [showProjectModal, setShowProjectModal] = useState(null);

  // Use course store for progress tracking
  const { 
    markVideoWatched: storeMarkVideoWatched, 
    enrollCourse,
    getCourseProgress,
    getEnrolledCourseIds,
    updateCourseProgress 
  } = useCourseStore();
  
  const enrolledCourses = getEnrolledCourseIds(); // Real enrolled courses from store

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
      color: '#2E073F',
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
      color: '#2E073F',
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
    },
    {
      id: 6,
      title: 'MongoDB Fundamentals',
      provider: 'MongoDB University',
      instructor: 'MongoDB Team',
      level: 'Beginner',
      rating: 4.7,
      reviews: 15000,
      duration: 35,
      enrolled: 85000,
      price: 0,
      progress: 0,
      tags: ['MongoDB', 'NoSQL', 'Database'],
      category: 'Web Development',
      image: '🍃',
      color: '#00ed64',
      description: 'Learn MongoDB from scratch. Master CRUD operations, aggregation, indexing, and data modeling for modern applications.',
      videos: [
        { id: 1, title: 'Introduction to MongoDB', duration: '20:00', completed: false, youtubeId: 'ofme2o29ngU' },
        { id: 2, title: 'CRUD Operations', duration: '35:00', completed: false, youtubeId: 'J6mDkcqU_ZE' },
        { id: 3, title: 'Aggregation Pipeline', duration: '40:00', completed: false, youtubeId: 'A3jvoE0jGdE' },
        { id: 4, title: 'Indexing & Performance', duration: '30:00', completed: false, youtubeId: 'd56mG7DezGs' },
      ],
      ppts: [
        { id: 1, title: 'MongoDB Basics.pdf', size: '2.8 MB', content: 'MongoDB Fundamentals\n\n1. What is MongoDB?\n- Document-oriented NoSQL database\n- JSON-like documents (BSON)\n- Flexible schema design\n\n2. Basic Commands\nshow dbs, use database, show collections\ndb.collection.insertOne({})\ndb.collection.find({})\ndb.collection.updateOne()\ndb.collection.deleteOne()\n\n3. Query Operators\n$eq, $ne, $gt, $lt, $gte, $lte\n$in, $nin, $and, $or\n$exists, $type, $regex\n\n4. Aggregation\n$match, $group, $sort, $project\n$lookup, $unwind, $limit' },
      ],
      roadmap: [
        { week: 1, title: 'MongoDB Basics', topics: ['Installation', 'CRUD', 'Documents'], completed: false, description: 'Learn MongoDB fundamentals and basic operations' },
        { week: 2, title: 'Advanced Queries', topics: ['Aggregation', 'Indexing', 'Schema Design'], completed: false, description: 'Master advanced querying and optimization' },
      ],
      projects: [
        { id: 1, title: 'Blog Database Design', difficulty: 'Easy', status: 'locked', description: 'Design and implement a blog database with MongoDB', techStack: ['MongoDB', 'Node.js'], demoUrl: '', githubUrl: '', screenshot: '📝', code: '' },
      ]
    },
    {
      id: 7,
      title: 'Node.js & Express Masterclass',
      provider: 'Udemy',
      instructor: 'Brad Traversy',
      level: 'Intermediate',
      rating: 4.8,
      reviews: 42000,
      duration: 50,
      enrolled: 165000,
      price: 1999,
      progress: 0,
      tags: ['Node.js', 'Express', 'Backend', 'API'],
      category: 'Web Development',
      image: '🟢',
      color: '#339933',
      description: 'Build scalable backend applications with Node.js and Express. Learn REST APIs, authentication, and deployment.',
      videos: [
        { id: 1, title: 'Node.js Introduction', duration: '25:00', completed: false, youtubeId: 'TlB_eWDSMt4' },
        { id: 2, title: 'Express Framework', duration: '40:00', completed: false, youtubeId: 'L72fhGm1tfE' },
        { id: 3, title: 'REST API Development', duration: '55:00', completed: false, youtubeId: '0oXYLzuucwE' },
        { id: 4, title: 'Authentication with JWT', duration: '45:00', completed: false, youtubeId: 'mbsmsi7l3r4' },
        { id: 5, title: 'Error Handling & Middleware', duration: '35:00', completed: false, youtubeId: 'DyqVqaf1KnA' },
      ],
      ppts: [
        { id: 1, title: 'Node.js Guide.pdf', size: '3.5 MB', content: 'Node.js & Express Guide\n\n1. Node.js Basics\n- Runtime built on V8 engine\n- Event-driven, non-blocking I/O\n- npm package manager\n\n2. Express Framework\nconst express = require("express");\nconst app = express();\napp.get("/", (req, res) => res.send("Hello"));\napp.listen(3000);\n\n3. Middleware\napp.use(express.json());\napp.use(cors());\nCustom middleware functions\n\n4. Routing\napp.get(), app.post(), app.put(), app.delete()\nRouter modules\nRoute parameters\n\n5. REST API Best Practices\nProper HTTP methods\nStatus codes\nError handling' },
      ],
      roadmap: [
        { week: 1, title: 'Node.js Fundamentals', topics: ['Modules', 'npm', 'Async/Await'], completed: false, description: 'Learn Node.js core concepts' },
        { week: 2, title: 'Express & APIs', topics: ['Routing', 'Middleware', 'REST'], completed: false, description: 'Build REST APIs with Express' },
        { week: 3, title: 'Authentication', topics: ['JWT', 'Sessions', 'OAuth'], completed: false, description: 'Implement secure authentication' },
      ],
      projects: [
        { id: 1, title: 'Task Manager API', difficulty: 'Medium', status: 'locked', description: 'Build a complete task management REST API', techStack: ['Node.js', 'Express', 'MongoDB'], demoUrl: '', githubUrl: '', screenshot: '✅', code: '' },
      ]
    },
    {
      id: 8,
      title: 'Docker & Kubernetes',
      provider: 'Linux Foundation',
      instructor: 'DevOps Pro',
      level: 'Intermediate',
      rating: 4.8,
      reviews: 22000,
      duration: 45,
      enrolled: 120000,
      price: 3999,
      progress: 0,
      tags: ['Docker', 'Kubernetes', 'Containers', 'DevOps'],
      category: 'Cloud',
      image: '🐳',
      color: '#2496ed',
      description: 'Master containerization with Docker and orchestration with Kubernetes. Deploy scalable applications in production.',
      videos: [
        { id: 1, title: 'Docker Fundamentals', duration: '35:00', completed: false, youtubeId: 'pTFZFxd4hOI' },
        { id: 2, title: 'Dockerfile & Images', duration: '40:00', completed: false, youtubeId: 'SnSH8Ht3MIc' },
        { id: 3, title: 'Docker Compose', duration: '30:00', completed: false, youtubeId: 'HG6yIjZapSA' },
        { id: 4, title: 'Kubernetes Architecture', duration: '45:00', completed: false, youtubeId: 'X48VuDVv0do' },
        { id: 5, title: 'K8s Deployments & Services', duration: '50:00', completed: false, youtubeId: 's_o8dwzRlu4' },
      ],
      ppts: [
        { id: 1, title: 'Docker Essentials.pdf', size: '4.2 MB', content: 'Docker & Kubernetes Guide\n\n1. Docker Basics\ndocker pull, docker run, docker build\ndocker ps, docker logs, docker exec\n\n2. Dockerfile\nFROM node:18\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["node", "server.js"]\n\n3. Docker Compose\nversion: "3"\nservices:\n  web:\n    build: .\n    ports:\n      - "3000:3000"\n  db:\n    image: mongo\n\n4. Kubernetes Objects\nPods, Deployments, Services\nConfigMaps, Secrets\nIngress, PersistentVolumes' },
      ],
      roadmap: [
        { week: 1, title: 'Docker Basics', topics: ['Containers', 'Images', 'Dockerfile'], completed: false, description: 'Learn Docker fundamentals' },
        { week: 2, title: 'Docker Compose', topics: ['Multi-container', 'Networking', 'Volumes'], completed: false, description: 'Orchestrate multiple containers' },
        { week: 3, title: 'Kubernetes', topics: ['Pods', 'Deployments', 'Services'], completed: false, description: 'Master Kubernetes orchestration' },
      ],
      projects: [
        { id: 1, title: 'Containerize MERN App', difficulty: 'Medium', status: 'locked', description: 'Containerize and deploy a full-stack application', techStack: ['Docker', 'Kubernetes', 'Helm'], demoUrl: '', githubUrl: '', screenshot: '🚀', code: '' },
      ]
    },
    {
      id: 9,
      title: 'TensorFlow Deep Learning',
      provider: 'Coursera',
      instructor: 'Laurence Moroney',
      level: 'Advanced',
      rating: 4.9,
      reviews: 35000,
      duration: 70,
      enrolled: 180000,
      price: 5999,
      progress: 0,
      tags: ['TensorFlow', 'Deep Learning', 'Neural Networks', 'AI'],
      category: 'AI/ML',
      image: '🧠',
      color: '#ff6f00',
      description: 'Build neural networks with TensorFlow. Learn CNNs, RNNs, transfer learning, and deploy ML models in production.',
      videos: [
        { id: 1, title: 'TensorFlow Introduction', duration: '30:00', completed: false, youtubeId: 'tPYj3fFJGjk' },
        { id: 2, title: 'Building Neural Networks', duration: '50:00', completed: false, youtubeId: 'wQ8BIBpya2k' },
        { id: 3, title: 'Convolutional Neural Networks', duration: '55:00', completed: false, youtubeId: 'YRhxdVk_sIs' },
        { id: 4, title: 'Recurrent Neural Networks', duration: '45:00', completed: false, youtubeId: 'WCUNPb-5EYI' },
        { id: 5, title: 'Transfer Learning', duration: '40:00', completed: false, youtubeId: 'yofjFQddwHE' },
      ],
      ppts: [
        { id: 1, title: 'TensorFlow Guide.pdf', size: '5.5 MB', content: 'TensorFlow Deep Learning\n\n1. TensorFlow Basics\nimport tensorflow as tf\ntensor = tf.constant([1, 2, 3])\n\n2. Sequential Model\nmodel = tf.keras.Sequential([\n  tf.keras.layers.Dense(128, activation="relu"),\n  tf.keras.layers.Dropout(0.2),\n  tf.keras.layers.Dense(10, activation="softmax")\n])\n\n3. CNNs for Images\nConv2D, MaxPooling2D\nImage augmentation\nTransfer learning with pretrained models\n\n4. RNNs for Sequences\nLSTM, GRU layers\nText classification\nTime series prediction\n\n5. Model Training\nmodel.compile(optimizer, loss, metrics)\nmodel.fit(X_train, y_train, epochs)\nmodel.evaluate(X_test, y_test)' },
      ],
      roadmap: [
        { week: 1, title: 'TensorFlow Basics', topics: ['Tensors', 'Keras', 'Basic Models'], completed: false, description: 'Learn TensorFlow fundamentals' },
        { week: 2, title: 'CNNs', topics: ['Convolutions', 'Pooling', 'Image Classification'], completed: false, description: 'Build image recognition models' },
        { week: 3, title: 'RNNs & NLP', topics: ['LSTM', 'Text Processing', 'Transformers'], completed: false, description: 'Process sequential data' },
      ],
      projects: [
        { id: 1, title: 'Image Classifier', difficulty: 'Hard', status: 'locked', description: 'Build a CNN to classify images with 95%+ accuracy', techStack: ['TensorFlow', 'Keras', 'Python'], demoUrl: '', githubUrl: '', screenshot: '🖼️', code: '' },
      ]
    },
    {
      id: 10,
      title: 'CI/CD with Jenkins & GitHub Actions',
      provider: 'LinkedIn Learning',
      instructor: 'DevOps Expert',
      level: 'Intermediate',
      rating: 4.6,
      reviews: 12000,
      duration: 30,
      enrolled: 75000,
      price: 1499,
      progress: 0,
      tags: ['CI/CD', 'Jenkins', 'GitHub Actions', 'DevOps'],
      category: 'Cloud',
      image: '⚙️',
      color: '#d33833',
      description: 'Automate your development workflow with CI/CD pipelines. Learn Jenkins, GitHub Actions, and deployment strategies.',
      videos: [
        { id: 1, title: 'CI/CD Concepts', duration: '20:00', completed: false, youtubeId: 'scEDHsr3APg' },
        { id: 2, title: 'Jenkins Setup & Pipelines', duration: '45:00', completed: false, youtubeId: '6YZvp2GwT0A' },
        { id: 3, title: 'GitHub Actions Workflows', duration: '40:00', completed: false, youtubeId: 'R8_veQiYBjI' },
        { id: 4, title: 'Deployment Strategies', duration: '35:00', completed: false, youtubeId: 'AWVTKBUnoIg' },
      ],
      ppts: [
        { id: 1, title: 'CI-CD Pipeline Guide.pdf', size: '2.5 MB', content: 'CI/CD Pipeline Guide\n\n1. CI/CD Concepts\n- Continuous Integration\n- Continuous Delivery/Deployment\n- Pipeline stages\n\n2. Jenkins Pipeline\npipeline {\n  agent any\n  stages {\n    stage("Build") {\n      steps { sh "npm install" }\n    }\n    stage("Test") {\n      steps { sh "npm test" }\n    }\n    stage("Deploy") {\n      steps { sh "npm run deploy" }\n    }\n  }\n}\n\n3. GitHub Actions\nname: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - run: npm install\n      - run: npm test' },
      ],
      roadmap: [
        { week: 1, title: 'CI/CD Fundamentals', topics: ['Concepts', 'Git Workflows', 'Testing'], completed: false, description: 'Understand CI/CD principles' },
        { week: 2, title: 'Pipeline Tools', topics: ['Jenkins', 'GitHub Actions', 'Deployment'], completed: false, description: 'Build automated pipelines' },
      ],
      projects: [
        { id: 1, title: 'Automated Deployment Pipeline', difficulty: 'Medium', status: 'locked', description: 'Create a full CI/CD pipeline for a web app', techStack: ['Jenkins', 'GitHub Actions', 'Docker'], demoUrl: '', githubUrl: '', screenshot: '🔄', code: '' },
      ]
    },
    {
      id: 11,
      title: 'NLP with Transformers',
      provider: 'Hugging Face',
      instructor: 'NLP Research Team',
      level: 'Advanced',
      rating: 4.9,
      reviews: 18000,
      duration: 60,
      enrolled: 95000,
      price: 0,
      progress: 0,
      tags: ['NLP', 'Transformers', 'BERT', 'GPT', 'AI'],
      category: 'AI/ML',
      image: '🤗',
      color: '#ffd21e',
      description: 'Master Natural Language Processing with state-of-the-art Transformer models. Learn BERT, GPT, and build AI applications.',
      videos: [
        { id: 1, title: 'NLP Fundamentals', duration: '35:00', completed: false, youtubeId: 'CMrHM8a3hqw' },
        { id: 2, title: 'Attention Mechanism', duration: '40:00', completed: false, youtubeId: 'yGTUuEx3GkA' },
        { id: 3, title: 'BERT & Fine-tuning', duration: '50:00', completed: false, youtubeId: 'xI0HHN5XKDo' },
        { id: 4, title: 'GPT & Text Generation', duration: '45:00', completed: false, youtubeId: 'kCc8FmEb1nY' },
        { id: 5, title: 'Building NLP Applications', duration: '55:00', completed: false, youtubeId: 'QEaBAZQCtwE' },
      ],
      ppts: [
        { id: 1, title: 'Transformers Guide.pdf', size: '4.8 MB', content: 'NLP with Transformers\n\n1. NLP Basics\n- Tokenization\n- Word Embeddings\n- Sequence Models\n\n2. Attention Mechanism\n- Self-attention\n- Multi-head attention\n- Positional encoding\n\n3. Transformer Architecture\nEncoder-Decoder structure\nBERT (bidirectional)\nGPT (autoregressive)\n\n4. Hugging Face Pipeline\nfrom transformers import pipeline\nclassifier = pipeline("sentiment-analysis")\nclassifier("I love this!")\n\n5. Fine-tuning\nLoad pretrained model\nPrepare dataset\nTrain with Trainer API\nEvaluate and deploy' },
      ],
      roadmap: [
        { week: 1, title: 'NLP Basics', topics: ['Tokenization', 'Embeddings', 'RNNs'], completed: false, description: 'Learn NLP fundamentals' },
        { week: 2, title: 'Transformers', topics: ['Attention', 'BERT', 'GPT'], completed: false, description: 'Master transformer architecture' },
        { week: 3, title: 'Applications', topics: ['Classification', 'Generation', 'QA'], completed: false, description: 'Build real NLP applications' },
      ],
      projects: [
        { id: 1, title: 'Sentiment Analyzer', difficulty: 'Medium', status: 'locked', description: 'Build a sentiment analysis model with BERT', techStack: ['Python', 'Transformers', 'PyTorch'], demoUrl: '', githubUrl: '', screenshot: '💬', code: '' },
      ]
    },
    {
      id: 12,
      title: 'MERN Stack Developer',
      provider: 'SkillForge',
      instructor: 'Full Stack Pro',
      level: 'Intermediate',
      rating: 4.9,
      reviews: 28000,
      duration: 120,
      enrolled: 312000,
      price: 0,
      progress: 0,
      tags: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript', 'Full Stack'],
      category: 'Web Development',
      image: '💻',
      color: '#2E073F',
      recommended: true,
      description: 'Become a complete MERN Stack Developer. Master MongoDB, Express.js, React, and Node.js to build full-stack web applications from scratch.',
      videos: [
        { id: 1, title: 'MERN Stack Introduction', duration: '25:00', completed: false, youtubeId: '7CqJlxBYj-M' },
        { id: 2, title: 'MongoDB Fundamentals', duration: '45:00', completed: false, youtubeId: 'ofme2o29ngU' },
        { id: 3, title: 'Express.js & REST APIs', duration: '50:00', completed: false, youtubeId: 'L72fhGm1tfE' },
        { id: 4, title: 'React Components & Hooks', duration: '55:00', completed: false, youtubeId: 'w7ejDZ8SWv8' },
        { id: 5, title: 'Node.js Backend Development', duration: '45:00', completed: false, youtubeId: 'TlB_eWDSMt4' },
        { id: 6, title: 'Full Stack Project Integration', duration: '60:00', completed: false, youtubeId: 'mrHNSanmqQ4' },
      ],
      ppts: [
        { id: 1, title: 'MERN Stack Guide.pdf', size: '5.2 MB', content: 'MERN Stack Complete Guide\n\n1. MongoDB\n- NoSQL Document Database\n- CRUD Operations\n- Mongoose ODM\n- Schema Design\n\n2. Express.js\n- Node.js Web Framework\n- Routing & Middleware\n- REST API Design\n- Error Handling\n\n3. React.js\n- Component-Based UI\n- State Management\n- Hooks (useState, useEffect)\n- Context API & Redux\n\n4. Node.js\n- JavaScript Runtime\n- Event-Driven Architecture\n- npm Package Manager\n- Authentication with JWT' },
        { id: 2, title: 'Full Stack Architecture.pdf', size: '3.8 MB', content: 'Full Stack Architecture Patterns\n\n1. Project Structure\n- Frontend (React)\n- Backend (Node/Express)\n- Database (MongoDB)\n\n2. API Design\n- RESTful Endpoints\n- Request/Response Handling\n- Validation & Sanitization\n\n3. Authentication\n- JWT Tokens\n- Session Management\n- OAuth Integration\n\n4. Deployment\n- Docker Containers\n- Cloud Platforms (AWS, Heroku)\n- CI/CD Pipelines' },
      ],
      roadmap: [
        { week: 1, title: 'JavaScript & Node.js', topics: ['ES6+', 'Async/Await', 'Node Basics'], completed: false, description: 'Master modern JavaScript and Node.js fundamentals' },
        { week: 2, title: 'MongoDB & Express', topics: ['Database Design', 'REST APIs', 'CRUD'], completed: false, description: 'Build backend APIs with Express and MongoDB' },
        { week: 3, title: 'React Fundamentals', topics: ['Components', 'Props', 'State', 'Hooks'], completed: false, description: 'Learn React for building interactive UIs' },
        { week: 4, title: 'Advanced React', topics: ['Context', 'Redux', 'React Router'], completed: false, description: 'Master state management and routing' },
        { week: 5, title: 'Integration', topics: ['API Calls', 'Authentication', 'File Upload'], completed: false, description: 'Connect frontend with backend' },
        { week: 6, title: 'Deployment', topics: ['Docker', 'Cloud Deploy', 'CI/CD'], completed: false, description: 'Deploy your full-stack application' },
      ],
      projects: [
        { id: 1, title: 'Task Management App', difficulty: 'Easy', status: 'locked', description: 'Build a full-stack task manager with user authentication', techStack: ['React', 'Node.js', 'MongoDB'], demoUrl: '', githubUrl: '', screenshot: '✅', code: '' },
        { id: 2, title: 'E-Commerce Platform', difficulty: 'Hard', status: 'locked', description: 'Complete e-commerce with cart, payments, and admin dashboard', techStack: ['MERN', 'Stripe', 'Redux'], demoUrl: '', githubUrl: '', screenshot: '🛒', code: '' },
        { id: 3, title: 'Social Media App', difficulty: 'Hard', status: 'locked', description: 'Build a social network with posts, likes, and real-time chat', techStack: ['MERN', 'Socket.io', 'Cloudinary'], demoUrl: '', githubUrl: '', screenshot: '📱', code: '' },
      ]
    },
    {
      id: 13,
      title: 'AI/ML Engineer',
      provider: 'SkillForge',
      instructor: 'AI Research Team',
      level: 'Advanced',
      rating: 4.9,
      reviews: 35000,
      duration: 150,
      enrolled: 245000,
      price: 0,
      progress: 0,
      tags: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'AI'],
      category: 'AI/ML',
      image: '🤖',
      color: '#2E073F',
      recommended: true,
      description: 'Become an AI/ML Engineer. Master machine learning algorithms, deep learning, neural networks, and deploy AI models in production.',
      videos: [
        { id: 1, title: 'AI/ML Career Roadmap', duration: '30:00', completed: false, youtubeId: 'i_LwzRVP7bg' },
        { id: 2, title: 'Python for Data Science', duration: '45:00', completed: false, youtubeId: 'LHBE6Q9XlzI' },
        { id: 3, title: 'Machine Learning Fundamentals', duration: '55:00', completed: false, youtubeId: 'ukzFI9rgwfU' },
        { id: 4, title: 'Deep Learning & Neural Networks', duration: '60:00', completed: false, youtubeId: 'aircAruvnKk' },
        { id: 5, title: 'Computer Vision with CNNs', duration: '50:00', completed: false, youtubeId: 'YRhxdVk_sIs' },
        { id: 6, title: 'NLP & Transformers', duration: '55:00', completed: false, youtubeId: 'CMrHM8a3hqw' },
      ],
      ppts: [
        { id: 1, title: 'ML Algorithms Guide.pdf', size: '6.5 MB', content: 'Machine Learning Algorithms\n\n1. Supervised Learning\n- Linear Regression\n- Logistic Regression\n- Decision Trees\n- Random Forest\n- SVM\n\n2. Unsupervised Learning\n- K-Means Clustering\n- Hierarchical Clustering\n- PCA\n- t-SNE\n\n3. Ensemble Methods\n- Bagging\n- Boosting (XGBoost, LightGBM)\n- Stacking\n\n4. Model Evaluation\n- Cross-Validation\n- Confusion Matrix\n- ROC-AUC\n- Precision/Recall' },
        { id: 2, title: 'Deep Learning Architecture.pdf', size: '7.2 MB', content: 'Deep Learning Architectures\n\n1. Neural Network Basics\n- Perceptrons\n- Activation Functions\n- Backpropagation\n\n2. CNNs\n- Convolution Layers\n- Pooling\n- Image Classification\n\n3. RNNs & LSTMs\n- Sequence Models\n- Time Series\n- NLP Applications\n\n4. Transformers\n- Self-Attention\n- BERT, GPT\n- Fine-tuning' },
      ],
      roadmap: [
        { week: 1, title: 'Python & Math', topics: ['NumPy', 'Pandas', 'Linear Algebra', 'Statistics'], completed: false, description: 'Build strong foundations in Python and mathematics' },
        { week: 2, title: 'ML Fundamentals', topics: ['Supervised Learning', 'Regression', 'Classification'], completed: false, description: 'Learn core machine learning algorithms' },
        { week: 3, title: 'Advanced ML', topics: ['Ensemble Methods', 'Feature Engineering', 'Model Tuning'], completed: false, description: 'Master advanced ML techniques' },
        { week: 4, title: 'Deep Learning', topics: ['Neural Networks', 'TensorFlow', 'PyTorch'], completed: false, description: 'Build and train neural networks' },
        { week: 5, title: 'Computer Vision', topics: ['CNNs', 'Object Detection', 'Image Segmentation'], completed: false, description: 'Apply deep learning to images' },
        { week: 6, title: 'NLP & Deployment', topics: ['Transformers', 'BERT', 'MLOps'], completed: false, description: 'Master NLP and deploy ML models' },
      ],
      projects: [
        { id: 1, title: 'House Price Predictor', difficulty: 'Easy', status: 'locked', description: 'Build a regression model to predict house prices', techStack: ['Python', 'Scikit-learn', 'Pandas'], demoUrl: '', githubUrl: '', screenshot: '🏠', code: '' },
        { id: 2, title: 'Image Classifier', difficulty: 'Medium', status: 'locked', description: 'Train a CNN to classify images with 95%+ accuracy', techStack: ['TensorFlow', 'Keras', 'CNN'], demoUrl: '', githubUrl: '', screenshot: '🖼️', code: '' },
        { id: 3, title: 'Chatbot with GPT', difficulty: 'Hard', status: 'locked', description: 'Build an intelligent chatbot using transformer models', techStack: ['PyTorch', 'Transformers', 'FastAPI'], demoUrl: '', githubUrl: '', screenshot: '💬', code: '' },
      ]
    },
    {
      id: 14,
      title: 'DevOps Engineer',
      provider: 'SkillForge',
      instructor: 'DevOps Expert',
      level: 'Intermediate',
      rating: 4.8,
      reviews: 22000,
      duration: 90,
      enrolled: 198000,
      price: 0,
      progress: 0,
      tags: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux'],
      category: 'Cloud',
      image: '🚀',
      color: '#06b6d4',
      recommended: true,
      description: 'Become a DevOps Engineer. Master containerization, orchestration, CI/CD pipelines, cloud platforms, and infrastructure automation.',
      videos: [
        { id: 1, title: 'DevOps Fundamentals', duration: '30:00', completed: false, youtubeId: 'Xrgk023l4lI' },
        { id: 2, title: 'Linux Administration', duration: '45:00', completed: false, youtubeId: 'wBp0Rb-ZJak' },
        { id: 3, title: 'Docker Deep Dive', duration: '50:00', completed: false, youtubeId: 'pTFZFxd4hOI' },
        { id: 4, title: 'Kubernetes Mastery', duration: '60:00', completed: false, youtubeId: 'X48VuDVv0do' },
        { id: 5, title: 'CI/CD with Jenkins & GitHub Actions', duration: '45:00', completed: false, youtubeId: 'R8_veQiYBjI' },
      ],
      ppts: [
        { id: 1, title: 'DevOps Handbook.pdf', size: '5.8 MB', content: 'DevOps Engineering Guide\n\n1. DevOps Culture\n- Continuous Integration\n- Continuous Delivery\n- Infrastructure as Code\n- Monitoring & Logging\n\n2. Linux & Shell\n- Command Line Basics\n- Shell Scripting\n- System Administration\n- Security Best Practices\n\n3. Containers\n- Docker Basics\n- Dockerfile\n- Docker Compose\n- Container Registries\n\n4. Orchestration\n- Kubernetes Architecture\n- Pods, Deployments, Services\n- Helm Charts\n- Service Mesh' },
        { id: 2, title: 'Cloud & CI-CD.pdf', size: '4.5 MB', content: 'Cloud & CI/CD Guide\n\n1. AWS Fundamentals\n- EC2, S3, RDS\n- IAM & Security\n- Lambda & Serverless\n- EKS & ECS\n\n2. CI/CD Pipelines\n- Jenkins Setup\n- GitHub Actions\n- GitLab CI\n- ArgoCD\n\n3. Infrastructure as Code\n- Terraform\n- Ansible\n- CloudFormation\n\n4. Monitoring\n- Prometheus\n- Grafana\n- ELK Stack\n- Alerting' },
      ],
      roadmap: [
        { week: 1, title: 'Linux & Git', topics: ['Command Line', 'Shell Scripts', 'Git Workflows'], completed: false, description: 'Master Linux administration and version control' },
        { week: 2, title: 'Docker', topics: ['Containers', 'Images', 'Docker Compose', 'Networking'], completed: false, description: 'Learn containerization with Docker' },
        { week: 3, title: 'Kubernetes', topics: ['Clusters', 'Deployments', 'Services', 'Helm'], completed: false, description: 'Master container orchestration' },
        { week: 4, title: 'CI/CD', topics: ['Jenkins', 'GitHub Actions', 'Automated Testing'], completed: false, description: 'Build automated pipelines' },
        { week: 5, title: 'Cloud & IaC', topics: ['AWS', 'Terraform', 'Ansible'], completed: false, description: 'Deploy infrastructure as code' },
      ],
      projects: [
        { id: 1, title: 'Dockerize Web App', difficulty: 'Easy', status: 'locked', description: 'Containerize a full-stack application with Docker Compose', techStack: ['Docker', 'Docker Compose', 'Nginx'], demoUrl: '', githubUrl: '', screenshot: '🐳', code: '' },
        { id: 2, title: 'K8s Deployment', difficulty: 'Medium', status: 'locked', description: 'Deploy microservices to Kubernetes cluster', techStack: ['Kubernetes', 'Helm', 'Ingress'], demoUrl: '', githubUrl: '', screenshot: '☸️', code: '' },
        { id: 3, title: 'Full CI/CD Pipeline', difficulty: 'Hard', status: 'locked', description: 'Build complete CI/CD pipeline with automated testing and deployment', techStack: ['Jenkins', 'GitHub Actions', 'ArgoCD'], demoUrl: '', githubUrl: '', screenshot: '🔄', code: '' },
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
    const progress = getCourseProgress(courseId);
    const watched = progress.videosWatched || [];
    return watched.includes(videoId - 1);
  };

  const isVideoWatched = (courseId, videoId) => {
    const progress = getCourseProgress(courseId);
    const watched = progress.videosWatched || [];
    return watched.includes(videoId);
  };

  const markVideoWatched = (courseId, videoId, course) => {
    const totalVideos = course?.videos?.length || 6;
    storeMarkVideoWatched(courseId, videoId, totalVideos, course?.title || '');
  };

  const handleEnroll = (course) => {
    if (course.price === 0) {
      enrollCourse(course.id, course.title);
      setSelectedCourse({ ...course, justEnrolled: true });
      setActiveTab('videos');
    } else {
      setShowPaymentModal(true);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setTimeout(() => {
      enrollCourse(selectedCourse.id, selectedCourse.title);
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
    .header { background: linear-gradient(135deg, #2E073F, #2E073F); color: white; padding: 40px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { opacity: 0.9; }
    .content { padding: 40px; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #2E073F; font-size: 20px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #ede9fe; }
    .section p, .section li { color: #374151; font-size: 15px; margin-bottom: 10px; }
    .section ul { padding-left: 25px; }
    .section li { margin-bottom: 8px; }
    .highlight { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-left: 4px solid #10b981; padding: 15px 20px; border-radius: 8px; margin: 15px 0; }
    .code { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 13px; overflow-x: auto; margin: 15px 0; }
    .footer { background: #faf5ff; padding: 20px; text-align: center; color: #6b7280; font-size: 13px; border-top: 1px solid #ede9fe; }
    .badge { display: inline-block; background: #f5f3ff; color: #2E073F; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 5px; }
    .print-btn { display: block; margin: 20px auto; padding: 15px 40px; background: linear-gradient(135deg, #2E073F, #2E073F); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; }
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
    container: { padding: '1rem', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' },
    header: { marginBottom: '1rem' },
    title: { fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' },
    subtitle: { color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.75rem' },
    stats: { display: 'flex', gap: '0.85rem', marginBottom: '0.85rem', flexWrap: 'wrap' },
    stat: { display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#4b5563', fontSize: '0.8rem' },
    statIcon: { color: '#2E073F' },
    searchRow: { display: 'flex', gap: '0.75rem', marginBottom: '0.85rem', flexWrap: 'wrap' },
    searchBox: { flex: 1, minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'white', borderRadius: '10px', border: '1.5px solid #ede9fe' },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '0.8rem', color: '#374151', background: 'transparent' },
    filterBtn: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.85rem', background: 'white', borderRadius: '10px', border: '1.5px solid #ede9fe', cursor: 'pointer', fontWeight: 500, color: '#2E073F', fontSize: '0.8rem' },
    categories: { display: 'flex', gap: '0.35rem', marginBottom: '1rem', flexWrap: 'wrap' },
    categoryChip: (active) => ({ padding: '0.35rem 0.75rem', borderRadius: '15px', border: 'none', background: active ? 'linear-gradient(135deg, #2E073F, #2E073F)' : '#f5f3ff', color: active ? 'white' : '#2E073F', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.75rem' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' },
    card: { background: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(139, 92, 246, 0.06)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #ede9fe' },
    cardHeader: (color) => ({ background: `linear-gradient(135deg, ${color}20, ${color}40)`, padding: '0.85rem', position: 'relative' }),
    cardBadge: { position: 'absolute', top: '0.65rem', right: '0.65rem', padding: '0.25rem 0.5rem', background: 'white', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600, color: '#2E073F' },
    recommendedBadge: { position: 'absolute', top: '0.65rem', left: '0.65rem', padding: '0.25rem 0.5rem', background: 'linear-gradient(135deg, #2E073F, #2E073F)', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.2rem' },
    cardIcon: { fontSize: '1.75rem', marginBottom: '0.25rem' },
    cardBody: { padding: '0.85rem' },
    cardTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.3rem' },
    cardInstructor: { display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#6b7280', fontSize: '0.75rem', marginBottom: '0.5rem' },
    cardRating: { display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.65rem' },
    starIcon: { color: '#f59e0b' },
    ratingText: { fontWeight: 600, color: '#1f2937', fontSize: '0.8rem' },
    reviewCount: { color: '#6b7280', fontSize: '0.7rem' },
    cardTags: { display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.65rem' },
    tag: (color) => ({ padding: '0.2rem 0.5rem', background: '#f5f3ff', color: '#2E073F', borderRadius: '5px', fontSize: '0.68rem', fontWeight: 500 }),
    cardMeta: { display: 'flex', gap: '0.65rem', color: '#6b7280', fontSize: '0.7rem', marginBottom: '0.65rem' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
    progressSection: { marginBottom: '0.65rem' },
    progressLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.3rem' },
    progressBar: { height: '6px', background: '#ede9fe', borderRadius: '3px', overflow: 'hidden' },
    progressFill: (percent, color) => ({ height: '100%', width: `${percent}%`, background: 'linear-gradient(135deg, #2E073F, #2E073F)', borderRadius: '3px' }),
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    price: (free) => ({ fontSize: '1rem', fontWeight: 700, color: free ? '#2E073F' : '#1f2937' }),
    continueBtn: { display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.75rem', background: 'white', border: '1.5px solid #2E073F', color: '#2E073F', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.72rem' },
    enrollBtn: { display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.45rem 0.75rem', background: 'linear-gradient(135deg, #2E073F, #2E073F)', border: 'none', color: 'white', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 3px 10px rgba(139, 92, 246, 0.25)', fontSize: '0.72rem' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' },
    // Full Page Course View
    courseFullPage: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)', zIndex: 1000, overflowY: 'auto' },
    coursePageContent: { maxWidth: '1200px', margin: '0 auto', padding: '0' },
    modal: { background: 'white', borderRadius: '24px', width: '100%', maxWidth: '950px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    modalHeader: (color) => ({ background: 'linear-gradient(135deg, #2E073F, #2E073F)', padding: '2rem', color: 'white', position: 'relative' }),
    closeBtn: { position: 'absolute', top: '1rem', right: '1rem', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalTitle: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' },
    modalMeta: { opacity: 0.9 },
    tabs: { display: 'flex', borderBottom: '2px solid #ede9fe', background: '#faf5ff', overflowX: 'auto' },
    tab: (active) => ({ padding: '1rem 1.25rem', border: 'none', background: 'transparent', borderBottom: active ? '3px solid #2E073F' : '3px solid transparent', color: active ? '#2E073F' : '#6b7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }),
    modalContent: { padding: '1.5rem', overflowY: 'auto', flex: 1 },
    videoList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    videoItem: (completed, playing) => ({ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: playing ? '#f5f3ff' : completed ? '#f0fdf4' : '#faf5ff', borderRadius: '12px', cursor: 'pointer', border: playing ? '2px solid #2E073F' : completed ? '2px solid #10b981' : '2px solid transparent', transition: 'all 0.2s' }),
    videoIcon: (completed, playing) => ({ width: '48px', height: '48px', borderRadius: '12px', background: playing ? 'linear-gradient(135deg, #2E073F, #2E073F)' : completed ? '#10b981' : 'linear-gradient(135deg, #2E073F, #2E073F)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    videoInfo: { flex: 1 },
    videoTitle: { fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' },
    videoDuration: { fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' },
    videoStatus: (completed) => ({ color: completed ? '#10b981' : '#2E073F', fontWeight: 500 }),
    videoPlayer: { background: '#000', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem', aspectRatio: '16/9' },
    videoIframe: { width: '100%', height: '100%', border: 'none' },
    pptList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
    pptItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'linear-gradient(135deg, #fef2f2, #fff)', borderRadius: '16px', cursor: 'pointer', border: '2px solid #fecaca', transition: 'all 0.2s' },
    pptIcon: { width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    pptInfo: { flex: 1 },
    pptTitle: { fontWeight: 600, color: '#1f2937', marginBottom: '0.35rem' },
    pptSize: { fontSize: '0.85rem', color: '#6b7280' },
    downloadBtn: { padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #2E073F, #2E073F)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' },
    roadmapContainer: { position: 'relative', paddingLeft: '30px' },
    roadmapLine: { position: 'absolute', left: '14px', top: '30px', bottom: '30px', width: '4px', background: 'linear-gradient(180deg, #10b981 0%, #2E073F 100%)', borderRadius: '2px' },
    roadmapItem: (completed, isLast) => ({ display: 'flex', gap: '1.5rem', marginBottom: isLast ? 0 : '1.5rem', position: 'relative' }),
    roadmapDot: (completed) => ({ width: '32px', height: '32px', borderRadius: '50%', background: completed ? '#10b981' : '#ede9fe', border: completed ? '4px solid #d1fae5' : '4px solid #f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }),
    roadmapCard: (completed) => ({ flex: 1, padding: '1.5rem', background: completed ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' : 'white', borderRadius: '16px', border: completed ? '2px solid #10b981' : '2px solid #ede9fe', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.05)' }),
    roadmapWeek: (completed) => ({ display: 'inline-block', padding: '0.35rem 0.75rem', background: completed ? '#10b981' : 'linear-gradient(135deg, #2E073F, #2E073F)', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }),
    roadmapTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    roadmapDesc: { color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: 1.5 },
    topicsList: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
    topicTag: (completed) => ({ padding: '0.4rem 0.8rem', background: completed ? '#d1fae5' : '#f5f3ff', borderRadius: '8px', fontSize: '0.8rem', color: completed ? '#065f46' : '#2E073F', fontWeight: 500 }),
    projectList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    projectItem: (status) => ({ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: status === 'completed' ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' : status === 'in-progress' ? 'linear-gradient(135deg, #fffbeb, #fef3c7)' : '#faf5ff', borderRadius: '16px', border: '2px solid', borderColor: status === 'completed' ? '#10b981' : status === 'in-progress' ? '#f59e0b' : '#ede9fe' }),
    projectIcon: (status) => ({ width: '60px', height: '60px', borderRadius: '16px', background: status === 'completed' ? 'linear-gradient(135deg, #10b981, #059669)' : status === 'in-progress' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #a78bfa, #c4b5fd)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }),
    projectInfo: { flex: 1 },
    projectTitle: { fontWeight: 700, color: '#1f2937', marginBottom: '0.35rem', fontSize: '1.05rem' },
    projectDesc: { color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' },
    projectTech: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    techTag: { padding: '0.25rem 0.6rem', background: '#f5f3ff', color: '#2E073F', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500 },
    projectDifficulty: (diff) => ({ display: 'inline-block', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: diff === 'Easy' ? '#d1fae5' : diff === 'Medium' ? '#fef3c7' : '#fee2e2', color: diff === 'Easy' ? '#065f46' : diff === 'Medium' ? '#92400e' : '#991b1b' }),
    projectBtn: (status) => ({ padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', fontWeight: 600, cursor: status === 'locked' ? 'not-allowed' : 'pointer', background: status === 'completed' ? 'linear-gradient(135deg, #2E073F, #2E073F)' : status === 'in-progress' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#ede9fe', color: status === 'locked' ? '#a78bfa' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }),
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
    paymentAmount: { fontSize: '1.5rem', fontWeight: 700, color: '#2E073F', marginBottom: '0.25rem' },
    paymentNote: { fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem' },
    upiApps: { display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' },
    upiApp: { padding: '0.4rem 0.8rem', background: '#f5f3ff', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, color: '#2E073F' },
    successIcon: { width: '60px', height: '60px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '2rem' },
    verifyBtn: { width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg, #2E073F, #2E073F)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' },
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
          <div style={styles.stat}><BookOpen size={14} style={styles.statIcon} /> <strong>3</strong> In Progress</div>
          <div style={styles.stat}><CheckCircle size={14} style={styles.statIcon} /> <strong>12</strong> Completed</div>
          <div style={styles.stat}><Award size={14} style={styles.statIcon} /> <strong>8</strong> Certificates</div>
        </div>

        <div style={styles.searchRow}>
          <div style={styles.searchBox}>
            <Search size={16} color="#9ca3af" />
            <input
              style={styles.searchInput}
              placeholder="Search courses, skills, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button style={styles.filterBtn}>
            <Filter size={14} /> Filters <ChevronDown size={12} />
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
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(0,0,0,0.1)' }}
            onClick={() => { setSelectedCourse(course); setActiveTab(isEnrolled(course.id) ? 'videos' : 'overview'); }}
          >
            <div style={styles.cardHeader(course.color)}>
              <div style={styles.cardBadge}>{course.provider}</div>
              {getCourseProgress(course.id).progress === 100 && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)' }}>
                  <Star size={12} fill="#ffffff" /> Completed
                </div>
              )}
              <div style={styles.cardIcon}>{course.image}</div>
            </div>

            <div style={styles.cardBody}>
              <h3 style={styles.cardTitle}>{course.title}</h3>
              <div style={styles.cardInstructor}>
                <Users size={12} /> {course.instructor} • {course.level}
              </div>
              
              <div style={styles.cardRating}>
                <Star size={12} fill="#f59e0b" style={styles.starIcon} />
                <span style={styles.ratingText}>{course.rating}</span>
                <span style={styles.reviewCount}>({course.reviews.toLocaleString()})</span>
              </div>

              <div style={styles.cardTags}>
                {course.tags.slice(0, 3).map(tag => (
                  <span key={tag} style={styles.tag(course.color)}>{tag}</span>
                ))}
              </div>

              <div style={styles.cardMeta}>
                <span style={styles.metaItem}><Clock size={12} /> {course.duration}h</span>
                <span style={styles.metaItem}><Users size={12} /> {(course.enrolled / 1000).toFixed(0)}K</span>
              </div>

              {isEnrolled(course.id) && (getCourseProgress(course.id).progress > 0 || course.progress > 0) && (
                <div style={styles.progressSection}>
                  <div style={styles.progressLabel}>
                    <span>Progress</span>
                    <span style={{ color: course.color, fontWeight: 600 }}>{getCourseProgress(course.id).progress || course.progress}%</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={styles.progressFill(getCourseProgress(course.id).progress || course.progress, course.color)} />
                  </div>
                </div>
              )}

              <div style={styles.cardFooter}>
                <span style={styles.price(course.price === 0)}>
                  {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString()}`}
                </span>
                {isEnrolled(course.id) ? (
                  getCourseProgress(course.id).progress === 100 ? (
                    <button style={{ ...styles.continueBtn, background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#ffffff' }} onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); setActiveTab('videos'); }}>
                      <Star size={12} fill="#ffffff" /> Finished
                    </button>
                  ) : (
                    <button style={styles.continueBtn} onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); setActiveTab('videos'); }}>
                      <Play size={12} /> Continue
                    </button>
                  )
                ) : (
                  <button style={styles.enrollBtn} onClick={(e) => { e.stopPropagation(); setSelectedCourse(course); handleEnroll(course); }}>
                    Enroll <ArrowRight size={12} />
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
              <button style={styles.videoBackBtn} onClick={() => { markVideoWatched(selectedCourse.id, playingVideo.id, selectedCourse); setPlayingVideo(null); }}>
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
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2E073F' }}>{selectedCourse.videos.length}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Video Lessons</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#faf5ff', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2E073F' }}>{selectedCourse.ppts.length}</div>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Study Materials</div>
                      </div>
                      <div style={{ padding: '1rem', background: '#faf5ff', borderRadius: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2E073F' }}>{selectedCourse.projects.length}</div>
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
                        {getCourseProgress(selectedCourse.id).progress === 100 ? (
                          <div style={{ marginBottom: '1rem', padding: '1.5rem', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '12px', border: '2px solid #f59e0b', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🏆</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#92400e', marginBottom: '0.25rem' }}>Course Completed!</div>
                            <div style={{ color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              <Star size={16} fill="#f59e0b" color="#f59e0b" /> You've earned the completion badge <Star size={16} fill="#f59e0b" color="#f59e0b" />
                            </div>
                          </div>
                        ) : (
                          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '2px solid #10b981' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 600 }}>
                              <CheckCircle size={20} /> Watch videos in sequence to unlock the next one
                            </div>
                          </div>
                        )}
                        
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
                                <div style={{ color: watched ? '#10b981' : unlocked ? '#2E073F' : '#9ca3af', fontWeight: 500 }}>
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
                      <Map size={20} color="#2E073F" /> Learning Roadmap
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
                      <Code size={20} color="#2E073F" /> Hands-on Projects
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
                  <Smartphone size={36} color="#2E073F" style={{ marginBottom: '0.75rem' }} />
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
